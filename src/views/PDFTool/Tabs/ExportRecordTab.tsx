import React, { useMemo, useState } from 'react'
import { View, TouchableOpacity, Dimensions } from 'react-native'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import {
  WsPageIndex,
  WsCard,
  WsFlex,
  WsDes,
  WsIconBtn,
  WsPopup,
  WsText,
  WsState,
  WsGradientButton,
} from '@/components'
import $color from '@/__reactnative_stone/global/color'

const ExportRecordTab: React.FC = () => {
  const { t } = useTranslation()
  const { width } = Dimensions.get('window')
  const navigation = useNavigation<any>()

  const __params = useMemo(() => {
    return {
      order_by: 'created_at',
      order_way: 'desc',
      time_field: 'created_at',
    }
  }, [])

  const filterFields = useMemo(
    () => ({
      owner1: {
        type: 'belongsto',
        label: t('狀態'),
        nameKey: 'name',
        modelName: 'user',
        serviceIndexKey: 'simplifyFactoryIndex',
        customizedNameKey: 'userAndEmail',
        placeholder: t('選擇')
      },
      owner: {
        type: 'belongsto',
        label: t('匯出人'),
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

  const [editPopupVisible, setEditPopupVisible] = useState(false)
  const [editingRecord, setEditingRecord] = useState<any>(null)

  return (
    <View style={{ flex: 1 }}>
      <WsPageIndex
        searchLabel={t('標題')}
        mode="pagination"
        hasMeta={true}
        modelName="internal_training"
        serviceIndexKey="index"
        params={__params}
        searchVisible={true}
        filterVisible={false}
        filterFields={filterFields}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              onPress={() => {
                navigation.push('RoutesPDFTool', {
                  screen: 'PDFToolAdminExportShow',
                  params: { id: item?.id },
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
                <WsFlex style={{ marginTop: 8 }} justifyContent="space-between">
                  <WsFlex>
                    <WsDes color={$color.black} style={{ marginRight: 8 }}>
                      {t('標題')}
                    </WsDes>
                    <WsDes>{item?.name}</WsDes>
                  </WsFlex>

                  <WsFlex>
                    <WsIconBtn
                      padding={0}
                      name="md-edit"
                      size={24}
                      color={$color.primary}
                      style={{ top: -2 }}
                      onPress={() => {
                        setEditingRecord(item)
                        setEditPopupVisible(true)
                      }}
                    />
                    <WsIconBtn
                      padding={0}
                      name="md-file-download"
                      size={24}
                      color={$color.primary}
                      style={{ marginLeft: 16 }}
                      onPress={() => {
                        // TODO: download
                      }}
                    />
                  </WsFlex>
                </WsFlex>

                <WsFlex style={{ marginTop: 8 }}>
                  <WsDes color={$color.black} style={{ marginRight: 8 }}>
                    {t('匯出時間')}
                  </WsDes>
                  <WsDes>{moment(item?.updated_at).format('YYYY-MM-DD HH:mm:ss')}</WsDes>
                </WsFlex>

                <WsFlex style={{ marginTop: 8 }}>
                  <WsDes color={$color.black} style={{ marginRight: 8 }}>
                    {t('匯出人')}
                  </WsDes>
                  <WsDes>{item?.principal?.name}</WsDes>
                </WsFlex>

                <WsFlex style={{ marginTop: 8 }}>
                  <WsDes color={$color.black} style={{ marginRight: 8 }}>
                    {t('處理中')}
                  </WsDes>
                  <WsDes>{moment(item?.updated_at).format('YYYY-MM-DD HH:mm:ss')}</WsDes>
                </WsFlex>
              </WsCard>
            </TouchableOpacity>
          )
        }}
      />

      <View style={{ height: 16 }} />

      <WsPopup
        active={editPopupVisible}
        onClose={() => {
          setEditPopupVisible(false)
          setEditingRecord(null)
        }}
      >
        <View
          style={{
            width: width * 0.9,
            backgroundColor: $color.white,
            borderRadius: 10,
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <WsText size={18} color={$color.black}>
            {t('編輯匯出紀錄')}
          </WsText>

          <WsState label={t('標題')} placeholder={t('輸入')} value={editingRecord?.name} onChange={() => { }} />

          <WsState
            multiline={true}
            style={{ marginTop: 8 }}
            label={t('備註')}
            placeholder={t('輸入')}
            value={editingRecord?.remark}
            onChange={() => { }}
          />

          <WsFlex justifyContent="flex-end" style={{ marginTop: 16 }}>
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                width: 110,
                alignItems: 'center',
              }}
              onPress={() => {
                setEditPopupVisible(false)
                setEditingRecord(null)
              }}
            >
              <WsText style={{ padding: 1 }} size={14} color={$color.gray}>
                {t('取消')}
              </WsText>
            </TouchableOpacity>

            <WsGradientButton
              style={{ width: 110 }}
              onPress={() => {
                setEditPopupVisible(false)
              }}
            >
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>
    </View>
  )
}

export default ExportRecordTab
