import React from 'react'
import { View, TouchableOpacity, SafeAreaView, Dimensions, Text } from 'react-native'
import {
  WsText,
  WsSectionTitle,
  WsToggleBtn,
  WsIconBtn,
  WsSkeleton,
  WsLoading,
  WsIcon,
  WsFlex,
  WsMultiLayerToggle
} from '@/components'
import { useTranslation } from 'react-i18next'
import store from '@/store'
import { useSelector } from 'react-redux'
import {
  setCurrentFactory,
  setCurrentViewMode,
  setUserScopes
} from '@/store/data'
import $color from '@/__reactnative_stone/global/color'
import { NativeModules, ScrollView } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';

const WsFilterMultiLayerToggle = (props) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window').width

  const {
    value = {},
    items = [
      {
        id: null,
        name: "全部",
        items: []
      },
      {
        id: 44,
        name: "本單位",
        items: []
      },
      {
        "id": 10,
        "name": "台北廠",
        "subscriptions": [
          "checklist",
          "change",
          "license",
          "training",
          "event",
          "audit",
          "contractor"
        ],
        "items": [
          {
            "id": 51,
            "name": "台北廠轄下單位",
            "subscriptions": [
              "checklist",
              "change",
              "license",
              "training",
              "event",
              "audit",
              "contractor"
            ],
            "items": []
          }
        ]
      }
    ],
    onChange
  } = props

  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)

  const [selectedItem, setSelectedItem] = React.useState(value ? value : null)

  // UNIT_ON_PRESS
  const onPressUnit = (unit) => {
    if (unit.id) {
      setSelectedItem(unit.id)
      onChange(unit.id)
    }
  }


  return (
    <ScrollView scrollIndicatorInsets={{ right: 1 }}>
      {
        items.map((_item, itemIndex) => {
          return (
            <WsMultiLayerToggle
              parent={items}
              items={_item}
              itemIndex={itemIndex}
              selectedItem={selectedItem}
              onPress={onPressUnit}
            ></WsMultiLayerToggle>
          )
        })}
    </ScrollView>
  )
}

export default WsFilterMultiLayerToggle