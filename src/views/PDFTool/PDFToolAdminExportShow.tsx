import React, { useState, useEffect } from 'react'
import {
  ScrollView,
  View,
  Linking,
  Platform,
  Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native'
import {
  WsFlex,
  WsTag,
  WsText,
  WsDes,
  WsIconBtn,
  WsPaddingContainer,
  WsInfo,
  WsPageIndex,
  WsIcon,
  WsState,
  WsModal,
  WsBottomSheet,
  WsSkeleton,
  WsCard,
  WsStateCheckBox002,
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import S_MeetingExport from '@/services/api/v1/meeting_export'
import S_MeetingItemGroup from '@/services/api/v1/meeting_item_group'
import S_MeetingItem from '@/services/api/v1/meeting_item'
import { pick, types } from '@react-native-documents/picker'

export type PDFProposalItem = {
  id: string
  name: string
  sequence: string
  parent_article_version_id: string | null
  type: 'title' | 'article'
}

type ExportDisplayItem = {
  id: string
  label: string
  subLabel?: string
  children?: ExportDisplayItem[]
}

const PDFToolAdminExportShow = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Params
  const { id, meeting } = route.params
  console.log(id, '=meeting export record id=')

  // REDUX
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentUserScope = useSelector(state => state.data.userScopes)
  const canUpdateMeetingExport =
    Array.isArray(currentUserScope) &&
    currentUserScope.includes('meeting-export-update')
  const canReadMeetingExport =
    Array.isArray(currentUserScope) &&
    currentUserScope.includes('meeting-export-read')

  // 匯出詳情收合用
  const [exportDetailOpen, setExportDetailOpen] = useState(false)

  const [meetingExport, setMeetingExport] = useState<any>(null)
  const [meetingDetail, setMeetingDetail] = useState<any>(null)
  const [meetingItemGroups, setMeetingItemGroups] = useState<any[]>([])
  const [meetingItemsByGroup, setMeetingItemsByGroup] = useState<Record<string, any[]>>({})

  const [loading, setLoading] = React.useState(true)
  const [isBottomSheetActive, setIsBottomSheetActive] = useState(false)
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editRemark, setEditRemark] = useState('')
  const downloadRecordRefreshKey = 0
  const defaultFilterValue = {}
  const [filterFields] = React.useState<any>({
    button: {
      type: 'date_range',
      label: t('下載時間'),
      time_field: 'download_at',
    },
    download_user: {
      type: 'belongstomany',
      label: t('下載人'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required',
    },
  })

  const params = React.useMemo(() => {
    return {
      meeting_export: id,
      order_by: 'created_at',
      order_way: 'desc',
    }
  }, [id, downloadRecordRefreshKey])

  const normalizeMeetingItemsByGroup = (payload: any) => {
    const groupsMap: Record<string, any[]> = {}
    const data = payload?.data ?? payload
    if (!Array.isArray(data)) return groupsMap

    const looksLikeGroup = (item: any) =>
      item?.meeting_items || item?.meetingItems || item?.articles

    if (data.some(looksLikeGroup)) {
      data.forEach((group: any) => {
        const groupId = group?.id ?? group?.meeting_item_group_id ?? null
        if (!groupId) return
        const meetingItems =
          group?.meeting_items ??
          group?.meetingItems ??
          group?.articles ??
          []
        groupsMap[groupId] = Array.isArray(meetingItems) ? meetingItems : []
      })
      return groupsMap
    }

    data.forEach((item: any) => {
      const groupId =
        item?.meeting_item_group?.id ??
        item?.meeting_item_group_id ??
        item?.meetingItemGroupId ??
        null
      if (!groupId) return
      if (!groupsMap[groupId]) groupsMap[groupId] = []
      groupsMap[groupId].push(item)
    })

    return groupsMap
  }

  const getStatusTagProps = (status: any) => {
    const rawStatus = status?.name ?? status
    const value = String(rawStatus ?? '').toUpperCase()
    if (value === 'COMPLETED' || value === 'COMPLETE') {
      return {
        label: t('已完成'),
        backgroundColor: $color.primary11l,
        textColor: $color.primary2l,
      }
    }
    if (value === 'PROCESSING' || value === 'PENDING') {
      return {
        label: t('處理中'),
        backgroundColor: $color.yellow11l,
        textColor: $color.black,
      }
    }
    if (value === 'FAILED') {
      return {
        label: t('處理失敗'),
        backgroundColor: $color.danger11l,
        textColor: $color.danger,
      }
    }
    return {
      label: rawStatus ?? '',
      backgroundColor: $color.gray,
      textColor: $color.white,
    }
  }

  const exportDisplayItems = React.useMemo(() => {
    if (meetingExport?.type === 'schedule') {
      return [{
        id: 'schedule',
        label: t('時序表'),
      }]
    }

    const meetingData = meetingDetail ?? meetingExport?.meeting ?? null
    if (!meetingData) return []

    const items: ExportDisplayItem[] = []
    const getTemplateId = (template: any) => template?.id ?? template

    const coverTemplate = meetingData?.cover_template
    const coverId = getTemplateId(coverTemplate)
    if (coverId) {
      items.push({
        id: `cover_template:${coverId}`,
        label: t('封面範本'),
        subLabel: coverTemplate?.name,
      })
    }

    const contentsTemplate = meetingData?.contents_template
    const contentsId = getTemplateId(contentsTemplate)
    if (contentsId) {
      items.push({
        id: `contents_template:${contentsId}`,
        label: t('目錄範本'),
        subLabel: contentsTemplate?.name,
      })
    }

    const attachCoverTemplate = meetingData?.attach_cover_template
    const attachCoverId = getTemplateId(attachCoverTemplate)
    if (attachCoverId) {
      const attachCoverSubLabel =
        attachCoverTemplate?.name ??
        attachCoverTemplate?.attach?.file?.name ??
        attachCoverTemplate?.attach?.file_version?.name ??
        undefined
      items.push({
        id: `attach_cover_template:${attachCoverId}`,
        label: t('附件封面範本'),
        subLabel: attachCoverSubLabel,
      })
    }

    const groupList = Array.isArray(meetingItemGroups) ? meetingItemGroups : []

    groupList.forEach((group: any) => {
      const groupId = group?.id ?? group?.meeting_item_group_id ?? null
      if (!groupId) return
      const groupItems =
        meetingItemsByGroup[groupId] ??
        group?.meeting_items ??
        group?.meetingItems ??
        group?.articles ??
        []
      const children = Array.isArray(groupItems)
        ? groupItems.map((item: any, index: number) => ({
          id: `meeting_item:${item?.id ?? `${groupId}:${index}`}`,
          label:
            item?.name ??
            item?.item_label?.name ??
            item?.item_label ??
            t('議案'),
        }))
        : []
      items.push({
        id: `meeting_item_group:${groupId}`,
        label: group?.name ?? t('議案群組'),
        children: children.length ? children : undefined,
      })
    })

    return items
  }, [meetingDetail, meetingExport, meetingItemGroups, meetingItemsByGroup, t])


  const checkedExportMeta = React.useMemo(() => {
    const checked = new Set<string>()
    let hasCover = false
    let hasContents = false
    let hasAttachCover = false
    const exportItems = meetingExport?.meeting_export_items ?? []
    if (!Array.isArray(exportItems)) return checked

    exportItems.forEach((item: any) => {
      const module = String(item?.module ?? '').toLowerCase()
      if (module === 'meeting_item') {
        const id = item?.meeting_item?.id ?? item?.meeting_item
        if (id) checked.add(`meeting_item:${id}`)
        return
      }
      if (module === 'cover' || module === 'cover_template') {
        const id = item?.cover_template?.id ?? item?.cover_template
        if (id) checked.add(`cover_template:${id}`)
        hasCover = true
        return
      }
      if (module === 'contents' || module === 'contents_template') {
        const id = item?.contents_template?.id ?? item?.contents_template
        if (id) checked.add(`contents_template:${id}`)
        hasContents = true
        return
      }
      if (module === 'attach_cover' || module === 'attach_cover_template') {
        const id =
          item?.attach_cover_template?.id ??
          item?.attach_cover_template ??
          item?.attach_cover ??
          item?.attach_cover_template_id ??
          null
        if (id) checked.add(`attach_cover_template:${id}`)
        hasAttachCover = true
      }
    })

    return { ids: checked, hasCover, hasContents, hasAttachCover }
  }, [meetingExport])

  useEffect(() => {
    setMeetingDetail(meeting ?? null)
  }, [meeting])

  useEffect(() => {
    const meetingId = meeting?.id ?? meetingExport?.meeting?.id ?? null
    if (!meetingId) return
    let mounted = true
    const isMounted = () => mounted

    const fetchMeetingData = async () => {
      try {
        const [groupsRes, itemsRes] = await Promise.all([
          S_MeetingItemGroup.index({ params: { meetingId } }),
          S_MeetingItem.meetingIndexAll({
            params: { meetingId, order_way: 'asc', order_by: 'sequence' }
          }),
        ])
        if (!isMounted()) return
        setMeetingItemGroups(groupsRes?.data ?? groupsRes ?? [])
        setMeetingItemsByGroup(normalizeMeetingItemsByGroup(itemsRes))
      } catch (err) {
        if (!isMounted()) return
        console.log('fetch meeting data error', err)
        setMeetingItemGroups([])
        setMeetingItemsByGroup({})
      }
    }

    fetchMeetingData()
    return () => {
      mounted = false
    }
  }, [meeting?.id, meetingExport?.meeting?.id])

  const getDownloadUrl = (payload: any) => {
    const convert = payload?.convert_pdf_attach ?? payload
    return (
      convert?.file_version?.source_url ??
      convert?.file?.source_url ??
      ''
    )
  }

  type CheckboxRowProps = {
    label: string
    checked: boolean
    onChange: (next: boolean) => void
    indent?: number
  }

  const CheckboxRow: React.FC<CheckboxRowProps> = ({
    label,
    checked,
    onChange,
    indent = 0,
  }) => {
    return (
      <View
        style={{
          marginLeft: indent,
          marginTop: 8,
        }}
      >
        <WsStateCheckBox002
          checkboxText={label}
          value={checked}
          onChange={onChange}
          iconRightSize={22}
          disabled={true}
          textColorUnchecked={$color.black}
        />
      </View>
    )
  }

  const isExportItemChecked = (item: ExportDisplayItem): boolean => {
    if (item.id === 'schedule') return true
    if (item.children && item.children.length > 0) {
      return item.children.every(child => isExportItemChecked(child))
    }
    if (item.id.startsWith('cover_template:') && checkedExportMeta.hasCover) {
      return true
    }
    if (item.id.startsWith('contents_template:') && checkedExportMeta.hasContents) {
      return true
    }
    if (item.id.startsWith('attach_cover_template:') && checkedExportMeta.hasAttachCover) {
      return true
    }
    return checkedExportMeta.ids.has(item.id)
  }

  const renderExportItem = (item: ExportDisplayItem, level = 0) => {
    const labelText = item.subLabel ? `${item.label}  ${item.subLabel}` : item.label
    const isChecked = isExportItemChecked(item)
    return (
      <React.Fragment key={item.id}>
        <CheckboxRow
          label={labelText}
          checked={isChecked}
          onChange={() => { }}
          indent={level * 24}
        />
        {item.children?.map(child => renderExportItem(child, level + 1))}
      </React.Fragment>
    )
  }

  // Header option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        if (!canUpdateMeetingExport && !canReadMeetingExport) return null
        return (
          <WsFlex>
            <WsIconBtn
              name="ws-outline-edit-pencil"
              size={24}
              color={$color.white}
              onPress={() => {
                setIsBottomSheetActive(true)
              }}
            />
          </WsFlex>
        )
      },
      headerLeft: () => {
        return (
          <WsIconBtn
            testID="backButton"
            name="ws-outline-arrow-left"
            color="white"
            size={24}
            style={{
              marginRight: 4,
            }}
            onPress={() => {
              navigation.goBack()
            }}
          />
        )
      },
    })
    setLoading(false)
  }

  const $_fetchApi = async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await S_MeetingExport.show({ modelId: id })
      setMeetingExport(res?.data ?? res)
    } catch (err) {
      console.log('S_MeetingExport.show error', err)
    } finally {
      setLoading(false)
    }
  }

  const bottomSheetItems = React.useMemo(() => {
    const statusValue = String(
      meetingExport?.convert_status?.name ??
      meetingExport?.convert_status ??
      meetingExport?.status?.name ??
      meetingExport?.status ??
      '',
    ).toUpperCase()

    const items = []
    if (canUpdateMeetingExport) {
      items.push({
        key: 'edit',
        icon: 'ws-outline-edit-pencil',
        label: t('編輯'),
      })
    }
    return items
  }, [
    canReadMeetingExport,
    canUpdateMeetingExport,
    meetingExport?.convert_status,
    meetingExport?.status,
    t
  ])

  const handleDownloadExport = async () => {
    console.log('S_MeetingExport.download')
    if (!meetingExport?.id) return
    try {
      const res = await S_MeetingExport.download({
        params: {
          meeting_export_id: meetingExport?.id,
        },
      })
      const url = getDownloadUrl(res?.data ?? res)
      if (!url) {
        Alert.alert(t('暫無可下載檔案'))
        return
      }
    } catch (err) {
      console.log('S_MeetingExport.download error', err)
      Alert.alert(t('下載失敗，請稍後再試'))
    }
  }

  const handleBottomSheetItemPress = (item: any) => {
    if (item?.key === 'edit') {
      setEditTitle(meetingExport?.name ?? '')
      setEditRemark(meetingExport?.remark ?? '')
      setEditModalVisible(true)
      setIsBottomSheetActive(false)
      return
    }
    if (item?.key === 'download') {
      handleDownloadExport()
    }
  }

  const handleEditSubmit = async () => {
    if (!meetingExport?.id) return
    try {
      await S_MeetingExport.update({
        modelId: meetingExport.id,
        data: {
          name: editTitle,
          remark: editRemark,
        },
      })
      setMeetingExport((prev: any) =>
        prev
          ? {
            ...prev,
            name: editTitle,
            remark: editRemark,
          }
          : prev
      )
      setEditModalVisible(false)
    } catch (err) {
      console.log('S_MeetingExport.update error', err)
      Alert.alert(t('編輯失敗，請稍後再試'))
    }
  }

  const onPressFile = async () => {
    handleDownloadExport()
  }

  const updateConvertAttach = async () => {
    if (!meetingExport?.id) {
      Alert.alert(t('請先選擇匯出紀錄'))
      return
    }
    try {
      const res = await pick({
        mode: 'import',
        type: [types.doc, types.docx],
      })
      if (!res || res.length === 0) return

      const rawUri = res[0].uri
      const originalName = res[0].name || rawUri.split('/').pop() || 'file.docx'

      const isWordFile = (name: string) => {
        const lower = (name || '').toLowerCase()
        return lower.endsWith('.doc') || lower.endsWith('.docx')
      }
      if (!isWordFile(originalName)) {
        Alert.alert(t('請選擇 .doc 或 .docx 檔案'))
        return
      }

      const fileType =
        res[0].type ||
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

      const formData = new FormData()
      formData.append('factory', currentFactory?.id);
      formData.append('file', {
        uri: rawUri,
        name: originalName,
        type: fileType,
      } as any)

      console.log(meetingExport?.id, 'meetingExport.id')
      console.log(JSON.stringify(formData), 'formData')

      await S_MeetingExport.updateConvertWord({
        params: {
          formData,
          meeting_export_id: meetingExport.id,
        },
      })
      Alert.alert(t('更新成功，伺服器正在處理中，請到匯出紀錄確認處理狀態'))
      $_fetchApi()
    } catch (err: any) {
      const isCancel =
        err?.code === 'DOCUMENT_PICKER_CANCELED' ||
        err?.message?.includes('user canceled') ||
        err?.message?.includes('The operation was cancelled')
      if (!isCancel) console.error('updateConvertAttach error', err)
    }
  }

  const bottomSheetSnapPoints = React.useMemo(() => ['25%'], [])


  useEffect(() => {
    $_setNavigationOption()
    $_fetchApi()
  }, [id])

  if (loading && !meetingExport) {
    return <WsSkeleton />
  }

  return (
    <>
      <WsPageIndex
        hasMeta={true}
        modelName={'meeting_export_record'}
        serviceIndexKey={'index'}
        params={params}
        searchVisible={false}
        filterFields={filterFields}
        defaultFilterValue={defaultFilterValue}
        ListHeaderComponent={() => {
          return (
            <>
              <WsPaddingContainer
                padding={0}
                style={{
                  paddingHorizontal: 16,
                  paddingBottom: 16,
                  backgroundColor: $color.white,
                  marginBottom: 8,
                }}
              >

                <View
                  style={{
                    marginTop: 8,
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    value={meetingExport?.name ?? ''}
                    label={t('標題/檔名')}
                  />
                </View>

                <View
                  style={{
                    marginTop: 8,
                  }}
                >
                  {(() => {
                    const statusTag = getStatusTagProps(
                      meetingExport?.convert_status ?? meetingExport?.status
                    )
                    return (
                      <WsFlex
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <WsText
                          size={14}
                          color={$color.black}
                          style={{ width: 100, fontWeight: '600' }}
                        >
                          {t('狀態')}
                        </WsText>
                        <WsTag
                          backgroundColor={statusTag.backgroundColor}
                          textColor={statusTag.textColor}
                        >
                          {statusTag.label}
                        </WsTag>
                      </WsFlex>
                    )
                  })()}
                </View>

                <View
                  style={{
                    marginTop: 8,
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    value={
                      meetingExport?.created_at
                        ? moment(meetingExport.created_at).format('YYYY-MM-DD HH:mm:ss')
                        : meetingExport?.updated_at
                          ? moment(meetingExport.updated_at).format('YYYY-MM-DD HH:mm:ss')
                          : ''
                    }
                    label={t('匯出時間')}
                  />
                </View>

                <View
                  style={{
                    marginTop: 8,
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    type={'user'}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    value={meetingExport?.principal ?? meetingExport?.created_user ?? {}}
                    label={t('匯出者')}
                  />
                </View>

                <View
                  style={{
                    marginTop: 16,
                    borderTopWidth: 0.7,
                    borderBottomWidth: 0.7,
                    paddingBottom: 12,
                    paddingTop: 12,
                    borderColor: $color.gray,
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    label={t('備註')}
                    value={meetingExport?.remark ?? ''}
                  />
                </View>

                {meetingExport?.convert_word_attach && (
                  <View
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsInfo
                      type="filesAndImages"
                      label={t('議案彙整 (DOCX)')}
                      value={[
                        meetingExport?.convert_word_attach
                      ].filter(Boolean)}
                      onPressFile={onPressFile}
                      useWebView={true}
                      labelBtnIcon="ws-outline-cloud-upload"
                      labelBtnOnPress={updateConvertAttach}
                    />
                  </View>
                )}

                {meetingExport?.convert_pdf_attach && (
                  <View
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsInfo
                      type="filesAndImages"
                      label={meetingExport?.type === 'schedule' ? t('時序表') : t('附件彙整 (PDF)')}
                      value={[
                        meetingExport?.convert_pdf_attach
                      ]}
                      onPressFile={onPressFile}
                      useWebView={true}
                    />
                  </View>
                )}


                {meetingExport?.attach_location_type === 'item-attach-seperate' && (
                  <>
                    {meetingExport?.convert_attach && (
                      <View
                        style={{
                          marginTop: 8
                        }}
                      >
                        <WsInfo
                          type="filesAndImages"
                          label={t('完整匯出檔案')}
                          value={[
                            meetingExport?.convert_attach
                          ].filter(Boolean)}
                          onPressFile={onPressFile}
                          useWebView={true}
                        />
                      </View>
                    )}
                  </>
                )}

                {meetingExport?.type !== 'schedule' && (
                  <>
                    {/* 匯出詳情（可收合） */}
                    <View
                      style={{
                        marginTop: 16,
                        borderTopWidth: 0.7,
                        borderColor: $color.gray,
                        paddingTop: 12,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => setExportDetailOpen(prev => !prev)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <WsText size={14} fontWeight={500}>{t('匯出範圍')}</WsText>
                        <WsIcon
                          name={
                            exportDetailOpen
                              ? 'md-unfold-less'
                              : 'md-unfold-more'
                          }
                          size={20}
                          color={$color.black5l}
                        />
                      </TouchableOpacity>

                      {exportDetailOpen && (
                        <>
                          <View style={{ marginTop: 8 }}>
                            {exportDisplayItems.length > 0 ? (
                              exportDisplayItems.map(item => renderExportItem(item, 0))
                            ) : (
                              <WsText size={14} color={$color.gray}>
                                {t('目前尚無資料')}
                              </WsText>
                            )}
                          </View>
                        </>
                      )}
                    </View>
                  </>
                )}
              </WsPaddingContainer>

              <WsPaddingContainer
                padding={0}
                style={{
                  paddingTop: 8,
                  paddingHorizontal: 16,
                }}
              >
                <WsText fontWeight={600}>{t('下載紀錄')}</WsText>
              </WsPaddingContainer>
            </>
          )
        }}
        renderItem={({ item, index, isLastItem }) => {
          return (
            <TouchableOpacity
              onPress={() => {
              }}
            >
              <WsCard
                padding={16}
                style={{
                  marginHorizontal: 8,
                  marginVertical: 4,
                  backgroundColor: $color.white,
                }}
              >
                <WsFlex
                  style={{
                  }}
                >
                  <WsDes
                    color={$color.black}
                    style={{
                      marginRight: 8,
                      width: 80
                    }}
                  >
                    {t('下載時間')}
                  </WsDes>
                  <WsDes>{moment(item?.download_at).format('YYYY-MM-DD HH:mm:ss')}</WsDes>
                </WsFlex>

                <WsFlex
                  style={{
                    marginTop: 8,
                  }}
                >
                  <WsDes
                    color={$color.black}
                    style={{
                      marginRight: 8,
                      width: 80
                    }}
                  >
                    {t('下載人')}
                  </WsDes>
                  <WsDes>{item?.download_user?.name}</WsDes>
                </WsFlex>
              </WsCard>
            </TouchableOpacity>
          )
        }}
      />

      <WsModal
        title={t('編輯匯出紀錄')}
        visible={editModalVisible}
        headerLeftOnPress={() => setEditModalVisible(false)}
        onBackButtonPress={() => setEditModalVisible(false)}
        footerBtnLeftText={t('取消')}
        footerBtnLeftOnPress={() => setEditModalVisible(false)}
        footerBtnRightText={t('確定')}
        footerBtnRightOnPress={handleEditSubmit}
        childrenScroll={false}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <WsState
            type="text"
            label={t('標題')}
            value={editTitle}
            onChange={val => setEditTitle(val)}
          />
          <WsState
            type="text"
            multiline={true}
            label={t('備註')}
            style={{ marginTop: 16 }}
            value={editRemark}
            onChange={val => setEditRemark(val)}
          />
        </View>
      </WsModal>

      <WsBottomSheet
        isActive={isBottomSheetActive}
        onDismiss={() => setIsBottomSheetActive(false)}
        onItemPress={handleBottomSheetItemPress}
        items={bottomSheetItems}
        snapPoints={bottomSheetSnapPoints}
      />
    </>
  )
}

export default PDFToolAdminExportShow
