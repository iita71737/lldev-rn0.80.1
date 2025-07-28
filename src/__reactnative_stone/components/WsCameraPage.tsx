import { View, StyleSheet, ViewProps, Platform } from 'react-native'
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { PermissionsAndroid } from 'react-native'
import {
  Camera,
  CameraPermissionStatus,
  useCameraDevice,
  PhotoFile,
  VideoFile
} from 'react-native-vision-camera'
import Modal from 'react-native-modal'
import { CaptureButton } from './WsCameraPage/utils/CaptureButton'
import { CONTENT_SPACING, CONTROL_BUTTON_SIZE, MAX_ZOOM_FACTOR, SAFE_AREA_PADDING } from './WsCameraPage/utils/Constants'
import Reanimated, { Extrapolate, interpolate, useAnimatedGestureHandler, useSharedValue, useAnimatedStyle, useAnimatedProps } from 'react-native-reanimated'
import { useIsFocused } from '@react-navigation/core'
import { useIsForeground } from './WsCameraPage/hooks/useIsForeground'
import { PressableOpacity } from 'react-native-pressable-opacity'
import { usePreferredCameraDevice } from './WsCameraPage/hooks/usePreferredCameraDevice'
import IonIcon from 'react-native-vector-icons/Ionicons'
import { StatusBarBlurBackground } from './WsCameraPage/utils/StatusBarBlurBackground'
import {
  PinchGestureHandler,
  PinchGestureHandlerGestureEvent,
  TapGestureHandler,
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent
} from 'react-native-gesture-handler'
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
interface Props extends ViewProps {
  isVisible: boolean
  onCameraRecording: (newValue: any) => void
  onClose: () => void
}

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)
Reanimated.addWhitelistedNativeProps({
  zoom: true,
})
const SCALE_FULL_ZOOM = 3

