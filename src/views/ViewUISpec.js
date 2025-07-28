import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableHighlight,
  Image,
  StyleSheet,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native'
import {
  WsGrid,
  WsPaddingContainer,
  WsCard,
  WsUserSection,
  WsBtn,
  WsImageBtn,
  WsIconTitle,
  LlSOSBtn002,
  WsText,
  WsBadgeIconButton,
  WsIconBtn,
  WsFilter,
  WsGradientButton,
  WsIcon,
  WsIconCircle,
  WsFlex,
  WsDes,
  WsSubtaskCard,
  WsStateForm,
  WsCenter,
  LlCheckListRecordCard001,
  WsInfoFile,
  LlTemplatesCard001,
  LlLicenseCard001,
  LlBtn002,
  WsState,
  WsTabView,
  WsSkeleton,
  LlAlertCard001,
  LlNavButton001,
  LlNavButton002,
  WsEmpty,
  WsStateFormView,
  WsAnalyzeCard,
  LlFactoryIndexingDataCard001,
  WsPanel,
  LlRiskHeaderCalc,
  WsInfo,
  LlChangeResultCard002,
  WsDialog,
  WsPopup,
  LlLvInfoMultiLayer
} from '@/components'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { scopePermission } from '@/__reactnative_stone/global/permission'
import { TouchableOpacity } from 'react-native-gesture-handler'
import moment from 'moment'
import layouts from '@/__reactnative_stone/global/layout'
import { useIsFocused } from '@react-navigation/native'
import S_Factory from '@/services/api/v1/factory'

