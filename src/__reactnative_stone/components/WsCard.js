import React from 'react'
import { View, StyleSheet } from 'react-native'
import config from '@/__config'

const WsCard = props => {
  // Prop
  const {
    children,
    padding = 20,
    borderRadius = config.component.WsCard &&
      config.component.WsCard.borderRadius
      ? config.component.WsCard.borderRadius
      : 5,
    color = '#fff',
    borderWidth = 1,
    borderColor = '#e4e7eb',
    style,
    isFull = false
  } = props

  // Render
  return (
    <View
      style={[
        styles.WsCard,
        {
          padding: padding,
          borderRadius: borderRadius,
          backgroundColor: color,
          borderWidth: borderWidth,
          borderColor: borderColor
        },
        isFull
          ? {
            width: '100%'
          }
          : null,
        style
      ]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  WsCard: {
    borderStyle: 'solid'
  }
})

export default WsCard
