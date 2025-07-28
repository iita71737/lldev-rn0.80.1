import React from 'react'
import { StyleSheet, View, Pressable, TouchableHighlight } from 'react-native'
import moment from 'moment'

import {
  WsCard,
  WsText,
  WsIcon,
  WsIconCircle,
  WsFlex,
  WsStateFormModal
} from '@/components'
import $color from '@/__reactnative_stone/global/color'

const WsSubtaskCardShow = props => {
  // Props
  const {
    desColor = $color.gray,
    name,
    date,
    attachCount,
    user,
    style,
    fields,
    value,
    onChange,
    done_at
  } = props

  // States
  const [stateModal, setStateModal] = React.useState(false)
  const [isDone, setIsDone] = React.useState(false)

  // Function
  const $_setDoneStatus = () => {
    if (done_at) {
      setIsDone(true)
    }
  }

  React.useEffect(() => {
    $_setDoneStatus()
  }, [])

  // Render
  return (
    <>
      <Pressable
        onPress={() => {
          setStateModal(true)
        }}>
        <WsCard padding={16} style={[style]}>
          <View style={[styles.contentContainer]}>
            <TouchableHighlight
              activeOpacity={0.6}
              underlayColor="transparent"
              onPress={() => {
                if (isDone) {
                  const _value = { ...value }
                  _value.done_at = null
                  onChange(_value)
                  setIsDone(false)
                } else {
                  const _value = { ...value }
                  _value.done_at = moment().format('YYYY-MM-DD')
                  onChange(_value)
                  setIsDone(true)
                }
              }}>
              <WsIconCircle
                name="ws-outline-check"
                size={30}
                color={isDone ? $color.white : $color.gray}
                gradientColor={
                  isDone
                    ? [$color.primary, $color.primary3l]
                    : [$color.white, $color.white]
                }
                isGradient={true}
                gradientBorder={isDone ? 0 : 2}
              />
            </TouchableHighlight>
            <View
              style={[
                {
                  marginLeft: 6
                }
              ]}>
              <WsText size="h5" fontWeight="bold">
                {name}
              </WsText>
              <WsFlex
                style={[
                  {
                    marginTop: 8
                  }
                ]}>
                {date && (
                  <WsFlex
                    style={{
                      marginRight: 12
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
                {attachCount != undefined && (
                  <WsFlex
                    style={{
                      marginRight: 12
                    }}>
                    <WsIcon
                      name="ws-outline-attachment"
                      size={18}
                      color={desColor}
                    />
                    <WsText
                      style={{
                        marginLeft: 4
                      }}
                      size={12}
                      color={desColor}>
                      附件 ({attachCount})
                    </WsText>
                  </WsFlex>
                )}
                {user && (
                  <WsFlex
                    style={{
                      marginRight: 16
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
                      {user}
                    </WsText>
                  </WsFlex>
                )}
              </WsFlex>
            </View>
          </View>
        </WsCard>
      </Pressable>
      <WsStateFormModal
        fields={fields}
        initValue={value}
        visible={stateModal}
        onClose={() => {
          setStateModal(false)
        }}
        onSubmit={$event => {
          onChange($event)
          setStateModal(false)
        }}
      />
    </>
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  }
})

export default WsSubtaskCardShow
