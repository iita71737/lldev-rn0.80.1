import React from 'react'
import { Pressable, View, TouchableOpacity } from 'react-native'
import {
  WsCard,
  WsFlex,
  WsText,
  WsIcon,
  WsDes,
  WsFastImage,
  LlNumCard001,
  WsInfo,
  WsTag,
  WsIconBtn,
  WsBottomSheet
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import { navigate } from '@/__reactnative_stone/appNavigator'
import { useNavigation } from '@react-navigation/native'

const LlChecklistSampleRecordCard001 = props => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Props
  const {
    item,
    onPress,
    style,

    setIsBottomSheetActive,
    setSelectedId,
    setSelectedMode,

    setReviewContent,
    setReviewScore,
    setReviewUploadFileURL,
    setReviewUploadFileURLIds,

    setSampleContent,
    setSampleScore,
    setSampleUploadFileURL,
    setSampleUploadFileURLIds,
  } = props

  return (
    <>
      <TouchableOpacity onPress={onPress}>
        <WsCard
          padding={16}
          style={[
            {
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2
              },
              borderRadius: 10,
              shadowRadius: 4,
              shadowOpacity: 0.25,
              elevation: 2
            },
            style
          ]}>
          <WsIconBtn
            style={{
              position: 'absolute',
              right: 0,
              padding: 16,
              zIndex: 999
            }}
            name="md-more-horiz"
            padding={0}
            size={28}
            onPress={() => {
              if (item) {
                setSelectedId(item.id)
                setSelectedMode('editSample')
                setSampleContent(item.content)
                setSampleScore(item.score)
                setSampleUploadFileURL(item.attaches)
              }
              setIsBottomSheetActive(true)
            }}
          />
          <WsFlex style={{ marginTop: 8 }}>
            <WsText
              style={{
                marginRight: 16,
              }}
              size={14} color={$color.gray}
              fontWeight={'600'}>
              {t('結果')}
            </WsText>
            <WsTag
              backgroundColor={item.score == 10 ? $color.green11l : $color.danger11l}
              iconColor={item.score == 10 ? $color.green : $color.danger}
              textColor={item.score == 10 ? $color.gray3d : $color.danger}
              icon={item.score == 10 ? 'ws-filled-check-circle' : "ws-filled-cancel"}
              borderRadius={16}>
              {item.score == 10 ? t('通過') : t('不通過')}
            </WsTag>
          </WsFlex>
          <WsInfo
            labelWidth={68}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 16,
              width: 120
            }}
            label={t('抽檢者')}
            labelColor={$color.gray}
            type={'user'}
            value={item.recorder ? item.recorder : t('無')}
          />
          <WsInfo
            labelWidth={60}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 16,
            }}
            label={t('時間')}
            labelColor={$color.gray}
            type='dateTime'
            value={item.record_at ? moment(item.record_at).format('YYYY-MM-DD HH:mm') : t('無')}
          />
          <WsInfo
            labelWidth={60}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 16,
            }}
            label={t('內容')}
            labelColor={$color.gray}
            value={item.content ? item.content : t('抽檢者尚未填寫')}
          />

          <WsFlex style={{ marginTop: 8 }}>
            <WsText
              style={{
                marginRight: 16,
              }}
              size={14} color={$color.gray}
              fontWeight={'600'}>
              {t('相關記錄')}
            </WsText>
            <TouchableOpacity
              onPress={() => {
                navigation.push('CheckListAssignmentShow', {
                  id: item.checklist_record.id
                })
              }}
            >
              <WsTag
                backgroundColor={item.score == 10 ? $color.green11l : $color.danger11l}
                iconColor={item.score == 10 ? $color.green : $color.danger}
                textColor={item.score == 10 ? $color.gray3d : $color.danger}
                icon={item.score == 10 ? 'ws-filled-check-circle' : "ws-filled-cancel"}
                borderRadius={16}>
                {item.checklist_record && item.checklist_record.record_at ? moment(item.checklist_record.record_at).format('YYYY-MM-DD HH:mm:ss') : t('無')}
              </WsTag>
            </TouchableOpacity>
          </WsFlex>

          {item.attaches &&
            item.attaches.length > 0 && (
              <WsFlex
                alignItems="flex-start"
              >
                <WsText
                  style={{
                    top: 8,
                    marginRight: 16,
                    width: 58
                  }}
                  size={14} color={$color.gray}
                  fontWeight={'600'}
                >
                  {t('附件')}
                </WsText>
                <WsInfo
                  type="filesAndImages"
                  labelColor={$color.gray}
                  value={item.attaches}
                />
              </WsFlex>
            )}
        </WsCard>
      </TouchableOpacity >
    </>
  )
}

export default LlChecklistSampleRecordCard001
