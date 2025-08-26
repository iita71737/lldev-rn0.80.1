import React, { useRef, useEffect, useState, useMemo, } from 'react'
import {
  ScrollView,
  View,
  Dimensions,
  SafeAreaView,
  Text,
  useWindowDimensions,
  TouchableOpacity,
  StyleSheet,
  TextInput
} from 'react-native'
import {
  WsIconBtn,
  WsTag,
  WsFlex,
  WsPaddingContainer,
  WsText,
  WsInfoUser,
  WsInfo,
  WsBottomSheet,
  WsBtn,
  WsCard,
  WsDes,
  WsIcon,
  WsModal,
  WsState,
  WsAccordion
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import AsyncStorage from '@react-native-community/async-storage'
import { useTranslation } from 'react-i18next'
import * as echarts from 'echarts/core';
import { LineChart as ELineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { SkiaRenderer, SkiaChart } from '@wuba/react-native-echarts'; // ✅ 重點：用 SkiaChart 或 SvgChart
import { WsGradientButton } from 'components'
import PickType from '@/views/Statistics/Create/PickType'

// ✅ 註冊 Renderer + 圖表 + 元件
echarts.use([SkiaRenderer, ELineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent]);

const SingleChart = () => {
  const { t, i18n } = useTranslation()
  const chartRef = useRef<any>(null);
  const instRef = useRef<echarts.EChartsType | null>(null);
  const { width } = useWindowDimensions();

  const labels = useMemo(
    () => ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    []
  );
  const dsA = useMemo(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)), []);
  const dsB = useMemo(() => Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)), []);

  const option = useMemo(() => ({
    animation: false,
    animationDurationUpdate: 150,
    animationEasingUpdate: 'quartOut',
    tooltip: { trigger: 'axis', transitionDuration: 0 },
    legend: { data: ['A', 'B'] },

    // ✅ 讓 grid 自動包含軸標籤，並適度增加 top/bottom
    grid: {
      left: 44,
      right: 40,
      top: 28,
      bottom: 90,
    },

    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: labels,
      axisLabel: {
        interval: 0,        // ⬅️ 強制顯示每一個標籤
        rotate: 30,         // ⬅️ 稍微旋轉避免重疊
        margin: 12,
      },
      axisTick: { alignWithLabel: true },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '{value} k' },
      splitNumber: 4,
    },
    // ⬅️ 用百分比讓初始視窗涵蓋 100% 資料，而不是 endValue: 5
    dataZoom: [
      // { type: 'inside', start: 0, end: 100, moveOnMouseMove: true, zoomOnMouseWheel: false, throttle: 50 },
      {
        type: 'slider',
        start: 0,
        end: 100,
        height: 28,        // ← 加高滑軌
        bottom: 24,        // ← 與圖底部留距離，避免貼邊難點
        handleSize: 40,    // ← 放大手把
        // 提升可視性
        backgroundColor: '#f0f0f3',
        dataBackground: { lineStyle: { opacity: 0.6 }, areaStyle: { opacity: 0.2 } },
        fillerColor: 'rgba(63,81,181,0.20)',
        handleStyle: { color: '#3f51b5', borderColor: '#2e3a8c', borderWidth: 1 },
        moveHandleSize: 8, // ← 提升拖移區域（ECharts 支援）
      },
    ],
    series: [
      { name: 'A', type: 'line', data: dsA, showAllSymbol: false, symbolSize: 3, sampling: 'lttb' },
      { name: 'B', type: 'line', data: dsB, showAllSymbol: false, symbolSize: 3, sampling: 'lttb' },
    ],
  }), [labels, dsA, dsB]);

  useEffect(() => {
    if (!chartRef.current || instRef.current) return;
    const inst = echarts.init(chartRef.current, 'light', { renderer: 'skia', width, height: 300 });
    instRef.current = inst;
    inst.setOption(option, { notMerge: true, lazyUpdate: true });
    return () => { instRef.current?.dispose(); instRef.current = null; };
  }, [option]);

  useEffect(() => {
    instRef.current?.resize({ width, height: 300 });
  }, [width]);

  return (
    <WsPaddingContainer
      padding={0}
      style={{
        paddingHorizontal: 16,
        backgroundColor: $color.white,
      }}
    >
      <SkiaChart ref={chartRef} />
    </WsPaddingContainer>
  )
}

export default SingleChart