import React, { useState } from 'react'
import {
  ScrollView,
  View,
  Dimensions,
  Text,
  TouchableOpacity
} from 'react-native'
import {
  WsPaddingContainer,
  WsText,
  WsInfo,
  WsModal,
  WsFlex,
  WsGradientButton,
  WsAccordion,
  WsTag,
  WsState,
} from '@/components'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import { useNavigation } from '@react-navigation/native'
import StepBar from './StepBar'
import ChecklistVersionBlock from '@/views/Statistics/Create/ChecklistVersionBlock'
import XlsxDataTable from './XlsxDataTable'
import FormulaTimeUnitList from './FormulaTimeUnitList'

/** —— 小型型別（可換成你專案內的正式型別） —— */
type FormulaRule = { id: string; expression: string; name?: string }
type ExcludeRule = { id: string; label: string; enabled: boolean }

/** —— 三步驟常數 —— */
const STEPS = {
  SELECT: 0,        // 1. 選擇題目
  BETWEEN: 1,       // 2. 題目之間的關係公式及剔除資料
  TIMEUNIT: 2,      // 3. 單位時間內的關係公式
} as const
type StepKey = keyof typeof STEPS

const StatisticsRecordCreate = () => {
  const { t } = useTranslation()
  const { width } = Dimensions.get('window')
  const navigation = useNavigation()

  /** —— Modal 狀態 —— */
  const [modalActiveFormula, setModalActiveFormula] = React.useState(false)  // 共用：編輯公式
  const [modalVisibleSourceData, setModalVisibleSourceData] = React.useState(false)

  /** —— 頁籤/步驟 —— */
  const [step, setStep] = React.useState<number>(STEPS.SELECT)

  /** —— Step2：題目間關係公式＋剔除規則 —— */
  const [betweenExpression, setBetweenExpression] = useState<string>('') // 例如：A+B-C
  const [excludeRules, setExcludeRules] = useState<ExcludeRule[]>([
    { id: 'ex1', label: t('忽略 A<=0'), enabled: false },
    { id: 'ex2', label: t('忽略 B 為空'), enabled: false },
  ])

  /** —— Step3：單位時間內的關係公式（多條） —— */
  const [rules, setRules] = useState<FormulaRule[]>([
    { id: '1', expression: 'sum(result)' },
    { id: '2', expression: 'avg(result)' },
  ])

  /** —— 導覽控制 —— */
  const maxStep = STEPS.TIMEUNIT
  const goNext = () => setStep(s => Math.min(s + 1, maxStep))
  const goPrev = () => setStep(s => Math.max(s - 1, 0))

  /** —— 表頭步驟條 —— */
  const stepItems = [
    { key: 's1', label: '1. 選擇題目' },
    { key: 's2', label: '2. 題目之間的關係公式及剔除資料' },
    { key: 's3', label: '3. 單位時間內的關係公式' },
  ]

  /** —— 底部導覽按鈕（統一處理） —— */
  const FooterNav = ({
    showPrev = true,
    showNext = true,
    nextText = t('下一步'),
    onNext = goNext,
  }: {
    showPrev?: boolean
    showNext?: boolean
    nextText?: string
    onNext?: () => void
  }) => (
    <WsFlex justifyContent="flex-end" style={{ marginTop: 16 }}>
      {/* 左一：取消/返回 */}
      {step === STEPS.SELECT ? (
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
          onPress={() => navigation.goBack()}
        >
          <WsText size={14} color={$color.gray}>{t('取消')}</WsText>
        </TouchableOpacity>
      ) : showPrev ? (
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
          onPress={goPrev}
        >
          <WsText size={14} color={$color.gray}>{t('上一步')}</WsText>
        </TouchableOpacity>
      ) : null}

      {/* 右一：下一步 / 完成 */}
      {showNext && (
        <WsGradientButton
          style={{ marginLeft: 8, width: width * 0.25 }}
          onPress={onNext}
        >
          {nextText}
        </WsGradientButton>
      )}
    </WsFlex>
  )

  return (
    <>
      <ScrollView>
        <View style={{ padding: 16 }}>
          {/* —— 頂部步驟條 —— */}
          <StepBar steps={stepItems} currentIndex={step} />

          {/* —— Step 1：選擇題目 —— */}
          {step === STEPS.SELECT && (
            <>
              <WsPaddingContainer style={{ marginTop: 8, backgroundColor: $color.white }}>
                {/* 基本資訊 */}
                <View style={{ marginTop: 8 }}>
                  <WsInfo labelWidth={100} label={t('名稱')} value={'Admin Name'} />
                </View>
                <View style={{ marginTop: 8 }}>
                  <WsInfo labelWidth={100} label={t('時間區間')} value={`${'YYYY-MM-DD'} ~ ${'YYYY-MM-DD'}`} />
                </View>
                <View style={{ marginTop: 8 }}>
                  <WsInfo labelWidth={100} label={t('時間單位')} value={'Time Unit'} />
                </View>
              </WsPaddingContainer>

              {/* 版本/題目選擇（沿用你的 Accordion + Block） */}
              <WsPaddingContainer style={{ marginTop: 8, backgroundColor: $color.white }}>
                <WsAccordion title="版本1" defaultOpen>
                  <WsText color={$color.gray}>表 1 內容…</WsText>
                </WsAccordion>

                <WsAccordion title="版本2">
                  <WsText color={$color.gray}>表 2 內容…</WsText>
                </WsAccordion>

                <WsAccordion
                  title={<Text style={{ fontSize: 14, fontWeight: '500' }}>版本 3</Text>}
                  defaultOpen
                  style={{ borderWidth: 1, borderRadius: 10 }}
                  contentStyle={{ backgroundColor: '#fff' }}
                >
                  <ChecklistVersionBlock
                    setModalVisibleSourceData={setModalVisibleSourceData}
                    setModalActiveFormula={setModalActiveFormula}
                  />
                </WsAccordion>

                <FooterNav />
              </WsPaddingContainer>
            </>
          )}

          {/* —— Step 2：題目之間的關係公式及剔除資料 —— */}
          {step === STEPS.BETWEEN && (
            <WsPaddingContainer style={{ marginTop: 8, backgroundColor: $color.white }}>
              {/* 基本資訊（可保留一致） */}
              <View style={{ marginTop: 8 }}>
                <WsInfo labelWidth={100} label={t('名稱')} value={'Admin Name'} />
              </View>
              <View style={{ marginTop: 8 }}>
                <WsInfo labelWidth={100} label={t('時間區間')} value={`${'YYYY-MM-DD'} ~ ${'YYYY-MM-DD'}`} />
              </View>
              <View style={{ marginTop: 8 }}>
                <WsInfo labelWidth={100} label={t('時間單位')} value={'Time Unit'} />
              </View>

              {/* A) 題目之間關係公式（用你現成的 WsState type="formula"） */}
              <WsAccordion title={t('題目之間的關係公式')} defaultOpen>
                <WsState
                  type="formula"
                  style={{ marginVertical: 8 }}
                  label={t('公式')}
                  placeholder={t('輸入')}
                  params={[
                    { key: 'A', value: 1, label: 'A 題目' },
                    { key: 'B', value: 2, label: 'B 題目' },
                    { key: 'C', value: 3, label: 'C 題目' },
                    { key: 'D', value: 4, label: 'D 題目' },
                  ]}
                  value={betweenExpression}
                  onChange={(p: any) => setBetweenExpression(p.expression)}
                />
              </WsAccordion>

              {/* B) 剔除資料規則（示意：用 WsTag 切換） */}
              <WsAccordion title={t('剔除資料規則')} defaultOpen>
                <WsFlex flexWrap="wrap" style={{ gap: 8 }}>
                  {excludeRules.map((r) => (
                    <TouchableOpacity
                      key={r.id}
                      onPress={() =>
                        setExcludeRules(xs =>
                          xs.map(x => (x.id === r.id ? { ...x, enabled: !x.enabled } : x))
                        )
                      }
                    >
                      <WsTag
                        backgroundColor={r.enabled ? $color.primary11l : $color.white2d}
                        textColor={r.enabled ? $color.primary : $color.gray}
                      >
                        {r.enabled ? `✓ ${r.label}` : r.label}
                      </WsTag>
                    </TouchableOpacity>
                  ))}
                </WsFlex>

                <TouchableOpacity
                  style={{ marginTop: 10 }}
                  onPress={() => setModalVisibleSourceData(true)}
                >
                  <WsTag>{t('預覽影響的資料')}</WsTag>
                </TouchableOpacity>
              </WsAccordion>

              <FooterNav />
            </WsPaddingContainer>
          )}

          {/* —— Step 3：單位時間內的關係公式 —— */}
          {step === STEPS.TIMEUNIT && (
            <WsPaddingContainer style={{ marginTop: 8, backgroundColor: $color.white }}>
              {/* 基本資訊（可保留一致） */}
              <View style={{ marginTop: 8 }}>
                <WsInfo labelWidth={100} label={t('名稱')} value={'Admin Name'} />
              </View>
              <View style={{ marginTop: 8 }}>
                <WsInfo labelWidth={100} label={t('時間區間')} value={`${'YYYY-MM-DD'} ~ ${'YYYY-MM-DD'}`} />
              </View>
              <View style={{ marginTop: 8 }}>
                <WsInfo labelWidth={100} label={t('時間單位')} value={'Time Unit'} />
              </View>

              {/* 清單：單位時間內的關係公式 */}
              <FormulaTimeUnitList
                rules={rules}
                onPreview={() => setModalVisibleSourceData(true)}
                onDelete={(r) => setRules(xs => xs.filter(x => x.id !== r.id))}
                onCreate={(expr) => setRules(xs => [{ id: String(Date.now()), expression: expr }, ...xs])}
                onEditFormula={() => setModalActiveFormula(true)}
              />

              {/* 版本（如有需要保留） */}
              <WsAccordion title="版本1" defaultOpen>
                <WsText color={$color.gray}>表 1 內容…</WsText>
              </WsAccordion>
              <WsAccordion title="版本2">
                <WsText color={$color.gray}>表 2 內容…</WsText>
              </WsAccordion>

              <FooterNav
                nextText={t('完成')}
                onNext={() => {
                  // TODO: 送出 API 或跳轉
                  // console.log({ betweenExpression, excludeRules, rules })
                  navigation.goBack()
                }}
              />
            </WsPaddingContainer>
          )}
        </View>
      </ScrollView >

      {/* —— Source Data 預覽 —— */}
      < WsModal
        animationType="none"
        visible={modalVisibleSourceData}
        onBackButtonPress={() => setModalVisibleSourceData(false)}
        headerLeftOnPress={() => setModalVisibleSourceData(false)}
        title={t('Source Data Table')}
      >
        <XlsxDataTable />
      </WsModal >

      {/* —— 共用：編輯公式（Step2/Step3 都可呼叫） —— */}
      < WsModal
        visible={modalActiveFormula}
        onBackButtonPress={() => setModalActiveFormula(false)}
        headerLeftOnPress={() => setModalActiveFormula(false)}
        headerRightOnPress={() => setModalActiveFormula(false)}
        headerRightText={t('送出')}
        title={t('編輯公式')}
      >
        <ScrollView>
          <WsPaddingContainer>
            <WsState
              type="formula"
              style={{ marginVertical: 8 }}
              label={t('公式')}
              placeholder={t('輸入')}
              params={[
                { key: 'A1', value: 456.25, label: '起始(小時)' },
                { key: 'A2', value: 472, label: '結束(小時)' },
                { key: 'kWh', value: 12000, label: '電力使用量' },
              ]}
              onChange={(p) => {
                // 這裡可依目前所在步驟把結果塞回對應狀態
                if (step === STEPS.BETWEEN) setBetweenExpression(p.expression)
                // 若是 Step3 也要編輯，就交給 FormulaTimeUnitList 內的 onEdit 去處理
              }}
            />
          </WsPaddingContainer>
        </ScrollView>
      </WsModal >
    </>
  )
}

export default StatisticsRecordCreate
