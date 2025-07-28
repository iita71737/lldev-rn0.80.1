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
  WsCard,
  WsInfo,
  WsDes,
  WsTag
} from '@/components'
import { useTranslation } from 'react-i18next'
import gColor from '@/__reactnative_stone/global/color'
import moment from 'moment'

const LlAuditResultCard = props => {
  const { t, i18n } = useTranslation()
  const {
    auditResultTitle,
    auditors,
    auditees,
    num,
    date,
    iconColor,
    icon,
    iconBgc,
    onPress,
    style,
    item,
    testID
  } = props

  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
    >
      <WsFlex style={[styles.cardRight, style]}>
        <WsIconCircle
          name={icon}
          size={24}
          color={iconColor}
          backgroundColor={iconBgc}
        />
        <View style={styles.cardLeft}>
          <WsText size="h5" fontWeight="bold" testID={'標題'}>
            {auditResultTitle}
          </WsText>

          {item && item.system_subclasses && item.system_subclasses.length > 0 && (
            <WsFlex flexWrap="wrap">
              {item.system_subclasses.map(
                (subClass, subClassIndex) => {
                  return (
                    <View key={subClassIndex}>
                      {(subClassIndex == 0 || subClassIndex == 1) && (
                        <WsTag
                          style={{
                            marginRight: 8,
                            marginTop: 8
                          }}
                          img={subClass.icon}>
                          {t(subClass.name)}
                        </WsTag>
                      )}
                    </View>
                  )
                }
              )}
            </WsFlex>
          )}

          <WsFlex style={styles.mainSection}>
            <WsFlex>
              <WsDes size="12" style={styles.shortMargin}>
                {`${t('日期')}：`}
              </WsDes>
              <WsText size="12" style={styles.longMargin}>
                {date}
              </WsText>
            </WsFlex>

            <WsFlex
              style={{
                marginTop: 4
              }}>
              <WsDes size="12" style={styles.shortMargin}>
                {`${t('稽核者')}：`}
              </WsDes>
              <WsText size="12" style={styles.longMargin}>
                {auditors &&
                  auditors.map((auditor, index) => {
                    return (
                      <View key={auditor.name}>
                        <WsText size={12}>{index > 0 && auditors.length > 0 ? ', ' : ''}{auditor.name}</WsText>
                      </View>
                    )
                  })}
              </WsText>
            </WsFlex>

            <WsFlex
              style={{
                marginTop: 4
              }}>
              <WsDes size="12" style={styles.shortMargin}>
                {`${t('受稽者')}：`}
              </WsDes>
              <WsText size="12" style={styles.longMargin}>
                {auditees &&
                  auditees.map((auditee, index) => {
                    return (
                      <View key={auditee.name}>
                        {index > 0 && auditors.length > 0 ? ', ' : ''}
                        {auditee.name}
                      </View>
                    )
                  })}
              </WsText>
            </WsFlex>
          </WsFlex>
          <WsFlex style={styles.bottomSection}>
            <WsDot color={gColor.danger} style={styles.longMargin} />
            <WsText
              size="12"
              style={{
                marginRight: 8
              }}>
              Major
            </WsText>
            {num && num.major != undefined && (
              <WsText
                size="12"
                style={{
                  marginRight: 16
                }}>
                {num.major}
              </WsText>
            )
            }
            <WsDot color="rgb(255,213,0)" style={styles.longMargin} />
            <WsText
              size="12"
              style={{
                marginRight: 8
              }}>
              Minor
            </WsText>
            {num && num.minor != undefined && (
              <WsText
                size="12"
                style={{
                  marginRight: 16
                }}>
                {num.minor}
              </WsText>
            )}
            <WsDot color={gColor.primary} style={styles.longMargin} />
            <WsText
              size="12"
              style={{
                marginRight: 8
              }}>
              OFI
            </WsText>
            {num && num.ofi != undefined && (
              <WsText
                size="12"
                style={{
                  marginRight: 16
                }}>
                {num.ofi}
              </WsText>
            )}
          </WsFlex>
        </View>
      </WsFlex>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  cardRight: {
    alignItems: 'flex-start',
    backgroundColor: gColor.white,
    padding: 16
  },
  cardLeft: {
    flex: 1,
    paddingLeft: 16
  },
  mainSection: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: gColor.white4d,
    paddingTop: 8,
    paddingBottom: 8
  },
  bottomSection: {
    paddingTop: 8
  },
  longMargin: {
    marginRight: 8
  },
  shortMargin: {
    marginRight: 4
  }
})

export default LlAuditResultCard
