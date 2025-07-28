import React, { useState, useEffect } from 'react'
import { Text, View, ScrollView, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback, Alert } from 'react-native'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import {
  WsPaddingContainer,
  WsText,
  WsInfo,
  WsFlex,
  WsIcon,
  WsAvatar,
  WsSkeleton,
  WsTag,
  WsIconBtn,
  LlBtn002,
  LlBtn001,
  WsState
} from '@/components'
import S_ContractorEnterRecord from '@/services/api/v1/contractor_enter_record'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { useIsFocused } from '@react-navigation/native'
import S_ExitChecklist from '@/services/api/v1/exit_checklist'

const LlExitChecklistEnterStatusCardTag = (props) => {
  const { t, i18n } = useTranslation()

  const {
    contractorEnter
  } = props

  return (
    <WsFlex
      style={{
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
      }}>
      <WsText size={14} fontWeight={'600'} style={{ width: 128 }}>
        {t('進場狀態')}
      </WsText>
      {contractorEnter &&
        contractorEnter.enter_status ? (
        <WsFlex style={{ marginRight: 4 }}>
          <WsTag
            backgroundColor={S_ExitChecklist.getEnterStatusBgc(contractorEnter.enter_status)}
            textColor={S_ExitChecklist.getEnterStatusTextColor(contractorEnter.enter_status)}>
            {t(S_ExitChecklist.getEnterStatusText(contractorEnter.enter_status))}
          </WsTag>
        </WsFlex>
      ) : (
        <WsFlex style={{ marginRight: 4 }}>
          <WsTag backgroundColor={$color.white2d} textColor={$color.black}>
            {t('無進場')}
          </WsTag>
        </WsFlex>
      )}
    </WsFlex>
  )
}

export default LlExitChecklistEnterStatusCardTag