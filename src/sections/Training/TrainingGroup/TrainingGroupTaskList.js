import React from 'react'
import { ScrollView, View } from 'react-native'
import {
  WsFlex,
  WsPaddingContainer,
  LlTrainingHeaderCard001,
  WsInfo,
  WsIcon,
  WsIconBtn,
  WsText,
  WsBottomSheet,
  WsDialogDelete,
  WsInfoUser,
  WsCardPassage,
  WsCollapsible,
  WsModal,
  WsSkeleton,
  WsTabView,
  LlTrainingTimeRecordCard001,
  LlTrainingCard001,
  LlTaskCard001
} from '@/components'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import AsyncStorage from '@react-native-community/async-storage'
import $color from '@/__reactnative_stone/global/color'
import S_TrainingTimeRecord from '@/services/api/v1/training_time_record'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import store from '@/store'
import license from '@/services/api/v1/license'
import { useNavigation } from '@react-navigation/native'
import { useIsFocused } from '@react-navigation/native'
import WsPageIndex from '@/__reactnative_stone/components/WsPageIndex'

const TrainingGroupTaskList = ({ route, ...props }) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const isFocused = useIsFocused()

  // Params
  const id = props?.id || route?.params?.id || null;
  const tabIndex = props?.tabIndex || route?.params?.tabIndex || null;

  // REDUX
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // MEMO
  const params = React.useMemo(() => {
    return {
      order_by: 'completion_degree',
      order_way: 'asc',
      lang: 'tw',
      internal_training_group: id  // 相關任務列表用
    }
  }, [isFocused, currentRefreshCounter, id]);

  // States
  const [stateModal, setStateModal] = React.useState(false)
  const [selectVersionId, setSelectVersionId] = React.useState()
  const [dialogVisible, setDialogVisible] = React.useState(false)
  const [responseData, setResponseData] = React.useState(null)

  // Services
  const $_fetchTrainingTimeRecordLackIndex = async () => {
    try {
      const _params = {
        order_by: 'completion_degree',
        order_way: 'asc',
        lang: 'tw',
        internal_training_group_id: id  // lackIndexByGroup用
      }
      const res = await S_TrainingTimeRecord.lackIndexByGroup({ params: _params })
      setResponseData(res)
    } catch (e) {
      console.error(e);
    }
  }

  // Storage
  const $_setStorage = async () => {
    // 迭代 responseData.data，並將 user 存為 taker，形成 sub_tasks 陣列
    const _sub_tasks = responseData?.data?.map((item) => ({
      taker: {
        id: item.user.id,
        name: item.user.name,
        avatar: item.user.avatar,
      },
    }));
    const _defaultValue = {
      taker: currentUser,
      sub_tasks: _sub_tasks,
      internal_training_group: id,
      redirect_routes: [
        {
          name: 'TrainingIndex',
          params: {
            _tabIndex: 1
          }
        },
        {
          name: 'TrainingGroupShow',
          params: {
            id: id,
            _tabIndex: 2
          }
        }
      ]
    }
    const _task = JSON.stringify(_defaultValue)
    await AsyncStorage.setItem('TaskCreate', _task)
  }

  // Options
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <WsIconBtn
            name="md-add"
            color={$color.white}
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={async() => {
              await $_setStorage()
              navigation.push('RoutesTask', {
                screen: 'TaskCreate'
              })
            }}
          />
        )
      },
      headerLeft: () => {
        return (
          <WsIconBtn
            testID={"backButton"}
            name="ws-outline-arrow-left"
            color="white"
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              navigation.goBack()
            }}
          />
        )
      }
    })
  }
  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
    }
  }

  const $_setArticleText = article => {
    if (article.act_version) {
      return `${article.act_version.name} ${article.no_text}`
    } else if (article.act_versions) {
      return `${article.act_versions[0].name} ${article.no_text}`
    } else {
      return t('無')
    }
  }

  // Function
  const $_ratio = item => {
    const _isDone = item.sub_tasks.filter(task => {
      return task.done_at
    })
    if (item.sub_tasks.length * 100 != 0) {
      return Math.round((_isDone.length / item.sub_tasks.length) * 1000) / 10
    } else if (item.done_at) {
      return 100
    } else {
      return 0
    }
  }

  React.useEffect(() => {
    $_fetchTrainingTimeRecordLackIndex()
  }, [route, id])

  React.useEffect(() => {
    $_setNavigationOption()
  }, [tabIndex, responseData])

  return (
    <>
      <WsPageIndex
        modelName={'task'}
        serviceIndexKey={'index'}
        params={params}
        renderItem={({ item, index }: { item: TrainingItem, index: number }) => (
          <>
            <View
              style={{
                marginTop: index === 0 ? 16 : 0,
                marginBottom: 8
              }}>
              <LlTaskCard001
                style={{
                  marginTop: 8
                }}
                ratio={$_ratio(item)}
                item={item}
                onPress={() => {
                  navigation.push('RoutesTask', {
                    screen: 'TaskShow',
                    params: {
                      id: item.id
                    }
                  })
                }}
              />
            </View>
          </>
        )}
      >
      </WsPageIndex >
    </>
  )
}
export default TrainingGroupTaskList
