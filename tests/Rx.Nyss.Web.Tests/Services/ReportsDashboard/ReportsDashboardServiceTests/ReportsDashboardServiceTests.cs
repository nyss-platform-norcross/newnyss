using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using RX.Nyss.Common.Utils;
using RX.Nyss.Data;
using RX.Nyss.Data.Concepts;
using RX.Nyss.Web.Configuration;
using RX.Nyss.Web.Features.Common.Dto;
using RX.Nyss.Web.Features.Reports;
using RX.Nyss.Web.Services.ReportsDashboard;
using Shouldly;
using Xunit;

namespace RX.Nyss.Web.Tests.Services.ReportsDashboard.ReportsDashboardServiceTests;

public class ReportsDashboardServiceTests : ReportsDashboardServiceTestBase
{
    private readonly IReportsDashboardService _reportsDashboardService;

    public ReportsDashboardServiceTests()
    {
        _reportsDashboardService = new ReportsDashboardService(_nyssContext);
    }

    private ReportsFilter GetReportFilters() =>
        new ReportsFilter // Filter from 01.01.2024 - 08.01.2024
        {
            StartDate = new DateTimeOffset(2024, 1, 1, 0, 0, 0, new TimeSpan(1, 0, 0)),
            EndDate = new DateTimeOffset(2024, 1, 8, 0, 0, 0, new TimeSpan(1, 0, 0)).AddDays(1),
            // Reports Filters EndDate gets added 1 day so we include all the reports that have come in on the last day
            // This should make it so that all reports registered by 08-01-2024 23:59:59 are included, but after 09-01-2024 0:0:0 are excluded
        };

    [Fact]
    public void GetKeptReportsInEscalatedAlertsQuery_ShouldNotReturnReportsFromWrongNationalSocieties()
    {
        // Arrange test data
        ArrangeTwoKeptReportsInEscalatedAlertsInTwoDifferentNationalSocieties();
        var nationalSocietyIdCorrect = 1;
        var nationalSocietyIdWrong = 2;

        var reportsFilter = GetReportFilters();

        // act
        var reportQuery = _reportsDashboardService.GetKeptReportsInEscalatedAlertsQuery(nationalSocietyIdCorrect, reportsFilter);

        // assert
        reportQuery.Any(r => r.ProjectHealthRisk.Project.NationalSociety.Id == nationalSocietyIdCorrect).ShouldBe(true);
        reportQuery.Any(r => r.ProjectHealthRisk.Project.NationalSociety.Id == nationalSocietyIdWrong).ShouldBe(false);
    }

    [Fact]
    public void GetKeptReportsInEscalatedAlertsQuery_ShouldReturnReportsFromAllProjectsInNationalSocietyIfProjectIdNotSpecified()
    {
        // Arrange test data
        ArrangeTwoKeptReportsInEscalatedAlertsInTwoDifferentProjectsInTheSameNationalSociety();
        var nationalSocietyId = 1;
        var projectIdFirst = 1;
        var projectIdSecond = 2;

        var reportsFilter = GetReportFilters();

        // act
        var reportQuery = _reportsDashboardService.GetKeptReportsInEscalatedAlertsQuery(nationalSocietyId, reportsFilter);

        // assert
        reportQuery.Any(r => r.ProjectHealthRisk.Project.Id == projectIdFirst).ShouldBe(true);
        reportQuery.Any(r => r.ProjectHealthRisk.Project.Id == projectIdSecond).ShouldBe(true);
    }

    [Fact]
    public void GetKeptReportsInEscalatedAlertsQuery_ShouldNotReturnReportsFromWrongProjectsIfProjectIdSpecified()
    {
        // Arrange test data
        ArrangeTwoKeptReportsInEscalatedAlertsInTwoDifferentProjectsInTheSameNationalSociety();
        var nationalSocietyId = 1;
        var projectIdCorrect = 1;
        var projectIdWrong = 2;

        var reportsFilter = GetReportFilters();

        // act
        var reportQuery = _reportsDashboardService.GetKeptReportsInEscalatedAlertsQuery(nationalSocietyId, reportsFilter, projectId: projectIdCorrect);

        // assert
        reportQuery.Any(r => r.ProjectHealthRisk.Project.Id == projectIdCorrect).ShouldBe(true);
        reportQuery.Any(r => r.ProjectHealthRisk.Project.Id == projectIdWrong).ShouldBe(false);
    }

