import React from 'react'
import { 
  View, 
  TouchableOpacity, 
  Dimensions, 
  Text 
} from 'react-native'
import {
  WsText,
  WsSectionTitle,
  WsToggleBtn,
  WsIconBtn,
  WsSkeleton,
  WsLoading,
  WsIcon,
  WsFlex,
} from '@/components'
import { useTranslation } from 'react-i18next'
import store from '@/store'
import { useSelector } from 'react-redux'
import {
  setCurrentFactory,
  setCurrentViewMode,
  setUserScopes,
} from '@/store/data'
import $color from '@/__reactnative_stone/global/color'
import { NativeModules, ScrollView } from 'react-native'
import AsyncStorage from '@react-native-community/async-storage';

const WsMultiLayerToggle = (props) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window').width


  const {
    items,
    itemIndex,
    selectedItem,
    layerPaddingLeft = 16,
    onPress,
    parent
  } = props

  const [collapse, setCollapse] = React.useState(parent ? Array.from(parent, (n, index) => { return false }) : [])

  return (
    <>
      <WsFlex style={{ backgroundColor: $color.white, }}>
        {items && items.items && items.items.length > 0 && (
          <TouchableOpacity
            style={{
              backgroundColor: $color.white,
              paddingLeft: layerPaddingLeft
            }}
            onPress={() => {
              const _arr = [...collapse];
              _arr[itemIndex] = !_arr[itemIndex]
              setCollapse(_arr)
            }}
          >
            <WsIcon
              style={{
                paddingVertical: 15
              }}
              size={24}
              name={collapse[itemIndex] ? "bih-chevron-up" : "bih-chevron-down"}
            >
            </WsIcon>
          </TouchableOpacity>
        )
        }
        <WsToggleBtn
          textStyle={{
            // borderWidth: 2,
            paddingLeft: items && items.items && items.items.length > 0 ? 0 : layerPaddingLeft
          }}
          key={itemIndex}
          isActive={
            selectedItem && (selectedItem == items.id)
              ? true
              : false
          }
          type="b"
          onPress={() => onPress(parent[itemIndex])}>
          {items.name ? items.name : items.label}
        </WsToggleBtn>
      </WsFlex>

      {collapse[itemIndex] && items && items.items && items.items.map((_item, itemIndex) => {

        return (
          <>
            <WsMultiLayerToggle
              parent={items.items}
              items={_item}
              itemIndex={itemIndex}
              selectedItem={selectedItem}
              layerPaddingLeft={60}
              onPress={onPress}
            ></WsMultiLayerToggle>
          </>
        )
      })
      }

    </>
  )
}

export default WsMultiLayerToggle