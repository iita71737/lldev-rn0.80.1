import React, { useState, useEffect } from 'react'
import { TouchableOpacity } from 'react-native'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { WsPaddingContainer, WsText, WsTag, WsFlex, WsCard, LlBtn001, WsInfo } from '@/components'
import S_ExitChecklist from '@/services/api/v1/exit_checklist'
import { useTranslation } from 'react-i18next'

const LlExitChecklistCard001 = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    item,
    style,
    onPress,
    borderColor,
    textColor,
    btnText,
    testID
  } = props

  return (
    <>
      <TouchableOpacity
        testID={testID}
        onPress={onPress}
      >
        <WsCard style={[style]}>
          <WsFlex>
            {item &&
              item.enter_status ? (
              <WsFlex style={{ marginBottom: 8, marginRight: 4 }}>
                <WsTag
                  backgroundColor={S_ExitChecklist.getEnterStatusBgc(item.enter_status)}
                  textColor={S_ExitChecklist.getEnterStatusTextColor(item.enter_status)}>
                  {t(S_ExitChecklist.getEnterStatusText(item.enter_status))}
                </WsTag>
              </WsFlex>
            ) : (
              <WsFlex style={{ marginBottom: 8 }}>
                <WsTag backgroundColor={$color.white2d} textColor={$color.black}>
                  {t('無進場')}
                </WsTag>
              </WsFlex>
            )}
            {item &&
              item.exit_checklist_status ? (
              <WsFlex style={{ marginBottom: 8 }}>
                <WsTag
                  testID={'收工檢查狀態'}
                  backgroundColor={S_ExitChecklist.getExitChecklistStatusBgc(item.exit_checklist_status)}
                  textColor={S_ExitChecklist.getExitChecklistStatusTextColor(item.exit_checklist_status)}>
                  {t(S_ExitChecklist.getExitChecklistStatus(item.exit_checklist_status))}
                </WsTag>
              </WsFlex>
            ) : (
              <WsFlex style={{ marginBottom: 8 }}>
                <WsTag backgroundColor={$color.white2d} textColor={$color.black}>
                  {t('無收工檢查狀態')}
                </WsTag>
              </WsFlex>
            )}
          </WsFlex>
          <WsText letterSpacing={1}>{t(item.task_content)}</WsText>
          <WsFlex style={{ marginTop: 8 }}>
            <WsText color={$color.gray2d} size={12} style={{ marginRight: 8, width: 80 }}>
              {t('進場日期')}
            </WsText>
            <WsText color={$color.gray2d} size={12}>
              {moment(item.enter_date).format('YYYY-MM-DD')}
            </WsText>
          </WsFlex>
          {item.enter_start_time && item.enter_end_time && (
            <WsFlex style={{ marginTop: 4 }}>
              <WsText color={$color.gray2d} size={12} style={{ marginRight: 8, width: 80 }}>
                {t('進場時間')}
              </WsText>
              <WsText color={$color.gray2d} size={12}>
                {item.enter_start_time && item.enter_end_time
                  ? `${moment(item.enter_start_time).format(
                    'HH:mm'
                  )} - ${moment(item.enter_end_time).format('HH:mm')}`
                  : t('無')}
              </WsText>
            </WsFlex>
          )}
          <WsFlex style={{ marginTop: 4 }}>
            <WsText color={$color.gray2d} size={12} style={{ marginRight: 8, width: 80 }}>
              {t('作業地點')}
            </WsText>
            <WsText color={$color.gray2d} size={12}>
              {item.operate_location}
            </WsText>
          </WsFlex>

          {item.owner && item.owner.name && (
            <WsInfo
              testID={'負責人'}
              labelFontWeight={400}
              labelSize={12}
              labelColor={$color.gray2d}
              labelWidth={80}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
              label={t('負責人')}
              type="user"
              value={item.owner}
              isUri={true}
            />
          )}

          {item.exit_checklist &&
            item.exit_checklist.checked_at && (
              <WsFlex style={{ marginTop: 0 }}>
                <WsText color={$color.gray2d} size={12} style={{ marginRight: 8, width: 80 }}>
                  {t('檢查時間')}
                </WsText>
                <WsText color={$color.gray2d} size={12}>
                  {moment(item.exit_checklist.checked_at).format('YYYY-MM-DD HH:mm')}
                </WsText>
              </WsFlex>
            )
          }
          {btnText && (
            <LlBtn001
              testID={btnText}
              isFullWidth={true}
              borderWidth={0}
              style={{
                marginTop: 16,
              }}
              onPress={onPress}
            >
              {btnText}
            </LlBtn001>
          )}
        </WsCard>
      </TouchableOpacity>
    </>
  )
}

export default LlExitChecklistCard001
