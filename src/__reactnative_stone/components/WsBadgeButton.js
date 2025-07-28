// A_A
import React from 'react'
import {
  StyleSheet,
  Platform,
  Animated,
  TouchableHighlight,
  View,
  Text
} from 'react-native'
import $color from '@/__reactnative_stone/global/color'

const WsBadgeButton = props => {
  // Props
  const { disable = false, children, badge, onPress, options, style, testID } = props

  const _options = {
    size: 60,
    backgroundColor: disable ? 'rgba(0, 24, 57, 0.8)' : '#ffffff',
    underlayColor: 'transparent',
    activeOpacity: 1,
    buttonMargin: 8,
    borderRadius: 10,
    badgeColor: '#e66155',
    badgeTextColor: 'white',
    maxBadgeValue: 10,
    shadowDepth: 4,
    shadowRadius: 2,
    animatedFriction: 7,
    animatedTension: 40,
    ...options
  }

  // Function
  const _shadowOpacity = React.useRef(new Animated.Value(1)).current
  const _removeDepth = () => {
    Animated.sequence([
      Animated.spring(_shadowOpacity, {
        toValue: 0,
        friction: _options.animatedFriction,
        tension: _options.animatedTension,
        velocity: 0.1,
        overshootClamping: true,
        useNativeDriver: true
      }),
      Animated.spring(_shadowOpacity, {
        toValue: 1,
        friction: _options.animatedFriction,
        tension: _options.animatedTension,
        velocity: 0.1,
        overshootClamping: true,
        useNativeDriver: true
      })
    ]).start()
  }

  const _styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: _options.buttonMargin,
      marginVertical: _options.buttonMargin,
      width: _options.size,
      maxWidth: _options.size,
      height: _options.size,
      maxHeight: _options.size,
      borderRadius: _options.borderRadius,
      backgroundColor: _options.backgroundColor
    },
    containerShadow: {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: _options.borderRadius,
      backgroundColor: _options.backgroundColor,
      shadowColor: 'rgba(14, 71, 116, 0.3)',
      shadowRadius: _options.shadowRadius,
      shadowOpacity: 1,
      shadowOffset: {
        width: 0,
        height: _options.shadowDepth
      }
    },
    badge: {
      position: 'absolute',
      top: -8,
      right: -12,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: _options.badgeColor
    },
    badgeText: {
      paddingHorizontal: 6,
      color: _options.badgeTextColor
    },
    buttonContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%'
    }
  })

  // Render
  return (
    <View
      testID={testID}
      style={[
        _styles.container,
        {
          elevation: 20,
          // iOS
          shadowColor: '#000000',
          shadowOpacity: 0.4,
          shadowRadius: 1,
          shadowOffset: {
            height: 1,
            width: 0
          },
        },
        style
      ]}>
      {/* FIXME: android elevation bug */}
      {Platform.OS === 'ios' && (
        <Animated.View
          style={[{ opacity: _shadowOpacity }, _styles.containerShadow]}
        />
      )}
      {!isNaN(badge) && badge > 0 && (
        <View style={_styles.badge}>
          <Text style={_styles.badgeText}>
            {badge < _options.maxBadgeValue
              ? badge
              : `+${_options.maxBadgeValue - 1}`}
          </Text>
        </View>
      )}
      <TouchableHighlight
        style={_styles.buttonContainer}
        underlayColor={_options.underlayColor}
        activeOpacity={_options.activeOpacity}
        onPressIn={!disable ? () => _removeDepth() : null}
        onPress={!disable ? onPress : null}>
        {children}
      </TouchableHighlight>
    </View>
  )
}

export default WsBadgeButton
