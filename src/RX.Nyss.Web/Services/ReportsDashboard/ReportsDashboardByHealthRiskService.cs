﻿using System;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using RX.Nyss.Common.Extensions;
using RX.Nyss.Common.Utils;
using RX.Nyss.Data;
using RX.Nyss.Data.Models;
using RX.Nyss.Web.Configuration;
using RX.Nyss.Web.Features.Reports;
using RX.Nyss.Web.Services.ReportsDashboard.Dto;

namespace RX.Nyss.Web.Services.ReportsDashboard
{
    public interface IReportsDashboardByHealthRiskService
    {
        Task<ReportByHealthRiskAndDateResponseDto> GetReportsGroupedByHealthRiskAndDate(ReportsFilter filters, DatesGroupingType groupingType, DayOfWeek epiWeekStartDay);
    }

    public class ReportsDashboardByHealthRiskService : IReportsDashboardByHealthRiskService
    {
        private readonly IReportService _reportService;
        private readonly IDateTimeProvider _dateTimeProvider;
        private readonly INyssWebConfig _config;
        private readonly INyssContext _nyssContext;


        public ReportsDashboardByHealthRiskService(
            IReportService reportService,
            IDateTimeProvider dateTimeProvider,
            INyssWebConfig config,
            INyssContext nyssContext)
        {
            _reportService = reportService;
            _dateTimeProvider = dateTimeProvider;
            _config = config;
            _nyssContext = nyssContext;
        }

        public async Task<ReportByHealthRiskAndDateResponseDto> GetReportsGroupedByHealthRiskAndDate(ReportsFilter filters, DatesGroupingType groupingType, DayOfWeek epiWeekStartDay)
        {
            var reports = _reportService.GetDashboardHealthRiskEventReportsQuery(filters);

            return groupingType switch
            {
                DatesGroupingType.Day =>
                await GroupReportsByHealthRiskAndDay(reports, filters.StartDate.DateTime.AddHours(filters.UtcOffset), filters.EndDate.DateTime.AddHours(filters.UtcOffset), filters.UtcOffset),

                DatesGroupingType.Week =>
                await GroupReportsByHealthRiskAndWeek(reports, filters.StartDate.DateTime.AddHours(filters.UtcOffset), filters.EndDate.DateTime.AddHours(filters.UtcOffset), epiWeekStartDay),

                _ =>
                throw new InvalidOperationException()
            };
        }

        private async Task<ReportByHealthRiskAndDateResponseDto> GroupReportsByHealthRiskAndDay(IQueryable<Report> reports, DateTime startDate, DateTime endDate, int utcOffset)
        {
            var groupedReports = await reports
                .GroupBy(r => new
                {
                    Date = r.ReceivedAt.AddHours(utcOffset).Date,
                    HealthRiskId = r.ProjectHealthRisk.HealthRiskId,
                    ContentLanguageId = r.ProjectHealthRisk.Project.NationalSociety.ContentLanguage.Id
                })
                .Select(grouping => new
                {
                    Period = grouping.Key.Date,
                    HealthRiskId = grouping.Key.HealthRiskId,
                    HealthRiskName = _nyssContext.HealthRisks.FirstOrDefault(hr => hr.Id == grouping.Key.HealthRiskId).LanguageContents
                        .Where(lc => lc.ContentLanguage.Id == grouping.Key.ContentLanguageId)
                        .Select(lc => lc.Name).FirstOrDefault(),
                    Count = grouping.Sum(r => r.ReportedCaseCount)
                })
                .Where(g => g.Count > 0)
                .ToListAsync();

            var reportsGroupedByHealthRisk = groupedReports
                .GroupBy(r => new
                {
                    r.HealthRiskId,
                    r.HealthRiskName
                })
                .OrderByDescending(g => g.Sum(w => w.Count))
                .Select(g => new
                {
                    HealthRisk = g.Key,
                    Data = g.ToList()
                })
                .ToList();

            var maxHealthRiskCount = _config.View.NumberOfGroupedHealthRisksInDashboard;

            var truncatedHealthRisksList = reportsGroupedByHealthRisk
                .Take(maxHealthRiskCount)
                .Union(reportsGroupedByHealthRisk
                    .Skip(maxHealthRiskCount)
                    .SelectMany(_ => _.Data)
                    .GroupBy(_ => true)
                    .Select(gr => new
                    {
                        HealthRisk = new
                        {
                            HealthRiskId = 0,
                            HealthRiskName = "(rest)"
                        },
                        Data = gr.ToList()
                    })
                )
                .Select(g => new ReportByHealthRiskAndDateResponseDto.ReportHealthRiskDto
                {
                    HealthRiskName = g.HealthRisk.HealthRiskName,
                    Periods = g.Data.GroupBy(v => v.Period).OrderBy(g => g.Key)
                        .Select(g => new PeriodDto
                        {
                            Period = g.Key.ToString("dd/MM/yy", CultureInfo.InvariantCulture),
                            Count = g.Sum(w => w.Count)
                        })
                        .ToList()
                });

            var allPeriods = startDate.GetDaysRange(endDate)
                .Select(i => i.ToString("dd/MM/yy", CultureInfo.InvariantCulture))
                .ToList();

            return new ReportByHealthRiskAndDateResponseDto
            {
                HealthRisks = truncatedHealthRisksList,
                AllPeriods = allPeriods
            };
        }

