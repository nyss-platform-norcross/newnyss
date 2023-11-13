﻿using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using RX.Nyss.Common.Utils.DataContract;
using RX.Nyss.Common.Utils.Logging;
using RX.Nyss.Data;
using RX.Nyss.Data.Models;
using RX.Nyss.Web.Features.Users;
using RX.Nyss.Web.Services;

namespace RX.Nyss.Web.Features.DataConsumers.Commands
{
    public class EditDataConsumerCommand : IRequest<Result>
    {
        public EditDataConsumerCommand(int id, RequestBody body)
        {
            Id = id;
            Body = body;
        }

        public int Id { get; }

        public RequestBody Body { get; }

        public class RequestBody
        {
            public string Name { get; set; }

            public string Email { get; set; }

            public string PhoneNumber { get; set; }

            public string AdditionalPhoneNumber { get; set; }

            public string Organization { get; set; }
        }

        public class Handler : IRequestHandler<EditDataConsumerCommand, Result>
        {
            private readonly INyssContext _dataContext;

            private readonly INationalSocietyUserService _nationalSocietyUserService;

            private readonly ILoggerAdapter _loggerAdapter;

            private readonly IIdentityUserRegistrationService _identityUserRegistrationService;

            private readonly IVerificationEmailService _verificationEmailService;

            private readonly IUserService _userService;

            public Handler(
                IVerificationEmailService verificationEmailService,
                IIdentityUserRegistrationService identityUserRegistrationService,
                INyssContext dataContext,
                INationalSocietyUserService nationalSocietyUserService,
                ILoggerAdapter loggerAdapter,
                IUserService userService)
            {
                _verificationEmailService = verificationEmailService;
                _identityUserRegistrationService = identityUserRegistrationService;
                _dataContext = dataContext;
                _nationalSocietyUserService = nationalSocietyUserService;
                _loggerAdapter = loggerAdapter;
                _userService = userService;
            }

            public async Task<Result> Handle(EditDataConsumerCommand request, CancellationToken cancellationToken)
            {
                try
                {
                    var user = await _nationalSocietyUserService.GetNationalSocietyUser<DataConsumerUser>(request.Id);

                    if (user == null)
                    {
                        throw new ResultException(ResultKey.User.Registration.UserNotFound);
                    }

                    var oldEmail = user.EmailAddress;

                    await _userService.UpdateUserEmail(user, request.Body.Email);

                    user.Name = request.Body.Name;
                    user.PhoneNumber = request.Body.PhoneNumber;
                    user.Organization = request.Body.Organization;
                    user.AdditionalPhoneNumber = request.Body.AdditionalPhoneNumber;

                    if (oldEmail != request.Body.Email)
                    {
                        var identityUser = await _identityUserRegistrationService.EditIdentityUser(oldEmail, request.Body.Email);
                        string securityStamp;
                        securityStamp = await _identityUserRegistrationService.GenerateEmailVerification(identityUser.Email);
                        await _verificationEmailService.SendVerificationForDataConsumersEmail(user, user.Organization, securityStamp);
                    }

                    await _dataContext.SaveChangesAsync(cancellationToken);

                    return Result.Success();
                }
                catch (ResultException e)
                {
                    _loggerAdapter.Debug(e);
                    return e.Result;
                }
            }
        }

        public class Validator : AbstractValidator<RequestBody>
        {
            public Validator()
            {
                RuleFor(m => m.Name).NotEmpty().MaximumLength(100);
                RuleFor(m => m.Email).NotEmpty().MaximumLength(100);
                RuleFor(m => m.PhoneNumber).NotEmpty().MaximumLength(20).PhoneNumber();
                RuleFor(m => m.AdditionalPhoneNumber).MaximumLength(20).PhoneNumber().Unless(r => string.IsNullOrEmpty(r.AdditionalPhoneNumber));
                RuleFor(m => m.Organization).NotEmpty().MaximumLength(100);
            }
        }
    }
}
