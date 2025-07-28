import React from 'react'
import { Pressable, ScrollView, View, Alert } from 'react-native'
import {
  WsFlex,
  WsTag,
  WsBtn,
  WsText,
  WsPaddingContainer,
  WsInfo,
  WsGradientButton
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_ChangeAssignment from '@/services/api/v1/change_assignment'
import S_Change from '@/services/api/v1/change'
import { useTranslation } from 'react-i18next'

const ChangeAssignmentIntroduction = ({ route, navigation }) => {
  const { t, i18n } = useTranslation()

  // Params
  const { id, changeAssignmentId } = route.params

  // State
  const [loading, setLoading] = React.useState(true)
  const [assignment, setAssignment] = React.useState()
  const [change, setChange] = React.useState()

  // Services
  const $_fetchAssignmentAndChange = async () => {
    try {
      const _change = await S_Change.show(id)
      setChange(_change)
      if (changeAssignmentId) {
        const _params = {
          change_version: changeAssignmentId
        }
        const res = await S_ChangeAssignment.show({ params: _params })
        setAssignment(res)
      } else if (_change && _change.last_version && _change.last_version.id) {
        const _params = {
          change_version: _change.last_version.id
        }
        const res = await S_ChangeAssignment.index({ params: _params })
        setAssignment(res.data[0])
      }
      setLoading(false)
    } catch (e) {
      console.error(e)
      Alert.alert('獲取資料失敗')
    }
  }

  React.useEffect(() => {
    $_fetchAssignmentAndChange()
  }, [id])

  return (
    <>
      <ScrollView>
        {assignment && change && (
          <>
            <WsPaddingContainer
              style={{ backgroundColor: $color.white }}>

              {change && change.name && (
                <WsText size={24} style={{ marginVertical: 24 }}>
                  {t('變動評估')}-{change.name}
                </WsText>
              )}

              <WsInfo
                type="user"
                label={t('負責人')}
                isUri={true}
                value={change.last_version.owner}
                style={{ marginVertical: 8 }}
              />

              {change.last_version &&
                change.last_version.version_number && (
                  <WsInfo
                    label={t('版本')}
                    value={`Ver.${change.last_version.version_number}`}
                    style={{ marginVertical: 8 }}
                  />
                )}

              {change.last_version &&
                change.last_version.expired_date && (
                  <WsInfo
                    type={'date'}
                    label={t('到期日')}
                    value={change.last_version.expired_date}
                    style={{ marginVertical: 8 }}
                  />
                )}

              <WsFlex
                justifyContent="space-between"
              >
                <WsInfo
                  type="user"
                  isUri={true}
                  label={t('評估人員')}
                  value={assignment.evaluator}
                  style={{
                    flex: 1
                  }}
                />
                {assignment.system_subclass &&
                  assignment.system_subclass.name && (
                    <WsInfo
                      label={t('評估領域')}
                      value={assignment.system_subclass.name}
                      style={{
                        flex: 1
                      }}
                    />
                  )}
              </WsFlex>
              {change.last_version.attaches &&
                change.last_version.attaches.length != 0 && (
                  <WsInfo
                    value={change.last_version.attaches}
                    label={t('附件')}
                    type="files"
                  />
                )}
            </WsPaddingContainer>
          </>
        )}
      </ScrollView>
      <WsGradientButton
        style={{
          bottom: 16
        }}
        borderRadius={28}
        disabled={loading}
        onPress={() => {
          navigation.push('RoutesChange', {
            screen: 'ChangeAssignmentPreview',
            params: {
              name: change && change.name,
              changeId: change && change.id,
              changeVersionId: change && change.last_version ? change.last_version.id : null,
              systemSubclass: assignment && assignment.system_subclass ? assignment.system_subclass : null
            }
          })
        }}>
        {t('開始')}
      </WsGradientButton>
    </>
  )
}

export default ChangeAssignmentIntroduction
