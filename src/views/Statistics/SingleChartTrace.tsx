// SingleChartTrace.tsx
import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import {
  View,
  useWindowDimensions,
  Pressable,
  LayoutChangeEvent,
} from 'react-native'
import * as echarts from 'echarts/core'
import { LineChart as ELineChart, BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent } from 'echarts/components'
import { SkiaRenderer, SkiaChart } from '@wuba/react-native-echarts'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import XlsxDataTable, { XlsxDataTableHandle } from './Create/XlsxDataTable'
import { WsPaddingContainer, WsModal } from '@/components'

// (可移除) 教學導覽
import { useCopilot, CopilotStep, walkthroughable } from 'react-native-copilot'
const WView = walkthroughable(View)

import Svg, { Defs, Mask, Rect, Circle, Line } from 'react-native-svg'

echarts.use([SkiaRenderer, ELineChart, BarChart, GridComponent, TooltipComponent, LegendComponent])

const MASK_RADIUS = 24

type SpotState = { x: number; y: number; dataIndex: number; seriesIndex: number; xLabel?: string } | null
type TimeUnit = 'day' | 'week' | 'month' | 'season' | 'year'

type Props = {
  labels?: string[]
  dsA?: number[]
  dsB?: number[]
  seriesNames?: { a?: string; b?: string }
  initialSelected?: { seriesIndex: 0 | 1; dataIndex: number } | null
  timeUnit?: TimeUnit
  baseYear?: number
  allowDrilldown?: boolean
  yIsPercent?: boolean
  chartHeight?: number
  labelCount?: number
  xAxisName?: string
  valueSuffix?: string
}

/* ---- Utils ---- */
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

