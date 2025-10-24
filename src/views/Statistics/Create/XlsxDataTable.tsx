import React, { forwardRef, memo, useMemo, useRef, useImperativeHandle } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Platform,
  ViewStyle,
} from 'react-native'

/* ===== Types ===== */
type RowData = { time: string; A?: string | number; B?: string | number }
export type SelectedCell = { seriesIndex: 0 | 1; dataIndex: number }

export type XlsxDataTableHandle = {
  /** 讓外層可捲到指定列（置中顯示） */
  scrollToRow: (index: number, animated?: boolean) => void
}

type Props = {
  rows: RowData[]
  headersOverride?: [string, string, string] | string[]
  showCheckbox?: boolean
  selectedRow?: number | null
  selectedRowColor?: string
  selected?: SelectedCell | null
  pressableColumns?: number[]
  onCellPress?: (rowIdx: number, colIdx: number, value: string | number | undefined) => void
  bodyTextAlign?: 'left' | 'center' | 'right'
  timeColTextAlign?: 'left' | 'center' | 'right'
  headerTextAlign?: 'left' | 'center' | 'right'
  zebra?: boolean
  /** 可用陣列 [w0,w1,w2]、或物件 {time,a,b}、或以 header 文字為 key 的物件 */
  columnWidth?: number[] | { time?: number; a?: number; b?: number } | Record<string, number>
  /** 讓呼叫端把表格撐滿高度：<XlsxDataTable style={{flex:1}} /> */
  style?: ViewStyle
}

/* ===== Const ===== */
const DEFAULT_HEADER: [string, string, string] = ['單位時間', 'A', 'B']
const ROW_HEIGHT = 40
const SEPARATOR_H = Platform.OS === 'android' ? StyleSheet.hairlineWidth || 0.5 : StyleSheet.hairlineWidth || 0.5

/* ===== Utils ===== */
const hexToRgba = (hex: string, alpha: number) => {
  const h = hex.replace('#', '')
  const to255 = (s: string) => parseInt(s.length === 1 ? s + s : s, 16)
  const r = to255(h.substring(0, h.length === 3 ? 1 : 2))
  const g = to255(h.substring(h.length === 3 ? 1 : 2, h.length === 3 ? 2 : 4))
  const b = to255(h.substring(h.length === 3 ? 2 : 4, h.length === 3 ? 3 : 6))
  return `rgba(${r},${g},${b},${alpha})`
}
const isColor = (s?: string) => !!s && (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s) || s.startsWith('rgb'))

function resolveWidths(
  headers: [string, string, string],
  columnWidth: number[] | { time?: number; a?: number; b?: number } | Record<string, number> | undefined,
  fallback: [number, number, number] = [180, 120, 120],
): [number, number, number] {
  if (!columnWidth) return fallback
  if (Array.isArray(columnWidth)) {
    return [
      Number(columnWidth[0] ?? fallback[0]),
      Number(columnWidth[1] ?? fallback[1]),
      Number(columnWidth[2] ?? fallback[2]),
    ]
  }
  const byKey = columnWidth as Record<string, number | undefined>
  const keyMap: Record<string, number | undefined> = {
    time: byKey.time,
    a: byKey.a,
    b: byKey.b,
    [headers[0]]: byKey[headers[0]],
    [headers[1]]: byKey[headers[1]],
    [headers[2]]: byKey[headers[2]],
  }
  return [
    Number(keyMap.time ?? keyMap[headers[0]] ?? fallback[0]),
    Number(keyMap.a ?? keyMap[headers[1]] ?? fallback[1]),
    Number(keyMap.b ?? keyMap[headers[2]] ?? fallback[2]),
  ]
}

