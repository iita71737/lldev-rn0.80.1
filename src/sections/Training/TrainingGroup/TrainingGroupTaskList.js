import React from 'react'
import { ScrollView, View, TouchableOpacity } from 'react-native'
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
  WsCard,
  WsSkeleton,
  WsTabView,
  LlTrainingTimeRecordCard001,
  LlTrainingCard001,
  LlTaskCard001,
  LlTaskTempalteResuePopup001
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
import S_TaskFactoryTemplate from '@/services/api/v1/task_factory_template'
import { scopePermission } from '@/__reactnative_stone/global/permission'

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
  const currentUserScope = useSelector(state => state.data.userScopes)
  const currentFactoryTags = useSelector(state => state.data.factoryTags)
  const canReadTaskTemplate = scopePermission('task-factory-template-read', currentUserScope)

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
  const [stateTaskCreateModeModal, setStateTaskCreateModeModal] = React.useState(false)
  const [stateTemplateModal, setStateTemplateModal] = React.useState(false)
  const [stateTemplateReuseModal, setStateTemplateReuseModal] = React.useState(false)
  const [pendingTemplate, setPendingTemplate] = React.useState(null)
  const [templateHasTaker, setTemplateHasTaker] = React.useState(false)
  const [templateHasSubTaskTaker, setTemplateHasSubTaskTaker] = React.useState(false)
  const [includeSubTaskTaker, setIncludeSubTaskTaker] = React.useState(true)
  const [includeTaskTaker, setIncludeTaskTaker] = React.useState(true)
  const includeSubTaskTakerRef = React.useRef(true)
  const includeTaskTakerRef = React.useRef(true)
  const [selectVersionId, setSelectVersionId] = React.useState()
  const [dialogVisible, setDialogVisible] = React.useState(false)
  const [responseData, setResponseData] = React.useState(null)
  const [filterFields] = React.useState({
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
  const $_getTaskCreateBaseValue = React.useCallback(() => {
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
    return _defaultValue
  }, [responseData, currentUser, id])

  const $_setStorage = async () => {
    const _defaultValue = $_getTaskCreateBaseValue()
    const _task = JSON.stringify(_defaultValue)
    await AsyncStorage.setItem('TaskCreate', _task)
  }

  const $_createTaskFromTemplate = React.useCallback(async (
    _template,
    {
      includeSubTaskTaker,
      includeTaskTaker
    }
  ) => {
    const _taskCreateDraft = S_TaskFactoryTemplate.getTaskCreateDraftFromTemplate(_template, {
      includeSubTaskTaker,
      includeTaskTaker,
      currentUser: currentUser || null
    })
    const _baseValue = $_getTaskCreateBaseValue()
    await AsyncStorage.removeItem('TaskCreate')
    await AsyncStorage.setItem('TaskCreate', JSON.stringify({
      ..._taskCreateDraft,
      internal_training_group: _baseValue.internal_training_group,
      redirect_routes: _baseValue.redirect_routes
    }))
    navigation.push('RoutesTask', {
      screen: 'TaskCreate'
    })
  }, [$_getTaskCreateBaseValue, currentUser, navigation])

  const $_onSelectTemplateForCreate = React.useCallback(async (template) => {
    try {
      if (!template?.id) {
        return
      }
      const _template = await S_TaskFactoryTemplate.show({
        modelId: template.id
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
        setStateTemplateModal(false)
        await $_createTaskFromTemplate(_template, {
          includeSubTaskTaker: false,
          includeTaskTaker: false
        })
        return
      }
      setStateTemplateModal(false)
      setStateTemplateReuseModal(true)
    } catch (error) {
      console.log(error)
    }
  }, [$_createTaskFromTemplate])

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
              if (canReadTaskTemplate) {
                setStateTaskCreateModeModal(true)
                return
              }
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
  }, [tabIndex, responseData, canReadTaskTemplate])

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

      <WsModal
        animationType={'none'}
        visible={stateTaskCreateModeModal}
        onBackButtonPress={() => {
          setStateTaskCreateModeModal(false)
        }}
        headerLeftOnPress={() => {
          setStateTaskCreateModeModal(false)
        }}
        title={t('新增任務')}
      >
        <TouchableOpacity
          style={{
            marginTop: 8,
            marginHorizontal: 16
          }}
          onPress={async () => {
            setStateTaskCreateModeModal(false)
            await $_setStorage()
            navigation.push('RoutesTask', {
              screen: 'TaskCreate'
            })
          }}
        >
          <WsCard>
            <WsText>{t('直接建立')}</WsText>
          </WsCard>
        </TouchableOpacity>
        {canReadTaskTemplate && (
          <TouchableOpacity
            style={{
              marginTop: 8,
              marginHorizontal: 16
            }}
            onPress={() => {
              setStateTaskCreateModeModal(false)
              setStateTemplateModal(true)
            }}
          >
            <WsCard>
              <WsText>{t('引用公版')}</WsText>
            </WsCard>
          </TouchableOpacity>
        )}
      </WsModal>

      <WsModal
        animationType={'none'}
        visible={stateTemplateModal}
        onBackButtonPress={() => {
          setStateTemplateModal(false)
        }}
        headerLeftOnPress={() => {
          setStateTemplateModal(false)
        }}
        title={t('引用任務公版')}
      >
        <WsPageIndex
          modelName={'task_factory_template'}
          params={{
            order_by: 'updated_at',
            order_way: 'desc',
            status: 'released'
          }}
          filterFields={filterFields}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={{
                marginTop: 8,
                marginHorizontal: 16
              }}
              onPress={async () => {
                await $_onSelectTemplateForCreate(item)
              }}
            >
              <WsCard>
                <WsText>{item?.name || t('未命名公版')}</WsText>
              </WsCard>
            </TouchableOpacity>
          )}
          emptyTitle={t('目前尚無資料')}
        />
      </WsModal>

      <LlTaskTempalteResuePopup001
        active={stateTemplateReuseModal}
        onClose={() => {
          setStateTemplateReuseModal(false)
        }}
        templateHasTaker={templateHasTaker}
        templateHasSubTaskTaker={templateHasSubTaskTaker}
        includeTaskTaker={includeTaskTaker}
        includeSubTaskTaker={includeSubTaskTaker}
        onChangeIncludeTaskTaker={(value) => {
          includeTaskTakerRef.current = value
          setIncludeTaskTaker(value)
        }}
        onChangeIncludeSubTaskTaker={(value) => {
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
            setStateTemplateReuseModal(false)
          } catch (error) {
            console.log(error)
          }
        }}
      />
    </>
  )
}
export default TrainingGroupTaskList
