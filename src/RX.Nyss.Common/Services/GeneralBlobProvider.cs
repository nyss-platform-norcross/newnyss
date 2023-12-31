﻿using System;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Microsoft.Extensions.Azure;
using RX.Nyss.Common.Configuration;
using RX.Nyss.Common.Utils;

namespace RX.Nyss.Common.Services;

public interface IGeneralBlobProvider
{
    Task<string> GetStringsResources();
    Task SaveStringsResources(string value);
    Task SaveEmailContentResources(string value);
    Task SaveSmsContentResources(string value);
    Task<string> GetEmailContentResources();
    Task<string> GetSmsContentResources();
    Task<string> GetPlatformAgreementUrl(string languageCode);
    Task<DateTime?> GetPlatformAgreementLastModifiedDate(string languageCode);
}

public class GeneralBlobProvider : IGeneralBlobProvider
{
    private readonly IConfig _config;
    private readonly BlobProvider _blobProvider;

    public GeneralBlobProvider(IConfig config, IAzureClientFactory<BlobServiceClient> azureClientFactory)
    {
        _config = config;
        var blobServiceClient = azureClientFactory.CreateClient("GeneralBlobClient");
        _blobProvider = new BlobProvider(blobServiceClient, config.GeneralBlobContainerName);
    }

    public async Task<string> GetStringsResources() =>
        await _blobProvider.GetBlobValue(_config.StringsResourcesBlobObjectName);

    public async Task SaveStringsResources(string value) =>
        await _blobProvider.SetBlobValue(_config.StringsResourcesBlobObjectName, value, isStringResources: true);

    public async Task SaveEmailContentResources(string value) =>
        await _blobProvider.SetBlobValue(_config.EmailContentResourcesBlobObjectName, value, isStringResources: true);

    public async Task SaveSmsContentResources(string value) =>
        await _blobProvider.SetBlobValue(_config.SmsContentResourcesBlobObjectName, value, isStringResources: true);

    public async Task<string> GetEmailContentResources() =>
        await _blobProvider.GetBlobValue(_config.EmailContentResourcesBlobObjectName);

    public async Task<string> GetSmsContentResources() =>
        await _blobProvider.GetBlobValue(_config.SmsContentResourcesBlobObjectName);

    public async Task<string> GetPlatformAgreementUrl(string languageCode) =>
        await _blobProvider.GetBlobUrl(_config.PlatformAgreementBlobObjectName.Replace("{languageCode}", languageCode), TimeSpan.FromHours(1));

    public async Task<DateTime?> GetPlatformAgreementLastModifiedDate(string languageCode)
    {
        var lastModified = (await _blobProvider.GetBlobProperties(_config.PlatformAgreementBlobObjectName.Replace("{languageCode}", languageCode)))?.LastModified.UtcDateTime;

        return lastModified;
    }
}