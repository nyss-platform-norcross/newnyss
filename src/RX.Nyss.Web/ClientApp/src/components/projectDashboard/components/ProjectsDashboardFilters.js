import styles from "./ProjectsDashboardFilters.module.scss";
import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import TextField from "@material-ui/core/TextField";
import MenuItem from "@material-ui/core/MenuItem";
import Card from '@material-ui/core/Card';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import CardContent from '@material-ui/core/CardContent';
import { DatePicker } from "../../forms/DatePicker";
import { AreaFilter } from "../../common/filters/AreaFilter";
import { strings, stringKeys } from "../../../strings";
import { ExpandMore, DateRange } from '@material-ui/icons';
import { Switch, FormControl, LinearProgress, FormLabel, Chip, IconButton } from "@material-ui/core";
import { ConditionalCollapse } from "../../common/conditionalCollapse/ConditionalCollapse";
import { convertToLocalDate, convertToUtc } from "../../../utils/date";
import CardHeader from "@material-ui/core/CardHeader";

export const ProjectsDashboardFilters = ({ filters, nationalSocietyId, healthRisks, organizations, onChange, isFetching, isGeneratingPdf, isFilterExpanded, setIsFilterExpanded }) => {
  const [value, setValue] = useState(filters);
  const [selectedArea, setSelectedArea] = useState(filters && filters.area);
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('lg'));

  const updateValue = (change) => {
    const newValue = {
      ...value,
      ...change
    }

    setValue(newValue);
    return newValue;
  }

  const handleAreaChange = (item) => {
    setSelectedArea(item);
    onChange(updateValue({ area: item ? { type: item.type, id: item.id, name: item.name } : null }))
  }

  const handleHealthRiskChange = event =>
    onChange(updateValue({ healthRiskId: event.target.value === 0 ? null : event.target.value }))

  const handleOrganizationChange = event =>
    onChange(updateValue({ organizationId: event.target.value === 0 ? null : event.target.value }))

  const handleDateFromChange = date =>
    onChange(updateValue({ startDate: convertToUtc(date) }))

  const handleDateToChange = date =>
    onChange(updateValue({ endDate: convertToUtc(date) }))

  const handleGroupingTypeChange = event =>
    onChange(updateValue({ groupingType: event.target.value }))

  const handleReportsTypeChange = event =>
    onChange(updateValue({ reportsType: event.target.value }))

  const handleIsTrainingChange = () =>
    onChange(updateValue({ isTraining: !value.isTraining }))

  const collectionsTypes = {
    "all": strings(stringKeys.project.dashboard.filters.allReportsType),
    "dataCollector": strings(stringKeys.project.dashboard.filters.dataCollectorReportsType),
    "dataCollectionPoint": strings(stringKeys.project.dashboard.filters.dataCollectionPointReportsType)
  }

  if (!value) {
    return null;
  }

  return (
    <Card className={styles.filters}>
      {isFetching && (<LinearProgress color="primary" />)}
      {isSmallScreen && (
        <CardContent className={styles.collapsedFilterBar} >
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <CardHeader title={strings(stringKeys.nationalSociety.dashboard.filters.title)} />
            </Grid>
            <Grid item>
              <Chip icon={<DateRange />} label={`${convertToLocalDate(value.startDate).format('YYYY-MM-DD')} - ${convertToLocalDate(value.endDate).format('YYYY-MM-DD')}`} onClick={() => setIsFilterExpanded(!isFilterExpanded)} />
            </Grid>
            <Grid item>
              <Chip onClick={() => setIsFilterExpanded(!isFilterExpanded)} label={
                value.groupingType === "Day" ? strings(stringKeys.project.dashboard.filters.timeGroupingDay) : strings(stringKeys.project.dashboard.filters.timeGroupingWeek)
              } />
            </Grid>
            {selectedArea && (<Grid item><Chip label={selectedArea.name} onDelete={() => handleAreaChange(null)} onClick={() => setIsFilterExpanded(!isFilterExpanded)} /></Grid>)}
            {value.healthRiskId && (<Grid item><Chip label={healthRisks.filter(hr => hr.id === value.healthRiskId)[0].name} onDelete={() => onChange(updateValue({ healthRiskId: null }))} onClick={() => setIsFilterExpanded(!isFilterExpanded)} /></Grid>)}
            {value.reportsType !== "all" && (<Grid item><Chip label={collectionsTypes[value.reportsType]} onDelete={() => onChange(updateValue({ reportsType: "all" }))} onClick={() => setIsFilterExpanded(!isFilterExpanded)} /></Grid>)}
            {value.organizationId && (<Grid item><Chip label={organizations.filter(o => o.id === value.organizationId)[0].name} onDelete={() => onChange(updateValue({ organizationId: null }))} onClick={() => setIsFilterExpanded(!isFilterExpanded)} /></Grid>)}
            {value.isTraining && (<Grid item><Chip label={strings(stringKeys.project.dashboard.filters.inTraining)} onDelete={handleIsTrainingChange} onClick={() => setIsFilterExpanded(!isFilterExpanded)} /></Grid>)}
            <Grid item className={styles.expandFilterButton}>
              <IconButton data-expanded={isFilterExpanded} onClick={() => setIsFilterExpanded(!isFilterExpanded)}>
                <ExpandMore />
              </IconButton>
            </Grid>
          </Grid>
        </CardContent>
      )}

      <ConditionalCollapse collapsible={isSmallScreen && !isGeneratingPdf} expanded={isFilterExpanded}>
        {!isSmallScreen && (
          <Grid spacing={2}>
            <CardHeader title={strings(stringKeys.nationalSociety.dashboard.filters.title)} className={styles.filterTitle}  />
          </Grid>
        )}
        <CardContent data-printable={true}>
          <Grid container spacing={2}>
            <Grid item>
              <DatePicker
                className={styles.filterDate}
                onChange={handleDateFromChange}
                label={strings(stringKeys.project.dashboard.filters.startDate)}
                value={convertToLocalDate(value.startDate)} />
            </Grid>

            <Grid item>
              <DatePicker
                className={styles.filterDate}
                onChange={handleDateToChange}
                label={strings(stringKeys.project.dashboard.filters.endDate)}
                value={convertToLocalDate(value.endDate)} />
            </Grid>

            <Grid item>
              <TextField
                select
                label={strings(stringKeys.project.dashboard.filters.timeGrouping)}
                onChange={handleGroupingTypeChange}
                value={value.groupingType}
                style={{ width: 130 }}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="Day">{strings(stringKeys.project.dashboard.filters.timeGroupingDay)}</MenuItem>
                <MenuItem value="Week">{strings(stringKeys.project.dashboard.filters.timeGroupingWeek)}</MenuItem>
              </TextField>
            </Grid>

            <Grid item>
              <AreaFilter
                nationalSocietyId={nationalSocietyId}
                selectedItem={selectedArea}
                onChange={handleAreaChange} />
            </Grid>

            <Grid item>
              <TextField
                select
                label={strings(stringKeys.project.dashboard.filters.healthRisk)}
                onChange={handleHealthRiskChange}
                value={value.healthRiskId || 0}
                className={styles.filterItem}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value={0}>{strings(stringKeys.project.dashboard.filters.healthRiskAll)}</MenuItem>

                {healthRisks.map(healthRisk => (
                  <MenuItem key={`filter_healthRisk_${healthRisk.id}`} value={healthRisk.id}>
                    {healthRisk.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item>
              <TextField
                select
                label={strings(stringKeys.project.dashboard.filters.reportsType)}
                onChange={handleReportsTypeChange}
                value={value.reportsType || "all"}
                className={styles.filterItem}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value="all">
                  {collectionsTypes["all"]}
                </MenuItem>
                <MenuItem value="dataCollector">
                  {collectionsTypes["dataCollector"]}
                </MenuItem>
                <MenuItem value="dataCollectionPoint">
                  {collectionsTypes["dataCollectionPoint"]}
                </MenuItem>
              </TextField>
            </Grid>

            <Grid item>
              <TextField
                select
                label={strings(stringKeys.project.dashboard.filters.organization)}
                onChange={handleOrganizationChange}
                value={value.organizationId || 0}
                className={styles.filterItem}
                InputLabelProps={{ shrink: true }}
              >
                <MenuItem value={0}>{strings(stringKeys.project.dashboard.filters.organizationsAll)}</MenuItem>

                {organizations.map(organization => (
                  <MenuItem key={`filter_organization_${organization.id}`} value={organization.id}>
                    {organization.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item>
              <FormControl className={styles.filterItem}>
                <FormLabel className={styles.trainingStateLabel}>{strings(stringKeys.project.dashboard.filters.inTraining)}</FormLabel>
                <Switch checked={value.isTraining} onChange={handleIsTrainingChange} color="primary" />
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </ConditionalCollapse>
    </Card>
  );
}
