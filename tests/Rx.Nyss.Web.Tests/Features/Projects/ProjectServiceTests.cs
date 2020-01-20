﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MockQueryable.NSubstitute;
using NSubstitute;
using NSubstitute.ReturnsExtensions;
using RX.Nyss.Common.Utils.Logging;
using RX.Nyss.Common.Utils;
using RX.Nyss.Common.Utils.DataContract;
using RX.Nyss.Data;
using RX.Nyss.Data.Concepts;
using RX.Nyss.Data.Models;
using RX.Nyss.Web.Features.Alerts.Dto;
using RX.Nyss.Web.Features.Projects;
using RX.Nyss.Web.Features.Projects.Dto;
using RX.Nyss.Web.Services.Authorization;
using Shouldly;
using Xunit;

namespace RX.Nyss.Web.Tests.Features.Projects
{
    public class ProjectServiceTests
    {
        private readonly IProjectService _projectService;
        private readonly INyssContext _nyssContextMock;
        private readonly IDateTimeProvider _dateTimeProvider;

        public ProjectServiceTests()
        {
            _nyssContextMock = Substitute.For<INyssContext>();
            var loggerAdapterMock = Substitute.For<ILoggerAdapter>();
            _dateTimeProvider = Substitute.For<IDateTimeProvider>();
            var authorizationService = Substitute.For<IAuthorizationService>();
            _projectService = new ProjectService(_nyssContextMock, loggerAdapterMock, _dateTimeProvider, authorizationService);
        }

        [Fact]
        public async Task ListProjects_WhenNationalSocietyIsProvided_ShouldFilterResults()
        {
            // Arrange
            const int nationalSocietyId = 1;

            var project = GenerateExemplaryProjects(nationalSocietyId);

            var projectsMockDbSet = project.AsQueryable().BuildMockDbSet();
            _nyssContextMock.Projects.Returns(projectsMockDbSet);

            var currentDate = new DateTime(2019, 1, 1);
            _dateTimeProvider.UtcNow.Returns(currentDate);

            // Act
            var result = await _projectService.ListProjects(nationalSocietyId);

            // Assert
            result.IsSuccess.ShouldBeTrue();
            result.Value.Count.ShouldBe(2);
            result.Value.Select(x => x.Id).ShouldBe(new[] { 1, 3 });

            result.Value[0].Id.ShouldBe(1);
            result.Value[0].Name.ShouldBe("1");
            result.Value[0].StartDate.ShouldBe(new DateTime(2019, 1, 1));
            result.Value[0].EndDate.ShouldBeNull();
            result.Value[0].TotalReportCount.ShouldBe(1);
            result.Value[0].EscalatedAlertCount.ShouldBe(0);
            result.Value[0].TotalDataCollectorCount.ShouldBe(1);
            result.Value[0].SupervisorCount.ShouldBe(0);

            result.Value[1].Id.ShouldBe(3);
            result.Value[1].Name.ShouldBe("3");
            result.Value[1].StartDate.ShouldBe(new DateTime(2019, 1, 1));
            result.Value[1].EndDate.ShouldBeNull();
            result.Value[1].TotalReportCount.ShouldBe(3);
            result.Value[1].EscalatedAlertCount.ShouldBe(2);
            result.Value[1].TotalDataCollectorCount.ShouldBe(2);
            result.Value[1].SupervisorCount.ShouldBe(0);
        }

