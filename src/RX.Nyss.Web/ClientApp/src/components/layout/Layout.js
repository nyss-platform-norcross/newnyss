import React, { useState } from "react";
import { Header } from "./Header";
import { SideMenu } from "./SideMenu";
import { BaseLayout } from "./BaseLayout";
import styles from "./Layout.module.scss";
import { MessagePopup } from "./MessagePopup";
import { TabMenu } from "./TabMenu";
import { Typography, makeStyles } from "@material-ui/core";
import { useSelector } from "react-redux";
import { trackEvent } from "../../utils/appInsightsHelper";

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
  const nationalSocietyName = useSelector(
    (state) => state.appData.siteMap.parameters.nationalSocietyName,
  );
  const projectName = useSelector(
    (state) => state.appData.siteMap.parameters.projectName,
  );
  const pageTitle = useSelector(
    (state) => state.appData.siteMap.title,
  );

  // This code is used to track if a user is scrolling in either the project or NS dashboard.
  const [inDashboardPage, setInDashboardPage] = useState(false);

  if(pageTitle && pageTitle == "Dashboard"){
    !inDashboardPage && setInDashboardPage(true);
  } else if (pageTitle) {
    inDashboardPage && setInDashboardPage(false);
    hasScrolledInDashboard && setHasScrolledInDashboard(false);
  };

  const [scrollTop, setScrollTop] = useState(0);
  const handleScroll = (event) => inDashboardPage && setScrollTop(event.target.scrollTop);
  const [hasScrolledInDashboard, setHasScrolledInDashboard] = useState(false);
  const hasScrolledThreshold = 50;

  // If the user has scrolled past a given threshold in a dashboard, send the data to application insights
  if (inDashboardPage && scrollTop > hasScrolledThreshold && !hasScrolledInDashboard){
    trackEvent("hasScrolledInDashboard");
    setHasScrolledInDashboard(true);
  }
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
      <MessagePopup />
    </BaseLayout>
  );
};

export default Layout;
