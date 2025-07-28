import React from 'react'
import { Pressable, View, TouchableOpacity, Alert, Dimensions } from 'react-native'
import {
  WsCard,
  WsText,
  WsFlex,
  WsTag,
  WsGradientButton,
  WsGrid,
  WsSpec,
  WsBtn,
  WsIconBtn,
  WsIcon,
  WsDes
} from '@/components'
import gColor from '@/__reactnative_stone/global/color'
import LlBtn001 from '@/components/LlBtn001'
import { useTranslation } from 'react-i18next'
import ServiceAudit from '@/services/api/v1/audit'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'

const LlAuditListCard001 = props => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    name,
    owner,
    style,
    onPress,
    createOnPress,
    bookmarkOnPress,
    system_subclasses = [],
    auditId,
    AuditRequestCreateBtnVisible = true,
    item,
    is_collect,
    is_collect_visible = false,
    testID
  } = props

  //state
  const [isCollect, setIsCollect] = React.useState(is_collect)
  const [audit, setAudit] = React.useState(null)

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

  // SERVICE
  const $_fetchAuditsShow = async () => {
    const resAudit = await ServiceAudit.show({ modelId: auditId })
    setAudit(resAudit)
  }

  const $_isAuditTemplateUpdate = () => {
    return (
      item.audit_template.status == 1 &&
      item.audit_template.last_version.id !=
      item.last_version.audit_template_version.id
    )
  }

  React.useEffect(() => {
    $_fetchAuditsShow()
  }, [auditId])

  // Render
  return (
    <TouchableOpacity onPress={onPress} testID={testID}>
      <WsCard
        style={[
          {
            alignItems: 'flex-start'
          },
          style
        ]}
      >
        {item &&
          item.last_version &&
          item.last_version.audit_template_version &&
          item.last_version.audit_template_version.id &&
          item.audit_template &&
          item.audit_template.last_version &&
          item.audit_template.last_version.id &&
          (item.last_version.audit_template_version.id !== item.audit_template.last_version.id) &&
          $_isAuditTemplateUpdate() && (
            <WsTag
              backgroundColor="rgb(255, 247, 208)"
              textColor={$color.gray6d}>
              {t('版本更新')}
            </WsTag>
          )}

        {is_collect_visible && (
          <WsIconBtn
            testID={'加入收藏'}
            style={{
              top: 0,
              right: 0,
              position: 'absolute',
              zIndex: 99,
            }}
            name={isCollect ? 'md-bookmark' : 'ws-outline-bookmark'}
            size={28}
            onPress={() => {
              bookmarkOnPress(item)
              setIsCollect(!isCollect)
            }}
          />
        )}

        {name && (
          <WsText
            style={{
              maxWidth: width * 0.8,
              marginTop: 8,
            }}
            letterSpacing={1}>
            {name}
          </WsText>
        )}

        {system_subclasses &&
          system_subclasses.length > 0 && (
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
                          {t(tag.text)}
                        </WsTag>
                      )}
                    </View>
                  )
                }
              )}
            </WsFlex>
          )}

        {owner &&
          owner.name && (
            <View
              style={{
                marginTop: 8,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <WsDes
                style={{
                  marginRight: 8
                }}>
                {t('管理者')}
              </WsDes>
              <WsText color={$color.gray} size={12}>
                {owner.name}
              </WsText>
            </View>
          )}

        {AuditRequestCreateBtnVisible && (
          <WsGradientButton
            testID={'建立稽核行程'}
            style={{
              marginTop: 16,
            }}
            onPress={() => {
              navigation.navigate({
                name: 'AuditCreateRequest',
                params: {
                  audit: audit
                }
              })
            }}
          >
            <WsFlex
              style={{
                paddingTop: 2
              }}
            >
              <WsIcon
                name={'ll-nav-add-audit'}
                size={20}
                color={$color.white}
                style={{
                  marginRight: 8,
                }}
              ></WsIcon>
              <WsText
                size={14}
                color={$color.white}
              >
                {t('建立稽核行程')}
              </WsText>
            </WsFlex>
          </WsGradientButton>
        )}
      </WsCard>
    </TouchableOpacity>
  )
}

export default LlAuditListCard001
