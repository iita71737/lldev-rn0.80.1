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
  LlTrainingUserTotalTimeCard001
} from '@/components'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import AsyncStorage from '@react-native-community/async-storage'
import $color from '@/__reactnative_stone/global/color'
import S_TrainingGroup from '@/services/api/v1/internal_training_group'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import store from '@/store'
import license from '@/services/api/v1/license'
import { useNavigation } from '@react-navigation/native'
import { useIsFocused } from '@react-navigation/native'
import WsPageIndex from '@/__reactnative_stone/components/WsPageIndex'

const TrainingGroupUserTotalTimeRecord = ({ route, ...props }) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const isFocused = useIsFocused()

  // Params
  const id = props?.id || route?.params?.id || null;

  // REDUX
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // MEMO
  const params = React.useMemo(() => {
    return {
      order_by: 'train_at',
      order_way: 'desc',
      lang: 'tw',
      internal_training_group_id: id
    }
  }, [isFocused, currentRefreshCounter]);

  // States
  const [stateModal, setStateModal] = React.useState(false)
  const [selectVersionId, setSelectVersionId] = React.useState()
  const [dialogVisible, setDialogVisible] = React.useState(false)

  const [trainingGroup, setTrainingGroup] = React.useState(null)
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [bottomSheetItems, setBottomSheetItems] = React.useState([
    {
      to: {
        name: 'TrainingUpdate',
        params: {
          id: id
        }
      },
      icon: 'ws-outline-edit-pencil',
      label: t('編輯記錄')
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
  ])
  const [loading, setLoading] = React.useState(false)

  // Services
  const $_fetchTraining = async () => {
    setLoading(true)
    try {
      const res = await S_TrainingGroup.show({ modelId: id })
      setTrainingGroup(res)
    } catch (e) {
      console.error(e);
    }
  }

  // Storage
  const $_setStorage = async (item) => {
    // 傳入WsStepCreatePage的待辦格式
    let __defaultValueSubtasks = [{
      taker: {
        id: item?.user?.id,
        name: item?.user?.name
      }
    }]
    const _defaultValue = {
      taker: currentUser,
      sub_tasks: __defaultValueSubtasks,
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
            _tabIndex: 0
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
      headerRight: () => null,
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

  React.useEffect(() => {
    $_fetchTraining()
  }, [route, id])

  React.useEffect(() => {
    if (trainingGroup) {
      $_setNavigationOption()
    }
  }, [trainingGroup])

  return (
    <>
      <WsPageIndex
        modelName={'training_time_record'}
        serviceIndexKey={'indexByGroup'}
        params={params}
        renderItem={({ item, index }: { item: TrainingItem, index: number }) => (
          <>
            <LlTrainingUserTotalTimeCard001
              style={{
                marginTop: 16
              }}
              item={item}
              onPress={() => {
              }}
              onOnPressTopRight={async (item) => {
                await $_setStorage(item)
                navigation.push('RoutesTask', {
                  screen: 'TaskCreate'
                })
              }}
            ></LlTrainingUserTotalTimeCard001>
          </>
        )}
      >
      </WsPageIndex>
    </>
  )
}
export default TrainingGroupUserTotalTimeRecord
