import React, { useState, useEffect } from 'react';

import {
  StyleSheet,
  View,
} from 'react-native'
import { WsChatToolbarImageItem } from '@/components'

const WsChatToolbarImages = ({
  photos,
  onRemove,
}) => {
  return (
    <View style={styles.imageItem}>
      <View style={styles.imageSection}>
        {photos.map((photo, photoIndex) => {
          return (
            <WsChatToolbarImageItem
              key={`${photo}-${photoIndex}`}
              source={photo.source}
              onRemove={() => {
                onRemove(photoIndex)
              }}
            ></WsChatToolbarImageItem>
          )
        })}
      </View>
    </View>
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
});

export default WsChatToolbarImages