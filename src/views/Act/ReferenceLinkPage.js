import React from 'react'
import { WsLoading } from '@/components'
import { WebView } from 'react-native-webview'

const ReferenceLinkPage = ({ route }) => {
  // Params
  const { link } = route.params

  return (
    <>
      <WebView
        source={{
          uri: link,
          method: 'GET',
          headers: { 'Cache-Control': 'no-cache' }
        }}
        startInLoadingState={true}
        renderLoading={() => {
          return <WsLoading />
        }}
        style={{ flex: 1 }}
      />
    </>
  )
}

export default ReferenceLinkPage
