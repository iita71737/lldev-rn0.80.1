import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import moment from 'moment'
import {
  WsInfiniteScroll,
  WsText,
  LlCheckListCard003,
  LlCheckListResultCard
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import S_ConstantData from '@/services/api/v1/constant_data'

const CheckListRecordList = props => {
  const navigation = useNavigation()

  // Props
  const { id } = props

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // State
  const [params, setParams] = useState({
    order_by: 'record_at',
    order_way: 'desc',
    id: id
  })
  const [constantData, setConstantData] = React.useState()

  // Services
  const $_fetchConstantData = async () => {
    try {
      const _params = {
        model: 'checklist',
        type: 'result'
      }
      const res = await S_ConstantData.index({
        params: _params
      })
      if (res && res.data) {
        setConstantData(res.data)
      }
    } catch (e) {
      console.error(e);
    }
  }

  React.useEffect(() => {
    $_fetchConstantData()
  }, [])

  return (
    <>
      <WsInfiniteScroll
        service={S_CheckListRecord}
        params={params}
        showBottomText={false}
        keyExtractor={item => item.id}
        renderItem={({ item, index }) => {
          return (
            <>
              <LlCheckListResultCard
                constantData={constantData}
                testID={`LlCheckListResultCard-${index}`}
                item={item}
                id={item.id}
                risk={item.risk_level}
                title={item.name}
                passRate={item.pass_rate}
                date={moment(item.record_at).format('YYYY-MM-DD')}
                review={item.reviewer ? item.reviewer.name : i18next.t('無')}
                style={[
                  index == 0
                    ? null
                    : {
                      marginTop: 12
                    }
                ]}
                onPress={() => {
                  navigation.navigate({
                    name: 'CheckListAssignmentShow',
                    params: {
                      id: item.id
                    }
                  })
                }}
              />
            </>
          )
        }}
      />
    </>
  )
}

export default CheckListRecordList
