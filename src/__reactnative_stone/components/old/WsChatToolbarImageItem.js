import React, { useState, useEffect } from 'react';

import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  TouchableHighlight,
  ImageBackground,
} from 'react-native'

const WsChatToolbarImageItem = ({
  source,
  onRemove,
}) => {
  return (
    <TouchableHighlight>
      <ImageBackground
        style={styles.photo}
        source={{ uri: source }}
        imageStyle={{ borderRadius: 4 }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onRemove}
        >
          <View style={styles.closeButtonWrapper}>
            <View style={styles.closeButtonBorder}>
              <Image
                style={styles.closeButton}
                source={require('@/assets/image/close.png')}
              />
            </View>
          </View>
        </TouchableOpacity>
      </ImageBackground>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
  imageItem: {
    position: 'relative',
  },
  imageSection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  closeButtonWrapper: {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  closeButtonBorder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -6,
    marginRight: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#faf8f6',
  },
  closeButton: {
    width: 20,
    height: 20,
  },
  photo: {
    position: 'relative',
    width: 50,
    height: 50,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 4,
  },
});

export default WsChatToolbarImageItem