        [Fact]
        public async Task GetProject_WhenProjectExists_ShouldReturnSuccess()
        {
            // Arrange
            const int existingProjectId = 2;

            var project = new[]
            {
                new Project
                {
                    Id = 1,
                    NationalSocietyId = 1,
                    NationalSociety = new NationalSociety
                    {
                        ContentLanguage = new ContentLanguage
                        {
                            Id = 2
                        }
                    },
                    ProjectHealthRisks = new List<ProjectHealthRisk>(),
                    EmailAlertRecipients = new List<EmailAlertRecipient>(),
                    SmsAlertRecipients = new List<SmsAlertRecipient>()
                },
                new Project
                {
                    Id = existingProjectId,
                    Name = "Name",
                    TimeZone = "Time Zone",
                    State = ProjectState.Open,
                    NationalSocietyId = 2,
                    NationalSociety = new NationalSociety
                    {
                        ContentLanguage = new ContentLanguage
                        {
                            Id = 1
                        }
                    },
                    ProjectHealthRisks = new[]
                    {
                        new ProjectHealthRisk
                        {
                            Id = 1,
                            HealthRiskId = 10,
                            HealthRisk = new HealthRisk
                            {
                                HealthRiskCode = 100,
                                HealthRiskType = HealthRiskType.Human,
                                LanguageContents = new[]
                                {
                                    new HealthRiskLanguageContent
                                    {
                                        Name = "HealthRiskName",
                                        ContentLanguage = new ContentLanguage
                                        {
                                            Id = 1
                                        }
                                    }
                                }
                            },
                            CaseDefinition = "CaseDefinition",
                            FeedbackMessage = "FeedbackMessage",
                            AlertRule = new AlertRule
                            {
                                CountThreshold = 1,
                                DaysThreshold = 2,
                                KilometersThreshold = 3
                            },
                            Reports = new[]
                            {
                                new Report()
                            }
                        }
                    },
                    EmailAlertRecipients = new[]
                    {
                        new EmailAlertRecipient
                        {
                            Id = 1,
                            EmailAddress = "user@domain.com"
                        }
                    },
                    SmsAlertRecipients = new[]
                    {
                        new SmsAlertRecipient
                        {
                            Id = 1,
                            PhoneNumber = "+48123456789"
                        }
                    }
                }
            };

            var projectsMockDbSet = project.AsQueryable().BuildMockDbSet();
            _nyssContextMock.Projects.Returns(projectsMockDbSet);

            var healthRisks = Array.Empty<HealthRisk>();
            var healthRisksMockDbSet = healthRisks.AsQueryable().BuildMockDbSet();
            _nyssContextMock.HealthRisks.Returns(healthRisksMockDbSet);

            // Act
            var result = await _projectService.GetProject(existingProjectId);

            // Assert
            result.IsSuccess.ShouldBeTrue();
            result.Value.Id.ShouldBe(existingProjectId);
            result.Value.Name.ShouldBe("Name");
            result.Value.TimeZoneId.ShouldBe("Time Zone");
            result.Value.State.ShouldBe(ProjectState.Open);
            result.Value.ProjectHealthRisks.Count().ShouldBe(1);
            result.Value.ProjectHealthRisks.ElementAt(0).Id.ShouldBe(1);
            result.Value.ProjectHealthRisks.ElementAt(0).HealthRiskId.ShouldBe(10);
            result.Value.ProjectHealthRisks.ElementAt(0).HealthRiskCode.ShouldBe(100);
            result.Value.ProjectHealthRisks.ElementAt(0).HealthRiskName.ShouldBe("HealthRiskName");
            result.Value.ProjectHealthRisks.ElementAt(0).CaseDefinition.ShouldBe("CaseDefinition");
            result.Value.ProjectHealthRisks.ElementAt(0).FeedbackMessage.ShouldBe("FeedbackMessage");
            result.Value.ProjectHealthRisks.ElementAt(0).AlertRuleCountThreshold.ShouldBe(1);
            result.Value.ProjectHealthRisks.ElementAt(0).AlertRuleDaysThreshold.ShouldBe(2);
            result.Value.ProjectHealthRisks.ElementAt(0).AlertRuleKilometersThreshold.ShouldBe(3);
            result.Value.ProjectHealthRisks.ElementAt(0).ContainsReports.ShouldBe(true);
            result.Value.EmailAlertRecipients.Count().ShouldBe(1);
            result.Value.EmailAlertRecipients.ElementAt(0).Id.ShouldBe(1);
            result.Value.EmailAlertRecipients.ElementAt(0).Email.ShouldBe("user@domain.com");
            result.Value.SmsAlertRecipients.Count().ShouldBe(1);
            result.Value.SmsAlertRecipients.ElementAt(0).Id.ShouldBe(1);
            result.Value.SmsAlertRecipients.ElementAt(0).PhoneNumber.ShouldBe("+48123456789");
        }

        [Fact]
        public async Task GetProject_WhenProjectDoesNotExist_ShouldReturnError()
        {
            // Arrange
            const int nonExistentProjectId = 0;

            var project = new[] {
                new Project
                {
                    Id = 1,
                    ProjectHealthRisks = new List<ProjectHealthRisk>(),
                    EmailAlertRecipients = new List<EmailAlertRecipient>(),
                    SmsAlertRecipients = new List<SmsAlertRecipient>(),
                    NationalSociety = new NationalSociety
                    {
                        ContentLanguage = new ContentLanguage { Id = 1 }
                    }
                }
            };

            var projectsMockDbSet = project.AsQueryable().BuildMockDbSet();
            _nyssContextMock.Projects.Returns(projectsMockDbSet);

            // Act
            var result = await _projectService.GetProject(nonExistentProjectId);

            // Assert
            result.IsSuccess.ShouldBeFalse();
            result.Message.Key.ShouldBe(ResultKey.Project.ProjectDoesNotExist);
        }

