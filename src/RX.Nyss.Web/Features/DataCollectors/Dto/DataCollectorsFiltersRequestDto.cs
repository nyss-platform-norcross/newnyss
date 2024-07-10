using RX.Nyss.Data.Concepts;
using RX.Nyss.Web.Features.Common.Dto;

namespace RX.Nyss.Web.Features.DataCollectors.Dto
{
    public class DataCollectorsFiltersRequestDto
    {
        public AreaDto Locations { get; set; }

        public SexDto? Sex { get; set; }

        public int? SupervisorId { get; set; }

        public TrainingStatusDto? TrainingStatus { get; set; }

        public DeployedModeDto? DeployedMode { get; set; }

        public string Name { get; set; }

        public int PageNumber { get; set; }

        public DataCollectorType? DataCollectorType { get; set; }
    }
}
