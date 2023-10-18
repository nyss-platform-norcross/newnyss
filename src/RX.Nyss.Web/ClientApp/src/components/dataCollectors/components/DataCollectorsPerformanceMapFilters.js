import styles from "./DataCollectorsPerformanceMapFilters.module.scss"
import { useEffect } from 'react';
import { Grid } from '@material-ui/core';
import { strings, stringKeys } from "../../../strings";
import { DatePicker } from "../../forms/DatePicker";
import { convertToLocalDate, convertToUtc } from "../../../utils/date";
import useLocalFilters from "../../common/filters/useLocalFilters";

export const DataCollectorsPerformanceMapFilters = ({ filters, onChange }) => {
  //Reducer for local filters state
  const [localFilters, updateLocalFilters] = useLocalFilters(filters);
  useEffect(() => {
    localFilters.changed && onChange(localFilters.value);
  }, [localFilters, onChange]);


  const handleDateFromChange = date =>
    updateLocalFilters({ startDate: convertToUtc(date) });

  const handleDateToChange = date =>
    updateLocalFilters({ endDate: convertToUtc(date) });

  return (
    <Grid container spacing={2} className={styles.filters}>
      <Grid item>
        <DatePicker
          onChange={handleDateFromChange}
          label={strings(stringKeys.dashboard.filters.startDate)}
          value={convertToLocalDate(localFilters.value.startDate)}
        />
      </Grid>

      <Grid item>
        <DatePicker
          onChange={handleDateToChange}
          label={strings(stringKeys.dashboard.filters.endDate)}
          value={convertToLocalDate(localFilters.value.endDate)}
        />
      </Grid>
    </Grid>
  );
}
