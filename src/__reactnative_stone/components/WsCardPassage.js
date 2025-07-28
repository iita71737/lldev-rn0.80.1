import React from 'react'
import { Pressable, Animated, TouchableOpacity, Dimensions } from 'react-native'
import {
  WsPaddingContainer,
  WsText,
  WsFlex,
  WsDes,
  WsPassageCollapse
} from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsCardPassage = props => {
  // Dimension
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    title,
    passage,
    des,
    style,
    backgroundColor = $color.white,
    numberOfLines = 3,
    padding = 16
  } = props
  const [collapseVisible, setCollapseVisible] = React.useState(false)

  const $_setCollapseVisible = () => {
    // 已知变量
    const fontSize = 14
    const letterSpace = 1
    const CNCount = passage.length // 中文字符数
    const otherCount = 0 // 数字、英文字符数
    const textWidth = (CNCount + otherCount) * (fontSize + letterSpace) // 公式
    if (textWidth / width > 3) {
      setCollapseVisible(true)
    }
  }

  React.useEffect(() => {
    if (passage) {
      $_setCollapseVisible()
    }
  }, [passage])

  // Render
  return (
    <WsPaddingContainer
      padding={padding}
      style={[
        {
          backgroundColor: backgroundColor
        },
        style
      ]}>
      {title && (
        <WsFlex
          justifyContent="space-between"
          alignItems="center"
          style={{
            marginBottom: 8
          }}>
          <WsText
            size={14}
            style={{
              fontWeight: 'bold'
            }}>
            {title}
          </WsText>
          <WsDes
            style={{
              marginRight: 8
            }}>
            {des}
          </WsDes>
        </WsFlex>
      )}
      {collapseVisible ? (
        <WsPassageCollapse passage={passage} />
      ) : (
        <WsText numberOfLines={numberOfLines} size={14}>
          {passage}
        </WsText>
      )}
    </WsPaddingContainer>
  )
}
export default WsCardPassage
