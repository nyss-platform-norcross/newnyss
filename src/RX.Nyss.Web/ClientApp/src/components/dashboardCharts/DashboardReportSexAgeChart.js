import React, { useState } from "react";
import { Card, CardContent, CardHeader, Typography } from "@material-ui/core";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { strings, stringKeys } from "../../strings";
import { trackEvent } from "../../utils/appInsightsHelper";

const getOptions = (valuesLabel, series, categories) => ({
  chart: {
    type: "column",
    backgroundColor: "transparent",
    style: {
      fontFamily: "Arial",
    },
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
      stacking: "normal",
    },
  },
  tooltip: {
    headerFormat: "",
    pointFormat: "{series.name}: <b>{point.y}</b>",
  },
  series,
});

export const DashboardReportSexAgeChart = ({ data }) => {
  const [hasHoveredChart, setHasHoveredChart] = useState(false);
  const categories = data.map((d) => d.period);

  const series = [
    {
      name: strings(
        stringKeys.dashboard.reportsPerFeatureAndDate.femalesAbove5,
        true,
      ),
      data: data.map((d) => d.countFemalesAtLeastFive),
      color: "#078e5e",
    },
    {
      name: strings(
        stringKeys.dashboard.reportsPerFeatureAndDate.femalesBelow5,
        true,
      ),
      data: data.map((d) => d.countFemalesBelowFive),
      color: "#47c79a",
    },
    {
      name: strings(
        stringKeys.dashboard.reportsPerFeatureAndDate.malesAbove5,
        true,
      ),
      data: data.map((d) => d.countMalesAtLeastFive),
      color: "#00a0dc",
    },
    {
      name: strings(
        stringKeys.dashboard.reportsPerFeatureAndDate.malesBelow5,
        true,
      ),
      data: data.map((d) => d.countMalesBelowFive),
      color: "#72d5fb",
    },
    {
      name: strings(
        stringKeys.dashboard.reportsPerFeatureAndDate.unspecifiedSexAndAge,
        true,
      ),
      data: data.map((d) => d.countUnspecifiedSexAndAge),
      color: "#c2b5ce",
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

  const hoverFunc = () => {
    if (!hasHoveredChart){
      trackEvent("hoveredReportSexAgeChart");
      setHasHoveredChart(true)};
    };
  return (
    <Card data-printable={true} onMouseEnter={hoverFunc}>
      <CardHeader title={<Typography variant="h5">{strings(stringKeys.dashboard.reportsPerFeatureAndDate.title)}</Typography>}/>
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
