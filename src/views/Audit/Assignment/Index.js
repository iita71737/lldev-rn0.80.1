import React from 'react'
import { Pressable, ScrollView } from 'react-native'
import { WsTabView, WsIconBtn } from '@/components'
import AuditAssignment from '@/sections/Audit/Assignment/AuditorAssignment'
import AuditAssignmentAuditee from '@/sections/Audit/Assignment/AuditeeAssignmentAuditee'
import AuditAuditorResult from '@/sections/Audit/Assignment/AuditAuditorResult'
import AuditAuditeeResult from '@/sections/Audit/Assignment/AuditAuditeeResult'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

const AuditAssignmentIndex = ({ route }) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const currentUser = useSelector(state => state.data.currentUser)

  // state
  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems] = React.useState([
    {
      value: 'AuditRequest',
      label: t('預定稽核行程'),
      view: AuditAssignment,
      props: {
        navigation: navigation,
        currentUser: currentUser
      },
    },
    {
      value: 'AuditAuditee',
      label: t('預定受稽行程'),
      view: AuditAssignmentAuditee,
      props: {
        navigation: navigation
      },
    },
    {
      value: 'AuditAuditorResult',
      label: t('稽核結果'),
      view: AuditAuditorResult,
      props: {
        navigation: navigation
      },
    },
    {
      value: 'AuditAuditeeResult',
      label: t('受稽結果'),
      view: AuditAuditeeResult,
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
                  const isNavigationSuccessful = navigation.navigate({
                    name: from.routeName
                  })
                  if (!isNavigationSuccessful) {
                    navigation.goBack()
                  }
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
                  const isNavigationSuccessful = navigation.navigate({
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
                  if (!isNavigationSuccessful) {
                    navigation.goBack()
                  }
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
        // isAutoWidth={true}
        scrollEnabled={true}
        items={tabItems}
        index={tabIndex}
        setIndex={settabIndex}
      />
    </>
  )
}

export default AuditAssignmentIndex
