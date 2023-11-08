import styles from './ProjectAlertNotHandledRecipientsPage.module.scss';
import React, { useEffect } from 'react';
import { strings, stringKeys } from '../../strings';
import { connect, useSelector } from 'react-redux';
import { useMount } from '../../utils/lifecycle';
import * as projectAlertNotHandledRecipientsActions from './logic/projectAlertNotHandledRecipientsActions';
import { useState } from 'react';
import { Administrator } from '../../authentication/roles';
import { ProjectAlertNotHandledRecipientItem } from './components/ProjectAlertNotHandledRecipientItem';
import { Button, CircularProgress, Grid, Typography } from '@material-ui/core';
import { withLayout } from "../../utils/layout";
import Layout from "../layout/Layout";
import { CancelButton } from "../common/buttons/cancelButton/CancelButton"
import SubmitButton from "../common/buttons/submitButton/SubmitButton";

export const ProjectAlertNotHandledRecipientsComponent = ({ openRecipients, projectId, organizations, getFormData, edit, create }) => {
  useMount(() => {
    openRecipients(projectId);
  });

  useEffect(() => {
    const recipients = organizations?.map(org => org.users.map(user => ({...user, organizationName: org.organizationName, organizationId: org.organizationId}))).flat(1)
    setUnhandledRecipients(recipients)
  },[organizations])


  const currentUserRoles = useSelector(state => state.appData.user.roles);
  const isAdministrator = currentUserRoles.filter(r => r === Administrator).length > 0;
  const isFetchingFormData = useSelector(state => state.projectAlertNotHandledRecipients.formDataFetching);
  const isFetchingList = useSelector(state => state.projectAlertNotHandledRecipients.listFetching);
  const useRtlDirection = useSelector(state => state.appData.user.languageCode === 'ar');
  const isSaving = useSelector(state => state.projectAlertNotHandledRecipients.saving);

  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [unhandledRecipients, setUnhandledRecipients] = useState(null)
  const [newRecipient, setNewRecipient] = useState({
    userId: '',
    name: ''
  })


  const onEdit = () => {
    edit(projectId, {
      userId: unhandledRecipients[0].userId,
      organizationId: unhandledRecipients[0].organizationId,
    });
    setIsEditing(false)
  }

  const cancel = () => {
    const recipients = organizations?.map(org => org.users.map(user => ({...user, organizationName: org.organizationName, organizationId: org.organizationId}))).flat(1)
    setUnhandledRecipients(recipients)
    setIsEditing(false)
    setIsCreating(false)

  }

  const onCreate = () => {
    create(projectId, {
      userId: newRecipient.userId,
      organizationId: newRecipient.organizationId,
    });
    setIsCreating(false)
  }

  if(isFetchingFormData && isFetchingList) return <CircularProgress />

  return !!unhandledRecipients && (
    <>
      <Typography variant="subtitle1" className={styles.description}>
        {strings(stringKeys.projectAlertNotHandledRecipient.description)}
      </Typography>
      <Button color='primary' variant='contained' style={{ width: 120 }} disabled={isEditing} onClick={() => setIsCreating(true)}>Add recipient</Button>
      <Grid container>
        {unhandledRecipients?.map((r) => (
            <ProjectAlertNotHandledRecipientItem
              key={`alertNotHandledRecipient_${r.userId}`}
              unhandledRecipient={r}
              unhandledRecipients={unhandledRecipients}
              setUnhandledRecipients={setUnhandledRecipients}
              isAdministrator={isAdministrator}
              projectId={projectId}
              getFormData={getFormData}
              rtl={useRtlDirection}
              setIsEditing={setIsEditing}
              isCreating={isCreating}
              />
              ))}
        {isCreating && (
          <ProjectAlertNotHandledRecipientItem
            key={`alertNotHandledRecipient_new`}
            isAdministrator={isAdministrator}
            projectId={projectId}
            getFormData={getFormData}
            unhandledRecipient={newRecipient}
            unhandledRecipients={unhandledRecipients}
            setUnhandledRecipients={setUnhandledRecipients}
            rtl={useRtlDirection}
            setIsEditing={setIsEditing}
            setNewRecipient={setNewRecipient}
            />
          )}
      </Grid>
      {(isCreating || isEditing)  && (
        <Grid container style={{ marginTop: 10 }}>
          <CancelButton
            onClick={cancel}>
              {strings(stringKeys.form.cancel)}
            </CancelButton>
          {isEditing && (
            <SubmitButton onClick={onEdit} isFetching={isSaving}>{strings(stringKeys.form.confirm)}</SubmitButton>
          )}
          {isCreating && newRecipient && (
            <SubmitButton onClick={onCreate} isFetching={isSaving}>{strings(stringKeys.common.buttons.add)}</SubmitButton>
          )}
        </Grid>
      )}
    </>
  );
}

const mapStateToProps = (state, ownProps) => ({
  organizations: state.projectAlertNotHandledRecipients.listData,
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