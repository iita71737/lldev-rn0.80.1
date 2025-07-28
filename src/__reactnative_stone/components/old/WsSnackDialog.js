import React, { useEffect, useState } from 'react';

import {
  Dimensions,
  PermissionsAndroid,
  Platform,
  Text,
  Modal,
  View,
  StyleSheet,
} from 'react-native';
import {
  WsIcon
} from '@/components'

const WsSnackDialog = ({
  active,
  onClose,
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={active}
      onRequestClose={onClose}>
      <View style={styles.popupContainer}>
        <View style={[styles.popupContent]}>
          <WsIcon
            name="check"
            size={65}
            color="#ffffff"
          ></WsIcon>
          <Text style={styles.popupInfo}>已儲存照片</Text>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  popupContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 145,
    height: 145,
    opacity: 0.9,
    borderRadius: 5,
    backgroundColor: '#000000',
  },
  popupInfo: {
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 1,
    textAlign: 'center',
    color: '#ffffff',
  },
})

export default WsSnackDialog