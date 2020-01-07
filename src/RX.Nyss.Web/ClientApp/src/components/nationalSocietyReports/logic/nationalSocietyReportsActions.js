import { push } from "connected-react-router";
import {
  OPEN_NATIONAL_SOCIETY_REPORTS_LIST, GET_NATIONAL_SOCIETY_REPORTS
} from "./nationalSocietyReportsConstants";

export const goToList = (nationalSocietyId) => push(`/nationalsociety/${nationalSocietyId}/reports`);

export const openList = {
  invoke: (nationalSocietyId) => ({ type: OPEN_NATIONAL_SOCIETY_REPORTS_LIST.INVOKE, nationalSocietyId }),
  request: () => ({ type: OPEN_NATIONAL_SOCIETY_REPORTS_LIST.REQUEST }),
  success: (nationalSocietyId) => ({ type: OPEN_NATIONAL_SOCIETY_REPORTS_LIST.SUCCESS, nationalSocietyId }),
  failure: (message) => ({ type: OPEN_NATIONAL_SOCIETY_REPORTS_LIST.FAILURE, message })
};

export const getList = {
  invoke: (nationalSocietyId, pageNumber, reportListFilter) => ({ type: GET_NATIONAL_SOCIETY_REPORTS.INVOKE, nationalSocietyId, pageNumber, reportListFilter }),
  request: () => ({ type: GET_NATIONAL_SOCIETY_REPORTS.REQUEST }),
  success: (data, page, rowsPerPage, totalRows, filter) => ({ type: GET_NATIONAL_SOCIETY_REPORTS.SUCCESS, data, page, rowsPerPage, totalRows, filter }),
  failure: (message) => ({ type: GET_NATIONAL_SOCIETY_REPORTS.FAILURE, message })
};