import styles from "./NationalSocietyDashboardPage.module.scss";
import React, { Fragment, useRef, useState } from "react";
import PropTypes from "prop-types";
import { connect, useSelector } from "react-redux";
import * as nationalSocietyDashboardActions from "./logic/nationalSocietyDashboardActions";
import { withLayout } from "../../utils/layout";
import Layout from "../layout/Layout";
import { Grid, Typography, makeStyles, useMediaQuery } from "@material-ui/core";
import { Loading } from "../common/loading/Loading";
import { useMount } from "../../utils/lifecycle";
import { NationalSocietyDashboardFilters } from "./components/NationalSocietyDashboardFilters";
import { NationalSocietyDashboardNumbers } from "./components/NationalSocietyDashboardNumbers";
import { strings, stringKeys } from "../../strings";
import SubmitButton from "../common/buttons/submitButton/SubmitButton";
import { DashboardReportsMap } from "../dashboardCharts/DashboardReportsMap";
import { DashboardReportVillageChart } from "../dashboardCharts/DashboardReportVillageChart";
import { DashboardReportChart } from "../dashboardCharts/DashboardReportChart";
import { DashboardReportSexAgeChart } from "../dashboardCharts/DashboardReportSexAgeChart";
import { DashboardReportSexAgeTable } from "../dashboardTables/DashboardReportSexAgeTable";
import { trackEvent, trackPageView } from "../../utils/appInsightsHelper";
import { RcIcon } from "../icons/RcIcon";


const useStyles = makeStyles((theme) => ({
  mapExpanded: {
    transition: "0.3s"
  },
  mapCollapsed: {
    transition: "0.3s"
  },
  mapButton: {
    fontSize: "2rem",
    position: "absolute",
    zIndex: 1000,
    right: 0,
    top: -2,
    "&:hover": {
        cursor: "pointer"
    }
  }
}));

const NationalSocietyDashboardPageComponent = ({
  nationalSocietyId,
  openDashboard,
  getDashboardData,
  isGeneratingPdf,
  isFetching,
  userRoles,
  generateNationalSocietyPdf,
  ...props
}) => {
  useMount(() => {
    openDashboard(props.match.params.nationalSocietyId);

    // Track page view
    trackPageView("NationalSocietyDashboardPage");
  });

  const useRtlDirection = useSelector(
    (state) => state.appData.direction === "rtl",
  );

  const dashboardElement = useRef(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const classes = useStyles();
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down("sm"))

  const handleFiltersChange = (filters) =>
    getDashboardData(nationalSocietyId, filters);

  if (!props.filters) {
    return <Loading />;
  }

  const handleGeneratePdf = () => {
    trackEvent("exportNationalSocietyDashboardPdf", { exportFileType: "Pdf" });

    const initialState = isFilterExpanded;
    setIsFilterExpanded(true);
    const timer = setTimeout(() => {
      generateNationalSocietyPdf(dashboardElement.current);
      setIsFilterExpanded(initialState);
    }, 200);
    return () => clearTimeout(timer);
  };

  return (
    <Grid container spacing={2} ref={dashboardElement}>
      <Grid item xs={12} className={styles.filtersGrid}>
        <NationalSocietyDashboardFilters
          healthRisks={props.healthRisks}
          organizations={props.organizations}
          locations={props.locations}
          onChange={handleFiltersChange}
          filters={props.filters}
          isFetching={isFetching}
          isGeneratingPdf={isGeneratingPdf}
          isFilterExpanded={isFilterExpanded}
          setIsFilterExpanded={setIsFilterExpanded}
          userRoles={userRoles}
          rtl={useRtlDirection}
        />
      </Grid>

      {!props.summary ? (
        <Loading />
      ) : (
        <Fragment>
          <Grid item style={{ marginBottom: -20 }}>
            <Typography variant="h5">{strings(stringKeys.dashboard.map.title)}</Typography>
          </Grid>
          <Grid spacing={2} container item xs={12}>
            <Grid item xs={12} md={isMapExpanded ? 8 : 5} style={{ position: "relative" }} className={isMapExpanded ? classes.mapExpanded : classes.mapCollapsed}>
              {!isSmallScreen && <RcIcon className={classes.mapButton} onClick={() => setIsMapExpanded(prev => !prev)} icon={isMapExpanded ? "Collapse" : "Expand"}/>}
              <DashboardReportsMap
                data={props.reportsGroupedByLocation}
                detailsFetching={props.reportsGroupedByLocationDetailsFetching}
                details={props.reportsGroupedByLocationDetails}
                getReportHealthRisks={(lat, long) =>
                  props.getReportHealthRisks(nationalSocietyId, lat, long)
                }
              />
            </Grid>
            <Grid item xs={12} md={isMapExpanded ? 4 : 7}>
              <NationalSocietyDashboardNumbers
                summary={props.summary}
                reportsType={props.filters.reportsType}
                isMapExpanded={isMapExpanded}
              />
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <DashboardReportChart
              data={props.reportsGroupedByHealthRiskAndDate}
            />
          </Grid>

          <Grid item xs={12}>
            <DashboardReportVillageChart
              data={props.reportsGroupedByVillageAndDate}
            />
          </Grid>

          <Grid item xs={12}>
            <DashboardReportSexAgeChart
              data={props.reportsGroupedByFeaturesAndDate}
            />
          </Grid>

          <Grid item sm={6} xs={12}>
            <DashboardReportSexAgeTable data={props.reportsGroupedByFeatures} />
          </Grid>
        </Fragment>
      )}

      <Grid item xs={12}>
        <SubmitButton isFetching={isGeneratingPdf} onClick={handleGeneratePdf}>
          {strings(stringKeys.dashboard.generatePdf)}
        </SubmitButton>
      </Grid>
    </Grid>
  );
};

