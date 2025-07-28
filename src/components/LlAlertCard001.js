import React from 'react'
import { View, Pressable, TouchableOpacity } from 'react-native'
import { WsPaddingContainer, WsIcon, WsText, WsDes, WsFlex, WsTag } from '@/components'
import S_Alert from '@/services/api/v1/alert'
import S_Wasa from '@/__reactnative_stone/services/wasa/index'
import $color from '@/__reactnative_stone/global/color'
import { useIsFocused } from '@react-navigation/native'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

const LlAlertCard001 = props => {
  const { t, i18n } = useTranslation()
  // Props
  const { style, alert, onPress, testID } = props

  // State
  const [alertFormat, setAlertFormat] = React.useState()

  // Function
  const $_getText = () => {
    const _alert = S_Alert.setAlertContent(alert)
    setAlertFormat(_alert)
  }

  React.useEffect(() => {
    $_getText()
  }, [])

  // Render
  return (
    <>
      {alertFormat && (
        <TouchableOpacity
          testID={testID}
          onPress={onPress}
        >
          <WsPaddingContainer
            style={[
              {
                backgroundColor: $color.white
              },
              style
            ]}>
            <WsFlex>
              <WsFlex alignItems="flex-start" style={{ flex: 1 }}>
                <WsIcon
                  name="ws-filled-alert"
                  color={alert.level == 2 ? $color.danger : $color.yellow}
                  size={24}
                />
                <View
                  style={{
                    flex: 1,
                    marginTop: -5,
                    marginHorizontal: 16
                  }}>
                  <WsText>{alertFormat.title}</WsText>
                  <WsDes
                    style={{
                      marginTop: 4
                    }}
                    size={12}>
                    {`${t('發布時間')} ${moment(alert.created_at).format('YYYY-MM-DD  HH:mm')}`}
                  </WsDes>

                  <WsFlex
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsDes size={12} style={{ marginRight: 4, }}>{t('警示狀態')}</WsDes>
                    <WsTag backgroundColor={alert.solved_at ? $color.gray1d : $color.white2d}>
                      {alert.solved_at ? (
                        <WsText size={12} color={$color.white}>{t('已排除')}</WsText>
                      ) : (
                        <WsText size={12} color={$color.gray}>{t('未排除')}</WsText>
                      )}
                    </WsTag>
                  </WsFlex>

                  {alert.solved_at && (
                    <WsDes
                      style={{
                        marginTop: 8
                      }}
                      size={12}>
                      {`${t('排除時間')} ${moment(alert.solved_at).format('YYYY-MM-DD  HH:mm')}`}
                    </WsDes>
                  )
                  }
                  <WsFlex
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsDes size={12} style={{ marginRight: 4, }}>{t('任務狀態')}</WsDes>
                    <WsTag backgroundColor={alert.task ? $color.yellow11l : $color.white2d}>
                      {alert.task && alert.task.id ? (
                        <WsText size={12} color={$color.black}>{t('進行中')}</WsText>
                      ) : (
                        <WsText size={12} color={$color.gray}>{t('未建立')}</WsText>
                      )}
                    </WsTag>
                  </WsFlex>
                </View>
              </WsFlex>
              <WsIcon
                style={{
                  width: 22
                }}
                size={22}
                name="md-chevron-right"
                color={$color.gray2d}
              />
            </WsFlex>
          </WsPaddingContainer>
        </TouchableOpacity>
      )}
    </>
  )
}

export default LlAlertCard001
