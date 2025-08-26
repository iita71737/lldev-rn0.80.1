// StepBar.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  LayoutChangeEvent,
  Pressable,
} from 'react-native';

export type Step = { key: string; label: string };

type Props = {
  steps: Step[];
  /** 0-based，目前所在步（<= index 視為 active） */
  currentIndex: number;
  onStepPress?: (index: number) => void;

  /** 視覺細節（可不傳，用預設） */
  height?: number;       // 整體高度
  trackHeight?: number;  // 中央線粗細
  dotSize?: number;      // 圓點大小
  gap?: number;          // 圓點與標籤的距離
  leftMargin?: number;
  rightMargin?: number;
};

export default function StepBar({
  steps,
  currentIndex,
  onStepPress,
  height = 44,
  trackHeight = 2,
  dotSize = 22,
  gap = 10,
  leftMargin = 8,
  rightMargin = 8,
}: Props) {
  const N = steps.length;
  const r = dotSize / 2;

  const [barW, setBarW] = React.useState(0);
  const [labelWs, setLabelWs] = React.useState<number[]>(
    Array(N).fill(0)
  );

  const onBarLayout = (e: LayoutChangeEvent) => {
    setBarW(e.nativeEvent.layout.width);
  };

  // 先用預估寬度，等實際量到後再重算一次位置，避免一開始重疊
  const fallbackLW = 120;
  const lwLast = labelWs[N - 1] || fallbackLW;

  // 第一顆圓點中心位置（預留左邊距與半徑）
  const startX = r + leftMargin;
  // 最後一顆圓點中心位置（預留右邊標籤寬、半徑、gap 與邊距）
  const endX = Math.max(
    startX,
    barW - (lwLast + r + gap + rightMargin)
  );

  // 各圓點中心 X，均分於 startX → endX
  const nodeX = React.useMemo(() => {
    if (barW === 0 || N === 0) return [];
    if (N === 1) return [startX];
    return steps.map((_, i) => startX + ((endX - startX) * i) / (N - 1));
  }, [barW, N, steps, startX, endX]);

  // 量測各標籤寬度
  const setLabelW = (i: number, w: number) => {
    setLabelWs(prev => {
      if (prev[i] === w) return prev;
      const next = [...prev];
      next[i] = w;
      return next;
    });
  };

  // 一律把標籤放在圓點右側，並做邊界保護
  const labelLeft = (i: number) => {
    const x = nodeX[i] ?? 0;
    const lw = labelWs[i] || fallbackLW;
    const desired = x + r + gap;
    return clamp(desired, leftMargin, Math.max(leftMargin, barW - lw - rightMargin));
  };

  const trackY = height / 2 - trackHeight / 2;

  return (
    <View style={[styles.wrap, { height }]}>
      <View style={styles.bar} onLayout={onBarLayout}>
        {/* 背景線（淡灰） */}
        <View style={[styles.track, { top: trackY, height: trackHeight }]} />

        {/* 圓點（數字在左） */}
        {steps.map((s, i) => {
          const active = i <= currentIndex;
          const bg = active ? '#1e88e5' : '#9e9e9e';
          const x = nodeX[i] ?? 0;
          return (
            <Pressable
              key={s.key}
              onPress={() => onStepPress?.(i)}
              hitSlop={8}
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  left: x - r,
                  top: height / 2 - r,
                  backgroundColor: bg,
                },
              ]}
            >
              <Text style={styles.dotText}>{i + 1}</Text>
            </Pressable>
          );
        })}

        {/* 標籤（白底黑框 2px，置於圓點右側） */}
        {steps.map((s, i) => (
          <View
            key={`${s.key}-label`}
            onLayout={e => setLabelW(i, e.nativeEvent.layout.width)}
            pointerEvents="none"
            style={[
              styles.labelBox,
              {
                left: labelLeft(i),
                top: height / 2 - 18, // label 高約 36
                maxWidth: Math.max(80, barW * 0.7), // 保護別太長
              },
            ]}
          >
            <Text style={styles.labelTxt} numberOfLines={1}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function clamp(v: number, min: number, max: number) {
  'worklet'; // 安心在 RN 新架構下也能 inline
  return Math.max(min, Math.min(v, max));
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    justifyContent: 'center',
  },
  bar: {
    flex: 1,
    justifyContent: 'center',
  },
  track: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#e6ebf1',
    borderRadius: 999,
    zIndex: 0,
  },
  dot: {
    position: 'absolute',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 2,       // 圓點在上層
    elevation: 2,    // Android 陰影/層級
  },
  dotText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
  labelBox: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#111',
    borderRadius: 4,
    zIndex: 1,       // 標籤在圓點下層
  },
  labelTxt: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111',
  },
});
