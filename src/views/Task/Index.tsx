import React from 'react'
import {
  WsPage002,
  WsIconBtn,
  WsModal,
  WsCard,
  WsText,
  WsPageIndex,
  LlTaskTempalteResuePopup001
} from '@/components'
import { StatusBar, TouchableOpacity } from 'react-native'
import TaskListIndex from '@/views/Task/Tasks/Index'
import TaskFactoryTemplateList from '@/sections/Task/TaskFactoryTemplateList'
import TaskTemplateColloction from '@/sections/Task/TaskTemplateColloction'
import { useTranslation } from 'react-i18next'
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-community/async-storage'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import $option from '@/__reactnative_stone/global/option'
import moment from 'moment'
import { scopePermission } from '@/__reactnative_stone/global/permission'
import S_TaskFactoryTemplate from '@/services/api/v1/task_factory_template'

interface ToggleTab {
  value: string;
  label: string;
  view: React.FC<any>;
  props: any;
}

const TaskIndex: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const route = useRoute<any>()

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentFactoryTags = useSelector(state => state.data.factoryTags)
  const currentUserScope = useSelector(state => state.data.userScopes)
  const currentUser = useSelector(state => state.data.currentUser)
  const canReadTaskTemplate = scopePermission('task-factory-template-read', currentUserScope)
  const canCreateTask = scopePermission('task-create', currentUserScope)
  const canCreateTaskTemplate = scopePermission('task-factory-template-create', currentUserScope)

  // State
  const [tabIndex, setTabIndex] = React.useState(route?.params?._tabIndex ?? 0)
  const [stateModal, setStateModal] = React.useState(false)
  const [stateTemplateModal, setStateTemplateModal] = React.useState(false)
  const [stateTemplateReuseModal, setStateTemplateReuseModal] = React.useState(false)
  const [pendingTemplate, setPendingTemplate] = React.useState<any>(null)
  const [templateHasTaker, setTemplateHasTaker] = React.useState(false)
  const [templateHasSubTaskTaker, setTemplateHasSubTaskTaker] = React.useState(false)
  const [includeSubTaskTaker, setIncludeSubTaskTaker] = React.useState(true)
  const [includeTaskTaker, setIncludeTaskTaker] = React.useState(true)
  const includeSubTaskTakerRef = React.useRef(true)
  const includeTaskTakerRef = React.useRef(true)
  const [filterFields] = React.useState<any>({
    // status: {
    //   type: 'picker',
    //   label: t('狀態'),
    //   placeholder: t('選擇'),
    //   items: [
    //     {
    //       label: t('已發布'),
    //       value: 'released'
    //     },
    //     {
    //       label: t('草稿'),
    //       value: 'draft'
    //     },
    //   ]
    // },
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

  const $_createTaskFromTemplate = React.useCallback(async (
    _template: any,
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
    navigation.push('RoutesTask', {
      screen: 'TaskCreate'
    })
  }, [navigation, currentUser])

  const $_onSelectTemplateForCreate = React.useCallback(async (template: any) => {
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
  }, [])

  const toggleTabs = React.useMemo(() => {
    const _tabs: ToggleTab[] = [
      {
        value: 'taskList',
        label: t('任務'),
        view: TaskListIndex,
        props: {}
      }
    ]
    if (canReadTaskTemplate) {
      _tabs.push(
        {
          value: 'taskTemplateDraft',
          label: t('任務公版'),
          view: TaskFactoryTemplateList,
          props: {}
        },
        {
          value: 'taskTemplateColloction',
          label: t('常用公版'),
          view: TaskTemplateColloction,
          props: {}
        }
      )
    }
    return _tabs
  }, [canReadTaskTemplate, t])

  const $_applyHeaderOptions = React.useCallback(() => {
    const isTaskListTab = tabIndex === 0
    const isTaskTemplateTab = tabIndex === 1
    navigation.setOptions({
      ...$option.headerOption,
      headerShown: true,
      title: t('任務'),
      headerLeft: () => (
        <WsIconBtn
          testID="backButton"
          name="md-chevron-left"
          color={$color.white}
          size={32}
          onPress={() => {
            navigation.goBack()
          }}
        />
      ),
      headerRight: () => {
        if (isTaskListTab && canCreateTask) {
          return (
            <WsIconBtn
              name="md-add"
              color={$color.white}
              size={24}
              style={{
                marginRight: 4
              }}
              onPress={async () => {
                if (canReadTaskTemplate) {
                  setStateModal(true)
                  return
                }
                await AsyncStorage.removeItem('TaskCreate')
                navigation.push('RoutesTask', {
                  screen: 'TaskCreate'
                })
              }}
            />
          )
        }
        if (isTaskTemplateTab && canCreateTaskTemplate) {
          return (
            <WsIconBtn
              name="md-add"
              color={$color.white}
              size={24}
              style={{
                marginRight: 4
              }}
              onPress={async () => {
                await AsyncStorage.removeItem('TaskTemplateCreate')
                // 方便測試流程假資料
                // await AsyncStorage.setItem('TaskTemplateCreate',
                //   JSON.stringify({
                //     name: `${moment().format('YYYY/MM/DD HH:mm:ss')}-測試用`,
                //     remark: 'remark',
                //     taker: {
                //       id: 'bff06c0a-81ff-11ee-89b0-42010a8c000b',
                //       name: '蔡A辣',
                //       avatar: 'https://api.ll-esh-app.wasateam.com/api/user/avatar/1754365746fCn2w/5A0D3BA9-8F5E-47CE-B6D8-A869CCA6B93E.jpg?signature=98c856a75b992806a1ad706b1396db4339b07d04207ea1ea22ae77930f7d27b2'
                //     },
                //     system_subclasses: [
                //       {
                //         id: '071076a4-9354-11ee-89b0-42010a8c000b',
                //         icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970290907Hxye/%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=92e2de79f59870c095a20f86b32f91b7c6c0cafb97a13a17300c44a72b253361',
                //         name: '空氣污染防治'
                //       },
                //       {
                //         id: '071076f7-9354-11ee-89b0-42010a8c000b',
                //         icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970291166yRtf/%E6%B0%B4%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=a6a7398e07bf6b21a3f7a69cadaa964af1a9c7a892c5fb8a2744409f6e9bdc8e',
                //         name: '水污染防治'
                //       }
                //     ],
                //     subtask_factory_templates: [
                //       {
                //         sequence: '001',
                //         factory: '9b720f8a-81ff-11ee-89b0-42010a8c000b',
                //         name: 'postman-test-subtask-template',
                //         remark: 'remark',
                //         // taker: {
                //         //   id: 'bff06c0a-81ff-11ee-89b0-42010a8c000b',
                //         //   name: '蔡A辣',
                //         //   avatar: 'https://api.ll-esh-app.wasateam.com/api/user/avatar/1754365746fCn2w/5A0D3BA9-8F5E-47CE-B6D8-A869CCA6B93E.jpg?signature=98c856a75b992806a1ad706b1396db4339b07d04207ea1ea22ae77930f7d27b2'
                //         // },
                //         attaches: [],
                //         system_subclasses: [
                //           {
                //             id: '071076a4-9354-11ee-89b0-42010a8c000b',
                //             icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970290907Hxye/%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=92e2de79f59870c095a20f86b32f91b7c6c0cafb97a13a17300c44a72b253361',
                //             name: '空氣污染防治'
                //           },
                //           {
                //             id: '071076f7-9354-11ee-89b0-42010a8c000b',
                //             icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970291166yRtf/%E6%B0%B4%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=a6a7398e07bf6b21a3f7a69cadaa964af1a9c7a892c5fb8a2744409f6e9bdc8e',
                //             name: '水污染防治'
                //           }
                //         ],
                //         links: [
                //           {
                //             name: '客戶服務缺失',
                //             url: 'factory/9b720f8a-81ff-11ee-89b0-42010a8c000b/checklist-content/93390f87-3e40-4368-8cc0-f12907e2dc48',
                //             remark: 'remark',
                //             from_module: 'checklist',
                //             module_page_value: 'module_page_value',
                //             type: 'domain'
                //           }
                //         ]
                //       }
                //     ],
                //     factory: '9b720f8a-81ff-11ee-89b0-42010a8c000b',
                //     factory_tags: [
                //       {
                //         id: 'ce238274-89e7-4a55-9746-86f14e598336',
                //         name: 'Beautiful'
                //       },
                //       {
                //         id: '432a6410-84c7-4822-a64d-d9bbc0605588',
                //         name: 'HR'
                //       }
                //     ],
                //     links: [
                //       {
                //         name: '客戶服務缺失',
                //         url: 'factory/9b720f8a-81ff-11ee-89b0-42010a8c000b/checklist-content/93390f87-3e40-4368-8cc0-f12907e2dc48',
                //         remark: 'remark',
                //         from_module: 'checklist',
                //         module_page_value: 'module_page_value',
                //         type: 'domain'
                //       }
                //     ]
                //   })
                // )
                navigation.push('RoutesTask', {
                  screen: 'TaskTemplateCreate'
                })
              }}
            />
          )
        }
        return null
      }
    })
  }, [tabIndex, navigation, t, canReadTaskTemplate, canCreateTask, canCreateTaskTemplate])

  // 本頁 render 後兩次執行 $_applyHeaderOptions，確保 header 的設定被正確套用
  React.useLayoutEffect(() => {
    $_applyHeaderOptions()
  }, [$_applyHeaderOptions])

  // 回到這頁重新取得焦點時再次執行 $_applyHeaderOptions，確保 header 的設定被正確套用
  useFocusEffect(
    React.useCallback(() => {
      $_applyHeaderOptions()
      let raf2: number | undefined
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          $_applyHeaderOptions()
        })
      })
      return () => {
        cancelAnimationFrame(raf1)
        if (raf2 !== undefined) {
          cancelAnimationFrame(raf2)
        }
      }
    }, [$_applyHeaderOptions])
  )

  React.useEffect(() => {
    if (typeof route?.params?._tabIndex === 'number') {
      setTabIndex(route.params._tabIndex)
    }
  }, [route?.params?._tabIndex])

  React.useEffect(() => {
    if (tabIndex >= toggleTabs.length) {
      setTabIndex(0)
    }
  }, [tabIndex, toggleTabs.length])

  return (
    <>
      <WsPage002
        tabItems={toggleTabs}
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
      />
      <WsModal
        animationType={'none'}
        visible={stateModal}
        onBackButtonPress={() => {
          setStateModal(false)
        }}
        headerLeftOnPress={() => {
          setStateModal(false)
        }}
        title={t('新增任務')}
      >
        <TouchableOpacity
          style={{
            marginTop: 8,
            marginHorizontal: 16
          }}
          onPress={async () => {
            setStateModal(false)
            await AsyncStorage.removeItem('TaskCreate')
            await AsyncStorage.setItem('TaskCreate',
              JSON.stringify({
                sub_task_scope: 'taker'
              })
            )
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
              setStateModal(false)
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
          // filterVisible={false}
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
            setStateTemplateReuseModal(false)
          } catch (error) {
            console.log(error)
          }
        }}
      />
    </>
  )
}

export default TaskIndex
