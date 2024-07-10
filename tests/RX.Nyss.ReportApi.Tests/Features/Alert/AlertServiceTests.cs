﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using NSubstitute;
using RX.Nyss.Common.Services.StringsResources;
using RX.Nyss.Common.Utils;
using RX.Nyss.Common.Utils.Logging;
using RX.Nyss.Data;
using RX.Nyss.Data.Concepts;
using RX.Nyss.Data.Models;
using RX.Nyss.ReportApi.Configuration;
using RX.Nyss.ReportApi.Features.Alerts;
using RX.Nyss.ReportApi.Features.Common.Contracts;
using RX.Nyss.ReportApi.Services;
using RX.Nyss.ReportApi.Tests.Features.Alert.TestData;
using Shouldly;
using Xunit;

namespace RX.Nyss.ReportApi.Tests.Features.Alert;

public class AlertServiceTests
{
    private readonly INyssContext _nyssContextMock;
    private readonly INyssContext _nyssContextInMemoryMock;
    private readonly IAlertService _alertService;
    private readonly ILoggerAdapter _loggerAdapterMock;

    private readonly AlertServiceTestData _testData;
    private readonly IQueuePublisherService _queuePublisherServiceMock;
    private readonly IStringsResourcesService _stringsResourcesServiceMock;
    private readonly INyssReportApiConfig _nyssReportApiConfigMock;
    private readonly IDateTimeProvider _dateTimeProviderMock;
    private readonly IReportLabelingService _reportLabelingServiceMock;
    private readonly IAlertNotificationService _alertNotificationServiceMock;

    public AlertServiceTests()
    {
        _reportLabelingServiceMock = Substitute.For<IReportLabelingService>();
        _queuePublisherServiceMock = Substitute.For<IQueuePublisherService>();
        _nyssReportApiConfigMock = Substitute.For<INyssReportApiConfig>();
        _nyssContextMock = Substitute.For<INyssContext>();
        _loggerAdapterMock = Substitute.For<ILoggerAdapter>();
        _stringsResourcesServiceMock = Substitute.For<IStringsResourcesService>();
        _dateTimeProviderMock = Substitute.For<IDateTimeProvider>();
        _alertNotificationServiceMock = Substitute.For<IAlertNotificationService>();
        _alertService = new AlertService(
            _nyssContextMock,
            _reportLabelingServiceMock,
            _loggerAdapterMock,
            _alertNotificationServiceMock
        );

        var builder = new DbContextOptionsBuilder<NyssContext>();
        builder.UseInMemoryDatabase("InMemoryDatabase");
        _nyssContextInMemoryMock = new NyssContext(builder.Options);

        _testData = new AlertServiceTestData(_nyssContextMock);
    }

    [Theory]
    [InlineData(ReportType.Aggregate)]
    [InlineData(ReportType.DataCollectionPoint)]
    public async Task ReportAdded_WhenReportTypeIsAggregateOrDCP_ShouldReturnNull(ReportType reportType)
    {
        //arrange
        _testData.SimpleCasesData.GenerateData();
        var report = _testData.SimpleCasesData.AdditionalData.HumanDataCollectorReport;
        report.ReportType = reportType;

        //act
        var result = await _alertService.ReportAdded(report);

        //assert
        result.Alert.ShouldBeNull();
    }

    [Fact]
    public async Task ReportAdded_WhenReportTypeIsStatementAndHealthRiskIsActivity_ShouldReturnNull()
    {
        //arrange
        _testData.SimpleCasesData.GenerateData();
        var report = _testData.SimpleCasesData.AdditionalData.HumanDataCollectorReport;
        report.ReportType = ReportType.Event;
        report.ProjectHealthRisk.HealthRisk.HealthRiskType = HealthRiskType.Activity;

        //act
        var result = await _alertService.ReportAdded(report);

        //assert
        result.Alert.ShouldBeNull();
    }

