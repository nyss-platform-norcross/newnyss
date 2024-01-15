import React, { useEffect, useState } from "react";
import { makeStyles, BottomNavigation, BottomNavigationAction, Drawer, List, ListItem, ListItemText, Typography, useTheme } from "@material-ui/core";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { RcIcon } from "../icons/RcIcon";

const mapStateToProps = (state) => ({
  projectTabMenu: state.appData.siteMap.projectTabMenu,
  tabMenu: state.appData.siteMap.tabMenu,
  currentUrl: state.appData.route.url,
});

const mapDispatchToProps = {
  push: push,
};

const useStyles = makeStyles((theme) => ({
  bottomNav: {
    height: 70,
    zIndex: 1001,
    position: 'fixed',
    backgroundColor: theme.palette.backgroundDark.main,
    bottom: 0,
    width: '100%',
  },
  bottomNavDrawer: {
    height: 70,
    backgroundColor: theme.palette.backgroundDark.main,
  },
  bottomNavActionSelected: {
    color: theme.palette.primary.main,
  },
  bottomNavItem: {
    minWidth: 50,
    whiteSpace: "nowrap",
    color: theme.palette.text.secondary,
  },
  drawer: {
    flexShrink: 0,
    transition: 'height 0.3s ease',
  },
  drawerPaper: {
    height: (props) => props.drawerHeight,
    maxHeight: 450,
  },
}));

const BottomMenuNavigationComponent = ({ value, handleChange, toggleDrawer, className, projectTabMenu, onItemClick }) => {
  const classes = useStyles();

  const onMenuClick = (page) => {
    // Opens drawer if there are sub menu options
    if(page.subMenu.length > 1) {
      toggleDrawer(true, page.subMenu);
    }
    // Closes the drawer if the pressed menu option is already active
    else if(page.isActive) {
      toggleDrawer(false, []);
    }
    // Forwards the user to the selected menu option
    else {
      onItemClick(page);
    }
  }
  return (
      <BottomNavigation
        value={value}
        onChange={handleChange}
        className={className}
        >
        {projectTabMenu.length > 1 && (
          projectTabMenu.map((page) => {
          return (
            <BottomNavigationAction
              classes={{
                root: classes.bottomNavItem,
                selected: classes.bottomNavActionSelected
              }}
              key={page.title}
              value={page.title}
              label={page.title}
              onClick={() => onMenuClick(page)}
              icon={<RcIcon
                icon={page.icon}
              />}
            />
          )
        }))}
      </BottomNavigation>
  )
}
export const BottomMenuNavigation = connect(
  mapStateToProps,
  mapDispatchToProps,
)(BottomMenuNavigationComponent);


export const BottomMenuComponent = ({ projectTabMenu, push }) => {
  const [value, setValue] = React.useState(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const [options, setOptions] = useState([]);
  const classes = useStyles({ drawerHeight: options.length * 73 + 70 });
  const theme = useTheme()

  useEffect(() => {
    const activeMenuItem = projectTabMenu.find(menuItem => menuItem.isActive)?.title
    setValue(activeMenuItem)
  },[projectTabMenu])

  const onItemClick = (item) => {
    push(item.url)
  };

  const toggleDrawer = (open, drawerOptions) => {
    setIsOpen(open);
    setOptions(drawerOptions)
    if(!open) {
      const activeMenuItem = projectTabMenu.find(menuItem => menuItem.isActive)?.title
      setValue(activeMenuItem)
    }
  };

  const handleChange = (_, newValue) => {
    setValue(newValue);
  };

  if(!value) return null;

  return (
    <>
      <BottomMenuNavigation value={value} handleChange={handleChange} toggleDrawer={toggleDrawer} className={classes.bottomNav} onItemClick={onItemClick}/>
      <Drawer
        classes={{
          paper: classes.drawerPaper,
        }}
        anchor={"bottom"}
        className={classes.drawer}
        open={isOpen}
        onClose={() => toggleDrawer(false, [])}
      >
        <BottomMenuNavigation value={value} handleChange={handleChange} toggleDrawer={toggleDrawer} className={classes.bottomNavDrawer} onItemClick={onItemClick}/>
        <div
          role="presentation"
          onClick={() => toggleDrawer(false, [])}
          onKeyDown={() => toggleDrawer(false, [])}
          >
          <List disablePadding>
            {options.map((option, index) => (
              <ListItem
                key={option.title}
                button
                style={{ borderBottom: `${options.length - 1 !== index ? `1px solid ${theme.palette.grey[400]}`: undefined}` }}
                onClick={() => onItemClick(option)}>
                <ListItemText
                  primary={
                    <Typography>
                      {option.title}
                    </Typography>
                  }/>
              </ListItem>
            ))}
          </List>
        </div>
      </Drawer>
    </>
  )
}



export const BottomMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(BottomMenuComponent);
