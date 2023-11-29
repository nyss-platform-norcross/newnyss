import { push } from "connected-react-router";
import {
  OPEN_PROJECT_SETUP, CREATE_PROJECT,
  OPEN_ERROR_MESSAGES,
  SET_PROJECT_NAME,
  SET_ORGANIZATION_ID,
  SET_ALERT_NOT_HANDLED_NOTIFICATION_RECIPIENT_ID,
  SET_HEALTH_RISKS,
  SET_REGIONS,
  SET_DISTRICTS,
  SET_VILLAGES,
  SET_ZONES
} from "./projectSetupConstants";

export const goToList = (nationalSocietyId) => push(`/nationalsocieties/${nationalSocietyId}/projects`);
export const goToCreation = (nationalSocietyId) => push(`/nationalsocieties/${nationalSocietyId}/projects/add`);

export const openSetup = {
  invoke: (nationalSocietyId) => ({ type: OPEN_PROJECT_SETUP.INVOKE, nationalSocietyId }),
  request: () => ({ type: OPEN_PROJECT_SETUP.REQUEST }),
  success: (data) => ({ type: OPEN_PROJECT_SETUP.SUCCESS, data }),
  failure: (message) => ({ type: OPEN_PROJECT_SETUP.FAILURE, message })
};

export const create = {
  invoke: (nationalSocietyId, data) => ({ type: CREATE_PROJECT.INVOKE, nationalSocietyId, data }),
  request: () => ({ type: CREATE_PROJECT.REQUEST }),
  success: () => ({ type: CREATE_PROJECT.SUCCESS }),
  failure: (error) => ({ type: CREATE_PROJECT.FAILURE, error, suppressPopup: true  })
};

export const openErrorMessages = (projectId) => ({ type: OPEN_ERROR_MESSAGES, projectId });

export const setProjectName = (projectName) => ({ type: SET_PROJECT_NAME, projectName })

export const setOrganizationId = (organizationId) => ({ type: SET_ORGANIZATION_ID, organizationId })

export const setAlertNotHandledNotificationRecipientId = (alertNotHandledNotificationRecipientId) => ({ type: SET_ALERT_NOT_HANDLED_NOTIFICATION_RECIPIENT_ID, alertNotHandledNotificationRecipientId })

export const setHealthRisks = (healthRisks) => ({ type: SET_HEALTH_RISKS, healthRisks })

export const setRegions = (regions) => ({ type: SET_REGIONS, regions })
export const setDistricts = (districts) => ({ type: SET_DISTRICTS, districts })
export const setVillages = (villages) => ({ type: SET_VILLAGES, villages })
export const setZones = (zones) => ({ type: SET_ZONES, zones })


