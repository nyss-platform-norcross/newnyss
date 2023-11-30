import { call, put, takeEvery, select } from "redux-saga/effects";
import * as consts from "./projectSetupConstants";
import * as actions from "./projectSetupActions";
import * as appActions from "../../app/logic/appActions";
import * as http from "../../../utils/http";
import { entityTypes } from "../../nationalSocieties/logic/nationalSocietiesConstants";
import { stringKeys } from "../../../strings";

export const projectSetupSagas = () => [
  takeEvery(consts.OPEN_PROJECT_SETUP.INVOKE, openProjectSetup),
  takeEvery(consts.CREATE_PROJECT_FROM_SETUP.INVOKE, createProjectFromSetup),
];

function* openProjectSetup({ nationalSocietyId }) {
  yield put(actions.openSetup.request());
  try {
    yield openProjectsModule(nationalSocietyId);

    const formData = yield call(http.get, `/api/project/getFormData?nationalSocietyId=${nationalSocietyId}`);
    const regions = yield call(http.get, `/api/nationalSocietyStructure/get?nationalSocietyId=${nationalSocietyId}`);

    yield put(actions.openSetup.success({formData: formData.value, regions: regions.value}));
  } catch (error) {
    yield put(actions.openSetup.failure(error));
  }
};

function* createProjectFromSetup({ nationalSocietyId, data }) {
  yield put(actions.createFromSetup.request());
  try {
    const response = yield call(http.post, `/api/project/create?nationalSocietyId=${nationalSocietyId}`, data);
    yield put(actions.createFromSetup.success(response.value));
    yield put(actions.goToList(nationalSocietyId));
    yield put(appActions.showMessage(stringKeys.project.messages.create.success));
  } catch (error) {
    yield put(actions.createFromSetup.failure(error));
  }
};

function* openProjectsModule(nationalSocietyId) {
  const nationalSociety = yield call(http.getCached, {
    path: `/api/nationalSociety/${nationalSocietyId}/get`,
    dependencies: [entityTypes.nationalSociety(nationalSocietyId)]
  });

  yield put(appActions.openModule.invoke(null, {
    nationalSocietyId: nationalSociety.value.id,
    nationalSocietyName: nationalSociety.value.name,
    nationalSocietyCountry: nationalSociety.value.countryName,
    isCurrentUserHeadManager: nationalSociety.value.isCurrentUserHeadManager,
    nationalSocietyIsArchived: nationalSociety.value.isArchived
  }));
}
