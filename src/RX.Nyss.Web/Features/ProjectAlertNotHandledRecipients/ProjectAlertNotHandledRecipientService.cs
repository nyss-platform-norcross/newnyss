using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RX.Nyss.Common.Utils.DataContract;
using RX.Nyss.Common.Utils.Logging;
using RX.Nyss.Data;
using RX.Nyss.Data.Concepts;
using RX.Nyss.Data.Models;
using RX.Nyss.Web.Features.ProjectAlertNotHandledRecipients.Dto;
using RX.Nyss.Web.Services.Authorization;
using static RX.Nyss.Common.Utils.DataContract.Result;

namespace RX.Nyss.Web.Features.ProjectAlertNotHandledRecipients
{
    public interface IProjectAlertNotHandledRecipientService
    {
        Task<Result> Create(int projectId, ProjectAlertNotHandledRecipientRequestDto dto);
        Task<Result> Edit(int projectId, ProjectAlertNotHandledRecipientsRequestDto dtoList);
        Task<Result<List<ProjectAlertNotHandledRecipientsResponseDto>>> List(int projectId);
        Task<Result<List<ProjectAlertNotHandledRecipientResponseDto>>> GetFormData(int projectId);
    }

    public class ProjectAlertNotHandledRecipientService : IProjectAlertNotHandledRecipientService
    {
        private readonly INyssContext _nyssContext;
        private readonly IAuthorizationService _authorizationService;
        private readonly ILoggerAdapter _loggerAdapter;

        public ProjectAlertNotHandledRecipientService(INyssContext nyssContext, IAuthorizationService authorizationService, ILoggerAdapter loggerAdapter)
        {
            _nyssContext = nyssContext;
            _authorizationService = authorizationService;
            _loggerAdapter = loggerAdapter;
        }

        public async Task<Result> Create(int projectId, ProjectAlertNotHandledRecipientRequestDto dto)
        {
            var exists = await _nyssContext.AlertNotHandledNotificationRecipients.AnyAsync(a => a.ProjectId == projectId && a.UserId == dto.UserId);
            if (exists)
            {
                return Error(ResultKey.AlertNotHandledNotificationRecipient.AlreadyExists);
            }

            var alertNotHandledNotificationRecipient = new AlertNotHandledNotificationRecipient
            {
                ProjectId = projectId,
                UserId = dto.UserId,
                OrganizationId = dto.OrganizationId
            };

            var projectOrganizationExists = await _nyssContext.ProjectOrganizations.AnyAsync(po => po.ProjectId == projectId && po.OrganizationId == dto.OrganizationId);
            if (!projectOrganizationExists)
            {
                var projectOrganizationToAdd = new ProjectOrganization
                {
                    OrganizationId = dto.OrganizationId,
                    ProjectId = projectId
                };
                await _nyssContext.ProjectOrganizations.AddAsync(projectOrganizationToAdd);
            }

            await _nyssContext.AlertNotHandledNotificationRecipients.AddAsync(alertNotHandledNotificationRecipient);
            await _nyssContext.SaveChangesAsync();

            return SuccessMessage(ResultKey.AlertNotHandledNotificationRecipient.CreateSuccess);
        }

