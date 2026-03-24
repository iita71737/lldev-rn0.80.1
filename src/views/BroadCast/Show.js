import React from 'react'
import { Pressable, ScrollView, View, TouchableOpacity } from 'react-native'
import {
  WsPaddingContainer,
  WsText,
  WsInfo,
  WsBtn,
  WsHtmlRender,
  LlNavButton002,
  WsGradientButton,
  WsIconBtn,
  LlTaskCard001,
  WsModal,
  WsCard,
  WsPageIndex,
  LlTaskTempalteResuePopup001
} from '@/components'
import AsyncStorage from '@react-native-community/async-storage'
import $color from '@/__reactnative_stone/global/color'
import S_Broadcast from '@/services/api/v1/ll_broadcast'
import S_Task from '@/services/api/v1/task'
import S_TaskFactoryTemplate from '@/services/api/v1/task_factory_template'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { StackActions } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { scopePermission } from '@/__reactnative_stone/global/permission'

const BroadCastShow = ({ route }) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // props
  const {
    id
  } = route.params

  console.log(id,'=id=');

  // State
  const [broadcast, setBroadcast] = React.useState()
  const [tasks, setTasks] = React.useState()
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

  // Redux
  const currentUser = useSelector(state => state.data.currentUser)
  const currentUserScope = useSelector(state => state.data.userScopes)
  const currentFactoryTags = useSelector(state => state.data.factoryTags)
  const canReadTaskTemplate = scopePermission('task-factory-template-read', currentUserScope)

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
  const $_fetchApi = async () => {
    const res = await S_Broadcast.show(id)
    setBroadcast(res)
  }

  const $_fetchTask = async () => {
    const res = await S_Task.index({
      params: {
        ll_broadcast: id
      }
    })
    setTasks(res.data)
  }

  // Function
  const $_setAreasValue = broadcast => {
    return broadcast.areas.map(area => {
      return area.name
    })
  }

  const $_mergeSystemSubclasses = React.useCallback((templateSubTasks = []) => {
    const _broadcastSystemSubclasses = Array.isArray(broadcast?.system_subclasses)
      ? broadcast.system_subclasses
      : []
    const _templateSubTaskSystemSubclasses = Array.isArray(templateSubTasks)
      ? templateSubTasks.flatMap(subTask =>
        Array.isArray(subTask?.system_subclasses) ? subTask.system_subclasses : []
      )
      : []
    return [
      ..._broadcastSystemSubclasses,
      ..._templateSubTaskSystemSubclasses
    ].reduce((acc, item) => {
      if (!item) {
        return acc
      }
      const _key = typeof item === 'object'
        ? (item.id || item.name || JSON.stringify(item))
        : String(item)
      if (!acc._set.has(_key)) {
        acc._set.add(_key)
        acc._list.push(item)
      }
      return acc
    }, { _set: new Set(), _list: [] })._list
  }, [broadcast])

  const $_createTask = async () => {
    if (!broadcast?.id) {
      return
    }
    await AsyncStorage.removeItem('TaskCreate')
    await AsyncStorage.setItem(
      'TaskCreate',
      JSON.stringify({
        ll_broadcast: broadcast.id,
        system_subclasses: $_mergeSystemSubclasses()
      })
    )
    navigation.push('RoutesTask', {
      screen: 'TaskCreateFromLLBroadcast',
      params: {
        ll_broadcast: broadcast.id,
      }
    })
  }

  const $_createTaskFromTemplate = React.useCallback(async (
    _template,
    {
      includeSubTaskTaker,
      includeTaskTaker
    }
  ) => {
    if (!broadcast?.id) {
      return
    }
    const _taskCreateDraft = S_TaskFactoryTemplate.getTaskCreateDraftFromTemplate(_template, {
      includeSubTaskTaker,
      includeTaskTaker,
      currentUser: currentUser || null
    })
    const _mergedSystemSubclasses = $_mergeSystemSubclasses(_taskCreateDraft?.sub_tasks)
    await AsyncStorage.removeItem('TaskCreate')
    await AsyncStorage.setItem('TaskCreate', JSON.stringify({
      ..._taskCreateDraft,
      ll_broadcast: broadcast.id,
      system_subclasses: _mergedSystemSubclasses
    }))
    navigation.push('RoutesTask', {
      screen: 'TaskCreateFromLLBroadcast',
      params: {
        ll_broadcast: broadcast.id,
      }
    })
  }, [broadcast, navigation, currentUser, $_mergeSystemSubclasses])

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

  // setOption
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerLeft: () => (
        <>
          <WsIconBtn
            disabled={false}
            name={'md-arrow-back'}
            onPress={() => {
              navigation.goBack()
            }}
            size={22}
            color={$color.white}
          />
        </>
      )
    })
  }

  React.useEffect(() => {
    $_fetchApi()
    $_fetchTask()
  }, [])

  React.useEffect(() => {
    $_setNavigationOption()
  }, [])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      $_fetchApi()
      $_fetchTask()
    })
    return unsubscribe
  }, [navigation])

  // Render
  return (
    <>
      <ScrollView>
        {broadcast && (
          <>
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white,
                marginBottom: 8
              }}>
              <WsText size={24} fontWeight="600">
                {broadcast.name}
              </WsText>
            </WsPaddingContainer>
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white,
                marginBottom: 8
              }}>
              <View
                style={{
                }}
              >
                <WsInfo
                  label={t('發布時間')}
                  value={moment(broadcast.announce_at).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )}
                  style={{
                    flexDirection: 'row'
                  }}
                />
              </View>

              <View
                style={{
                  marginTop: 8
                }}
              >
                <WsInfo
                  label={t('適用地區')}
                  value={$_setAreasValue(broadcast)}
                  style={{
                    flexDirection: 'row'
                  }}
                />
              </View>

            </WsPaddingContainer>
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white
              }}>
              <WsText size={14} fontWeight="700">
                {t('內容')}
              </WsText>
              <WsHtmlRender content={broadcast.content} />
              {broadcast.attaches.length > 0 && (
                <WsInfo
                  label={t('附件')}
                  type="filesAndImages" value={broadcast.attaches}
                />
              )}
            </WsPaddingContainer>
            {tasks && tasks.length > 0 && (
              <>
                <View
                  style={{
                    marginTop: 16
                  }}
                >
                  <WsText
                    fontWeight={500}
                    style={{
                      paddingHorizontal: 16,
                    }}
                  >{t('相關任務')}
                  </WsText>
                  <LlTaskCard001
                    item={tasks[0]}
                    onPress={() => {
                      navigation.push('RoutesTask', {
                        screen: 'TaskShow',
                        params: {
                          id: tasks[0].id,
                        }
                      })
                    }}
                  />
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      <WsPaddingContainer style={{ backgroundColor: $color.white }}>
        <WsGradientButton
          borderRadius={28}
          onPress={() => {
            if (canReadTaskTemplate) {
              setStateTaskCreateModeModal(true)
              return
            }
            $_createTask()
          }}>
          {t('建立任務')}
        </WsGradientButton>
      </WsPaddingContainer>

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
            await $_createTask()
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

export default BroadCastShow
