import styles from "./AlertsAssessmentActions.module.scss";

import React, { Fragment, useState, useEffect } from "react";
import { stringKeys, strings } from "../../../strings";
import SubmitButton from "../../common/buttons/submitButton/SubmitButton";
import FormActions from "../../forms/formActions/FormActions";
import CancelButton from "../../common/buttons/cancelButton/CancelButton";
import { AlertsEscalationDialog } from "./AlertsEscalationDialog";
import { assessmentStatus } from "../logic/alertsConstants";
import { AlertsCloseDialog } from "./AlertsCloseDialog";
import { AlertsEscalationWithoutNotificationDialog } from "./AlertsEscalationWithoutNotificationDialog";
import CheckboxField from "../../forms/CheckboxField";
import { validators, createForm } from "../../../utils/forms";
import { Button, CircularProgress, Grid, Snackbar } from "@material-ui/core";
import { Alert, AlertTitle } from "@material-ui/lab";

export const AlertsAssessmentActions = ({
  projectId,
  alertId,
  alertAssessmentStatus,
  isNationalSocietyEidsrEnabled,
  validateEidsrResult,
  hasAccess,
  ...props
}) => {
  const [escalationDialogOpened, setEscalationDialogOpened] = useState(false);
  const [
    escalationWithoutNotificationDialogOpened,
    setEscalationWithoutNotificationDialogOpened,
  ] = useState(false);
  const [closeDialogOpened, setCloseDialogOpened] = useState(false);

  const [openValidationSnackbar, setOpenValidationSnackbar] =
    React.useState(false);

  useEffect(() => {
    if (validateEidsrResult) {
      setOpenValidationSnackbar(true);
    }
  }, [validateEidsrResult]);

  const handleCloseValidationSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenValidationSnackbar(false);
  };

  const [form] = useState(() => {
    const fields = {
      comments: "",
      escalateWithoutNotification: false,
    };
    const validation = { comments: [validators.maxLength(500)] };
    return createForm(fields, validation);
  });

  const handleEscalateAlert = () => {
    if (form.fields.escalateWithoutNotification.value) {
      setEscalationWithoutNotificationDialogOpened(true);
    } else {
      props.fetchRecipients(alertId);
      setEscalationDialogOpened(true);
    }
  };

  return (
    <Fragment>
      <FormActions>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            {isNationalSocietyEidsrEnabled && (
              <>
                <div hidden="true">
                  <Button
                    disabled={props.isLoadingValidateEidsr}
                    color="primary"
                    onClick={() => props.validateEidsr(alertId)}
                  >
                    {" "}
                    Validate Eidsr migration{" "}
                  </Button>
                </div>
                {props.isLoadingValidateEidsr && <CircularProgress size={12} />}
                <Snackbar open={openValidationSnackbar}>
                  <Alert
                    style={{ backgroundColor: "#eee" }}
                    onClose={handleCloseValidationSnackbar}
                    severity="info"
                  >
                    <AlertTitle>
                      {strings(
                        stringKeys.alerts.assess.alert.eidsrValidation.title,
                      )}
                    </AlertTitle>
                    <ul>
                      <li>
                        {strings(
                          stringKeys.alerts.assess.alert.eidsrValidation
                            .connection,
                        )}
                        :{" "}
                        {validateEidsrResult?.isEidsrApiConnectionRunning
                          ? strings(stringKeys.common.boolean.true)
                          : strings(stringKeys.common.boolean.false)}
                      </li>
                      <li>
                        {strings(
                          stringKeys.alerts.assess.alert.eidsrValidation
                            .integrationValid,
                        )}
                        :{" "}
                        {validateEidsrResult?.isIntegrationConfigValid
                          ? strings(stringKeys.common.boolean.true)
                          : strings(stringKeys.common.boolean.false)}{" "}
                      </li>
                      <li>
                        {strings(
                          stringKeys.alerts.assess.alert.eidsrValidation
                            .validReportsCount,
                        )}
                        :{" "}
                        {validateEidsrResult?.areReportsValidCount
                          ? validateEidsrResult?.areReportsValidCount
                          : 0}
                      </li>
                    </ul>
                    <p>
                      {strings(
                        stringKeys.alerts.assess.alert.eidsrValidation.tip,
                      )}
                    </p>
                  </Alert>
                </Snackbar>
              </>
            )}
          </Grid>
          <Grid item container xs={6} justifyContent="flex-end">
            <CancelButton onClick={() => props.goToList(projectId)}>
              {strings(stringKeys.form.cancel)}
            </CancelButton>
            {!props.isPendingAlertState && (
              <Fragment>
                {alertAssessmentStatus === assessmentStatus.toEscalate &&
                  hasAccess && (
                    <Fragment>
                      <AlertsEscalationDialog
                        alertId={alertId}
                        escalateAlert={props.escalateAlert}
                        isEscalating={props.isEscalating}
                        isFetchingRecipients={props.isFetchingRecipients}
                        notificationEmails={props.notificationEmails}
                        notificationPhoneNumbers={
                          props.notificationPhoneNumbers
                        }
                        isOpened={escalationDialogOpened}
                        close={() => setEscalationDialogOpened(false)}
                      />

                      <AlertsEscalationWithoutNotificationDialog
                        alertId={alertId}
                        escalateAlert={props.escalateAlert}
                        isEscalating={props.isEscalating}
                        isOpened={escalationWithoutNotificationDialogOpened}
                        close={() =>
                          setEscalationWithoutNotificationDialogOpened(false)
                        }
                      />

                      <div
                        className={styles.escalateWithoutNotificationWrapper}
                      >
                        <CheckboxField
                          name="escalateWithoutNotification"
                          label={strings(
                            stringKeys.alerts.assess.alert
                              .escalateWithoutNotification,
                          )}
                          field={form.fields.escalateWithoutNotification}
                        />
                      </div>

                      <SubmitButton onClick={handleEscalateAlert}>
                        {strings(stringKeys.alerts.assess.alert.escalate)}
                      </SubmitButton>
                    </Fragment>
                  )}

                {(alertAssessmentStatus === assessmentStatus.toDismiss ||
                  alertAssessmentStatus === assessmentStatus.rejected) &&
                  hasAccess && (
                    <SubmitButton
                      isFetching={props.isDismissing}
                      onClick={() => props.dismissAlert(alertId)}
                    >
                      {strings(stringKeys.alerts.assess.alert.dismiss)}
                    </SubmitButton>
                  )}

                {alertAssessmentStatus === assessmentStatus.escalated &&
                  hasAccess && (
                    <Fragment>
                      <AlertsCloseDialog
                        alertId={alertId}
                        closeAlert={props.closeAlert}
                        isClosing={props.isClosing}
                        isOpened={closeDialogOpened}
                        close={() => setCloseDialogOpened(false)}
                      />
                      <SubmitButton onClick={() => setCloseDialogOpened(true)}>
                        {strings(stringKeys.alerts.assess.alert.close)}
                      </SubmitButton>
                    </Fragment>
                  )}
              </Fragment>
            )}
          </Grid>
        </Grid>
      </FormActions>
    </Fragment>
  );
};
