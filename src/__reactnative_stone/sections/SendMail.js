import React from 'react'
import {
  View,
  ImageBackground,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Image
} from 'react-native'
import {
  WsText,
  WsFlex,
  WsBtn,
  WsState,
  WsErrorMessage,
  WsFastImage,
  WsStateFormView,
  WsPageScrollView,
  WsStateForm
} from '@/components'
import gLayout from '@/__reactnative_stone/global/layout'
import $color from '@/__reactnative_stone/global/color'
import Validator from '@/__reactnative_stone/services/validator'
import $config from '@/__config'
import i18next from 'i18next'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

const SendMail = props => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Props
  const {
    onSubmit,
    value,
    onChange,
    fields,
    topErrorMessage,
    source = $config.component.SendMail.source,
    content = $config.component.SendMail.content,
    bannerText = $config.component.SendMail.bannerText,
    title = $config.component.SendMail.title,
    bannerLogo = $config.component.SendMail.logo
  } = props

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          flex: 1,
          backgroundColor: 'white'
        }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              // flex: 1,
              // borderWidth:1,
            }}>
            <ImageBackground
              style={{
                position: 'absolute',
                flex: 1,
                alignItems: 'center',
                width: '100%',
                height: gLayout.windowWidth * 0.442,
                resizeMode: 'contain'
              }}
              source={source}>
              <View style={styles.heroOverlay} />
            </ImageBackground>
            <WsFlex
              justifyContent="center"
              style={[
                {
                  paddingTop: gLayout.windowWidth * 0.221 - 15
                }
              ]}>
              {bannerLogo && (
                <Image
                  source={bannerLogo}
                  style={{
                    width: 132,
                    height: 34
                  }}
                />
              )}
              {!bannerLogo && (
                <WsText size="18" color="white" fontWeight="bold">
                  {t(bannerText)}
                </WsText>
              )}
            </WsFlex>
            <View
              style={{
                marginTop: gLayout.windowWidth * 0.221 - 25,
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                paddingVertical: 24,
                paddingHorizontal: 16,
                // borderWidth: 1,
              }}>
              <WsText size="18" fontWeight="bold" textAlign="center">
                {t(title)}
              </WsText>
              <WsText
                style={{
                  marginVertical: 32
                }}
                size="18">
                {t(content)}
              </WsText>

              <WsState
                type="email"
                rules="required"
                label={t('Email')}
                placeholder={t('輸入')}
                autoFocus={true}
                value={value}
                onChange={onChange}
              >
              </WsState>

              <WsBtn
                style={{
                  marginTop: 30
                }}
                onPress={() => {
                  onSubmit(onSubmit)
                }}
                borderRadius={30}>
                {i18next.t('送出')}
              </WsBtn>
              <WsBtn
                style={{
                  marginTop: 32,
                  borderWidth: 0.5,
                  borderColor: $color.primary
                }}
                textColor={$color.primary}
                color={$color.white}
                onPress={() => {
                  navigation.goBack()
                }}
                borderRadius={30}>
                {i18next.t('回上一頁')}
              </WsBtn>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  )
}

const styles = StyleSheet.create({
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: gLayout.windowWidth,
    height: gLayout.windowWidth * 0.442,
    backgroundColor: $color.primary,
    opacity: 0.5,
    zIndex: 0
  }
})

export default SendMail