const WsCameraPage = (props: Props) => {

  const {
    isVisible,
    onClose,
    onCameraRecording,
  } = props

  const [externalWritePermission, setExternalWritePermission] = useState<'granted' | 'denied' | undefined>()
  const [cameraPermission, setCameraPermission] = useState<CameraPermissionStatus>()
  const [microphonePermission, setMicrophonePermission] = useState<CameraPermissionStatus>()
  const [isCameraInitialized, setIsCameraInitialized] = useState(false)

  const camera = useRef<Camera>(null)
  const isPressingButton = useSharedValue(false)
  const zoom = useSharedValue(0)

  // check if camera page is active
  const isFocussed = useIsFocused()
  const isForeground = useIsForeground()
  const isActive = isFocussed && isForeground


  // camera device settings
  const [preferredDevice] = usePreferredCameraDevice()
  const [cameraPosition, setCameraPosition] = useState<'front' | 'back'>('back')
  const [flash, setFlash] = useState<'off' | 'on'>('off')
  let device = useCameraDevice(cameraPosition)
  const supportsFlash = device?.hasFlash ?? false

  if (preferredDevice != null && preferredDevice.position === cameraPosition) {
    // override default device with the one selected by the user in settings
    device = preferredDevice
  }

  //#region Animated Zoom
  // This just maps the zoom factor to a percentage value.
  // so e.g. for [min, neutr., max] values [1, 2, 128] this would result in [0, 0.0081, 1]
  const minZoom = device?.minZoom ?? 1
  const maxZoom = Math.min(device?.maxZoom ?? 1, MAX_ZOOM_FACTOR)
  const cameraAnimatedProps = useAnimatedProps(() => {
    const z = Math.max(Math.min(zoom.value, maxZoom), minZoom)
    return {
      zoom: z,
    }
  }, [maxZoom, minZoom, zoom])
  //#endregion

  // FUNCTION
  const onInitialized = useCallback(() => {
    console.log('Camera initialized!')
    setIsCameraInitialized(true)
  }, [])
  const setIsPressingButton = useCallback(
    (_isPressingButton: boolean) => {
      isPressingButton.value = _isPressingButton
    },
    [isPressingButton],
  )
  const onMediaCaptured = useCallback(
    async (media: PhotoFile | VideoFile, type: 'photo' | 'video') => {
      console.log(`Media captured! ${JSON.stringify(media)}`)
      try {
        await CameraRoll.saveAsset(`file://${media.path}`, {
          type: 'video',
          album: "ESGoal-dev"
        })
      } catch (e) {
        console.error(e.message);
      }
      if (type === 'video' && 'duration' in media) {
        const pathArray = media.path.split('/');
        const fileName = pathArray[pathArray.length - 1];
        onCameraRecording(
          {
            lazyUri: media.path,
            fileDuration: media.duration,
            fileName: fileName,
            fileType: 'video',
            needUpload: true,
          }
        )
      }
    },
    [],
  )

  const onFlipCameraPressed = useCallback(() => {
    setCameraPosition((p) => (p === 'back' ? 'front' : 'back'))
  }, [])
  const onFlashPressed = useCallback(() => {
    if (flash === 'off') {
      setFlash('on')
    } else if (flash === 'on') {
      setFlash('off')
    }
    // setFlash((f) => (flash === 'off' ? 'on' : 'off'))
  }, [])
  const onDoubleTap = useCallback(() => {
    // onFlipCameraPressed()
  }, [onFlipCameraPressed])

  const onPinchGesture = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent, { startZoom?: number }>({
    onStart: (_, context) => {
      context.startZoom = zoom.value
    },
    onActive: (event, context) => {
      // we're trying to map the scale gesture to a linear zoom here
      const startZoom = context.startZoom ?? 0
      const scale = interpolate(event.scale, [1 - 1 / SCALE_FULL_ZOOM, 1, SCALE_FULL_ZOOM], [-1, 0, 1], Extrapolate.CLAMP)
      zoom.value = interpolate(scale, [-1, 0, 1], [minZoom, startZoom, maxZoom], Extrapolate.CLAMP)
    },
  })

  // Open Camera For Android WRITE_EXTERNAL_STORAGE Permissions if u needed
  const requestExternalWritePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        )
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          return 'granted'
        }
      } catch (err) {
        return undefined
      }
    }
  }

  useEffect(() => {
    requestExternalWritePermission().then(s => setExternalWritePermission(s))
    // ✅ 改為同步方式
    setCameraPermission(Camera.getCameraPermissionStatus())
    setMicrophonePermission(Camera.getMicrophonePermissionStatus())
  }, [])

  if (cameraPermission == null || microphonePermission == null) {
    // still loading
    return null
  } else {
    // console.log(`Re-rendering Navigator. Camera: ${cameraPermission} | Microphone: ${microphonePermission}`)
  }


  return (
    <>
      <Modal
        isVisible={isVisible}
        onBackButtonPress={onClose}
        onBackdropPress={onClose}
        style={styles.modal}
      >
        <GestureHandlerRootView style={{ flex: 1 }}>

          {device != null && (
            <PinchGestureHandler onGestureEvent={onPinchGesture} enabled={isActive}>
              <Reanimated.View style={StyleSheet.absoluteFill}>
                <TapGestureHandler onEnded={onDoubleTap} numberOfTaps={2}>
                  <ReanimatedCamera
                    ref={camera}
                    style={StyleSheet.absoluteFill}
                    device={device}
                    // format={format}
                    // fps={fps}
                    // photoHdr={enableHdr}
                    // videoHdr={enableHdr}
                    // lowLightBoost={device.supportsLowLightBoost && enableNightMode}
                    isActive={isActive}
                    onInitialized={onInitialized}
                    // onError={onError}
                    enableZoomGesture={false}
                    animatedProps={cameraAnimatedProps}
                    // enableFpsGraph={true}
                    orientation="portrait"
                    photo={true}
                    video={true}
                  // audio={hasMicrophonePermission}
                  // frameProcessor={frameProcessor}
                  />
                </TapGestureHandler>
              </Reanimated.View>
            </PinchGestureHandler>
          )}
          <CaptureButton
            style={styles.captureButton}
            camera={camera}
            onMediaCaptured={onMediaCaptured}
            cameraZoom={zoom}
            minZoom={minZoom}
            maxZoom={maxZoom}
            flash={supportsFlash ? flash : 'off'}
            enabled={isCameraInitialized && isActive}
            setIsPressingButton={setIsPressingButton}
          />

          <StatusBarBlurBackground />

          <View style={styles.closeButton}>
            <PressableOpacity style={styles.button} onPress={onClose} disabledOpacity={0.4}>
              <IonIcon name="arrow-back-outline" color="white" size={24} />
            </PressableOpacity>
          </View>

          <View style={styles.rightButtonRow}>
            <PressableOpacity style={styles.button} onPress={onFlipCameraPressed} disabledOpacity={0.4}>
              <IonIcon name="camera-reverse" color="white" size={24} />
            </PressableOpacity>
            {supportsFlash && (
              <PressableOpacity style={styles.button} onPress={onFlashPressed} disabledOpacity={0.4}>
                <IonIcon name={flash === 'on' ? 'flash' : 'flash-off'} color="white" size={24} />
              </PressableOpacity>
            )}
          </View>
        </GestureHandlerRootView>

      </Modal>
    </>

  )
}

export default WsCameraPage

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  captureButton: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: SAFE_AREA_PADDING.paddingBottom,
  },
  button: {
    marginBottom: CONTENT_SPACING,
    width: CONTROL_BUTTON_SIZE,
    height: CONTROL_BUTTON_SIZE,
    borderRadius: CONTROL_BUTTON_SIZE / 2,
    backgroundColor: 'rgba(140, 140, 140, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rightButtonRow: {
    position: 'absolute',
    right: SAFE_AREA_PADDING.paddingRight,
    top: SAFE_AREA_PADDING.paddingTop,
  },
  text: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
    zIndex: 999
  },
  closeButton: {
    position: 'absolute',
    left: SAFE_AREA_PADDING.paddingLeft,
    top: SAFE_AREA_PADDING.paddingTop,
  }
})