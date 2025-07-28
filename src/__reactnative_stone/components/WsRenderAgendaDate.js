import React from 'react'
import { View, Pressable, Dimensions } from 'react-native'
import { WsText, WsTag } from '@/components'
import moment from 'moment'
import 'moment/locale/zh-tw'
moment.updateLocale('zh-tw', {
  weekdays: ['週日', '週一', '週二', '週三', '週四', '週五', '週六']
})

const WsRenderAgendaDate = props => {
  // Props
  const { date, markedDateOnPress, marking } = props
  const windowWidth = Dimensions.get('window').width

  // Function
  const getDay = () => {
    return moment(date).format('DD')
  }
  const getWeek = () => {
    return moment(date).format('dddd')
  }

  // Render
  return (
    <>
      {date && (
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
              {getDay()}
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
              {getWeek()}
            </WsText>
          </View>
          <View
            style={{
              paddingVertical: 12,
              width: windowWidth - 72
            }}>
            {marking && marking.map((markItem, markItemKey) => {
              return (
                <>
                  {markItem.map((item, itemIndex) => {
                    return (
                      <>
                        <Pressable
                          onPress={() => {
                            markedDateOnPress(item)
                          }}>
                          <WsTag
                            backgroundColor={item.bgc}
                            icon={item.icon}
                            textColor={item.textColor}
                            style={[
                              itemIndex != 0
                                ? {
                                  marginTop: 8
                                }
                                : null
                            ]}>
                            {item.text}
                          </WsTag>
                        </Pressable>
                      </>
                    )
                  })}
                </>
              )
            })}
          </View>
        </View>
      )}
    </>
  )
}
export default WsRenderAgendaDate
