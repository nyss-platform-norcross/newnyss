namespace RX.Nyss.Web.Features.Reports.Dto
{
    public class ExportCorrectDcpReportListCsvContentDto
    {
        public int Id { get; set; }
        public string Date { get; set; }
        public string Time { get; set; }
        public int EpiWeek { get; set; }
        public int EpiYear { get; set; }
        public string Status { get; set; }
        public string Region { get; set; }
        public string District { get; set; }
        public string Village { get; set; }
        public string Zone { get; set; }
        public string HealthRiskName { get; set; }
        public int? CountMalesBelowFive { get; set; }
        public int? CountMalesAtLeastFive { get; set; }
        public int? CountFemalesBelowFive { get; set; }
        public int? CountFemalesAtLeastFive { get; set; }
        public int? TotalBelowFive { get; set; }
        public int? TotalAtLeastFive { get; set; }
        public int? TotalMale { get; set; }
        public int? TotalFemale { get; set; }
        public int? Total { get; set; }
        public int? ReferredCount { get; set; }
        public int? DeathCount { get; set; }
        public int? FromOtherVillagesCount { get; set; }
        public string DataCollectorDisplayName { get; set; }
        public string PhoneNumber { get; set; }
        public string Message { get; set; }
        public string Location { get; set; }
        public string Corrected { get; set; }
    }
}
