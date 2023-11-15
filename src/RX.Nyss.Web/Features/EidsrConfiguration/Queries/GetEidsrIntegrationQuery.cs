﻿using System.Collections.Generic;
using RX.Nyss.Web.Features.EidsrConfiguration.Dto;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RX.Nyss.Common.Services;
using RX.Nyss.Common.Utils.DataContract;
using RX.Nyss.Data;
using RX.Nyss.Web.Configuration;

namespace RX.Nyss.Web.Features.EidsrConfiguration.Queries;

public class GetEidsrIntegrationQuery : IRequest<Result<EidsrIntegrationResponseDto>>
{
    public GetEidsrIntegrationQuery(int id)
    {
        Id = id;
    }

    public int Id { get; }

    public class Handler : IRequestHandler<GetEidsrIntegrationQuery, Result<EidsrIntegrationResponseDto>>
    {
        private readonly INyssContext _nyssContext;
        private readonly ICryptographyService _cryptographyService;
        private readonly IDistrictsOrgUnitsService _districtsOrgUnitsService;
        private readonly INyssWebConfig _nyssWebConfig;

        public Handler(
            INyssContext nyssContext,
            ICryptographyService cryptographyService,
            IDistrictsOrgUnitsService districtsOrgUnitsService,
            INyssWebConfig nyssWebConfig)
        {
            _nyssContext = nyssContext;
            _cryptographyService = cryptographyService;
            _districtsOrgUnitsService = districtsOrgUnitsService;
            _nyssWebConfig = nyssWebConfig;
        }

        public async Task<Result<EidsrIntegrationResponseDto>> Handle(GetEidsrIntegrationQuery request, CancellationToken cancellationToken)
        {
            var eidsrConfiguration = await _nyssContext.EidsrConfiguration
                .FirstOrDefaultAsync(x =>
                    x.NationalSocietyId == request.Id, cancellationToken: cancellationToken);

            var password = eidsrConfiguration?.PasswordHash == default ? default : _cryptographyService.Decrypt(
                eidsrConfiguration?.PasswordHash,
                _nyssWebConfig.Key,
                _nyssWebConfig.SupplementaryKey
                );

            var eidsrConfigurationDto = new EidsrIntegrationResponseDto
            {
                Id = eidsrConfiguration?.Id,
                Username = eidsrConfiguration?.Username,
                Password = password,
                ApiBaseUrl = eidsrConfiguration?.ApiBaseUrl,
                TrackerProgramId = eidsrConfiguration?.TrackerProgramId,
                LocationDataElementId = eidsrConfiguration?.LocationDataElementId,
                DateOfOnsetDataElementId = eidsrConfiguration?.DateOfOnsetDataElementId,
                PhoneNumberDataElementId = eidsrConfiguration?.PhoneNumberDataElementId,
                SuspectedDiseaseDataElementId = eidsrConfiguration?.SuspectedDiseaseDataElementId,
                EventTypeDataElementId = eidsrConfiguration?.EventTypeDataElementId,
                GenderDataElementId = eidsrConfiguration?.GenderDataElementId,
                DistrictsWithOrganizationUnits = await GetDistrictsWithOrganizationUnits(request.Id),

                ReportLocationDataElementId = eidsrConfiguration?.ReportLocationDataElementId,
                ReportHealthRiskDataElementId = eidsrConfiguration?.ReportHealthRiskDataElementId,
                ReportSuspectedDiseaseDataElementId = eidsrConfiguration?.ReportSuspectedDiseaseDataElementId,
                ReportStatusDataElementId = eidsrConfiguration?.ReportStatusDataElementId,
                ReportGenderDataElementId = eidsrConfiguration?.ReportGenderDataElementId,
                ReportAgeAtLeastFiveDataElementId = eidsrConfiguration?.ReportAgeAtLeastFiveDataElementId,
                ReportAgeBelowFiveDataElementId = eidsrConfiguration?.ReportAgeBelowFiveDataElementId,
            };

            return Result.Success(eidsrConfigurationDto);
        }

        private async Task<List<DistrictsWithOrganizationUnits>> GetDistrictsWithOrganizationUnits(int nationalSocietyId)
        {
            var districts = await _districtsOrgUnitsService.GetNationalSocietyDistricts(nationalSocietyId);

            var result = new List<DistrictsWithOrganizationUnits>();

            foreach (var district in districts)
            {
                result.Add(new DistrictsWithOrganizationUnits
                {
                    DistrictId =  district.Id,
                    DistrictName = district.Name,
                    OrganisationUnitId = district.EidsrOrganisationUnits?.OrganisationUnitId,
                    OrganisationUnitName = district.EidsrOrganisationUnits?.OrganisationUnitName,
                });
            }

            return result;
        }
    }
}