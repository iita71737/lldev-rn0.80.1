import React, { useState, useEffect } from 'react'
import {
  View,
  SafeAreaView,
  TouchableOpacity
} from 'react-native'
import {
  WsText,
  WsFlex,
  WsIcon,
  WsIconBtn,
  WsState,
  WsGradientButton,
  LlFileCard001,
  WsPageIndex
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import moment from 'moment'

interface TabUploadFromFileStoreProps {
  remind?: string;
  remindColor?: string;
  modelName?: string;
  params?: Record<string, any>;
  onClose: () => void;
  onUploadFromFileStoreComplete: (selectedFiles: any[], selectedRadio: string) => void;
  files: any[];
  oneFile?: boolean;
  limitFileExtension?: string
}

const TabUploadFromFileStore: React.FC<TabUploadFromFileStoreProps> = (props) => {
  const { t } = useTranslation()

  const {
    remind = `請注意，當瀏覽者未取得檔案庫該資料權限可能會看不到`,
    remindColor = $color.danger,
    modelName = 'file',
    params = {
      lang: 'tw',
      order_way: 'desc',
      order_by: 'created_at',
      start_time: moment().subtract(3, 'months').startOf('day').format('YYYY-MM-DD HH:mm:ss Z'),
      end_time: moment().endOf('day').format('YYYY-MM-DD HH:mm:ss Z'),
      time_field: 'created_at'
    },
    onClose,
    onUploadFromFileStoreComplete,
    files,
    oneFile,
    limitFileExtension
  } = props

  // Redux
  const currentFactory = useSelector((state: any) => state.data.currentFactory)

  // STATES
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [selectedRadio, setSelectedRadio] = useState<string>('latest');
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [filterValue] = useState<Record<string, any>>({});
  const [filterFields] = React.useState<any>({
    file_path: {
      type: 'search',
      label: t('路徑'),
    },
    order_way: {
      type: 'picker',
      label: t('排序'),
      placeholder: t('選擇'),
      items: [
        {
          label: t('依建立日期由近至遠'),
          value: {
            order_way: 'desc',
            order_by: 'created_at'
          }
        },
        {
          label: t('依更新時間由近至遠'),
          value: {
            order_way: 'desc',
            order_by: 'updated_at'
          }
        },
      ]
    },
    button: {
      type: 'date_range',
      label: t('建立日期'),
      time_field: 'created_at'
    },
  })

  // MEMO
  const _params = React.useMemo(() => {
    if (selectedRadio === 'specific') {
      return {
        ...params,
        file_type: limitFileExtension ? limitFileExtension : undefined
      }
    } else {
      return {
        ...params,
        factory: currentFactory.id,
        file_type: limitFileExtension ? limitFileExtension : undefined
      }
    }
  }, [selectedRadio]);

  const _modelName = React.useMemo(() => {
    if (selectedRadio === 'specific') {
      return 'file_version'
    } else {
      return 'file'
    }
  }, [selectedRadio, modelName]);
  const _serviceIndexKey = React.useMemo(() => {
    if (selectedRadio === 'specific') {
      return 'indexByFactory'
    } else {
      return 'index'
    }
  }, [selectedRadio, modelName]);

  // FUNC
  const $_onPress = (item: any) => {
    if (!oneFile) {
      const index = selectedFiles.findIndex(file => file && file.id === item.id);
      if (index !== -1) {
        const _selectedFiles = selectedFiles.filter(file => file.id !== item.id);
        setSelectedFiles(_selectedFiles)
      } else {
        const _selectedFiles = [...selectedFiles, item]
        setSelectedFiles(_selectedFiles)
      }
    } else {
      const _selectedFiles = [item]
      setSelectedFiles(_selectedFiles)
    }
  }
  const $_submit = () => {
    onUploadFromFileStoreComplete(selectedFiles, selectedRadio)
    onClose()
  }

  useEffect(() => {
    setIsButtonDisabled(!(selectedRadio && selectedFiles && selectedFiles.length > 0));
  }, [selectedRadio, selectedFiles]);

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
        }}
      >

        <View
          style={{
            flex: 1,
            backgroundColor: $color.white,
            borderRadius: 10,
            paddingHorizontal: 16,
            marginBottom: 60,
          }}>
          <WsPageIndex
            modelName={_modelName}
            serviceIndexKey={_serviceIndexKey}
            params={_params}
            filterFields={filterFields}
            defaultFilterValue={filterValue}
            searchLabel={'標題'}
            ListHeaderComponent={() => {
              return (
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
                    testID={'radio'}
                    style={{
                      paddingVertical: 16,
                    }}
                    label={t('關聯版本設定')}
                    type="radio"
                    items={[
                      { label: t(`最新版本\n(將來此檔案有版本更新時，自動關聯至最新版本)`), value: 'latest' },
                      { label: t('特定版本'), value: 'specific' }
                    ]}
                    rules={'required'}
                    value={selectedRadio}
                    onChange={(e) => {
                      setSelectedFiles([])
                      setSelectedRadio(e)
                    }}
                  />

                  <View
                    style={{
                      marginBottom: 16
                    }}
                  >
                    <WsText size={14} fontWeight={600}>{t('已選擇的檔案')}</WsText>
                    {selectedFiles && selectedFiles.length > 0 ? (
                      <View
                        style={{
                        }}
                      >
                        {selectedFiles.map(file => {
                          return (
                            <View
                              style={{
                                backgroundColor: $color.white2d,
                                borderRadius: 25,
                                padding: 4,
                                marginRight: 8,
                                marginTop: 4
                              }}
                            >
                              <WsFlex
                                flexWrap="nowrap"
                                justifyContent="space-between"
                              >
                                <WsText
                                  size={14}
                                  style={{
                                    paddingHorizontal: 4,
                                  }}
                                >{file?.name}{file?.version_number && ` ver.${file?.version_number}`}</WsText>
                                <WsIconBtn
                                  padding={0}
                                  name='scc-liff-close-circle'
                                  color={$color.gray}
                                  size={24}
                                  onPress={() => {
                                    $_onPress(file)
                                  }}
                                >
                                </WsIconBtn>
                              </WsFlex>
                            </View>
                          )
                        })}
                      </View>
                    ) : (
                      <WsText size={12}>{`(${t('尚未選取檔案')})`}</WsText>
                    )}
                  </View>
                </>
              )
            }}
            renderItem={({ item, index }) => {
              return (
                <LlFileCard001
                  testID={`LlFileCard001-${index}`}
                  checked={selectedFiles.some(file => file && item.id === file.id)}
                  item={item}
                  onPress={() => {
                    $_onPress(item)
                  }}
                >
                </LlFileCard001>
              )
            }}
          >
          </WsPageIndex>
        </View>

        <WsFlex
          style={{
            paddingVertical: 12,
            position: 'absolute',
            right: 0,
            bottom: 0,
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
              alignItems: 'center',
              backgroundColor: $color.white
            }}
            onPress={() => {
              onClose()
            }}>
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
            testID={'送出'}
            style={{
              width: 110,
            }}
            disabled={isButtonDisabled}
            onPress={() => {
              $_submit()
            }}>
            {t('送出')}
          </WsGradientButton>
        </WsFlex>
      </SafeAreaView>
    </>
  )
}

export default TabUploadFromFileStore