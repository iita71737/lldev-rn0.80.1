// SingleChartTrace.tsx
import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import {
  View,
  useWindowDimensions,
  Pressable,
  LayoutChangeEvent,
  findNodeHandle,
  UIManager,
  StyleSheet,
} from 'react-native'
import * as echarts from 'echarts/core'
import { LineChart as ELineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { SkiaRenderer, SkiaChart } from '@wuba/react-native-echarts'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import XlsxDataTable, { XlsxDataTableHandle } from './Create/XlsxDataTable'
import { WsPaddingContainer, WsModal } from '@/components'
import { ScrollView } from 'react-native-gesture-handler'

// (可移除) 教學導覽：若沒用到可整段去掉
import { useCopilot, CopilotStep, walkthroughable } from 'react-native-copilot'
const WView = walkthroughable(View)

import Svg, { Defs, Mask, Rect, Circle, Line } from 'react-native-svg'

echarts.use([SkiaRenderer, ELineChart, BarChart, GridComponent, TooltipComponent, LegendComponent])

/* ---------------- Consts ---------------- */
const MASK_RADIUS = 24
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max))
const ROW_HEIGHT = 40
const SEP_H = StyleSheet.hairlineWidth || 0.5
const ITEM_H = ROW_HEIGHT + SEP_H

type SpotState = { x: number; y: number; dataIndex: number; seriesIndex: number; xLabel?: string } | null
type TimeUnit = 'day' | 'week' | 'month' | 'season' | 'year'

type Props = {
  labels?: string[]
  dsA?: number[]   // 外層：% ；內層：分子(件)
  dsB?: number[]   // 外層：% ；內層：母體(件)
  seriesNames?: { a?: string; b?: string }
  initialSelected?: { seriesIndex: 0 | 1; dataIndex: number } | null
  timeUnit?: TimeUnit
  baseYear?: number
  allowDrilldown?: boolean               // 外層 true；內層 false
  yIsPercent?: boolean                   // 外層 true；內層 false
  chartHeight?: number                   // 未提供時：外層 300、內層 220
}

/* ---------------- Utils ---------------- */
const pad2 = (n: number) => String(n).padStart(2, '0')
const looksLikeMonthly = (labels: string[] = []) =>
  !!labels.length &&
  (/^(\d{1,2})\s*月$/.test(String(labels[0])) ||
    /^\d{4}[/-](\d{1,2})$/.test(String(labels[0])) ||
    /^\d{4}年(\d{1,2})月$/.test(String(labels[0])) ||
    /^\d{4}-\d{2}$/.test(String(labels[0])))

const toYm = (label: string, y: number) => {
  const s = String(label).trim()
  if (/^\d{4}-\d{2}$/.test(s)) return s
  let m = s.match(/^(\d{4})\/(\d{1,2})$/); if (m) return `${m[1]}-${pad2(+m[2])}`
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s.slice(0, 7)
  m = s.match(/^(\d{4})年(\d{1,2})月$/); if (m) return `${m[1]}-${pad2(+m[2])}`
  const m2 = s.match(/^(\d{1,2})\s*月$/); if (m2) return `${y}-${pad2(+m2[1])}`
  return s
}
const daysInMonth = (ym: string) => { const [Y, M] = ym.split('-').map(Number); return new Date(Y, M, 0).getDate() }
const makeMonthDays = (ym: string) => { const n = daysInMonth(ym); const [y, m] = ym.split('-'); return Array.from({ length: n }, (_, i) => `${y}-${m}-${pad2(i + 1)}`) }
const toDD = (s: string) => (s.match(/^\d{4}-\d{2}-(\d{2})$/)?.[1] ?? s.slice(-2))

