import React, { useState, useEffect, useCallback } from 'react'
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity
} from 'react-native'
import {
  WsFilter,
  WsPaddingContainer,
  WsCard,
  WsText,
  WsCenter,
  WsSkeleton,
  LlCheckListRecordCard003,
  LlBtn002,
  WsEmpty,
  WsIconBtn,
  WsPageIndex,
  WsFilter002,
  WsIcon,
  WsRemindPopup,
  WsFlex
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

interface CheckListRecordsProps {
  frequency: string;
}

const CheckListRecords: React.FC<CheckListRecordsProps> = props => {
  const navigation = useNavigation()
  const { t, i18n } = useTranslation()

  // Props
  const {
    frequency,
  } = props

  // State
  const [params] = React.useState({
    frequency: frequency ? frequency : undefined,
    end_date: moment().utc().format('YYYY-MM-DD'),
    start_date: moment().subtract(3, 'months').utc().format('YYYY-MM-DD'),
    get_all: 1 // NEED IT
  })

  const [defaultFilter] = useState({
    button: {
      range: 'nolimit',
      end_date: moment().format('YYYY-MM-DD'),
      start_date: moment().subtract(90, 'days').format('YYYY-MM-DD'),
    },
    time_field: 'record_at',
  })
  const [filterFields] = React.useState({
    button: {
      type: 'date_range002',
      label: i18next.t('日期'),
      time_field: 'record_at'
    }
  })

  // HELPER FOR WEEK
  const splitDateString = (dateString) => {
    return S_CheckListRecord.getSplitDateString(dateString)
  }

  // HELPER FOR MONTH
  const getStartAndEndDates = (monthStr) => {
    return S_CheckListRecord.getStartAndEndDates(monthStr)
  }

  const remindContent = () => {
    return (
      <>
        <WsFlex
          style={{
            marginBottom: 8,
          }}
        >
          <WsIcon
            name={'ws-filled-check-circle'}
            size={24}
            color={$color.green}
            style={{
              marginLeft: 2,
              marginRight: 4
            }}
          ></WsIcon>
          <WsText>{t('無異常')}</WsText>
        </WsFlex>
        <WsFlex
          style={{
            marginBottom: 8
          }}
        >
          <WsIcon
            name="ws-filled-risk-medium"
            size={26}
            color={$color.blue}
            style={{
              marginRight: 4
            }}
          ></WsIcon>
          <WsText>{t('低風險')}</WsText>
        </WsFlex>
        <WsFlex
          style={{
            marginBottom: 8
          }}
        >
          <WsIcon
            name="ws-filled-risk-medium"
            size={26}
            color={$color.yellow}
            style={{
              marginRight: 4
            }}
          ></WsIcon>
          <WsText>{t('中風險')}</WsText>
        </WsFlex>
        <WsFlex
          style={{
            marginBottom: 8
          }}
        >
          <WsIcon
            name="ws-filled-risk-high"
            size={26}
            color={$color.danger}
            style={{
              marginRight: 4
            }}
          ></WsIcon>
          <WsText>{t('高風險')}</WsText>
        </WsFlex>
        <WsFlex
          style={{
            marginBottom: 8
          }}
        >
          <WsIcon
            name="ws-filled-none"
            size={24}
            color={$color.gray}
            style={{
              marginRight: 4
            }}
          ></WsIcon>
          <WsText>{t('不需點檢')}</WsText>
        </WsFlex>
      </>
    )
  }

  // helper
  // const formatDateRange = (dateRange: string): string => {
  //   if (!dateRange) return ''
  //   const [start, end] = dateRange.split('-').reduce((acc, cur, index) => {
  //     if (index < 3) {
  //       acc[0] += (index === 0 ? '' : '-') + cur
  //     } else {
  //       acc[1] += (index === 3 ? '' : '-') + cur
  //     }
  //     return acc
  //   }, ['', ''])
  //   return `${start} ~ ${end}`
  // }

  console.log(params,'params b-');

  return (
    <>
      <WsPageIndex
        modelName={'checklist_record'}
        serviceIndexKey={'analysisIndex'}
        hasMeta={false}
        getAll={true}
        params={params}
        filterFields={filterFields}
        defaultFilterValue={defaultFilter}
        ListHeaderComponent={() => {
          <>
            <WsRemindPopup
              remind={t('請注意"已完成數量"包含了排程作業和臨時性作業，因此有可能超出原先排程設定的共應完成總筆數。')}
              remindBtnDisabled={true}
            >
            </WsRemindPopup>
            <WsRemindPopup
            >
              {remindContent()}
            </WsRemindPopup>
          </>
        }}
        renderItem={({ item, index, isLastItem }) => {
          return (
            <>
              <WsPaddingContainer>
                <WsCenter
                  style={{
                    marginHorizontal: 16,

                  }}
                  key={index}
                >
                  {item.ststem_class && item.date && (
                    <WsText
                      style={{ marginTop: 8 }}
                      letterSpacing={1}>
                      {item.date}
                    </WsText>
                  )}
                  <LlCheckListRecordCard003
                    testID={`LlCheckListRecordCard003-${index}`}
                    item={item}
                    style={{ marginTop: 8 }}
                    onPress={() => {
                      navigation.push('CheckListItemRecord', {
                        frequency: frequency,
                        startTime:
                          item.date && frequency == 'week' ? splitDateString(item.date)._startDate :
                            item.date && frequency == 'month' ? getStartAndEndDates(item.date).startDate :
                              item.date && frequency == 'year' ? moment().subtract(3, 'months').utc().format('YYYY-MM-DD') : item.date,
                        endTime:
                          item.date && frequency == 'week' ? splitDateString(item.date)._endDate :
                            item.date && frequency == 'month' ? getStartAndEndDates(item.date).endDate :
                              item.date && frequency == 'year' ? moment().utc().format('YYYY-MM-DD') : item.date,
                        date: item.date,
                        title: item.name,
                        systemClass: item.ststem_class,
                        item: item
                      })
                    }}
                  />
                </WsCenter>
              </WsPaddingContainer>
            </>
          )
        }}
      >
      </WsPageIndex>
    </>
  )
}

export default CheckListRecords
