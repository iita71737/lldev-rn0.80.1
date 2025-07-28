import React, { useState } from 'react'
import {
  ScrollView,
  View,
  Dimensions
} from 'react-native'
import {
  WsFlex,
  LlBtn002,
  LlEventCard001,
  WsPage,
  LlEventHeaderNumCard,
  WsGrid,
  WsPageIndex
} from '@/components'
import S_EventType from '@/services/api/v1/event_type'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { useSelector } from 'react-redux'
import AsyncStorage from '@react-native-community/async-storage'
interface EventProps {
  navigation: any;
  route: any;
}
interface EventTypeCard {
  icon: string;
  name: string;
  count: number;
  id: number;
  onPress: () => void;
}
interface Params {
  order_by: string;
  order_way: string;
  time_field: string;
}

const Event: React.FC<EventProps> = ({ navigation, route }) => {
  const { width } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language

  // REDUX
  const eventTypes = useSelector(state => state.data?.eventTypes)
  const currentUser = useSelector(state => state.data.currentUser)

  // States
  const [refresh, setRefresh] = useState(false);
  const [numLoading, setNumLoading] = useState<boolean>(true);
  const [eventTypesCards, setEventTypesCards] = useState<EventTypeCard[]>([]);
  const [filterValue, setFilterValue] = useState<any>({});
  const [filterFields] = React.useState<any>({
    event_type: {
      type: 'checkbox',
      label: t('類型'),
      storeKey: 'eventTypes'
    },
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    },
    button: {
      type: 'date_range',
      label: t('發生日期'),
      time_field: 'occur_at'
    },
  })
  const params = React.useMemo(() => {
    return {
      order_by: 'occur_at',
      order_way: 'desc',
      time_field: 'occur_at',
      search: filterValue && filterValue.search ? filterValue.search : undefined,
      event_type: filterValue && filterValue.event_type ? filterValue.event_type.join(',') : undefined, // IMPORTANT !!
      lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw'
    };
  }, [refresh, filterValue]);

  const $_setTabNum = async () => {
    try {
      const _params = {
        lang: 'tw',
        order_by: 'sequence',
        order_way: 'asc'
      }
      const res = await S_EventType.index({ params: _params })
      if (res) {
        setEventTypesCards(res.data)
        setNumLoading(false)
      }
    } catch (error) {
      console.error(error);
    }
  }

  // HELPER
  const $_headerCardOnPress = (eventType: string) => {
    const _filtersValue = {
      ...filterValue,
      event_type: [eventType] // IMPORTANT !!
    }
    setFilterValue(_filtersValue)
  }

  const $_onParamsChange = (params: any, filtersValue: any) => {
    let _allParams = {
      ...params,
    }
    if (filterValue && !filtersValue.search) {
      delete _allParams.search
    }
    setFilterValue(filtersValue)
    $_setTabNum(_allParams)
  }

  // click top right btn
  const $_templateOnPress = async event_type => {
    await AsyncStorage.setItem(
      'EventCreate',
      JSON.stringify({
        event_status: 1,
        event_type: event_type,
        name: event_type.name
      })
    )
    navigation.push('RoutesEvent', {
      screen: 'EventCreate'
    })
  }

  React.useEffect(() => {
    if (eventTypes) {
      $_setTabNum()
    }
  }, [filterValue, eventTypes])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setRefresh(prevRefresh => !prevRefresh);
    });

    return unsubscribe;
  }, [navigation]);

  return (
    <>
      <WsPage
        title={t('風險事件')}
        iconRight="md-add"
        showRightBtn={true}
        rightOnPress={() => {
          navigation.navigate('EventPickTypeTemplate')
        }}
      >
        <View
          style={{
            width: width,
            padding: 16,
          }}
        >
          <WsGrid
            numColumns={2}
            data={eventTypesCards}
            keyExtractor={item => item.name}
            renderItem={({ item, index }) => (
              <LlEventHeaderNumCard
                numLoading={numLoading}
                text={item && item.name ? i18next.t(item.name) : null}
                img={item && item.icon}
                num={item && item.events_count ? item.events_count : '0'}
                style={{
                  marginRight: 8
                }}
                onPress={() => $_headerCardOnPress(item.id)}
                upperRightOnPress={() => {
                  $_templateOnPress(item)
                }}
              />
            )}
          />
        </View>

        <WsPageIndex
          modelName={'event'}
          serviceIndexKey={'index'}
          params={params}
          searchLabel={t('搜尋')}
          filterFields={filterFields}
          defaultFilterValue={filterValue}
          onParamsChange={$_onParamsChange}
          ListHeaderComponent={(models) => {
            // console.log(models,'modelsQAQ');
          }}
          renderItem={({ item, index, isLastItem }) => {
            return (
              <>
                <LlEventCard001
                  testID={`LlEventCard001-${index}`}
                  key={index}
                  event={item}
                  style={{
                    marginBottom: 8,
                    marginHorizontal: 16
                  }}
                  onPress={() => {
                    navigation.push('EventShow', {
                      id: item.id
                    })
                  }}
                />
              </>
            )
          }}
        >
        </WsPageIndex>
      </WsPage>
    </>
  )
}
export default Event
