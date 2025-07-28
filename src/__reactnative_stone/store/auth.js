const initialState = {
  currentUser: null
}

//action constants
const ActionTypes = {
  SET_CURRENT_USER: 'SET_CURRENT_USER'
}

export const setCurrentUser = currentUser => {
  return {
    type: ActionTypes.SET_CURRENT_USER,
    currentUser
  }
}

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionTypes.SET_CURRENT_USER:
      return {
        ...state,
        currentUser: action.currentUser
      }
    default:
      return state
  }
}

export default reducer
