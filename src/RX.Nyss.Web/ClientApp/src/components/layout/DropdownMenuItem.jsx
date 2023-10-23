import React, { useState, useRef, useEffect } from 'react';
import { connect } from "react-redux";
import { push } from "connected-react-router";

import { Button, Typography, makeStyles } from '@material-ui/core';

import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';


export const DropdownMenuItemComponent = ({ page, onItemClick, projectSubMenu }) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const useStyles = makeStyles({
    tab: {
      borderBottom: page.isActive ? (open ? "3px solid transparent" : "3px solid #D52B1E") : "3px solid transparent",
      padding: "0px 20px 0px 20px",
    },
    buttonRoot: {
      borderRadius: "10px 10px 0px 0px",
    }
  });

  const styles = useStyles()

  useEffect(()=> {
    if(page.isActive && projectSubMenu.length > 0) setOpen(true);
  }, [page.isActive, projectSubMenu])

  const handleToggle = () => {
    if(!page.isActive) onItemClick(page);
    else if(!page.isActive || projectSubMenu.length > 0) setOpen((prevOpen) => !prevOpen);
    else if(page.isActive && !open) onItemClick(page);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const handleListKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    }
  }

  const handleMenuItemClick = (menuItem) => {
    onItemClick(menuItem)
  }

  return (
    <div style={{ position: "relative", backgroundColor: "inherit", border: page.isActive && open ? "1px solid #E3E3E3" : "1px solid transparent", borderRadius: "10px 10px 0px 0px" }}>
      <Button
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        className={styles.tab}
        classes={{
          root: styles.buttonRoot
        }}
        >
        <Typography variant='subtitle2'>
          {page.title.toUpperCase()}
        </Typography>
      </Button>
      {projectSubMenu.length > 0 && (
        <Popper
          style={{
            marginLeft: 1,
            width: anchorRef?.current?.offsetWidth,
            backgroundColor: "inherit",
            zIndex: 1002,
            border: page.isActive && open ? "1px solid #E3E3E3" : "none",
            borderTop: "none",
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10
        }}
          open={open}
          anchorEl={anchorRef?.current}
          placement="bottom"
          disablePortal={true}
          transition
          modifiers={{
            preventOverflow: {
              enabled: false,
              boundariesElement: 'scrollParent',
              escapeWithReference: true
            },
        }}>
          <ClickAwayListener onClickAway={handleClose}>
            <MenuList autoFocusItem={open} id="menu-list-grow" onKeyDown={handleListKeyDown} style={{ width: "100%", padding: 0, backgroundColor: "inherit", borderRadius: "0px 0px 10px 10px" }}>
              {projectSubMenu.map((menuItem, index) => (
                <MenuItem key={`menuItem_${menuItem.url}`} onClick={() => handleMenuItemClick(menuItem)} style={{ display: "flex", justifyContent: "center", padding: "0", height: 36, borderBottomLeftRadius: index === projectSubMenu.length - 1 && 10, borderBottomRightRadius: index === projectSubMenu.length - 1 && 10 }}>
                  <Typography variant="subtitle2" style={{ padding: 7,  borderBottom: menuItem.isActive ? "3px solid #D52B1E" : "none"}} align='center'>
                    {menuItem.title}
                  </Typography>
                </MenuItem>
              ))
            }
            </MenuList>
          </ClickAwayListener>
        </Popper>
      )}
    </div>
  )
}

const mapStateToProps = state => ({
  projectSubMenu: state.appData.siteMap.projectSubMenu,
});

const mapDispatchToProps = {
  push: push
};

export const DropdownMenuItem = connect(mapStateToProps, mapDispatchToProps)(DropdownMenuItemComponent);
