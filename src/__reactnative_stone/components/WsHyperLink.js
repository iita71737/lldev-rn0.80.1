import React from 'react'
import { StyleSheet } from 'react-native'
import Hyperlink from 'react-native-hyperlink'
import $color from '@/__reactnative_stone/global/color'

const WsHyperLink = props => {
  // Prop
  const { color = $color.link, children, style } = props

  // Render
  return (
    <Hyperlink
      linkDefault={true}
      linkStyle={[
        styles.contentLinkText,
        {
          color: color
        }
      ]}
      style={[style]}>
      {children}
    </Hyperlink>
  )
}

const styles = StyleSheet.create({
  contentLinkText: {
    paddingHorizontal: 2,
    fontSize: 13,
    lineHeight: 15,
    letterSpacing: 1
  }
})

export default WsHyperLink