        public async Task<Result> Edit(int projectId, ProjectAlertNotHandledRecipientsRequestDto dtoList)
        {

            // Remove all replaced recipients
            var allAlertNotHandledRecipients = await _nyssContext.AlertNotHandledNotificationRecipients
                .Where(a => a.ProjectId == projectId).ToListAsync();

            var removedRecipients = allAlertNotHandledRecipients.Where(recipient => dtoList.Recipients.All(dto => dto.UserId != recipient.UserId)).ToList();
            removedRecipients.ForEach(removedRecipient => _nyssContext.AlertNotHandledNotificationRecipients.Remove(removedRecipient));
            await _nyssContext.SaveChangesAsync();

            var updatedRecipients= await _nyssContext.AlertNotHandledNotificationRecipients.Where(a => a.ProjectId == projectId).ToListAsync();
            var newRecipients = dtoList.Recipients.ToList().Where(dto => updatedRecipients.All(recipient => recipient.UserId != dto.UserId)).ToList();

            // Add all new recipients
            newRecipients.ForEach(async dto =>
            {
                var alertNotHandledNotificationRecipient = new AlertNotHandledNotificationRecipient
                {
                    ProjectId = projectId,
                    UserId = dto.UserId,
                    OrganizationId = dto.OrganizationId
                };
                await _nyssContext.AlertNotHandledNotificationRecipients.AddAsync(alertNotHandledNotificationRecipient);
            });

            // Add all new project organizations
            var newProjectOrganizationIds = dtoList.Recipients.Select(recipient => recipient.OrganizationId)
                .Where(organizationId => updatedRecipients.All(recipient => recipient.OrganizationId != organizationId)).Distinct().ToList();
            newProjectOrganizationIds.ForEach(async projectOrganizationId =>
            {
                var projectOrganizationToAdd = new ProjectOrganization
                {
                    OrganizationId = projectOrganizationId,
                    ProjectId = projectId
                };
                await _nyssContext.ProjectOrganizations.AddAsync(projectOrganizationToAdd);
            });

            await _nyssContext.SaveChangesAsync();

            return SuccessMessage(ResultKey.AlertNotHandledNotificationRecipient.EditSuccess);
        }

        public async Task<Result<List<ProjectAlertNotHandledRecipientsResponseDto>>> List(int projectId)
        {
            var currentUser = await _authorizationService.GetCurrentUser();
            var currentUserOrganizationId = await _nyssContext.UserNationalSocieties
                .Where(uns => uns.User == currentUser)
                .Select(uns => uns.OrganizationId)
                .FirstOrDefaultAsync();

            var alertNotHandledRecipientsForOrganization = await _nyssContext.ProjectOrganizations
                .Where(po => po.ProjectId == projectId && (currentUser.Role == Role.Administrator || po.OrganizationId == currentUserOrganizationId))
                .Select(po => new
                {
                    Organization = po.Organization,
                    AlertNotHandledRecipients = po.Project.AlertNotHandledNotificationRecipients
                        .Where(ar => _nyssContext.UserNationalSocieties
                            .Any(uns => uns.UserId == ar.UserId && uns.OrganizationId == po.OrganizationId))
                        .Select(ar => ar.User)
                }).ToListAsync();

            var alertNotHandledRecipients = alertNotHandledRecipientsForOrganization.Select(org => new ProjectAlertNotHandledRecipientsResponseDto
            {
                OrganizationId = org.Organization.Id,
                OrganizationName = org.Organization.Name,
                Users = org.AlertNotHandledRecipients.Select(rec => new RecipientDto {
                    Name = rec.Name,
                    UserId = rec.Id
                }).ToList()
            }).ToList();

            return Success(alertNotHandledRecipients);
        }

        public async Task<Result<List<ProjectAlertNotHandledRecipientResponseDto>>> GetFormData(int projectId)
        {
            var currentUser = await _authorizationService.GetCurrentUser();
            var currentUserOrganizationId = await _nyssContext.UserNationalSocieties
                .Where(uns => uns.User == currentUser)
                .Select(uns => uns.OrganizationId)
                .FirstOrDefaultAsync();

            var recipients = await _nyssContext.Projects
                .Where(p => p.Id == projectId)
                .SelectMany(p => p.NationalSociety.NationalSocietyUsers
                    .Where(nsu => (nsu.User.Role == Role.Manager || nsu.User.Role == Role.TechnicalAdvisor || nsu.User.Role == Role.HeadSupervisor || nsu.User.Role == Role.Supervisor)
                        && (currentUser.Role == Role.Administrator || currentUserOrganizationId == nsu.OrganizationId)))
                .Select(nsu => new ProjectAlertNotHandledRecipientResponseDto
                {
                    OrganizationId = nsu.OrganizationId.Value,
                    OrganizationName = nsu.Organization.Name,
                    Name = nsu.User.Name,
                    UserId = nsu.UserId
                })
                .ToListAsync();

            return Success(recipients);
        }
    }
}
