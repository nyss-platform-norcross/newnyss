using System;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Microsoft.Extensions.Logging;
using NSubstitute;
using RX.Nyss.FuncApp.Configuration;
using RX.Nyss.FuncApp.Contracts;
using RX.Nyss.FuncApp.Services;
using SendGrid.Helpers.Mail;
using Xunit;

namespace RX.Nyss.FuncApp.Tests
{
    public class EmailServiceTests
    {
        private readonly IEmailService _emailService;
        private readonly ILogger<EmailService> _loggerMock;
        private readonly IConfig _configurationMock;
        private readonly IEmailClient _emailClientMock;
        private readonly IWhitelistValidator _whitelistValidator;
        private readonly BlobContainerClient _blobContainerClient;
        private readonly IEmailAttachmentService _emailAttachmentServiceMock;

        public EmailServiceTests()
        {
            _loggerMock = Substitute.For<ILogger<EmailService>>();
            _configurationMock = Substitute.For<IConfig>();
            _configurationMock.MailConfig = new NyssFuncAppConfig.MailConfigOptions() { EnableFeedbackSms = true };
            _emailClientMock = Substitute.For<IEmailClient>();
            _whitelistValidator = Substitute.For<IWhitelistValidator>();
            _emailAttachmentServiceMock = Substitute.For<IEmailAttachmentService>();
            // _emailClientMock = new SendGridEmailClient(_configurationMock, _emailAttachmentServiceMock);
            _emailService = new EmailService(
                _loggerMock,
                _configurationMock,
                _emailClientMock,
                _whitelistValidator);
            _blobContainerClient = new BlobContainerClient(new Uri("https://example.com"));
        }

        [Theory]
        [InlineData("user@example.com")]
        public async Task SendEmail_WhenSendToAllFlagIsMissing_ShouldUseSandboxModeAndLogWarning(string email)
        {
            // Act
            await _emailService.SendEmail(new SendEmailMessage { To = new Contact { Email = email } }, "hey@example.com", "", _blobContainerClient);

            // Assert
            await _emailClientMock.Received(1).SendEmail(Arg.Any<SendEmailMessage>(), Arg.Is(true), Arg.Any<BlobContainerClient>());
        }

        [Theory]
        [InlineData("user@example.com")]
        public async Task SendEmail_WhenSendToAllIsFalse_ShouldUseSandboxMode(string email)
        {
            // Act
            await _emailService.SendEmail(new SendEmailMessage { To = new Contact { Email = email } }, "", "", _blobContainerClient);

            // Assert
            await _emailClientMock.Received(1).SendEmail(Arg.Any<SendEmailMessage>(), Arg.Is(true), Arg.Any<BlobContainerClient>());
        }

        [Fact]
        public async Task SendEmail_WhenSendToAllIsFalse_ShouldUseSandboxModeUnlessWhiteListed()
        {
            // Arrange
            var whitelistedEmail = "whitelisted@email.com";
            var notWhitelistedEmail = "not_whitelisted@email.com";
            _whitelistValidator.IsWhitelistedEmailAddress(Arg.Any<string>(), whitelistedEmail).Returns(true);
            _whitelistValidator.IsWhitelistedEmailAddress(Arg.Any<string>(), notWhitelistedEmail).Returns(false);

            // Act
            await _emailService.SendEmail(new SendEmailMessage { To = new Contact { Email = whitelistedEmail } }, whitelistedEmail, "", _blobContainerClient);
            await _emailService.SendEmail(new SendEmailMessage { To = new Contact { Email = notWhitelistedEmail } }, whitelistedEmail, "", _blobContainerClient);

            // Assert
            await _emailClientMock.Received(1).SendEmail(Arg.Is<SendEmailMessage>(x => x.To.Email == notWhitelistedEmail), true, Arg.Any<BlobContainerClient>());
            await _emailClientMock.Received(1).SendEmail(Arg.Is<SendEmailMessage>(x => x.To.Email == whitelistedEmail), false, Arg.Any<BlobContainerClient>());
        }

