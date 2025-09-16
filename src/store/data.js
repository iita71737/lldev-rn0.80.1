const initialState = {
  currentUser: null,
  systemClasses: [],
  contractorTypes: [],
  contractorCustomTypes: [],
  allContractorTypes: [],
  effects: null,
  actTypes: null,
  actStatus: [],
  licenseType: [],
  eventTypes: [],
  collectIds: null,
  collectGuidelineIds: null,
  currentFactory: null,
  currentTimezone: null,
  subtask: null,
  userScopes: [],
  dataFail: false,
  currentOrganization: null,
  currentViewMode: 'factory',
  taskListTabNum: [],
  filterParamsForAct: null,
  currentAct: null,
  fieldsForForm: null,
  currentLicense: null,
  currentEditLicense: null,
  currentCreateLicense: null,
  currentEditTraining: null,
  currentCheckList: null,
  currentCheckListFrequencyFilter: null,
  currentCheckListCreateData: null,
  currentCheckListQuestions: null,
  currentCheckListForEdit: null,
  currentCheckListForUpdateVersion: null,
  currentCheckListAssignmentProcedureData: null,
  currentContractorBasicData: null,
  currentAuditRecordDraft: null,
  currentChecklistRecordDraft: null,
  factoryTags: [],
  contractor: [],
  refetchChecker: {
    AlertListTab: false
  },
  idleCounter: 0,
  connectionState: true,
  offlineMsg: [],
  preloadChecklistAssignment: [],
  preloadChecklistAssignmentDraft: [],
  refreshCounter: 0,
  initUrlFromQRcode: null,
  constantData: null,
  currentSelectedGuidelineId: null,
  currentLocales: null,
  currentLatLng: null,
  version: 'v0.80.1.5.2'
}

