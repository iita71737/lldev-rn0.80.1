import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'
import {
  StyleSheet,
  View,
} from 'react-native'
import {
  WsInvertedScrollView,
  WsChatToolbar,
  WsChatMessage,
  WsDes,
} from '@/components'
import {
  WsLoading,
} from '@/components'
import ServiceMessage from '@/__reactnative_stone/services/chatroom/api/v1/message'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'

const WsChat = (props) => {

  const {
    chatroomId,
    userId,
    token,
    members = [],
    datetimeColor = $theme == 'light' ? $color.gray5l : $color.gray5d,
  } = props

  // Store
  const {
    messageChatroomMessageCreated,
  } = useSelector(state => state.chatroom)

  // State
  const [messages, setMessages] = useState([])
  const [messageCurrentPage, setMessageCurrentPage] = useState(0)
  const [messageLastPage, setMessageLastPage] = useState(1)
  const [isFetching, setIsFetching] = useState(false)

  // Function 
  const $_onSend = ($event) => {
    if ($event.messageType == 'text') {
      const _newMessage = {
        _id: ServiceMessage.getFakeId(messages.length),
        senderId: userId,
        messageType: 'text',
        text: $event.text,
        createdAt: null,
        needSave: true
      }
      setMessages([
        _newMessage,
        ...messages,
      ])
    } else if ($event.messageType == 'images') {
      const _newMessages = []
      $event.photos.forEach((photo, photoIndex) => {
        _newMessages.push({
          _id: ServiceMessage.getFakeId(messages.length + photoIndex),
          senderId: userId,
          messageType: 'image',
          image: photo.source,
          createdAt: null,
          contentType: photo.contentType,
          needSave: true
        })
      });
      setMessages([
        ..._newMessages,
        ...messages,
      ])
    }
  }
  const $_fetchMessages = async () => {
    if (messageLastPage <= messageCurrentPage) {
      return
    }
    if (isFetching) {
      return
    }
    setIsFetching(true)
    const res = await ServiceMessage.list(chatroomId, token, {
      limit: 30,
      page: messageCurrentPage + 1,
    })
    setMessageLastPage(res.meta.last_page)
    setMessageCurrentPage(parseInt(res.meta.current_page))
    const _messages = []
    res.data.forEach(_message => {
      const target = messages.find(e => {
        return e.id == _message.id
      })
      if (!target) {
        _messages.push(_message)
      }
    });
    setMessages([
      ...messages,
      ..._messages
    ])
    setIsFetching(false)
  }
  const $_getSender = (senderId) => {
    const sender = members.find(e => {
      return e.id == senderId
    })
    return sender
  }
  const $_isSameSenderOfPrev = (messageIndex) => {
    if (messageIndex == 0) {
      return false
    } else if (messages[messageIndex].senderId == messages[messageIndex - 1].senderId) {
      return true
    } else {
      return false
    }
  }
  const $_isDivideNext = (messageIndex) => {
    if (messageIndex == messages.length - 1) {
      return true
    } else if (messages[messageIndex].senderId == messages[messageIndex + 1].senderId) {
      const secondsDiff = moment(messages[messageIndex].createdAt).diff(messages[messageIndex + 1].createdAt, 'seconds')
      if (secondsDiff > 60) {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }
  const $_isDevidePrev = (messageIndex) => {
    if (messageIndex == 0) {
      return true
    } else if (messages[messageIndex].senderId == messages[messageIndex - 1].senderId) {
      const secondsDiff = moment(messages[messageIndex - 1].createdAt).diff(messages[messageIndex].createdAt, 'seconds')
      if (secondsDiff > 60) {
        return true
      } else {
        return false
      }
    } else {
      return true
    }
  }
  const $_isFirst = (messageIndex) => {
    return messageIndex == 0
  }
  const $_onInvertedViewReachTop = () => {
    $_fetchMessages()
  }
  const $_isDifferentDayFromNext = (messageIndex) => {
    if (!messages[messageIndex].createdAt) {
      return false
    }
    if (messageIndex == messages.length - 1) {
      return true
    }
    const message = messages[messageIndex]
    const messageNext = messages[messageIndex + 1]
    if (moment(message.createdAt).format('YYYY-MM-DD') == moment(messageNext.createdAt).format('YYYY-MM-DD')) {
      return false
    } else {
      return true
    }
  }
  const $_getDayText = (time) => {
    return moment(time).format('YYYY年M月D日')
  }
  const $_onMessageSaveComplete = (newMessage, messageIndex) => {
    const _messages = [...messages]
    _messages.splice(messageIndex, 1)
    _messages.splice(messageIndex, 0, newMessage)
    setMessages(_messages)
  }
  const $_messageReset = () => {
    // setMesssages([])
    // setMessageCurrentPage(0)
    // setMessageLastPage(1)
  }
  const $_getMessageKey = (message) => {
    if (message._id) {
      return message._id
    } else {
      return message.id
    }
  }
  const $_addMessage = async (messageId) => {
    const idIsExist = messages.find(e => {
      return e.id == messageId
    })
    if (idIsExist) {
      return
    }
    const _message = await ServiceMessage.get(messageId, token)
    const againExist = messages.find(e => {
      return e.createdAt == _message.created && e.senderId == _message.senderId
    })
    if (againExist) {
      return
    }
    setMessages([
      _message,
      ...messages
    ])
  }

  // Effect
  useEffect(() => {
    $_fetchMessages()
    return () => {
      $_messageReset()
    }
  }, [])

  useEffect(() => {
    if (messageChatroomMessageCreated) {
      $_addMessage(messageChatroomMessageCreated.data.messageId)
    }
  }, [messageChatroomMessageCreated])

  return (
    <View
      style={[
        styles.WsChat
      ]}
    >
      <WsInvertedScrollView
        style={[
          styles.ScrollView
        ]}
        onReachTop={$_onInvertedViewReachTop}
      >
        {messages.map((message, messageIndex) => {
          return (
            <View
              key={$_getMessageKey(message)}
            >
              {$_isDifferentDayFromNext(messageIndex) && (
                <WsDes
                  style={[
                    styles.DateText
                  ]}
                  color={datetimeColor}
                >{$_getDayText(message.createdAt)}</WsDes>
              )}
              <WsChatMessage
                chatroomId={chatroomId}
                token={token}
                userId={userId}
                sender={$_getSender(message.senderId)}
                message={message}
                isSameSenderOfPrev={$_isSameSenderOfPrev(messageIndex)}
                isDivideNext={$_isDivideNext(messageIndex)}
                isDevidePrev={$_isDevidePrev(messageIndex)}
                isFirst={$_isFirst(messageIndex)}
                onSaveComplete={($event) => {
                  $_onMessageSaveComplete($event, messageIndex)
                }}
              ></WsChatMessage>
            </View>
          )
        })}
        {messageLastPage > messageCurrentPage && (
          <WsLoading></WsLoading>
        )}
        {messageLastPage == messageCurrentPage && (
          <WsDes
            style={[
              styles.NoMessageText
            ]}
          >沒有更多訊息了</WsDes>
        )}
      </WsInvertedScrollView>
      <WsChatToolbar
        onSend={$_onSend}
      ></WsChatToolbar>
    </View >
  )
}

const styles = StyleSheet.create({
  WsChat: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  ScrollView: {
    flex: 1,
    paddingVertical: 25,
  },
  DateText: {
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 13,
  },
  NoMessageText: {
    flex: 1,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 13,
  },
})

export default WsChat