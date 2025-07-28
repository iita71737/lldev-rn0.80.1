import React from 'react'
import {
  TouchableHighlight,
  StyleSheet,
  View,
  ImageBackground,
  Text
} from 'react-native'
import $color from '@/__reactnative_stone/global/color'

const WsImageTextBtn = props => {
  // Prop
  const {
    image,
    text,
    color = $color.primary,
    style,
    onPress,
    isAlert = false
  } = props

  // Render
  return (
    <TouchableHighlight
      underlayColor={color}
      style={[
        styles.ImageTextBlock,
        {
          backgroundColor: color
        },
        style
      ]}
      onPress={onPress}>
      <View style={styles.content}>
        {isAlert && <View style={styles.alertDot} />}
        <ImageBackground style={styles.Image} source={image} />
        <Text style={styles.Text}>{text}</Text>
      </View>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  ImageTextBlock: {
    flexGrow: 1,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    shadowColor: '#e5ede6',
    shadowOffset: {
      width: 0,
      height: 11
    },
    shadowRadius: 14,
    shadowOpacity: 1
  },
  content: {
    position: 'relative',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160
  },
  Image: {
    position: 'relative',
    width: 60,
    height: 60
  },
  alertDot: {
    position: 'absolute',
    right: -5,
    top: -5,
    zIndex: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#f94444',
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: '#ffffff'
  },
  Text: {
    marginTop: 13,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 18,
    color: '#ffffff'
  }
})

export default WsImageTextBtn
