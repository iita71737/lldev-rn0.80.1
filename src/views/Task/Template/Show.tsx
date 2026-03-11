import React from 'react'
import { Alert, Linking, SafeAreaView, ScrollView, View, Dimensions, TouchableOpacity } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import {
  WsBottomSheet,
  WsCard,
  WsFlex,
  WsInfo,
  WsIcon,
  LlTaskHeaderCard001,
  WsLoading,
  WsPassageCollapse,
  WsPaddingContainer,
  WsPopup,
  WsGradientButton,
  WsTag,
  WsText
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_TaskFactoryTemplate from '@/services/api/v1/task_factory_template'
import { scopePermission } from '@/__reactnative_stone/global/permission'
import S_ModulePage from '@/services/api/v1/module_page'
import S_Factory from '@/services/api/v1/factory'
import store from '@/store'
import {
  setCurrentFactory,
  setCurrentOrganization,
  setCurrentViewMode
} from '@/store/data'

const TaskTemplateShow = ({ navigation, route }) => {
  const { width } = Dimensions.get('window')
  const { t } = useTranslation()
  const { id, taskHeaderActionAt, refreshKey } = route?.params || {}

  console.log(id, '=id=')

  // redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentUserScope = useSelector(state => state.data.userScopes)
  const factoryId = useSelector(state => state.data.currentFactory?.id)
  const canDeleteTemplate = scopePermission('task-factory-template-destory', currentUserScope)

  // state
  const [loading, setLoading] = React.useState(true)
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [taskTemplate, setTaskTemplate] = React.useState<any>()
  const [popupActive002, setPopupActive002] = React.useState(false)
  const [popupContentRelatedModule, setPopupContentRelatedModule] = React.useState<any>()
  const [popupActive, setPopupActive] = React.useState(false)
  const [popupContent, setPopupContent] = React.useState<any>()

  const $_fetchTaskTemplate = React.useCallback(async () => {
    try {
      setLoading(true)
      const res = await S_TaskFactoryTemplate.show({ modelId: id })
      setTaskTemplate(res)
      setLoading(false)
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }, [id])

  const $_setStorage = async () => {
    if (!taskTemplate) {
      return
    }
    const _isDraft = taskTemplate?.status === 'draft'
    if (_isDraft) {
      await AsyncStorage.setItem('TaskTemplateUpdateDraft', JSON.stringify(taskTemplate))
      return
    }
    await AsyncStorage.setItem('TaskTemplateUpdate', JSON.stringify(taskTemplate))
  }

  const $_copyTemplate = async () => {
    if (!taskTemplate) {
      return
    }
    const _name = taskTemplate?.name ? `${taskTemplate.name}-複製` : '未命名公版-複製'
    const _copyData = {
      ...taskTemplate,
      id: undefined,
      name: _name
    }
    await AsyncStorage.setItem('TaskTemplateCreate', JSON.stringify(_copyData))
    navigation.push('TaskTemplateCreate')
  }

  const $_createTaskByTemplate = async () => {
    if (!taskTemplate) {
      return
    }
    const _taskCreateDraft = S_TaskFactoryTemplate.getTaskCreateDraftFromTemplate(taskTemplate)
    await AsyncStorage.removeItem('TaskCreate')
    await AsyncStorage.setItem('TaskCreate', JSON.stringify(_taskCreateDraft))
    navigation.push('TaskCreate')
  }

  const $_deleteTaskTemplate = async () => {
    if (!canDeleteTemplate) {
      Alert.alert(t('無刪除權限'))
      return
    }
    try {
      await S_TaskFactoryTemplate.delete({ modelId: id })
      Alert.alert(t('已成功刪除'))
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'TaskIndex',
            params: {
              _tabIndex: 1
            }
          }
        ]
      })
    } catch (e: any) {
      console.error('TaskTemplateShow delete error', e?.response?.status, e?.response?.data)
      Alert.alert(t('刪除失敗'))
    }
  }

  const $_confirmDelete = () => {
    Alert.alert(
      t('確定刪除嗎？'),
      '',
      [
        {
          text: t('取消'),
          style: 'cancel'
        },
        {
          text: t('確定'),
          style: 'destructive',
          onPress: async () => {
            await $_deleteTaskTemplate()
          }
        }
      ]
    )
  }

  const $_onBottomSheetItemPress = async (item: any) => {
    if (item?.key === 'edit') {
      await $_setStorage()
      setIsBottomSheetActive(false)
      navigation.push(taskTemplate?.status === 'draft' ? 'TaskTemplateUpdateDraft' : 'TaskTemplateUpdate', {
        id: taskTemplate?.id
      })
      return
    }
    if (item?.key === 'copy') {
      setIsBottomSheetActive(false)
      await $_copyTemplate()
      return
    }
    if (item?.key === 'createTask') {
      setIsBottomSheetActive(false)
      await $_createTaskByTemplate()
      return
    }
    if (item?.key === 'delete') {
      setIsBottomSheetActive(false)
      $_confirmDelete()
    }
  }

  const openURL = async (url: string) => {
    if (!url) {
      return
    }
    const supported = await Linking.canOpenURL(url)
    if (supported) {
      await Linking.openURL(url)
    } else {
      Alert.alert(t('無法開啟連結'))
    }
  }

  const $_setLocalStorage = async (item: any, mode: string) => {
    if (mode === 'factory') {
      await AsyncStorage.setItem('factory', JSON.stringify(item))
      await AsyncStorage.removeItem('organization')
      return
    }
    if (mode === 'organization') {
      await AsyncStorage.setItem('organization', JSON.stringify(item))
      await AsyncStorage.removeItem('factory')
    }
  }

  const $_checkoutFactory = async (_factory: any) => {
    $_setLocalStorage(_factory, 'factory')
    store.dispatch(setCurrentFactory(_factory))
  }

  const $_checkoutOrganization = async (_factory: any) => {
    $_setLocalStorage(_factory, 'organization')
    store.dispatch(setCurrentOrganization(_factory))
    store.dispatch(setCurrentFactory(_factory))
    store.dispatch(setCurrentViewMode('organization'))
  }

  const $_getRedirectFactory = async (_factoryId: string, data: any) => {
    try {
      const _redirectFactory = await S_Factory.show({ modelId: _factoryId })
      setPopupContent({
        redirectFactory: _redirectFactory,
        payload: data
      })
      setPopupActive(true)
    } catch (error) {
      console.error(error)
    }
  }

  const $_readAndRedirect = async () => {
    if (
      popupContent &&
      popupContent?.redirectFactory &&
      popupContent?.redirectFactory?.id !== factoryId
    ) {
      if (popupContent?.redirectFactory?.name?.includes('集團')) {
        const matchedFactory = currentUser?.factories?.find(
          (factory: any) => factory?.id === popupContent?.redirectFactory?.id
        )
        await $_checkoutOrganization(matchedFactory)
        setTimeout(() => {
          S_ModulePage.redirectByAPIParams(popupContent?.payload, navigation)
        }, 1000)
      } else {
        try {
          await $_checkoutFactory(popupContent?.redirectFactory)
          setTimeout(() => {
            S_ModulePage.redirectByAPIParams(popupContent?.payload, navigation)
          }, 1000)
        } catch (error) {
          Alert.alert(t('您無此單位內相關權限，請聯絡系統管理員'))
        }
      }
    }
  }

  const $_redirectRelatedModule = async () => {
    let item = popupContentRelatedModule
    if (!item) {
      return
    }
    if (!item.from_module) {
      console.log('missing from_module')
      openURL(item?.url)
      return
    }
    try {
      const _params = {
        url: item?.url
      }
      const _res2 = await S_ModulePage.findAppPage({ params: _params })
      item.factoryId = _res2.data?.params?.factory
      item.from_module = item.from_module || _res2.data?.module
      item.route = _res2.data?.route
      item.modelId = _res2.data?.params?.id
      item.params = { ..._res2.data?.params }
      if (factoryId === item?.factoryId) {
        const result = await S_ModulePage.redirectByAPIParams(item, navigation)
        if (result === '404') {
          Alert.alert(t('請至電腦版使用。'))
        }
      } else {
        if (item.from_module) {
          $_getRedirectFactory(item?.factoryId, item)
        } else {
          openURL(item?.url)
        }
      }
    } catch (error) {
      console.error(error, 'e')
      if (item?.from_module) {
        Alert.alert(t('請至電腦版使用。'))
      }
    } finally {
      setPopupActive002(false)
    }
  }

  const bottomSheetItems = React.useMemo(() => {
    const _items = [
      {
        key: 'edit',
        icon: 'ws-outline-edit-pencil',
        label: taskTemplate?.status === 'draft' ? t('編輯草稿') : t('編輯')
      },
      {
        key: 'copy',
        icon: 'ws-outline-copy',
        label: t('複製公版')
      },
      {
        key: 'createTask',
        icon: 'll-nav-add-assignment',
        label: t('建立任務')
      }
    ]

    if (canDeleteTemplate) {
      _items.push({
        key: 'delete',
        icon: 'ws-outline-delete',
        color: $color.danger,
        label: t('刪除'),
        labelColor: $color.danger
      })
    }

    return _items
  }, [canDeleteTemplate, t, taskTemplate?.status])

  React.useEffect(() => {
    $_fetchTaskTemplate()
  }, [$_fetchTaskTemplate, refreshKey])

  React.useEffect(() => {
    if (!taskHeaderActionAt) {
      return
    }
    setIsBottomSheetActive(true)
  }, [taskHeaderActionAt])

  const $_toTaskHeaderData = () => {
    if (!taskTemplate) {
      return {}
    }
    return {
      ...taskTemplate,
      creator: taskTemplate?.create_user || taskTemplate?.creator,
      sub_tasks: taskTemplate?.subtask_factory_templates || []
    }
  }

  const $_getStatusText = () => {
    if (taskTemplate?.status === 'released') {
      return t('已發佈')
    }
    if (taskTemplate?.status === 'draft') {
      return t('草稿')
    }
    return taskTemplate?.status || t('未設定')
  }

  const $_getStatusTagStyle = () => {
    if (taskTemplate?.status === 'released') {
      return {
        backgroundColor: $color.green11l,
        textColor: $color.green
      }
    }
    return {
      backgroundColor: $color.primary11l,
      textColor: $color.primary2l
    }
  }

  return (
    <>
      {loading ? (
        <WsLoading
          style={{
            marginTop: 16
          }}
        />
      ) : (
        <SafeAreaView
          style={{
            flex: 1
          }}
        >
          <ScrollView
            scrollIndicatorInsets={{ right: 1 }}
          >
            <LlTaskHeaderCard001
              title={taskTemplate?.name || t('未命名公版')}
              task={$_toTaskHeaderData()}
            />
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white,
                marginTop: 8
              }}
            >

              <View style={{ marginTop: 8 }}>
                <WsFlex>
                  <WsText size={14} fontWeight={'600'} style={{ width: 100 }}>
                    {t('狀態')}
                  </WsText>
                  <WsTag
                    backgroundColor={$_getStatusTagStyle().backgroundColor}
                    textColor={$_getStatusTagStyle().textColor}
                  >
                    {$_getStatusText()}
                  </WsTag>
                </WsFlex>
              </View>

              <View style={{ marginTop: 8 }}>
                <WsInfo
                  labelWidth={100}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  type="user"
                  label={t('負責人')}
                  color={taskTemplate?.taker}
                  value={taskTemplate?.taker}
                />
              </View>

              <WsFlex style={{ marginTop: 4 }}>
                <WsText size={14} fontWeight={'600'} style={{ width: 100 }}>
                  {t('領域')}
                </WsText>
                <WsFlex
                  flexWrap={'wrap'}
                  style={{ marginLeft: 8, marginRight: 16, flex: 1 }}
                >
                  {taskTemplate?.system_subclasses?.map((systemSubclass: any, index: number) => (
                    <WsTag
                      img={systemSubclass?.icon}
                      key={`${systemSubclass?.id || index}`}
                      style={{ marginTop: 4, marginRight: 8 }}
                    >
                      {systemSubclass?.name}
                    </WsTag>
                  ))}
                </WsFlex>
              </WsFlex>

              <View style={{ marginTop: 8 }}>
                <WsInfo
                  labelWidth={100}
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  label={t('說明')}
                  color={$color.black5l}
                  value={taskTemplate?.remark || t('無')}
                />
              </View>

              <WsFlex style={{ marginTop: 8 }} flexWrap={'wrap'}>
                {taskTemplate?.factory_tags?.map((tag: any, index: number) => (
                  <WsTag
                    style={{ marginRight: 8, marginTop: 4 }}
                    key={`${tag?.id || index}`}
                    backgroundColor={$color.white2d}
                    textColor={$color.black}
                  >
                    {`#${tag?.name || ''}`}
                  </WsTag>
                ))}
              </WsFlex>

              {!!taskTemplate?.links?.length && (
                <WsPaddingContainer
                  padding={0}
                  style={{
                    marginTop: 8,
                    paddingBottom: 16,
                    backgroundColor: $color.white,
                  }}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  >
                    <WsText size={14} fontWeight={'600'}>
                      {t('相關資料')}
                    </WsText>
                  </View>
                  <WsPassageCollapse type={'array'}>
                    {taskTemplate.links.map((item: any, index: number) => (
                      <View
                        key={`${item?.id || index}`}
                        style={{ marginTop: 8 }}
                      >
                        <WsInfo
                          type="link"
                          value={item?.name || t('無')}
                          style={{
                            maxWidth: width * 0.8,
                            flexWrap: 'wrap',
                          }}
                          onPress={() => {
                            setPopupContentRelatedModule(item)
                            setPopupActive002(true)
                          }}
                        />

                        {Array.isArray(item?.record_links) && item.record_links.length > 0 && (
                          <View
                            style={{
                              backgroundColor: $color.primary11l,
                              paddingHorizontal: 16,
                              paddingVertical: 8,
                              borderRadius: 10,
                            }}
                          >
                            <View
                              style={{
                                marginTop: 4,
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            >
                              <WsText size={14} fontWeight={'600'}>
                                {t('關聯連結')}
                              </WsText>
                            </View>
                            {item.record_links.map((subItem: any, subIndex: number) => (
                              <View key={`${subItem?.id || subIndex}`}>
                                <WsInfo
                                  type="link"
                                  value={`[${t('結果')}] ${subItem?.name || ''} (${moment(subItem?.created_at).format('YYYY-MM-DD HH:mm:ss')}) `}
                                  style={{
                                    flexWrap: 'wrap',
                                  }}
                                  onPress={() => {
                                    setPopupContentRelatedModule(subItem)
                                    setPopupActive002(true)
                                  }}
                                />
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}
                  </WsPassageCollapse>
                </WsPaddingContainer>
              )}
            </WsPaddingContainer>

            <WsPaddingContainer
              style={{
                backgroundColor: $color.white,
                marginTop: 8
              }}
            >
              <WsFlex
                justifyContent="space-between"
                style={{ marginRight: 4 }}
              >
                <WsText>{t('待辦事項')}</WsText>
              </WsFlex>

              {!!taskTemplate?.subtask_factory_templates?.length ? (
                taskTemplate.subtask_factory_templates.map((subtask: any, index: number) => (
                  <WsCard
                    key={`${subtask?.id || index}`}
                    style={{
                      backgroundColor: $color.primary11l,
                      marginTop: 8
                    }}
                  >
                    <WsText>{subtask?.name || t('未命名待辦')}</WsText>

                    {!!subtask?.system_subclasses?.length && (
                      <View style={{
                        marginTop: 8
                      }}>
                        <WsFlex
                          style={{}}
                          flexWrap="wrap"
                          alignItems="flex-start"
                          justifyContent="flex-start"
                        >
                          {subtask.system_subclasses.map((item: any, subIndex: number) => (
                            <WsTag
                              key={`${item?.id || subIndex}`}
                              img={item?.icon}
                              backgroundColor={$color.white}
                              textColor={$color.primary2l}
                              style={{
                                marginRight: 4,
                                marginBottom: 4,
                                alignSelf: 'flex-start'
                              }}
                            >
                              {`${item?.name || ''}`}
                            </WsTag>
                          ))}
                        </WsFlex>
                      </View>
                    )}

                    <View
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsInfo
                        type={'user'}
                        style={{
                          flexDirection: 'row',
                        }}
                        labelWidth={84}
                        label={t('執行者')}
                        value={subtask?.taker}
                      />
                    </View>

                    <View
                      style={{
                        marginTop: 4
                      }}
                    >
                      <WsInfo
                        style={{
                          flexDirection: 'row',
                        }}
                        labelWidth={84}
                        label={t('說明')}
                        value={subtask?.remark || t('無')}
                      />
                    </View>

                    {!!(subtask?.links?.length || subtask?.related_module?.length) && (
                      <WsPaddingContainer
                        padding={0}
                        style={{
                          marginTop: 8,
                          backgroundColor: 'transparent',
                        }}
                      >
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          <WsText size={14} fontWeight={'600'}>
                            {t('相關資料')}
                          </WsText>
                        </View>
                        <WsPassageCollapse type={'array'}>
                          {(subtask?.links || subtask?.related_module || []).map((item: any, linkIndex: number) => (
                            <View
                              key={`${item?.id || linkIndex}`}
                              style={{
                                marginTop: 8,
                              }}
                            >
                              <WsInfo
                                type="link"
                                value={item?.name || t('無')}
                                style={{
                                  maxWidth: width * 0.8,
                                  flexWrap: 'wrap',
                                }}
                                onPress={() => {
                                  setPopupContentRelatedModule(item)
                                  setPopupActive002(true)
                                }}
                              />

                              {Array.isArray(item?.record_links) &&
                                item.record_links.length > 0 && (
                                  <View
                                    style={{
                                      backgroundColor: $color.primary11l,
                                      paddingHorizontal: 16,
                                      paddingVertical: 8,
                                      borderRadius: 10,
                                    }}
                                  >
                                    <View
                                      style={{
                                        marginTop: 4,
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                      }}
                                    >
                                      <WsText size={14} fontWeight={'600'}>
                                        {t('關聯連結')}
                                      </WsText>
                                    </View>
                                    {item.record_links.map((subItem: any, subIndex: number) => (
                                      <View key={`${subItem?.id || subIndex}`}>
                                        <WsInfo
                                          type="link"
                                          value={`[${t('結果')}] ${subItem?.name || ''} (${moment(subItem?.created_at).format('YYYY-MM-DD HH:mm:ss')}) `}
                                          style={{
                                            flexWrap: 'wrap',
                                          }}
                                          onPress={() => {
                                            setPopupContentRelatedModule(subItem)
                                            setPopupActive002(true)
                                          }}
                                        />
                                      </View>
                                    ))}
                                  </View>
                                )}
                            </View>
                          ))}
                        </WsPassageCollapse>
                      </WsPaddingContainer>
                    )}

                    {!!(subtask?.attaches?.length || subtask?.file_attaches?.length) && (
                      <View
                        style={{
                          marginTop: 8
                        }}
                      >
                        <WsInfo
                          style={{
                            flexDirection: 'row',
                          }}
                          labelWidth={84}
                          label={t('附件')}
                          type="filesAndImages"
                          value={subtask?.attaches || subtask?.file_attaches || []}
                        />
                      </View>
                    )}

                  </WsCard>
                ))
              ) : (
                <WsText style={{ marginTop: 8 }} color={$color.gray3d}>
                  {t('無')}
                </WsText>
              )}
            </WsPaddingContainer>
          </ScrollView>
        </SafeAreaView>
      )}

      <WsBottomSheet
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        items={bottomSheetItems}
        snapPoints={[148, 248]}
        onItemPress={$_onBottomSheetItemPress}
      />

      <WsPopup
        active={popupActive002}
        onClose={() => {
          setPopupActive002(false)
        }}
      >
        <View
          style={{
            width: width * 0.9,
            backgroundColor: $color.white,
            borderRadius: 10,
            padding: 16,
          }}
        >
          {popupContentRelatedModule?.name && (
            <View>
              <WsInfo
                labelWidth={80}
                value={popupContentRelatedModule?.name || t('無')}
                type="link"
                label={t('名稱')}
                style={{
                  flexDirection: 'row',
                }}
                onPress={async () => {
                  await $_redirectRelatedModule()
                }}
              />
            </View>
          )}

          <View
            style={{
              marginTop: 8
            }}
          >
            <WsInfo
              labelWidth={80}
              value={popupContentRelatedModule?.remark || t('無')}
              label={t('備註')}
              style={{
                flexDirection: 'row',
              }}
            />
          </View>
        </View>
      </WsPopup>

      <WsPopup
        active={popupActive}
        onClose={() => {
          setPopupActive(false)
        }}
      >
        <View
          style={{
            width: width * 0.9,
            backgroundColor: $color.white,
            borderRadius: 10,
            padding: 16,
            paddingBottom: 88,
          }}
        >
          <WsText
            size={14}
            color={$color.black}
            style={{
              flexWrap: 'wrap',
            }}
          >
            {t(`即將前往{text}，若尚未儲存資料請先儲存`, {
              text: popupContent?.redirectFactory?.name
            })}
          </WsText>
          <WsFlex
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
            }}
          >
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                width: 110,
                height: 48,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8,
              }}
              onPress={() => {
                setPopupActive(false)
              }}
            >
              <WsText
                size={14}
                color={$color.gray}
              >
                {t('取消')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              testID={'繼續前往'}
              style={{
                width: 110,
              }}
              onPress={() => {
                setPopupActive(false)
                setTimeout(() => {
                  $_readAndRedirect()
                }, 1000)
              }}
            >
              {t('前往')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>
    </>
  )
}

export default TaskTemplateShow
