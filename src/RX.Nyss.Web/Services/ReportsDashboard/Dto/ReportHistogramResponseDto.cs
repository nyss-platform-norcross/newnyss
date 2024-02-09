using System.Collections.Generic;

namespace RX.Nyss.Web.Services.ReportsDashboard.Dto;

public class ReportHistogramResponseDto
{
    public IEnumerable<HealthRiskReportsGroupedByDateDto> groupedReports;

    public class HealthRiskReportsGroupedByDateDto
    {
        public int HealthRiskId;
        public string HealthRiskName;

        public IEnumerable<PeriodDto> Data;
    }
}
