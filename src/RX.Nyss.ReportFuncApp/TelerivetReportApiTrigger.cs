using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using RX.Nyss.ReportFuncApp.Configuration;
using RX.Nyss.ReportFuncApp.Contracts;

namespace RX.Nyss.ReportFuncApp
{
    public class TelerivetReportApiTrigger
    {
        private readonly ILogger<TelerivetReportApiTrigger> _logger;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly Uri _reportApiBaseUrl;

        public TelerivetReportApiTrigger(ILogger<TelerivetReportApiTrigger> logger, IConfig config, IHttpClientFactory httpClientFactory)
        {
            _logger = logger;
            _httpClientFactory = httpClientFactory;
            _reportApiBaseUrl = new Uri(config.ReportApiBaseUrl, UriKind.Absolute);
        }

        [FunctionName("DequeueTelerivetReport")]
        public async Task DequeueTelerivetReport(
            [ServiceBusTrigger("%SERVICEBUS_TELERIVETREPORTQUEUE%", Connection = "SERVICEBUS_CONNECTIONSTRING")] TelerivetReport report)
        {
            _logger.Log(LogLevel.Debug, $"Dequeued telerivet report: '{report}'");

            var client = _httpClientFactory.CreateClient();
            var content = new StringContent(JsonConvert.SerializeObject(report), Encoding.UTF8, "application/json");
            var postResult = await client.PostAsync(new Uri(_reportApiBaseUrl, "api/Report/telerivetReport"), content);

            if (!postResult.IsSuccessStatusCode)
            {
                _logger.LogInformation($"Status code: {(int)postResult.StatusCode} ReasonPhrase: {postResult.ReasonPhrase}");
            }
        }
    }
}
