using System;
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
    }

    public class ReportService : IReportService
    {
        private readonly ISmsEagleHandler _smsEagleHandler;
        private readonly INyssReportHandler _nyssReportHandler;
        private readonly ITelerivetHandler _telerivetHandler;
        private readonly ISmsGatewayHandler _smsGatewayHandler;
        private readonly IEidsrReportHandler _eidsrReportHandler;
        private readonly ILoggerAdapter _loggerAdapter;

        public ReportService(
            ISmsEagleHandler smsEagleHandler,
            ILoggerAdapter loggerAdapter,
            INyssReportHandler nyssReportHandler,
            ITelerivetHandler telerivetHandler,
            IEidsrReportHandler eidsrReportHandler,
            ISmsGatewayHandler smsGatewayHandler)
        {
            _smsEagleHandler = smsEagleHandler;
            _loggerAdapter = loggerAdapter;
            _nyssReportHandler = nyssReportHandler;
            _telerivetHandler = telerivetHandler;
            _eidsrReportHandler = eidsrReportHandler;
            _smsGatewayHandler = smsGatewayHandler;
        }

        public async Task<bool> ReceiveReport(Report report)
        {
            if (report == null)
            {
                _loggerAdapter.Error("Received a report with null value.");
                return false;
            }

            _loggerAdapter.Debug($"Received report: {report}");

            if (report.ReportSource == ReportSource.Nyss)
            {
                await _nyssReportHandler.Handle(report.Content);
            }
            else if (report.ReportSource == ReportSource.SmsEagle)
            {
                await _smsEagleHandler.Handle(report.Content);
            }
            else if (report.ReportSource == ReportSource.SmsGateway)
            {
                await _smsGatewayHandler.Handle(report.Content);
            }
            else 
            {
                _loggerAdapter.Error("Received a report with unknown source.");
                return false;
            }

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
    }
}
