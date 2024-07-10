﻿using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RX.Nyss.Data;
using RX.Nyss.Data.Concepts;
using RX.Nyss.Web.Services.Authorization;

namespace RX.Nyss.Web.Features.Reports.Access
{
    public interface IReportAccessService
    {
        Task<bool> HasCurrentUserAccessToReport(int reportId);
    }

    public class ReportAccessService : IReportAccessService
    {
        private readonly INyssContext _nyssContext;
        private readonly IAuthorizationService _authorizationService;

        public ReportAccessService(INyssContext nyssContext, IAuthorizationService authorizationService)
        {
            _nyssContext = nyssContext;
            _authorizationService = authorizationService;
        }

        public async Task<bool> HasCurrentUserAccessToReport(int reportId)
        {
            var currentUser = await _authorizationService.GetCurrentUser();
            if (currentUser.Role == Role.Administrator)
            {
                return true;
            }

            var reportData = await _nyssContext.RawReports.Where(r => r.Id == reportId)
                .Select(r => new
                {
                    ProjectId = r.Report.ProjectHealthRisk.Project.Id,
                    Supervisor = r.DataCollector.Supervisor,
                    HeadSupervisor = r.DataCollector.Supervisor.HeadSupervisor,
                    NationalSociety = r.NationalSociety,
                    IsUnknownSender = r.DataCollector == null
                })
                .FirstOrDefaultAsync();

            if (reportData.IsUnknownSender)
            {
                var userAndReportInSameNationalSociety = await _nyssContext.UserNationalSocieties
                    .AnyAsync(uns => uns.User == currentUser && uns.NationalSociety == reportData.NationalSociety);

                return userAndReportInSameNationalSociety;
            }

            var reportOrganizationId = await _nyssContext.UserNationalSocieties
                .Where(uns => uns.UserId == reportData.Supervisor.Id)
                .Select(uns => uns.OrganizationId)
                .SingleOrDefaultAsync();

            var currentUserOrganizationId = await _nyssContext.RawReports
                .Where(p => p.Id == reportId)
                .SelectMany(p => p.Report.ProjectHealthRisk.Project.NationalSociety.NationalSocietyUsers)
                .Where(uns => uns.User == currentUser)
                .Select(uns => uns.OrganizationId)
                .SingleOrDefaultAsync();

            if (reportOrganizationId != currentUserOrganizationId)
            {
                return false;
            }

            return _nyssContext.Reports.Any(r => r.ProjectHealthRisk.Project.NationalSociety.NationalSocietyUsers.Any(
                nsu => nsu.UserId == r.DataCollector.Supervisor.Id && nsu.OrganizationId == currentUserOrganizationId));
        }
    }
}
