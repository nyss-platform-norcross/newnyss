import React, { useEffect } from "react";
import { connect, useSelector } from "react-redux";
import * as nationalSocietyStructureActions from "../nationalSocietyStructure/logic/nationalSocietyStructureActions";
import { Grid, Typography } from "@material-ui/core";
import * as roles from "../../authentication/roles";
import { strings, stringKeys } from "../../strings";
import { NationalSocietyLocationList } from "../nationalSocietyStructure/NationalSocietyLocationList";
import * as projectSetupActions from './logic/projectSetupActions';

export const ProjectSetupGeographicalStructureComponent = (props) => {
  const {
    openStructure,
    nationalSocietyId,
    regions,
    districts,
    villages,
    zones,
    tempRegions,
    tempDistricts,
    tempVillages,
    tempZones,
    setRegions,
    setDistricts,
    setVillages,
    setZones
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

  useEffect(() => {
    if(tempRegions.length === 0) {
      regions?.length > 0 && setRegions(regions.map(region => ({ ...region, canModify: false })))
      districts?.length > 0 && setDistricts(districts.map(district => ({ ...district, canModify: false })))
      villages?.length > 0 && setVillages(villages.map(village => ({ ...village, canModify: false })))
      zones?.length > 0 && setZones(zones.map(zone => ({ ...zone, canModify: false })))
    }
  }, [tempRegions, regions, districts, villages, zones, setRegions, setDistricts, setVillages, setZones])


  const createRegion = (activeParentLocationId, name) => {
    setRegions([...tempRegions, { id: `new_region_${name}`, nationalSocietyId: activeParentLocationId, name: name, canModify: true }]);
  }
  const createDistrict = (activeParentLocationId, name) => {
    setDistricts([...tempDistricts, { id: `new_district_${name}`, regionId: activeParentLocationId, name: name, canModify: true }]);
  }
  const createVillage = (activeParentLocationId, name) => {
    setVillages([...tempVillages, { id: `new_village_${name}`, districtId: activeParentLocationId, name: name, canModify: true }]);
  }
  const createZone = (activeParentLocationId, name) => {
    setZones([...tempZones, { id: `new_zone_${name}`, villageId: activeParentLocationId, name: name, canModify: true }]);
  }

  const editRegion = (id, newName) => {
    const temp = tempRegions.map(region => {
      if(region.id === id) region.name = newName;
      return region;
    });
    setRegions(temp);
  }

  const editDistrict = (id, newName) => {
    const temp = tempDistricts.map(district => {
      if(district.id === id) district.name = newName;
      return district;
    });
    setDistricts(temp);
  }

  const editVillage = (id, newName) => {
    const temp = tempVillages.map(village => {
      if(village.id === id) village.name = newName;
      return village;
    });
    setVillages(temp);
  }

  const editZone = (id, newName) => {
    const temp = tempZones.map(zone => {
      if(zone.id === id) zone.name = newName;
      return zone;
    });
    setZones(temp);
  }

  const removeRegion = (id) => {
    setRegions([...tempRegions.filter(region => region.id !== id)]);
  }
  const removeDistrict = (id) => {
    setDistricts([...tempDistricts.filter(district => district.id !== id)]);
  }
  const removeVillage = (id) => {
    setVillages([...tempVillages.filter(village => village.id !== id)]);
  }
  const removeZone = (id) => {
    setZones([...tempZones.filter(zone => zone.id !== id)]);
  }

  const manageLocation = {
    region: {
      create: createRegion,
      edit: editRegion,
      remove: removeRegion,
      nextLocationType: "district",
      nextLocations: (location) => tempDistricts.filter(
        (district) => district.regionId === location.id
      ),
      addLocationLabel: strings(stringKeys.nationalSociety.structure.addRegion, true)
    },
    district: {
      create: createDistrict,
      edit: editDistrict,
      remove: removeDistrict,
      nextLocationType: "village",
      nextLocations: (location) => tempVillages.filter(
        (village) => village.districtId === location.id
      ),
      addLocationLabel: strings(stringKeys.nationalSociety.structure.addDistrict, true)
    },
    village: {
      create: createVillage,
      edit: editVillage,
      remove: removeVillage,
      nextLocationType: "zone",
      nextLocations: (location) => tempZones.filter(
        (zone) => zone.villageId === location.id
      ),
      addLocationLabel: strings(stringKeys.nationalSociety.structure.addVillage, true)
    },
    zone: {
      create: createZone,
      edit: editZone,
      remove: removeZone,
      nextLocationType: null,
      nextLocations: () => null,
      addLocationLabel: strings(stringKeys.nationalSociety.structure.addZone, true)
    }
  }

  return (
    <Grid style={{ width: "100%" }} container direction="column" alignItems="center">
      {!props.nationalSocietyIsArchived && (
        <>
          <Typography variant="body1" style={{ fontWeight: 700 }}>
            {strings(stringKeys.projectSetup.geographicalStructure.title)}
          </Typography>
          <Typography variant="body1" style={{ marginBottom: 50, color: "#4F4F4F" }}>
            {strings(stringKeys.projectSetup.geographicalStructure.description)}
          </Typography>
        </>
      )}
        <Grid style={{ width: "100%" }}>
          <NationalSocietyLocationList
            locations={tempRegions}
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
  tempRegions: state.projectSetup.regions,
  tempDistricts: state.projectSetup.districts,
  tempVillages: state.projectSetup.villages,
  tempZones: state.projectSetup.zones,
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

  setRegions: projectSetupActions.setRegions,
  setDistricts: projectSetupActions.setDistricts,
  setVillages: projectSetupActions.setVillages,
  setZones: projectSetupActions.setZones,
};

export const ProjectSetupGeographicalStructure = connect(mapStateToProps, mapDispatchToProps)(ProjectSetupGeographicalStructureComponent);
