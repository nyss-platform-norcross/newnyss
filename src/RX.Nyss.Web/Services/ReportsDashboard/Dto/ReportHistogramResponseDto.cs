using System.Collections.Generic;

namespace RX.Nyss.Web.Services.ReportsDashboard.Dto;

public class ReportHistogramResponseDto
{
    public string startDateString { get; set; }
    public string endDateString { get; set; }
    public IEnumerable<HealthRiskReportsGroupedByDateDto> groupedReports { get; set; }
}
