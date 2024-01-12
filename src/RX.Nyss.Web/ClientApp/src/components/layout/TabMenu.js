import styles from "./TabMenu.module.scss";

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { Tabs, Tab, Grid } from "@material-ui/core";
import { TabDropdown } from "./TabDropdown";

const TabMenuComponent = ({ projectTabMenu, tabMenu, push, currentUrl }) => {
  const onItemClick = (item) => {
    push(item.url);
  };

  // http addresses are case insensitive so compare to-lower versions
  const showTabMenu = tabMenu.some(
    (t) => t.url.toLowerCase() === currentUrl.toLowerCase(),
  );
  return (
    <div className={styles.tabMenu}>
      <Grid container justifyContent="center" style={{ marginBottom: 50 }}>
        {/* Only display project tab menu for all users other than data consumer since the role only has acces to project dashboard */}
        {projectTabMenu.length > 1 &&
          projectTabMenu.map((item) => (
            <Grid
              key={`projectTabMenu_${item.url}`}
              item
              style={{ backgroundColor: "#FCFCFC" }}
            >
              <TabDropdown
                projectTabMenuPage={item}
                onItemClick={onItemClick}
              />
            </Grid>
          ))}
      </Grid>

      {showTabMenu && (
        <Tabs
          value={tabMenu.indexOf(tabMenu.find((t) => t.isActive))}
          className={styles.tabs}
          scrollButtons="auto"
          indicatorColor="primary"
          variant="scrollable"
        >
          {tabMenu.map((item) => (
            <Tab
              key={`tabMenu_${item.url}`}
              label={item.title}
              onClick={item.isActive ? () => null : () => onItemClick(item)}
            />
          ))}
        </Tabs>
      )}
    </div>
  );
};

TabMenuComponent.propTypes = {
  appReady: PropTypes.bool,
  tabMenu: PropTypes.array,
};

const mapStateToProps = (state) => ({
  projectTabMenu: state.appData.siteMap.projectTabMenu,
  tabMenu: state.appData.siteMap.tabMenu,
  currentUrl: state.appData.route.url,
});

const mapDispatchToProps = {
  push: push,
};

export const TabMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TabMenuComponent);
