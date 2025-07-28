import React, { useState, useEffect } from 'react'
import {
  View,
  FlatList,
  TouchableOpacity,
  Dimensions,
  PixelRatio,
  AppState
} from 'react-native'
import {
  WsPaddingContainer,
  WsInfiniteScroll,
  WsFilter,
  LlBtn002,
  LlActCard001,
  WsText,
  WsSkeleton,
  LlActLibrarySystemClassCard002,
  WsEmpty,
  WsIconBtn,
  WsFilter002,
  WsPageIndex,
  WsCard,
  WsDes,
  WsInfo,
  WsPopup,
  WsFlex,
  WsModal
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import S_FileLog from '@/services/api/v1/file_log'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import { useNavigation } from '@react-navigation/native'
import { ScrollView } from 'react-native-gesture-handler'

const FileActivityRecord = (props) => {
  const { t } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()

  const {
    file,
  } = props

  const [appState, setAppState] = useState(AppState.currentState);
  const [fontScale, setFontScale] = useState(1);
  // Modal for act show
  const [selectVersionId, setSelectVersionId] = React.useState()
  const [articleModal, setArticleModal] = React.useState(false)
  // States
  const [visible, setVisible] = React.useState(false)
  const [onPressPreloadLoading, setOnPressPreloadLoading] = React.useState(false)
  const [downloaded, setDownloaded] = React.useState()
  const [fileLog, setFileLog] = React.useState()
  const [params] = React.useState({
    lang: "tw",
    order_by: "created_at",
    order_way: "desc",
    file: file
  })

  // helper
  const $_setActionText = (text) => {
    if (text === 'create_file') {
      return (t('新增'))
    } else if (text === 'create_file_version') {
      return (t('上傳新版本'))
    } else if (text === 'update_path') {
      return (t('移動'))
    } else if (text === 'update_file') {
      return (t('編輯'))
    }
  }
  const $_setShareChangeText = (text) => {
    if (text === 'add') {
      return (t('[新增]'))
    } else if (text === 'remove') {
      return (t('[移除]'))
    } else if (text === 'create_file_version') {
      return (t('上傳新版本'))
    } else if (text === 'update_path') {
      return (t('移動'))
    } else if (text === 'update_file') {
      return (t('編輯'))
    }
  }
  const $_setArticleText = article => {
    if (article.act_version) {
      return `${article.act_version.name} ${article.no_text}`
    } else if (article.act_versions) {
      return `${article.act_versions[0].name} ${article.no_text}`
    } else {
      return t('無')
    }
  }
  const $_setArticleVersionChangeText = (type) => {
    if (type === 'remove') {
      return ('[解除綁定] ')
    } else if (type === 'add') {
      return ('[新增綁定] ')
    }
  }
  const removeLastPartAfterSlash = (filePath) => {
    const lastSlashIndex = filePath.lastIndexOf('/');
    if (lastSlashIndex === -1) {
      return filePath;
    }
    return filePath.substring(0, lastSlashIndex);
  }

  // Services
  const $_fetchFileLog = async (id) => {
    try {
      const res = await S_FileLog.show({ modelId: id });
      setFileLog(res);
      setVisible(true)
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const handleAppStateChange = async (nextAppState) => {
      if (appState.match(/inactive|background/) && nextAppState === 'active') {
        const scale = await PixelRatio.getFontScale();
        setFontScale(scale);
      }
      setAppState(nextAppState);
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [appState]);

  return (
    <>
      <WsPageIndex
        modelName={'file_log'}
        serviceIndexKey={'index'}
        params={params}
        filterVisible={false}
        renderItem={({ item, index, __params }) => {
          return (
            <TouchableOpacity
              disabled={true}
              onPress={() => {
              }}
            >
              <WsCard style={[
                {
                  paddingBottom: 8,
                  paddingTop: 16
                }
              ]}
              >
                <View
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 999,
                  }}
                >
                  {item.action !== 'create_file' && (
                    <WsIconBtn
                      name={onPressPreloadLoading ? 'md-info' : 'md-info-outline'}
                      color={$color.gray}
                      onPress={() => {
                        $_fetchFileLog(item.id)
                      }}
                      padding={0}
                      size={24}
                    />
                  )}
                </View>
                <View
                  style={{
                    flexDirection: 'column',
                    flexWrap: 'nowrap',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    marginBottom: 8
                  }}>
                  {item && item.action && (
                    <WsText
                      style={{
                        marginTop: 8
                      }}>
                      {$_setActionText(item.action)}
                    </WsText>
                  )}
                </View>

                <WsInfo
                  labelWidth={75}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: 16,
                  }}
                  type={'user'}
                  label={t('上傳者')}
                  labelSize={12}
                  labelFontWeight={300}
                  value={item.created_user ? item.created_user : t('無')}
                />

                <WsInfo
                  labelWidth={75}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: 4
                  }}
                  labelSize={12}
                  labelFontWeight={300}
                  label={t('時間')}
                  value={moment(item.created_at)}
                  type="dateTime"
                />

              </WsCard>
            </TouchableOpacity>
          )
        }}
      >
      </WsPageIndex>

      <WsPopup
        active={visible}
        onClose={() => {
          setVisible(false)
        }}>

        <View
          style={{
            width: width * 0.9,
            maxHeight: height * 0.85,
            backgroundColor: $color.white,
            borderRadius: 10,
            padding: 16
          }}
        >
          <ScrollView
            contentContainerStyle={{
              justifyContent: 'center',
            }}
          >


            <WsFlex
              justifyContent={'space-between'}
              style={{
              }}
            >
              <WsText size={18} fontWeight={600}>{t('活動記錄詳細內容')}</WsText>
              <WsIconBtn
                size={24}
                name={"md-close"}
                onPress={
                  () => setVisible(false)
                }
              >
              </WsIconBtn>
            </WsFlex>

            {fileLog &&
              fileLog.payload &&
              fileLog.payload.old_name &&
              fileLog.payload.new_name && (
                <WsFlex
                  alignItems="flex-start"
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsText size={14}>{t('標題異動')}</WsText>
                  <View
                    style={{
                      marginLeft: 16,
                      maxWidth: width * 0.6
                    }}
                  >
                    <WsText size={14}>{`[${t('變更前')}]${fileLog.payload.old_name}`}</WsText>
                    <WsText size={14}>{`[${t('變更後')}]${fileLog.payload.new_name}`}</WsText>
                  </View>
                </WsFlex>
              )}

            {fileLog &&
              fileLog.payload &&
              fileLog.payload.version_number && (
                <WsFlex
                  alignItems="flex-start"
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsText size={14} fontWeight={600}>{t('版本異動')}</WsText>
                  <View
                    style={{
                      marginLeft: 16,
                      maxWidth: width * 0.6
                    }}
                  >
                    <WsText size={14}>{`[${t('變更前')}]${fileLog.payload.version_number - 1}`}</WsText>
                    <WsText size={14}>{`[${t('變更後')}]${fileLog.payload.version_number}`}</WsText>
                  </View>
                </WsFlex>
              )}

            {fileLog &&
              fileLog.payload &&
              (fileLog.payload.new_des != undefined ||
                fileLog.payload.old_des != undefined) && (
                <WsFlex
                  alignItems="flex-start"
                  style={{
                    marginTop: 8,
                    maxWidth: width * 0.55
                  }}
                >
                  <WsText size={14} fontWeight={600}>{t('版本說明異動')}</WsText>
                  <View
                    style={{
                      marginLeft: 16
                    }}
                  >
                    <WsText size={14}>{fileLog.payload.old_des ? `[${t('變更前')}]${fileLog.payload.old_des}` : `[${t('變更前')}] ${t('無')}`}</WsText>
                    <WsText size={14}>{fileLog.payload.new_des ? `[${t('變更後')}] ${fileLog.payload.new_des}` : `[${t('變更後')}] ${t('無')}`}</WsText>
                  </View>
                </WsFlex>
              )}

            {fileLog &&
              fileLog.payload &&
              fileLog.payload.new_remark &&
              fileLog.payload.old_remark && (
                <WsFlex
                  alignItems="flex-start"
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsText size={14} fontWeight={600}>{t('備註異動')}</WsText>
                  <View
                    style={{
                      marginLeft: 16,
                      maxWidth: width * 0.55
                    }}
                  >
                    <WsText size={14}>{`[${t('變更前')}]${fileLog.payload.old_remark}`}</WsText>
                    <WsText size={14}>{`[${t('變更後')}]${fileLog.payload.new_remark}`}</WsText>
                  </View>
                </WsFlex>
              )}

            {fileLog &&
              fileLog.payload &&
              (fileLog.payload.old_file_path &&
                fileLog.payload.file_path) && (
                <WsFlex
                  alignItems="flex-start"
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsText size={14}>{t('位置異動')}</WsText>
                  <View
                    style={{
                      marginLeft: 16,
                      maxWidth: width * 0.6
                    }}
                  >
                    <WsText size={14}>{`[${t('變更前')}] ${t('最上層')}/${removeLastPartAfterSlash(fileLog.payload?.old_file_path)}`}</WsText>
                    <WsText size={14}>{`[${t('變更後')}] ${t('最上層')}/${removeLastPartAfterSlash(fileLog.payload?.file_path)}`}</WsText>
                  </View>
                </WsFlex>
              )}

            {fileLog &&
              fileLog.payload &&
              fileLog.payload.old_is_invalid != undefined &&
              fileLog.payload.new_is_invalid != undefined && (
                <WsFlex
                  alignItems="flex-start"
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsText size={14}>{t('作廢異動')}</WsText>
                  <View
                    style={{
                      marginLeft: 16,
                      maxWidth: width * 0.6
                    }}
                  >
                    <WsText size={14}>{`[${t('變更前')}]${fileLog.payload.old_is_invalid === 1 ? t('使用中') : t('作廢')}`}</WsText>
                    <WsText size={14}>{`[${t('變更後')}]${fileLog.payload.new_is_invalid === 1 ? t('使用中') : t('作廢')}`}</WsText>
                  </View>
                </WsFlex>
              )}

            {fileLog &&
              fileLog.share_factories &&
              fileLog.share_factories.length > 0 && (
                <WsFlex
                  alignItems="flex-start"
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsText size={14} style={{ width: 84 }} fontWeight={600}>{t('共享異動')}</WsText>
                  <View
                    style={{
                      marginLeft: 16,
                      maxWidth: width * 0.6
                    }}
                  >
                    {fileLog.share_factories.map(factory => {
                      return (
                        <WsText size={14}>{`${$_setShareChangeText(factory.type)}${factory.name}`}</WsText>
                      )
                    })}
                  </View>
                </WsFlex>
              )}

            {/* {fileLog &&
              fileLog.payload &&
              fileLog.payload.new_is_secret != undefined &&
              fileLog.payload.old_is_secret != undefined && (
                <WsFlex
                  alignItems="flex-start"
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsText size={14}>{t('機密設定異動')}</WsText>
                  <View
                    style={{
                      marginLeft: 16,
                      maxWidth: width * 0.6
                    }}
                  >
                    <WsText size={14}>{`[${t('變更前')}]${fileLog.payload.old_is_secret === 1 ? t('機密') : t('公開')}`}</WsText>
                    <WsText size={14}>{`[${t('變更後')}]${fileLog.payload.new_is_secret === 1 ? t('機密') : t('公開')}`}</WsText>
                  </View>
                </WsFlex>
              )} */}


            {((
              fileLog &&
              fileLog.article_versions &&
              fileLog.article_versions.length > 0 ||
              (
                fileLog &&
                fileLog.act_version_alls &&
                fileLog.act_version_alls.length > 0
              ))
            ) && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap'
                  }}
                >
                  <>
                    <WsText size={14} style={{ width: 120 }} fontWeight={600}>{t('法規依據異動')}</WsText>
                    {fileLog.article_versions.map((article, articleIndex) => {
                      return (
                        <View
                          key={articleIndex}
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'flex-start',
                          }}>
                          <WsText size={14} style={{}}>{`${$_setArticleVersionChangeText(article.type)}`}</WsText>
                          <WsInfo
                            style={{
                              maxWidth: width * 0.6
                            }}
                            iconSize={16}
                            size={14}
                            type="link"
                            value={$_setArticleText(article)}
                            onPress={() => {
                              setSelectVersionId(article.id)
                              setArticleModal(true)
                            }}
                          />
                        </View>
                      )
                    })}
                    {fileLog &&
                      fileLog.act_version_alls &&
                      fileLog.act_version_alls.length > 0 && (
                        <>
                          {fileLog.act_version_alls.map(
                            (article, articleIndex) => {
                              return (
                                <View
                                  key={articleIndex}
                                  style={{
                                    flexDirection: 'row',
                                    justifyContent: 'flex-start',
                                    alignItems: 'center',
                                  }}>
                                  <WsText size={14} style={{}}>{`${$_setArticleVersionChangeText(article.type)}`}</WsText>
                                  <WsInfo
                                    style={{
                                      maxWidth: width * 0.6,
                                      flexWrap: 'nowrap'
                                    }}
                                    size={14}
                                    type="link"
                                    value={
                                      article.name
                                    }
                                    onPress={() => {
                                      setVisible(false)
                                      navigation.push('RoutesAct', {
                                        screen: 'ActShow',
                                        params: {
                                          id: article.act.id,
                                        }
                                      })
                                    }}
                                  />
                                </View>
                              )
                            }
                          )}
                        </>
                      )}
                  </>
                </View>
              )}
          </ScrollView>
        </View>

      </WsPopup>

      <WsModal
        title={t('法規依據')}
        visible={articleModal}
        headerLeftOnPress={() => {
          setArticleModal(false)
        }}
        onBackButtonPress={() => {
          setArticleModal(false)
        }}>
        <ViewArticleShowForModal versionId={selectVersionId} />
      </WsModal>
    </>
  )
}

export default FileActivityRecord