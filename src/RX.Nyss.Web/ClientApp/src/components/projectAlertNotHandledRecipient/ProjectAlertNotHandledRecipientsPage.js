import styles from './ProjectAlertNotHandledRecipientsPage.module.scss';
import React from 'react';
import { strings, stringKeys } from '../../strings';
import { connect, useSelector } from 'react-redux';
import { useMount } from '../../utils/lifecycle';
import * as projectAlertNotHandledRecipientsActions from './logic/projectAlertNotHandledRecipientsActions';
import { Fragment } from 'react';
import { Administrator } from '../../authentication/roles';
import { ProjectAlertNotHandledRecipientItem } from './components/ProjectAlertNotHandledRecipientItem';
import { Card, CardContent, CircularProgress, Grid, Typography } from '@material-ui/core';
import { withLayout } from "../../utils/layout";
import Layout from "../layout/Layout";

export const ProjectAlertNotHandledRecipientsComponent = ({ openRecipients, projectId, recipients, getFormData, edit, create }) => {
  useMount(() => {
    openRecipients(projectId);
  });

  const currentUserRoles = useSelector(state => state.appData.user.roles);
  const isAdministrator = currentUserRoles.filter(r => r === Administrator).length > 0;
  const isFetchingFormData = useSelector(state => state.projectAlertNotHandledRecipients.formDataFetching);
  const isFetchingList = useSelector(state => state.projectAlertNotHandledRecipients.listFetching);
  const useRtlDirection = useSelector(state => state.appData.user.languageCode === 'ar');

  return !!recipients && (
    <Grid container spacing={4} fixed='true' style={{ maxWidth: 800 }}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Fragment>
              <Grid container spacing={4} fixed='true' >
                <Grid item>

                  <Typography variant="h5">
                    {strings(stringKeys.projectAlertNotHandledRecipient.title)}
                  </Typography>

                  <Typography variant="subtitle1" className={styles.description}>
                    {strings(stringKeys.projectAlertNotHandledRecipient.description)}
                  </Typography>

                  {(isFetchingFormData || isFetchingList) && (
                    <span className={styles.progressSpinner}>
                      <CircularProgress />
                    </span>
                  )}

                  <div className={styles.recipientsContainer}>
                    {recipients
                      .map((r, index) => (
                        <ProjectAlertNotHandledRecipientItem
                          key={`alertNotHandledRecipient_${index}`}
                          recipient={r}
                          isAdministrator={isAdministrator}
                          projectId={projectId}
                          getFormData={getFormData}
                          edit={edit}
                          create={create}
                          rtl={useRtlDirection}
                        />
                      ))}
                  </div>

                </Grid>
              </Grid>
            </Fragment>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

const mapStateToProps = (state, ownProps) => ({
  recipients: state.projectAlertNotHandledRecipients.listData,
  isListFetching: state.projectAlertNotHandledRecipients.listFetching,
  nationalSocietyIsArchived: state.appData.siteMap.parameters.nationalSocietyIsArchived,
  projectIsClosed: state.appData.siteMap.parameters.projectIsClosed,
  projectId: ownProps.match.params.projectId
});

const mapDispatchToProps = {
  openRecipients: projectAlertNotHandledRecipientsActions.openRecipients.invoke,
  create: projectAlertNotHandledRecipientsActions.create.invoke,
  edit: projectAlertNotHandledRecipientsActions.edit.invoke,
  getFormData: projectAlertNotHandledRecipientsActions.getFormData.invoke
};

export const ProjectAlertNotHandledRecipientsPage = withLayout(
  Layout,
  connect(mapStateToProps, mapDispatchToProps)(ProjectAlertNotHandledRecipientsComponent)
);