import React, { useRef, useEffect, useMemo, useState } from 'react'
import { View, Text, useWindowDimensions, TouchableOpacity } from 'react-native'
import * as echarts from 'echarts/core'
import { LineChart as ELineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components'
import { SkiaRenderer, SkiaChart } from '@wuba/react-native-echarts'
import $color from '@/__reactnative_stone/global/color'
import { WsPaddingContainer, WsModal } from '@/components'
import { useTranslation } from 'react-i18next'
import SingleChartTrace from './SingleChartTrace'

/** 註冊 Skia renderer + 需要的元件 */
echarts.use([SkiaRenderer, ELineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent])

type TimeUnit = 'day' | 'week' | 'month' | 'season' | 'year'

type TipState = {
  x: number
  y: number
  payload: {
    category: string
    dataIndex: number
    series: Array<{ seriesName: string; value: number | null | undefined }>
  }
} | null

type Props = {
  /** x 軸標籤，若未提供則依 timeUnit 自動產生 */
  labels?: string[]
  /** 第一條線資料 */
  dsA?: number[]
  /** 第二條線資料 */
  dsB?: number[]
  /** 圖例名稱 */
  seriesNames?: { a?: string; b?: string }
  /** 圖高（預設 300） */
  height?: number
  /** y 軸名稱 */
  yAxisName?: string
  /** x 軸名稱 */
  xAxisName?: string
  /** y 軸單位字尾，例如 ' k'、' 元' */
  valueSuffix?: string
  /** 自動產生 labels 的單位 */
  timeUnit?: TimeUnit
  /** 自動產生 labels 的數量；未指定則以資料長度推斷 */
  labelCount?: number
  /** timeUnit === 'year' 時用來指定結束年份；未指定則取當年 */
  baseYear?: number
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max))

/** 依 timeUnit 產生預設 labels */
function buildAutoLabels(opts: { timeUnit: TimeUnit; count: number; baseYear?: number }): string[] {
  const { timeUnit, count, baseYear } = opts
  switch (timeUnit) {
    case 'day': {
      const n = Math.min(Math.max(count, 1), 31)
      return Array.from({ length: n }, (_, i) => `${i + 1}日`)
    }
    case 'week': {
      const n = Math.min(Math.max(count, 1), 53)
      return Array.from({ length: n }, (_, i) => `W${i + 1}`)
    }
    case 'month': {
      const n = Math.min(Math.max(count, 1), 12)
      return Array.from({ length: n }, (_, i) => `${i + 1}月`)
    }
    case 'season': {
      const n = Math.min(Math.max(count, 1), 4)
      return Array.from({ length: n }, (_, i) => `第${i + 1}季`)
    }
    case 'year': {
      const by = baseYear ?? new Date().getFullYear()
      const n = Math.max(count, 1)
      const start = by - (n - 1)
      return Array.from({ length: n }, (_, i) => String(start + i))
    }
    default:
      return []
  }
}

