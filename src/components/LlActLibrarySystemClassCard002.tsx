import React, { useState } from 'react'
import { ScrollView, View, FlatList } from 'react-native'
import {
  WsText,
  WsNavButton,
  WsFilter,
  LlBtn002,
  WsSkeleton,
  WsEmpty,
  LlActCard001,
  WsInfiniteScroll,
  WsNavButtonCollapse,
  LlActTypeListCard001,
  LlActListingCollapseCard001,
  WsCollapsible,
  WsBtn
} from '@/components'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import S_Processor from '@/services/app/processor'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import S_Act from '@/services/api/v1/act'
import { useNavigation } from '@react-navigation/native'

interface LlActLibrarySystemClassCard002Props {
  item: any;
  index: number;
  params: any;
  testID?: string;
}

const LlActLibrarySystemClassCard002: React.FC<LlActLibrarySystemClassCard002Props> = (props) => {

  const {
    item,
    params,
    index,
    testID
  } = props

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
          marginTop: index != 0 ? 8 : 4,
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
            to={'ActChangeReportShow'}
          ></LlActTypeListCard001>
        )}
      </WsCollapsible>
    </>

  )
}

export default LlActLibrarySystemClassCard002