        [Fact]
        public async Task AddProject_ForCorrectData_ShouldReturnSuccess()
        {
            // Arrange
            const int nationalSocietyId = 1;

            var nationalSocieties = new[]
            {
                new NationalSociety {Id = nationalSocietyId, Name = "National Society"}
            };

            var nationalSocietiesMockDbSet = nationalSocieties.AsQueryable().BuildMockDbSet();
            _nyssContextMock.NationalSocieties.Returns(nationalSocietiesMockDbSet);

            const int healthRiskId = 1;

            var healthRisks = new[]
            {
                new HealthRisk {Id = healthRiskId}
            };

            var healthRisksMockDbSet = healthRisks.AsQueryable().BuildMockDbSet();
            _nyssContextMock.HealthRisks.Returns(healthRisksMockDbSet);

            var startDate = new DateTime(2019, 1, 1);
            _dateTimeProvider.UtcNow.Returns(startDate);

            var project = new[]
            {
                new Project
                {
                    Id = 1,
                    Name = "Name",
                    TimeZone = "Time Zone",
                    NationalSocietyId = nationalSocietyId,
                    State = ProjectState.Open
                }
            };

            var projectsMockDbSet = project.AsQueryable().BuildMockDbSet();
            _nyssContextMock.Projects.Returns(projectsMockDbSet);

            var projectRequestDto = new ProjectRequestDto
            {
                Name = "New Project",
                TimeZoneId = "Time Zone",
                HealthRisks = new[]
                {
                    new ProjectHealthRiskRequestDto
                    {
                        HealthRiskId = healthRiskId,
                        AlertRuleCountThreshold = 1,
                        AlertRuleDaysThreshold = 2,
                        AlertRuleKilometersThreshold = 3,
                        CaseDefinition = "CaseDefinition",
                        FeedbackMessage = "FeedbackMessage"
                    }
                },
                EmailAlertRecipients = new[]
                {
                    new EmailAlertRecipientDto
                    {
                        Email = "user@domain.com"
                    }
                },
                SmsAlertRecipients = new[]
                {
                    new SmsAlertRecipientDto
                    {
                        PhoneNumber = "+48123456789"
                    }
                }
            };

            // Act
            var result = await _projectService.AddProject(nationalSocietyId, projectRequestDto);

            // Assert
            await _nyssContextMock.Projects.Received(1).AddAsync(
                Arg.Is<Project>(p =>
                    p.Name == "New Project" &&
                    p.TimeZone == "Time Zone" &&
                    p.StartDate == startDate &&
                    p.EndDate == null &&
                    p.ProjectHealthRisks.Any(phr =>
                        phr.HealthRiskId == healthRiskId &&
                        phr.CaseDefinition == "CaseDefinition" &&
                        phr.FeedbackMessage == "FeedbackMessage" &&
                        phr.AlertRule.CountThreshold == 1 &&
                        phr.AlertRule.DaysThreshold == 2 &&
                        phr.AlertRule.KilometersThreshold == 3) &&
                    p.EmailAlertRecipients.Any(ear => ear.EmailAddress == "user@domain.com") &&
                    p.SmsAlertRecipients.Any(sar => sar.PhoneNumber == "+48123456789")));
            await _nyssContextMock.Received(1).SaveChangesAsync();
            result.IsSuccess.ShouldBeTrue();
            result.Message.Key.ShouldBe(ResultKey.Project.SuccessfullyAdded);
        }

        [Fact]
        public async Task AddProject_WhenNationalSocietyDoesNotExist_ShouldReturnError()
        {
            // Arrange
            const int nonExistentNationalSocietyId = 0;

            var nationalSocieties = new[] { new NationalSociety { Id = 1, Name = "National Society" } };

            var nationalSocietiesMockDbSet = nationalSocieties.AsQueryable().BuildMockDbSet();
            _nyssContextMock.NationalSocieties.Returns(nationalSocietiesMockDbSet);

            var projectRequestDto = new ProjectRequestDto { Name = "New Project", TimeZoneId = "Time Zone" };

            // Act
            var result = await _projectService.AddProject(nonExistentNationalSocietyId, projectRequestDto);

            // Assert
            await _nyssContextMock.Projects.DidNotReceive().AddAsync(Arg.Any<Project>());
            await _nyssContextMock.DidNotReceive().SaveChangesAsync();
            result.IsSuccess.ShouldBeFalse();
            result.Message.Key.ShouldBe(ResultKey.Project.NationalSocietyDoesNotExist);
        }

        [Fact]
        public async Task AddProject_WhenHealthRiskDoesNotExist_ShouldReturnError()
        {
            // Arrange
            const int nationalSocietyId = 1;

            var nationalSocieties = new[]
            {
                new NationalSociety {Id = nationalSocietyId, Name = "National Society"}
            };

            var nationalSocietiesMockDbSet = nationalSocieties.AsQueryable().BuildMockDbSet();
            _nyssContextMock.NationalSocieties.Returns(nationalSocietiesMockDbSet);

            const int nonExistentHealthRiskId = 0;

            var healthRisks = new[]
            {
                new HealthRisk {Id = 1}
            };

            var healthRisksMockDbSet = healthRisks.AsQueryable().BuildMockDbSet();
            _nyssContextMock.HealthRisks.Returns(healthRisksMockDbSet);

            var projectRequestDto = new ProjectRequestDto
            {
                Name = "New Project",
                TimeZoneId = "Time Zone",
                HealthRisks = new[]
                {
                    new ProjectHealthRiskRequestDto
                    {
                        HealthRiskId = nonExistentHealthRiskId
                    }
                }
            };

            // Act
            var result = await _projectService.AddProject(nationalSocietyId, projectRequestDto);

            // Assert
            await _nyssContextMock.Projects.DidNotReceive().AddAsync(Arg.Any<Project>());
            await _nyssContextMock.DidNotReceive().SaveChangesAsync();
            result.IsSuccess.ShouldBeFalse();
            result.Message.Key.ShouldBe(ResultKey.Project.HealthRiskDoesNotExist);
        }

