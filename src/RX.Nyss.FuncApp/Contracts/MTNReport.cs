﻿using RX.Nyss.Common.Utils.DataContract;

namespace RX.Nyss.FuncApp.Contracts;

public class MTNReport
{
    public string SenderAddress { get; set; }
    public string ReceiverAddress { get; set; }
    public long SubmittedDate { get; set; }
    public string Message { get; set; }
    public long Created { get; set; }
    public string Id { get; set; }
    public ReportSource ReportSource { get; set; }

}
