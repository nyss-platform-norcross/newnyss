import { call, put, takeEvery, select, delay } from "redux-saga/effects";
import * as consts from "./appConstans";
import * as actions from "./appActions";
import { updateStrings, toggleStringsMode } from "../../../strings";
import * as http from "../../../utils/http";
import { push } from "connected-react-router";
import { placeholders } from "../../../siteMapPlaceholders";
import { getBreadcrumb, getMenu } from "../../../utils/siteMapService";
import * as cache from "../../../utils/cache";

export const appSagas = () => [
  takeEvery(consts.INIT_APPLICATION.INVOKE, initApplication),
  takeEvery(consts.OPEN_MODULE.INVOKE, openModule),
  takeEvery(consts.ENTITY_UPDATED, entityUpdated),
  takeEvery(consts.SWITCH_STRINGS, switchStrings),
];

function* initApplication() {
  yield put(actions.initApplication.request());
  try {
    const user = yield select(state => state.appData.user);
    yield call(getAppData);
    yield call(getStrings, user ? user.languageCode : "en");
    yield put(actions.initApplication.success());
    if (user && user.hasPendingHeadManagerConsents){
      yield put(actions.goToHeadManagerConsents())
    }
  } catch (error) {
    yield put(actions.initApplication.failure(error.message));
  }
};

function* switchStrings() {
  yield put(actions.setAppReady(false));
  toggleStringsMode();
  yield delay(1);

  const hasBreadcrumb = yield select(state => state.appData.siteMap.breadcrumb.length !== 0);

  if (hasBreadcrumb) {
    const pathAndParams = yield select(state => ({
      path: state.appData.route.path,
      params: state.appData.route.params
    }));

    yield openModule(pathAndParams);
  }

  yield put(actions.setAppReady(true));
}

function* openModule({ path, params }) {
  path = path || (yield select(state => state.appData.route && state.appData.route.path));

  const user = yield select(state => state.appData.user);

  const breadcrumb = getBreadcrumb(path, params, user);
  const topMenu = getMenu("/", params, placeholders.topMenu, path, user);
  const sideMenu = getMenu(path, params, placeholders.leftMenu, path, user);
  const tabMenu = getMenu(path, params, placeholders.tabMenu, path, user);

  yield put(actions.openModule.success(path, params, breadcrumb, topMenu, sideMenu, tabMenu, params.title))
}

function* getAppData() {
  yield put(actions.getAppData.request());
  try {
    const appData = yield call(http.get, "/api/appData/getAppData", true);
    yield put(actions.getAppData.success(appData.value.contentLanguages, appData.value.countries, appData.value.isDevelopment, appData.value.authCookieExpiration));
    return appData.value;
  } catch (error) {
    yield put(actions.getAppData.failure(error.message));
  }
};

function* getStrings(languageCode) {
  yield put(actions.getStrings.invoke());
  try {
    const response = yield call(http.get, `/api/appData/getStrings/${languageCode}`, true);
    updateStrings(response.value);
    yield put(actions.getStrings.success());
  } catch (error) {
    yield put(actions.getStrings.failure(error.message));
  }
};

function entityUpdated({ entities }) {
  cache.cleanCacheForDependencies(entities);
};
