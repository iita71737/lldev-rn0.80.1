import React, { useState, useEffect } from 'react'
import store from '@/store'
import { View, Text, Button } from 'react-native'
import { WsChatroomList } from '@/components'
const ChatroomList = ({ route, navigation }) => {
  // Param
  const { token, userId, socket } = route.params
  const $_listBtnOnPress = chatroom => {
    navigation.navigate('Chatroom', {
      chatroom: chatroom
    })
  }

  return (
    <WsChatroomList
      userId={userId}
      token={token}
      listBtnOnPress={chatroom => {
        $_listBtnOnPress(chatroom)
      }}
    />
  )
}
export default ChatroomList
