import React from 'react'
import { View } from 'react-native'
import { WsState, WsInfo } from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'

const WsStateForm = props => {
  // Props
  const {
    onChange,
    value,
    errorMessages = {},
    fields = {}
  } = props

  // Function
  const $_onChange = ($event, field, fieldKey) => {
    let _value = {
      ...value,
      [fieldKey]: $event
    }
    if (field.updateValueOnChange) {
      _value = {
        ..._value,
        ...field.updateValueOnChange($event, value, field, fields)
      }
    }
    if (field.updateValueOnRadioChange) {
      _value = {
        ..._value,
        ...field.updateValueOnRadioChange($event, value)
      }
    }
    if (field.updateValueOnCheckboxChange) {
      _value = {
        ..._value,
        ...field.updateValueOnCheckboxChange($event, value, fields)
      }
    }
    // 教育訓練用
    if (field.autoAddedField) {
      const newDate = moment(_value.expired_at).add(7, 'days').toISOString();
      _value = {
        ..._value,
        expired_at: newDate
      }
    }
    onChange(_value)
  }

  // Computed
  const _maximumDate = field => {
    if (field.getMaximumDate) {
      return new Date(moment(field.getMaximumDate(value)).format('YYYY-MM-DD'))
    } else {
      return null
    }
  }
  const _minimumDate = field => {
    if (field.getMinimumDate) {
      return new Date(moment(field.getMinimumDate(value)).format('YYYY-MM-DD'))
    } else {
      return null
    }
  }
  const _dateCompare = (value) => {
    if (value.expired_at) {
      const date1 = moment(value.expired_at).utc();
      return date1
    } else {
      return null
    }
  }
  // 教育訓練用
  const _fieldCompare = (field, value) => {
    const _minimumDateCompareWithField = field.minimumDateCompareWithField
    if (value[_minimumDateCompareWithField]) {
      const _minimumExpiredAt = new Date(moment(value[_minimumDateCompareWithField]).utc());
      return {
        _minimumExpiredAt: _minimumExpiredAt
      }
    } else {
      return null
    }
  }

  let firstCardFound = false;

  // Render
  return (
    <View>
      {Object.keys(fields).map((fieldKey, fieldIndex) => {
        const field = fields[fieldKey]
        // @Q@ 看傳下去的props很有用
        // console.log(field,'---field----')
        // console.log(fieldKey,'---fieldKey---')
        // console.log(JSON.stringify(value),'---value----')
        // console.log(value[fieldKey],'===value[fieldKey]===')

        let marginTop = fieldIndex > 0 ? 0 : 0;
        let borderTopWidth
        let borderColor
        if (field.type === 'card' && !firstCardFound) {
          marginTop = 48;
          borderTopWidth = 0.5
          borderColor = $color.gray
          firstCardFound = true;
        }

        return (
          <View
            style={
              [
                {
                  marginTop,
                  borderTopWidth,
                  borderColor
                }
              ]}
            key={fieldKey}
          >
            {((field.displayCheck && field.displayCheck(value)) ||
              !field.displayCheck) && (
                <>
                  <View
                    style={[
                      fieldIndex > 0
                        ? {
                          marginTop: 16,
                        }
                        : null
                    ]}>
                    {field.info ? (
                      <>
                        <WsInfo
                          type={field.type}
                          label={field.label}
                          value={value[fieldKey]}
                          style={field.style}
                          cardType={field.cardType}
                          modelId={field.modelId}
                          values={value}
                        />
                      </>
                    ) : (
                      <WsState
                        remind={field.remind}
                        remindBtnDisabled={field.remindBtnDisabled}
                        type={field.type}
                        label={field.label}
                        editable={
                          field.editableDependOnValue
                            ? field.editableDependOnValue(value)
                            : field.editable
                        }
                        rules={field.rules}
                        preText={field.preText}
                        hasMarginTop={field.hasMarginTop}
                        autoFocus={field.autoFocus}
                        items={
                          field.customizedItems
                            ? field.customizedItems(value, field)
                            : field.items
                        }
                        placeholder={field.placeholder}
                        multiline={field.multiline}
                        defaultValue={field.defaultValue}
                        value={value[fieldKey]}
                        values={value}
                        errorMessage={errorMessages[fieldKey]}
                        nameKey={field.nameKey}
                        formatNameKey={field.formatNameKey}
                        modelName={field.modelName}
                        serviceIndexKey={field.serviceIndexKey}
                        parentId={field.parentId}
                        hasMeta={field.hasMeta}
                        getAll={field.getAll}
                        params={
                          field.customizedParams
                            ? field.customizedParams(value)
                            : field.params
                        }
                        uploadUrl={field.uploadUrl}
                        renderItem={field.renderItem}
                        remindColor={field.remindColor}
                        remindRenderItem={field.remindRenderItem}
                        dialogButtonItems={field.dialogButtonItems}
                        renderCom={field.renderCom}
                        renderCustomizedCom={field.renderCustomizedCom}
                        renderCom002={field.renderCom002}
                        renderCom002Label={field.renderCom002Label}
                        renderCom003={field.renderCom003}
                        renderCom003Label={field.renderCom003Label}
                        renderCom004Label={field.renderCom004Label}
                        component={field.component}
                        remindOnPress={field.remindOnPress}
                        text={field.text}
                        color={field.color}
                        icon={field.icon}
                        pressText={field.pressText}
                        fields={field.fields}
                        renderCom002Fields={field.renderCom002Fields}
                        renderCom002Remind={field.renderCom002Remind}
                        maximumDate={
                          field.maximumDate
                            ? field.maximumDate
                            : _maximumDate(field)
                        }
                        minimumDate={
                          field.minimumDate
                            ? field.minimumDate
                            : _minimumDate(field)
                        }
                        _dateCompare={_dateCompare(value)}
                        _fieldCompare={_fieldCompare(field, value)}
                        onChange={$event => {
                          $_onChange($event, field, fieldKey)
                        }}
                        disabled={field.disabled}
                        borderWidth={field.borderWidth}
                        borderRadius={field.borderRadius}
                        checkboxLabel={field.checkboxLabel}
                        checkboxText={field.checkboxText}
                        checkboxModalText={field.checkboxModalText}
                        checkboxModalInnerTitle={field.checkboxModalInnerTitle}
                        checked={
                          field.displayCheckedOrNot
                            ? field.displayCheckedOrNot(value)
                            : false
                        }
                        checkboxOnLabelLeft={field.checkboxOnLabelLeft}
                        switchTextInputItemLabel={field.switchTextInputItemLabel}
                        stateStyle={field.stateStyle}
                        onPress={field.onPress}
                        textCounter={field.textCounter}
                        maxLength={field.maxLength}
                        contentHeight={field.contentHeight}
                        dialogTitle={field.dialogTitle}
                        modalChildrenScroll={field.modalChildrenScroll}
                        uploadSuffix={field.uploadSuffix}
                        oneFile={field.oneFile}
                        uploadFileType={field.uploadFileType}
                        innerLabel={field.innerLabel}
                        uploadToFileStore={field.uploadToFileStore}
                        selectAllVisible={field.selectAllVisible}
                        cancelAllVisible={field.cancelAllVisible}
                        searchBarVisible={field.searchBarVisible}
                        filterVisible={field.filterVisible}
                        testID={field.testID}
                        addIconLabel={field.addIconLabel}
                        manageIconLabel={field.manageIconLabel}
                        deletableFields={field.deletableFields}
                        mode={field.mode}
                        suffixText={field.suffixText}
                        limitFileExtension={field.limitFileExtension}
                        translate={field.translate}
                        uploadBtnText={field.uploadBtnText}
                        uploadBtnIcon={field.uploadBtnIcon}
                        customizedNameKey={field.customizedNameKey}
                      />
                    )}
                  </View>
                </>
              )}
          </View>
        )
      })}
    </View>
  )
}

export default WsStateForm
