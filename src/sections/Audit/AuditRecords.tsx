import React, { useState, useEffect } from 'react'
import { ScrollView, View } from 'react-native'
import gColor from '@/__reactnative_stone/global/color'
import {
  WsInfiniteScroll,
  WsPaddingContainer,
  WsTitle,
  WsCenter,
  WsFilter,
  WsText,
  LlAuditResultCard,
  WsPageIndex
} from '@/components'
import S_AuditRecord from '@/services/api/v1/audit_record'
import LlBtn002 from '@/components/LlBtn002'
import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import S_Processor from '@/services/app/processor'
import { useSelector } from 'react-redux'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'

interface AuditRecordsProps {
  searchValue: any;
}

interface AuditRecordItem {
  id: string;
  record_at: string;
  name: string;
  auditors: string[];
  auditees: string[];
  risk_level: string;
  audit_record_answers: any[];
  updated_at: string;
}


const AuditRecords: React.FC<AuditRecordsProps> = props => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()

  // Props
  const { searchValue } = props

  // redux
  const systemClasses = useSelector(state => state.data.systemClasses)

  //state
  const [defaultFilter] = useState({
    button: {
      range: 'nolimit'
    },
    time_field: 'created_at',
    system_subclasses: S_SystemClass.getAllSubSystemClassesId(systemClasses)
  })

  const [filterFields] = React.useState({
    button: {
      type: 'date_range',
      label: t('日期'),
      time_field: 'created_at'
    },
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    }
  })
  const [params] = useState({
    order_by: 'record_at',
    order_way: 'desc',
    start_time: moment().subtract(3, 'months').format('YYYY-MM-DD'),
    end_time: moment().format('YYYY-MM-DD'),
    time_field: 'record_at'
  })

  // Helper functions with type annotations
  const $_riskColor = (risk_level: string): string => {
    return S_AuditRecord.getRiskColor(risk_level);
  };
  const $_riskIcon = (risk_level: string): string => {
    return S_AuditRecord.getRiskIcon(risk_level);
  };
  const $_riskBgColor = (risk_level: string): string => {
    return S_AuditRecord.getRiskBgColor(risk_level);
  };
  const $_countScores = (answers: any[]): number => {
    return S_AuditRecord.getRiskEachCount(answers);
  };

  return (
    <>
      <WsPageIndex
        modelName={'audit_record'}
        serviceIndexKey={'factoryIndex'}
        params={params}
        extendParams={searchValue}
        filterFields={filterFields}
        defaultFilterValue={defaultFilter}
        renderItem={({ item, index, items }: { item: AuditRecordItem; index: number; items: AuditRecordItem[] }) => {
          const lastItem = index == 0 ? item : items[index - 1]
          const lastMonth = moment(lastItem.record_at).format('YYYY-MM')
          const currentMonth = moment(item.record_at).format('YYYY-MM')
          return (
            <View key={index}>
              {(index == 0 || currentMonth != lastMonth) && (
                <WsCenter>
                  <WsTitle
                    fontSize={16}
                    fontWeight="700"
                    letterSpacing={1}
                    style={{
                      padding: 8
                    }}>
                    {moment(item.record_at).format('YYYY-MM')}
                  </WsTitle>
                </WsCenter>
              )}
              <LlAuditResultCard
                testID={`LlAuditResultCard-${index}`}
                item={item}
                auditResultTitle={item.name}
                auditors={item.auditors}
                auditees={item.auditees}
                iconColor={$_riskColor(item.risk_level)}
                num={$_countScores(item.audit_record_answers)}
                icon={$_riskIcon(item.risk_level)}
                iconBgc={$_riskBgColor(item.risk_level)}
                onPress={() => {
                  navigation.push('AuditRecordsShow', {
                    id: item.id
                  })
                }}
                date={moment(item.updated_at).format('YYYY-MM-DD')}
                style={{
                  marginVertical: 8
                }}
              />
            </View>
          )
        }}
      >
      </WsPageIndex>
    </>
  )
}

export default AuditRecords
