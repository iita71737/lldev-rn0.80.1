import React, { useEffect, useState, useRef } from 'react'
import { View, Text, ActivityIndicator, Alert, StyleSheet } from 'react-native'
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera'
import { openSettings } from 'react-native-permissions'
import S_QRcode from '@/services/api/v1/qrcode'
import { useNavigation } from '@react-navigation/native'

const ViewQRcodeScanner: React.FC = () => {
  const navigation = useNavigation()
  const cameraRef = useRef<Camera>(null)
  const device = useCameraDevice('back')
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'], // 掃描 QR Code
    onCodeScanned: codes => {
      const val = codes[0]?.value
      if (val) {
        S_QRcode.redirectByScanUrl(val, navigation)
      }
    },
  })

  useEffect(() => {
    (async () => {
      let status = await Camera.getCameraPermissionStatus()
      if (status === 'denied') {
        status = await Camera.requestCameraPermission()
      }
      if (status !== 'granted') {
        Alert.alert(
          '需要相機權限',
          '請前往設定開啟權限。',
          [{ text: '前往設定', onPress: () => openSettings() }]
        )
      }
      setHasPermission(status === 'granted')
    })()
  }, [])

  if (hasPermission === null) {
    return <LoadingView message="正在請求相機權限..." />
  }
  if (!hasPermission) {
    return <ErrorView message="尚未授權相機" />
  }
  if (device == null) {
    return <LoadingView message="找不到相機裝置..." />
  }

  return (
    <Camera
      ref={cameraRef}
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={true}
      codeScanner={codeScanner}
    />
  )
}

const LoadingView: React.FC<{ message: string }> = ({ message }) => (
  <View style={styles.center}>
    <ActivityIndicator size="large" />
    <Text>{message}</Text>
  </View>
)
const ErrorView: React.FC<{ message: string }> = ({ message }) => (
  <View style={styles.center}>
    <Text>{message}</Text>
  </View>
)

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
})

export default ViewQRcodeScanner
