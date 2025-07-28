import React from 'react'
import { View, Pressable, TouchableOpacity, Dimensions, TextInput } from 'react-native'
import {
  WsStateCheckBox,
  WsText,
  WsStateInput,
  WsStatePicker,
  WsErrorMessage,
  WsStateRadio,
  WsStateDate,
  WsStateRange,
  WsFlex,
  WsStateSwitch,
  WsStateSort,
  WsStateBelongstoModalPicker,
  WsStateBelongstoManyModalPicker,
  WsStateImage,
  WsStateImages,
  WsIcon,
  WsStatePickerMultiple,
  WsStateFile,
  WsStateFiles,
  WsStateModels,
  WsStateLayerSelect,
  WsStateToggleBtn,
  WsDialog,
  WsStateSubtaskCardShow,
  WsStateSearch,
  WsStateModelsSystemClass,
  WsStateMultipleBelongstoManyModalPicker,
  WsStateFileOrImagePicker,
  WsStateFilesAndImagesPicker,
  WsStateCheckboxes,
  LlFilesAndImagesPicker,
  WsStateBelongstoManyModalPicker002,
  WsStateCheckBox002,
  LlRelatedActModalPicker,
  LlRelatedActBindArticleModalPicker,
  WsStateSwitchBelongto,
  LlStateMultiNumberInput,
  LlStateRelatedTags,
  WsStateBelongstoModalPicker002,
  WsStateMultipleBelongstoManyModalPicker002,
  LlRelatedGuidelineModalPicker,
  LlRelatedGuidelineBindArticleModalPicker,
  WsStateModelsUserScopes,
  LlRelatedModuleModalPicker
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import $theme from '@/__reactnative_stone/global/theme'
import { useTranslation } from 'react-i18next'

const WsState = React.forwardRef((props, ref) => {
  // Prop
  const {
    borderWidth,
    borderRadius,
    borderColor,
    remind = null,
    remindBtnDisabled = false,
    value,
    type = 'text',
    label,
    labelIcon,
    labelIconColor,
    multiline,
    autoFocus = false,
    maxLength,
    editable,
    minHeight,
    keyboardType = 'default',
    placeholder,
    placeholderTextColor = $theme == 'dark' ? $color.white3d : $color.gray,
    selectionColor = $color.primary,
    requiredColor = $color.danger,
    marginTop = 0,
    errorMessage,
    onChange,
    onBlur,
    returnKeyType,
    onSubmitEditing,
    defaultValue,
    style,
    parentId,
    modelName,
    nameKey,
    nameKey2,
    formatNameKey,
    valueKey,
    items = [],
    rules,
    remindColor = $color.primary,
    titleMarginBottom = 6,
    preText,
    icon,
    iconColor,
    title,
    pressText,
    params,
    onPress,
    stateStyle,
    uploadUrl,
    hasMeta,
    getAll,
    fields,
    renderItem,
    remindRenderItem,
    renderCom,
    renderCustomizedCom,
    renderCom002,
    renderCom002Label,
    renderCom003,
    renderCom003Label,
    renderCom004Label,
    onDragEnd,
    onDragStart,
    pickerStyle,
    pickerNum,
    text,
    color,
    maximumDate,
    minimumDate,
    dialogButtonItems = [
      {
        color: $color.primary,
        label: '我知道了',
        onPress: () => {
          setVisible(false)
        }
      }
    ],
    contentHeight,
    dialogTitle,
    disabled,
    checked,
    checkboxLabel,
    checkboxText,
    checkboxModalText,
    checkboxModalInnerTitle,
    switchTextInputItemLabel,
    centerBtnVisible,
    bottomRightBtnVisible,
    resizeMode,
    checkboxOnLabelLeft = false,
    borderColorError = $color.danger,
    customizedTag,
    textCounter = false,
    loading,
    modalChildrenScroll,
    uploadSuffix,
    serviceIndexKey,
    _dateCompare,
    onFocus,
    testID,
    oneFile,
    uploadFileType,
    innerLabel,
    uploadToFileStore,
    selectAllVisible,
    cancelAllVisible,
    searchBarVisible,
    _fieldCompare,
    filterVisible,
    filterFields,
    renderCom002Fields,
    renderCom002Remind,
    addIconLabel,
    manageIconLabel,
    deletableFields,
    mode,
    suffixText,
    limitFileExtension,
    translate,
    uploadBtnText,
    uploadBtnIcon,
    showListBelow,
    pagination,
    customizedNameKey,
    values
  } = props

  // i18n
  const { t, i18n } = useTranslation()
  // Dimension
  const { width, height } = Dimensions.get('window')

  // State
  const [isError, setIsError] = React.useState(false)
  const [visible, setVisible] = React.useState(false)
  const [remindValue, setRemindValue] = React.useState()
  const [passwordVisible, setPasswordVisible] = React.useState(true)

  // Effect
  React.useEffect(() => {
    if (errorMessage && errorMessage.length) {
      setIsError(true)
    } else {
      setIsError(false)
    }
  }, [errorMessage])

  React.useEffect(() => {
    if (value == null || (value.length == 0 && defaultValue)) {
      if (onChange) {
        onChange(defaultValue)
      }
    }
  }, [defaultValue])

  // Render
  return (
    <View
      style={[
        {
          marginTop: marginTop,
        },
        style
      ]}>
      {label && checkboxOnLabelLeft != true && (
        <WsFlex
          justifyContent={'space-between'}
          style={[
            {
              marginBottom: titleMarginBottom
            }
          ]}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {labelIcon && (
              <WsIcon
                color={labelIconColor}
                name={labelIcon}
                size={24}
                style={{
                  marginRight: 4
                }}
              />
            )}
            <WsFlex>
              <WsText size="14" fontWeight={'600'} style={{}}>
                {label}
              </WsText>
            </WsFlex>
            {rules && rules.includes('required') && (
              <WsText size="14" color={requiredColor}>
                {' '}
                *
              </WsText>
            )}
          </View>
          {textCounter && maxLength && (
            <View>
              {value ? (
                <WsText size={12} color={$color.gray}>{`${value.length} / ${maxLength}`}</WsText>
              ) : (
                <WsText size={12} color={$color.gray}>{0}{` / ${maxLength}`}</WsText>
              )
              }
            </View>
          )
          }
        </WsFlex>
      )}
      {type == 'text' && (
        <WsStateInput
          testID={testID}
          ref={ref}
          value={value}
          editable={editable}
          minHeight={minHeight}
          autoFocus={autoFocus}
          maxLength={maxLength}
          multiline={multiline}
          keyboardType={keyboardType}
          placeholder={placeholder}
          defaultValue={defaultValue}
          placeholderTextColor={isError ? $color.danger : placeholderTextColor}
          selectionColor={selectionColor}
          onChange={onChange}
          isError={isError}
          returnKeyType={multiline ? 'default' : returnKeyType}
          onSubmitEditing={onSubmitEditing}
          leftIcon={icon}
          iconColor={iconColor}
          style={stateStyle}
          onFocus={onFocus}
          onBlur={onBlur}
        />
      )}
      {type == 'switchBelongto' && (
        <WsStateSwitchBelongto
          ref={ref}
          value={value}
          editable={editable}
          minHeight={minHeight}
          autoFocus={autoFocus}
          maxLength={maxLength}
          multiline={multiline}
          keyboardType={keyboardType}
          placeholder={placeholder}
          defaultValue={defaultValue}
          placeholderTextColor={isError ? $color.danger : placeholderTextColor}
          selectionColor={selectionColor}
          onChange={onChange}
          isError={isError}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          leftIcon={icon}
          iconColor={iconColor}
          style={stateStyle}
          switchTextInputItemLabel={switchTextInputItemLabel}
        />
      )}
      {type == 'multi_number' && (
        <LlStateMultiNumberInput
          value={value}
          onChange={onChange}
          disabled={disabled}
          items={items}
        />
      )}
      {type == 'number' && (
        <WsStateInput
          ref={ref}
          value={value}
          editable={editable}
          minHeight={minHeight}
          autoFocus={autoFocus}
          maxLength={maxLength}
          multiline={multiline}
          keyboardType={'numeric'}
          placeholder={placeholder}
          defaultValue={defaultValue}
          placeholderTextColor={isError ? $color.danger : placeholderTextColor}
          selectionColor={selectionColor}
          onChange={onChange}
          isError={isError}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          leftIcon={icon}
          iconColor={iconColor}
          style={stateStyle}
          testID={testID}
        />
      )}
      {type == 'password' && (
        <WsStateInput
          ref={ref}
          testID={testID}
          value={value}
          editable={editable}
          minHeight={minHeight}
          autoFocus={autoFocus}
          maxLength={maxLength}
          multiline={multiline}
          keyboardType={keyboardType}
          placeholder={placeholder}
          defaultValue={defaultValue}
          placeholderTextColor={isError ? $color.danger : placeholderTextColor}
          selectionColor={selectionColor}
          onChange={onChange}
          isError={isError}
          secureTextEntry={passwordVisible}
          setSecureTextEntry={setPasswordVisible}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoCompleteType="password"
          textContentType="password"
          style={stateStyle}
          rightIcon={'ws-outline-eye-close'}
          onFocus={onFocus}
        />
      )}
      {type == 'tel' && (
        <WsStateInput
          ref={ref}
          value={value}
          editable={editable}
          autoFocus={autoFocus}
          maxLength={maxLength}
          keyboardType="number-pad"
          placeholder={placeholder}
          defaultValue={defaultValue}
          placeholderTextColor={isError ? $color.danger : placeholderTextColor}
          selectionColor={selectionColor}
          onChange={onChange}
          isError={isError}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          style={stateStyle}
        />
      )}
      {type == 'picker' && (
        <WsStatePicker
          nameKey={nameKey}
          borderWidth={borderWidth}
          borderRadius={borderRadius}
          borderColor={borderColor}
          icon={icon}
          value={value}
          enabled={editable}
          placeholder={placeholder}
          defaultValue={defaultValue}
          onChange={onChange}
          preText={preText}
          items={items}
          isError={isError}
          style={stateStyle}
          title={title}
          pickerNum={pickerNum}
          loading={loading}
          testID={testID}
        />
      )}
      {type == 'email' && (
        <WsStateInput
          ref={ref}
          testID={testID}
          value={value}
          editable={editable}
          autoFocus={autoFocus}
          maxLength={maxLength}
          keyboardType="email-address"
          placeholder={placeholder}
          defaultValue={defaultValue}
          placeholderTextColor={isError ? $color.danger : placeholderTextColor}
          selectionColor={selectionColor}
          onChange={onChange}
          isError={isError}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={onFocus}
        />
      )}
      {type == 'radio' && (
        <WsStateRadio
          value={value}
          onChange={onChange}
          defaultValue={defaultValue}
          items={items}
          isError={isError}
          autoFocus={autoFocus}
          disabled={disabled}
          style={style}
          testID={testID}
        />
      )}
      {type == 'checkbox' && (
        <WsStateCheckBox002
          disabled={disabled}
          style={style}
          value={value}
          onChange={onChange}
          checkboxText={checkboxText}
        />
      )}
      {type == 'checkboxes' && (
        <WsStateCheckboxes
          {...props}
          value={value}
          onChange={onChange}
        />
      )}
      {type == 'date' && (
        <WsStateDate
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          defaultValue={defaultValue}
          mode="date"
          preText={preText}
          autoFocus={autoFocus}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          isError={isError}
          testID={testID}
          editable={editable}
          _fieldCompare={_fieldCompare}
        />
      )}
      {type === 'datetime' && (
        <WsStateDate
          borderWidth={borderWidth}
          borderRadius={borderRadius}
          value={value}
          onChange={onChange}
          mode="datetime"
          placeholder={placeholder}
          preText={preText}
          isError={isError}
          testID={testID}
        />
      )}
      {type == 'time' && (
        <WsStateDate
          value={value}
          onChange={onChange}
          defaultValue={defaultValue}
          mode="time"
          placeholder={placeholder}
          preText={preText}
          isError={isError}
          testID={testID}
        />
      )}
      {type == 'switch' && (
        <WsStateSwitch
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          defaultValue={defaultValue}
          mode={mode}
        />
      )}
      {type == 'sort' && (
        <WsStateSort
          items={items}
          renderItem={renderItem}
          value={value}
          onChange={onChange}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
        />
      )}
      {type == 'user' && (
        <WsStateBelongstoModalPicker
          label={label}
          pressText={pressText}
          modelName={modelName}
          nameKey={nameKey}
          onChange={onChange}
          value={value}
          parentId={parentId}
          onPress={onPress}
          hasMeta={hasMeta}
          params={params}
          autoFocus={autoFocus}
          editable={editable}
          pickerStyle={pickerStyle}
          formatNameKey={formatNameKey}
          isError={isError}
          rules={rules}
        />
      )}
      {type == 'belongsto' && (
        <WsStateBelongstoModalPicker
          label={label}
          pressText={pressText}
          modelName={modelName}
          nameKey={nameKey}
          nameKey2={nameKey2}
          onChange={onChange}
          value={value}
          parentId={parentId}
          onPress={onPress}
          hasMeta={hasMeta}
          params={params}
          autoFocus={autoFocus}
          editable={editable}
          formatNameKey={formatNameKey}
          pickerStyle={pickerStyle}
          placeholder={placeholder}
          isError={isError}
          renderCom={renderCom}
          preText={preText}
          suffixText={suffixText}
          serviceIndexKey={serviceIndexKey}
          testID={testID}
          renderCustomizedCom={renderCustomizedCom}
          rules={rules}
          customizedNameKey={customizedNameKey}
        />
      )}
      {type == 'belongsto002_CRUD' && (
        <WsStateBelongstoModalPicker002
          label={label}
          pressText={pressText}
          modelName={modelName}
          nameKey={nameKey}
          nameKey2={nameKey2}
          onChange={onChange}
          value={value}
          parentId={parentId}
          onPress={onPress}
          hasMeta={hasMeta}
          params={params}
          autoFocus={autoFocus}
          editable={editable}
          formatNameKey={formatNameKey}
          pickerStyle={pickerStyle}
          placeholder={placeholder}
          isError={isError}
          renderCom={renderCom}
          preText={preText}
          serviceIndexKey={serviceIndexKey}
          testID={testID}
          renderCustomizedCom={renderCustomizedCom}
          rules={rules}
          addIconLabel={addIconLabel}
          manageIconLabel={manageIconLabel}
          deletableFields={deletableFields}
          translate={translate}
        />
      )}
      {type == 'belongstomany' && (
        <WsStateBelongstoManyModalPicker
          label={label}
          placeholder={placeholder}
          modelName={modelName}
          serviceIndexKey={serviceIndexKey}
          nameKey={nameKey}
          nameKey2={nameKey2}
          parentId={parentId}
          onChange={onChange}
          value={value}
          hasMeta={hasMeta}
          params={params}
          defaultValue={defaultValue}
          selectAllVisible={selectAllVisible}
          cancelAllVisible={cancelAllVisible}
          searchBarVisible={searchBarVisible}
          isError={isError}
          testID={testID}
          filterVisible={filterVisible}
          _filterFields={filterFields}
          showListBelow={showListBelow}
          pagination={pagination}
          customizedNameKey={customizedNameKey}
        />
      )}
      {type == 'multipleBelongstomany' && (
        <WsStateMultipleBelongstoManyModalPicker
          innerLabel={innerLabel}
          placeholder={placeholder}
          modelName={modelName}
          serviceIndexKey={serviceIndexKey}
          nameKey={nameKey}
          parentId={parentId}
          onChange={onChange}
          value={value}
          hasMeta={hasMeta}
          params={params}
          defaultValue={defaultValue}
          selectAllVisible={selectAllVisible}
          cancelAllVisible={cancelAllVisible}
          searchBarVisible={searchBarVisible}
          isError={isError}
          testID={testID}
        />
      )}
      {type == 'multipleBelongstomany002_CRUD' && (
        <WsStateMultipleBelongstoManyModalPicker002
          innerLabel={innerLabel}
          placeholder={placeholder}
          modelName={modelName}
          serviceIndexKey={serviceIndexKey}
          nameKey={nameKey}
          parentId={parentId}
          onChange={onChange}
          value={value}
          hasMeta={hasMeta}
          params={params}
          defaultValue={defaultValue}
          selectAllVisible={selectAllVisible}
          cancelAllVisible={cancelAllVisible}
          searchBarVisible={searchBarVisible}
          isError={isError}
          testID={testID}
          addIconLabel={addIconLabel}
          manageIconLabel={manageIconLabel}
          deletableFields={deletableFields}
        />
      )}
      {type == 'image' && (
        <WsStateImage
          value={value}
          onChange={onChange}
          modelName={modelName}
          uploadUrl={uploadUrl}
          text={text}
          color={color}
          icon={icon}
          style={style}
          centerBtnVisible={centerBtnVisible}
          bottomRightBtnVisible={bottomRightBtnVisible}
          resizeMode={resizeMode}
          recordingBtnVisible={false}
        />
      )}
      {type == 'images' && (
        <WsStateImages
          value={value}
          onChange={onChange}
          modelName={modelName}
          uploadUrl={uploadUrl}
        />
      )}
      {type == 'file' && (
        <WsStateFile
          value={value}
          onChange={onChange}
          modelName={modelName}
          uploadUrl={uploadUrl}
        />
      )}
      {type == 'files' && (
        <WsStateFiles
          value={value}
          onChange={onChange}
          modelName={modelName}
          uploadUrl={uploadUrl}
        />
      )}
      {type == 'fileOrImage' && (
        <WsStateFileOrImagePicker
          testID={testID}
          value={value}
          onChange={onChange}
          modelName={modelName}
          uploadUrl={uploadUrl}
          limitFileExtension={limitFileExtension}
        />
      )}
      {type == 'filesAndImages' && (
        <WsStateFilesAndImagesPicker
          value={value}
          onChange={onChange}
          modelName={modelName}
          uploadUrl={uploadUrl}
          uploadSuffix={uploadSuffix}
          oneFile={oneFile}
          uploadToFileStore={uploadToFileStore}
          testID={testID}
        />
      )}
      {type == 'Ll_filesAndImages' && (
        <LlFilesAndImagesPicker
          value={value}
          onChange={onChange}
          modelName={modelName}
          uploadUrl={uploadUrl}
          uploadSuffix={uploadSuffix}
          testID={testID}
          oneFile={oneFile}
          mode={mode}
          limitFileExtension={limitFileExtension}
          uploadBtnText={uploadBtnText}
          uploadBtnIcon={uploadBtnIcon}
        />
      )}
      {type == 'Ll_relatedAct' && (
        <LlRelatedActModalPicker
          label={label}
          title={label}
          placeholder={placeholder}
          modelName={modelName}
          serviceIndexKey={serviceIndexKey}
          nameKey={nameKey}
          parentId={parentId}
          onChange={onChange}
          value={value}
          hasMeta={hasMeta}
          params={params}
          defaultValue={defaultValue}
        />
      )}
      {type == 'Ll_relatedGuideline' && (
        <LlRelatedGuidelineModalPicker
          label={label}
          title={label}
          placeholder={placeholder}
          modelName={modelName}
          serviceIndexKey={serviceIndexKey}
          nameKey={nameKey}
          parentId={parentId}
          onChange={onChange}
          value={value}
          hasMeta={hasMeta}
          params={params}
          defaultValue={defaultValue}
        />
      )}
      {type == 'Ll_relatedModule' && (
        <LlRelatedModuleModalPicker
          label={label}
          title={label}
          placeholder={placeholder}
          modelName={modelName}
          serviceIndexKey={serviceIndexKey}
          nameKey={nameKey}
          parentId={parentId}
          onChange={onChange}
          value={value}
          hasMeta={hasMeta}
          params={params}
          defaultValue={defaultValue}
        />
      )}
      {type == 'Ll_relatedTags' && (
        <LlStateRelatedTags
          label={label}
          placeholder={placeholder}
          modelName={modelName}
          serviceIndexKey={serviceIndexKey}
          nameKey={nameKey}
          nameKey2={nameKey2}
          parentId={parentId}
          onChange={onChange}
          value={value}
          hasMeta={hasMeta}
          params={params}
          defaultValue={defaultValue}
          selectAllVisible={selectAllVisible}
          cancelAllVisible={cancelAllVisible}
          searchBarVisible={searchBarVisible}
          isError={isError}
          testID={testID}
          filterVisible={filterVisible}
          _filterFields={filterFields}
        />
      )}
      {type == 'belongstomany002' && (
        <WsStateBelongstoManyModalPicker002
          label={label}
          placeholder={placeholder}
          modelName={modelName}
          serviceIndexKey={serviceIndexKey}
          nameKey={nameKey}
          parentId={parentId}
          onChange={onChange}
          value={value}
          hasMeta={hasMeta}
          params={params}
          defaultValue={defaultValue}
          isError={isError}
        />
      )}
      {type == 'Ll_belongstomany003' && (
        <LlRelatedActBindArticleModalPicker
          label={label}
          placeholder={placeholder}
          modelName={modelName}
          serviceIndexKey={serviceIndexKey}
          nameKey={nameKey}
          onChange={onChange}
          value={value}
          hasMeta={hasMeta}
          params={params}
          defaultValue={defaultValue}
          searchBarVisible={searchBarVisible}
        />
      )}
      {type == 'Ll_belongstomany004' && (
        <LlRelatedGuidelineBindArticleModalPicker
          label={label}
          placeholder={placeholder}
          modelName={modelName}
          serviceIndexKey={serviceIndexKey}
          nameKey={nameKey}
          parentId={parentId}
          onChange={onChange}
          value={value}
          hasMeta={hasMeta}
          params={params}
          defaultValue={defaultValue}
          searchBarVisible={searchBarVisible}
        />
      )}
      {type == 'range' && (
        <WsStateRange preValue={value} setPreValue={onChange} />
      )}
      {type == 'pickerMultiple' && (
        <WsStatePickerMultiple
          value={value}
          onChange={onChange}
          items={items}
          placeholder={placeholder}
          title={title}
        />
      )}
      {type == 'models' && (
        <>
          <WsStateModels
            text={fields.name?.text}
            value={value}
            onChange={onChange}
            items={items}
            placeholder={placeholder}
            title={title}
            fields={fields}
            renderCom002Fields={renderCom002Fields}
            renderCom={renderCom}
            _dateCompare={_dateCompare}
            testID={testID}
            renderCom002={renderCom002}
            renderCom002Label={renderCom002Label}
            renderCom002Remind={renderCom002Remind}
            renderCom003={renderCom003}
            renderCom003Label={renderCom003Label}
            title={label}
            renderCom004Label={renderCom004Label}
            values={values}
          />
        </>
      )}
      {type == 'modelsSystemClass' && (
        <>
          <WsStateModelsSystemClass
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            defaultValue={defaultValue}
            disabled={disabled}
            isError={isError}
            modalChildrenScroll={modalChildrenScroll}
            testID={testID}
          />
        </>
      )}
      {type == 'layerSelect' && (
        <WsStateLayerSelect
          value={value}
          onChange={onChange}
          items={items && items.length > 0 ? item : undefined}
          placeholder={placeholder}
          title={title}
          valueKey={valueKey}
          nameKey={nameKey}
        />
      )}
      {type == 'subtask' && (
        <WsStateSubtaskCardShow
          value={value}
          onChange={onChange}
          items={items}
        />
      )}
      {type == 'toggleBtn' && (
        <WsStateToggleBtn
          value={value}
          onChange={onChange}
          items={items}
          placeholder={placeholder}
          title={title}
          style={stateStyle}
        />
      )}
      {type == 'search' && (
        <WsStateSearch
          ref={ref}
          value={value}
          editable={editable}
          minHeight={minHeight}
          autoFocus={autoFocus}
          maxLength={maxLength}
          multiline={multiline}
          keyboardType={keyboardType}
          placeholder={placeholder}
          defaultValue={defaultValue}
          placeholderTextColor={placeholderTextColor}
          selectionColor={selectionColor}
          onChange={onChange}
          isError={isError}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          leftIcon={icon}
          iconColor={iconColor}
          style={stateStyle}
          testID={testID}
        />
      )}
      {type == 'user_scopes' && (
        <>
          <WsStateModelsUserScopes
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            isError={isError}
          />
        </>
      )}
      {errorMessage && (
        <>
          {errorMessage.map(errorMessageItem => (
            <WsErrorMessage key={errorMessageItem}>
              {t(errorMessageItem)}
            </WsErrorMessage>
          ))}
        </>
      )}
      {remind && (
        <>
          <TouchableOpacity
            onPress={() => {
              if (!remindBtnDisabled) {
                setVisible(true)
              }
            }}>
            <WsFlex style={[autoFocus ? null : { marginTop: 12 }]}>
              <WsIcon
                name="md-info-outline"
                color={remindColor}
                style={{
                  marginRight: 6
                }}
                size={16}
              />
              <WsText
                style={{
                  paddingRight: 16
                }}
                size={12}
                color={remindColor}>
                {remind}
              </WsText>
            </WsFlex>
          </TouchableOpacity>
          <WsDialog
            value={remindValue}
            onChange={setRemindValue}
            dialogButtonItems={dialogButtonItems}
            title={dialogTitle}
            dialogVisible={visible}
            setDialogVisible={() => {
              setVisible(false)
            }}
            contentHeight={contentHeight}
            mode={3}
          >
            {remindRenderItem && <>{remindRenderItem()}</>}
          </WsDialog>
        </>
      )}
    </View>
  )
})

export default WsState
