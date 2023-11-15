using System;
using System.Net.Http;
using System.Text.Json;
using System.Text;
using System.Threading.Tasks;
using RX.Nyss.Common.Services.SmsGatewayClient.Dto;
using RX.Nyss.Common.Utils.DataContract;
using RX.Nyss.Common.Utils.Logging;
using System.Net.Http.Headers;

namespace RX.Nyss.Common.Services.SmsGatewayClient;

public interface ISmsClient
{
    Task<Result> SendSmsGatewayHttp(SmsGatewaySendSmsRequest smsGatewaySendSmsRequest);
}

public class SmsClient : ISmsClient
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILoggerAdapter _loggerAdapter;

    public SmsClient(
        IHttpClientFactory httpClientFactory,
        ILoggerAdapter loggerAdapter)
    {
        _httpClientFactory = httpClientFactory;
        _loggerAdapter = loggerAdapter;
    }

    private static bool ConfigureClient(SmsApiProperties apiProperties, HttpClient httpClient)
    {
        Uri.TryCreate(apiProperties.Url, UriKind.Absolute, out var validatedUri);

        if (validatedUri == default)
        {
            return false;
        }

        httpClient.BaseAddress = validatedUri;
        httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        httpClient.DefaultRequestHeaders.Add("","");
        httpClient.DefaultRequestHeaders.Add("", "");
        return true;
    }

    public async Task<Result> SendSmsGatewayHttp(
        SmsGatewaySendSmsRequest smsGatewaySendSmsRequest)
    {
        using var httpClient = _httpClientFactory.CreateClient();
        ConfigureClient(smsGatewaySendSmsRequest.SmsApiProperties, httpClient);

        var request = new HttpRequestMessage(HttpMethod.Post, "");
        request.Content = new StringContent(
            JsonSerializer.Serialize(smsGatewaySendSmsRequest.SmsGatewaySendSmsRequestBody), Encoding.UTF8, "application/json");

        var res = await httpClient.SendAsync(request);

        if (res.IsSuccessStatusCode)
        {
            return Success();
        }

        _loggerAdapter.Error(res.ReasonPhrase);
        return Error<bool>(ResultKey.EidsrIntegration.EidsrApi.RegisterEventError);
    }
}