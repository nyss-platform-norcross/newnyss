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

// const ReportFormLabel = ({ label, value }) => (
//   <div className={styles.container}>
//     <div className={styles.key}>{label}</div>
//     <div className={styles.value}>{value}</div>
//   </div>
// );
const ReportFormLabel = ({ label, value }) => (
  <Grid container direction="column" style={{ maxWidth: "fit-content", margin: "10px 50px 0 0" }}>
    <Typography style={{ fontWeight: 700, fontSize: 12 }}>{label}</Typography>
    <Typography variant="body2" style={{ marginTop: 5 }}>{value}</Typography>
  </Grid>
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
          fontSize="small"
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
          fontSize="small"
          className={`${styles.indicator} ${styles.rejected} ${
            rtl ? styles.rtl : ""
          }`}
        >
          clear
        </Icon>
      );
    case "Closed":
      return (
        <Icon fontSize="small" className={`${styles.indicator} ${rtl ? styles.rtl : ""}`}>
          block
        </Icon>
      );
    default:
      return (
        <Icon fontSize="small" className={`${styles.indicator} ${rtl ? styles.rtl : ""}`}>
          warning
        </Icon>
      );
  }
};

const useStyles = makeStyles(() => ({
  accordion: {
    border: "1px solid #E3E3E3",
  },
  summary: {
    height: "40px !important",
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
    <Accordion disabled={fromOtherOrg} className={classes.accordion}>
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
                  <Grid item style={{ marginRight: 5 }}>
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
        </Grid>
      </AccordionSummary>
      <AccordionDetails>
        <Grid container>
          <Divider style={{ width: "100%", marginTop: -8 }}/>
          <Grid container item xs={4} direction="column">
            <ReportFormLabel
              label={strings(stringKeys.alerts.assess.report.sender)}
              value={report.isAnonymized ? strings(stringKeys.alerts.assess.report.linkedToSupervisor) : (report.dataCollector || report.organization)}
            />
            <ReportFormLabel
              label={strings(stringKeys.alerts.assess.report.phoneNumber)}
              value={report.phoneNumber}
            />
          </Grid>
          <Grid container item xs={8}>
            <ReportFormLabel
              label={"Date"}
              value={dayjs(report.receivedAt).format("YYYY-MM-DD")}
            />
            <ReportFormLabel
              label={"Time"}
              value={dayjs(report.receivedAt).format("HH:mm")}
            />
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
            {showSupervisorDetails && (
              <ReportFormLabel
                label={strings(stringKeys.roles.Supervisor)}
                value={`${report.supervisorName} / ${report.supervisorPhoneNumber}`}
              />
            )}
          </Grid>
          {/* <Grid item xs={6} xl={3}>
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
          </Grid> */}
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