/* ===== Row component ===== */
type RowProps = {
  rowIndex: number
  row: RowData
  widths: [number, number, number]
  showCheckbox: boolean
  zebra: boolean
  selectedRow?: number | null
  selectedRowColor?: string
  selected?: SelectedCell | null
  pressableColumns?: number[]
  onCellPress?: (rowIdx: number, colIdx: number, value: string | number | undefined) => void
  bodyTextAlign: 'left' | 'center' | 'right'
  timeColTextAlign: 'left' | 'center' | 'right'
}

const DataRow = memo(function DataRow(props: RowProps) {
  const {
    rowIndex, row, widths, showCheckbox, zebra,
    selectedRow, selectedRowColor, selected,
    pressableColumns, onCellPress, bodyTextAlign, timeColTextAlign,
  } = props

  const isSelectedRow = selectedRow != null && selectedRow === rowIndex
  const rowBG =
    isSelectedRow && selectedRowColor
      ? { backgroundColor: isColor(selectedRowColor) ? hexToRgba(selectedRowColor, 0.12) : hexToRgba('#2196f3', 0.12) }
      : zebra && rowIndex % 2 === 1
      ? styles.zebra
      : null

  const isSelectedCell = (colIdx: number) => {
    if (!selected) return false
    const { seriesIndex, dataIndex } = selected
    if (dataIndex !== rowIndex) return false
    const col = seriesIndex === 0 ? 1 : 2
    return col === colIdx
  }

  const cellBase = (colIdx: number) => [
    styles.cell,
    colIdx === 0 ? styles.bodyCellAlignStart : styles.bodyCellAlignCenter,
    { width: widths[colIdx], height: ROW_HEIGHT },
    colIdx === 0 ? styles.timeCell : null,
    isSelectedCell(colIdx) ? styles.cellSelected : null,
  ]

  const renderCell = (val: string | number | undefined, colIdx: number) => {
    const pressable = pressableColumns?.includes(colIdx)
    const content = (
      <Text
        numberOfLines={1}
        ellipsizeMode={colIdx === 0 ? 'clip' : 'tail'}
        style={[
          styles.text,
          { textAlign: colIdx === 0 ? (timeColTextAlign ?? 'left') : (bodyTextAlign ?? 'center') },
        ]}
      >
        {val == null ? '—' : String(val)}
      </Text>
    )
    if (pressable && onCellPress) {
      return (
        <TouchableOpacity activeOpacity={0.7} onPress={() => onCellPress(rowIndex, colIdx, val)} style={styles.pressableFill}>
          {content}
        </TouchableOpacity>
      )
    }
    return content
  }

  return (
    <View style={[styles.row, rowBG]}>
      {showCheckbox && <View style={[styles.checkboxBox]} />}
      <View style={cellBase(0)}>{renderCell(row.time, 0)}</View>
      <View style={cellBase(1)}>{renderCell(row.A, 1)}</View>
      <View style={cellBase(2)}>{renderCell(row.B, 2)}</View>
    </View>
  )
})

