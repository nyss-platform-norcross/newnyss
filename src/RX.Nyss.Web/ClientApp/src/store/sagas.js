import { all } from "redux-saga/effects";
import { autoRestart } from "../utils/sagaEffects";
import { appSagas } from "../components/app/logic/appSagas";
import { authSagas } from "../authentication/authSagas";
import { nationalSocietiesSagas } from "../components/nationalSocieties/logic/nationalSocietiesSagas";
import { smsGatewaysSagas } from "../components/smsGateways/logic/smsGatewaysSagas";
import { projectsSagas } from "../components/projects/logic/projectsSagas";
import { globalCoordinatorsSagas } from "../components/globalCoordinators/logic/globalCoordinatorsSagas";
import { healthRisksSagas } from "../components/healthRisks/logic/healthRisksSagas";
import { nationalSocietyUsersSagas } from "../components/nationalSocietyUsers/logic/nationalSocietyUsersSagas";
import { dataCollectorsSagas } from "../components/dataCollectors/logic/dataCollectorsSagas";
import { headManagerConsentsSagas } from "../components/headManagerConsents/logic/headManagerConsentsSagas";
import { reportsSagas } from "../components/reports/logic/reportsSagas";
import { nationalSocietyReportsSagas } from "../components/nationalSocietyReports/logic/nationalSocietyReportsSagas";
import { nationalSocietyStructureSagas } from "../components/nationalSocietyStructure/logic/nationalSocietyStructureSagas";
import { projectDashboardSagas } from "../components/projectDashboard/logic/projectDashboardSagas";
import { alertsSagas } from "../components/alerts/logic/alertsSagas";

function* rootSaga() {
  yield all([
    ...appSagas(),
    ...authSagas(),
    ...nationalSocietiesSagas(),
    ...nationalSocietyStructureSagas(),
    ...smsGatewaysSagas(),
    ...projectsSagas(),
    ...projectDashboardSagas(),
    ...globalCoordinatorsSagas(),
    ...healthRisksSagas(),
    ...nationalSocietyUsersSagas(),
    ...dataCollectorsSagas(),
    ...headManagerConsentsSagas(),
    ...reportsSagas(),
    ...nationalSocietyReportsSagas(),
    ...alertsSagas()
  ]);
}

export const getRootSaga = () =>
  autoRestart(rootSaga);
