import styles from "./LocationFilter.module.scss";

import { Fragment, useState } from "react";
import { Popover, TextField } from "@material-ui/core";
import ArrowDropDown from "@material-ui/icons/ArrowDropDown";


export const DropdownPopover = ({ children, label, filterLabel, showResults, rtl, dialogOpen, setDialogOpen }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDropdownClick = (event) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
    setDialogOpen(true);
  };

  const handleKeyUp = (event) => {
    if(event.key === "Enter" || event.key === " ") handleDropdownClick(event);
  }

  return (
    <Fragment>
      <TextField
        label={label}
        InputProps={{
          readOnly: true,
          endAdornment: <ArrowDropDown className={styles.arrow} />,
        }}
        value={filterLabel}
        inputProps={{
          className: styles.clickable,
        }}
        onClick={handleDropdownClick}
        onKeyUp={handleKeyUp}
      />
      <Popover
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          showResults();
        }}
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
      >
        {children}
      </Popover>
    </Fragment>
  )
}