    [Theory]
    [InlineData(ReportType.Single)]
    [InlineData(ReportType.Event)]
    [InlineData(ReportType.Aggregate)]
    [InlineData(ReportType.DataCollectionPoint)]
    public async Task ReportAdded_WhenReportTypeIsNonHumanAndFromDataCollectionPoint_ShouldReturnNull(ReportType reportType)
    {
        //arrange
        _testData.SimpleCasesData.GenerateData();
        var report = _testData.SimpleCasesData.AdditionalData.DataCollectionPointReport;
        report.ReportType = reportType;

        //act
        var result = await _alertService.ReportAdded(report);

        //assert
        result.Alert.ShouldBeNull();
    }

    [Fact]
    public void ReportAdded_WhenSingleReportDoesNotHaveAProjectHealthRisk_ShouldThrow()
    {
        //arrange
        _testData.SimpleCasesData.GenerateData().AddToDbContext();
        var report = _testData.SimpleCasesData.AdditionalData.SingleReportWithoutHealthRisk;

        //assert
        Should.ThrowAsync<TargetInvocationException>(() => _alertService.ReportAdded(report));
    }

    [Fact]
    public async Task ReportAdded_WhenCountThresholdIsOne_ShouldReturnNewPendingAlert()
    {
        //arrange
        _testData.WhenCountThresholdIsOne.GenerateData().AddToDbContext();
        var report = _testData.WhenCountThresholdIsOne.EntityData.Reports.Single();
        var existingAlerts = _testData.WhenCountThresholdIsOne.EntityData.Alerts;

        //act
        var result = await _alertService.ReportAdded(report);

        //assert
        result.Alert.ShouldBeOfType<Data.Models.Alert>();
        result.Alert.Status.ShouldBe(AlertStatus.Open);
        existingAlerts.ShouldNotContain(result.Alert);
    }

    [Fact]
    public async Task ReportAdded_WhenCountThresholdIsOne_ReportShouldBeChangedToPending()
    {
        //arrange
        _testData.WhenCountThresholdIsOne.GenerateData().AddToDbContext();
        var report = _testData.WhenCountThresholdIsOne.EntityData.Reports.Single();

        //act
        var result = await _alertService.ReportAdded(report);

        //assert
        report.Status.ShouldBe(ReportStatus.Pending);
    }


    [Fact]
    public async Task ReportAdded_WhenCountThresholdIsOne_ShouldAddAlertReportEntity()
    {
        //arrange
        _testData.WhenCountThresholdIsOne.GenerateData().AddToDbContext();
        var report = _testData.WhenCountThresholdIsOne.EntityData.Reports.Single();

        //act
        var result = await _alertService.ReportAdded(report);

        //assert
        await _nyssContextMock.AlertReports.Received(1).AddRangeAsync(Arg.Is<IEnumerable<AlertReport>>(list =>
            list.Count() == 1 && list.Any(ar => ar.Alert == result.Alert && ar.Report == report)
        ));
    }

    [Fact]
    public async Task ReportAdded_WhenCountThresholdIsOne_ShouldSaveChanges2Times()
    {
        //arrange
        _testData.WhenCountThresholdIsOne.GenerateData().AddToDbContext();
        var report = _testData.WhenCountThresholdIsOne.EntityData.Reports.Single();

        //act
        var result = await _alertService.ReportAdded(report);

        // Assert
        await _nyssContextMock.Received(2).SaveChangesAsync();
    }


    [Fact]
    public async Task ReportAdded_WhenCountThresholdIsThreeAndIsNotSatisfied_ShouldReturnNull()
    {
        //arrange
        _testData.WhenCountThresholdIsThreeAndIsNotSatisfied.GenerateData().AddToDbContext();
        var report = _testData.WhenCountThresholdIsThreeAndIsNotSatisfied.EntityData.Reports.Single();

        //act
        var result = await _alertService.ReportAdded(report);

        //assert
        result.Alert.ShouldBeNull();
    }

    [Fact]
    public async Task ReportAdded_WhenCountThresholdIsThreeAndIsNotSatisfied_ReportStatusShouldRemainNew()
    {
        //arrange
        _testData.WhenCountThresholdIsThreeAndIsNotSatisfied.GenerateData().AddToDbContext();
        var report = _testData.WhenCountThresholdIsThreeAndIsNotSatisfied.EntityData.Reports.Single();

        //act
        var result = await _alertService.ReportAdded(report);

        //assert
        report.Status.ShouldBe(ReportStatus.New);
    }


