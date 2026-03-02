import React from 'react'
import { Alert, Linking, SafeAreaView, ScrollView, View } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import {
  WsBottomSheet,
  WsCard,
  WsFlex,
  WsInfo,
  WsIcon,
  LlTaskHeaderCard001,
  WsLoading,
  WsPaddingContainer,
  WsTag,
  WsText
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_TaskFactoryTemplate from '@/services/api/v1/task_factory_template'

const TaskTemplateShow = ({ navigation, route }) => {
  const { t } = useTranslation()
  const { id, taskHeaderActionAt, refreshKey } = route?.params || {}

  console.log(id,'=id=')

  const [loading, setLoading] = React.useState(true)
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [taskTemplate, setTaskTemplate] = React.useState<any>()

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

  const $_deleteTaskTemplate = async () => {
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
    if (item?.label === t('刪除')) {
      setIsBottomSheetActive(false)
      $_confirmDelete()
    }
  }

  const $_openURL = async (url: string) => {
    if (!url) {
      return
    }
    const supported = await Linking.canOpenURL(url)
    if (!supported) {
      Alert.alert(t('無法開啟連結'))
      return
    }
    await Linking.openURL(url)
  }

  const bottomSheetItems = React.useMemo(
    () => [
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
        key: 'delete',
        icon: 'ws-outline-delete',
        color: $color.danger,
        label: t('刪除'),
        labelColor: $color.danger
      }
    ],
    [t, taskTemplate?.status]
  )

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
              <WsInfo
                labelWidth={100}
                style={{ flexDirection: 'row', alignItems: 'center' }}
                label={t('更新日期')}
                color={$color.black5l}
                value={taskTemplate?.updated_at ? moment(taskTemplate.updated_at).format('YYYY-MM-DD') : t('無')}
              />

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
                  color={$color.black5l}
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
                  <WsText size={14} fontWeight={'600'}>
                    {t('相關資料')}
                  </WsText>
                  {taskTemplate.links.map((item: any, index: number) => (
                    <View
                      key={`${item?.id || index}`}
                      style={{ marginTop: 8 }}
                    >
                      <WsInfo
                        type="link"
                        value={item?.name || t('無')}
                        style={{ maxWidth: '90%', flexWrap: 'wrap' }}
                        onPress={() => {
                          $_openURL(item?.url)
                        }}
                      />
                    </View>
                  ))}
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
                <WsText>{t('待辦事項公版')}</WsText>
                <WsFlex>
                  <WsIcon
                    name="ws-filled-check-circle"
                    size={18}
                    color={$color.gray}
                    style={{ marginRight: 4 }}
                  />
                  <WsText size={12} color={$color.gray}>
                    {`0 / ${taskTemplate?.subtask_factory_templates?.length || 0}`}
                  </WsText>
                </WsFlex>
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
                    <WsInfo
                      style={{ marginTop: 8 }}
                      labelWidth={84}
                      label={t('說明')}
                      value={subtask?.remark || t('無')}
                    />
                    <WsInfo
                      style={{ marginTop: 8 }}
                      labelWidth={84}
                      type="user"
                      label={t('執行者')}
                      value={subtask?.taker}
                    />
                    {!!subtask?.system_subclasses?.length && (
                      <WsFlex style={{ marginTop: 8 }} flexWrap="wrap">
                        {subtask.system_subclasses.map((item: any, subIndex: number) => (
                          <WsTag
                            key={`${item?.id || subIndex}`}
                            img={item?.icon}
                            backgroundColor={$color.white}
                            textColor={$color.primary2l}
                            style={{ marginRight: 8, marginBottom: 8 }}
                          >
                            {`#${item?.name || ''}`}
                          </WsTag>
                        ))}
                      </WsFlex>
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
        snapPoints={[148, 200]}
        onItemPress={$_onBottomSheetItemPress}
      />
    </>
  )
}

export default TaskTemplateShow
