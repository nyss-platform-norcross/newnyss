import styles from "./LocationFilter.module.scss";
import { Fragment, useEffect, useState } from "react";
import { Popover, TextField } from "@material-ui/core";
import {
  cascadeSelectDistrict,
  cascadeSelectRegion,
  cascadeSelectVillage,
  cascadeSelectZone,
  extractSelectedValues,
  mapToSelectedLocations,
  toggleSelectedStatus,
} from "./logic/locationFilterService";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";
import { stringKeys, strings } from "../../../strings";
import LocationItem from "./LocationItem";
import { SelectAll } from "../../common/selectAll/SelectAll";

const LocationFilter = ({
  filteredLocations,
  filterLabel,
  allLocations,
  onChange,
  showUnknownLocation,
  rtl,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [includeUnknownLocation, setIncludeUnknownLocation] = useState(false);
  const [selectAll, setSelectAll] = useState(true);

  useEffect(() => {
    if (!allLocations) return;
    setSelectedLocations(mapToSelectedLocations(filteredLocations, allLocations.regions));
    setIncludeUnknownLocation(!!filteredLocations ? filteredLocations.includeUnknownLocation : showUnknownLocation);
  }, [allLocations, filteredLocations, showUnknownLocation]);

  useEffect(() => {
    const anyUnselected = selectedLocations.some(
      (r) =>
        !r.selected ||
        r.districts.some(
          (d) =>
            !d.selected ||
            d.villages.some(
              (v) => !v.selected || v.zones.some((z) => !z.selected)
            )
        )
    );
    setSelectAll(
      !anyUnselected && (!showUnknownLocation || includeUnknownLocation)
    );
  }, [selectedLocations, includeUnknownLocation, showUnknownLocation]);

  const setSelectedStatusOfRegion = (id) => {
    const index = selectedLocations.findIndex((r) => r.id === id);
    const region = selectedLocations[index];
    const updatedSelectedLocations = [...selectedLocations];

    updatedSelectedLocations[index] = cascadeSelectRegion(
      region,
      !region.selected
    );
    setSelectedLocations(updatedSelectedLocations);
  };

  const setSelectedStatusOfDistrict = (id) => {
    const regionIndex = selectedLocations.findIndex((r) =>
      r.districts.some((d) => d.id === id)
    );
    const region = selectedLocations[regionIndex];
    const districtIndex = region.districts.findIndex((d) => d.id === id);
    const district = region.districts[districtIndex];
    const updatedSelectedLocations = [...selectedLocations];

    updatedSelectedLocations[regionIndex] = cascadeSelectDistrict(
      region,
      district.id,
      !district.selected
    );
    setSelectedLocations(updatedSelectedLocations);
  };

  const setSelectedStatusOfVillage = (id) => {
    const regionIndex = selectedLocations.findIndex((r) =>
      r.districts.some((d) => d.villages.some((v) => v.id === id))
    );
    const region = selectedLocations[regionIndex];
    const districtIndex = region.districts.findIndex((d) =>
      d.villages.some((v) => v.id === id)
    );
    const district = region.districts[districtIndex];
    const villageIndex = district.villages.findIndex((v) => v.id === id);
    const village = district.villages[villageIndex];
    const updatedSelectedLocations = [...selectedLocations];

    updatedSelectedLocations[regionIndex] = cascadeSelectVillage(
      region,
      district.id,
      village.id,
      !village.selected
    );
    setSelectedLocations(updatedSelectedLocations);
  };

  const setSelectedStatusOfZone = (id) => {
    const regionIndex = selectedLocations.findIndex((r) =>
      r.districts.some((d) =>
        d.villages.some((v) => v.zones.some((z) => z.id === id))
      )
    );
    const region = selectedLocations[regionIndex];
    const districtIndex = region.districts.findIndex((d) =>
      d.villages.some((v) => v.zones.some((z) => z.id === id))
    );
    const district = region.districts[districtIndex];
    const villageIndex = district.villages.findIndex((v) =>
      v.zones.some((z) => z.id === id)
    );
    const village = district.villages[villageIndex];
    const zoneIndex = village.zones.findIndex((z) => z.id === id);
    const zone = village.zones[zoneIndex];
    const updatedSelectedLocations = [...selectedLocations];

    updatedSelectedLocations[regionIndex] = cascadeSelectZone(
      region,
      district.id,
      village.id,
      zone.id,
      !zone.selected
    );
    setSelectedLocations(updatedSelectedLocations);
  };

  const handleChange = ({ type, id }) => {
    switch (type) {
      case "region":
        setSelectedStatusOfRegion(id);
        break;
      case "district":
        setSelectedStatusOfDistrict(id);
        break;
      case "village":
        setSelectedStatusOfVillage(id);
        break;
      case "zone":
        setSelectedStatusOfZone(id);
        break;
      case "unknown":
        setIncludeUnknownLocation(!includeUnknownLocation);
        break;
      default:
        break;
    }
  };

  const showResults = () => {
    setDialogOpen(false);
    const filterValue = extractSelectedValues(
      selectedLocations,
      includeUnknownLocation
    );
    onChange(filterValue);
  };

  const handleDropdownClick = (event) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setDialogOpen(true);
  };

  const toggleSelectAll = () => {
    setIncludeUnknownLocation(!selectAll);
    setSelectAll(!selectAll);
    setSelectedLocations(toggleSelectedStatus(selectedLocations, !selectAll));
  };

  return (
    <Fragment>
      <TextField
        className={styles.field}
        label={strings(stringKeys.common.location)}
        InputProps={{
          readOnly: true,
          endAdornment: <ArrowDropDown className={styles.arrow} />,
        }}
        value={filterLabel}
        inputProps={{
          className: styles.clickable,
        }}
        onClick={handleDropdownClick}
      />

      <Popover
        open={dialogOpen}
        onClose={showResults}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: rtl ? "right" : "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: rtl ? "right" : "left",
        }}
        PaperProps={{
          className: styles.filterContainer,
        }}
        style={{maxHeight: 400}}
      >
        <SelectAll
          isSelectAllEnabled={selectAll}
          showResults={showResults}
          toggleSelectAll={toggleSelectAll}
        />
        {showUnknownLocation && (
          <LocationItem
            type="unknown"
            data={{
              name: strings(stringKeys.filters.area.unknown),
              selected: includeUnknownLocation,
            }}
            isVisible
            onChange={handleChange}
            rtl={rtl}
          />
        )}
        {selectedLocations.map((r) => (
          <LocationItem
            key={`region_${r.id}`}
            type="region"
            data={r}
            isVisible
            onChange={handleChange}
            rtl={rtl}
          />
        ))}
      </Popover>
    </Fragment>
  );
};

export default LocationFilter;
