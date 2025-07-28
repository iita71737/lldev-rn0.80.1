import React from 'react'
import { View, TouchableHighlight, Dimensions } from 'react-native'
import { WsText } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart
} from 'react-native-chart-kit'
import layouts from '@/__reactnative_stone/global/layout'
import { useTranslation } from 'react-i18next'

const WsChartBarChart = props => {
  const { t, i18n } = useTranslation()
  const { windowWidth } = layouts
  const screenWidth = Dimensions.get('window').width
  // Props
  const {
    style,
    value,
    fields,
    items,
    yAxisTitle,
    width = screenWidth * 0.8,
    height = 256,
    lineWidth
  } = props

  // State
  const [C_data, C_SetData] = React.useState({
    labels: [],
    legend: [],
    datasets: [
      {
        data: [],
      }
    ],
    barColors: []
  })

  // customize Y-Axis Label from data
  // function* yLabel() {
  //   if (C_data.data.length > 0) {
  //     let arr = [0]
  //     let avg = 0
  //     let max
  //     let min
  //     C_data.data.forEach((item, index) => {
  //       let sum = 0
  //       item.forEach((num, index) => {
  //         sum += num
  //       })
  //       arr.push(sum)
  //     })
  //     arr.sort(function (a, b) {
  //       return a - b
  //     })
  //     max = Math.max(...arr)
  //     min = Math.min(...arr)
  //     avg = Math.round(max / C_data.data.length)
  //     _newArr = [
  //       min,
  //       min + avg,
  //       min + avg * 2,
  //       min + avg * 3,
  //       min + avg * 4,
  //       min + avg * 5,
  //       max
  //     ]
  //     yield* _newArr
  //   } else {
  //     yield* [0, 1, 2, 3, 4, 5, 6]
  //   }
  // }
  // const yLabelIterator = yLabel()
  const chartConfig = {
    backgroundGradientFrom: 'transparent',
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: 'transparent',
    backgroundGradientToOpacity: 0,
    labelColor: () => $color.black2l,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.75,
    fillShadowGradientOpacity: 0,
    propsForBackgroundLines: {
      stroke: '#f0f0f0',
      strokeDasharray: ''
    },
    propsForLabels: {
      fontSize: 12,
      lineHeight: 12,
      fill: $color.black2l
    },
    propsForVerticalLabels: {
      dx: '-5,3,10,20,10,10',
      textAnchor: 'middle'
    },
    propsForHorizontalLabels: {},
    style: {
      borderRadius: 16
    }
  }

  // Function
  const $_setData = () => {
    const _data = {
      legend: Object.keys(fields),
      labels: items,
      datasets: [
        {
          data: []
        }
      ]
    }
    const dd_data = []
    value.forEach((item, itemIndex) => {
      const itemData = []
      let fieldsIndex = 0
      for (let fieldKey in fields) {
        if (item[fieldKey]) {
          if (fieldsIndex == itemData.length) {
            itemData.push(item[fieldKey])
          } else {
            for (let i = itemData.length; i < fieldsIndex; i++) {
              itemData.splice(i, 0, 0)
            }
            itemData.push(item[fieldKey])
          }
        }
        fieldsIndex++
      }
      dd_data.push(itemData)
    })
    _data.datasets[0].data = dd_data

    // Color
    const _color = []
    for (let fieldKey in fields) {
      _color.push(fields[fieldKey].color)
    }
    _data.barColors = _color
    C_SetData(_data)
  }

  React.useEffect(() => {
    $_setData()
  }, [value, fields, items])

  // Render
  return (
    <TouchableHighlight activeOpacity={1} underlayColor="transparent">
      <View>
        {yAxisTitle && (
          <WsText
            style={{
              marginBottom: 10,
              marginTop: 17,
              fontSize: 12,
              fontWeight: '700',
              lineHeight: 18,
              letterSpacing: 0.8,
              color: $color.black2l
            }}>
            {t(yAxisTitle)}
          </WsText>
        )}
        <BarChart
          data={C_data}
          chartConfig={chartConfig}
          width={width}
          height={height}
          yLabelsOffset={28}
          yAxisLabel={t('')}
          yAxisSuffix={t('')}
          xLabelsOffset={-4}
          decimalPlaces={0}
          segments={6}
          blurOpacity={0.3}
          hideLegend={true}
        />
      </View>
    </TouchableHighlight>
  )
}

export default WsChartBarChart
