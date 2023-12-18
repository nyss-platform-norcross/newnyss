import React, { useEffect } from "react";
import { strings, stringKeys } from "../../strings";
import { connect, useSelector } from "react-redux";
import { useMount } from "../../utils/lifecycle";
import * as projectAlertNotHandledRecipientsActions from "./logic/projectAlertNotHandledRecipientsActions";
import { useState } from "react";
import { Administrator } from "../../authentication/roles";
import { ProjectAlertNotHandledRecipientItem } from "./components/ProjectAlertNotHandledRecipientItem";
import { Button, CircularProgress, Grid, Typography } from "@material-ui/core";
import { withLayout } from "../../utils/layout";
import Layout from "../layout/Layout";
import { CancelButton } from "../common/buttons/cancelButton/CancelButton";
import SubmitButton from "../common/buttons/submitButton/SubmitButton";
import AddIcon from "@material-ui/icons/Add";
import TableHeader from "../common/tableHeader/TableHeader";
import EditIcon from "@material-ui/icons/Edit";

export const ProjectAlertNotHandledRecipientsComponent = ({
  openRecipients,
  projectId,
  organizations,
  getFormData,
  edit,
  create,
}) => {
  useMount(() => {
    openRecipients(projectId);
  });

  useEffect(() => {
    const recipients = organizations
      ?.map((org) =>
        org.users.map((user) => ({
          ...user,
          organizationName: org.organizationName,
          organizationId: org.organizationId,
        })),
      )
      .flat(1);
    setUnhandledRecipients(recipients);
  }, [organizations]);

  const currentUserRoles = useSelector((state) => state.appData.user.roles);
  const isAdministrator =
    currentUserRoles.filter((r) => r === Administrator).length > 0;
  const isFetchingFormData = useSelector(
    (state) => state.projectAlertNotHandledRecipients.formDataFetching,
  );
  const isFetchingList = useSelector(
    (state) => state.projectAlertNotHandledRecipients.listFetching,
  );
  const useRtlDirection = useSelector(
    (state) => state.appData.user.languageCode === "ar",
  );
  const isSaving = useSelector(
    (state) => state.projectAlertNotHandledRecipients.saving,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [unhandledRecipients, setUnhandledRecipients] = useState(null);
  const [newRecipient, setNewRecipient] = useState({
    userId: "",
    name: "",
  });
  const [error, setError] = useState(false);

  const onEdit = () => {
    setIsEditing(false);
    if (
      organizations.every((org) =>
        org.users.some((user) =>
          unhandledRecipients
            .map((recipient) => recipient.userId)
            .includes(user.userId),
        ),
      )
    ) {
      return;
    }
    edit(
      projectId,
      unhandledRecipients.map((recipient) => ({
        organizationId: recipient.organizationId,
        userId: recipient.userId,
      })),
    );
  };

  const cancel = () => {
    const recipients = organizations
      ?.map((org) =>
        org.users.map((user) => ({
          ...user,
          organizationName: org.organizationName,
          organizationId: org.organizationId,
        })),
      )
      .flat(1);
    setUnhandledRecipients(recipients);
    setIsEditing(false);
    setIsCreating(false);
    setError(false);
  };

  const onCreate = () => {
    if (newRecipient.userId === "") {
      setError(true);
      return;
    }
    create(projectId, {
      userId: newRecipient.userId,
      organizationId: newRecipient.organizationId,
    });
    setIsCreating(false);
    setNewRecipient({
      userId: "",
      name: "",
    });
  };

  const onAddClick = () => {
    setIsCreating(true);
  };
  const onEditClick = () => {
    setIsEditing(true);
  };

  if (isFetchingFormData && isFetchingList) return <CircularProgress />;

  return (
    <>
      <TableHeader />
      {!!unhandledRecipients && (
        <>
          <Typography variant="subtitle1">
            {strings(stringKeys.projectAlertNotHandledRecipient.description)}
          </Typography>
          <Grid container style={{ marginTop: 10 }}>
            {unhandledRecipients?.map((recipient) => (
              <ProjectAlertNotHandledRecipientItem
                key={`alertNotHandledRecipient_${recipient.userId}`}
                unhandledRecipient={recipient}
                unhandledRecipients={unhandledRecipients}
                setUnhandledRecipients={setUnhandledRecipients}
                isAdministrator={isAdministrator}
                projectId={projectId}
                getFormData={getFormData}
                rtl={useRtlDirection}
                isEditing={isEditing}
                error={error}
                setError={setError}
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
                setNewRecipient={setNewRecipient}
                isCreating={isCreating}
                isEditing={isEditing}
                error={error}
                setError={setError}
              />
            )}
          </Grid>
          {!isCreating && !isEditing && (
            <Grid style={{ marginTop: 20 }}>
              <Button
                startIcon={<EditIcon />}
                color="primary"
                variant="outlined"
                style={{ marginRight: 10 }}
                onClick={onEditClick}
              >
                {strings(stringKeys.common.buttons.edit)}
              </Button>
              <Button
                startIcon={<AddIcon />}
                color="primary"
                variant="contained"
                onClick={onAddClick}
              >
                {strings(stringKeys.projectAlertNotHandledRecipient.add)}
              </Button>
            </Grid>
          )}
          {(isCreating || isEditing) && (
            <Grid container style={{ marginTop: 20 }}>
              <CancelButton onClick={cancel}>
                {strings(stringKeys.form.cancel)}
              </CancelButton>
              {isEditing && (
                <SubmitButton onClick={onEdit} isFetching={isSaving}>
                  {strings(stringKeys.form.confirm)}
                </SubmitButton>
              )}
              {isCreating && newRecipient && (
                <SubmitButton onClick={onCreate} isFetching={isSaving}>
                  {strings(stringKeys.common.buttons.add)}
                </SubmitButton>
              )}
            </Grid>
          )}
        </>
      )}
    </>
  );
};

const mapStateToProps = (state, ownProps) => ({
  organizations: state.projectAlertNotHandledRecipients.listData,
  isListFetching: state.projectAlertNotHandledRecipients.listFetching,
  nationalSocietyIsArchived:
    state.appData.siteMap.parameters.nationalSocietyIsArchived,
  projectIsClosed: state.appData.siteMap.parameters.projectIsClosed,
  projectId: ownProps.match.params.projectId,
});

const mapDispatchToProps = {
  openRecipients: projectAlertNotHandledRecipientsActions.openRecipients.invoke,
  create: projectAlertNotHandledRecipientsActions.create.invoke,
  edit: projectAlertNotHandledRecipientsActions.edit.invoke,
  getFormData: projectAlertNotHandledRecipientsActions.getFormData.invoke,
};

export const ProjectAlertNotHandledRecipientsPage = withLayout(
  Layout,
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(ProjectAlertNotHandledRecipientsComponent),
);