    [Fact]
    public async Task ReportAdded_WhenAddingToGroupWithNoAlertAndMeetingThreshold_ShouldReturnNewPendingAlert()
    {
        //arrange
        _testData.WhenAddingToGroupWithNoAlertAndMeetingThreshold.GenerateData().AddToDbContext();
        var reportBeingAdded = _testData.WhenAddingToGroupWithNoAlertAndMeetingThreshold.EntityData.Reports.FirstOrDefault();
        var existingAlerts = _testData.WhenAddingToGroupWithNoAlertAndMeetingThreshold.EntityData.Alerts;

        //act
        var result = await _alertService.ReportAdded(reportBeingAdded);

        //assert
        result.Alert.ShouldBeOfType<Data.Models.Alert>();
        result.Alert.Status.ShouldBe(AlertStatus.Open);
        existingAlerts.ShouldNotContain(result.Alert);
    }

    [Fact]
    public async Task ReportAdded_WhenAddingToGroupWithNoAlertAndMeetingThreshold_ShouldAddAlertReportEntities()
    {
        //arrange
        _testData.WhenAddingToGroupWithNoAlertAndMeetingThreshold.GenerateData().AddToDbContext();
        var reportBeingAdded = _testData.WhenAddingToGroupWithNoAlertAndMeetingThreshold.EntityData.Reports.FirstOrDefault();
        var existingAlerts = _testData.WhenAddingToGroupWithNoAlertAndMeetingThreshold.EntityData.Alerts;

        //act
        var result = await _alertService.ReportAdded(reportBeingAdded);

        //assert
        await _nyssContextMock.AlertReports.Received(1).AddRangeAsync(Arg.Is<IEnumerable<AlertReport>>(list =>
            list.Count() == 3
            && list.Any(ar => ar.Alert == result.Alert && ar.Report == reportBeingAdded)
            && list.All(ar => ar.Alert == result.Alert)
        ));
    }

    [Fact]
    public async Task ReportAdded_WhenAddingToGroupWithNoAlertAndMeetingThreshold_ShouldSaveChanges2Times()
    {
        //arrange
        _testData.WhenAddingToGroupWithNoAlertAndMeetingThreshold.GenerateData().AddToDbContext();
        var reportBeingAdded = _testData.WhenAddingToGroupWithNoAlertAndMeetingThreshold.EntityData.Reports.FirstOrDefault();

        //act
        var result = await _alertService.ReportAdded(reportBeingAdded);

        //assert
        await _nyssContextMock.Received(2).SaveChangesAsync();
    }

    [Fact]
    public async Task ReportAdded_WhenAddingToGroupWithAnExistingAlert_ShouldReturnAlertAndFlagToNotifyNewSupervisors()
    {
        //arrange
        var testData = new AlertServiceTestData(_nyssContextInMemoryMock);
        testData.WhenAddingToGroupWithAnExistingAlert.GenerateData().AddToDbContext(useInMemoryDb: true);
        var reportBeingAdded = testData.WhenAddingToGroupWithAnExistingAlert.EntityData.Reports.Single(r => r.Status == ReportStatus.New);
        var alertService = new AlertService(
            _nyssContextInMemoryMock,
            _reportLabelingServiceMock,
            _loggerAdapterMock,
            _alertNotificationServiceMock
        );

        //act
        var result = await alertService.ReportAdded(reportBeingAdded);

        //assert
        result.Alert.ShouldBeOfType<Data.Models.Alert>();
        result.IsExistingAlert.ShouldBeTrue();
    }

