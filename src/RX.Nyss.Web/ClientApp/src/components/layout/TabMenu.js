import styles from './TabMenu.module.scss';

import React from 'react';
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { Tabs, Tab, Grid, Typography, makeStyles } from '@material-ui/core';
import { TabDropdown } from './TabDropdown';
import { SubMenuTitle } from './SubMenuTitle';

const useStyles = makeStyles({
  nsHeader: {
    color: "#4F4F4F",
    fontSize: 16,
    fontWeight: 400,
    textAlign: "center"
  },
  projectHeader: {
    color: "#000",
    fontSize: 32,
    fontWeight: 700,
    textAlign: "center",
    margin: "20px 0 20px 0"
  }
});

const TabMenuComponent = ({ projectTabMenu, tabMenu, push, currentUrl, title, projectName }) => {
  const classes = useStyles()

  const onItemClick = (item) => {
    push(item.url);
  };

  // http addresses are case insensitive so compare to-lower versions
  const showTabMenu = tabMenu.some(t => t.url.toLowerCase() === currentUrl.toLowerCase());

  return (
    <div className={styles.tabMenu}>
      {projectName ?
        <Typography className={classes.projectHeader}>{projectName}</Typography>
        :
        <div className={styles.header}>{title}</div>
      }
      <Grid container justifyContent='center' style={{ marginBottom: 50 }}>
        {/* Only display project tab menu for all users other than data consumer since the role only has acces to project dashboard */}
        {projectTabMenu.length > 1 && (
            projectTabMenu.map(item => (
            <Grid key={`projectTabMenu_${item.url}`} item style={{ backgroundColor: "#FCFCFC" }}>
              <TabDropdown page={item} onItemClick={onItemClick}/>
            </Grid>
          ))
        )}
      </Grid>

      {showTabMenu && (
        <Tabs
          value={tabMenu.indexOf(tabMenu.find(t => t.isActive))}
          className={styles.tabs}
          scrollButtons="auto"
          indicatorColor="primary"
          variant="scrollable">
          {tabMenu.map(item => (
            <Tab key={`tabMenu_${item.url}`} label={item.title} onClick={() => onItemClick(item)} />
          ))}
        </Tabs>
      )}
    </div>
  );
}

TabMenuComponent.propTypes = {
  appReady: PropTypes.bool,
  tabMenu: PropTypes.array
};

const mapStateToProps = state => ({
  projectName: state.appData.siteMap.parameters.projectName,
  projectTabMenu: state.appData.siteMap.projectTabMenu,
  tabMenu: state.appData.siteMap.tabMenu,
  title: state.appData.siteMap.title,
  currentUrl: state.appData.route.url
});

const mapDispatchToProps = {
  push: push
};

export const TabMenu = connect(mapStateToProps, mapDispatchToProps)(TabMenuComponent);
