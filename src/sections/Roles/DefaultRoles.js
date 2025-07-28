import React from 'react'
import { Pressable } from 'react-native'
import {
  WsTag,
  WsText,
  WsFlex,
  WsPaddingContainer,
  WsCard,
  WsInfiniteScroll
} from '@/components'
import S_UserRole from '@/services/api/v1/user_role'
import { useSelector } from 'react-redux'

const DefaultRoles = props => {
  const { navigation } = props

  const currentFactory = useSelector(state => state.data.currentFactory)

  return (
    <>
      <WsInfiniteScroll
        service={S_UserRole}
        padding={16}
        params={{
          factory: currentFactory.id
        }}
        renderItem={({ item, index }) => {
          return (
            <>
              <Pressable
                onPress={() => {
                  navigation.navigate({
                    name: 'RolesShowDefault',
                    params: {
                      id: item.id
                    }
                  })
                }}>
                <WsCard style={{ marginTop: 8 }}>
                  <WsText>{item.name}</WsText>
                </WsCard>
              </Pressable>
            </>
          )
        }}
      />
    </>
  )
}

export default DefaultRoles
