import React from 'react'
import { View } from 'react-native'

import {
  WsPaddingContainer,
  WsText,
  WsTag,
  WsIconBtn,
  WsTabView,
  WsBottomSheet,
  WsLoading,
  WsFlex,
  WsDialogDelete,
  WsDialog,
  WsState,
  WsAvatar,
  WsInfo,
  LlTopAlertBar001,
  WsIcon
} from '@/components'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import AuditQuestions from '@/sections/Audit/AuditQuestionIndex'
import AuditResult from '@/sections/Audit/AuditResult'
import LlBtn001 from '@/components/LlBtn001'
import $color from '@/__reactnative_stone/global/color'
import ServiceAudit from '@/services/api/v1/audit'
import AsyncStorage from '@react-native-community/async-storage'

const AuditShow = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()

  //params
  const { id, versionId } = route.params

  //state
  const [audit, setAudit] = React.useState(null)
  const [auditLastVersion, setAuditLastVersion] = React.useState()

  const [isLoading, setIsLoading] = React.useState(false)
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [dialogVisible, setDialogVisible] = React.useState(false)
  const [copyDialogVisible, setCopyDialogVisible] = React.useState(false)
  const [copyAuditName, setCopyAuditName] = React.useState()
  const copyDialogButtom = [
    {
      label: t('取消'),
      onPress: () => {
        setCopyDialogVisible(false)
      }
    },
    {
      label: t('確定'),
      onPress: () => {
        $_postCopyAudit()
      }
    }
  ]
  const [templateVersion, setTemplateVersion] = React.useState()
  const [lastTemplateVersion, setLastTemplateVersion] = React.useState()

  //api
  const $_fetchAuditsShow = async () => {
    try {
      setIsLoading(true)
      const resAudit = await ServiceAudit.show({ modelId: id })
      if (resAudit.name) {
        setCopyAuditName(`${resAudit.name}-${'複製'}`)
      }
      if (resAudit && resAudit.last_version) {
        setAuditLastVersion(resAudit.last_version.id)
        $_setTabItems(resAudit.last_version.id)
      }
      if (resAudit && resAudit.last_version && resAudit.last_version.audit_template_version) {
        setTemplateVersion(resAudit.last_version.audit_template_version.id)
        setLastTemplateVersion(resAudit.audit_template.last_version.id)
      }
      setAudit(resAudit)
      $_setStorage()
      setIsLoading(false)
    } catch (e) {
      console.error(e);
    }
  }

  const $_setStorage = async () => {
    const _value = JSON.stringify(audit)
    await AsyncStorage.setItem('AuditUpdate', _value)
    await AsyncStorage.setItem('UpdateAuditTemplate', _value)
  }

  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState()
  const [bottomSheetItems, setBottomSheetItems] = React.useState([
    templateVersion === lastTemplateVersion
      ? {
        onPress: () => {
          navigation.navigate({
            name: 'AuditUpdate',
            params: {
              id: id
            }
          })
        },
        icon: 'ws-outline-edit-pencil',
        label: t('編輯稽核表')
      }
      : {
        onPress: () => {
          navigation.navigate({
            name: 'UpdateAuditTemplate',
            params: {
              modelId: id,
              versionId: auditLastVersion
            }
          })
        },
        label: t('更新稽核表'),
        icon: 'md-update',
        color: $color.gray6d
      },
    {
      onPress: () => {
        setCopyDialogVisible(true)
      },
      icon: 'll-nav-add-assignment',
      label: t('複製稽核表')
    },
    {
      onPress: () => {
        setDialogVisible(true)
      },
      icon: 'md-delete',
      label: t('刪除稽核表')
    }
  ])

  const $_setTabItems = (versionId) => {
    setTabItems([
      {
        value: 'auditQuestion',
        label: t('題目'),
        view: AuditQuestions,
        props: {
          id: id,
          versionId: versionId,
          navigation: navigation
        }
      },
      {
        value: 'AuditResult',
        label: t('記錄列表'),
        view: AuditResult,
        props: {
          id: id,
          versionId: versionId,
          navigation: navigation
        }
      }
    ])
  }

  const $_setBottomSheet = () => {
    setBottomSheetItems([
      templateVersion === lastTemplateVersion
        ? {
          onPress: () => {
            navigation.navigate({
              name: 'AuditUpdate',
              params: {
                id: id
              }
            })
          },
          icon: 'ws-outline-edit-pencil',
          label: t('編輯稽核表')
        }
        : {
          onPress: () => {
            navigation.navigate({
              name: 'UpdateAuditTemplate',
              params: {
                modelId: id,
                versionId: auditLastVersion
              }
            })
          },
          label: t('更新稽核表'),
          icon: 'md-update',
          color: $color.gray6d
        },
      {
        onPress: () => {
          setCopyDialogVisible(true)
        },
        icon: 'll-nav-add-assignment',
        label: t('複製稽核表')
      },
      {
        onPress: () => {
          setDialogVisible(true)
        },
        icon: 'md-delete',
        label: t('刪除稽核表')
      }
    ])
  }

  // Function
  const $_setNavigationOption = () => {
    if (!audit) {
      return
    }
    navigation.setOptions({
      title: audit.name,
      headerRight: () => (
        <WsIconBtn
          name="md-edit"
          color="white"
          size={24}
          style={{
            marginRight: 4
          }}
          onPress={() => {
            $_setStorage()
            setIsBottomSheetActive(true)
          }}
        />
      )
    })
  }

  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
    }
  }

  const _tagsBySystemSubclasses = () => {
    const _tags = []
    if (audit) {
      audit.system_subclasses.forEach(system_subclass => {
        _tags.push({
          icon: system_subclass.icon,
          text: system_subclass.name
        })
      })
    }
    return _tags
  }

  const $_isAuditTemplateUpdate = () => {
    return (
      audit.audit_template.status == 1 &&
      audit.audit_template.last_version.id !=
      audit.last_version.audit_template_version.id
    )
  }

  const $_postCopyAudit = async () => {
    const _copyAudit = await ServiceAudit.copyAudit(id, copyAuditName)
    setCopyDialogVisible(false)
    setTimeout(() => {
      navigation.navigate({
        name: 'AuditShow',
        params: {
          id: _copyAudit.id
        }
      })
    }, 2000)
  }

  React.useEffect(() => {
    $_fetchAuditsShow()
  }, [id, navigation])

  React.useEffect(() => {
    // $_setNavigationOption()  //HIDE_FOR_EDIT
    $_setBottomSheet()
  }, [audit])


  return (
    <>
      {isLoading && (
        <>
          <WsLoading />
        </>
      )}
      {audit && (
        <>
          {templateVersion < lastTemplateVersion && $_isAuditTemplateUpdate() && (
            <LlTopAlertBar001
              onPress={() => {
                navigation.navigate({
                  name: 'UpdateAuditTemplate',
                  params: {
                    modelId: id,
                    versionId: auditLastVersion
                  }
                })
              }}>
              {t('請儘速更新題庫版本，以降低法律風險')}
            </LlTopAlertBar001>
          )}
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white
            }}>
            <WsFlex flexWrap="wrap" justifyContent="space-between">
              <WsText size={24}>{audit.name}</WsText>
              {templateVersion < lastTemplateVersion &&
                $_isAuditTemplateUpdate() && (
                  <WsTag
                    backgroundColor="rgb(255, 247, 208)"
                    textColor={$color.gray6d}>
                    {t('版本更新')}
                  </WsTag>
                )}
            </WsFlex>
            <WsFlex>
              {_tagsBySystemSubclasses().map((tag, tagIndex) => {
                return (
                  <View
                    key={tagIndex}
                    style={{
                      marginRight: 8,
                      alignItems: 'flex-start'
                    }}>
                    {tag.icon && tag.text && (
                      <WsTag
                        style={{
                          marginTop: 8
                        }}
                        img={tag.icon}>
                        {tag.text}
                      </WsTag>
                    )}
                  </View>
                )
              })}
            </WsFlex>
          </WsPaddingContainer>
          {audit.owner && (
            <WsPaddingContainer
              style={{
                marginVertical: 8,
                backgroundColor: $color.white
              }}>
              <WsText
                style={{
                  marginBottom: 16
                }}
                size={14}>
                {t('管理者')}
              </WsText>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  marginBottom: 16
                }}>
                {audit.owner ? (
                  <WsAvatar
                    size={24}
                    source={audit.owner.avatar ? audit.owner.avatar : ''}
                  />
                ) : (
                  <WsAvatar
                    size={24}
                    source={
                      'https://i1.jueshifan.com/7b077d83/78067d8b/31073d8a09acfa4c9c38.png'
                    }
                  />
                )}
                <View
                  style={{
                    marginLeft: 8
                  }}>
                  {audit.owner ? (
                    <WsText color={$color.gray} size={14}>{t(audit.owner.name)}</WsText>
                  ) : (
                    <WsText color={$color.gray} size={14}>{t('曹阿毛')}</WsText>
                  )}
                  <WsText color={$color.gray} size={14}>
                    {t('編輯時間')}
                    {audit.owner
                      ? moment(audit.owner.updated_at).format(
                        'YYYY-MM-DD HH:MM'
                      )
                      : moment().format('YYYY-MM-DD HH:MM')}
                  </WsText>
                </View>
              </View>
            </WsPaddingContainer>
          )}

          {tabItems && (
            <WsTabView
              isAutoWidth={true}
              index={tabIndex}
              setIndex={settabIndex}
              items={tabItems}
            />
          )}

          <WsPaddingContainer
            style={[
              {
                borderTopWidth: 1,
                borderTopColor: $color.white3d,
                backgroundColor: $color.white
              }
            ]}>
            <LlBtn001
              testID={'建立稽核行程'}
              onPress={() => {
                navigation.navigate({
                  name: 'AuditCreateRequest',
                  params: {
                    audit: audit
                  }
                })
              }}>
              <WsFlex
                style={{
                  paddingTop: 2,
                }}
              >
                <WsIcon name={'ll-nav-add-audit'} color={$color.white} size={24}></WsIcon>
                <WsText color={$color.white}> {t('建立稽核行程')}</WsText>
              </WsFlex>
            </LlBtn001>
          </WsPaddingContainer>
          <WsBottomSheet
            isActive={isBottomSheetActive}
            onDismiss={() => {
              setIsBottomSheetActive(false)
            }}
            items={bottomSheetItems}
            onItemPress={$_onBottomSheetItemPress}
          />
        </>
      )}
      <WsDialogDelete
        id={id}
        to="AuditIndex"
        modelName="audit"
        visible={dialogVisible}
        text={t('確定刪除嗎？')}
        setVisible={setDialogVisible}
      />
      <WsDialog
        dialogVisible={copyDialogVisible}
        setDialogVisible={setCopyDialogVisible}
        title={t('複製稽核表')}
        dialogButtonItems={copyDialogButtom}>
        <WsState
          label={t('名稱')}
          value={copyAuditName}
          onChange={setCopyAuditName}
          stateStyle={{ width: 200 }}
        />
      </WsDialog>
    </>
  )
}

export default AuditShow
