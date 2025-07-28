import React from 'react'
import {
  Text,
  Alert,
  View,
  Platform,
  Button,
  Dimensions,
  TouchableOpacity,
  Clipboard
} from 'react-native'
import {
  WsPage,
  WsText,
  WsFlex,
  WsPaddingContainer,
  WsCardBottomSheetMore,
  WsInfo,
  WsBottomSheet,
  WsTag,
  WsIconBtn,
  WsState,
  WsInfiniteScroll,
  WsDialog,
  WsPage002,
  WsPopup,
  WsGradientButton
} from '@/components'
import S_UserFactorySystemSubclass from '@/services/api/v1/user_factory_system_subclass'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import S_User from '@/services/api/v1/user'
import { useTranslation } from 'react-i18next'
import store from '@/store'
import {
  setRefreshCounter
} from '@/store/data'
import { useSelector } from 'react-redux'

const UsersIndex = ({ navigation }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // States
  const [bottomSheetItems002, setBottomSheetItems0002] = React.useState([])
  const [isBottomSheetActive002, setIsBottomSheetActive002] = React.useState(false)

  const [search, setSearch] = React.useState()

  const [allUsers, setAllUsers] = React.useState()
  const [factoryRoles, setFactoryRoles] = React.useState()

  const [bottomSheetItems, setBottomSheetItems] = React.useState([])
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)

  const [selectedUser, setSelectedUser] = React.useState()

  const [forgotPasswordDialogVisible, setForgotPasswordDialogVisible] = React.useState(false)
  const [forgotPasswordDialogButton, setForgotPasswordDialogButton] = React.useState([])

  const [verifyEmailDialogVisible, setVerifyEmailDialogVisible] = React.useState(false)
  const [verifyEmailDialogButton, setVerifyEmailDialogButton] = React.useState([])

  const [temporaryPasswordDialogVisible, setTemporaryPasswordDialogVisible] = React.useState(false)
  const [temporaryPasswordDialogButton, setTemporaryPasswordDialogButton] = React.useState([])
  const [tempPWD, setTempPWD] = React.useState()
  const [temporaryPasswordDialogButton002, setTemporaryPasswordDialogButton002] = React.useState()

  // MEMO
  const __params = React.useMemo(() => {
    const _params = {}
    if (search) {
      _params.search = search
    } else {
      delete _params.search
    }
    return _params
  }, [search, currentRefreshCounter]);

  // Services
  const $_systemSubclassesOnChange = async ($event, item) => {
    const subClassIds = Array.isArray($event)
      ? $event.map(subClass => subClass.id)
      : $event.system_subclasses.map(subClass => subClass.id)
    if (Array.isArray($event)) {
      if (item.user_factory_system_subclasses) {
        S_UserFactorySystemSubclass.update({
          modelId: item.user_factory_system_subclasses.id,
          data: {
            system_classes:
              S_SystemClass.getSystemSubclassIdsBySubclassIds(subClassIds),
            system_subclasses: subClassIds
          }
        })
      } else {
        S_UserFactorySystemSubclass.create({
          parentId: item.id,
          data: {
            system_classes:
              S_SystemClass.getSystemSubclassIdsBySubclassIds(subClassIds),
            system_subclasses: subClassIds
          }
        })
      }
    }
  }

  const $_fetchApi = async () => {
    const res = await S_User.factoryIndex({})
    setAllUsers(res)
  }

  const $_getStatus = item => {
    return S_User.getStatus(item)
  }

  // Function
  const $_setBottomSheetItems = () => {
    setBottomSheetItems0002([
      {
        label: i18next.t('單筆新增'),
        icon: 'md-add',
        onPress: () => {
          navigation.navigate('UsersCreate')
        }
      },
      {
        label: i18next.t('匯入'),
        icon: 'md-add',
        onPress: () => {
        }
      },
    ])
    setBottomSheetItems([
      {
        label: i18next.t('修改成員資訊'),
        icon: 'ws-outline-edit-pencil',
        onPress: () => { }
      },
      {
        label: i18next.t('寄送密碼重置信'),
        icon: 'ws-outline-send',
        onPress: () => {
          setForgotPasswordDialogVisible(true)
        }
      },
      {
        label: i18next.t('重新發送信箱認證信'),
        icon: 'ws-outline-send',
        onPress: () => {
          setVerifyEmailDialogVisible(true)
        }
      },
      {
        label: i18next.t('產生臨時密碼'),
        icon: 'ws-outline-lock',
        onPress: () => {
          setTemporaryPasswordDialogVisible(true)
        }
      },
      {
        label: i18next.t('更多權限設定'),
        icon: 'sc-liff-settings',
        onPress: () => {
          navigation.push('RoutesUsers', {
            screen: 'MoreScopesSetting',
            params: {
              selectedUser: selectedUser
            }
          })
        }
      },
      {
        label: i18next.t('跨單位權限批次設定'),
        icon: 'sc-liff-settings',
        onPress: () => {

        }
      },
      {
        label: i18next.t('跨單位權限查詢'),
        icon: 'sc-liff-settings',
        onPress: () => {

        }
      },
      {
        label: i18next.t('停用此帳號'),
        icon: 'ws-outline-disable',
        onPress: async () => {
          const _disabled = await S_User.disable(selectedUser.id)
        },
        color: $color.danger
      },
      {
        label: i18next.t('刪除此帳號'),
        icon: 'ws-outline-delete',
        onPress: () => { },
        color: $color.danger
      },
      {
        label: i18next.t('申請啟用'),
        icon: 'ws-outline-check-circle-outline',
        onPress: async () => {
          const _restart = await S_User.restart(selectedUser.id)
        }
      },
    ])
  }
  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
    }
  }
  const $_setForgotPasswordDialogButton = () => {
    setForgotPasswordDialogButton([
      {
        label: i18next.t('取消'),
        onPress: () => {
          setForgotPasswordDialogVisible(false)
        }
      },
      {
        label: i18next.t('確定'),
        onPress: async () => {
          console.log(selectedUser.email, 'selectedUser.email');
          const res = await S_User.forgetPassword(selectedUser.email)
          if (res?.message === 'mail sent.') {
            setForgotPasswordDialogVisible(false)
            Alert.alert(t('已寄出密碼重置信'))
          }
        }
      }
    ])
  }
  const $_setVerifyEmailDialogButton = () => {
    setVerifyEmailDialogButton([
      {
        label: i18next.t('取消'),
        onPress: () => {
          setVerifyEmailDialogVisible(false)
        }
      },
      {
        label: i18next.t('確定'),
        onPress: async () => {
          console.log(selectedUser.email, 'selectedUser.email');
          const res = await S_User.verifyEmail(selectedUser.email)
          if (res?.message === 'mail sent.') {
            setVerifyEmailDialogVisible(false)
            Alert.alert(t('已寄出信箱驗證信'))
          }
        }
      }
    ])
  }
  const $_setTempPWDDialogButton = () => {
    setTemporaryPasswordDialogButton([
      {
        label: i18next.t('取消'),
        onPress: () => {
          setTemporaryPasswordDialogVisible(false)
        }
      },
      {
        label: i18next.t('確定'),
        onPress: async () => {
          console.log(selectedUser.email, 'selectedUser.email');
          const res = await S_User.TemporaryPasswordSetting(selectedUser.email)
          if (res?.password) {
            setTempPWD(res?.password)
            setTemporaryPasswordDialogButton002([
              {
                label: i18next.t('取消'),
                onPress: () => {
                  setTemporaryPasswordDialogVisible(false)
                  setTempPWD(null)
                }
              },
              {
                label: i18next.t('複製'),
                onPress: async () => {
                  try {
                    await Clipboard.setString(res?.password);
                    const _string = t(`已複製臨時密碼：{{tempPassword}}`, { tempPassword: res?.password, keySeparator: false })
                    console.log(_string, '_string111');
                    Alert.alert(_string);
                  } catch (error) {
                    console.error('複製文本時出錯:', error);
                  }
                }
              }
            ])
          }
        }
      }
    ])
  }

  // helper
  const $_setRoleValue = user => {
    if (user.name === '蔡A辣') {
      // console.log(JSON.stringify(user), 'user----');
    }
    return [...user.user_factory_roles, ...user.user_factory_role_templates];
  }
  const $_setUserSystemClassScope = (user) => {
    if (user.name === '蔡A辣') {
      // console.log(JSON.stringify(user), 'user--');
    }
    return user.user_factory_system_subclasses?.system_subclasses
  }
  const $_setUserScopeFactories = (user) => {
    if (user.name === '蔡A辣') {
      // console.log(JSON.stringify(user), 'user--');
    }
    return user.user_organization_factory_scopes?.factories
  }

  React.useEffect(() => {
    $_fetchApi()
    $_setBottomSheetItems()
    setTempPWD(null)
  }, [selectedUser])

  React.useEffect(() => {
    $_setForgotPasswordDialogButton()
    $_setVerifyEmailDialogButton()
    $_setTempPWDDialogButton()
  }, [selectedUser])


  // Render
  return (
    <>
      <WsPage
        title={i18next.t('成員管理')}
        iconRight="md-add"
        rightOnPress={() => {
          setIsBottomSheetActive002(true)
        }}
      >
        <>
          <WsPaddingContainer>
            <View>
              <WsText size={18} fontWeight="700" style={{ marginBottom: 8 }}>
                {i18next.t('成員列表')}
              </WsText>
              <WsFlex>
                <WsText style={{ marginRight: 8 }}>
                  {i18next.t('共{number}個成員', {
                    number: allUsers ? allUsers.meta.total : '?'
                  })}
                </WsText>
              </WsFlex>
            </View>
            <View>
              <WsState
                style={{
                  marginTop: 8
                }}
                type="search"
                placeholder={t('搜尋')}
                value={search}
                onChange={setSearch}
              >
              </WsState>
            </View>
          </WsPaddingContainer>
          <WsInfiniteScroll
            serviceIndexKey="factoryIndex"
            service={S_User}
            params={__params}
            renderItem={({ item, index }) => {
              const status = $_getStatus(item)
              const _systemClasses = item.user_factory_system_subclasses
                ? {
                  system_subclasses:
                    item.user_factory_system_subclasses.system_subclasses.map(
                      subClass => subClass.id
                    )
                }
                : []
              const user = {
                ...item,
                name: item.name,
                avatar: item.avatar,
                id: item.id,
                email: item.email,
                status: status,
                user_factory_role_templates: [...item.user_factory_roles, ...item.user_factory_role_templates],
                user_factory_system_subclass: _systemClasses?.system_subclasses
              }
              return (
                <>
                  <WsCardBottomSheetMore
                    // moreText={i18next.t('更多權限設定')}
                    // bottomSheetItems={bottomSheetItems}
                    style={{
                      marginTop: index == 0 ? 0 : 8,
                      marginHorizontal: 16,
                      borderRadius: 10
                    }}
                  // onPress={() => {
                  //   navigation.navigate('MoreScopesSetting')
                  // }}
                  >
                    <WsFlex style={{ marginBottom: 8 }}>
                      <WsInfo
                        type="user"
                        value={user}
                        style={{ flex: 1 }}
                        isUri={true}
                        des={item.email}
                      />
                      <WsTag
                        textColor={
                          status == 'disabled'
                            ? $color.white
                            : status == 'inviting' || status == 'no_use'
                              ? $color.gray5d
                              : status == 'using'
                                ? $color.green
                                : $color.primary
                        }
                        backgroundColor={
                          status == 'disabled'
                            ? $color.gray3d
                            : status == 'inviting'
                              ? $color.yellow11l
                              : status == 'no_use'
                                ? $color.gray5l
                                : status == 'using'
                                  ? $color.green11l
                                  : $color.primary11l
                        }>
                        {status == 'disabled'
                          ? i18next.t('停用中')
                          : status == 'inviting'
                            ? i18next.t('邀請中')
                            : status == 'no_use'
                              ? i18next.t('未啟用')
                              : status == 'using'
                                ? i18next.t('使用中')
                                : i18next.t('無')}
                      </WsTag>
                      <WsIconBtn
                        name="md-more-vert"
                        size={24}
                        style={{ marginLeft: 16 }}
                        onPress={() => {
                          setIsBottomSheetActive(true)
                          setSelectedUser({
                            ...user,
                          })
                        }}
                      />
                    </WsFlex>
                    <WsState
                      label={t('角色設定')}
                      placeholder={i18next.t('角色設定')}
                      style={{
                      }}
                      type="multipleBelongstomany"
                      value={$_setRoleValue(item)}
                      onChange={setFactoryRoles}
                      innerLabel={[t('預設角色'), t('自訂角色')]}
                      hasMeta={false}
                      getAll={true}
                      params={{
                        get_all: 1
                      }}
                      // modelName={['user_role', 'user_factory_role']}
                      modelName={['user_role', 'user_factory_role_template']}
                    />

                    {(status == 'inviting' || status == 'using') && (
                      <>
                        <WsState
                          style={{
                            marginTop: 8
                          }}
                          label={t('限閱領域')}
                          placeholder={t('限閱領域')}
                          type="modelsSystemClass"
                          value={$_setUserSystemClassScope(item)}
                          onChange={$event => {
                            $_systemSubclassesOnChange($event, item)
                          }}
                        />
                      </>
                    )}

                    <WsState
                      label={t('限閱轄下單位')}
                      placeholder={t('請設定限閱轄下單位')}
                      style={{
                        marginTop: 16
                      }}
                      type="belongstomany002"
                      nameKey={'name'}
                      serviceIndexKey={'indexAll'}
                      modelName={'factory'}
                      value={$_setUserScopeFactories(item)}
                      onChange={(e) => {
                        console.log(e, 'eeeeee');
                      }}
                    />

                  </WsCardBottomSheetMore>
                </>
              )
            }}
          />
        </>
      </WsPage>

      <WsBottomSheet
        isActive={isBottomSheetActive002}
        onDismiss={() => {
          setIsBottomSheetActive002(false)
        }}
        items={bottomSheetItems002}
        onItemPress={$_onBottomSheetItemPress}
        snapPoints={[148, 200]}
      />

      <WsBottomSheet
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        items={bottomSheetItems}
        onItemPress={$_onBottomSheetItemPress}
        snapPoints={[148, 550]}
      />

      <WsDialog
        dialogVisible={forgotPasswordDialogVisible}
        setDialogVisible={setForgotPasswordDialogVisible}
        title={i18next.t('確認要寄送密碼重置信給此成員嗎？')}
        contentWidth={width * 0.9}
        dialogButtonItems={forgotPasswordDialogButton}
        mode={3}
      >
        <>
          <WsFlex
            style={{
              marginTop: 16,
            }}>
            <WsText size={14}>
              {i18next.t('此成員將在電子信箱收到信件，並進行密碼重置流程。')}
            </WsText>
          </WsFlex>
          <WsInfo
            type="user"
            value={selectedUser}
            isUri={true}
            des={selectedUser?.email}
          />
        </>
      </WsDialog>

      <WsDialog
        dialogVisible={verifyEmailDialogVisible}
        setDialogVisible={setVerifyEmailDialogVisible}
        title={i18next.t('確認要寄送信箱認證信給此成員嗎？')}
        contentWidth={width * 0.9}
        dialogButtonItems={verifyEmailDialogButton}
        mode={3}
      >
        <>
          <WsFlex
            style={{
              marginTop: 16,
            }}>
            <WsText size={14}>
              {i18next.t('此成員將在電子信箱收到信件，並進行信箱認證流程。')}
            </WsText>
          </WsFlex>
          <WsInfo
            type="user"
            value={selectedUser}
            isUri={true}
            des={selectedUser?.email}
          />
        </>
      </WsDialog>

      <WsDialog
        dialogVisible={temporaryPasswordDialogVisible}
        setDialogVisible={setTemporaryPasswordDialogVisible}
        title={tempPWD ? t('臨時密碼') : t('確認要產生臨時密碼嗎？')}
        contentWidth={width * 0.9}
        dialogButtonItems={tempPWD ? temporaryPasswordDialogButton002 : temporaryPasswordDialogButton}
        mode={3}
      >
        <>
          <WsFlex
            style={{
              marginTop: 16,
            }}>
            <WsText
              size={14}
            >
              {tempPWD ? t("請將此組臨時密碼「{{tempPassword}}」複製並傳給該成員。", { tempPassword: tempPWD }) : t('產生臨時密碼後，成員無法使用舊密碼登入系統。')}
            </WsText>
          </WsFlex>
          {tempPWD && (
            <WsInfo
              type="user"
              value={selectedUser}
              isUri={true}
              des={selectedUser?.email}
            />
          )}
        </>
      </WsDialog>
    </>
  )
}

export default UsersIndex
