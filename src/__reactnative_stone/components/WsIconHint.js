import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { WsIcon } from '@/components';
import $color from '@/__reactnative_stone/global/color';

const WsIconHint = (props) => {
  const {
    name = 'md-arrow-back',
    size = 32,
    color = $color.danger,
    style,
    rotate = '0deg',
    animatedValue
  } = props;

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center' }, style]}>
      <Animated.View style={{ opacity: animatedValue }}>
        <WsIcon name={name} size={size} color={color} />
      </Animated.View>
    </View>
  );
};

export default WsIconHint;
