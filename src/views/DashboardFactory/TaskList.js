import React from 'react'
import {
  ScrollView,
  SafeAreaView
} from 'react-native'
import {
  WsTabView,
  WsPaddingContainer,
  WsFlex,
  WsText,
  WsIcon,
  WsBtn,
  WsDes,
  LlTaskCard001,
  WsGradientButton,
  WsDialog,
  WsInfiniteScroll
} from '@/components'
import i18next from 'i18next'
import S_Task from '@/services/api/v1/task'
import $color from '@/__reactnative_stone/global/color'
import layouts from '@/__reactnative_stone/global/layout'
import { useTranslation } from 'react-i18next'
import config from '@/__config'
import { useNavigation } from '@react-navigation/native'

const DashboardTaskList = (props) => {
  const { t, i18n } = useTranslation()
  const { windowWidth, windowHeight } = layouts
  const navigation = useNavigation()

  // Params
  const { systemClass, type } = props

  // States
  const [popUpVisible, setPopUpVisible] = React.useState(false)
  const dialogButton = [
    {
      label: i18next.t('知道了'),
      onPress: () => {
        setPopUpVisible(false)
      }
    }
  ]
  const [params, setParams] = React.useState({
    system_classes: systemClass.id,
    order_way: 'asc',
    order_by: 'valid_end_date',
    done_at: 'null',
    checked_at: 'null',
    page: 1
  })

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

  // Option
  const $_setNavigationOption = () => {
    const titleStatusText = type == 1 ? t('新增') : t('累計')
    navigation.setOptions({
      title: `[${t(systemClass.name)}] ${t(`${titleStatusText}任務處理中`)}`
    })
  }

  React.useEffect(() => {
    $_setNavigationOption()
  }, [])

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1
        }}
      >
        <WsDialog
          dialogVisible={popUpVisible}
          setDialogVisible={setPopUpVisible}
          title={i18next.t('請使用網頁版查看詳細內容')}
          dialogButtonItems={dialogButton}
        />

        <WsInfiniteScroll
          serviceIndexKey={type == 1 ? 'currentExpiredIndex' : 'index'}
          service={S_Task}
          padding={0}
          params={type == 1 ? {} : params}
          renderItem={({ item, index }) => {
            return (
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
            )
          }}
        />
        <WsGradientButton
          testID={'前往列表'}
          isFullWidth={false}
          style={{
            backgroundColor: 'white',
            position: 'absolute',
            bottom: 16,
            margin: 16,
          }}
          borderRadius={24}
          onPress={() => {
            navigation.push('RoutesTask', {
              screen: 'TaskIndex'
            })
          }}>
          {t('前往列表')}
        </WsGradientButton>
      </SafeAreaView>
    </>
  )
}

export default DashboardTaskList
