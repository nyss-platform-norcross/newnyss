import React, { useState } from "react";
import { Header } from "./Header";
import { SideMenu } from "./SideMenu";
import { BaseLayout } from "./BaseLayout";
import styles from "./Layout.module.scss";
import { MessagePopup } from "./MessagePopup";
import { TabMenu } from "./TabMenu";
import { Typography, makeStyles, useMediaQuery, useTheme } from "@material-ui/core";
import { useSelector } from "react-redux";
import useDashboardScrollingTracking from "../../utils/useDashboardScrollingTracking";
import { BottomMenu } from "./BottomMenu";

const pageContentId = "pageContent";

export const resetPageContentScroll = () => {
  const element = document.getElementById(pageContentId);
  element && element.scrollTo(0, 0);
};

const useStyles = makeStyles({
  header: {
    textAlign: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: 600,
  },
});

const Layout = ({ fillPage, children }) => {
  const classes = useStyles();
  const handleScroll = useDashboardScrollingTracking();
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const nationalSocietyName = useSelector(
    (state) => state.appData.siteMap.parameters.nationalSocietyName,
  );
  const projectName = useSelector(
    (state) => state.appData.siteMap.parameters.projectName,
  );
  return (
    <BaseLayout>
      <SideMenu />
      <div className={styles.mainContent}>
        <Header />
        <div
          className={`${styles.pageContentContainer} ${
            fillPage ? styles.fillPage : null
          }`}
          id={pageContentId}
          onScroll={handleScroll}
        >
          <div
            className={`${styles.pageContent} ${
              fillPage ? styles.fillPage : null
            }`}
          >
            <div className={fillPage ? styles.fillPage : null}>
              {nationalSocietyName && !projectName && (
                <Typography variant="h1" className={classes.header}>
                  {nationalSocietyName}
                </Typography>
              )}
              {projectName && (
                <Typography variant="h1" className={classes.header}>
                  {nationalSocietyName} - {projectName}
                </Typography>
              )}
              <TabMenu />
              {children}
            </div>
          </div>
        </div>
      </div>
      {isSmallScreen && <BottomMenu/>}
      <MessagePopup />
    </BaseLayout>
  );
};

export default Layout;
