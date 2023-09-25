import React, { Fragment, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Collapse from "@material-ui/core/Collapse";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import { NationalSocietyLocationList } from "./NationalSocietyLocationList";
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import { IconButton } from "@material-ui/core";
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ConfirmationAction from "../common/confirmationAction/ConfirmationAction";
import { strings, stringKeys } from "../../strings";
import { InlineTextEditor } from "../common/InlineTextEditor/InlineTextEditor";

export const NationalSocietyLocationListItem = (props) => {
  const [isEdited, setIsEdited] = useState(false);
  const isCurrentOpen =
    props.activeIndex === `${props.locationType}_${props.location.id}`;
  const isZones = props.locationType === "Zones";
  let nextLocations = [];
  const activeParentLocation = props.location.id
  let removeLocation = null
  let editLocation = null

  const useStyles = makeStyles((theme) => ({
    container: {
      maxHeight: 55,
      display: "flex",
      flexDirection: "row",
      width: "100%",
    },
    row: {
      maxHeight: "100%",
      borderBottom: "1px solid black",
      "&:hover": {
        backgroundColor: props.nextLocationType ? "#FEF1F1" : "none",
      },
      "&:focus": {
        backgroundColor: "#FEF1F1",
      },
    },
    expanded: {
      backgroundColor: "#FEF1F1",
      fontWeight: "bold",
    },
    iconExpanded: {
      transform: "rotate(90deg)",
    },
    text: {
      fontSize: 16,
      color: theme.palette.text.primary,
    },
    icon: {
      fontSize: 36,
      color: "#D52B1E",
    },
    editContainer: {
      display: "flex"
    }
  }));
  const classes = useStyles();

  switch (props.nextLocationType) {
    case "Districts":
      removeLocation = props.manageLocation.region.remove
      editLocation = props.manageLocation.region.edit
      nextLocations = props.districts.filter(
        (district) => district.regionId === props.location.id
      );
      break;
    case "Villages":
      removeLocation = props.manageLocation.district.remove
      editLocation = props.manageLocation.district.edit
      nextLocations = props.villages.filter(
        (village) => village.districtId === props.location.id
      );
      break;
    case "Zones":
      removeLocation = props.manageLocation.village.remove
      editLocation = props.manageLocation.village.edit
      nextLocations = props.zones.filter(
        (zone) => zone.villageId === props.location.id
      );
      break;
    default:
      removeLocation = props.manageLocation.zone.remove
      editLocation = props.manageLocation.zone.edit
      nextLocations = null;
      break;
  }

  const handleClick = () => {
    if (isCurrentOpen) {
      props.setActiveIndex("");
    } else {
      props.setActiveIndex(`${props.locationType}_${props.location.id}`);
    }
  };

  const handleRemove = () => {
    removeLocation(props.location.id)
    props.setIsEditingLocations(false)
  }


  const handleEdit = (e) => {
    e.stopPropagation();
    setIsEdited(true);
  }

  const handleSave = (newName) => {
    editLocation(props.location.id, newName);
    setIsEdited(false);
  }


  return (
    <Fragment>
      <div className={classes.container}>
        <ListItem
          className={
            classes.row + " " + (isCurrentOpen ? classes.expanded : "")
          }
          ContainerProps={{
            className: classes.container
          }}
          button={!!props.nextLocationType && !!nextLocations}
          onClick={!isZones ? handleClick : () => null}
        >
        {!isEdited && (
            <>
            <ListItemText
              disableTypography
              className={classes.text}
              primary={props.location.name}
            />
            {!isZones && !props.isEditingLocations &&
              (isCurrentOpen ? (
                <ExpandLess
                  className={
                    classes.icon +
                    " " +
                    (isCurrentOpen ? classes.iconExpanded : "")
                  }
                />
              ) : (
                <ExpandMore
                  className={
                    classes.icon +
                    " " +
                    (isCurrentOpen ? classes.iconExpanded : "")
                  }
                />
            ))}
            {props.isEditingLocations && (
              <ListItemSecondaryAction className={classes.editContainer}>
                <IconButton size="small" id={`${props.locationType}_${props.location.id}_edit`} onClick={handleEdit}>
                  <EditIcon style={{color: "#D52B1E"}}/>
                </IconButton>
                <ConfirmationAction
                  className={classes.icon}
                  confirmationText={strings(stringKeys.nationalSociety.structure.removalConfirmation)}
                  onClick={handleRemove}>
                    <IconButton size="small" id={`${props.locationType}_${props.location.id}_delete`}>
                      <DeleteIcon style={{color: "#D52B1E"}}/>
                    </IconButton>
                </ConfirmationAction>
              </ListItemSecondaryAction>
            )}
          </>
        )}
        {isEdited && (
          <InlineTextEditor
            initialValue={props.location.name}
            onSave={handleSave}
            autoFocus
            onClose={() => setIsEdited(false)} />
        )}
        </ListItem>
        <Collapse
          in={
            props.activeIndex === `${props.locationType}_${props.location.id}`
          }
          timeout="auto"
          unmountOnExit
        >
          <NationalSocietyLocationList
            regions={props.regions}
            districts={props.districts}
            villages={props.villages}
            zones={props.zones}
            locations={nextLocations}
            locationType={props.nextLocationType}
            manageLocation={props.manageLocation}
            activeParentLocation={activeParentLocation}
          />
        </Collapse>
      </div>
    </Fragment>
  );
};
