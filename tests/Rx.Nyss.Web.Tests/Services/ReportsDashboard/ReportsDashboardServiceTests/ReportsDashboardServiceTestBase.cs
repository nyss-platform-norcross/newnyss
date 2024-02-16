using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.CodeAnalysis;
using MockQueryable.NSubstitute;
using NSubstitute;
using RX.Nyss.Common.Utils;
using RX.Nyss.Data;
using RX.Nyss.Data.Concepts;
using RX.Nyss.Data.Models;
using RX.Nyss.Web.Configuration;
using RX.Nyss.Web.Features.Reports;
using RX.Nyss.Web.Services.ReportsDashboard;
using Project = RX.Nyss.Data.Models.Project;

namespace RX.Nyss.Web.Tests.Services.ReportsDashboard.ReportsDashboardServiceTests;

public class ReportsDashboardServiceTestBase
{
    protected readonly INyssContext _nyssContext;
    private readonly INyssWebConfig _config;
    private readonly IReportService _reportService;
    private readonly IReportsDashboardService _reportsDashboardService;

    public ReportsDashboardServiceTestBase()
    {
        IDateTimeProvider dateTimeProvider = new DateTimeProvider();

        _nyssContext = GetBaseNyssContext();
        _config = Substitute.For<INyssWebConfig>();

        _reportService = Substitute.For<IReportService>();
        _reportsDashboardService = new ReportsDashboardService(_nyssContext);
    }

