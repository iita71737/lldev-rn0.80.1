import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import {
  WsCard,
  WsText,
  WsFlex,
  WsIcon,
  WsDes,
  WsInfo,
  WsTag,
  WsIconBtn
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import moment from 'moment'

const LlTaskTemplateCard001 = props => {
  // Props
  const {
    item,
    onPress,
    style,
    testID,
    is_collect,
    is_collect_visible = false,
    bookmarkOnPress
  } = props

  const [isCollect, setIsCollect] = React.useState(is_collect)

  React.useEffect(() => {
    setIsCollect(is_collect)
  }, [is_collect])

  const $_getStatusText = () => {
    if (!item?.status) {
      return i18next.t('未設定')
    }
    if (item.status === 'released') {
      return i18next.t('已發佈')
    }
    return item.status
  }

  const $_getStatusTagStyle = () => {
    if (item?.status === 'released') {
      return {
        backgroundColor: $color.green11l,
        textColor: $color.green
      }
    }
    return {
      backgroundColor: $color.primary11l,
      textColor: $color.primary2l
    }
  }

  return (
    <>
      {item && (
        <TouchableOpacity
          testID={testID}
          onPress={onPress}
          style={{
            marginTop: 8
          }}
        >
          <WsCard
            padding={0}
            style={[
              {
                padding: 16,
                marginHorizontal: 16
              },
              style
            ]}>
            {is_collect_visible && (
              <WsIconBtn
                style={{
                  top: 0,
                  right: 0,
                  position: 'absolute',
                  zIndex: 99
                }}
                name={isCollect ? 'md-bookmark' : 'ws-outline-bookmark'}
                size={28}
                onPress={() => {
                  if (bookmarkOnPress) {
                    bookmarkOnPress(item)
                  }
                  setIsCollect(!isCollect)
                }}
              />
            )}
            <WsFlex>
              <View
                style={{
                  flex: 1
                }}
              >
                {item.updated_at && (
                  <WsFlex
                    style={{
                      marginBottom: 4,
                      left: -2
                    }}
                  >
                    <WsIcon
                      name="md-date-note"
                      size={18}
                      style={{
                        marginRight: 4
                      }}
                      color={$color.gray}
                    />
                    <WsDes
                      size={12}
                    >
                      {i18next.t('更新日期')}
                      {'  '}
                      {moment(item.updated_at).format('YYYY-MM-DD')}
                    </WsDes>
                  </WsFlex>
                )}

                <WsFlex justifyContent="space-between" alignItems="center">
                  <WsText>{item?.name || i18next.t('未命名公版')}</WsText>
                  <WsTag
                    backgroundColor={$_getStatusTagStyle().backgroundColor}
                    textColor={$_getStatusTagStyle().textColor}
                  >
                    {$_getStatusText()}
                  </WsTag>
                </WsFlex>

                {item?.factory_tags &&
                  item?.factory_tags?.length > 0 && (
                    <View>
                      <WsInfo
                        type="tags"
                        value={item.factory_tags}
                      />
                    </View>
                  )}

                {item?.system_classes &&
                  item?.system_classes?.length > 0 && (
                    <View style={{ marginTop: 2 }}>
                      <WsFlex flexWrap="wrap">
                        {item.system_classes.map((systemClass, systemClassIndex) => (
                          <WsTag
                            key={`${systemClass?.id || systemClassIndex}`}
                            img={systemClass?.icon}
                            backgroundColor={$color.primary11l}
                            textColor={$color.primary2l}
                            style={{
                              marginTop: 8,
                              marginRight: 8
                            }}
                          >
                            {`#${systemClass?.name || ''}`}
                          </WsTag>
                        ))}
                      </WsFlex>
                    </View>
                  )}

                {item?.system_subclasses &&
                  item?.system_subclasses?.length > 0 && (
                    <View style={{ marginTop: 2 }}>
                      <WsFlex flexWrap="wrap">
                        {item.system_subclasses.map((subClass, subClassIndex) => (
                          <WsTag
                            key={`${subClass?.id || subClassIndex}`}
                            img={subClass?.icon}
                            backgroundColor={$color.primary11l}
                            textColor={$color.primary2l}
                            style={{
                              marginTop: 8,
                              marginRight: 8
                            }}
                          >
                            {`#${subClass?.name || ''}`}
                          </WsTag>
                        ))}
                      </WsFlex>
                    </View>
                  )}

                <View
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsInfo
                    labelWidth={120}
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                    type="user"
                    label={i18next.t('負責人')}
                    value={item?.taker || undefined}
                  />
                </View>

              </View>
            </WsFlex>
          </WsCard>
        </TouchableOpacity>
      )}
    </>
  )
}

export default LlTaskTemplateCard001
