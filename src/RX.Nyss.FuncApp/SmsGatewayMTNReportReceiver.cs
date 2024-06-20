using System;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using RX.Nyss.FuncApp.Configuration;
using RX.Nyss.Common.Utils.DataContract;
using RX.Nyss.FuncApp.Contracts;
using RX.Nyss.FuncApp.Services;
using System.Text;
using System.Net;
using JsonSerializer = System.Text.Json.JsonSerializer;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Http;
using Microsoft.Azure.Amqp.Framing;

namespace RX.Nyss.FuncApp;

public class SmsGatewayMTNReportReceiver
{
    private readonly ILogger<SmsGatewayMTNReportReceiver> _logger;
    private readonly IConfig _config;
    private readonly IMTNReportPublisherService _reportPublisherService;

    public SmsGatewayMTNReportReceiver(ILogger<SmsGatewayMTNReportReceiver> logger, IConfig config, IMTNReportPublisherService reportPublisherService)
    {
        _logger = logger;
        _config = config;
        _reportPublisherService = reportPublisherService;
    }

    [FunctionName("EnqueueSmsGatewayMTNReport")]
    public async Task<HttpResponseMessage> EnqueueSmsGatewayMTNReport(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "enqueueSmsGatewayMTNReport")] HttpRequestMessage httpRequest)
    {
        var maxContentLength = _config.MaxContentLength;
        if (httpRequest.Content != null)
        {
            if (httpRequest.Content.Headers.ContentLength == null || httpRequest.Content.Headers.ContentLength > maxContentLength)
            {
                _logger.Log(LogLevel.Warning, $"Received an SMS Gateway MTN request with length more than {maxContentLength} bytes. (length: {httpRequest.Content.Headers.ContentLength.ToString() ?? "N/A"})");
                return ReturnBadHttpResult(httpRequest);
            }
            var httpRequestContent = await httpRequest.Content.ReadAsStringAsync();
            _logger.Log(LogLevel.Debug, $"Received SMS Gateway MTN report: {httpRequestContent}.{Environment.NewLine}HTTP request: {httpRequest}");

            if (string.IsNullOrWhiteSpace(httpRequestContent))
            {
                _logger.Log(LogLevel.Warning, "Received an empty SMS Gateway MTN report.");
                return ReturnBadHttpResult(httpRequest);
            }

            var decodedHttpRequestContent = HttpUtility.UrlDecode(httpRequestContent);
            var result = HttpUtility.ParseQueryString(decodedHttpRequestContent);

            var report = new MTNReport
            {
                SenderAddress = result["senderAddress"],
                ReceiverAddress= result["receiverAddress"],
                SubmittedDate= result["submittedDate"],
                Message = result["message"],
                Created= result["created"],
                Id= result["id"],
                ReportSource = ReportSource.MTNSmsGateway
            };

            await _reportPublisherService.AddMTNReportToQueue(report);
            //_logger.LogError(LogLevel.Error, result);
            _logger.Log(LogLevel.Error, result.ToString());
            return ReturnOkHttpResult(httpRequest, result["id"]);
        }

        _logger.Log(LogLevel.Error, $"Received an SMS Gateway MTN request with NULL content");
        return ReturnBadHttpResult(httpRequest);
    }

    private HttpResponseMessage ReturnBadHttpResult(HttpRequestMessage httpRequest)
    {
        using StringContent jsonContent = new(
                JsonSerializer.Serialize(new SendSuccessCallbackMessageObject
                {
                    Status = "Error",
                    TransactionId = null,
                }),
                Encoding.UTF8,
                "application/json");
        var response = httpRequest.CreateResponse(HttpStatusCode.BadRequest);
        response.Content = jsonContent;
        return response;
    }

    private HttpResponseMessage ReturnOkHttpResult(HttpRequestMessage httpRequest,string messageId)
    {
        using StringContent jsonContent = new(
                JsonSerializer.Serialize(new SendSuccessCallbackMessageObject
                {
                    Status = "Processed",
                    TransactionId = messageId,
                }),
                Encoding.UTF8,
                "application/json");
        var response = httpRequest.CreateResponse(HttpStatusCode.OK);
        response.Content = jsonContent;
        return response;
    }

}

public class SendSuccessCallbackMessageObject
{
    [JsonPropertyName("status")]
    public string Status { get; set; }

    [JsonPropertyName("transactionId")]
    public string TransactionId { get; set; }
}