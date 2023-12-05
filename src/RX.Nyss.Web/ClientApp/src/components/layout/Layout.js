import React from "react";
import { Header } from "./Header";
import { SideMenu } from "./SideMenu";
import { BaseLayout } from "./BaseLayout";
import styles from "./Layout.module.scss";
import { MessagePopup } from "./MessagePopup";
import { TabMenu } from "./TabMenu";
import { Typography, makeStyles } from "@material-ui/core";
import { useSelector } from "react-redux";

const pageContentId = "pageContent";

export const resetPageContentScroll = () => {
  const element = document.getElementById(pageContentId);
  element && element.scrollTo(0, 0);
};

const useStyles = makeStyles({
  header: {
    color: "#000",
    fontSize: 32,
    fontWeight: 700,
    textAlign: "center",
    margin: "20px 0 20px 0",
  },
  title: {
    fontSize: 24,
    fontWeight: 600
  }
});

const Layout = ({ fillPage, children }) => {
  const classes = useStyles();
  const nationalSocietyName = useSelector(
    (state) => state.appData.siteMap.parameters.nationalSocietyName
  );
  const projectName = useSelector(
    (state) => state.appData.siteMap.parameters.projectName
  );
  const title = useSelector(
    (state) => state.appData.siteMap.title
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
        >
          <div
            className={`${styles.pageContent} ${
              fillPage ? styles.fillPage : null
            }`}
          >
            <div className={fillPage ? styles.fillPage : null}>
              {(nationalSocietyName && !projectName) && (
                <Typography className={classes.header}>{nationalSocietyName}</Typography>
              )}
              {projectName && (
                <Typography className={classes.header}>{projectName}</Typography>
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
