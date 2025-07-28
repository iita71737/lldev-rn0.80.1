import React, { Children } from 'react'
import { View, ScrollView } from 'react-native'
import { WsInfo } from '@/components'

const WsInfoForm = props => {
  // Props
  const {
    style = {
      marginBottom: 24
    },
    value,
    fields,
    errorMessages = {},
    children
  } = props

  // Render
  return (
    <ScrollView>
      <View
        style={[style]}
      >
        {Object.keys(fields).map(fieldKey => {
          const field = fields[fieldKey]
          // @Q@ 查資料用
          // console.log(field,'----field----')
          // console.log(field.type, '----filed.type---')
          // console.log(value[fieldKey], '-----value[fieldKey]----')

          return (
            <View key={fieldKey}>
              {((field.displayCheck && field.displayCheck(value)) ||
                !field.displayCheck) && (
                  <WsInfo
                    icon={field.icon}
                    labelIcon={field.labelIcon}
                    type={field.type}
                    label={field.label}
                    emptyText={field.emptyText}
                    rules={field.rules}
                    hasMarginTop={field.hasMarginTop}
                    autoFocus={field.autoFocus}
                    items={field.items}
                    placeholder={field.placeholder}
                    multiline={field.multiline}
                    defaultValue={field.defaultValue}
                    value={value[fieldKey]}
                    nameKey={field.nameKey}
                    onPress={field.onPress}
                    isUri={field.isUri}
                    labelBtnOnPress={field.labelBtnOnPress}
                    labelBtnText={field.labelBtnText}
                    labelRemarkText={field.labelRemarkText}
                    labelRemarkTextUser={field.labelRemarkTextUser}
                    labelRemarkIcon={field.labelRemarkIcon}
                    labelRemarkIconSize={field.labelRemarkIconSize}
                    labelRemarkIconColor={field.labelRemarkIconColor}
                    errorMessage={errorMessages[fieldKey]}
                    style={field.style}
                    labelWidth={field.labelWidth}
                    testID={field.testID}
                  />
                )}
            </View>
          )
        })}
      </View>
      {children}
    </ScrollView>
  )
}

export default WsInfoForm
