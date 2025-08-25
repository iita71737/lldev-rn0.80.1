import React, { useRef, useEffect, useState, useMemo, } from 'react'
import {
  ScrollView,
  View,
  Dimensions,
  SafeAreaView,
  Text,
  useWindowDimensions,
  TouchableOpacity
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
// ✅ 註冊 Renderer + 圖表 + 元件
echarts.use([SkiaRenderer, ELineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent]);


const Show = () => {
  const { t, i18n } = useTranslation()
  const chartRef = useRef<any>(null);
  const instRef = useRef<echarts.EChartsType | null>(null);
  const { width } = useWindowDimensions();


  const [chartInfo, setChartInfo] = useState({
    name: '',
    chartType: 0,
    yAxisLabel: 'label',
    remark: ''
  });
  const [modalActive, setModalActive] = React.useState(false)
  const [modalActiveFormula, setModalActiveFormula] = React.useState(false)

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
    <>
      <ScrollView
        style={{
        }}
      >
        <WsPaddingContainer
          style={{
            backgroundColor: $color.white,
          }}>

          <WsFlex
            justifyContent="space-between"
            alignItems="flex-start"
            style={{
            }}
          >
            <WsText size={24} style={{ flex: 1 }}>
              {t('title')}
            </WsText>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'flex-end',
                marginLeft: 8,
              }}
            >
            </View>
          </WsFlex>
        </WsPaddingContainer>

        <WsPaddingContainer
          style={{
            marginTop: 8,
            backgroundColor: $color.white,
          }}
        >
          <WsIconBtn
            name="md-edit"
            size={24}
            style={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
            onPress={() => {
            }}
          />
          <View
            style={{
              marginTop: 8
            }}
          >
            <WsInfo
              labelWidth={100}
              label={t('名稱')}
              value={'Admin Name'}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            />
          </View>

          <View
            style={{
              marginTop: 8
            }}
          >
            <WsInfo
              labelWidth={100}
              type="user"
              label={t('管理者')}
              value={'Admin Name'}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            />
          </View>
          <View
            style={{
              marginTop: 8
            }}
          >
            <WsInfo
              labelWidth={100}
              label={t('時間區間')}
              value={
                `${'YYYY-MM-DD'} ~ ${'YYYY-MM-DD'}`
              }
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            />
          </View>
          <View
            style={{
              marginTop: 8
            }}
          >
            <WsInfo
              labelWidth={100}
              label={t('時間單位')}
              value={'Time Unit'}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            />
          </View>
          <View
            style={{
              marginTop: 8
            }}
          >
            <WsInfo
              labelWidth={100}
              label={t('題目類型')}
              value={'Question Type'}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            />
          </View>
        </WsPaddingContainer>


        <TouchableOpacity
          style={{
            marginTop: 8,
            marginLeft: 8,
            marginRight: 8,
            alignSelf: 'flex-end',
          }}
          onPress={() => {
            setModalActive(true)
          }}>
          <WsTag
            backgroundColor={$color.white}
            style={{
              borderWidth: 1,
              borderColor: $color.primary,
            }}>
            {t('新增圖')}
          </WsTag>
        </TouchableOpacity>

        <WsPaddingContainer
          padding={0}
          style={{
            marginTop: 8,
            backgroundColor: $color.white,
          }}
        >
          <WsFlex
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <WsIconBtn
              name="md-edit"
              size={24}
              style={{
              }}
              onPress={() => {
              }}
            />
            <TouchableOpacity
              style={{
              }}
              onPress={() => { }}>
              <WsTag
                style={{
                }}>
                {t('加入到概況')}
              </WsTag>
            </TouchableOpacity>
            <WsIconBtn
              name="md-update"
              size={24}
              style={{
              }}
              onPress={() => {
              }}
            />
          </WsFlex>
        </WsPaddingContainer>

        <WsPaddingContainer
          padding={0}
          style={{
            paddingHorizontal: 16,
            backgroundColor: $color.white,
          }}
        >
          <SkiaChart ref={chartRef} />
        </WsPaddingContainer>

        <WsPaddingContainer
          padding={0}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 16,
            backgroundColor: $color.white,
          }}
        >
          <View>
            <WsFlex
              flexWrap="wrap"
            >
              <WsDes>
                {t('表與表之間的關係公式 ( i + ii) * 100 + iii = Final')}
              </WsDes>
              <TouchableOpacity
                style={{
                  marginLeft: 8,
                }}
                onPress={() => {
                  setModalActiveFormula(true)
                }}>
                <WsTag
                  style={{
                  }}>
                  {t('編輯')}
                </WsTag>
              </TouchableOpacity>
            </WsFlex>
            <WsFlex
              flexWrap="wrap"
              style={{
                marginTop: 4
              }}
            >
              <WsDes>
                {t('表與表之間的關係公式 (i + ii) * 100 + iii = Final')}
              </WsDes>
              <TouchableOpacity
                style={{
                  marginLeft: 8,
                }}
                onPress={() => {
                  setModalActiveFormula(true)
                }}>
                <WsTag
                  style={{
                  }}>
                  {t('編輯')}
                </WsTag>
              </TouchableOpacity>
            </WsFlex>
          </View>
          <View
            style={{
              marginTop: 8,
              alignItems: 'flex-end',
            }}
          >
            <WsDes
              style={{
                fontStyle: 'italic',
              }}
            >
              {t('更新​時間：​YY​YY-MM-DD HH:mm:ss')}
            </WsDes>
          </View>
        </WsPaddingContainer>

        <View style={{ padding: 16, gap: 12 }}>
          <WsAccordion
            title="表 1"
            rightActions={
              <TouchableOpacity
                style={{
                }}
                onPress={() => { }}>
                <WsTag
                  style={{
                  }}>
                  {t('編輯')}
                </WsTag>
              </TouchableOpacity>
            }
            defaultOpen
          >
            <WsText color={$color.gray}>表 1 內容…</WsText>
          </WsAccordion>

          <WsAccordion
            title="表 2"
            rightActions={
              <TouchableOpacity
                style={{
                }}
                onPress={() => { }}>
                <WsTag
                  style={{
                  }}>
                  {t('編輯')}
                </WsTag>
              </TouchableOpacity>}
          >
            <WsText color={$color.gray}>表 2 內容…</WsText>
          </WsAccordion>

          <WsAccordion
            title={<WsText weight="700">表 3 名稱 / 公式名稱</WsText>}
            rightActions={
              <TouchableOpacity
                style={{
                }}
                onPress={() => { }}>
                <WsTag
                  style={{
                  }}>
                  {t('編輯')}
                </WsTag>
              </TouchableOpacity>
            }
            defaultOpen
          >
            {/* 子項：關係公式 + 小按鈕 */}
            <View style={{ gap: 10 }}>
              <WsFlex
                flexWrap="wrap"
              >
                <WsText>{'單位時間內的關係公式 sum(result)'}</WsText>
                <TouchableOpacity
                  style={{
                    marginLeft: 8,
                    marginRight: 8,
                  }}
                  onPress={() => { }}>
                  <WsTag
                    style={{
                    }}>
                    {t('匯出')}
                  </WsTag>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                  }}
                  onPress={() => { }}>
                  <WsTag
                    style={{
                    }}>
                    {t('圖')}
                  </WsTag>
                </TouchableOpacity>
              </WsFlex>

              <WsFlex
                flexWrap="wrap"
              >
                <WsText>{'單位時間內的關係公式 sum(result)'}</WsText>
                <TouchableOpacity
                  style={{
                    marginLeft: 8,
                    marginRight: 8,
                  }}
                  onPress={() => { }}>
                  <WsTag
                    style={{
                    }}>
                    {t('匯出')}
                  </WsTag>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                  }}
                  onPress={() => { }}>
                  <WsTag
                    style={{
                    }}>
                    {t('圖')}
                  </WsTag>
                </TouchableOpacity>
              </WsFlex>
            </View>

            {/* 巢狀版本列表 */}
            <View style={{ marginTop: 12, gap: 10 }}>
              <WsAccordion title="版本 1">
                <WsText color={$color.gray}>版本 1 內容…</WsText>
              </WsAccordion>

              <WsAccordion title="版本 2">
                <WsText color={$color.gray}>版本 2 內容…</WsText>
              </WsAccordion>

              <WsAccordion
                title="版本 3"
                defaultOpen
              >
                <WsText>{'題目之間的關係公式 (A - B) + (C - D) + E'}</WsText>
                <WsText>{'題目之間的關係公式 A + E'}</WsText>
              </WsAccordion>
            </View>
          </WsAccordion>
        </View>

      </ScrollView>

      {/* 新增與編輯上方圖表 */}
      <WsModal
        visible={modalActive}
        onBackButtonPress={() => {
          setModalActive(false)
        }}
        headerLeftOnPress={() => {
          setModalActive(false)
        }}
        headerRightOnPress={() => {
          // $_submit()
          setModalActive(false)
        }}
        // RightOnPressIsDisabled={$_validation()}
        headerRightText={t('送出')}
        title={t('編輯數量統計圖表')}
      >
        <ScrollView>
          <WsPaddingContainer>
            <WsState
              type="text"
              style={{
                marginVertical: 8
              }}
              label={t('圖​的​名稱')}
              value={chartInfo?.name}
              onChange={(name: string) => {
                setChartInfo((prev) => ({ ...prev, name }))
              }}
              rules={'required'}
              placeholder={t('輸入')}
            />
            <WsState
              type="picker"
              items={[
                {
                  label: t('折線圖'),
                  value: 'line'
                },
                {
                  label: t('長條圖'),
                  value: 'bar'
                }
              ]}
              style={{
                marginVertical: 8
              }}
              label={t('圖​的​類型')}
              value={chartInfo?.chartType}
              onChange={(chartType: number) => {
                setChartInfo((prev) => ({ ...prev, chartType }))
              }}
              rules={'required'}
              placeholder={t('輸入')}
            />
            <WsState
              type="text"
              style={{
                marginVertical: 8
              }}
              label={t('y軸​單​位​')}
              value={chartInfo?.yAxisLabel}
              onChange={(yAxisLabel: string) => {
                setChartInfo((prev) => ({ ...prev, yAxisLabel }))
              }}
              rules={'required'}
              placeholder={t('輸入')}
            />
            <WsState
              style={{
                marginTop: 8
              }}
              type="belongstomany"
              modelName={'act_status'}
              nameKey={'name'}
              label={t('資料集')}
              searchBarVisible={true}
              placeholder={'select...'}
              value={[]}
              onChange={() => { }}
            />
            <WsState
              style={{
                marginTop: 8,
              }}
              label={t('備注')}
              multiline={true}
              value={chartInfo?.remark}
              onChange={(remark: string) => {
                setChartInfo((prev) => ({ ...prev, remark }))
              }}
              rules={'required'}
              placeholder={t('輸入')}
            />
          </WsPaddingContainer>
        </ScrollView>
      </WsModal>

      {/* 編輯公式語公式名稱 */}
      <WsModal
        visible={modalActiveFormula}
        onBackButtonPress={() => {
          setModalActiveFormula(false)
        }}
        headerLeftOnPress={() => {
          setModalActiveFormula(false)
        }}
        headerRightOnPress={() => {
          // $_submit()
          setModalActiveFormula(false)
        }}
        // RightOnPressIsDisabled={$_validation()}
        headerRightText={t('送出')}
        title={t('編輯公式')}
      >
        <ScrollView>
          <WsPaddingContainer>
            <WsState
              type="formula"
              style={{
                marginVertical: 8
              }}
              label={t('公式​')}
              placeholder={t('輸入')}
              value={chartInfo?.formulaString}
              params={[
                { key: 'A1', value: 456.25, label: '起始(小時)' },
                { key: 'A2', value: 472, label: '結束(小時)' },
                { key: 'kWh', value: 12000, label: '電力使用量' },
              ]}
              onChange={(p) => console.log(p)}
            />
          </WsPaddingContainer>
        </ScrollView>
      </WsModal>

    </>

  )
}

export default Show