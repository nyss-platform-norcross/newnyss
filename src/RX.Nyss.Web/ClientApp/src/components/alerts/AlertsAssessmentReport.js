import styles from "./AlertsAssessmentReport.module.scss";

import React, { Fragment } from 'react';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Divider from '@material-ui/core/Divider';
import { stringKeys, strings } from "../../strings";
import dayjs from "dayjs";
import Icon from "@material-ui/core/Icon";
import SubmitButton from "../forms/submitButton/SubmitButton";

const ReportFormLabel = ({ label, value }) => (
  <div className={styles.container}>
    <div className={styles.key}>{label}</div>
    <div className={styles.value}>{value}</div>
  </div>
);

const getReportIcon = (status) => {
  switch (status) {
    case "Pending": return <Icon className={styles.indicator}>hourglass_empty</Icon>;
    case "Accepted": return <Icon className={`${styles.indicator} ${styles.accepted}`}>check</Icon>;
    case "Rejected": return <Icon className={`${styles.indicator} ${styles.rejected}`}>clear</Icon>;
    default: return <Icon className={styles.indicator}>warning</Icon>;
  }
}

export const AlertsAssessmentReport = ({ alertId, report, acceptReport, dismissReport, assessmentStatus }) => {
  const showActions = assessmentStatus === "Open" && report.status === "Pending";

  return (
    <ExpansionPanel>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
      >
        {getReportIcon(report.status)}
        <span className={styles.time}>{dayjs(report.receivedAt).format('YYYY-MM-DD HH:mm')}</span>
        <span className={styles.senderLabel}>{strings(stringKeys.alerts.assess.report.sender)}</span>
        <span className={styles.sender}>{report.dataCollector}</span>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails className={styles.form}>
        <ReportFormLabel
          label={strings(stringKeys.alerts.assess.report.phoneNumber)}
          value={report.phoneNumber}
        />
        <ReportFormLabel
          label={strings(stringKeys.alerts.assess.report.village)}
          value={report.village}
        />
        <ReportFormLabel
          label={strings(stringKeys.alerts.assess.report.sex)}
          value={strings(stringKeys.alerts.constants.sex[report.sex])}
        />
        <ReportFormLabel
          label={strings(stringKeys.alerts.assess.report.age)}
          value={strings(stringKeys.alerts.constants.age[report.age])}
        />
      </ExpansionPanelDetails>

      {showActions && (
        <Fragment>
          <Divider />
          <ExpansionPanelActions>
            <SubmitButton onClick={() => dismissReport(alertId, report.id)} isFetching={report.isDismissing}>
              {strings(stringKeys.alerts.assess.report.dismiss)}
            </SubmitButton>

            <SubmitButton onClick={() => acceptReport(alertId, report.id)} isFetching={report.isAccepting}>
              {strings(stringKeys.alerts.assess.report.accept)}
            </SubmitButton>
          </ExpansionPanelActions>
        </Fragment>
      )}
    </ExpansionPanel>
  );
}
