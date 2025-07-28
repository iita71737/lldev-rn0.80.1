import React from 'react'
import { Pressable, ScrollView } from 'react-native'
import {
  WsDes,
  WsText,
  WsFlex,
  WsPaddingContainer,
  WsCard,
  WsInfiniteScroll
} from '@/components'
import ShowRolesLsit from '@/sections/Roles/ShowRolesList'
import S_UserRole from '@/services/api/v1/user_role'
import $color from '@/__reactnative_stone/global/color'

const RolesShowDefault = ({ route }) => {
  // Params
  const { id } = route.params

  // State
  const [role, setRole] = React.useState()

  // Services
  const $_fetchRole = async () => {
    const res = await S_UserRole.show(id)
    setRole(res)
  }

  React.useEffect(() => {
    $_fetchRole()
  }, [])

  // Render
  return (
    <ScrollView>
      {role && (
        <>
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white
            }}>
            <WsText size={24}>{role.name}</WsText>
            <WsDes>此角色微系統預設角色，不可編輯權限設定</WsDes>
          </WsPaddingContainer>
          <ShowRolesLsit scopes={role.scopes} />
        </>
      )}
    </ScrollView>
  )
}

export default RolesShowDefault
