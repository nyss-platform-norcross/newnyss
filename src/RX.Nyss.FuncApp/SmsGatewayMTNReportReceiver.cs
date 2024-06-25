using System;
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
using Newtonsoft.Json;

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
    public async Task<IActionResult> EnqueueSmsGatewayMTNReport(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "enqueueSmsGatewayMTNReport")] HttpRequestMessage httpRequest)
    {
        var maxContentLength = _config.MaxContentLength;
        if (httpRequest.Content != null)
        {
            if (httpRequest.Content.Headers.ContentLength == null || httpRequest.Content.Headers.ContentLength > maxContentLength)
            {
                _logger.Log(LogLevel.Warning, $"Received an SMS Gateway MTN request with length more than {maxContentLength} bytes. (length: {httpRequest.Content.Headers.ContentLength.ToString() ?? "N/A"})");
                return new BadRequestResult();
            }
            var httpRequestContent = await httpRequest.Content.ReadAsStringAsync();
            _logger.Log(LogLevel.Debug, $"Received SMS Gateway MTN report: {httpRequestContent}.{Environment.NewLine}HTTP request: {httpRequest}");

            if (string.IsNullOrWhiteSpace(httpRequestContent))
            {
                _logger.Log(LogLevel.Warning, "Received an empty SMS Gateway MTN report.");
                return new BadRequestResult();
            }

            var decodedHttpRequestContent = HttpUtility.UrlDecode(httpRequestContent);
            var report = JsonConvert.DeserializeObject<MTNReport>(decodedHttpRequestContent);
            report.ReportSource = ReportSource.MTNSmsGateway;

            await _reportPublisherService.AddMTNReportToQueue(report);
            return new OkResult();
        }

        _logger.Log(LogLevel.Error, $"Received an SMS Gateway MTN request with NULL content");
        return new BadRequestResult();
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