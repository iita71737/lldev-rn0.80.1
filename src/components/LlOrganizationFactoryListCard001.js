import React, { useState } from 'react'
import { ScrollView } from 'react-native'
import { WsCard, WsText, WsFlex, WsDes } from '@/components'
import S_FactoryTotalAnalysis from '@/services/api/v1/factory_total'
import S_SystemClassAnalysis from '@/services/api/v1/systemclass_analysis'
import moment from 'moment'
import { useSelector } from 'react-redux'

const LlOrganizationFactoryListCard001 = props => {
  // Props
  const { factory, style } = props

  // Redux
  const systemClasses = useSelector(state => state.data.systemClasses)

  // State
  const [analyzeData, setAnalyzeData] = React.useState([])

  // Services
  const $_fetchSystemClass = async () => {
    const systemRes = await S_SystemClassAnalysis.index({
      params: {
        start_time: moment().format('YYYY-MM-DD'),
        end_time: moment().format('YYYY-MM-DD'),
        time_field: 'created_at',
        factory: factory.id
      }
    })
    const totalRes = await S_FactoryTotalAnalysis.index({
      params: {
        start_time: moment().format('YYYY-MM-DD'),
        end_time: moment().format('YYYY-MM-DD'),
        time_field: 'created_at',
        factory: factory.id
      }
    })
    const contractorRes =
      await S_SystemClassAnalysis.contractorEnterRecordIndex({
        params: {
          start_time: moment().format('YYYY-MM-DD'),
          end_time: moment().format('YYYY-MM-DD'),
          time_field: 'created_at',
          factory: factory.id
        }
      })
    const _numberData = S_SystemClassAnalysis.setNumberCardData(
      systemClasses,
      systemRes.data,
      totalRes.data,
      contractorRes.data
    )
    setAnalyzeData(_numberData)
  }

  React.useEffect(() => {
    $_fetchSystemClass()
  }, [])

  // Render
  return (
    <ScrollView>
      <WsCard style={style}>
        <WsText>{factory.name}</WsText>
        {analyzeData && (
          <>
            {analyzeData.map((data, dataIndex) => {
              return (
                <>
                  <WsFlex>
                    <WsDes style={{ marginRight: 8 }}>
                      {JSON.stringify(data.title)}
                    </WsDes>
                    <WsDes>{JSON.stringify(data.count)}</WsDes>
                  </WsFlex>
                </>
              )
            })}
          </>
        )}
      </WsCard>
    </ScrollView>
  )
}

export default LlOrganizationFactoryListCard001
