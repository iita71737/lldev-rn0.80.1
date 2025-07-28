import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
} from 'react-native';
import {
  WsAvatar,
} from '@/components'
import {
  WsPreviewImage001,
} from '@/components/seed'
import moment from 'moment'
import config from '@/__config'
import ServiceMessage from '@/__reactnative_stone/services/chatroom/api/v1/message'
import RNFS from 'react-native-fs'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'

const WsChatMessage = ({
  message,
  userId,
  sender,
  chatroomId,
  token,
  myTextBackgroundColor = $theme == 'light' ? $color.white2d : $color.black2l,
  myTextColor = $theme == 'light' ? $color.gray5d : $color.gray5l,
  isDivideNext = false,
  isDevidePrev = false,
  isFirst = false,
  MessageContentNameColor = $color.gray,
  timeColor = $theme == 'light' ? $color.gray5l : $color.gray5d,
  onSaveComplete,
  serviceStorage = config.chatroom.ServiceStorage
}) => {

  // State
  const [isSaving, setIsSaving] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [isError, setIsError] = useState(false)

  // Function
  const $_isMe = (sender) => {
    return sender.id == userId
  }
  const $_getTimeText = (time) => {
    const _moment = moment(time)
    const aFormat = _moment.format('A')
    let aFormatText
    const hour = _moment.get('hour')
    if (aFormat == 'AM') {
      aFormatText = '上午'
    } else if (aFormat == 'PM') {
      if (hour >= 18) {
        aFormatText = '晚上'
      } else {
        aFormatText = '下午'
      }
    }
    return `${aFormatText} ${_moment.format('h:mm')}`
  }
  const $_saveMessage = async () => {
    setIsSaving(true)
    let type
    let content
    if (message.messageType == 'text') {
      type = 'text'
      content = message.text
    } else if (message.messageType == 'image') {
      type = 'image'
      const url = await serviceStorage.save(message.image, message.contentType)
      content = url
    }
    try {
      const res = await ServiceMessage.create(chatroomId, token, type, content)
      onSaveComplete(res.newMessage)
    } catch (error) {
      setIsError(true)
    } finally {
      setIsSaving(false)
      setIsComplete(true)
    }
  }

  // Effect
  useEffect(() => {
    if (message.needSave && !isSaving && !isComplete) {
      $_saveMessage()
    }
    return () => {

    }
  }, [])

  return (
    <>
      {sender && message && (
        <View
          style={[
            styles.Container,
            $_isMe(sender) ? styles.Container__Me : null,
            !isDevidePrev ? {
              marginBottom: 4
            } : null,
            isFirst ? {
              marginBottom: 0
            } : null
          ]}
        >
          <View
            style={[
              styles.Message,
              $_isMe(sender) ? styles.Message__Me : null
            ]}
          >
            {!$_isMe(sender) && (
              <View
                style={[
                  styles.Avatar,
                  $_isMe(sender) ? styles.Avatar__Me : null
                ]}
              >
                {isDivideNext && (
                  <WsAvatar
                    size={30}
                    source={sender.avatar}
                  ></WsAvatar>
                )}
              </View>
            )}
            <View
              style={[
                styles.MessageContent,
                $_isMe(sender) ? {
                  ...styles.MessageContent__Me,
                } : null,
              ]}
            >
              {isDivideNext && !$_isMe(sender) && (
                <Text
                  style={[
                    styles.MessageContentName,
                    {
                      color: MessageContentNameColor
                    }
                  ]}
                >{sender.name}</Text>
              )}
              {message.messageType == 'text' && (
                <Text
                  style={[
                    styles.MessageContentText,
                    (isSaving) ? styles.MessageContentText__Saving : null,
                    {
                      color: myTextColor,
                      backgroundColor: '#fff'
                    },
                    $_isMe(sender) ? {
                      ...styles.MessageContentText__Me,
                      backgroundColor: myTextBackgroundColor
                    } : null,
                    isDivideNext ? {
                      borderTopLeftRadius: 17,
                      borderTopRightRadius: 17
                    } : null,
                    isDevidePrev ? {
                      borderBottomLeftRadius: 17,
                      borderBottomRightRadius: 17
                    } : null,
                  ]}
                >{message.text}</Text>
              )}
              {message.messageType == 'image' && (
                <WsPreviewImage001
                  source={message.image}
                ></WsPreviewImage001>
              )}
            </View>
            {message.createdAt && (
              <View
                style={[
                  styles.Time,
                  $_isMe(sender) ? {
                    ...styles.Time__Me,
                  } : null,
                ]}
              >
                <Text
                  style={[
                    styles.TimeText,
                    {
                      color: timeColor
                    }
                  ]}
                >{$_getTimeText(message.createdAt)}</Text>
              </View>
            )}
          </View>
        </View>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  Container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  Container__Me: {
    justifyContent: 'flex-end',
  },
  Message: {
    flexDirection: 'row',
  },
  Message__Me: {
    flexDirection: 'row-reverse',
    alignItems: "center",
    justifyContent: 'flex-start',
  },
  Avatar: {
    width: 30,
    marginRight: 6
  },
  Avatar__Me: {
    marginRight: 0,
    marginLeft: 6
  },
  MessageContent: {

  },
  MessageContent__Me: {
    alignItems: 'flex-end'
  },
  MessageContentName: {
    fontSize: 12,
    marginBottom: 4
  },
  MessageContentText: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 2,
    borderBottomRightRadius: 17,
    borderTopRightRadius: 17,
  },
  MessageContentText__Saving: {
    opacity: .3
  },
  MessageContentText__Me: {
    borderBottomRightRadius: 2,
    borderTopRightRadius: 2,
    borderBottomLeftRadius: 17,
    borderTopLeftRadius: 17,
  },
  Time: {
    justifyContent: 'flex-end',
  },
  TimeText: {
    fontSize: 12,
    marginLeft: 6
  },
  Time__Me: {
    marginLeft: 0,
    marginRight: 6
  },
})

export default WsChatMessage