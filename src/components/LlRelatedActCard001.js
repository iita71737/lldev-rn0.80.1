import React from 'react'
import { View, Pressable, TouchableOpacity } from 'react-native'
import {
  WsCard,
  WsText,
  WsFlex,
  WsIcon,
  WsNumberCircle,
  WsDes
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import S_ActVersion from '@/services/api/v1/act_version'

const LlRelatedActCard001 = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    item,
    onPress,
    style,
  } = props


  // STATES
  const [relativeAct, setRelativeAct] = React.useState()

  // 取得相關法規
  const $_fetchRelativeAct = async () => {
    try {
      const _act = await S_ActVersion.show({ modelId: item.id })
      setRelativeAct(_act)
    } catch (e) {
      console.log(e.message, 'error')
    }
  }

  React.useEffect(() => {
    if (item) {
      $_fetchRelativeAct()
    }
  }, [item])

  return (
    <>
      {item && (
        <View
          style={{
            marginTop: 16
          }}
        >
          <WsText
            fontWeight={500}
            style={{
              paddingHorizontal: 16,
            }}
          >{t('相關法規')}
          </WsText>

          <TouchableOpacity
            onPress={onPress}
            style={{
              marginTop: 8
            }}
          >
            <WsCard
              padding={0}
              style={[
                {
                  padding: 16,
                  marginHorizontal: 16
                },
                style
              ]}>
              <WsFlex>

                <View
                  style={{
                    flex: 1
                  }}
                >
                  <WsFlex
                    style={{
                    }}
                  >
                    <WsIcon
                      name="ll-nav-assignment-filled"
                      size={24}
                      style={{
                        marginRight: 4
                      }}
                      color={$color.primary}
                    />
                  </WsFlex>

                  <WsText
                    style={{
                      marginTop: 8
                    }}
                  >{item.name}
                  </WsText>

                  <WsFlex
                    style={{
                      marginTop: 8
                    }}
                    justifyContent="space-between"
                  >
                    {relativeAct &&
                      relativeAct.announce_at && (
                        <WsFlex>
                          <WsDes
                            size={12}
                            color={$color.white9d}
                          >
                            {i18next.t('法規發布')} {moment(relativeAct.announce_at).format('YYYY-MM-DD')}
                          </WsDes>
                        </WsFlex>
                      )}
                  </WsFlex>
                </View>
              </WsFlex>
            </WsCard>
          </TouchableOpacity>
        </View>
      )}
    </>
  )
}

export default LlRelatedActCard001
