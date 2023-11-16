import { action } from "../../../utils/actions";

export const OPEN_PROJECT_SETUP = action("OPEN_PROJECT_SETUP");
export const CREATE_PROJECT = action("CREATE_PROJECT");
export const OPEN_ERROR_MESSAGES = action("OPEN_ERROR_MESSAGES");

//Actions to update the setup form
export const SET_PROJECT_NAME = 'SET_PROJECT_NAME';
export const SET_ORGANIZATION_ID = 'SET_ORGANIZATION_ID';
export const SET_ALERT_NOT_HANDLED_NOTIFICATION_RECIPIENT_ID = 'SET_ALERT_NOT_HANDLED_NOTIFICATION_RECIPIENT_ID';
export const SET_HEALTH_RISKS = "SET_HEALTH_RISKS";
export const SET_NEW_REGIONS = "SET_NEW_REGIONS";
