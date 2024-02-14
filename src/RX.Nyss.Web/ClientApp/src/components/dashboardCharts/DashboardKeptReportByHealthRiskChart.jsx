import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
} from "@material-ui/core";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { strings, stringKeys } from "../../strings";
import useHoverChartTracking from "../../utils/useHoverChartTracking";
import { eachDayOfInterval, parseISO, format } from "date-fns";

const getOptions = (valuesLabel, series, categories) => ({
  chart: {
    type: "column",
  },
  title: {
    text: "",
  },
  xAxis: {
    categories: categories,
  },
  yAxis: {
    title: {
      text: valuesLabel,
    },
    allowDecimals: false,
  },
  legend: {
    enabled: true,
    itemStyle: { fontWeight: "regular" },
  },
  credits: {
    enabled: false,
  },
  plotOptions: {
    column: {
      pointPadding: 0,
      borderWidth: 0,
      groupPadding: 0,
      shadow: false,
      stacking: "normal",
    },
  },
  tooltip: {
    headerFormat: "",
    pointFormat: "{series.name}: <b>{point.y}</b>",
  },
  series,
});

// Function to parse input data and generate categories and series data for charting.
// The function takes a data object containing startDateString, endDateString, and groupedReports.
const getCategoryAndSeriesData = (data) => {
  const startDate = parseISO(data.chartStartDateString);
  const endDate = parseISO(data.chartEndDateString);

  // Generate categories as an array of date strings for each day in the interval between startDate and endDate.
  const categories = eachDayOfInterval({ start: startDate, end: endDate }).map(
    (day) => format(day, "yyyy-MM-dd"),
  );

  // Helper function to aggregate series data based on the categories and input data.
  const getAggregatedSeriesData = (categories, data) => {
    let aggregatedSeries = [];
    // Iterate over each category (date) to find matching data and accumulate counts.
    for (let dateString of categories) {
      const period = data.find((d) => d.period === dateString);
      const count = period ? period.count : 0;
      aggregatedSeries.push(count);
    }
    return aggregatedSeries;
  };

  const series = data.groupedReports.map((healthRiskReports) => ({
    healthRiskId: healthRiskReports.healthRiskId,
    name: healthRiskReports.healthRiskName,
    data: getAggregatedSeriesData(categories, healthRiskReports.data),
  }));

  return [categories, series];
};

export const DashboardKeptReportByHealthRiskChart = ({ data }) => {
  let [categories, series] = getCategoryAndSeriesData(data);

  const trackHoveredChart = useHoverChartTracking();
  const resizeChart = (element) => {
    element && element.chart.reflow();
  };
  const [selectedHealthRisk, setSelectedHealthRisk] = useState(null);

  const toggleHealthRisk = (healthRiskId = null) => {
    if (healthRiskId === null) {
      setSelectedHealthRisk(null); // Show all health risks
    } else if (selectedHealthRisk !== healthRiskId) {
      setSelectedHealthRisk(healthRiskId); // Toggle a specific health risk
    }
  };

  series =
    selectedHealthRisk != null
      ? series.filter((s) => s.healthRiskId === selectedHealthRisk)
      : series;
  const chartData = getOptions(
    strings(stringKeys.dashboard.reportsPerHealthRisk.numberOfReports, true),
    series,
    categories,
  );

  return (
    <Card
      data-printable={true}
      onMouseEnter={() => trackHoveredChart("hoveredReportChart")}
      onTouchStart={trackHoveredChart("hoveredReportChart")}
    >
      <CardHeader
        title={
          <Typography variant="h5">
            {strings(stringKeys.dashboard.reportsPerHealthRisk.title)}
          </Typography>
        }
      />
      <CardContent>
        <div>
          <Chip
            label={"All"}
            style={{
              marginRight: "10px",
              fontWeight: selectedHealthRisk ? "normal" : "bold",
            }}
            onClick={() => toggleHealthRisk()}
          />
          {data.groupedReports.map((healthRiskReports) => (
            <Chip
              key={healthRiskReports.healthRiskId}
              label={healthRiskReports.healthRiskName}
              style={{
                marginRight: "10px",
                fontWeight:
                  selectedHealthRisk === healthRiskReports.healthRiskId
                    ? "bold"
                    : "normal",
              }}
              onClick={() => toggleHealthRisk(healthRiskReports.healthRiskId)}
            />
          ))}
        </div>
        <HighchartsReact
          highcharts={Highcharts}
          ref={resizeChart}
          options={chartData}
        />
      </CardContent>
    </Card>
  );
};
