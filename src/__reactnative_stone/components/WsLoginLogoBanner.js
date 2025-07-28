import React from 'react'
import { View, ImageBackground, StyleSheet, Image } from 'react-native'

const WsLoginLogoBanner = ({
  // Prop
  imageBg,
  imageLogo
}) => {
  // Render
  return (
    <ImageBackground source={imageBg} style={styles.headerBg}>
      <View style={styles.shadow}>
        <Image source={imageLogo} style={styles.logo} />
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  headerBg: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: '100%',
    height: 240
  },
  shadow: {
    shadowColor: '#d5ad73',
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 0.51,
    shadowRadius: 13.16,
    elevation: 20
  },
  logo: {
    marginTop: 60,
    resizeMode: 'contain',
    width: 140,
    height: 140,
    borderRadius: 70
  }
})

export default WsLoginLogoBanner
