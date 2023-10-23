export const initialState = {
  appData: {
    appReady: false,
    user: null,
    contentLanguages: [],
    siteMap: {
      path: null,
      parameters: {},
      generalMenu: [],
      tabMenu: [],
      projectTabMenu: [],
      sideMenu: []
    },
    mobile: {
      sideMenuOpen: false
    },
    isSideMenuExpanded: true,
    message: null,
    moduleError: null,
    showStringsKeys: false,
    feedback: {
      isSending: false,
      result: "",
    },
    direction: 'ltr'
  },
  requests: {
    isFetching: false,
    errorMessage: null,
    pending: {}
  },
  auth: {
    loginResponse: null,
    isFetching: false
  },
  nationalSocieties: {
    listFetching: false,
    listArchiving: {},
    listReopening: {},
    listData: [],
    formFetching: false,
    formSaving: false,
    formData: null,
    overviewData: null,
    overviewFetching: false,
    structureData: null,
    structureFetching: false,
    dashboard: {
      name: null,
      filters: null,
      isFetching: false
    }
  },
  nationalSocietyDashboard: {
    name: null,
    summary: null,
    isFetching: true,
    isGeneratingPdf: false,
    filtersData: {
      healthRisks: [],
      organizations: []
    },
    filters: null,
    reportsGroupedByLocationDetails: null,
    reportsGroupedByLocationDetailsFetching: false
  },
  nationalSocietyStructure: {
    regions: [],
    isFetching: false,
    districts: [],
    villages: [],
    zones: [],
    expandedItems: []
  },
  smsGateways: {
    listNationalSocietyId: null,
    listFetching: false,
    listRemoving: {},
    listStale: true,
    listData: [],
    formFetching: false,
    formSaving: false,
    formData: null,
    pinging: {},
    availableIoTDevices: []
  },
  eidsrIntegration: {
    isFetching: true,
    formSaving: false,
    formError: null,
    data:
      {
        id: null,
        userName: null,
        apiBaseUrl: null,
        password: null,
        trackerProgramId: null,
        locationDataElementId: null,
        dateOfOnsetDataElementId: null,
        phoneNumberDataElementId: null,
        suspectedDiseaseDataElementId: null,
        eventTypeDataElementId: null,
        genderDataElementId: null,
        reportLocationDataElementId: null,
        reportHealthRiskDataElementId: null,
        reportSuspectedDiseaseDataElementId: null,
        reportStatusDataElementId: null,
        reportGenderDataElementId: null,
        reportAgeAtLeastFiveDataElementId: null,
        reportAgeBelowFiveDataElementId: null
      },
    organisationUnits: [],
    organisationUnitsIsFetching: false,
    program: null,
    programIsFetching: false,
  },
  organizations: {
    listNationalSocietyId: null,
    listFetching: false,
    listRemoving: {},
    listStale: true,
    listData: [],
    formFetching: false,
    formSaving: false,
    formData: null
  },
  projectOrganizations: {
    listProjectId: null,
    listFetching: false,
    listRemoving: {},
    listStale: true,
    listData: [],
    formFetching: false,
    formSaving: false,
    formData: null
  },
  projectAlertRecipients: {
    listProjectId: null,
    listFetching: false,
    listRemoving: {},
    listStale: true,
    listData: [],
    formFetching: false,
    formSaving: false,
    formData: null,
    recipient: null,
    countryCode: null
  },
  projectAlertNotHandledRecipients: {
    projectId: null,
    listFetching: false,
    listStale: true,
    listData: [],
    users: [],
    formDataFetching: false,
    saving: false
  },
  projects: {
    listFetching: false,
    isClosing: {},
    isClosed: {},
    listStale: true,
    listData: [],
    formFetching: false,
    formHealthRisks: [],
    formTimeZones: [],
    formSaving: false,
    formData: null,
    overviewData: null,
    dashboard: {
      name: null,
      projectSummary: null,
      isFetching: false
    },
  },
  projectDashboard: {
    name: null,
    projectSummary: null,
    isFetching: true,
    isGeneratingPdf: false,
    filtersData: {
      organizations: [],
      healthRisks: []
    },
    filters: null,
    reportsGroupedByLocationDetails: null,
    reportsGroupedByLocationDetailsFetching: false,
    dataCollectionPointsReportData: false
  },
  globalCoordinators: {
    listFetching: false,
    listRemoving: {},
    listData: [],
    formFetching: false,
    formSaving: false,
    formData: null
  },
  healthRisks: {
    listFetching: false,
    listRemoving: {},
    listData: [],
    formFetching: false,
    formSaving: false,
    formError: null,
    formData: null
  },
  suspectedDiseases: {
    listFetching: false,
    listRemoving: {},
    listData: [],
    formFetching: false,
    formSaving: false,
    formError: null,
    formData: null
  },
  nationalSocietyUsers: {
    listFetching: false,
    listRemoving: {},
    listStale: true,
    listData: [],
    listNationalSocietyId: null,
    settingAsHead: {},
    formFetching: false,
    formSaving: false,
    formData: null,
    formError: null,
    addExistingFormData: null,
  },
  dataCollectors: {
    listFetching: false,
    listRemoving: {},
    listStale: true,
    filtersStale: true,
    listData: {
      data: [],
      page: null,
      rowsPerPage: null,
      totalRows: null
    },
    listSelectedAll: false,
    formRegions: [],
    formSupervisors: [],
    formFetching: false,
    formSaving: false,
    formData: null,
    countryCode: null,
    mapOverviewDataCollectorLocations: [],
    mapOverviewCenterLocation: null,
    mapOverviewFilters: null,
    mapOverviewDetails: [],
    mapOverviewDetailsFetching: false,
    updatingDataCollector: {},
    replacingSupervisor: false,
    performanceListData: {
      data: [],
      page: null,
      rowsPerPage: null,
      totalRows: null
    },
    completeness: null,
    performanceListFetching: false,
    performanceListFilters: {
      projectId: null,
      locations: null,
      name: '',
      supervisorId: null,
      trainingStatus: 'Trained',
      pageNumber: 1
    },
    filtersData: {
      supervisors: [],
      nationalSocietyId: null
    },
    filters: {
      supervisorId: null,
      locations: null,
      sex: null,
      trainingStatus: 'All',
      deployedMode: 'Deployed',
      name: null,
      pageNumber: 1
    }
  },
  agreements: {
    pendingSocieties: [],
    staleSocieties: [],
    agreementDocuments: []
  },
  reports: {
    listFetching: false,
    listRemoving: {},
    correctReportsListStale: true,
    incorrectReportsListStale: true,
    listProjectId: null,
    markingAsError: false,
    filtersData: {
      healthRisks: []
    },
    filters: null,
    sorting: null,
    editReport: {
      formHealthRisks: [],
      formDataCollectors: []
    },
    sendReport: {
      dataCollectors: []
    },
    correctReportsPaginatedListData: null,
    correctReportsFilters: null,
    correctReportsSorting: null,
    incorrectReportsPaginatedListData: null,
    incorrectReportsFilters: null,
    incorrectReportsSorting: null,
    countryCode: null
  },
  nationalSocietyReports: {
    listFetching: false,
    listRemoving: {},
    correctReportsListStale: true,
    incorrectReportsListStale: true,
    listNationalSocietyId: null,
    paginatedListData: null,
    filtersData: {
      healthRisks: []
    },
    correctReportsPaginatedListData: null,
    correctReportsFilters: null,
    correctReportsSorting: null,
    incorrectReportsPaginatedListData: null,
    incorrectReportsFilters: null,
    incorrectReportsSorting: null
  },
  alerts: {
    listFetching: false,
    listRemoving: {},
    listProjectId: null,
    listData: null,
    formData: null,
    isFetchingRecipients: false,
    isPendingAlertState: false,
    notificationPhoneNumbers: [],
    notificationEmails: [],
    filters: null,
    filtersData: null,
    isLoadingValidateEidsr: false,
  },
  alertEvents: {
    eventTypes: [],
    eventSubtypes: [],
    logFetching: false,
    logRemoving: {},
    listStale: true,
    logItems: null,
    formFetching: false,
    formSaving: false,
    formError: null
  },
  translations: {
    listFetching: false,
    listLanguages: [],
    listTranslations: [],
    emailLanguages: [],
    emailTranslations: [],
    smsLanguages: [],
    smsTranslations: []
  },
  tracking: {
    appInsights: null,
  }
};
