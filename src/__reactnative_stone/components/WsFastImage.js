import React, { useState, useEffect } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import FastImage from 'react-native-fast-image'
import { WsLoading } from '@/components'

const WsFastImage = ({
  source,
  isUri = false,
  ratio = 0.5,
  priority = 'normal',
  widthLoad = 100,
  heightLoad = 100,
  hasLoading = false,
  fillWidth = true,
  resizeMode = 'cover',
  style
}) => {
  //Dimensions
  const { width, height } = Dimensions.get('window')

  // State
  const [isMounted, setIsMounted] = useState(false)
  const [fastWidth, setFastWidth] = useState(400)
  const [fastHeight, setFastHeight] = useState(200)
  const [isLoading, setIsLoading] = useState(false)
  const [aspectRatio, setAspectRatio] = useState(1)
  const [layout, setLayout] = useState(null)
  const [imageEvent, setImageEvent] = useState(null)

  // Function
  const $_onLoad = React.useCallback($event => {
    setAspectRatio($event.nativeEvent.width / $event.nativeEvent.height)
    setImageEvent($event.nativeEvent)
  }, [])

  const $_onLoadStart = React.useCallback($event => {
    setIsLoading(true)
  }, [])

  const $_onLoadEnd = React.useCallback(() => {
    setIsLoading(false)
  }, [])

  const $_onLayout = React.useCallback($event => {
    setLayout($event.nativeEvent.layout)
  }, [])

  const $_updateScale = React.useCallback(() => {
    if (!layout || !imageEvent) {
      return
    }
    let _width
    let _height
    if (fillWidth) {
      _width = layout.width
      _height = layout.width / aspectRatio
    } else {
      const screenWidth = Math.round(Dimensions.get('window').width)
      const portion = (screenWidth * ratio) / imageEvent.width
      _width = imageEvent.width * portion
      _height = Math.round(imageEvent.height * portion)
    }
    if (isMounted && _width && _height) {
      setFastWidth(_width)
      setFastHeight(_height)
    }
  }, [source])


  const $_getSource = React.useCallback((source, isUri, priority) => {
    if (isUri) {
      return {
        uri: source,
        priority: FastImage.priority[priority],
      };
    } else {
      return source;
    }
  }, [source, isUri, priority]);

  // Effect
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    $_updateScale()
  }, [aspectRatio, layout, imageEvent])

  // Render
  return (
    <View onLayout={$_onLayout}>
      {isLoading && hasLoading && (
        <View
          style={[
            {
              width: fastWidth,
              height: fastHeight
            },
            styles.FastImageLoading
          ]}>
          <WsLoading />
        </View>
      )}
      <FastImage
        style={[
          {
            width: widthLoad ? widthLoad : width * 0.95,
            height: heightLoad ? heightLoad : fastHeight
          },
          style
        ]}
        source={$_getSource(source, isUri)}
        resizeMode={resizeMode}
        onLoad={$_onLoad}
        onLoadStart={$_onLoadStart}
        onLoadEnd={$_onLoadEnd}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  FastImageLoading: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(2, 19, 5, 0.4)'
  }
})

export default React.memo(WsFastImage)
