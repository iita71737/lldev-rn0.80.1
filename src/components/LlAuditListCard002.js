import React from 'react'
import { Pressable, View } from 'react-native'
import gColor from '@/__reactnative_stone/global/color'
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

const LlAuditListCard002 = props => {
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
    recordDraft,
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
    <Pressable
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
          testID={'稽核日期'}
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
              alignItems: 'center',
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

        {recordDraft ? (
          <WsBtn
            style={{
              marginTop: 16,
              paddingHorizontal: 8,
            }}
            minHeight={48}
            onPress={onPress}
            color={recordDraft ? $color.white : $color.primary}
            textColor={recordDraft ? $color.primary : $color.white}
            borderColor={recordDraft ? $color.primary : $color.white}
            borderWidth={1}
            borderRadius={25}
          >
            {bottomBtnText}
          </WsBtn>
        ) : (
          <LlBtn001
            onPress={onPress}
            isFullWidth={true}
            style={{
              marginTop: 16
            }}
            btnColor={recordDraft ? [$color.white5d, $color.white5d] : [$color.primary5l, $color.primary]}
            textColor={recordDraft ? $color.primary : $color.white}
            borderColor={recordDraft ? $color.primary : $color.white}
          >
            {bottomBtnText}
          </LlBtn001>
        )
        }
      </WsCard>
    </Pressable >
  )
}

export default LlAuditListCard002
