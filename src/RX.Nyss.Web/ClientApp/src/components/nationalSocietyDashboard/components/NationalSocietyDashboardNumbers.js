import styles from "./NationalSocietyDashboardNumbers.module.scss";

import React from "react";
import { Grid, Card, CardContent, CardHeader, Typography, useMediaQuery } from "@material-ui/core";
import { Loading } from "../../common/loading/Loading";
import { stringKeys, strings } from "../../../strings";

export const NationalSocietyDashboardNumbers = ({
  isFetching,
  summary,
  reportsType,
  isMapExpanded,
}) => {
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down("sm"));

  if (isFetching || !summary) {
    return <Loading />;
  }


  const cardSizes = {
    xs: isSmallScreen || isMapExpanded ? 12 : 6,
  }

  const renderNumber = (label, value) => (
    <Grid container spacing={2}>
      <Grid item className={styles.numberName}>
        {label}
      </Grid>
      <Grid item className={styles.numberValue}>
        {value}
      </Grid>
    </Grid>
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={cardSizes.xs} className={styles.numberBox}>
        <Card className={styles.card} data-printable={true}>
          <CardHeader
            title={<Typography variant="h5">{strings(stringKeys.dashboard.numbers.reportCountTitle)}</Typography>}
          />
          <CardContent>
            {renderNumber(
              strings(stringKeys.dashboard.numbers.totalReportCount),
              summary.totalReportCount,
            )}
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={cardSizes.xs} className={styles.numberBox}>
        <Card className={styles.card} data-printable={true}>
          <CardHeader title={<Typography variant="h5">{strings(stringKeys.dashboard.dataCollectors)}</Typography>} />
          <CardContent>
            {renderNumber(
              strings(stringKeys.dashboard.activeDataCollectorCount),
              summary.activeDataCollectorCount,
            )}
          </CardContent>
        </Card>
      </Grid>

      {reportsType === "dataCollectionPoint" && (
        <Grid item xs={cardSizes.xs} className={styles.numberBox}>
          <Card className={styles.card} data-printable={true}>
            <CardHeader
              title={<Typography variant="h5">{strings(stringKeys.dashboard.dataCollectionPoints)}</Typography>}
            />
            <CardContent>
              {renderNumber(
                strings(stringKeys.dashboard.referredToHospitalCount),
                summary.dataCollectionPointSummary.referredToHospitalCount,
              )}
              {renderNumber(
                strings(stringKeys.dashboard.fromOtherVillagesCount),
                summary.dataCollectionPointSummary.fromOtherVillagesCount,
              )}
              {renderNumber(
                strings(stringKeys.dashboard.deathCount),
                summary.dataCollectionPointSummary.deathCount,
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      {reportsType !== "dataCollectionPoint" && (
        <Grid item xs={cardSizes.xs} className={styles.numberBox}>
          <Card className={styles.card} data-printable={true}>
            <CardHeader title={<Typography variant="h5">{strings(stringKeys.dashboard.alertsSummary)}</Typography>} />
            <CardContent>
              {renderNumber(
                strings(stringKeys.dashboard.numbers.openAlerts),
                summary.alertsSummary.open,
              )}
              {renderNumber(
                strings(stringKeys.dashboard.numbers.escalatedAlerts),
                summary.alertsSummary.escalated,
              )}
              {renderNumber(
                strings(stringKeys.dashboard.numbers.closedAlerts),
                summary.alertsSummary.closed,
              )}
              {renderNumber(
                strings(stringKeys.dashboard.numbers.dismissedAlerts),
                summary.alertsSummary.dismissed,
              )}
            </CardContent>
          </Card>
        </Grid>
      )}

      <Grid item xs={cardSizes.xs} className={styles.numberBox}>
        <Card className={styles.card} data-printable={true}>
          <CardHeader
            title={<Typography variant="h5">{strings(stringKeys.dashboard.geographicalCoverageSummary)}</Typography>}
          />
          <CardContent>
            {renderNumber(
              strings(stringKeys.dashboard.numbers.numberOfVillages),
              summary.numberOfVillages,
            )}
            {renderNumber(
              strings(stringKeys.dashboard.numbers.numberOfDistricts),
              summary.numberOfDistricts,
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};