        [Fact(Skip = "Currently, AddProject does not throw ResultException")]
        public async Task AddProject_WhenExceptionIsThrown_ShouldReturnError()
        {
            // Arrange
            const int nationalSocietyId = 1;

            var nationalSocieties = new[]
            {
                new NationalSociety {Id = nationalSocietyId, Name = "National Society"}
            };

            var nationalSocietiesMockDbSet = nationalSocieties.AsQueryable().BuildMockDbSet();
            _nyssContextMock.NationalSocieties.Returns(nationalSocietiesMockDbSet);

            var project = new[]
            {
                new Project
                {
                    Id = 1,
                    Name = "Name",
                    TimeZone = "Time Zone",
                    NationalSocietyId = nationalSocietyId,
                    State = ProjectState.Open
                }
            };

            var projectsMockDbSet = project.AsQueryable().BuildMockDbSet();
            _nyssContextMock.Projects.Returns(projectsMockDbSet);

            var projectRequestDto = new ProjectRequestDto { Name = "New Project", TimeZoneId = "Time Zone" };

            // Act
            var result = await _projectService.AddProject(nationalSocietyId, projectRequestDto);

            // Assert
            await _nyssContextMock.Projects.Received(1).AddAsync(
                Arg.Is<Project>(p =>
                    p.Name == "New Project" &&
                    p.TimeZone == "Time Zone"));
            await _nyssContextMock.DidNotReceive().SaveChangesAsync();
            result.IsSuccess.ShouldBeFalse();
            result.Message.Key.ShouldBe(ResultKey.UnexpectedError);
        }

        [Fact]
        public async Task UpdateProject_WhenProjectExists_ShouldReturnSuccess()
        {
            // Arrange
            const int projectId = 1;

            var nationalSocieties = new[] { new NationalSociety { Id = 1, Name = "National Society" } };

            var nationalSocietiesMockDbSet = nationalSocieties.AsQueryable().BuildMockDbSet();
            _nyssContextMock.NationalSocieties.Returns(nationalSocietiesMockDbSet);

            var project = new[]
            {
                new Project
                {
                    Id = projectId,
                    Name = "Name",
                    TimeZone = "Time Zone",
                    NationalSocietyId = 1,
                    State = ProjectState.Open,
                    ProjectHealthRisks = new List<ProjectHealthRisk>
                    {
                        new ProjectHealthRisk
                        {
                            Project = new Project(),
                            Id = 1,
                            CaseDefinition = "Case Definition 1",
                            FeedbackMessage = "Feedback Message 2",
                            AlertRule = new AlertRule
                            {
                                CountThreshold = 1,
                                DaysThreshold = 2,
                                KilometersThreshold = 3
                            },
                            Reports = new List<Report>()
                        },
                        new ProjectHealthRisk
                        {
                            Id = 2,
                            Project = new Project(),
                            CaseDefinition = "Case Definition 2",
                            FeedbackMessage = "Feedback Message 2",
                            AlertRule = new AlertRule
                            {
                                CountThreshold = 1,
                                DaysThreshold = 2,
                                KilometersThreshold = 3
                            },
                            Reports = new List<Report>()
                        }
                    },
                    EmailAlertRecipients = new List<EmailAlertRecipient>
                    {
                        new EmailAlertRecipient
                        {
                            Id = 1,
                            EmailAddress = "user1@domain.com"
                        },
                        new EmailAlertRecipient
                        {
                            Id = 2,
                            EmailAddress = "user2@domain.com"
                        }
                    },
                    SmsAlertRecipients = new List<SmsAlertRecipient>
                    {
                        new SmsAlertRecipient
                        {
                            Id = 1,
                            PhoneNumber = "+48111111111"
                        },
                        new SmsAlertRecipient
                        {
                            Id = 2,
                            PhoneNumber = "+48222222222"
                        }
                    }
                }
            };

            var projectsMockDbSet = project.AsQueryable().BuildMockDbSet();
            _nyssContextMock.Projects.Returns(projectsMockDbSet);
            _nyssContextMock.Projects.FindAsync(projectId).Returns(project[0]);

            var projectHealthRisksMockDbSet = project.SelectMany(p => p.ProjectHealthRisks).AsQueryable().BuildMockDbSet();
            _nyssContextMock.ProjectHealthRisks.Returns(projectHealthRisksMockDbSet);

            var projectRequestDto = new ProjectRequestDto
            {
                Name = "Updated Project",
                TimeZoneId = "Updated Time Zone",
                HealthRisks = new List<ProjectHealthRiskRequestDto>
                {
                    new ProjectHealthRiskRequestDto
                    {
                        Id = 2,
                        HealthRiskId = 1,
                        CaseDefinition = "Updated Case Definition 2",
                        FeedbackMessage = "Updated Feedback Message 2",
                        AlertRuleCountThreshold = 2,
                        AlertRuleDaysThreshold = 3,
                        AlertRuleKilometersThreshold = 4
                    },
                    new ProjectHealthRiskRequestDto
                    {
                        Id = null,
                        HealthRiskId = 2,
                        CaseDefinition = "Case Definition 3",
                        FeedbackMessage = "Feedback Message 3",
                        AlertRuleCountThreshold = 3,
                        AlertRuleDaysThreshold = 4,
                        AlertRuleKilometersThreshold = 5
                    }
                },
                EmailAlertRecipients = new List<EmailAlertRecipientDto>
                {
                    new EmailAlertRecipientDto
                    {
                        Id = 2,
                        Email = "user2-updated@domain.com"
                    },
                    new EmailAlertRecipientDto
                    {
                        Id = null,
                        Email = "user3@domain.com"
                    }
                },
                SmsAlertRecipients = new List<SmsAlertRecipientDto>
                {
                    new SmsAlertRecipientDto
                    {
                        Id = 2,
                        PhoneNumber = "+48999999999"
                    },
                    new SmsAlertRecipientDto
                    {
                        Id = null,
                        PhoneNumber = "+48000000000"
                    }
                }
            };

            var emailAlertRecipients = new List<EmailAlertRecipient>
            {
                new EmailAlertRecipient
                {
                    Id = 1,
                    EmailAddress = "user1@domain.com"
                },
                new EmailAlertRecipient
                {
                    Id = 2,
                    EmailAddress = "user2@domain.com"
                }
            };
            var emailAlertRecipientsMockDbSet = emailAlertRecipients.AsQueryable().BuildMockDbSet();
            _nyssContextMock.EmailAlertRecipients.Returns(emailAlertRecipientsMockDbSet);

            var smsAlertRecipients = new List<SmsAlertRecipient>
            {
                new SmsAlertRecipient
                {
                    Id = 1,
                    PhoneNumber = "+48111111111"
                },
                new SmsAlertRecipient
                {
                    Id = 2,
                    PhoneNumber = "+48222222222"
                }
            };
            var smsAlertRecipientsMockDbSet = smsAlertRecipients.AsQueryable().BuildMockDbSet();
            _nyssContextMock.SmsAlertRecipients.Returns(smsAlertRecipientsMockDbSet);

            // Act
            var result = await _projectService.UpdateProject(projectId, projectRequestDto);

            // Assert
            await _nyssContextMock.Received(1).SaveChangesAsync();
            result.IsSuccess.ShouldBeTrue();
            result.Message.Key.ShouldBe(ResultKey.Project.SuccessfullyUpdated);
        }

