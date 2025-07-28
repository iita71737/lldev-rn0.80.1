import React, { useRef, useEffect } from 'react';
import { Animated, Easing, View, StyleSheet, Dimensions } from 'react-native';
import {
  WsEmpty,
  WsText,
  WsLoading,
  WsSkeleton,
  WsIcon,
} from '@/components'

const { width } = Dimensions.get('window');

const WsIconBouncingArrow = () => {
  const bounceValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 定義 bounce 動畫序列
    const bounceAnimation = Animated.loop(
      Animated.sequence([
        // 起始0 - 40%: 向上移動30px
        Animated.timing(bounceValue, {
          toValue: -30,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // 40%-50%: 回到原位
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        // 50%-60%: 再稍微向上移動15px
        Animated.timing(bounceValue, {
          toValue: -15,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        // 60%-100%: 再回到原位
        Animated.timing(bounceValue, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    bounceAnimation.start();

    // 可選：停止動畫時返回清理函式
    return () => bounceAnimation.stop();
  }, [bounceValue]);

  return (
    <View style={styles.container}>
      <Animated.View style={{ transform: [{ translateY: bounceValue }] }}>
        <WsIcon name="bih-chevron-down" size={36} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // 模擬 CSS 中 .arrow { text-align: center; margin: 8% 0; }
    alignItems: 'center',
    marginVertical: '8%',
  },
  // 背景色可在外層或其他容器中設定
  background: {
    backgroundColor: '#2d2d37',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default WsIconBouncingArrow;
