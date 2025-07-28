import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'
import {
  WsChatroomListBtn,
} from '@/components'
import {
  WsLoadingView,
  WsPageScrollView,
} from '@/components'
import ServiceChatroom from '@/__reactnative_stone/services/chatroom/api/v1/chatroom'

const WsChatroomList = ({

  // Prop
  token,
  userId,
  listBtnOnPress,
}) => {

  // State
  const [chatrooms, setChatrooms] = useState([]);
  const [fChatrooms, setFChatrooms] = useState([]);
  const [chatroomCurrentPage, setChatroomCurrentPage] = useState(0)
  const [chatroomLastPage, setChatroomLastPage] = useState(1)
  const [isFetching, setIsFetching] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Store
  const {
    messageChatroomCreated,
    messageChatroomUpdated,
  } = useSelector(state => state.chatroom)

  // Function
  const $_fetchChatrooms = async () => {
    if (chatroomLastPage <= chatroomCurrentPage) {
      return
    }
    if (isFetching) {
      return
    }
    setIsFetching(true)
    const res = await ServiceChatroom.list(token, {
      limit: 15,
      page: chatroomCurrentPage + 1,
    })
    setChatroomLastPage(res.meta.last_page)
    setChatroomCurrentPage(parseInt(res.meta.current_page))
    const _chatrooms = []
    res.data.forEach(_chatroom => {
      const target = chatrooms.find(e => {
        return e.id == _chatroom.id
      })
      if (!target) {
        _chatrooms.push(_chatroom)
      }
    });
    setChatrooms([
      ...chatrooms,
      ..._chatrooms
    ])
    setIsFetching(false)
    setIsRefreshing(false)
  }
  const $_setChatroomLastMessage = (chatroom) => {
    if (!chatroom.ChatroomMessages || chatroom.ChatroomMessages.length == 0) {
      return null
    }
    if (chatroom.ChatroomMessages[0].messageType === 'text') {
      return chatroom.ChatroomMessages[0].text;
    }
    if (chatroom.ChatroomMessages[0].messageType === 'image') {
      return userId === +chatroom.ChatroomMessages[0].senderId ? '圖片已傳送' : '收到新圖片';
    }
    return null
  }
  const $_getTimeText = (chatroom) => {
    if (!chatroom.ChatroomMessages || chatroom.ChatroomMessages.length == 0) {
      return null
    };
    return ServiceChatroom.getTimeText(chatroom.ChatroomMessages[0].createdAt)
  }
  const $_onReachBottom = () => {
    $_fetchChatrooms()
  }
  const $_updateFChatrooms = () => {
    const _FChatrooms = [...chatrooms]
    _FChatrooms.sort((a, b) => {
      return b.lastMsgCreatedAt - a.lastMsgCreatedAt
    })
    setFChatrooms(_FChatrooms)
  }
  const $_addChatroom = async (chatroomId) => {
    const isExist = chatrooms.find(e => {
      return e.id == chatroomId
    })
    if (isExist) {
      return
    }
    const chatroom = await ServiceChatroom.get(chatroomId, token)
    setChatrooms([
      chatroom,
      ...chatrooms
    ])
  }
  const $_updateChatroom = async (chatroomId) => {
    const tarIndex = chatrooms.findIndex(e => {
      return e.id == chatroomId
    })
    if (tarIndex >= 0) {
      const chatroom = await ServiceChatroom.get(chatroomId, token)
      const _chatrooms = [...chatrooms]
      _chatrooms[tarIndex].createdAt = chatroom.createdAt
      _chatrooms[tarIndex].ChatroomMessages = chatroom.ChatroomMessages
      setChatrooms(_chatrooms)
    }
  }
  const $_onRefresh = async () => {
    setIsRefreshing(true)
    setChatroomCurrentPage(0)
    setChatroomLastPage(1)
    setChatrooms([])
    // return
  }

  // Effect
  useEffect(() => {
    $_fetchChatrooms()
  }, [])

  useEffect(() => {
    $_fetchChatrooms()
  }, [isRefreshing])

  useEffect(() => {
    $_updateFChatrooms()
  }, [chatrooms])

  useEffect(() => {
    if (messageChatroomCreated) {
      $_addChatroom(messageChatroomCreated.data.chatroomId)
    }
  }, [messageChatroomCreated])

  useEffect(() => {
    if (messageChatroomUpdated) {
      $_updateChatroom(messageChatroomUpdated.data.chatroomId)
    }
  }, [messageChatroomUpdated])

  // Render
  return (
    <WsPageScrollView
      onReachBottom={$_onReachBottom}
      onRefresh={$_onRefresh}
      isRefreshing={isRefreshing}
    >
      {fChatrooms.map(chatroom => {
        return (
          <WsChatroomListBtn
            key={chatroom.id}
            name={ServiceChatroom.getChatroomName(chatroom)}
            avatar={ServiceChatroom.getChatroomAvatar(chatroom)}
            message={$_setChatroomLastMessage(chatroom)}
            time={$_getTimeText(chatroom)}
            onPress={() => {
              listBtnOnPress(chatroom);
            }}
          />
        )
      })}
      {isFetching && (
        <WsLoadingView></WsLoadingView>
      )}
    </WsPageScrollView>
  )
}

const styles = StyleSheet.create({
});

export default WsChatroomList