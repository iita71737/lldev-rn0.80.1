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
import S_UserFactoryRole from '@/services/api/v1/user_factory_role'

const CustomRoles = props => {
  // Props
  const { navigation } = props

  return (
    <>
      <WsInfiniteScroll
        service={S_UserFactoryRole}
        padding={16}
        renderItem={({ item, index }) => {
          return (
            <>
              <Pressable
                onPress={() => {
                  navigation.navigate({
                    name: 'RolesShowCustom',
                    params: {
                      id: item.id
                    }
                  })
                }}>
                <WsCard style={{ marginTop: 8 }}>
                  <WsText>{item.name}</WsText>
                  {/* <WsFlex>
                  <WsTag>3432</WsTag>
                  </WsFlex> */}
                </WsCard>
              </Pressable>
            </>
          )
        }}
      />
    </>
  )
}

export default CustomRoles