//action constants
const ActionTypes = {
  SET_CURRENT_USER: 'SET_CURRENT_USER',
  SET_SYSTEM_CLASS: 'SET_SYSTEM_CLASS',
  SET_EFFECT: 'SET_EFFECT',
  SET_ACT_TYPE: 'SET_ACT_TYPE',
  SET_ACT_STATUS: 'SET_ACT_STATUS',
  SET_LICENSE_TYPE: 'SET_LICENSE_TYPE',
  SET_EVENT_TYPES: 'SET_EVENT_TYPES',
  SET_CONTRACTOR_TYPES: 'SET_CONTRACTOR_TYPES',
  SET_CONTRACTOR_CUSTOM_TYPES: 'SET_CONTRACTOR_CUSTOM_TYPES',
  SET_ALL_CONTRACTOR_TYPES: 'SET_ALL_CONTRACTOR_TYPES',
  SET_COLLECT_ID: 'SET_COLLECT_ID',
  SET_COLLECT_GUIDELINE_ID: 'SET_COLLECT_GUIDELINE_ID',
  ADD_TO_COLLECT_IDS: 'ADD_TO_COLLECT_IDS',
  ADD_TO_COLLECT_GUIDELINE_IDS: 'ADD_TO_COLLECT_GUIDELINE_IDS',
  REMOVE_FROM_COLLECT_IDS: 'REMOVE_FROM_COLLECT_IDS',
  REMOVE_FROM_COLLECT_GUIDELINE_IDS: 'REMOVE_FROM_COLLECT_GUIDELINE_IDS',
  SET_CURRENT_FACTORY: 'SET_CURRENT_FACTORY',
  SET_CURRENT_TIMEZONE: 'SET_CURRENT_TIMEZONE',
  SET_USER_SUBTASKS: 'SET_USER_SUBTASKS',
  SET_USER_SCOPES: 'SET_USER_SCOPES',
  SET_DATA_FAIL: 'SET_DATA_FAIL',
  SET_CURRENT_ORGANIZATION: 'SET_CURRENT_ORGANIZATION',
  SET_CURRENT_VIEW_MODE: 'SET_CURRENT_VIEW_MODE',
  SET_TASK_LIST_TAB_NUM: 'SET_TASK_LIST_TAB_NUM',
  SET_FILTER_PARAMS_FOR_ACT: 'SET_FILTER_PARAMS_FOR_ACT',
  SET_CURRENT_ACT: 'SET_CURRENT_ACT',
  SET_FIELD_FOR_FORM: 'SET_FIELD_FOR_FORM',
  SET_CURRENT_LICENSE: 'SET_CURRENT_LICENSE',
  SET_CURRENT_EDIT_LICENSE: 'SET_CURRENT_EDIT_LICENSE',
  SET_CURRENT_CREATE_LICENSE: 'SET_CURRENT_CREATE_LICENSE',
  SET_CURRENT_EDIT_TRAINING: 'SET_CURRENT_EDIT_TRAINING',
  SET_CURRENT_CHECKLIST: 'SET_CURRENT_CHECKLIST',
  SET_CURRENT_CHECKLIST_FREQUENCY_FILTER:
    'SET_CURRENT_CHECKLIST_FREQUENCY_FILTER',
  SET_CURRENT_CHECKLIST_CREATE_DATA: 'SET_CURRENT_CHECKLIST_CREATE_DATA',
  SET_CURRENT_CHECKLIST_QUESTIONS: 'SET_CURRENT_CHECKLIST_QUESTIONS',
  SET_CURRENT_CHECKLIST_FOR_EDIT: 'SET_CURRENT_CHECKLIST_FOR_EDIT',
  SET_CURRENT_CHECKLIST_FOR_UPDATE_VERSION:
    'SET_CURRENT_CHECKLIST_FOR_UPDATE_VERSION',
  SET_CURRENT_CHECKLIST_ASSIGNMENT_PROCEDURE_DATA:
    'SET_CURRENT_CHECKLIST_ASSIGNMENT_PROCEDURE_DATA',
  SET_CURRENT_CONTRACTOR_BASIC_DATA: 'SET_CURRENT_CONTRACTOR_BASIC_DATA',
  SET_CURRENT_AUDIT_RECORD_DRAFT: 'SET_CURRENT_AUDIT_RECORD_DRAFT',
  SET_CURRENT_CHECKLIST_RECORD_DRAFT: 'SET_CURRENT_CHECKLIST_RECORD_DRAFT',
  SET_FACTORY_TAGS: 'SET_FACTORY_TAGS',
  SET_CONTRACTOR: 'SET_CONTRACTOR',
  SET_REFETCH_CHECKER: 'SET_REFETCH_CHECKER',
  SET_IDLE_COUNTER: 'SET_IDLE_COUNTER',
  SET_OFFLINE_MSG: 'SET_OFFLINE_MSG',
  SET_PRELOAD_CHECKLIST_ASSIGNMENT: 'SET_PRELOAD_CHECKLIST_ASSIGNMENT',
  SET_PRELOAD_CHECKLIST_ASSIGNMENT_DRAFT: 'SET_PRELOAD_CHECKLIST_ASSIGNMENT_DRAFT',
  SET_CONNECTION_STATE: 'SET_CONNECTION_STATE',
  SET_REFRESH_COUNTER: 'SET_REFRESH_COUNTER',
  SET_INIT_URL_FROM_QRCODE: 'SET_INIT_URL_FROM_QRCODE',
  SET_CONSTANT_DATA: 'SET_CONSTANT_DATA',
  SET_CURRENT_SELECTED_GUIDELINE_ID: 'SET_CURRENT_SELECTED_GUIDELINE_ID',
  SET_CURRENT_LOCALES: 'SET_CURRENT_LOCALES',
  SET_CURRENT_LATLNG: 'SET_CURRENT_LATLNG'
}

export const setCurrentUser = currentUser => {
  return {
    type: ActionTypes.SET_CURRENT_USER,
    currentUser
  }
}

// ლ(⁰⊖⁰ლ) new action setTaskListTabNum
export const setTaskListTabNum = taskListTabNum => {
  return {
    type: ActionTypes.SET_TASK_LIST_TAB_NUM,
    taskListTabNum
  }
}

export const setFilterParamsForAct = filterParamsForAct => {
  return {
    type: ActionTypes.SET_FILTER_PARAMS_FOR_ACT,
    filterParamsForAct
  }
}

// ლ(⁰⊖⁰ლ) new action setCurrentAct
export const setCurrentAct = currentAct => {
  return {
    type: ActionTypes.SET_CURRENT_ACT,
    currentAct
  }
}

// ლ(⁰⊖⁰ლ) new action setFieldForForm
export const setFieldForForm = fieldsForForm => {
  return {
    type: ActionTypes.SET_FIELD_FOR_FORM,
    fieldsForForm
  }
}