        [Fact]
        public async Task UpdateProject_WhenProjectDoesNotExist_ShouldReturnError()
        {
            // Arrange
            const int nonExistentProjectId = 0;

            var nationalSocieties = new[] { new NationalSociety { Id = 1, Name = "National Society" } };

            var nationalSocietiesMockDbSet = nationalSocieties.AsQueryable().BuildMockDbSet();
            _nyssContextMock.NationalSocieties.Returns(nationalSocietiesMockDbSet);

            var project = new[]
            {
                new Project
                {
                    Id = 1,
                    Name = "Name",
                    TimeZone = "Time Zone",
                    NationalSocietyId = 1,
                    State = ProjectState.Open
                }
            };

            var projectsMockDbSet = project.AsQueryable().BuildMockDbSet();
            _nyssContextMock.Projects.Returns(projectsMockDbSet);
            _nyssContextMock.Projects.FindAsync(nonExistentProjectId).ReturnsNull();

            var projectRequestDto = new ProjectRequestDto { Name = "Updated Project", TimeZoneId = "Updated Time Zone" };

            // Act
            var result = await _projectService.UpdateProject(nonExistentProjectId, projectRequestDto);

            // Assert
            await _nyssContextMock.DidNotReceive().SaveChangesAsync();
            result.IsSuccess.ShouldBeFalse();
            result.Message.Key.ShouldBe(ResultKey.Project.ProjectDoesNotExist);
        }

