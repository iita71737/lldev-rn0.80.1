import React, {
  useMemo,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useRef,
  useEffect,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import * as XLSX from 'xlsx';
import { ScrollView } from 'react-native-gesture-handler';

type Row = { time: string; A: number; B: number; C: number; D: number; result: number };

function makeMockRows(): Row[] {
  const base = new Date('2025-08-01T01:00:00');
  const pad = (n: number) => String(n).padStart(2, '0');
  return Array.from({ length: 20 }).map((_, i) => {
    const t = new Date(base.getTime() + i * 3600_000);
    const time = `${t.getFullYear()}/${pad(t.getMonth() + 1)}/${pad(t.getDate())} ${pad(t.getHours())}:00:00`;
    const A = i + 1,
      B = i + 2,
      C = i + 3,
      D = i + 4,
      result = A + B + C + D;
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
const TIME_SAMPLE = '2025/12/31 23:59:59';
const CELL_H_PADDING = 16;
const CHECK_COL_W = 44;

type XlsxDataTableProps = {
  onCellLayout?: (
    seriesIndex: 0 | 1,
    dataIndex: number,
    layout: { x: number; y: number; width: number; height: number }
  ) => void;
  onContentMeasure?: (abs: { x: number; y: number }) => void;
  onScrollOffsets?: (offsets: { scrollX: number; scrollY: number }) => void;
  selected?: { seriesIndex: 0 | 1; dataIndex: number } | null;
  selectedRow?: number | null;
  selectedRowColor?: string;
};

type DataRowProps = {
  row: (string | number)[];
  widths: number[];
  checked: boolean;
  onToggle: () => void;
  zebra: boolean;
  rowW: number;
  index: number;
  onCellLayout?: XlsxDataTableProps['onCellLayout'];
  selected?: XlsxDataTableProps['selected'];
  selectedRow?: number | null;
  selectedRowColor?: string;
};

function toRGBA(color: string, alpha: number) {
  if (color.startsWith('rgba')) return color.replace(/rgba\(([^)]+),\s*[\d.]+\)/, `rgba($1, ${alpha})`);
  if (color.startsWith('rgb(')) return color.replace('rgb(', 'rgba(').replace(')', `, ${alpha})`);
  const h = color.replace('#', '');
  const r = parseInt(h.length === 3 ? h[0] + h[0] : h.slice(0, 2), 16);
  const g = parseInt(h.length === 3 ? h[1] + h[1] : h.slice(2, 4), 16);
  const b = parseInt(h.length === 3 ? h[2] + h[2] : h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const DataRow = React.memo(function DataRow({
  row,
  widths,
  checked,
  onToggle,
  zebra,
  rowW,
  index,
  onCellLayout,
  selected,
  selectedRow,
  selectedRowColor,
}: DataRowProps) {
  const isRowSelected = selectedRow === index;
  const rowBG =
    isRowSelected && selectedRowColor
      ? { backgroundColor: toRGBA(selectedRowColor, 0.25) }
      : null;

  return (
    <View
      style={[
        styles.row,
        zebra && styles.zebra,
        rowBG,
        { width: rowW },
      ]}
    >
      <TouchableOpacity onPress={onToggle} style={[styles.cell, styles.checkCell]}>
        <View style={styles.checkbox}>
          {checked && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>

      {row.map((val, i) => {
        const isA = i === 1;
        const isB = i === 2;
        const isCellSelected =
          (selected?.seriesIndex === 0 && isA && selected?.dataIndex === index) ||
          (selected?.seriesIndex === 1 && isB && selected?.dataIndex === index);

        const cellBG =
          isCellSelected && selectedRowColor
            ? { backgroundColor: toRGBA(selectedRowColor, 0.5) }
            : (isCellSelected ? styles.cellSelected : null);

        return (
          <View
            key={i}
            style={[
              styles.cell,
              { width: widths[i] },
              cellBG,
            ]}
            onLayout={
              (isA || isB)
                ? (e) => onCellLayout?.(isA ? 0 : 1, index, e.nativeEvent.layout)
                : undefined
            }
          >
            <Text
              numberOfLines={1}
              ellipsizeMode={i === 0 ? 'clip' : 'tail'}
              style={[
                styles.text,
                checked && styles.strikeText, // ✅ 勾選後整列加刪除線
              ]}
            >
              {String(val)}
            </Text>
          </View>
        );
      })}
    </View>
  );
});

const XlsxDataTable = forwardRef<View, XlsxDataTableProps>(function XlsxDataTable(
  { onCellLayout, onContentMeasure, onScrollOffsets, selected, selectedRow, selectedRowColor },
  ref
) {
  const rows = useMemo(() => makeMockRows(), []);
  const table = useMemo(() => rowsToAoA(rows), [rows]);
  const header = table[0] || [];
  const body = table.slice(1);

  const [timeColWidth, setTimeColWidth] = useState<number>(240);
  const onMeasureTime = useCallback((e: any) => {
    const w = Math.ceil(e?.nativeEvent?.lines?.[0]?.width ?? 0) + CELL_H_PADDING;
    if (w > 0 && Math.abs(w - timeColWidth) > 1) setTimeColWidth(w);
  }, [timeColWidth]);

  const colWidths = useMemo(() => [timeColWidth, 110, 110, 110, 110, 110], [timeColWidth]);
  const tableWidth = useMemo(() => CHECK_COL_W + colWidths.reduce((a, b) => a + b, 0), [colWidths]);

  const [checkedMap, setCheckedMap] = useState<Record<number, boolean>>({});
  const toggle = useCallback((idx: number) => setCheckedMap(p => ({ ...p, [idx]: !p[idx] })), []);

  const keyExtractor = useCallback((_: any, i: number) => String(i), []);
  const getItemLayout = useCallback(
    (_data: any, index: number) => ({ length: ROW_HEIGHT, offset: ROW_HEIGHT * index, index }),
    []
  );

  const wrapRef = useRef<View>(null);
  useImperativeHandle(ref, () => wrapRef.current as View);

  const contentRef = useRef<View>(null);
  const onContentLayout = useCallback(() => {
    if (!contentRef.current) return;
    (contentRef.current as any).measureInWindow?.((x: number, y: number) => {
      onContentMeasure?.({ x, y });
    });
  }, [onContentMeasure]);

  const onHScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScrollOffsets?.({ scrollX: e.nativeEvent.contentOffset.x, scrollY: 0 });
    },
    [onScrollOffsets]
  );
  const onVScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      onScrollOffsets?.({ scrollX: 0, scrollY: e.nativeEvent.contentOffset.y });
    },
    [onScrollOffsets]
  );

  const listRef = useRef<FlatList>(null);
  useEffect(() => {
    if (selectedRow == null) return;
    listRef.current?.scrollToIndex({
      index: Math.max(0, Math.min(selectedRow, body.length - 1)),
      animated: true,
      viewOffset: 2 * ROW_HEIGHT,
    });
  }, [selectedRow, body.length]);

  return (
    <View ref={wrapRef} style={styles.wrap}>
      <View pointerEvents="none" style={styles.hiddenMeasure}>
        <Text style={styles.text} numberOfLines={1} onTextLayout={onMeasureTime}>
          {TIME_SAMPLE}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator
        bounces={false}
        nestedScrollEnabled
        directionalLockEnabled
        onScroll={onHScroll}
        scrollEventThrottle={16}
      >
        <View ref={contentRef} onLayout={onContentLayout} style={{ width: tableWidth }}>
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

          <FlatList
            ref={listRef}
            data={body}
            keyExtractor={keyExtractor}
            getItemLayout={getItemLayout}
            renderItem={({ item, index }) => (
              <DataRow
                row={item}
                widths={colWidths}
                checked={!!checkedMap[index]}
                onToggle={() => toggle(index)}
                zebra={index % 2 === 1}
                rowW={tableWidth}
                index={index}
                onCellLayout={onCellLayout}
                selected={selected}
                selectedRow={selectedRow}
                selectedRowColor={selectedRowColor}
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
            onScroll={onVScroll}
            scrollEventThrottle={16}
          />
        </View>
      </ScrollView>
    </View>
  );
});

export default XlsxDataTable;

const styles = StyleSheet.create({
  wrap: { padding: 12, backgroundColor: '#fff' },
  hiddenMeasure: { position: 'absolute', opacity: 0, height: 0, overflow: 'hidden' },

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
    paddingHorizontal: 8,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderColor: '#cfd6e4',
    height: ROW_HEIGHT,
  },
  cellSelected: { backgroundColor: 'rgba(255, 214, 102, 0.35)' },

  checkCell: { width: CHECK_COL_W, alignItems: 'center' },

  headerCell: {},
  headerText: { color: '#1a1a1a' },
  text: { color: '#1a1a1a' },

  /** 勾選 → 整列刪除線 */
  strikeText: {
    textDecorationLine: 'line-through',
    color: '#8e8e8e',
  },

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
    lineHeight: 12,
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    ...Platform.select({
      android: { transform: [{ translateY: -0.5 }], textAlignVertical: 'center' as any },
    }),
  },
});
