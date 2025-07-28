import React from 'react'
import { Pressable, View, Image, TouchableOpacity } from 'react-native'
import { WsText, WsFlex, WsIcon, WsCollapsible, WsCard } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlCheckListRecordCard002 = props => {
  const { t, i18n } = useTranslation()

  const {
    label,
    items,
    num,
    onPress,
    iconColor,
    icon,
    style,
    testID
  } = props

  const [isCollapsed, setIsCollapsed] = React.useState(true)

  return (
    <TouchableOpacity
      testID={testID}
      onPress={() => {
        setIsCollapsed(!isCollapsed)
      }}
      style={style}>
      <WsCard
        style={{
          shadowColor: $color.gray,
          shadowOffset: {
            width: 0,
            height: 1
          },
          borderRadius: 10,
          shadowRadius: 3,
          shadowOpacity: 0.25,
          elevation: 2
        }}>
        <WsFlex justifyContent="space-between">
          <WsIcon
            name={icon}
            size={20}
            color={iconColor}
            style={{
              width: 30
            }}
          />
          <WsText
            size={14}
            fontWeight="700"
            letterSpacing={1}
            style={{
              flex: 1
            }}>
            {label}
          </WsText>
          <WsText
            letterSpacing={1}
            size={14}
            style={{
              width: 30
            }}>
            {num}
          </WsText>
          <WsIcon
            name="md-unfold-more"
            size={20}
            style={{
              minWidth: 26
            }}
            color={$color.black}
          />
        </WsFlex>
        <WsCollapsible isCollapsed={isCollapsed}>
          {items.map((item, itemIndex) =>
            <WsFlex
              key={itemIndex}
              justifyContent="space-between"
              style={[
                {
                  marginTop: 16
                }
              ]}>
              {item && item.icon && (
                <Image
                  source={{
                    uri: item.icon
                  }}
                  style={{
                    width: 30,
                    height: 30
                  }}
                />
              )
              }

              <WsText
                color={item.color}
                style={{
                  flex: 1
                }}>
                {item.label}
              </WsText>
              <WsText
                style={{
                  width: 30
                }}>
                {item.num}
              </WsText>
              <WsIcon
                color={$color.white}
                style={{
                  minWidth: 26
                }}
              />
            </WsFlex>
          )}
        </WsCollapsible>
      </WsCard>
    </TouchableOpacity>
  )
}

export default LlCheckListRecordCard002
