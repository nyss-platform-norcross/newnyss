using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Azure.Messaging.ServiceBus;
using RX.Nyss.Common.Utils;
using RX.Nyss.Common.Utils.Logging;
using RX.Nyss.Data.Models;
using RX.Nyss.ReportApi.Configuration;
using RX.Nyss.ReportApi.Features.Common;
using Telerivet.Client;
using JsonSerializer = System.Text.Json.JsonSerializer;
using RX.Nyss.Common.Services;

namespace RX.Nyss.ReportApi.Services
{
    public interface IQueuePublisherService
    {
        Task QueueAlertCheck(int alertId);
        Task SendEmail((string Name, string EmailAddress) to, string emailSubject, string emailBody, bool sendAsTextOnly = false);
        Task SendSms(List<SendSmsRecipient> recipients, GatewaySetting gatewaySetting, string message);
        Task SendGatewayHttpSms(List<SendGatewaySmsRecipient> recipients, GatewaySetting gatewaySetting, string message);
        Task SendTelerivetSms(long number, string message, string apiKey, string projectId);
    }

    public class QueuePublisherService : IQueuePublisherService
    {
        private readonly ServiceBusSender _sendEmailQueueSender;
        private readonly ServiceBusSender _checkAlertQueueSender;
        private readonly ServiceBusSender _sendSmsQueueSender;
        private readonly INyssReportApiConfig _config;
        private readonly IDateTimeProvider _dateTimeProvider;
        private readonly ILoggerAdapter _loggerAdapter;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly ICryptographyService _cryptographyService;

        public QueuePublisherService(
            INyssReportApiConfig config,
            IDateTimeProvider dateTimeProvider,
            ILoggerAdapter loggerAdapter,
            ServiceBusClient serviceBusClient,
            IHttpClientFactory httpClientFactory,
            ICryptographyService cryptographyService)
        {
            _config = config;
            _dateTimeProvider = dateTimeProvider;
            _loggerAdapter = loggerAdapter;
            _sendEmailQueueSender = serviceBusClient.CreateSender(config.ServiceBusQueues.SendEmailQueue);
            _checkAlertQueueSender = serviceBusClient.CreateSender(config.ServiceBusQueues.CheckAlertQueue);
            _sendSmsQueueSender = serviceBusClient.CreateSender(config.ServiceBusQueues.SendSmsQueue);
            _httpClientFactory = httpClientFactory;
            _cryptographyService = cryptographyService;
        }

        public async Task SendSms(List<SendSmsRecipient> recipients, GatewaySetting gatewaySetting, string message)
        {
            if (!string.IsNullOrEmpty(gatewaySetting.IotHubDeviceName))
            {
                //var specifyModemWhenSending = gatewaySetting.Modems.Any();
                await SendSmsViaIotHub(gatewaySetting.IotHubDeviceName, recipients, message, false);
            }
            else if (!string.IsNullOrEmpty(gatewaySetting.EmailAddress))
            {
                await SendSmsViaEmail(gatewaySetting.EmailAddress, gatewaySetting.Name, recipients.Select(r => r.PhoneNumber).ToList(), message);
            }
            else
            {
                _loggerAdapter.Warn($"No email or IoT device found for gateway {gatewaySetting.Name}, not able to send feedback SMS!");
            }
        }

        public async Task QueueAlertCheck(int alertId)
        {
            var message = new ServiceBusMessage(Encoding.UTF8.GetBytes(alertId.ToString()))
            {
                Subject = "RX.Nyss.ReportApi",
                ScheduledEnqueueTime = _dateTimeProvider.UtcNow.AddMinutes(_config.CheckAlertTimeoutInMinutes)
            };

            await _checkAlertQueueSender.SendMessageAsync(message);
        }

        public Task SendEmail((string Name, string EmailAddress) to, string emailSubject, string emailBody, bool sendAsTextOnly = false)
        {
            var sendEmail = new SendEmailMessage
            {
                To = new Contact
                {
                    Email = to.EmailAddress,
                    Name = to.Name
                },
                Body = emailBody,
                Subject = emailSubject,
                SendAsTextOnly = sendAsTextOnly
            };

            var message = new ServiceBusMessage(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(sendEmail)));

            return _sendEmailQueueSender.SendMessageAsync(message);
        }

        private async Task SendSmsViaEmail(string smsEagleEmailAddress, string smsEagleName, List<string> recipientPhoneNumbers, string body) =>
            await Task.WhenAll(recipientPhoneNumbers.Select(recipientPhoneNumber =>
                SendEmail((smsEagleName, smsEagleEmailAddress), recipientPhoneNumber, body, true))
            );

        private async Task SendSmsViaIotHub(string iotHubDeviceName, List<SendSmsRecipient> recipients, string smsMessage, bool specifyModemWhenSending) =>
            await Task.WhenAll(recipients.Select(recipient =>
            {
                var sendSms = new SendSmsMessage
                {
                    IotHubDeviceName = iotHubDeviceName,
                    PhoneNumber = recipient.PhoneNumber,
                    SmsMessage = smsMessage,
                    ModemNumber = specifyModemWhenSending
                        ? recipient.Modem
                        : null
                };

                var message = new ServiceBusMessage(Encoding.UTF8.GetBytes(JsonSerializer.Serialize(sendSms)))
                {
                    Subject = "RX.Nyss.ReportApi",
                    ApplicationProperties = { { "IotHubDevice", iotHubDeviceName } }
                };
                return _sendSmsQueueSender.SendMessageAsync(message);
            }));

