import { useEffect, useState } from "react";
import { MenuItem, Checkbox } from "@material-ui/core";
import { strings, stringKeys } from "../../../strings";
import styles from "./HealthRiskFilter.module.scss";
import { SelectAll } from "../../common/selectAll/SelectAll";
import { DropdownPopover } from "./DropdownPopover";

export const HealthRiskFilter = ({
  allHealthRisks,
  filteredHealthRisks,
  onChange,
  updateValue,
  rtl,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  // Checks off all boxes on mount
  useEffect(() => {
    updateValue({ healthRisks: allHealthRisks.map((hr) => hr.id) });
  }, [allHealthRisks]);

  // Handles when the checkbox is checked off or not checked on. Will only update filteredHealthRisks to not fetch from backend every time.
  const handleHealthRiskChange = (event) => {
    const healthRiskId = parseInt(event.target.value);
    updateValue({
      healthRisks: filteredHealthRisks.includes(healthRiskId)
        ? filteredHealthRisks.filter((hrId) => hrId !== healthRiskId)
        : [...filteredHealthRisks, healthRiskId],
    });
  };

  // Handles when select all checkbox is toggled on or off. Same functionality as handleHealthRiskChange.
  const toggleSelectAll = () => {
    updateValue({
      healthRisks:
        filteredHealthRisks.length === allHealthRisks.length
          ? []
          : allHealthRisks.map((hr) => hr.id),
    });
  };

  // Displays the text of the dropdown i.e if all are selected, then "All" is displayed or if Acute malnutrition and Fever and rash are selected then "Acute malnutrition (+1)" is displayed.
  const renderHealthRiskValues = (selectedIds) =>
    selectedIds.length < 1 || selectedIds.length === allHealthRisks.length
      ? strings(stringKeys.dashboard.filters.healthRiskAll)
      : selectedIds.map(
          (id) => allHealthRisks?.find((hr) => hr.id === id)?.name,
        )[0] +
        `${selectedIds.length > 1 ? ` (+${selectedIds.length - 1})` : ""}`;

  // Uses the onChange function to fetch from backend
  const showResults = () => {
    onChange(filteredHealthRisks);
    setDialogOpen(false);
  };

  return (
    <DropdownPopover
      label={strings(stringKeys.dashboard.filters.healthRisk)}
      filterLabel={renderHealthRiskValues(filteredHealthRisks)}
      showResults={showResults}
      rtl={rtl}
      dialogOpen={dialogOpen}
      setDialogOpen={setDialogOpen}
    >
      <SelectAll
        isSelectAllEnabled={
          filteredHealthRisks.length === allHealthRisks.length
        }
        toggleSelectAll={toggleSelectAll}
        showResults={showResults}
      />
      {allHealthRisks.map((hr) => (
        <MenuItem
          key={`filter_healthRisk_${hr.id}`}
          value={hr.id}
          className={styles.healtRiskMenuItem}
        >
          <Checkbox
            value={hr.id}
            color="primary"
            checked={filteredHealthRisks.indexOf(hr.id) > -1}
            onClick={handleHealthRiskChange}
          />
          <span
            style={{
              width: "90%",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
              overflowWrap: "break-word",
            }}
          >
            {hr.name}
          </span>
        </MenuItem>
      ))}
    </DropdownPopover>
  );
};
