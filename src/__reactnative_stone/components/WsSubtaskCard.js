import React from 'react'
import {
  View,
  TouchableOpacity,
  TouchableHighlight,
  Dimensions
} from 'react-native'
import moment from 'moment'
import {
  WsCard,
  WsText,
  WsIcon,
  WsIconCircle,
  WsFlex,
  WsDes,
  WsInfo,
  WsTag
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const WsSubtaskCard = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    desColor = $color.gray,
    name,
    date,
    attachCount,
    user,
    style,
    value,
    onChange,
    deleteOnPress,
    _dateCompare,
    onPress,
    showMissingTakerWarning = false,
    showMissingExpiredAtWarning = false,
    showMissingSystemSubclassWarning = false,
    placeholderTitle = t('主旨'),
    placeholderRemark = t('說明'),
  } = props


  // Dimension
  const { width, height } = Dimensions.get('window')

  // helper
  const _hasTaker = Boolean(
    value?.taker &&
    (
      (typeof value?.taker === 'object' && (value?.taker?.id || value?.taker?.name)) ||
      (typeof value?.taker === 'string' && value?.taker?.trim?.())
    )
  )
  const _takerValue = React.useMemo(() => {
    if (!value?.taker) {
      return undefined
    }
    if (typeof value?.taker === 'string') {
      return {
        name: value.taker
      }
    }
    return value.taker
  }, [value?.taker])

  const _remark = value?.remark || ''
  const _hasExpiredAt = Boolean(value?.expired_at)
  const _systemSubclasses = Array.isArray(value?.system_subclasses)
    ? value.system_subclasses
    : []
  const _linkCount = Array.isArray(value?.links)
    ? value.links.length
    : Array.isArray(value?.related_module)
      ? value.related_module.length
      : 0

  // Render
  return (
    <>
      <TouchableOpacity
        onPress={onPress}>
        <WsCard
          padding={16}
          style={[
            style,
            !name ?
              {
                borderWidth: 1,
                borderColor: $color.danger,
                backgroundColor: $color.danger11l
              }
              : null
          ]
          }
        >
          <WsFlex style={{}} justifyContent="space-between">
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <WsIconCircle
                padding={0}
                name="ws-outline-check"
                size={30}
                style={{
                  marginRight: 16,
                }}
                iconStyle={{}}
                color={value && value.done_at ? $color.white : $color.gray}
                gradientColor={
                  value && value.done_at
                    ? [$color.primary, $color.primary3l]
                    : [$color.white, $color.white]
                }
                isGradient={true}
                gradientBorder={value && value.done_at ? 0 : 1}
              />
              <View
                style={[
                  {
                    maxWidth: width * 0.5
                  }
                ]}>
                <WsText
                  size="14"
                  fontWeight="500"
                  style={{
                  }}
                  color={name ? $color.black : $color.gray}
                >
                  {name ? name : placeholderTitle}
                </WsText>

                {_systemSubclasses.length > 0 && (
                  <View
                    style={{
                      marginTop: 4
                    }}
                  >
                    <WsFlex flexWrap="wrap">
                      {_systemSubclasses.map((subClass, subClassIndex) => (
                        <WsTag
                          key={`${subClass?.id || subClassIndex}`}
                          img={subClass?.icon}
                          backgroundColor={$color.primary11l}
                          textColor={$color.primary2l}
                          style={{
                            marginTop: 4,
                            marginRight: 8
                          }}
                        >
                          {`${subClass?.name || ''}`}
                        </WsTag>
                      ))}
                    </WsFlex>
                  </View>
                )}

                {_hasTaker && (
                  <WsFlex
                    style={{
                      marginTop: 8
                    }}>
                    <WsInfo
                      labelWidth={60}
                      type={'user'}
                      label={t('執行者')}
                      value={_takerValue}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                      labelFontWeight={'400'}
                    />
                  </WsFlex>
                )}

                {_remark ? (
                  <View
                    style={{
                      marginTop: 4
                    }}
                  >
                    <WsInfo
                      labelWidth={60}
                      label={t('說明')}
                      value={_remark}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'flex-start'
                      }}
                      labelFontWeight={'400'}
                    />
                  </View>
                ) : null}

                {showMissingSystemSubclassWarning && _systemSubclasses.length === 0 && (
                  <WsFlex
                    style={{
                      marginTop: 4
                    }}
                  >
                    <WsIcon
                      color={$color.danger}
                      name={'ws-outline-warning'}
                      size={18}
                      style={{
                        marginRight: 2
                      }}
                    />
                    <WsText
                      size={12}
                      color={$color.danger}
                    >
                      {t('尚未設定領域')}
                    </WsText>
                  </WsFlex>
                )}

                {showMissingTakerWarning && !_hasTaker && (
                  <WsFlex
                    style={{
                      marginTop: 4
                    }}
                  >
                    <WsIcon
                      color={$color.danger}
                      name={'ws-outline-warning'}
                      size={18}
                      style={{
                        marginRight: 2
                      }}
                    />
                    <WsText
                      size={12}
                      color={$color.danger}
                    >
                      {t('尚未填寫執行者')}
                    </WsText>
                  </WsFlex>
                )}

                {showMissingExpiredAtWarning && !_hasExpiredAt && (
                  <WsFlex
                    style={{ marginTop: 4 }}
                  >
                    <WsIcon
                      color={$color.danger}
                      name={'ws-outline-warning'}
                      size={18}
                      style={{
                        marginRight: 2
                      }}
                    />
                    <WsText
                      size={12}
                      color={$color.danger}
                    >
                      {t('尚未設定期限')}
                    </WsText>
                  </WsFlex>
                )}

                <WsFlex
                  style={[
                    {
                    }
                  ]}>
                  {date && (
                    <WsFlex
                      style={{
                        marginTop: 4,
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
                  {value && value.expired_at && (
                    <>
                      <WsFlex
                        style={{
                          marginTop: 4,
                          marginRight: 12
                        }}>
                        <WsIcon
                          name="ws-outline-calendar-duedate"
                          size={18}
                          color={_dateCompare != undefined && _dateCompare.diff(value.expired_at, 'days') < 0 ? $color.danger : desColor}
                        />
                        <WsText
                          style={{
                            marginLeft: 4
                          }}
                          size={12}
                          color={_dateCompare != undefined && _dateCompare.diff(value.expired_at, 'days') < 0 ? $color.danger : desColor}>
                          {moment(value.expired_at).format('YYYY-MM-DD')}
                        </WsText>
                      </WsFlex>
                    </>
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

                {_dateCompare != undefined && _dateCompare.diff(value.expired_at, 'days') < 0 && (
                  <WsFlex>
                    <WsIcon
                      color={$color.danger}
                      name={'ws-outline-warning'}
                      size={14}
                    >
                    </WsIcon>
                    <WsText
                      size={12}
                      color={$color.danger}
                    >
                      {t('待辦事項期限超過任務期限')}
                    </WsText>
                  </WsFlex>
                )}

                {_linkCount > 0 && (
                  <WsFlex
                    style={{
                      marginTop: 4
                    }}
                  >
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
                      color={desColor}
                    >
                      {`${t('相關資料')} (${_linkCount})`}
                    </WsText>
                  </WsFlex>
                )}

                {attachCount != undefined && attachCount > 0 && (
                  <WsFlex
                    style={{
                      marginTop: 4,
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
                      {t('附件')} ({attachCount})
                    </WsText>
                  </WsFlex>
                )}

              </View>
            </View>
            <TouchableHighlight
              activeOpacity={0.6}
              underlayColor="transparent"
              onPress={deleteOnPress}>
              <WsIconCircle
                padding={12}
                name="ws-outline-delete"
                size={24}
                color={$color.white}
                backgroundColor={$color.danger}
              />
            </TouchableHighlight>
          </WsFlex>
        </WsCard>
      </TouchableOpacity >
    </>
  )
}

export default WsSubtaskCard
