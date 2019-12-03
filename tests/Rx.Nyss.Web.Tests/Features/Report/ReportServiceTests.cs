﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MockQueryable.NSubstitute;
using NSubstitute;
using RX.Nyss.Data;
using RX.Nyss.Data.Concepts;
using RX.Nyss.Data.Models;
using RX.Nyss.Web.Configuration;
using RX.Nyss.Web.Features.Report;
using RX.Nyss.Web.Features.User;
using Shouldly;
using Xunit;

namespace Rx.Nyss.Web.Tests.Features.Report
{
    public class ReportServiceTests
    {
        private readonly IUserService _userService;
        private readonly IReportService _reportService;
        private readonly INyssContext _nyssContextMock;
        private readonly IConfig _config;
        private List<RX.Nyss.Data.Models.Report> _reports;
        private List<RX.Nyss.Data.Models.RawReport> _rawReports;


        private readonly int _rowsPerPage = 10;
        private readonly List<int> _reportIdsFromProject1 = Enumerable.Range(1, 13).ToList();
        private readonly List<int> _reportIdsFromProject2 = Enumerable.Range(14, 11).ToList();

        public ReportServiceTests()
        {
            _nyssContextMock = Substitute.For<INyssContext>();

            _config = Substitute.For<IConfig>();
            _config.PaginationRowsPerPage.Returns(_rowsPerPage);

            _userService = Substitute.For<IUserService>();
            _userService.GetUserApplicationLanguageCode(Arg.Any<string>()).Returns(Task.FromResult("en"));

            _reportService = new ReportService(_nyssContextMock, _userService, _config);

            ArrangeData();
        }


        private void ArrangeData()
        {
            var nationalSocieties = new List<RX.Nyss.Data.Models.NationalSociety>
            {
                new RX.Nyss.Data.Models.NationalSociety
                {
                    Id = 1,
                }
            };

            var alertRules = new List<AlertRule>
            {
                new AlertRule
                {
                    Id = 1,
                }
            };

            var contentLanguages = new List<ContentLanguage>
            {
                new ContentLanguage
                {
                    Id = 1,
                    DisplayName = "English",
                    LanguageCode = "en"
                }
            };

            var languageContents = new List<HealthRiskLanguageContent>
            {
                new HealthRiskLanguageContent
                {
                    Id = 1,
                    CaseDefinition = "case definition",
                    FeedbackMessage = "feedback message",
                    Name = "health risk name",
                    ContentLanguage = contentLanguages[0]
                }
            };

            var healthRisks = new List<RX.Nyss.Data.Models.HealthRisk>
            {
                new RX.Nyss.Data.Models.HealthRisk
                {
                    Id = 1,
                    HealthRiskType = HealthRiskType.Human,
                    HealthRiskCode = 1,
                    LanguageContents = languageContents,
                    AlertRule = alertRules[0]
                },
                new RX.Nyss.Data.Models.HealthRisk
                {
                    Id = 2,
                    HealthRiskType = HealthRiskType.Human,
                    HealthRiskCode = 1,
                    LanguageContents = languageContents,
                    AlertRule = alertRules[0]
                }
            };

            var projectHealthRisks = new List<ProjectHealthRisk>
            {
                new ProjectHealthRisk
                {
                    Id = 1,
                    HealthRisk = healthRisks[0],
                    HealthRiskId = healthRisks[0].Id
                },
                new ProjectHealthRisk
                {
                    Id = 2,
                    HealthRisk = healthRisks[1],
                    HealthRiskId = healthRisks[1].Id
                }
            };

            var regions = new List<Region>
            {
                new Region
                {
                    Id = 1,
                    Name = "Region1",
                    NationalSociety = nationalSocieties[0]
                }
            };

            var districts = new List<District>
            {
                new District()
                {
                    Id = 1,
                    Name = "District1",
                    Region = regions[0]
                }
            };

            var villages = new List<Village>
            {
                new Village()
                {
                    Id = 1,
                    Name = "Village1",
                    District = districts[0]
                }
            };

            var projects = new List<RX.Nyss.Data.Models.Project>
            {
                new RX.Nyss.Data.Models.Project
                {
                    Id = 1,
                    NationalSocietyId = nationalSocieties[0].Id,
                    NationalSociety = nationalSocieties[0],
                    ProjectHealthRisks = projectHealthRisks.Where(x => x.Id == 1).ToList(),
                    TimeZone = "UTC",
                },
                new RX.Nyss.Data.Models.Project
                {
                    Id = 2,
                    NationalSocietyId = nationalSocieties[0].Id,
                    NationalSociety = nationalSocieties[0],
                    ProjectHealthRisks = projectHealthRisks.Where(x => x.Id == 2).ToList(),
                    TimeZone = "UTC",
                }
            };

            var dataCollectors = new List<RX.Nyss.Data.Models.DataCollector>
            {
                new RX.Nyss.Data.Models.DataCollector
                {
                    Id = 1,
                    Project = projects[0],
                    Village = villages[0]
                },
                new RX.Nyss.Data.Models.DataCollector
                {
                    Id = 2,
                    Project = projects[1],
                    Village = villages[0]
                }
            };

            var reports1 = BuildReports(dataCollectors[0], _reportIdsFromProject1, dataCollectors[0].Project.ProjectHealthRisks.ToList()[0]);
            var rawReports1 = BuildRawReports(reports1);

            var reports2 = BuildReports(dataCollectors[1], _reportIdsFromProject2, dataCollectors[1].Project.ProjectHealthRisks.ToList()[0]);
            var rawReports2 = BuildRawReports(reports2);
            _reports = reports1.Concat(reports2).ToList();
            _rawReports = rawReports1.Concat(rawReports2).ToList();

            var nationalSocietiesDbSet = nationalSocieties.AsQueryable().BuildMockDbSet();
            var contentLanguageMockDbSet = contentLanguages.AsQueryable().BuildMockDbSet();
            var languageContentsMockDbSet = languageContents.AsQueryable().BuildMockDbSet();
            var healthRisksMockDbSet = healthRisks.AsQueryable().BuildMockDbSet();
            var alertRuleMockDbSet = alertRules.AsQueryable().BuildMockDbSet();
            var contentLanguagesMockDbSet = contentLanguages.AsQueryable().BuildMockDbSet();
            var projectsDbSet = projects.AsQueryable().BuildMockDbSet();
            var projectHealthRisksDbSet = projectHealthRisks.AsQueryable().BuildMockDbSet();
            var regionsDbSet = regions.AsQueryable().BuildMockDbSet();
            var districtsDbSet = districts.AsQueryable().BuildMockDbSet();
            var villagesDbSet = villages.AsQueryable().BuildMockDbSet();
            var dataCollectorsDbSet = dataCollectors.AsQueryable().BuildMockDbSet();
            var reportsDbSet = _reports.AsQueryable().BuildMockDbSet();
            var rawReportsDbSet = _rawReports.AsQueryable().BuildMockDbSet();

            _nyssContextMock.NationalSocieties.Returns(nationalSocietiesDbSet);
            _nyssContextMock.ContentLanguages.Returns(contentLanguageMockDbSet);
            _nyssContextMock.HealthRiskLanguageContents.Returns(languageContentsMockDbSet);
            _nyssContextMock.HealthRisks.Returns(healthRisksMockDbSet);
            _nyssContextMock.AlertRules.Returns(alertRuleMockDbSet);
            _nyssContextMock.ContentLanguages.Returns(contentLanguagesMockDbSet);
            _nyssContextMock.Projects.Returns(projectsDbSet);
            _nyssContextMock.ProjectHealthRisks.Returns(projectHealthRisksDbSet);
            _nyssContextMock.Regions.Returns(regionsDbSet);
            _nyssContextMock.Districts.Returns(districtsDbSet);
            _nyssContextMock.Villages.Returns(villagesDbSet);
            _nyssContextMock.DataCollectors.Returns(dataCollectorsDbSet);
            _nyssContextMock.Reports.Returns(reportsDbSet);
            _nyssContextMock.RawReports.Returns(rawReportsDbSet);

            _nyssContextMock.Projects.FindAsync(1).Returns(projects.Single(x => x.Id == 1));
            _nyssContextMock.Projects.FindAsync(2).Returns(projects.Single(x => x.Id == 2));
        }

