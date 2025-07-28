import React from 'react'
import { View } from 'react-native'
import { WsText, WsFlex } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'

const WsChartTooltipCard001 = props => {
  // Props
  const { x, y, index, value, fields } = props

  // Render
  return (
    <>
      <View
        style={[
          {
            width: 200,
            position: 'absolute',
            paddingVertical: 16,
            paddingHorizontal: 18,
            borderRadius: 10,
            backgroundColor: $color.white,
            shadowColor: 'rgba(8, 53, 103, 0.16)',
            shadowOffset: {
              width: 0,
              height: 4
            },
            shadowRadius: 8,
            shadowOpacity: 1,
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: $color.gray3l
          },
          {
            top: y - 200,
            left:
              x -
              (index === 0
                ? 65
                : index === value.length - 1
                  ? 165
                  : index === value.length - 2
                    ? 140
                    : 103)
          }
        ]}>
        <WsText
          style={{
            fontSize: 14,
            fontWeight: '600',
            lineHeight: 20,
            letterSpacing: 1,
            color: $color.black2l
          }}>
          {moment().format('YYYY年M月')}
        </WsText>
        {Object.keys(fields).map((fieldKey, fieldIndex) => {
          const field = fields[fieldKey]
          return (
            <View key={fieldIndex}>
              <WsFlex justifyContent="space-between">
                <WsFlex>
                  <View
                    style={{
                      width: 12,
                      height: 3,
                      borderRadius: 1.5,
                      backgroundColor: field.color,
                      marginRight: 8
                    }}
                  />
                  <WsText size={14} color={$color.gary2l} letterSpacing={1}>
                    {field.label}
                  </WsText>
                </WsFlex>
                <WsText size={14} letterSpacing={1} color={$color.gary2l}>
                  {value[index][fieldKey]}
                </WsText>
              </WsFlex>
            </View>
          )
        })}
      </View>
    </>
  )
}

export default WsChartTooltipCard001