export default function SingleChart({
  labels: labelsProp,
  dsA: dsAProp,
  dsB: dsBProp,
  seriesNames = { a: 'A1', b: 'B' },
  height = 300,
  yAxisName = '值',
  xAxisName = '時間',
  valueSuffix = ' k',
  timeUnit,
  labelCount,
  baseYear,
}: Props) {
  const { t } = useTranslation()
  const { width } = useWindowDimensions()
  const chartRef = useRef<any>(null)
  const instRef = useRef<echarts.EChartsType | null>(null)

  const [modalTraceData, setModalTraceData] = useState(false)
  const [tip, setTip] = useState<TipState>(null)

  /** Demo fallback（外部未提供資料時使用） */
  const fallbackLabels = useMemo(
    () => ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    []
  )
  const fallbackA = useMemo(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)), [])
  const fallbackB = useMemo(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)), [])

  /** 原始資料（未裁切） */
  const rawA = dsAProp?.length ? dsAProp : fallbackA
  const rawB = dsBProp?.length ? dsBProp : fallbackB

  /** 推斷 labelCount：優先採用 props，其次用資料長度，最後依 timeUnit 給預設 */
  const inferredCount = useMemo(() => {
    if (labelCount && labelCount > 0) return labelCount
    const lenA = rawA.length
    const lenB = rawB.length
    if (lenA && lenB) return Math.min(lenA, lenB)
    if (lenA) return lenA
    if (lenB) return lenB
    switch (timeUnit) {
      case 'day': return 31
      case 'week': return 53
      case 'season': return 4
      case 'year': return 5
      case 'month':
      default: return 12
    }
  }, [labelCount, rawA.length, rawB.length, timeUnit])

  /** 最終 labels：優先用傳入的，其次用 timeUnit 自動產生，再不然用 fallback */
  const labels = useMemo(() => {
    if (labelsProp?.length) return labelsProp
    if (timeUnit) return buildAutoLabels({ timeUnit, count: inferredCount, baseYear })
    return fallbackLabels
  }, [labelsProp, timeUnit, inferredCount, baseYear, fallbackLabels])

  /** 以 labels 長度為準裁切資料 */
  const L = labels.length
  const safeA = rawA.slice(0, L)
  const safeB = rawB.slice(0, L)

  // helper
  const xLabelFormatter = useMemo(() => {
    return (val: string) => {
      // 例如：'1日' -> '1'
      if (timeUnit === 'day') return val.replace('日', '')
      return val
    }
  }, [timeUnit])

  /** ECharts Option */
  const option = useMemo(
    () => ({
      animation: false,
      animationDurationUpdate: 150,
      animationEasingUpdate: 'quartOut',
      legend: { data: [seriesNames.a ?? 'A1', seriesNames.b ?? 'B'] },
      grid: { left: 40, right: 40, top: 28, bottom: 50 },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: labels,
        axisLabel: {
          interval: 0,
          rotate: 30,
          margin: 12,
          hideOverlap: true,
          formatter: xLabelFormatter,
        },
        axisTick: { alignWithLabel: true },
        name: xAxisName,
        nameLocation: 'middle',
        nameGap: 40,
        splitLine: { show: true },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: `{value}${valueSuffix}`
        },
        name: yAxisName,
        splitNumber: 4,
      },
      series: [
        {
          name: seriesNames.a ?? 'A1',
          type: 'line',
          data: safeA,
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 12,
          lineStyle: { width: 2 },
          sampling: 'lttb',
          emphasis: { focus: 'self' },
        },
        {
          name: seriesNames.b ?? 'B',
          type: 'line',
          data: safeB,
          showSymbol: true,
          symbol: 'circle',
          symbolSize: 12,
          lineStyle: { width: 2 },
          sampling: 'lttb',
          emphasis: { focus: 'self' },
        },
      ],
    }),
    [labels, safeA, safeB, seriesNames.a, seriesNames.b, xAxisName, yAxisName, valueSuffix]
  )

  /** 初始化 + 綁定事件 */
  useEffect(() => {
    if (!chartRef.current || instRef.current) return
    const inst = echarts.init(chartRef.current, 'light', {
      renderer: 'skia',
      width,
      height,
    })
    instRef.current = inst
    inst.setOption(option, { notMerge: true, lazyUpdate: true })

    const zr = inst.getZr()

    const getTipByIndex = (dataIndex: number): TipState => {
      let idx = clamp(Math.round(dataIndex), 0, L - 1)
      const category = labels[idx]
      const aVal = safeA[idx]
      const bVal = safeB[idx]
      const yTop = Math.max(
        aVal ?? Number.NEGATIVE_INFINITY,
        bVal ?? Number.NEGATIVE_INFINITY
      )
      const [px, py] = inst.convertToPixel({ seriesIndex: 0 }, [idx, yTop]) as [number, number]
      return {
        x: px,
        y: py,
        payload: {
          category,
          dataIndex: idx,
          series: [
            { seriesName: seriesNames.a ?? 'A1', value: aVal },
            { seriesName: seriesNames.b ?? 'B', value: bVal },
          ],
        },
      }
    }

    /** 1) 點擊任何圖表區域：就近選取 x 索引 */
    const onZrClick = (e: any) => {
      const pt: [number, number] = [e.offsetX, e.offsetY]
      const from = inst.convertFromPixel({ seriesIndex: 0 }, pt) as [number, number]
      if (!from || Number.isNaN(from[0])) return
      setTip(getTipByIndex(from[0]))
    }
    zr.on('click', onZrClick)

    /** 2) 點擊實際資料點 */
    const onSeriesClick = (params: any) => {
      if (params?.componentType !== 'series') return
      const idx = params.dataIndex as number
      setTip(getTipByIndex(idx))
    }
    inst.on('click', onSeriesClick)

    /** 3) crosshair/拖曳 dataZoom 時更新浮層位置 */
    const onAxisPointer = (e: any) => {
      const info = e?.axesInfo?.[0]
      if (!info || Number.isNaN(info.value)) return
      setTip(getTipByIndex(info.value))
    }
    inst.on('updateAxisPointer', onAxisPointer)

    return () => {
      zr.off('click', onZrClick)
      inst.off('click', onSeriesClick)
      inst.off('updateAxisPointer', onAxisPointer)
      inst.dispose()
      instRef.current = null
    }
  }, [option, width, height, L, labels, safeA, safeB, seriesNames.a, seriesNames.b])

  /** 視窗寬度 / 高度 / option 改變時更新圖表 */
  useEffect(() => {
    if (!instRef.current) return
    instRef.current.resize({ width, height })
    instRef.current.setOption(option, { notMerge: true, lazyUpdate: true })
    setTip(null) // 避免舊位置殘留
  }, [width, height, option])

  return (
    <>
      <WsPaddingContainer
        padding={0}
        style={{ backgroundColor: $color.white, position: 'relative' }} // 讓自訂 tooltip 絕對定位在容器內
      >
        {/* 若你的 app 有使用 RNGH，建議開啟 useRNGH：<SkiaChart ref={chartRef} useRNGH /> */}
        <SkiaChart ref={chartRef} />

        {/* 自訂 Tooltip */}
        {tip && (
          <View
            style={{
              position: 'absolute',
              left: clamp(tip.x - 80, 8, width - 160 - 8),
              top: clamp(tip.y - 72, 8, height - 100),
              width: 160,
              padding: 10,
              borderRadius: 10,
              backgroundColor: 'rgba(0,0,0,0.85)',
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>
              {tip.payload.category}（index: {tip.payload.dataIndex}）
            </Text>
            {tip.payload.series.map((s) => (
              <Text key={s.seriesName} style={{ color: '#fff', marginTop: 4 }}>
                {s.seriesName}: {s.value ?? '—'}
              </Text>
            ))}

            <TouchableOpacity
              style={{ marginTop: 10 }}
              onPress={() => {
                console.log('Go detail →', tip.payload)
                setTip(null)
                setModalTraceData(true)
              }}
            >
              <Text style={{ color: '#4FC3F7' }}>查看詳情</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setTip(null)} style={{ marginTop: 6 }}>
              <Text style={{ color: '#BDBDBD' }}>關閉</Text>
            </TouchableOpacity>
          </View>
        )}
      </WsPaddingContainer>

      {/* 你的新增流程 Modal */}
      <WsModal
        animationType="none"
        visible={modalTraceData}
        onBackButtonPress={() => setModalTraceData(false)}
        headerLeftOnPress={() => setModalTraceData(false)}
        title={t('新增記錄')}
      >
        <SingleChartTrace />
      </WsModal>
    </>
  )
}
