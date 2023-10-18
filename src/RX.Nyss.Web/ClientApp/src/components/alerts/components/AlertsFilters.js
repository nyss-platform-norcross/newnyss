import styles from "./AlertsFilters.module.scss";
import { useEffect } from 'react';
import { Grid, TextField, MenuItem, Card, CardContent } from '@material-ui/core';
import LocationFilter from "../../common/filters/LocationFilter";
import { strings, stringKeys } from "../../../strings";
import {alertStatusFilters} from "../logic/alertsConstants";
import {DatePicker} from "../../forms/DatePicker";
import {convertToLocalDate, convertToUtc} from "../../../utils/date";
import useLocalFilters from "../../common/filters/useLocalFilters";
import useLocationFilter from "../../common/filters/useLocationFilter";

export const AlertsFilters = ({ filters, locations, healthRisks, onChange, rtl }) => {
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
    updateLocalFilters({ locations: newValue });
  }

  const handleHealthRiskChange = (event) => {
    updateLocalFilters({ healthRiskId: event.target.value > 0 ? event.target.value : null });
  }

  const handleStatusChange = (event) => {
    updateLocalFilters({ status: event.target.value });
  }

  const handleDateFromChange = (date) =>
    updateLocalFilters({ startDate: convertToUtc(date) });

  const handleDateToChange = (date) =>
    updateLocalFilters({ endDate: convertToUtc(date) });

  if (!localFilters.value || !healthRisks) {
    return null;
  }

  return (
    <Card className={styles.filters}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item>
            <DatePicker
              select
              label={strings(stringKeys.dashboard.filters.startDate)}
              value={convertToLocalDate(localFilters.value.startDate)}
              onChange={handleDateFromChange}
              className={styles.filterItem}
              InputLabelProps={{ shrink: true }}
            >
            </DatePicker>
          </Grid>
          <Grid item>
            <DatePicker
              select
              label={strings(stringKeys.dashboard.filters.endDate)}
              value={convertToLocalDate(localFilters.value.endDate)}
              onChange={handleDateToChange}
              className={styles.filterItem}
              InputLabelProps={{ shrink: true }}
            >
            </DatePicker>
          </Grid>
          <Grid item>
            <LocationFilter
              filteredLocations={localFilters.value.locations}
              allLocations={locations}
              filterLabel={locationsFilterLabel}
              onChange={handleLocationChange}
              rtl={rtl}
            />
          </Grid>

          <Grid item>
            <TextField
              select
              label={strings(stringKeys.alerts.filters.healthRisks)}
              onChange={handleHealthRiskChange}
              value={localFilters.value.healthRiskId || 0}
              className={styles.filterItem}
              InputLabelProps={{ shrink: true }}
            >
              <MenuItem value={0}>{strings(stringKeys.alerts.filters.healthRisksAll)}</MenuItem>

              {healthRisks.map(hr => (
                <MenuItem key={`filter_healthRisk_${hr.id}`} value={hr.id}>
                  {hr.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item>
            <TextField
              select
              label={strings(stringKeys.alerts.filters.status)}
              value={localFilters.value.status || 'All'}
              onChange={handleStatusChange}
              className={styles.filterItem}
              InputLabelProps={{ shrink: true }}
            >
              {Object.values(alertStatusFilters).map(status => (
                <MenuItem key={`filter_status_${status}`} value={status}>
                  {strings(stringKeys.alerts.constants.alertStatus[status])}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

        </Grid>
      </CardContent>
    </Card>
  );
}