        [Theory]
        [InlineData("user@example.com")]
        [InlineData("donald.duck@example.com")]
        [InlineData("scrooge.mc.duck@example.com")]
        public async Task SendEmail_WhenSendToAllIsTrue_ShouldSendToAll(string email)
        {
            // Arrange
            _configurationMock.MailConfig.SendToAll = true;
            var whitelist = @"
            user@example.com
            donald.duck@example.com
            some@email.no";

            // Act
            await _emailService.SendEmail(new SendEmailMessage { To = new Contact { Email = email } }, whitelist, "", _blobContainerClient);

            // Assert
            await _emailClientMock.Received(1).SendEmail(Arg.Any<SendEmailMessage>(), false, Arg.Any<BlobContainerClient>());
        }

        [Theory]
        [InlineData("user@example.com", "+4712345678")]
        public async Task SendEmail_WhenMessageSendAsTextOnlyIsTrue_ShouldSendAsTextOnly(string email, string phoneNumber)
        {
            // Arrange
            var whitelist = "user@example.com";
            var phoneNumberWhitelist = "+4712345678";

            _whitelistValidator.IsWhitelistedEmailAddress(whitelist, email).Returns(true);
            _whitelistValidator.IsWhiteListedPhoneNumber(phoneNumberWhitelist, phoneNumber).Returns(true);

            // Act
            await _emailService.SendEmail(new SendEmailMessage
            {
                To = new Contact { Email = email },
                Subject = phoneNumber,
                SendAsTextOnly = true
            }, whitelist, phoneNumberWhitelist, _blobContainerClient);

            // Assert
            await _emailClientMock.Received(1).SendEmailAsTextOnly(Arg.Any<SendEmailMessage>(), Arg.Is(false));
        }

        [Theory]
        [InlineData("user@example.com", "+4712345679")]
        public async Task SendEmail_WhenPhoneNumberIsNotWhitelisted_ShouldNotSendEmail(string email, string phoneNumber)
        {
            // Arrange
            _configurationMock.MailConfig.SendFeedbackSmsToAll = false;
            var whitelist = @"
            user@example.com
            donald.duck@example.com
            some@email.no";
            var phoneNumberWhitelist = "+4712345678";

            // Act
            await _emailService.SendEmail(new SendEmailMessage
            {
                To = new Contact { Email = email },
                Subject = phoneNumber,
                SendAsTextOnly = true
            }, whitelist, phoneNumberWhitelist, _blobContainerClient);

            // Assert
            await _emailClientMock.DidNotReceive().SendEmailAsTextOnly(Arg.Any<SendEmailMessage>(), Arg.Is(false));
        }

        [Theory]
        [InlineData("user@example.com", "+4712345678")]
        public async Task SendEmail_WhenSendFeedbackSmsToAllIsTrue_ShouldSendToAll(string email, string phoneNumber)
        {
            // Arrange
            _configurationMock.MailConfig.SendFeedbackSmsToAll = true;
            var whitelist = "user@example.com";
            var phoneNumberWhitelist = "+4712345678";

            // Act
            await _emailService.SendEmail(new SendEmailMessage
            {
                To = new Contact { Email = email },
                Subject = phoneNumber,
                SendAsTextOnly = true
            }, whitelist, phoneNumberWhitelist, _blobContainerClient);

            // Assert
            await _emailClientMock.Received(1).SendEmailAsTextOnly(Arg.Any<SendEmailMessage>(), Arg.Is(false));
        }

        [Fact]
        public async Task SendEmail_WhenSendingWithAttachment_ShouldDownloadAttachmentFromBlobStorage()
        {
            // Arrange
            var emailClientService = new SendGridEmailClient(_configurationMock, _emailAttachmentServiceMock);
            var emailService = new EmailService(
                _loggerMock,
                _configurationMock,
                emailClientService,
                _whitelistValidator);
            _configurationMock.MailConfig.SendToAll = true;
            _configurationMock.MailConfig.SendGrid = new NyssFuncAppConfig.MailConfigOptions.SendGridConfigOptions
            {
                ApiKey = "setwrtwet"
            };
            var whitelist = "user@example.com";

            // Act
            await emailService.SendEmail(new SendEmailMessage
            {
                To = new Contact { Email = "user@example.com" },
                Subject = "Test",
                AttachmentFilename = "somefile.pdf"
            }, whitelist, "", _blobContainerClient);

            // Assert
            await _emailAttachmentServiceMock.Received(1).AttachPdf(Arg.Any<SendGridMessage>(), Arg.Any<string>(), Arg.Any<BlobContainerClient>());
        }
    }
}
