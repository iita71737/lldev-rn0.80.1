import React, { useState, useEffect } from 'react'
import { View, ScrollView } from 'react-native'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import {
  WsPaddingContainer,
  WsText,
  WsInfo,
  WsFlex,
  WsBtn,
  WsTag
} from '@/components'
import S_ExitChecklist from '@/services/api/v1/exit_checklist'
import { useTranslation } from 'react-i18next'

const ExitChecklistShow = ({ route }) => {
  const { t, i18n } = useTranslation()

  // Params
  const { id } = route.params

  // State
  const [exitChecklist, setExitChecklist] = React.useState()

  // Service
  const $_fetchExitChecklist = async () => {
    try {
      const res = await S_ExitChecklist.show(id)
      setExitChecklist(res)
    } catch (e) {
      console.error(e);
    }
  }

  // HELPER
  const $_setEnterTime = (start, end) => {
    const _start = moment(start).format('HH:mm')
    const _end = moment(end).format('HH:mm')
    return `${_start} - ${_end}`
  }

  React.useEffect(() => {
    if (id) {
      $_fetchExitChecklist()
    }
  }, [id])

  // Render
  return (
    <ScrollView>
      {exitChecklist && (
        <>
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white,
              marginBottom: 8
            }}>
            {exitChecklist.enter_date && (
              <WsInfo
                labelWidth={100}
                label={t("進場日期")}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                value={
                  exitChecklist.enter_date
                    ? moment(exitChecklist.enter_date).format('YYYY-MM-DD')
                    : null
                }
              />
            )}
            {exitChecklist.enter_start_time && (
              <WsInfo
                labelWidth={100}
                label="進場時間"
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8
                }}
                value={
                  exitChecklist.enter_start_time
                    ? $_setEnterTime(
                      exitChecklist.enter_start_time,
                      exitChecklist.enter_end_time
                    )
                    : null
                }
              />
            )}
            {exitChecklist.contractor && (
              <WsInfo
                labelWidth={100}
                label={t('承攬商')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8
                }}
                value={
                  exitChecklist.contractor
                    ? exitChecklist.contractor.name
                    : null
                }
              />
            )}
            {exitChecklist.task_content && (
              <WsInfo
                labelWidth={100}
                label={t('工作內容')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8
                }}
                value={
                  exitChecklist.task_content
                    ? exitChecklist.task_content
                    : null
                }
              />
            )}
            {exitChecklist.operate_location && (
              <WsInfo
                labelWidth={100}
                label={t('工作地點')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8
                }}
                value={
                  exitChecklist.operate_location
                    ? exitChecklist.operate_location
                    : null
                }
              />
            )}
            {exitChecklist.checked_at && (
              <WsInfo
                labelWidth={100}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8
                }}
                label={t('負責人')}
                type="user"
                isUri={true}
                value={exitChecklist.owner}
                des={moment(exitChecklist.checked_at).format('YYYY-MM-DD HH:mm')}
              />
            )}
            {exitChecklist.checked_at && (
              <WsInfo
                labelWidth={100}
                label={t('檢查時間')}
                type={"dateTime"}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8
                }}
                value={
                  exitChecklist.checked_at
                    ? exitChecklist.checked_at
                    : null
                }
              />
            )}
            <WsFlex
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 8
              }}>
              <WsText size={14} fontWeight={'600'} style={{ width: 108 }}>
                {t('進場狀態')}
              </WsText>
              {exitChecklist &&
                exitChecklist.enter_status ? (
                <WsFlex style={{ marginRight: 4 }}>
                  <WsTag
                    backgroundColor={S_ExitChecklist.getEnterStatusBgc(exitChecklist.enter_status)}
                    textColor={S_ExitChecklist.getEnterStatusTextColor(exitChecklist.enter_status)}>
                    {t(S_ExitChecklist.getEnterStatusText(exitChecklist.enter_status))}
                  </WsTag>
                </WsFlex>
              ) : (
                <WsFlex style={{ marginRight: 4 }}>
                  <WsTag backgroundColor={$color.white2d} textColor={$color.black}>
                    {t('無進場')}
                  </WsTag>
                </WsFlex>
              )}
            </WsFlex>
            {exitChecklist.remark && (
              <WsInfo
                labelWidth={100}
                label={t('備註')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8
                }}
                value={
                  exitChecklist.remark
                    ? exitChecklist.remark
                    : null
                }
              />
            )}
          </WsPaddingContainer>

          <WsPaddingContainer
            style={{
              backgroundColor: $color.white,
              marginBottom: 8
            }}>
            <WsFlex
              style={{
                justifyContent: 'space-between',
              }}
            >
              {exitChecklist.enter_score && (
                <>
                  <WsText>{t('本日有無進場')}</WsText>
                  <WsFlex>
                    <WsTag
                      borderRadius={16}
                      iconColor={
                        exitChecklist.enter_score == 36 ? $color.green : $color.danger
                      }
                      icon={
                        exitChecklist.enter_score == 36
                          ? 'ws-filled-check-circle'
                          : 'ws-filled-cancel'
                      }
                      backgroundColor={
                        exitChecklist.enter_score == 36
                          ? $color.green11l
                          : $color.danger11l
                      }
                      textColor={
                        exitChecklist.enter_score == 36
                          ? $color.gray3d
                          : $color.danger
                      }>
                      {exitChecklist.enter_score == 36 ? t('有') : t('無')}
                    </WsTag>
                  </WsFlex>
                </>
              )}
            </WsFlex>

            {exitChecklist.file_enter_attaches &&
              exitChecklist.file_enter_attaches.length > 0 && (
                <WsInfo
                  style={{
                    marginTop: 16
                  }}
                  label={t('入廠簽到資料')}
                  type="filesAndImages"
                  value={exitChecklist.file_enter_attaches}
                />
              )}
          </WsPaddingContainer>

          {exitChecklist.exit_check_item_score != undefined && (
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white,
                marginBottom: 8
              }}>
              <>
                <WsFlex
                  style={{
                    justifyContent: 'space-between',
                    alignItems: 'flex-start'
                  }}
                >
                  <WsInfo
                    label={t('復歸事項')}
                    value={
                      exitChecklist.exit_check_item
                        ? exitChecklist.exit_check_item
                        : null
                    }
                  />
                  <WsTag
                    borderRadius={16}
                    iconColor={
                      exitChecklist.exit_check_item_score == 46
                        ? $color.green
                        : exitChecklist.exit_check_item_score == 0 ?
                          $color.gray
                          : $color.danger
                    }
                    icon={
                      exitChecklist.exit_check_item_score == 46
                        ? 'ws-filled-check-circle'
                        : exitChecklist.exit_check_item_score == 0 ?
                          'sc-liff-help-circle'
                          : 'ws-filled-cancel'
                    }
                    backgroundColor={
                      exitChecklist.exit_check_item_score == 46
                        ? $color.green11l
                        : exitChecklist.exit_check_item_score == 0 ?
                          $color.white2d
                          : $color.danger11l
                    }
                    textColor={
                      exitChecklist.exit_check_item_score == 46
                        ? $color.gray3d
                        : exitChecklist.exit_check_item_score == 0 ?
                          $color.gray
                          : $color.danger
                    }>
                    {exitChecklist.exit_check_item_score == 46
                      ? t('已復歸')
                      : exitChecklist.exit_check_item_score == 0 ?
                        t('尚未評估')
                        : t('未復歸')
                    }
                  </WsTag>
                </WsFlex>
              </>
              {exitChecklist.exit_check_item_remark && (
                <WsInfo
                  style={{
                    marginTop: 16,
                  }}
                  label={t('備註')}
                  value={exitChecklist.exit_check_item_remark ? exitChecklist.exit_check_item_remark : t('無')}
                />
              )}

              {/* {exitChecklist.exit_check_item_attaches &&
                exitChecklist.exit_check_item_attaches.length > 0 && (
                  <WsInfo
                    style={{
                      marginTop: 16
                    }}
                    label={t('現場復歸照片或相關資料')}
                    type="files"
                    value={exitChecklist.exit_check_item_attaches}
                  />
                )} */}

              {exitChecklist.file_exit_check_item_attaches &&
                exitChecklist.file_exit_check_item_attaches.length > 0 && (
                  <WsInfo
                    style={{
                      marginTop: 16
                    }}
                    label={t('現場復歸照片或相關資料')}
                    type="filesAndImages"
                    value={exitChecklist.file_exit_check_item_attaches}
                  />
                )}
            </WsPaddingContainer>
          )}

          {exitChecklist.final_check_score != undefined && (
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white,
                marginBottom: 8
              }}>
              <WsFlex
                style={{
                  justifyContent: 'space-between',
                }}
              >
                <WsText>{t('今日全部收工且復歸')}</WsText>
                <WsFlex>
                  <WsTag
                    borderRadius={16}
                    iconColor={
                      exitChecklist.final_check_score == 56
                        ? $color.green
                        : exitChecklist.final_check_score == 0
                          ? $color.gray
                          : $color.danger
                    }
                    icon={
                      exitChecklist.final_check_score == 56
                        ? 'ws-filled-check-circle'
                        : exitChecklist.final_check_score == 0
                          ? 'sc-liff-help-circle'
                          : 'ws-filled-cancel'
                    }
                    backgroundColor={
                      exitChecklist.final_check_score == 56
                        ? $color.green11l
                        : exitChecklist.final_check_score == 0
                          ? $color.white2d
                          : $color.danger11l
                    }
                    textColor={
                      exitChecklist.final_check_score == 56
                        ? $color.gray3d
                        : exitChecklist.final_check_score == 0
                          ? $color.gray
                          : $color.danger
                    }>
                    {exitChecklist.final_check_score == 56 ? '是' : '否'}
                  </WsTag>
                </WsFlex>
              </WsFlex>

              {exitChecklist.final_check_remark && (
                <WsInfo
                  style={{
                    marginTop: 16,
                  }}
                  label={t('備註')}
                  value={exitChecklist.final_check_remark ? exitChecklist.final_check_remark : t('無')}
                />
              )}

              {/* {exitChecklist.final_check_attaches &&
                exitChecklist.final_check_attaches.length > 0 && (
                  <WsInfo
                    style={{
                      marginTop: 16
                    }}
                    label={t('現場復歸照片或相關資料')}
                    type="files"
                    value={exitChecklist.final_check_attaches}
                  />
                )} */}

              {exitChecklist.file_final_check_attaches &&
                exitChecklist.file_final_check_attaches.length > 0 && (
                  <WsInfo
                    style={{
                      marginTop: 16
                    }}
                    label={t('現場復歸照片或相關資料')}
                    type="filesAndImages"
                    value={exitChecklist.file_final_check_attaches}
                  />
                )}
            </WsPaddingContainer>
          )}
        </>
      )
      }
    </ScrollView >
  )
}

export default ExitChecklistShow
