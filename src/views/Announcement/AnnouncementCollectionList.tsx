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

  // redux
  const currentOrganization = useSelector(state => state.data.currentOrganization)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentViewMode = useSelector(state => state.data.currentViewMode)

  // State
  const [searchValue, setSearchValue] = React.useState<string | undefined>(undefined);

  const [params] = React.useState({
    // order_by: 'announce_at',
    // order_way: 'desc',
    // time_field: 'announce_at',
    factory: currentViewMode === 'factory' && currentFactory ? currentFactory.id : currentOrganization ? currentOrganization.id : null
  })

  const filterFields = {
    date_range: {
      type: 'date_range',
      label: t('發布日期'),
      time_field: 'announce_at',
    }
  }

  // Render
  return (
    <>
      <WsPageIndex
        modelName={'announcement'}
        serviceIndexKey={'collectIndex'}
        params={params}
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
              onPress={() => {
                navigation.push('RoutesApp', {
                  screen: 'ViewAnnouncementShow',
                  params: {
                    id: item.id
                  }
                })
              }}
            />
          )
        }}
      >
      </WsPageIndex>
    </>
  )
}

export default News
