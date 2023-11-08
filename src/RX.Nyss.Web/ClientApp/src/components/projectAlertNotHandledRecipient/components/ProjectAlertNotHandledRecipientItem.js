import styles from './ProjectAlertNotHandledRecipientItem.module.scss';
import React, { useEffect, useState } from "react";
import { Select, MenuItem, Grid, Typography } from "@material-ui/core";
import { useSelector } from "react-redux";

export const ProjectAlertNotHandledRecipientItem = ({ isAdministrator, getFormData, projectId, rtl, unhandledRecipient, unhandledRecipients, setUnhandledRecipients, setIsEditing, setNewRecipient, organizationName, isCreating }) => {
  const [user, setUser] = useState(unhandledRecipient)
  const users = useSelector(state => state.projectAlertNotHandledRecipients.users);

  useEffect(() => {
    getFormData(projectId);
  }, []);

  const handleRecipientChange = (change) => {
    const user = users.filter(u => u.userId === change.target.value)[0];
    if(setNewRecipient) {
      setNewRecipient(user)
      setUser(user)
    } else {
      setUser(user)
      const newRecipientList = [...unhandledRecipients.filter(rec => rec.userId !== unhandledRecipient.userId), user]
      setUnhandledRecipients(newRecipientList)
      setIsEditing(unhandledRecipient.userId !== change.target.value)
    }
  }

  const recipientIds = unhandledRecipients?.map(recipient => recipient.userId)
  const editRecipients = [...(users.filter(user => !recipientIds.includes(user.userId))), user]
  const addRecipients = users.filter(user => !recipientIds.includes(user.userId))
  const userList = setNewRecipient ? addRecipients : editRecipients

  return (
    <Grid container item alignItems='center' style={{ marginTop: 10 }}>
      <Select
        className={`${styles.recipientNameSelect} ${rtl ? styles.rtl : ""}`}
        value={user?.userId}
        onChange={handleRecipientChange}
        disabled={isCreating}
      >
        {userList.map(u => (
          <MenuItem key={`recipient_user_${u.userId}`} value={u.userId}>
            {u.name}
          </MenuItem>
        ))}
      </Select>
      {isAdministrator && (
        <Typography variant="body1" className={styles.organizationField}>
          {user?.organizationName}
        </Typography>
      )}
    </Grid>
  )
}