﻿using System;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RX.Nyss.Common.Utils.DataContract;
using RX.Nyss.Common.Utils.Logging;
using RX.Nyss.Data;
using RX.Nyss.Data.Concepts;
using RX.Nyss.Data.Queries;
using RX.Nyss.Web.Configuration;
using static RX.Nyss.Common.Utils.DataContract.Result;

namespace RX.Nyss.Web.Services
{
    public interface IIdentityUserRegistrationService
    {
        Task<IdentityUser> CreateIdentityUser(string email, Role role);
        Task<IdentityUser> EditIdentityUser(string oldEmail, string newEmail);
        Task<string> GenerateEmailVerification(string email);
        Task DeleteIdentityUser(string identityUserId);
        Task<Result> VerifyEmail(string email, string verificationToken);
        Task<Result> TriggerPasswordReset(string email);
        Task<Result> ResetPassword(string email, string verificationToken, string newPassword);
        Task<Result> AddPassword(string email, string newPassword);
    }

    public class IdentityUserRegistrationService : IIdentityUserRegistrationService
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly INyssContext _nyssContext;
        private readonly ILoggerAdapter _loggerAdapter;
        private readonly INyssWebConfig _config;
        private readonly IEmailPublisherService _emailPublisherService;
        private readonly IEmailTextGeneratorService _emailTextGeneratorService;

        public IdentityUserRegistrationService(UserManager<IdentityUser> userManager,
            ILoggerAdapter loggerAdapter, INyssWebConfig config, IEmailPublisherService emailPublisherService, INyssContext nyssContext, IEmailTextGeneratorService emailTextGeneratorService)
        {
            _userManager = userManager;
            _loggerAdapter = loggerAdapter;
            _config = config;
            _emailPublisherService = emailPublisherService;
            _nyssContext = nyssContext;
            _emailTextGeneratorService = emailTextGeneratorService;
        }

        public async Task<IdentityUser> CreateIdentityUser(string email, Role role)
        {
            var identityUser = await AddIdentityUser(email);
            await AssignRole(email, role.ToString());

            return identityUser;
        }

        public async Task<IdentityUser> EditIdentityUser(string oldEmail, string newEmail)
        {
            var identityUser = await _userManager.FindByEmailAsync(oldEmail);

            if (identityUser == null)
            {
                throw new ResultException(ResultKey.User.Registration.UserNotFound);
            }
            else
            {
                identityUser.UserName = newEmail;
                identityUser.NormalizedUserName = newEmail.ToUpper();
                identityUser.Email = newEmail;
                identityUser.NormalizedEmail = newEmail.ToUpper();
                identityUser.EmailConfirmed = false;
                identityUser.PasswordHash = null;

                var userEditionResult = await _userManager.UpdateAsync(identityUser);

                if (!userEditionResult.Succeeded)
                {
                    var isPasswordTooWeak = userEditionResult.Errors.Any(x => x.IsPasswordTooWeak());
                    if (isPasswordTooWeak)
                    {
                        throw new ResultException(ResultKey.User.Registration.PasswordTooWeak);
                    }

                    var errorMessages = string.Join(",", userEditionResult.Errors.Select(x => x.Description));
                    _loggerAdapter.Debug($"A user {oldEmail} could not be edited. {errorMessages}");

                    throw new ResultException(ResultKey.User.Registration.UnknownError);
                }
            }

            return identityUser;
        }

