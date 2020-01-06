using System;

namespace RX.Nyss.Web.Features.Report.Dto
{
    public class ExportListResponseDto
    {
        public int Id { get; set; }
        public RX.Nyss.Data.Models.DataCollector DataCollector { get; set; }
        public DateTime DateTime { get; set; }
        public string HealthRiskName { get; set; }
        public bool IsValid { get; set; }
        public string Region { get; set; }
        public string District { get; set; }
        public string Village { get; set; }
        public string Zone { get; set; }
        public string DataCollectorDisplayName { get; set; }
        public string PhoneNumber { get; set; }
        public int? CountMalesBelowFive { get; set; }
        public int? CountFemalesBelowFive { get; set; }
        public int? CountMalesAtLeastFive { get; set; }
        public int? CountFemalesAtLeastFive { get; set; }
        public int? ReferredCount { get; set; }
        public int? DeathCount { get; set; }
        public int? FromOtherVillagesCount { get; set; }
    }
}
