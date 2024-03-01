import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Chip,
  Box,
  useTheme,
} from "@material-ui/core";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { strings, stringKeys } from "../../strings";
import useHoverChartTracking from "../../utils/useHoverChartTracking";
import {
  getDateStringInterval,
  getEpiWeekStringInterval,
} from "../../utils/dateStrings";

const getOptions = (
  valuesLabel,
  series,
  categories,
  groupingType,
  theme,
  yMax = null,
) => ({
  chart: {
    type: "column",
  },
  title: {
    text: valuesLabel,
  },
  xAxis: {
    categories: categories,
    labels: {
      formatter: function () {
        switch (groupingType) {
          case "Day":
            const date = this.value.split("-");
            return `${this.value}`;
          case "Week":
            const yearandWeek = this.value.split("/");
            return categories.length > 25
              ? `W${yearandWeek[1]} Y${yearandWeek[0].slice(-2)}`
              : `W${yearandWeek[1]}<br/>Y${yearandWeek[0].slice(-2)}`;
        }
      },
    },
    tickmarkPlacement: "on",
    tickInterval: 1,
    tickWidth: 1,
    lineColor: theme.palette.text.secondary,
    lineWidth: 2,
    tickColor: theme.palette.text.secondary,
  },
  yAxis: {
    title: {
      text: valuesLabel,
    },
    allowDecimals: false,
    min: 0,
    max: yMax,
    tickInterval: 1,
    gridLineColor: "white",
    lineWidth: 2,
    gridZIndex: 6,
    stackLabels: {
      enabled: true,
    },
  },
  colors: [
    "#058DC7",
    "#50B432",
    "#ED561B",
    "#DDDF00",
    "#24CBE5",
    "#64E572",
    "#FF9655",
    "#FFF263",
    "#6AF9C4",
  ],
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
      borderWidth: 1,
      groupPadding: 0,
      shadow: false,
      stacking: "normal",
      animation: false,
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
  // Generate categories as an array of date strings for each day in the interval between startDate and endDate.
  let categories;
  switch (data.dateGroupingType) {
    case "Week":
      categories = getEpiWeekStringInterval(
        data.chartStartDateEpiWeekString,
        data.chartEndDateEpiWeekString,
      );
      break;
    case "Day":
      categories = getDateStringInterval(
        data.chartStartDateString,
        data.chartEndDateString,
      );
      break;
    default:
      throw new Error(`Invalid date grouping type: ${dateGroupingType}`);
  }

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

  // Find the highest value for y by summing series
  let yMax;
  if (series.length > 0) {
    let maxColumnValues = series.reduce((prev, curr) => {
      const columnValues = prev.data.map((val, idx) => val + curr.data[idx]);
      return { data: columnValues };
    }).data;
    yMax = Math.max(Math.ceil(Math.max(...maxColumnValues) / 5) * 5, 10); // Round Max y up to the closest multiple of 5 (10 minimum)
  }

  series =
    selectedHealthRisk != null
      ? series.filter((s) => s.healthRiskId === selectedHealthRisk)
      : series;

  const theme = useTheme();

  const chartData = getOptions(
    "",
    series,
    categories,
    data.dateGroupingType,
    theme,
    yMax,
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
            {/* Add to string keys */}
            {"Kept reports in escalated alerts"}
          </Typography>
        }
        subheader={
          <Typography variant="subtitle2">
            {/* Add to string keys */}
            {`Data from: ${data.chartStartDateString} to ${data.chartEndDateString}`}
          </Typography>
        }
      />
      <CardContent>
        <Box mb={"1rem"}>
          <Chip
            label={"All"} // TODO: Make string key
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
        </Box>
        <HighchartsReact
          highcharts={Highcharts}
          ref={resizeChart}
          options={chartData}
        />
      </CardContent>
    </Card>
  );
};
