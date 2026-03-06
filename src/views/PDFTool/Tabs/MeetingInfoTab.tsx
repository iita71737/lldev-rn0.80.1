import React, { useEffect, useState } from 'react'
import { View, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native'
import Clipboard from '@react-native-clipboard/clipboard'
import { useTranslation } from 'react-i18next'
import {
  WsPaddingContainer,
  WsText,
  WsInfo,
  WsFlex,
  WsCard,
  WsIcon,
  WsSkeleton,
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_Meeting from '@/services/api/v1/meeting'
import { useNavigation } from '@react-navigation/native'

export type EsGoalVariable = {
  id: string
  customName: string
  variableName: string
  esGoalField: string
}

type Props = {
  variableList?: EsGoalVariable[]
  meetingId?: string
}

const EsGoalVariableItem: React.FC<{ item: EsGoalVariable }> = ({ item }) => {
  const { t } = useTranslation()

  const onCopy = async () => {
    Clipboard.setString(`\${${item.variableName}}`)
    Alert.alert(t('已成功複製'))
  }

  return (
    <TouchableOpacity activeOpacity={0.9} style={{ marginHorizontal: 16, marginTop: 12 }}>
      <WsCard
        borderRadius={12}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 16,
          borderWidth: 1,
          borderColor: $color.gray,
        }}
      >

        <View style={{}}>
          <WsFlex style={{}} alignItems="center">
            <WsText size={14} style={{ width: 60 }} color={$color.gray}>
              {t('標記')}
            </WsText>

            <WsText size={14}>{`\${${item.variableName}}`}</WsText>

            <TouchableOpacity style={{ marginLeft: 8 }} onPress={onCopy}>
              <WsIcon name="md-content-copy" size={24} color={$color.primary} />
            </TouchableOpacity>
          </WsFlex>

          <WsFlex alignItems="center" justifyContent="">
            <WsText size={14} style={{ width: 60 }} color={$color.gray}>
              {t('名稱')}
            </WsText>
            <WsText size={14}>{item.customName || t('使用者自定名稱')}</WsText>
          </WsFlex>

          <WsFlex alignItems="center">
            <WsText size={14} style={{ width: 160 }} color={$color.gray}>
              {t('對應ESGoal欄位')}
            </WsText>
            <WsText size={14} numberOfLines={1}>
              {item.esGoalField}
            </WsText>
          </WsFlex>
        </View>
      </WsCard>
    </TouchableOpacity>
  )
}

