import React from 'react'
import { View, StyleSheet } from 'react-native'
import config from '@/__config'

const WsCard002 = props => {
  const {
    children,
    padding = 20,
    borderRadius = 5,
    color = '#fff',
    borderWidth = 1,
    borderColor = '#e4e7eb',
    shadowColor = '#000',
    shadowOpacity = 0.1,
    shadowOffset = { width: 0, height: 1 },
    shadowRadius = 2,
    marginLeft = 0,
    marginTop = 0,
    layerIndex = 0, // 層次指標
    style,
    isFull = false
  } = props;

  // 動態樣式
  const dynamicStyle = {
    marginLeft: marginLeft - layerIndex * 4, // 向左偏移，每層遞減 4px
    marginTop: marginTop - layerIndex * 4,  // 向上偏移，每層遞減 4px
    shadowOffset: { width: -layerIndex, height: -layerIndex }, // 陰影方向反向增量
    shadowOpacity: 0.1 + layerIndex * 0.02, // 陰影透明度遞增
    shadowRadius: shadowRadius + layerIndex * 0.5, // 陰影模糊遞增
    elevation: layerIndex * 1, // Android 的陰影深度
  };


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
          borderColor: borderColor,
          shadowColor: shadowColor,
          shadowOpacity: shadowOpacity,
          shadowOffset: shadowOffset,
          shadowRadius: shadowRadius,
          marginLeft: marginLeft,
          marginTop: marginTop,
        },
        dynamicStyle, // Add dynamic layering effect
        isFull ? { width: '100%' } : null,
        style
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  WsCard: {
    borderStyle: 'solid'
  }
})

export default WsCard002
