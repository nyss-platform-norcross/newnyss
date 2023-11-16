import { push } from "connected-react-router";
import {
  OPEN_PROJECT_SETUP, CREATE_PROJECT,
  OPEN_ERROR_MESSAGES,
  SET_PROJECT_NAME
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

export const setProjectName = (projectName) => ({ type: SET_PROJECT_NAME, projectName })

export const openErrorMessages = (projectId) => ({ type: OPEN_ERROR_MESSAGES, projectId });
