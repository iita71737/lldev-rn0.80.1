import React from 'react'
import {
  Pressable,
  ScrollView,
  View,
  TextInput,
  StatusBar,
  Alert,
  Dimensions
} from 'react-native'
import {
  WsTabView,
  WsPaddingContainer,
  WsText,
  WsFlex,
  WsInfoUser,
  WsModal,
  LlRiskHeaderCalc,
  LlEffectWithAuditRisk,
  LlEffectWithCheckList,
  LlEffectWithCheckListCalc,
  WsState,
  WsModalFooter,
  WsIconBtn,
  WsBtn
} from '@/components'
import { useTranslation } from 'react-i18next'
import S_Checklist from '@/services/api/v1/checklist'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import S_CheckListVersion from '@/services/api/v1/checklist_version'
import S_UserCheckList from '@/services/api/v1/user_checklist'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import moment from 'moment'
import store from '@/store'
import { setCurrentChecklistRecordDraft, setCurrentCheckListQuestions } from '@/store/data'

const CheckListAssignmentOverview = (props) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  const {
    answersRiskHeader,
    passRate,
  } = props
  
  const stableAnswersRiskHeader = React.useMemo(
    () => (Array.isArray(answersRiskHeader) ? answersRiskHeader : []),
    [answersRiskHeader]
  )
  const stableRecord = React.useMemo(
    () => ({ pass_rate: passRate }),
    [passRate]
  )

  // Functions
  const $_filterChecklistChecker = checkers => {
    const checker = checkers.find(checker => checker.id === currentUser.id)
    return checker
  }

  return (
    <>
      <ScrollView>
        <WsPaddingContainer
          style={{
            backgroundColor: $color.white,
            marginVertical: 16
          }}>
          <LlRiskHeaderCalc
            answers={stableAnswersRiskHeader}
            record={stableRecord}
          />
          <LlEffectWithCheckListCalc
            answers={stableAnswersRiskHeader}
          />
        </WsPaddingContainer>
      </ScrollView>
    </>
  )
}

export default CheckListAssignmentOverview
