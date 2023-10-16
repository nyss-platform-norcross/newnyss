import styles from "./ReportFilters.module.scss";

import { useEffect } from "react";
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
  //Updates redux store with local filters state when local filters state changes
  useEffect(() => {
    localFilters.changed && onChange(localFilters.value);
  }, [localFilters, onChange]);

  //Syncs locations from redux store with filter state and sets label for location filter to 'All' or "Region (+n)"
  //Neccecary if locations are added, edited or removed, to make all filters checked
  //Should not be neccecary if state is managed correctly, quick fix but needs rework
  const [locationsFilterLabel] = useLocationFilter(locations, localFilters, updateLocalFilters)


  const handleLocationChange = (newValue) => {
    updateLocalFilters({
        locations: newValue,
      })
  };

  const handleHealthRiskChange = (filteredHealthRisks) =>
    updateLocalFilters({ healthRisks: filteredHealthRisks });

  const handleDataCollectorTypeChange = (event) =>
    updateLocalFilters({ dataCollectorType: event.target.value });

  const handleErrorTypeChange = (event) =>
    updateLocalFilters({ errorType: event.target.value });

  const handleCorrectedStateChange = (event) =>
    updateLocalFilters({ correctedState: event.target.value });

  const handleReportStatusChange = (event) =>
      updateLocalFilters({
        reportStatus: {
          ...localFilters.value.reportStatus,
          [event.target.name]: event.target.checked,
        },
      });

  const handleTrainingStatusChange = (event) =>
      updateLocalFilters({
        ...localFilters.value,
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
              filteredLocations={localFilters.value.locations}
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
                  filteredHealthRisks={localFilters.value.healthRisks}
                  onChange={handleHealthRiskChange}
                  updateValue={updateLocalFilters}
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
                    value={localFilters.value.trainingStatus}
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
                  filter={localFilters.value.reportStatus}
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
