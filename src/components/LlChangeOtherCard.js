import React, { useState, useEffect } from 'react'
import { Pressable, TouchableHighlight } from 'react-native'
import moment from 'moment'

import {
  WsCard,
  WsText,
  WsIconCircle,
  WsFlex,
  WsStateFormModal
} from '@/components'
import $color from '@/__reactnative_stone/global/color'

const LlChangeOtherCard = props => {
  // Props
  const { value, onChange, style, fields, deleteOnPress } = props

  // State
  const [stateModal, setStateModal] = React.useState(false)
  const [fieldsValue, setfieldsValue] = React.useState({})

  // Function
  const $_setFieldsValue = () => {
    const subClassesId = value.system_subclasses.map(
      (subClass, subClassIndex) => {
        return subClass.id
      }
    )
    setfieldsValue({
      description: value.description,
      name: value.name,
      risk: value.risk,
      system_subclasses: subClassesId
    })
  }

  React.useEffect(() => {
    $_setFieldsValue()
  }, [value])

  return (
    <>
      <Pressable
        onPress={() => {
          setStateModal(true)
        }}>
        <WsCard style={[style]}>
          <WsFlex justifyContent="space-between">
            <WsText>{value.name}</WsText>
            <TouchableHighlight
              activeOpacity={0.6}
              underlayColor="transparent"
              onPress={deleteOnPress}>
              <WsIconCircle
                name="ws-outline-delete"
                size={24}
                color={$color.white}
                backgroundColor={$color.danger}
              />
            </TouchableHighlight>
          </WsFlex>
        </WsCard>
      </Pressable>
      <WsStateFormModal
        fields={fields}
        initValue={value}
        visible={stateModal}
        onClose={() => {
          setStateModal(false)
        }}
        onSubmit={$event => {
          onChange($event)
          setStateModal(false)
        }}
      />
    </>
  )
}

export default LlChangeOtherCard
