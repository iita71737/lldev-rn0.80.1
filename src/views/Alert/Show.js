import React from 'react'
import { ScrollView, Pressable, View, Dimensions } from 'react-native'
import {
  WsFlex,
  WsBtn,
  WsBtnLeftIconCircle,
  WsPaddingContainer,
  WsIcon,
  WsText,
  WsInfo,
  LlAlertCard001,
  WsGradientButton,
  WsIconBtn,
  WsDialog,
  WsDes
} from '@/components'
import { useSelector } from 'react-redux'
import AsyncStorage from '@react-native-community/async-storage'
import S_Alert from '@/services/api/v1/alert'
import Event from '@/sections/Alert/Show/Event'
import License from '@/sections/Alert/Show/License'
import ExitChecklist from '@/sections/Alert/Show/ExitChecklist'
import AuditRecord from '@/sections/Alert/Show/AuditRecord'
import ChecklistRecord from '@/sections/Alert/Show/ChecklistRecord'
import ContractorEnterRecord from '@/sections/Alert/Show/ContractorEnterRecord'
import ContractorLicense from '@/sections/Alert/Show/ContractorLicense'
import RemindDate from '@/sections/Alert/Show/RemindDate'
import ValidEndDate from '@/sections/Alert/Show/ValidEndDate'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import store from '@/store'
import {
  setRefetchChecker
} from '@/store/data'