function buildChildDataFromParent(seriesIndex: 0 | 1, dataIndex: number, outerLabels: string[], outerA: number[], outerB: number[]) {
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
  const weights = days.map((_, idx) => (idx % 7 === 0 || (idx + 1) % 7 === 0 ? 0.88 : 1.1) * (1 + 0.08 * Math.sin((Math.PI * (idx + 1)) / D)))
  const sumW = weights.reduce((a, b) => a + b, 0)
  let nums = weights.map(w => Math.round((w / sumW) * numeratorMonthly))
  const diff = numeratorMonthly - nums.reduce((a, b) => a + b, 0)
  for (let i = 0; i < Math.abs(diff); i++) { const k = i % D; nums[k] += diff > 0 ? 1 : -1; if (nums[k] < 0) nums[k] = 0 }
  return { labels: days, dsA: nums, dsB: Array(D).fill(denominatorPerDay), titleSuffix: `${ym}（外層 ${seriesIndex === 0 ? 'M0→M1' : 'M1→M2'} = ${ratePct.toFixed(2)}%）` }
}

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
  labelCount,
  xAxisName,
  valueSuffix,
}: Props) {
  const { t } = useTranslation()
  const { width: winW } = useWindowDimensions()

  const chartH = chartHeight ?? (allowDrilldown ? 300 : 220)

  const chartRef = useRef<any>(null)
  const chartBoxRef = useRef<View>(null)
  const instRef = useRef<echarts.EChartsType | null>(null)
  const tableRef = useRef<XlsxDataTableHandle>(null)

  const [selectedRow, setSelectedRow] = useState<number | null>(null)
  const [selectedRowColor, setSelectedRowColor] = useState<string | null>(null)
  const { start } = useCopilot()
  const [spot, setSpot] = useState<SpotState>(null)

  // ★ 只用 onLayout 的寬度；避免 measureInWindow 在 Modal 中不穩
  const [box, setBox] = useState<{ w: number; h: number }>({ w: 0, h: chartH })

  const onChartBoxLayout = useCallback((e) => {
    const w = (!allowDrilldown ? winW : e.nativeEvent.layout.width) || winW
    setBox({ w, h: chartH })
  }, [chartH, winW, allowDrilldown])

  const [drillModalOpen, setDrillModalOpen] = useState(false)
  const [childData, setChildData] = useState<{ labels: string[]; dsA: number[]; dsB: number[]; initialSelected: { seriesIndex: 0 | 1; dataIndex: number } | null; titleSuffix?: string } | null>(null)

  const defaultLabels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const defaultA = [2.1, 2.4, 2.0, 2.6, 2.9, 3.1, 2.8, 3.0, 3.3, 3.2, 3.4, 3.1]
  const defaultB = [0.9, 1.1, 1.0, 1.2, 1.4, 1.6, 1.3, 1.5, 1.7, 1.6, 1.8, 1.7]

  const baseLabels = useMemo(() => (labelsProp?.length ? labelsProp.slice() : defaultLabels), [labelsProp])
  const labels = useMemo(() => {
    if (typeof labelCount === 'number' && labelCount > 0) return baseLabels.slice(0, labelCount)
    return baseLabels
  }, [baseLabels, labelCount])

  const L = labels.length
  const dsA = useMemo(() => (dsAProp?.length ? dsAProp : defaultA).slice(0, L), [dsAProp, L])
  const dsB = useMemo(() => (dsBProp?.length ? dsBProp : defaultB).slice(0, L), [dsBProp, L])

  const displayTimes = useMemo(() => {
    const isMonthly = timeUnit === 'month' || looksLikeMonthly(labels)
    if (!isMonthly) return labels.slice()
    const year = baseYear ?? new Date().getFullYear()
    return labels.map(l => toYm(l, year))
  }, [labels, timeUnit, baseYear])

  const headers = useMemo(() => ['單位時間', seriesNames?.a ?? 'M0→M1 (%)', seriesNames?.b ?? 'M1→M2 (%)'], [seriesNames?.a, seriesNames?.b])
  const tableRows = useMemo(() => displayTimes.map((time, i) => ({ time, A: `${dsA[i] ?? '—'}`, B: `${dsB[i] ?? '—'}` })), [displayTimes, dsA, dsB])

  // 點圖 → 高亮 + 表格捲到列
  const spotlightPoint = (seriesIndex: number, dataIndex: number, value: number) => {
    const inst = instRef.current
    if (!inst) return
    const [px, py] = inst.convertToPixel({ seriesIndex }, [dataIndex, value]) as [number, number]
    setSpot({ x: px, y: py, dataIndex, seriesIndex, xLabel: labels[dataIndex] })
    setSelectedRow(dataIndex)
    const COLORS = ['#4caf50', '#2196f3']
    setSelectedRowColor(COLORS[seriesIndex])
    tableRef.current?.scrollToRow(dataIndex, true)
    requestAnimationFrame(() => setTimeout(() => start(), 50))
  }

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
        animationDurationUpdate: 150,
        animationEasingUpdate: 'quartOut',
        legend: {
          type: 'scroll',
          orient: 'horizontal',
          top: 6,
          left: 'center',
          right: 8,
          itemWidth: 12,
          itemHeight: 8,
          itemGap: 10,
          textStyle: { fontSize: 12 },
          data: ['分子(件)', '母體(件)', '月內累積比率(%)'],
        },
        grid: { left: 40, right: 40, top: 56, bottom: 56, containLabel: true },
        xAxis: {
          type: 'category',
          data: labels,
          boundaryGap: true,
          name: xAxisName ?? '日',
          nameLocation: 'middle',
          nameGap: 40,
          axisLabel: {
            interval: (idx: number) => idx % xStep === 0,
            formatter: (v: string) => toDD(v),
            hideOverlap: true,
            rotate: 30,
            margin: 12,
          },
          axisTick: { alignWithLabel: true },
          splitLine: { show: true },
        },
        yAxis: [
          { type: 'value', name: '件數', splitNumber: 3, axisLabel: { formatter: '{value}' } },
          { type: 'value', name: '比率(%)', position: 'right', splitNumber: 3, axisLabel: { formatter: '{value} %' } },
        ],
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        series: [
          {
            name: '分子(件)',
            type: 'bar',
            yAxisIndex: 0,
            data: dsA,
            barMaxWidth: 18,
            emphasis: { focus: 'self' },
          },
          {
            name: '母體(件)',
            type: 'line',
            yAxisIndex: 0,
            data: dsB,
            showSymbol: true,
            symbol: 'circle',
            symbolSize: 12,
            lineStyle: { width: 2 },
            sampling: 'lttb',
            emphasis: { focus: 'self' },
          },
          {
            name: '月內累積比率(%)',
            type: 'line',
            yAxisIndex: 1,
            data: cumPctSeries ?? [],
            showSymbol: true,
            symbol: 'circle',
            symbolSize: 12,
            lineStyle: { width: 2 },
            sampling: 'lttb',
            emphasis: { focus: 'self' },
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
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        top: 16,
        left: 'center',
        right: 8,
        itemWidth: 12,
        itemHeight: 8,
        itemGap: 10,
        textStyle: { fontSize: 12 },
        data: [seriesNames?.a ?? 'M0→M1 (%)', seriesNames?.b ?? 'M1→M2 (%)']
      },
      grid: { left: 50, right: 16, top: 50, bottom: 40 },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: labels,
        axisLabel: { interval: 0, rotate: 30, margin: 10, hideOverlap: true },
        axisTick: { alignWithLabel: true },
        splitLine: { show: true },
        name: xAxisName ?? (timeUnit === 'day' ? '日' : timeUnit === 'week' ? '週' : timeUnit === 'season' ? '季' : timeUnit === 'year' ? '年' : '月'),
        nameLocation: 'middle',
        nameGap: 40,
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: yIsPercent ? '{value} %' : `{value}${valueSuffix ?? ''}` },
        splitNumber: 4
      },
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      series: [
        { name: seriesNames?.a ?? 'M0→M1 (%)', type: 'line', data: dsA, showSymbol: true, symbol: 'circle', symbolSize: 14, lineStyle: { width: 2 }, sampling: 'lttb' },
        { name: seriesNames?.b ?? 'M1→M2 (%)', type: 'line', data: dsB, showSymbol: true, symbol: 'circle', symbolSize: 14, lineStyle: { width: 2 }, sampling: 'lttb' },
      ],
    }
  }, [isInnerDay, labels, xStep, dsA, dsB, cumPctSeries, finalRatePct, seriesNames?.a, seriesNames?.b, yIsPercent, xAxisName, valueSuffix, timeUnit])

  /* ---------- lifecycle ---------- */
  useEffect(() => {
    // ★ 必須有寬度再初始化，避免寬 0 時初始化出錯（尤其在 Modal）
    if (!chartRef.current || instRef.current || !box.w) return
    const inst = echarts.init(chartRef.current, 'light', { renderer: 'skia', width: box.w, height: chartH })
    instRef.current = inst
    inst.setOption(option, { notMerge: true, lazyUpdate: true })

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
          tableRef.current?.scrollToRow(dataIndex, false)
        })
      }
    }
    return () => { inst.off('click', onSeriesClick); inst.dispose(); instRef.current = null }
  }, [option, box.w, chartH, dsA, dsB, initialSelected])

  useEffect(() => {
    if (!instRef.current || !box.w) return
    instRef.current.resize({ width: box.w, height: chartH })
    instRef.current.setOption(option, { notMerge: true, lazyUpdate: true })
    setSpot(null)
  }, [box.w, chartH, option])

  return (
    <View style={{ flex: 1, backgroundColor: $color.white }}>
      <WsPaddingContainer padding={0} style={{ flex: 1, backgroundColor: $color.white }}>
        {/* 固定高度的圖表 */}
        <View
          ref={chartBoxRef}
          onLayout={onChartBoxLayout}
          style={{ position: 'relative', width: '100%', height: chartH, overflow: 'hidden' }}
        >

          <SkiaChart ref={chartRef} />

          {/* Spotlight */}
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

        <View style={{ height: 8 }} />

        {/* 表格：吃滿剩餘高度；可直捲 */}
        <View style={{ flex: 1, minHeight: 0 }}>
          <XlsxDataTable
            ref={tableRef}
            rows={tableRows}
            headersOverride={headers}
            selectedRow={selectedRow}
            selectedRowColor={selectedRowColor ?? undefined}
            selected={spot ? { seriesIndex: spot.seriesIndex as 0 | 1, dataIndex: spot.dataIndex } : null}
            showCheckbox={false}
            style={{ flex: 1 }}
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
            columnWidth={[130, 150, 150]}
          />
        </View>
      </WsPaddingContainer>

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
              key={childData.titleSuffix}
              labels={childData.labels}
              dsA={childData.dsA}
              dsB={childData.dsB}
              seriesNames={{ a: '分子(件)', b: '母體(件)' }}
              initialSelected={childData.initialSelected}
              timeUnit="day"
              allowDrilldown={false}
              yIsPercent={false}
              chartHeight={280}
              xAxisName="日"
            />
          )}
        </WsModal>
      )}
    </View>
  )
}
