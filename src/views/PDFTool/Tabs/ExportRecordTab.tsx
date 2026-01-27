import React, { useMemo, useState } from 'react'
import { View, TouchableOpacity, Linking, Alert, Dimensions } from 'react-native'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import {
  WsPageIndex,
  WsCard,
  WsFlex,
  WsDes,
  WsTag,
  WsIconBtn,
  WsModal,
  WsState,
  WsInfo,
  WsText
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_MeetingExport from '@/services/api/v1/meeting_export'
import { FontWeight } from '@shopify/react-native-skia'

type ExportRecordTabProps = {
  meeting?: any
  refreshKey?: number
}

const ExportRecordTab: React.FC<ExportRecordTabProps> = ({ meeting, refreshKey }) => {
  const { width, height } = Dimensions.get('window')
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const currentUserScope = useSelector(state => state.data.userScopes)
  const canUpdateMeetingExport =
    Array.isArray(currentUserScope) &&
    currentUserScope.includes('meeting-export-update')

  console.log(meeting?.id, 'meeting id')

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
        textColor: $color.gray,
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

  const getDownloadUrl = (payload: any) => {
    const convert = payload?.convert_pdf_attach ?? payload
    return (
      convert?.file_version?.source_url ??
      convert?.file?.source_url ??
      ''
    )
  }

  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editRemark, setEditRemark] = useState('')
  const [internalRefreshKey, setInternalRefreshKey] = useState(0)
  const refreshKeyCombined = `${refreshKey ?? 0}-${internalRefreshKey}`

  const __params = useMemo(() => {
    return {
      meeting: meeting?.id,
      order_by: 'created_at',
      order_way: 'desc',
      time_field: 'created_at',
      refresh_key: `${refreshKey ?? 0}-${internalRefreshKey}`,
    }
  }, [meeting?.id, refreshKey, internalRefreshKey])

  const filterFields = useMemo(
    () => ({
      convert_status: {
        type: 'picker',
        label: t('狀態'),
        placeholder: t('選擇'),
        items:
          [
            {
              label: t('已完成'),
              value: 'COMPLETED'
            },
            {
              label: t('處理中'),
              value: 'PENDING,PROCESSING'
            },
            {
              label: t('處理失敗'),
              value: 'FAILED'
            },
          ]
      },
      owner: {
        type: 'belongsto',
        label: t('匯出者'),
        nameKey: 'name',
        modelName: 'user',
        serviceIndexKey: 'simplifyFactoryIndex',
        customizedNameKey: 'userAndEmail',
        placeholder: t('選擇')
      },
      button: {
        type: 'date_range',
        label: t('匯出時間'),
        time_field: 'created_at',
      },
    }),
    [t],
  )

  const handleEditSubmit = async () => {
    if (!editingRecord?.id) return
    try {
      await S_MeetingExport.update({
        modelId: editingRecord.id,
        data: {
          name: editTitle,
          remark: editRemark,
        },
      })
      setEditModalVisible(false)
      setEditingRecord(null)
      setInternalRefreshKey(prev => prev + 1)
    } catch (err) {
      console.log('S_MeetingExport.update error', err)
    }
  }

  return (
    <View style={{ flex: 1 }} key={refreshKeyCombined}>
      <WsPageIndex
        searchLabel={t('標題')}
        mode="pagination"
        hasMeta={true}
        modelName="meeting_export"
        serviceIndexKey="index"
        params={__params}
        searchVisible={true}
        filterVisible={false}
        filterFields={filterFields}
        TARGET_INDEX_HIDE={3}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              onPress={() => {
                navigation.push('RoutesPDFTool', {
                  screen: 'PDFToolAdminExportShow',
                  params: {
                    id: item?.id,
                    meeting: meeting
                  },
                })
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
                <WsFlex style={{}} justifyContent="space-between">

                  <View
                    style={{
                    }}
                  >
                    <WsInfo
                      labelWidth={100}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        maxWidth: width * 0.7,
                      }}
                      value={item?.name}
                      label={t('標題')}
                    />
                  </View>

                  <WsFlex
                    style={{
                    }}
                  >
                    {canUpdateMeetingExport && (
                      <WsIconBtn
                        padding={0}
                        name="md-edit"
                        size={24}
                        color={$color.primary}
                        style={{ top: -2 }}
                        onPress={() => {
                          setEditingRecord(item)
                          setEditTitle(item?.name ?? '')
                          setEditRemark(item?.remark ?? '')
                          setEditModalVisible(true)
                        }}
                      />
                    )}
                    {(() => {
                      const status = String(item?.convert_status ?? '').toUpperCase()
                      const canDownload =
                        status !== 'PENDING' &&
                        status !== 'PROCESSING' &&
                        status !== 'FAILED'
                      if (!canDownload) return null
                      return (
                        <WsIconBtn
                          padding={0}
                          name="md-file-download"
                          size={24}
                          color={$color.primary}
                          style={{ marginLeft: 16 }}
                          onPress={() => {
                            (async () => {
                              try {
                                const res = await S_MeetingExport.download({
                                  params: {
                                    meeting_export_id: item?.id,
                                  },
                                })
                                const url = getDownloadUrl(res?.data ?? res)
                                if (!url) {
                                  Alert.alert(t('暫無可下載檔案'))
                                  return
                                }
                                Linking.openURL(url)
                              } catch (err) {
                                console.log('S_MeetingExport.download error', err)
                                Alert.alert(t('下載失敗，請稍後再試'))
                              }
                            })()
                          }}
                        />
                      )
                    })()}
                  </WsFlex>
                </WsFlex>

                <View
                  style={{
                    marginTop: 8,
                  }}
                >
                  {(() => {
                    const statusTag = getStatusTagProps(item?.convert_status)
                    return (
                      <WsFlex
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                      >
                        <WsText
                          size={14}
                          color={$color.black5l}
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
                    type={'user'}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    value={item?.created_user ?? {}}
                    label={t('匯出者')}
                  />
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
                      item?.updated_at
                        ? moment(item?.updated_at).format('YYYY-MM-DD HH:mm:ss')
                        : item?.updated_at
                          ? moment(item?.updated_at).format('YYYY-MM-DD HH:mm:ss')
                          : ''
                    }
                    label={t('匯出時間')}
                  />
                </View>

              </WsCard>
            </TouchableOpacity>
          )
        }}
      />

      <View style={{ height: 16 }} />

      <WsModal
        title={t('編輯匯出紀錄')}
        visible={editModalVisible}
        headerLeftOnPress={() => {
          setEditModalVisible(false)
          setEditingRecord(null)
        }}
        onBackButtonPress={() => {
          setEditModalVisible(false)
          setEditingRecord(null)
        }}
        footerBtnLeftText={t('取消')}
        footerBtnLeftOnPress={() => {
          setEditModalVisible(false)
          setEditingRecord(null)
        }}
        footerBtnRightText={t('確定')}
        footerBtnRightOnPress={handleEditSubmit}
        childrenScroll={false}
      >
        <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          <WsState
            label={t('標題')}
            placeholder={t('輸入')}
            value={editTitle}
            onChange={val => setEditTitle(val)}
          />

          <WsState
            multiline={true}
            style={{ marginTop: 8 }}
            label={t('備註')}
            placeholder={t('輸入')}
            value={editRemark}
            onChange={val => setEditRemark(val)}
          />
        </View>
      </WsModal>
    </View>
  )
}

export default ExportRecordTab