        public async Task<string> GenerateEmailVerification(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);
            return await _userManager.GenerateEmailConfirmationTokenAsync(user);
        }

        public async Task<Result> VerifyEmail(string email, string verificationToken)
        {
            var user = await _userManager.FindByEmailAsync(email);
            var nyssUser = await _nyssContext.Users.Where(u => u.IdentityUserId == user.Id).FirstOrDefaultAsync();

            if (user == null || nyssUser == null)
            {
                return Error(ResultKey.User.VerifyEmail.NotFound);
            }

            var confirmationResult = await _userManager.ConfirmEmailAsync(user, verificationToken);

            if (!confirmationResult.Succeeded)
            {
                return Error(ResultKey.User.VerifyEmail.Failed, string.Join(", ", confirmationResult.Errors.Select(x => x.Description)));
            }

            nyssUser.IsFirstLogin = false;
            await _nyssContext.SaveChangesAsync();

            return Success(true, ResultKey.User.VerifyEmail.Success, confirmationResult);
        }

        public async Task<Result> TriggerPasswordReset(string email)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                _loggerAdapter.WarnFormat("Trigger password reset failed, user with email {0} not found", email);
                return Success(ResultKey.User.ResetPassword.Success);
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            var baseUrl = new Uri(_config.BaseUrl);
            var resetUrl = new Uri(baseUrl, $"resetPasswordCallback?email={WebUtility.UrlEncode(email)}&token={WebUtility.UrlEncode(token)}").ToString();

            var nyssUser = await _nyssContext.Users.FilterAvailable().Include(u => u.ApplicationLanguage).SingleAsync(x => x.IdentityUserId == user.Id);
            var (emailSubject, emailBody) = await _emailTextGeneratorService.GenerateResetPasswordEmail(resetUrl, nyssUser.Name, nyssUser.ApplicationLanguage.LanguageCode);

            await _emailPublisherService.SendEmail((email, nyssUser.Name), emailSubject, emailBody);

            return Success(ResultKey.User.ResetPassword.Success);
        }

        public async Task<Result> AddPassword(string email, string newPassword)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return Error(ResultKey.User.ResetPassword.UserNotFound);
            }

            var passwordAddResult = await _userManager.AddPasswordAsync(user, newPassword);

            var isPasswordTooWeak = passwordAddResult.Errors.Any(x => x.IsPasswordTooWeak());
            if (isPasswordTooWeak)
            {
                return Error(ResultKey.User.Registration.PasswordTooWeak, string.Join(", ", passwordAddResult.Errors.Select(x => x.Description)));
            }

            if (!passwordAddResult.Succeeded)
            {
                return Error(ResultKey.User.VerifyEmail.AddPassword.Failed);
            }

            return Success(true, ResultKey.User.VerifyEmail.AddPassword.Success, passwordAddResult);
        }

        public async Task<Result> ResetPassword(string email, string verificationToken, string newPassword)
        {
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null)
            {
                return Error(ResultKey.User.ResetPassword.UserNotFound);
            }

            var passwordChangeResult = await _userManager.ResetPasswordAsync(user, verificationToken, newPassword);

            var isPasswordTooWeak = passwordChangeResult.Errors.Any(x => x.IsPasswordTooWeak());
            if (isPasswordTooWeak)
            {
                return Error(ResultKey.User.Registration.PasswordTooWeak, string.Join(", ", passwordChangeResult.Errors.Select(x => x.Description)));
            }

            if (!passwordChangeResult.Succeeded)
            {
                return Error(ResultKey.User.ResetPassword.Failed, passwordChangeResult);
            }

            if (!user.EmailConfirmed)
            {
                var nyssUser = await _nyssContext.Users.FilterAvailable().SingleAsync(x => x.IdentityUserId == user.Id);
                nyssUser.IsFirstLogin = false;
                user.EmailConfirmed = true;

                await _userManager.UpdateAsync(user);
                await _nyssContext.SaveChangesAsync();
            }

            return Success(true, ResultKey.User.ResetPassword.Success, passwordChangeResult);
        }

        public async Task DeleteIdentityUser(string identityUserId)
        {
            var user = await _userManager.FindByIdAsync(identityUserId);

            if (user == null)
            {
                throw new ResultException(ResultKey.User.Registration.UserNotFound);
            }

            var userDeletionResult = await _userManager.DeleteAsync(user);

            if (!userDeletionResult.Succeeded)
            {
                var errorMessages = string.Join(",", userDeletionResult.Errors.Select(x => x.Description));
                _loggerAdapter.Debug($"A user with id {identityUserId} could not be deleted. {errorMessages}");

                throw new ResultException(ResultKey.User.Registration.UnknownError);
            }
        }

        private async Task<IdentityUser> AddIdentityUser(string email, bool emailConfirmed = false)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user != null)
            {
                throw new ResultException(ResultKey.User.Registration.UserAlreadyExists);
            }

            user = new IdentityUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = emailConfirmed
            };

            var userCreationResult = await _userManager.CreateAsync(user);

            if (!userCreationResult.Succeeded)
            {
                var isPasswordTooWeak = userCreationResult.Errors.Any(x => x.IsPasswordTooWeak());
                if (isPasswordTooWeak)
                {
                    throw new ResultException(ResultKey.User.Registration.PasswordTooWeak);
                }

                var errorMessages = string.Join(",", userCreationResult.Errors.Select(x => x.Description));
                _loggerAdapter.Debug($"A user {email} could not be created. {errorMessages}");

                throw new ResultException(ResultKey.User.Registration.UnknownError);
            }

            return user;
        }

        private async Task AssignRole(string email, string role)
        {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null)
            {
                throw new ResultException(ResultKey.User.Registration.UserNotFound);
            }

            var assignmentToRoleResult = await _userManager.AddToRoleAsync(user, role);

            if (!assignmentToRoleResult.Succeeded)
            {
                if (assignmentToRoleResult.Errors.Any(x => x.Code == IdentityErrorCode.UserAlreadyInRole.ToString()))
                {
                    throw new ResultException(ResultKey.User.Registration.UserAlreadyInRole);
                }

                var errorMessages = string.Join(",", assignmentToRoleResult.Errors.Select(x => x.Description));
                _loggerAdapter.Debug($"A role {role} could not be assigned. {errorMessages}");

                throw new ResultException(ResultKey.User.Registration.UnknownError);
            }
        }
    }
}
