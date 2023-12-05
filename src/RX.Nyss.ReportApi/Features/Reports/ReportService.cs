﻿using System;
using System.Threading.Tasks;
using RX.Nyss.Common.Utils.Logging;
using RX.Nyss.ReportApi.Features.Reports.Contracts;
using RX.Nyss.ReportApi.Features.Reports.Handlers;
using RX.Nyss.Common.Utils.DataContract;
using RX.Nyss.ReportApi.Features.Reports.Models;

namespace RX.Nyss.ReportApi.Features.Reports
{
    public interface IReportService
    {
        Task<bool> ReceiveReport(Report report);
        Task<bool> ReceiveTelerivetReport(TelerivetReport t);
        Task<bool> RegisterEidsrEvent(EidsrReport eidsrReport);
        Task<bool> RegisterDhisReport(DhisReport dhisReport);
    }

    public class ReportService : IReportService
    {
        private readonly ISmsEagleHandler _smsEagleHandler;
        private readonly INyssReportHandler _nyssReportHandler;
        private readonly ITelerivetHandler _telerivetHandler;
        private readonly ISmsGatewayHandler _smsGatewayHandler;
        private readonly IEidsrReportHandler _eidsrReportHandler;
        private readonly IDhisReportHandler _dhisReportHandler;
        private readonly ILoggerAdapter _loggerAdapter;

        public ReportService(
            ISmsEagleHandler smsEagleHandler,
            ILoggerAdapter loggerAdapter,
            INyssReportHandler nyssReportHandler,
            ITelerivetHandler telerivetHandler,
            IEidsrReportHandler eidsrReportHandler,
            IDhisReportHandler dhisReportHandler,
            ISmsGatewayHandler smsGatewayHandler)
        {
            _smsEagleHandler = smsEagleHandler;
            _loggerAdapter = loggerAdapter;
            _nyssReportHandler = nyssReportHandler;
            _telerivetHandler = telerivetHandler;
            _eidsrReportHandler = eidsrReportHandler;
            _smsGatewayHandler = smsGatewayHandler;
            _dhisReportHandler = dhisReportHandler;
        }

        public async Task<bool> ReceiveReport(Report report)
        {
            /*if (report.Content == null)
            {
                _loggerAdapter.Error("Received a report with null value or incorrect report source.");
                return false;
            }*/

            _loggerAdapter.Info($"Received report content: {report.Content}");

            /*switch (report.ReportSource)
            {
                case ReportSource.SmsEagle:
                    await _smsEagleHandler.Handle(report.Content);
                    break;
                case ReportSource.Nyss:
                    await _nyssReportHandler.Handle(report.Content);
                    break;
                case ReportSource.SmsGateway:
                    await _smsGatewayHandler.Handle(report.Content);
                    break;
                case ReportSource.Telerivet:
                    break;
                default:
                    _loggerAdapter.Error($"Could not find a proper handler to handle a report '{report}'.");
                    break;
            }*/

            await _smsEagleHandler.Handle(report.Content);

            return true;
        }

        public async Task<bool> ReceiveTelerivetReport(TelerivetReport t)
        {
            if (t == null)
            {
                _loggerAdapter.Error("Received a report with null value.");
                return false;
            }

            _loggerAdapter.Debug($"Received report:{t}");

            if (t.ReportSource == ReportSource.Telerivet)
            {
                var Content = "apikey=" + t.ApiKey + "&project_id=" + t.ProjectId + "&time_updated=" + t.TimeUpdated + "&time_created=" + t.TimeCreated + "&content=" + t.MessageContent +
                    "&from_number_e164=" + t.FromNumber;
                await _telerivetHandler.Handle(Content);
            }
            else
            {
                _loggerAdapter.Error("Received a report with unknown source.");
                return false;
            }

            return true;
        }

        public async Task<bool> RegisterEidsrEvent(EidsrReport eidsrReport)
        {
            if (eidsrReport == null)
            {
                _loggerAdapter.Error("Received a eidsrReport with null value.");
                return false;
            }

            return await _eidsrReportHandler.Handle(eidsrReport);
        }

        public async Task<bool> RegisterDhisReport(DhisReport dhisReport)
        {
            if (dhisReport == null)
            {
                _loggerAdapter.Error("Received a dhisReport with null value.");
                return false;
            }

            return await _dhisReportHandler.Handle(dhisReport);
        }
    }
}