        [Fact]
        public async Task UpdateProject_WhenRemovedHealthRiskContainsReports_ShouldReturnError()
        {
            // Arrange
            const int projectId = 1;

            var nationalSocieties = new[] { new NationalSociety { Id = 1, Name = "National Society" } };

            var nationalSocietiesMockDbSet = nationalSocieties.AsQueryable().BuildMockDbSet();
            _nyssContextMock.NationalSocieties.Returns(nationalSocietiesMockDbSet);

            var project = new[]
            {
                new Project
                {
                    Id = projectId,
                    Name = "Name",
                    TimeZone = "Time Zone",
                    NationalSocietyId = 1,
                    State = ProjectState.Open,
                    ProjectHealthRisks = new List<ProjectHealthRisk>
                    {
                        new ProjectHealthRisk
                        {
                            Id = 1,
                            Project = new Project { Id = projectId },
                            CaseDefinition = "Case Definition",
                            FeedbackMessage = "Feedback Message",
                            AlertRule = new AlertRule
                            {
                                CountThreshold = 1,
                                DaysThreshold = 2,
                                KilometersThreshold = 3
                            },
                            Reports = new List<Report>()
                            {
                                new Report()
                            }
                        }
                    },
                    EmailAlertRecipients = new List<EmailAlertRecipient>(),
                    SmsAlertRecipients = new List<SmsAlertRecipient>()
                }
            };

            var projectsMockDbSet = project.AsQueryable().BuildMockDbSet();
            _nyssContextMock.Projects.Returns(projectsMockDbSet);
            _nyssContextMock.Projects.FindAsync(projectId).Returns(project[0]);

            var projectHealthRisksMockDbSet = project.SelectMany(p => p.ProjectHealthRisks).AsQueryable().BuildMockDbSet();
            _nyssContextMock.ProjectHealthRisks.Returns(projectHealthRisksMockDbSet);

            var projectRequestDto = new ProjectRequestDto
            {
                Name = "Updated Project",
                TimeZoneId = "Updated Time Zone",
                HealthRisks = new List<ProjectHealthRiskRequestDto>(),
                EmailAlertRecipients = new List<EmailAlertRecipientDto>(),
                SmsAlertRecipients = new List<SmsAlertRecipientDto>()
            };

            // Act
            var result = await _projectService.UpdateProject(projectId, projectRequestDto);

            // Assert
            await _nyssContextMock.DidNotReceive().SaveChangesAsync();
            result.IsSuccess.ShouldBeFalse();
            result.Message.Key.ShouldBe(ResultKey.Project.HealthRiskContainsReports);
        }

        [Fact(Skip = "Currently, UpdateProject does not throw ResultException")]
        public async Task UpdateProject_WhenExceptionIsThrown_ShouldReturnError()
        {
            // Arrange
            const int projectId = 1;

            var nationalSocieties = new[] { new NationalSociety { Id = 1, Name = "National Society" } };

            var nationalSocietiesMockDbSet = nationalSocieties.AsQueryable().BuildMockDbSet();
            _nyssContextMock.NationalSocieties.Returns(nationalSocietiesMockDbSet);

            var project = new[]
            {
                new Project
                {
                    Id = projectId,
                    Name = "Name",
                    TimeZone = "Time Zone",
                    NationalSocietyId = 1,
                    State = ProjectState.Open
                }
            };

            var projectsMockDbSet = project.AsQueryable().BuildMockDbSet();
            _nyssContextMock.Projects.Returns(projectsMockDbSet);
            _nyssContextMock.Projects.FindAsync(projectId).Returns(project[0]);

            var projectRequestDto = new ProjectRequestDto { Name = "Updated Project", TimeZoneId = "Updated Time Zone" };

            // Act
            var result = await _projectService.UpdateProject(projectId, projectRequestDto);

            // Assert
            await _nyssContextMock.DidNotReceive().SaveChangesAsync();
            result.IsSuccess.ShouldBeFalse();
            result.Message.Key.ShouldBe(ResultKey.UnexpectedError);
        }

        [Fact]
        public async Task DeleteProject_WhenProjectExists_ShouldReturnSuccess()
        {
            // Arrange
            const int existingProjectId = 1;

            var project = new[]
            {
                new Project
                {
                    Id = existingProjectId,
                    Name = "Name",
                    TimeZone = "Time Zone",
                    NationalSocietyId = 1,
                    State = ProjectState.Open
                }
            };

            var projectsMockDbSet = project.AsQueryable().BuildMockDbSet();
            _nyssContextMock.Projects.Returns(projectsMockDbSet);
            _nyssContextMock.Projects.FindAsync(existingProjectId).Returns(project[0]);

            // Act
            var result = await _projectService.DeleteProject(existingProjectId);

            // Assert
            _nyssContextMock.Projects.Received(1)
                .Remove(Arg.Is<Project>(p => p.Id == existingProjectId));
            await _nyssContextMock.Received(1).SaveChangesAsync();
            result.IsSuccess.ShouldBeTrue();
            result.Message.Key.ShouldBe(ResultKey.Project.SuccessfullyDeleted);
        }

        [Fact]
        public async Task DeleteProject_WhenProjectDoesNotExist_ShouldReturnError()
        {
            // Arrange
            const int nonExistentProjectId = 0;

            var project = new[]
            {
                new Project
                {
                    Id = 1,
                    Name = "Name",
                    TimeZone = "Time Zone",
                    NationalSocietyId = 1,
                    State = ProjectState.Open
                }
            };

            var projectsMockDbSet = project.AsQueryable().BuildMockDbSet();
            _nyssContextMock.Projects.Returns(projectsMockDbSet);
            _nyssContextMock.Projects.FindAsync(nonExistentProjectId).ReturnsNull();

            // Act
            var result = await _projectService.DeleteProject(nonExistentProjectId);

            // Assert
            _nyssContextMock.Projects.DidNotReceive().Remove(Arg.Any<Project>());
            await _nyssContextMock.DidNotReceive().SaveChangesAsync();
            result.IsSuccess.ShouldBeFalse();
            result.Message.Key.ShouldBe(ResultKey.Project.ProjectDoesNotExist);
        }

