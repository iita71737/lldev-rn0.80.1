import React from 'react'
import { Pressable, ScrollView } from 'react-native'
import { WsTabView, WsIconBtn } from '@/components'
// import AuditAssignment from '@/sections/Audit/Assignment/AuditorAssignment'
// import AuditAssignmentAuditee from '@/sections/Audit/Assignment/AuditeeAssignmentAuditee'
// import AuditAuditorResult from '@/sections/Audit/Assignment/AuditAuditorResult'
// import AuditAuditeeResult from '@/sections/Audit/Assignment/AuditAuditeeResult'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import TodayEnterExitAssignment from '@/sections/ContractorEnter/ContractorEnterRecord/TodayEnterExitAssignment'
import ExitCheckRecord from '@/sections/ContractorEnter/ContractorEnterRecord/ExitCheckRecord'
import ExpectedEnter from '@/sections/ContractorEnter/ContractorEnterRecord/ExpectedEnter'

const AuditAssignmentIndex = ({ route }) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // state
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems] = React.useState([
    {
      value: 'todayEnterExitAssignment',
      label: t('本日進場收工作業'),
      view: TodayEnterExitAssignment,
      props: {
        navigation: navigation,
      }
    },
    {
      value: 'ExitCheckRecord',
      label: t('收工檢查記錄'),
      view: ExitCheckRecord,
      props: {
        navigation: navigation
      }
    },
    {
      value: 'expectedEnter',
      label: t('預定進場'),
      view: ExpectedEnter,
      props: {
        navigation: navigation
      }
    }
  ])

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <WsIconBtn
            name="ws-outline-arrow-left"
            color="white"
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              if (route.params.from) {
                const { from } = route.params
                if (!from.modelId) {
                  navigation.navigate({
                    name: from.routeName
                  })
                }
                if (from.modelId) {
                  navigation.navigate({
                    name: from.name,
                    key: from.routeKey,
                    params: {
                      from: {
                        routeName: route.name,
                        modelId: id
                      },
                      id: id
                    }
                  })
                }
              } else {
                navigation.goBack()
              }
            }}
          />
        )
      }
    })
  }

  React.useEffect(() => {
    if (route && route.params && route.params.from) {
      $_setNavigationOption()
    }
  }, [route])

  return (
    <>
      <WsTabView
        isAutoWidth={true}
        scrollEnabled={true}
        items={tabItems}
        index={tabIndex}
        setIndex={settabIndex}
      />
    </>
  )
}

export default AuditAssignmentIndex
