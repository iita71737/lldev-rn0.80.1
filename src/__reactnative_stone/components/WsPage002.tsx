import React, { useEffect, useCallback } from 'react'
import { View, SafeAreaView } from 'react-native'
import {
  WsHeaderSearch,
  WsToggleTabView
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import store from '@/store'
import {
  setIdleCounter
} from '@/store/data'
import { useFocusEffect } from '@react-navigation/native'
import { NavigationProp, useNavigation } from '@react-navigation/native'
interface TabItem {
  value: number;
  view: React.ComponentType<any>;
  props?: any;
}

interface WsPage002Props {
  children?: React.ReactNode;
  title: string | undefined;
  iconRight?: string;
  iconLeft?: string;
  leftOnPress?: () => void;
  rightOnPress?: () => void;
  borderRadius?: number;
  tabItems: TabItem[];
  tabIndex: number;
  setTabIndex: () => void;
  defaultTabIndex: number;
}

const WsPage002: React.FC<WsPage002Props> = props => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()

  // Props
  const {
    title,
    iconRight = 'md-add',
    iconLeft,
    leftOnPress,
    rightOnPress,
    borderRadius,
    tabItems = [],
    tabIndex = 0,
    setTabIndex = () => { },
  } = props

  // REDUX
  const currentIdleCounter = useSelector(state => state.data.idleCounter)
  // DETECT IDLE
  const handleDetectIdle = () => {
    store.dispatch(setIdleCounter(currentIdleCounter + 1))
  };


  // STATES
  const [searchValue, setSearchValue] = React.useState('')

  // RENDER
  const renderScene = (tabIndex: number) => {
    let itemIndex = tabIndex
    if (itemIndex === undefined) {
      return
    }
    if (itemIndex == -1) {
      itemIndex = 0
    }
    const _view = tabItems && tabItems[itemIndex] ? tabItems[itemIndex].view : View
    const _props = tabItems && tabItems[itemIndex] && tabItems[itemIndex].props ? tabItems[itemIndex].props : undefined
    return (
      <_view
        key={tabIndex}
        searchValue={searchValue}
        {..._props}
      />
    )
  }

  useEffect(() => {
    handleDetectIdle();
  }, [tabIndex]);

  // Render
  return (
    <View
      style={{
        flex: 1
      }}>
      <SafeAreaView
        style={{
          backgroundColor: $color.primary
        }}
      />
      {title && (
        <WsHeaderSearch
          title={t(title)}

          iconRight={iconRight}
          showRightBtn={tabItems[tabIndex] && tabItems[tabIndex].props && tabItems[tabIndex].props.showRightBtn ? tabItems[tabIndex].props.showRightBtn : false}
          rightOnPress={rightOnPress}

          iconLeft={iconLeft}
          showLeftBtn={tabItems[tabIndex] && tabItems[tabIndex].props && tabItems[tabIndex].props.showLeftBtn ? tabItems[tabIndex].props.showLeftBtn : false}
          leftOnPress={leftOnPress}

          setSearchValue={setSearchValue}
          searchValue={searchValue}
          borderRadius={borderRadius}
        />
      )}
      <View style={{ flex: 1 }}>
        <WsToggleTabView
          items={tabItems}
          tabIndex={tabIndex}
          setIndex={setTabIndex}
        />
        {renderScene(tabIndex)}
      </View>
    </View>
  )
}

export default WsPage002