    private INyssContext GetBaseNyssContext()
    {
        var nyssContext = Substitute.For<INyssContext>();

        var nationalSocieties = new List<NationalSociety> { new NationalSociety { Id = 1 }, new NationalSociety { Id = 2 } };

        var projects = new List<Project>
            {
                new Project // Project 1 in National Society 1
                {
                    Id = 1,
                    NationalSocietyId = nationalSocieties[0].Id,
                    NationalSociety = nationalSocieties[0]
                },
                new Project // Project 2 in National Society 1
                {
                    Id = 2,
                    NationalSocietyId = nationalSocieties[0].Id,
                    NationalSociety = nationalSocieties[0]
                },
                new Project // Project 1 in National Society 2
                {
                    Id = 3,
                    NationalSocietyId = nationalSocieties[1].Id,
                    NationalSociety = nationalSocieties[1]
                }
            };

        var users = new List<User> { new SupervisorUser { Id = 1 } };

        var userNationalSocieties = new List<UserNationalSociety>
            {
                new UserNationalSociety
                {
                    NationalSociety = nationalSocieties[0],
                    NationalSocietyId = nationalSocieties[0].Id,
                    User = users[0],
                    UserId = users[0].Id
                }
            };

        var supervisorUserProjects = new List<SupervisorUserProject>
            {
                new SupervisorUserProject
                {
                    SupervisorUser = (SupervisorUser)users[0],
                    SupervisorUserId = users[0].Id,
                    Project = projects[0],
                    ProjectId = projects[0].Id
                }
            };

        var alertRules = new List<AlertRule>
            {
                new AlertRule
                {
                    Id = 1,
                    CountThreshold = 1
                },
                new AlertRule
                {
                    Id = 2,
                    CountThreshold = 2
                },
            };

        var healthRisks = new List<HealthRisk>
            {
                new HealthRisk // Health Risk with count Threshold 1
                {
                    Id = 1,
                    AlertRule = alertRules[0],
                    HealthRiskType = HealthRiskType.Human
                },
                new HealthRisk // Health Risk with count Threshold 2
                {
                    Id = 2,
                    AlertRule = alertRules[1],
                    HealthRiskType = HealthRiskType.Human
                }
            };

        var projectHealthRisks = new List<ProjectHealthRisk>
            {
                new ProjectHealthRisk // HealthRisk 1 in Project 1 in National Society 1
                {
                    Id = 1,
                    AlertRule = alertRules[0],
                    Project = projects[0],
                    HealthRisk = healthRisks[0],
                    HealthRiskId = healthRisks[0].Id,
                    Reports = new List<Report>()
                },
                new ProjectHealthRisk // HealthRisk 2 in Project 1 in National Society 1
                {
                    Id = 2,
                    AlertRule = alertRules[0],
                    Project = projects[0],
                    HealthRisk = healthRisks[1],
                    HealthRiskId = healthRisks[1].Id,
                    Reports = new List<Report>()
                },
                new ProjectHealthRisk // HealthRisk 1 in Project 2 in National Society 1
                {
                    Id = 3,
                    AlertRule = alertRules[0],
                    Project = projects[1],
                    HealthRisk = healthRisks[0],
                    HealthRiskId = healthRisks[0].Id,
                    Reports = new List<Report>()
                },
                new ProjectHealthRisk // HealthRisk 1 in Project 2 in National Society 1
                {
                    Id = 4,
                    AlertRule = alertRules[0],
                    Project = projects[2],
                    HealthRisk = healthRisks[0],
                    HealthRiskId = healthRisks[0].Id,
                    Reports = new List<Report>()
                }
            };

        var reports = new List<Report>();

        var rawReports = new List<RawReport>();

        var alerts = new List<Alert>();

        var nationalSocietiesDbSet = nationalSocieties.AsQueryable().BuildMockDbSet();
        var healthRisksDbSet = healthRisks.AsQueryable().BuildMockDbSet();
        var alertRulesDbSet = alertRules.AsQueryable().BuildMockDbSet();
        var projectsDbSet = projects.AsQueryable().BuildMockDbSet();
        var projectHealthRisksDbSet = projectHealthRisks.AsQueryable().BuildMockDbSet();
        var reportsDbSet = reports.AsQueryable().BuildMockDbSet();
        var rawReportsDbSet = rawReports.AsQueryable().BuildMockDbSet();
        var usersDbSet = users.AsQueryable().BuildMockDbSet();
        var supervisorUserProjectsDbSet = supervisorUserProjects.AsQueryable().BuildMockDbSet();
        var userNationalSocietiesDbSet = userNationalSocieties.AsQueryable().BuildMockDbSet();
        var alertsDbSet = alerts.AsQueryable().BuildMockDbSet();

        nyssContext.NationalSocieties.Returns(nationalSocietiesDbSet);
        nyssContext.HealthRisks.Returns(healthRisksDbSet);
        nyssContext.AlertRules.Returns(alertRulesDbSet);
        nyssContext.Projects.Returns(projectsDbSet);
        nyssContext.ProjectHealthRisks.Returns(projectHealthRisksDbSet);
        nyssContext.Reports.Returns(reportsDbSet);
        nyssContext.RawReports.Returns(rawReportsDbSet);
        nyssContext.Users.Returns(usersDbSet);
        nyssContext.SupervisorUserProjects.Returns(supervisorUserProjectsDbSet);
        nyssContext.UserNationalSocieties.Returns(userNationalSocietiesDbSet);
        nyssContext.Alerts.Returns(alertsDbSet);

        return nyssContext;
    }