/** 由外層滾動率% → 內層每日「分子/分母件數」示意資料 */
function buildChildDataFromParent(
  seriesIndex: 0 | 1,
  dataIndex: number,
  outerLabels: string[],
  outerA: number[],
  outerB: number[],
) {
  const ym = toYm(outerLabels[dataIndex], new Date().getFullYear())
  const ratePct = (seriesIndex === 0 ? outerA[dataIndex] : outerB[dataIndex]) ?? 0
  const rate = Math.max(0, ratePct) / 100
  const baseMin = seriesIndex === 0 ? 5000 : 1500
  const baseMax = seriesIndex === 0 ? 12000 : 6000
  const seed = (dataIndex + 1) * (seriesIndex === 0 ? 997 : 883)
  const rnd = (lo: number, hi: number) => { const x = Math.sin(seed) * 10000; const u = x - Math.floor(x); return Math.round(lo + (hi - lo) * u) }
  const denominatorMonthly = rnd(baseMin, baseMax)
  const numeratorMonthly = Math.round(denominatorMonthly * rate)
  const days = makeMonthDays(ym); const D = days.length
  const denominatorPerDay = Math.round(denominatorMonthly / D)
  const weights = days.map((_, idx) =>
    (idx % 7 === 0 || (idx + 1) % 7 === 0 ? 0.88 : 1.1) * (1 + 0.08 * Math.sin((Math.PI * (idx + 1)) / D)))
  const sumW = weights.reduce((a, b) => a + b, 0)
  let nums = weights.map(w => Math.round((w / sumW) * numeratorMonthly))
  const diff = numeratorMonthly - nums.reduce((a, b) => a + b, 0)
  for (let i = 0; i < Math.abs(diff); i++) { const k = i % D; nums[k] += diff > 0 ? 1 : -1; if (nums[k] < 0) nums[k] = 0 }
  return { labels: days, dsA: nums, dsB: Array(D).fill(denominatorPerDay), titleSuffix: `${ym}（外層 ${seriesIndex === 0 ? 'M0→M1' : 'M1→M2'} = ${ratePct.toFixed(2)}%）` }
}

