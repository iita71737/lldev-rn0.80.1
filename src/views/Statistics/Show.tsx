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
  WsAccordion,
  WsGradientButton
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

// ✅ 註冊 Renderer + 圖表 + 元件
echarts.use([SkiaRenderer, ELineChart, GridComponent, TooltipComponent, LegendComponent, DataZoomComponent]);

const Show = () => {
  const { t, i18n } = useTranslation()
  const instRef = useRef<echarts.EChartsType | null>(null);
  const { width } = useWindowDimensions();
  const navigation = useNavigation()

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
  function Chip({
    prefix,
    label,
    onRemove,
    withInput,
    onInputChange,
  }: {
    prefix?: string;
    label: string;
    withInput?: boolean;
    onRemove?: () => void;
    onInputChange?: (v: string) => void;
  }) {
    return (
      <View style={styles.chip}>
        {!!prefix && (
          <View style={styles.chipPrefix}>
            <Text style={styles.chipPrefixTxt}>{prefix}</Text>
          </View>
        )}
        <Text style={styles.chipLabel} numberOfLines={1}>{label}</Text>
        {withInput && (
          <View style={styles.chipSmallInput}>
            <TextInput
              style={styles.chipSmallInputTxt}
              placeholder=""
              onChangeText={onInputChange}
            />
          </View>
        )}
      </View>
    );
  }

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
            onPress={async () => {
              await $_setStorage()
              navigation.navigate('StatisticsEdit')
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
              label={t('備註')}
              value={
                t('備注')
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
              value={[]}
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
          <SingleChart></SingleChart>
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
                {t('表與表之間的關係公式 (i + ii) * 100 + iii = Final')}
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
            title={<WsText weight="700">表 3</WsText>}
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
                <WsText color={$color.gray}>{'公式 sum(result)'}</WsText>
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
                  onPress={() => {
                    setModalChart(true)
                  }}>
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
                <WsText color={$color.gray}>{'公式 sum(result)'}</WsText>
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
                  onPress={() => {
                    setModalChart(true)
                  }}>
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
                <View>
                  <WsText size={12} color={$color.gray}>{'題目之間的關係公式 (A - B) + (C - D) + E'}</WsText>
                  <WsText size={12} color={$color.gray}>{'題目之間的關係公式 A + E'}</WsText>

                  {uChips.map((c, idx) => (
                    <Chip
                      key={c.key}
                      prefix={String.fromCharCode(65 + idx)} // A/B/C...
                      label={c.label}
                      withInput={c.withInput}
                      onRemove={() => removeChip(c.key)}
                      onInputChange={(v) => onChipInputChange?.(c.key, v)}
                    />
                  ))}
                </View>
              </WsAccordion>
            </View>
          </WsAccordion>
        </View>

      </ScrollView>

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
                { key: 'A1', value: 456.25, label: '起始(小時)' },
                { key: 'A2', value: 472, label: '結束(小時)' },
                { key: 'B1', value: 12000, label: '電力使用量' },
              ]}
              onChange={(p) =>
                setFormulaData(p)
              }
            />

            <WsState
              style={{
                marginVertical: 8
              }}
              label={t('公式名稱​')}
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
              label={t('結果​欄​位​名稱')}
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
              label={t('結果​單位​')}
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