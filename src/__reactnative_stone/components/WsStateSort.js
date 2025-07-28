import React from 'react'
import { View, ScrollView } from 'react-native'
import { DragSortableView } from 'react-native-drag-sort'

const WsStateSort = props => {
  // Props
  const {
    value,
    onChange,
    childrenWidth,
    childrenHeight = 78,
    keyExtractor,
    renderItem,
    onDragStart,
    onDragEnd
  } = props

  // State
  const [width, setWidth] = React.useState(null)
  const [scrollEnabled, setScrollEnabled] = React.useState(true)

  // Function
  const _ChildrenWidth = () => {
    if (childrenWidth) {
      return childrenWidth
    } else {
      return width
    }
  }

  // Render
  return (
    <View
      onLayout={$event => {
        setWidth($event.nativeEvent.layout.width)
      }}>
      {_ChildrenWidth() && (
        <ScrollView
          scrollEnabled={scrollEnabled}
          alwaysBounceHorizontal={false}
          alwaysBounceVertical={false}>
          <DragSortableView
            style={{
              // borderWidth:3,
              flex: 1,
              height: 200
            }}
            dataSource={value}
            onDataChange={onChange}
            childrenWidth={_ChildrenWidth()}
            childrenHeight={childrenHeight}
            delayLongPress={0}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            // onDragStart={onDragStart}
            // onDragEnd={onDragEnd}
            onDragStart={() => {
              setScrollEnabled(false)
            }}
            onDragEnd={() => {
              setScrollEnabled(true)
            }}
          />
        </ScrollView>
      )}
    </View>
  )
}

export default WsStateSort
