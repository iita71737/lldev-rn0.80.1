import React from 'react'
import {
  Pressable,
  ScrollView,
  Text,
  View,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native'
import {
  WsState,
  WsStepsTab,
  WsText,
  WsSkeleton,
  WsTabView,
  LlRiskHeaderCalc,
  LlEffectWithAuditRisk,
  WsPaddingContainer,
  WsFlex,
  WsInfo,
  WsModal,
  WsIconBtn,
  WsBtn,
  WsIcon,
  WsModalFooter
} from '@/components'
import S_Audit from '@/services/api/v1/audit'
import S_AuditRecord from '@/services/api/v1/audit_record'
import S_AuditRequest from '@/services/api/v1/audit_request'
import S_AuditRecordAns from '@/services/api/v1/audit_record_answer'
import S_AuditQuestion from '@/services/api/v1/audit_question'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import moment from 'moment'
import store from '@/store'
import { setCurrentAuditRecordDraft } from '@/store/data'

const AuditAssignmentOverview = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const { width, height } = Dimensions.get('window')

  // Params
  const {
  } = props

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const factory = useSelector(state => state.data.currentFactory)

  // State
  const [loading, setLoading] = React.useState(false)


  return (
    <>
      <StatusBar barStyle={'dark-content'} />
      {loading ? (
        <>
          <SafeAreaView>
            <WsSkeleton />
            <WsSkeleton />
            <WsSkeleton />
          </SafeAreaView>
        </>
      ) : (
        <ScrollView
          style={{
            flex: 1,
            // borderWidth: 2
          }}
        >
          <WsPaddingContainer
            style={{
              marginVertical: 16
            }}>
          </WsPaddingContainer>
        </ScrollView>
      )
      }
    </>
  )
}

export default AuditAssignmentOverview
