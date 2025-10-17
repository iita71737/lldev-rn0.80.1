import React, { useState, useEffect } from 'react'
import {
  Text,
  View,
  ScrollView,
  FlatList,
  InteractionManager
} from 'react-native'
import {
  WsText,
  WsFlex,
  WsTag,
  WsFilter,
  LlBtn002,
  LlCheckListCard001,
  WsSkeleton,
  WsPageIndex
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

interface CheckListFrequencyProps {
  frequency: string | undefined;
  search: any;
  defaultFilter: any;
  type: string | undefined;
}

const CheckLists: React.FC<CheckListFrequencyProps> = (props) => {
  const navigation = useNavigation()
  const { t } = useTranslation()

  // Props
  const {
    frequency,
    search,
    defaultFilter,
    type,
    setStateModal001,
    setModalAddRecord
  } = props

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentUser = useSelector(state => state.data.currentUser)

  // MEMO
  const __params = React.useMemo(() => {
    const _params = {
      frequency: frequency ? frequency : undefined,
      order_by: 'created_at',
      order_way: 'desc',
      lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw'
    }
    return _params
  }, [frequency, search, type, defaultFilter, currentRefreshCounter]);

  const [filterFields] = React.useState({
    system_subclasses: {
      type: 'system_subclass',
      label: i18next.t('領域')
    },
    factory_tags: {
      type: 'checkbox',
      label: t('標籤'),
      storeKey: "factoryTags",
      searchVisible: true,
      selectAllVisible: false,
      cancelAllVisible: false,
      defaultSelected: false
    },
  })

  // fake
  type SystemClass = {
    icon: string
    id: string
    locales?: Record<string, string>
    name: string
  }

  type SystemSubclass = {
    icon: string
    id: string
    name: string
  }

  type Owner = {
    id: string
    name: string
  }

  type LastVersion = {
    checklist_template_version: any | null
    id: string
  }

  type ChecklistItem = {
    checkers: any[]
    checklist_template: any | null
    factory_tags: any[]
    frequency: any | null
    has_renew_template: number
    id: string
    is_collect: boolean
    last_version: LastVersion
    name: string
    owner: Owner
    reviewers: any[]
    system_classes: SystemClass[]
    system_subclasses: SystemSubclass[]
  }

  /** --- 固定三筆假資料（可直接使用） --- */
  const FAKE_DATA: ChecklistItem[] = [
    {
      checkers: [],
      checklist_template: null,
      factory_tags: [],
      frequency: null,
      has_renew_template: 0,
      id: 'a1111111-1111-4111-8111-111111111111',
      is_collect: false,
      last_version: {
        checklist_template_version: null,
        id: 'v1111111-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
      },
      name: '急救箱物品檢點表A',
      owner: {
        id: 'bff163a8-81ff-11ee-89b0-42010a8c000b',
        name: '琦玉老師'
      },
      reviewers: [],
      system_classes: [
        {
          icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970289062siFK/%E7%92%B0%E4%BF%9D.png',
          id: '070dd076-9354-11ee-89b0-42010a8c000b',
          locales: { zh_TW: '環保' },
          name: '環保',
        },
      ],
      system_subclasses: [
        {
          icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970290907Hxye/%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png',
          id: '071076a4-9354-11ee-89b0-42010a8c000b',
          name: '職業安全衛生',
        },
      ],
    },
    {
      checkers: [],
      checklist_template: null,
      factory_tags: [],
      frequency: null,
      has_renew_template: 0,
      id: 'b2222222-2222-4222-8222-222222222222',
      is_collect: true,
      last_version: {
        checklist_template_version: null,
        id: 'v2222222-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
      },
      name: '廠區環境查核表B',
      owner: { id: 'bff163a8-81ff-11ee-89b0-42010a8c000b', name: '琦玉老師' },
      reviewers: [],
      system_classes: [
        {
          icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970289062siFK/%E7%92%B0%E4%BF%9D.png',
          id: '070dd076-9354-11ee-89b0-42010a8c000b',
          locales: { zh_TW: '環保' },
          name: '環保',
        },
      ],
      system_subclasses: [
        {
          icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970290907Hxye/%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png',
          id: '071076a4-9354-11ee-89b0-42010a8c000b',
          name: '廢棄物清理',
        },
        {
          icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970290907Hxye/%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png',
          id: '071076a4-9354-11ee-89b0-42010a8c000b',
          name: '水污染防治',
        }
      ],
    },
    {
      checkers: [],
      checklist_template: null,
      factory_tags: [],
      frequency: null,
      has_renew_template: 0,
      id: 'c3333333-3333-4333-8333-333333333333',
      is_collect: false,
      last_version: {
        checklist_template_version: null,
        id: 'v3333333-cccc-4ccc-8ccc-cccccccccccc'
      },
      name: '廢水處理設施每日自行檢查表C',
      owner: {
        id: 'bff163a8-81ff-11ee-89b0-42010a8c000b',
        name: '琦玉老師'
      },
      reviewers: [],
      system_classes: [
        {
          icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970289062siFK/%E7%92%B0%E4%BF%9D.png',
          id: '070dd076-9354-11ee-89b0-42010a8c000b',
          locales: { zh_TW: '環保' },
          name: '環保',
        },
      ],
      system_subclasses: [
        {
          icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970290907Hxye/%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png',
          id: '071076a4-9354-11ee-89b0-42010a8c000b',
          name: '水污染防治',
        },
      ],
    },
  ]

  return (
    <>
      {/* <WsPageIndex
        modelName={'checklist'}
        serviceIndexKey={type ? 'collectIndex' : 'index'}
        params={__params}
        extendParams={search}
        filterFields={filterFields}
        defaultFilterValue={defaultFilter}
        renderItem={({ item, index, isLastItem }) => {
          console.log(item,'itemitem')
          return (
            <>
              <LlCheckListCard001
                testID={`LlCheckListCard001-${index}`}
                key={item.id}
                item={item}
                bookmarkBtnVisible={true}
                style={[
                  index == 0
                    ? {
                      marginTop: 16
                    }
                    : {
                      marginTop: 8
                    }
                ]}
                name={item.name}
                id={item.id}
                is_collect={item.is_collect}
                tagIcon={item.tagIcon}
                tagText={item.tagText}
                taker={
                  item.owner
                    ? item.owner
                    : item.taker
                      ? item.taker
                      : i18next.t('無')
                }
                system_subclasses={item.system_subclasses}
                factory_tags={item.factory_tags}
                onPress={() => {
                  setStateModal001(false)
                  setModalAddRecord(false)
                  InteractionManager.runAfterInteractions(() => {
                    navigation.push('RoutesStatistics', {
                      screen: 'StatisticsRecordCreate',
                    });
                  });
                }}
              />
            </>
          )
        }}
      >
      </WsPageIndex> */}

      <FlatList
        data={FAKE_DATA}
        keyExtractor={(item, index) => index}
        renderItem={({ item, index }) => {
          return (
            <LlCheckListCard001
              testID={`LlCheckListCard001-${index}`}
              key={item.id}
              item={item}
              bookmarkBtnVisible={false}
              style={[
                index == 0
                  ? {
                    marginTop: 16
                  }
                  : {
                    marginTop: 8
                  }
              ]}
              name={item.name}
              id={item.id}
              is_collect={item.is_collect}
              tagIcon={item.tagIcon}
              tagText={item.tagText}
              taker={
                item.owner
                  ? item.owner
                  : item.taker
                    ? item.taker
                    : i18next.t('無')
              }
              system_subclasses={item.system_subclasses}
              factory_tags={item.factory_tags}
              onPress={() => {
                setStateModal001(false)
                setModalAddRecord(false)
                InteractionManager.runAfterInteractions(() => {
                  navigation.push('RoutesStatistics', {
                    screen: 'StatisticsRecordCreate',
                  });
                });
              }}
            />
          )
        }}
      />
    </>
  )
}

export default CheckLists