// ლ(⁰⊖⁰ლ) new action SET_CURRENT_LICENSE
export const setCurrentLicense = currentLicense => {
  return {
    type: ActionTypes.SET_CURRENT_LICENSE,
    currentLicense
  }
}

// ლ(⁰⊖⁰ლ) new action  SET_CURRENT_EDIT_LICENSE
export const setCurrentEditLicense = currentEditLicense => {
  return {
    type: ActionTypes.SET_CURRENT_EDIT_LICENSE,
    currentEditLicense
  }
}

// ლ(⁰⊖⁰ლ) new action SET_CURRENT_CREATE_LICENSE
export const setCurrentCreateLicense = currentCreateLicense => {
  return {
    type: ActionTypes.SET_CURRENT_CREATE_LICENSE,
    currentCreateLicense
  }
}

// ლ(⁰⊖⁰ლ) new action SET_CURRENT_EDIT_TRAINING
export const setCurrentEditTraining = currentEditTraining => {
  return {
    type: ActionTypes.SET_CURRENT_EDIT_TRAINING,
    currentEditTraining
  }
}

// ლ(⁰⊖⁰ლ) new action SET_CURRENT_CHECKLIST
export const setCurrentCheckList = currentCheckList => {
  return {
    type: ActionTypes.SET_CURRENT_CHECKLIST,
    currentCheckList
  }
}

// ლ(⁰⊖⁰ლ) new action SET_CURRENT_CHECKLIST_FREQUENCY_FILTER
export const setCurrentCheckListFrequencyFilter =
  currentCheckListFrequencyFilter => {
    return {
      type: ActionTypes.SET_CURRENT_CHECKLIST_FREQUENCY_FILTER,
      currentCheckListFrequencyFilter
    }
  }

// ლ(⁰⊖⁰ლ) new action SET_CURRENT_CHECKLIST_CREATE_DATA
export const setCurrentCheckListCreateData = currentCheckListCreateData => {
  return {
    type: ActionTypes.SET_CURRENT_CHECKLIST_CREATE_DATA,
    currentCheckListCreateData
  }
}

// ლ(⁰⊖⁰ლ) new action SET_CURRENT_CHECKLIST_QUESTIONS
export const setCurrentCheckListQuestions = currentCheckListQuestions => {
  return {
    type: ActionTypes.SET_CURRENT_CHECKLIST_QUESTIONS,
    currentCheckListQuestions
  }
}

// ლ(⁰⊖⁰ლ) new action SET_CURRENT_CHECKLIST_FOR_EDIT
export const setCurrentCheckListForEdit = currentCheckListForEdit => {
  return {
    type: ActionTypes.SET_CURRENT_CHECKLIST_FOR_EDIT,
    currentCheckListForEdit
  }
}

// ლ(⁰⊖⁰ლ) new action SET_CURRENT_CHECKLIST_FOR_UPDATE_VERSION
export const setCurrentCheckListForUpdateVersion =
  currentCheckListForUpdateVersion => {
    return {
      type: ActionTypes.SET_CURRENT_CHECKLIST_FOR_UPDATE_VERSION,
      currentCheckListForUpdateVersion
    }
  }

// ლ(⁰⊖⁰ლ) new action SET_CURRENT_CHECKLIST_ASSIGNMENT_PROCEDURE_DATA
export const setCurrentCheckListAssignmentProcedureData =
  currentCheckListAssignmentProcedureData => {
    return {
      type: ActionTypes.SET_CURRENT_CHECKLIST_ASSIGNMENT_PROCEDURE_DATA,
      currentCheckListAssignmentProcedureData
    }
  }

// ლ(⁰⊖⁰ლ) new action  setCurrentContractorBasicData
export const setCurrentContractorBasicData = currentContractorBasicData => {
  return {
    type: ActionTypes.SET_CURRENT_CONTRACTOR_BASIC_DATA,
    currentContractorBasicData
  }
}

// ლ(⁰⊖⁰ლ) new action setContractorType
export const setContractorTypes = contractorTypes => {
  return {
    type: ActionTypes.SET_CONTRACTOR_TYPES,
    contractorTypes
  }
}

export const setContractorCustomTypes = contractorCustomTypes => {
  return {
    type: ActionTypes.SET_CONTRACTOR_CUSTOM_TYPES,
    contractorCustomTypes
  }
}

