import React, { useState, useMemo, useCallback } from 'react'
import {
  ScrollView,
  View,
  Dimensions,
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
  WsState,
} from '@/components'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import { useNavigation } from '@react-navigation/native'
import StepBar from './StepBar'
import ChecklistVersionBlock from '@/views/Statistics/Create/ChecklistVersionBlock'
import XlsxDataTable from './XlsxDataTable'
import FormulaTimeUnitList from './FormulaTimeUnitList'
import { RAW_QUESTIONS } from './mock/questions'

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
  /** 題目清單（本檔實際有用到） */
  questions?: QuestionVM[]
}

/** —— 小型型別（可換成你專案內的正式型別） —— */
type FormulaRule = { id: string; expression: string; name?: string }
type ExcludeRule = { id: string; label: string; enabled: boolean }

/** —— 三步驟常數 —— */
const STEPS = {
  SELECT: 0,        // 1. 選擇題目
  BETWEEN: 1,       // 2. 題目之間的關係公式及剔除資料
  TIMEUNIT: 2,      // 3. 單位時間內的關係公式
} as const

const StatisticsRecordCreate = (props) => {
  const { t } = useTranslation()
  const { width } = Dimensions.get('window')
  const navigation = useNavigation()

  const _checklist = props?.route?.params?.checklist
  const _statisticsId = props?.route?.params?.statisticsId

  // states
  const [statistcsName, setStatisticsName] = React.useState(_checklist ? _checklist.name : '')

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
  const [rules, setRules] = useState<FormulaRule[]>([])

  // 1) 記住每個 section 的展開狀態（Accordion 受控，避免卸載）
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>({})
  const handleToggle = (id: string, open: boolean) => {
    setOpenSections(prev => ({ ...prev, [id]: open }))
  }

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

  const finishAndBack = useCallback(() => {
    navigation.goBack()
  }, [navigation])

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

  const [demoData] = React.useState<any>({})

  // 小型 ViewModel（畫面真正需要的欄位）
  type QuestionVM = {
    id: string;
    seq: string;
    title: string;
    type: string;          // 單選題…
    options: string[];     // ["正常", ...]
  };
  type RawQuestion = {
    id: string;
    sequence: string;
    title: string;
    last_version: {
      question_type_setting: { value: string; name: string };
      question_setting_items: Array<{ id: string; name: string }>;
    };
  };

  // 把 Raw → VM
  const projectQuestions = (rows: RawQuestion[]): QuestionVM[] =>
    rows.map(q => ({
      id: q.id,
      seq: q.sequence,
      title: q.title,
      type: q.last_version?.question_type_setting?.name ?? '',
      options: (q.last_version?.question_setting_items ?? []).map(o => o.name),
    }))

  // 如果三個版本要分不同題目：用 slice 分配；或都放同一份就直接塞同個陣列。
  const qAll = useMemo(() => projectQuestions(RAW_QUESTIONS), [])
  const qV1 = useMemo(() => qAll.slice(0, 5), [qAll])    // 版本1 前5筆
  const qV2 = useMemo(() => qAll.slice(5, 10), [qAll])   // 版本2 中5筆
  const qV3 = useMemo(() => qAll.slice(10), [qAll])      // 版本3 其餘

  const sections = useMemo<SectionItem[]>(() => [
    {
      id: 'v1',
      title: <WsText weight="700">版本1</WsText>,
      defaultOpen: false,
      showEdit: true,
      info: { label: '已選擇題目', value: ' ', labelWidth: 100 },
      formulas: [
        { label: '公式名稱 sum(result)', exportable: true, chartable: true, chartLabel: '圖' },
        { label: '公式名稱 sum(result)', exportable: true, chartable: true, chartLabel: '圖' },
      ],
      questions: qV1,   // ← 塞進來
    },
    {
      id: 'v2',
      title: <WsText weight="700">版本2</WsText>,
      defaultOpen: false,
      showEdit: true,
      info: { label: '點檢表', value: '點檢表名稱title', labelWidth: 100 },
      formulas: [
        { label: '公式名稱 sum(result)', exportable: true, chartable: true, chartLabel: '圖' },
        { label: '公式名稱 sum(result)', exportable: true, chartable: true, chartLabel: '圖' },
      ],
      questions: qV2,
    },
    {
      id: 'v3',
      title: <WsText weight="700">版本3</WsText>,
      defaultOpen: false,
      showEdit: true,
      info: { label: '點檢表', value: '點檢表名稱title', labelWidth: 100 },
      formulas: [
        { label: '公式名稱 sum(result)', exportable: true, chartable: true, chartLabel: '圖' },
        { label: '公式名稱 sum(result)', exportable: true, chartable: true, chartLabel: '圖' },
      ],
      questions: qV3,
    },
  ], [qV1, qV2, qV3])

  return (
    <>
      <ScrollView>
        <View style={{ padding: 16 }}>
          {/* —— 頂部步驟條 —— */}
          <StepBar steps={stepItems} currentIndex={step} />

          {/* —— 步驟專屬：基本資訊 / 功能塊 —— */}
          {step === STEPS.SELECT && (
            <WsPaddingContainer style={{ marginTop: 8, backgroundColor: $color.white }}>
              {/* 基本資訊 */}
              <View style={{ marginTop: 8 }}>
                <WsInfo labelWidth={100} label={t('名稱')} value={demoData?.name} />
              </View>
              <View style={{ marginTop: 8 }}>
                <WsInfo labelWidth={100} label={t('時間區間')} value={`${demoData?.start_time} ~ ${demoData?.end_time}`} />
              </View>
              <View style={{ marginTop: 8 }}>
                <WsInfo labelWidth={100} label={t('時間單位')} value={demoData?.time_interval === 'day' ? t('日') : t('')} />
              </View>

              {/* Step1 only: 資料集名稱（題型已移除） */}
              <WsState
                style={{ marginTop: 8 }}
                label={t('資料集名稱')}
                value={statistcsName}
                onChange={(e) => setStatisticsName(e)}
                rules={'required'}
                placeholder={t('輸入')}
              />
            </WsPaddingContainer>
          )}

          {step === STEPS.BETWEEN && (
            <WsPaddingContainer style={{ marginTop: 8, backgroundColor: $color.white }}>
              {/* 基本資訊 */}
              <View style={{ marginTop: 8 }}>
                <WsInfo labelWidth={100} label={t('名稱')} value={demoData?.name} />
              </View>
              <View style={{ marginTop: 8 }}>
                <WsInfo labelWidth={100} label={t('時間區間')} value={`${demoData?.start_time} ~ ${demoData?.end_time}`} />
              </View>
              <View style={{ marginTop: 8 }}>
                <WsInfo labelWidth={100} label={t('時間單位')} value={demoData?.time_interval === 'day' ? t('日') : t('')} />
              </View>
            </WsPaddingContainer>
          )}

          {step === STEPS.TIMEUNIT && (
            <>
              <WsPaddingContainer style={{ marginTop: 8, backgroundColor: $color.white }}>
                {/* 基本資訊 */}
                <View style={{ marginTop: 8 }}>
                  <WsInfo labelWidth={100} label={t('名稱')} value={demoData?.name} />
                </View>
                <View style={{ marginTop: 8 }}>
                  <WsInfo labelWidth={100} label={t('時間區間')} value={`${demoData?.start_time} ~ ${demoData?.end_time}`} />
                </View>
                <View style={{ marginTop: 8 }}>
                  <WsInfo labelWidth={100} label={t('時間單位')} value={demoData?.time_interval === 'day' ? t('日') : t('')} />
                </View>
              </WsPaddingContainer>

              {/* 清單：單位時間內的關係公式（Step3 only） */}
              <FormulaTimeUnitList
                rules={rules}
                onPreview={() => setModalVisibleSourceData(true)}
                onDelete={(r) => setRules(xs => xs.filter(x => x.id !== r.id))}
                onCreate={(expr) => setRules(xs => [{ id: String(Date.now()), expression: expr }, ...xs])}
                onEditFormula={() => setModalActiveFormula(true)}
                statisticsId={_statisticsId}
                sections={sections}
                step={STEPS.TIMEUNIT}
              />
            </>
          )}

          {/* —— 共用：版本/題目區（只渲染一次） —— */}
          <WsPaddingContainer style={{ marginTop: 8, backgroundColor: $color.white }}>
            {sections.map(section => {
              const isOpen = openSections[section.id] ?? !!section.defaultOpen
              return (
                <WsAccordion
                  key={section.id}
                  title={section.title}
                  open={isOpen}
                  onOpenChange={(open: boolean) => handleToggle(section.id, open)}
                >
                  <ChecklistVersionBlock
                    setModalVisibleSourceData={setModalVisibleSourceData}
                    step={step}
                    section={section}
                    statisticsId={_statisticsId}
                    isOpen={isOpen}
                  />
                </WsAccordion>
              )
            })}

            <FooterNav
              showPrev={step !== STEPS.SELECT}
              nextText={step === STEPS.TIMEUNIT ? t('完成') : t('下一步')}
              onNext={step === STEPS.TIMEUNIT ? finishAndBack : goNext}
            />
          </WsPaddingContainer>
        </View>
      </ScrollView>

      {/* —— Source Data 預覽 —— */}
      <WsModal
        animationType="none"
        visible={modalVisibleSourceData}
        onBackButtonPress={() => setModalVisibleSourceData(false)}
        headerLeftOnPress={() => setModalVisibleSourceData(false)}
        title={t('Source Data Table')}
      >
        <XlsxDataTable />
      </WsModal>

      {/* —— 共用：編輯公式（Step2/Step3 都可呼叫） —— */}
      <WsModal
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
                if (step === STEPS.BETWEEN) setBetweenExpression(p.expression)
              }}
            />
          </WsPaddingContainer>
        </ScrollView>
      </WsModal>
    </>
  )
}

export default StatisticsRecordCreate
