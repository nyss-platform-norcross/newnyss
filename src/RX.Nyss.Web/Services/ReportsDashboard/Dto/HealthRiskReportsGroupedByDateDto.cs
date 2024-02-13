using System.Collections.Generic;

namespace RX.Nyss.Web.Services.ReportsDashboard.Dto;

public class HealthRiskReportsGroupedByDateDto
{
    public int HealthRiskId { get; set; }
    public string HealthRiskName { get; set; }

    public IEnumerable<PeriodDto> Data { get; set; }
}
