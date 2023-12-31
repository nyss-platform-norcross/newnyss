using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MockQueryable.NSubstitute;
using NSubstitute;
using RX.Nyss.Common.Utils.DataContract;
using RX.Nyss.Data;
using RX.Nyss.Data.Concepts;
using RX.Nyss.Data.Models;
using RX.Nyss.Web.Features.ProjectAlertRecipients;
using RX.Nyss.Web.Features.ProjectAlertRecipients.Dto;
using RX.Nyss.Web.Services.Authorization;
using Shouldly;
using Xunit;

namespace RX.Nyss.Web.Tests.Features.ProjectAlertRecipients
{
    public class ProjectAlertRecipientsTests
    {
        private const int ProjectId = 1;
        private const int NationalSocietyId = 1;
        private readonly List<User> _users;
        private readonly ProjectAlertRecipientService _projectAlertRecipientService;
        private readonly IAuthorizationService _authorizationServiceMock;
        private readonly INyssContext _nyssContextMock;

        public ProjectAlertRecipientsTests()
        {
            _nyssContextMock = Substitute.For<INyssContext>();
            _authorizationServiceMock = Substitute.For<IAuthorizationService>();

            _users = new List<User>
            {
                new ManagerUser
                {
                    Id = 1,
                    EmailAddress = "manager@example.com"
                },
                new ManagerUser
                {
                    Id = 2,
                    EmailAddress = "manager2@example.com"
                },
                new SupervisorUser
                {
                    Id = 3,
                    EmailAddress = "supervisor@example.com",
                    Role = Role.Supervisor
                }
            };

            var userNationalSocieties = new List<UserNationalSociety>
            {
                new UserNationalSociety
                {
                    NationalSocietyId = 1,
                    UserId = 1,
                    OrganizationId = 1,
                    User = _users[0]
                },
                new UserNationalSociety
                {
                    NationalSocietyId = 1,
                    UserId = 2,
                    OrganizationId = 2,
                    User = _users[0]
                },
                new UserNationalSociety
                {
                    NationalSocietyId = 1,
                    UserId = 3,
                    OrganizationId = 1,
                    User = _users[2]
                }
            };

            var projects = new List<Project> { new Project { Id = 1 } };

            var alertRecipients = new List<AlertNotificationRecipient>
            {
                new AlertNotificationRecipient
                {
                    Id = 1,
                    Role = "Someguy",
                    Organization = "RCRC",
                    Email = "test@example.com",
                    PhoneNumber = "+123456",
                    OrganizationId = 1,
                    ProjectId = 1,
                    SupervisorAlertRecipients = new List<SupervisorUserAlertRecipient>(),
                    ProjectHealthRiskAlertRecipients = new List<ProjectHealthRiskAlertRecipient>(),
                    HeadSupervisorUserAlertRecipients = new List<HeadSupervisorUserAlertRecipient>()
                }
            };
            var orgs = new List<Organization>
            {
                new Organization
                {
                    Id = 1,
                    NationalSocietyId = 1,
                    NationalSocietyUsers = new List<UserNationalSociety>
                    {
                        new UserNationalSociety { UserId = 1, User = _users[2]}
                    }
                }
            };

            var usersDbSet = _users.AsQueryable().BuildMockDbSet();
            var userNationalSocietiesDbSet = userNationalSocieties.AsQueryable().BuildMockDbSet();
            var alertRecipientsDbSet = alertRecipients.AsQueryable().BuildMockDbSet();
            var projectsDbSet = projects.AsQueryable().BuildMockDbSet();
            var orgDbSet = orgs.AsQueryable().BuildMockDbSet();

            _authorizationServiceMock.GetCurrentUser().Returns(_users[0]);
            _nyssContextMock.Users.Returns(usersDbSet);
            _nyssContextMock.UserNationalSocieties.Returns(userNationalSocietiesDbSet);
            _nyssContextMock.AlertNotificationRecipients.Returns(alertRecipientsDbSet);
            _nyssContextMock.Projects.Returns(projectsDbSet);
            _nyssContextMock.Organizations.Returns(orgDbSet);

            _projectAlertRecipientService = new ProjectAlertRecipientService(_nyssContextMock, _authorizationServiceMock);
        }

        [Fact]
        public async Task Create_WhenAlertRecipientDoesntExist_ShouldReturnSuccess()
        {
            // Arrange
            var alertRecipient = new ProjectAlertRecipientRequestDto
            {
                Role = "Head",
                Organization = "RCRC",
                Email = "head@rcrc.org",
                PhoneNumber = "+35235243",
                OrganizationId = 1,
                Supervisors = new List<SupervisorAlertRecipientRequestDto>(),
                HealthRisks = new List<int>()
            };

            // Act
            var res = await _projectAlertRecipientService.Create(NationalSocietyId, ProjectId, alertRecipient);

            // Assert
            res.IsSuccess.ShouldBe(true);
        }