    [Fact]
    public async Task ReportAdded_WhenAddingToGroupWithAnExistingAlert_ReportStatusShouldBeChangedToPending()
    {
        //arrange
        var testData = new AlertServiceTestData(_nyssContextInMemoryMock);
        testData.WhenAddingToGroupWithAnExistingAlert.GenerateData().AddToDbContext(useInMemoryDb: true);
        var reportBeingAdded = testData.WhenAddingToGroupWithAnExistingAlert.EntityData.Reports.Single(r => r.Status == ReportStatus.New);
        var alertService = new AlertService(
            _nyssContextInMemoryMock,
            _reportLabelingServiceMock,
            _loggerAdapterMock,
            _alertNotificationServiceMock
        );

        //act
        var result = await alertService.ReportAdded(reportBeingAdded);

        //assert
        reportBeingAdded.Status.ShouldBe(ReportStatus.Pending);
    }


    [Fact]
    public async Task ReportAdded_WhenAddingToGroupWithAnExistingAlert_NoNewAlertShouldCreated()
    {
        //arrange
        var testData = new AlertServiceTestData(_nyssContextInMemoryMock);
        testData.WhenAddingToGroupWithAnExistingAlert.GenerateData().AddToDbContext(useInMemoryDb: true);
        var reportBeingAdded = testData.WhenAddingToGroupWithAnExistingAlert.EntityData.Reports.Single(r => r.Status == ReportStatus.New);
        var numberOfExistingAlerts = testData.WhenAddingToGroupWithAnExistingAlert.EntityData.Alerts.Count;

        var alertService = new AlertService(
            _nyssContextInMemoryMock,
            _reportLabelingServiceMock,
            _loggerAdapterMock,
            _alertNotificationServiceMock
        );

        //act
        var result = await alertService.ReportAdded(reportBeingAdded);

        //assert
        var numberOfAlerts = await _nyssContextInMemoryMock.Alerts.CountAsync();
        numberOfAlerts.ShouldBeEquivalentTo(numberOfExistingAlerts);
    }

    [Fact]
    public async Task ReportAdded_WhenAddingToGroupWithAnExistingAlert_ReportShouldBeAddedToAlert()
    {
        //arrange
        var testData = new AlertServiceTestData(_nyssContextInMemoryMock);
        testData.WhenAddingToGroupWithAnExistingAlert.GenerateData().AddToDbContext(useInMemoryDb: true);
        var reportBeingAdded = testData.WhenAddingToGroupWithAnExistingAlert.EntityData.Reports.Single(r => r.Status == ReportStatus.New);
        var existingAlert = testData.WhenAddingToGroupWithAnExistingAlert.EntityData.Alerts.Single();
        var alertService = new AlertService(
            _nyssContextInMemoryMock,
            _reportLabelingServiceMock,
            _loggerAdapterMock,
            _alertNotificationServiceMock
        );

        //act
        var result = await alertService.ReportAdded(reportBeingAdded);

        //assert
        var reportAddedToExistingAlert = await _nyssContextInMemoryMock.AlertReports.AnyAsync(ar => ar.Alert == existingAlert && ar.Report == reportBeingAdded);
        reportAddedToExistingAlert.ShouldBeTrue();
    }


    [Fact(Skip = "InMemory database does not support asserting number of calls to SaveChangesAsync()")]
    public async Task ReportAdded_WhenAddingToGroupWithAnExistingAlert_ShouldSaveChanges2Times()
    {
        //arrange
        _testData.WhenAddingToGroupWithAnExistingAlert.GenerateData().AddToDbContext();
        var reportBeingAdded = _testData.WhenAddingToGroupWithAnExistingAlert.EntityData.Reports.Single(r => r.Status == ReportStatus.New);

        //act
        var result = await _alertService.ReportAdded(reportBeingAdded);

        //assert
        await _nyssContextMock.Received(2).SaveChangesAsync();
    }

    [Fact]
    public async Task ReportAdded_WhenCountThresholdIsZero_ShouldNotCreateAnyNewAlert()
    {
        //arrange
        _testData.WhenCountThresholdIsZero.GenerateData().AddToDbContext();
        var reportBeingAdded = _testData.WhenCountThresholdIsZero.EntityData.Reports.Single(r => r.Status == ReportStatus.New);

        //act
        var result = await _alertService.ReportAdded(reportBeingAdded);

        //assert
        result.Alert.ShouldBeNull();
    }

