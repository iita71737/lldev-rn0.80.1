import React from 'react';
import { View, StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import $color from '@/__reactnative_stone/global/color'

const WsGradientProgressBar = ({ progress }) => {

  return (
    <View style={styles.progressBar}>
      <LinearGradient
        colors={[$color.primary5l, $color.primary]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.progress, { width: `${progress}%` }]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  progressBar: {
    width: '100%',
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
  },
  progress: {
    height: '100%',
    borderRadius: 10,
  },
});

export default WsGradientProgressBar;
