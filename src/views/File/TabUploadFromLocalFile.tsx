import React, { useState, useEffect } from 'react'
import {
  View,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  Keyboard
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

  // FUNC
  const $_submit = async () => {
    setOnSubmitLoading(true)
    const fileName = S_Wasa.getFileNameFromUrl(selectedFile)
    const fileType = getFileExtension(selectedFile)
    const mimeType = getMimeTypeFromExtension(fileType);
    // console.log(mimeType,'mimeType---');
    const formData = new FormData();
    formData.append('factory', currentFactory.id);
    formData.append('module', modelName);
    formData.append('file', {
      uri: selectedFile,
      type: mimeType,
      name: fileTitle,
    });
    const _params = {
      formData: formData,
      filename: `${fileTitle}.${fileType}`
    }
    console.log(JSON.stringify(_params), '_params---');
    try {
      const _storeSystemFile = await S_File.storeSystemFile({ params: _params })
      // console.log(_storeSystemFile, '_storeSystemFile---');
      const _formattedFile = {
        file: {
          ..._storeSystemFile
        }
      }
      onUploadComplete(_formattedFile)
      onClose()
    } catch (e) {
      console.error(e);
    }
    setOnSubmitLoading(false)
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
                    height:48,
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