/* ===== Main ===== */
const XlsxDataTable = forwardRef<XlsxDataTableHandle, Props>(function XlsxDataTable(
  {
    rows,
    headersOverride,
    showCheckbox = false,
    selectedRow,
    selectedRowColor,
    selected,
    pressableColumns = [],
    onCellPress,
    bodyTextAlign = 'left',
    timeColTextAlign = 'left',
    headerTextAlign = 'left',
    zebra = true,
    columnWidth,
    style,
  },
  ref
) {
  const header = (headersOverride?.length === 3
    ? (headersOverride as [string, string, string])
    : DEFAULT_HEADER)

  const widths = useMemo<[number, number, number]>(() => resolveWidths(header, columnWidth, [180, 120, 120]), [header, columnWidth])

  const listRef = useRef<FlatList<RowData>>(null)
  useImperativeHandle(ref, () => ({
    scrollToRow: (index: number, animated = true) => {
      if (!listRef.current) return
      try {
        listRef.current.scrollToIndex({ index, animated, viewPosition: 0.5 })
      } catch {}
    },
  }))

  const renderHeader = () => (
    <View style={[styles.row, styles.headerRow]}>
      {showCheckbox && <View style={[styles.checkboxBox]} />}

      {/* 0: 單位時間 → 垂直置中 + 左對齊 */}
      <View style={[styles.cell, styles.headerCell, styles.headerCellAlignStart, { width: widths[0], height: ROW_HEIGHT }]}>
        <Text numberOfLines={1} ellipsizeMode="clip" style={[styles.headerText, { textAlign: 'left' }]}>
          {String(header[0])}
        </Text>
      </View>

      {/* 1: A → 置中 */}
      <View style={[styles.cell, styles.headerCell, styles.headerCellAlignCenter, { width: widths[1], height: ROW_HEIGHT }]}>
        <Text numberOfLines={1} ellipsizeMode="clip" style={[styles.headerText, { textAlign: headerTextAlign || 'center' }]}>
          {String(header[1])}
        </Text>
      </View>

      {/* 2: B → 置中 */}
      <View style={[styles.cell, styles.headerCell, styles.headerCellAlignCenter, { width: widths[2], height: ROW_HEIGHT }]}>
        <Text numberOfLines={1} ellipsizeMode="clip" style={[styles.headerText, { textAlign: headerTextAlign || 'center' }]}>
          {String(header[2])}
        </Text>
      </View>
    </View>
  )

  return (
    <View style={[{ flex: 1, minHeight: 0 }, style]}>
      {renderHeader()}
      <View style={styles.sep} />
      <FlatList
        ref={listRef}
        data={rows}
        keyExtractor={(_it, i) => String(i)}
        renderItem={({ item, index }) => (
          <View>
            <DataRow
              rowIndex={index}
              row={item}
              widths={widths}
              showCheckbox={showCheckbox}
              zebra={zebra}
              selectedRow={selectedRow}
              selectedRowColor={selectedRowColor}
              selected={selected}
              pressableColumns={pressableColumns}
              onCellPress={onCellPress}
              bodyTextAlign={'center'}
              timeColTextAlign={timeColTextAlign ?? 'left'}
            />
            <View style={styles.sep} />
          </View>
        )}
        getItemLayout={(_data, index) => ({
          length: ROW_HEIGHT + SEPARATOR_H,
          offset: (ROW_HEIGHT + SEPARATOR_H) * index,
          index,
        })}
        initialNumToRender={20}
        maxToRenderPerBatch={30}
        windowSize={10}
        removeClippedSubviews
        style={{ flex: 1 }}
        contentContainerStyle={{
          minWidth: widths[0] + widths[1] + widths[2] + (showCheckbox ? 44 : 0),
        }}
      />
    </View>
  )
})

/* ===== Styles ===== */
const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch', minHeight: ROW_HEIGHT },
  headerRow: {
    backgroundColor: '#F5F7FA',
    borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#E0E6ED',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E0E6ED',
  },
  zebra: { backgroundColor: '#FAFBFC' },
  sep: { height: SEPARATOR_H, backgroundColor: '#EEF2F7' },
  checkboxBox: {
    width: 44, alignItems: 'center', justifyContent: 'center',
    borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: '#E0E6ED',
  },

  // cell 容器（寬高靠 inline）
  cell: {
    paddingHorizontal: 12,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#E0E6ED',
  },

  // Header 對齊（時間欄垂直置中+左對齊、其他置中）
  headerCell: { paddingVertical: 10 },
  headerCellAlignStart: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCellAlignCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Body 對齊
  bodyCellAlignStart: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  bodyCellAlignCenter: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  timeCell: {},
  headerText: { fontSize: 13, fontWeight: '600', color: '#37474F' },
  text: { fontSize: 13, color: '#263238' },
  pressableFill: { flex: 1, justifyContent: 'center' },

  // 選中 cell 背景
  cellSelected: { backgroundColor: hexToRgba('#FF9800', 0.14) },
})

export default XlsxDataTable
