using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using RX.Nyss.Common.Utils.DataContract;
using RX.Nyss.Data.Concepts;
using RX.Nyss.Web.Features.Common;
using RX.Nyss.Web.Features.Common.Extensions;
using RX.Nyss.Web.Features.DataCollectors.Commands;
using RX.Nyss.Web.Features.DataCollectors.Dto;
using RX.Nyss.Web.Features.DataCollectors.Queries;
using RX.Nyss.Web.Utils;
using RX.Nyss.Web.Utils.DataContract;
using static RX.Nyss.Common.Utils.DataContract.Result;

namespace RX.Nyss.Web.Features.DataCollectors
{
    [Route("api/dataCollector")]
    public class DataCollectorController : BaseController
    {
        private readonly IDataCollectorService _dataCollectorService;

        private readonly IDataCollectorPerformanceService _dataCollectorPerformanceService;

        public DataCollectorController(
            IDataCollectorService dataCollectorService,
            IDataCollectorPerformanceService dataCollectorPerformanceService)
        {
            _dataCollectorService = dataCollectorService;
            _dataCollectorPerformanceService = dataCollectorPerformanceService;
        }

        [HttpGet, Route("{dataCollectorId:int}/get")]
        [NeedsRole(Role.Administrator, Role.Manager, Role.TechnicalAdvisor, Role.Supervisor, Role.HeadSupervisor), NeedsPolicy(Policy.DataCollectorAccess)]
        public Task<Result<GetDataCollectorResponseDto>> Get(int dataCollectorId) =>
            _dataCollectorService.Get(dataCollectorId);

        [HttpGet, Route("filters")]
        [NeedsRole(Role.Administrator, Role.Manager, Role.TechnicalAdvisor, Role.Supervisor, Role.HeadSupervisor), NeedsPolicy(Policy.ProjectAccess)]
        public async Task<Result<DataCollectorFiltersReponseDto>> Filters(int projectId) =>
            await Sender.Send(new GetFiltersDataQuery(projectId));

        [HttpPost, Route("list")]
        [NeedsRole(Role.Administrator, Role.Manager, Role.TechnicalAdvisor, Role.Supervisor, Role.HeadSupervisor), NeedsPolicy(Policy.ProjectAccess)]
        public Task<Result<PaginatedList<DataCollectorResponseDto>>> List(int projectId, [FromBody] DataCollectorsFiltersRequestDto dataCollectorsFiltersDto) =>
            _dataCollectorService.List(projectId, dataCollectorsFiltersDto);

        [HttpPost, Route("listAll")]
        [NeedsRole(Role.Administrator, Role.Manager, Role.TechnicalAdvisor, Role.Supervisor, Role.HeadSupervisor), NeedsPolicy(Policy.ProjectAccess)]
        public async Task<Result<List<DataCollectorResponseDto>>> ListAll(int projectId, [FromBody] DataCollectorsFiltersRequestDto dataCollectorsFiltersDto) =>
            await _dataCollectorService.ListAll(projectId, dataCollectorsFiltersDto);

        [HttpPost, Route("create")]
        [NeedsRole(Role.Administrator, Role.Manager, Role.TechnicalAdvisor, Role.Supervisor, Role.HeadSupervisor), NeedsPolicy(Policy.ProjectAccess)]
        public async Task<Result> Create([FromBody] CreateDataCollectorCommand cmd)
        {
            try
            {
                return await Sender.Send(cmd);
            }
            catch (ValidationException e)
            {
                // Get the error message string key from the fluent validation exception or default error message
                var errorMessage = e.Errors.FirstOrDefault()?.ErrorMessage.Split(":").Last()
                    ?? ResultKey.Validation.ValidationError;
                return Error(errorMessage);
            }
        }
        [HttpPost, Route("{dataCollectorId:int}/edit")]
        [NeedsRole(Role.Administrator, Role.Manager, Role.TechnicalAdvisor, Role.Supervisor, Role.HeadSupervisor), NeedsPolicy(Policy.DataCollectorAccess)]
        public async Task<Result> Edit([FromBody] EditDataCollectorCommand cmd) =>
            await Sender.Send(cmd);

        [HttpPost, Route("setTrainingState")]
        [NeedsRole(Role.Administrator, Role.Manager, Role.TechnicalAdvisor, Role.Supervisor, Role.HeadSupervisor), NeedsPolicy(Policy.MultipleDataCollectorsAccess)]
        public Task<Result> SetTrainingState(SetDataCollectorsTrainingStateRequestDto dto) =>
            _dataCollectorService.SetTrainingState(dto);

