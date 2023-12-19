import { push } from "connected-react-router";
import {
  OPEN_ALERTS_LIST,
  GET_ALERTS,
  OPEN_ALERTS_ASSESSMENT,
  ACCEPT_REPORT,
  DISMISS_REPORT,
  RESET_REPORT,
  ESCALATE_ALERT,
  DISMISS_ALERT,
  CLOSE_ALERT,
  FETCH_RECIPIENTS,
  EXPORT_ALERTS,
  VALIDATE_EIDSR,
} from "./alertsConstants";

export const goToList = (projectId) => push(`/projects/${projectId}/alerts`);
export const goToAssessment = (projectId, alertId) =>
  push(`/projects/${projectId}/alerts/${alertId}/assess`);
export const goToEventLog = (projectId, alertId) =>
  push(`/projects/${projectId}/alerts/${alertId}/eventLog`);

export const openList = {
  invoke: (projectId) => ({ type: OPEN_ALERTS_LIST.INVOKE, projectId }),
  request: () => ({ type: OPEN_ALERTS_LIST.REQUEST }),
  success: (projectId, filtersData) => ({
    type: OPEN_ALERTS_LIST.SUCCESS,
    projectId,
    filtersData,
  }),
  failure: (message) => ({ type: OPEN_ALERTS_LIST.FAILURE, message }),
};

export const getAlerts = {
  invoke: (projectId, pageNumber, filters) => ({
    type: GET_ALERTS.INVOKE,
    projectId,
    pageNumber,
    filters,
  }),
  request: () => ({ type: GET_ALERTS.REQUEST }),
  success: (data, page, rowsPerPage, totalRows, filters) => ({
    type: GET_ALERTS.SUCCESS,
    data,
    page,
    rowsPerPage,
    totalRows,
    filters,
  }),
  failure: (message) => ({ type: GET_ALERTS.FAILURE, message }),
};

export const openAssessment = {
  invoke: (projectId, alertId) => ({
    type: OPEN_ALERTS_ASSESSMENT.INVOKE,
    projectId,
    alertId,
  }),
  request: () => ({ type: OPEN_ALERTS_ASSESSMENT.REQUEST }),
  success: (alertId, data) => ({
    type: OPEN_ALERTS_ASSESSMENT.SUCCESS,
    alertId,
    data,
  }),
  failure: (message) => ({ type: OPEN_ALERTS_ASSESSMENT.FAILURE, message }),
};

export const acceptReport = {
  invoke: (alertId, reportId) => ({
    type: ACCEPT_REPORT.INVOKE,
    alertId,
    reportId,
  }),
  request: (reportId) => ({ type: ACCEPT_REPORT.REQUEST, reportId }),
  success: (reportId, assessmentStatus) => ({
    type: ACCEPT_REPORT.SUCCESS,
    reportId,
    assessmentStatus,
  }),
  failure: (reportId, message) => ({
    type: ACCEPT_REPORT.FAILURE,
    reportId,
    message,
  }),
};

export const dismissReport = {
  invoke: (alertId, reportId) => ({
    type: DISMISS_REPORT.INVOKE,
    alertId,
    reportId,
  }),
  request: (reportId) => ({ type: DISMISS_REPORT.REQUEST, reportId }),
  success: (reportId, assessmentStatus) => ({
    type: DISMISS_REPORT.SUCCESS,
    reportId,
    assessmentStatus,
  }),
  failure: (reportId, message) => ({
    type: DISMISS_REPORT.FAILURE,
    reportId,
    message,
  }),
};

export const resetReport = {
  invoke: (alertId, reportId) => ({
    type: RESET_REPORT.INVOKE,
    alertId,
    reportId,
  }),
  request: (reportId) => ({ type: RESET_REPORT.REQUEST, reportId }),
  success: (reportId, assessmentStatus) => ({
    type: RESET_REPORT.SUCCESS,
    reportId,
    assessmentStatus,
  }),
  failure: (reportId, message) => ({
    type: RESET_REPORT.FAILURE,
    reportId,
    message,
  }),
};

export const escalateAlert = {
  invoke: (alertId, sendNotification) => ({
    type: ESCALATE_ALERT.INVOKE,
    alertId,
    sendNotification,
  }),
  request: () => ({ type: ESCALATE_ALERT.REQUEST }),
  success: () => ({ type: ESCALATE_ALERT.SUCCESS }),
  failure: (message) => ({ type: ESCALATE_ALERT.FAILURE, message }),
};

export const validateEidsr = {
  invoke: (alertId) => ({ type: VALIDATE_EIDSR.INVOKE, alertId }),
  request: () => ({ type: VALIDATE_EIDSR.REQUEST }),
  success: (data) => ({ type: VALIDATE_EIDSR.SUCCESS, data }),
  failure: (message) => ({ type: VALIDATE_EIDSR.FAILURE, message }),
};

export const dismissAlert = {
  invoke: (alertId) => ({ type: DISMISS_ALERT.INVOKE, alertId }),
  request: () => ({ type: DISMISS_ALERT.REQUEST }),
  success: () => ({ type: DISMISS_ALERT.SUCCESS }),
  failure: (message) => ({ type: DISMISS_ALERT.FAILURE, message }),
};

export const closeAlert = {
  invoke: (alertId) => ({ type: CLOSE_ALERT.INVOKE, alertId }),
  request: () => ({ type: CLOSE_ALERT.REQUEST }),
  success: () => ({ type: CLOSE_ALERT.SUCCESS }),
  failure: (message) => ({ type: CLOSE_ALERT.FAILURE, message }),
};

export const fetchRecipients = {
  invoke: (alertId) => ({ type: FETCH_RECIPIENTS.INVOKE, alertId }),
  request: () => ({ type: FETCH_RECIPIENTS.REQUEST }),
  success: (data) => ({ type: FETCH_RECIPIENTS.SUCCESS, data }),
  failure: (message) => ({ type: FETCH_RECIPIENTS.FAILURE, message }),
};

export const exportAlerts = {
  invoke: (projectId, filters) => ({
    type: EXPORT_ALERTS.INVOKE,
    projectId,
    filters,
  }),
  request: () => ({ type: EXPORT_ALERTS.REQUEST }),
  success: () => ({ type: EXPORT_ALERTS.SUCCESS }),
  failure: (message) => ({ type: EXPORT_ALERTS.FAILURE, message }),
};
