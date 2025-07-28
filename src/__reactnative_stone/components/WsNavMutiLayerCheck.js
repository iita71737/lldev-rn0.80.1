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
  WsGrid,
  WsNavCheck
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

const WsNavMutiLayerCheck = (props) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window').width

  // STATE
  const {
    parentItem,
    items,
    value,
    onChange,
  } = props

  // REDUX
  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // STATES
  const [collapse, setCollapse] = React.useState(items ? Array.from(items, (n, index) => { return true }) : [])

  // 比對
  const checkIdsInA = (array, id) => {
    return array.some(item => item.id === id);
  }

  return (
    <>
      {parentItem &&
        parentItem.name && (
          <WsNavCheck
            disabled={parentItem.is_disabled ? true : false}
            fontColor={parentItem.is_disabled ? $color.gray : $color.black}
            value={checkIdsInA(value, parentItem.id)}
            onChange={() => {
              onChange(parentItem)
            }}>
            {parentItem.name}
          </WsNavCheck>
        )}
      {items && items.length > 0 && (
        <WsGrid
          data={items}
          numColumns={1}
          keyExtractor={(item, itemIndex) => itemIndex}
          renderItem={({ item, itemIndex }) => {
            return (
              <>
                <WsFlex>
                  {item.child_factories && item.child_factories.length > 0 ? (
                    <TouchableOpacity
                      onPress={() => {
                        const _arr = [...collapse];
                        _arr[itemIndex] = !_arr[itemIndex]
                        setCollapse(_arr)
                      }}
                    >
                      <WsIcon
                        size={24}
                        name={collapse[itemIndex] ? "bih-chevron-down" : "bih-chevron-up"}
                      >
                      </WsIcon>
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={{
                        marginLeft: 24,
                      }}
                    >
                    </View>
                  )
                  }
                  <WsNavCheck
                    disabled={item.is_disabled ? true : false}
                    fontColor={item.is_disabled ? $color.gray : $color.black}
                    style={{
                      flex: 1,
                    }}
                    value={checkIdsInA(value, item.id)}
                    onChange={() => {
                      onChange(item)
                    }}>
                    {item.name}
                  </WsNavCheck>
                </WsFlex>
                {item && item.child_factories && !collapse[itemIndex] && (
                  <View
                    style={{
                      marginLeft: 16
                    }}
                  >
                    <WsNavMutiLayerCheck
                      items={item.child_factories}
                      value={value}
                      onChange={onChange}
                    ></WsNavMutiLayerCheck>
                  </View>
                )
                }
              </>
            )
          }}
        />
      )}
    </>
  )
}

export default WsNavMutiLayerCheck