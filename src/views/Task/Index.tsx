import React from 'react'
import {
  WsText,
  WsFlex,
  WsPage002,
  WsIconBtn,
  WsModal,
} from '@/components'
import TaskListIndex from '@/views/Task/Tasks/Index'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-community/async-storage'
import $color from '@/__reactnative_stone/global/color'

interface ToggleTab {
  value: string;
  label: string;
  view: React.FC<any>;
  props: any;
}

const TaskIndex: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()

  // State
  const [tabIndex, setTabIndex] = React.useState(0)
  const [templateDraftModalVisible, setTemplateDraftModalVisible] = React.useState(false)
  const [toggleTabs] = React.useState<ToggleTab[]>([
    {
      value: 'taskList',
      label: t('任務'),
      view: TaskListIndex,
      props: {
        showRightBtn: true,
        showLeftBtn: true,
        leftActionMode: 'back'
      }
    },
    {
      value: 'taskTemplateDraft',
      label: t('任務公版'),
      view: () => (
        <WsFlex
          flex={1}
          justifyContent="center"
          alignItems="center"
        >
          <WsText>{t('尚無資料')}</WsText>
        </WsFlex>
      ),
      props: {
      }
    },
    {
      value: 'taskCommonTemplate',
      label: t('常用公版'),
      view: () => (
        <WsFlex
          flex={1}
          justifyContent="center"
          alignItems="center"
        >
          <WsText>{t('尚無資料')}</WsText>
        </WsFlex>
      ),
      props: {
      }
    },
  ])

  React.useLayoutEffect(() => {
    const isTaskListTab = tabIndex === 0
    const isTaskTemplateDraftTab = tabIndex === 1
    navigation.setOptions({
      headerRight: () => {
        if (isTaskListTab) {
          return (
            <WsIconBtn
              name="md-add"
              color={$color.white}
              size={24}
              style={{
                marginRight: 4
              }}
              onPress={async () => {
                await AsyncStorage.removeItem('TaskCreate')
                navigation.push('RoutesTask', {
                  screen: 'TaskCreate'
                })
              }}
            />
          )
        }
        if (isTaskTemplateDraftTab) {
          return (
            <WsIconBtn
              name="md-add"
              color={$color.white}
              size={24}
              style={{
                marginRight: 4
              }}
              onPress={() => {
                setTemplateDraftModalVisible(true)
              }}
            />
          )
        }
        return null
      }
    })
  }, [tabIndex, navigation, t])

  return (
    <>
      <WsPage002
        tabItems={toggleTabs}
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
      />
      <WsModal
        animationType={'none'}
        visible={templateDraftModalVisible}
        onBackButtonPress={() => {
          setTemplateDraftModalVisible(false)
        }}
        headerLeftOnPress={() => {
          setTemplateDraftModalVisible(false)
        }}
        title={t('新增任務公版')}
      >
        <WsFlex
          flex={1}
          justifyContent="center"
          alignItems="center"
        >
          <WsText>{t('尚無可用公版流程')}</WsText>
        </WsFlex>
      </WsModal>
    </>
  )
}

export default TaskIndex
