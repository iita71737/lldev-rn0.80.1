import React, { Children } from 'react'
import {
  StyleSheet,
  View,
  Pressable,
  TouchableHighlight,
  TouchableOpacity
} from 'react-native'
import moment from 'moment'
import {
  WsCard,
  WsModal,
  WsText,
  WsIcon,
  WsIconCircle,
  WsFlex,
  WsInfoForm
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const WsStateSubtaskCardShow = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    children,
    desColor = $color.gray,
    name,
    date,
    attachCount,
    user,
    style,
    value = {},
    onChange,
    done_at,
    title,
    onPress,
    stateModal,
    headerRightOnPress,
    setDone,
    setUndo,
    subTask,
    currentUser,
    setIsSnackBarVisible,
    sortValue,
    task,
    testID
  } = props

  const $_doneOnPress = () => {
    onChange(value)
  }

  // Render
  return (
    <>
      <TouchableOpacity
        testID={testID}
        style={{
        }}
        onPress={onPress}
      >
        <WsCard padding={16} style={[style]}>
          <View style={[styles.contentContainer]}>
            <TouchableOpacity
              testID={'ws-outline-check'}
              style={{
                zIndex: 1
              }}
              onPress={() => {
                $_doneOnPress()
              }}>
              <WsIconCircle
                name="ws-outline-check"
                size={30}
                color={value.done_at ? $color.white : $color.gray}
                gradientColor={
                  value.done_at
                    ? [$color.primary, $color.primary3l]
                    : [$color.white, $color.white]
                }
                isGradient={true}
                gradientBorder={value.done_at ? 0 : 1}
              />
            </TouchableOpacity>
            <View
              style={[
                {
                  marginLeft: 4
                }
              ]}>
              {sortValue === '依任務排序' && (
                <WsText
                  style={{
                    marginRight: 35
                  }}
                  size="h3"
                  fontWeight="bold">
                  {value && value.name ? value.name : value.title ? value.title : ''}
                </WsText>
              )
              }
              {sortValue !== '依任務排序' && (
                <WsText
                  style={{
                    marginRight: 35,
                    paddingHorizontal: 8
                  }}
                  fontWeight="bold"
                  >
                  {value && value.name ? value.name : value.title ? value.title : ''}
                </WsText>
              )
              }
              <WsFlex
                style={[
                  {
                    marginTop: 8
                  }
                ]}>
                {date && moment(date).isValid && (
                  <WsFlex
                    style={{
                      marginRight: 4
                    }}>
                    <WsIcon
                      name="ws-outline-calendar-duedate"
                      size={18}
                      color={desColor}
                    />
                    <WsText
                      style={{
                        marginLeft: 4
                      }}
                      size={12}
                      color={desColor}>
                      {moment(date).format('YYYY-MM-DD')}
                    </WsText>
                  </WsFlex>
                )}
                {user && (
                  <WsFlex
                    style={{
                      marginRight: 4
                    }}>
                    <WsIcon
                      name="ws-outline-outline-perm-identity"
                      size={18}
                      color={desColor}
                    />
                    <WsText
                      style={{
                        marginLeft: 4
                      }}
                      size={12}
                      color={desColor}>
                      {user ? user : ''}
                    </WsText>
                  </WsFlex>
                )}
              </WsFlex>
            </View>
          </View>
        </WsCard>
      </TouchableOpacity>
    </>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  }
})

export default WsStateSubtaskCardShow
