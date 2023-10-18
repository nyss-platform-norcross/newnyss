import styles from "./NationalSocietyDashboardFilters.module.scss";
import React, { useState, useEffect } from "react";
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
} from "@material-ui/core";
import DateRange from "@material-ui/icons/DateRange";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { ConditionalCollapse } from "../../common/conditionalCollapse/ConditionalCollapse";
import { convertToLocalDate, convertToUtc } from "../../../utils/date";
import { Fragment } from "react";
import { ReportStatusFilter } from "../../common/filters/ReportStatusFilter";
import { DataConsumer } from "../../../authentication/roles";
import LocationFilter from "../../common/filters/LocationFilter";
import { renderFilterLabel } from "../../common/filters/logic/locationFilterService";
import { HealthRiskFilter } from "../../common/filters/HealthRiskFilter";
import useLocalFilters from "../../common/filters/useLocalFilters";
import useLocationFilter from "../../common/filters/useLocationFilter";

//TODO: Filters components should probably fetch data from redux store themselves
export const NationalSocietyDashboardFilters = ({
  filters,
  healthRisks,
  organizations,
  locations,
  onChange,
  isFetching,
  userRoles,
  rtl,
}) => {
  //Reducer for local filters state
  const [localFilters, updateLocalFilters] = useLocalFilters(filters);
  //Updates redux store with local filters state when local filters state changes
  useEffect(() => {
    localFilters.changed && onChange(localFilters.value);
  }, [localFilters, onChange]);

  //Syncs locations from redux store with filter state and sets label for location filter to 'All' or "Region (+n)"
  //Neccecary if locations are added, edited or removed, to make all filters checked
  //Should not be neccecary if state is managed correctly, quick fix but needs rework
  //TODO: Move to Location Filter component
  const [locationsFilterLabel] = useLocationFilter(locations, localFilters, updateLocalFilters)

  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down("lg"));
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  const collectionsTypes = {
    all: strings(stringKeys.dashboard.filters.allReportsType),
    dataCollector: strings(
      stringKeys.dashboard.filters.dataCollectorReportsType
    ),
    dataCollectionPoint: strings(
      stringKeys.dashboard.filters.dataCollectionPointReportsType
    ),
  };

  const handleLocationChange = (locations) => {
    updateLocalFilters({ locations: locations });
  };
  const handleHealthRiskChange = (filteredHealthRisks) =>
    updateLocalFilters({ healthRisks: filteredHealthRisks });

  const handleOrganizationChange = (event) =>

      updateLocalFilters({
        organizationId: event.target.value === 0 ? null : event.target.value,
      })
    ;

  const handleDateFromChange = (date) =>
    updateLocalFilters({ startDate: convertToUtc(date) });

  const handleDateToChange = (date) =>
    updateLocalFilters({ endDate: convertToUtc(date) });

  const handleGroupingTypeChange = (event) =>
    updateLocalFilters({ groupingType: event.target.value });

  const handleDataCollectorTypeChange = (event) =>
    updateLocalFilters({ dataCollectorType: event.target.value });

  const handleReportStatusChange = (event) =>

      updateLocalFilters({
        reportStatus: {
          ...localFilters.value.reportStatus,
          [event.target.name]: event.target.checked,
        },
      })
    ;

  const allLocationsSelected = () =>
    !localFilters.value.locations ||
    localFilters.value.locations.regionIds.length === locations.regions.length;


  if (!localFilters) {
    return null;
  }

  return (
    <Card className={styles.filters}>
      {isFetching && <LinearProgress color="primary" />}
      {isSmallScreen && (
        <CardContent className={styles.collapsedFilterBar}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <CardHeader title={strings(stringKeys.dashboard.filters.title)} />
            </Grid>
            {!isFilterExpanded && (
              <Fragment>
                <Grid item>
                  <Chip
                    icon={<DateRange />}
                    label={`${convertToLocalDate(localFilters.value.startDate).format(
                      "YYYY-MM-DD"
                    )} - ${convertToLocalDate(localFilters.value.endDate).format(
                      "YYYY-MM-DD"
                    )}`}
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  />
                </Grid>
                <Grid item>
                  <Chip
                    label={
                      localFilters.value.groupingType === "Day"
                        ? strings(stringKeys.dashboard.filters.timeGroupingDay)
                        : strings(stringKeys.dashboard.filters.timeGroupingWeek)
                    }
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  />
                </Grid>
              </Fragment>
            )}
            {!isFilterExpanded && !allLocationsSelected() && (
              <Grid item>
                <Chip
                  label={locationsFilterLabel}
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                />
              </Grid>
            )}
            {!isFilterExpanded && localFilters.value.healthRiskId && (
              <Grid item>
                <Chip
                  label={
                    healthRisks.filter((hr) => hr.id === localFilters.value.healthRiskId)[0]
                      .name
                  }
                  onDelete={() => updateLocalFilters({ healthRiskId: null })}
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                />
              </Grid>
            )}
            {!isFilterExpanded && localFilters.value.dataCollectorType !== "all" && (
              <Grid item>
                <Chip
                  label={collectionsTypes[localFilters.value.dataCollectorType]}
                  onDelete={() =>
                    updateLocalFilters({ dataCollectorType: "all" })
                  }
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                />
              </Grid>
            )}
            {!isFilterExpanded && localFilters.value.organizationId && (
              <Grid item>
                <Chip
                  label={
                    organizations.filter(
                      (o) => o.id === localFilters.value.organizationId
                    )[0].name
                  }
                  onDelete={() =>
                    updateLocalFilters({ organizationId: null })
                  }
                  onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                />
              </Grid>
            )}
            {!isFilterExpanded &&
              !userRoles.some((r) => r === DataConsumer) &&
              localFilters.value.reportStatus.kept && (
                <Grid item>
                  <Chip
                    label={strings(stringKeys.filters.report.kept)}
                    onDelete={() =>

                        updateLocalFilters({
                          reportStatus: {
                            ...localFilters.value.reportStatus,
                            kept: false,
                          },
                        })

                    }
                    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                  />
                </Grid>
              )}
            {!isFilterExpanded &&
              !userRoles.some((r) => r === DataConsumer) &&
              localFilters.value.reportStatus.notCrossChecked && (
                <Grid item>
                  <Chip
                    label={strings(stringKeys.filters.report.notCrossChecked)}
                    onDelete={() =>

                        updateLocalFilters({
                          reportStatus: {
                            ...localFilters.value.reportStatus,
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
              className={`${styles.expandFilterButton} ${rtl ? styles.rtl : ""
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
      )}
      <ConditionalCollapse
        collapsible={isSmallScreen}
        expanded={isFilterExpanded}
      >
        {!isSmallScreen && (
          <Grid container spacing={2}>
            <CardHeader
              title={strings(stringKeys.dashboard.filters.title)}
              className={styles.filterTitle}
            />
          </Grid>
        )}
        <CardContent data-printable={true}>
          <Grid container spacing={2}>
            <Grid item>
              <DatePicker
                className={styles.filterDate}
                onChange={handleDateFromChange}
                label={strings(stringKeys.dashboard.filters.startDate)}
                value={convertToLocalDate(localFilters.value.startDate)}
              />
            </Grid>

            <Grid item>
              <DatePicker
                className={styles.filterDate}
                onChange={handleDateToChange}
                label={strings(stringKeys.dashboard.filters.endDate)}
                value={convertToLocalDate(localFilters.value.endDate)}
              />
            </Grid>

            <Grid item>
              <FormControl>
                <FormLabel component="legend">
                  {strings(stringKeys.dashboard.filters.timeGrouping)}
                </FormLabel>
                <RadioGroup
                  value={localFilters.value.groupingType}
                  onChange={handleGroupingTypeChange}
                  className={styles.radioGroup}
                >
                  <FormControlLabel
                    className={styles.radio}
                    label={strings(
                      stringKeys.dashboard.filters.timeGroupingDay
                    )}
                    value={"Day"}
                    control={<Radio color="primary" />}
                  />
                  <FormControlLabel
                    className={styles.radio}
                    label={strings(
                      stringKeys.dashboard.filters.timeGroupingWeek
                    )}
                    value={"Week"}
                    control={<Radio color="primary" />}
                  />
                </RadioGroup>
              </FormControl>
            </Grid>

            <Grid item>
              <LocationFilter
                filteredLocations={localFilters.value.locations}
                filterLabel={locationsFilterLabel}
                allLocations={locations}
                onChange={handleLocationChange}
                rtl={rtl}
              />
            </Grid>

            <Grid item>
              <HealthRiskFilter
                allHealthRisks={healthRisks}
                filteredHealthRisks={localFilters.value.healthRisks}
                onChange={handleHealthRiskChange}
                updateValue={updateLocalFilters}
              />
            </Grid>
            <Grid item>
              <TextField
                select
                label={strings(stringKeys.dashboard.filters.reportsType)}
                onChange={handleDataCollectorTypeChange}
                value={localFilters.value.dataCollectorType}
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

            {organizations.length > 1 && (
              <Grid item>
                <TextField
                  select
                  label={strings(stringKeys.dashboard.filters.organization)}
                  onChange={handleOrganizationChange}
                  value={localFilters.value.organizationId || 0}
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
            )}

            {!userRoles.some((r) => r === DataConsumer) && (
              <Grid item>
                <ReportStatusFilter
                  filter={localFilters.value.reportStatus}
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
    </Card >
  );
};
