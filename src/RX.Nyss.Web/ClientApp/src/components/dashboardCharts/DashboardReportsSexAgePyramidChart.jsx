import React from "react";
import { Card, CardContent, CardHeader, Typography } from "@material-ui/core";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { strings, stringKeys } from "../../strings";
import useHoverChartTracking from "../../utils/useHoverChartTracking";

const getOptions = (valuesLabel, series, categories) => ({
  chart: {
    type: "bar",
  },
  title: {
    text: "",
  },
  xAxis: {
    categories: categories,
    reversed: true, // Set to true to reverse the order of categories
  },
  yAxis: {
    title: {
      text: valuesLabel,
    },
    labels: {
      formatter: function () {
        // Display positive values on the x-axis for the negative stack side (Female)
        return Math.abs(this.value);
      },
    },
    allowDecimals: false,
    reversedStacks: true, // Set to true to reverse the order of stacking
  },
  plotOptions: {
    series: {
      stacking: "normal", // Set to 'normal' for side-by-side bars
    },
  },
  tooltip: {
    formatter: function () {
      // Customize tooltip to display positive values for the negative stack side (Female)
      return (
        "<b>" +
        this.x +
        "</b><br/>" +
        this.series.name +
        ": " +
        Math.abs(this.y)
      );
    },
  },
  series: series,
});

export const DashboardReportSexAgePyramidChart = ({ data }) => {
  const trackHoveredChart = useHoverChartTracking();
  const categories = [
    strings(stringKeys.dashboard.reportsPerFeature.above5),
    strings(stringKeys.dashboard.reportsPerFeature.below5),
    `${strings(
      stringKeys.dashboard.reportsPerFeature.unspecifiedAge,
    )} + ${strings(stringKeys.dashboard.reportsPerFeature.unspecifiedSex)}`,
  ];
  const totalNumbers = data.reduce(
    (acc, obj) => {
      acc.countFemalesAtLeastFive += obj.countFemalesAtLeastFive;
      acc.countFemalesBelowFive += obj.countFemalesBelowFive;
      acc.countMalesAtLeastFive += obj.countMalesAtLeastFive;
      acc.countMalesBelowFive += obj.countMalesBelowFive;
      acc.countUnspecifiedSexAndAge += obj.countUnspecifiedSexAndAge;
      return acc;
    },
    {
      countFemalesAtLeastFive: 0,
      countFemalesBelowFive: 0,
      countMalesAtLeastFive: 0,
      countMalesBelowFive: 0,
      countUnspecifiedSexAndAge: 0,
    },
  );

  const series = [
    {
      name: strings(stringKeys.reports.sexAgeConstants.female),
      stack: "stack",
      data: [
        -totalNumbers.countFemalesAtLeastFive,
        -totalNumbers.countFemalesBelowFive,
        -totalNumbers.countUnspecifiedSexAndAge,
      ],
      color: "#078e5e",
    },
    {
      name: strings(stringKeys.reports.sexAgeConstants.male),
      stack: "stack",
      data: [
        totalNumbers.countMalesAtLeastFive,
        totalNumbers.countMalesBelowFive,
        totalNumbers.countUnspecifiedSexAndAge,
      ],
      color: "#72d5fb",
    },
  ];

  const chartData = getOptions(
    strings(
      stringKeys.dashboard.reportsPerFeatureAndDate.numberOfReports,
      true,
    ),
    series,
    categories,
  );

  return (
    <Card
      data-printable={true}
      onMouseEnter={() => trackHoveredChart("hoveredReportSexAgeChart")}
      onTouchStart={() => trackHoveredChart("hoveredReportSexAgeChart")}
    >
      <CardHeader
        title={
          <Typography variant="h5">
            {strings(stringKeys.dashboard.reportsPerFeatureAndDate.title)}
          </Typography>
        }
      />
      <CardContent>
        <HighchartsReact
          highcharts={Highcharts}
          ref={(element) => element && element.chart.reflow()}
          options={chartData}
        />
      </CardContent>
    </Card>
  );
};
