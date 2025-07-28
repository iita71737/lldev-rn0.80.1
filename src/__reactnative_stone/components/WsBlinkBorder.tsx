import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import $color from '@/__reactnative_stone/global/color'

const WsBlinkBorder = ({
  children,
  borderWidth = 2,
  style,
  animatedValue,
  guideline_id
}: {
  children: React.ReactNode;
  borderWidth?: number;
  style?: ViewStyle;
  animatedValue?: Animated.Value; 
  guideline_id?: string;// ✅ 注意這裡是 Animated.Value 型別
}) => {

  const animatedBorderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', $color.danger],
  });



  return (
    <Animated.View
      style={[
        styles.container,
        style,
        {
          borderColor: animatedBorderColor,
          borderWidth: borderWidth,
        }
      ]}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            animatedValue: animatedValue,
            guideline_id: guideline_id
          });
        }
        return child;
      })}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
  }
});

export default WsBlinkBorder;