const ViewUISpec = () => {
  const { t, i18n } = useTranslation()
  const { windowWidth, windowHeight } = layouts
  const { width, height } = Dimensions.get('window')
  const isFocused = useIsFocused()

  // Redux
  const currentFactoryId = useSelector(state => state.data.currentFactory.id)
  const currentUserScope = useSelector(state => state.data.userScopes)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentOrganization = useSelector(
    state => state.data.currentOrganization
  )

  // MULTI SELECT FACTORY
  const [popupActive, setPopupActive] = React.useState(false)
  const [sortValue001, setSortValue001] = React.useState(currentFactory)
  const [factoryFilter, setFactoryFilter] = React.useState()
  const $_setFactoryDropdown = async () => {
    try {
      const params = {
        organization: currentOrganization ? currentOrganization.id : 44
      }
      const res = await S_Factory.index({ params })
      setFactoryFilter(res.data)
      setSortValue001(res.data[0])
    } catch (err) {
      alert(err);
    }
  }
  const $_selectFactories = async (unit) => {
    console.log(unit, 'unit');
    if (!unit) {
      return
    }
    setSortValue001(unit)
    setPopupActive(false)
  }
  React.useEffect(() => {
    if (isFocused) {
      $_setFactoryDropdown()
    }
  }, [isFocused])

  // Checklist assignment toggle btn
  const [score, setScore] = React.useState()
  const [visible, setVisible] = React.useState(false)
  const [minorValueToggle, setMinorValueToggle] = React.useState(score ? score : null)
  const [itemsToggleBtn, setItemToggleBtn] = React.useState([
    { label: t('合規'), value: '25' },
    { label: t('不合規'), value: 'bad' },
    { label: t('不適用'), value: '20' }
  ])
  const [minorToggleBtn] = React.useState([
    { label: t('Major(主要缺失)'), value: '23' },
    { label: t('Minor(次要缺失)'), value: '22' },
    { label: t('OFI(待改善)'), value: '21' }
  ])
  const $_setItemToggleBtn = (value, item) => {
    setItemToggleBtn([
      { label: t('合規'), value: '25' },
      { label: t(item.label), value: 'bad' },
      { label: t('不適用'), value: '20' }
    ])
    setVisible(false)
  }


  // SQ Btn
  const mainMenu = [
    {
      icon: 'll-nav-checksheet-outline',
      name: t('點檢作業'),
      // badge: checklistNum,
      onPress: () => {
        // navigation.navigate('RoutesCheckList', {
        //   screen: 'CheckListAssignment'
        // })
      },
      permission: scopePermission([
        'checklist-record-checker',
        'checklist-record-manager'
      ], currentUserScope)
    },
    {
      icon: 'll-nav-audit-outline',
      name: t('稽核作業'),
      // badge: num,
      onPress: () => {
        // navigation.navigate('RoutesAudit', {
        //   screen: 'AuditAssignment'
        // })
      },
      permission: scopePermission([
        'audit-read',
        'audit-record',
        'auditee-record'
      ], currentUserScope)
    }
  ]

  // Filter FAB
  const [modalVisible, setModalVisible] = React.useState(false)
  const [filtersValue, setFiltersValue] = React.useState({})
  const [filterFields] = React.useState({
    button: {
      type: 'date_range',
      label: t('日期'),
      time_field: 'announce_at'
    },
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    }
  })
  const $_onFilterSubmit = $event => {
    setModalVisible(false)
    setFiltersValue($event)
  }

  // Card
  const [fieldsValue, setFieldsValue] = useState({})
  const fields = {
    sub_tasks: {
      rules: 'at_least',
      type: 'models',
      fields: {
        name: {
          text: t('新增'),
          label: t('主旨'),
          autoFocus: true,
          rules: 'required'
        },
        remark: {
          label: t('待辦事項說明'),
          rules: 'required'
        },
        taker: {
          type: 'belongsto',
          label: `${t('待辦事項')}${t('執行人員')}`,
          nameKey: 'name',
          valueKey: 'id',
          modelName: 'user',
          serviceIndexKey: 'simplifyFactoryIndex',
          customizedNameKey: 'userAndEmail',
          rules: 'required'
        },
        expired_at: {
          type: 'date',
          label: `${t('待辦事項')}${t('期限')}`,
          rules: 'required'
        },
        attaches: {
          label: `${t('待辦事項')}${t('附件')}`,
          type: 'filesAndImages',
          uploadUrl: `factory/${currentFactoryId}/sub_task/attach`
        }
      },
      renderCom: WsSubtaskCard,
      renderItem: ({ item, itemIndex }) => {
        return (
          <WsSubtaskCard
            name={item.name}
            modalItem={item.name}
            fields={fields.sub_tasks.fields}
            value={item}
          />
        )
      }
    },
    attaches: {
      type: 'filesAndImages'
    },
    image: {
      type: 'image',
      uploadUrl: `/factory/${currentFactoryId}/license_version/image`,
      text: t('上傳'),
      icon: 'ws-outline-license'
    }
  }
  const _analyze = {
    icon: 'll-nav-event-outline',
    title: '風險事件處理中',
    label: '風險',
    navigate: 'DashboardEvent',
    count: 24,
    numberInfos: [
      { numberTag: '新增', toolTips: '24小時內新增且狀態為處理中的數量' },
      { numberTag: '累計', toolTips: '累計至目前狀態為處理中的數量' }
    ],
    systemType: [
      {
        id: 4,
        image:
          'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970289062siFK/%E7%92%B0%E4%BF%9D.png?signature=542130fa0b741fd0b28f9f9c599335cf4d387559971729a8ac9451fda349c61f',
        number1: 0,
        number2: 20,
        systemTitle: '環保'
      },
      {
        id: 7,
        image:
          'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970289203FQH1/%E7%94%9F%E7%94%A2%E5%AE%89%E5%85%A8.png?signature=8a638cebd70e4ff0473a218ff1685fd23f4b71e9e856020ba14bcfcc845ddfe2',
        number1: 0,
        number2: 5,
        systemTitle: '生產安全'
      },
      {
        id: 6,
        image:
          'https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597028930r0QNX/%E5%8B%9E%E5%B7%A5%E5%8F%8A%E8%81%B7%E6%A5%AD%E7%97%85.png?signature=ceb1f67c279fc1f598d8218bb5800671788e0aa98644e5cf2ed7a3a7d3d05151',
        number1: 0,
        number2: 0,
        systemTitle: '勞工及職業病'
      },
      {
        id: 5,
        image:
          'https://api.ll-esh-app.wasateam.com/api/system_class/icon/16298619681la2p/ll-esh-specialized.png?signature=99c37447000e58bf639d77ca9abc012c3e328770a17c929fcd2ceee31cce1a26',
        number1: 0,
        number2: 1,
        systemTitle: '專門領域'
      },
      {
        id: 10,
        image:
          'https://api.ll-esh-app.wasateam.com/api/system_class/icon/1629861901chtoD/ll-esh-common.png?signature=651f6c4f16bfb7e8a3fbcd9c1d86db094cce09be2eb8287e5de85c75552dc2ad',
        number1: 0,
        number2: 0,
        systemTitle: '通用領域'
      }
    ],
    update_at: '2022-12-28 09:51:47'
  }
  const _groupOverview = {
    checkResultPercent: null,
    factoryCount: 2,
    name: 'ESGoal集團',
    newAddCheckEvent: null,
    todayRiskLevel: null
  }

  // Card with shadow
  const checkListRecords = {
    index: 0,
    date: '2022-11-29',
    systemClassIcon:
      'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970289062siFK/%E7%92%B0%E4%BF%9D.png?signature=542130fa0b741fd0b28f9f9c599335cf4d387559971729a8ac9451fda349c61f',
    systemClass: '環保',
    systemClassId: 4,
    recordDataTable: {
      columnHeader: [
        {
          id: 'result',
          textLabel: '結果',
          type: 'icon',
          tabletHide: false,
          width: '5%'
        },
        {
          id: 'subCategory',
          textLabel: '子領域',
          type: 'chips',
          tabletHide: false,
          width: '15%'
        },
        {
          id: 'name',
          textLabel: '名稱',
          type: 'text',
          tabletHide: false,
          overflowHide: true,
          width: '40%'
        },
        {
          id: 'compliance',
          textLabel: '合規率',
          type: 'text',
          tabletHide: true,
          width: '5%'
        },
        {
          id: 'checker',
          textLabel: '答題者',
          type: 'text',
          tabletHide: false,
          width: '5%'
        },
        {
          id: 'date',
          textLabel: '完成日',
          type: 'text',
          tabletHide: true,
          width: '10%'
        },
        {
          id: 'reviewer',
          textLabel: '覆核者',
          type: 'text',
          tabletHide: true,
          width: '5%'
        },
        {
          id: 'condition',
          textLabel: '狀態',
          type: 'text',
          tabletHide: true,
          width: '10%'
        },
        // {
        //   id: 'download',
        //   icon: 'icon-cloud-download',
        //   textLabel: '匯出報表',
        //   type: 'downloadPopup',
        //   tabletHide: true
        // }
      ],
      rowData: []
    },
    unRecordDataTable: {
      columnHeader: [
        {
          id: 'subCategory',
          textLabel: '子領域',
          type: 'chips',
          tabletHide: false,
          width: '10%'
        },
        {
          id: 'name',
          textLabel: '名稱',
          type: 'text',
          tabletHide: false,
          overflowHide: true,
          width: '70%'
        },
        {
          id: 'checker',
          textLabel: '答題者',
          type: 'text',
          tabletHide: false,
          width: '20%'
        }
      ],
      rowData: [
        {
          id: 583,
          subCategory: [
            {
              name: '空氣污染防制',
              leadingIcon:
                'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970290907Hxye/%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=75c41b3967b7c580f710e6aa05a1b868d08521cd7495273a9b12736d91d7700d'
            }
          ],
          name: '固定污染源自行檢查表-KUI建-KUI填-WJP覆 (6/30-7/15測試)',
          checker: '陳奎霖[LAW]'
        },
        {
          id: 584,
          subCategory: [
            {
              name: '水污染防治',
              leadingIcon:
                'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970291166yRtf/%E6%B0%B4%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=7528b177496042d3318344d1aa5e5f0718a4001d945a0c2a8a35de2e8258e0b9'
            }
          ],
          name: '廢水處理設施自行檢查表-KUI建-WJP填-CRM覆 (6/30-7/15測試)',
          checker: '王逸凡[IT]'
        },
        {
          id: 589,
          subCategory: [
            {
              name: '毒性及關注化學物質管理',
              leadingIcon:
                'https://api.ll-esh-app.wasateam.com/api/system_class/icon/1629862124R0fss/ll-esh-toxicity.png?signature=292c3ffd90673b1f496c15e616c64bb96f08111e7abcaf0e81eef45fdaf12b31'
            }
          ],
          name: '毒化物類自行檢查表-KUI建-CRM填-FEN覆 (6/30-7/15測試)',
          checker: '陳瑞敏[LAW]'
        },
        {
          id: 594,
          subCategory: [
            {
              name: '水污染防治',
              leadingIcon:
                'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970291166yRtf/%E6%B0%B4%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=7528b177496042d3318344d1aa5e5f0718a4001d945a0c2a8a35de2e8258e0b9'
            }
          ],
          name: 'CUW_廢水處理設施自行檢查表',
          checker: '張敦威[LAW]'
        },
        {
          id: 595,
          subCategory: [
            {
              name: '空氣污染防制',
              leadingIcon:
                'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970290907Hxye/%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=75c41b3967b7c580f710e6aa05a1b868d08521cd7495273a9b12736d91d7700d'
            }
          ],
          name: '固定污染源自行檢查表',
          checker: '蔡A辣'
        }
      ]
    }
  }
  const _pdf = [
    {
      lazyUri:
        'file:///private/var/mobile/Containers/Data/Application/2ADA1B67-FFB0-450F-B94F-9E20D5281100/tmp/com.llesgoal-Inbox/AW20221226.pdf',
      fileName: 'AW20221226.pdf',
      needUpload: true,
      fileExtension: 'pdf'
    }
  ]
  const _eventTemplate = {
    id: 2,
    updated_at: '2021-04-29T11:08:44.000000Z',
    icon: 'https://api.ll-esh-app.wasateam.com/api/event_type/icon/1603875468bUFSv/accident.png?signature=a7e2b5555586f5cd2c2e394bfbbed8a4dc0a8d8cda6489413fc2def890a42a2d',
    area: {
      id: 1,
      locales: { tw: { name: '台灣' }, cn: { name: '中华民国' } },
      name: '台灣'
    },
    locales: { tw: { name: '意外事故' } },
    name: '意外事故',
    show_fields: null
  }
  const _license = {
    id: 448,
    updated_at: '2022-12-27T07:26:33.000000Z',
    name: '水污染防治措施/排放許可證或簡易排放許可文件',
    statitory_extension_date: null,
    last_version: {
      id: 428,
      updated_at: '2022-12-27T07:26:33.000000Z',
      license_status_number: 0,
      using_status: 1,
      license_number: '1f21d12f',
      approval_letter: '1wfqwc12cd',
      valid_start_date: '2022-12-09',
      valid_end_date: null,
      remind_date: '2022-12-23',
      taker: null,
      agents: [],
      reminder: {
        id: 1,
        name: '蔡A辣',
        avatar:
          'https://api.ll-esh-app.wasateam.com/api/user/avatar/1659602092WMikE/9B5D3D70-C6D4-496D-961B-32A14E352FE5.jpg?signature=772263c018fe1a8572bf4970adf00bfefa1d41cbf18ffc9ca72f8ff8aec8dc26'
      }
    },
    license_template: {
      id: 32,
      last_version: {
        id: 16,
        locales: {
          tw: {
            name: '水污染防治措施/排放許可證或簡易排放許可文件',
            precautions:
              '1.\t應辦理變更(毋須事前核准)：\n(1)\t基本資料。\n(2)\t廢（污）水水量、污泥量之計測設施、計量方式及其校正維護方法。\n(3)\t除中央主管機關依本法第十四條之一第一項指定公告之事業外，其增加或變更作業系統用水來源、產生廢（污）水之主要製程設施，或其每日最大生產或服務規模，且未增加用水量、廢（污）水產生量，及未變更廢（污）水（前）處理設施及污泥處理設施功能。\n(4)\t廢（污）水處理設施單元汰舊換新，且其規格條件及功能皆與原許可證（文件）登記相符。\n(5)\t僅變更廢（污）水處理設施單元之附屬機具設施，未涉及廢（污）水處理設施或其操作參數變更。\n(6)\t縮減每日最大用水量、廢（污）水產生量，且未涉及廢（污）水處理設施、操作參數或其他登記事項之變更。\n(7)\t其他未涉及廢（污）水、污泥之產生、收集、處理或排放之變更，經中央主管機關認定者。\n2.\t應辦理變更(須事前核准)：\n變更前開以外之水措計畫或許可證(文件)登記事項。\n3.\t應辦理展延：\n自期滿6個月前起算5個月之期間內申請展延。',
            expired_comment: '5年；經核准展延者，每次展延不得超過5年'
          }
        },
        name: '水污染防治措施/排放許可證或簡易排放許可文件'
      },
      name: '水污染防治措施/排放許可證或簡易排放許可文件'
    },
    license_type: {
      id: 2,
      icon: 'https://api.ll-esh-app.wasateam.com/api/license_type/icon/1611729934VC9dO/factory.png?signature=bd893cf36ca686ddd6e6fa4af3b9d17502eb31708aac8720734d846994d939ad',
      show_fields: [
        'license_status_number',
        'license_owned_factory',
        'approval_letter',
        'license_number',
        'valid_start_date',
        'valid_end_date',
        'remind_date',
        'remark',
        'attaches',
        'image',
        'reminder',
        'using_status'
      ],
      locales: { tw: { name: '廠證' } },
      name: '廠證'
    },
    system_classes: [
      {
        id: 4,
        icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970289062siFK/%E7%92%B0%E4%BF%9D.png?signature=542130fa0b741fd0b28f9f9c599335cf4d387559971729a8ac9451fda349c61f',
        locales: { tw: { name: '環保' }, cn: { name: '环保' } },
        name: '環保'
      }
    ],
    system_subclasses: [
      {
        sequence: '2',
        id: 15,
        icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970291166yRtf/%E6%B0%B4%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=7528b177496042d3318344d1aa5e5f0718a4001d945a0c2a8a35de2e8258e0b9',
        locales: { tw: { name: '水污染防治' }, cn: { name: '水污染防治' } },
        name: '水污染防治'
      }
    ],
    industry_categories: [],
    setup_by_license_versions: []
  }
  const _factoryIndexData = {
    id: 9338,
    updated_at: '2022-12-28T00:00:36.000000Z',
    created_at: '2022-12-28T00:00:36.000000Z',
    factory: { id: 23, name: 'ESGoal台灣廠', max_member_count: 100 },
    event_count: 24,
    alert_count: 68,
    task_count: 7,
    license_count: 3,
    change_count: 21,
    checklist_result: 0,
    checklist_risk_level: 21,
    event_add_count: 0,
    contractor_enter_record_count: 0
  }

  // Sheet
  const [sortValue, setSortValue] = React.useState()

  // List
  const _alert = {
    id: 757,
    updated_at: '2022-12-09T07:35:48.000000Z',
    created_at: '2022-12-09T07:35:48.000000Z',
    level: 1,
    solved_at: null,
    from: 'audit_record',
    type: null,
    payload: {
      id: 123,
      updated_user_id: 1,
      sequence: null,
      updated_at: '2022-12-09T07:35:48.000000Z',
      review_remark: null,
      review_images: [],
      review_attaches: [],
      record_remark: 'Good',
      review_at: null,
      record_at: '2022-12-09T07:35:48.000000Z',
      images: [],
      auditor: null,
      auditee: null,
      auditors: [
        {
          id: 1,
          name: '蔡A辣',
          avatar:
            'https://api.ll-esh-app.wasateam.com/api/user/avatar/1659602092WMikE/9B5D3D70-C6D4-496D-961B-32A14E352FE5.jpg?signature=772263c018fe1a8572bf4970adf00bfefa1d41cbf18ffc9ca72f8ff8aec8dc26'
        }
      ],
      auditees: [
        {
          id: 130,
          name: '陳奎霖[LAW]',
          avatar:
            'https://api.ll-esh-app.wasateam.com/api/user/avatar/164061007655BbV/baseline_face_black_48dp.png?signature=4bc556087f5b3f8338635b077071f93477501035f88c202ca8ca0f59de986702'
        }
      ],
      audit: { id: 407 },
      audit_id: '407',
      audit_version: {
        id: 606,
        updated_user_id: '130',
        updated_at: '2022-12-09T03:38:25.000000Z',
        chapters: [
          {
            badId: 'c20215814epg',
            title: '噪音管制標準',
            sections: [
              {
                badId: 's20215814epg',
                title: '噪音管制標準',
                questions: [
                  { type: 'template', id: 5042 },
                  { type: 'custom', id: 5043 },
                  { type: 'custom', id: 5044 },
                  { type: 'template', id: 5047 }
                ]
              }
            ]
          },
          {
            badId: 'c2021581830d',
            title: '審核文件',
            sections: [
              {
                badId: 's2021581830d',
                title: '審核文件',
                questions: [{ type: 'template', id: 5046 }]
              }
            ]
          },
          {
            badId: 'c202158576e',
            title: '監測',
            sections: [
              {
                badId: 's202158576e',
                title: '檢測紀錄文件',
                questions: [{ type: 'template', id: 5045 }]
              },
              {
                badId: 's2021585703u',
                title: '自行監測',
                questions: [{ type: 'template', id: 5048 }]
              }
            ]
          },
          {
            badId: 'c20215858cao',
            title: '行政處罰',
            sections: [
              {
                badId: 's20215858cao',
                title: '行政處罰',
                questions: [
                  { type: 'template', id: 5049 },
                  { type: 'template', id: 5050 }
                ]
              }
            ]
          }
        ],
        audit_template_version: { id: 70 },
        audit_question_templates: [{ id: 84 }, { id: 85 }]
      },
      audit_request: { id: 180 },
      audit_record_answers: [
        { id: 478, score: 25, risk_level: 25 },
        { id: 479, score: 22, risk_level: 22 },
        { id: 480, score: 25, risk_level: 25 },
        { id: 481, score: 20, risk_level: 20 }
      ],
      review_draft: null,
      risk_level: '22',
      chapters: [
        {
          badId: 'c20215814epg',
          title: '噪音管制標準',
          sections: [
            {
              badId: 's20215814epg',
              title: '噪音管制標準',
              questions: [
                { type: 'template', id: 5042 },
                { type: 'custom', id: 5043 },
                { type: 'custom', id: 5044 },
                { type: 'template', id: 5047 }
              ]
            }
          ]
        },
        {
          badId: 'c2021581830d',
          title: '審核文件',
          sections: [
            {
              badId: 's2021581830d',
              title: '審核文件',
              questions: [{ type: 'template', id: 5046 }]
            }
          ]
        },
        {
          badId: 'c202158576e',
          title: '監測',
          sections: [
            {
              badId: 's202158576e',
              title: '檢測紀錄文件',
              questions: [{ type: 'template', id: 5045 }]
            },
            {
              badId: 's2021585703u',
              title: '自行監測',
              questions: [{ type: 'template', id: 5048 }]
            }
          ]
        },
        {
          badId: 'c20215858cao',
          title: '行政處罰',
          sections: [
            {
              badId: 's20215858cao',
              title: '行政處罰',
              questions: [
                { type: 'template', id: 5049 },
                { type: 'template', id: 5050 }
              ]
            }
          ]
        }
      ],
      name: 'V2-噪音污染防治',
      system_classes: [
        {
          id: 4,
          icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970289062siFK/%E7%92%B0%E4%BF%9D.png?signature=542130fa0b741fd0b28f9f9c599335cf4d387559971729a8ac9451fda349c61f',
          locales: { tw: { name: '環保' }, cn: { name: '环保' } },
          name: '環保'
        }
      ],
      system_subclasses: [
        {
          sequence: '4',
          id: 17,
          icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/159702917197pRF/%E5%99%AA%E9%9F%B3%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=93c81cdb574ca9cbe3adaad68fc191c326f071524e74a05b9a11996ff5e0fcbf',
          locales: { tw: { name: '噪音污染管制' }, cn: { name: '噪音污染管制' } },
          name: '噪音污染管制'
        }
      ],
      tasks: [],
      alert: null
    },
    solver: null,
    license: null,
    license_template: null,
    act: null,
    article: null,
    checklist_record: null,
    audit_record: {
      id: 123,
      review_remark: 'ㄷㄷㄷㄷㄷㄷㄷㅇㅇㅇㅇㅇ',
      record_remark: 'Good',
      review_at: '2022-12-09T10:34:22.000000Z',
      record_at: '2022-12-09T07:35:48.000000Z',
      images: [],
      auditor: null,
      auditee: {
        id: 130,
        name: '陳奎霖[LAW]',
        email: 'linkchen@leeandli.com',
        avatar:
          'https://api.ll-esh-app.wasateam.com/api/user/avatar/164061007655BbV/baseline_face_black_48dp.png?signature=4bc556087f5b3f8338635b077071f93477501035f88c202ca8ca0f59de986702',
        email_verified_at: '2022-06-28T09:31:30.000000Z',
        activated_at: '2021-12-21T02:51:52.000000Z',
        is_administrator: 0,
        user_factory_scopes: { id: 147, scopes: [], status: 1 },
        user_factory_roles: [
          {
            id: 96,
            created_at: '2022-06-24T08:26:17.000000Z',
            updated_at: '2022-07-27T08:43:41.000000Z',
            sequence: '1',
            name: '總管理者',
            scopes: [
              'dashboard-read',
              'llbroadcast-read',
              'act-read',
              'act-inquiry',
              'alert-read',
              'alert-slove',
              'task-read',
              'task-create',
              'task-update',
              'task-delete',
              'contractor-read',
              'contractor-create',
              'contractor-update',
              'contractor-delete',
              'contractor-license-manage',
              'contract-manage',
              'license-read',
              'license-create',
              'license-update',
              'license-delete',
              'internal-training-read',
              'internal-training-create',
              'internal-training-update',
              'internal-training-delete',
              'event-read',
              'event-create',
              'event-update',
              'event-delete',
              'contractor-enter-record-read',
              'contractor-enter-record-create',
              'contractor-enter-record-update',
              'contractor-enter-record-delete',
              'exit-checklist',
              'audit-read',
              'audit-create',
              'audit-update',
              'audit-delete',
              'audit-record',
              'auditee-record',
              'checklist-read',
              'checklist-create',
              'checklist-update',
              'checklist-delete',
              'checklist-record',
              'checklist-review-record',
              'change-read',
              'change-create',
              'change-update',
              'change-delete',
              'change-record',
              'user-factory-manage',
              'role-manage',
              'factory-manage',
              'sos-create'
            ],
            is_default: 1,
            factory: { id: 23, name: 'ESGoal台灣廠', max_member_count: 100 }
          }
        ],
        user_factory_role_templates: []
      },
      auditors: [
        {
          id: 1,
          name: '蔡A辣',
          avatar:
            'https://api.ll-esh-app.wasateam.com/api/user/avatar/1659602092WMikE/9B5D3D70-C6D4-496D-961B-32A14E352FE5.jpg?signature=772263c018fe1a8572bf4970adf00bfefa1d41cbf18ffc9ca72f8ff8aec8dc26'
        }
      ],
      auditees: [
        {
          id: 130,
          name: '陳奎霖[LAW]',
          avatar:
            'https://api.ll-esh-app.wasateam.com/api/user/avatar/164061007655BbV/baseline_face_black_48dp.png?signature=4bc556087f5b3f8338635b077071f93477501035f88c202ca8ca0f59de986702'
        }
      ],
      review_draft: null,
      risk_level: 22,
      chapters: [
        {
          badId: 'c20215814epg',
          title: '噪音管制標準',
          sections: [
            {
              badId: 's20215814epg',
              title: '噪音管制標準',
              questions: [
                { type: 'template', id: 5042 },
                { type: 'custom', id: 5043 },
                { type: 'custom', id: 5044 },
                { type: 'template', id: 5047 }
              ]
            }
          ]
        },
        {
          badId: 'c2021581830d',
          title: '審核文件',
          sections: [
            {
              badId: 's2021581830d',
              title: '審核文件',
              questions: [{ type: 'template', id: 5046 }]
            }
          ]
        },
        {
          badId: 'c202158576e',
          title: '監測',
          sections: [
            {
              badId: 's202158576e',
              title: '檢測紀錄文件',
              questions: [{ type: 'template', id: 5045 }]
            },
            {
              badId: 's2021585703u',
              title: '自行監測',
              questions: [{ type: 'template', id: 5048 }]
            }
          ]
        },
        {
          badId: 'c20215858cao',
          title: '行政處罰',
          sections: [
            {
              badId: 's20215858cao',
              title: '行政處罰',
              questions: [
                { type: 'template', id: 5049 },
                { type: 'template', id: 5050 }
              ]
            }
          ]
        }
      ],
      name: 'V2-噪音污染防治',
      system_classes: [
        {
          id: 4,
          icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970289062siFK/%E7%92%B0%E4%BF%9D.png?signature=542130fa0b741fd0b28f9f9c599335cf4d387559971729a8ac9451fda349c61f',
          locales: { tw: { name: '環保' }, cn: { name: '环保' } },
          name: '環保'
        }
      ],
      system_subclasses: [
        {
          sequence: '4',
          id: 17,
          icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/159702917197pRF/%E5%99%AA%E9%9F%B3%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=93c81cdb574ca9cbe3adaad68fc191c326f071524e74a05b9a11996ff5e0fcbf',
          locales: { tw: { name: '噪音污染管制' }, cn: { name: '噪音污染管制' } },
          name: '噪音污染管制'
        }
      ],
      audit_record_answers: [
        { id: 478, score: 25, risk_level: 25 },
        { id: 479, score: 22, risk_level: 22 },
        { id: 480, score: 25, risk_level: 25 },
        { id: 481, score: 20, risk_level: 20 }
      ]
    },
    task: null,
    event: null,
    exit_checklist: null,
    contractor_enter_record: null,
    contractor_license: null,
    system_classes: [
      {
        id: 4,
        icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970289062siFK/%E7%92%B0%E4%BF%9D.png?signature=542130fa0b741fd0b28f9f9c599335cf4d387559971729a8ac9451fda349c61f',
        locales: { tw: { name: '環保' }, cn: { name: '环保' } },
        name: '環保'
      }
    ],
    system_subclasses: [
      {
        sequence: '4',
        id: 17,
        icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/159702917197pRF/%E5%99%AA%E9%9F%B3%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=93c81cdb574ca9cbe3adaad68fc191c326f071524e74a05b9a11996ff5e0fcbf',
        locales: { tw: { name: '噪音污染管制' }, cn: { name: '噪音污染管制' } },
        name: '噪音污染管制'
      }
    ]
  }

  // Tabs
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems] = React.useState([
    {
      value: 'status_number0',
      label: i18next.t('逾期'),
      view: WsEmpty,
      props: {},
      tabNum: '0'
    },
    {
      value: 'status_number1',
      label: i18next.t('辦理中'),
      view: WsEmpty,
      props: {},
      tabNum: '0'
    },
    {
      value: 'status_number2',
      label: i18next.t('使用中'),
      view: WsEmpty,
      props: {},
      tabNum: 12
    },
    {
      value: 'status_number3',
      label: i18next.t('已停用'),
      view: WsEmpty,
      props: {},
      tabNum: 23
    },
    {
      value: 'LicenseStatusList',
      label: i18next.t('全部'),
      view: WsEmpty,
      props: {},
      tabNum: 34
    }
  ])

  // Form Element
  const _fieldsForForm = {
    name: {
      label: t('Text Field'),
      remind: t('建議撰寫格式'),
      placeholder: t('Placeholder...'),
      rules: 'required',
      contentHeight: 268,
      dialogButtonItems: [],
      dialogTitle: t('建議撰寫格式'),
      remindRenderItem: () => {
        const windowWidth = Dimensions.get('window').width
        return (
          <>
            <WsFlex
              flexWrap="wrap"
              style={{
                paddingHorizontal: 16,
                width: windowWidth * 0.9
              }}>
              <WsDes size={14}>{t('建議於主旨詳細填寫事件內容')}</WsDes>
            </WsFlex>
            <View
              style={{
                padding: 16
              }}>
              <WsFlex flexWrap={'nowrap'} alignItems={'flex-start'}>
                <WsIcon
                  name="ws-outline-edit-pencil"
                  color={$color.gray3d}
                  size={24}
                  style={{
                    marginRight: 6
                  }}
                />
                <WsText size={14} letterSpacing={1} style={{ marginRight: 16 }}>
                  {t(
                    '以「操作異常」為例：A廠8號排放口排放氨氮值超標：9.0（標準6.0）'
                  )}
                </WsText>
              </WsFlex>
              <WsFlex
                flexWrap={'nowrap'}
                alignItems={'flex-start'}
                style={{ marginTop: 16 }}>
                <WsIcon
                  name="ws-outline-edit-pencil"
                  color={$color.gray3d}
                  size={24}
                  style={{
                    marginRight: 6
                  }}
                />
                <WsText size={14} letterSpacing={1} style={{ marginRight: 16 }}>
                  {t(
                    '以「接獲罰單」為例：接獲高雄市環保局排放污水罰單：限期改善＋罰鍰30萬'
                  )}
                </WsText>
              </WsFlex>
            </View>
          </>
        )
      }
    },
    occur_at: {
      label: t('Dropdown select'),
      type: 'datetime',
      placeholder: `${t('月.日')}  ${t('時:分')}`,
      rules: 'required'
    },
    remark: {
      label: t('Text Area'),
      multiline: true,
      placeholder: t('Placeholder...'),
      textCounter: true,
      maxLength: 1000,
      rules: 'required'
    }
  }

  // Label
  const _riskLevel = [{ score: 25 }, { score: 23 }, { score: 24 }]

  // Form
  const _user = {
    activated_at: null,
    avatar:
      'https://api.ll-esh-app.wasateam.com/api/user/avatar/1604320851bZipL/%E6%88%AA%E5%9C%96%202020-11-02%20%E4%B8%8B%E5%8D%888.40.30.png?signature=6bbe5a62f888bc03a46eb4a3dffad987e2a06321547e0b653d4c8567570f2f92',
    email: 'shaoyuma@gmail.com',
    email_verified_at: null,
    id: 89,
    is_administrator: 0,
    name: '馬魚魚',
    user_factory_role_templates: [
      {
        content: '',
        created_at: '2022-06-13T08:52:23.000000Z',
        id: 2,
        is_default: 1,
        locales: [Object],
        name: 'testing',
        scopes: [Array],
        updated_at: '2022-06-14T07:46:27.000000Z'
      },
      {
        content: '',
        created_at: '2022-06-13T08:55:53.000000Z',
        id: 3,
        is_default: 1,
        locales: [Object],
        name: 'testing222',
        scopes: [Array],
        updated_at: '2022-06-14T07:46:27.000000Z'
      },
      {
        content: '',
        created_at: '2022-06-14T06:18:34.000000Z',
        id: 8,
        is_default: 0,
        locales: [Object],
        name: 'locales',
        scopes: [Array],
        updated_at: '2022-06-14T07:46:28.000000Z'
      },
      {
        content: '',
        created_at: '2022-06-14T07:46:53.000000Z',
        id: 11,
        is_default: 0,
        locales: [Object],
        name: 'test for factories',
        scopes: [Array],
        updated_at: '2022-06-14T08:22:20.000000Z'
      },
      {
        content: '',
        created_at: '2022-06-14T08:43:55.000000Z',
        id: 12,
        is_default: 1,
        locales: [Object],
        name: 'lang for tw change testing',
        scopes: [Array],
        updated_at: '2022-06-15T03:52:44.000000Z'
      }
    ],
    user_factory_roles: [
      {
        created_at: '2021-08-17T02:57:07.000000Z',
        factory: [Object],
        id: 2,
        is_default: 0,
        name: '總管理者',
        scopes: [Array],
        sequence: '1',
        updated_at: '2022-04-27T09:21:46.000000Z'
      },
      {
        created_at: '2021-08-13T11:16:58.000000Z',
        factory: [Object],
        id: 1,
        is_default: 0,
        name: '總管理者',
        scopes: [Array],
        sequence: '1',
        updated_at: '2022-04-27T09:21:46.000000Z'
      }
    ],
    user_factory_scopes: null
  }

  // Assessment Results
  const _changeResult = {
    "id": "23",
    "textLabel": "建築及消防安全管理",
    "subClass": {
      "sequence": null,
      "id": 23,
      "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029226UcPd9/%E5%BB%BA%E7%AF%89%E6%B6%88%E9%98%B2.png?signature=d24c456ceab558b60c68744011d8fa3d6b3b39cc7aad185b468b3bef6e3f1157",
      "locales": {
        "tw": {
          "name": "建築及消防安全管理"
        },
        "cn": {
          "name": "建筑及消防安全管理"
        }
      },
      "name": "建築及消防安全管理"
    },
    "doneIcon": true,
    "evaluator": {
      "id": 1,
      "name": "蔡A辣",
      "avatar": "https://api.ll-esh-app.wasateam.com/api/user/avatar/1659602092WMikE/9B5D3D70-C6D4-496D-961B-32A14E352FE5.jpg?signature=772263c018fe1a8572bf4970adf00bfefa1d41cbf18ffc9ca72f8ff8aec8dc26"
    },
    "evaluateDate": "2022.12.20",
    "assignmentList": [
      {
        "index": "1",
        "title": "用電量變動",
        "subtitle": "預估影響量？",
        "warningText": "",
        "changeList": [
          {
            "answerId": 2267,
            "index": "1-3-1",
            "title": "承上，如有上述情形，應委請合格電器承裝業承裝",
            "score": 16,
            "updateVersion": false,
            "textareaContent": null,
            "attaches": [

            ],
            "riskVersion": 9874,
            "riskTemplateId": 55,
            "systemClass": {
              "id": 7,
              "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970289203FQH1/%E7%94%9F%E7%94%A2%E5%AE%89%E5%85%A8.png?signature=8a638cebd70e4ff0473a218ff1685fd23f4b71e9e856020ba14bcfcc845ddfe2",
              "locales": {
                "tw": {
                  "name": "生產安全"
                },
                "cn": {
                  "name": "生产安全"
                }
              },
              "name": "生產安全"
            },
            "systemSubclass": {
              "sequence": null,
              "id": 23,
              "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029226UcPd9/%E5%BB%BA%E7%AF%89%E6%B6%88%E9%98%B2.png?signature=d24c456ceab558b60c68744011d8fa3d6b3b39cc7aad185b468b3bef6e3f1157",
              "locales": {
                "tw": {
                  "name": "建築及消防安全管理"
                },
                "cn": {
                  "name": "建筑及消防安全管理"
                }
              },
              "name": "建築及消防安全管理"
            }
          },
          {
            "answerId": 2266,
            "index": "1-4-1",
            "title": "辦理竣工報告",
            "score": 16,
            "updateVersion": false,
            "textareaContent": null,
            "attaches": [

            ],
            "riskVersion": 9875,
            "riskTemplateId": 56,
            "systemClass": {
              "id": 7,
              "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970289203FQH1/%E7%94%9F%E7%94%A2%E5%AE%89%E5%85%A8.png?signature=8a638cebd70e4ff0473a218ff1685fd23f4b71e9e856020ba14bcfcc845ddfe2",
              "locales": {
                "tw": {
                  "name": "生產安全"
                },
                "cn": {
                  "name": "生产安全"
                }
              },
              "name": "生產安全"
            },
            "systemSubclass": {
              "sequence": null,
              "id": 23,
              "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029226UcPd9/%E5%BB%BA%E7%AF%89%E6%B6%88%E9%98%B2.png?signature=d24c456ceab558b60c68744011d8fa3d6b3b39cc7aad185b468b3bef6e3f1157",
              "locales": {
                "tw": {
                  "name": "建築及消防安全管理"
                },
                "cn": {
                  "name": "建筑及消防安全管理"
                }
              },
              "name": "建築及消防安全管理"
            }
          },
          {
            "answerId": 2264,
            "index": "1-5-1",
            "title": "完成接電前台電檢驗程序",
            "score": 16,
            "updateVersion": false,
            "textareaContent": null,
            "attaches": [

            ],
            "riskVersion": 9876,
            "riskTemplateId": 57,
            "systemClass": {
              "id": 7,
              "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970289203FQH1/%E7%94%9F%E7%94%A2%E5%AE%89%E5%85%A8.png?signature=8a638cebd70e4ff0473a218ff1685fd23f4b71e9e856020ba14bcfcc845ddfe2",
              "locales": {
                "tw": {
                  "name": "生產安全"
                },
                "cn": {
                  "name": "生产安全"
                }
              },
              "name": "生產安全"
            },
            "systemSubclass": {
              "sequence": null,
              "id": 23,
              "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029226UcPd9/%E5%BB%BA%E7%AF%89%E6%B6%88%E9%98%B2.png?signature=d24c456ceab558b60c68744011d8fa3d6b3b39cc7aad185b468b3bef6e3f1157",
              "locales": {
                "tw": {
                  "name": "建築及消防安全管理"
                },
                "cn": {
                  "name": "建筑及消防安全管理"
                }
              },
              "name": "建築及消防安全管理"
            }
          },
          {
            "answerId": 2268,
            "index": "1-2-1",
            "title": "承上，如有上述情形，應委請合格電機技師設計監造",
            "score": 16,
            "updateVersion": false,
            "textareaContent": null,
            "attaches": [

            ],
            "riskVersion": 9871,
            "riskTemplateId": 54,
            "systemClass": {
              "id": 7,
              "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970289203FQH1/%E7%94%9F%E7%94%A2%E5%AE%89%E5%85%A8.png?signature=8a638cebd70e4ff0473a218ff1685fd23f4b71e9e856020ba14bcfcc845ddfe2",
              "locales": {
                "tw": {
                  "name": "生產安全"
                },
                "cn": {
                  "name": "生产安全"
                }
              },
              "name": "生產安全"
            },
            "systemSubclass": {
              "sequence": null,
              "id": 23,
              "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029226UcPd9/%E5%BB%BA%E7%AF%89%E6%B6%88%E9%98%B2.png?signature=d24c456ceab558b60c68744011d8fa3d6b3b39cc7aad185b468b3bef6e3f1157",
              "locales": {
                "tw": {
                  "name": "建築及消防安全管理"
                },
                "cn": {
                  "name": "建筑及消防安全管理"
                }
              },
              "name": "建築及消防安全管理"
            }
          },
          {
            "answerId": 2269,
            "index": "1-6-1",
            "title": "是否於防爆區域執行電器設備之變更?",
            "score": 16,
            "updateVersion": false,
            "textareaContent": null,
            "attaches": [

            ],
            "riskVersion": 9877,
            "riskTemplateId": 58,
            "systemClass": {
              "id": 7,
              "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970289203FQH1/%E7%94%9F%E7%94%A2%E5%AE%89%E5%85%A8.png?signature=8a638cebd70e4ff0473a218ff1685fd23f4b71e9e856020ba14bcfcc845ddfe2",
              "locales": {
                "tw": {
                  "name": "生產安全"
                },
                "cn": {
                  "name": "生产安全"
                }
              },
              "name": "生產安全"
            },
            "systemSubclass": {
              "sequence": null,
              "id": 23,
              "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029226UcPd9/%E5%BB%BA%E7%AF%89%E6%B6%88%E9%98%B2.png?signature=d24c456ceab558b60c68744011d8fa3d6b3b39cc7aad185b468b3bef6e3f1157",
              "locales": {
                "tw": {
                  "name": "建築及消防安全管理"
                },
                "cn": {
                  "name": "建筑及消防安全管理"
                }
              },
              "name": "建築及消防安全管理"
            }
          },
          {
            "answerId": 2263,
            "index": "1-7-1",
            "title": "涉及電線管路者，應申請室內裝修許可證（用電設備或既有設備變更工程），並就用電項目申請「用電設備增設或變更之設計審查檢驗合格證明」",
            "score": 16,
            "updateVersion": false,
            "textareaContent": null,
            "attaches": [

            ],
            "riskVersion": 9878,
            "riskTemplateId": 85,
            "systemClass": {
              "id": 7,
              "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970289203FQH1/%E7%94%9F%E7%94%A2%E5%AE%89%E5%85%A8.png?signature=8a638cebd70e4ff0473a218ff1685fd23f4b71e9e856020ba14bcfcc845ddfe2",
              "locales": {
                "tw": {
                  "name": "生產安全"
                },
                "cn": {
                  "name": "生产安全"
                }
              },
              "name": "生產安全"
            },
            "systemSubclass": {
              "sequence": null,
              "id": 23,
              "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029226UcPd9/%E5%BB%BA%E7%AF%89%E6%B6%88%E9%98%B2.png?signature=d24c456ceab558b60c68744011d8fa3d6b3b39cc7aad185b468b3bef6e3f1157",
              "locales": {
                "tw": {
                  "name": "建築及消防安全管理"
                },
                "cn": {
                  "name": "建筑及消防安全管理"
                }
              },
              "name": "建築及消防安全管理"
            }
          },
          {
            "answerId": 2265,
            "index": "1-1-1",
            "title": "評估是否涉及台電用戶用電設備設計資料審查原則\n(一)契約容量100瓩以上之電力及綜合用電。\n(二)6層以上新建築物之新設用電。\n(三)公寓、商場、大樓等新設用電其設備容量合計在100瓩以上，應以高壓供電，而經用戶要求改以低壓供電或分別設戶裝表者。\n(四)設置配電場所者之事項，如有先將設計送台電後審查後始能興工。",
            "score": 17,
            "updateVersion": false,
            "textareaContent": "就是我們的",
            "attaches": [
              "https://api.ll-esh-app.wasateam.com/api/factory/23/change_record_answer/attach/167152228541SaG/%E9%9F%93%E8%AA%9E.numbers?expires=1672207610&signature=e12538958a75c2cf6925dd8740bef3482347614ac15ff9432732d091d90e6696"
            ],
            "riskVersion": 9873,
            "riskTemplateId": 53,
            "systemClass": {
              "id": 7,
              "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970289203FQH1/%E7%94%9F%E7%94%A2%E5%AE%89%E5%85%A8.png?signature=8a638cebd70e4ff0473a218ff1685fd23f4b71e9e856020ba14bcfcc845ddfe2",
              "locales": {
                "tw": {
                  "name": "生產安全"
                },
                "cn": {
                  "name": "生产安全"
                }
              },
              "name": "生產安全"
            },
            "systemSubclass": {
              "sequence": null,
              "id": 23,
              "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029226UcPd9/%E5%BB%BA%E7%AF%89%E6%B6%88%E9%98%B2.png?signature=d24c456ceab558b60c68744011d8fa3d6b3b39cc7aad185b468b3bef6e3f1157",
              "locales": {
                "tw": {
                  "name": "建築及消防安全管理"
                },
                "cn": {
                  "name": "建筑及消防安全管理"
                }
              },
              "name": "建築及消防安全管理"
            }
          }
        ]
      }
    ]
  }

  return (
    <ScrollView style={{ padding: 16 }}>

      <WsPaddingContainer
        backgroundColor={$color.primary11l}
        style={{ marginBottom: 16 }}>
        <WsState
          stateStyle={{
            height: 64,
            borderWidth: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowOpacity: 0.3,
            shadowOffset: {
              width: 4,
              height: 4
            }
          }}
          type="toggleBtn"
          items={itemsToggleBtn}
          value={
            score === '21' ||
              score === '22' ||
              score === '23'
              ? 'bad'
              : score
          }
          onChange={(value, item) => {
            if (!value) {
              return
            }
            if (value == 'bad') {
              setMinorValueToggle(score ? score : value)
              setVisible(true)
            } else {
              setMinorValueToggle(value)
              setScore(value)
              // onChange(value, 'score')
            }
          }}
        />
      </WsPaddingContainer>
      <WsDialog
        title={t('選擇不合規層級')}
        contentHeight={330}
        contentPadding={8}
        dialogVisible={visible}
        setDialogVisible={() => {
          setVisible(false)
        }}
      >
        <WsState
          stateStyle={{
            backgroundColor: 'rgba(242, 248, 253, 1)',
            height: 64,
            width: 210,
            borderWidth: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowOpacity: 0.6,
            shadowOffset: {
              width: 4,
              height: 4
            }
          }}
          type="toggleBtn"
          items={minorToggleBtn}
          value={minorValueToggle}
          onChange={(value, item) => {
            setMinorValueToggle(value)
            setScore('bad')
            $_setItemToggleBtn(value, item)
          }}
        />
      </WsDialog>

      <WsPaddingContainer
        backgroundColor={$color.white}
        style={{ marginBottom: 16 }}
      >
        <TouchableOpacity
          style={{
            paddingLeft: 0,
            paddingRight: 0,
            padding: 12,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderColor: $color.white5d,
            borderRadius: 15,
            borderWidth: 1
          }}
          onPress={() => {
            setPopupActive(true)
          }}>
          {sortValue001 && sortValue001.name && (
            <WsText size={18} style={{ paddingHorizontal: 16 }}>{sortValue001.name}</WsText>
          )
          }
        </TouchableOpacity>
        <WsPopup
          active={popupActive}
          onClose={() => {
            setPopupActive(false)
          }}>
          {factoryFilter && (
            <View
              style={{
                width: width * 0.9,
                height: height * 0.4,
                backgroundColor: $color.white,
                borderRadius: 10,
              }}>
              <ScrollView>
                <LlLvInfoMultiLayer
                  items={factoryFilter}
                  value={sortValue001}
                  onChange={$_selectFactories}
                ></LlLvInfoMultiLayer>
              </ScrollView>
            </View>
          )}
        </WsPopup>
      </WsPaddingContainer>

      <WsPaddingContainer
        backgroundColor={$color.white}
        style={{ marginBottom: 16 }}>
        <WsText style={{ marginBottom: 16 }}>{'SOS'}</WsText>
        <LlSOSBtn002 onPress={() => { }} />
      </WsPaddingContainer>

      <WsPaddingContainer
        backgroundColor={$color.primary}
        style={{ marginBottom: 16 }}>
        <WsText style={{ marginBottom: 16 }} color={$color.white}>
          {'SQ Button'}
        </WsText>
        <WsGrid
          numColumns={4}
          data={mainMenu}
          keyExtractor={item => item.name}
          renderItem={({ item, index }) => (
            <WsBadgeIconButton
              key={item.id}
              style={{
                marginBottom: 16
              }}
              icon={item.permission === false ? 'ws-outline-lock' : item.icon}
              name={item.name}
              badge={item.badge}
              onPress={item.permission === true ? item.onPress : () => { }}
            />
          )}
        />
      </WsPaddingContainer>

      <WsPaddingContainer
        backgroundColor={$color.white}
        style={{ marginBottom: 16 }}>
        <WsText style={{ marginBottom: 16 }}>{'FAB'}</WsText>
        <WsIconBtn
          name="ws-outline-filter-outline"
          underlayColor={$color.primary}
          underlayColorPressIn={$color.primary2d}
          color={$color.white}
          size={24}
          style={{
            zIndex: 1,
            position: 'absolute',
            bottom: 10,
            right: 10
          }}
          onPress={() => {
            setModalVisible(true)
          }}
        />
        <WsFilter
          visible={modalVisible}
          setModalVisible={setModalVisible}
          onClose={() => {
            setModalVisible(false)
          }}
          filterTypeName={t('篩選條件')}
          fields={filterFields}
          onSubmit={$_onFilterSubmit}
        />
      </WsPaddingContainer>

      <WsPaddingContainer
        alignItems={'flex-start'}
        backgroundColor={$color.white}
        style={{ marginBottom: 16 }}>
        <WsText style={{ marginBottom: 16 }}>{'Button'}</WsText>
        <WsBtn
          style={{
            width: 92,
            height: 40,
            marginBottom: 8
          }}
          isFullWidth={false}
          borderRadius={25}
          textSize={14}
          color="transparent"
          textColor={$color.gray}
          borderColor={$color.gray}
          borderWidth={1}
          onPress={() => { }}>
          {t('沿革')}
        </WsBtn>

        <TouchableOpacity
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            marginBottom: 8,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 25,
            backgroundColor: $color.primary
          }}>
          <WsIcon
            color={$color.white}
            name={'ll-nav-assignment-filled'}
            size={24}
            style={{
              marginRight: 8
            }}
          />
          <WsText color={$color.white} size={14}>
            {t('建立任務')}
          </WsText>
        </TouchableOpacity>

        <WsGradientButton
          style={{ marginBottom: 8 }}
          borderRadius={28}
          onPress={() => { }}>
          {t('建立任務')}
        </WsGradientButton>
        <TouchableOpacity onPress={() => { }}>
          <WsIconCircle
            name="ws-outline-delete"
            size={20}
            padding={12}
            color={$color.white}
            backgroundColor={$color.danger}
          />
        </TouchableOpacity>
      </WsPaddingContainer>

      <WsPaddingContainer
        backgroundColor={$color.white}
        style={{ marginBottom: 16 }}>
        <WsText style={{ marginBottom: 16 }}>{'Card'}</WsText>
        <TouchableOpacity onPress={() => { }}>
          <WsPaddingContainer
            style={[
              {
                backgroundColor: $color.primary11l,
                borderRadius: 10
              }
            ]}>
            <WsFlex justifyContent="space-between">
              <WsText color={$color.primary3l}>{t('ESGoal評析')}</WsText>
              <WsDes>{moment().format('YYYY-MM-DD')}</WsDes>
            </WsFlex>
          </WsPaddingContainer>
        </TouchableOpacity>
        <WsStateForm onChange={() => { }} value={fieldsValue} fields={fields} />

        <WsAnalyzeCard
          {..._analyze}
          onPress={() => { }}
          style={{
            marginTop: 16,
            width: windowWidth * 0.45
          }}
        />
      </WsPaddingContainer>

      <WsPaddingContainer
        backgroundColor={$color.white}
        style={{ marginBottom: 16 }}>
        <WsText style={{ marginBottom: 16 }}>{'Card with Shadow'}</WsText>
        <WsCenter>
          {checkListRecords.systemClass === '環保' && (
            <WsText style={{ marginTop: 8 }} letterSpacing={1}>
              {moment().format('YYYY-MM-DD')}
            </WsText>
          )}
          <LlCheckListRecordCard001
            checkListRecords={checkListRecords}
            style={{ marginTop: 8 }}
            onPress={() => { }}
          />
        </WsCenter>

        <View style={{ marginVertical: 16 }}>
          <WsInfoFile
            fileName={_pdf.fileName}
            fileType={_pdf.fileExtension}
            value={
              'https://api.ll-esh-app.wasateam.com/api/factory/23/sub_task/attach/1672125371zZwjE/AW20221226.pdf?expires=1672128972&signature=f9d9758a4108912945ce22cdc13efe7d807997481b4f9cc5a323a9f51ae3a834'
            }
          />
        </View>

        <LlTemplatesCard001
          key={_eventTemplate}
          onPress={() => { }}
          img={_eventTemplate.icon}
          name={_eventTemplate.name}
        />

        <View
          style={{
            marginTop: 16
          }}>
          <LlFactoryIndexingDataCard001 item={_factoryIndexData} />
        </View>
        <View
          style={{
            marginTop: 16
          }}>
          <LlLicenseCard001 item={_license} onPress={() => { }} />
        </View>

        <WsPaddingContainer
          backgroundColor={$color.white}
          style={{
            borderWidth: 1,
            borderColor: $color.white5d,
            borderRadius: 10,
            marginVertical: 16
          }}>
          <WsPanel panelInfo={_groupOverview} />
        </WsPaddingContainer>
      </WsPaddingContainer>

      <WsPaddingContainer
        backgroundColor={$color.white}
        style={{ marginBottom: 16 }}>
        <WsText style={{ marginBottom: 16 }}>{'Sheet'}</WsText>
        <View
          style={{
            flexDirection: 'row'
          }}>
          <WsState
            borderRadius={25}
            borderWidth={0.5}
            style={{
              flex: 1,
              borderColor: $color.gray
            }}
            type="picker"
            value={sortValue}
            onChange={setSortValue}
            items={[
              {
                label: i18next.t('依建立日期由近至遠'),
                value: {
                  order_way: 'desc',
                  order_by: 'created_at'
                }
              },
              {
                label: i18next.t('依期限由舊至新'),
                value: {
                  order_way: 'asc',
                  order_by: 'expired_at'
                }
              },
              {
                label: i18next.t('依完成度由低至高'),
                value: {
                  order_way: 'desc',
                  order_by: 'completion_degree'
                }
              }
            ]}
          />
        </View>
      </WsPaddingContainer>

      <WsPaddingContainer
        backgroundColor={$color.white}
        style={{ marginBottom: 16 }}>
        <WsText style={{ marginBottom: 16 }}>{'List'}</WsText>
        <LlAlertCard001
          style={[
            {
              backgroundColor: $color.white1d,
              marginTop: 8
            }
          ]}
          alert={_alert}
          onPress={() => { }}
        />

        <LlNavButton001
          style={{
            backgroundColor: $color.white1d
          }}
          iconLeft="md-info-outline">
          {t('關於我們')}
        </LlNavButton001>

        <LlNavButton002
          backgroundColor={$color.white}
          iconLeft={'ll-nav-assignment-filled'}
          iconLeftColor={$color.primary}
          style={{ marginTop: 8 }}
          onPress={() => { }}>
          {t('相關任務')}
        </LlNavButton002>
      </WsPaddingContainer>

      <WsPaddingContainer
        backgroundColor={$color.white}
        style={{ marginBottom: 16 }}>
        <WsText style={{ marginBottom: 16 }}>{'Tab'}</WsText>
        {tabItems && (
          <WsTabView
            index={tabIndex}
            scrollEnabled={true}
            setIndex={settabIndex}
            items={tabItems}
          />
        )}
      </WsPaddingContainer>

      <WsPaddingContainer
        backgroundColor={$color.white}
        style={{ marginBottom: 16 }}>
        <WsText style={{ marginBottom: 16 }}>{'Form Element'}</WsText>

        <WsStateFormView
          headerRightShown={false}
          backgroundColor={$color.white}
          initValue={fieldsValue}
          onChange={$event => {
            const eventChangeData = { ...fieldsValue, ...$event }
            setFieldsValue(eventChangeData)
          }}
          fields={_fieldsForForm}
        />
      </WsPaddingContainer>

      <WsPaddingContainer
        backgroundColor={$color.white}
        style={{ marginBottom: 16 }}>
        <WsText style={{ marginBottom: 16 }}>{'Label'}</WsText>

        <LlRiskHeaderCalc answers={_riskLevel} type={'audit'} />
      </WsPaddingContainer>

      <WsPaddingContainer
        backgroundColor={$color.white}
        style={{ marginBottom: 16 }}>
        <WsText style={{ marginBottom: 16 }}>{'Form'}</WsText>
        <WsInfo
          type="user"
          label={t('負責人')}
          labelIcon={'ws-outline-outline-perm-identity'}
          value={_user}
          style={{
            marginTop: 16
          }}
        />
      </WsPaddingContainer>

      <WsPaddingContainer
        backgroundColor={$color.white}
        style={{ marginBottom: 16 }}>
        <WsText style={{ marginBottom: 16 }}>{'Assessment Results'}</WsText>
        <LlChangeResultCard002 answer={_changeResult} style={{ marginTop: 8 }} onPress={() => { }} />
      </WsPaddingContainer>
    </ScrollView >
  )
}

export default ViewUISpec
