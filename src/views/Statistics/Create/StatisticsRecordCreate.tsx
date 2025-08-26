import React, { useState } from 'react'
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
  WsAccordion,
  WsGradientButton
} from '@/components'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import { useNavigation } from '@react-navigation/native'
import StepBar from './StepBar'
import ChecklistVersionBlock from '@/views/Statistics/Create/ChecklistVersionBlock'
import XlsxDataTable from './XlsxDataTable'
import FormulaTimeUnitList from './FormulaTimeUnitList'

const StatisticsRecordCreate = () => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()

  const [modalActiveFormula, setModalActiveFormula] = React.useState(false)
  const [modalVisibleSourceData, setModalVisibleSourceData] = React.useState(false)
  const [step, setStep] = React.useState(0)
  const [rules, setRules] = useState<FormulaRule[]>([
    { id: '1', expression: 'sum(result)' },
    { id: '2', expression: 'avg(result)' },
  ]);

  return (
    <>
      <ScrollView>
        <View style={{ padding: 16 }}>
          <StepBar
            steps={[
              { key: 's1', label: '設定題目' },
              { key: 's2', label: '單位時間公式' },
            ]}
            currentIndex={step}
          />

          {step === 0 && (
            <WsPaddingContainer
              style={{
                marginTop: 8,
                backgroundColor: $color.white,
              }}
            >
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

              <WsAccordion
                title="版本1"
                defaultOpen
              >
                <WsText color={$color.gray}>表 1 內容…</WsText>
              </WsAccordion>

              <WsAccordion
                title="版本2"
              >
                <WsText color={$color.gray}>表 2 內容…</WsText>
              </WsAccordion>

              <WsAccordion
                title={<Text style={{ fontSize: 14, fontWeight: '500' }}>版本 3</Text>}
                defaultOpen
                style={{ borderWidth: 1, borderRadius: 10 }}
                contentStyle={{ backgroundColor: '#fff' }} // 內容白底
              >
                <ChecklistVersionBlock
                  setModalVisibleSourceData={setModalVisibleSourceData}
                  setModalActiveFormula={setModalActiveFormula}
                />
              </WsAccordion>

              <WsFlex
                justifyContent={'flex-end'}
                style={{
                  marginTop: 16,
                }}
              >
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderColor: $color.gray,
                    borderRadius: 25,
                    borderWidth: 1,
                    width: width * 0.25,
                    alignItems: 'center'
                  }}
                  onPress={() => {
                    navigation.goBack()
                  }}
                >
                  <WsText
                    style={{
                      padding: 1
                    }}
                    size={14}
                    color={$color.gray}
                  >{t('取消')}
                  </WsText>
                </TouchableOpacity>

                <WsGradientButton
                  style={{
                    marginRight: 0,
                    width: width * 0.25,
                  }}
                  onPress={() => {
                    setStep(step + 1)
                  }}
                >
                  {t('下一步')}
                </WsGradientButton>
              </WsFlex>
            </WsPaddingContainer>
          )}

          {step === 1 && (
            <WsPaddingContainer
              style={{
                marginTop: 8,
                backgroundColor: $color.white,
              }}
            >
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

              {/* 子項：關係公式 + 小按鈕 */}
              <FormulaTimeUnitList
                rules={rules}
                onPreview={(r) => setModalVisibleSourceData(true)}
                onDelete={(r) => setRules((xs) => xs.filter((x) => x.id !== r.id))}
                onCreate={(expr) =>
                  setRules((xs) => [{ id: String(Date.now()), expression: expr }, ...xs])
                }
                onEditFormula={(r) => {
                  setModalActiveFormula(true)
                }}
              />

              <WsAccordion
                title="版本1"
                defaultOpen
              >
                <WsText color={$color.gray}>表 1 內容…</WsText>
              </WsAccordion>

              <WsAccordion
                title="版本2"
              >
                <WsText color={$color.gray}>表 2 內容…</WsText>
              </WsAccordion>

              <WsAccordion
                title={<Text style={{ fontSize: 14, fontWeight: '500' }}>版本 3</Text>}
                defaultOpen
                style={{ borderWidth: 1, borderRadius: 10 }}
                contentStyle={{ backgroundColor: '#fff' }} // 內容白底
              >
                <ChecklistVersionBlock
                  setModalVisibleSourceData={setModalVisibleSourceData}
                />
              </WsAccordion>

              <WsFlex
                justifyContent={'flex-end'}
                style={{
                  marginTop: 16,
                }}
              >
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderColor: $color.gray,
                    borderRadius: 25,
                    borderWidth: 1,
                    width: width * 0.25,
                    alignItems: 'center'
                  }}
                  onPress={() => {
                    navigation.goBack()
                  }}
                >
                  <WsText
                    style={{
                      padding: 1
                    }}
                    size={14}
                    color={$color.gray}
                  >{t('取消')}
                  </WsText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    marginLeft: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderColor: $color.gray,
                    borderRadius: 25,
                    borderWidth: 1,
                    width: width * 0.25,
                    alignItems: 'center'
                  }}
                  onPress={() => {
                    setStep(step - 1)
                  }}
                >
                  <WsText
                    style={{
                      padding: 1
                    }}
                    size={14}
                    color={$color.gray}
                  >{t('上一步')}
                  </WsText>
                </TouchableOpacity>

                <WsGradientButton
                  style={{
                    marginRight: 0,
                    width: width * 0.25,
                  }}
                  onPress={() => {
                    setStep(step + 1)
                  }}
                >
                  {t('下一步')}
                </WsGradientButton>
              </WsFlex>
            </WsPaddingContainer>
          )}

        </View>
      </ScrollView>

      <WsModal
        animationType={'none'}
        visible={modalVisibleSourceData}
        onBackButtonPress={() => {
          setModalVisibleSourceData(false)
        }}
        headerLeftOnPress={() => {
          setModalVisibleSourceData(false)
        }}
        title={t('Source Data Table')}
      >
        <XlsxDataTable></XlsxDataTable>
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
              // value={chartInfo?.formulaString}
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

export default StatisticsRecordCreate