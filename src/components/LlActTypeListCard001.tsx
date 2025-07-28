import React from 'react'
import {
  View,
  FlatList
} from 'react-native'
import {
  WsText,
  WsIconBtn,
  LlActTypeCard001,
  WsEmpty
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'

interface LlActTypeListCard001Props {
  systemSubclassId?: string;
  systemClassId?: string;
  act_type?: string | number[];
  act_status?: string[];
  search?: string;
  start_time?: string;
  end_time?: string;
  factory_tags?: string;
  params: any;
  to?: string;
}

const LlActTypeListCard001: React.FC<LlActTypeListCard001Props> = (props) => {

  const {
    params,
    to
  } = props

  // Redux
  const actTypes = useSelector(state => state.data?.actTypes)

  // 法規類別層級
  const renderInnerItem = ({ item, index }) => {
    const actType = item
    return (
      <>
        <LlActTypeCard001
          testID={item.name}
          key={index}
          actType={actType}
          params={params}
          to={to}
        >
        </LlActTypeCard001>
      </>
    );
  };

  return (
    <>
      <View
        style={{
          backgroundColor: $color.white,
          paddingBottom: 16
        }}
      >
        <FlatList
          data={actTypes}
          renderItem={({ item, index }) => renderInnerItem({ item, index })}
          keyExtractor={(item, index) => item + index}
        />
      </View>
    </>
  )
}
export default LlActTypeListCard001
