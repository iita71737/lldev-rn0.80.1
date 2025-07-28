import React from 'react'
import {
  Pressable,
  ScrollView,
  TouchableWithoutFeedback,
  StyleSheet,
  View,
  Text,
  TouchableOpacity
} from 'react-native'

import {
  WsText,
  WsFlex,
  WsPaddingContainer,
  WsBtn,
  WsIconCircle,
  WsDot,
  WsCard
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

const LlChangeResultCard002 = props => {
  const { t, i18n } = useTranslation()

  const { 
    onPress, 
    answer, 
    style
  } = props

  // State
  const [agreeNum, setAgreeNum] = React.useState('-')
  const [donAgreeNum, setDonAgreeNum] = React.useState('-')
  const [conditionAgreeNum, setConditionAgreeNum] = React.useState('-')

  // Function
  const $_getResultNumCount = () => {
    let _disagreeNum = 0
    let _agreeNum = 0
    let _conditional_agree_num = 0
    answer && answer.assignmentList && answer.assignmentList.forEach(change => {
      change.changeList.forEach(risk => {
        if (risk.score == 16) {
          _agreeNum++
        } else if (risk.score == 17) {
          _conditional_agree_num++
        } else if (risk.score == 18) {
          _disagreeNum++
        }
      })
    })
    setAgreeNum(_agreeNum)
    setDonAgreeNum(_disagreeNum)
    setConditionAgreeNum(_conditional_agree_num)
  }

  React.useEffect(() => {
    $_getResultNumCount()
  }, [])

  // Function
  const $_setIcon = () => {
    if (donAgreeNum > 0) {
      return 'ws-filled-cancel'
    } else if (conditionAgreeNum > 0) {
      return 'ws-filled-warning'
    } else if (agreeNum > 0) {
      return 'ws-filled-check-circle'
    } else {
      return 'ws-filled-help'
    }
  }
  const $_setIconColor = () => {
    if (donAgreeNum > 0) {
      return $color.danger
    } else if (conditionAgreeNum > 0) {
      return $color.yellow
    } else if (agreeNum > 0) {
      return $color.green
    } else {
      return $color.gray
    }
  }
  const $_setIconBgc = () => {
    if (donAgreeNum > 0) {
      return $color.danger11l
    } else if (conditionAgreeNum > 0) {
      return $color.yellow11l
    } else if (agreeNum > 0) {
      return $color.green11l
    } else {
      return $color.gray6l
    }
  }

  return (
    <TouchableOpacity onPress={onPress}>
      <WsFlex style={[styles.cardRight, style]}>
        <WsIconCircle
          name={$_setIcon()}
          size={24}
          color={$_setIconColor()}
          backgroundColor={$_setIconBgc()}
        />
        <View style={styles.cardLeft}>
          <WsText size="h5" fontWeight="bold">
            {answer.textLabel}
          </WsText>
          <WsFlex
            style={{
              borderBottomWidth: 1,
              borderBottomColor: $color.white4d,
              paddingTop: 8,
              paddingBottom: 8
            }}>
            <WsText size="12" style={styles.longMargin}>
              {answer.evaluateDate && answer.evaluateDate !== 'Invalid date' ? answer.evaluateDate : t('尚未評估')}
            </WsText>
            <WsText size="12" style={styles.shortMargin}>
              {t('評估人員')}
            </WsText>
            <WsText size="12" style={styles.longMargin}>
              {answer.evaluator && answer.evaluator.name ? answer.evaluator.name : null}
            </WsText>
          </WsFlex>

          <WsFlex flexWrap="wrap" style={{ paddingTop: 8 }}>
            <WsDot color={$color.green} style={styles.longMargin} />
            <WsText
              size="12"
              style={{
                marginRight: 8
              }}>
              {t('無條件同意')}
            </WsText>
            <WsText
              size="12"
              style={{
                marginRight: 16
              }}>
              {agreeNum != undefined ? agreeNum : null}
            </WsText>
          </WsFlex>

          <WsFlex>
            <WsDot color={$color.yellow} style={styles.longMargin} />
            <WsText
              size="12"
              style={{
                marginRight: 8
              }}>
              {t('有條件同意')}
            </WsText>
            <WsText
              size="12"
              style={{
                marginRight: 16
              }}>
              {conditionAgreeNum != undefined ? conditionAgreeNum : null}
            </WsText>
          </WsFlex>

          <WsFlex>
            <WsFlex>
              <WsDot color={$color.danger} style={styles.longMargin} />
              <WsText
                size="12"
                style={{
                  marginRight: 8
                }}>
                {t('不同意')}
              </WsText>
              <WsText
                size="12"
                style={{
                  marginRight: 16
                }}>
                {donAgreeNum != undefined ? donAgreeNum : null}
              </WsText>
            </WsFlex>

          </WsFlex>
        </View>
      </WsFlex>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  cardRight: {
    alignItems: 'flex-start',
    backgroundColor: $color.white,
    padding: 16
  },
  cardLeft: {
    flex: 1,
    paddingLeft: 16
  },
  longMargin: {
    marginRight: 8
  },
  shortMargin: {
    marginRight: 4
  }
})

export default LlChangeResultCard002
