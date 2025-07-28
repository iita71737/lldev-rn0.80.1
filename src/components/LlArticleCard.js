import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  Pressable,
  TouchableOpacity,
  TouchableHighlight,
  Dimensions
} from 'react-native'
import moment from 'moment'
import {
  WsCard,
  WsText,
  WsIcon,
  WsIconCircle,
  WsFlex,
  WsStateFormModal,
  WsIconBtn
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlArticleCard = (props) => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    related_acts,
    deleteOnPress
  } = props

  return (
    <>
      {related_acts &&
        related_acts.length > 0 && (
          related_acts.map((_item, index) => {
            return (
              <View
                style={{
                  borderRadius: 20,
                  borderWidth: 1,
                  marginBottom: 8,
                  padding: 8,
                  borderColor: $color.gray
                }}
              >
                <WsFlex
                  justifyContent="space-between"
                >
                  <WsText style={{ marginLeft: 16 }} color={$color.gray}>{`index:${index}-`}{_item.content}</WsText>
                  <WsIconBtn
                    name={'scc-liff-close-circle'}
                    color={$color.gray}
                    onPress={() => {
                      deleteOnPress(index)
                    }}
                    padding={0}
                    size={24}
                  />
                </WsFlex>
              </View>
            )
          })
        )}
    </>
  )
}

export default LlArticleCard