export const setAllContractorTypes = allContractorTypes => {
  return {
    type: ActionTypes.SET_ALL_CONTRACTOR_TYPES,
    allContractorTypes
  }
}

// ლ(⁰⊖⁰ლ) new action setCurrentAuditRecordDraft
export const setCurrentAuditRecordDraft = currentAuditRecordDraft => {
  return {
    type: ActionTypes.SET_CURRENT_AUDIT_RECORD_DRAFT,
    currentAuditRecordDraft
  }
}

// ლ(⁰⊖⁰ლ) new action setCurrentChecklistRecordDraft
export const setCurrentChecklistRecordDraft = currentChecklistRecordDraft => {
  return {
    type: ActionTypes.SET_CURRENT_CHECKLIST_RECORD_DRAFT,
    currentChecklistRecordDraft
  }
}

export const setSystemClasses = systemClasses => {
  return {
    type: ActionTypes.SET_SYSTEM_CLASS,
    systemClasses
  }
}

// ლ(⁰⊖⁰ლ)
export const setEffect = effects => {
  return {
    type: ActionTypes.SET_EFFECT,
    effects
  }
}

// ლ(⁰⊖⁰ლ)
export const setActType = actTypes => {
  return {
    type: ActionTypes.SET_ACT_TYPE,
    actTypes
  }
}

// ლ(⁰⊖⁰ლ)
export const setActStatus = actStatus => {
  return {
    type: ActionTypes.SET_ACT_STATUS,
    actStatus
  }
}

export const setLicenseType = licenseType => {
  return {
    type: ActionTypes.SET_LICENSE_TYPE,
    licenseType
  }
}

export const setEventTypes = eventTypes => {
  return {
    type: ActionTypes.SET_EVENT_TYPES,
    eventTypes
  }
}

// ლ(⁰⊖⁰ლ)
export const setFactoryTags = factoryTags => {
  return {
    type: ActionTypes.SET_FACTORY_TAGS,
    factoryTags
  }
}

// ლ(⁰⊖⁰ლ)
export const setContractor = contractor => {
  return {
    type: ActionTypes.SET_CONTRACTOR,
    contractor
  }
}

export const setCollectIds = collectIds => {
  return {
    type: ActionTypes.SET_COLLECT_ID,
    collectIds
  }
}

export const setCollectGuidelineIds = collectGuidelineIds => {
  return {
    type: ActionTypes.SET_COLLECT_GUIDELINE_ID,
    collectGuidelineIds
  }
}

export const addToCollectIds = addToCollectIds => {
  return {
    type: ActionTypes.ADD_TO_COLLECT_IDS,
    addToCollectIds
  }
}
export const addToCollectGuidelineIds = addToCollectGuidelineIds => {
  return {
    type: ActionTypes.ADD_TO_COLLECT_GUIDELINE_IDS,
    addToCollectGuidelineIds
  }
}

export const deleteCollectId = removeFromCollectIds => {
  return {
    type: ActionTypes.REMOVE_FROM_COLLECT_IDS,
    removeFromCollectIds
  }
}
export const deleteCollectGuidelineId = removeFromCollectGuidelineIds => {
  return {
    type: ActionTypes.REMOVE_FROM_COLLECT_GUIDELINE_IDS,
    removeFromCollectGuidelineIds
  }
}

export const setCurrentFactory = currentFactory => {
  return {
    type: ActionTypes.SET_CURRENT_FACTORY,
    currentFactory
  }
}

export const setCurrentTimezone = currentTimezone => {
  return {
    type: ActionTypes.SET_CURRENT_TIMEZONE,
    currentTimezone
  }
}

export const setUserSubTasks = subtask => {
  return {
    type: ActionTypes.SET_USER_SUBTASKS,
    subtask
  }
}

export const setUserScopes = userScopes => {
  return {
    type: ActionTypes.SET_USER_SCOPES,
    userScopes
  }
}
export const setDataFail = dataFail => {
  return {
    type: ActionTypes.SET_DATA_FAIL,
    dataFail
  }
}

export const setCurrentOrganization = currentOrganization => {
  return {
    type: ActionTypes.SET_CURRENT_ORGANIZATION,
    currentOrganization
  }
}
export const setCurrentViewMode = currentViewMode => {
  return {
    type: ActionTypes.SET_CURRENT_VIEW_MODE,
    currentViewMode
  }
}

