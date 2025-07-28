import React, { useState, useEffect } from 'react'
import {
  View,
  Platform,
  Text,
  Dimensions
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
  WsFilterDateRange002,
  WsHeaderSearch,
  WsHeaderSearch002,
  WsFilterPicker,
  WsState,
  WsStateSwitch
} from '@/components'
import { useSelector } from 'react-redux'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next';
import { isEqual } from 'lodash'

interface Field {
  type: string;
  label?: string;
  searchVisible?: boolean;
  items?: any[];
}

interface DefaultFilter {
  [key: string]: any;
}

interface WsFilter002Props {
  title: string;
  footerBtnRightText?: string;
  modalChildrenScroll?: boolean;
  visible: boolean;
  fields: { [key: string]: Field };
  onClose: () => void;
  onSubmit: (value: any) => void;
  defaultFilter?: DefaultFilter;
  searchVisible?: boolean;
  searchLabel?: string;
}

const WsFilter002: React.FC<WsFilter002Props> = (props) => {
  // i18n
  const { t } = useTranslation();
  const { width } = Dimensions.get('screen')

  // Props
  const {
    title,
    footerBtnRightText = t('確定'),
    modalChildrenScroll = true,
    visible,
    fields = {},
    onClose,
    onSubmit,
    defaultFilter,
    searchVisible = true,
    searchLabel
  } = props

  // REDUX
  const _data = useSelector(state => state.data);
  const systemClasses = useSelector(state => state.data.systemClasses);

  // State
  const [searchValue, setSearchValue] = React.useState(defaultFilter && defaultFilter.search ? defaultFilter.search : undefined)
  const [canClear, setCanClear] = useState(true)
  const [value, setValue] = useState<DefaultFilter | undefined>(defaultFilter ? defaultFilter : undefined);

  // HELPER
  const $_getSystemSubclassId = () => {
    return S_SystemClass.getSystemSubclassIdWithSystemClass(systemClasses)
  }

  // 復原
  const $_getDefaultValue = () => {
    let _value = {}
    for (let fieldKey in fields) {
      if (defaultFilter && defaultFilter[fieldKey]) {
        _value[fieldKey] = defaultFilter[fieldKey]
      }
      else {
        switch (fields[fieldKey].type) {
          case 'system_subclass': {
            _value[fieldKey] = $_getSystemSubclassId()
          }
            break;
          case 'checkbox': {
            if (fields[fieldKey].items && fields[fieldKey].items.length > 0) {
              _value[fieldKey] = fields[fieldKey].items.map(item => {
                return item.id
              })
            }
            // INIT VALUE FROM REDUX
            if (fields[fieldKey].items && fields[fieldKey].storeKey) {
              fields[fieldKey].items = _data[fields[fieldKey].storeKey]
              _value[fieldKey] = fields[fieldKey].items.map(item => {
                return item.id
              })
            }
            // EXCEED 200 API WILL FAILED
            if (fields[fieldKey].items && fields[fieldKey].items.length > 200) {
              _value[fieldKey] = undefined
            }
          }
            break;
          case 'date_range': {
            _value[fieldKey] = {
              range: 'nolimit'
            }
          }
            break;
          default:
        }
      }
    }
    setValue(_value)
  }

  // 清空
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
    $_getDefaultValue()
    setCanClear(true)
  }
  const $_onClear = () => {
    setSearchValue('')
    setValue($_getOnClearValue())
    setCanClear(false)
  }
  const $_onSubmit = () => {
    if (searchValue) {
      let _value = JSON.parse(JSON.stringify(value))
      _value.search = searchValue
      onSubmit(_value)
    } else if (searchVisible && !searchValue) {
      let _value = JSON.parse(JSON.stringify(value))
      delete _value.search
      onSubmit(_value)
    } else {
      if (value.search && value.search_type) {
        let _value = JSON.parse(JSON.stringify(value))
        onSubmit(_value)
      } else {
        let _value = JSON.parse(JSON.stringify(value))
        delete _value.search_type
        onSubmit(_value)
      }

    }
  }

  const _fields = React.useMemo(() => {
    const __fields = {}
    for (const fieldKey in fields) {
      const _field = fields[fieldKey]
      const __field = {
        ..._field
      }
      if (_field.type == 'checkbox' && _field.storeKey) {
        __field.items = _data[_field.storeKey]
        __fields[fieldKey] = __field
      } else {
        __fields[fieldKey] = __field
      }
    }
    return __fields
  }, [fields])

  useEffect(() => {
    if (!Object.keys(fields).length) {
      return
    }
    $_getDefaultValue()
  }, [fields])

  React.useEffect(() => {
    if (!isEqual(value, defaultFilter)) {
      setValue({ ...defaultFilter });
    }
  }, [defaultFilter])

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
          marginTop: 40,
        } : null
      ]}
    >
      <View
        style={{
          // flex: 1, // DO NOT SET
        }}
      >
        <>
          {searchVisible && (
            <WsHeaderSearch002
              searchValue={searchValue}
              setSearchValue={setSearchValue}
              backgroundColor={$color.white}
              iconLeftColor={$color.primary}
              searchLabel={searchLabel}
            />
          )}
          {value && Object.keys(_fields).map((fieldKey, fieldIndex) => {
            const field = _fields[fieldKey]

            return (
              <View
                style={{
                }}
                key={fieldIndex}
              >
                <WsFlex
                  style={[
                    fieldIndex > 0 ? {
                      borderTopWidth: .5,
                      borderTopColor: $color.gray2l,
                      marginTop: 16,
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
                    defaultSelected={field.defaultSelected}
                    searchVisible={field.searchVisible}
                    selectAllVisible={field.selectAllVisible}
                    cancelAllVisible={field.cancelAllVisible}
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
                {field.type == 'date_range002' && (
                  <WsFilterDateRange002
                    name={field.type}
                    label={field.label}
                    value={value[fieldKey]}
                    items={field.items}
                    onChange={($event) => {
                      let _value = {
                        ...value
                      }
                      if ($event.range == 'nolimit') {
                        delete _value.end_date
                        delete _value.start_date
                      }
                      setValue({
                        ..._value,
                        [fieldKey]: $event,
                        time_field: field.time_field,
                      })
                    }}
                  >
                  </WsFilterDateRange002>
                )}
                {field.type === 'frequency' && (
                  <WsFilterFrequency
                    name={field.type}
                    label={field.label}
                    value={value[fieldKey]}
                    items={field.items}
                    onChange={($event) => {
                      console.log($event, '$event');
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
                {field.type === 'picker' && (
                  <WsFilterPicker
                    testID={field.testID}
                    name={field.type}
                    label={field.label}
                    value={value[fieldKey]}
                    items={field.items}
                    placeholder={field.placeholder}
                    onChange={($event) => {
                      if (typeof $event === 'object' && $event !== null) {
                        // $event 是物件
                        // delete value.fieldKey
                        setValue({
                          ...value,
                          ...$event,
                          [fieldKey]: $event,
                        });
                      } else if (typeof $event === 'string') {
                        // $event 是字串
                        setValue({
                          ...value,
                          [fieldKey]: $event,
                        });
                      } else {
                        console.log('Unsupported event type');
                      }
                    }}
                  >
                  </WsFilterPicker>
                )}
                {field.type === 'search' && (
                  <WsState
                    testID={'search'}
                    type="search"
                    stateStyle={{
                      width: width * 0.9225,
                      height: Platform.OS == 'ios' ? 40 : 40,
                      borderRadius: 10,
                      backgroundColor: $color.white,
                      marginLeft: 16
                    }}
                    placeholder={t('搜尋')}
                    value={value[fieldKey]}
                    onChange={$event => {
                      setValue({
                        ...value,
                        [fieldKey]: $event,
                      })
                    }}
                  />
                )}
                {field.type === 'belongsto' && (
                  <WsState
                    type="belongsto"
                    modelName={field.modelName}
                    serviceIndexKey={field.serviceIndexKey}
                    nameKey={field.nameKey}
                    hasMeta={field.hasMeta}
                    style={{
                      borderRadius: 25,
                      paddingHorizontal: 16
                    }}
                    placeholder={field.placeholder ? field.placeholder : t('選擇')}
                    value={value ? value[fieldKey] : ''}
                    onChange={$event => {
                      setValue({
                        ...value,
                        [fieldKey]: $event,
                      })
                    }}
                  />
                )}
                {field.type === 'belongstomany' && (
                  <WsState
                    type="belongstomany"
                    modelName={field.modelName}
                    nameKey={field.nameKey}
                    serviceIndexKey={field.serviceIndexKey}
                    placeholder={field.placeholder ? field.placeholder : t('選擇')}
                    hasMeta={field.hasMeta}
                    params={field.params}
                    style={{
                      borderRadius: 25,
                      paddingHorizontal: 16
                    }}
                    value={value[fieldKey]}
                    onChange={$event => {
                      setValue({
                        ...value,
                        [fieldKey]: $event,
                      })
                    }}
                  />
                )}
                {field.type == 'switch' && (
                  <WsState
                    style={{
                      paddingHorizontal: 16
                    }}
                    type="switch"
                    value={value[fieldKey]}
                    onChange={$event => {
                      setValue({
                        ...value,
                        [fieldKey]: $event,
                      })
                    }}
                  />
                )}
              </View>
            )
          })}
          <View
            style={{
              height: 108
            }}
          >
          </View>
        </>
      </View>
    </WsModal >
  )
}

export default WsFilter002