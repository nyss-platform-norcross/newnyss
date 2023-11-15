import styles from "./DataCollectorsPerformanceMapFilters.module.scss"
import { Grid } from '@material-ui/core';
import { strings, stringKeys } from "../../../strings";
import { DatePicker } from "../../forms/DatePicker";
import { convertToLocalDate, convertToUtc } from "../../../utils/date";
import useLocalFilters from "../../common/filters/useLocalFilters";

export const DataCollectorsPerformanceMapFilters = ({ filters, onChange }) => {
  //Reducer for local filters state
  const [localFilters, updateLocalFilters] = useLocalFilters(filters);

  //Fetches new data based on changes in filters
  const handleFiltersChange = (filters) =>
    onChange(updateLocalFilters(filters));


  const handleDateFromChange = date =>
    handleFiltersChange({ startDate: convertToUtc(date) });

  const handleDateToChange = date =>
    handleFiltersChange({ endDate: convertToUtc(date) });

  return (
    <Grid container spacing={2} className={styles.filters}>
      <Grid item>
        <DatePicker
          onChange={handleDateFromChange}
          label={strings(stringKeys.dashboard.filters.startDate)}
          value={convertToLocalDate(localFilters.startDate)}
        />
      </Grid>

      <Grid item>
        <DatePicker
          onChange={handleDateToChange}
          label={strings(stringKeys.dashboard.filters.endDate)}
          value={convertToLocalDate(localFilters.endDate)}
        />
      </Grid>
    </Grid>
  );
}