        private async Task<ReportByHealthRiskAndDateResponseDto> GroupReportsByHealthRiskAndWeek(IQueryable<Report> reports, DateTime startDate, DateTime endDate, DayOfWeek epiWeekStartDay)
        {
            var groupedReports = await reports
                .GroupBy(r => new
                {
                    r.EpiYear,
                    r.EpiWeek,
                    r.ProjectHealthRisk.HealthRiskId,
                    ContentLanguageId = r.ProjectHealthRisk.Project.NationalSociety.ContentLanguage.Id
                })
                .Select(grouping => new
                {
                    Period = new
                    {
                        grouping.Key.EpiYear,
                        grouping.Key.EpiWeek
                    },
                    Count = grouping.Sum(g => g.ReportedCaseCount),
                    HealthRiskId = grouping.Key.HealthRiskId,
                    HealthRiskName = _nyssContext.HealthRisks.FirstOrDefault(hr => hr.Id == grouping.Key.HealthRiskId).LanguageContents
                        .Where(lc => lc.ContentLanguage.Id == grouping.Key.ContentLanguageId)
                        .Select(lc => lc.Name).FirstOrDefault()
                })
                .Where(g => g.Count > 0)
                .ToListAsync();

            var reportsGroupedByHealthRisk = groupedReports
                .GroupBy(r => new
                {
                    r.HealthRiskId,
                    r.HealthRiskName
                })
                .OrderByDescending(g => g.Sum(w => w.Count))
                .Select(g => new
                {
                    HealthRisk = g.Key,
                    Data = g.ToList()
                })
                .ToList();

            var maxHealthRiskCount = _config.View.NumberOfGroupedHealthRisksInDashboard;

            var truncatedHealthRisksList = reportsGroupedByHealthRisk
                .Take(maxHealthRiskCount)
                .Union(reportsGroupedByHealthRisk
                    .Skip(maxHealthRiskCount)
                    .SelectMany(_ => _.Data)
                    .GroupBy(_ => true)
                    .Select(g => new
                    {
                        HealthRisk = new
                        {
                            HealthRiskId = 0,
                            HealthRiskName = "(rest)"
                        },
                        Data = g.ToList()
                    })
                )
                .Select(x => new ReportByHealthRiskAndDateResponseDto.ReportHealthRiskDto
                {
                    HealthRiskName = x.HealthRisk.HealthRiskName,
                    Periods = x.Data.GroupBy(v => v.Period).OrderBy(g => g.Key.EpiYear).ThenBy(g => g.Key.EpiWeek)
                        .Select(g => new PeriodDto
                        {
                            Period = $"{g.Key.EpiYear.ToString()}/{g.Key.EpiWeek.ToString()}",
                            Count = g.Sum(w => w.Count)
                        })
                        .ToList()
                })
                .ToList();

            var allPeriods = _dateTimeProvider.GetEpiDateRange(startDate, endDate, epiWeekStartDay)
                .Select(day => $"{day.EpiYear.ToString()}/{day.EpiWeek.ToString()}");

            return new ReportByHealthRiskAndDateResponseDto
            {
                HealthRisks = truncatedHealthRisksList,
                AllPeriods = allPeriods
            };
        }
    }
}
