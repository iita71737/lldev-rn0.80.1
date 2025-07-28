import React from 'react';
import { StyleSheet, View } from 'react-native';
import {
  WsIcon
} from '@/components';
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'

const WsHeaderBackBtn = ({

  // Prop
  name = "arrowback",
  color = $theme == 'light' ? $color.white : $color.black,
}) => {

  // Render
  return (
    <View style={styles.WsHeaderBackBtn}>
      <WsIcon
        size={24}
        name={name}
        color={color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  WsHeaderBackBtn: {
    marginLeft: 8,
    padding: 8,
  },
});
export default WsHeaderBackBtn;
