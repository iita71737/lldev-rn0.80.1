import React from 'react'
import { ScrollView, View, Dimensions, SafeAreaView } from 'react-native'
import layouts from '@/__reactnative_stone/global/layout'
import AsyncStorage from '@react-native-community/async-storage'
import {
  WsIconBtn,
  WsTag,
  WsFlex,
  WsPaddingContainer,
  WsText,
  WsInfoUser,
  WsInfo,
  WsBottomSheet,
  WsBtn,
  WsDialogDelete,
  LlNavButton002,
  WsGradientButton,
  WsErrorMessage,
  WsSkeleton,
  WsCard,
  WsDes,
  WsIcon,
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useFocusEffect } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useNavigation } from '@react-navigation/native'
import S_Alert from '@/services/api/v1/alert'

const LlRelatedAlertCard001 = (props) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const {
    alert
  } = props

  const [_alert, setAlert] = React.useState()

  const $_fetchAlert = () => {
    // const res = await S_Alert.show(alert.id)
    const _alert = S_Alert.setAlertContent(alert)
    setAlert(_alert)
  }

  React.useEffect(() => {
    $_fetchAlert()
  }, [alert?.id])

  return (
    <WsPaddingContainer
      padding={0}
      style={{
        paddingTop: 16,
        paddingHorizontal: 16,
      }}
    >
      <WsText
        fontWeight={500}
        style={{
        }}
      >{t('相關警示')}
      </WsText>
      <WsCard
        padding={0}
        style={{
          marginTop: 8,
          paddingVertical: 8,
          paddingHorizontal: 16,
          backgroundColor: $color.white
        }}>
        <TouchableOpacity
          onPress={() => {
            navigation.push('RoutesAlert', {
              screen: 'AlertShow',
              params: {
                id: alert.id,
              },
            })
          }}
        >
          <WsIcon
            style={{
              alignSelf: 'flex-start'
            }}
            name={'ws-filled-alert'}
            color={$color.danger}
            size={24}
          ></WsIcon>

          <WsText size={14} style={{ marginTop: 8 }}>{`${_alert?.title ? _alert?.title : alert.name}`}</WsText>

          {alert.created_at && (
            <WsDes
              size={12}
              style={{
                marginTop: 8
              }}
            >
              {t('警示發布')}{' '}
              {moment(alert.created_at ? alert.created_at : null).format('YYYY-MM-DD')}
            </WsDes>
          )}
        </TouchableOpacity>
      </WsCard>
    </WsPaddingContainer>
  )
}

export default LlRelatedAlertCard001