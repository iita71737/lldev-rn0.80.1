import React, { useState, useEffect } from 'react'
import { View, Image, ScrollView } from 'react-native'
import {
  WsFastImage,
  WsText,
  WsFlex,
  WsPaddingContainer,
  WsInfo,
  WsIconBtn
} from '@/components'
import { useSelector } from 'react-redux'
import S_Sos from '@/services/api/v1/sos_request'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const SosSubmit = ({ navigation }) => {
  const { t, i18n } = useTranslation()
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <>
            <WsIconBtn
              name="ws-outline-arrow-left"
              color="white"
              size={24}
              onPress={() => {
                navigation.navigate({
                  name: 'Menu'
                })
              }}
            />
          </>
        )
      }
    })
  }

  React.useEffect(() => {
    $_setNavigationOption()
  }, [])

  return (
    <ScrollView>
      <WsPaddingContainer>
        <WsFlex justifyContent="center">
          <WsFastImage
            style={{
              height: '100%'
            }}
            source={require('@/assets/img/img-empty/White-thankyou.png')}
            widthLoad={130}
            heightLoad={130}
            fillWidth={false}
          />
        </WsFlex>
        <WsText letterSpacing={1}>
          {/* {t(
            '您的訊息已順利送出，本所將派員於30分鐘內以您所填寫的聯絡方式聯繫您，若沒有收到回覆可能有以下幾種原因：'
          )}
          {'\n'}
          {'\n'}
          1.
          {t('您的聯絡方式無人回應。我們將於第一次聯絡後的10分鐘內再次聯繫。')}
          2.原因內容原因內容原因內容原因內容原因內容原因內容原因內容原因內容原因內容。
          {'\n'}
          {'\n'}
          {t('您可以再次發送SOS訊息或改用以下聯絡方式聯繫我們，謝謝。')} */}
          {t('您的訊息已順利送出，本所將派員以您所填寫的聯絡方式聯繫您，或您可以改用以下聯絡方式聯繫我們，謝謝。')}
        </WsText>
        <WsInfo
          type="email"
          icon="ws-outline-email"
          value="陳小姐"
          text="zjchen@esgez.com"
          color={$color.primary}
        />
      </WsPaddingContainer>
    </ScrollView>
  )
}

export default SosSubmit
