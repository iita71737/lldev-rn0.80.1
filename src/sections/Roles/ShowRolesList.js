import React from 'react'
import { Pressable } from 'react-native'
import { WsPaddingContainer, WsInfoForm } from '@/components'
import S_UserRole from '@/services/api/v1/user_role'
import M_RoleScope from '@/models/role-scope'

const ShowRolesList = props => {
  // Props
  const { scopes = [] } = props

  // State
  const [fields, setFields] = React.useState({})
  const [value, setValue] = React.useState({})

  // Functions
  const $_setScopesFields = () => {
    const _fields = {}
    M_RoleScope.scope.forEach(item => {
      item.list.forEach(list => {
        _fields[list.key] = {
          label: list.name
        }
      })
    })
    setFields(_fields)
  }
  const $_setScopesValue = () => {
    const _value = {}
    M_RoleScope.scope.forEach(item => {
      item.list.forEach(list => {
        list.id.forEach(listScope => {
          if (scopes.includes(listScope)) {
            _value[list.key] = '有權限'
          } else {
            _value[list.key] = '無權限'
          }
        })
      })
    })
    setValue(_value)
  }

  React.useEffect(() => {
    $_setScopesFields()
    $_setScopesValue()
  }, [])

  return (
    <>
      <WsPaddingContainer>
        <WsInfoForm fields={fields} value={value} />
      </WsPaddingContainer>
    </>
  )
}

export default ShowRolesList
