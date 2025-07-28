import React, { useState } from 'react'
import { StyleSheet, Pressable } from 'react-native'
import { WsText, WsFlex, WsIcon } from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsItemCheck = props => {
  // Props
  const { item } = props

  // State
  const [isCheck, setIsCheck] = useState(false)

  // Render
  return (
    <Pressable onPress={() => setIsCheck(!isCheck)}>
      <WsFlex style={styles.filterTitle}>
        <WsText>{item}</WsText>
        {isCheck ? (
          <WsIcon name="check-box" size={30} color={$color.primary} />
        ) : (
          <WsIcon
            name="check-box-outline-blank"
            size={30}
            color={$color.gray}
          />
        )}
      </WsFlex>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  filterTitle: {
    flex: 1,
    justifyContent: 'space-between',
    paddingTop: 30
  },
  divider: {
    paddingLeft: 16,
    paddingRight: 16
  }
})

export default WsItemCheck
