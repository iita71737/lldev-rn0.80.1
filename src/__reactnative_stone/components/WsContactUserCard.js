import React from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TouchableHighlight,
  Dimensions
} from 'react-native'
import {
  WsCard,
  WsText,
  WsIcon,
  WsIconCircle,
  WsFlex,
  WsStateFormModal
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const WsContactUserCard = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // props
  const { item, name, email, tel, mobile, deleteOnPress, onPress } = props

  return (
    <View>
      <TouchableOpacity onPress={onPress}>
        <WsCard
          padding={16}
          style={{
            marginVertical: 4,
            backgroundColor: $color.primary11l
          }}>
          <WsFlex justifyContent={'space-between'}>
            <View
              style={{
                maxWidth: width * 0.75
              }}
            >
              <WsText color={$color.black}>
                {t('窗口：')}
                {name ? name : ''}
              </WsText>
              <WsText color={$color.black}>
                {t('信箱：')}
                {email ? email : ''}
              </WsText>
              <WsText color={$color.black}>
                {t('電話：')}
                {tel ? tel : ''}
              </WsText>
              <WsText color={$color.black}>
                {t('手機：')}
                {mobile ? mobile : ''}
              </WsText>
            </View>
            <View>
              <TouchableOpacity
                activeOpacity={0.6}
                underlayColor="transparent"
                onPress={deleteOnPress}>
                <WsIconCircle
                  padding={12}
                  name="ws-outline-delete"
                  size={24}
                  color={$color.white}
                  backgroundColor={$color.danger}
                />
              </TouchableOpacity>
            </View>
          </WsFlex>
        </WsCard>
      </TouchableOpacity>
    </View>
  )
}

export default WsContactUserCard