export const setRefetchChecker = refetchChecker => {
  return {
    type: ActionTypes.SET_REFETCH_CHECKER,
    refetchChecker
  }
}

export const setIdleCounter = idleCounter => {
  return {
    type: ActionTypes.SET_IDLE_COUNTER,
    idleCounter
  }
}

export const setRefreshCounter = refreshCounter => {
  return {
    type: ActionTypes.SET_REFRESH_COUNTER,
    refreshCounter
  }
}

export const setInitUrlFromQRcode = initUrlFromQRcode => {
  return {
    type: ActionTypes.SET_INIT_URL_FROM_QRCODE,
    initUrlFromQRcode
  }
}

export const setConstantData = constantData => {
  return {
    type: ActionTypes.SET_CONSTANT_DATA,
    constantData
  }
}

export const setCurrentSelectedGuidelineId = currentSelectedGuidelineId => {
  return {
    type: ActionTypes.SET_CURRENT_SELECTED_GUIDELINE_ID,
    currentSelectedGuidelineId
  }
}

export const setCurrentLocales = currentLocales => {
  return {
    type: ActionTypes.SET_CURRENT_LOCALES,
    currentLocales
  }
}

export const setCurrentLatLng= currentLatLng => {
  return {
    type: ActionTypes.SET_CURRENT_LATLNG,
    currentLatLng
  }
}

export const setConnectionState = payload => {
  return {
    type: ActionTypes.SET_CONNECTION_STATE,
    payload,
  }
}

export const setOfflineMsg = payload => {
  return {
    type: ActionTypes.SET_OFFLINE_MSG,
    payload,
  }
}

export const setPreloadChecklistAssignment = payload => {
  return {
    type: ActionTypes.SET_PRELOAD_CHECKLIST_ASSIGNMENT,
    payload,
  }
}

