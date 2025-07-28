import React, { useState } from 'react'
import { View, FlatList, Dimensions, ActivityIndicator } from 'react-native'
import { WsFlex } from '@/components'

const WsGrid = props => {
  const { width, height } = Dimensions.get('screen')

  // Props
  const {
    children,
    data = [],
    renderItem,
    numColumns = 1,
    keyExtractor,
    style
  } = props

  // State
  const [layoutWidth, setLayoutWidth] = useState(0)
  const [layoutHeight, setLayoutHeight] = useState(0)

  const $_onLayout = $event => {
    setLayoutWidth($event.nativeEvent.layout.width)
    setLayoutHeight($event.nativeEvent.layout.height)
  }

  // Render
  return (
    <View
      onLayout={$_onLayout}
      style={[
        {
          borderWidth: 0,
        },
        style
      ]}>
      <FlatList
        data={data}
        keyExtractor={keyExtractor}
        numColumns={numColumns}
        renderItem={({ item, index }) => (
          <View
            style={{
              width: layoutWidth / numColumns,
              paddingBottom: 8,
              justifyContent: 'center',
            }}>
            {renderItem({ item, itemIndex: index })}
          </View>
        )}
      />
    </View>
  )
}

export default WsGrid
