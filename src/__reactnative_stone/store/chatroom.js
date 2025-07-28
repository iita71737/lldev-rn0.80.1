const initialState = {
  messageChatroomCreated: null,
  messageChatroomUpdated: null,
  messageChatroomMessageCreated: null
}

export const setMessageChatroomCreated = value => {
  return {
    type: 'SET_MESSAGE_CHATROOM_CREATED',
    payload: value
  }
}
export const setMessageChatroomUpdated = value => {
  return {
    type: 'SET_MESSAGE_CHATROOM_UPDATED',
    payload: value
  }
}
export const setMessageChatroomMessageCreated = value => {
  return {
    type: 'SET_MESSAGE_CHATROOM_MESSAGE_CREATED',
    payload: value
  }
}

const appReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_MESSAGE_CHATROOM_CREATED':
      return {
        ...state,
        messageChatroomCreated: action.payload
      }
    case 'SET_MESSAGE_CHATROOM_UPDATED':
      return {
        ...state,
        messageChatroomUpdated: action.payload
      }
    case 'SET_MESSAGE_CHATROOM_MESSAGE_CREATED':
      return {
        ...state,
        messageChatroomMessageCreated: action.payload
      }
    default:
      return state
  }
}

export default appReducer
