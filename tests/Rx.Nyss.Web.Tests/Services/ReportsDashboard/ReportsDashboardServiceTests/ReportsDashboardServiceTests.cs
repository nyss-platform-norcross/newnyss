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

    [Fact]
    public void GetKeptReportsInEscalatedAlertsQuery_ShouldNotReturnReportsFromWrongNationalSocieties()
    {
        // Arrange test data
        ArrangeTwoKeptReportsInEscalatedAlertsInTwoDifferentNationalSocieties();
        var nationalSocietyIdCorrect = 1;
        var nationalSocietyIdWrong = 2;

        var reportsFilter = new ReportsFilter
        {
            StartDate = new DateTimeOffset(2024, 1, 1, 0, 0, 0, new TimeSpan(1, 0, 0)),
            EndDate = new DateTimeOffset(2024, 1, 8, 0, 0, 0, new TimeSpan(1, 0, 0)),
        };

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

        var reportsFilter = new ReportsFilter
        {
            StartDate = new DateTimeOffset(2024, 1, 1, 0, 0, 0, new TimeSpan(1, 0, 0)),
            EndDate = new DateTimeOffset(2024, 1, 8, 0, 0, 0, new TimeSpan(1, 0, 0)),
        };

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

        var reportsFilter = new ReportsFilter
        {
            StartDate = new DateTimeOffset(2024, 1, 1, 0, 0, 0, new TimeSpan(1, 0, 0)),
            EndDate = new DateTimeOffset(2024, 1, 8, 0, 0, 0, new TimeSpan(1, 0, 0)),
        };

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

        var reportsFilter = new ReportsFilter // Filter from 01.01.2024 - 08.01.2024
        {
            StartDate = new DateTimeOffset(2024, 1, 1, 0, 0, 0, new TimeSpan(1, 0, 0)),
            EndDate = new DateTimeOffset(2024, 1, 8, 0, 0, 0, new TimeSpan(1, 0, 0)),
        };

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

        var reportsFilter = new ReportsFilter // Filter from 01.01.2024 - 08.01.2024
        {
            StartDate = new DateTimeOffset(2024, 1, 1, 0, 0, 0, new TimeSpan(1, 0, 0)),
            EndDate = new DateTimeOffset(2024, 1, 8, 0, 0, 0, new TimeSpan(1, 0, 0)),
        };

        // act
        var reportQuery = _reportsDashboardService.GetKeptReportsInEscalatedAlertsQuery(nationalSocietyId, reportsFilter);
        var test = reportQuery.ToList();

        // assert
        reportQuery.Any(r => r.ReportAlerts.Any(ar => ar.Alert.Status == AlertStatus.Open)).ShouldBe(false);
        reportQuery.Any(r => r.ReportAlerts.Any(ar => ar.Alert.Status == AlertStatus.Closed)).ShouldBe(false);
        reportQuery.Any(r => r.ReportAlerts.Any(ar => ar.Alert.Status == AlertStatus.Dismissed)).ShouldBe(false);
        reportQuery.All(r => r.ReportAlerts.All(ar => ar.Alert.Status == AlertStatus.Escalated)).ShouldBe(true);

    }


}
