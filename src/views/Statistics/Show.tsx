import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react'
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
  WsAccordion,
  WsGradientButton,
  LlSectionList
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import AsyncStorage from '@react-native-community/async-storage'
import { useTranslation } from 'react-i18next'
import * as echarts from 'echarts/core';
import { LineChart as ELineChart } from 'echarts/charts';
import { GridComponent, TooltipComponent, LegendComponent, DataZoomComponent } from 'echarts/components';
import { SkiaRenderer, SkiaChart } from '@wuba/react-native-echarts'; // ✅ 重點：用 SkiaChart 或 SvgChart
import { useNavigation } from '@react-navigation/native'
import PickType from '@/views/Statistics/Create/PickType'
import SingleChart from './SingleChart'
// import { SafeAreaView } from "react-native-safe-area-context";

/** — 資料模型 — */
export type ChipItem = {
  key: string
  label: string
  withInput?: boolean
}
export type FormulaRow = {
  label: string            // 例如：'公式名稱 sum(result)'
  exportable?: boolean     // 顯示「匯出」鈕
  chartable?: boolean      // 顯示「圖/圖表」鈕
  chartLabel?: string      // 「圖」或「圖表」
}
export type VersionBlock = {
  id: string
  title: string | React.ReactNode
  defaultOpen?: boolean
  /** 二選一：你可以直接塞 content（客製 JSX），或是用下方 textLines/chips 來產 */
  content?: React.ReactNode
  textLines?: string[]
  chips?: ChipItem[]
}
export type SectionItem = {
  id: string
  title: string | React.ReactNode
  defaultOpen?: boolean
  showEdit?: boolean
  /** 這區塊最上面的資訊區（可選） */
  info?: { label: string; value: string; labelWidth?: number }
  /** 中段的「公式列」們 */
  formulas?: FormulaRow[]
  /** 巢狀的版本清單 */
  versions?: VersionBlock[]
  /** 最單純：直接給 body（若有此值，會放在最前面） */
  body?: React.ReactNode
}

// ✅ 註冊 Renderer + 圖表 + 元件
echarts.use([SkiaRenderer, ELineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent]);

