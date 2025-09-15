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
  WsState,
  WsSnackBar
} from '@/components'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

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
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // State
  const [searchValue, setSearchValue] = React.useState<string | undefined>(undefined);
  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('已儲存至「我的收藏」')
  )

  // MEMO
  const params = React.useMemo(() => {
    return {
      factory: currentViewMode === 'factory' && currentFactory ? currentFactory.id : currentOrganization ? currentOrganization.id : null
    }
  }, [currentRefreshCounter, currentFactory, currentViewMode]);

  const filterFields = {
    alliance: {
      type: 'belongsto',
      label: t('聯盟'),
      nameKey: 'name',
      modelName: 'alliance',
      serviceIndexKey: 'index',
      hasMeta: false,
      placeholder: t('選擇'),
    },
    // date_range: {
    //   type: 'date_range',
    //   label: t('發布日期'),
    //   time_field: 'announce_at',
    // }
  }

  // Render
  return (
    <>
      <WsSnackBar
        text={snackBarText}
        setVisible={setIsSnackBarVisible}
        visible={isSnackBarVisible}
        quickHidden={true}
      />

      <WsPageIndex
        modelName={'announcement'}
        params={params}
        filterFields={filterFields}
        searchLabel={t('標題')}
        renderItem={({ item, index }:
          {
            item: any;
            index: number;
          }) => {
          return (
            <LlNewsCard
              key={index}
              {...item}
              setSnackBarText={setSnackBarText}
              setIsSnackBarVisible={setIsSnackBarVisible}
              onPress={() => {
                // console.log('Open:', item.title);
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
        ListFooterComponent={() => {
          return (
            <>
              <View
                style={{
                  height: 50,
                }}
              >
              </View>
            </>

          )
        }}
      >
      </WsPageIndex>
    </>
  )
}

export default News
