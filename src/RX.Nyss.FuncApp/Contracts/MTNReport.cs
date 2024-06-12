using RX.Nyss.Common.Utils.DataContract;

namespace RX.Nyss.FuncApp.Contracts
{

    /*
     * {"senderAddress":"237675159734","receiverAddress":"8748","
submittedDate":1678269860786,"message":"Stop","created":1678269860786,"
id":"CMR-b184ecfd-9f03-4c4d-9a72-dbdfd88c0253"}
     * */
    public class MTNReport
    {
        public string SenderAddress { get; set; }
        public string ReceiverAddress { get; set; }
        public string SubmittedDate { get; set; }
        public string Message { get; set; }
        public string Created { get; set; }
        public string Id { get; set; }
        public ReportSource ReportSource { get; set; }

    }
}
