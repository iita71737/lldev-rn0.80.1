import * as React from 'react'
import { useRef, useEffect } from 'react'
import {
  View,
  Dimensions,
  StyleSheet,
  Platform,
} from 'react-native'
import { useTranslation } from 'react-i18next'
import * as echarts from 'echarts/core'
import { BarChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent
} from 'echarts/components'
import { SVGRenderer, SkiaChart, SvgChart } from '@wuba/react-native-echarts'

// register extensions
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  SVGRenderer,
  BarChart
])

const E_HEIGHT = 250
const E_WIDTH = Dimensions.get('screen').width

function SkiaComponent({ option }: any) {
  const skiaRef = useRef<any>(null)

  useEffect(() => {
    let chart: any
    if (skiaRef.current) {
      // @ts-ignore
      chart = echarts.init(skiaRef.current, 'light', {
        renderer: 'svg',
        width: E_WIDTH,
        height: E_HEIGHT
      })
      chart.setOption(option)
    }
    return () => chart?.dispose()
  }, [option])

  return <SkiaChart ref={skiaRef} />
}

function SvgComponent({ option }: any) {
  const svgRef = useRef<any>(null)

  useEffect(() => {
    let chart: any
    if (svgRef.current) {
      // @ts-ignore
      chart = echarts.init(svgRef.current, 'light', {
        renderer: 'svg',
        width: E_WIDTH,
        height: E_HEIGHT
      })
      chart.setOption(option)
    }
    return () => chart?.dispose()
  }, [option])

  return <SvgChart ref={svgRef} />
}

// E_CHART_DEFAULT_OPTION
// const option = {
//   legend: {
//     data: ['所有領域', 'Evaporation']
//   },
//   xAxis: {
//     type: 'category',
//     axisTick: { show: false },
//     data: ['1月', '2月', '3月', '4月', '5月', '6月']
//   },
//   yAxis: {
//     type: 'value',
//     scale: true,
//     name: '數量',
//     max: function (value) {
//       return value.max + 10
//     },
//     min: 0,
//     interval: 2,
//     minInterval: 1,
//     maxInterval: 6,
//     splitNumber : 6,
//     boundaryGap: [0.2, 0.2]
//   },
//   series: [
//     {
//       name: '所有領域',
//       data: data2,
//       type: 'bar',
//       barWidth: '30%',
//       emphasis: {
//         focus: 'series'
//       },
//     },
//   ],
//   grid: {
//     bottom: '3%',
//     containLabel: true,
//   },
//   tooltip: {
//     trigger: 'axis',
//     axisPointer: {
//       type: 'shadow'
//     }
//   },
//   toolbox: {
//     show: true,
//     orient: 'vertical',
//     left: 'right',
//     top: 'center',
//     feature: {
//       mark: { show: true },
//       dataView: { show: true, readOnly: false },
//       magicType: { show: true, type: ['line', 'bar', 'stack'] },
//       restore: { show: true },
//       saveAsImage: { show: true }
//     }
//   },
// }

interface Fields {
  [key: string]: {
    color: string
    label: string
    source: object
  }
}

interface DataItem {
  [key: string]: number
}

interface Props {
  style?: any
  value: DataItem[]
  fields: Fields
  items: any[]
  yAxisTitle: string
  width?: number
  height?: number
  lineWidth?: number
}

const WsChartStackedBarChart = (props: Props) => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    value,
    fields,
    items,
  } = props

  // State
  const [option, setOption] = React.useState({
    // WARNING FOR NO-USE E-CHART USE IMPORT 
    // legend: {
    //   data: [
    //     '所有領域',
    //     '環保',
    //     '專門領域',
    //     '勞工及職業病',
    //     '生產安全',
    //     '通用領域'
    //   ]
    // },
    xAxis: {
      type: 'category',
      axisTick: { show: false },
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      // name: t('月'),
    },
    yAxis: {
      type: 'value',
      scale: true,
      name: t('數量'),
      min: 0,
      max: 6,
      minInterval: 1
    },
    series: [
      {
        name: t('全部'),
        data: [0, 0, 0, 0, 0, 0],
        type: 'bar',
        barWidth: '30%',
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          // color: '#a90000'
        }
      }
    ],
    grid: {
      bottom: '3%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    // toolbox: {
    //   show: true,
    //   orient: 'vertical',
    //   left: 'right',
    //   top: 'center',
    //   feature: {
    //     mark: {show: true},
    //     dataView: {show: true, readOnly: false},
    //     magicType: {show: true, type: ['line', 'bar', 'stack']},
    //     restore: {show: true},
    //     saveAsImage: {show: true}
    //   }
    // }
  })

  // FOR ECHART
  const $_setEChartData = () => {
    let _option = JSON.parse(JSON.stringify(option))
    const dd_data: number[] = []
    let itemData: number
    let itemLabel: string = ''
    let itemTheme: string = ''
    let key: string[] | undefined

    value.forEach((item, itemIndex) => {
      key = Object.keys(item)
      switch (key[0]) {
        case 'all':
          itemData = item['all']
          itemLabel = fields && key[0] && fields[key[0]] && fields[key[0]].label
          itemTheme = fields && key[0] && fields[key[0]] && fields[key[0]].color
          break
        case key[0]:
          itemData = item[key[0]]
          itemLabel = fields && key[0] && fields[key[0]] && fields[key[0]].label
          itemTheme = fields && key[0] && fields[key[0]] && fields[key[0]].color
          break
        default:
          itemData = 0
          break
      }
      dd_data.push(itemData)
    })
    _option.xAxis.data = items
    _option.series[0].data = dd_data
    _option.series[0].itemStyle.color = itemTheme
    _option.series[0].name = itemLabel
    _option.yAxis.min = 0
    _option.yAxis.max = 'dataMax'
    if (dd_data && dd_data.length > 0) {
      const _maxNumber = Math.max(...dd_data.filter(Number.isInteger))
      let remainder = (_maxNumber * 1.5 - 0) % 6
      let maxRange =
        remainder > 0 ? _maxNumber * 1.5 + (6 - remainder) : _maxNumber * 1.5
      let gap = (maxRange - 0) / 6
      _option.yAxis.max = maxRange
      _option.yAxis.interval = gap
    } else {
      _option.yAxis.max = 6
      _option.yAxis.interval = 1
    }
    setOption(_option)
  }

  React.useEffect(() => {
    $_setEChartData()
  }, [value])

  // Render
  return (
    <>
      <View
        testID={'WsChartStackedBarChart'}
      >
        <View style={styles.container}>
          {/* {Platform.OS === 'ios' ? (
            // iPhone 15 Pro Max Layout issues
            <SkiaComponent option={option} />
          ) : ( */}
          <SvgComponent option={option} />
          {/* )} */}
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default WsChartStackedBarChart
