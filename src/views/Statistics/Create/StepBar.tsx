// StepBar.tsx
import React from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';

type Step = { key: string; label: string };

type Props = {
  steps: Step[];
  currentIndex?: number;
  orientation?: 'auto' | 'row' | 'column';   // 預設 auto：空間不足就改 column
  minItemWidth?: number;                      // 估算用的最小步驟寬
  connectorWidth?: number;                    // 橫向連接器寬
};

export default function StepBar({
  steps,
  currentIndex = 0,
  orientation = 'auto',
  minItemWidth = 120,
  connectorWidth = 18,
}: Props) {
  const [containerW, setContainerW] = React.useState(0);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w !== containerW) setContainerW(w);
  };

  // 粗略估算每個 step 需要的寬度（用字元數推估）
  const estimateStepWidth = (label: string) => {
    const avgChar = 8; // 14px 字體大約 8dp/字
    const textW = Math.min(label.length * avgChar, 220);
    return Math.max(minItemWidth, textW + 24); // 24 為左右內距
  };

  const neededW =
    steps.reduce((sum, s) => sum + estimateStepWidth(s.label), 0) +
    (steps.length - 1) * (connectorWidth + 12) + // 12 為步驟左右外距
    24; // wrap 內距

  const isColumn =
    orientation === 'column' ||
    (orientation === 'auto' && containerW > 0 && neededW > containerW);

  return (
    <View onLayout={onLayout} style={[styles.wrap, isColumn ? styles.wrapCol : styles.wrapRow]}>
      {steps.map((s, i) => {
        const active = i <= currentIndex;

        const StepBox = (
          <View
            key={`step-${s.key}`}
            style={[
              styles.stepBox,
              active && styles.stepBoxActive,
              isColumn ? styles.stepBoxCol : styles.stepBoxRow,
            ]}
          >
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={[styles.stepText, active && styles.stepTextActive]}
            >
              {s.label}
            </Text>
          </View>
        );

        const Connector =
          i < steps.length - 1 ? (
            isColumn ? (
              <View key={`con-${i}`} style={styles.connectorV}>
                <View style={styles.lineV} />
                <View style={styles.arrowV} />
              </View>
            ) : (
              <View key={`con-${i}`} style={[styles.connectorH, { width: connectorWidth }]}>
                <View style={styles.lineH} />
                <View style={styles.arrowH} />
              </View>
            )
          ) : null;

        return isColumn ? (
          <React.Fragment key={s.key}>
            {StepBox}
            {Connector}
          </React.Fragment>
        ) : (
          <React.Fragment key={s.key}>
            {StepBox}
            {Connector}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#CFCFD6',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  wrapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wrapCol: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },

  // step 盒
  stepBox: {
    borderWidth: 1,
    borderColor: '#A9B1C6',
    borderRadius: 6,
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  stepBoxRow: {
    flex: 1,
    minWidth: 0, // 允許文字被截斷
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 6,
  },
  stepBoxCol: {
    width: '100%',
    marginVertical: 6,
  },
  stepBoxActive: { borderColor: '#FF8A3D' },
  stepText: { color: '#222', fontSize: 14 },
  stepTextActive: { color: '#FF8A3D', fontWeight: '700' },

  // 橫向連接器
  connectorH: {
    height: 10,
    marginHorizontal: 2,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  lineH: { position: 'absolute', height: 2, left: 0, right: 0, backgroundColor: '#888' },
  arrowH: {
    width: 0, height: 0,
    borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 8,
    borderTopColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: '#888',
    alignSelf: 'flex-end',
  },

  // 縱向連接器（向下箭頭）
  connectorV: {
    width: '100%',
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  lineV: { position: 'absolute', width: 2, top: 0, bottom: 0, backgroundColor: '#888' },
  arrowV: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#888',
    alignSelf: 'center',
  },
});
