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
    Task<ReportHistogramResponseDto> GetKeptReportsInEscalatedAlertsHistogramData(int nationalSocietyId, ReportsFilter reportsFilter, int? projectId=null);

    IQueryable<Report> GetKeptReportsInEscalatedAlertsQuery(int nationalSocietyId, ReportsFilter reportsFilter, int? projectId = null);

    Task<IList<HealthRiskReportsGroupedByDateDto>> GroupReportsByHealthRiskAndDate(IQueryable<Report> reports, int utcOffset);
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

    public async Task<ReportHistogramResponseDto> GetKeptReportsInEscalatedAlertsHistogramData(int nationalSocietyId, ReportsFilter reportsFilter, int? projectId=null)
    {
        var reportsQuery = GetKeptReportsInEscalatedAlertsQuery(nationalSocietyId, reportsFilter, projectId);

        var groupedReports = await GroupReportsByHealthRiskAndDate(reportsQuery, reportsFilter.UtcOffset);

        return new ReportHistogramResponseDto
        {
            // We add utcOffset so we return the local dateStrings
            chartStartDateString = reportsFilter.StartDate.AddHours(reportsFilter.UtcOffset).Date.ToString("yyyy-MM-dd"),
            // End date is increased by 1 day in the reports filters (In order to actually fetch all reports created on the last day)
            // Therefore we must subtract 1 day before returning the endDate, or the chart will display an extra day
            chartEndDateString = reportsFilter.EndDate.AddDays(-1).AddHours(reportsFilter.UtcOffset).Date.ToString("yyyy-MM-dd"),
            groupedReports = groupedReports,
        };
    }

    public IQueryable<Report> GetKeptReportsInEscalatedAlertsQuery(int nationalSocietyId, ReportsFilter reportsFilter, int? projectId = null)
    {
        var baseQuery = _nyssContext.Alerts
            .Where(a => a.ProjectHealthRisk.Project.NationalSociety.Id == nationalSocietyId);
        baseQuery = baseQuery.FilterByProject(projectId);
        baseQuery = baseQuery.Where(a => a.Status == AlertStatus.Escalated); // Only Include escalated alerts
        var arQuery = baseQuery.SelectMany(a => a.AlertReports);

        // Apply reportsFilter to the baseQuery if it exists
        arQuery = arQuery.FilterByDate(reportsFilter.StartDate, reportsFilter.EndDate);
        arQuery = arQuery.FilterByHealthRisks(reportsFilter.HealthRisks);
        arQuery = arQuery.FilterByArea(reportsFilter.Area);

        // Apply additional filters to select only kept reports that are included in an escalated alert
        var reports = arQuery
            .FilterByReportStatus(new ReportStatusFilterDto
            {
                Kept = true,
                Dismissed = false,
                NotCrossChecked = false
            }) // Filter out non-kept reports

            //.AllReportsKeptBeforeAlertWasEscalated(); // Only select reports that were cross checked before escalation
            .Select(ar => ar.Report);

        return reports;
    }

    public async Task<IList<HealthRiskReportsGroupedByDateDto>> GroupReportsByHealthRiskAndDate(IQueryable<Report> reports, int utcOffset)
    {
        // Reduce Reports into only the necessary data
        var reducedReports = reports
            .Select(r => new
        {
            ReportId = r.Id,
            HealthRiskId = r.ProjectHealthRisk.HealthRiskId,
            HealthRiskName =
                r.ProjectHealthRisk.HealthRisk.LanguageContents.FirstOrDefault(hr => hr.ContentLanguage.LanguageCode == r.ProjectHealthRisk.Project.NationalSociety.ContentLanguage.LanguageCode).Name,
            Date = r.CreatedAt.AddHours(utcOffset).Date //Apply utc offset to Date
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
            Data = groupedReport.Data.GroupBy(d => d.Date.Date.ToString("yyyy-MM-dd")).Select(dateGroup => new PeriodDto
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