/* ---------------- Component ---------------- */
export default function SingleChartTrace({
  labels: labelsProp,
  dsA: dsAProp,
  dsB: dsBProp,
  seriesNames,
  initialSelected,
  timeUnit,
  baseYear,
  allowDrilldown = true,
  yIsPercent = true,
  chartHeight,
}: Props) {
  const { t } = useTranslation()
  const { width: winW } = useWindowDimensions()

  // 外層垂直 ScrollView（用來程式化捲動到對應列）
  const outerScrollRef = useRef<ScrollView>(null)

  // 圖表高度：外層 300、內層 220；可由 prop 覆寫
  const chartH = chartHeight ?? (allowDrilldown ? 300 : 220)

  const chartRef = useRef<any>(null)
  const chartBoxRef = useRef<View>(null)
  const instRef = useRef<echarts.EChartsType | null>(null)
  const tableRef = useRef<XlsxDataTableHandle>(null) // 可選：若你想保留 API

  const [selectedRow, setSelectedRow] = useState<number | null>(null)
  const [selectedRowColor, setSelectedRowColor] = useState<string | null>(null)
  const { start } = useCopilot() // 可移除
  const [spot, setSpot] = useState<SpotState>(null)

  // 量測圖表容器（供 spotlight 遮罩使用；與 tooltip 夾邊界——雖然已不用客製 tooltip）
  const [box, setBox] = useState<{ x: number; y: number; w: number; h: number }>({ x: 0, y: 0, w: winW, h: chartH })
  const onChartBoxLayout = useCallback((e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout
    const node = findNodeHandle(chartBoxRef.current)
    if (node) {
      UIManager.measureInWindow(node, (x, y) => setBox({ x, y, w: width || winW, h: chartH }))
    } else {
      setBox({ x: 0, y: 0, w: winW, h: chartH })
    }
  }, [winW, chartH])

  // 第二層
  const [drillModalOpen, setDrillModalOpen] = useState(false)
  const [childData, setChildData] = useState<{
    labels: string[]
    dsA: number[]
    dsB: number[]
    initialSelected: { seriesIndex: 0 | 1; dataIndex: number } | null
    titleSuffix?: string
  } | null>(null)

  // 預設外層資料（月份、百分比）
  const defaultLabels = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
  const defaultA = [2.1, 2.4, 2.0, 2.6, 2.9, 3.1, 2.8, 3.0, 3.3, 3.2, 3.4, 3.1]
  const defaultB = [0.9, 1.1, 1.0, 1.2, 1.4, 1.6, 1.3, 1.5, 1.7, 1.6, 1.8, 1.7]

  const labels = useMemo(() => (labelsProp?.length ? labelsProp : defaultLabels), [labelsProp])
  const dsA = useMemo(() => (dsAProp?.length ? dsAProp : defaultA), [dsAProp])
  const dsB = useMemo(() => (dsBProp?.length ? dsBProp : defaultB), [dsBProp])

  // 表格顯示時間：外層（月）→ YYYY-MM；內層（日）保留 YYYY-MM-DD
  const displayTimes = useMemo(() => {
    const isMonthly = timeUnit === 'month' || looksLikeMonthly(labels)
    if (!isMonthly) return labels.slice()
    const year = baseYear ?? new Date().getFullYear()
    return labels.map(l => toYm(l, year))
  }, [labels, timeUnit, baseYear])

  const headers = useMemo(
    () => ['單位時間', seriesNames?.a ?? 'M0→M1 (%)', seriesNames?.b ?? 'M1→M2 (%)'],
    [seriesNames?.a, seriesNames?.b]
  )
  const tableRows = useMemo(
    () => displayTimes.map((time, i) => ({ time, A: `${dsA[i] ?? '—'}`, B: `${dsB[i] ?? '—'}` })),
    [displayTimes, dsA, dsB]
  )

  /* ---------- 捲動到對應列（由外層 ScrollView 控制） ---------- */
  const scrollOuterToRow = useCallback((rowIndex: number, animated = true) => {
    // 圖表高度 + spacer(8) + 表頭高度(ROW_HEIGHT + SEP_H)
    const headerH = ROW_HEIGHT + SEP_H
    const topBlockH = chartH + 8 + headerH
    const y = topBlockH + rowIndex * ITEM_H - 60 // 往上預留 60px 緩衝
    outerScrollRef.current?.scrollTo({ y: Math.max(0, y), animated })
  }, [chartH])

  /* ---------------- Spotlight：點圖表只高亮 + 滾動到對應列 ---------------- */
  const spotlightPoint = (seriesIndex: number, dataIndex: number, value: number) => {
    const inst = instRef.current
    if (!inst) return
    const [px, py] = inst.convertToPixel({ seriesIndex }, [dataIndex, value]) as [number, number]
    setSpot({ x: px, y: py, dataIndex, seriesIndex, xLabel: labels[dataIndex] })
    setSelectedRow(dataIndex)
    const COLORS = ['#4caf50', '#2196f3']
    setSelectedRowColor(COLORS[seriesIndex])
    // 讓外層捲到該列（表格本身不直捲）
    scrollOuterToRow(dataIndex, true)
    // 可移除：教學導覽
    requestAnimationFrame(() => setTimeout(() => start(), 50))
  }

  // 只允許由表格點擊觸發第二層
  const openChildFromTable = useCallback((seriesIndex: 0 | 1, dataIndex: number) => {
    if (!allowDrilldown) return
    const data = buildChildDataFromParent(seriesIndex, dataIndex, labels, dsA, dsB)
    setChildData({
      labels: data.labels,
      dsA: data.dsA,
      dsB: data.dsB,
      initialSelected: { seriesIndex: 0, dataIndex: Math.min(dataIndex, data.labels.length - 1) },
      titleSuffix: data.titleSuffix,
    })
    setDrillModalOpen(true)
  }, [allowDrilldown, labels, dsA, dsB])

  /* ---------------- Chart Option ---------------- */
  const isInnerDay = timeUnit === 'day' && !yIsPercent
  const xStep = useMemo(() => Math.max(1, Math.ceil(labels.length / 8)), [labels.length])

  const cumPctSeries = useMemo(() => {
    if (!isInnerDay) return null
    const totalDen = Math.max(1, (dsB || []).reduce((a, b) => a + (+b || 0), 0))
    let acc = 0
    return (dsA || []).map(v => { acc += (+v || 0); return (acc / totalDen) * 100 })
  }, [isInnerDay, dsA, dsB])

  const finalRatePct = useMemo(() => (cumPctSeries?.[cumPctSeries.length - 1] ?? 0), [cumPctSeries])

  const option = useMemo<echarts.EChartsOption>(() => {
    if (isInnerDay) {
      return {
        animation: false,
        legend: { data: ['分子(件)', '母體(件)', '月內累積比率(%)'] },
        grid: { left: 48, right: 56, top: 36, bottom: 12 },
        xAxis: {
          type: 'category',
          data: labels,
          boundaryGap: true,
          name: '日',
          nameLocation: 'middle',
          nameGap: 22,
          axisLabel: { interval: (idx: number) => idx % xStep === 0, formatter: (v: string) => toDD(v), hideOverlap: true, rotate: 0, margin: 8 },
          axisTick: { alignWithLabel: true },
          splitLine: { show: true },
        },
        yAxis: [
          { type: 'value', name: '件數', splitNumber: 3, axisLabel: { formatter: '{value}' } },
          { type: 'value', name: '比率(%)', position: 'right', splitNumber: 3, axisLabel: { formatter: '{value} %' } },
        ],
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        series: [
          { name: '分子(件)', type: 'bar', yAxisIndex: 0, data: dsA, barMaxWidth: 18, emphasis: { focus: 'series' } },
          { name: '母體(件)', type: 'line', yAxisIndex: 0, data: dsB, showSymbol: false, lineStyle: { width: 2 }, sampling: 'lttb', emphasis: { focus: 'series' } },
          {
            name: '月內累積比率(%)',
            type: 'line',
            yAxisIndex: 1,
            data: cumPctSeries ?? [],
            showSymbol: false,
            lineStyle: { width: 2 },
            sampling: 'lttb',
            emphasis: { focus: 'series' },
            markLine: {
              symbol: 'none',
              label: { formatter: `最終 ${Number(finalRatePct || 0).toFixed(2)}%` },
              data: [{ yAxis: Number((finalRatePct || 0).toFixed(2)) }],
              yAxisIndex: 1,
            },
          },
        ],
      }
    }
    return {
      animation: false,
      animationDurationUpdate: 150,
      animationEasingUpdate: 'quartOut',
      legend: { data: [seriesNames?.a ?? 'M0→M1 (%)', seriesNames?.b ?? 'M1→M2 (%)'] },
      grid: { left: 50, right: 16, top: 50, bottom: 40 },
      xAxis: { type: 'category', boundaryGap: true, data: labels, axisLabel: { interval: 0, rotate: 30, margin: 10, hideOverlap: true }, axisTick: { alignWithLabel: true }, splitLine: { show: true } },
      yAxis: { type: 'value', axisLabel: { formatter: yIsPercent ? '{value} %' : '{value}' }, splitNumber: 4 },
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      series: [
        { name: seriesNames?.a ?? 'M0→M1 (%)', type: 'line', data: dsA, showSymbol: true, symbol: 'circle', symbolSize: 14, itemStyle: { opacity: 0.15 }, lineStyle: { width: 2 }, sampling: 'lttb' },
        { name: seriesNames?.b ?? 'M1→M2 (%)', type: 'line', data: dsB, showSymbol: true, symbol: 'circle', symbolSize: 14, itemStyle: { opacity: 0.15 }, lineStyle: { width: 2 }, sampling: 'lttb' },
      ],
    }
  }, [isInnerDay, labels, xStep, dsA, dsB, cumPctSeries, finalRatePct, seriesNames?.a, seriesNames?.b, yIsPercent])

  /* ---------------- Lifecycle ---------------- */
  useEffect(() => {
    if (!chartRef.current || instRef.current) return
    const inst = echarts.init(chartRef.current, 'light', { renderer: 'skia', width: box.w, height: chartH })
    instRef.current = inst
    inst.setOption(option, { notMerge: true, lazyUpdate: true })

    // 點圖：只高亮 + 外層捲動到對應列
    const onSeriesClick = (params: any) => {
      if (params?.componentType !== 'series') return
      const dataIndex = params.dataIndex as number
      const seriesIndex = params.seriesIndex as number
      const value = Array.isArray(params.value) ? params.value[1] : params.value
      spotlightPoint(seriesIndex, dataIndex, Number(value))
    }
    inst.on('click', onSeriesClick)

    if (initialSelected) {
      const { seriesIndex, dataIndex } = initialSelected
      const value = (seriesIndex === 0 ? dsA : dsB)[dataIndex]
      if (value != null) {
        requestAnimationFrame(() => {
          spotlightPoint(seriesIndex, dataIndex, Number(value))
          scrollOuterToRow(dataIndex, false) // 進場時也同步捲到該列
        })
      }
    }
    return () => { inst.off('click', onSeriesClick); inst.dispose(); instRef.current = null }
  }, [option, box.w, chartH, dsA, dsB, initialSelected, scrollOuterToRow])

  useEffect(() => {
    instRef.current?.resize({ width: box.w, height: chartH })
    setSpot(null)
  }, [box.w, chartH])

  /* ---------------- Render ---------------- */
  return (
    <ScrollView ref={outerScrollRef} nestedScrollEnabled>
      <WsPaddingContainer padding={0} style={{ backgroundColor: $color.white }}>
        {/* 圖表容器：固定高度 + 隱藏溢出 */}
        <View
          ref={chartBoxRef}
          onLayout={onChartBoxLayout}
          style={{ position: 'relative', width: '100%', height: chartH, overflow: 'hidden' }}
        >
          <SkiaChart ref={chartRef} style={{ width: '100%', height: '100%' }} />

          {/* (可移除) Spotlight 遮罩，只是視覺聚焦，不影響捲動 */}
          {spot && (
            <Pressable
              style={{ position: 'absolute', left: 0, top: 0, width: box.w, height: chartH }}
              onPress={() => { setSpot(null); setSelectedRow(null); setSelectedRowColor(null) }}
            >
              <Svg width={box.w} height={chartH}>
                <Defs>
                  <Mask id="mask">
                    <Rect x="0" y="0" width={box.w} height={chartH} fill="white" />
                    <Circle cx={spot.x} cy={spot.y} r={MASK_RADIUS} fill="black" />
                  </Mask>
                </Defs>
                <Rect x="0" y="0" width={box.w} height={chartH} fill="rgba(0,0,0,0.65)" mask="url(#mask)" />
                <Line x1={spot.x} y1={0} x2={spot.x} y2={chartH} stroke="rgba(255,255,255,0.4)" strokeWidth={1} strokeDasharray="4 4" />
              </Svg>
            </Pressable>
          )}
        </View>

        {/* 與表格留空隙 */}
        <View style={{ height: 8 }} />

        {/* 來源資料表（只有點此才會開第二層） */}
        <XlsxDataTable
          ref={tableRef}
          rows={tableRows}
          headersOverride={headers}
          selectedRow={selectedRow}
          selectedRowColor={selectedRowColor ?? undefined}
          selected={spot ? { seriesIndex: spot.seriesIndex as 0 | 1, dataIndex: spot.dataIndex } : null}
          showCheckbox={false}
          onCellPress={(rowIdx, colIdx) => {
            if (!allowDrilldown) return
            if (colIdx === 1 || colIdx === 2) {
              const seriesIndex = (colIdx === 1 ? 0 : 1) as 0 | 1
              openChildFromTable(seriesIndex, rowIdx)
            }
          }}
          pressableColumns={allowDrilldown ? [1, 2] : []}
          bodyTextAlign={timeUnit === 'day' && !yIsPercent ? 'center' : 'left'}
          timeColTextAlign={timeUnit === 'day' && !yIsPercent ? 'center' : 'left'}
          columnWidth={{ time: 180, a: 120, b: 120 }}
        />
      </WsPaddingContainer>

      {/* 第二層：內層不再往下鑽 */}
      {allowDrilldown && (
        <WsModal
          animationType="none"
          visible={drillModalOpen}
          onBackButtonPress={() => setDrillModalOpen(false)}
          headerLeftOnPress={() => setDrillModalOpen(false)}
          title={childData?.titleSuffix ? `明細趨勢｜${childData.titleSuffix}` : t('明細趨勢')}
        >
          {childData && (
            <SingleChartTrace
              labels={childData.labels}
              dsA={childData.dsA}
              dsB={childData.dsB}
              seriesNames={{ a: '分子(件)', b: '母體(件)' }}
              initialSelected={childData.initialSelected}
              timeUnit="day"
              allowDrilldown={false}
              yIsPercent={false}
              chartHeight={280}
            />
          )}
        </WsModal>
      )}
    </ScrollView>
  )
}
