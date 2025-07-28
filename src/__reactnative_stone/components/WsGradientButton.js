import React, { useRef } from 'react'
import {
  StyleSheet,
  Animated,
  TouchableOpacity,
  View,
  Text,
  ActivityIndicator,
  Platform
} from 'react-native'
import $color from '@/__reactnative_stone/global/color'
import LinearGradient from 'react-native-linear-gradient'

const WsGradientButton = ({
  active,
  isLoading,
  children,
  renderLeadingIcon,
  renderTrailingIcon,
  onPress,
  stretch = false,
  style,
  options,
  borderRadius = 30,
  disabled,
  btnColor,
  textColor,
  borderColor,
  borderWidth = 0,
  testID
}) => {
  const _options = {
    borderWidth: borderWidth || 0,
    borderColor: borderColor || $color.primary,
    underlayColor: '#ffffff',
    activeOpacity: 0.8,
    linearGradientEnd: { x: 0.85, y: 1.5 },
    gradient: btnColor || [$color.primary5l, $color.primary],
    activeGradient: [$color.primary5l, $color.primary],
    onpressGradient: [$color.white2d, $color.white5d],
    disabledGradient: [$color.gray, $color.white5d],
    fixedWidth: null,
    buttonMargin: 8,
    borderRadius: borderRadius,
    fontSize: 14,
    fontColor: textColor || '#ffffff',
    fontMargin: 9,
    animatedFriction: 1,
    animatedTension: 50,
    contentFlex: 1,
    ...options
  }

  const _styles = StyleSheet.create({
    container: {
      overflow: 'hidden',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: _options.buttonMargin,
      width: _options.fixedWidth || undefined,
      borderRadius: _options.borderRadius,
      borderWidth: _options.borderWidth,
      borderColor: _options.borderColor,
      backgroundColor: 'transparent'
    },
    stretchContainer: {
      flex: 1
    },
    content: {
      flex: _options.contentFlex,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 7,
      paddingVertical: 10,
      width: _options.fixedWidth || undefined,
      // optional: 固定高度讓平台一致
      height: 50
    },
    gradientColor: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      borderRadius: _options.borderRadius
    },
    contentText: {
      marginHorizontal: _options.fontMargin,
      fontSize: _options.fontSize,
      color: _options.fontColor,
      lineHeight: Platform.OS === 'android' ? _options.fontSize + 4 : undefined, // 建議比 fontSize 多 3~4px
      // lineHeight: 50, // ⬅️ 改為跟 container 高度一致
      // height: 50,     // ⬅️ 同上
      textAlign: 'center',
      letterSpacing: Platform.OS === 'android' ? 0.5 : 1,

      // iOS 額外微調：上下置中
      paddingTop: Platform.OS === 'ios' ? 5 : 0,
      paddingBottom: Platform.OS === 'ios' ? 5 : 0,

      // Android 額外控制
      ...(Platform.OS === 'android' && {
        includeFontPadding: false,
        textAlignVertical: 'center',
      }),
    },
    textWrapper: {
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    },
    loadingIndicator: {
      width: 20,
      height: 20
    }
  })

  const gradientColorOpacity = useRef(new Animated.Value(1)).current

  const _animatedIn = () => {
    Animated.sequence([
      Animated.spring(gradientColorOpacity, {
        toValue: 1,
        friction: _options.animatedFriction,
        tension: _options.animatedTension,
        velocity: 0.1,
        useNativeDriver: true
      }),
      Animated.spring(gradientColorOpacity, {
        toValue: 0,
        friction: _options.animatedFriction,
        tension: _options.animatedTension,
        velocity: 0.1,
        useNativeDriver: true
      })
    ]).start()
  }

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        _styles.container,
        stretch && _styles.stretchContainer,
        style
      ]}
      activeOpacity={_options.activeOpacity}
      disabled={disabled}
      onPressIn={!disabled ? _animatedIn : undefined}
      onPress={!disabled ? onPress : undefined}
    >
      <LinearGradient
        style={_styles.gradientColor}
        start={{ x: 0, y: 0 }}
        end={_options.linearGradientEnd}
        colors={
          disabled
            ? _options.disabledGradient
            : active
              ? _options.onpressGradient
              : _options.gradient
        }
      />
      <Animated.View
        style={[_styles.gradientColor, { opacity: gradientColorOpacity }]}
      >
        <LinearGradient
          style={_styles.gradientColor}
          start={{ x: 0, y: 0 }}
          end={_options.linearGradientEnd}
          colors={_options.gradient}
        />
      </Animated.View>

      <View style={_styles.content}>
        {!isLoading && renderLeadingIcon && renderLeadingIcon()}
        {!isLoading && (
          <View style={_styles.textWrapper}>
            <Text style={_styles.contentText}>{children}</Text>
          </View>
        )}
        {!isLoading && renderTrailingIcon && renderTrailingIcon()}
        {isLoading && (
          <ActivityIndicator
            color="#ffffff"
            style={_styles.loadingIndicator}
          />
        )}
      </View>
    </TouchableOpacity>
  )
}

export default WsGradientButton
