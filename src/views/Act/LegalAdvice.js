import React, { useState } from 'react'
import { Platform, Alert, View } from 'react-native'
import {
  WsStateFormView,
  WsDialog,
  WsText,
  WsPaddingContainer,
  WsFlex,
  WsIcon,
  WsInfo
} from '@/components'
import { useSelector } from 'react-redux'
import i18next from 'i18next'
import S_LegalInquiry from '@/services/api/v1/legal_inquiry'
import $color from '@/__reactnative_stone/global/color'

const LegalAdvice = ({ navigation }) => {
  // Redux
  const factoryId = useSelector(state => state.data.currentFactory.id)
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // States
  const [dialogVisible, setDialogVisible] = React.useState(false)
  const [initValue, setInitValue] = React.useState({
    contact_person: currentUser.name,
    category: '1',
    contact_way: 'email',
    email: currentUser.email,
    tel: '',
    remark:
      '',
    object: ''
  })

  // Fields
  const fields = {
    contact_person: {
      label: i18next.t('聯絡人姓名'),
      rules: 'required'
    },
    contact_way: {
      type: 'picker',
      label: i18next.t('聯絡方式'),
      rules: 'required',
      items: [
        { label: 'Email', value: 'email' },
        { label: i18next.t('手機'), value: 'tel' }
      ]
    },
    tel: {
      type: 'tel',
      label: i18next.t('手機號碼'),
      placeholder: i18next.t('輸入'),
      displayCheck(fieldsValue) {
        if (fieldsValue.contact_way == 'tel') {
          return true
        } else {
          return false
        }
      },
      // rules: 'required'
    },
    email: {
      type: 'email',
      label: 'Email',
      placeholder: i18next.t('輸入'),
      displayCheck(fieldsValue) {
        if (fieldsValue.contact_way == 'email') {
          return true
        } else {
          return false
        }
      }
    },
    object: {
      label: i18next.t('主旨'),
      placeholder: i18next.t('輸入'),
      rules: 'required'
    },
    remark: {
      label: i18next.t('簡述'),
      multiline: 'true',
      stateStyle: {
        height: 100
      },
      placeholder: i18next.t('輸入'),
      rules: 'required'
    },
    attaches: {
      type: 'filesAndImages',
      label: i18next.t('上傳'),
      uploadUrl: `legal_inquiry/attach`,
      uploadSuffix: `factory=${factoryId}`
    }
  }

  // Function
  const $_onSubmit = async $event => {
    try {
      const _data = S_LegalInquiry.formattedParams($event, currentUser)
      const res = await S_LegalInquiry.create({ params: _data })
      Alert.alert(t('您的訊息已順利送出，本所將派員以您所填寫的聯絡方式聯繫您，或您可以改用以下聯絡方式聯繫我們，謝謝。'))
    } catch (err) {
      Alert.alert(t('法律諮詢送出失敗'))
    }
    setDialogVisible(true)
    navigation.navigate('ActIndex')
  }

  return (
    <>
      <WsStateFormView
        headerRightBtnText={i18next.t('送出')}
        fields={fields}
        initValue={initValue}
        onSubmit={$_onSubmit}
      />
      <WsDialog
        dialogVisible={dialogVisible}
        setDialogVisible={() => {
          setDialogVisible(false)
        }}
        title={i18next.t('一般法律諮詢')}>
        <WsPaddingContainer>
          <WsFlex>
            <WsText>
              {i18next.t(
                '您的訊息已順利送出，本所將派員以您所填寫的聯絡方式聯繫您，或您可以改用以下聯絡方式聯繫我們，謝謝。'
              )}
            </WsText>
          </WsFlex>
          <View
            style={{
              flexDirection: 'column'
            }}>
            <WsFlex
              style={{
                marginTop: 16
              }}>
              <WsText>{i18next.t('蕭偉松律師')}</WsText>
            </WsFlex>
            <WsFlex>
              <WsIcon name="ws-outline-email" size={24} />
              <WsInfo
                style={{
                  alignItems: 'center',
                  marginBottom: 16
                }}
                type="email"
                value={'wshsiao@leeandli.com'}
                color={$color.primary}
              />
            </WsFlex>
            <WsFlex
              style={{
                marginTop: 16
              }}>
              <WsText>{i18next.t('陳毓芬律師')}</WsText>
            </WsFlex>
            <WsFlex>
              <WsIcon name="ws-outline-email" size={24} />
              <WsInfo
                style={{
                  alignItems: 'center',
                  marginBottom: 16
                }}
                type="email"
                value={'sophiechen@leeandli.com'}
                color={$color.primary}
              />
            </WsFlex>
            <WsFlex
              style={{
                marginTop: 16
              }}>
              <WsText>{i18next.t('張敦威律師')}</WsText>
            </WsFlex>
            <WsFlex>
              <WsIcon name="ws-outline-email" size={24} />
              <WsInfo
                style={{
                  alignItems: 'center',
                  marginBottom: 16
                }}
                type="email"
                value={'tunweichang@leeandli.com'}
                color={$color.primary}
              />
            </WsFlex>
          </View>
        </WsPaddingContainer>
      </WsDialog>
    </>
  )
}

export default LegalAdvice
