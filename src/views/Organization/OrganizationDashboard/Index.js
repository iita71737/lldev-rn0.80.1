import React from 'react'
import { View } from 'react-native'
import { WsMap, WsSkeleton } from '@/components'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
// import S_organization_analysis from '@/services/api/v1/organization_analysis' //已經拔掉
import S_Factory from '@/services/api/v1/factory'
import S_FactoryTotalAnalysis from '@/services/api/v1/factory_total'

const OverViewMap = ({ navigation }) => {
  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentOrganization = useSelector(
    state => state.data.currentOrganization
  )

  // States
  const [loading, setLoading] = React.useState(true)
  const [userCoordinate, setUserCoordinate] = React.useState({
    latitude: 22.612961,
    longitude: 120.304167,
    latitudeDelta: 15,
    longitudeDelta: 15
  })
  const [pickItemArr, setPickItemArr] = React.useState([
    { label: '全部', value: 'all' },
    { label: '環保', value: 'envProtection' },
    { label: '生產安全', value: 'productionSafety' },
    { label: '勞工及職業病', value: 'laborAndOccupationalDisease' },
    { label: '專門領域', value: 'specializedField' }
  ])
  const [panelInfo, setPanelInfo] = React.useState()
  const [params, setParams] = React.useState({
    organization: currentOrganization.id
  })
  const [units, setUnits] = React.useState()
  const [todayAnalysis, setTodayAnalysis] = React.useState()

  // Services
  const $_fetchApi = async () => {
    // SET PANEL
    try {
      const params = {
        organization: currentOrganization ? currentOrganization.id : currentFactory.id
      }
      const _res = await S_Factory.userIndex({ params })
      setUnits(_res.data)
      setLoading(false)

      if (_res) {
        const _params = {
          start_time: moment().format('YYYY-MM-DD'),
          end_time: moment().format('YYYY-MM-DD'),
          time_field: 'created_at',
          factory: _res.data.map(_fac => _fac.id).toString(),
          organization: currentOrganization.id,
          get_all: 1
        }
        const _todayData = await S_FactoryTotalAnalysis.indexV2({ params: _params })
        setTodayAnalysis(_todayData.data)
      }

    } catch (err) {
      console.log(err);
    }
  }

  // Function
  const $_setParams = () => {
    const _params = {
      organization: currentOrganization && currentOrganization.id ? currentOrganization.id : null,
      ...params
    }
    setParams(_params)
  }

  const $_markerOnPress = marker => {
    const _props = {
      name: currentOrganization.name,
      factoryName: marker.name,
      checkResultPercent: null,
      newAddCheckEvent: null,
      todayRiskLevel: 0
    }
    setPanelInfo(_props)
  }

  React.useEffect(() => {
    if (currentOrganization) {
      $_setParams()
    }
  }, [currentOrganization])

  React.useEffect(() => {
    if (params && currentOrganization && currentUser) {
      $_fetchApi()
    }
  }, [params, currentOrganization, currentUser])

  // Render
  return (
    <>
      {!loading && currentUser ? (
        <WsMap
          units={units}
          todayAnalysis={todayAnalysis}
          panelInfo={{
            name: 'test',
            factoryCount: 99,
            checkResultPercent: null,
            newAddCheckEvent: null,
            todayRiskLevel: todayAnalysis && todayAnalysis.total_checklist_risk_level == 25 ? $color.danger : $color.green
          }}
          panelInfo={panelInfo}
          navigation={navigation}
          statePicker={pickItemArr}
          userCoordinate={userCoordinate}
          circleBubble={true}
          setPanelInfo={setPanelInfo}
          markerOnPress={$_markerOnPress}
        />
      ) : (
        <WsSkeleton></WsSkeleton>
      )}
    </>
  )
}
export default OverViewMap
