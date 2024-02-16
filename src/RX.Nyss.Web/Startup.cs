using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.SpaServices.ReactDevelopmentServer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Net.Http.Headers;
using RX.Nyss.Common.Configuration;
using RX.Nyss.Web.Configuration;

namespace RX.Nyss.Web;
//
public class Startup
{
    public IConfiguration Configuration { get; }

    public Startup(IConfiguration configuration)
    {
        Configuration = configuration;
    }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
        services.AddDatabaseDeveloperPageExceptionFilter();

        services.ConfigureDependencies(Configuration);

    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
    {
        var config = Configuration.Get<ConfigSingleton>();

        if (!env.IsDevelopment())
        {
            app.UseExceptionHandler("/Error");
            // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
            app.UseHsts();
        }

        app.Use(async (context, next) =>
        {
            context.Response.Headers.Add("Content-Security-Policy",
                "base-uri 'self'; " +
                "script-src 'self' 'unsafe-inline'; " +
                "frame-ancestors 'self'; " +
                "form-action 'self'; " +
                "img-src 'self' data: https://*.tile.openstreetmap.org/; " +
                "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com/icon?family=Material+Icons https://unpkg.com/leaflet@1.7.1/dist/leaflet.css; " +
                "object-src 'none'; " +
                "frame-src 'self'; " +
                "connect-src 'self' wss://localhost:0/sockjs-node https://*.in.applicationinsights.azure.com/; " +
                "media-src 'self'; " +
                "font-src 'self' https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2; " +
                "manifest-src 'self';");
            context.Response.Headers.Add("X-Frame-Options", "SAMEORIGIN");
            context.Response.Headers.Add("X-Content-Type-Options", "nosniff");

            await next();
        });

        app.UseCustomExceptionHandler();

        var supportedCultures = config.Languages.Split(",").Select(lang => new CultureInfo(lang)).ToList();

        app.UseRequestLocalization(new RequestLocalizationOptions
        {
            SupportedCultures = supportedCultures,
            SupportedUICultures = supportedCultures,
            RequestCultureProviders = new List<IRequestCultureProvider>
            {
                new AcceptLanguageHeaderRequestCultureProvider()
            }
        });

        app.UseHttpsRedirection();
        app.UseSpaStaticFiles(new StaticFileOptions
        {
            OnPrepareResponse = ctx =>
            {
                if (ctx.Context.Request.Path.StartsWithSegments("/static"))
                {
                    ctx.Context.Response.GetTypedHeaders().CacheControl = new CacheControlHeaderValue
                    {
                        Public = true,
                        MaxAge = TimeSpan.FromDays(365)
                    };
                }
                else
                {
                    // don't cache index.html, manifest.json etc
                    ctx.Context.Response.GetTypedHeaders().CacheControl = new CacheControlHeaderValue
                    {
                        Public = true,
                        MaxAge = TimeSpan.FromDays(0)
                    };
                }
            }
        });


        if (Configuration["Environment"] != NyssEnvironments.Prod && Configuration["Environment"] != NyssEnvironments.Demo)
        {
            app.UseSwagger();
            app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Nyss API V1"));
        }
        //
        app.UseRouting();

        app.UseAuthentication();
        app.UseAuthorization();
        app.UseEndpoints(endpoints =>
        {
            endpoints.MapControllerRoute(
                name: "default",
                pattern: "{controller}/{action=Index}/{id?}");
            endpoints.MapRazorPages();
        });

        app.UseSpa(spa =>
        {
            spa.Options.SourcePath = "ClientApp";
            spa.Options.DefaultPageStaticFileOptions = new StaticFileOptions
            {
                OnPrepareResponse = ctx =>
                {
                    ctx.Context.Response.GetTypedHeaders().CacheControl = new CacheControlHeaderValue
                    {
                        Public = true,
                        MaxAge = TimeSpan.FromDays(0)
                    };
                }
            };

            if (env.IsDevelopment())
            {
                spa.UseReactDevelopmentServer(npmScript: "start");
            }
        });
    }
}
////