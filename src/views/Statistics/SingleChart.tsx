import React, { useRef, useEffect, useMemo, useState } from 'react'
import { View, Text, useWindowDimensions, TouchableOpacity } from 'react-native'
import * as echarts from 'echarts/core'
import { LineChart as ELineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components'
import { SkiaRenderer, SkiaChart } from '@wuba/react-native-echarts'
import $color from '@/__reactnative_stone/global/color'
import {
  WsPaddingContainer,
  WsModal
} from '@/components'
import { useTranslation } from 'react-i18next'
import SingleChartTrace, { SingleChartTraceRef } from './SingleChartTrace'

// ✅ 註冊 Skia renderer + 需要的元件
echarts.use([SkiaRenderer, ELineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent])

const CHART_HEIGHT = 300

type TipState = {
  x: number
  y: number
  payload: {
    category: string
    dataIndex: number
    series: Array<{ seriesName: string; value: number }>
  }
} | null

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max))

export default function SingleChart() {
  const { t, i18n } = useTranslation()
  const { width } = useWindowDimensions()
  const chartRef = useRef<any>(null)
  const instRef = useRef<echarts.EChartsType | null>(null)

  const [modalTraceData, setModalTraceData] = React.useState(false)
  const [tip, setTip] = useState<TipState>(null)

  const labels = useMemo(
    () => ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    []
  )
  // Demo 資料：正式版可換成你的實際資料
  const dsA = useMemo(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)), [])
  const dsB = useMemo(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)), [])

  const option = useMemo(() => ({
    animation: false,
    animationDurationUpdate: 150,
    animationEasingUpdate: 'quartOut',
    // tooltip: { 
    //   trigger: 'axis', 
    //   transitionDuration: 0, 
    //   axisPointer: { type: 'line', snap: true } 
    // },
    legend: { data: ['A', 'B'] },
    grid: {
      left: 40,
      right: 40,
      top: 28,
      bottom: 50
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: labels,
      axisLabel: {
        interval: 0,
        rotate: 30,
        margin: 12
      },
      axisTick: { alignWithLabel: true },
      name: '123',
      nameLocation: 'middle',
      nameGap: 40,
      splitLine: {
        show: true,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value} k'
      },
      name: '123',
      splitNumber: 4,
    },
    // dataZoom: [
    //   {
    //     type: 'slider',
    //     start: 0,
    //     end: 100,
    //     height: 28,
    //     bottom: 24,
    //     handleSize: 40,
    //     backgroundColor: '#f0f0f3',
    //     dataBackground: {
    //       lineStyle: {
    //         opacity: 0.6
    //       },
    //       areaStyle: {
    //         opacity: 0.2
    //       }
    //     },
    //     fillerColor: 'rgba(63,81,181,0.20)',
    //     handleStyle: {
    //       color: '#3f51b5',
    //       borderColor: '#2e3a8c', borderWidth: 1
    //     },
    //     moveHandleSize: 8,
    //   },
    // ],
    series: [
      {
        name: 'A',
        type: 'line',
        data: dsA,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 18,
        lineStyle: { width: 2 },
        sampling: 'lttb',
        emphasis: {
          focus: 'self'
        },
      },
      {
        name: 'B',
        type: 'line',
        data: dsB,
        showSymbol: true,
        symbol: 'circle',
        symbolSize: 18,
        lineStyle: { width: 2 },
        sampling: 'lttb',
        emphasis: {
          focus: 'self'
        },
      },
    ],
  }), [labels, dsA, dsB])

  // 依寬度/初始化建立 ECharts 實例 + 綁定事件
  useEffect(() => {
    if (!chartRef.current || instRef.current) return
    const inst = echarts.init(chartRef.current, 'light', {
      renderer: 'skia',
      width,
      height: CHART_HEIGHT,
    })
    instRef.current = inst
    inst.setOption(option, { notMerge: true, lazyUpdate: true })

    // ✅ 1) 整個圖表任意位置點擊（ZRender 層）：找到最近的 x 資料索引，一次取 A/B
    const zr = inst.getZr()
    const onZrClick = (e: any) => {
      const pt: [number, number] = [e.offsetX, e.offsetY]

      // 將像素座標轉回資料座標（以 seriesIndex 0 當座標系）
      const from = inst.convertFromPixel({ seriesIndex: 0 }, pt) as [number, number]
      // 類別軸會回傳接近的浮點 → 取最近整數並夾限
      let dataIndex = Math.round(from[0])
      dataIndex = clamp(dataIndex, 0, labels.length - 1)

      const category = labels[dataIndex]
      const aVal = dsA[dataIndex]
      const bVal = dsB[dataIndex]

      // 為了把 tooltip 放在「同一條垂直線」上，x 用相同 dataIndex，y 取較大值的位置
      const yTop = Math.max(aVal ?? -Infinity, bVal ?? -Infinity)
      const [px, py] = inst.convertToPixel({ seriesIndex: 0 }, [dataIndex, yTop]) as [number, number]

      setTip({
        x: px,
        y: py,
        payload: {
          category,
          dataIndex,
          series: [
            { seriesName: 'A', value: aVal },
            { seriesName: 'B', value: bVal },
          ],
        },
      })
    }
    zr.on('click', onZrClick)

    // ✅ 2) 點到實際資料點也保留（可與 ZR click 並存）
    const onSeriesClick = (params: any) => {
      if (params?.componentType !== 'series') return
      const value = Array.isArray(params.value) ? params.value[1] : params.value
      const dataIndex = params.dataIndex as number
      const category = params.name as string
      const aVal = dsA[dataIndex]
      const bVal = dsB[dataIndex]
      const yTop = Math.max(aVal ?? -Infinity, bVal ?? -Infinity)
      const [px, py] = inst.convertToPixel({ seriesIndex: 0 }, [dataIndex, yTop]) as [number, number]
      setTip({
        x: px,
        y: py,
        payload: {
          category,
          dataIndex,
          series: [
            { seriesName: 'A', value: aVal },
            { seriesName: 'B', value: bVal },
          ],
        },
      })
    }
    inst.on('click', onSeriesClick)

    // ✅ 3) 滑動 crosshair/拖曳 dataZoom 時，讓浮層跟著移動（可選）
    const onAxisPointer = (e: any) => {
      const info = e?.axesInfo?.[0]
      if (!info) return
      let dataIndex = clamp(Math.round(info.value), 0, labels.length - 1)
      const category = labels[dataIndex]
      const aVal = dsA[dataIndex]
      const bVal = dsB[dataIndex]
      const yTop = Math.max(aVal ?? -Infinity, bVal ?? -Infinity)
      const [px, py] = inst.convertToPixel({ seriesIndex: 0 }, [dataIndex, yTop]) as [number, number]
      setTip({
        x: px,
        y: py,
        payload: {
          category,
          dataIndex,
          series: [
            { seriesName: 'A', value: aVal },
            { seriesName: 'B', value: bVal },
          ],
        },
      })
    }
    inst.on('updateAxisPointer', onAxisPointer)

    return () => {
      zr.off('click', onZrClick)
      inst.off('click', onSeriesClick)
      inst.off('updateAxisPointer', onAxisPointer)
      inst.dispose()
      instRef.current = null
    }
  }, [option, width, labels, dsA, dsB])

  // 寬度改變時：resize 並暫時收起浮層（避免位置舊）
  useEffect(() => {
    instRef.current?.resize({ width, height: CHART_HEIGHT })
    setTip(null)
  }, [width])

  return (
    <>
      <WsPaddingContainer
        padding={0}
        style={{
          backgroundColor: $color.white,
          position: 'relative', // ✅ 讓自訂 tooltip 能絕對定位在容器內
        }}
      >
        {/* 若你的 app 有使用 RNGH，建議開啟 useRNGH：<SkiaChart ref={chartRef} useRNGH /> */}
        <SkiaChart ref={chartRef} />

        {/* 自訂可點 Tooltip（可依 UI 調整） */}
        {tip && (
          <View
            style={{
              position: 'absolute',
              // 簡單邊界保護，避免出框
              left: clamp(tip.x - 80, 8, width - 160 - 8),
              top: clamp(tip.y - 72, 8, CHART_HEIGHT - 100),
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
                {s.seriesName}: {s.value}
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

      {/* 新增流程 */}
      <WsModal
        animationType={'none'}
        visible={modalTraceData}
        onBackButtonPress={() => {
          setModalTraceData(false)
        }}
        headerLeftOnPress={() => {
          setModalTraceData(false)
        }}
        title={t('新增記錄')}
      >
        <SingleChartTrace></SingleChartTrace>
      </WsModal>

    </>
  )
}
