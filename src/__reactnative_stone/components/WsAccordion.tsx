// Accordion.tsx
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedStyle,
  Easing,
  LinearTransition,
} from 'react-native-reanimated';
import { WsText, WsIcon } from '@/components';
import $color from '@/__reactnative_stone/global/color';

type SectionProps = {
  title: React.ReactNode;
  defaultOpen?: boolean;
  rightActions?: React.ReactNode;
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
  const [open, setOpen] = React.useState(defaultOpen);
  const progress = useSharedValue(defaultOpen ? 1 : 0);

  React.useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [open]);

  // 只做透明度/箭頭旋轉的補間；高度交給 Layout 動畫處理
  const contentFade = useAnimatedStyle(() => ({
    opacity: progress.value === 0 ? 0 : progress.value,
  }));

  const arrowAnimated = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
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

        <Animated.View style={arrowAnimated}>
          <WsIcon name="md-chevron-down" size={16} color={$color.gray} />
        </Animated.View>
      </Pressable>

      {/* 高度用 Layout 動畫；關閉時給 height:0，開啟時移除 height 限制 */}
      <Animated.View
        layout={LinearTransition.duration(220).easing(Easing.out(Easing.cubic))}
        style={[
          styles.contentContainer,
          !open && styles.collapsed,  // 關閉時 height: 0（會動畫）
          contentFade,
          contentStyle,
        ]}
      >
        {/* 內容一直存在，關閉時用高度裁切 + 停用觸控 */}
        <View
          style={styles.contentInner}
          pointerEvents={open ? 'auto' : 'none'}
          collapsable={false}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: $color.white2d,
    borderRadius: 10,
    backgroundColor: $color.white,
    overflow: 'hidden', // 需要保留：收合時裁切內容
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
  collapsed: {
    height: 0, // 交給 Layout 動畫從 0 ↔ 自然高度
  },
  contentInner: {
    paddingHorizontal: 12,
    paddingBottom: 12,
    paddingTop: 8,
    backgroundColor: $color.white2d,
  },
});

export default WsAccordion;
