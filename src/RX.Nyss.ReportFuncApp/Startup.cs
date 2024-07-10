using System.IO;
using System.Reflection;
using Microsoft.Azure.Functions.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RX.Nyss.ReportFuncApp;
using RX.Nyss.ReportFuncApp.Configuration;

[assembly: FunctionsStartup(typeof(Startup))]

namespace RX.Nyss.ReportFuncApp;

public class Startup : FunctionsStartup
{
    public override void Configure(IFunctionsHostBuilder builder)
    {
        builder.AddConfiguration();
    }
}

public static class FunctionHostBuilderExtensions
{
    private const string _localSettingsJsonFileName = "local.settings.json";

    public static void AddConfiguration(this IFunctionsHostBuilder builder)
    {
        var currentDirectory = Directory.GetCurrentDirectory();
        var localSettingsFile = Path.Combine(currentDirectory, _localSettingsJsonFileName);

        var provider = builder.Services.BuildServiceProvider();
        var configuration = provider.GetService<IConfiguration>();

        var configurationBuilder = new ConfigurationBuilder()
            .AddJsonFile(localSettingsFile, true, true)
            .AddEnvironmentVariables()
            .AddConfiguration(configuration)
            .AddUserSecrets(Assembly.GetExecutingAssembly(), true);

        var newConfiguration = configurationBuilder.Build();
        var nyssFuncAppConfig = newConfiguration.Get<NyssReportFuncAppConfig>();
        builder.Services.AddSingleton<IConfiguration>(newConfiguration);
        builder.Services.AddSingleton<IConfig>(nyssFuncAppConfig);
        builder.Services.AddHttpClient();
        builder.Services.AddLogging();
    }
}
