import React from 'react'
import {
  Pressable,
  ScrollView,
  Image,
  View,
  Dimensions,
  Alert
} from 'react-native'
import {
  WsStepsTab,
  WsTabView,
  WsText,
  WsPaddingContainer,
  LlNavButton001,
  WsInfo,
  WsIconBtn,
  WsIcon,
  WsStateFormView,
  WsState,
  WsTag
} from '@/components'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import { TouchableOpacity } from 'react-native-gesture-handler'
import $config from '@/__config'
import S_User from '@/services/api/v1/user'
import S_UserFactoryRole from '@/services/api/v1/user_factory_role'
import store from '@/store'
import { setCurrentUser } from '@/store/data'
import S_API_Auth from '@/__reactnative_stone/services/api/v1/auth'

const MyAccountSettings = ({ navigation }) => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language
  const { width, height } = Dimensions.get('window')


  // Redux
  const factoryId = useSelector(state => state.data.currentFactory.id)
  const currentOrganization = useSelector(
    state => state.data.currentOrganization
  )
  const currentViewMode = useSelector(state => state.data.currentViewMode)
  const currentUser = useSelector(state => state.data.currentUser)

  // States
  const [mySubClasses, setMySubClasses] = React.useState()
  const [myRoles, setMyRoles] = React.useState()
  // Services
  const $_changeAvatar = event => {
    if (event) {
      const _currentUser = {
        ...currentUser,
        avatar: event
      }
      $_updateUserAvatar(event)
      store.dispatch(setCurrentUser(_currentUser))
    }
  }

  const $_updateUserAvatar = async event => {
    try {
      const res = await S_API_Auth.updateUser({
        avatar: event,
        locale: currentLang === 'tw' ? 1 : currentLang === 'cn' ? 2 : currentLang === 'en' ? 3 : 4
      })
      Alert.alert('更新使用者頭貼成功')
    } catch (err) {
      console.log(err, 'err')
      Alert.alert('更新使用者頭貼失敗')
    }
  }

  // Functions
  const $getMySubClasses = () => {
    let _myRoles = []
    const _mySubClasses = S_UserFactoryRole.getMySubClasses(
      currentUser,
      factoryId
    )
    setMySubClasses(_mySubClasses)
    // 所有ROLES
    const _allRoles = currentUser.user_factory_roles.concat(currentUser.user_factory_role_templates)
    // 篩選目前單位的ROLES
    _allRoles.forEach(_role => {
      if (currentViewMode == 'factory') {
        if (_role.factory && _role.factory.id && _role.factory.id == factoryId) {
          _myRoles.push(_role)
        } else if (_role.factory_id && _role.factory_id == factoryId) {
          _myRoles.push(_role)
        }
      } else if (currentViewMode == 'organization') {
        if (currentOrganization && _role.factory && _role.factory.id && _role.factory.id == currentOrganization.id) {
          _myRoles.push(_role)
        } else if (currentOrganization && _role.factory_id && _role.factory_id == currentOrganization.id) {
          _myRoles.push(_role)
        }
      }
    })
    setMyRoles(_myRoles)
  }

  React.useEffect(() => {
    if (currentUser && factoryId) {
      $getMySubClasses()
    }
  }, [currentUser, factoryId])

  return (
    <>
      <ScrollView>
        <WsPaddingContainer
          style={{
            backgroundColor: $color.primary11l,
            borderRadius: 10,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 24
          }}>
          <WsState
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
            }}
            type="image"
            uploadUrl={'auth/user/avatar'}
            value={currentUser && currentUser.avatar}
            onChange={$event => {
              $_changeAvatar($event)
            }}
            centerBtnVisible={false}
            bottomRightBtnVisible={true}
          />
          <View />
        </WsPaddingContainer>
        <WsPaddingContainer
          style={{
            backgroundColor: $color.white,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 8
          }}>
          <WsInfo
            style={{ flex: 1 }}
            label={t('姓名')}
            value={currentUser.name}
          />
        </WsPaddingContainer>
        <WsPaddingContainer
          style={{
            backgroundColor: $color.white,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 8
          }}>
          <WsInfo
            style={{ flex: 1 }}
            label={t('信箱')}
            value={currentUser.email}
          />
        </WsPaddingContainer>
        <WsPaddingContainer
          style={{
            backgroundColor: $color.white,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 8
          }}>
          <WsInfo
            style={{ flex: 1 }}
            type="users"
            label={t('我的角色')}
            avatarVisible={false}
            value={myRoles ? myRoles : []}
          />
        </WsPaddingContainer>
        <WsPaddingContainer
          style={{
            backgroundColor: $color.white,
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginBottom: 8
          }}>
          <WsText
            style={{
              width: width,
              marginBottom: 16,
            }}
            size={14}
            fontWeight={600}
          >
            {t('我的限閱領域')}
          </WsText>
          {mySubClasses &&
            mySubClasses.length > 0 &&
            mySubClasses.map(subClass => {
              return (
                <>
                  <WsTag
                    style={{
                      marginRight: 8,
                      marginTop: 8
                    }}
                    img={subClass.icon}>
                    {t(subClass.name)}
                  </WsTag>
                </>
              )
            })}
        </WsPaddingContainer>
        <WsPaddingContainer
          style={{
            backgroundColor: $color.white,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginBottom: 8
          }}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('SettingLanguage')
            }}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: width * 0.9
            }}>
            <View>
              <WsText>{t('語言')}</WsText>
              {currentUser && currentUser.locale && currentUser.locale.name && (
                <WsText size={12} color={$color.gray} style={{ marginTop: 8 }}>
                  {currentUser.locale.name}
                </WsText>
              )}
            </View>
            <WsIcon size={24} name="md-chevron-right" />
          </TouchableOpacity>
        </WsPaddingContainer>
        <WsPaddingContainer
          style={{
            backgroundColor: $color.white,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginBottom: 8
          }}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('ChangePassword')
            }}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: width * 0.9
            }}>
            <View>
              <WsText>{t('變更密碼')}</WsText>
            </View>
            <WsIcon size={24} name="md-chevron-right" />
          </TouchableOpacity>
        </WsPaddingContainer>
      </ScrollView>
    </>
  )
}

export default MyAccountSettings
