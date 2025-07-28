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
  WsGrid
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

const LlLvInfoMultiLayer = (props) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window').width

  // STATE
  const {
    items,
    value,
    onChange,
  } = props

  // REDUX
  const currentUser = useSelector(state => state.data.currentUser)

  // STATES
  const [collapse, setCollapse] = React.useState(items ? Array.from(items, (n, index) => { return true }) : [])

  // Function
  const $_activeCheck = (value, item) => {
    if (value && item && value.id === item.id) {
      return true
    } else {
      return false
    }
  }

  const $_onPress = item => {
    if ($_activeCheck(value, item)) {
      onChange(null)
    } else {
      onChange(item)
    }
  }

  return (
    <>
      {items && items.length > 0 && (
        <WsGrid
          data={items}
          numColumns={1}
          keyExtractor={(item, itemIndex) => itemIndex}
          renderItem={({ item, itemIndex }) => {
            return (
              <>
                <WsFlex
                  style={{
                    paddingHorizontal: 16,
                    // borderWidth: 1,
                  }}
                >
                  {item.child_factories && item.child_factories.length > 0 ? (
                    <TouchableOpacity
                      testID={`${item.name}-bih-chevron-down`}
                      onPress={() => {
                        const _arr = [...collapse];
                        _arr[itemIndex] = !_arr[itemIndex]
                        setCollapse(_arr)
                      }}
                      style={{
                        // borderWidth: 1,
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
                        marginLeft: 24
                      }}
                    >
                    </View>
                  )
                  }
                  <WsToggleBtn
                    testID={item.name}
                    isActive={$_activeCheck(value, item)}
                    type="b"
                    onPress={() => {
                      const _arr = [...collapse];
                      _arr[itemIndex] = !_arr[itemIndex]
                      setCollapse(_arr)
                      // $_onPress(item)
                    }}
                    style={{
                      // borderWidth:1,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        $_onPress(item)
                      }}
                    >
                      <WsText
                        style={{
                          top: 2,
                          // borderWidth: 1,
                        }}
                      >
                        {item.name ? item.name : item.label ? item.label : ''}
                      </WsText>
                    </TouchableOpacity>
                  </WsToggleBtn>
                </WsFlex>
                {item && item.child_factories && !collapse[itemIndex] && (
                  <View
                    style={{
                      marginLeft: 16
                    }}
                  >
                    <LlLvInfoMultiLayer
                      items={item.child_factories}
                      value={value}
                      onChange={onChange}
                    ></LlLvInfoMultiLayer>
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

export default LlLvInfoMultiLayer