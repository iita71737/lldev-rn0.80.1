import React from 'react'
import { Pressable, View, TouchableOpacity } from 'react-native'
import {
  WsFlex,
  WsTag,
  WsPaddingContainer,
  WsText,
  WsDes,
  WsIcon,
  WsCard,
  WsInfo
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import S_ExitChecklist from '@/services/api/v1/exit_checklist'

const LlContractorEnterCard001 = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    item,
    style,
    onPress,
    type,
    testID
  } = props

  // STATES
  // const [status, setStatus] = React.useState()
  const [selectedExitChecklist, setSelectedExitChecklist] = React.useState()

  // SERVICES
  const $_checkExitChecklist = () => {
    const _filter = S_ExitChecklist.checkExitChecklistsStatus(item.exit_checklists)
    setSelectedExitChecklist(_filter)
    if (_filter) {
      const _status = S_ExitChecklist.getExitChecklistTag(_filter)
      // setStatus(_status)
    }
  }
  // HELPER
  const $_isExpired = () => {
    return moment().isAfter(item.notify_at)
  }
  // 判斷 收工檢查狀態 (SAME AS WEB)
  const $_checkExitChecklistStatus = () => {
    return S_ExitChecklist.checkExitChecklist(item)
  }

  React.useEffect(() => {
    if (item) {
      $_checkExitChecklist()
    }
  }, [])

  // Render
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
    >
      {item && (
        <WsCard style={[style]} padding={0}>
          <WsPaddingContainer>
            <WsFlex>
              {item &&
                item.enter_status && (
                  <WsFlex style={{ marginBottom: 8, marginRight: 4 }}>
                    <WsTag
                      backgroundColor={S_ExitChecklist.getEnterStatusBgc(item.enter_status)}
                      textColor={S_ExitChecklist.getEnterStatusTextColor(item.enter_status)}>
                      {t(S_ExitChecklist.getEnterStatusText(item.enter_status))}
                    </WsTag>
                  </WsFlex>
                )}
              {item &&
                item.exit_checklist_status ? (
                <WsFlex style={{ marginBottom: 8, marginRight: 4 }}>
                  <WsTag
                    backgroundColor={S_ExitChecklist.getExitChecklistStatusBgc(item.exit_checklist_status)}
                    textColor={S_ExitChecklist.getExitChecklistStatusTextColor(item.exit_checklist_status)}>
                    {t(S_ExitChecklist.getExitChecklistStatus(item.exit_checklist_status))}
                  </WsTag>
                </WsFlex>
              ) : (
                <WsFlex style={{ marginBottom: 8 }}>
                  <WsTag backgroundColor={$color.danger11l} textColor={$color.danger}>
                    {t('收工未檢查')}
                  </WsTag>
                </WsFlex>
              )}
            </WsFlex>
            <WsText style={{ marginBottom: 8 }} letterSpacing={1}>
              {item.task_content}
            </WsText>
            {item.system_subclasses && item.system_subclasses.length > 0 && (
              <WsFlex
                flexWrap={'wrap'}
              >
                {item.system_subclasses.map(
                  (systemSubclass, systemSubclassIndex) => {
                    return (
                      <WsFlex
                        style={{
                          marginTop: 8,
                        }}
                        key={systemSubclassIndex}>
                        <WsTag
                          img={systemSubclass.icon}
                          style={{
                            marginRight: 8
                          }}>
                          {t(systemSubclass.name)}
                        </WsTag>
                      </WsFlex>
                    )
                  }
                )}
              </WsFlex>
            )}
            {item.factory && (
              <WsFlex style={{ marginBottom: 8 }}>
                <WsText
                  size={12}
                  color={$color.gray3d}
                  style={{ width: 100 }}
                >
                  {t('進場單位')}
                </WsText>
                <WsText size={12} color={$color.gray} style={{ marginLeft: 8 }}>
                  {item.factory && item.factory.name}
                </WsText>
              </WsFlex>
            )}
            {item.enter_start_date && item.enter_end_date && (item.enter_start_date != item.enter_end_date) && (
              <WsFlex style={{ marginBottom: 8 }}>
                <WsText size={12} color={$color.gray3d} style={{ width: 100 }}>
                  {t('預計進場日期')}
                </WsText>
                <WsText size={12} color={$color.gray} style={{ marginLeft: 8 }}>
                  {moment(item.enter_start_date).format('YYYY-MM-DD')}
                  {' - '}
                  {moment(item.enter_end_date).format('YYYY-MM-DD')}
                </WsText>
              </WsFlex>
            )}

            {item.enter_start_date && item.enter_end_date && (item.enter_start_date == item.enter_end_date) && (
              <WsFlex style={{ marginBottom: 8 }}>
                <WsText size={12} color={$color.gray3d} style={{ width: 100 }}>
                  {t('預計進場日期')}
                </WsText>
                <WsText size={12} color={$color.gray} style={{ marginLeft: 8 }}>
                  {moment(item.enter_end_date).format('YYYY-MM-DD')}
                </WsText>
              </WsFlex>
            )}
            {item.enter_start_time && item.enter_end_time && (
              <WsFlex style={{ marginBottom: 8 }}>
                <WsText size={12} color={$color.gray3d} style={{ width: 100 }}>
                  {t('預計進場時間')}
                </WsText>
                <WsText size={12} color={$color.gray} style={{ marginLeft: 8 }}>
                  {moment(item.enter_start_time).format('HH:mm')}
                  {' - '}
                  {moment(item.enter_end_time).format('HH:mm')}
                </WsText>
              </WsFlex>
            )}
            {/* {item.contractor && (
              <WsFlex style={{ marginBottom: 4 }}>
                <WsText size={12} color={$color.gray3d} style={{ width: 100 }}>
                  {t('承攬商')}
                </WsText>
                <WsText size={12} color={$color.gray} style={{ marginLeft: 8 }}>
                  {item.contractor.name}
                </WsText>
              </WsFlex>
            )} */}
            {item.owner && (
              <WsInfo
                labelWidth={80}
                labelSize={12}
                labelColor={$color.gray}
                labelFontWeight={"400"}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
                label={t('負責人')}
                type="user"
                isUri={true}
                value={item.owner}
              />
            )}
            {item.no_exit_checklists_count !== undefined && (
              <WsFlex style={{ marginBottom: 8 }}>
                <WsText size={12} color={$color.gray3d} style={{ width: 80 }}>
                  {t('未檢查次數')}
                </WsText>
                <WsText size={12} color={$color.gray} style={{ marginLeft: 8 }}>
                  {item.no_exit_checklists_count}
                </WsText>
              </WsFlex>
            )}
            {item.operate_location && (
              <WsFlex>
                <WsText size={12} color={$color.gray3d} style={{ width: 100 }}>
                  {t('作業地點')}
                </WsText>
                <WsText size={12} color={$color.gray} style={{ marginLeft: 8 }}>
                  {item.operate_location}
                </WsText>
              </WsFlex>
            )}
          </WsPaddingContainer>
          {item.notify_at && (
            <WsFlex
              justifyContent="center"
              style={{
                backgroundColor: $_isExpired()
                  ? $color.danger11l
                  : $color.primary10l,
                paddingVertical: 8,
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12,
              }}>
              <WsIcon
                color={$_isExpired() ? $color.danger : $color.primary}
                size={18}
                name="ws-outline-reminder"
              />
              <WsText
                size={12}
                color={$_isExpired() ? $color.danger : $color.primary}
                style={{
                  marginLeft: 8
                }}>
                {moment(item.notify_at).format('YYYY-MM-DD')}
              </WsText>
            </WsFlex>
          )}
        </WsCard>
      )
      }
    </TouchableOpacity >
  )
}
export default LlContractorEnterCard001
