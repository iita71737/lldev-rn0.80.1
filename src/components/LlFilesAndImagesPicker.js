import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Dimensions,
  TouchableOpacity,
  Platform,
  TextInput,
  PermissionsAndroid,
} from 'react-native'
import {
  WsText,
  WsIcon,
  WsUpdateBtn,
  WsGrid,
  WsStateFileItem,
  LlPopupAlert,
  WsLoading,
  WsState,
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import LlFilesAndImagesPickerModal from '@/views/File/LlFilesAndImagesPickerModal'
import S_File from '@/services/api/v1/file'
import DraggableFlatList from 'react-native-draggable-flatlist'
import { useSelector } from 'react-redux'

const LlFilesAndImagesPicker = props => {
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()

  // i18n
  const { t } = useTranslation()

  // Props
  const {
    onChange,
    value = [],
    uploadUrl,
    uploadSuffix,
    modelName,
    uploadToFileStore = true,
    testID = 'Ll_filesAndImages',
    oneFile,
    mode = 'default',
    limitFileExtension,
    uploadBtnText,
    uploadBtnIcon,
    orderMode = 'default',
    orderConfirmToken,
    orderCancelToken,
    exportAttachmentName
  } = props

  // redux
  const factory = useSelector(state => state.data.currentFactory)

  // States
  const [loadingProgress, setLoadingProgress] = useState(false)
  const [visible, setVisible] = useState(false)

  const [checkDeleteModalVisible, setCheckDeleteModalVisible] = useState(false)
  const [checkDeleteModalContent, setCheckDeleteModalContent] = useState(
    '對此檔案無刪除權限，僅可以移除關聯，確定要移除與此檔案的關聯嗎？'
  )
  const [checkDeleteIndex, setCheckDeleteIndex] = useState()
  const [checkDeleteItem, setCheckDeleteItem] = useState()
  const [checkDeleteScopeRes, setCheckDeleteScopeRes] = useState()
  const [loading, setLoading] = useState()

  // ===== Order =====
  const [orderDraft, setOrderDraft] = useState(Array.isArray(value) ? value : [])
  const orderOriginalRef = React.useRef(Array.isArray(value) ? [...value] : [])
  const lastConfirmTokenRef = React.useRef(orderConfirmToken)
  const lastCancelTokenRef = React.useRef(orderCancelToken)

  // ===== Meeting Template =====
  const pickFirstItem = (val) => {
    if (Array.isArray(val) && val.length > 0) return val[0]
    return null
  }

  // 去重 + 依 sequence 排序（避免重複）
  const normalizeWordFields = useCallback((raw = []) => {
    const seen = new Set()
    return (Array.isArray(raw) ? raw : [])
      .filter(f => {
        const key = f?.value
        if (!key) return false
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .sort((a, b) => String(a?.sequence || '').localeCompare(String(b?.sequence || '')))
  }, [])

  // 用 meeting_template_items 反推 wordFieldSettings（編輯模式）
  const buildSettingsFromMeetingTemplateItems = (items = []) => {
    const next = {}
      ; (Array.isArray(items) ? items : []).forEach(it => {
        const key = it?.value // "${meeting_time}"
        if (!key) return

        const mtf = it?.meeting_template_field
        const mtfId = typeof mtf === 'string' ? mtf : (mtf?.id ?? null)
        const mtfName =
          typeof mtf === 'object'
            ? (mtf?.name ?? mtf?.value ?? '')
            : (it?.name ?? '')

        next[key] = {
          name: it?.name ?? '',
          esgoal_field: mtfId ? { id: mtfId, name: mtfName } : null,
        }
      })
    return next
  }

  const [wordFields, setWordFields] = useState([])
  const [wordFieldSettings, setWordFieldSettings] = useState({})

  const prevValueLenRef = React.useRef(Array.isArray(value) ? value.length : 0)
  const wordFieldsFileIdRef = React.useRef(null)
  const lastCommittedSigRef = React.useRef({})
  const valueRef = React.useRef(value)
  const didInitFromValueRef = React.useRef(false)

  useEffect(() => {
    valueRef.current = value
  }, [value])

  // ✅ 編輯模式：value 已帶 word_fields / meeting_template_items，直接初始化 UI
  useEffect(() => {
    if (modelName !== 'meeting_template') return

    const first = pickFirstItem(value)
    if (!first) return

    const rawWordFields = first?.word_fields
    if (!Array.isArray(rawWordFields) || rawWordFields.length === 0) return

    // 避免 parent re-render 重置使用者正在改的設定
    if (didInitFromValueRef.current) return
    didInitFromValueRef.current = true

    const normalized = normalizeWordFields(rawWordFields)
    setWordFields(normalized)

    const fileId = first?.file?.id ?? first?.id ?? null
    wordFieldsFileIdRef.current = fileId
    lastCommittedSigRef.current = {}

    const settingsFromItems = buildSettingsFromMeetingTemplateItems(first?.meeting_template_items)

    setWordFieldSettings(prev => {
      const next = { ...prev, ...settingsFromItems }

      normalized.forEach(wf => {
        const key = wf?.value
        if (!key) return

        // 若沒有設定，補預設
        if (!next[key]) {
          next[key] = {
            name: wf?.name ?? '',
            esgoal_field: null,
          }
        } else {
          // name 空就補 wf.name
          if (next[key]?.name == null || next[key]?.name === '') {
            next[key] = { ...(next[key] || {}), name: wf?.name ?? '' }
          }
        }
      })

      return next
    })
  }, [value, modelName, normalizeWordFields])

  // ✅ 抽共用：抓 word fields + 初始化 UI（local/fileStore/other 都用）
  const fetchAndInitMeetingTemplateWordFields = useCallback(async (fileId) => {
    if (!fileId) return
    try {
      const res = await S_File.getWordFields({ params: { file_id: fileId } })
      const fields = normalizeWordFields(res?.data ?? res)

      wordFieldsFileIdRef.current = fileId
      lastCommittedSigRef.current = {}
      didInitFromValueRef.current = true // 進入上傳後就不再用 value 初始化蓋掉使用者編輯

      setWordFields(fields)
      setWordFieldSettings(prev => {
        const next = { ...prev }
        fields.forEach(f => {
          const key = f.value
          const defaultName = f?.name ?? '' // ✅ 原封不動
          if (!next[key]) {
            next[key] = { name: defaultName, esgoal_field: null }
          } else if (next[key].name === '' || next[key].name == null) {
            next[key] = { ...(next[key] || {}), name: defaultName }
          }
        })
        return next
      })
    } catch (err) {
      console.warn('[LlFilesAndImagesPicker] getWordFields failed:', err)
    }
  }, [normalizeWordFields])

  // ✅ 把 wordFields + settings 組成 meeting_template_items，塞回 value
  const commitWordFieldSettingsToValue = useCallback((settings) => {
    const fileId = wordFieldsFileIdRef.current
    if (!fileId) return

    const meetingTemplateItems = (Array.isArray(wordFields) ? wordFields : [])
      .map((wf) => {
        const key = wf?.value
        const s = settings?.[key] || {}
        const esObj = s?.esgoal_field
        const esId = esObj?.id ?? null
        const esName = esObj?.name ?? null
        const _has_line_break = wf?.has_line_break ?? false 

        if (!esId || !esName) return null

        return {
          name: (s?.name ?? esName ?? '').trim(),
          value: key,
          sequence: wf?.sequence ?? null,
          meeting_template_field: esId,
          factory: factory?.id ?? null,
          has_line_break: _has_line_break ?? undefined
        }
      })
      .filter(Boolean)

    const cur = Array.isArray(valueRef.current) ? valueRef.current : []
    const next = cur.map(item => {
      const id = item?.file?.id ?? item?.id
      if (String(id) !== String(fileId)) return item

      return {
        ...item,
        word_fields: wordFields,
        meeting_template_items: meetingTemplateItems,
      }
    })

    onChange(next)
  }, [onChange, wordFields, factory?.id])

  // ✅ 設定完成就 commit（以 esgoal_field.id 為準）
  useEffect(() => {
    if (modelName !== 'meeting_template') return
    if (!wordFieldsFileIdRef.current) return

    const settings = wordFieldSettings || {}
    let shouldCommit = false

    Object.entries(settings).forEach(([key, s]) => {
      const name = (s?.name || '').trim()
      const esObj = s?.esgoal_field
      const esId = esObj?.id ?? esObj
      const complete = !!esId
      if (!complete) return

      const sig = `${name}|${String(esId)}`
      if (lastCommittedSigRef.current[key] !== sig) {
        lastCommittedSigRef.current[key] = sig
        shouldCommit = true
      }
    })

    if (shouldCommit) {
      commitWordFieldSettingsToValue(settings)
    }
  }, [wordFieldSettings, modelName, commitWordFieldSettingsToValue])

  // ===== Permissions =====
  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          { title: 'Camera Permission', message: 'App needs camera permission' }
        )
        return granted === PermissionsAndroid.RESULTS.GRANTED
      } catch (err) {
        console.warn(err)
        return false
      }
    }
    return true
  }

  useEffect(() => {
    if (Platform.OS === 'android') requestCameraPermission()
  }, [])

  // ===== Delete =====
  const $_checkDeleteScope = async (item, index) => {
    setLoading(true)
    setCheckDeleteIndex(index)
    setCheckDeleteItem(item)

    const _params = { file_id: item.file?.id, module: modelName }
    const _res = await S_File.checkDeleteScope({ params: _params })
    setCheckDeleteScopeRes(_res.message)

    if (_res.message === 'invalid scopes') {
      setCheckDeleteModalContent('對此檔案無刪除權限，僅可以移除關聯，確定要移除與此檔案的關聯嗎？')
      setCheckDeleteModalVisible(true)
    } else if (_res.message === 'file is used') {
      setCheckDeleteModalContent('此檔案正在使用中，僅可以移除關聯，確定要移除與此檔案的關聯嗎？')
      setCheckDeleteModalVisible(true)
    } else if (_res.message === 'file can delete') {
      setCheckDeleteModalContent('確定要移除與此檔案的關聯且刪除檔案嗎？ 請注意，刪除檔案也會連同文件檔案庫的檔案一起刪除。')
      setCheckDeleteModalVisible(true)
    }
    setLoading(false)
  }

  const $_onPressEnter = async () => {
    const _params = { module: modelName, file: checkDeleteItem?.file?.id }
    setLoading(true)

    if (checkDeleteScopeRes === 'invalid scopes' || checkDeleteScopeRes === 'file is used') {
      const _value = [...value]
      _value.splice(checkDeleteIndex, 1)
      onChange(_value, checkDeleteIndex)
    } else if (checkDeleteScopeRes === 'file can delete') {
      await S_File.delete({ params: _params })
      const _value = [...value]
      _value.splice(checkDeleteIndex, 1)
      onChange(_value, checkDeleteIndex)
    }
    setLoading(false)
  }

  // ===== Upload complete =====
  const $_onUploadComplete = ($event, $id, itemIndex) => {
    const _value = [...value]
    _value[itemIndex] = $event
    onChange(_value, $id)
  }

  const $_getFileType = (item) => {
    if (typeof item === 'string') {
      return item.substring(item.lastIndexOf('.') + 1).toLowerCase().split('?')[0]
    } else {
      if (Array.isArray(value)) return value[0]?.file?.file_type
      if (value?.file_version) return value.file_version?.file_type
      return value?.file?.file_type
    }
  }

  // ✅ Local：上傳後如果 meeting_template → 打 getWordFields
  const onUploadFromLocalComplete = async (file) => {
    if (modelName === 'meeting_template') {
      const fileId = file?.id || file?.file?.id
      await fetchAndInitMeetingTemplateWordFields(fileId)
    }

    if (!oneFile) {
      const _value = [...value]
      _value.push(file)
      onChange(_value)
    } else {
      onChange([file])
    }
  }

  // ✅ FileStore：選檔後如果 meeting_template → 對「新增的第一個檔」打 getWordFields
  const onUploadFromFileStoreComplete = async (files, relatedVersion) => {
    const toUrls = (files || []).map(item => {
      if (relatedVersion === 'latest') {
        return { file: { ...item } }
      }
      if (relatedVersion === 'specific') {
        return { file: { id: item.file?.id }, file_version: { ...item } }
      }
      return null
    }).filter(Boolean)

    let pickedFileId = null

    if (!oneFile) {
      const _value = value ? [...value] : []
      const newFiles = toUrls.filter(newFile =>
        !_value.some(existingFile => existingFile.file?.id === newFile.file?.id)
      )
      const updated = [..._value, ...newFiles]
      onChange(updated)

      pickedFileId = newFiles?.[0]?.file?.id ?? null
    } else {
      onChange(toUrls)
      pickedFileId = toUrls?.[0]?.file?.id ?? null
    }

    if (modelName === 'meeting_template' && pickedFileId) {
      await fetchAndInitMeetingTemplateWordFields(pickedFileId)
    }
  }

  // ✅ OtherFileStore：同上
  const onUploadFromOtherFileStoreComplete = async (files, relatedVersion) => {
    const toUrls = (files || []).map(item => {
      if (relatedVersion === 'latest') {
        return { file: { ...item } }
      }
      if (relatedVersion === 'specific') {
        return { file: { id: item.file?.id }, file_version: { ...item } }
      }
      return null
    }).filter(Boolean)

    let pickedFileId = null

    if (!oneFile) {
      const _value = value ? [...value] : []
      const newFiles = toUrls.filter(newFile =>
        !_value.some(existingFile => existingFile.file?.id === newFile.file?.id)
      )
      const updated = [..._value, ...newFiles]
      onChange(updated)

      pickedFileId = newFiles?.[0]?.file?.id ?? null
    } else {
      onChange(toUrls)
      pickedFileId = toUrls?.[0]?.file?.id ?? null
    }

    if (modelName === 'meeting_template' && pickedFileId) {
      await fetchAndInitMeetingTemplateWordFields(pickedFileId)
    }
  }

  // helper: modal 要的格式
  const formatFileItems = (items) => {
    return (items || []).map(item => {
      if (item?.file_type && item?.source_url) return item
      const { file, file_version } = item || {}
      if (!file) return null
      return {
        id: file.id,
        file_type: file_version?.file_type || file.file_type,
        is_invalid: file_version?.is_invalid || file.is_invalid,
        name: file_version?.name || file.name,
        source_url: file_version?.source_url || file.source_url,
        version_number: file_version?.version_number || file.version_number,
      }
    }).filter(Boolean)
  }

  // ===== order mode =====
  useEffect(() => {
    if (orderMode === 'sort') {
      const next = Array.isArray(value) ? [...value] : []
      orderOriginalRef.current = next
      setOrderDraft(next)
    }
  }, [orderMode, value])

  useEffect(() => {
    if (orderConfirmToken === lastConfirmTokenRef.current) return
    lastConfirmTokenRef.current = orderConfirmToken
    if (Array.isArray(orderDraft)) onChange([...orderDraft])
  }, [orderConfirmToken, orderDraft, onChange])

  useEffect(() => {
    if (orderCancelToken === lastCancelTokenRef.current) return
    lastCancelTokenRef.current = orderCancelToken
    setOrderDraft([...orderOriginalRef.current])
  }, [orderCancelToken])

  // value 被清空時 reset（包含允許下次編輯初始化）
  useEffect(() => {
    const len = Array.isArray(value) ? value.length : 0
    const prevLen = prevValueLenRef.current
    prevValueLenRef.current = len

    if (prevLen > 0 && len === 0) {
      setWordFields([])
      setWordFieldSettings({})
      setOrderDraft([])
      orderOriginalRef.current = []
      wordFieldsFileIdRef.current = null
      lastCommittedSigRef.current = {}
      didInitFromValueRef.current = false
    }
  }, [value])

  // meeting modelName
  const updateItemAt = (arr, index, patch) =>
    arr.map((it, i) => (i === index ? { ...(it || {}), ...(patch || {}) } : it))

  const handleItemChange = useCallback((index, patch) => {
    // ✅ 更新 parent 的 value
    const next = updateItemAt(Array.isArray(value) ? value : [], index, patch)
    onChange(next)

    // ✅ 若你排序模式用的是 orderDraft，要同步一下避免畫面不一致
    if (orderMode === 'sort') {
      setOrderDraft(prev => updateItemAt(Array.isArray(prev) ? prev : [], index, patch))
    }
  }, [value, onChange, orderMode])

  return (
    <>
      <LlFilesAndImagesPickerModal
        modelName={modelName}
        oneFile={oneFile}
        limitFileExtension={limitFileExtension}
        value={formatFileItems(value)}
        loadingProgress={loadingProgress}
        isVisible={visible}
        onClose={() => setVisible(false)}
        onUploadFromFileStoreComplete={onUploadFromFileStoreComplete}
        onUploadFromLocalComplete={onUploadFromLocalComplete}
        onUploadFromOtherFileStoreComplete={onUploadFromOtherFileStoreComplete}
      />

      {value != '' && value != null && (
        orderMode === 'sort' ? (
          <DraggableFlatList
            contentContainerStyle={{ paddingBottom: 16 }}
            data={orderDraft}
            keyExtractor={(item, index) =>
              `${item?.file?.id || item?.id || item?.lazyUri || 'item'}-${index}`
            }
            onDragEnd={({ data }) => setOrderDraft(data)}
            renderItem={({ item, index, drag }) => (
              <>
                {item?.lazyUri ? (
                  <WsStateFileItem
                    testID={`WsStateFileItem-${index}`}
                    lazyUri={item.lazyUri}
                    fileType={item.fileType}
                    fileName={item.fileName}
                    needUpload={item.needUpload}
                    uploadUrl={uploadUrl}
                    uploadSuffix={uploadSuffix}
                    modelName={modelName}
                    uploadToFileStore={uploadToFileStore}
                    orderMode="sort"
                    onDragPressIn={drag}
                    onUploadComplete={($event, $id) => $_onUploadComplete($event, $id, index)}
                  />
                ) : (
                  <View style={{ marginTop: 8 }}>
                    <WsStateFileItem
                      testID={`WsStateFileItem-${index}`}
                      value={item}
                      fileType={$_getFileType(item)}
                      fileExtension={item?.fileExtension}
                      uploadUrl={uploadUrl}
                      uploadSuffix={uploadSuffix}
                      modelName={modelName}
                      uploadToFileStore={uploadToFileStore}
                      orderMode="sort"
                      onDragPressIn={drag}
                    />
                  </View>
                )}
              </>
            )}
          />
        ) : (
          <WsGrid
            style={{
              marginTop: 8,
              minHeight: value && value.length ? 80 * value.length : 0,
            }}
            numColumns={1}
            data={value}
            keyExtractor={(item, index) => `${item}-${index}`}
            renderItem={({ item, itemIndex }) => (
              <>
                {item?.lazyUri ? (
                  <WsStateFileItem
                    testID={`WsStateFileItem-${itemIndex}`}
                    lazyUri={item.lazyUri}
                    fileType={item.fileType}
                    fileName={item.fileName}
                    needUpload={item.needUpload}
                    uploadUrl={uploadUrl}
                    uploadSuffix={uploadSuffix}
                    modelName={modelName}
                    uploadToFileStore={uploadToFileStore}
                    onUploadComplete={($event, $id) => $_onUploadComplete($event, $id, itemIndex)}
                  />
                ) : (
                  <WsStateFileItem
                    testID={`WsStateFileItem-${itemIndex}`}
                    value={item}
                    fileType={$_getFileType(item)}
                    fileExtension={item?.fileExtension}
                    uploadUrl={uploadUrl}
                    uploadSuffix={uploadSuffix}
                    modelName={modelName}
                    uploadToFileStore={uploadToFileStore}
                    onRemove={() => $_checkDeleteScope(item, itemIndex)}
                    exportAttachmentName={exportAttachmentName}
                    itemIndex={itemIndex}
                    onItemChange={(patch) => handleItemChange(itemIndex, patch)}
                  />
                )}
              </>
            )}
          />
        )
      )}

      <View style={{ paddingBottom: orderMode === 'sort' ? 16 : 0 }}>
        {orderMode !== 'sort' && mode === 'default' && (
          <WsUpdateBtn
            testID={testID}
            onPress={() => setVisible(true)}
            icon={uploadBtnIcon}
          >
            {uploadBtnText ? uploadBtnText : t('上傳')}
          </WsUpdateBtn>
        )}
      </View>

      {/* ===== meeting 標記設定 ===== */}
      {modelName === 'meeting_template' && Array.isArray(wordFields) && wordFields.length > 0 && (
        <View style={{ marginTop: 16 }}>
          <WsText style={{ marginBottom: 0 }}>{t('標記設定')}</WsText>

          {wordFields.map(f => {
            const key = f.value
            const setting = wordFieldSettings[key] || {}
            const esgoalField = setting.esgoal_field

            return (
              <View
                key={key}
                style={{
                  borderWidth: 1,
                  borderColor: $color.gray,
                  borderRadius: 8,
                  padding: 12,
                  marginTop: 8,
                }}
              >
                <WsText style={{ marginBottom: 8 }}>
                  {t('標記')}　{key}
                </WsText>

                <WsText style={{ marginBottom: 8 }}>{t('名稱')}</WsText>
                <TextInput
                  value={setting.name ?? ''}
                  onChangeText={(text) => {
                    setWordFieldSettings(prev => ({
                      ...prev,
                      [key]: { ...(prev[key] || {}), name: text },
                    }))
                  }}
                  style={{
                    borderWidth: 1,
                    borderColor: $color.gray,
                    borderRadius: 6,
                    paddingHorizontal: 10,
                    paddingVertical: 8,
                    marginBottom: 12,
                  }}
                />

                <WsState
                  stateStyle={[
                    {
                      borderWidth: 1,
                      borderRadius: 10,
                      borderColor: $color.danger,
                      backgroundColor: $color.danger11l,
                    },
                  ]}
                  type="belongsto"
                  modelName="meeting_template_field"
                  nameKey="name"
                  serviceIndexKey="index"
                  hasMeta={false}
                  label={t('對應ESGoal欄位')}
                  rules={'required'}
                  errorMessage={!esgoalField && [t('此項目為必填')]}
                  value={esgoalField ?? null}
                  onChange={(v) => {
                    setWordFieldSettings(prev => ({
                      ...prev,
                      [key]: { ...(prev[key] || {}), esgoal_field: v },
                    }))
                  }}
                />
              </View>
            )
          })}
        </View>
      )}

      {orderMode !== 'sort' && mode === 'icon' && (
        <TouchableOpacity onPress={() => setVisible(true)}>
          <WsIcon name="md-image" color={$color.gray} size={24} />
        </TouchableOpacity>
      )}

      <LlPopupAlert
        text={checkDeleteModalContent}
        visible={checkDeleteModalVisible}
        onClose={() => setCheckDeleteModalVisible(false)}
        onPressEnter={$_onPressEnter}
      />

      {loading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
        >
          <WsLoading />
        </View>
      )}
    </>
  )
}

export default LlFilesAndImagesPicker