    [Fact]
    public async Task ReportAdded_WhenThereAreTrainingReportsInLabelGroup_AddingTrainingReportShouldNotTriggerAlerts()
    {
        //arrange
        _testData.WhenThereAreTrainingReportsInLabelGroup.GenerateData().AddToDbContext();
        var reportBeingAdded = _testData.WhenThereAreTrainingReportsInLabelGroup.EntityData.Reports.Single(r => r.IsTraining);

        //act
        var result = await _alertService.ReportAdded(reportBeingAdded);

        //assert
        result.Alert.ShouldBeNull();
    }

    [Fact]
    public async Task ReportAdded_WhenThereAreTrainingReportsInLabelGroup_AddingRealReportShouldNotTriggerAlerts()
    {
        //arrange
        _testData.WhenThereAreTrainingReportsInLabelGroup.GenerateData().AddToDbContext();
        var reportBeingAdded = _testData.WhenThereAreTrainingReportsInLabelGroup.EntityData.Reports.First(r => !r.IsTraining);

        //act
        var result = await _alertService.ReportAdded(reportBeingAdded);

        //assert
        result.Alert.ShouldBeNull();
    }

    [Fact]
    public async Task ReportAdded_WhenNewSupervisorIsLinkedToAlert_ShouldReturnAlertWithListOfNewSupervisors()
    {
        // arrange
        var testData = new AlertServiceTestData(_nyssContextInMemoryMock);
        testData.WhenAReportIsAddedToExistingAlertLinkedToSupervisorNotAlreadyInTheAlert.GenerateData().AddToDbContext(useInMemoryDb: true);
        var reportBeingAdded = testData.WhenAReportIsAddedToExistingAlertLinkedToSupervisorNotAlreadyInTheAlert.EntityData.Reports.First(r => r.DataCollector.Id == 2);
        var supervisorAddedToAlert = testData.WhenAReportIsAddedToExistingAlertLinkedToSupervisorNotAlreadyInTheAlert.EntityData.Reports
            .Where(r => r.DataCollector.Id == 2)
            .Select(r => new SupervisorSmsRecipient
            {
                Name = r.DataCollector.Supervisor.Name,
                UserId = r.DataCollector.Supervisor.Id,
                PhoneNumber = r.DataCollector.Supervisor.PhoneNumber
            }).First();

        var alertService = new AlertService(
            _nyssContextInMemoryMock,
            _reportLabelingServiceMock,
            _loggerAdapterMock,
            _alertNotificationServiceMock
        );

        // act
        var result = await alertService.ReportAdded(reportBeingAdded);

        //assert
        result.Alert.ShouldBeOfType<Data.Models.Alert>();
        result.IsExistingAlert.ShouldBeTrue();
        result.SupervisorsAddedToExistingAlert.First().ShouldBeEquivalentTo(supervisorAddedToAlert);
    }

    [Fact]
    public async Task ReportAdded_WhenExistingEscalatedAlert_ShouldNotAddReport()
    {
        // Arrange
        _testData.WhenReportIsAddedAndEscalatedAlertExists.GenerateData().AddToDbContext();
        var reportBeingAdded = _testData.WhenReportIsAddedAndEscalatedAlertExists.EntityData.Reports.First(r => r.Status == ReportStatus.New);

        // Act
        var result = await _alertService.ReportAdded(reportBeingAdded);

        // Assert
        result.Alert.ShouldBeNull();
        result.IsExistingAlert.ShouldBeFalse();
    }

    [Fact]
    public async Task ReportAdded_WhenMeetingThresholdAndExistingEscalatedAlert_ShouldTriggerNewAlert()
    {
        // Arrange
        _testData.WhenReportsAreAddedMeetingThresholdAndEscalatedAlertExists.GenerateData().AddToDbContext();
        var reportBeingAdded = _testData.WhenReportsAreAddedMeetingThresholdAndEscalatedAlertExists.EntityData.Reports.First(r => r.Status == ReportStatus.New);

        // Act
        var result = await _alertService.ReportAdded(reportBeingAdded);

        // Assert
        result.Alert.ShouldNotBe(null);
        result.IsExistingAlert.ShouldBeFalse();
    }
}
