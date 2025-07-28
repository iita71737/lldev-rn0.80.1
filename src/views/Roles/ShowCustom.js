import React from 'react'
import { Pressable, ScrollView } from 'react-native'
import { WsTag, WsText, WsFlex, WsPaddingContainer, WsRead } from '@/components'
import ShowRolesLsit from '@/sections/Roles/ShowRolesList'
import S_UserFactoryRole from '@/services/api/v1/user_factory_role'
import $color from '@/__reactnative_stone/global/color'
import AsyncStorage from '@react-native-community/async-storage'
import M_RoleScope from '@/models/role-scope'
import { useTranslation } from 'react-i18next'

const RolesShowCustom = ({ route }) => {
   const { t, i18n } = useTranslation()

  // Params
  const { id } = route.params

  // State
  const [role, setRole] = React.useState()

  // Services
  const $_fetchRole = async () => {
    const res = await S_UserFactoryRole.show({ modelId: id })
    setRole(res)
  }

  // Function
  const $_setUpdateRoleInitValue = async () => {
    const _fields = M_RoleScope.getFields()
    const _values = {}

    for (let key in _fields) {
      if (_fields[key].items) {
        _fields[key].items.forEach(item => {
          item.value.forEach(itemValue => {
            if (role.scopes.includes(itemValue)) {
              const _value = _values[key] ? [..._values[key]] : []
              _value.push(itemValue)
              _values[key] = _value
              // _values[key] = {
              //   value: _value
              // }
            }
          })
        })
      }
    }
    await AsyncStorage.setItem('RoleUpdate', JSON.stringify(_values))
  }

  React.useEffect(() => {
    $_fetchRole()
  }, [])

  // Render
  return (
    <>
      {role && (
        <WsRead
          editText={t("編輯角色")}
          id={role.id}
          editNavigate="RoleUpdate"
          editOnpress={$_setUpdateRoleInitValue}>
          <ScrollView>
            <>
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white
                }}>
                <WsText size={24}>{role.name}</WsText>
              </WsPaddingContainer>
              <ShowRolesLsit scopes={role.scopes} />
            </>
          </ScrollView>
        </WsRead>
      )}
    </>
  )
}

export default RolesShowCustom
