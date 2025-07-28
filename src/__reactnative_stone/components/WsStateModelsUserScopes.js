import React from 'react'
import { View, Pressable, TouchableOpacity, Dimensions, TextInput } from 'react-native'
import { WsBtnSelect, WsFilter } from '@/components'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import scopes from '@/__config/scopes'

const WsStateModelsUserScopes = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // field
  const fields = {
    scopes: {
      type: 'user_scopes',
    }
  }

  // Props
  const {
    value = [],
    onChange,
    placeholder = `${t('選擇')}`,
    icon,
    disabled = false,
    isError,
    testID
  } = props

  // Redux
  // const systemClasses = useSelector(state => state.data.systemClasses)

  // State
  const [modalVisible, setModalVisible] = React.useState(false)
  // const [filtersValue, setFiltersValue] = React.useState({ system_subclasses: value.map(item => item.id) })
  const [text, setText] = React.useState()

  // Function
  const $_setText = () => {
    const _text = []
    let subClassesLength = 0
    if (value.length != 0) {
      systemClasses.forEach(systemClass => {
        systemClass.system_subclasses.forEach(systemSubclass => {
          value.forEach(valueSubclassId => {
            if (valueSubclassId.id == systemSubclass.id) {
              _text.push(systemSubclass.name)
            }
          })
          subClassesLength++
        })
      })
      if (_text.length == subClassesLength) {
        setText(t('全部'))
      } else if (_text.length > 2) {
        const _show = _text.join(', ').toString()
        setText(_show)
      } else {
        const _show = _text.join(', ').toString()
        setText(_show)
      }
    } else {
      setText('')
    }
  }

  const $_onFilterSubmit = $event => {
    setModalVisible(false)
    setFiltersValue($event)
    onChange($event)
  }


  const $_countBadge = () => {
    if (value && value.length > 0) {
      return value.length
    }
  }

  React.useEffect(() => {
  }, [])

  React.useEffect(() => {
    // $_setText()
  }, [value])

  // Render
  return (
    <>
      <WsBtnSelect
        isError={isError}
        testID={testID}
        disabled={disabled}
        rightIcon={disabled ? false : true}
        icon={icon}
        onPress={() => {
          setModalVisible(true)
          // $_setFieldsValue()
        }}
        placeholder={placeholder}
        badge={$_countBadge()}
        text={text}
        style={[
          {
            backgroundColor: disabled ? $color.white2d : $color.gray11l,
            borderWidth: 0.3,
            borderRadius: 5,
            height: 'auto'
          },
          isError
            ? {
              borderWidth: 0.5,
              borderColor: borderColorError,
              backgroundColor: $color.danger11l
            }
            : null
        ]}
      />
      <WsFilter
        title={t('角色權限')}
        visible={modalVisible}
        setModalVisible={setModalVisible}
        onClose={() => {
          setModalVisible(false)
        }}
        filterTypeName={t('篩選條件')}
        fields={fields}
        onSubmit={$_onFilterSubmit}
      />
    </>
  )
}

export default WsStateModelsUserScopes
