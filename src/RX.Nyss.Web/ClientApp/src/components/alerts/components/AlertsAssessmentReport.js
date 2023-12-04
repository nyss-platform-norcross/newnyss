import styles from "./AlertsAssessmentReport.module.scss";

import { Fragment } from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { stringKeys, strings } from "../../../strings";
import dayjs from "dayjs";
import SubmitButton from "../../common/buttons/submitButton/SubmitButton";
import { assessmentStatus } from "../logic/alertsConstants";
import {
  Button,
  CircularProgress,
  Grid,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  AccordionActions,
  Divider,
  Icon,
  Typography,
  Chip
} from "@material-ui/core";
import { useSelector } from "react-redux";
import { Manager, TechnicalAdvisor } from "../../../authentication/roles";
import { makeStyles } from "@material-ui/core/styles";


var relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

const ReportFormLabel = ({ label, value }) => (
  <div className={styles.container}>
    <div className={styles.key}>{label}</div>
    <div className={styles.value}>{value}</div>
  </div>
);

const getReportIcon = (status, rtl) => {
  switch (status) {
    case "Pending":
      return (
        <Icon fontSize="small" className={`${styles.indicator} ${rtl ? styles.rtl : ""}`}>
          hourglass_empty
        </Icon>
      );
    case "Accepted":
      return (
        <Icon
          className={`${styles.indicator} ${styles.accepted} ${
            rtl ? styles.rtl : ""
          }`}
        >
          check
        </Icon>
      );
    case "Rejected":
      return (
        <Icon
          className={`${styles.indicator} ${styles.rejected} ${
            rtl ? styles.rtl : ""
          }`}
        >
          clear
        </Icon>
      );
    case "Closed":
      return (
        <Icon className={`${styles.indicator} ${rtl ? styles.rtl : ""}`}>
          block
        </Icon>
      );
    default:
      return (
        <Icon className={`${styles.indicator} ${rtl ? styles.rtl : ""}`}>
          warning
        </Icon>
      );
  }
};

const useStyles = makeStyles(() => ({
  summary: {
    border: "1px solid #E3E3E3",
  },
  time: {
    fontSize: 14,
    color: "#4F4F4F"
  },
  report: {
    fontWeight: 700,
  },
  chip: {
    marginRight: 20,
  },
  Pending: {
    backgroundColor: "#FFE497"
  },
  Accepted: {
    backgroundColor: "#D6F9D5"
  },
  Rejected: {
    backgroundColor: "#E3E3E3"
  },
  Closed: {
    backgroundColor: "#E3E3E3"
  },
}));

