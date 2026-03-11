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
  WsPopup,
  WsText,
  WsFlex,
  WsStateCheckBox002,
  WsGradientButton,
} from '@/components'
import { useTranslation } from 'react-i18next'
import S_TaskFactoryTemplate from '@/services/api/v1/task_factory_template'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-community/async-storage'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'

const TaskTemplateColloction: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
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
  const currentUser = useSelector(state => state.data.currentUser)

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
      <WsPopup
        active={popupActive}
        onClose={() => {
          setPopupActive(false)
        }}
      >
        <View
          style={{
            width: 320,
            backgroundColor: $color.white,
            borderRadius: 10,
            padding: 16
          }}
        >
          <View style={{ marginTop: 16 }}>
            <WsText>{t('選擇是否帶入待辦執行者')}</WsText>
            <View style={{ marginTop: 8 }}>
              <WsStateCheckBox002
                value={includeSubTaskTaker}
                disabled={!templateHasSubTaskTaker}
                onChange={(value: boolean) => {
                  includeSubTaskTakerRef.current = value
                  setIncludeSubTaskTaker(value)
                }}
                checkboxText={
                  templateHasSubTaskTaker
                    ? t('帶入公版待辦執行者')
                    : t('公版無待辦執行者')
                }
              />
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <WsText>{t('選擇是否帶入任務負責人')}</WsText>
            <View style={{ marginTop: 8 }}>
              <WsStateCheckBox002
                value={includeTaskTaker}
                disabled={!templateHasTaker}
                onChange={(value: boolean) => {
                  includeTaskTakerRef.current = value
                  setIncludeTaskTaker(value)
                }}
                checkboxText={
                  templateHasTaker
                    ? t('帶入公版任務負責人')
                    : t('公版無負責人，將帶入目前使用者')
                }
              />
            </View>
          </View>

          <WsFlex
            justifyContent="flex-end"
            style={{
              marginTop: 24
            }}
          >
            <TouchableOpacity
              style={{
                width: 110,
                height: 50,
                borderColor: $color.gray,
                borderWidth: 1,
                borderRadius: 30,
                marginHorizontal: 8,
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onPress={() => {
                setPopupActive(false)
              }}
            >
              <WsText color={$color.gray}>{t('取消')}</WsText>
            </TouchableOpacity>
            <WsGradientButton
              style={{
                width: 110,
                height: 50,
                marginHorizontal: 8
              }}
              onPress={async () => {
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
            >
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>
      <WsPageIndex
        modelName={'task_factory_template'}
        serviceIndexKey={'authCollectIndex'}
        params={__params}
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
