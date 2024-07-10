using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RX.Nyss.Common.Utils.DataContract;
using RX.Nyss.Data;
using RX.Nyss.Data.Concepts;
using RX.Nyss.Data.Models;
using RX.Nyss.Web.Features.Common.Dto;
using RX.Nyss.Web.Features.NationalSocieties.Access;
using RX.Nyss.Web.Features.NationalSocieties.Dto;
using RX.Nyss.Web.Services.Authorization;
using static RX.Nyss.Common.Utils.DataContract.Result;

namespace RX.Nyss.Web.Features.NationalSocieties
{
    public interface INationalSocietyService
    {
        Task<Result<List<NationalSocietyListResponseDto>>> List();

        Task<IEnumerable<HealthRiskDto>> GetHealthRiskNames(int nationalSocietyId, bool excludeActivity);

        Task<Result> Reopen(int nationalSocietyId);
    }

    public class NationalSocietyService : INationalSocietyService
    {
        private readonly INyssContext _nyssContext;

        private readonly INationalSocietyAccessService _nationalSocietyAccessService;

        private readonly IAuthorizationService _authorizationService;

        public NationalSocietyService(
            INyssContext context,
            INationalSocietyAccessService nationalSocietyAccessService,
            IAuthorizationService authorizationService)
        {
            _nyssContext = context;
            _nationalSocietyAccessService = nationalSocietyAccessService;
            _authorizationService = authorizationService;
        }

        public async Task<Result<List<NationalSocietyListResponseDto>>> List()
        {
            var list = await GetNationalSocietiesQuery()
                .Include(x => x.DefaultOrganization.HeadManager)
                .Include(x => x.DefaultOrganization.PendingHeadManager)
                .Select(n => new NationalSocietyListResponseDto
                {
                    Id = n.Id,
                    ContentLanguage = n.ContentLanguage.DisplayName,
                    Name = n.Name,
                    Country = n.Country.Name,
                    StartDate = n.StartDate,
                    HeadManagers = string.Join(", ", n.Organizations
                        .Where(o => o.HeadManager != null)
                        .Select(o => o.HeadManager.Name)
                        .ToList()),
                    TechnicalAdvisor = string.Join(", ", n.NationalSocietyUsers
                        .Where(u => u.User.Role == Role.TechnicalAdvisor)
                        .Select(u => u.User.Name)
                        .ToList()),
                    Coordinators = string.Join(", ", n.NationalSocietyUsers
                        .Where(nsu => nsu.User.Role == Role.Coordinator)
                        .Select(nsu => nsu.User.Name)
                        .ToList()),
                    IsArchived = n.IsArchived
                })
                .OrderBy(n => n.Name)
                .ToListAsync();

            return Success(list);
        }

        public async Task<IEnumerable<HealthRiskDto>> GetHealthRiskNames(int nationalSocietyId, bool excludeActivity) =>
            await _nyssContext.ProjectHealthRisks
                .Where(ph => ph.Project.NationalSocietyId == nationalSocietyId)
                .Where(ph => !excludeActivity || ph.HealthRisk.HealthRiskType != HealthRiskType.Activity)
                .Select(ph => new HealthRiskDto
                {
                    Id = ph.HealthRiskId,
                    Name = ph.HealthRisk.LanguageContents
                        .Where(lc => lc.ContentLanguage.Id == ph.Project.NationalSociety.ContentLanguage.Id)
                        .Select(lc => lc.Name)
                        .FirstOrDefault()
                })
                .Distinct()
                .OrderBy(x => x.Name)
                .ToListAsync();

        public async Task<Result> Reopen(int nationalSocietyId)
        {
            var nationalSociety = await _nyssContext.NationalSocieties.FindAsync(nationalSocietyId);
            if (nationalSociety == null)
            {
                return Error(ResultKey.NationalSociety.NotFound);
            }

            nationalSociety.IsArchived = false;
            await _nyssContext.SaveChangesAsync();
            return SuccessMessage(ResultKey.NationalSociety.Archive.ReopenSuccess);
        }

        private IQueryable<NationalSociety> GetNationalSocietiesQuery()
        {
            if (_nationalSocietyAccessService.HasCurrentUserAccessToAllNationalSocieties())
            {
                return _nyssContext.NationalSocieties;
            }

            var userName = _authorizationService.GetCurrentUserName();

            return _nyssContext.NationalSocieties
                .Where(ns => ns.NationalSocietyUsers.Any(u => u.User.EmailAddress == userName));
        }
    }
}
