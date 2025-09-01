import React, { useRef, useEffect, useMemo, useState } from 'react'
import { View, useWindowDimensions, Pressable } from 'react-native'
import * as echarts from 'echarts/core'
import { LineChart as ELineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components'
import { SkiaRenderer, SkiaChart } from '@wuba/react-native-echarts'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import { WsPaddingContainer } from '@/components'
import XlsxDataTable from './Create/XlsxDataTable'

// ✅ Copilot
import { useCopilot, CopilotStep, walkthroughable } from 'react-native-copilot'
const WView = walkthroughable(View)

// ✅ SVG 遮罩
import Svg, { Defs, Mask, Rect, Circle, Line } from 'react-native-svg'
import { ScrollView } from 'react-native-gesture-handler'

echarts.use([SkiaRenderer, ELineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent])

const CHART_HEIGHT = 300
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max))
const MASK_RADIUS = 24

type SpotState = { x: number; y: number; dataIndex: number; seriesIndex: number } | null

export default function SingleChart() {
  const { t } = useTranslation()
  const { width } = useWindowDimensions()
  const chartRef = useRef<any>(null)
  const instRef = useRef<echarts.EChartsType | null>(null)

  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [selectedRowColor, setSelectedRowColor] = useState<string | null>(null);

  // ✅ copilot
  const { start } = useCopilot()
  const [spot, setSpot] = useState<SpotState>(null)

  const labels = useMemo(
    () => ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    []
  )
  const dsA = useMemo(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)), [])
  const dsB = useMemo(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)), [])

  // ✅ spotlightPoint: 指定 seriesIndex + dataIndex
  const spotlightPoint = (seriesIndex: number, dataIndex: number, value: number) => {
    const inst = instRef.current
    if (!inst) return
    const [px, py] = inst.convertToPixel({ seriesIndex }, [dataIndex, value]) as [number, number]
    setSpot({ x: px, y: py, dataIndex, seriesIndex })
    setSelectedRow(dataIndex)
    const SERIES_COLORS = ['#4caf50', '#2196f3'];
    const selectedRowColor = SERIES_COLORS[seriesIndex];
    setSelectedRowColor(selectedRowColor);
    requestAnimationFrame(() => setTimeout(() => start(), 50))
  }

  const option = useMemo(() => ({
    animation: false,
    animationDurationUpdate: 150,
    animationEasingUpdate: 'quartOut',
    legend: { data: ['A', 'B'] },
    grid: { left: 44, right: 40, top: 28, bottom: 90 },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: labels,
      axisLabel: { interval: 0, rotate: 30, margin: 12 },
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value} k' },
      splitNumber: 4,
    },
    dataZoom: [
      {
        type: 'slider',
        start: 0,
        end: 100,
        height: 28,
        bottom: 24,
        handleSize: 40,
        backgroundColor: '#f0f0f3',
        dataBackground: { lineStyle: { opacity: 0.6 }, areaStyle: { opacity: 0.2 } },
        fillerColor: 'rgba(63,81,181,0.20)',
        handleStyle: { color: '#3f51b5', borderColor: '#2e3a8c', borderWidth: 1 },
        moveHandleSize: 8,
      },
    ],
    series: [
      {
        name: 'A',
        type: 'line',
        data: dsA,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 18,
        lineStyle: { width: 2, color: '#4caf50' },   // 線條 → 綠色實色
        itemStyle: { color: 'rgba(76, 175, 80, 0.3)' }, // 點 → 綠色半透明
        sampling: 'lttb',
      },
      {
        name: 'B',
        type: 'line',
        data: dsB,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 18,
        lineStyle: { width: 2, color: '#2196f3' },   // 線條 → 藍色實色
        itemStyle: { color: 'rgba(33, 150, 243, 0.3)' }, // 點 → 藍色半透明
        sampling: 'lttb',
      },
    ],
  }), [labels, dsA, dsB]);


  useEffect(() => {
    if (!chartRef.current || instRef.current) return
    const inst = echarts.init(chartRef.current, 'light', { renderer: 'skia', width, height: CHART_HEIGHT })
    instRef.current = inst
    inst.setOption(option, { notMerge: true, lazyUpdate: true })

    // ✅ 點擊「任意 series 點」→ spotlight 該點
    const onSeriesClick = (params: any) => {
      if (params?.componentType !== 'series') return
      const dataIndex = params.dataIndex as number
      const seriesIndex = params.seriesIndex as number
      const value = Array.isArray(params.value) ? params.value[1] : params.value
      spotlightPoint(seriesIndex, dataIndex, value)
    }
    inst.on('click', onSeriesClick)

    return () => {
      inst.off('click', onSeriesClick)
      inst.dispose()
      instRef.current = null
    }
  }, [option, width])

  useEffect(() => {
    instRef.current?.resize({ width, height: CHART_HEIGHT })
    setSpot(null)
  }, [width])

  return (
    <ScrollView>
      <WsPaddingContainer
        padding={0}
        style={{ backgroundColor: $color.white, position: 'relative' }}
      >
        <SkiaChart ref={chartRef} />

        <XlsxDataTable
          selectedRow={selectedRow}
          selectedRowColor={selectedRowColor ?? undefined}
          selected={spot ? { seriesIndex: spot.seriesIndex as 0 | 1, dataIndex: spot.dataIndex } : null}
        />

        {/* ✅ Copilot 目標 */}
        {spot && (
          <CopilotStep
            name="chart.point.spotlight"
            order={1}
            text={`這是 ${labels[spot.dataIndex]} 的 ${spot.seriesIndex === 0 ? 'A' : 'B'} 系列數據`}
          >
            <WView
              style={{
                position: 'absolute',
                left: spot.x - 16,
                top: spot.y - 16,
                width: 32,
                height: 32,
                borderRadius: 16,
              }}
              pointerEvents="none"
            />
          </CopilotStep>
        )}

        {/* ✅ 額外遮罩：整張黑底 + 挖洞 */}
        {spot && (
          <Pressable
            style={{ position: 'absolute', left: 0, top: 0, width, height: CHART_HEIGHT }}
            onPress={() => {
              setSpot(null);              // ✅ 清掉點位 → selected 會自動變 null
              setSelectedRow(null);       // ✅ 清掉列高亮
              setSelectedRowColor(null);  // ✅ 清掉列顏色
            }}
          >
            <Svg width={width} height={CHART_HEIGHT}>
              <Defs>
                <Mask id="mask">
                  <Rect x="0" y="0" width={width} height={CHART_HEIGHT} fill="white" />
                  <Circle cx={spot.x} cy={spot.y} r={MASK_RADIUS} fill="black" />
                </Mask>
              </Defs>
              <Rect
                x="0" y="0" width={width} height={CHART_HEIGHT}
                fill="rgba(0,0,0,0.65)"
                mask="url(#mask)"
              />
              <Line
                x1={spot.x} y1={0} x2={spot.x} y2={CHART_HEIGHT}
                stroke="rgba(255,255,255,0.4)" strokeWidth={1} strokeDasharray="4 4"
              />
            </Svg>
          </Pressable>
        )}
      </WsPaddingContainer>
    </ScrollView>
  )
}
