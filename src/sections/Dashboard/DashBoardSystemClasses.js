import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableHighlight,
  Image,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback
} from 'react-native'
import {
  WsGrid,
  WsPaddingContainer,
  LlNavButton003,
  WsText,
  WsFlex,
  WsSkeleton,
  WsIcon
} from '@/components'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import S_SystemClassAnalysis from '@/services/api/v1/systemclass_analysis'
import { TouchableOpacity } from 'react-native-gesture-handler'
import factory from '@/helpers/factory'

const DashBoardSystemClasses = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  const {
    routePrefix,
    navigation,
    item,
    type,
    unit
  } = props

  // STATE
  const [tooltipVisible, setTooltipVisible] = React.useState(false)
  const [tooltipText, setTooltipText] = React.useState('')
  const [loading, setLoading] = React.useState(true)
  const [data, setData] = React.useState()

  // Redux
  const systemClasses = useSelector(state => state.data.systemClasses)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentViewMode = useSelector(state => state.data.currentViewMode)
  const currentOrganization = useSelector(state => state.data.currentOrganization)

  // API
  const $_fetchAnalysisData = async () => {
    try {
      const params = {
        factory: unit && unit.id ? unit.id : currentFactory?.id,
        start_time: moment().format('YYYY-MM-DD'),
        end_time: moment().format('YYYY-MM-DD'),
        time_field: 'created_at'
      }
      const res = await S_SystemClassAnalysis.indexV2({ params: params })
      setData(res.data)
      setLoading(false)
    } catch (e) {
      console.error(e);
    }
  }

  // HELPER
  const queryRiskType = (type, routePrefix, _data) => {
    return S_SystemClassAnalysis.queryRiskTypeDataByRoutePrefix(type, routePrefix, _data)
  }
  const queryLabel001 = (routePrefix) => {
    return S_SystemClassAnalysis.queryLabel001(routePrefix)
  }
  const queryLabel002 = (routePrefix) => {
    return S_SystemClassAnalysis.queryLabel002(routePrefix)
  }

  // Function
  const $_setDesText = (systemClass, type) => {
    const foundItem = data.find(item => item.system_class && item.system_class.id === systemClass.id);
    if (foundItem) {
      const _desText = queryRiskType(type, routePrefix, foundItem);
      return _desText
    } else {
      return ''
    }
  }

  const handleLongPress = (type, routePrefix) => {
    if (type == 'add') {
      setTooltipText(`${S_SystemClassAnalysis.toolTipText001(routePrefix)}`)
    }
    if (type == 'total') {
      setTooltipText(`${S_SystemClassAnalysis.toolTipText002(routePrefix)}`)
    }
    setTooltipVisible(true)
  };

  const handlePress = (type, routePrefix) => {
    if (type == 'add') {
      setTooltipText(`${S_SystemClassAnalysis.toolTipText001(routePrefix)}`)
    }
    if (type == 'total') {
      setTooltipText(`${S_SystemClassAnalysis.toolTipText002(routePrefix)}`)
    }
    setTooltipVisible(!tooltipVisible)
  };

  const handlePressOut = () => {
    setTooltipVisible(false)
  };

  React.useEffect(() => {
    $_fetchAnalysisData()
  }, [])

  return (
    <>
      {loading ? (
        <WsSkeleton></WsSkeleton>
      ) : (
        <>
          {tooltipVisible && (
            <View
              style={{
                backgroundColor: $color.gray,
                position: 'absolute',
                top: 32,
                margin: 8,
                padding: 8,
                borderRadius: 5,
                zIndex: 999
              }}
            >
              <WsText color={$color.white} size={18}>{tooltipText}</WsText>
            </View>
          )}

          <WsFlex
            style={{
              paddingHorizontal: 16,
              paddingTop: 16,
            }}
            alignItems="center"
            justifyContent="space-between"
          >
            <View
              style={{
                height: 30, // 250526-issue
                width: width * 0.525, // 250526-issue
                // borderWidth: 1,
              }}
            ></View>

            {systemClasses && systemClasses.length > 0 && (
              <WsFlex
                flexWrap={'wrap'}
                alignItems="center"
                justifyContent="space-between"
                style={{
                  minWidth: width * 0.325,
                  // borderWidth: 1,
                }}
              >
                <TouchableOpacity
                  style={{
                  }}
                  delayLongPress={100}
                  onLongPress={() => handleLongPress('add', routePrefix)}
                  onPress={(() => handlePress('add', routePrefix))}
                  onPressOut={handlePressOut}
                >
                  <WsFlex
                    style={{
                      marginRight: 16
                    }}
                  >
                    <WsText color={$color.gray}>{queryLabel001(routePrefix)}</WsText>
                    <WsIcon style={{}} name="md-info-outline"></WsIcon>
                  </WsFlex>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    // width: width * 0.1,
                    // borderWidth:1,
                  }}
                  delayLongPress={100}
                  onLongPress={() => handleLongPress('total', routePrefix)}
                  onPress={(() => handlePress('total', routePrefix))}
                  onPressOut={handlePressOut}
                >
                  <WsFlex
                    style={{
                      flexWrap: 'nowrap',
                    }}
                  >
                    <WsText color={$color.gray}>{queryLabel002(routePrefix)}</WsText>
                    <WsIcon style={{}} name="md-info-outline"></WsIcon>
                  </WsFlex>
                </TouchableOpacity>
              </WsFlex>
            )}
          </WsFlex>

          {systemClasses && systemClasses.length > 0 &&
            systemClasses.map((systemClass, systemClassIndex) => {
              return (
                <View
                  style={{
                    backgroundColor: 'white',
                    margin: 4,
                    borderRadius: 10,
                  }}
                >
                  <LlNavButton003
                    testID001={`dynamic-number-${systemClass.name}-新增`}
                    testID002={`dynamic-number-${systemClass.name}-累計`}
                    iconRightVisible={false}
                    paddingVertical={0}
                    disabled={true}
                    onPress={() => {
                    }}
                    textRightOnPress={() => {
                      console.log(routePrefix, 'routePrefix');
                      navigation.navigate({
                        name: routePrefix,
                        params: {
                          systemClass: systemClass,
                          type: 2
                        }
                      })
                    }}
                    textRight002OnPress={() => {
                      console.log(routePrefix, 'routePrefix');
                      navigation.navigate({
                        name: routePrefix,
                        params: {
                          systemClass: systemClass,
                          type: 1
                        }
                      })
                    }}
                    key={systemClassIndex}
                    imageLeft={systemClass.icon ? systemClass.icon : ' '}
                    textRight002={$_setDesText(systemClass, 'add') == 0 ? `${$_setDesText(systemClass, 'add')}` : `${queryLabel001(routePrefix) === '新增' ? '+' : ''}${$_setDesText(systemClass, 'add')}`}
                    textRight={`${$_setDesText(systemClass, 'count')}`}
                    iconRightSize={24}
                    textRightSize={16}
                    fontColor={
                      $_setDesText(systemClass) == 0 ? $color.gray : $color.black2l
                    }
                    activeOpacity={$_setDesText(systemClass) == 0 ? 1 : 0.2}
                    title={t(systemClass.name)}
                    textRight002Color={$_setDesText(systemClass, 'add') != 0 ? $color.primary : $color.gray}
                    textRightColor={$_setDesText(systemClass, 'count') != 0 ? $color.primary : $color.gray}
                  >
                  </LlNavButton003>
                </View>
              )
            })}
          {data && (
            <>
              <WsFlex
                style={{
                  marginTop: 32
                }}
                justifyContent={'center'}>
                <WsText color={$color.gray}>{`${i18next.t('更新時間')}  ${moment(data[0].updated_at).format("YYYY-MM-DD HH:mm:ss")}`}</WsText>
              </WsFlex>
              <WsFlex
                style={{
                  marginTop: 16
                }}
                justifyContent={'center'}>
                <WsText color={$color.gray}>
                  {t('單一數量可能涉及數個領域')}
                </WsText>
              </WsFlex>
            </>
          )}
        </>
      )}

    </>
  )
}

export default DashBoardSystemClasses
