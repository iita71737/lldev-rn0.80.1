import React from 'react'
import {
  Dimensions,
  StyleSheet,
  View,
  TouchableHighlight,
  TouchableOpacity,
} from 'react-native'
import { WsIcon, WsText, WsFlex } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsStateRadioItem = ({
  disabled,
  label,
  isActive,
  onPress,
  testID,
}) => {
  const { width, height } = Dimensions.get('window')

  // Render
  return (
    <>
      <TouchableOpacity
        testID={testID}
        style={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
        disabled={disabled}
        onPress={onPress}
        activeOpacity={1}
        underlayColor="transparent">
        <View
          style={
            [
              styles.container,
              {
                maxWidth: width * 0.8
              }
            ]
          }
        >
          {isActive && (
            <WsIcon
              style={styles.radioButtonIcon}
              name="md-radio-button-checked"
              size={22}
              color={disabled ? '#bfc0c1' : '#0585d3'}
            />
          )}
          {!isActive && (
            <WsIcon
              style={styles.radioButtonIcon}
              name="md-radio-button-unchecked"
              size={22}
              color={'#bfc0c1'}
            />
          )}
          <WsText size={12}>{label}</WsText>
        </View>
      </TouchableOpacity>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    flexWrap: 'nowrap',
    marginRight: 8
  },
  radioButtonIcon: {
    marginRight: 6
  },
  radioButtonText: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 1,
    color: '#373737'
  }
})
export default WsStateRadioItem
