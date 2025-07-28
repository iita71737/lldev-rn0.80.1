import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import {
  WsPaddingContainer,
  WsText,
  WsInfo,
  WsBtn,
  WsHtmlRender,
  LlNavButton002,
  WsGradientButton,
  WsIconBtn,
  LlTaskCard001
} from '@/components'
import AsyncStorage from '@react-native-community/async-storage'
import $color from '@/__reactnative_stone/global/color'
import S_Broadcast from '@/services/api/v1/ll_broadcast'
import S_Task from '@/services/api/v1/task'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { StackActions } from '@react-navigation/native'

const BroadCastShow = ({ route }) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // props
  const {
    id
  } = route.params

  console.log(id,'=id=');

  // State
  const [broadcast, setBroadcast] = React.useState()
  const [tasks, setTasks] = React.useState()

  // Services
  const $_fetchApi = async () => {
    const res = await S_Broadcast.show(id)
    setBroadcast(res)
  }

  const $_fetchTask = async () => {
    const res = await S_Task.index({
      params: {
        ll_broadcast: id
      }
    })
    setTasks(res.data)
  }

  // Function
  const $_setAreasValue = broadcast => {
    return broadcast.areas.map(area => {
      return area.name
    })
  }

  const $_createTask = async () => {
    navigation.push('RoutesTask', {
      screen: 'TaskCreateFromLLBroadcast',
      params: {
        ll_broadcast: broadcast.id,
      }
    })
    await AsyncStorage.setItem(
      'TaskCreate',
      JSON.stringify({
        ll_broadcast: broadcast.id,
        system_subclasses: broadcast.system_subclasses
      })
    )
  }

  // setOption
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerLeft: () => (
        <>
          <WsIconBtn
            disabled={false}
            name={'md-arrow-back'}
            onPress={() => {
              navigation.goBack()
            }}
            size={22}
            color={$color.white}
          />
        </>
      )
    })
  }

  React.useEffect(() => {
    $_fetchApi()
    $_fetchTask()
  }, [])

  React.useEffect(() => {
    $_setNavigationOption()
  }, [])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      $_fetchApi()
      $_fetchTask()
    })
    return unsubscribe
  }, [navigation])

  // Render
  return (
    <>
      <ScrollView>
        {broadcast && (
          <>
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white,
                marginBottom: 8
              }}>
              <WsText size={24} fontWeight="600">
                {broadcast.name}
              </WsText>
            </WsPaddingContainer>
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white,
                marginBottom: 8
              }}>
              <View
                style={{
                }}
              >
                <WsInfo
                  label={t('發布時間')}
                  value={moment(broadcast.announce_at).format(
                    'YYYY-MM-DD HH:mm:ss'
                  )}
                  style={{
                    flexDirection: 'row'
                  }}
                />
              </View>

              <View
                style={{
                  marginTop: 8
                }}
              >
                <WsInfo
                  label={t('適用地區')}
                  value={$_setAreasValue(broadcast)}
                  style={{
                    flexDirection: 'row'
                  }}
                />
              </View>

            </WsPaddingContainer>
            <WsPaddingContainer
              style={{
                backgroundColor: $color.white
              }}>
              <WsText size={14} fontWeight="700">
                {t('內容')}
              </WsText>
              <WsHtmlRender content={broadcast.content} />
              {broadcast.attaches.length > 0 && (
                <WsInfo
                  label={t('附件')}
                  type="filesAndImages" value={broadcast.attaches}
                />
              )}
            </WsPaddingContainer>
            {tasks && tasks.length > 0 && (
              <>
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
                  >{t('相關任務')}
                  </WsText>
                  <LlTaskCard001
                    item={tasks[0]}
                    onPress={() => {
                      navigation.push('RoutesTask', {
                        screen: 'TaskShow',
                        params: {
                          id: tasks[0].id,
                        }
                      })
                    }}
                  />
                </View>
              </>
            )}
          </>
        )}
      </ScrollView>

      <WsPaddingContainer style={{ backgroundColor: $color.white }}>
        <WsGradientButton
          borderRadius={28}
          onPress={() => {
            $_createTask()
          }}>
          {t('建立任務')}
        </WsGradientButton>
      </WsPaddingContainer>
    </>
  )
}

export default BroadCastShow