    public void ArrangeTwoKeptReportsInEscalatedAlertsInTwoDifferentNationalSocieties()
    {
        var projectHealthRisks = _nyssContext.ProjectHealthRisks.ToList();

        var reports = new List<Report>
        {
            new Report
            {
                Id = 1,
                ReportType = ReportType.Single,
                Status = ReportStatus.Accepted,
                IsTraining = false,
                ReportedCase = new ReportCase
                {
                    CountMalesAtLeastFive = 1,
                },
                ProjectHealthRisk = projectHealthRisks[0], // Health risk 1 in project 1 in national society 1
                ReceivedAt = new DateTime(2024, 1, 1, 0, 0, 0)
            },
            new Report
            {
                Id = 2,
                ReportType = ReportType.Single,
                Status = ReportStatus.Accepted,
                IsTraining = false,
                ReportedCase = new ReportCase
                {
                    CountMalesAtLeastFive = 1,
                },
                ProjectHealthRisk = projectHealthRisks[3], // Health risk 1 in project 1 in national society 2
                ReceivedAt = new DateTime(2024, 1, 1, 0, 0, 0)
            },
        };

        var alertReports = new List<AlertReport>
        {
            new AlertReport
            {
                ReportId = 1,
                Report = reports[0],
            },
            new AlertReport
            {
                ReportId = 2,
                Report = reports[1]
            }
        };

        var alerts = new List<Alert>
        {
            new Alert
            {
                Id = 1,
                Status = AlertStatus.Escalated,
                AlertReports = alertReports.GetRange(0, 1),
                ProjectHealthRisk = projectHealthRisks[0], // Health risk 1 in project 1 in national society 1
            },
            new Alert
            {
                Id = 2,
                Status = AlertStatus.Escalated,
                AlertReports = alertReports.GetRange(1, 1),
                ProjectHealthRisk = projectHealthRisks[3], // Health risk 1 in project 1 in national society 2
            }
        };

        var reportsDbSet = reports.AsQueryable().BuildMockDbSet();
        var alertReportDbSet = alertReports.AsQueryable().BuildMockDbSet();
        var alertsDbSet = alerts.AsQueryable().BuildMockDbSet();

        _nyssContext.Reports.Returns(reportsDbSet);
        _nyssContext.AlertReports.Returns(alertReportDbSet);
        _nyssContext.Alerts.Returns(alertsDbSet);
    }

    public void ArrangeTwoKeptReportsInEscalatedAlertsInTwoDifferentProjectsInTheSameNationalSociety()
    {
        var projectHealthRisks = _nyssContext.ProjectHealthRisks.ToList();

        var reports = new List<Report>
        {
            new Report
            {
                Id = 1,
                ReportType = ReportType.Single,
                Status = ReportStatus.Accepted,
                IsTraining = false,
                ReportedCase = new ReportCase
                {
                    CountMalesAtLeastFive = 1,
                },
                ProjectHealthRisk = projectHealthRisks[0], // Health risk 1 in project 1 in national society 1
                ReceivedAt = new DateTime(2024, 1, 1, 0, 0, 0)
            },
            new Report
            {
                Id = 2,
                ReportType = ReportType.Single,
                Status = ReportStatus.Accepted,
                IsTraining = false,
                ReportedCase = new ReportCase
                {
                    CountMalesAtLeastFive = 1,
                },
                ProjectHealthRisk = projectHealthRisks[2], // Health risk 1 in project 2 in national society 1
                ReceivedAt = new DateTime(2024, 1, 1, 0, 0, 0)
            },
        };

        var alertReports = new List<AlertReport>
        {
            new AlertReport
            {
                ReportId = 1,
                Report = reports[0],
            },
            new AlertReport
            {
                ReportId = 2,
                Report = reports[1]
            }
        };

        var alerts = new List<Alert>
        {
            new Alert
            {
                Id = 1,
                Status = AlertStatus.Escalated,
                AlertReports = alertReports.GetRange(0, 1),
                ProjectHealthRisk = projectHealthRisks[0], // Health risk 1 in project 1 in national society 1
            },
            new Alert
            {
                Id = 2,
                Status = AlertStatus.Escalated,
                AlertReports = alertReports.GetRange(1, 1),
                ProjectHealthRisk = projectHealthRisks[2], // Health risk 1 in project 2 in national society 1
            }
        };

        var reportsDbSet = reports.AsQueryable().BuildMockDbSet();
        var alertReportDbSet = alertReports.AsQueryable().BuildMockDbSet();
        var alertsDbSet = alerts.AsQueryable().BuildMockDbSet();

        _nyssContext.Reports.Returns(reportsDbSet);
        _nyssContext.AlertReports.Returns(alertReportDbSet);
        _nyssContext.Alerts.Returns(alertsDbSet);
    }

}