const AlertShow = ({ route, navigation }) => {
  const { t, i18n } = useTranslation()
  const { width } = Dimensions.get('window')
  const _stack = navigation.getState().routes

  // REDUX
  const refetchChecker = useSelector(state => state.data.refetchChecker)

  // Params
  const {
    id,
  } = route.params

  // State
  const dialogButtonItems = [
    {
      label: t('取消'),
      onPress: () => {
        setVisible(false)
        if (apiAlert.solved_at) {
          $_unSolveAlert()
        } else {
          $_solveAlert()
        }
      }
    },
    {
      label: t('確定'),
      backgroundColor: $color.primary,
      borderColor: $color.primary10l,
      color: $color.white,
      onPress: () => {
        setVisible(false)
        if (apiAlert.solved_at) {
          $_unSolveAlert()
        } else {
          $_solveAlert()
        }
      }
    }
  ]
  const [visible, setVisible] = React.useState(false)
  const [alert, setAlert] = React.useState()
  const [apiAlert, setApiAlert] = React.useState()

  // Services
  // 取得警示
  const $_fetchAlert = async () => {
    const res = await S_Alert.show(id)
    const _alert = S_Alert.setAlertContent(res)
    setAlert(_alert)
    setApiAlert(res)
  }
  // 排除警示
  const $_solveAlert = async () => {
    try {
      const res = await S_Alert.solveAlert({ alertId: id })
      store.dispatch(setRefetchChecker({
        ...refetchChecker,
        AlertListTab: true
      }))
      navigation.replace('AlertShow', {
        id: res.id
      })
    } catch (e) {
      console.error(e);
    }
  }
  // 恢復警示
  const $_unSolveAlert = async () => {
    try {
      const res = await S_Alert.unSolveAlert({ alertId: id })
      navigation.replace('AlertShow', {
        id: res.id
      })
    } catch (e) {
      console.error(e);
    }
  }

  // Storage
  const $_setStorage = async () => {
    const _value = JSON.stringify({
      relationEvent: apiAlert.event,
      apiAlert: apiAlert,
      alert: alert,
      system_classes: apiAlert.system_classes,
      system_subclasses: apiAlert.system_subclasses
    })
    await AsyncStorage.setItem('TaskCreate', _value)
  }

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <WsIconBtn
            testID="backButton"
            name="md-chevron-left"
            color={$color.white}
            size={32}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              navigation.goBack()
            }}
          />
        )
      },
    })
  }

  React.useEffect(() => {
    $_fetchAlert()
    $_setNavigationOption()
  }, [route, id])

  // Render
  return (
    <>
      {alert && apiAlert && (
        <>
          <ScrollView
            testID="ScrollView"
          >
            <WsPaddingContainer
              style={{
                backgroundColor: apiAlert.solved_at
                  ? $color.white
                  : apiAlert.level == 2
                    ? $color.danger11l
                    : $color.yellow11l,
                marginTop: 8,
                width: width
              }}>
              <WsFlex alignItems="center">
                <WsIcon
                  name="ws-filled-alert"
                  size={48}
                  style={{ marginRight: 10 }}
                  color={apiAlert.level === 2 ? $color.danger : $color.yellow}
                />
                <View>
                  <WsText size={18} style={{}} fontWeight={600}>
                    {apiAlert.solved_at ? t("警示已排除") : t('警示中')}
                  </WsText>

                  <WsPaddingContainer
                    padding={0}
                    style={{
                    }}>
                    <WsInfo
                      labelFontWeight={400}
                      labelSize={12}
                      textSize={12}
                      label={t('發布時間')}
                      value={
                        apiAlert.created_at
                          ? moment(apiAlert.created_at).format('YYYY-MM-DD HH:mm:ss')
                          : null
                      }
                      style={{
                        flexDirection: 'row'
                      }}
                    />

                    {apiAlert.solved_at && (
                      <WsFlex>
                        <WsInfo
                          label={t('排除時間')}
                          labelFontWeight={400}
                          labelSize={12}
                          textSize={12}
                          value={
                            apiAlert.solved_at
                              ? moment(apiAlert.solved_at).format('YYYY-MM-DD HH:mm:ss')
                              : t('未排除')
                          }
                          style={{
                            flexDirection: 'row'
                          }}
                        />
                        {apiAlert.solver && (
                          <WsInfo
                            type="user"
                            label={t('')}
                            value={apiAlert.solver ? apiAlert.solver : null}
                            style={{
                              flexDirection: 'row'
                            }}
                          />
                        )}
                      </WsFlex>
                    )}
                  </WsPaddingContainer>
                </View>
              </WsFlex>
            </WsPaddingContainer>

            <WsPaddingContainer
              style={{
              }}>
              <WsText size={24} fontWeight={600}>{alert.title}</WsText>
            </WsPaddingContainer>

            <WsPaddingContainer
              style={{
                backgroundColor: $color.white,
                marginTop: 8
              }}>
              <WsInfo
                label={t('警示說明')}
                labelSize={18}
                value={alert.info.content}
              />
            </WsPaddingContainer>

            {apiAlert.from == 'event' && (
              <>
                <Event
                  alert={alert}
                  apiAlert={apiAlert}
                  navigation={navigation}
                  route={route}
                />
              </>
            )}
            {apiAlert.from == 'exit_checklist' && (
              <>
                <ExitChecklist
                  alert={alert}
                  apiAlert={apiAlert}
                  navigation={navigation}
                />
              </>
            )}
            {apiAlert.from == 'contractor_enter_record' && (
              <>
                <ContractorEnterRecord
                  alert={alert}
                  apiAlert={apiAlert}
                  navigation={navigation}
                />
              </>
            )}
            {apiAlert.from == 'contractor_license' && (
              <>
                <ContractorLicense
                  alert={alert}
                  apiAlert={apiAlert}
                  navigation={navigation}
                />
              </>
            )}
            {apiAlert.from == 'license' && (
              <>
                {apiAlert.type === 'valid_end_date' && (
                  <>
                    <ValidEndDate
                      alert={alert}
                      apiAlert={apiAlert}
                      navigation={navigation}
                    />
                  </>
                )}
                {apiAlert.type === 'remind_date' && (
                  <>
                    <RemindDate
                      alert={alert}
                      apiAlert={apiAlert}
                      navigation={navigation}
                    />
                  </>
                )}
                {apiAlert.type === 'statitory_extension_period' && (
                  <>
                    <RemindDate
                      alert={alert}
                      apiAlert={apiAlert}
                      navigation={navigation}
                    />
                  </>
                )}
                {!apiAlert.type === 'remind_date' &&
                  !apiAlert.type === 'valid_end_date' && (
                    <>
                      <License alert={alert} apiAlert={apiAlert} />
                    </>
                  )}
              </>
            )}
            {apiAlert.from == 'checklist_record' && (
              <>
                <ChecklistRecord
                  alert={alert}
                  apiAlert={apiAlert}
                  navigation={navigation}
                />
              </>
            )}
            {apiAlert.from == 'audit_record' && (
              <>
                <AuditRecord
                  alert={alert}
                  apiAlert={apiAlert}
                  navigation={navigation}
                  route={route}
                />
              </>
            )}
          </ScrollView>

          <WsFlex
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              backgroundColor: $color.white,
            }}>
            <WsBtnLeftIconCircle
              onPress={() => {
                setVisible(true)
              }}
              style={{
                width: width * 0.425,
                marginRight: 16,
              }}
              borderRadius={24}
              color="transparent"
              icon={
                apiAlert.solved_at
                  ? 'll-nav-alert-filled'
                  : 'ws-filled-alert-cancel'
              }
              borderWidth={1}
              borderColor={
                apiAlert.solved_at
                  ? $color.gray
                  : apiAlert.level == 2
                    ? $color.danger
                    : $color.yellow
              }
              circleColor={
                apiAlert.solved_at
                  ? $color.gray3d
                  : apiAlert.level == 2
                    ? $color.danger
                    : $color.yellow
              }
              iconSize={24}
              textColor={$color.black}
              textSize={14}>
              {apiAlert.solved_at ? t('復原警示') : t('排除警示')}
            </WsBtnLeftIconCircle>

            <WsGradientButton
              style={{
                width: width * 0.425,
              }}
              onPress={() => {
                if (apiAlert.task) {
                  navigation.push('RoutesTask', {
                    screen: 'TaskShow',
                    params: {
                      id: apiAlert.task.id
                    }
                  })
                } else {
                  $_setStorage()
                  try {
                    navigation.push('RoutesTask', {
                      screen: 'TaskCreate',
                      apiAlertId: apiAlert.id,
                      alert: alert,
                      event: apiAlert.event
                    })
                  } catch (error) {

                  }
                }
              }}
              renderLeadingIcon={() => (
                <WsIcon
                  color={$color.white}
                  name={'ll-nav-assignment-filled'}
                  size={24}
                  style={{ marginRight: 8 }}
                />
              )}
            >
              {apiAlert.task ? t('查看任務') : t('建立任務')}
            </WsGradientButton>
          </WsFlex>
        </>
      )}

      <WsDialog
        dialogButtonItems={dialogButtonItems}
        dialogVisible={visible}
        setDialogVisible={() => {
          setVisible(false)
        }}>
        <WsText size={18}>{apiAlert && apiAlert.solved_at ? t('確定復原嗎？') : t('確定排除嗎？')}</WsText>
      </WsDialog>
    </>
  )
}

export default AlertShow
