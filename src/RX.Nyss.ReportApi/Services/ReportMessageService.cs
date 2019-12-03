﻿using System.Text.RegularExpressions;
using RX.Nyss.Data.Concepts;
using RX.Nyss.ReportApi.Exceptions;
using RX.Nyss.ReportApi.Models;

namespace RX.Nyss.ReportApi.Services
{
    public interface IReportMessageService
    {
        ParsedReport ParseReport(string reportMessage);
    }

    public class ReportMessageService : IReportMessageService
    {
        private const int Male = 1;
        private const int Female = 2;
        private const int BelowFive = 1;
        private const int AtLeastFive = 2;
        private const int ActivityCode = 99;

        private const string SingleReportPattern = @"^(?<healthRiskCode>[1-9][0-9]*)(?<separator>[#*])(?<sex>[1-2])\k<separator>(?<ageGroup>[1-2])$";
        private static readonly Regex SingleReportRegex = new Regex(SingleReportPattern, RegexOptions.Compiled);

        private const string AggregatedReportPattern = @"^(?<healthRiskCode>[1-9][0-9]*)(?<separator>[#*])(?<malesBelowFive>[0-9]+)\k<separator>(?<malesAtLeastFive>[0-9]+)\k<separator>(?<femalesBelowFive>[0-9]+)\k<separator>(?<femalesAtLeastFive>[0-9]+)$";
        private static readonly Regex AggregatedReportRegex = new Regex(AggregatedReportPattern, RegexOptions.Compiled);

        private const string EventReportPattern = @"^(?<eventCode>[1-9][0-9]*)$";
        private static readonly Regex EventReportRegex = new Regex(EventReportPattern, RegexOptions.Compiled);

        public ParsedReport ParseReport(string reportMessage)
        {
            if (SingleReportRegex.IsMatch(reportMessage))
            {
                return ParseSingleReport(reportMessage);
            }

            if (AggregatedReportRegex.IsMatch(reportMessage))
            {
                return ParseAggregatedReport(reportMessage);
            }

            if (EventReportRegex.IsMatch(reportMessage))
            {
                return ParseEventReport(reportMessage);
            }

            throw new ReportValidationException("A report format was not recognized.");
        }

        internal static ParsedReport ParseSingleReport(string reportMessage)
        {
            var singleReportMatch = SingleReportRegex.Match(reportMessage);
            var healthRiskCodeMatch = singleReportMatch.Groups["healthRiskCode"].Value;
            var sexMatch = singleReportMatch.Groups["sex"].Value;
            var ageGroupMatch = singleReportMatch.Groups["ageGroup"].Value;

            var healthRiskCode = int.Parse(healthRiskCodeMatch);
            var sex = int.Parse(sexMatch);
            var ageGroup = int.Parse(ageGroupMatch);

            var parsedReport = new ParsedReport
            {
                HealthRiskCode = healthRiskCode,
                ReportType = ReportType.Single,
                DataCollectorType = DataCollectorType.Human,
                ReportedCase =
                {
                    CountMalesBelowFive = sex == Male && ageGroup == BelowFive ? 1 : 0,
                    CountMalesAtLeastFive = sex == Male && ageGroup == AtLeastFive ? 1 : 0,
                    CountFemalesBelowFive = sex == Female && ageGroup == BelowFive ? 1 : 0,
                    CountFemalesAtLeastFive = sex == Female && ageGroup == AtLeastFive ? 1 : 0
                }
            };

            return parsedReport;
        }

        internal static ParsedReport ParseAggregatedReport(string reportMessage)
        {
            var aggregatedReportMatch = AggregatedReportRegex.Match(reportMessage);
            var healthRiskCodeMatch = aggregatedReportMatch.Groups["healthRiskCode"].Value;
            var malesBelowFiveMatch = aggregatedReportMatch.Groups["malesBelowFive"].Value;
            var malesAtLeastFiveMatch = aggregatedReportMatch.Groups["malesAtLeastFive"].Value;
            var femalesBelowFiveMatch = aggregatedReportMatch.Groups["femalesBelowFive"].Value;
            var femalesAtLeastFiveMatch = aggregatedReportMatch.Groups["femalesAtLeastFive"].Value;

            var healthRiskCode = int.Parse(healthRiskCodeMatch);
            var malesBelowFive = int.Parse(malesBelowFiveMatch);
            var malesAtLeastFive = int.Parse(malesAtLeastFiveMatch);
            var femalesBelowFive = int.Parse(femalesBelowFiveMatch);
            var femalesAtLeastFive = int.Parse(femalesAtLeastFiveMatch);

            var parsedReport = new ParsedReport
            {
                HealthRiskCode = healthRiskCode,
                ReportType = ReportType.Aggregate,
                DataCollectorType = DataCollectorType.Human,
                ReportedCase =
                {
                    CountMalesBelowFive = malesBelowFive,
                    CountMalesAtLeastFive = malesAtLeastFive,
                    CountFemalesBelowFive = femalesBelowFive,
                    CountFemalesAtLeastFive = femalesAtLeastFive
                }
            };

            return parsedReport;
        }

        private static ParsedReport ParseEventReport(string reportMessage)
        {
            var eventReportMatch = EventReportRegex.Match(reportMessage);
            var eventCodeMatch = eventReportMatch.Groups["eventCode"].Value;

            var eventCode = int.Parse(eventCodeMatch);

            var parsedReport = new ParsedReport
            {
                HealthRiskCode = eventCode,
                ReportType = eventCode == ActivityCode ? ReportType.Activity : ReportType.NonHuman,
                DataCollectorType = DataCollectorType.Human
            };

            return parsedReport;
        }
    }
}
