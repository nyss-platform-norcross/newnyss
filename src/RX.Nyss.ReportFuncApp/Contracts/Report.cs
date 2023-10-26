﻿namespace RX.Nyss.ReportFuncApp.Contracts
{
    public class Report
    {
        public string Content { get; set; }

        public ReportSource ReportSource { get; set; }

        public override string ToString() => $"{nameof(Content)}: {Content}, {nameof(ReportSource)}: {ReportSource}";
    }

    public enum ReportSource
    {
        SmsEagle,
        Nyss,
        Telerivet,
        SmsGateway
    }
}
