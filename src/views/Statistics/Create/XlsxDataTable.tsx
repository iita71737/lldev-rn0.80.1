import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Platform } from 'react-native';
import * as XLSX from 'xlsx';
import { ScrollView } from 'react-native-gesture-handler';

type Row = { time: string; A: number; B: number; C: number; D: number; result: number };

function makeMockRows(): Row[] {
  const base = new Date('2025-08-01T01:00:00');
  const pad = (n: number) => String(n).padStart(2, '0');
  return Array.from({ length: 400 }).map((_, i) => {
    const t = new Date(base.getTime() + i * 3600_000);
    const time = `${t.getFullYear()}/${pad(t.getMonth() + 1)}/${pad(t.getDate())} ${pad(t.getHours())}:00:00`;
    const A = i + 1, B = i + 2, C = i + 3, D = i + 4, result = A + B + C + D;
    return { time, A, B, C, D, result };
  });
}

function rowsToAoA(rows: Row[]) {
  const headers = ['紀錄時間', 'A 題目標題', 'B 題目標題', 'C 題目標題', 'D 題目標題', '公式結果'];
  const aoa: (string | number)[][] = [headers, ...rows.map(r => [r.time, r.A, r.B, r.C, r.D, r.result])];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  return XLSX.utils.sheet_to_json(ws, { header: 1 }) as (string | number)[][];
}

const ROW_HEIGHT = 44;
const TIME_SAMPLE = '2025/12/31 23:59:59'; // 估計最長的顯示樣本
const CELL_H_PADDING = 16; // styles.cell 的左右 padding 共 16

// DataRow
const DataRow = React.memo(function DataRow({
  row,
  widths,
  checked,
  onToggle,
  zebra,
  rowW,
}: {
  row: (string | number)[];
  widths: number[];
  checked: boolean;
  onToggle: () => void;
  zebra: boolean;
  rowW: number;
}) {
  return (
    <View style={[styles.row, zebra && styles.zebra, { width: rowW }]}>
      <TouchableOpacity onPress={onToggle} style={[styles.cell, styles.checkCell]}>
        <View style={styles.checkbox}>
          {checked && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>
      {row.map((val, i) => (
        <View key={i} style={[styles.cell, { width: widths[i] }]}>
          <Text
            numberOfLines={1}
            ellipsizeMode={i === 0 ? 'clip' : 'tail'} // 第 1 欄（紀錄時間）不顯示省略號
            style={[styles.text, checked && styles.strikeText]}
          >
            {String(val)}
          </Text>
        </View>
      ))}
    </View>
  );
});

export default function XlsxDataTable() {
  // 資料
  const rows = useMemo(() => makeMockRows(), []);
  const table = useMemo(() => rowsToAoA(rows), [rows]);
  const header = table[0] || [];
  const body = table.slice(1);

  // ✅ 紀錄時間欄位寬度：動態量測
  const [timeColWidth, setTimeColWidth] = useState<number>(240); // 初始先給一個安全值
  const onMeasureTime = useCallback((e: any) => {
    const w = Math.ceil(e?.nativeEvent?.lines?.[0]?.width ?? 0) + CELL_H_PADDING;
    if (w > 0 && Math.abs(w - timeColWidth) > 1) {
      setTimeColWidth(w);
    }
  }, [timeColWidth]);

  // 欄寬 & 總寬
  const checkColWidth = 44;
  const colWidths = useMemo(() => [220, 110, 110, 110, 110, 110], [timeColWidth]);
  const tableWidth = useMemo(
    () => checkColWidth + colWidths.reduce((a, b) => a + b, 0),
    [colWidths]
  );

  // 勾選
  const [checkedMap, setCheckedMap] = useState<Record<number, boolean>>({});
  const toggle = useCallback((idx: number) => {
    setCheckedMap(prev => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  // FlatList 設定
  const keyExtractor = useCallback((_: any, i: number) => String(i), []);
  const getItemLayout = useCallback((_data: any, index: number) => ({
    length: ROW_HEIGHT,
    offset: ROW_HEIGHT * index,
    index,
  }), []);

  return (
    <View style={styles.wrap}>
      {/* 🔍 隱藏量測：用最長樣本量出「紀錄時間」所需寬度 */}
      <View pointerEvents="none" style={styles.hiddenMeasure}>
        <Text style={styles.text} numberOfLines={1} onTextLayout={onMeasureTime}>
          {TIME_SAMPLE}
        </Text>
      </View>

      {/* 外層水平捲動 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        bounces={false}
        nestedScrollEnabled
        directionalLockEnabled
        {...(Platform.OS === 'android' ? { overScrollMode: 'auto' as any } : {})}
        scrollEventThrottle={16}
      >
        {/* 固定整表寬度 */}
        <View style={{ width: tableWidth }}>
          {/* Header */}
          <View style={[styles.row, styles.headerRow, { width: tableWidth }]}>
            <View style={[styles.cell, styles.headerCell, styles.checkCell]}>
              <Text style={styles.headerText}>✓</Text>
            </View>
            {header.map((h, i) => (
              <View key={`h-${i}`} style={[styles.cell, styles.headerCell, { width: colWidths[i] }]}>
                <Text numberOfLines={1} ellipsizeMode={i === 0 ? 'clip' : 'tail'} style={styles.headerText}>
                  {String(h)}
                </Text>
              </View>
            ))}
          </View>

          {/* Body */}
          <FlatList
            data={body}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            renderItem={({ item, index }: any) => (
              <DataRow
                row={item}
                widths={colWidths}
                checked={!!checkedMap[index]}
                onToggle={() => toggle(index)}
                zebra={index % 2 === 1}
                rowW={tableWidth}
              />
            )}
            initialNumToRender={20}
            maxToRenderPerBatch={20}
            updateCellsBatchingPeriod={40}
            windowSize={9}
            style={{ height: 440 }}
            nestedScrollEnabled
            showsVerticalScrollIndicator
            removeClippedSubviews={false}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={() => console.log('選取列：', Object.keys(checkedMap).filter(k => checkedMap[+k]))}
          style={styles.submitBtn}
        >
          <Text style={styles.submitTxt}>送出</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 12, backgroundColor: '#fff' },

  hiddenMeasure: {
    position: 'absolute',
    opacity: 0,
    // 避免佔位影響布局
    height: 0,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#cfd6e4',
    height: ROW_HEIGHT,
  },
  headerRow: { backgroundColor: '#eef3fb' },
  zebra: { backgroundColor: '#fafbfd' },

  cell: {
    paddingHorizontal: 8,           // ← 記得與 CELL_H_PADDING 一致
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: '#cfd6e4',
    height: ROW_HEIGHT,
  },
  checkCell: { width: 44, alignItems: 'center' },

  headerCell: {},
  headerText: { color: '#1a1a1a' },
  text: { color: '#1a1a1a' },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 2,
    borderColor: '#1a1a1a',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  checkMark: {
    fontSize: 12,
    lineHeight: 12,              // 避免基線偏移
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    ...Platform.select({
      android: {
        transform: [{ translateY: -0.5 }],
        textAlignVertical: 'center' as any,
      },
    }),
  },

  footer: { alignItems: 'flex-end', marginTop: 12 },
  submitBtn: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#1e88e5', borderRadius: 8 },
  submitTxt: { color: '#fff' },

  strikeText: {
    textDecorationLine: 'line-through',
    color: '#8e8e8e',
  },
});