        public async Task SendGatewayHttpSms(List<SendGatewaySmsRecipient> recipients, GatewaySetting gatewaySetting, string message)
        {
            if (!string.IsNullOrEmpty(gatewaySetting.GatewaySenderId))
            {
                await SendSmsViaDigitalGateway(gatewaySetting, recipients, message);
            }
            else if (!string.IsNullOrEmpty(gatewaySetting.EmailAddress))
            {
                await SendSmsViaEmail(gatewaySetting.EmailAddress, gatewaySetting.GatewaySenderId, recipients.Select(r => r.PhoneNumber).ToList(), message);
            }
            else
            {
                _loggerAdapter.Warn($"No email or sender id found for gateway {gatewaySetting.Name}, not able to send feedback SMS!");
            }
        }

        private async Task SendSmsViaDigitalGateway(GatewaySetting gatewaySetting, List<SendGatewaySmsRecipient> recipients, string smsMessage) =>
            await Task.WhenAll(recipients.Select(async recipient =>
            {
                if (recipient.PhoneNumber.StartsWith('+'))
                {
                    recipient.PhoneNumber = recipient.PhoneNumber.Substring(1, recipient.PhoneNumber.Length - 1);
                }

                var phoneList = new List<string> { recipient.PhoneNumber };
                var receiverArray = phoneList.ToArray();

                using StringContent jsonContent = new(
                    JsonSerializer.Serialize(new SendSmsObject
                    {
                        SenderId = gatewaySetting.GatewaySenderId,
                        Msisdn = receiverArray,
                        Message = smsMessage
                    }),
                    Encoding.UTF8,
                    "application/json");

                await SendSmsViaDigitalGatewayRequest(gatewaySetting, jsonContent);
            }));

        private async Task<bool> SendSmsViaDigitalGatewayRequest(GatewaySetting gatewaySetting, StringContent strContent)
        {
            using var httpClient = _httpClientFactory.CreateClient();
            var requestUri = new Uri(gatewaySetting.GatewayUrl, uriKind: UriKind.Absolute);

            var httpRequestMessage = new HttpRequestMessage(HttpMethod.Post, requestUri);
            ////////////////////////////////////////////////////////
            var gatewayApiKey = _cryptographyService.Decrypt(
                gatewaySetting?.GatewayApiKey,
                _config.Key,
                _config.SupplementaryKey);
            ///////////////////////////////////////////////////////
            httpRequestMessage.Headers.Add(gatewaySetting.GatewayApiKeyName, gatewayApiKey);
            if (gatewaySetting.GatewayExtraKey != null && gatewaySetting.GatewayExtraKeyName != null)
            {
                ///////////////////////////////////////////////////
                var gatewayExtraKey = _cryptographyService.Decrypt(
                    gatewaySetting?.GatewayExtraKey,
                    _config.Key,
                    _config.SupplementaryKey);
                ///////////////////////////////////////////////////
                httpRequestMessage.Headers.Add(gatewaySetting.GatewayExtraKeyName, gatewayExtraKey);
            }

            httpRequestMessage.Content = strContent;

            var res = await httpClient.SendAsync(httpRequestMessage);
            if (res.IsSuccessStatusCode)
            {
                return true;
            }
            _loggerAdapter.Error(res.ReasonPhrase);
            return false;
        }

        public async Task SendTelerivetSms(long number, string message, string apiKey, string projectId)
        {
            ///////////////////////////////////////////////////////
            var telerivetApiKey = _cryptographyService.Decrypt(
                apiKey,
                _config.Key,
                _config.SupplementaryKey);
            ////////////////////////////////////////////////////////
            var tr = new TelerivetAPI(telerivetApiKey);
            var project = tr.InitProjectById(projectId);
            // send message
            var sentMsg = await project.SendMessageAsync(Util.Options("content", message, "to_number", number));
            _loggerAdapter.Info(sentMsg);
        }
    }
};
public class SendEmailMessage
{
    public Contact To { get; set; }

    public string Subject { get; set; }

    public string Body { get; set; }

    public bool SendAsTextOnly { get; set; }
}

public class Contact
{
    public string Name { get; set; }

    public string Email { get; set; }
}

public class SendSmsMessage
{
    public string IotHubDeviceName { get; set; }

    public string PhoneNumber { get; set; }

    public string SmsMessage { get; set; }

    public int? ModemNumber { get; set; }
}

public class SendGatewaySmsRecipient
{
    public string PhoneNumber { get; set; }
}

public class SendSmsObject
{
    [JsonPropertyName("senderId")]
    public string SenderId { get; set; }
    [JsonPropertyName("msisdn")]
    public string[] Msisdn { get; set; }
    [JsonPropertyName("message")]
    public string Message { get; set; }

}
