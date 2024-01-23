import React from "react";
import { Card, CardContent, CardHeader, Typography } from "@material-ui/core";
import { strings, stringKeys } from "../../strings";
import { ReportsMap } from "../maps/ReportsMap";
import useHoverChartTracking from "../../utils/useHoverChartTracking";

export const DashboardReportsMap = ({
  data,
  details,
  detailsFetching,
  getReportHealthRisks,
}) => {
  const trackHoveredChart = useHoverChartTracking();
  return (
    <Card data-printable={true} onMouseEnter={() => trackHoveredChart("hoveredReportsMap")}>
      <CardHeader title={<Typography variant="h5">{strings(stringKeys.dashboard.map.title)}</Typography>}/>
      <CardContent>
        <ReportsMap
          data={data}
          details={details}
          detailsFetching={detailsFetching}
          onMarkerClick={getReportHealthRisks}
        />
      </CardContent>
    </Card>
  );
};
