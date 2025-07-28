import React, { useState, useEffect } from 'react'
import ServiceChatroom from '@/__reactnative_stone/services/chatroom/api/v1/chatroom'
import { WsChat } from '@/components'
import config from '@/__config'

const Chatroom = ({ route }) => {
  // Param
  const {
    token,
    userId,
    // chatroomId
    chatroom
  } = route.params

  // State
  const [members, setMembers] = useState([])
  const [formatedMembers, setFormatedMembers] = useState([])

  // Function
  const $_fetchChatroom = async () => {
    const res = await ServiceChatroom.get(chatroom.id, token)
    setMembers(res.Members)
  }
  const $_updateFormatedMembers = async () => {
    const _formatedMembers = []
    members.forEach(member => {
      const avatar = ServiceChatroom.getMemberAvatar(member)
      const name = ServiceChatroom.getMemberName(member)
      _formatedMembers.push({
        id: member.id,
        avatar: avatar,
        name: name
      })
    })
    setFormatedMembers(_formatedMembers)
  }

  // Effect
  useEffect(() => {
    $_fetchChatroom()
  }, [])
  useEffect(() => {
    $_updateFormatedMembers()
  }, [members])

  return (
    <WsChat
      userId={userId}
      token={token}
      chatroomId={chatroom.id}
      members={formatedMembers}
    />
  )
}

export default Chatroom
