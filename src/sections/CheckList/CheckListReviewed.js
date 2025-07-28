import React from 'react'
import { Pressable, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import { useSelector } from 'react-redux'
import {
  WsText,
  WsInfiniteScroll,
  WsPaddingContainer,
  LlCheckListResultCard,
  LlCheckListCard003
} from '@/components'
import moment from 'moment'
import i18next from 'i18next'
import $color from '@/__reactnative_stone/global/color'

const CheckListReviewed = props => {
  // Props
  const { navigation } = props

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  return (
    <>
      <WsInfiniteScroll
        service={S_CheckListRecord}
        serviceIndexKey="factoryIndex"
        params={{
          reviewers: currentUser && currentUser.id ? currentUser.id : null,
          order_by: 'record_at',
          order_way: 'desc',
          is_review: 1
        }}
        padding={16}
        renderItem={({ item, index }) => {
          return (
            <>
              <LlCheckListCard003
                testID={`LlCheckListCard003-${index}`}
                item={item}
                name={item.name}
                tagIcon={item.tagIcon}
                tagText={item.tagText}

                checkers={item.checkers ? item.checkers : []}

                reviewers={item.reviewers ? item.reviewers : []}
                recordAt={moment(item.record_at).format('YYYY-MM-DD')}
                btnText={
                  i18next.t('查看結果')
                }
                btnColor={
                  [$color.white, $color.white2d]
                }
                textColor={
                  $color.white
                }
                borderColor={
                  $color.primary
                }
                style={[
                  index == 0
                    ? null
                    : {
                      marginTop: 12
                    }
                ]}
                onPress={() => {
                  navigation.navigate('RoutesCheckList', {
                    screen: 'ViewCheckListReviewed',
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

export default CheckListReviewed
