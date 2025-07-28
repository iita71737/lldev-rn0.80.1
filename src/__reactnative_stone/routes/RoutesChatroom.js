import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'
import { WsHeaderBackBtn } from '@/components'
import ViewChatroomList from '@/__reactnative_stone/views/ChatroomList'
import ViewChatroom from '@/__reactnative_stone/views/Chatroom'
import ServiceChatroom from '@/__reactnative_stone/services/chatroom/api/v1/chatroom'
import config from '@/__config'
import $option from '@/__reactnative_stone/global/option'

import {
  setMessageChatroomCreated,
  setMessageChatroomUpdated,
  setMessageChatroomMessageCreated
} from '@/__reactnative_stone/store/chatroom'
import io from 'socket.io-client'
import store from '@/store'

const StackChatroom = createStackNavigator()
const RoutesChatroom = ({ route }) => {
  // Params
  const userId = route.params.userId
  const token = route.params.token
  const chatroomText = route.params.chatroomText
    ? route.params.chatroomText
    : '聊天室'

  // State
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    socket ? $_connectSocket() : $_initSocket()
    return () => {
      $_disconnectSocket()
    }
  }, [socket, userId])

  // // Function
  const $_initSocket = () => {
    setSocket(
      io(config.endpoint.chatroomSocket, {
        query: { token: token }
      })
    )
  }
  const $_disconnectSocket = () => {
    if (socket) {
      socket.disconnect()
    }
  }
  const $_connectSocket = () => {
    socket.on('connect', () => {
      console.log('client connect success')
    })
    socket.on('error', error => {
      console.log(error)
    })
    socket.on('reconnect', () => {
      socket.on('connect', () => {
        console.log('client reconnect success')
      })
    })
    socket.on('message', socketMessage => {
      if (socketMessage.message == 'chatroom-created') {
        store.dispatch(setMessageChatroomCreated(socketMessage))
      } else if (socketMessage.message == 'chatroom-updated') {
        store.dispatch(setMessageChatroomUpdated(socketMessage))
      } else if (socketMessage.message == 'chatroom-message-created') {
        store.dispatch(setMessageChatroomMessageCreated(socketMessage))
      }
    })
  }

  return (
    <StackChatroom.Navigator>
      <StackChatroom.Screen
        name="ChatroomList"
        component={ViewChatroomList}
        options={{
          title: chatroomText,
          ...$option.headerOption,
          headerTitleAlign: 'center'
        }}
        initialParams={{
          userId: userId,
          token: token
        }}
      />
      <StackChatroom.Screen
        name="Chatroom"
        component={ViewChatroom}
        options={({ route }) => ({
          title: ServiceChatroom.getChatroomName(route.params.chatroom),
          ...$option.headerOption,
          headerTitleAlign: 'center'
        })}
        initialParams={{
          userId: userId,
          token: token
        }}
      />
    </StackChatroom.Navigator>
  )
}

export default RoutesChatroom
