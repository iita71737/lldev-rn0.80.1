import React from 'react'
import {
  Pressable,
  ScrollView,
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Dimensions
} from 'react-native'
import {
  WsPage,
  WsInfiniteScroll,
  WsPaddingContainer,
  WsFilter,
  WsFlex,
  WsText,
  WsDes,
  WsIcon,
  LlBtn002,
  WsPageIndex,
  LlNewsCard,
  WsState
} from '@/components'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { StackActions } from '@react-navigation/native';

interface BroadCastProps {
  navigation: any; // Replace 'any' with actual navigation prop type
  route: any; // Replace 'any' with actual route prop type
}

const News: React.FC<BroadCastProps> = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { width: screenW } = Dimensions.get('window');
  const PADDING_H = 16;
  const GUTTER_V = 16; // 垂直間距
  const cardWidth = screenW - PADDING_H * 2;

  const currentOrganization = useSelector(state => state.data.currentOrganization)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentViewMode = useSelector(state => state.data.currentViewMode)

  // State
  const [searchValue, setSearchValue] = React.useState<string | undefined>(undefined);

  const [params] = React.useState({
    order_by: 'announce_at',
    order_way: 'desc',
    time_field: 'announce_at',
    factory: currentViewMode === 'factory' && currentFactory ? currentFactory.id : currentOrganization ? currentOrganization.id : null
  })

  const filterFields = {
    date_range: {
      type: 'date_range',
      label: t('發布日期'),
      time_field: 'announce_at',
    }
  }

  const data = [
    {
      coverUri: 'https://picsum.photos/seed/d/900/600',
      date: '2025-09-04',
      title: '職業安全衛生法「承攬管理」預告修正',
      excerpt: '「承攬管理」是職安衛領域中相當重要，卻經常被輕忽的重點事項…',
      tagLabel: '法律',
      tagColor: '#0B5CAD',
    },
    {
      coverUri: 'https://picsum.photos/seed/b/900/600',
      date: '2025-08-30',
      title: '轉型創造企業新價值——成本管理、策略投資、人才發展同步推動',
      excerpt: '2025 年至今，關稅變數與地緣風險，及 AI 應用帶來的新挑戰…',
      tagLabel: '華宇企管顧問公司',
      tagColor: '#0B5CAD',
    },
    {
      // coverUri: 'https://picsum.photos/seed/c/900/600',
      date: '2025-08-24',
      title: '越南人口紅利還在嗎？掌握法規、人力、金融三大指南，佈局越南市場',
      excerpt: '供應鏈轉移帶動越南快速崛起，投資熱度與政策觀察成為關鍵…',
      tagLabel: '越南國際法律事務所',
      tagColor: '#0B5CAD',
    },
  ];

  // Render
  return (
    <>
      {/* <WsPageIndex
        modelName={'ll_broadcast'}
        params={params}
        extendParams={searchValue}
        filterFields={filterFields}
        searchLabel={t('主旨')}
        renderItem={({ item, index }:
          {
            item: any;
            index: number;
          }) => {
          return (
            <LlNewsCard
              key={index}
              {...item}
              style={{ marginRight: index === data.length - 1 ? 0 : 16 }}
              onPress={() => {
                console.log('Open:', item.title);
              }}
            />
          )
        }}
      >
      </WsPageIndex> */}

      <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F8FB' }}>
        <FlatList
          data={data}
          keyExtractor={(_, i) => String(i)}
          contentContainerStyle={{ paddingHorizontal: PADDING_H, paddingVertical: 16 }}
          renderItem={({ item, index }) => (
            <LlNewsCard
              key={index}
              {...item}
              width={cardWidth}        // 讓卡片撐滿可視寬度（扣掉左右邊距）
              imageHeight={160}
              radius={20}
              onPress={() => {
                console.log('Open:', item.title)
                navigation.push('RoutesApp', {
                  screen: 'ViewNewsShow',
                  params: {
                  }
                })
              }}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: GUTTER_V }} />}
          ListHeaderComponent={() =>
            <WsState
              type="picker"
              items={[
                {
                  label: t('全部'),
                  value: 'all'
                },
                {
                  label: t('理律'),
                  value: 'RM',
                },
                {
                  label: t('華宇企管顧問公司'),
                  value: 'HuaYu',
                },
                {
                  label: t('越南東律國際法律事務所'),
                  value: 'Vi',
                }
              ]}
              style={{
                marginVertical: 16,
              }}
              // label={t('聯盟夥伴')}
              value={'line'}
              onChange={(chartType: number) => {
                // setChartInfo((prev) => ({ ...prev, chartType }))
              }}
              rules={'required'}
              placeholder={t('輸入')}
            />
          }
        />
      </SafeAreaView>
    </>
  )
}

export default News
