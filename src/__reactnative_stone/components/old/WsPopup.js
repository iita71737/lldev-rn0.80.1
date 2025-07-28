import React from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
  Text,
} from 'react-native';

const WsPopup = ({
  active = false,
  onClose,
  children,
  popupBgRGBA = 'rgba(12, 12, 12, 0.8)',
}) => {
  return (
    <Modal animationType="fade" transparent={true} visible={active}>
      <View style={styles.popupContainer}>
        <TouchableOpacity
          style={[
            styles.popupBg,
            {
              backgroundColor: popupBgRGBA,
            },
          ]}
          activeOpacity={1}
          onPressOut={onClose}
        />
        {children}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  popupContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupBg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flex: 1,
    zIndex: 0,
  },
});

export default WsPopup;