NationalSocietyDashboardPageComponent.propTypes = {
  openDashboard: PropTypes.func,
};

// Map redux state to component props
const mapStateToProps = (state) => ({
  nationalSocietyId: state.appData.route.params.nationalSocietyId,
  healthRisks: state.nationalSocietyDashboard.filtersData.healthRisks,
  organizations: state.nationalSocietyDashboard.filtersData.organizations,
  locations: state.nationalSocietyDashboard.filtersData.locations,
  summary: state.nationalSocietyDashboard.summary,
  filters: state.nationalSocietyDashboard.filters,
  reportsGroupedByLocation:
    state.nationalSocietyDashboard.reportsGroupedByLocation,
  reportsGroupedByLocationDetails:
    state.nationalSocietyDashboard.reportsGroupedByLocationDetails,
  reportsGroupedByVillageAndDate:
    state.nationalSocietyDashboard.reportsGroupedByVillageAndDate,
  reportsGroupedByLocationDetailsFetching:
    state.nationalSocietyDashboard.reportsGroupedByLocationDetailsFetching,
  isGeneratingPdf: state.nationalSocietyDashboard.isGeneratingPdf,
  isFetching: state.nationalSocietyDashboard.isFetching,
  userRoles: state.appData.user.roles,
  reportsGroupedByHealthRiskAndDate:
    state.nationalSocietyDashboard.reportsGroupedByHealthRiskAndDate,
  reportsGroupedByFeaturesAndDate:
    state.nationalSocietyDashboard.reportsGroupedByFeaturesAndDate,
  reportsGroupedByFeatures:
    state.nationalSocietyDashboard.reportsGroupedByFeatures,
});

const mapDispatchToProps = {
  openDashboard: nationalSocietyDashboardActions.openDashboard.invoke,
  getReportHealthRisks:
    nationalSocietyDashboardActions.getReportHealthRisks.invoke,
  getDashboardData: nationalSocietyDashboardActions.getDashboardData.invoke,
  generateNationalSocietyPdf:
    nationalSocietyDashboardActions.generateNationalSocietyPdf.invoke,
};

export const NationalSocietyDashboardPage = withLayout(
  Layout,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(NationalSocietyDashboardPageComponent),
);
