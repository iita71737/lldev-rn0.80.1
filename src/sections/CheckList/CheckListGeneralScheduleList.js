import React, { useEffect, useState } from 'react'
import { Pressable, ScrollView, View, Dimensions, TouchableOpacity } from 'react-native'
import moment from 'moment'
import {
  WsInfiniteScroll,
  WsText,
  LlCheckListCard003,
  LlCheckListResultCard,
  WsInfo,
  WsFlex,
  WsTag,
  LlChecklistGeneralScheduleListCard001,
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import S_GeneralSchedule from '@/services/api/v1/general_schedule_setting'

const CheckListGeneralScheduleList = props => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const { width, height } = Dimensions.get('window')

  // Props
  const { id, versionId } = props

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // State
  const [params, setParams] = useState({
    order_by: 'updated_at',
    order_way: 'desc',
    model: 'checklist',
    model_id: id,
  })

  return (
    <>
      <WsInfiniteScroll
        service={S_GeneralSchedule}
        serviceIndexKey={"index"}
        params={params}
        keyExtractor={item => item.id}
        emptyTitle={t('目前尚無資料')}
        renderItem={({ item, index }) => {
          return (
            <>
              <LlChecklistGeneralScheduleListCard001
                style={{
                  marginTop: 16
                }}
                item={item}
                onPress={() => {
                  navigation.navigate('RoutesCheckList', {
                    screen: 'GeneralScheduleSettingShow',
                    params: {
                      id: item.id,
                      checklistVersionId: versionId
                    }
                  })
                }}
              ></LlChecklistGeneralScheduleListCard001>
            </>
          )
        }}
      />
    </>
  )
}

export default CheckListGeneralScheduleList