export const AlertsAssessmentReport = ({
  alertId,
  escalatedAt,
  report,
  acceptReport,
  dismissReport,
  resetReport,
  status,
  projectIsClosed,
  rtl,
}) => {
  const currentUserRoles = useSelector((state) => state.appData.user.roles);
  const showActions =
    status !== assessmentStatus.closed &&
    status !== assessmentStatus.dismissed &&
    report.status === "Pending" &&
    !report.isAnonymized;
  const showResetOption =
    status !== assessmentStatus.closed &&
    status !== assessmentStatus.dismissed &&
    (report.status === "Accepted" || report.status === "Rejected") &&
    (escalatedAt
      ? dayjs(report.acceptedAt || report.rejectedAt).isAfter(
          dayjs(escalatedAt),
        )
      : true) &&
    !report.isAnonymized;

  const fromOtherOrg = report.dataCollector == null;

  const showSupervisorDetails = currentUserRoles.some(
    (r) => r === Manager || r === TechnicalAdvisor,
  );

  const classes = useStyles()

  return (
    <Accordion disabled={fromOtherOrg}>
      <AccordionSummary className={classes.summary} expandIcon={!fromOtherOrg && <ExpandMoreIcon />}>
        <Grid container alignContent="center">
          <Grid container alignItems="center" item xs={4}>
            <Typography className={classes.time}>
              Sent {dayjs(dayjs(report.receivedAt).format("YYYY-MM-DD HH:mm")).fromNow()}
            </Typography>
          </Grid>
          <Grid container alignItems="center" item xs={4}>
            <Typography variant="body2" className={classes.report}>
              Report ID #{report.id}
            </Typography>
          </Grid>
          <Grid container alignItems="center" item xs={4} justifyContent="flex-end">
            <Chip
              label={
                <Grid container justifyContent="center" alignItems="center">
                  <Grid item>
                    {getReportIcon(report.status, rtl)}
                  </Grid>
                  <Grid item>
                    {strings(stringKeys.reports.status[report.status])}
                  </Grid>
                </Grid>
              }
              className={`${classes[report.status]} ${classes.chip}`}
            />
          </Grid>
        {/* {getReportIcon(report.status, rtl)} */}
        {/* <div className={styles.senderContainer}>
          <span className={styles.senderLabel}>
          {strings(stringKeys.alerts.assess.report.sender)}{" "}
          {report.isAnonymized &&
            strings(stringKeys.alerts.assess.report.linkedToSupervisor)}
            </span>
            <span className={styles.sender}>
            {report.dataCollector || report.organization}
            </span>
          </div> */}
        </Grid>
      </AccordionSummary>
      <AccordionDetails className={styles.form}>
        <Grid container spacing={2}>
          <Grid item xs={6} xl={3}>
            <ReportFormLabel
              label={strings(stringKeys.alerts.assess.report.phoneNumber)}
              value={report.phoneNumber}
            />
            <ReportFormLabel
              label={strings(stringKeys.alerts.assess.report.village)}
              value={report.village}
            />
            <ReportFormLabel
              label={strings(stringKeys.alerts.assess.report.district)}
              value={report.district}
            />
            <ReportFormLabel
              label={strings(stringKeys.alerts.assess.report.region)}
              value={report.region}
            />
          </Grid>
          <Grid item xs={6} xl={3}>
            {report.sex && (
              <ReportFormLabel
                label={strings(stringKeys.alerts.assess.report.sex)}
                value={strings(stringKeys.alerts.constants.sex[report.sex])}
              />
            )}
            {report.age && (
              <ReportFormLabel
                label={strings(stringKeys.alerts.assess.report.age)}
                value={strings(stringKeys.alerts.constants.age[report.age])}
              />
            )}
            <ReportFormLabel
              label={strings(stringKeys.alerts.assess.report.id)}
              value={report.id}
            />
            {showSupervisorDetails && (
              <ReportFormLabel
                label={strings(stringKeys.roles.Supervisor)}
                value={`${report.supervisorName} / ${report.supervisorPhoneNumber}`}
              />
            )}
          </Grid>
        </Grid>
      </AccordionDetails>
      {!projectIsClosed && (
        <Fragment>
          <Divider />
          <AccordionActions>
            {showActions && (
              <Fragment>
                <SubmitButton
                  onClick={() => dismissReport(alertId, report.id)}
                  isFetching={report.isDismissing}
                  regular
                >
                  {strings(stringKeys.alerts.assess.report.dismiss)}
                </SubmitButton>

                <SubmitButton
                  onClick={() => acceptReport(alertId, report.id)}
                  isFetching={report.isAccepting}
                >
                  {strings(stringKeys.alerts.assess.report.accept)}
                </SubmitButton>
              </Fragment>
            )}

            {!showActions && (
              <div className={styles.reportStatus}>
                {strings(
                  stringKeys.alerts.constants.reportStatus[report.status],
                )}
              </div>
            )}

            {showResetOption && (
              <Fragment>
                <Button
                  variant="text"
                  color="primary"
                  onClick={() => resetReport(alertId, report.id)}
                  disabled={report.isResetting}
                >
                  {report.isResetting && (
                    <CircularProgress
                      size={16}
                      className={styles.progressIcon}
                    />
                  )}
                  {strings(stringKeys.alerts.assess.report.reset)}
                </Button>
              </Fragment>
            )}
          </AccordionActions>
        </Fragment>
      )}
    </Accordion>
  );
};
