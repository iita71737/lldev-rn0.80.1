import React from 'react'
import { Pressable, View, TouchableOpacity } from 'react-native'
import {
  WsCard,
  WsText,
  WsFlex,
  WsTag,
  WsGrid,
  WsSpec,
  WsBtn,
  WsInfo
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import LlBtn001 from '@/components/LlBtn001'
import { useTranslation } from 'react-i18next'

const LlAuditListCard003 = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    name,
    style,
    onPress,
    system_subclasses = [],
    auditors,
    auditees,
    recordAt,
    bottomBtnText,
    reviewRemark,
    testID
  } = props

  // Function
  const $_getTagsBySystemSubclasses = system_subclasses => {
    const _tags = []
    system_subclasses.forEach(system_subclass => {
      _tags.push({
        icon: system_subclass.icon,
        text: system_subclass.name
      })
    })
    return _tags
  }

  // Render
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
    >
      <WsCard
        style={[
          {
            alignItems: 'flex-start'
          },
          style
        ]}>
        <WsText>{name}</WsText>

        <WsSpec
          style={{
            marginTop: 8
          }}
          titleFontWeight={500}
          colorText={$color.black}
          fontWeight={400}
          title={t('稽核日期')}>
          {recordAt}
        </WsSpec>

        <WsFlex flexWrap="wrap">
          {$_getTagsBySystemSubclasses(system_subclasses).map(
            (tag, tagIndex) => {
              return (
                <View key={tagIndex}>
                  {tag.icon && tag.text && (
                    <WsTag
                      style={{
                        marginTop: 8,
                        marginRight: 8
                      }}
                      img={tag.icon}>
                      {tag.text}
                    </WsTag>
                  )}
                </View>
              )
            }
          )}
        </WsFlex>
        {auditors && auditors.length > 0 && (
          <WsInfo
            avatarSize={36}
            labelWidth={48}
            labelSize={12}
            style={{
              flexDirection: 'row',
              // alignItems: 'center',
              marginTop: 8
            }}
            label={t('稽核者')}
            labelColor={$color.gray}
            type='users'
            value={auditors ? auditors : []}
          />
        )
        }

        {auditees && auditees.length > 0 && (
          <WsInfo
            avatarSize={36}
            labelWidth={48}
            labelSize={12}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
            label={t('受稽者')}
            labelColor={$color.gray}
            type='users'
            value={auditees ? auditees : []}
          />
        )
        }

        <LlBtn001
          onPress={onPress}
          isFullWidth={true}
          btnColor={reviewRemark ? [$color.white, $color.white] : [$color.primary5l, $color.primary]}
          textColor={reviewRemark ? $color.primary : $color.white}
          borderColor={reviewRemark ? $color.primary : $color.white}
          style={{
            marginTop: 16
          }}>
          {bottomBtnText}
        </LlBtn001>
      </WsCard>
    </TouchableOpacity>
  )
}

export default LlAuditListCard003
