using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RX.Nyss.Data;
using RX.Nyss.Data.Concepts;
using RX.Nyss.Data.Models;
using RX.Nyss.Web.Features.Common.Dto;
using RX.Nyss.Web.Features.Common.Extensions;
using RX.Nyss.Web.Features.Reports;
using RX.Nyss.Web.Services.ReportsDashboard.Dto;

namespace RX.Nyss.Web.Services.ReportsDashboard;

public interface IReportsDashboardService
{
    Task<ReportHistogramResponseDto> GetKeptReportsInEscalatedAlertsHistogramData(int nationalSocietyId, int? projectId=null, ReportsFilter reportsFilter=null);

    Task<IList<HealthRiskReportsGroupedByDateDto>> GroupReportsByHealthRiskAndDate(IQueryable<Report> reports);
}

public class ReportsDashboardService : IReportsDashboardService
{
    private readonly INyssContext _nyssContext;

    public ReportsDashboardService(
        INyssContext nyssContext
        )
    {
        _nyssContext = nyssContext;
    }

    public async Task<ReportHistogramResponseDto> GetKeptReportsInEscalatedAlertsHistogramData(int nationalSocietyId, int? projectId=null, ReportsFilter reportsFilter=null)
    {
        var baseQuery = _nyssContext.Alerts
            .Where(a => a.ProjectHealthRisk.Project.NationalSociety.Id == nationalSocietyId)
            .FilterByProject(projectId)
            .Where(a => a.Status == AlertStatus.Escalated) // Only Include escalated alerts
            .SelectMany(a => a.AlertReports);

        // Apply reportsFilter to the baseQuery if it exists
        baseQuery = reportsFilter != null
            ? baseQuery
                .FilterByDate(reportsFilter.StartDate, reportsFilter.EndDate)
                .FilterByHealthRisks(reportsFilter.HealthRisks)
                .FilterByArea(reportsFilter.Area)
            : baseQuery;

        // Apply additional filters to select only kept reports that are included in an escalated alert
        var reports = baseQuery
            .FilterByReportStatus(new ReportStatusFilterDto
            {
                Kept = true,
                Dismissed = false,
                NotCrossChecked = false
            }) // Filter out non-kept reports

            //.AllReportsKeptBeforeAlertWasEscalated(); // Only select reports that were cross checked before escalation
            .Select(ar => ar.Report);

        var groupedReports = await GroupReportsByHealthRiskAndDate(reports);

        return new ReportHistogramResponseDto
        {
            startDateString = reportsFilter?.StartDate.Date.ToShortDateString(),
            endDateString = reportsFilter?.EndDate.Date.ToShortDateString(),
            groupedReports = groupedReports,
        };
    }

    public async Task<IList<HealthRiskReportsGroupedByDateDto>> GroupReportsByHealthRiskAndDate(IQueryable<Report> reports)
    {
        // Reduce Reports into only the necessary data
        var reducedReports = reports
            .Select(r => new
        {
            ReportId = r.Id,
            HealthRiskId = r.ProjectHealthRisk.HealthRiskId,
            HealthRiskName =
                r.ProjectHealthRisk.HealthRisk.LanguageContents.FirstOrDefault(hr => hr.ContentLanguage.LanguageCode == r.ProjectHealthRisk.Project.NationalSociety.ContentLanguage.LanguageCode).Name,
            Date = r.CreatedAt.Date
        });

        // Group Report based on healthRiskId and healthRiskName
        // Must be converted to a List as further groupBy operations causes errors with Linq
        var reportsGroupedByHealthRisk = await reducedReports.GroupBy(r => new
            {
                HealthRiskId = r.HealthRiskId,
                HealthRiskName = r.HealthRiskName,
            })
            .Select(group => new
            {
                HealthRiskId = group.Key.HealthRiskId,
                HealthRiskName = group.Key.HealthRiskName,
                Data = group.ToList()
            }).ToListAsync();

        // Further group the entries by Date and count entries in each dateGroup
        var reportsGroupedByHealthRiskAndDate = reportsGroupedByHealthRisk.Select(groupedReport => new
        {
            HealthRiskId = groupedReport.HealthRiskId,
            HealthRiskName = groupedReport.HealthRiskName,
            Data = groupedReport.Data.GroupBy(d => d.Date.Date.ToShortDateString()).Select(dateGroup => new PeriodDto
            {
                Period = dateGroup.Key,
                Count = dateGroup.Count(),
            }).ToList()
        }).Select(groupedReport => new HealthRiskReportsGroupedByDateDto
        {
            HealthRiskId = groupedReport.HealthRiskId,
            HealthRiskName = groupedReport.HealthRiskName,
            Data = groupedReport.Data.ToList(),
        }).ToList();

        return reportsGroupedByHealthRiskAndDate;
    }
}
