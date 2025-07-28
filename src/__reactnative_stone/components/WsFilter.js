import React, { useState, useEffect } from 'react'
import {
  View,
  Platform,
} from "react-native";
import {
  WsText,
  WsFlex,
  WsModal,
  WsFilterSystemSubclass,
  WsFilterButtons,
  WsFilterCheckBox,
  WsFilterDateRange,
  WsFilterFrequency,
  WsFilterContractorType,
  WsFilterMultiLayerToggle,
  WsSectionTitle,
  WsFilterScopes
} from '@/components'
import { useSelector } from 'react-redux'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native-gesture-handler';

const WsFilter = (props) => {
  // i18n
  const { t, i18n } = useTranslation();

  // Props
  const {
    visible,
    onClose,
    currentValue = {},
    fields = {},
    onSubmit,
    title,
    footerBtnRightText = t('確定'),
    defaultFilter,
    modalChildrenScroll = true
  } = props

  // REDUX
  const systemClasses = useSelector(state => state.data.systemClasses);

  // State
  const [canClear, setCanClear] = useState(true)
  const [value, setValue] = useState({ ...defaultFilter })
  const [defaultValue, setDefaultValue] = useState(currentValue)

  // Services
  const $_getSystemSubclassId = () => {
    return S_SystemClass.getSystemSubclassIdWithSystemClass(systemClasses)
  }

  // Function
  const $_getDefaultValue = () => {
    const _value = {}
    for (let fieldKey in fields) {
      if (currentValue[fieldKey]) {
        _value[fieldKey] = currentValue[fieldKey]
      } else if (currentValue) {
        return _value
      } else if (fields[fieldKey].defaultValue != undefined) {
        _value[fieldKey] = fields[fieldKey].defaultValue
      } else if (defaultFilter) {
        return _value
      } else {
        switch (fields[fieldKey].type) {
          case 'system_subclasses': {
            _value[fieldKey] = $_getSystemSubclassId()
          }
          case 'checkbox': {
            if (fields[fieldKey].items) {
              _value[fieldKey] = fields[fieldKey].items.map(item => {
                return item.id
              })
            }
          }
        }
      }
    }
    return _value
  }
  const $_getOnClearValue = () => {
    const _value = {}
    for (const fieldKey in fields) {
      switch (fields[fieldKey].type) {
        case 'system_subclass': {
          _value.system_subclasses = undefined
        }
        case 'checkbox': {
          _value[fieldKey] = undefined
        }
        case 'date_range': {
          _value.button = {
            range: "nolimit"
          }
        }
      }
    }
    return _value
  }

  const $_onReset = () => {
    setValue(defaultValue)
    setCanClear(true)
  }
  const $_onClear = () => {
    setValue($_getOnClearValue())
    setCanClear(false)
  }
  const $_onSubmit = () => {
    onSubmit(value)
  }

  // Effect
  useEffect(() => {
    if (!Object.keys(fields).length) {
      return
    }
    setValue($_getDefaultValue())
    if (defaultFilter) {
      setValue({ ...defaultFilter })
      setCanClear(true)
    }
  }, [fields, defaultFilter])


  // Render
  return (
    <WsModal
      childrenScroll={modalChildrenScroll}
      animationType="slide"
      transparent={true}
      visible={visible}
      onBackButtonPress={onClose}
      onSwipeDown={onClose}
      headerLeftOnPress={onClose}
      footerBtnLeftText={canClear ? t('重設') : t("復原")}
      footerBtnLeftOnPress={canClear ? $_onClear : $_onReset}
      footerBtnRightText={footerBtnRightText}
      footerBtnRightOnPress={$_onSubmit}
      title={title}
      hasReduce={false}
      style={[
        Platform.OS === 'ios' ? {
          marginTop: 40
        } : null
      ]}
    >
      {Object.keys(fields).map((fieldKey, fieldIndex) => {
        const field = fields[fieldKey]
        return (
          <View
            key={fieldKey}
          >
            <WsFlex
              style={[
                fieldIndex > 0 ? {
                  borderTopWidth: .5,
                  borderTopColor: $color.gray2l,
                  marginVertical: 16,
                } : null,
              ]}
            ></WsFlex>
            {field.label && (
              <WsText
                style={{
                  padding: 16,
                  color: $color.primary
                }}
              >
                {t(field.label)}
              </WsText>
            )}
            {field.type == 'system_subclass' && (
              <WsFilterSystemSubclass
                name={field.type}
                value={value[fieldKey]}
                onChange={($event) => {
                  setValue({
                    ...value,
                    [fieldKey]: $event,
                  })
                }}
              />
            )}
            {field.type == 'user_scopes' && (
              <WsFilterScopes
                value={value[fieldKey]}
                onChange={($event) => {
                  setValue({
                    ...value,
                    [fieldKey]: $event,
                  })
                }}
              />
            )}
            {field.type == 'contractor_types' && (
              <WsFilterContractorType
                name={field.type}
                value={value[fieldKey]}
                onChange={($event) => {
                  setValue({
                    ...value,
                    [fieldKey]: $event,
                  })
                }}
              />
            )}
            {field.type == 'buttons' && (
              <WsFilterButtons
                name={field.type}
                value={value[fieldKey]}
                items={field.items}
                onChange={($event) => {
                  setValue({
                    ...value,
                    [fieldKey]: $event,
                  })
                }}
              >
              </WsFilterButtons>
            )}
            {field.type == 'checkbox' && (
              <WsFilterCheckBox
                searchVisible={field.searchVisible}
                label={field.label}
                value={value[fieldKey]}
                items={field.items}
                onChange={($event) => {
                  setValue({
                    ...value,
                    [fieldKey]: $event,
                  })
                }}
              >
              </WsFilterCheckBox>
            )}
            {field.type == 'date_range' && (
              <WsFilterDateRange
                name={field.type}
                label={field.label}
                value={value[fieldKey]}
                items={field.items}
                onChange={($event) => {
                  let _value = {
                    ...value
                  }
                  if ($event.range == 'nolimit') {
                    delete _value.end_time
                    delete _value.start_time
                  }
                  setValue({
                    ..._value,
                    [fieldKey]: $event,
                    time_field: field.time_field,
                  })
                }}
              >
              </WsFilterDateRange>
            )}
            {field.type === 'frequency' && (
              <WsFilterFrequency
                name={field.type}
                label={field.label}
                value={value[fieldKey]}
                items={field.items}
                onChange={($event) => {
                  setValue({
                    ...value,
                    [fieldKey]: $event,
                  })
                }}
              >
              </WsFilterFrequency>
            )}
            {field.type === 'multiLayerToggle' && (
              <WsFilterMultiLayerToggle
                name={field.type}
                label={field.label}
                value={value[fieldKey]}
                items={field.items}
                onChange={($event) => {
                  setValue({
                    ...value,
                    [fieldKey]: $event,
                  })
                }}
              >
              </WsFilterMultiLayerToggle>
            )}
          </View>
        )
      })}
      <View
        style={{
          height: 100
        }}
      ></View>
    </WsModal >
  )
}

export default WsFilter