    [Fact]
    public void GetKeptReportsInEscalatedAlertsQuery_ShouldOnlyReturnKeptReports()
    {
        // Arrange test data
        ArrangeKeptDismissedAndNotCrossCheckedReportsInAnEscalatedAlert();
        var nationalSocietyId = 1;

        var reportsFilter = GetReportFilters();

        // act
        var reportQuery = _reportsDashboardService.GetKeptReportsInEscalatedAlertsQuery(nationalSocietyId, reportsFilter);

        // assert
        reportQuery.Any(r => r.Status == ReportStatus.Rejected).ShouldBe(false);
        reportQuery.Any(r => r.Status == ReportStatus.Pending).ShouldBe(false);
        reportQuery.All(r => r.Status == ReportStatus.Accepted).ShouldBe(true);
    }

    [Fact]
    public void GetKeptReportsInEscalatedAlertsQuery_ShouldOnlyReturnReportsFromAnEscalatedAlert()
    {
        // Arrange test data
        ArrangeKeptReportsInOpenClosedDismissedAndEscalatedAlerts();
        var nationalSocietyId = 1;

        var reportsFilter = GetReportFilters();

        // act
        var reportQuery = _reportsDashboardService.GetKeptReportsInEscalatedAlertsQuery(nationalSocietyId, reportsFilter);

        // assert
        reportQuery.Any(r => r.ReportAlerts.Any(ar => ar.Alert.Status == AlertStatus.Open)).ShouldBe(false);
        reportQuery.Any(r => r.ReportAlerts.Any(ar => ar.Alert.Status == AlertStatus.Closed)).ShouldBe(false);
        reportQuery.Any(r => r.ReportAlerts.Any(ar => ar.Alert.Status == AlertStatus.Dismissed)).ShouldBe(false);
        reportQuery.All(r => r.ReportAlerts.All(ar => ar.Alert.Status == AlertStatus.Escalated)).ShouldBe(true);

    }

    [Fact]
    // Tests that all reports returned by GetKeptReportsInEscalatedAlertsQuery are within the filter time-range
    public void GetKeptReportsInEscalatedAlertsQuery_ShouldReturnAllKeptReportsInEscalatedAlertsWithinTheFilterTimeRange()
    {
        // Arrange test data
        ArrangeKeptReportsInEscalatedAlertsInsideAndOutsideOfTimeRange();
        // Reports are inside and just outside of the time range 01.01.2024 - 08.01.2024
        var nationalSocietyId = 1;

        var reportsFilter = GetReportFilters();

        // act
        var reportQuery = _reportsDashboardService.GetKeptReportsInEscalatedAlertsQuery(nationalSocietyId, reportsFilter);

        // assert
        reportQuery.Count().ShouldBe(3); // We expect 3 reports given the test data
        reportQuery.All(r => r.ReceivedAt >= reportsFilter.StartDate.UtcDateTime && r.ReceivedAt < reportsFilter.EndDate.UtcDateTime).ShouldBe(true);
    }

    [Fact]
    // Tests that GetKeptReportsInEscalatedAlertsQuery only returns reports within the filter time-range, even if all the reports are
    // Included in the same escalated alert
    public void GetKeptReportsInEscalatedAlertsQuery_ShouldOnlyReturnKeptReportsInTheSameEscalatedAlertWithinTheFilterTimeRange()
    {
        // Arrange test data
        ArrangeKeptReportsInTheSameEscalatedAlertInsideAndOutsideOfTimeRange();
        // Reports are inside and just outside of the time range 01.01.2024 - 08.01.2024
        var nationalSocietyId = 1;

        var reportsFilter = GetReportFilters();

        // act
        var reportQuery = _reportsDashboardService.GetKeptReportsInEscalatedAlertsQuery(nationalSocietyId, reportsFilter);

        // assert
        reportQuery.Count().ShouldBe(3); // We expect 3 reports given the test data
        reportQuery.All(r => r.ReceivedAt >= reportsFilter.StartDate.UtcDateTime && r.ReceivedAt < reportsFilter.EndDate.UtcDateTime).ShouldBe(true);
    }




}
