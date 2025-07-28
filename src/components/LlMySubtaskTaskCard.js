import React, { useState, useEffect } from 'react'
import { View, SafeAreaView, FlatList, Text, TouchableOpacity } from 'react-native'
import {
  WsText,
  WsState,
  WsModal,
  WsPaddingContainer,
  WsBottomRoundContainer,
  WsStateSubtaskCardShow,
  WsBtn,
  WsInfoForm,
  WsSkeleton,
  WsSnackBar,
  WsEmpty,
  WsInfoUser,
  LlBtn002,
  WsFlex,
  WsIcon,
  WsCollapsible
} from '@/components'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import store from '@/store'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import S_SubTask from '@/services/api/v1/sub_task'
import { useNavigation } from '@react-navigation/native'
import i18next from 'i18next'
import { ScrollView } from 'react-native-gesture-handler'
import { useNavigationState } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import S_Task from '@/services/api/v1/task'


const LlMySubtaskTaskCard = (props) => {

  const {
    item,
    onPress,
    sortValue,
    style,
    isDone,
    text,
    date,
    user,
    name,
    value,
    title,
    done_at,
    attachCount,
    onChange,
    sub_tasks
  } = props

  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return (
    <>
      <View
        style={{
          marginVertical: 16,
        }}
      >
        <>
          {item && (
            <WsFlex
              justifyContent={'space-between'}
            >
              <WsText
                size={12}
                color={$color.primary}
                fontWeight={600}
                style={{
                }}
              >
                {item.name}{'  '}{sub_tasks && sub_tasks.length != undefined ? sub_tasks.length : 0}
              </WsText>
              <TouchableOpacity
                onPress={() => {
                  setIsCollapsed(!isCollapsed)
                }}
              >
                {name && (
                  <WsIcon
                    name={isCollapsed ? 'md-chevron-down' : 'md-chevron-up'}
                    size={24}
                    color={$color.primary}
                  />
                )}
              </TouchableOpacity>
            </WsFlex>
          )
          }
          {name && (
            <WsCollapsible
              isCollapsed={isCollapsed}
            >
              <WsStateSubtaskCardShow
                sortValue={sortValue}
                onPress={onPress}
                style={style}
                isDone={isDone}
                text={text}
                date={date}
                user={user}
                name={name}
                value={value}
                title={title}
                done_at={done_at}
                attachCount={attachCount}
                onChange={onChange}>
              </WsStateSubtaskCardShow>
            </WsCollapsible>
          )}
        </>
      </View>

    </>
  )
}

export default LlMySubtaskTaskCard