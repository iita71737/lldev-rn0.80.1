const initialState = {
  appBadgeNumber: 0,
  isMounted: false,
  loginErrorMessage: null
}

//action constants
const ActionTypes = {
  SET_APP_BADGE_NUMBER: 'SET_APP_BADGE_NUMBER',
  SET_IS_MOUNTED: 'SET_IS_MOUNTED',
  SET_LOGIN_ERROR_MESSAGE: 'SET_LOGIN_ERROR_MESSAGE'
}

export const setAppBadgeNumber = value => {
  return {
    type: ActionTypes.SET_APP_BADGE_NUMBER,
    payload: value
  }
}

export const setIsMounted = value => {
  return {
    type: ActionTypes.SET_IS_MOUNTED,
    payload: value
  }
}

export const setLoginErrorMessage = value => {
  return {
    type: ActionTypes.SET_LOGIN_ERROR_MESSAGE,
    payload: value
  }
}

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_APP_BADGE_NUMBER:
      return {
        ...state,
        appBadgeNumber: action.payload
      }
    case ActionTypes.SET_IS_MOUNTED:
      return {
        ...state,
        isMounted: action.payload
      }
    case ActionTypes.SET_LOGIN_ERROR_MESSAGE:
      return {
        ...state,
        loginErrorMessage: action.payload
      }
    default:
      return state
  }
}

export default appReducer
