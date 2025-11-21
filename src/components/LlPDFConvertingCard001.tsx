import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

type Props = {
  typeLabel?: string;   // 左上角小字，預設 "PDF"
  statusText?: string;  // 中間文字，預設 "轉檔中"
};

const LlPDFConvertingCard001: React.FC<Props> = ({
  typeLabel = 'PDF',
  statusText = '轉檔中...',
}) => {
  return (
    <View style={styles.wrapper}>

      {/* 卡片本體 */}
      <View style={styles.card}>
        <Text style={styles.typeLabel}>{typeLabel}</Text>
        <View style={styles.centerContent}>
          <Text style={styles.statusText}>{statusText}</Text>
        </View>
      </View>
    </View>
  );
};

const CARD_WIDTH = 286
const CARD_HEIGHT = 72;

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    paddingHorizontal: 16,
    paddingBottom: 12,
    justifyContent: 'flex-start',
    paddingTop: 8,
    backgroundColor: '#ffffffff',
  },
  typeLabel: {
    fontSize: 12,
    color: '#9e9e9e',
  },
  centerContent: {
    top: -8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 18,
    color: '#b0b0b0',
  },
});

export default LlPDFConvertingCard001;