        [HttpPost, Route("{dataCollectorId:int}/delete")]
        [NeedsRole(Role.Administrator, Role.Manager, Role.TechnicalAdvisor, Role.Supervisor, Role.HeadSupervisor), NeedsPolicy(Policy.DataCollectorAccess)]
        public Task<Result> Delete(int dataCollectorId) =>
            _dataCollectorService.Delete(dataCollectorId);

        [HttpGet, Route("formData")]
        [NeedsRole(Role.Administrator, Role.Manager, Role.TechnicalAdvisor, Role.Supervisor, Role.HeadSupervisor)]
        public Task<Result<DataCollectorFormDataResponse>> FormData(int projectId) =>
            _dataCollectorService.GetFormData(projectId);

        [HttpGet, Route("mapOverview")]
        [NeedsRole(Role.Administrator, Role.Manager, Role.TechnicalAdvisor, Role.Supervisor, Role.HeadSupervisor), NeedsPolicy(Policy.ProjectAccess)]
        public Task<Result<MapOverviewResponseDto>> MapOverview(int projectId, DateTime from, DateTime to) =>
            _dataCollectorService.MapOverview(projectId, from, to);

        [HttpGet, Route("mapOverviewDetails")]
        [NeedsRole(Role.Administrator, Role.Manager, Role.TechnicalAdvisor, Role.Supervisor, Role.HeadSupervisor), NeedsPolicy(Policy.ProjectAccess)]
        public Task<Result<List<MapOverviewDataCollectorResponseDto>>> MapOverviewDetails(int projectId, DateTime from, DateTime to, double lat, double lng) =>
            _dataCollectorService.MapOverviewDetails(projectId, from, to, lat, lng);

        [HttpPost, Route("performance")]
        [NeedsRole(Role.Administrator, Role.Manager, Role.TechnicalAdvisor, Role.Supervisor, Role.HeadSupervisor), NeedsPolicy(Policy.ProjectAccess)]
        public async Task<Result<DataCollectorPerformanceResponseDto>> Performance(int projectId, [FromBody] DataCollectorPerformanceFiltersRequestDto dataCollectorsFiltersDto) =>
            await Sender.Send(new DataCollectorPerformanceQuery(projectId, dataCollectorsFiltersDto));

        [HttpPost, Route("exportToExcel")]
        [NeedsRole(Role.Administrator, Role.Manager, Role.TechnicalAdvisor), NeedsPolicy(Policy.ProjectAccess)]
        public async Task<IActionResult> ExportToExcel(int projectId, [FromBody] DataCollectorsFiltersRequestDto dataCollectorsFiltersDto) =>
            await Sender.Send(new ExportDataCollectorsToExcelQuery(projectId, dataCollectorsFiltersDto)).AsFileResult();

        [HttpPost, Route("exportToCsv")]
        [NeedsRole(Role.Administrator, Role.Manager, Role.TechnicalAdvisor), NeedsPolicy(Policy.ProjectAccess)]
        public async Task<IActionResult> ExportToCsv(int projectId, [FromBody] DataCollectorsFiltersRequestDto dataCollectorsFiltersDto) =>
            await Sender.Send(new ExportDataCollectorsToCsvQuery(projectId, dataCollectorsFiltersDto)).AsFileResult();

        [HttpPost, Route("replaceSupervisor")]
        [NeedsRole(Role.Administrator, Role.Manager, Role.TechnicalAdvisor), NeedsPolicy(Policy.MultipleDataCollectorsAccess)]
        public async Task<Result> ReplaceSupervisor([FromBody] ReplaceSupervisorCommand cmd) =>
            await Sender.Send(cmd);

        [HttpPost, Route("setDeployedState")]
        [NeedsRole(Role.Administrator, Role.Manager, Role.TechnicalAdvisor, Role.Supervisor, Role.HeadSupervisor), NeedsPolicy(Policy.MultipleDataCollectorsAccess)]
        public async Task<Result> SetDeployedState([FromBody] SetDeployedStateCommand cmd) =>
            await Sender.Send(cmd);

        [HttpPost, Route("exportPerformance")]
        [NeedsRole(Role.Administrator, Role.Manager, Role.TechnicalAdvisor, Role.HeadSupervisor, Role.Supervisor), NeedsPolicy(Policy.ProjectAccess)]
        public async Task<IActionResult> ExportPerformance(int projectId, [FromBody] DataCollectorPerformanceFiltersRequestDto filters) =>
            await Sender.Send(new ExportDataCollectorPerformanceQuery(projectId, filters)).AsFileResult();
    }
}