        [Fact]
        public async Task Create_WhenAlertRecipientDoesExist_ShouldFail()
        {
            // Arrange
            var alertRecipient = new ProjectAlertRecipientRequestDto
            {
                Role = "Head",
                Organization = "RCRC",
                Email = "test@example.com",
                PhoneNumber = "+123456",
                OrganizationId = 1,
                Supervisors = new List<SupervisorAlertRecipientRequestDto>(),
                HealthRisks = new List<int>()
            };

            // Act
            var res = await _projectAlertRecipientService.Create(NationalSocietyId, ProjectId, alertRecipient);

            // Assert
            res.IsSuccess.ShouldBe(false);
            res.Message.Key.ShouldBe(ResultKey.AlertRecipient.AlertRecipientAlreadyAdded);
        }

        [Fact]
        public async Task Create_WhenUserIsNotTiedToOrganization_ShouldFail()
        {
            // Arrange
            _authorizationServiceMock.GetCurrentUser().Returns(_users[1]);
            var alertRecipient = new ProjectAlertRecipientRequestDto
            {
                Role = "Head",
                Organization = "RCRC",
                Email = "head@rcrc.org",
                PhoneNumber = "+35235243",
                OrganizationId = 3,
                Supervisors = new List<SupervisorAlertRecipientRequestDto>(),
                HealthRisks = new List<int>()
            };

            // Act
            var res = await _projectAlertRecipientService.Create(NationalSocietyId, ProjectId, alertRecipient);

            // Assert
            res.IsSuccess.ShouldBe(false);
            res.Message.Key.ShouldBe(ResultKey.AlertRecipient.CurrentUserMustBeTiedToAnOrganization);
        }

        [Fact]
        public async Task Edit_WhenAlertRecipientDoesntExist_ShouldFail()
        {
            // Arrange
            var alertRecipientId = 2;
            var alertRecipient = new ProjectAlertRecipientRequestDto
            {
                Id = alertRecipientId,
                Role = "Head",
                Organization = "RCRC",
                Email = "head@rcrc.org",
                PhoneNumber = "+35235243",
                OrganizationId = 1,
                Supervisors = new List<SupervisorAlertRecipientRequestDto>(),
                HealthRisks = new List<int>()
            };

            // Act
            var res = await _projectAlertRecipientService.Edit(alertRecipientId, alertRecipient);

            // Assert
            res.IsSuccess.ShouldBe(false);
            res.Message.Key.ShouldBe(ResultKey.AlertRecipient.AlertRecipientDoesNotExist);
        }

        [Fact]
        public async Task Edit_WhenAlertRecipientDoesExist_ShouldReturnSuccess()
        {
            // Arrange
            var alertRecipientId = 1;
            var alertRecipient = new ProjectAlertRecipientRequestDto
            {
                Id = alertRecipientId,
                Role = "Head",
                Organization = "RCRC",
                Email = "head@rcrc.org",
                PhoneNumber = "+35235243",
                OrganizationId = 1,
                Supervisors = new List<SupervisorAlertRecipientRequestDto>(),
                HealthRisks = new List<int>()
            };

            // Act
            var res = await _projectAlertRecipientService.Edit(alertRecipientId, alertRecipient);

            // Assert
            res.IsSuccess.ShouldBe(true);
            res.Message.Key.ShouldBe(ResultKey.AlertRecipient.AlertRecipientSuccessfullyEdited);
        }

        [Fact]
        public async Task Delete_WhenAlertRecipientDoesExist_ShouldReturnSuccess()
        {
            // Arrange
            var alertRecipientId = 1;

            // Act
            var res = await _projectAlertRecipientService.Delete(alertRecipientId);

            // Assert
            res.IsSuccess.ShouldBe(true);
        }

        [Fact]
        public async Task Delete_WhenAlertRecipientDoesntExist_ShouldFail()
        {
            // Arrange
            var alertRecipientId = 2;

            // Act
            var res = await _projectAlertRecipientService.Delete(alertRecipientId);

            // Assert
            res.IsSuccess.ShouldBe(false);
            res.Message.Key.ShouldBe(ResultKey.AlertRecipient.AlertRecipientDoesNotExist);
        }

        [Fact]
        public async Task Get_WhenAlertRecipientDoesExist_ShouldReturnAlertRecipient()
        {
            // Arrange
            var alertRecipientId = 1;

            // Act
            var res = await _projectAlertRecipientService.Get(alertRecipientId);

            // Assert
            res.IsSuccess.ShouldBe(true);
            res.Value.Id.ShouldBe(alertRecipientId);
        }

        [Theory]
        [InlineData("manager@example.com")]
        [InlineData("manager2@example.com")]
        public async Task List_ShouldReturnAlertRecipientForTheUsersOrganizationOnly(string userName)
        {
            // Arrange
            var user = _users.First(u => u.EmailAddress == userName);
            _authorizationServiceMock.GetCurrentUser().Returns(user);
            var nationalSocietyId = 1;
            var projectId = 1;

            // Act
            var res = await _projectAlertRecipientService.List(nationalSocietyId, projectId);

            // Assert
            res.IsSuccess.ShouldBe(true);
            res.Value.Count.ShouldBe(userName == "manager@example.com"
                ? 1
                : 0);
        }
    }
}
