import styles from './ProjectAlertNotHandledRecipientItem.module.scss';
import React, { useEffect, useState } from "react";
import { Select, MenuItem, Grid, Typography } from "@material-ui/core";
import { useSelector } from "react-redux";
import { strings, stringKeys } from '../../../strings';

export const ProjectAlertNotHandledRecipientItem = ({ isAdministrator, getFormData, projectId, rtl, unhandledRecipient, unhandledRecipients, setUnhandledRecipients, setNewRecipient, isCreating, isEditing, error, setError }) => {
  const [user, setUser] = useState(unhandledRecipient);
  const users = useSelector(state => state.projectAlertNotHandledRecipients.users);

  useEffect(() => {
    getFormData(projectId);
  }, []);

  const handleRecipientChange = (change) => {
    const user = users.filter(u => u.userId === change.target.value)[0];
    setUser(user);
    setError(null);
    if(setNewRecipient) {
      setNewRecipient(user);
    } else {
      const removedRecipientIndex = unhandledRecipients.findIndex(rec => rec.userId === unhandledRecipient.userId);
      let newRecipientList = [...unhandledRecipients];
      newRecipientList[removedRecipientIndex] = user;
      setUnhandledRecipients(newRecipientList);
    }
  }

  const recipientIds = unhandledRecipients?.map(recipient => recipient.userId)
  const editRecipients = [...(users.filter(user => !recipientIds.includes(user.userId))), user]
  const addRecipients = users.filter(user => !recipientIds.includes(user.userId))
  const userList = setNewRecipient ? addRecipients : editRecipients

  return (
    <Grid container item alignItems='center' style={{ marginTop: 20 }}>
      {(isEditing || isCreating) && (
        <Grid>
          <Select
            className={`${styles.recipientNameSelect} ${rtl ? styles.rtl : ""}`}
            value={user?.userId}
            onChange={handleRecipientChange}
            error={error}
            >
            {userList.map(u => (
              <MenuItem key={`recipient_user_${u.userId}`} value={u.userId}>
                {u.name}
              </MenuItem>
            ))}
          </Select>
          {error && <Typography color="error" style={{ marginTop: 3 }} variant='subtitle2'>{strings(stringKeys.projectAlertNotHandledRecipient[error])}</Typography>}
        </Grid>
      )}
      {!isEditing && !isCreating && (
        <Typography style={{ fontWeight: 700, width: 200, marginRight: 30 }}>{user.name}</Typography>
      )}
      {isAdministrator && (
        <Typography variant="body1" className={styles.organizationField}>
          {user?.organizationName}
        </Typography>
      )}
    </Grid>
  )
}