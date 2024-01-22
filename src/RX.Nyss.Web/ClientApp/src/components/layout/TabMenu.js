import styles from "./TabMenu.module.scss";

import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { push } from "connected-react-router";
import { Tabs, Tab, Grid } from "@material-ui/core";

const TabMenuComponent = ({ tabMenu, push, currentUrl, title, subTitle }) => {
  const onItemClick = (item) => {
    push(item.url);
  };

  // http addresses are case insensitive so compare to-lower versions
  const showTabMenu = tabMenu.some(
    (t) => t.url.toLowerCase() === currentUrl.toLowerCase(),
  );

  // Display tabmenu for all pages except alert assesment page
  if(title && subTitle) return null;

  return (
    <Grid style={{ margin: "20px 0px" }}>
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
              style={{ fontWeight: item.isActive ? "bold" : "normal" }}
            />
          ))}
        </Tabs>
      )}
    </Grid>
  );
};

TabMenuComponent.propTypes = {
  appReady: PropTypes.bool,
  tabMenu: PropTypes.array,
};

const mapStateToProps = (state) => ({
  tabMenu: state.appData.siteMap.tabMenu,
  currentUrl: state.appData.route.url,
  title: state.appData.siteMap.parameters.title,
  subTitle: state.appData.siteMap.parameters.subTitle,
});

const mapDispatchToProps = {
  push: push,
};

export const TabMenu = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TabMenuComponent);