        [Fact(Skip = "Currently, DeleteProject does not throw ResultException")]
        public async Task DeleteProject_WhenExceptionIsThrown_ShouldReturnError()
        {
            // Arrange
            const int projectId = 1;

            var project = new[]
            {
                new Project
                {
                    Id = projectId,
                    Name = "Name",
                    TimeZone = "Time Zone",
                    NationalSocietyId = 1,
                    State = ProjectState.Open
                }
            };

            var projectsMockDbSet = project.AsQueryable().BuildMockDbSet();
            _nyssContextMock.Projects.Returns(projectsMockDbSet);
            _nyssContextMock.Projects.FindAsync(projectId).Returns(project[0]);

            // Act
            var result = await _projectService.DeleteProject(projectId);

            // Assert
            _nyssContextMock.Projects.DidNotReceive()
                .Remove(Arg.Is<Project>(p => p.Id == projectId));
            await _nyssContextMock.DidNotReceive().SaveChangesAsync();
            result.IsSuccess.ShouldBeFalse();
            result.Message.Key.ShouldBe(ResultKey.UnexpectedError);
        }

        private IEnumerable<Project> GenerateExemplaryProjects(int nationalSocietyId)
        {
            var projectHealthRisk = new ProjectHealthRisk
            {
                HealthRisk = new HealthRisk()
            };

            return new[]
            {
                new Project
                {
                    Id = 1,
                    Name = "1",
                    State = ProjectState.Open,
                    StartDate = new DateTime(2019, 1, 1),
                    EndDate = null,
                    NationalSocietyId = nationalSocietyId,
                    DataCollectors = new[]
                    {
                        new DataCollector
                        {
                            DataCollectorType = DataCollectorType.Human,
                            Reports = new[]
                            {
                                new Report
                                {
                                    IsTraining = false,
                                    ProjectHealthRisk = projectHealthRisk,
                                    ReceivedAt = new DateTime(2019, 1, 1),
                                    ReportedCase = new ReportCase
                                    {
                                        CountFemalesAtLeastFive = 1, CountFemalesBelowFive = 0, CountMalesAtLeastFive = 0, CountMalesBelowFive = 0
                                    },
                                    ReportedCaseCount = 1
                                },
                                new Report
                                {
                                    IsTraining = true,
                                    ProjectHealthRisk = projectHealthRisk,
                                    ReceivedAt = new DateTime(2019, 1, 1),
                                    ReportedCase = new ReportCase
                                    {
                                        CountFemalesAtLeastFive = 1, CountFemalesBelowFive = 0, CountMalesAtLeastFive = 0, CountMalesBelowFive = 0
                                    },
                                    ReportedCaseCount = 1
                                }
                            }
                        }
                    },
                    SupervisorUserProjects = new List<SupervisorUserProject>(),
                    ProjectHealthRisks = new[]
                    {
                        new ProjectHealthRisk
                        {
                            Reports = new[]
                            {
                                new Report
                                {
                                    IsTraining = false,
                                    ProjectHealthRisk = projectHealthRisk,
                                    ReceivedAt = new DateTime(2019, 1, 1),
                                    ReportedCase = new ReportCase
                                    {
                                        CountFemalesAtLeastFive = 1, CountFemalesBelowFive = 0, CountMalesAtLeastFive = 0, CountMalesBelowFive = 0
                                    },
                                    ReportedCaseCount = 1
                                },
                                new Report
                                {
                                    IsTraining = true,
                                    ProjectHealthRisk = projectHealthRisk,
                                    ReceivedAt = new DateTime(2019, 1, 1),
                                    ReportedCase = new ReportCase
                                    {
                                        CountFemalesAtLeastFive = 1, CountFemalesBelowFive = 0, CountMalesAtLeastFive = 0, CountMalesBelowFive = 0
                                    },
                                    ReportedCaseCount = 1
                                }
                            },
                            Alerts = new[]
                            {
                                new Alert
                                {
                                    Id = 10, Status = AlertStatus.Pending
                                }
                            }
                        }
                    }
                },
                new Project
                {
                    Id = 2, Name = "2", State = ProjectState.Open, NationalSocietyId = 2
                },
                new Project
                {
                    Id = 3,
                    Name = "3",
                    State = ProjectState.Open,
                    StartDate = new DateTime(2019, 1, 1),
                    EndDate = null,
                    NationalSocietyId = nationalSocietyId,
                    DataCollectors = new[]
                    {
                        new DataCollector
                        {
                            DataCollectorType = DataCollectorType.Human,
                            Reports = new[]
                            {
                                new Report
                                {
                                    IsTraining = false,
                                    ProjectHealthRisk = projectHealthRisk,
                                    ReceivedAt = new DateTime(2019, 1, 1),
                                    ReportedCase = new ReportCase
                                    {
                                        CountFemalesAtLeastFive = 1, CountFemalesBelowFive = 0, CountMalesAtLeastFive = 0, CountMalesBelowFive = 0
                                    },
                                    ReportedCaseCount = 1
                                },
                                new Report
                                {
                                    IsTraining = true,
                                    ProjectHealthRisk = projectHealthRisk,
                                    ReceivedAt = new DateTime(2019, 1, 1),
                                    ReportedCase = new ReportCase
                                    {
                                        CountFemalesAtLeastFive = 1, CountFemalesBelowFive = 0, CountMalesAtLeastFive = 0, CountMalesBelowFive = 0
                                    },
                                    ReportedCaseCount = 1
                                }
                            }
                        },
                        new DataCollector
                        {
                            DataCollectorType = DataCollectorType.Human,
                            Reports = new[]
                            {
                                new Report
                                {
                                    IsTraining = false,
                                    ProjectHealthRisk = projectHealthRisk,
                                    ReceivedAt = new DateTime(2019, 1, 1),
                                    ReportedCase = new ReportCase
                                    {
                                        CountFemalesAtLeastFive = 1, CountFemalesBelowFive = 0, CountMalesAtLeastFive = 0, CountMalesBelowFive = 0
                                    },
                                    ReportedCaseCount = 1
                                },
                                new Report
                                {
                                    IsTraining = false,
                                    ProjectHealthRisk = projectHealthRisk,
                                    ReceivedAt = new DateTime(2019, 1, 1),
                                    ReportedCase = new ReportCase
                                    {
                                        CountFemalesAtLeastFive = 1, CountFemalesBelowFive = 0, CountMalesAtLeastFive = 0, CountMalesBelowFive = 0
                                    },
                                    ReportedCaseCount = 1
                                },
                                new Report
                                {
                                    IsTraining = true,
                                    ProjectHealthRisk = projectHealthRisk,
                                    ReceivedAt = new DateTime(2019, 1, 1),
                                    ReportedCase = new ReportCase
                                    {
                                        CountFemalesAtLeastFive = 1, CountFemalesBelowFive = 0, CountMalesAtLeastFive = 0, CountMalesBelowFive = 0
                                    },
                                    ReportedCaseCount = 1
                                }
                            }
                        }
                    },
                    SupervisorUserProjects = new List<SupervisorUserProject>(),
                    ProjectHealthRisks = new[]
                    {
                        new ProjectHealthRisk
                        {
                            Reports = new[]
                            {
                                new Report
                                {
                                    IsTraining = false,
                                    ProjectHealthRisk = projectHealthRisk,
                                    ReceivedAt = new DateTime(2019, 1, 1),
                                    ReportedCase = new ReportCase
                                    {
                                        CountFemalesAtLeastFive = 1, CountFemalesBelowFive = 0, CountMalesAtLeastFive = 0, CountMalesBelowFive = 0
                                    },
                                    ReportedCaseCount = 1
                                },
                                new Report
                                {
                                    IsTraining = true,
                                    ProjectHealthRisk = projectHealthRisk,
                                    ReceivedAt = new DateTime(2019, 1, 1),
                                    ReportedCase = new ReportCase
                                    {
                                        CountFemalesAtLeastFive = 1, CountFemalesBelowFive = 0, CountMalesAtLeastFive = 0, CountMalesBelowFive = 0
                                    },
                                    ReportedCaseCount = 1
                                }
                            },
                            Alerts = new[]
                            {
                                new Alert
                                {
                                    Id = 1, Status = AlertStatus.Pending
                                },
                                new Alert
                                {
                                    Id = 3, Status = AlertStatus.Escalated
                                }
                            }
                        },
                        new ProjectHealthRisk
                        {
                            Reports = new[]
                            {
                                new Report
                                {
                                    IsTraining = false,
                                    ProjectHealthRisk = projectHealthRisk,
                                    ReceivedAt = new DateTime(2019, 1, 1),
                                    ReportedCase = new ReportCase
                                    {
                                        CountFemalesAtLeastFive = 1, CountFemalesBelowFive = 0, CountMalesAtLeastFive = 0, CountMalesBelowFive = 0
                                    },
                                    ReportedCaseCount = 1
                                },
                                new Report
                                {
                                    IsTraining = false,
                                    ProjectHealthRisk = projectHealthRisk,
                                    ReceivedAt = new DateTime(2019, 1, 1),
                                    ReportedCase = new ReportCase
                                    {
                                        CountFemalesAtLeastFive = 1, CountFemalesBelowFive = 0, CountMalesAtLeastFive = 0, CountMalesBelowFive = 0
                                    },
                                    ReportedCaseCount = 1
                                },
                                new Report
                                {
                                    IsTraining = true,
                                    ProjectHealthRisk = projectHealthRisk,
                                    ReceivedAt = new DateTime(2019, 1, 1),
                                    ReportedCase = new ReportCase
                                    {
                                        CountFemalesAtLeastFive = 1, CountFemalesBelowFive = 0, CountMalesAtLeastFive = 0, CountMalesBelowFive = 0
                                    },
                                    ReportedCaseCount = 1
                                }
                            },
                            Alerts = new[]
                            {
                                new Alert
                                {
                                    Id = 4, Status = AlertStatus.Pending
                                },
                                new Alert
                                {
                                    Id = 5, Status = AlertStatus.Dismissed
                                },
                                new Alert
                                {
                                    Id = 6, Status = AlertStatus.Escalated
                                }
                            }
                        }
                    }
                }
            };
        }
    }
}
