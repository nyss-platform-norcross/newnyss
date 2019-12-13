import styles from "./AlertsAssessment.module.scss";
import React, { useEffect, Fragment, useState } from 'react';
import { connect } from "react-redux";
import { useLayout } from '../../utils/layout';
import * as alertsActions from './logic/alertsActions';
import Layout from '../layout/Layout';
import { Loading } from '../common/loading/Loading';
import { useMount } from '../../utils/lifecycle';
import Grid from '@material-ui/core/Grid';
import { stringKeys, strings } from '../../strings';
import FormActions from '../forms/formActions/FormActions';
import Button from "@material-ui/core/Button";
import SubmitButton from '../forms/submitButton/SubmitButton';
import DisplayField from "../forms/DisplayField";
import { AlertsAssessmentReport } from "./AlertsAssessmentReport";
import { assessmentStatus } from "./logic/alertsConstants";
import Divider from "@material-ui/core/Divider";
import TextInputField from "../forms/TextInputField";
import { validators, createForm } from "../../utils/forms";

const getAssessmentStatusInformation = (status) => {
  switch (status) {
    case assessmentStatus.open:
    case assessmentStatus.toEscalate:
    case assessmentStatus.toDismiss:
      return stringKeys.alerts.assess.introduction;

    case assessmentStatus.closed:
      return stringKeys.alerts.assess.statusDescription.closed;
    case assessmentStatus.escalated:
      return stringKeys.alerts.assess.statusDescription.escalated;
    case assessmentStatus.dismissed:
      return stringKeys.alerts.assess.statusDescription.dismissed;
    default:
      throw new Error("Wrong status")
  }
}

const AlertsAssessmentPageComponent = ({ alertId, data, ...props }) => {
  useMount(() => {
    props.openAssessment(props.projectId, alertId);
  });

  useEffect(() => {
    if (!props.data) {
      return;
    }

  }, [props.data, props.match]);

  const [form] = useState(() => {
    const fields = { comments: "" };
    const validation = { comments: [validators.maxLength(500)] };
    return createForm(fields, validation);
  })

  if (props.isFetching || !data) {
    return <Loading />;
  }

  const handleCloseAlert = () => {
    props.closeAlert(alertId, form.fields.comments.value);
  }

  return (
    <Fragment>
      <div className={styles.form}>
        <div className={styles.introduction}>
          {strings(getAssessmentStatusInformation(data.assessmentStatus))}
        </div>

        {data.assessmentStatus === assessmentStatus.closed && data.comments && (
          <DisplayField
            label={strings(stringKeys.alerts.assess.comments)}
            value={data.comments}
          />
        )}

        <DisplayField
          label={strings(stringKeys.alerts.assess.caseDefinition)}
          value={data.caseDefinition}
        />

        <Divider />

        <div className={styles.reportsTitle}>{strings(stringKeys.alerts.assess.reports)}</div>

        <Grid container spacing={3}>
          {data.reports.map(report => (
            <Grid item xs={12} key={`report_${report.id}`}>
              <AlertsAssessmentReport
                report={report}
                alertId={alertId}
                assessmentStatus={data.assessmentStatus}
                acceptReport={props.acceptReport}
                dismissReport={props.dismissReport}
              />
            </Grid>
          ))}

          {data.assessmentStatus === assessmentStatus.escalated && (
            <Grid item xs={12}>
              <TextInputField
                label={strings(stringKeys.alerts.assess.comments)}
                name="comments"
                field={form.fields.comments}
              />
            </Grid>
          )}
        </Grid>

        <FormActions>
          <Button onClick={() => props.goToList(props.projectId)}>{strings(stringKeys.form.cancel)}</Button>

          {data.assessmentStatus === assessmentStatus.toEscalate && (
            <SubmitButton isFetching={props.isEscalating} onClick={() => props.escalateAlert(alertId)}>
              {strings(stringKeys.alerts.assess.alert.escalate)}
            </SubmitButton>
          )}

          {data.assessmentStatus === assessmentStatus.toDismiss && (
            <SubmitButton isFetching={props.isDismissing} onClick={() => props.dismissAlert(alertId)}>
              {strings(stringKeys.alerts.assess.alert.dismiss)}
            </SubmitButton>
          )}

          {data.assessmentStatus === assessmentStatus.escalated && (
            <SubmitButton isFetching={props.isClosing} onClick={handleCloseAlert}>
              {strings(stringKeys.alerts.assess.alert.close)}
            </SubmitButton>
          )}
        </FormActions>
      </div>
    </Fragment>
  );
}

AlertsAssessmentPageComponent.propTypes = {
};

const mapStateToProps = (state, ownProps) => ({
  projectId: ownProps.match.params.projectId,
  alertId: ownProps.match.params.alertId,
  isFetching: state.alerts.formFetching,
  isSaving: state.alerts.formSaving,
  isEscalating: state.alerts.formEscalating,
  isClosing: state.alerts.formClosing,
  isDismissing: state.alerts.formDismissing,
  data: state.alerts.formData
});

const mapDispatchToProps = {
  goToList: alertsActions.goToList,
  openAssessment: alertsActions.openAssessment.invoke,
  acceptReport: alertsActions.acceptReport.invoke,
  dismissReport: alertsActions.dismissReport.invoke,
  escalateAlert: alertsActions.escalateAlert.invoke,
  closeAlert: alertsActions.closeAlert.invoke,
  dismissAlert: alertsActions.dismissAlert.invoke,
};

export const AlertsAssessmentPage = useLayout(
  Layout,
  connect(mapStateToProps, mapDispatchToProps)(AlertsAssessmentPageComponent)
);
