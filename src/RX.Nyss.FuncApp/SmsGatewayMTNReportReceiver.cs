using System;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using RX.Nyss.Common.Utils.DataContract;
using RX.Nyss.FuncApp.Configuration;
using RX.Nyss.FuncApp.Contracts;
using RX.Nyss.FuncApp.Services;
using JsonSerializer = System.Text.Json.JsonSerializer;

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
        if (httpRequest.Content.Headers.ContentLength == null)
        {
            _logger.Log(LogLevel.Warning, "Received SMS Gateway MTN report with header content length null.");
            return new BadRequestResult();
        }
        var httpRequestContent = await httpRequest.Content.ReadAsStringAsync();
        _logger.Log(LogLevel.Debug, $"Received SMS Gateway MTN report: {httpRequestContent}.{Environment.NewLine}HTTP request: {httpRequest}");

        if (string.IsNullOrWhiteSpace(httpRequestContent))
        {
            _logger.Log(LogLevel.Warning, "Received an empty SMS Gateway MTN report.");
            return new BadRequestResult();
        }

        var report = JsonConvert.DeserializeObject<MTNReport>(httpRequestContent);
        report.ReportSource = ReportSource.MTNSmsGateway;

        await _reportPublisherService.AddMTNReportToQueue(report);
        return new OkResult();
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

    private HttpResponseMessage ReturnOkHttpResult(HttpRequestMessage httpRequest, string messageId)
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