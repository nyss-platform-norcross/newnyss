import styles from "./ReportFilters.module.scss";

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
import { HealthRiskFilter } from "../../common/filters/HealthRiskFilter";
import useLocalFilters from "../../common/filters/useLocalFilters";
import useLocationFilter from "../../common/filters/useLocationFilter";

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
  //Reducer for local filters state
  const [localFilters, updateLocalFilters] = useLocalFilters(filters);

  //Fetches new data based on changes in filters
  const handleFiltersChange = (filters) => {
    onChange(updateLocalFilters(filters));
  };

  //Syncs locations from redux store with filter state and sets label for location filter to 'All' or "Region (+n)"
  //Neccecary if locations are added, edited or removed, to make all filters checked
  const [locationsFilterLabel] = useLocationFilter(
    locations,
    localFilters,
    updateLocalFilters,
  );

  const handleLocationChange = (newValue) => {
    handleFiltersChange({
      locations: newValue,
    });
  };

  const handleHealthRiskChange = (filteredHealthRisks) =>
    handleFiltersChange({ healthRisks: filteredHealthRisks });

  const handleDataCollectorTypeChange = (event) =>
    handleFiltersChange({ dataCollectorType: event.target.value });

  const handleErrorTypeChange = (event) =>
    handleFiltersChange({ errorType: event.target.value });

  const handleCorrectedStateChange = (event) =>
    handleFiltersChange({ correctedState: event.target.value });

  const handleReportStatusChange = (event) =>
    handleFiltersChange({
      reportStatus: {
        ...localFilters.reportStatus,
        [event.target.name]: event.target.checked,
      },
    });

  const handleTrainingStatusChange = (event) =>
    handleFiltersChange({
      ...localFilters,
      trainingStatus: event.target.value,
    });

  if (!localFilters) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item>
            <LocationFilter
              filteredLocations={localFilters.locations}
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
                    stringKeys.filters.report.unknownSenderReportListType,
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
                  filteredHealthRisks={localFilters.healthRisks}
                  onChange={handleHealthRiskChange}
                  updateValue={updateLocalFilters}
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
                          stringKeys.filters.report.errorTypes[errorType],
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
                          stringKeys.filters.report.correctedStates[state],
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
                    value={localFilters.trainingStatus}
                    onChange={handleTrainingStatusChange}
                    className={styles.radioGroup}
                  >
                    <FormControlLabel
                      className={styles.radio}
                      label={strings(
                        stringKeys.dataCollectors.constants.trainingStatus
                          .Trained,
                      )}
                      value={"Trained"}
                      control={<Radio color="primary" />}
                    />
                    <FormControlLabel
                      className={styles.radio}
                      label={strings(
                        stringKeys.dataCollectors.constants.trainingStatus
                          .InTraining,
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
                  filter={localFilters.reportStatus}
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
