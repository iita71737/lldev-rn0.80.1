import React, { useState, useEffect } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableHighlight,
  ImageBackground,
  Dimensions,
} from 'react-native'
import {
  WsAvatar,
} from '@/components'
import chatroom from '../services/chatroom/api/v1/chatroom';

const WsChatroomListBtn = ({

  // Prop
  underlayColor = "#dedede",
  onPress,
  avatar,
  name,
  message,
  time,
}) => {

  // Function
  const $_trimText = (text) => {
    const screenWidth = Math.round(Dimensions.get('window').width);
    let count = Math.floor((screenWidth - 128) / 16);
    if (text.length > count) {
      return `${text.substring(0, count - 1)}...`;
    }
    return text;
  }

  // Render
  return (
    <TouchableHighlight
      underlayColor={underlayColor}
      onPress={onPress}
    >
      <View style={styles.container}>
        <WsAvatar
          source={avatar}
        ></WsAvatar>
        <View style={styles.content}>
          {name && (
            <Text style={styles.title}>{$_trimText(name)}</Text>
          )}
          {message && (
            <Text style={styles.message}>{$_trimText(message)}</Text>
          )}
        </View>
        {time && (
          <Text style={styles.time}>{time}</Text>
        )}
      </View>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    width: '100%',
  },
  avatar: {
    width: 50,
    height: 50,
    flex: 0,
  },
  content: {
    paddingLeft: 12,
    paddingRight: 70,
  },
  title: {
    fontSize: 17,
    fontWeight: '500',
    color: '#4a4a4a',
  },
  message: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 1,
    color: '#808080',
  },
  time: {
    position: 'absolute',
    top: 19,
    right: 20,
    fontSize: 13,
    lineHeight: 16,
    letterSpacing: 1,
    color: '#808080',
  },
  count_container: {
    position: 'absolute',
    top: 42,
    right: 20,
    paddingHorizontal: 8,
    height: 24,
    minWidth: 24,
    borderRadius: 12,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  count: {
    fontSize: 12,
    lineHeight: 14,
    letterSpacing: 0.8,
    textAlign: 'center',
    color: '#fff',
  },
});

export default WsChatroomListBtn