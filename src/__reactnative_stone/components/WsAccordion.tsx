// Accordion.tsx
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle, Easing } from 'react-native-reanimated';
import { WsText, WsIcon } from '@/components';
import $color from '@/__reactnative_stone/global/color';

type SectionProps = {
  title: React.ReactNode;          // 可放字串或自定義 JSX（例如「表3 名稱 / 公式名稱」）
  defaultOpen?: boolean;
  rightActions?: React.ReactNode;  // 右側操作區：編輯按鈕、警示角標等
  disabled?: boolean;
  children?: React.ReactNode;
  style?: any;
  contentStyle?: any;
};

export const WsAccordion: React.FC<SectionProps> = ({
  title,
  defaultOpen = false,
  rightActions,
  disabled,
  children,
  style,
  contentStyle,
}) => {
  const [measuredH, setMeasuredH] = React.useState(0);
  const [open, setOpen] = React.useState(defaultOpen);
  const progress = useSharedValue(defaultOpen ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [open]);

  const contentAnimated = useAnimatedStyle(() => ({
    height: measuredH * progress.value,
    opacity: progress.value === 0 ? 0 : progress.value, // 展開時淡入
  }));

  const arrowAnimated = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }], // 0→180
  }));

  return (
    <View style={[styles.section, style]}>
      <Pressable
        onPress={() => !disabled && setOpen(v => !v)}
        style={({ pressed }) => [
          styles.header,
          pressed && { opacity: 0.7 },
          disabled && { opacity: 0.5 },
        ]}
      >
        <View style={{ flex: 1, paddingRight: 8 }}>
          {typeof title === 'string' ? <WsText size={14} weight="600">{title}</WsText> : title}
        </View>

        {!!rightActions && <View style={{ marginRight: 8 }}>{rightActions}</View>}

        <Animated.View style={[arrowAnimated]}>
          <WsIcon name="md-chevron-down" size={16} color={$color.gray} />
        </Animated.View>
      </Pressable>

      {/* 量測內容高度（只量一次） */}
      <Animated.View style={[styles.contentContainer, contentAnimated, contentStyle]}>
        <View
          style={styles.contentInner}
          onLayout={e => {
            const h = e.nativeEvent.layout.height;
            if (h !== measuredH) setMeasuredH(h);
          }}
          pointerEvents={open ? 'auto' : 'none'}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    borderWidth: 1,
    borderColor: $color.graydd,
    borderRadius: 10,
    backgroundColor: $color.white,
    overflow: 'hidden',
  },
  header: {
    minHeight: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: $color.white,
  },
  contentContainer: {
    overflow: 'hidden',
  },
  contentInner: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 8,
    backgroundColor: $color.white2d
  },
});

export default WsAccordion;
