import React, { useEffect, useState } from 'react'
import { ScrollView, View, Dimensions, TouchableOpacity } from 'react-native'
import { useTranslation } from 'react-i18next'
import {
  WsPage,
  WsText,
  WsPaddingContainer,
  WsInfo,
  WsState,
  WsSkeleton,
  WsPopup,
  WsFlex,
  WsGradientButton,
  WsLoading,
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_Meeting from '@/services/api/v1/meeting'
import S_MeetingItemGroup from '@/services/api/v1/meeting_item_group'
import { useNavigation } from '@react-navigation/native'

type GroupDraft = {
  id: string
  name: string
  schedule_template: any
  contents_template_variable: any
  meeting_template_variable: any
}

const getTemplateItems = (template: any) =>
  template?.meeting_template_items ??
  template?.file_attaches?.[0]?.meeting_template_items ??
  template?.file_attachs?.[0]?.meeting_template_items ??
  []

const getTemplateItemId = (value: any) => value?.id ?? value ?? null
const getTemplateItemValue = (value: any) =>
  value?.value ??
  value?.meeting_template_field?.value ??
  value?.name ??
  value ??
  null

const getGroupTemplateId = (value: any) => value?.id ?? value ?? null
const getGroupTemplateValue = (value: any) =>
  value?.value ??
  value?.meeting_template_field?.value ??
  value?.name ??
  value ??
  null

const isTemplateVariableValid = (
  templateIdSet: Set<any>,
  templateValueSet: Set<any>,
  groupTemplateValue: any
) => {
  const id = getGroupTemplateId(groupTemplateValue)
  if (id && templateIdSet.has(id)) return true
  const value = getGroupTemplateValue(groupTemplateValue)
  if (value && templateValueSet.has(value)) return true
  return false
}

const getTemplateName = (template: any) => template?.name ?? ''
const getTemplateId = (template: any) => template?.id ?? ''

const PDFToolAdminBatchEditMeetingItemGroup = ({ route }: any) => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const meetingId = route?.params?.id
  const [meeting, setMeeting] = useState<any>(null)
  const [groupDrafts, setGroupDrafts] = useState<GroupDraft[]>([])
  const [loading, setLoading] = useState(!!meetingId)
  const [popupActive, setPopupActive] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)


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
  const meetingTemplateId = getTemplateId(meeting?.meeting_template)
  const meetingTemplateName = getTemplateName(meeting?.meeting_template)
  const contentsTemplateTemplateId = getTemplateId(meeting?.contents_template)
  const contentsTemplateName = getTemplateName(meeting?.contents_template)
  const contentsTemplateItems = getTemplateItems(meeting?.contents_template)
  const meetingTemplateItems = getTemplateItems(meeting?.meeting_template)
  const contentsTemplateIdSet = new Set(
    contentsTemplateItems.map(getTemplateItemId).filter(Boolean)
  )
  const contentsTemplateValueSet = new Set(
    contentsTemplateItems.map(getTemplateItemValue).filter(Boolean)
  )
  const meetingTemplateIdSet = new Set(
    meetingTemplateItems.map(getTemplateItemId).filter(Boolean)
  )
  const meetingTemplateValueSet = new Set(
    meetingTemplateItems.map(getTemplateItemValue).filter(Boolean)
  )

  const $_submitBatchEditItemGroup = async () => {
    if (!meetingId) {
      return
    }
    setSubmitLoading(true)
    try {
      const $_getId = (value: any) => value?.id ?? value ?? null
      for (const group of groupDrafts) {
        const _params = {
          meetingId: meetingId,
          name: group?.name ?? '',
          schedule_template: $_getId(group?.schedule_template),
          contents_template_variable: $_getId(group?.contents_template_variable),
          meeting_template_variable: $_getId(group?.meeting_template_variable)
        }
        console.log(_params, '_params==')
        if (!group?.id) continue
        await S_MeetingItemGroup.update({
          data: _params,
          modelId: group.id
        })
      }
      navigation.navigate('RoutesPDFTool', {
        screen: 'PDFToolAdminShow',
        params: {
          id: meetingId,
        }
      })
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) {
    return <WsSkeleton />
  }

  return (
    <>
      <WsPage
        btnTextRight={t('送出')}
        title={t('批次編輯議案群組')}
        rightOnPress={() => {
          $_submitBatchEditItemGroup()
        }}
        leftOnPress={() => {
          setPopupActive(true)
        }}
      >
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
                    if (contentsTemplateName) {
                      navigation.push('RoutesPDFTool', {
                        screen: 'PDFToolAdminTemplateShow',
                        params: {
                          id: contentsTemplateTemplateId,
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
                    if (meetingTemplateName) {
                      navigation.push('RoutesPDFTool', {
                        screen: 'PDFToolAdminTemplateShow',
                        params: {
                          id: meetingTemplateId,
                        }
                      })
                    }
                  }}
                />
              )}
            </View>
          </WsPaddingContainer>

          <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
            <WsText fontWeight={600}>{t('議案群組')}</WsText>
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
                label={t('標題')}
                placeholder={t('輸入')}
                value={group.name}
                onChange={value => {
                  setGroupDrafts(prev =>
                    prev.map(item => (item.id === group.id ? { ...item, name: value } : item))
                  )
                }}
                rules={'required'}
                errorMessage={!group.name && [t('此項目為必填')]}
              />

              <WsState
                style={{ marginTop: 16 }}
                label={t('時序表範本')}
                type="belongsto"
                modelName={'meeting_template'}
                serviceIndexKey={'index'}
                nameKey={'name'}
                hasMeta={true}
                remind={t('若未選擇，則不會產生時序表')}
                params={
                  {
                    meeting_template_type: 'typeScheduleId',
                  }
                }
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
                remind={
                  isTemplateVariableValid(
                    contentsTemplateIdSet,
                    contentsTemplateValueSet,
                    group.contents_template_variable
                  )
                    ? null
                    : t('範本區塊需要重新選擇')
                }
                remindColor={$color.danger}
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
                rules={'required'}
                errorMessage={!group.contents_template_variable && [t('此項目為必填')]}
              />

              <WsState
                style={{ marginTop: 16 }}
                label={t('此議案群組對應的議程範本區塊')}
                type="belongsto"
                modelName={'meeting_template_item'}
                serviceIndexKey={'index'}
                nameKey={'name'}
                hasMeta={false}
                remind={
                  isTemplateVariableValid(
                    meetingTemplateIdSet,
                    meetingTemplateValueSet,
                    group.meeting_template_variable
                  )
                    ? null
                    : t('所對應範本區塊需要重新選擇')
                }
                remindColor={$color.danger}
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
                rules={'required'}
                errorMessage={!group.meeting_template_variable && [t('此項目為必填')]}
              />
            </View>
          ))}

          <View style={{ height: 32 }} />
        </ScrollView>
      </WsPage>
      {submitLoading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            zIndex: 999,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <WsLoading />
        </View>
      )}

      <WsPopup
        active={popupActive}
        onClose={() => {
          setPopupActive(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            height: height * 0.2,
            backgroundColor: $color.white,
            borderRadius: 10,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <WsText
            size={18}
            color={$color.black}
            style={{
              position: 'absolute',
              left: 16,
              top: 16
            }}
          >{t('確定捨棄嗎？')}
          </WsText>
          <WsFlex
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
            }}
          >
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 9,
                borderWidth: 1,
                borderColor: $color.gray,
                borderRadius: 25,
                alignItems: 'center',
                width: 110,
                height: 48
              }}
              onPress={() => {
                setPopupActive(false)
              }}>
              <WsText
                size={14}
                color={$color.gray}
              >{t('取消')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              style={{
                width: 110,
              }}
              onPress={() => {
                navigation.goBack()
              }}>
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>
    </>
  )
}

export default PDFToolAdminBatchEditMeetingItemGroup
