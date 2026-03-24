import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import {
  WsCard,
  WsText,
  WsFlex,
  WsIcon,
  WsInfo,
  WsLoading
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import S_InternalTrainingGroup from '@/services/api/v1/internal_training_group'

const LlRelatedTrainingGroupCard001 = props => {
  const { t } = useTranslation()

  const {
    item,
    onPress,
    style,
  } = props

  const [trainingGroup, setTrainingGroup] = React.useState(item)
  const [loading, setLoading] = React.useState(false)

  const trainingGroupId = React.useMemo(() => {
    if (!item) {
      return null
    }
    if (typeof item === 'object') {
      return item?.id
    }
    return item
  }, [item])

  const hasEnoughData = React.useMemo(() => {
    return Boolean(
      item &&
      typeof item === 'object' &&
      (item?.name !== undefined) &&
      (item?.total_trained_hours !== undefined) &&
      (item?.owner !== undefined)
    )
  }, [item])

  React.useEffect(() => {
    let isMounted = true

    const fetchTrainingGroup = async () => {
      if (!trainingGroupId) {
        if (isMounted) {
          setTrainingGroup(undefined)
          setLoading(false)
        }
        return
      }

      if (hasEnoughData) {
        if (isMounted) {
          setTrainingGroup(item)
          setLoading(false)
        }
        return
      }

      try {
        if (isMounted) {
          setLoading(true)
        }
        const res = await S_InternalTrainingGroup.show({ modelId: trainingGroupId })
        if (isMounted) {
          setTrainingGroup(res?.id ? res : item)
        }
      } catch (error) {
        console.log(error, 'LlRelatedTrainingGroupCard001 fetchTrainingGroup')
        if (isMounted) {
          setTrainingGroup(item)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchTrainingGroup()

    return () => {
      isMounted = false
    }
  }, [trainingGroupId, hasEnoughData, item])

  if (!trainingGroupId) {
    return null
  }

  return (
    <View
      style={{
        marginTop: 16
      }}
    >
      <WsText
        fontWeight={500}
        style={{
          paddingHorizontal: 16,
        }}
      >
        {t('相關教育訓練群組')}
      </WsText>

      <TouchableOpacity
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
          ]}
        >
          <WsFlex>
            <View
              style={{
                flex: 1
              }}
            >
              {/* <WsFlex>
                <WsIcon
                  name="ll-nav-training-group"
                  size={24}
                  style={{
                    marginRight: 4
                  }}
                  color={$color.primary}
                />
              </WsFlex> */}

              <WsText
                style={{
                }}
              >
                {trainingGroup?.name || t('無')}
              </WsText>

              {loading && (
                <WsFlex
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsLoading size={18} />
                </WsFlex>
              )}

              {!loading && (
                <View
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsInfo
                    label={t('總訓練時數')}
                    type="text"
                    value={
                      trainingGroup?.total_trained_hours !== undefined &&
                        trainingGroup?.total_trained_hours !== null
                        ? `${trainingGroup.total_trained_hours}`
                        : t('無')
                    }
                    labelWidth={100}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center'
                    }}
                  />

                  <WsInfo
                    label={t('管理者')}
                    type="user"
                    value={trainingGroup?.owner}
                    labelWidth={100}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 4
                    }}
                  />
                </View>
              )}

            </View>
          </WsFlex>
        </WsCard>
      </TouchableOpacity>
    </View>
  )
}

export default LlRelatedTrainingGroupCard001
