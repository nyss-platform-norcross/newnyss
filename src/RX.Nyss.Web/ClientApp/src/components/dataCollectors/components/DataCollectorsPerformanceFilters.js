import styles from "./DataCollectorsPerformanceFilters.module.scss";
import { useEffect, useReducer } from "react";
import {
  Card,
  CardContent,
  TextField,
  MenuItem,
  Grid,
  Radio,
  RadioGroup,
  FormControlLabel,
  InputLabel,
} from "@material-ui/core";
import { strings, stringKeys } from "../../../strings";
import useDebounce from "../../../utils/debounce";
import * as roles from "../../../authentication/roles";
import { trainingStatus } from "../logic/dataCollectorsConstants";
import LocationFilter from "../../common/filters/LocationFilter";
import useLocalFilters from "../../common/filters/useLocalFilters";
import useLocationFilter from "../../common/filters/useLocationFilter";

export const DataCollectorsPerformanceFilters = ({
  onChange,
  filters,
  rtl,
  locations,
  supervisors,
  userRoles,
}) => {
  //Reducer for local filters state
  const [localFilters, updateLocalFilters] = useLocalFilters(filters);

  //Fetches new data based on changes in filters
  const handleFiltersChange = (filters) =>
    onChange(updateLocalFilters(filters));

  //Syncs locations from redux store with filter state and sets label for location filter to 'All' or "Region (+n)"
  //Neccecary if locations are added, edited or removed, to make all filters checked
  const [locationsFilterLabel] = useLocationFilter(
    locations,
    localFilters,
    updateLocalFilters,
  );

  const [name, setName] = useReducer(
    (state, action) => {
      if (state.value !== action) {
        return { changed: true, value: action };
      } else {
        return state;
      }
    },
    { value: "", changed: false },
  );

  const debouncedName = useDebounce(name, 500);

  useEffect(() => {
    debouncedName.changed && handleFiltersChange({ name: debouncedName.value });
  }, [debouncedName]);

  const handleAreaChange = (newValue) =>
    handleFiltersChange({ locations: newValue, pageNumber: 1 });

  const handleNameChange = (event) => setName(event.target.value);

  const handleSupervisorChange = (event) =>
    handleFiltersChange({
      supervisorId: event.target.value === 0 ? null : event.target.value,
    });

  const handleTrainingStatusChange = (event) =>
    handleFiltersChange({ trainingStatus: event.target.value });

  if (!filters) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item>
            <TextField
              label={strings(stringKeys.common.name)}
              onChange={handleNameChange}
              value={name.value}
              className={styles.filterItem}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item>
            <LocationFilter
              allLocations={locations}
              filteredLocations={filters.locations}
              filterLabel={locationsFilterLabel}
              onChange={handleAreaChange}
              rtl={rtl}
            />
          </Grid>

          {!userRoles.some((r) => r === roles.Supervisor) && (
            <Grid item>
              <TextField
                select
                label={strings(stringKeys.dataCollectors.filters.supervisors)}
                onChange={handleSupervisorChange}
                value={filters.supervisorId || 0}
                className={styles.filterItem}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value={0}>
                  {strings(stringKeys.dataCollectors.filters.supervisorsAll)}
                </MenuItem>

                {supervisors.map((supervisor) => (
                  <MenuItem
                    key={`filter_supervisor_${supervisor.id}`}
                    value={supervisor.id}
                  >
                    {supervisor.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}

          <Grid item>
            <InputLabel>
              {strings(stringKeys.dataCollectors.filters.trainingStatus)}
            </InputLabel>
            <RadioGroup
              value={localFilters.trainingStatus || "All"}
              onChange={handleTrainingStatusChange}
              className={styles.filterRadioGroup}
            >
              {trainingStatus.map((status) => (
                <FormControlLabel
                  key={`trainingStatus_filter_${status}`}
                  control={<Radio />}
                  className={styles.radio}
                  label={strings(
                    stringKeys.dataCollectors.constants.trainingStatus[status],
                  )}
                  value={status}
                />
              ))}
            </RadioGroup>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
