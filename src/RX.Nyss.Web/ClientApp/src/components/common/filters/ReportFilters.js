import styles from "./ReportFilters.module.scss";

import { useEffect, useState } from "react";
import {
  Grid,
  MenuItem,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@material-ui/core";
import { strings, stringKeys } from "../../../strings";
import {
  reportErrorFilterTypes,
  DataCollectorType,
  correctedStateTypes,
} from "./logic/reportFilterConstsants";
import { Fragment } from "react";
import { ReportStatusFilter } from "./ReportStatusFilter";
import LocationFilter from "./LocationFilter";
import { renderFilterLabel } from "./logic/locationFilterService";
import { HealthRiskFilter } from "../../common/filters/HealthRiskFilter";

export const ReportFilters = ({
  filters,
  healthRisks,
  locations,
  onChange,
  showCorrectReportFilters,
  hideTrainingStatusFilter,
  hideCorrectedFilter,
  rtl,
}) => {
  const [value, setValue] = useState(filters);

  const [locationsFilterLabel, setLocationsFilterLabel] = useState(
    strings(stringKeys.filters.area.all)
  );
  const updateValue = (change) => {
    const newValue = {
      ...value,
      ...change,
    };

    setValue((prev) => ({ ...prev, ...change }));
    return newValue;
  };

  // Sets label for location filter to 'All' or "Region (+n)"
  useEffect(() => {
    const label =
      !value || !locations || !value.locations || value.locations.regionIds.length === 0
        ? strings(stringKeys.filters.area.all)
        : renderFilterLabel(value.locations, locations.regions, true);
    setLocationsFilterLabel(label);
  }, [value.locations]);


  // useEffect which runs on mount and when locations are added, edited or removed. Updates locations in the filter state in order to avoid mismatch between locations and filtered locations
  useEffect(() => {
    if (!locations) return;

    const filterValue = {
      regionIds: locations.regions.map((region) => region.id),
      districtIds: locations.regions.map((region) => region.districts.map((district) => district.id)).flat(),
      villageIds: locations.regions.map((region) => region.districts.map((district) => district.villages.map((village) => village.id))).flat(2),
      zoneIds: locations.regions.map((region) => region.districts.map((district) => district.villages.map((village) => village.zones.map((zone) => zone.id)))).flat(3),
      includeUnknownLocation: false,
    }

    updateValue({ locations: filterValue });
  }, [locations]);

  const handleLocationChange = (newValue) => {
    onChange(
      updateValue({
        locations: newValue,
      })
    );
  };

  const handleHealthRiskChange = (filteredHealthRisks) =>
    onChange(updateValue({ healthRisks: filteredHealthRisks }));

  const handleDataCollectorTypeChange = (event) =>
    onChange(updateValue({ dataCollectorType: event.target.value }));

  const handleErrorTypeChange = (event) =>
    onChange(updateValue({ errorType: event.target.value }));

  const handleCorrectedStateChange = (event) =>
    onChange(updateValue({ correctedState: event.target.value }));

  const handleReportStatusChange = (event) =>
    onChange(
      updateValue({
        reportStatus: {
          ...value.reportStatus,
          [event.target.name]: event.target.checked,
        },
      })
    );

  const handleTrainingStatusChange = (event) =>
    onChange(
      updateValue({
        ...value,
        trainingStatus: event.target.value,
      })
    );

  if (!value) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item>
            <LocationFilter
              filteredLocations={value.locations}
              allLocations={locations}
              onChange={handleLocationChange}
              showUnknownLocation
              filterLabel={locationsFilterLabel}
              rtl={rtl}
            />
          </Grid>

          <Grid item>
            <FormControl className={styles.filterItem}>
              <InputLabel>
                {strings(stringKeys.filters.report.selectReportListType)}
              </InputLabel>
              <Select
                onChange={handleDataCollectorTypeChange}
                value={filters.dataCollectorType}
              >
                <MenuItem value={DataCollectorType.unknownSender}>
                  {strings(
                    stringKeys.filters.report.unknownSenderReportListType
                  )}
                </MenuItem>
                <MenuItem value={DataCollectorType.human}>
                  {strings(stringKeys.filters.report.mainReportsListType)}
                </MenuItem>
                <MenuItem value={DataCollectorType.collectionPoint}>
                  {strings(stringKeys.filters.report.dcpReportListType)}
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {showCorrectReportFilters && (
            <Fragment>
              <Grid item>
                <HealthRiskFilter
                  allHealthRisks={healthRisks}
                  filteredHealthRisks={value.healthRisks}
                  onChange={handleHealthRiskChange}
                  updateValue={updateValue}
                  rtl={rtl}
                />
              </Grid>
            </Fragment>
          )}

          {!showCorrectReportFilters && (
            <Fragment>
              <Grid item>
                <FormControl className={styles.filterItem}>
                  <InputLabel>
                    {strings(stringKeys.filters.report.selectErrorType)}
                  </InputLabel>
                  <Select
                    onChange={handleErrorTypeChange}
                    value={filters.errorType}
                  >
                    {reportErrorFilterTypes.map((errorType) => (
                      <MenuItem
                        value={errorType}
                        key={`errorfilter_${errorType}`}
                      >
                        {strings(
                          stringKeys.filters.report.errorTypes[errorType]
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Fragment>
          )}

          {!showCorrectReportFilters && !hideCorrectedFilter && (
            <Fragment>
              <Grid item>
                <FormControl className={styles.filterItem}>
                  <InputLabel>
                    {strings(stringKeys.filters.report.isCorrected)}
                  </InputLabel>
                  <Select
                    onChange={handleCorrectedStateChange}
                    value={filters.correctedState}
                  >
                    {correctedStateTypes.map((state) => (
                      <MenuItem value={state} key={`correctedState_${state}`}>
                        {strings(
                          stringKeys.filters.report.correctedStates[state]
                        )}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Fragment>
          )}

          {!hideTrainingStatusFilter && (
            <Fragment>
              <Grid item>
                <FormControl>
                  <FormLabel component="legend">
                    {strings(stringKeys.dashboard.filters.trainingStatus)}
                  </FormLabel>
                  <RadioGroup
                    value={value.trainingStatus}
                    onChange={handleTrainingStatusChange}
                    className={styles.radioGroup}
                  >
                    <FormControlLabel
                      className={styles.radio}
                      label={strings(
                        stringKeys.dataCollectors.constants.trainingStatus
                          .Trained
                      )}
                      value={"Trained"}
                      control={<Radio color="primary" />}
                    />
                    <FormControlLabel
                      className={styles.radio}
                      label={strings(
                        stringKeys.dataCollectors.constants.trainingStatus
                          .InTraining
                      )}
                      value={"InTraining"}
                      control={<Radio color="primary" />}
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Fragment>
          )}

          {showCorrectReportFilters && (
            <Fragment>
              <Grid item>
                <ReportStatusFilter
                  filter={value.reportStatus}
                  onChange={handleReportStatusChange}
                  correctReports={showCorrectReportFilters}
                  showDismissedFilter
                />
              </Grid>
            </Fragment>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};
