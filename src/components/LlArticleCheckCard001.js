import React, { useState, useEffect } from 'react'
import {
  View,
  Platform,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import {
  WsFlex,
  WsIcon,
  WsText,
  WsTextHighlight
} from '@/components'
import $color from '@/__reactnative_stone/global/color'

const LlArticleCheckCard001 = props => {
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    item,
    value,
    onChange,
    keyword
  } = props

  // State
  const [iconRight, setIconRight] = useState('md-check-box-outline-blank')
  const [iconRightColor, setIconRightColor] = useState($color.gray)
  const [articleVersionCollapsed, setArticleVersionCollapsed] = React.useState(true)

  // Function
  const $_onPress = () => {
    onChange(!value, item)
  }
  const $_setIcon = () => {
    if (value) {
      setIconRight('md-check-box')
      setIconRightColor($color.primary)
    } else {
      setIconRight('md-check-box-outline-blank')
      setIconRightColor($color.gray)
    }
  }

  useEffect(() => {
    $_setIcon()
  }, [value])

  // Render
  return (
    <WsFlex
      style={{
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderTopWidth: 0.5,
        borderColor: $color.primary,
        marginBottom: 8,
      }}
    >
      <TouchableOpacity
        style={{
          marginRight: 4
        }}
        onPress={() => {
          $_onPress()
        }}
      >
        <WsIcon
          style={{
            // borderWidth:1
          }}
          name={iconRight}
          size={24}
          color={$color.gray}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          marginTop: 8,
          flex: 1
        }}
        onPress={() => {
          setArticleVersionCollapsed(!articleVersionCollapsed)
        }}
      >
        <WsText
          size={16}
          fontWeight={600}
          style={{
          }}
        >{item.name ? item.name : item.article ? `${item.article?.act_version?.name} ${item.no_text}` : 'unknown'}
        </WsText>

        <WsTextHighlight
          size={14}
          style={{
            marginTop: 8,
            maxWidth: width * 0.8,
            maxHeight: articleVersionCollapsed ? 100 : undefined,
          }}
          keyword={keyword}
          collapsed={articleVersionCollapsed}
          richContent={item.rich_content}
        >
          {typeof item.rich_content === 'string' && item.rich_content.trim() !== '' ? item.rich_content : item.content}
        </WsTextHighlight>
      </TouchableOpacity>

      <TouchableOpacity
        style={{
          marginTop: 8,
        }}
        onPress={() => {
          setArticleVersionCollapsed(!articleVersionCollapsed)
        }}
      >
        <WsIcon
          name={articleVersionCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
          size={24}
          color={$color.primary3l}
        ></WsIcon>
      </TouchableOpacity>
    </WsFlex>
  )
}

export default LlArticleCheckCard001
