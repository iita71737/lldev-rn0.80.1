import React, { useState, useEffect } from 'react'
import {
  StatusBar,
  Text,
  Alert,
  SafeAreaView,
  View,
  Modal,
  Platform
} from 'react-native'
import {
  WsNavButton
} from '@/components'
import { useSelector } from 'react-redux'
import { WsBtn, WsStateFormView } from '@/components'
import S_Sos from '@/services/api/v1/sos_request'
import M_Sos from '@/models/sos'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'

const SOS = ({ navigation }) => {
  const fields = M_Sos.getFields()

  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentViewMode = useSelector(state => state.data.currentViewMode)
  const currentOrganization = useSelector(state => state.data.currentOrganization)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // Function
  const $_onSubmit = async $event => {
    const _params = {
      ...$event,
      user_payload: {
        id: currentUser && currentUser.id ? currentUser.id : null,
        name: currentUser.name
      },
      factory: currentViewMode == 'factory' && currentFactory ? currentFactory.id : currentViewMode == 'organization' && currentOrganization ? currentOrganization.id : null
    }
    try {
      const res = await S_Sos.create({ params: _params })
      navigation.navigate('SOSSubmit')
      Alert.alert('送出成功')
    } catch (err) {
      console.warn(err)
      Alert.alert('送出失敗')
    }
  }

  const $_leftBtnOnPress = () => {
    navigation.navigate('Menu')
  }

  // Render
  return (
    <WsStateFormView
      onSubmit={$_onSubmit}
      leftBtnOnPress={$_leftBtnOnPress}
      navigation={navigation}
      fields={fields}
    />
  )
}
export default SOS
