import React, { useState, useEffect } from 'react'
import {
  Text,
  View,
  ScrollView,
  Alert,
} from 'react-native'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import {
  WsPaddingContainer,
  WsGradientButton,
  WsText,
  WsInfo,
  WsFlex,
  WsBtn,
  WsIconBtn,
  WsState
} from '@/components'
import S_ContractorEnterRecord from '@/services/api/v1/contractor_enter_record'
import { useTranslation } from 'react-i18next'
import S_ExitChecklistAssignment from '@/services/api/v1/exit_checklist_assignment'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

const ExitChecklistIntroduction = ({ route, navigation }) => {
  const { t, i18n } = useTranslation()

  // Params
  const {
    enterDate,
    apiAlertId,
    id,
  } = route.params

  // State
  const [remark, setRemark] = React.useState()
  const [enterStatus, setEnterStatus] = React.useState('in_progress')
  const [exitChecklistAssignment, setExitChecklistAssignment] = React.useState()

  // Services
  const $_fetchExitChecklistAssignment = async () => {
    const res = await S_ExitChecklistAssignment.show(id)
    setExitChecklistAssignment(res)
  }

  // Function
  const $_setEnterTime = (start, end) => {
    const _start = moment(start).format('HH:mm')
    const _end = moment(end).format('HH:mm')
    return `${_start} - ${_end}`
  }

  React.useEffect(() => {
    $_fetchExitChecklistAssignment()
  }, [])

  // Render
  return (
    <>
      {exitChecklistAssignment && (
        <>

          <KeyboardAwareScrollView
            extraScrollHeight={60}
            style={{
              flex: 1, // DO NOT CLEAN
              backgroundColor: $color.white,
            }}
            contentContainerStyle={[
              {
              }
            ]}>
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white,
                flex: 1,
              }}>
              <WsText size={24} letterSpacing={0.6} fontWeight="700">
                {exitChecklistAssignment.task_content}
              </WsText>
              <WsInfo
                label={t('進場日期')}
                style={{
                  marginTop: 24,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
                value={
                  exitChecklistAssignment.enter_start_time
                    ? moment(exitChecklistAssignment.enter_start_time).format(
                      'YYYY-MM-DD'
                    )
                    : null
                }
              />
              <WsInfo
                label={t('進場時間')}
                style={{
                  marginTop: 8,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
                value={
                  exitChecklistAssignment.enter_start_time
                    ? $_setEnterTime(
                      exitChecklistAssignment.enter_start_time,
                      exitChecklistAssignment.enter_end_time
                    )
                    : null
                }
              />
              {exitChecklistAssignment.exit_checklists &&
                exitChecklistAssignment.exit_checklists[0] &&
                exitChecklistAssignment.exit_checklists[0].checked_at && (
                  <WsFlex
                    alignItems={'flex-start'}
                    style={{
                      marginTop: 24,
                      marginHorizontal: 8
                    }}>
                    <WsInfo
                      label={t('檢查時間')}
                      value={
                        exitChecklistAssignment.exit_checklists[0].checked_at
                          ? moment(
                            exitChecklistAssignment.exit_checklists[0].checked_at
                          ).format('YYYY-MM-DD  HH:mm')
                          : null
                      }
                    />
                  </WsFlex>
                )}
              <WsInfo
                label={t('承攬商')}
                style={{
                  marginTop: 8,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
                value={
                  exitChecklistAssignment.contractor
                    ? exitChecklistAssignment.contractor.name
                    : null
                }
              />
              <WsInfo
                label={t('工作內容')}
                style={{
                  marginTop: 8,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
                value={
                  exitChecklistAssignment.task_content
                    ? exitChecklistAssignment.task_content
                    : null
                }
              />
              <WsInfo
                label={t('工作地點')}
                style={{
                  marginTop: 8,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
                value={
                  exitChecklistAssignment.operate_location
                    ? exitChecklistAssignment.operate_location
                    : null
                }
              />
              <WsInfo
                label={t('負責人')}
                style={{
                  marginTop: 8,
                  flexDirection: 'row',
                  alignItems: 'center'
                }}
                type="user"
                value={exitChecklistAssignment.owner}
                isUri={true}
              />
              <WsState
                type={"radio"}
                label={t('進場狀態變更')}
                items={[
                  { label: t('進行中'), value: 'in_progress' },
                  { label: t('展延中'), value: 'deferred' },
                  { label: t('已完工'), value: 'complete' },
                  { label: t('已停工'), value: 'suspend' }
                ]}
                value={enterStatus}
                onChange={setEnterStatus}
                remindColor={$color.gray}
                remindBtnDisabled={true}
                remind={t('進廠展延：系統將持續每日發送收工檢查表，直到停工或完工。')}
                style={{
                  marginTop: 16,
                }}
              ></WsState>
              <WsState
                testID={'備註'}
                label={t('備註')}
                labelIcon={'ws-outline-edit-pencil'}
                autoFocus={true}
                multiline={true}
                style={{
                  marginTop: 16
                }}
                value={remark}
                onChange={setRemark}
                rules={enterStatus === 'deferred' ? 'required' : false}
              />

            </WsPaddingContainer>
          </KeyboardAwareScrollView>

          <View style={{ backgroundColor: $color.white }}>
            <WsGradientButton
              testID={'開始'}
              borderRadius={30}
              style={{
                marginBottom: 16
              }}
              onPress={() => {
                if (enterStatus === 'deferred' && !remark) {
                  Alert.alert('備註尚未填寫')
                  return
                }
                navigation.navigate('ExitChecklistProcedure', {
                  enterDate: enterDate,
                  _exit_checklist_assignment: exitChecklistAssignment,
                  _enterStatus: enterStatus,
                  _remark: remark,
                })
              }}>
              {t('開始')}
            </WsGradientButton>
          </View>
        </>
      )
      }

    </>
  )
}

export default ExitChecklistIntroduction
