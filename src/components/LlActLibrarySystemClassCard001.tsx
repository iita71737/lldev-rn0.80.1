import React, { useState } from 'react'
import {
  ScrollView,
  View,
  FlatList
} from 'react-native'
import {
  LlActTypeListCard001,
  LlActListingCollapseCard001,
  WsCollapsible,
} from '@/components'
import $color from '@/__reactnative_stone/global/color'

interface LlActLibrarySystemClassCardProps {
  item: any;
  index: number;
  params: any;
  testID?: string;
}

const LlActLibrarySystemClassCard001: React.FC<LlActLibrarySystemClassCardProps> = (props) => {

  // PROPS
  const {
    item,
    index,
    params,
    testID
  } = props

  // STATE
  const [isCollapsed, setIsCollapsed] = React.useState(true)

  return (
    <>
      <LlActListingCollapseCard001
        testID={testID}
        style={{
          backgroundColor: $color.white,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderBottomLeftRadius: isCollapsed ? 20 : 0,
          borderBottomRightRadius: isCollapsed ? 20 : 0,
          marginTop: index != 0 ? 8 : 0,
        }}
        key={item}
        fontSize={18}
        imageLeft={item.icon}
        bottomLine={false}
        leftTitle={item.name}
        isCollapsed={isCollapsed}
        onPress={() => {
          setIsCollapsed(!isCollapsed)
        }}
      >
      </LlActListingCollapseCard001>

      <WsCollapsible
        isCollapsed={isCollapsed}
      >
        {isCollapsed === false && (
          <LlActTypeListCard001
            params={params}
          ></LlActTypeListCard001>
        )}
      </WsCollapsible>
    </>
  )
}

export default LlActLibrarySystemClassCard001