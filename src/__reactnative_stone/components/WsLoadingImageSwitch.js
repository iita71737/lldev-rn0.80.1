import React from 'react'
import { View, Image, Dimensions } from 'react-native'
import { WsText } from '@/components'

const items = [
  require('@/assets/img/loading-1.png'),
  require('@/assets/img/loading-2.png'),
  require('@/assets/img/loading-3.png')
]


const WsLoadingImageSwitch = props => {
  const windowWidth = Dimensions.get('window').width

  // Props
  const {
    items = items,
    text = 'Loading...'
  } = props

  // State
  const [ingIndex, setIngIndex] = React.useState(0)

  // Effect
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIngIndex(ingIndex => (ingIndex += 1))
    }, 2000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  // Render
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      }}>
      {items && items.length > 0 && (
        <>
          {items.map((item, itemIndex) => (
            <View key={`loading-image-${itemIndex}`}>
              {ingIndex % items.length == itemIndex && (
                <Image
                  source={item}
                  style={{
                    width: windowWidth - 24,
                    height: windowWidth - 24
                  }}
                />
              )}
            </View>
          ))}
        </>
      )}

      <View
        style={{
          marginTop: 24
        }}>
        <WsText>
          {text}
          {'...'.slice(-ingIndex % 3)}
        </WsText>
      </View>
    </View>
  )
}

export default WsLoadingImageSwitch