        private static List<RX.Nyss.Data.Models.Report> BuildReports(RX.Nyss.Data.Models.DataCollector dataCollector, List<int> ids, ProjectHealthRisk projectHealthRisk)
        {
            var reports = ids
                .Select(i => new RX.Nyss.Data.Models.Report
                {
                    Id = i,
                    DataCollector =  dataCollector,
                    Status = ReportStatus.Pending,
                    ProjectHealthRisk =  projectHealthRisk,
                    ReportedCase = new ReportCase(),
                    CreatedAt = new DateTime(2020,1,1)
                })
                .ToList();
            return reports;
        }

        private static List<RX.Nyss.Data.Models.RawReport> BuildRawReports(List<RX.Nyss.Data.Models.Report> reports) =>
            reports.Select(r => new RawReport
                {
                    Id = r.Id,
                    Report = r,
                    ReportId = r.Id,
                    DataCollector = r.DataCollector,
                    ReceivedAt = r.ReceivedAt,
                })
                .ToList();

        [Fact]
        public async Task List_ShouldReturnPagedResultsFromSpecifiedProject()
        {
            //arrange
            _config.PaginationRowsPerPage.Returns(9999);

            //act
            var result = await _reportService.List(1, 1, "");

            //assert
            result.Value.Data.ShouldAllBe(x => _reportIdsFromProject1.Contains(x.Id));
        }

        [Fact]
        public async Task List_ShouldReturnNumberOfRowsCorrespondingToPageSize()
        {
            //arrange
            _config.PaginationRowsPerPage.Returns(13);

            //act
            var result = await _reportService.List(1, 1, "");

            //assert
            result.Value.Data.Count.ShouldBe(13);
        }

        [Fact]
        public async Task List_WhenSelectedLastPageThatHasLessRows_ShouldReturnLessRows()
        {
            //act
            var result = await _reportService.List(1, 2, "");

            //assert
            result.Value.Data.Count.ShouldBe(3);
        }
    }
}