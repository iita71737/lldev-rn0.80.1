import React from 'react'
import {
  View,
  Pressable,
  ScrollView,
  Modal,
  StyleSheet,
  Text
} from 'react-native'
import {
  WsInfoForm,
  WsFlex,
  WsInfo,
  WsPaddingContainer,
  WsModal,
  WsVersionHistory,
  LlBtn002,
  WsText,
  LlNavButton002
} from '@/components'
import S_Change from '@/services/api/v1/change'
import $color from '@/__reactnative_stone/global/color'
import changeFields from '@/models/change'
import moment from 'moment'
import i18next from 'i18next'
import { useNavigation } from '@react-navigation/native'

const ChangePlanData = props => {
  const navigation = useNavigation()

  // Props
  const { id } = props

  // State
  const [stateModal, setStateModal] = React.useState(false)
  const [change, setChange] = React.useState()

  const [infoValue, setInfoValue] = React.useState({})
  const [infoFields, setInfoFields] = React.useState({})
  const [tasks, setTasks] = React.useState()

  // Services
  const $_fetchChange = async () => {
    const res = await S_Change.show(id)
    setChange(res)
    setTasks(res.last_version.tasks)
  }

  // Function
  const $_setInfoData = () => {
    setInfoFields({
      owner: {
        label: i18next.t('負責人'),
        type: 'user',
      },
      version_number: {
        label: i18next.t('版本'),
        type: 'text',
      },
      created_at: {
        label: i18next.t('建立日期'),
        type: 'date'
      },
      expired_date: {
        label: i18next.t('到期日'),
        type: 'date'
      }
    })
    setInfoValue({
      owner: change.last_version && change.last_version.owner ? change.last_version.owner : null,
      version_number: change.versions_number ? `ver.${change.versions_number}` : change.last_version && change.last_version.version_number ? `ver.${change.last_version.version_number}` : null,
      created_at: change.created_at ? moment(change.created_at).format('YYYY-MM-DD') : null,
      expired_date: change.last_version && change.last_version.expired_date ? moment(change.last_version.expired_date).format('YYYY-MM-DD') : null
    })
  }

  const $_setFields = () => {
    let _fields = {}
    const showFields = [
      'owner',
      'version_number',
      'updated_at',
      'expired_date',
      'attaches',
      'file_attaches'
    ]
    const fields = changeFields.getFields()
    showFields.forEach(showField => {
      for (let key in fields) {
        if (key == showField) {
          _fields = {
            ..._fields,
            [key]: fields[key]
          }
        }
      }
    })
    return _fields
  }

  React.useEffect(() => {
    $_fetchChange()
  }, [])

  React.useEffect(() => {
    if (change) {
      $_setInfoData()
    }
  }, [change])

  return (
    <>
      {change && (
        <>
          <ScrollView
            testID={'ScrollView'}
          >
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white,
                marginBottom: 8
              }}>
              <WsInfo
                labelWidth={80}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                value={`ver.${change.last_version.version_number}`}
                label={i18next.t('版本')}
              />
              <WsInfo
                labelWidth={80}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8
                }}
                type="user"
                value={change.last_version.owner}
                isUri={true}
                label={i18next.t('負責人')}
              />
              <WsInfo
                labelWidth={80}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8
                }}
                type="date"
                value={change.created_at ? moment(change.created_at).format('YYYY-MM-DD') : null}
                label={i18next.t('建立日期')}
              />
              <WsInfo
                labelWidth={80}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 8
                }}
                type="date"
                value={change.last_version && change.last_version.expired_date ? moment(change.last_version.expired_date).format('YYYY-MM-DD') : null}
                label={i18next.t('到期日')}
              />
            </WsPaddingContainer>

            <WsPaddingContainer>
              {change.last_version.file_attaches.length > 0 && (
                <WsInfo
                  type="filesAndImages"
                  value={change.last_version.file_attaches}
                  label={i18next.t('附件')}
                />
              )}
              {change.versions_number > 1 && (
                <>
                  <WsPaddingContainer
                    style={{
                      backgroundColor: $color.primary11l
                    }}>
                    <LlBtn002
                      onPress={() => {
                        setStateModal(true)
                      }}>
                      {i18next.t('查看歷史版本')}
                    </LlBtn002>
                  </WsPaddingContainer>
                </>
              )}
            </WsPaddingContainer>

            {tasks && tasks.length > 0 && (
              <View
                style={{
                  marginBottom: 16,
                  paddingHorizontal: 16
                }}>
                <WsText fontWeight={'600'}>{i18next.t('相關任務')}</WsText>
                <LlNavButton002
                  backgroundColor={$color.white}
                  iconLeft={'ll-nav-assignment-filled'}
                  iconLeftColor={$color.primary}
                  onPress={() => {
                    navigation.push('RoutesTask', {
                      screen: 'TaskShow',
                      params: {
                        id: tasks[0].id
                      }
                    })
                  }}>
                  {i18next.t('相關任務')}
                </LlNavButton002>
              </View>
            )}

            <WsModal
              title={i18next.t('變動計畫歷史版本')}
              visible={stateModal}
              headerLeftOnPress={() => {
                setStateModal(false)
              }}>
              <WsVersionHistory
                modelName="change_version"
                versionId={change.last_version.id}
                fields={$_setFields()}
                nameKey="version_number"
                params={{
                  changeId: change.id,
                  order_by: 'updated_at',
                  order_way: 'desc'
                }}
              />
            </WsModal>
          </ScrollView>
        </>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  }
});

export default ChangePlanData
