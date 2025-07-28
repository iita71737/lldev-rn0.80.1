import React, { useEffect } from 'react'
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps'
import { View, Dimensions, Text, Image, TouchableOpacity } from 'react-native'
import {
  WsAvatar,
  WsText,
  WsBottomSheetSelect,
  WsPanel,
  LlRiskCircleBubble,
  WsFlex,
  WsIcon
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const WsMap = props => {
  const { t, i18n } = useTranslation()
  // Dimension
  const { width, height } = Dimensions.get('window')

  // Configuration for gMap
  const ASPECT_RATIO = width / height
  const LATITUDE_DELTA = 0.0922
  const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO

  //props
  const {
    userCoordinate,
    circleBubble = false,
    statePicker = [
      // { label: '瀏覽所有領域', value: 'all' },
      { label: '環保', value: 'envProtection' },
      { label: '生產安全', value: 'productionSafety' },
      { label: '勞工及職業病', value: 'laborAndOccupationalDisease' },
      { label: '專門領域', value: 'specializedField' }
    ],
    navigation,
    panelInfo = {
      name: 'test',
      factoryCount: 99,
      checkResultPercent: null,
      newAddCheckEvent: null,
      todayRiskLevel: $color.danger
    },
    setPanelInfo,
    markerOnPress,
    units,
    todayAnalysis
  } = props

  const flatUnits = units.flatMap(unit => [unit, ...(unit.child_factories || [])])

  // States
  const [region, setRegion] = React.useState(userCoordinate)
  const [pickItemArr, setPickItemArr] = React.useState(statePicker)
  const [toggleListOrDetail, setToggleListOrDetail] = React.useState(false)
  const [bottomSheetIsActive, setBottomSheetIsActive] = React.useState(false)

  const [todayData, setTodayData] = React.useState()


  // Function
  const $_onBottomSheetItemPress = item => {
    const updatePickItemArr = pickItemArr.map(r => {
      r.checked = false
      if (r.label === item.label) {
        r.checked = true
        return r
      }
      return r
    })
    setPickItemArr(updatePickItemArr)
  }

  const $_selectedMarker = (item) => {
    let _selectedUnitData
    todayAnalysis.forEach(_fac => {
      if (_fac.factory.id == item.id) {
        _selectedUnitData = _fac
      }
    })
    // console.log(_selectedUnitData,'_selectedUnitData');
    setTodayData(_selectedUnitData)
  }

  // Render
  return (
    <>
      <MapView
        style={{
          flex: 1
        }}
        showsMyLocationButton={true}
        provider={PROVIDER_GOOGLE}
        region={region ? region : ''}
        // onRegionChange={setRegion}
        showsUserLocation={false}>
        {flatUnits && flatUnits.length > 0 ? (
          flatUnits.map((marker, index) => (
            <>
              <Marker
                key={index}
                anchor={{ x: 0.15, y: 0.7 }}
                image={
                  marker
                    ? require('@/__reactnative_stone/assets/img/iconFlag.png')
                    : ''
                }
                title={marker.name}
                description={marker.address}
                coordinate={{
                  latitude: marker.lat != null ? parseFloat(marker.lat) : 31.16566,
                  longitude: marker.lng != null ? parseFloat(marker.lng) : 130.3933532,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421
                }}
                onPress={() => {
                  setRegion({
                    latitude: parseFloat(marker.lat),
                    longitude: parseFloat(marker.lng),
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA
                  })
                  markerOnPress(marker)
                  setToggleListOrDetail(true)
                  $_selectedMarker(marker)
                }}>
                {circleBubble && (
                  <LlRiskCircleBubble
                    opacity={0.6}
                    riskDegree={marker.riskDegree ? marker.riskDegree : null}
                    complianceRate={18}
                  />
                )}
              </Marker>
            </>
          ))
        ) : (
          <Marker
            draggable
            coordinate={{
              latitude: 25.091593,
              longitude: 121.43958,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421
            }}
            title="example title"
            description="example description"
          />
        )}
      </MapView>
      {userCoordinate && toggleListOrDetail && (
        <View
          style={{
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: $color.white,
            paddingVertical: 8,
            paddingHorizontal: 16,
            top: 18,
            left: 10,
            borderRadius: 5
          }}>
          <TouchableOpacity
            onPress={() => {
              setRegion({ ...userCoordinate })
              setToggleListOrDetail(false)
            }}>
            <WsFlex>
              <WsIcon
                size={18}
                name={'md-arrow-back'}
              />
              <WsText style={{ marginLeft: 8 }}>{toggleListOrDetail ? t('返回') : t('返回')}</WsText>
            </WsFlex>
          </TouchableOpacity>
        </View>
      )}
      {userCoordinate && (
        <View
          style={{
            position: 'absolute',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: $color.white,
            width: 46,
            height: 46,
            paddingVertical: 8,
            paddingHorizontal: 16,
            top: 18,
            right: 10,
            borderRadius: 5
          }}>
          <TouchableOpacity
            onPress={() => {
              setRegion({ ...userCoordinate })
              setToggleListOrDetail(false)
            }}>
            <Image
              size={50}
              source={require('@/__reactnative_stone/assets/img/iconZoomOut.png')}
            />
          </TouchableOpacity>
        </View>
      )}
      {bottomSheetIsActive && (
        <WsBottomSheetSelect
          isActive={bottomSheetIsActive}
          onDismiss={() => {
          }}
          items={pickItemArr ? pickItemArr : ''}
          snapPoints={['25%', '30%']}
          onItemPress={$_onBottomSheetItemPress}
        />
      )}
      {!bottomSheetIsActive && (
        <View
          style={{
            position: 'absolute',
            height: toggleListOrDetail ? 148 : 112,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: $color.white,
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25
          }}>
          <WsPanel
            units={units}
            todayData={todayData}
            panelInfo={panelInfo}
            navigation={navigation}
            toggleListOrDetail={toggleListOrDetail}
          />
        </View>
      )}
    </>
  )
}

export default WsMap
