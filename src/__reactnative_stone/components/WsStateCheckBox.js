import React, { useState } from 'react'
import { Text, StyleSheet, View, TouchableOpacity } from 'react-native'
import CheckBox from '@react-native-community/checkbox'
import { WsDialog, WsText, WsNavCheck } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const WsStateCheckBox = props => {
  const { t, i18n } = useTranslation()

  const {
    borderColorError = $color.danger,
    animationCheckbox = false,
    boxType = 'square',
    checked,
    onChange,
    disabled = false,
    checkboxLabel,
    checkboxText,
    checkboxModalText,
    checkboxModalInnerTitle
  } = props

  const [toggleCheckBox, setToggleCheckBox] = useState(false)
  const [visible, setVisible] = React.useState(false)
  const dialogButtonItems = [
    {
      label: t('確定'),
      onPress: () => {
        setVisible(false)
      }
    }
  ]

  React.useEffect(() => {
    setToggleCheckBox(checked)
  }, [checked])

  return (
    <>
      {animationCheckbox ? (
        <>
          <View style={styles.container}>
            <View style={styles.checkboxContainer}>
              <CheckBox
                boxType={boxType}
                disabled={disabled}
                value={toggleCheckBox}
                onValueChange={newValue => {
                  onChange(newValue)
                  setToggleCheckBox(newValue)
                }}
              />
              <WsText style={styles.label}>{checkboxLabel}</WsText>
              <TouchableOpacity
                onPress={() => {
                  setVisible(true)
                }}>
                <WsText color={$color.primary}>{checkboxModalText}</WsText>
              </TouchableOpacity>
              <WsDialog
                dialogButtonItems={dialogButtonItems}
                title={checkboxModalInnerTitle}
                dialogVisible={visible}
                setDialogVisible={() => {
                  setVisible(false)
                }}
              />
            </View>
            <Text>{checkboxText}</Text>
          </View>
        </>
      ) : (
        <WsNavCheck
          style={[
            {
              flex: 1,
              // borderWidth: 1 
            }
          ]}
          paddingHorizontal={0}
          paddingVertical={0}
          value={toggleCheckBox}
          onChange={$event => {
            onChange($event)
            setToggleCheckBox($event)
          }}
        />
      )}
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: 10,
    paddingLeft: 10
  },
  checkboxContainer: {
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkbox: {
    alignSelf: 'flex-start'
  },
  label: {
    marginLeft: 8
  }
})

export default WsStateCheckBox
