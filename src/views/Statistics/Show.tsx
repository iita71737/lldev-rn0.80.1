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
  TextInput,
  FlatList
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
  LlSectionList,
  WsDialogDelete
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
import { records, params, params002, records002 } from "./Create/mock/records";
import dayjs from 'dayjs'
import S_FactoryStatisticGroup from '@/services/api/v1/factory_statistic_group'

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

  console.log(_id, '=_id=')

  const [loading, setLoading] = React.useState(true)
  const [demoData, setDemoData] = React.useState([{ "name": "測試用3", "owner": "bff06c0a-81ff-11ee-89b0-42010a8c000b", "date_picker_type": 2, "end_time": "2025-10-16", "start_time": "2025-08-16", "time_interval": "day", "users": ["bff0c481-81ff-11ee-89b0-42010a8c000b", "bff06c0a-81ff-11ee-89b0-42010a8c000b"], "user_factory_role_templates": [{ "id": "bff2af36-81ff-11ee-89b0-42010a8c000b", "name": "總管理者", "owner": { "id": "bff06c0a-81ff-11ee-89b0-42010a8c000b", "name": "蔡A辣", "avatar": "https://api.ll-esh-app.wasateam.com/api/user/avatar/1754365746fCn2w/5A0D3BA9-8F5E-47CE-B6D8-A869CCA6B93E.jpg?signature=98c856a75b992806a1ad706b1396db4339b07d04207ea1ea22ae77930f7d27b2" }, "scopes": ["dashboard-read", "organization-dashboard-read", "factory-dashboard-read", "llbroadcast-read", "act-read", "act-inquiry", "act-update-factory-tag", "alert-read", "alert-slove", "task-read", "task-create", "task-update-creator", "task-update-taker", "task-update", "task-check-taker", "task-delete-creator", "task-delete-taker", "task-delete", "contractor-read", "contractor-create", "contractor-update-creator", "contractor-update-owner", "contractor-update", "contractor-delete-creator", "contractor-delete-owner", "contractor-delete", "contractor-license-read", "contractor-license-create", "contractor-license-update-creator", "contractor-license-update-reminder", "contractor-license-update", "contractor-license-delete-creator", "contractor-license-delete-reminder", "contractor-license-delete", "contract-read", "contract-create", "contract-update-creator", "contract-update-owner", "contract-update", "contract-delete-creator", "contract-delete-owner", "contract-delete", "license-read", "license-create", "license-update-creator", "license-update-reminder", "license-update", "license-delete-creator", "license-delete-reminder", "license-delete", "internal-training-read", "internal-training-create", "internal-training-update-creator", "internal-training-update-principal", "internal-training-update", "internal-training-delete-creator", "internal-training-delete-principal", "internal-training-delete", "event-read", "event-create", "event-update-creator", "event-update-owner", "event-update", "event-delete-creator", "event-delete-owner", "event-delete", "contractor-enter-record-read", "contractor-enter-record-create", "contractor-enter-record-update-creator", "contractor-enter-record-update-owner", "contractor-enter-record-update", "contractor-enter-record-delete-creator", "contractor-enter-record-delete-owner", "contractor-enter-record-delete", "exit-checklist", "audit-read", "audit-create", "audit-update-creator", "audit-update-owner", "audit-update", "audit-delete-creator", "audit-delete-owner", "audit-delete", "audit-record", "auditee-record", "checklist-read", "checklist-create", "checklist-update-creator", "checklist-update-owner", "checklist-update", "checklist-delete-creator", "checklist-delete-owner", "checklist-delete", "checklist-record-checker", "checklist-record-manager", "checklist-review-record", "checklist-sample-record", "common-choice-read", "common-choice-create", "common-choice-update-owner", "common-choice-update", "common-choice-destroy-owner", "common-choice-destroy", "change-read", "change-create", "change-update-creator", "change-update-owner", "change-update", "change-delete-creator", "change-delete-owner", "change-delete", "change-record", "user-factory-manage", "role-read", "role-create", "role-update-creator", "role-update-owner", "role-update", "role-delete-creator", "role-delete-owner", "role-delete", "factory-manage", "sos-create", "app-apply", "factory-tag-read", "factory-tag-create", "factory-tag-update", "factory-tag-delete", "factory-effect-read", "factory-effect-create", "factory-effect-update", "factory-effect-delete", "qrcode-read", "qrcode-create", "qrcode-update", "qrcode-delete", "guideline-read", "guideline-history-read", "guideline-admin-read", "guideline-admin-create", "guideline-admin-update-owner", "guideline-admin-update", "guideline-admin-destroy-owner", "guideline-admin-destroy", "guideline-admin-release", "factory-translation-manage"], "scope_factories": [{ "id": "c6c9228a-5493-45d7-9e76-7116e514d407", "name": "ESGoal新莊廠", "factory": { "id": "9b720f8a-81ff-11ee-89b0-42010a8c000b", "name": "ESGoal台灣廠", "factory": { "id": "9b72209e-81ff-11ee-89b0-42010a8c000b", "name": "ESGoal集團", "factory": null } } }], "scope_factory_ids": ["c6c9228a-5493-45d7-9e76-7116e514d407"], "system_classes": [{ "id": "070dd076-9354-11ee-89b0-42010a8c000b", "name": "環保" }, { "id": "070dd213-9354-11ee-89b0-42010a8c000b", "name": "生產安全" }, { "id": "070dd18b-9354-11ee-89b0-42010a8c000b", "name": "勞工及職業病" }, { "id": "070dd10a-9354-11ee-89b0-42010a8c000b", "name": "專門領域" }, { "id": "070dd3da-9354-11ee-89b0-42010a8c000b", "name": "通用領域" }], "system_class_ids": [4, 7, 6, 5, 10], "system_subclasses": [{ "id": "071076a4-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970290907Hxye/%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=92e2de79f59870c095a20f86b32f91b7c6c0cafb97a13a17300c44a72b253361", "name": "空氣污染防治" }, { "id": "071076f7-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970291166yRtf/%E6%B0%B4%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=a6a7398e07bf6b21a3f7a69cadaa964af1a9c7a892c5fb8a2744409f6e9bdc8e", "name": "水污染防治" }, { "id": "07107744-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029106MXgKP/%E5%9B%BA%E9%AB%94%E5%BB%A2%E7%89%A9%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=4b212fb6aa6509693f16bdf1dbb00b70792a930791a5cde04cfff6374b334a1a", "name": "廢棄物清理" }, { "id": "0710778d-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/159702917197pRF/%E5%99%AA%E9%9F%B3%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=32d6a7e86a52eceff4a0ad7481987109be95b91e15e03d5e901d6ea21bbf6ac6", "name": "噪音污染管制" }, { "id": "071077d6-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029126OUp6b/%E5%9C%9F%E5%A3%A4%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=30e6c8de279241ab70f68a7f20b400faa7fc013d0ac724555096c89709b5bb58", "name": "土壤及地下水防治" }, { "id": "07107820-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1629862124R0fss/ll-esh-toxicity.png?signature=e3772e6e45c4e85ffa112a1f0b45936dda36bb0bb73ae4cd453ca1f6cbb61ad3", "name": "毒性及關注化學物質管理" }, { "id": "0710798b-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029226UcPd9/%E5%BB%BA%E7%AF%89%E6%B6%88%E9%98%B2.png?signature=0b8087b5385841655e0ae823ff11e8820d5bcf658d2a0e8638fd22f6210553bf", "name": "建築及消防安全管理" }, { "id": "071079d6-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1629862081HLVIU/ll-esh-poison.png?signature=58f04a2b7c3457ffef6ca823418ba1738b827f3c508c1c1814651bdf49598b2d", "name": "毒化物管理" }, { "id": "071078d5-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029246Lyb7U/%E5%8B%9E%E5%8B%95%E9%97%9C%E4%BF%82.png?signature=749a66e8d292ca2b4e57a4bca3e8d1012b51a9b61268145403c6327a15e878c6", "name": "勞動關係管理" }, { "id": "07107938-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029239w4xZJ/%E8%81%B7%E6%A5%AD%E7%97%85%E9%98%B2%E6%B2%BB.png?signature=ea5317e6c205e50ba0d246bb495b10e7c1ac91aa64f60ec1125af941a05385fa", "name": "職業安全衛生" }, { "id": "07107875-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1629861988AjY7F/ll-esh-food-safety.png?signature=0a8ca19f3b74323d3973aefd4f6b9a76a2bbab69e1a8619bf4f013df3a09c455", "name": "食品安全衛生" }, { "id": "07107a78-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1629861938rotMB/ll-esh-common.png?signature=2728bebf6a45f86e71ff5eda41b76a4e966003973e134a7143801b756d639e27", "name": "通用領域" }, { "id": "07107b33-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1644926708wQ7Zn/screenshot%202022-02-15%20%E4%B8%8B%E5%8D%885.17.28.png?signature=7393dd2499134980ac93a178db5795a6917df19dafc6671071435ed9e2129fc1", "name": "20220215測試新增子領域" }], "system_subclass_ids": [14, 15, 16, 17, 18, 19, 23, 24, 21, 22, 20, 26, 28], "is_default": 1, "role_type": "user_role" }, { "id": "bff2b05b-81ff-11ee-89b0-42010a8c000b", "name": "工程師", "owner": null, "scopes": ["dashboard-read", "llbroadcast-read", "act-read", "alert-read", "alert-slove", "task-read", "task-create", "task-update", "contractor-read", "contractor-create", "contractor-update", "license-read", "license-create", "internal-training-read", "internal-training-create", "event-read", "event-create", "event-update", "contractor-enter-record-read", "contractor-enter-record-create", "contractor-enter-record-update", "exit-checklist", "audit-read", "audit-create", "audit-update", "audit-record", "auditee-record", "checklist-read", "checklist-create", "checklist-update", "checklist-record-checker", "checklist-review-record", "change-read", "change-create", "change-update", "change-record", "app-apply", "task-check-taker"], "scope_factories": [], "scope_factory_ids": [], "system_classes": [], "system_class_ids": [], "system_subclasses": [], "system_subclass_ids": [], "is_default": 1, "role_type": "user_role" }], "factory_tags": [{ "id": "ce238274-89e7-4a55-9746-86f14e598336", "name": "Beautiful", "target": null, "sequence": "0" }, { "id": "bfea5afa-81ff-11ee-89b0-42010a8c000b", "name": "公司治理", "target": null, "sequence": "2" }, { "id": "a717924d-2c30-4402-b1b8-ecedd6d53096", "name": "HRqqqqqq", "target": null, "sequence": "2" }], "remark": "測試備註", "id": "tZXKS05HM1zVg4t1QvJIn", "created_at": "2025-10-21T02:47:51.102Z" }])

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

  // bottomSheet
  const [dialogVisible, setDialogVisible] = React.useState(false)
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const bottomSheetItems = React.useMemo(() => [
    {
      to: {
        name: 'StatisticsEdit',
        params: {
          id: _id
        }
      },
      icon: 'ws-outline-edit-pencil',
      label: t('編輯')
    },
    {
      onPress: () => {
        setDialogVisible(true)
      },
      color: $color.danger,
      labelColor: $color.danger,
      icon: 'ws-outline-delete',
      label: t('刪除')
    }
  ], [_id])
  // Function
  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
    }
  }

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight:
        _id ? () => {
          return (
            <>
              <WsIconBtn
                testID={'ws-outline-edit-pencil'}
                name="ws-outline-edit-pencil"
                size={24}
                color={$color.white}
                style={{
                  marginRight: 4
                }}
                onPress={() => {
                  $_setStorage()
                  setIsBottomSheetActive(true)
                }}
              />
            </>
          )
        } : undefined,
      headerLeft: () => (
        <WsIconBtn
          testID="backButton"
          name={'md-chevron-left'}
          color="white"
          size={32}
          style={{
            marginRight: 4
          }}
          onPress={() => {
            navigation.goBack()
          }}
        />
      )
    })
  }

  // Functions
  const $_setStorage = async () => {
    const _mockData = {
      roles: [...demoData?.user_factory_roles, ...demoData?.user_factory_role_templates],
      date_picker_type: demoData?.time_type === 'period' ? 2 : demoData?.time_type === 'latest' ? 1 : undefined,
      ...demoData
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
  const sections = useMemo<SectionItem[]>(() => {
    // ① 內層（日）假資料（以 2025-03 示意）
    const childLabels = Array.from({ length: 31 }, (_, i) => `2025-03-${String(i + 1).padStart(2, '0')}`);
    // 分子（日件數）
    const childA = [
      102, 98, 110, 108, 95, 120, 118, 106, 112, 101,
      115, 123, 119, 97, 105, 111, 108, 99, 126, 130,
      124, 118, 121, 109, 113, 117, 122, 128, 116, 114, 120
    ];
    // 母體（日件數）
    const childB = Array(childLabels.length).fill(410);

    const titleSuffix = '2025-03（外層 M0→M1 = 2.85%）';

    // ② 基礎統計
    const sum = (arr: number[]) => arr.reduce((a, b) => a + (Number(b) || 0), 0);
    const avg = (arr: number[]) => (arr.length ? sum(arr) / arr.length : 0);
    const to2 = (n: number) => Number(n.toFixed(2));

    const totalNumerator = sum(childA);          // 分子合計
    const totalDenominator = sum(childB);          // 母體合計
    const finalRatePct = to2((totalNumerator / Math.max(1, totalDenominator)) * 100);

    const avgNumDay = to2(avg(childA));            // 分子/日 平均
    const avgDenDay = to2(avg(childB));            // 母體/日 平均

    // 分子最高/最低日
    let maxIdx = 0, minIdx = 0;
    childA.forEach((v, i) => {
      if (v > childA[maxIdx]) maxIdx = i;
      if (v < childA[minIdx]) minIdx = i;
    });
    const maxDay = `${childLabels[maxIdx]}（${childA[maxIdx]}）`;
    const minDay = `${childLabels[minIdx]}（${childA[minIdx]}）`;

    // ③ Demo 公式列文字
    const f1Label = `日件數加總（分子/母體）`;
    const f2Label = `最終轉換率（分子÷母體）`;

    const s3: SectionItem = {
      id: 's3',
      title: <WsText weight="700">{titleSuffix || '資料集 v1.0'}</WsText>,
      defaultOpen: true,
      showEdit: true,
      info: { label: '點檢表', value: '月度風險監控報表', labelWidth: 60 },
      formulas: [
        {
          label: `${f1Label} = ${totalNumerator} / ${totalDenominator}`,
          exportable: true,
          chartable: true,
          chartLabel: '圖',
        },
        {
          label: `${f2Label} = ${totalNumerator} ÷ ${totalDenominator} × 100% = ${finalRatePct}%`,
          exportable: true,
          chartable: true,
          chartLabel: '圖',
        },
      ],
      versions: [
        {
          id: 'v3',
          title: '版本 3',
          defaultOpen: false,
          textLines: [
            `日平均（分子/母體）：${avgNumDay} / ${avgDenDay}`,
            `分子最高日：${maxDay}`,
            `分子最低日：${minDay}`,
            `最終轉換率（當月）：${finalRatePct}%`,
          ],
          chips: [
            { key: 'kpi', label: 'KPI：當月轉換率 ≥ 2.8%' },
            { key: 'owner', label: '負責人：OPS-01' },
            { key: 'note', label: '備註：月初加碼活動', withInput: true },
          ],
        },
      ],
    };

    const s4: SectionItem = {
      id: 's4',
      title: (
        <WsFlex>
          <WsText weight="700">{`數量統計名稱 1  `}</WsText>
          <WsText size={12} weight="700" color={'#E11D48'}>已停止更新</WsText>
        </WsFlex>
      ),
      showEdit: true,
      formulas: [
        {
          label: `當月分子合計：${totalNumerator}（依日拆解加總）`,
          exportable: true,
          chartable: true,
          chartLabel: '圖表',
        },
      ],
    };

    return [s3];
  }, []);


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

  const $_renewedOnPress = async () => {
    if (demoData?.is_renewed) {
      try {
        const res = await S_FactoryStatisticGroup.startRenewed({
          modelId: _id
        }).then(res => {
          console.log(res, 'res')
          setDemoData(res)
        })
      } catch (err) {
        console.error(err, 'sample create Error')
      }
    } else {
      try {
        const res = await S_FactoryStatisticGroup.stopRenewed({
          modelId: _id
        }).then(res => {
          console.log(res, 'res')
          setDemoData(res)
        })
      } catch (err) {
        console.error(err, 'sample create Error')
      }
    }
  }

  // Services
  const $_fetchFactoryStatisticGroup = async () => {
    try {
      const res = await S_FactoryStatisticGroup.show({
        modelId: _id
      })
      setDemoData(res)
      setLoading(false)
    }
    catch (e) {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    $_setNavigationOption()
    $_fetchFactoryStatisticGroup()
  }, [_id])


  // —— Demo：彙總數值（可改成你實際計算邏輯）——
  // 假資料（已有的兩條線）
  const formulas = [
    {
      id: 'f-m0m1',
      title: t('公式名稱1: M0→M1 滾動率（%）'),
      lines: [
        t('定義：當月由 M0 轉入 M1 的比率（%），常用作漏斗第一段健康度指標'),
      ],
    },
    {
      id: 'f-m1m2',
      title: t('公式名稱2: M1→M2 滾動率（%）'),
      lines: [
        t('定義：當月由 M1 轉入 M2 的比率（%），反映使用者第二段留存/深化'),
      ],
    },
  ];
  const renderItem = ({ item }: { item: FormulaItem }) => {
    return (
      <View style={styles.card}>
        {/* 標題列 */}
        <Text
          style={{
            paddingTop: 16,
            paddingHorizontal: 16,
          }}
        >
          {`公式名稱:`}
        </Text>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={2}>
            {`${item.name}`}
          </Text>

          <WsFlex justifyContent={"space-between"}>
            <View style={styles.actionBar}>
              <WsIconBtn
                padding={0}
                style={{
                }}
                size={28}
                name="md-edit"
                label="編輯"
                onPress={() =>
                  setModalActiveFormula(true)
                }
              />
              <WsIconBtn
                padding={0}
                style={{ marginLeft: 8 }}
                size={28}
                name="ws-outline-filter-outline"
                label="瀏覽並刪除資料"
                onPress={() => onPreviewAndDeleteData(true)}
              />
              <WsIconBtn
                padding={0}
                style={{ marginLeft: 8 }}
                size={28}
                color={$color.danger}
                name="md-delete"
                label="刪除"
                onPress={() => handleDelete(item)}
              />
            </View>
          </WsFlex>
        </View>


        <Text
          style={{
            paddingTop: 16,
            paddingHorizontal: 16,
          }}
        >
          {`公式:`}
        </Text>
        <View style={styles.formulaRow}>
          <Text style={styles.formula} numberOfLines={2}>
            {item.formulaString}
          </Text>
        </View>

        {/* 內容（收合） */}
        {Array.isArray(item.formula_used_params) && item.formula_used_params.length > 0 && (
          <View style={{ paddingTop: 16, paddingHorizontal: 16, paddingBottom: 12 }}>
            <Text style={{ color: "#0d0d0dff", marginBottom: 4 }}>使用的參數：</Text>
            {item.formula_used_params.map((p, i) => (
              <Text key={`${item.id}-p-${p.key}-${i}`} style={{ fontSize: 12, color: "#333" }}>
                • {p.customLabel || p.label}
              </Text>
            ))}
          </View>
        )}

      </View>
    );
  };

  return (
    <>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          style={{
          }}
        >

          <WsPaddingContainer
            style={{
              marginTop: 8,
              backgroundColor: $color.white,
            }}
          >

            <WsFlex
              style={{
                position: 'absolute',
                right: 16,
                top: 8,
              }}
            >
              <TouchableOpacity
                style={{
                }}
                onPress={() => {
                  $_renewedOnPress()
                }}>
                <WsTag
                  backgroundColor={$color.white}
                  style={{
                    borderWidth: 1,
                    borderColor: $color.primary,
                  }}>
                  {t('停止更新')}
                </WsTag>
              </TouchableOpacity>

              {/* <WsIconBtn
                name="md-edit"
                size={24}
                style={{
                }}
                onPress={async () => {
                  await $_setStorage()
                  navigation.navigate('StatisticsEdit')
                }}
              /> */}
            </WsFlex>

            <View
              style={{
                marginTop: 8
              }}
            >
              <WsInfo
                labelWidth={100}
                label={t('名稱')}
                value={demoData?.name ? demoData?.name : 'Demo Title'}
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
                value={demoData?.is_renewed === 1 ? t('更新中') : t('停止更新')}
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
                value={demoData?.owner ? demoData?.owner : {}}
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
                  `${demoData?.start_time ? moment(demoData?.start_time).format('YYYY-MM-DD HH:mm:ss') : '2025-01-01'} ~ 
${demoData?.end_time ? moment(demoData?.end_time).format('YYYY-MM-DD HH:mm:ss') : '2025-12-31'}`
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
                value={
                  demoData?.time_interval === 'day' ? t('日') :
                    demoData?.time_interval === 'week' ? t('週') :
                      demoData?.time_interval === 'month' ? t('月') :
                        demoData?.time_interval === 'season' ? t('季') :
                          demoData?.time_interval === 'year' ? t('年') : t('無')
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
                type={'users'}
                labelWidth={100}
                style={{
                  flexDirection: 'row',
                }}
                labelSize={14}
                label={t('檢閱成員')}
                value={demoData?.users ? demoData?.users : []}
              />
            </View>

            {
              ((demoData.user_factory_roles &&
                demoData.user_factory_roles?.length > 0) ||
                (demoData.user_factory_role_templates &&
                  demoData.user_factory_role_templates?.length > 0)) ? (
                <View
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsInfo
                    type={'belongstomany'}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    label={t('權限-依角色')}
                    valueFontSize={14}
                    value={[...demoData?.user_factory_roles, ...demoData?.user_factory_role_templates]}
                  />
                </View>
              ) : (
                <View
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsInfo
                    labelWidth={180}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    label={t('權限-依角色')}
                    valueFontSize={14}
                    value={t('無')}
                  />
                </View>
              )}

            <View
              style={{
                marginTop: 8
              }}
            >
              <WsInfo
                labelWidth={100}
                label={t('備註')}
                value={
                  demoData?.remark ? demoData.remark : t('測試備注')
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
                value={demoData?.attaches}
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
                marginTop: 16,
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
              timeUnit="month"
              labelCount={12}                       // 12個月
              dsA={[2.1, 2.4, 2.0, 2.6, 2.9, 3.1, 2.8, 3.0, 3.3, 3.2, 3.4, 3.1]} // M0→M1 (%)
              dsB={[0.9, 1.1, 1.0, 1.2, 1.4, 1.6, 1.3, 1.5, 1.7, 1.6, 1.8, 1.7]} // M1→M2 (%)
              seriesNames={{ a: 'M0→M1 滾動率', b: 'M1→M2 滾動率' }}
              xAxisName="月份"
              yAxisName="比率"
              valueSuffix=" %"
            />

            <SingleChart
              timeUnit="day"
              labelCount={31}          // 會自動產生 1日 ~ 31日
              dsA={[
                12, 15, 14, 18, 20, 22, 25,
                23, 21, 19, 17, 16, 18, 20,
                21, 23, 24, 26, 28, 27, 25,
                24, 22, 21, 20, 19, 18, 17,
                16, 15, 14,
              ]}
              dsB={[
                10, 11, 13, 14, 16, 18, 19,
                18, 17, 16, 15, 14, 15, 16,
                18, 19, 20, 22, 23, 22, 21,
                20, 19, 18, 17, 16, 15, 14,
                13, 12, 11,
              ]}
              seriesNames={{ a: 'A線(日平均)', b: 'B線(日平均)' }}
              xAxisName="日期"
              yAxisName="數值"
              valueSuffix=""
            />

            <SingleChart
              timeUnit="day"
              labels={Array.from({ length: Array.from({ length: 90 }, (_, i) => 20 + Math.sin(i / 5) * 5 + i * 0.1).length }, (_, i) =>
                dayjs('2025-01-01').add(i, 'day').format('MM/DD') // 01/01, 01/02, ..., 03/31
              )}
              dsA={Array.from({ length: 90 }, (_, i) => 20 + Math.sin(i / 5) * 5 + i * 0.1)}   // 長度 90 的 array
              dsB={Array.from({ length: 90 }, (_, i) => 18 + Math.cos(i / 7) * 4)}   // 長度 90 的 array
              xAxisName="日期"
              yAxisName="數值"
              valueSuffix=""
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
            style={{ paddingHorizontal: 16, paddingVertical: 16 }}
          >
            <WsAccordion title={t('資料集之間的關係公式')} defaultOpen>
              <View>
                {formulas.map(block => (
                  <View key={block.id} style={{ marginBottom: 16 }}>
                    {/* 標題 */}
                    <WsFlex flexWrap="wrap">
                      <WsText>{block.title}</WsText>
                    </WsFlex>

                    {/* 明細敘述 */}
                    <WsFlex flexWrap="wrap" style={{ marginTop: 8 }}>
                      {block.lines.map((line, idx) => (
                        <WsDes key={idx} style={{ width: '100%', marginTop: idx ? 4 : 0 }}>
                          {line}
                        </WsDes>
                      ))}
                    </WsFlex>
                  </View>
                ))}
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

            {/* <LlSectionList
              sections={sections}
              onEditPress={onEditPress}
              onExportPress={onExportPress}
              onChartPress={onChartPress}
              onChipRemove={removeChip}
              onChipInputChange={onChipInputChange}
            /> */}

            {sections.map(section => (
              <WsAccordion
                key={section.id}
                title={section.title}
                defaultOpen={section.defaultOpen}
              >
                <WsPaddingContainer
                  padding={0}
                  style={{
                    marginTop: 8,
                    backgroundColor: $color.white,
                    borderRadius: 10,
                  }}
                >
                  <WsFlex
                    justifyContent={"space-between"}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                    }}
                  >
                    <Text style={styles.screenTitle}>題目之間的關係公式</Text>
                  </WsFlex>

                  <FlatList
                    data={[{ "id": "1761111896201", "name": "最大值", "formulaString": "MAX(Cc v3,Did v4)", "chips": [], "expanded": false, "formula_used_params": [{ "key": "1224e3b4-9a67-4c08-a6ec-9805a50b624e", "label": "混凝池（快混）-pH值 v3", "customLabel": "Cc v3" }, { "key": "e2889124-a75e-422d-b29f-82001adca605", "label": "袋式集塵器-廢氣風量、溫度 v3", "customLabel": "Did v4" }] }]}
                    keyExtractor={(it) => it.id}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                    scrollEnabled={false}
                  />
                </WsPaddingContainer>
              </WsAccordion>
            ))}

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
              params={params002}
              records={records002}
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

      <WsBottomSheet
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        items={bottomSheetItems}
        snapPoints={[150, 150]}
        onItemPress={$_onBottomSheetItemPress}
      />

      <WsDialogDelete
        id={_id}
        to="StatisticsIndex"
        modelName="factory_statistic_group"
        visible={dialogVisible}
        text={t('確定刪除嗎？')}
        setVisible={setDialogVisible}
      />

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
  container: { flex: 1 },
  screenTitle: { fontSize: 14, fontWeight: "500" },
  card: {
    marginHorizontal: 8,
    backgroundColor: "#FFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E6E8",
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  formulaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  formula: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#222',
    paddingRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    paddingRight: 8,
  },
  body: { paddingHorizontal: 14, paddingVertical: 12 },
  emptyText: { color: "#999", fontSize: 14, paddingVertical: 4 },
  actionBar: { flexDirection: "row", flexWrap: "wrap" },
});