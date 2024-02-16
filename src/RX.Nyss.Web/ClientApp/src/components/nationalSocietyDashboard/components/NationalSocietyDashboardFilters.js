import styles from "./NationalSocietyDashboardFilters.module.scss";
import React from "react";
import { DatePicker } from "../../forms/DatePicker";
import { strings, stringKeys } from "../../../strings";
import {
  useMediaQuery,
  LinearProgress,
  Chip,
  IconButton,
  Grid,
  TextField,
  MenuItem,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
} from "@material-ui/core";
import DateRange from "@material-ui/icons/DateRange";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { ConditionalCollapse } from "../../common/conditionalCollapse/ConditionalCollapse";
import { convertToLocalDate, convertToUtc } from "../../../utils/date";
import { Fragment } from "react";
import { ReportStatusFilter } from "../../common/filters/ReportStatusFilter";
import { DataConsumer } from "../../../authentication/roles";
import LocationFilter from "../../common/filters/LocationFilter";
import { HealthRiskFilter } from "../../common/filters/HealthRiskFilter";
import useLocalFilters from "../../common/filters/useLocalFilters";
import useLocationFilter from "../../common/filters/useLocationFilter";
import { useEffect } from "react";
import { trackEvent } from "../../../utils/appInsightsHelper";

//Filters components should probably fetch data from redux store themselves
export const NationalSocietyDashboardFilters = ({
  filters,
  healthRisks,
  organizations,
  locations,
  onChange,
  isFetching,
  isGeneratingPdf,
  userRoles,
  isFilterExpanded,
  setIsFilterExpanded,
  rtl,
}) => {
  //Reducer for local filters state
  const [localFilters, updateLocalFilters] = useLocalFilters(filters);

  useEffect(() => {  
    updateLocalFilters(filters);
  }, [filters]);

  //Fetches new data based on changes in filters
  const handleFiltersChange = (filters) => {
    trackEvent("NsDashboardFilterChange", {filters});
    onChange(updateLocalFilters(filters));
  };

  //Syncs locations from redux store with filter state and sets label for location filter to 'All' or "Region (+n)"
  //Neccecary if locations are added, edited or removed, to make all filters checked
  const [locationsFilterLabel] = useLocationFilter(
    locations,
    localFilters,
    updateLocalFilters,
  );

  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("lg"));

  const collectionsTypes = {
    all: strings(stringKeys.dashboard.filters.allReportsType),
    dataCollector: strings(
      stringKeys.dashboard.filters.dataCollectorReportsType,
    ),
    dataCollectionPoint: strings(
      stringKeys.dashboard.filters.dataCollectionPointReportsType,
    ),
  };

  const handleLocationChange = (locations) => {
    handleFiltersChange({ locations: locations });
  };
  const handleHealthRiskChange = (filteredHealthRisks) =>
    handleFiltersChange({ healthRisks: filteredHealthRisks });

  {/* See comment below, (organization filter comment), explaining commented out code */}
  // const handleOrganizationChange = (event) =>
  //   handleFiltersChange({
  //     organizationId: event.target.value === 0 ? null : event.target.value,
  //   });

  const handleDateFromChange = (date) =>
    handleFiltersChange({ startDate: convertToUtc(date) });

  const handleDateToChange = (date) =>
    handleFiltersChange({ endDate: convertToUtc(date) });

  const handleGroupingTypeChange = (event) =>
    handleFiltersChange({ groupingType: event.target.value });

  const handleDataCollectorTypeChange = (event) =>
    handleFiltersChange({ dataCollectorType: event.target.value });

  const handleReportStatusChange = (event) =>
    handleFiltersChange({
      reportStatus: {
        ...localFilters.reportStatus,
        [event.target.name]: event.target.checked,
      },
    });
  const allLocationsSelected = () =>
    !localFilters.locations ||
    localFilters.locations.regionIds.length === locations.regions.length;

  if (!localFilters) {
    return null;
  }

  return (
    <Card className={styles.filters}>
      {isFetching && <LinearProgress color="primary" />}
        <CardContent className={styles.collapsedFilterBar}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <CardHeader title={<Typography variant="h5">{strings(stringKeys.dashboard.filters.title)}</Typography>} className={isFilterExpanded ? styles.filterTitle : null}/>
            </Grid>
            {!isGeneratingPdf && !isFilterExpanded && (
              <Fragment>
                <Grid item>
                  <Chip
                    icon={<DateRange />}
                    label={`${convertToLocalDate(localFilters.startDate).format(
                      "YYYY-MM-DD",
                    )} - ${convertToLocalDate(localFilters.endDate).format(
                      "YYYY-MM-DD",
                    )}`}
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  />
                </Grid>
                <Grid item>
                  <Chip
                    label={
                      localFilters.groupingType === "Day"
                        ? strings(stringKeys.dashboard.filters.timeGroupingDay)
                        : strings(stringKeys.dashboard.filters.timeGroupingWeek)
                    }
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  />
                </Grid>
              </Fragment>
            )}
            {!isGeneratingPdf && !isFilterExpanded && !allLocationsSelected() && (
              <Grid item>
                <Chip
                  label={locationsFilterLabel}
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                />
              </Grid>
            )}
            {!isGeneratingPdf && !isFilterExpanded && localFilters.healthRiskId && (
              <Grid item>
                <Chip
                  label={
                    healthRisks.filter(
                      (hr) => hr.id === localFilters.healthRiskId,
                    )[0].name
                  }
                  onDelete={() => handleFiltersChange({ healthRiskId: null })}
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                />
              </Grid>
            )}
            {!isGeneratingPdf && !isFilterExpanded && localFilters.dataCollectorType !== "all" && (
              <Grid item>
                <Chip
                  label={collectionsTypes[localFilters.dataCollectorType]}
                  onDelete={() =>
                    handleFiltersChange({ dataCollectorType: "all" })
                  }
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                />
              </Grid>
            )}

            {/* See comment below, (organization filter comment), explaining commented out code */}
            {/* {!isFilterExpanded && localFilters.organizationId && (
              <Grid item>
                <Chip
                  label={
                    organizations.filter(
                      (o) => o.id === localFilters.organizationId,
                    )[0].name
                  }
                  onDelete={() => handleFiltersChange({ organizationId: null })}
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                />
              </Grid>
            )} */}
            {!isGeneratingPdf && !isFilterExpanded &&
              !userRoles.some((r) => r === DataConsumer) &&
              localFilters.reportStatus.kept && (
                <Grid item>
                  <Chip
                    label={strings(stringKeys.filters.report.kept)}
                    onDelete={() =>
                      handleFiltersChange({
                        reportStatus: {
                          ...localFilters.reportStatus,
                          kept: false,
                        },
                      })
                    }
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  />
                </Grid>
              )}
            {!isGeneratingPdf && !isFilterExpanded &&
              !userRoles.some((r) => r === DataConsumer) &&
              localFilters.reportStatus.notCrossChecked && (
                <Grid item>
                  <Chip
                    label={strings(stringKeys.filters.report.notCrossChecked)}
                    onDelete={() =>
                      handleFiltersChange({
                        reportStatus: {
                          ...localFilters.reportStatus,
                          notCrossChecked: false,
                        },
                      })
                    }
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  />
                </Grid>
              )}
            <Grid
              item
              className={`${styles.expandFilterButton} ${
                rtl ? styles.rtl : ""
              }`}
            >
              <IconButton
                data-expanded={isFilterExpanded}
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              >
                <ExpandMore />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      <ConditionalCollapse
        collapsible={!isGeneratingPdf}
        expanded={isFilterExpanded}
      >
        <CardContent data-printable={true}>
          <Grid container spacing={2}>
            <Grid item>
              <DatePicker
                className={styles.filterDate}
                onChange={handleDateFromChange}
                label={strings(stringKeys.dashboard.filters.startDate)}
                value={convertToLocalDate(localFilters.startDate)}
              />
            </Grid>

            <Grid item>
              <DatePicker
                className={styles.filterDate}
                onChange={handleDateToChange}
                label={strings(stringKeys.dashboard.filters.endDate)}
                value={convertToLocalDate(localFilters.endDate)}
              />
            </Grid>

            <Grid item>
              <FormControl>
                <FormLabel component="legend">
                  {strings(stringKeys.dashboard.filters.timeGrouping)}
                </FormLabel>
                <RadioGroup
                  value={localFilters.groupingType}
                  onChange={handleGroupingTypeChange}
                  className={styles.radioGroup}
                >
                  <FormControlLabel
                    className={styles.radio}
                    label={strings(
                      stringKeys.dashboard.filters.timeGroupingDay,
                    )}
                    value={"Day"}
                    control={<Radio color="primary" />}
                  />
                  <FormControlLabel
                    className={styles.radio}
                    label={strings(
                      stringKeys.dashboard.filters.timeGroupingWeek,
                    )}
                    value={"Week"}
                    control={<Radio color="primary" />}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item>
              <LocationFilter
                filteredLocations={localFilters.locations}
                filterLabel={locationsFilterLabel}
                allLocations={locations}
                onChange={handleLocationChange}
                rtl={rtl}
              />
            </Grid>

            <Grid item>
              <HealthRiskFilter
                allHealthRisks={healthRisks}
                filteredHealthRisks={localFilters.healthRisks}
                onChange={handleHealthRiskChange}
                updateValue={updateLocalFilters}
                rtl={rtl}
              />
            </Grid>
            <Grid item>
              <TextField
                select
                label={strings(stringKeys.dashboard.filters.reportsType)}
                onChange={handleDataCollectorTypeChange}
                value={localFilters.dataCollectorType}
                className={styles.filterItem}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="all">{collectionsTypes["all"]}</MenuItem>
                <MenuItem value="dataCollector">
                  {collectionsTypes["dataCollector"]}
                </MenuItem>
                <MenuItem value="dataCollectionPoint">
                  {collectionsTypes["dataCollectionPoint"]}
                </MenuItem>
              </TextField>
            </Grid>

            {/* NOTE: The organization filter is commented out since the overall multiple organization implementation in Nyss is currently deprecated/unclear of how it should be used. Don't delete commented code before clarification. Commented code causes an error. */}
            {/* {organizations.length > 1 && (
              <Grid item>
                <TextField
                  select
                  label={strings(stringKeys.dashboard.filters.organization)}
                  onChange={handleOrganizationChange}
                  value={localFilters.organizationId || 0}
                  className={styles.filterItem}
                  InputLabelProps={{ shrink: true }}
                >
                  <MenuItem value={0}>
                    {strings(stringKeys.dashboard.filters.organizationsAll)}
                  </MenuItem>

                  {organizations.map((organization) => (
                    <MenuItem
                      key={`filter_organization_${organization.id}`}
                      value={organization.id}
                    >
                      {organization.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )} */}

            {!userRoles.some((r) => r === DataConsumer) && (
              <Grid item>
                <ReportStatusFilter
                  filter={localFilters.reportStatus}
                  correctReports
                  showDismissedFilter
                  doNotWrap
                  onChange={handleReportStatusChange}
                />
              </Grid>
            )}
          </Grid>
        </CardContent>
      </ConditionalCollapse>
    </Card>
  );
};
