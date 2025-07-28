import React from 'react'
import { View, TouchableHighlight, StyleSheet } from 'react-native'
import { WsIcon, WsFlex, WsDes, WsText, WsAvatar } from '@/components'

const WsUserSection = props => {
  // Props
  const {
    userName,
    userEmail,
    onPress,
    avatar = require('@/__reactnative_stone/assets/img/avatar.png')
  } = props

  // Render
  return (
    <TouchableHighlight
      onPress={onPress}
      activeOpacity={0.6}
      underlayColor="transparent">
      <WsFlex
        style={{
          padding: 16
        }}>
        <WsAvatar isUri={true} size={56} source={avatar} />
        <View style={styles.userAccount}>
          <WsText>{userName}</WsText>
          <WsDes>{userEmail}</WsDes>
        </View>
        <WsIcon name="ws-outline-chevron-forward" size={24} />
      </WsFlex>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  userAccount: {
    flex: 1,
    marginLeft: 16
  }
})

export default WsUserSection
