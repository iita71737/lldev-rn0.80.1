import React from 'react';
import { View, Platform, StatusBar, StatusBarStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface WsStatusBarProps {
  backgroundColor: string;
  barStyle?: StatusBarStyle;
}

const WsStatusBar = ({ backgroundColor, barStyle = 'default' }: WsStatusBarProps) => {
  const insets = useSafeAreaInsets();
  const statusBarHeight = Platform.OS === 'ios' ? insets.top : 0;

  return (
    <>
      {Platform.OS === 'ios' && (
        <View
          style={{
            height: statusBarHeight,
            backgroundColor,
          }}
        />
      )}
      <StatusBar
        barStyle={barStyle}
        backgroundColor={backgroundColor}
        translucent={false}
      />
    </>
  );
};

export default WsStatusBar;
