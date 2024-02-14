import React from "react";
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
    <div style={{ height: "100%" }} data-printable={true} onMouseEnter={() => trackHoveredChart("hoveredReportsMap")} onTouchStart={() => trackHoveredChart("hoveredReportsMap")}>
      <ReportsMap
        data={data}
        details={details}
        detailsFetching={detailsFetching}
        onMarkerClick={getReportHealthRisks}
      />
    </div>
  );
};
