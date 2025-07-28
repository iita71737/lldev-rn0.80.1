import * as React from 'react'
export const isReadyRef = React.createRef() // app是否ready [Boolean]
export const containerRef = React.createRef() // 指向NavigationContainer [Object]
export function navigate(name, params) {
  if (isReadyRef.current && containerRef.current) {
    containerRef.current?.navigate(name, params)
  } else {
    console.error('Navigator not ready.')
  }
}