export const setPreloadChecklistAssignmentDraft = payload => {
  return {
    type: ActionTypes.SET_PRELOAD_CHECKLIST_ASSIGNMENT_DRAFT,
    payload,
  }
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_CURRENT_USER:
      return {
        ...state,
        currentUser: action.currentUser
      }

    // ლ(⁰⊖⁰ლ) new reducer for SET_TASK_LIST_TAB_NUM
    case ActionTypes.SET_TASK_LIST_TAB_NUM:
      return {
        ...state,
        taskListTabNum: action.taskListTabNum
      }

    // ლ(⁰⊖⁰ლ) new reducer for SET_FILTER_PARAMS_FOR_ACT
    case ActionTypes.SET_FILTER_PARAMS_FOR_ACT:
      return {
        ...state,
        filterParamsForAct: action.filterParamsForAct
      }

    // ლ(⁰⊖⁰ლ) new reducer for SET_FILTER_PARAMS_FOR_ACT
    case ActionTypes.SET_CURRENT_ACT:
      return {
        ...state,
        currentAct: action.currentAct
      }

    // ლ(⁰⊖⁰ლ) new reducer for SET_FIELD_FOR_FORM
    case ActionTypes.SET_FIELD_FOR_FORM:
      return {
        ...state,
        fieldsForForm: action.fieldsForForm
      }

    //ლ(⁰⊖⁰ლ) new reducer SET_CURRENT_LICENSE
    case ActionTypes.SET_CURRENT_LICENSE:
      return {
        ...state,
        currentLicense: action.currentLicense
      }

    //ლ(⁰⊖⁰ლ) new reducer SET_CURRENT_EDIT_LICENSE
    case ActionTypes.SET_CURRENT_EDIT_LICENSE:
      return {
        ...state,
        currentEditLicense: action.currentEditLicense
      }

    //ლ(⁰⊖⁰ლ) new reducer SET_CURRENT_CREATE_LICENSE
    case ActionTypes.SET_CURRENT_CREATE_LICENSE:
      return {
        ...state,
        currentCreateLicense: action.currentCreateLicense
      }

    //ლ(⁰⊖⁰ლ) new reducer SET_CURRENT_EDIT_TRAINING
    case ActionTypes.SET_CURRENT_EDIT_TRAINING:
      return {
        ...state,
        currentEditTraining: action.currentEditTraining
      }

    //ლ(⁰⊖⁰ლ) new reducer SET_CURRENT_CHECKLIST
    case ActionTypes.SET_CURRENT_CHECKLIST:
      return {
        ...state,
        currentCheckList: action.currentCheckList
      }

    //ლ(⁰⊖⁰ლ) new reducer SET_CURRENT_CHECKLIST_FREQUENCY_FILTER
    case ActionTypes.SET_CURRENT_CHECKLIST_FREQUENCY_FILTER:
      return {
        ...state,
        currentCheckListFrequencyFilter: action.currentCheckListFrequencyFilter
      }

    //ლ(⁰⊖⁰ლ) new reducer SET_CURRENT_CHECKLIST_CREATE_DATA
    case ActionTypes.SET_CURRENT_CHECKLIST_CREATE_DATA:
      return {
        ...state,
        currentCheckListCreateData: action.currentCheckListCreateData
      }

    //ლ(⁰⊖⁰ლ) new reducer SET_CURRENT_CHECKLIST_QUESTIONS
    case ActionTypes.SET_CURRENT_CHECKLIST_QUESTIONS:
      return {
        ...state,
        currentCheckListQuestions: action.currentCheckListQuestions
      }

    //ლ(⁰⊖⁰ლ) new reducer SET_CURRENT_CHECKLIST_FOR_EDIT
    case ActionTypes.SET_CURRENT_CHECKLIST_FOR_EDIT:
      return {
        ...state,
        currentCheckListForEdit: action.currentCheckListForEdit
      }

    //ლ(⁰⊖⁰ლ) new reducer SET_CURRENT_CHECKLIST_FOR_UPDATE_VERSION
    case ActionTypes.SET_CURRENT_CHECKLIST_FOR_UPDATE_VERSION:
      return {
        ...state,
        currentCheckListForUpdateVersion:
          action.currentCheckListForUpdateVersion
      }

    //ლ(⁰⊖⁰ლ) new reducer SET_CURRENT_CHECKLIST_ASSIGNMENT_PROCEDURE_DATA
    case ActionTypes.SET_CURRENT_CHECKLIST_ASSIGNMENT_PROCEDURE_DATA:
      return {
        ...state,
        currentCheckListAssignmentProcedureData:
          action.currentCheckListAssignmentProcedureData
      }

    //ლ(⁰⊖⁰ლ) new reducer SET_CURRENT_CONTRACTOR_BASIC_DATA
    case ActionTypes.SET_CURRENT_CONTRACTOR_BASIC_DATA:
      return {
        ...state,
        currentContractorBasicData: action.currentContractorBasicData
      }

    //ლ(⁰⊖⁰ლ) new reducer SET_CONTRACTOR_TYPE
    case ActionTypes.SET_CONTRACTOR_TYPES:
      return {
        ...state,
        contractorTypes: action.contractorTypes
      }

    case ActionTypes.SET_CONTRACTOR_CUSTOM_TYPES:
      return {
        ...state,
        contractorCustomTypes: action.contractorCustomTypes
      }

    case ActionTypes.SET_ALL_CONTRACTOR_TYPES:
      return {
        ...state,
        allContractorTypes: action.allContractorTypes
      }

    //ლ(⁰⊖⁰ლ) new reducer SET_CURRENT_AUDIT_RECORD_DRAFT
    case ActionTypes.SET_CURRENT_AUDIT_RECORD_DRAFT:
      return {
        ...state,
        currentAuditRecordDraft: action.currentAuditRecordDraft
      }

    //ლ(⁰⊖⁰ლ) new reducer SET_CURRENT_CHECKLIST_RECORD_DRAFT
    case ActionTypes.SET_CURRENT_CHECKLIST_RECORD_DRAFT:
      return {
        ...state,
        currentChecklistRecordDraft: action.currentChecklistRecordDraft
      }

    case ActionTypes.SET_SYSTEM_CLASS:
      return {
        ...state,
        systemClasses: action.systemClasses
      }
    case ActionTypes.SET_EFFECT:
      return {
        ...state,
        effects: action.effects
      }
    case ActionTypes.SET_ACT_TYPE:
      return {
        ...state,
        actTypes: action.actTypes
      }
    case ActionTypes.SET_ACT_STATUS:
      return {
        ...state,
        actStatus: action.actStatus
      }
    case ActionTypes.SET_LICENSE_TYPE:
      return {
        ...state,
        licenseType: action.licenseType
      }
    case ActionTypes.SET_EVENT_TYPES:
      return {
        ...state,
        eventTypes: action.eventTypes
      }
    case ActionTypes.SET_FACTORY_TAGS:
      return {
        ...state,
        factoryTags: action.factoryTags
      }
    case ActionTypes.SET_CONTRACTOR:
      return {
        ...state,
        contractor: action.contractor
      }
    case ActionTypes.SET_COLLECT_ID:
      return {
        ...state,
        collectIds: action.collectIds
      }
    case ActionTypes.SET_COLLECT_GUIDELINE_ID:
      return {
        ...state,
        collectGuidelineIds: action.collectGuidelineIds
      }
    case ActionTypes.ADD_TO_COLLECT_IDS:
      const _collectIds = [...state.collectIds]
      _collectIds.push(action.addToCollectIds)
      return {
        ...state,
        collectIds: _collectIds
      }
    case ActionTypes.ADD_TO_COLLECT_GUIDELINE_IDS:
      const _collectGuidelineIds = [...state.collectGuidelineIds]
      _collectGuidelineIds.push(action.addToCollectGuidelineIds)
      return {
        ...state,
        collectGuidelineIds: _collectGuidelineIds
      }
    case ActionTypes.REMOVE_FROM_COLLECT_IDS:
      return {
        ...state,
        collectIds: state.collectIds.filter(collect => {
          return collect !== action.removeFromCollectIds
        })
      }
    case ActionTypes.REMOVE_FROM_COLLECT_GUIDELINE_IDS:
      return {
        ...state,
        collectGuidelineIds: state.collectGuidelineIds.filter(collect => {
          return collect !== action.removeFromCollectGuidelineIds
        })
      }
    case ActionTypes.SET_CURRENT_FACTORY:
      return {
        ...state,
        currentFactory: action.currentFactory
      }
    case ActionTypes.SET_CURRENT_TIMEZONE:
      return {
        ...state,
        currentTimezone: action.currentTimezone
      }
    case ActionTypes.SET_USER_SUBTASKS:
      return {
        ...state,
        subtask: action.subtask
      }
    case ActionTypes.SET_USER_SCOPES:
      return {
        ...state,
        userScopes: action.userScopes
      }
    case ActionTypes.SET_DATA_FAIL:
      return {
        ...state,
        dataFail: action.dataFail
      }
    case ActionTypes.SET_CURRENT_ORGANIZATION:
      return {
        ...state,
        currentOrganization: action.currentOrganization
      }
    case ActionTypes.SET_CURRENT_VIEW_MODE:
      return {
        ...state,
        currentViewMode: action.currentViewMode
      }
    case ActionTypes.SET_REFETCH_CHECKER:
      return {
        ...state,
        refetchChecker: action.refetchChecker
      }
    case ActionTypes.SET_IDLE_COUNTER:
      return {
        ...state,
        idleCounter: action.idleCounter
      }
    case ActionTypes.SET_REFRESH_COUNTER:
      return {
        ...state,
        refreshCounter: action.refreshCounter
      }
    case ActionTypes.SET_INIT_URL_FROM_QRCODE:
      return {
        ...state,
        initUrlFromQRcode: action.initUrlFromQRcode
      }
    case ActionTypes.SET_CONNECTION_STATE:
      return {
        ...state,
        connectionState: action.payload,
      }
    case ActionTypes.SET_OFFLINE_MSG:
      return {
        ...state,
        offlineMsg: action.payload,
      }
    case ActionTypes.SET_PRELOAD_CHECKLIST_ASSIGNMENT:
      return {
        ...state,
        preloadChecklistAssignment: action.payload,
      }
    case ActionTypes.SET_PRELOAD_CHECKLIST_ASSIGNMENT_DRAFT:
      return {
        ...state,
        preloadChecklistAssignmentDraft: action.payload,
      }
    case ActionTypes.SET_CONSTANT_DATA:
      return {
        ...state,
        constantData: action.constantData
      }
    case ActionTypes.SET_CURRENT_SELECTED_GUIDELINE_ID:
      return {
        ...state,
        currentSelectedGuidelineId: action.currentSelectedGuidelineId
      }
    case ActionTypes.SET_CURRENT_LOCALES:
      return {
        ...state,
        currentLocales: action.currentLocales
      }
    case ActionTypes.SET_CURRENT_LATLNG:
      return {
        ...state,
        currentLatLng: action.currentLatLng
      }
    default:
      return state
  }
}

export default reducer
