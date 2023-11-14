import styles from './ProjectAlertNotHandledRecipientItem.module.scss';
import React, { useEffect, useState } from "react";
import { Select, MenuItem, Grid, Typography } from "@material-ui/core";
import { useSelector } from "react-redux";

export const ProjectAlertNotHandledRecipientItem = ({ isAdministrator, getFormData, projectId, rtl, unhandledRecipient, unhandledRecipients, setUnhandledRecipients, setIsEditing, setNewRecipient, originalRecipients, isCreating, isEditing }) => {
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
      setIsEditing(originalRecipients.every(rec => rec.userId !== change.target.value))
    }
  }

  const recipientIds = unhandledRecipients?.map(recipient => recipient.userId)
  const editRecipients = [...(users.filter(user => !recipientIds.includes(user.userId))), user]
  const addRecipients = users.filter(user => !recipientIds.includes(user.userId))
  const userList = setNewRecipient ? addRecipients : editRecipients

  return (
    <Grid container item alignItems='center' style={{ marginTop: 10 }}>
      {(isEditing || isCreating) && (
        <Select
          className={`${styles.recipientNameSelect} ${rtl ? styles.rtl : ""}`}
          value={user?.userId}
          onChange={handleRecipientChange}
          >
          {userList.map(u => (
            <MenuItem key={`recipient_user_${u.userId}`} value={u.userId}>
              {u.name}
            </MenuItem>
          ))}
      </Select>
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