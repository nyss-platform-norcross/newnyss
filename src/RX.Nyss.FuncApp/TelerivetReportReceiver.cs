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
//using Telerivet;
//using Telerivet.Client;

namespace RX.Nyss.FuncApp;

public class TelerivetReportReceiver
{
private const string ApiKeyQueryParameterName = "apikey";
    private readonly ILogger<SmsEagleReportReceiver> _logger;
    private readonly IConfig _config;
    private readonly IReportPublisherService _reportPublisherService;

    public TelerivetReportReceiver(ILogger<SmsEagleReportReceiver> logger, IConfig config, IReportPublisherService reportPublisherService)
    {
        _logger = logger;
        _config = config;
        _reportPublisherService = reportPublisherService;
    }

    [FunctionName("EnqueueTelerivetReport")]
    public async Task<IActionResult> EnqueueTelerivetReport(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "enqueueTelerivetReport")] HttpRequestMessage httpRequest,
        [Blob("%AuthorizedApiKeysBlobPath%", FileAccess.Read)] string authorizedApiKeys)
    {
        var maxContentLength = _config.MaxContentLength;
        var contentLength = httpRequest.Content.Headers.ContentLength;
        if (contentLength == null || contentLength > maxContentLength)
        {
            _logger.Log(LogLevel.Warning, $"Received a Telerivet request with length more than {maxContentLength} bytes. (length: {contentLength.ToString() ?? "N/A"})");
            return new BadRequestResult();
        }

        var httpRequestContent = await httpRequest.Content.ReadAsStringAsync();
        _logger.Log(LogLevel.Debug, $"Received Telerivet report: {httpRequestContent}.{Environment.NewLine}HTTP request: {httpRequest}");

        if (string.IsNullOrWhiteSpace(httpRequestContent))
        {
            _logger.Log(LogLevel.Warning, "Received an empty Telerivet report.");
            return new BadRequestResult();
        }

        var decodedHttpRequestContent = HttpUtility.UrlDecode(httpRequestContent);

        if (!VerifyApiKey(authorizedApiKeys, decodedHttpRequestContent))
        {
            return new UnauthorizedResult();
        }

        var report = new Report
        {
            Content = httpRequestContent,
            ReportSource = ReportSource.Telerivet
        };

        await _reportPublisherService.AddReportToQueue(report);

        return new OkResult();
    }

    private bool VerifyApiKey(string authorizedApiKeys, string decodedHttpRequestContent)
    {
        if (string.IsNullOrWhiteSpace(authorizedApiKeys))
        {
            _logger.Log(LogLevel.Critical, "The authorized API key list is empty.");
            return false;
        }

        var authorizedApiKeyList = authorizedApiKeys.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.RemoveEmptyEntries);
        var apiKey = HttpUtility.ParseQueryString(decodedHttpRequestContent)[ApiKeyQueryParameterName];

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            _logger.Log(LogLevel.Warning, "Received a Telerivet report with an empty API key.");
            return false;
        }

        if (!authorizedApiKeyList.Contains(apiKey))
        {
            _logger.Log(LogLevel.Warning, $"Received a Telerivet report with not authorized API key: {apiKey}.");
            return false;
        }

        return true;
    }
}
