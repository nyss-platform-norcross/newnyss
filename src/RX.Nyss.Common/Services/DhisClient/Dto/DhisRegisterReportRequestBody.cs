﻿using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace RX.Nyss.Common.Services.DhisClient.Dto;
public class DhisRegisterReportRequestBody
{
    [JsonPropertyName("program")]
    public string Program { get; set; }

    [JsonPropertyName("orgUnit")]
    public string OrgUnit { get; set; }

    [JsonPropertyName("eventDate")]
    public string EventDate { get; set; }

    [JsonPropertyName("dataValues")]
    public List<DataValue> DataValues { get; set; }

    public class DataValue
    {
        [JsonPropertyName("dataElement")]
        public string DataElement { get; set; }

        [JsonPropertyName("value")]
        public string Value { get; set; }
    }
}
