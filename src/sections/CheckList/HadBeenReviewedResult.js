import React from 'react'
import { Pressable, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import { useSelector } from 'react-redux'
import {
  WsText,
  WsInfiniteScroll,
  WsPaddingContainer,
  LlCheckListCard003
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'

const HadBeenReviewedResult = props => {
  // Props
  const { navigation } = props

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  const [params, setParams] = React.useState({
    checkers: currentUser && currentUser.id ? currentUser.id : null,
    order_by: 'record_at',
    order_way: 'desc',
    is_review: 1
  })

  return (
    <>
      <WsInfiniteScroll
        service={S_CheckListRecord}
        serviceIndexKey="factoryIndex"
        params={params}
        padding={16}
        renderItem={({ item, index }) => {
          return (
            <>
              <LlCheckListCard003
                testID={`LlCheckListCard003-${index}`}
                record_at={item.record_at}
                status={item.status}
                item={item}
                name={item.name}
                tagIcon={item.tagIcon}
                tagText={item.tagText}
                checkers={item.checkers}
                recordAt={moment(item.record_at).format('YYYY-MM-DD')}
                btnText={i18next.t('查看結果')}
                borderColor={$color.primary}
                style={[
                  index == 0
                    ? null
                    : {
                      marginTop: 12
                    }
                ]}
                onPress={() => {
                  navigation.navigate({
                    // name: 'CheckListReviewResultShow', //棄用 
                    name: 'CheckListAssignmentShow', // 250529
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

export default HadBeenReviewedResult
