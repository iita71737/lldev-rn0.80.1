import React, { useState, useEffect } from 'react'
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Keyboard,
  Platform
} from 'react-native'
import {
  WsText,
  WsFlex,
  WsIcon,
  WsState,
  WsGradientButton,
  WsLoading
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import S_Wasa from '@/__reactnative_stone/services/wasa'
import S_File from '@/services/api/v1/file'
import RNFS from 'react-native-fs'

interface TabUploadFromFileStoreProps {
  remind?: string;
  remindColor?: string;
  onClose: () => void;
  onUploadComplete: (file: any) => void;
  modelName?: string;
  limitFileExtension?: string;
}

interface FileObject {
  uri: string;
  name: string;
  type: string;
}

const TabUploadFromFileStore: React.FC<TabUploadFromFileStoreProps> = (props) => {
  const { t } = useTranslation()

  const {
    remind = `請注意，檔案上傳後自動歸類至文件檔案庫「系統資料夾」，若您需要整理檔案至特定資料夾或設定權限，請至文件檔案庫進行管理。`,
    remindColor = $color.danger,
    onClose,
    onUploadComplete,
    modelName,
    limitFileExtension
  } = props

  // Redux
  const currentFactory = useSelector((state: any) => state.data.currentFactory)

  // STATE
  const [fileTitle, setFileTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState<FileObject | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [onSubmitLoading, setOnSubmitLoading] = React.useState(false)

  // helper
  const getFileExtension = (filePath: string) => {
    if (!filePath) return '';
    const segments = filePath.split('/');
    const fileName = segments[segments.length - 1];
    const extension = fileName.split('.').pop();
    return extension.toLowerCase();
  }

  const getMimeTypeFromExtension = (extension) => {
    const mimeTypes = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      svg: 'image/svg+xml',
      bmp: 'image/bmp',
      webp: 'image/webp',
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      mkv: 'video/x-matroska',
      wmv: 'video/x-ms-wmv',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      csv: 'text/csv',
      txt: 'text/plain',
    };
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream'; // 找不到時給通用型
  };

  // 上傳含有特殊字元的處理
  const toFileUri = (uri) => {
    if (!uri) return uri
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(uri)) return uri // file://, content://, http(s)://
    if (uri.startsWith('/')) return `file://${uri}`
    return uri
  }

  // 上傳含有特殊字元的處理002
  const copyToSafeTemp = async (rawUri, safeFileName) => {
    const fileUri = toFileUri(rawUri)
    if (Platform.OS !== 'ios') return fileUri
    if (!fileUri?.startsWith('file://')) return fileUri

    const srcPath = fileUri.replace('file://', '')
    const dstPath = `${RNFS.TemporaryDirectoryPath}/${Date.now()}_${safeFileName}`
    await RNFS.copyFile(srcPath, dstPath)
    return `file://${dstPath}`
  }

  // FUNC
  const $_submit = async () => {
    setOnSubmitLoading(true) // 測試API問題時可以先關閉
    const rawUri =
      typeof selectedFile === 'string'
        ? selectedFile
        : selectedFile?.uri

    if (!rawUri) return

    // ✅ filename 優先用 picker 回來的 name（避免 rawUri 內 #/% 影響解析）
    const originalName =
      (typeof selectedFile === 'object' && selectedFile?.name)
        ? selectedFile.name
        : (S_Wasa.getFileNameFromUrl(rawUri) || fileTitle || 'file')

    const safeFileName = String(originalName ?? '')
      .trim()
      .replace(/[^\p{L}\p{N}._-]+/gu, '') // 260123-issue-特殊字元拔掉
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')

    const fileType = getFileExtension(originalName)
    const mimeType = getMimeTypeFromExtension(fileType)

    // ✅ 先 copy 成安全檔名，再用新 uri 上傳
    const uploadUri = await copyToSafeTemp(rawUri, safeFileName)

    const formData = new FormData()
    formData.append('factory', currentFactory.id)
    formData.append('module', modelName)
    formData.append('file', {
      uri: uploadUri,
      // uri: rawUri, // 260123-issue-特殊字元-upload-改用 safe uri
      type: mimeType,
      // name: safeFileName,
      name: originalName
    })

    const _params = {
      formData,
      filename: safeFileName
    }

    console.log(JSON.stringify(_params), 'storeSystemFile_params')

    try {
      const _storeSystemFile = await S_File.storeSystemFile({ params: _params })
      onUploadComplete({ file: { ..._storeSystemFile } })
      onClose()
    } catch (e) {
      console.error(e)
    } finally {
      setOnSubmitLoading(false)
    }
  }

  useEffect(() => {
    if (selectedFile && typeof selectedFile === 'object' && selectedFile.fileName) {
      setFileTitle(selectedFile.fileName)
    }
    setIsButtonDisabled(!(fileTitle && typeof selectedFile === 'string'));
  }, [fileTitle, selectedFile]);

  return (
    <>
      <Modal
        visible={onSubmitLoading}
        transparent={true}
        onRequestClose={() => {
        }}
      >
        <WsLoading
          type={'b'}
          style={{
            flex: 1,
            zIndex: 9999
          }}
        ></WsLoading>
      </Modal >

      <SafeAreaView
        style={{
          flex: 1
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: $color.white,
            borderRadius: 10,
            paddingHorizontal: 16,
          }}>
          {remind && (
            <>
              <TouchableOpacity
                style={{
                  paddingVertical: 16
                }}
                onPress={() => {
                }}
              >
                <WsFlex style={[
                  {
                    marginTop: 12
                  }
                ]}
                >
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

              <WsState
                style={{
                  marginVertical: 16,
                }}
                rules={'required'}
                type="text"
                label={t("標題")}
                placeholder={t('輸入')}
                placeholderTextColor={$color.gray}
                value={fileTitle}
                onChange={setFileTitle}
                onSubmitEditing={() => Keyboard.dismiss()}
              />

              <WsState
                type="fileOrImage"
                label={t('附件')}
                value={selectedFile}
                onChange={setSelectedFile}
                limitFileExtension={limitFileExtension}
              // modelName={modelName} // 260120-issue-DO NOT USE IT
              />

              <WsFlex
                style={{
                  position: 'absolute',
                  right: 16,
                  bottom: 16,
                }}
              >
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderColor: $color.gray,
                    borderRadius: 25,
                    borderWidth: 1,
                    width: 110,
                    height: 48,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: $color.white
                  }}
                  onPress={() => {
                    onClose()
                  }}
                >
                  <WsText
                    style={{
                      padding: 1
                    }}
                    size={14}
                    color={$color.gray}
                  >{t('取消')}
                  </WsText>
                </TouchableOpacity>
                <WsGradientButton
                  style={{
                    width: 110,
                  }}
                  disabled={isButtonDisabled}
                  onPress={() => {
                    $_submit()
                  }}>
                  {t('確定')}
                </WsGradientButton>
              </WsFlex>

            </>
          )}
        </View>
      </SafeAreaView>
    </>
  )
}

export default TabUploadFromFileStore
