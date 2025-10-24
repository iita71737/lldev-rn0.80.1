import React, { useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { View, Text, useWindowDimensions, TouchableOpacity, UIManager, findNodeHandle } from 'react-native'
import * as echarts from 'echarts/core'
import { LineChart as ELineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components'
import { SkiaRenderer, SkiaChart } from '@wuba/react-native-echarts'
import $color from '@/__reactnative_stone/global/color'
import { WsPaddingContainer, WsModal } from '@/components'
import { useTranslation } from 'react-i18next'
import SingleChartTrace from './SingleChartTrace'

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
  labels?: string[]
  dsA?: number[]
  dsB?: number[]
  seriesNames?: { a?: string; b?: string }
  height?: number
  yAxisName?: string
  xAxisName?: string
  valueSuffix?: string
  timeUnit?: TimeUnit
  labelCount?: number
  baseYear?: number
}

type TraceSelected = { seriesIndex: 0 | 1; dataIndex: number } | null

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max))
const TOOLTIP_W = 160
const TOOLTIP_H = 100

function buildAutoLabels(opts: { timeUnit: TimeUnit; count: number; baseYear?: number }): string[] {
  const { timeUnit, count, baseYear } = opts
  switch (timeUnit) {
    case 'day': return Array.from({ length: Math.min(Math.max(count, 1), 31) }, (_, i) => `${i + 1}日`)
    case 'week': return Array.from({ length: Math.min(Math.max(count, 1), 53) }, (_, i) => `W${i + 1}`)
    case 'month': return Array.from({ length: Math.min(Math.max(count, 1), 12) }, (_, i) => `${i + 1}月`)
    case 'season': return Array.from({ length: Math.min(Math.max(count, 1), 4) }, (_, i) => `第${i + 1}季`)
    case 'year': {
      const by = baseYear ?? new Date().getFullYear()
      const n = Math.max(count, 1)
      const start = by - (n - 1)
      return Array.from({ length: n }, (_, i) => String(start + i))
    }
    default: return []
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

  const chartBoxRef = useRef<View>(null)
  const [box, setBox] = useState({ w: width, h: height })
  const onChartBoxLayout = useCallback(() => {
    const node = findNodeHandle(chartBoxRef.current)
    if (node) UIManager.measure(node, (_x, _y, w, h) => setBox({ w, h }))
  }, [])

  const [modalTraceData, setModalTraceData] = useState(false)
  const [tip, setTip] = useState<TipState>(null)
  const [selectedForTrace, setSelectedForTrace] = useState<TraceSelected>(null)

  const fallbackLabels = useMemo(
    () => ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    []
  )
  const fallbackA = useMemo(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)), [])
  const fallbackB = useMemo(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)), [])

  const rawA = dsAProp?.length ? dsAProp : fallbackA
  const rawB = dsBProp?.length ? dsBProp : fallbackB

  const inferredCount = useMemo(() => {
    if (labelCount && labelCount > 0) return labelCount
    const lenA = rawA.length, lenB = rawB.length
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

  const labels = useMemo(() => {
    if (labelsProp?.length) return labelsProp
    if (timeUnit) return buildAutoLabels({ timeUnit, count: inferredCount, baseYear })
    return fallbackLabels
  }, [labelsProp, timeUnit, inferredCount, baseYear, fallbackLabels])

  const L = labels.length
  const safeA = useMemo(() => rawA.slice(0, L), [rawA, L])
  const safeB = useMemo(() => rawB.slice(0, L), [rawB, L])

  const xLabelFormatter = useMemo(() => {
    return (val: string) => (timeUnit === 'day' ? val.replace('日', '') : val)
  }, [timeUnit])

  const option = useMemo(
    () => ({
      animation: false,
      animationDurationUpdate: 150,
      animationEasingUpdate: 'quartOut',
      tooltip: { show: false, triggerOn: 'none' },
      legend: { data: [seriesNames.a ?? 'A1', seriesNames.b ?? 'B'] },
      grid: { left: 40, right: 40, top: 28, bottom: 50 },
      xAxis: {
        type: 'category',
        boundaryGap: true,
        data: labels,
        axisLabel: { interval: 0, rotate: 30, margin: 12, hideOverlap: true, formatter: xLabelFormatter },
        axisTick: { alignWithLabel: true },
        name: xAxisName,
        nameLocation: 'middle',
        nameGap: 40,
        splitLine: { show: true },
      },
      yAxis: {
        type: 'value',
        axisLabel: { formatter: `{value}${valueSuffix}` },
        name: yAxisName,
        splitNumber: 4,
      },
      series: [
        { name: seriesNames.a ?? 'A1', type: 'line', data: safeA, showSymbol: true, symbol: 'circle', symbolSize: 12, lineStyle: { width: 2 }, sampling: 'lttb', emphasis: { focus: 'self' } },
        { name: seriesNames.b ?? 'B', type: 'line', data: safeB, showSymbol: true, symbol: 'circle', symbolSize: 12, lineStyle: { width: 2 }, sampling: 'lttb', emphasis: { focus: 'self' } },
      ],
    }),
    [labels, safeA, safeB, seriesNames.a, seriesNames.b, xAxisName, yAxisName, valueSuffix, xLabelFormatter]
  )

  useEffect(() => {
    if (!chartRef.current || instRef.current) return
    const inst = echarts.init(chartRef.current, 'light', { renderer: 'skia', width, height })
    instRef.current = inst
    inst.setOption(option, { notMerge: true, lazyUpdate: true })

    const zr = inst.getZr()

    const getTipByIndex = (dataIndex: number): TipState => {
      const idx = clamp(Math.round(dataIndex), 0, L - 1)
      const category = labels[idx]
      const aVal = safeA[idx]
      const bVal = safeB[idx]
      const yTop = Math.max(aVal ?? Number.NEGATIVE_INFINITY, bVal ?? Number.NEGATIVE_INFINITY)
      const [px, py] = inst.convertToPixel({ seriesIndex: 0 }, [idx, yTop]) as [number, number]
      return {
        x: px, y: py,
        payload: {
          category, dataIndex: idx,
          series: [
            { seriesName: seriesNames.a ?? 'A1', value: aVal },
            { seriesName: seriesNames.b ?? 'B', value: bVal },
          ],
        },
      }
    }

    const onZrClick = (e: any) => {
      const pt: [number, number] = [e.offsetX, e.offsetY]
      const from = inst.convertFromPixel({ seriesIndex: 0 }, pt) as [number, number]
      if (!from || Number.isNaN(from[0])) return
      setTip(getTipByIndex(from[0]))
    }
    zr.on('click', onZrClick)

    const onSeriesClick = (params: any) => {
      if (params?.componentType !== 'series') return
      setTip(getTipByIndex(params.dataIndex as number))
    }
    inst.on('click', onSeriesClick)

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!instRef.current) return
    instRef.current.resize({ width, height })
    setTip(null)
  }, [width, height])

  useEffect(() => {
    instRef.current?.setOption(option, { notMerge: true, lazyUpdate: true })
  }, [option])

  const getValuesAt = (idx: number) => ({ aVal: safeA[idx], bVal: safeB[idx] })

  return (
    <>
      <WsPaddingContainer padding={0} style={{ backgroundColor: $color.white, position: 'relative' }}>
        <View ref={chartBoxRef} onLayout={onChartBoxLayout} style={{ position: 'relative', width: '100%', height }}>
          <SkiaChart ref={chartRef} />

          {tip && (() => {
            // 以圖表容器為邊界夾住位置，並在底邊不足時改放到點下方/上方
            const centerX = tip.x - TOOLTIP_W / 2
            const x = clamp(centerX, 8, box.w - TOOLTIP_W - 8)
            const preferTop = tip.y - TOOLTIP_H - 12 >= 8
            const y = preferTop
              ? clamp(tip.y - TOOLTIP_H - 12, 8, box.h - TOOLTIP_H - 8)
              : clamp(tip.y + 12, 8, box.h - TOOLTIP_H - 8)

            return (
              <View
                style={{
                  position: 'absolute',
                  left: x, top: y,
                  width: TOOLTIP_W, minHeight: TOOLTIP_H,
                  padding: 10, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.85)',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600' }}>
                  {tip.payload.category}
                </Text>
                {tip.payload.series.map(s => (
                  <Text key={s.seriesName} style={{ color: '#fff', marginTop: 4 }}>
                    {s.seriesName}: {s.value ?? '—'}
                  </Text>
                ))}

                <TouchableOpacity
                  style={{ marginTop: 10 }}
                  onPress={() => {
                    const idx = tip.payload.dataIndex
                    const { aVal, bVal } = getValuesAt(idx)
                    const seriesIndex: 0 | 1 = (Number(bVal ?? -Infinity) > Number(aVal ?? -Infinity)) ? 1 : 0
                    setSelectedForTrace({ seriesIndex, dataIndex: idx })
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
            )
          })()}
        </View>
      </WsPaddingContainer>

      <WsModal
        animationType="none"
        visible={modalTraceData}
        onBackButtonPress={() => setModalTraceData(false)}
        headerLeftOnPress={() => setModalTraceData(false)}
        title={t('新增記錄')}
      >
        <SingleChartTrace
          labels={labels}
          dsA={safeA}
          dsB={safeB}
          seriesNames={seriesNames}
          initialSelected={selectedForTrace}
          timeUnit="month"
          labelCount={labels.length}
          xAxisName="單位時間(月)"
          valueSuffix=" %"
        />
      </WsModal>
    </>
  )
}
