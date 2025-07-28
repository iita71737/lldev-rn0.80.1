import React, { useCallback, useMemo } from 'react'
import {
  ScrollView,
  Text,
  View,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert,
  StyleSheet
} from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import {
  WsFlex,
  WsText,
  WsPaddingContainer,
  WsInfo,
  WsIconBtn,
  WsBottomSheet,
  WsDialogDelete,
  WsModal,
  WsVersionHistory,
  LlLicenseHeaderCard001,
  LlBtn002,
  WsCardPassage,
  WsIcon,
  WsBtn,
  WsStateInput,
  WsCollapsible,
  WsInfoUser,
  WsAvatar,
  WsState,
  WsTag,
  WsTabView,
  WsEmpty
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import licenseFields from '@/models/license'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import store from '@/store'
import { useSelector } from 'react-redux'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import i18next from 'i18next'
import FileHistoryVersion from '@/views/File/FileHistoryVersion'
import FileActivityRecord from '@/views/File/FileActivityRecord'
import S_File from '@/services/api/v1/file'
import LlFileFolderCRUDModal from './LlFileFolderCRUDModal'
import { useNavigation } from '@react-navigation/native'
import S_url from '@/__reactnative_stone/services/app/url'

const FileInfo = (props) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const {
    file
  } = props

  const [articleModal, setArticleModal] = React.useState(false)
  const [selectVersionId, setSelectVersionId] = React.useState()
  const [remarkInput, setRemarkInput] = React.useState(false)
  const [remark, setRemark] = React.useState(file && file.remark ? file.remark : null)


  // SERVICES
  const $_updateRemark = async () => {
    try {
      const _res = await S_File.remarkUpdate({
        id: file.id,
        remark: remark
      })
      if (_res) {
        navigation.replace('FileStoreShow', {
          id: _res.id
        })
      }
    } catch (e) {
      Alert.alert(t('編輯失敗'))
    }
  }

  // Helper
  const $_setArticleText = article => {
    if (article.act_version) {
      return `${article.act_version.name} ${article.no_text}`
    } else if (article.act_versions) {
      return `${article.act_versions[0].name} ${article.no_text}`
    } else {
      return t('無')
    }
  }

  return (
    <>
      <ScrollView
        style={{
          flex: 1
        }}
        scrollIndicatorInsets={{ right: 0.1 }}
      >
        {file && (
          <>
            <WsPaddingContainer
              padding={0}
              style={{
                paddingTop: 16,
                paddingHorizontal: 16,
                backgroundColor: $color.white
              }}>
              <WsFlex
                style={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'flex-start'
                }}>
                <WsFlex
                  style={{
                  }}>
                  {file.is_invalid === 1 && (
                    <WsTag
                      icon={'md-archive'}
                      iconColor={$color.danger}
                      textColor={$color.danger}
                      backgroundColor={$color.danger11l}
                      style={{
                        width: 'auto',
                        margin: 2
                      }}>
                      {t('作廢')}
                    </WsTag>
                  )}
                </WsFlex>
                {file.name && (
                  <WsText
                    size={24}
                    style={{
                      marginTop: 8,
                      marginBottom: 4,
                    }}>
                    {file.name}
                  </WsText>
                )}
              </WsFlex>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  marginBottom: 8
                }}>
                <WsAvatar size={50} source={file.updated_user?.avatar} />
                <View
                  style={{
                    marginLeft: 8
                  }}>
                  <WsText color={$color.gray}>{file.updated_user?.name}</WsText>
                  <WsText color={$color.gray}>
                    {t('編輯時間')} {moment(file.updated_at).format('YYYY-MM-DD HH:mm:ss')}
                  </WsText>
                </View>
              </View>
            </WsPaddingContainer>

            <WsPaddingContainer
              padding={0}
              style={{
                paddingHorizontal: 16,
                paddingBottom: 16,
                backgroundColor: $color.white
              }}>

              <View
                style={{
                  marginTop: 8
                }}
              >
                <WsInfo
                  labelWidth={100}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  value={file.name}
                  label={t('標題')}
                />
              </View>

              <View
                style={{
                  marginTop: 8
                }}
              >
                <WsInfo
                  labelWidth={100}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  value={file.version_number}
                  label={t('版本')}
                />
              </View>

              <View
                style={{
                  marginTop: 8
                }}
              >
                <WsInfo
                  labelWidth={100}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  value={file.des}
                  label={t('版本說明')}
                />
              </View>

              <View
                style={{
                  marginTop: 8
                }}
              >
                <WsInfo
                  labelWidth={100}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  value={moment(file.updated_at).format('YYYY-MM-DD HH:mm:ss')}
                  label={t('上傳日期')}
                />
              </View>

              <View
                style={{
                  marginTop: 8
                }}
              >
                <WsInfo
                  labelWidth={100}
                  type={'user'}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  value={
                    file?.created_user
                  }
                  label={t('上傳者')}
                />
              </View>

              <View
                style={{
                  marginTop: 8
                }}
              >
                <WsInfo
                  labelWidth={100}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  size={14}
                  iconVisible={false}
                  value={file.file_path.replace(/\//g, ' > ')}
                  label={t('檔案位置')}
                />
              </View>

              <View
                style={{
                  marginTop: 8
                }}
              >
                <WsInfo
                  type={'belongstomany'}
                  iconVisible={false}
                  labelWidth={100}
                  size={14}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  label={t('共享單位')}
                  valueFontSize={12}
                  value={file.share_factories}
                />
              </View>

              {((
                file &&
                file.act_version_alls &&
                file.act_version_alls.length != 0 ||
                (
                  file &&
                  file.article_versions &&
                  file.article_versions.length > 0
                ))
                && (
                  <>
                    <View
                      style={{
                        marginTop: 16,
                        flexDirection: 'row'
                      }}>
                      <WsText size={14} fontWeight={600}>{t('法規依據')}</WsText>
                    </View>
                    {file &&
                      file.act_version_alls &&
                      file.act_version_alls.length != 0 && (
                        <>
                          {file.act_version_alls.map(
                            (article, articleIndex) => {
                              return (
                                <WsInfo
                                  testID={`法規-${articleIndex}`}
                                  style={{
                                    marginTop: 8,
                                  }}
                                  type="link"
                                  value={
                                    article.name
                                  }
                                  onPress={() => {
                                    navigation.push('RoutesAct', {
                                      screen: 'ActShow',
                                      params: {
                                        id: article.act.id,
                                      }
                                    })
                                  }}
                                />
                              )
                            }
                          )}
                        </>
                      )}

                    {file &&
                      file.article_versions &&
                      file.article_versions.length > 0 &&
                      file.article_versions.map(
                        (article, articleIndex) => {
                          return (
                            <View
                              key={articleIndex}
                              style={{
                                marginTop: 8,
                                // borderWidth: 1,
                                flexDirection: 'row',
                                justifyContent: 'flex-start',
                                alignItems: 'center'
                              }}>
                              <WsInfo
                                testID={`法條-${articleIndex}`}
                                style={{
                                  flexWrap: 'nowrap',
                                  width: width * 0.8,
                                }}
                                type="link"
                                value={$_setArticleText(article)}
                                onPress={() => {
                                  setSelectVersionId(article.id)
                                  setArticleModal(true)
                                }}
                              />
                            </View>
                          )
                        }
                      )}
                  </>
                )
              )}
            </WsPaddingContainer>

            {file.remark && !remarkInput && (
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                  marginTop: 8
                }}
              >
                <WsFlex
                  style={{
                  }}
                  justifyContent={'space-between'}
                >
                  <WsInfo
                    infoMarginTop={16}
                    label={i18next.t('備註')}
                    style={{
                    }}
                    value={
                      remark
                        ? remark
                        : file.remark
                          ? file.remark
                          : i18next.t('無')
                    }
                  />
                </WsFlex>
                <LlBtn002
                  minHeight={0}
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: 16
                  }}
                  onPress={() => {
                    setRemark(file.remark)
                    setRemarkInput(true)
                  }}
                >
                  {t('編輯')}
                </LlBtn002>
                <WsFlex flexWrap={'wrap'}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginVertical: 8,
                      marginRight: 8
                    }}>
                    <WsIcon
                      name="md-access-time"
                      size={20}
                      color={$color.gray}
                      style={{ marginRight: 4 }}
                    />
                    <WsText color={$color.gray} size={14}>
                      <>
                        {i18next.t('編輯時間')}
                        {moment(file.remark_updated_at).format('YYYY-MM-DD HH:mm')}
                      </>
                    </WsText>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginVertical: 8
                    }}>
                    {file.updated_user && (
                      <>
                        <WsAvatar
                          style={{
                          }}
                          size={20}
                          source={
                            file.updated_user?.avatar
                          }
                        />
                        <View style={styles.content}>
                          {file.updated_user?.name && (
                            <Text style={styles.title}>{file.updated_user?.name}</Text>
                          )}
                        </View>
                      </>
                    )
                    }
                  </View>
                </WsFlex>
              </WsPaddingContainer>
            )}

            {remarkInput && (
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                  marginTop: 8
                }}>
                <WsFlex
                  style={{
                    position: 'absolute',
                    right: 16,
                    top: 16,
                    zIndex: 999
                  }}
                >
                  <LlBtn002
                    minHeight={0}
                    style={{
                      width: 62,
                      marginRight: 4
                    }}
                    onPress={() => {
                      setRemark(remark)
                      setRemarkInput(false)
                    }}
                  >
                    {t('取消')}
                  </LlBtn002>
                  <LlBtn002
                    minHeight={0}
                    bgColor={$color.primary}
                    textColor={$color.white}
                    borderColor={$color.primary10l}
                    borderWidth={0}
                    style={{
                      width: 62,
                    }}
                    onPress={() => {
                      setRemarkInput(false)
                      $_updateRemark()
                    }}
                  >
                    {t('儲存')}
                  </LlBtn002>
                </WsFlex>
                <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                  <WsState
                    style={{
                      marginTop: 8,
                    }}
                    label={i18next.t('編輯')}
                    multiline={true}
                    value={remark ? remark : ''}
                    onChange={$event => {
                      if (!$event) {
                        setRemark('')
                      } else {
                        setRemark($event)
                      }
                    }}
                    placeholder={i18next.t('輸入')}
                  />
                </TouchableWithoutFeedback>
              </WsPaddingContainer>
            )}

            <WsPaddingContainer
              style={{
                backgroundColor: $color.white,
                marginTop: 8
              }}>
              <WsInfo
                type="file"
                text={decodeURI(S_url.getFileName(file.source_url))}
                label={t('檔案')}
                value={file.source_url}
              />
            </WsPaddingContainer>

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
        )}
      </ScrollView>
    </>
  )
}

export default FileInfo

const styles = StyleSheet.create({
  avatar: {
    width: 50,
    height: 50,
    flex: 0,
  },
  content: {
    paddingLeft: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4a4a4a',
  },
});