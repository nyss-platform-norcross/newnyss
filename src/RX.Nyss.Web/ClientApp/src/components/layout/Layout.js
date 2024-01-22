import React from "react";
import { Header } from "./Header";
import { SideMenu } from "./SideMenu";
import { BaseLayout } from "./BaseLayout";
import styles from "./Layout.module.scss";
import { MessagePopup } from "./MessagePopup";
import { TabMenu } from "./TabMenu";
import { Grid, Typography, makeStyles } from "@material-ui/core";
import { useSelector } from "react-redux";

const pageContentId = "pageContent";

export const resetPageContentScroll = () => {
  const element = document.getElementById(pageContentId);
  element && element.scrollTo(0, 0);
};

const useStyles = makeStyles((theme) => ({
  mainHeader: {
    textAlign: "center",
    margin: 10
  },
  subHeader: {
    textAlign: "center",
    color: theme.palette.text.secondary
  }
}));

const Layout = ({ fillPage, children }) => {
  const classes = useStyles();
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
        >
          <div
            className={`${styles.pageContent} ${
              fillPage ? styles.fillPage : null
            }`}
          >
            <div className={fillPage ? styles.fillPage : null}>
              {nationalSocietyName && !projectName && (
                <Typography variant="h1" className={classes.mainHeader}>
                  {nationalSocietyName}
                </Typography>
              )}
              {projectName && (
                <Grid container direction="column">
                  <Typography variant="body1" className={classes.subHeader}>
                    {nationalSocietyName}
                  </Typography>
                  <Typography variant="h1" className={classes.mainHeader}>
                    {projectName}
                  </Typography>
                </Grid>
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
