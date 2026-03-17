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
  LlTaskTemplateCard001,
  WsPageIndex,
  WsSnackBar,
  LlTaskTempalteResuePopup001
} from '@/components'
import { useTranslation } from 'react-i18next'
import S_TaskFactoryTemplate from '@/services/api/v1/task_factory_template'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-community/async-storage'
import { useSelector } from 'react-redux'
import { scopePermission } from '@/__reactnative_stone/global/permission'

const TaskTemplateColloction: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentFactoryTags = useSelector(state => state.data.factoryTags)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentUserScope = useSelector(state => state.data.userScopes)
  const canCreateTask = scopePermission('task-create', currentUserScope)
  
  // state
  const [refreshCounter, setRefreshCounter] = React.useState(0)
  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('已儲存至「我的收藏」')
  )
  const [popupActive, setPopupActive] = React.useState(false)
  const [pendingTemplate, setPendingTemplate] = React.useState<any>(null)
  const [templateHasTaker, setTemplateHasTaker] = React.useState(false)
  const [templateHasSubTaskTaker, setTemplateHasSubTaskTaker] = React.useState(false)
  const [includeSubTaskTaker, setIncludeSubTaskTaker] = React.useState(true)
  const [includeTaskTaker, setIncludeTaskTaker] = React.useState(true)
  const includeSubTaskTakerRef = React.useRef(true)
  const includeTaskTakerRef = React.useRef(true)
  const [filterFields] = React.useState<any>({
    status: {
      type: 'picker',
      label: t('狀態'),
      placeholder: t('選擇'),
      items: [
        {
          label: t('全部'),
          value: 'released,draft'
        },
        {
          label: t('已發布'),
          value: 'released'
        },
        {
          label: t('草稿'),
          value: 'draft'
        },
      ]
    },
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    },
    factory_tags: {
      type: 'checkbox',
      label: t('標籤'),
      items: currentFactoryTags ? currentFactoryTags : [],
      searchVisible: true,
      selectAllVisible: false,
      defaultSelected: false
    },
  })

  const __params = React.useMemo(() => {
    const _params = {
      refresh_counter: refreshCounter
    }
    return _params
  }, [refreshCounter])

  const bookmarkOnPress = async (item: any) => {
    try {
      if (!item?.id) {
        return
      }
      if (item?.is_collect) {
        setIsSnackBarVisible(false)
        setIsSnackBarVisible(true)
        setSnackBarText(t('已從我的收藏中移除'))
        await S_TaskFactoryTemplate.unCollect(item.id)
      } else {
        setIsSnackBarVisible(false)
        setIsSnackBarVisible(true)
        setSnackBarText(t('已儲存至「我的收藏」'))
        await S_TaskFactoryTemplate.collect(item.id)
      }
      setRefreshCounter(prev => prev + 1)
    } catch (error) {
      console.log(error)
    }
  }

  const $_createTaskFromTemplate = async (
    _template,
    {
      includeSubTaskTaker,
      includeTaskTaker
    }: {
      includeSubTaskTaker: boolean
      includeTaskTaker: boolean
    }
  ) => {
    const _taskCreateDraft = S_TaskFactoryTemplate.getTaskCreateDraftFromTemplate(_template, {
      includeSubTaskTaker,
      includeTaskTaker,
      currentUser: currentUser || null
    })
    await AsyncStorage.removeItem('TaskCreate')
    await AsyncStorage.setItem('TaskCreate', JSON.stringify(_taskCreateDraft))
    navigation.push('TaskCreate')
  }

  const createTaskOnPress = async (item: any) => {
    try {
      const _template = await S_TaskFactoryTemplate.show({
        modelId: item?.id
      })
      const _hasTemplateTaker = Boolean(_template?.taker)
      const _hasSubTaskTaker = Array.isArray(_template?.subtask_factory_templates)
        && _template.subtask_factory_templates.some(subTask => Boolean(subTask?.taker))
      setPendingTemplate(_template)
      setTemplateHasTaker(_hasTemplateTaker)
      setTemplateHasSubTaskTaker(_hasSubTaskTaker)
      setIncludeTaskTaker(_hasTemplateTaker)
      setIncludeSubTaskTaker(_hasSubTaskTaker)
      includeTaskTakerRef.current = _hasTemplateTaker
      includeSubTaskTakerRef.current = _hasSubTaskTaker
      if (!_hasTemplateTaker && !_hasSubTaskTaker) {
        await $_createTaskFromTemplate(_template, {
          includeSubTaskTaker: false,
          includeTaskTaker: false
        })
        return
      }
      setPopupActive(true)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <WsSnackBar
        text={snackBarText}
        setVisible={setIsSnackBarVisible}
        visible={isSnackBarVisible}
        quickHidden={true}
      />
      <LlTaskTempalteResuePopup001
        active={popupActive}
        onClose={() => {
          setPopupActive(false)
        }}
        templateHasTaker={templateHasTaker}
        templateHasSubTaskTaker={templateHasSubTaskTaker}
        includeTaskTaker={includeTaskTaker}
        includeSubTaskTaker={includeSubTaskTaker}
        onChangeIncludeTaskTaker={(value: boolean) => {
          includeTaskTakerRef.current = value
          setIncludeTaskTaker(value)
        }}
        onChangeIncludeSubTaskTaker={(value: boolean) => {
          includeSubTaskTakerRef.current = value
          setIncludeSubTaskTaker(value)
        }}
        onConfirm={async () => {
          if (!pendingTemplate) {
            return
          }
          try {
            await $_createTaskFromTemplate(pendingTemplate, {
              includeSubTaskTaker: includeSubTaskTakerRef.current,
              includeTaskTaker: includeTaskTakerRef.current
            })
            setPopupActive(false)
          } catch (error) {
            console.log(error)
          }
        }}
      />
      <WsPageIndex
        modelName={'task_factory_template'}
        serviceIndexKey={'authCollectIndex'}
        params={__params}
        filterFields={filterFields}
        renderItem={({ item, index }) => (
          <>
            <LlTaskTemplateCard001
              testID={`LlTaskTemplateCard001-collect-${index}`}
              item={item}
              onPress={() => {
                navigation.push('TaskTemplateShow', {
                  id: item?.id
                })
              }}
              is_collect={item?.is_collect}
              is_collect_visible={true}
              bookmarkOnPress={() => {
                bookmarkOnPress(item)
              }}
              createTaskOnPress={() => {
                createTaskOnPress(item)
              }}
              canCreateTask={canCreateTask}
            />
          </>
        )}
        emptyTitle={t('目前尚無資料')}
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

export default TaskTemplateColloction
