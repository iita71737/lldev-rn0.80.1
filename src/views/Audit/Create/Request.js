import React, { useState, useEffect } from 'react'
import { Text, View, Image, ScrollView, Dimensions } from 'react-native'
import $color from '@/__reactnative_stone/global/color'
import {
  WsStateFormView,
  WsGradientButton,
  WsPopup,
  WsText
} from '@/components'
import S_AuditRequest from '@/services/api/v1/audit_request'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { Touchable } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'

const AuditRequest = ({ route, navigation }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // Params
  const { audit } = route.params
  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)

  // States
  const [popupActive, setPopupActive] = React.useState(false)
  const [isSubmitable, setIsSubmitable] = React.useState(false)
  const fields = {
    audit: {
      label: t('名稱'),
      rules: 'required'
    },
    auditors: {
      testID: '稽核者',
      type: 'belongstomany',
      label: t('稽核者'),
      nameKey: 'name',
      modelName: 'user',
      hasMeta: true,
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required'
    },
    auditees: {
      testID: '受稽者',
      type: 'belongstomany',
      label: t('受稽者'),
      nameKey: 'name',
      modelName: 'user',
      hasMeta: true,
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required'
    },
    auditee_notify: {
      testID: '通知受稽者',
      label: t('通知受稽者'),
      type: 'radio',
      items: [
        { label: t('是'), value: 1 },
        { label: t('否'), value: 0 }
      ],
      rules: 'required'
    },
    record_at: {
      testID: '稽核日期',
      type: 'date',
      label: t('稽核日期'),
      rules: 'required'
    }
  }
  const initValue = {
    audit: audit.name,
    auditee_notify: 0
  }

  // Services
  const $_putApi = async data => {
    await S_AuditRequest.create({
      parentId: audit.id,
      data: data
    })
  }

  // Functions
  const $_onSubmit = $event => {
    const _submitValue = {
      audit: audit.id,
      name: audit.name,
      auditees: $event.auditees.map(auditee => auditee.id),
      auditors: $event.auditors.map(auditor => auditor.id),
      record_at: $event.record_at,
      auditee_notify: $event.auditee_notify
    }
    $_putApi(_submitValue)
    setPopupActive(true)
  }

  return (
    <>
      <WsStateFormView
        isSubmitable={isSubmitable}
        setIsSubmitable={setIsSubmitable}
        navigation={navigation}
        fields={fields}
        initValue={initValue}
        onSubmit={$_onSubmit}
      />

      <WsPopup
        active={popupActive}
        onClose={() => {
          setPopupActive(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            padding: 16,
            backgroundColor: $color.white,
            borderRadius: 10,
          }}>
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <WsText size={24}>
              {t('已成功建立')}
            </WsText>
            <WsText size={14} style={{ marginVertical: 16 }}>
              {t('您已成功送出一個預定稽核行程，被指派的稽核者可於個人看板的「稽核作業」進行稽核。')}
            </WsText>
          </View>
          <WsGradientButton
            testID={'我知道了'}
            style={{
              marginTop: 32,
            }}
            onPress={() => {
              setPopupActive(false)
              navigation.navigate('AuditIndex')
            }}
          >
            {t('我知道了')}
          </WsGradientButton>
        </View>
      </WsPopup>
    </>
  )
}

export default AuditRequest
