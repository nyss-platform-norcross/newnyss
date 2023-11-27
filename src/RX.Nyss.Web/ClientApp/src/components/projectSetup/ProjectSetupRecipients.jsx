import { Select, MenuItem, InputLabel, Typography, FormHelperText } from "@material-ui/core";
import { makeStyles } from '@material-ui/core/styles';
import { connect } from "react-redux";
import * as projectSetupActions from './logic/projectSetupActions';
import { useState } from "react";
import { useMount } from "../../utils/lifecycle";
import { strings, stringKeys } from '../../strings';

const useStyles = makeStyles((theme) => ({
  inputText: {
    fontSize: "16px",
    fontWeight: 700,
    marginBottom: 8,
  },
  inputField: {
    width: 270,
  },
  errorMessage: {
    color: theme.palette.error.main,
    textAlign: "left",
    width: 270
  }
}));

const ProjectSetupRecipientsComponent = ({alertRecipients, alertNotHandledNotificationRecipientId, setAlertNotHandledNotificationRecipientId, error, setError, setIsNextStepInvalid }) => {
  const classes = useStyles();

  const [selectedRecipient, setSelectedRecipient] = useState(undefined);
  const errorMessage = strings(stringKeys.projectSetup.projectRecipients.error);

  useMount(() => {
    if (alertNotHandledNotificationRecipientId) {
      setSelectedRecipient(alertRecipients.find(recipient => recipient.id === alertNotHandledNotificationRecipientId));
      setIsNextStepInvalid(false);
    }  
  });
  
  const handleChange = (event) => {
    const eventRecipient = alertRecipients.find(recipient => recipient.id === event.target.value);
    if (eventRecipient){
      setAlertNotHandledNotificationRecipientId(event.target.value);
      setIsNextStepInvalid(false);
      setSelectedRecipient(eventRecipient);
      setError(false);
    }
  };

  return (
    <>
      <InputLabel className={classes.inputText}>{strings(stringKeys.projectSetup.projectRecipients.title)}</InputLabel>
      <Select 
        className={`${classes.inputField}`}
        onChange={handleChange}
        value={alertNotHandledNotificationRecipientId ? alertNotHandledNotificationRecipientId : ""}
        displayEmpty
        renderValue={selectedId => {
          if (selectedId === "") {
            return <Typography style={{ color: "#4F4F4F", fontSize: 12 }}>{strings(stringKeys.projectSetup.projectRecipients.placeholder)}</Typography>;
          }

          return selectedRecipient ? selectedRecipient.name : "";
        }}
      >
        {alertRecipients?.map(recipient => 
          <MenuItem
            key={recipient.id}
            value={recipient.id}
          >
            {recipient.name}
          </MenuItem>
        )}
      </Select>
      {error && <FormHelperText className={classes.errorMessage}>{errorMessage}</FormHelperText>}
    </>
  )
}

const mapStateToProps = (state) => ({
  alertRecipients: state.projectSetup.formData?.alertNotHandledRecipients,
  alertNotHandledNotificationRecipientId: state.projectSetup.alertNotHandledNotificationRecipientId
});

const mapDispatchToProps = {
  setAlertNotHandledNotificationRecipientId: projectSetupActions.setAlertNotHandledNotificationRecipientId,
};

export const ProjectSetupRecipients = connect(mapStateToProps, mapDispatchToProps)(ProjectSetupRecipientsComponent);
