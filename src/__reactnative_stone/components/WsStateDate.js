import React from 'react'
import { useColorScheme, View, Text, Pressable, Dimensions } from 'react-native'
import DatePicker from 'react-native-date-picker'
import { WsDialog, WsBtnSelect, WsText } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

const WsStateDate = props => {
  const { width, height } = Dimensions.get('window')
  // i18n
  const { t, i18n } = useTranslation()
  const scheme = useColorScheme()

  // Props
  const {
    preText,
    value,
    mode, //datetime,date,time
    placeholder = (mode == 'datetime') ? `${t('YYYY-MM-DD')} ${t('HH:mm')}` : mode == 'date' ? t('YYYY-MM-DD') : mode == 'time' ? `${t('YYYY-MM-DD')} ${t('HH:mm')}` : `${t('YYYY-MM-DD')} ${t('HH:mm')}`,
    onChange,
    is24hourSource,
    locale = 'zh_TW',
    submitColor = $color.primary,
    cancelColor = $color.gray,
    maximumDate,
    minimumDate,
    format = mode == 'datetime' ? 'YYYY-MM-DD HH:mm' : mode == 'date' ? 'YYYY-MM-DD' : mode == 'time' ? 'YYYY-MM-DD HH:mm' : 'YYYY-MM-DD HH:mm:ss',
    borderWidth = 0.4,
    borderRadius = 5,
    isError,
    borderColorError = $color.danger,
    testID,
    editable = true,
    _fieldCompare
  } = props

  //State
  const [visible, setVisible] = React.useState(false)
  const [dateValue, setDateValue] = React.useState(moment().format(format))
  const [text, setText] = React.useState()

  // helper
  const getValidDate = dateInput => {
    // 檢查是否存在且 moment 轉換後有效
    if (dateInput && moment(dateInput).isValid()) {
      return new Date(dateInput);
    }
    // 如果不合法則返回 undefined，這樣原生組件就不會傳入 NaN
    return undefined;
  };

  const dialogButtonItems = [
    {
      label: t('取消'),
      onPress: () => {
        setVisible(false)
      },
      color: cancelColor
    },
    {
      label: t('確定'),
      onPress: () => {
        setVisible(false)
        $_onSubmit()
      },
      color: submitColor
    },
  ]

  //Function
  const $_setText = dateValue => {
    if (!dateValue || !moment(dateValue).isValid()) {
      return null
    } else {
      if (mode == 'datetime') {
        return moment(dateValue).format(format)
      } else if (mode == 'date') {
        return moment(dateValue).format(format)
      } else if (mode == 'time') {
        return moment(dateValue).format('HH:mm')
      }
    }
  }

  const $_setDate = $event => {
    if (mode == 'datetime') {
      return moment($event).format(format)
    } else if (mode == 'date') {
      return moment($event).format(format)
    } else if (mode == 'time') {
      return moment($event).format(format)
    }
  }

  const $_onSubmit = () => {
    onChange(dateValue)
    setText($_setText(dateValue))
  }

  React.useEffect(() => {
    if (value) {
      setDateValue(moment(value).format(format))
      setText($_setText(value))
    }
  }, [value])

  // Render
  return (
    <>
      <View
        style={[
          {
            borderWidth: borderWidth,
            borderRadius: borderRadius
          },
          isError
            ? {
              borderWidth: 1,
              borderColor: borderColorError,
              backgroundColor: $color.danger11l
            }
            : null
        ]}>
        {preText && (
          <WsText
            size={14}
            style={{ marginLeft: 8, marginTop: 8 }}
            fontWeight={'600'}>
            {t(preText)}
          </WsText>
        )}
        <WsBtnSelect
          isError={isError}
          style={[
            !editable
              ? {
                backgroundColor: $color.white5d,
                borderRadius: 5
              } :
              null
          ]}
          testID={testID}
          onPress={() => {
            setVisible(true)
          }}
          icon={
            mode == 'date' || mode == 'datetime'
              ? 'ws-outline-calendar-date'
              : 'md-access-time'
          }
          mode={mode}
          text={text}
          placeholder={value ? $_setText(dateValue) : placeholder}
          rightIcon={false}
          disabled={!editable}
        />
      </View>
      <WsDialog
        btnBorderWidth={0}
        dialogVisible={visible}
        dialogButtonItems={dialogButtonItems}
        setDialogVisible={() => {
          setVisible(false)
        }}
        paddingLeft={0}
        style={{
          justifyContent: 'center'
        }}
        headerStyle={{
          padding: 0,
          margin: 0
        }}
        contentStyle={{
          paddingBottom: 0,
          width: width * 0.9,
          alignItems: 'center',
          justifyContent: 'center',
          paddingTop: 0,
          paddingLeft: 0,
          paddingRight: 0,
          backgroundColor: 'white'
        }}>
        <DatePicker
          testID="datePicker"
          modal={false}
          open={visible}
          onConfirm={(date) => {
            setVisible(false)
            setDateValue($_setDate($event))
          }}
          onCancel={() => {
            setVisible(false)
          }}
          theme={'auto'}
          date={
            moment(dateValue).isValid()
              ? new Date(moment(dateValue))
              : new Date()
          }
          onDateChange={$event => {
            setDateValue($_setDate($event))
          }}
          mode={mode}
          is24hourSource={is24hourSource}
          locale={locale}
          textColor={$color.black}
          maximumDate={getValidDate(maximumDate)}
          minimumDate={getValidDate(
            _fieldCompare && _fieldCompare._minimumExpiredAt
              ? _fieldCompare._minimumExpiredAt
              : minimumDate
          )}
          style={{
            flex: 1
          }}
        />
      </WsDialog>
    </>
  )
}

export default WsStateDate
