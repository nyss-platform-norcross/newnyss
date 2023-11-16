import * as actions from "./projectSetupConstants";
import { LOCATION_CHANGE } from "connected-react-router";

export const projectSetupInitialState = {
  projectName: null,
  allowMultipleOrganizations: null,
  timeZoneId: null,
  healthRisks: [],
  organizationId: null,
  alertNotHandledNotificationRecipientId: null,
  formFetching: false,
  formData: null,
}

export function projectSetupReducer(state = projectSetupInitialState, action) {
  switch (action.type) {
    case LOCATION_CHANGE: // cleanup
      return { ...state, formData: null, formError: null }

    case actions.OPEN_PROJECT_SETUP.INVOKE:
      return { ...state, formFetching: true, formData: null };

    case actions.OPEN_PROJECT_SETUP.REQUEST:
      return { ...state, formFetching: true, formData: null };

    case actions.OPEN_PROJECT_SETUP.SUCCESS:
      return { ...state, formFetching: false, formData: action.data};

    case actions.OPEN_PROJECT_SETUP.FAILURE:
      return { ...state, formFetching: false, formError: action.error };

    case actions.CREATE_PROJECT.REQUEST:
      return { ...state, formSaving: true };

    case actions.CREATE_PROJECT.SUCCESS:
      return { ...state, formSaving: false, listStale: true };

    case actions.CREATE_PROJECT.FAILURE:
      return { ...state, formSaving: false, formError: action.error };

    case actions.SET_PROJECT_NAME:
      return { ...state,  projectName: action.projectName}

    case actions.SET_ORGANIZATION_ID:
      return { ...state,  organizationId: action.organizationId}

    case actions.SET_ALERT_NOT_HANDLED_NOTIFICATION_RECIPIENT_ID:
      return { ...state,  alertNotHandledNotificationRecipientId: action.alertNotHandledNotificationRecipientId}

    case actions.SET_HEALTH_RISKS:
      return { ...state,  healthRisks: action.healthRisks}

    default:
      return state;
  }
};