const MeetingInfoTab: React.FC<Props> = ({ variableList = [], meetingId }) => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const [meeting, setMeeting] = useState<any>(null)
  const [loading, setLoading] = useState(!!meetingId)

  const fetchMeeting = async (currentMeetingId: string) => {
    try {
      console.log(currentMeetingId, 'currentMeetingId')
      const res = await S_Meeting.show({ modelId: currentMeetingId })
      return res
    } catch {
      throw new Error(t('取得議事內容失敗'))
    }
  }

  useEffect(() => {
    if (!meetingId) {
      setLoading(false)
      return
    }
    let isMounted = true
    setLoading(true)
    fetchMeeting(meetingId)
      .then(res => {
        if (!isMounted) return
        setMeeting(res)
      })
      .catch(err => {
        if (!isMounted) return
        Alert.alert(t('取得議事內容失敗'))
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [meetingId, t])

  const normalizeUserList = (items: any[] = []) =>
    items
      .map(item => {
        if (!item) return null
        if (typeof item === 'string') return { name: item }
        if (item.name) return item
        return null
      })
      .filter(Boolean)

  const normalizeRoleList = (items: any[] = []) =>
    items
      .map(item => {
        if (!item) return null
        if (typeof item === 'string') return { name: item }
        if (item.name) return item
        if (item.role?.name) return { name: item.role.name }
        if (item.template?.name) return { name: item.template.name }
        return null
      })
      .filter(Boolean)

  const normalizeFiles = (input: any) => {
    if (!input) return []
    if (Array.isArray(input)) return input
    return [input]
  }

  const getTemplateName = (template: any) => template?.name ?? ''
  const getTemplateId = (template: any) => template?.id ?? ''

  const meetingTitle = meeting?.name ?? t('使用者​自訂​議事標題')
  const chairperson = meeting?.chairperson ?? null
  const meetingDate = meeting?.meeting_date_format ?? meeting?.meeting_date ?? null
  const location = meeting?.location ?? null
  const itemLabelType =
    meeting?.item_label_type?.name ??
    meeting?.item_label_type?.value ??
    '-'
  const owner = meeting?.owner ?? null
  const expiredAt = meeting?.expired_at ?? null
  const users = normalizeUserList(meeting?.users ?? [])
  const roles = normalizeRoleList(
    meeting?.roles ?? meeting?.user_factory_roles ?? meeting?.user_factory_role_templates ?? []
  )
  const tags = Array.isArray(meeting?.factory_tags) ? meeting.factory_tags : []
  const remark = meeting?.remark ?? null
  const attaches = normalizeFiles(meeting?.attaches ?? meeting?.file_attaches ?? [])
  const signInForm = normalizeFiles(meeting?.sign_in_form ?? [])
  const meetingItemTemplateName = getTemplateName(meeting?.meeting_item_template)
  const meetingItemTemplateId = getTemplateId(meeting?.meeting_item_template)

  const meetingTemplateId = getTemplateId(meeting?.meeting_template)
  const meetingTemplateName = getTemplateName(meeting?.meeting_template)

  const contentsTemplateName = getTemplateName(meeting?.contents_template)
  const contentsTemplateTemplateId = getTemplateId(meeting?.contents_template)

  const coverTemplateName = getTemplateName(meeting?.cover_template)
  const coverTemplateId = getTemplateId(meeting?.cover_template)

  const coverAttachTemplateName = getTemplateName(meeting?.attach_cover_template)
  const coverAttachTemplateId = getTemplateId(meeting?.attach_cover_template)

  const attachCoverTemplateName = getTemplateName(meeting?.attach_cover_template)
  const attachCoverTemplateId = getTemplateId(meeting?.attach_cover_template)

  const toVariableItems = (items: any[]): EsGoalVariable[] =>
    (Array.isArray(items) ? items : [])
      .map((item: any) => {
        const rawValue =
          item?.value ??
          item?.meeting_template_field?.value ??
          ''
        const variableName =
          typeof rawValue === 'string'
            ? rawValue
              .trim()
              .replace(/^\$\{/, '')
              .replace(/^\{/, '')
              .replace(/\}$/, '')
            : ''
        const esGoalField =
          item?.meeting_template_field?.name ??
          item?.meeting_template_field?.value ??
          (typeof item?.meeting_template_field === 'string'
            ? item.meeting_template_field
            : '') ??
          ''

        return {
          id: item?.id ?? `${item?.name ?? ''}-${rawValue}`,
          customName: item?.name ?? '',
          variableName,
          esGoalField,
        }
      })
      .filter((item: EsGoalVariable) => item.variableName)

  const meetingItemTemplateItems = toVariableItems(
    meeting?.meeting_item_template?.meeting_template_items ??
    meeting?.meeting_item_template?.file_attaches?.[0]?.meeting_template_items ??
    meeting?.meeting_item_template?.file_attachs?.[0]?.meeting_template_items ??
    []
  )

  if (loading) {
    return <WsSkeleton />
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: $color.white }}>
      <WsPaddingContainer
        padding={0}
        style={{
          paddingTop: 16,
          paddingBottom: 8,
          paddingHorizontal: 16,
          backgroundColor: $color.white,
        }}
      >
        <WsText size={24}>{meetingTitle}</WsText>
      </WsPaddingContainer>

      <WsPaddingContainer
        padding={0}
        style={{
          paddingTop: 8,
          paddingBottom: 8,
          paddingHorizontal: 16,
          backgroundColor: $color.white,
        }}
      >
        <View style={{ marginTop: 8 }}>
          <WsInfo
            labelWidth={120}
            style={{ flexDirection: 'row', alignItems: 'center' }}
            label={t('主席')}
            value={chairperson}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo
            labelWidth={120}
            style={{ flexDirection: 'row', alignItems: 'center' }}
            label={t('時間')}
            value={meetingDate}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo
            labelWidth={120}
            style={{ flexDirection: 'row', alignItems: 'center' }}
            label={t('地點')}
            value={location}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          {meetingItemTemplateName && (
            <WsInfo
              labelWidth={120}
              type="link"
              label={`${t('提案單範本')} `}
              value={meetingItemTemplateName}
              style={{
                flexDirection: 'row'
              }}
              onPress={() => {
                console.log('3333')
                navigation.push('RoutesPDFTool', {
                  screen: 'PDFToolAdminTemplateShow',
                  params: {
                    id: meetingItemTemplateId,
                  }
                })
              }}
            />
          )}
        </View>

        <View style={{ marginTop: 8 }}>

          <WsInfo
            labelWidth={120}
            type="link"
            label={`${t('封面範本')} `}
            value={coverTemplateName}
            style={{
              flexDirection: 'row'
            }}
            onPress={() => {
              if (coverTemplateName) {
                console.log('3333')
                navigation.push('RoutesPDFTool', {
                  screen: 'PDFToolAdminTemplateShow',
                  params: {
                    id: coverTemplateId,
                  }
                })
              }
            }}
          />
        </View>

        <View style={{ marginTop: 8 }}>

          <WsInfo
            labelWidth={120}
            type="link"
            label={`${t('封面附件範本')} `}
            value={coverAttachTemplateName}
            style={{
              flexDirection: 'row'
            }}
            onPress={() => {
              if (coverAttachTemplateName) {
                navigation.push('RoutesPDFTool', {
                  screen: 'PDFToolAdminTemplateShow',
                  params: {
                    id: coverAttachTemplateId,
                  }
                })
              }
            }}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          {attachCoverTemplateName && (
            <WsInfo
              labelWidth={120}
              type="link"
              label={`${t('附件封面範本')} `}
              value={attachCoverTemplateName}
              style={{
                flexDirection: 'row'
              }}
              onPress={() => {
                if (attachCoverTemplateName) {
                  navigation.push('RoutesPDFTool', {
                    screen: 'PDFToolAdminTemplateShow',
                    params: {
                      id: attachCoverTemplateId,
                    }
                  })
                }
              }}
            />
          )}
        </View>

        <View style={{ marginTop: 8 }}>
          {meetingTemplateName && (
            <WsInfo
              labelWidth={120}
              type="link"
              label={`${t('議程​範本​')} `}
              value={meetingTemplateName}
              style={{
                flexDirection: 'row'
              }}
              onPress={() => {
                console.log('3333')
                navigation.push('RoutesPDFTool', {
                  screen: 'PDFToolAdminTemplateShow',
                  params: {
                    id: meetingTemplateId,
                  }
                })
              }}
            />
          )}
        </View>


        <View style={{ marginTop: 8 }}>
          {contentsTemplateName && (
            <WsInfo
              labelWidth={120}
              type="link"
              label={`${t('目錄範本')} `}
              value={contentsTemplateName}
              style={{
                flexDirection: 'row'
              }}
              onPress={() => {
                console.log('3333')
                navigation.push('RoutesPDFTool', {
                  screen: 'PDFToolAdminTemplateShow',
                  params: {
                    id: contentsTemplateTemplateId,
                  }
                })
              }}
            />
          )}
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo
            labelWidth={120}
            style={{ flexDirection: 'row', alignItems: 'center' }}
            label={t('項目符號')}
            value={itemLabelType}
          />
        </View>

        <View style={{ marginTop: 16, borderTopWidth: 1, paddingTop: 16 }}>
          <WsInfo
            labelWidth={120}
            style={{ flexDirection: 'row', alignItems: 'center' }}
            label={t('負責人')}
            type="user"
            value={owner}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo
            labelWidth={120}
            style={{ flexDirection: 'row', alignItems: 'center' }}
            label={t('期限')}
            type="date"
            value={expiredAt}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo
            labelWidth={120}
            style={{ flexDirection: 'row', alignItems: 'center' }}
            label={t('限閱人員')}
            type="users"
            valueFontSize={14}
            value={users}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <WsInfo
            labelWidth={120}
            style={{ flexDirection: 'row', alignItems: 'center' }}
            label={t('限閱角色')}
            type="belongstomany"
            valueFontSize={14}
            value={roles}
          />
        </View>

        {tags &&
          tags.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <WsInfo type="tags" value={tags} />
            </View>
          )}

        <View style={{ marginTop: 8 }}>
          <WsInfo labelWidth={120} value={remark} label={t('備註')} style={{ flexDirection: 'row' }} />
        </View>

        {Array.isArray(attaches) && attaches.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <WsInfo type="filesAndImages" label={t('附件')} value={attaches} />
          </View>
        )}

        {Array.isArray(signInForm) && signInForm.length > 0 && (
          <View style={{ marginTop: 8 }}>
            <WsInfo type="filesAndImages" label={t('簽到表')} value={signInForm} />
          </View>
        )}

      </WsPaddingContainer>

      <WsPaddingContainer padding={0} style={{ marginTop: 8, paddingBottom: 8, backgroundColor: $color.primary11l }}>
        <FlatList
          data={meetingItemTemplateItems.length > 0 ? meetingItemTemplateItems : variableList}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <EsGoalVariableItem item={item} />}
          ListHeaderComponent={() => (
            <>
              <WsPaddingContainer padding={0} style={{ paddingTop: 8, paddingHorizontal: 16 }}>
                <WsText size={14} fontWeight={500}>
                  {t('提案單標記')}
                </WsText>
              </WsPaddingContainer>
            </>
          )}
          ListFooterComponent={() => <View style={{ height: 50 }} />}
        />
      </WsPaddingContainer>
    </ScrollView>
  )
}

export default MeetingInfoTab
