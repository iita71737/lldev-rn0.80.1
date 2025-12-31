import React, { useEffect, useState } from 'react'
import { ScrollView, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  WsPage,
  WsText,
  WsPaddingContainer,
  WsInfo,
  WsState,
  WsSkeleton,
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_Meeting from '@/services/api/v1/meeting'
import S_MeetingItemGroup from '@/services/api/v1/meeting_item_group'

type GroupDraft = {
  id: string
  name: string
  schedule_template: any
  contents_template_variable: any
  meeting_template_variable: any
}

const getTemplateFiles = (template: any) => {
  if (!template) return []
  if (Array.isArray(template?.file_attachs) && template.file_attachs.length > 0) {
    return template.file_attachs
  }
  if (Array.isArray(template?.file_attaches) && template.file_attaches.length > 0) {
    return template.file_attaches
  }
  if (template.file) return [template]
  if (template.name) return [template.name]
  return []
}

const PDFToolAdminBatchEditMeetingItemGroup = ({ route }: any) => {
  const { t } = useTranslation()
  const meetingId = route?.params?.id
  const [meeting, setMeeting] = useState<any>(null)
  const [groupDrafts, setGroupDrafts] = useState<GroupDraft[]>([])
  const [loading, setLoading] = useState(!!meetingId)

  useEffect(() => {
    if (!meetingId) {
      setLoading(false)
      return
    }
    let mounted = true
    const isMounted = () => mounted
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [meetingRes, groupsRes] = await Promise.all([
          S_Meeting.show({ modelId: meetingId }),
          S_MeetingItemGroup.index({ params: { meetingId } })
        ])
        if (!isMounted()) return
        setMeeting(meetingRes)
        const groups = groupsRes?.data ?? []
        const drafts: GroupDraft[] = groups.map((group: any) => ({
          id: group.id,
          name: group?.name ?? '',
          schedule_template: group?.schedule_template ?? group?.schedule_template_id ?? null,
          contents_template_variable:
            group?.contents_template_variable ??
            group?.contents_template_item ??
            group?.contents_template ??
            null,
          meeting_template_variable:
            group?.meeting_template_variable ??
            group?.meeting_template_item ??
            group?.meeting_template ??
            null,
        }))
        setGroupDrafts(drafts)
      } catch (err) {
        if (!isMounted()) return
        console.log('fetch batch edit data error', err)
        setMeeting(null)
        setGroupDrafts([])
      } finally {
        if (!isMounted()) return
        setLoading(false)
      }
    }
    fetchAll()
    return () => {
      mounted = false
    }
  }, [meetingId])

  const meetingTitle = meeting?.name ?? t('使用者​自訂​議事標題')
  const owner = meeting?.owner ?? null
  const meetingTemplateFiles = getTemplateFiles(meeting?.meeting_template?.attach)
  const contentsTemplateFiles = getTemplateFiles(meeting?.contents_template?.attach)

  if (loading) {
    return <WsSkeleton />
  }

  return (
    <WsPage title={t('批次編輯議案群組頁')}>
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
              labelWidth={100}
              style={{ flexDirection: 'row', alignItems: 'center' }}
              label={t('負責人')}
              type="user"
              value={owner}
            />
          </View>

          <View style={{ marginTop: 8 }}>
            <WsInfo type="filesAndImages" label={t('目錄​範本​')} value={contentsTemplateFiles} />
          </View>

          <View style={{ marginTop: 8 }}>
            <WsInfo type="filesAndImages" label={t('議程​範本​')} value={meetingTemplateFiles} />
          </View>
        </WsPaddingContainer>

        <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
          <WsText>{t('議案群組')}</WsText>
        </View>

        {groupDrafts.map(group => (
          <View
            key={group.id}
            style={{
              marginTop: 12,
              marginHorizontal: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: $color.gray,
              borderRadius: 12,
            }}
          >
            <WsState
              label={t('名稱')}
              placeholder={t('輸入')}
              value={group.name}
              onChange={value => {
                setGroupDrafts(prev =>
                  prev.map(item => (item.id === group.id ? { ...item, name: value } : item))
                )
              }}
            />

            <WsState
              style={{ marginTop: 16 }}
              label={t('時序表範本')}
              type="belongsto"
              modelName={'meeting_template'}
              serviceIndexKey={'index'}
              nameKey={'name'}
              hasMeta={false}
              value={group.schedule_template}
              onChange={value => {
                setGroupDrafts(prev =>
                  prev.map(item =>
                    item.id === group.id ? { ...item, schedule_template: value } : item
                  )
                )
              }}
            />

            <WsState
              style={{ marginTop: 16 }}
              label={t('此​議案​群​組​對應​的​目錄​範本​區塊​')}
              type="belongsto"
              modelName={'meeting_template_item'}
              serviceIndexKey={'index'}
              nameKey={'name'}
              hasMeta={false}
              params={{
                meeting_template: meeting?.contents_template?.id,
              }}
              value={group.contents_template_variable}
              onChange={value => {
                setGroupDrafts(prev =>
                  prev.map(item =>
                    item.id === group.id ? { ...item, contents_template_variable: value } : item
                  )
                )
              }}
            />

            <WsState
              style={{ marginTop: 16 }}
              label={t('此​議案​群​組​對應​的​議程​範本​區塊​')}
              type="belongsto"
              modelName={'meeting_template_item'}
              serviceIndexKey={'index'}
              nameKey={'name'}
              hasMeta={false}
              params={{
                meeting_template: meeting?.meeting_template?.id,
              }}
              value={group.meeting_template_variable}
              onChange={value => {
                setGroupDrafts(prev =>
                  prev.map(item =>
                    item.id === group.id ? { ...item, meeting_template_variable: value } : item
                  )
                )
              }}
            />
          </View>
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </WsPage>
  )
}

export default PDFToolAdminBatchEditMeetingItemGroup
