// (´･∀･`)
import React from 'react'
import { WsStatePicker } from '@/components'
import Services from '@/services/api/v1/index'

const WsStateBelongstoPicker = props => {
  // Props
  const { value, onChange, placeholder, defaultValue, modelName } = props

  // States
  const [items, setItems] = React.useState()

  // Services
  const $_fetchDate = async () => {
    const res = await Services[modelName].index
    const data = []
    res.data.forEach(item => {
      data.push({
        name: item.name,
        value: itme.id
      })
    })
  }

  React.useEffect(() => {
    $_fetchDate()
  }, [])

  // Render
  return (
    <>
      {/* ._. */}
      <WsStatePicker
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        defaultValue={defaultValue}
      />
    </>
  )
}
export default WsStateBelongstoPicker
