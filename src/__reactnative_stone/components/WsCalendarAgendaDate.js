import React from 'react'
import { View, Pressable, TouchableOpacity } from 'react-native'
import { WsText, WsTag } from '@/components'
import layouts from '@/__reactnative_stone/global/layout'
import moment from 'moment'
import 'moment/locale/zh-tw'
moment.updateLocale('zh-tw', {
  weekdays: ['週日', '週一', '週二', '週三', '週四', '週五', '週六']
})

const WsCalendarAgendaDate = props => {
  const { windowWidth, windowHeight, screenHeight } = layouts

  // Props
  const { date, markedDateOnPress, marking = [] } = props

  // Render
  return (
    <>
      {date && marking && (
        <View
          style={{
            flexDirection: 'row',
            marginVertical: 4,
            width: windowWidth,
            backgroundColor: '#ffffff'
          }}>
          <View
            style={{
              alignItems: 'center',
              width: 56
            }}>
            <WsText
              style={{
                marginTop: 16,
                fontSize: 16,
                fontWeight: '700',
                lineHeight: 22,
                letterSpacing: 1,
                textAlign: 'center',
                color: '#373737'
              }}>
              {moment(date.toISOString()).format('DD')}
            </WsText>
            <WsText
              style={{
                marginTop: 8,
                marginBottom: 16,
                fontSize: 12,
                lineHeight: 18,
                textAlign: 'center',
                color: '#808080'
              }}>
              {moment(date.toISOString()).format('dddd')}
            </WsText>
          </View>
          <View
            style={{
              paddingVertical: 12,
              width: windowWidth - 72
            }}>
            {marking &&
              marking.map((item, markItemKey) => {
                return (
                  <View key={markItemKey}>
                    <TouchableOpacity
                      onPress={() => {
                        markedDateOnPress(item)
                      }}>
                      <WsTag
                        backgroundColor={item.bgc}
                        icon={item.icon}
                        textColor={item.textColor}
                        style={{
                          marginTop: 8
                        }}>
                        {item.text}
                      </WsTag>
                    </TouchableOpacity>
                  </View>
                )
              })
            }
          </View>
        </View>
      )}
    </>
  )
}
export default WsCalendarAgendaDate