const Show = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const _id = props?.route?.params?.id || 'unknown'

  const [chartInfo, setChartInfo] = useState({
    name: '',
    chartType: 0,
    yAxisLabel: 'label',
    remark: ''
  });
  const [formulaData, setFormulaData] = useState();
  const [modalAddChartForm, setModalAddChartForm] = React.useState(false)
  const [modalActiveFormula, setModalActiveFormula] = React.useState(false)
  const [modalAddRecord, setModalAddRecord] = React.useState(false)
  const [modalChart, setModalChart] = React.useState(false)

  // Functions
  const $_setStorage = async () => {
    const _mockData = {
      name: "Test name1",
      owner: { name: 'test owner' },
      factory_tags: [{ name: 'tag1' }, { name: 'tag2' }],
      date_picker_type: 2,
      dynamic_data_time: 7,
      improvement_limited_period: 30,
      remark: "Test remark",
    }
    const _task = JSON.stringify(_mockData)
    await AsyncStorage.setItem('StatisticsEdit', _task)
  }

  // chips
  const [uChips, setUChips] = React.useState<ChipItem[]>([
    { key: 'A', label: '作廠版本測試', withInput: true },
    { key: 'B', label: 'ISO 14001', withInput: true },
    { key: 'C', label: '7.1 to 1mb', withInput: true },
    { key: 'D', label: 'wmv' },
    { key: 'E', label: 'webm', withInput: true },
  ]);

  /** WsAccordion */
  const sections = useMemo<SectionItem[]>(() => [
    {
      id: 's3',
      title: <WsText weight="700">自定義文案 3</WsText>,
      defaultOpen: false,
      showEdit: true,
      info: {
        label: '點檢表', value: '點檢表名稱title', labelWidth: 100
      },
      formulas: [
        {
          label: '公式名稱 sum(result)', exportable: true, chartable: true, chartLabel: '圖'
        },
        {
          label: '公式名稱 sum(result)', exportable: true, chartable: true, chartLabel: '圖'
        },
      ],
      versions: [
        {
          id: 'v3',
          title: '版本 3',
          defaultOpen: false,
          textLines: [
            '題目之間的關係公式 (A - B) + (C - D) + E',
            '題目之間的關係公式 A + E',
          ],
          chips: uChips,
        },
      ],
    },
    {
      id: 's4',
      title: (
        <WsFlex>
          <WsText weight="700">{`數量統計名稱 1  `}</WsText>
          <WsText size={12} weight="700" color={$color.danger}>已停止更新</WsText>
        </WsFlex>
      ),
      showEdit: true,
      formulas: [
        { label: '公式名稱 sum(result)', exportable: true, chartable: true, chartLabel: '圖表' },
      ],
    },
  ], [uChips])

  /** 事件處理（接到 SectionList 的回呼） */
  const onEditPress = useCallback((section: SectionItem) => {
    console.log('Edit section:', section.id)
  }, [])

  const onExportPress = useCallback((_section: SectionItem, row) => {
    console.log('Export:', row.label)
    // TODO: 你的匯出流程
  }, [])

  const onChartPress = useCallback((_section: SectionItem, row) => {
    console.log('Chart:', row.label)
    setModalChart(true) // ← 等同你原本 setModalChart(true)
  }, [])

  const removeChip = useCallback((key: string) => {
    setUChips((prev) => prev.filter((c) => c.key !== key))
  }, [])

  const onChipInputChange = useCallback((key: string, v: string) => {
    setUChips((prev) => prev.map((c) => (c.key === key ? { ...c, label: v } : c)))
  }, [])

  // -------------
  const [demoData, setDemoData] = React.useState([])
  const loadStatistics = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(`@statistics_data`);
      const parsed = JSON.parse(jsonValue);
      setDemoData(parsed);
    } catch (e) {
      console.error('讀取錯誤:', e);
    }
  };

  React.useEffect(() => {
    loadStatistics()
  }, [_id])

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={{
          }}
        >
          {/* <WsPaddingContainer
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
                {t(demoData.name)}
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
          </WsPaddingContainer> */}

          <WsPaddingContainer
            style={{
              marginTop: 8,
              backgroundColor: $color.white,
            }}
          >

            <WsFlex
              style={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <TouchableOpacity
                style={{
                }}
                onPress={() => {
                  setModalAddChartForm(true)
                }}>
                {/* <WsTag
                  backgroundColor={$color.white}
                  style={{
                    borderWidth: 1,
                    borderColor: $color.primary,
                  }}>
                  {t('停止更新')}
                </WsTag> */}
              </TouchableOpacity>

              <WsIconBtn
                name="md-edit"
                size={24}
                style={{
                }}
                onPress={async () => {
                  await $_setStorage()
                  navigation.navigate('StatisticsEdit')
                }}
              />
            </WsFlex>

            <View
              style={{
                marginTop: 8
              }}
            >
              <WsInfo
                labelWidth={100}
                label={t('名稱')}
                value={demoData?.name}
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
                label={t('狀態')}
                value={t('停止更新')}
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
                value={{
                  name: 'test user'
                }}
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
                  `${demoData?.start_time} ~ 
${demoData?.end_time}`
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
                value={demoData?.time_unit === 'day' ? t('天') : t('')}
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
                type={'users'}
                labelWidth={100}
                style={{
                  flexDirection: 'row',
                }}
                labelSize={14}
                label={t('檢閱成員')}
                value={[{ name: '成員1' }, { name: '成員2' }, { name: '成員3' }]}
              />
            </View>

            <View
              style={{
                marginTop: 8
              }}
            >
              <WsInfo
                labelWidth={100}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                label={t('限閱角色')}
                type={'belongstomany'}
                valueFontSize={14}
                value={[{ name: '角色1' }, { name: '角色2' }]}
              />
            </View>

            <View
              style={{
                marginTop: 8
              }}
            >
              <WsInfo
                labelWidth={100}
                label={t('備註')}
                value={
                  demoData?.remark ? demoData.remark : t('')
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
                type="filesAndImages"
                label={t('附件')}
                value={[]}
              />
            </View>

            <View
              style={{
                marginTop: 8
              }}
            >
              <WsInfo
                style={{
                }}
                type="tags"
                label={t('標籤')}
                value={demoData?.factory_tags ? demoData.factory_tags : []}
              />
            </View>
          </WsPaddingContainer>


          <TouchableOpacity
            style={{
              marginTop: 8,
              marginRight: 16,
              alignSelf: 'flex-end',
            }}
            onPress={() => {
              setModalAddChartForm(true)
            }}>
            <WsTag
              backgroundColor={$color.white}
              style={{
                borderWidth: 1,
                borderColor: $color.primary,
              }}>
              {t('新增圖表')}
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
                  setModalAddChartForm(true)
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
                  marginRight: 8
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
            <SingleChart
              timeUnit={demoData?.time_unit ? demoData.time_unit : 'month'}
              dsA={Array.from({ length: 30 }, () => Math.floor(Math.random() * 100))}
              dsB={Array.from({ length: 30 }, () => Math.floor(Math.random() * 100))}
              seriesNames={{ a: '收入', b: '成本' }}
              xAxisName="月份"
              yAxisName="金額"
              valueSuffix=" 萬"
            />

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

          <WsPaddingContainer
            padding={0}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 16,
            }}
          >
            <WsAccordion
              title={t("資料集之間的關係公式")}
              defaultOpen
            >
              <View>
                <WsFlex
                  flexWrap="wrap"
                >
                  <WsDes>
                    {t('公式名稱 ( i + ii) * 100 + iii = Final')}
                  </WsDes>
                </WsFlex>
                <WsFlex
                  flexWrap="wrap"
                >
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
                    marginTop: 8,
                  }}
                >
                  <WsDes>
                    {t('公式名稱 (i + ii) * 100 + iii = Final')}
                  </WsDes>
                </WsFlex>
                <WsFlex
                  flexWrap="wrap"
                >
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
                      {t('預覽')}
                    </WsTag>
                  </TouchableOpacity>
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
                      {t('刪除')}
                    </WsTag>
                  </TouchableOpacity>
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
                      {t('匯出')}
                    </WsTag>
                  </TouchableOpacity>
                </WsFlex>
              </View>
            </WsAccordion>
          </WsPaddingContainer>

          <View style={{ paddingHorizontal: 16 }}>
            <TouchableOpacity
              style={{
                marginTop: 8,
                alignSelf: 'flex-end',
              }}
              onPress={() => {
                setModalAddRecord(true)
              }}>
              <WsTag
                backgroundColor={$color.white}
                style={{
                  borderWidth: 1,
                  borderColor: $color.primary,
                }}>
                {t('新增資料集')}
              </WsTag>
            </TouchableOpacity>

            <LlSectionList
              sections={sections}
              onEditPress={onEditPress}
              onExportPress={onExportPress}
              onChartPress={onChartPress}
              onChipRemove={removeChip}
              onChipInputChange={onChipInputChange}
            />

          </View>
        </ScrollView>
      </SafeAreaView>

      {/* 新增與編輯上方圖表 */}
      <WsModal
        visible={modalAddChartForm}
        onBackButtonPress={() => {
          setModalAddChartForm(false)
        }}
        headerLeftOnPress={() => {
          setModalAddChartForm(false)
        }}
        headerRightOnPress={() => {
          // $_submit()
          setModalAddChartForm(false)
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
              label={t('圖的類型')}
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
              value={formulaData?.expression}
              params={[
                { question_id: 'A001', label: '題目A' },
                { question_id: 'A002', label: '題目B' },
                { question_id: 'A003', label: '題目C' },
              ]}
              records={[
                { time: "2025/08/01 1:00:00", 題目A: 1, 題目B: 2, 題目C: 3, 題目D: 4, 題目E: 5, question_id: 'A001' },
                { time: "2025/08/01 2:00:00", 題目A: 2, 題目B: 3, 題目C: 4, 題目D: 5, 題目E: 6, question_id: 'A002' },
                { time: "2025/08/01 3:00:00", 題目A: 3, 題目B: 4, 題目C: 5, 題目D: 6, 題目E: 7, question_id: 'A003' },
              ]}
              onChange={(p) =>
                setFormulaData(p)
              }
            />

            <WsState
              style={{
                marginVertical: 8
              }}
              label={t('公式名稱')}
              placeholder={t('輸入')}
              value={formulaData?.name}
              onChange={
                (name: string) => setFormulaData((prev) => ({ ...prev, name }))
              }
            />

            <WsState
              style={{
                marginVertical: 8
              }}
              label={t('結果欄位名稱')}
              placeholder={t('輸入')}
              value={formulaData?.resultFieldName}
              onChange={(resultFieldName: string) => {
                setFormulaData((prev) => ({ ...prev, resultFieldName }))
              }}
            />

            <WsState
              style={{
                marginVertical: 8
              }}
              label={t('結果單位')}
              placeholder={t('輸入')}
              value={formulaData?.resultFieldUnit}
              onChange={(resultFieldUnit: string) => {
                setFormulaData((prev) => ({ ...prev, resultFieldUnit }))
              }}
            />

            <WsState
              label={t('備註')}
              // labelIcon={'ws-outline-edit-pencil'}
              multiline={true}
              style={{
              }}
              placeholder={t('輸入')}
              value={formulaData?.remark}
              onChange={() => { }}
            />

            <WsState
              style={{
                marginTop: 8
              }}
              modelName="checklist_record_answer"
              type="Ll_filesAndImages"
              label={t('附件')}
              // labelIcon={'md-photo'}
              value={formulaData?.images}
              onChange={() => {
              }}
            />

          </WsPaddingContainer>
        </ScrollView>
      </WsModal>

      {/* 新增流程 */}
      <WsModal
        animationType={'none'}
        visible={modalAddRecord}
        onBackButtonPress={() => {
          setModalAddRecord(false)
        }}
        headerLeftOnPress={() => {
          setModalAddRecord(false)
        }}
        title={t('新增資料集')}
      >
        <PickType
          setModalAddRecord={setModalAddRecord}
          statisticsId={demoData?.id}
        ></PickType>
      </WsModal>

      {/* 公式圖表Modal */}
      <WsModal
        animationType={'none'}
        visible={modalChart}
        onBackButtonPress={() => {
          setModalChart(false)
        }}
        headerLeftOnPress={() => {
          setModalChart(false)
        }}
        title={t('Chart Demo')}
      >
        <SingleChart></SingleChart>
      </WsModal>

    </>
  )
}

export default Show


/* ===== 樣式 ===== */
const styles = StyleSheet.create({
  /* Chips */
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    marginTop: 4,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f7f9fb', borderWidth: 1, borderColor: '#d9dbe2',
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 6,
  },
  chipPrefix: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#e6eef6', alignItems: 'center', justifyContent: 'center',
    marginRight: 6,
  },
  chipPrefixTxt: { color: '#0b5aaa', fontSize: 12 },
  chipLabel: { color: '#111', maxWidth: 160 },
  chipSmallInput: {
    marginLeft: 6, borderWidth: 1, borderColor: '#d9dbe2',
    borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, minWidth: 40, backgroundColor: '#fff',
  },
  chipSmallInputTxt: { padding: 0, margin: 0, minWidth: 32, color: '#111' },
  chipClose: {
    marginLeft: 6, width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#e9edf2', alignItems: 'center', justifyContent: 'center',
  },
  chipCloseTxt: { color: '#111', fontSize: 14, lineHeight: 18 },

});