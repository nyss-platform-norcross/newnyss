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

const dummyData = {
  data: [
    {
      healthRiskId: 1,
      name: "AWD",
      data: [
        { date: "07/02/24", count: 5 },
        { date: "08/02/24", count: 10 },
        { date: "11/02/24", count: 11 },
        { date: "12/02/24", count: 16 },
        { date: "10/02/24", count: 4 },
        { date: "06/02/24", count: 2 },
        { date: "06/12/23", count: 2 },
      ],
    },
    {
      healthRiskId: 2,
      name: "Fever and rash",
      data: [
        { date: "07/02/24", count: 3 },
        { date: "08/02/24", count: 9 },
        { date: "10/02/24", count: 20 },
        { date: "13/02/24", count: 11 },
        { date: "11/02/24", count: 5 },
        { date: "12/02/24", count: 17 },
        { date: "06/02/24", count: 14 },
        { date: "05/02/24", count: 13 },
      ],
    },
  ],
};

export const DashboardKeptReportByHealthRiskChart = ({ data }) => {
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

  const formatDate = (date) => {
    const [day, month, year] = date.split("/").map(Number);
    const dateObject = new Date(2000 + year, month - 1, day); // Year 2000 is arbitrary, as the years are represented as two-digit
    return dateObject;
  };

  const generateIntervalDates = (data) => {
    const allDates = data.map((datum) => formatDate(datum.date));
    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));

    const intervalDates = [];
    for (
      let date = new Date(minDate);
      date <= maxDate;
      date.setDate(date.getDate() + 1)
    ) {
      intervalDates.push(new Date(date));
    }

    return intervalDates.map((date) =>
      date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }),
    );
  };

  const fillMissingDates = (data, formattedDates) => {
    const existingDates = new Set(data.map((datum) => datum.date));
    formattedDates.forEach((date) => {
      if (!existingDates.has(date)) {
        data.push({ date, count: 0 });
      }
    });
    data.sort((a, b) => formatDate(a.date) - formatDate(b.date));
  };

  let categories = [];
  let seriesData = [];

  if (selectedHealthRisk) {
    const selectedHealthRiskData = dummyData.data.find(
      (data) => data.healthRiskId === selectedHealthRisk,
    );
    const formattedDates = generateIntervalDates(selectedHealthRiskData.data);
    fillMissingDates(selectedHealthRiskData.data, formattedDates);

    categories = formattedDates;
    seriesData.push({
      name: selectedHealthRiskData.name,
      data: selectedHealthRiskData.data.map((datum) => datum.count),
    });
  } else {
    // Find minimum and maximum dates
    const allDates = [];
    dummyData.data.forEach((healthRisk) => {
      healthRisk.data.forEach((datum) => {
        allDates.push(datum.date);
      });
    });
    const minDate = new Date(
      Math.min(...allDates.map((date) => formatDate(date))),
    );
    const maxDate = new Date(
      Math.max(...allDates.map((date) => formatDate(date))),
    );

    // Generate all dates within the interval
    const intervalDates = [];
    for (
      let date = new Date(minDate);
      date <= maxDate;
      date.setDate(date.getDate() + 1)
    ) {
      intervalDates.push(new Date(date));
    }

    // Convert dates to string format
    categories = intervalDates.map((date) =>
      date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      }),
    );

    // Fill in missing counts for each health risk
    dummyData.data.forEach((healthRisk) => {
      const counts = new Map(
        healthRisk.data.map(({ date, count }) => [date, count]),
      );
      seriesData.push({
        name: healthRisk.name,
        data: categories.map((date) => counts.get(date) || 0),
      });
    });
  }

  const chartData = getOptions(
    strings(stringKeys.dashboard.reportsPerHealthRisk.numberOfReports, true),
    seriesData,
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
          {dummyData.data.map((healthRisk) => (
            <Chip
              key={healthRisk.healthRiskId}
              label={healthRisk.name}
              style={{
                marginRight: "10px",
                fontWeight:
                  selectedHealthRisk === healthRisk.healthRiskId
                    ? "bold"
                    : "normal",
              }}
              onClick={() => toggleHealthRisk(healthRisk.healthRiskId)}
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
