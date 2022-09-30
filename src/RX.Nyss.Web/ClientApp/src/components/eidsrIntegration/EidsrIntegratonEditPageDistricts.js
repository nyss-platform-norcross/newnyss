﻿import {Virtualize} from "./Virtualize";
import TextInputField from "../forms/TextInputField";
import {stringKeys, strings} from "../../strings";
import React from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Typography from "@material-ui/core/Typography";
import {DistrictAccordion, DistrictAccordionDetails, DistrictAccordionSummary} from "./components/DistrictAccordion";
import {Button, Grid} from "@material-ui/core";
import WarningIcon from '@material-ui/icons/Warning';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';

export const EidsrIntegrationEditPageDistrictsComponent = ({districtsWithOrganizationUnits, organisationUnits}) => {

  const [districtAccordionExpanded, setDistrictAccordionExpanded] = React.useState('');
  const [districtDropdownsValues, setDistrictDropdownsValues] = React.useState({});
  const [districtsWithOrganizationUnitsState, setDistrictsWithOrganizationUnitsState] = React.useState(districtsWithOrganizationUnits);

  const districtAccordionChange = (panel) => (event, newExpanded) => {
    setDistrictAccordionExpanded(newExpanded ? panel : false);
  };

  const updateDistrictDropdownsValues = (index, value) => {
    let newTab = districtDropdownsValues;
    newTab[index] = value;
    setDistrictDropdownsValues(newTab);
  }

  const applyOrganisationUnit = (index) => {
    console.log(districtsWithOrganizationUnitsState);

    let newState = districtsWithOrganizationUnitsState;

    const newValue = districtDropdownsValues[index];
    console.log(newValue);
    const idx = newState
      .findIndex(x => x.districtId === index);

    newState[idx] =
    {
      ...newState[idx],
      organisationUnitId: newValue?.id,
      organisationUnitName: newValue?.display,
    }

    setDistrictsWithOrganizationUnitsState(newState);
    setDistrictAccordionExpanded('');
  }

  const organisationUnitsOptions = organisationUnits.map((option) => {
    return {
      id: option.id,
      display: option.displayName,
    };
  });

  return(
    <>
      {districtsWithOrganizationUnitsState?.map((item,index) =>

        <DistrictAccordion
          key={item.districtId}
          square
          expanded={districtAccordionExpanded === item.districtId}
          onChange={districtAccordionChange(item.districtId)}>
          <DistrictAccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls={`panel${item.districtId}-content`}
            id={`panel${item.districtId}-header`}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="caption">District</Typography>
                <Typography>{item.districtName}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="caption">Organisation Unit</Typography>
                  { item.organisationUnitId ?
                    <Typography>
                      {item.organisationUnitId} <CheckCircleIcon style={{color: 'green', fontSize: 'inherit'}}/>
                    </Typography>:
                    <Typography> <WarningIcon fontSize="small" color={"error"}/></Typography>
                  }
              </Grid>
            </Grid>
          </DistrictAccordionSummary>
          <DistrictAccordionDetails>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={10}>
                <Virtualize
                  id={item.districtId.toString()} l
                  label={"Chose organisation unit"}
                  options={organisationUnitsOptions}
                  handleChangeValue={(value) => updateDistrictDropdownsValues(item.districtId, value)}
                />
              </Grid>
              <Grid item xs={2}>
                <Button color="primary" variant="contained" size={"small"} onClick={() => { applyOrganisationUnit(item.districtId) }}>Save</Button>
              </Grid>
            </Grid>
          </DistrictAccordionDetails>
        </DistrictAccordion>
      )}

      {/*TODO*/}
      <p>test:</p>
      <p>test:</p>
      {JSON.stringify(districtsWithOrganizationUnitsState)}
    </>
  )
}