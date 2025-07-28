import React from 'react'
import { StyleSheet, View, Text } from 'react-native'
import { WsIcon } from '@/components'

const WsIconChip = ({
  icon,
  iconSize = 18,
  iconColor = '#0585d3',
  textLabel,
  chipStyle,
  textStyle,
  small = false
}) => {
  // Render
  return (
    <View
      style={[small ? styles.WsIconChipSmall : styles.WsIconChip, chipStyle]}>
      {icon?.length > 0 && (
        <WsIcon name={icon} size={iconSize} color={iconColor} />
      )}
      <Text style={[styles.WsIconChipText, textStyle]}>{textLabel}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  WsIconChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#f2f8fd'
  },
  WsIconChipSmall: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 3,
    paddingLeft: 2,
    paddingRight: 6,
    borderRadius: 10,
    backgroundColor: '#f2f8fd'
  },
  WsIconChipText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    color: '#0585d3'
  }
})
export default WsIconChip
