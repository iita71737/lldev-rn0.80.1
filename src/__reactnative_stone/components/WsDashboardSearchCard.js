import React from 'react'
import { View, Dimensions } from 'react-native'
import {
  WsText,
  WsFlex,
  WsBtnChart,
  WsCard,
  WsTabView,
  WsIconBtn,
  WsChartItem,
  WsChartStackedBarChart,
  WsState,
  WsStateFormView
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_Color from '@/__reactnative_stone/services/app/color'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import ViewRankingList from '@/sections/Dashboard/RankingList'

const WsDashboardSearchCard = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    title = t('title...'),
    titleFontSize = 18,
    tabItems = [
      {
        value: 'value1',
        label: t('example1'),
        view: {},
        props: {}
      },
      {
        value: 'value2',
        label: t('example2'),
        view: {},
        props: {}
      }
    ],
    tabIndex = 0,
    setTabIndex,
    fields,
    onChange,
    rankingParams,
  } = props

  return (
    <View
      style={{
        marginBottom: 16,
      }}>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center'
        }}>
        <WsText
          testID={title}
          size={titleFontSize}
          fontWeight={'700'}
        >
          {t(title)}
        </WsText>
      </View>
      <WsStateFormView
        paddingBottom={0}
        backgroundColor={$color.white}
        headerRightShown={false}
        fields={fields}
        onChange={onChange}
      />
      <ViewRankingList
        rankingParams={rankingParams}
      >
      </ViewRankingList>

      {/* {tabItems && (
        <WsTabView
          items={tabItems}
          index={tabIndex}
          setIndex={setTabIndex}
          scrollEnabled={false}
          fixedContainerHeight={512}
        />
      )} */}
    </View>
  )
}

export default WsDashboardSearchCard
