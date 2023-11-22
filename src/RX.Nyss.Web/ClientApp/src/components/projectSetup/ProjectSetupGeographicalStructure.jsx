import React, { useEffect } from "react";
import { connect, useSelector } from "react-redux";
import * as nationalSocietyStructureActions from "../nationalSocietyStructure/logic/nationalSocietyStructureActions";
import { Grid, Typography } from "@material-ui/core";
import * as roles from "../../authentication/roles";
import { strings, stringKeys } from "../../strings";
import { NationalSocietyLocationList } from "../nationalSocietyStructure/NationalSocietyLocationList";

export const ProjectSetupGeographicalStructureComponent = (props) => {
  const {
    openStructure,
    nationalSocietyId,
  } = props;

  useEffect(() => {
    openStructure(nationalSocietyId);
  }, [openStructure, nationalSocietyId]);

  const canModify =
    !props.nationalSocietyIsArchived
    && (
      !props.nationalSocietyHasCoordinator
      || props.callingUserRoles.some(r => r === roles.Coordinator || r === roles.Administrator)
    );

  const useRtlDirection = useSelector(state => state.appData.user.languageCode === 'ar');

  if(!props.regions) return null;

  const manageLocation = {
    region: {
      create: props.createRegion,
      edit: props.editRegion,
      remove: props.removeRegion,
      nextLocationType: "district",
      nextLocations: (location) => props.districts.filter(
        (district) => district.regionId === location.id
      ),
      addLocationLabel: strings(stringKeys.nationalSociety.structure.addRegion, true)
    },
    district: {
      create: props.createDistrict,
      edit: props.editDistrict,
      remove: props.removeDistrict,
      nextLocationType: "village",
      nextLocations: (location) => props.villages.filter(
        (village) => village.districtId === location.id
      ),
      addLocationLabel: strings(stringKeys.nationalSociety.structure.addDistrict, true)
    },
    village: {
      create: props.createVillage,
      edit: props.editVillage,
      remove: props.removeVillage,
      nextLocationType: "zone",
      nextLocations: (location) => props.zones.filter(
        (zone) => zone.villageId === location.id
      ),
      addLocationLabel: strings(stringKeys.nationalSociety.structure.addVillage, true)
    },
    zone: {
      create: props.createZone,
      edit: props.editZone,
      remove: props.removeZone,
      nextLocationType: null,
      nextLocations: () => null,
      addLocationLabel: strings(stringKeys.nationalSociety.structure.addZone, true)
    }
  }

  return (
    <Grid style={{ width: "100%" }} container direction="column" alignItems="center">
      {!props.nationalSocietyIsArchived && (
        <Typography variant="body1" style={{ marginBottom: 50 }}>
          {strings(stringKeys.nationalSociety.structure.introduction)}
        </Typography>
      )}
        <Grid style={{ width: "100%" }}>
          <NationalSocietyLocationList
            locations={props.regions}
            locationType="region"
            activeParentLocationId={nationalSocietyId}
            manageLocation={manageLocation}
            canModify={canModify}
            rtl={useRtlDirection}
          />
        </Grid>
      </Grid>
  );
}

const mapStateToProps = (state) => ({
  nationalSocietyId: state.appData.route.params.nationalSocietyId,
  isFetching: state.nationalSocietyStructure.structureFetching,
  regions: state.nationalSocietyStructure.regions,
  districts: state.nationalSocietyStructure.districts,
  villages: state.nationalSocietyStructure.villages,
  zones: state.nationalSocietyStructure.zones,
  nationalSocietyIsArchived: state.appData.siteMap.parameters.nationalSocietyIsArchived,
  nationalSocietyHasCoordinator: state.appData.siteMap.parameters.nationalSocietyHasCoordinator,
  callingUserRoles: state.appData.user.roles,
});

const mapDispatchToProps = {
  openStructure: nationalSocietyStructureActions.openStructure.invoke,

  createRegion: nationalSocietyStructureActions.createRegion.invoke,
  editRegion: nationalSocietyStructureActions.editRegion.invoke,
  removeRegion: nationalSocietyStructureActions.removeRegion.invoke,

  createDistrict: nationalSocietyStructureActions.createDistrict.invoke,
  editDistrict: nationalSocietyStructureActions.editDistrict.invoke,
  removeDistrict: nationalSocietyStructureActions.removeDistrict.invoke,

  createVillage: nationalSocietyStructureActions.createVillage.invoke,
  editVillage: nationalSocietyStructureActions.editVillage.invoke,
  removeVillage: nationalSocietyStructureActions.removeVillage.invoke,

  createZone: nationalSocietyStructureActions.createZone.invoke,
  editZone: nationalSocietyStructureActions.editZone.invoke,
  removeZone: nationalSocietyStructureActions.removeZone.invoke,
};

export const ProjectSetupGeographicalStructure = connect(mapStateToProps, mapDispatchToProps)(ProjectSetupGeographicalStructureComponent);
