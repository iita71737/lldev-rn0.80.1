import React from 'react';
import { View, SafeAreaView, StatusBar, ViewStyle, Text } from 'react-native';
import { WsToggleTabBar } from '@/components';
import gColor from '@/__reactnative_stone/global/color';

interface WsToggleTabViewProps {
  items: {
    value: string;
    label: string;
    badge?: string;
  }[];
  index: number;
  setIndex: (index: number) => void;
  backgroundColor?: string;
  style?: ViewStyle;
  tabIndex?: number;
}

const WsToggleTabView: React.FC<WsToggleTabViewProps> = (props) => {
  const {
    items,
    tabIndex = 0,
    setIndex,
    backgroundColor = gColor.primary,
    style,
  } = props;

  // 防呆：若 items 為空、未定義或 tabIndex 超過 items 長度，則回傳 fallback UI
  if (!Array.isArray(items) || items.length === 0 || tabIndex >= items.length) {
    return (
      <SafeAreaView>
        <StatusBar barStyle="dark-content" />
        <View style={[{ backgroundColor, padding: 16 }, style]}>
          {/* 可自訂 fallback 內容 */}
          <Text>{'error'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <View style={[{ backgroundColor, padding: 16 }, style]}>
          <WsToggleTabBar
            items={items}
            value={items[tabIndex].value}
            tabIndex={tabIndex}
            onPress={(value: any, index: number) => {
              setIndex(index);
            }}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default WsToggleTabView;
