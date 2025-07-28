import React, { useCallback } from 'react'
import {
  ScrollView,
  Text,
  View,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert,
  FlatList
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
  LlInfoContainer001,
  LlRelatedGuidelineItem001,
  WsPassageCollapse
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_License from '@/services/api/v1/license'
import licenseFields from '@/models/license'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import store from '@/store'
import { useSelector } from 'react-redux'
import { setCurrentLicense } from '@/store/data'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import i18next from 'i18next'
import { WsSkeleton } from '@/components'
import {
  setRefreshCounter,
} from '@/store/data'
import { useNavigation } from '@react-navigation/native'

const LicenseOverview = ({ route, ...props }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Params
  const id = props?.id || route?.params?.id || null;
  const refreshKey = props?.refreshKey || route?.params?.refreshKey || null;

  console.log(id,'=id=');

  // REDUX
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // States
  const [loading, setLoading] = React.useState(true)

  const [remarkInput, setRemarkInput] = React.useState(false)
  const [remark, setRemark] = React.useState()

  const [stateModal, setStateModal] = React.useState(false)
  const [license, setLicense] = React.useState()

  const [dialogVisible, setDialogVisible] = React.useState(false)
  const [licenseArticle, setLicenseArticle] = React.useState()
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [bottomSheetItems, setBottomSheetItems] = React.useState([])
  const [reloadScreen, setReloadScreen] = React.useState(refreshKey)

  // Modal for act show
  const [actModal, setActModal] = React.useState(false)
  const [selectVersionId, setSelectVersionId] = React.useState()

  // Services
  const $_fetchLicense = async () => {
    setLoading(true)
    try {
      const res = await S_License.show({ modelId: id })
      setLicense(res)
      if (res.last_version && res.last_version.remark) {
        setRemark(res.last_version.remark)
      }
      store.dispatch(setCurrentLicense(res))
    } catch (e) {
      console.error(e);
    }
    setLoading(false)
  }

  const $_fetchArticle = async () => {
    if (license) {
      const res = await S_License.getLicenseActs({ licenseVersion: license })
      setLicenseArticle(res)
    }
  }

  const $_updateRemark = async () => {
    try {
      const _res = await S_License.remarkUpdate({
        id: license.last_version.id,
        remark: remark
      })
      setRemark(_res.remark)
    } catch (e) {
      Alert.alert(t('編輯失敗'))
      console.error(e);
    }
  }

  // Storage
  const $_setStorage = async () => {
    // 移除object中的值為null的欄位
    const _copy_last_version = { ...license.last_version }
    Object.keys(_copy_last_version).forEach(key => {
      if (_copy_last_version[key] === null) {
        delete _copy_last_version[key]
      }
    })
    // 設定初始化valid_end_date_checkbox狀態
    let _checkbox = false
    if (!_copy_last_version.valid_end_date &&
      _copy_last_version.license_type?.name?.includes(t('回訓'))) {
      // https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1778
      _checkbox = true
    }
    // 設定來自後台的法定展延期限天數
    let recommend_notify_period
    let statitory_extension_period
    const _license_template = { ...license.license_template }
    recommend_notify_period = _license_template.last_version?.recommend_notify_period
    statitory_extension_period = _license_template.last_version?.statitory_extension_period
    let _license = {
      ...license,
      ..._copy_last_version,
      id: license.id,
      versionId: _copy_last_version.id,
      statitory_extension_period: statitory_extension_period ? statitory_extension_period : undefined,
      recommend_notify_period: recommend_notify_period ? recommend_notify_period : undefined,
      valid_end_date_checkbox: _checkbox,
      // 來自後台的證照類型顯示欄位(廠證)
      license_owned_factory: currentFactory,
      // 關聯內規-顯示用（我綁他人）
      related_guidelines_articles: [],
    }
    // 類型為其他的證照
    if (license.license_type &&
      license.license_type.name &&
      license.license_type.name === '其他'
    ) {
      _license.license_owner = license.taker ? license.taker : currentFactory
    }
    // 回訓欄位格式化
    if (license.last_version &&
      (license.last_version.retraining_year || license.last_version.retraining_hour)) {
      _license.retraining_rule = {
        years: license.last_version.retraining_year ? license.last_version.retraining_year : 0,
        hours: license.last_version.retraining_hour ? license.last_version.retraining_hour : 0
      }
    }
    // 續辦提醒設定日期
    if (_license.remind_date) {
      _license.remind_date_radio = 2
    } else {
      _license.remind_date_radio = 1
    }
    // 關聯內規-顯示
    _license?.related_guidelines?.forEach(item => {
      if (item.guideline_article_version) {
        // 綁特定版本條文
        _license.related_guidelines_articles.push({
          ...item.guideline_article_version,
          guideline_id: item?.guideline?.id,
          guideline_version_id: item?.guideline_version?.id,
          guideline_article: item?.guideline_article,
          guideline_article_version_id: item?.guideline_article_version?.id,
          bind_version: 'specific_ver',
          bind_type: 'specific_layer_or_article'
        })
      }
      else if (item.guideline_article) {
        // 綁最新版本條文
        _license.related_guidelines_articles.push({
          ...item.guideline_article.last_version,
          guideline_id: item?.guideline?.id ? item?.guideline?.id : item.guideline_id ? item.guideline_id : undefined,
          guideline_version_id: item?.guideline_version?.id,
          guideline_article: {
            ...item?.guideline_article?.last_version,
            id: item?.guideline_article?.id
          },
          bind_version: 'last_ver',
          bind_type: 'specific_layer_or_article'
        })
      }
      else if (item.guideline_version) {
        // 綁特定版本整部內規
        _license.related_guidelines_articles.push({
          ...item.guideline_version,
          guideline_id: item?.guideline?.id,
          guideline_version: item?.guideline_version,
          bind_version: 'specific_ver',
          bind_type: 'whole_guideline'
        })
      }
      else if (item.guideline) {
        // 綁最新版本整部內規
        _license.related_guidelines_articles.push({
          ...item.guideline,
          guideline_id: item?.guideline?.id,
          bind_version: 'last_ver',
          bind_type: 'whole_guideline'
        })
      }
    });
    // console.log(JSON.stringify(_license), '_license---');
    const _value = JSON.stringify(_license)
    await AsyncStorage.setItem('LicenseUpdate', _value)
  }

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      title: license && license.license_type ? license.license_type?.name : t('證照'),
      headerRight: () => {
        return (
          <>
            <WsIconBtn
              name="ws-outline-edit-pencil"
              size={24}
              color={$color.white}
              style={{
                marginRight: 4
              }}
              onPress={() => {
                $_setStorage()
                setIsBottomSheetActive(true)
              }}
            />
          </>
        )
      },
      headerLeft: () => {
        return (
          <WsIconBtn
            testID="backButton"
            name="ws-outline-arrow-left"
            color="white"
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              navigation.goBack()
              if (refreshKey) {
                store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
              }
            }}
          />
        )
      }
    })
  }

  const $_setBottomSheet = () => {
    setBottomSheetItems([
      {
        to: {
          name: 'LicenseUpdate',
          params: {
            id: id,
            versionId: license ? license.last_version.id : ''
          }
        },
        icon: 'ws-outline-edit-pencil',
        label: t('編輯')
      },
      {
        to: {
          name: 'LicenseUpdateVersion',
          params: {
            id: id,
            versionId: license ? license.last_version.id : ''
          }
        },
        icon: 'md-update',
        label: t('更新版本')
      },
      {
        onPress: () => {
          setDialogVisible(true)
        },
        color: $color.danger,
        labelColor: $color.danger,
        icon: 'ws-outline-delete',
        label: t('刪除')
      }
    ])
  }

  // Function
  const $_isShowFields = fields => {
    return license.license_type?.show_fields?.includes(fields)
  }

  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
    }
  }

  // helper
  const $_validEndDate = (validEndDate) => {
    if (!validEndDate) return '';
    let today = new Date();
    const newDate = moment(today);
    const secondDate = moment(validEndDate);
    return newDate.diff(secondDate, 'days') > 0 ? t('逾期') : '';
  }

  // Fields
  const $_setFields = () => {
    let _fields = {}
    const showFields = [
      'license_type',
      'name',
      'image',
      'taker',
      'approval_letter',
      'valid_end_date',
      'valid_start_date',
      'remind_date',
      'reminder'
    ]
    const fields = licenseFields.getFields()
    showFields.forEach(showField => {
      for (let key in fields) {
        if (key == showField) {
          _fields = {
            ..._fields,
            [key]: fields[key]
          }
        }
      }
    })
    return _fields
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

  // get route params to reload data
  if (reloadScreen) {
    $_fetchLicense()
    setReloadScreen(false)
  }

  React.useEffect(() => {
    $_fetchLicense()
  }, [route])

  React.useEffect(() => {
    if (license) {
      $_setNavigationOption()
      $_fetchArticle()
      $_setBottomSheet()
    }
  }, [license])

  React.useEffect(() => {
    if (license && refreshKey) {
      $_setNavigationOption()
    }
  }, [refreshKey])

  return (
    <>
      {loading ? (
        <WsSkeleton></WsSkeleton>
      ) : (
        <>
          <ScrollView
            style={{
            }}
            scrollIndicatorInsets={{ right: 0.1 }}
          >
            {license && (
              <>
                <LlLicenseHeaderCard001
                  title={license.name}
                  license={license}
                  update={license.updated_at}
                  img={
                    license.last_version?.image ||
                    license.last_version?.file_image?.[0]?.file?.source_url ||
                    license.last_version?.file_image?.[0]?.file_version?.source_url ||
                    null
                  }
                  systemSubclasses={license.system_subclasses}
                  showFields={
                    license.license_type ? license.license_type.show_fields : null
                  }
                  lastEditUserImg={
                    license.last_version.updated_user.avatar
                      ? license.last_version.updated_user.avatar
                      : null
                  }
                  lastEditUserName={
                    license.last_version.updated_user.name
                      ? license.last_version.updated_user.name
                      : null
                  }
                />

                {license.last_version &&
                  license.last_version.setup_license && (
                    <WsPaddingContainer
                      style={{
                        backgroundColor: $color.primary13l,
                        paddingTop: 8
                      }}>
                      <WsText size={18} fontWeight={600} style={{ width: 128 }}>{t('報准資訊')}</WsText>

                      {license.last_version && license.last_version.using_status != undefined && (
                        <WsFlex
                          style={{
                            marginTop: 8
                          }}
                        >
                          <WsText size={14} fontWeight={600} style={{ width: 128 }}>{t('使用狀態')}</WsText>
                          <WsTag
                            textColor={license.last_version.using_status == 1 ? $color.primary : $color.gray}
                            backgroundColor={license.last_version.using_status == 1 ? $color.primary11l : $color.white2d}
                            style={{
                              width: 'auto',
                            }}>
                            {license.last_version.using_status == 1 ? t('使用中') : t('已停用')}
                          </WsTag>
                        </WsFlex>
                      )}
                      {license.last_version && license.last_version.license_status_number != undefined && (
                        <WsFlex
                          style={{
                            marginTop: 8
                          }}
                        >
                          <WsText size={14} fontWeight={600} style={{ width: 128 }}>{t('辦理狀態')}</WsText>
                          <WsTag
                            textColor={license.last_version.license_status_number == 1 ? $color.primary : $color.gray3d}
                            backgroundColor={license.last_version.license_status_number == 1 ? $color.primary11l : $color.yellow11l}
                            style={{
                              width: 'auto',
                            }}>
                            {license.last_version.license_status_number == 1 ? t('已核准') : t('辦理中')}
                          </WsTag>
                        </WsFlex>
                      )}

                      {license.last_version &&
                        license.last_version.setup_license && (
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              size={14}
                              iconVisible={false}
                              labelWidth={120}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              value={
                                license.last_version.approval_letter
                                  ? license.last_version.approval_letter
                                  : t('無')
                              }
                              label={t('核准函號')}
                            />
                          </View>
                        )}

                      <WsFlex
                        style={{
                        }}
                      >
                        <>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={120}
                              label={t('有效起迄')}
                              value={
                                license.last_version?.valid_start_date && license.last_version?.valid_end_date ?
                                  `${moment(license.last_version.valid_start_date).format('YYYY-MM-DD')} ~ ${moment(license.last_version.valid_end_date).format('YYYY-MM-DD')}` :
                                  license.last_version?.valid_start_date ?
                                    `${moment(license.last_version.valid_start_date).format('YYYY-MM-DD')} ~ ${t('無')}` :
                                    `${t('無')}`
                              }
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            />
                          </View>
                        </>
                      </WsFlex>

                      <WsFlex
                        style={{
                          marginTop: 8
                        }}
                      >
                        <WsInfo
                          labelWidth={120}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                          }}
                          label={t('續辦提醒')}
                          icon="ws-outline-reminder"
                          color={$color.primary3l}
                          textColor={$color.primary}
                          value={
                            license.last_version.remind_date
                              ? moment(license.last_version.remind_date).format('YYYY-MM-DD')
                              : t('未設定')
                          }
                        />
                      </WsFlex>

                      {license.last_version.reminder &&
                        $_isShowFields('reminder') && (
                          <>
                            <View
                              style={{
                                marginTop: 8
                              }}
                            >
                              <WsInfo
                                labelWidth={120}
                                type="user"
                                label={t('管理者')}
                                value={
                                  license.last_version.reminder
                                    ? license.last_version.reminder
                                    : t('無')
                                }
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}
                              />
                            </View>
                          </>
                        )}

                      {license.last_version.agents && (
                        <>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={120}
                              type="users"
                              label={t('代理人')}
                              value={
                                license.last_version.agents
                                  ? license.last_version.agents
                                  : t('無')
                              }
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            />
                          </View>
                        </>
                      )}
                    </WsPaddingContainer>
                  )}

                {/* 非報准人員證照之證照資訊 */}
                {license.last_version &&
                  !license.last_version.setup_license && (
                    <WsPaddingContainer
                      style={{
                        backgroundColor: $color.white,
                        paddingTop: 8
                      }}>
                      <WsText size={18} fontWeight={600} style={{ width: 128 }}>{t('證照資訊')}</WsText>
                      {license.system_subclasses && (
                        <WsFlex
                          style={{
                            alignItems: 'center',
                          }}
                        >
                          <WsText size={14} fontWeight={600} style={{ width: 128 }}>{t('領域')}</WsText>
                          <WsFlex
                            flexWrap={'wrap'}
                            style={{
                              maxWidth: width * 0.5
                            }}
                          >
                            {license.system_subclasses.map((systemSubclass, systemSubclassIndex) => {
                              return (
                                <WsTag
                                  key={systemSubclassIndex}
                                  style={{
                                    marginRight: 4,
                                  }}
                                  img={systemSubclass.icon}
                                  key={systemSubclassIndex}>
                                  {t(systemSubclass.name)}
                                </WsTag>
                              )
                            })}
                          </WsFlex>
                        </WsFlex>
                      )}
                      {license.last_version &&
                        license.last_version.using_status != undefined &&
                        (license.license_type &&
                          license.license_type.show_fields &&
                          license.license_type.show_fields.includes('using_status')) && (
                          <WsFlex
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsText size={14} fontWeight={600} style={{ width: 128 }}>{t('使用狀態')}</WsText>
                            <WsTag
                              textColor={license.last_version.using_status == 1 ? $color.primary : $color.gray}
                              backgroundColor={license.last_version.using_status == 1 ? $color.primary11l : $color.white2d}
                              style={{
                                width: 'auto',
                              }}>
                              {license.last_version.using_status == 1 ? t('使用中') : t('已停用')}
                            </WsTag>
                          </WsFlex>
                        )}

                      {license.last_version &&
                        license.last_version.license_status_number != undefined &&
                        (license.license_type &&
                          license.license_type.show_fields &&
                          license.license_type.show_fields.includes('license_status_number')) &&
                        (
                          <WsFlex
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsText size={14} fontWeight={600} style={{ width: 128 }}>{t('辦理狀態')}</WsText>
                            <WsTag
                              textColor={license.last_version.license_status_number == 1 ? $color.primary : $color.gray3d}
                              backgroundColor={license.last_version.license_status_number == 1 ? $color.primary11l : $color.yellow11l}
                              style={{
                                width: 'auto',
                              }}>
                              {license.last_version.license_status_number == 1 ? t('已核准') : t('辦理中')}
                            </WsTag>
                          </WsFlex>
                        )}

                      {license &&
                        license.last_version &&
                        $_validEndDate(license.last_version.valid_end_date) && (
                          <WsFlex
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsText size={14} fontWeight={600} style={{ width: 128 }}>{t('證照狀態')}</WsText>
                            <WsTag
                              textColor={$_validEndDate(license.last_version.valid_end_date) ? $color.danger : $color.primary}
                              backgroundColor={$_validEndDate(license.last_version.valid_end_date) ? $color.danger11l : $color.primary11l}
                              style={{
                                width: 'auto',
                              }}
                            >
                              {$_validEndDate(license.last_version.valid_end_date)}
                            </WsTag>
                          </WsFlex>
                        )}

                      {license.last_version &&
                        license.last_version.setup_license && (
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              type='link'
                              size={14}
                              iconVisible={false}
                              labelWidth={120}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              value={
                                license.last_version.setup_license.name
                                  ? license.last_version.setup_license.name
                                  : t('無')
                              }
                              label={t('證照名稱')}
                              onPress={() => {
                                navigation.push('RoutesLicense', {
                                  screen: 'LicenseShow',
                                  params: {
                                    id: license.last_version.setup_license.id
                                  }
                                })
                              }}
                            />
                          </View>
                        )}

                      {/* 報准人員的證照持有人 */}
                      {license.last_version &&
                        license.last_version.setup_license &&
                        license.last_version.setup_license.last_version &&
                        license.last_version.setup_license.last_version.taker && (
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={120}
                              type={'user'}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              value={
                                license.last_version.setup_license.last_version.taker
                                  ? license.last_version.setup_license.last_version.taker
                                  : t('無')
                              }
                              label={t('持有人')}
                            />
                          </View>
                        )}

                      {/* 報准人員的證照證號 */}
                      {license.last_version &&
                        license.last_version.setup_license &&
                        license.last_version.setup_license.last_version &&
                        license.last_version.setup_license.last_version.license_number && (
                          <View
                            style={{
                              marginTop: 4
                            }}
                          >
                            <WsInfo
                              labelWidth={120}
                              value={
                                license.last_version.setup_license.last_version.license_number
                                  ? license.last_version.setup_license.last_version.license_number
                                  : t('無')
                              }
                              label={t('證號')}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            />
                          </View>
                        )}

                      {license.last_version &&
                        license.last_version.taker && (
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={120}
                              type={'user'}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              value={
                                license.last_version.taker
                                  ? license.last_version.taker
                                  : t('無')
                              }
                              label={t('持有人')}
                            />
                          </View>
                        )}

                      {license.license_type &&
                        currentFactory &&
                        ((license.license_type.show_fields &&
                          license.license_type.show_fields.includes('license_owned_factory')) ||
                          (license.license_type.name === t('其他') && license.taker == null)) && (
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={120}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              value={
                                currentFactory.name
                                  ? currentFactory.name
                                  : t('無')
                              }
                              label={t('證照持有單位')}
                            />
                          </View>
                        )}


                      {license.last_version.license_number &&
                        (license.license_type &&
                          license.license_type.show_fields &&
                          license.license_type.show_fields.includes('license_number')) && (
                          <View
                            style={{
                              marginTop: 4
                            }}
                          >
                            <WsInfo
                              labelWidth={120}
                              value={
                                license.last_version.license_number
                                  ? license.last_version.license_number
                                  : t('無')
                              }
                              label={t('證號')}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            />
                          </View>
                        )}

                      {(license.license_type &&
                        license.license_type.show_fields &&
                        license.license_type.show_fields.includes('approval_letter')) && (
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={120}
                              value={license.last_version.approval_letter ? license.last_version.approval_letter : t('無')}
                              label={t('核准函號')}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            />
                          </View>
                        )}

                      {(license.license_type &&
                        license.license_type.show_fields &&
                        license.license_type.show_fields.includes('valid_start_date')) && (
                          <WsFlex
                            style={{
                            }}
                          >
                            <>
                              <View
                                style={{
                                  marginTop: 8
                                }}
                              >
                                <WsInfo
                                  labelWidth={120}
                                  label={t('有效起迄')}
                                  value={
                                    license.last_version.valid_start_date && license.last_version.valid_end_date ?
                                      `${moment(license.last_version.valid_start_date).format('YYYY-MM-DD')} ~ ${moment(license.last_version.valid_end_date).format('YYYY-MM-DD')}` :
                                      license.last_version.valid_start_date ?
                                        `${moment(license.last_version.valid_start_date).format('YYYY-MM-DD')} ~ ${t('無')}` :
                                        `${t('無')}`
                                  }
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}
                                />
                              </View>
                            </>
                          </WsFlex>
                        )}


                      {(license.license_type &&
                        license.license_type.show_fields &&
                        license.license_type.show_fields.includes('remind_date')) && (
                          <WsFlex
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={120}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center'
                              }}
                              label={t('續辦提醒')}
                              icon="ws-outline-reminder"
                              color={$color.primary3l}
                              textColor={$color.primary}
                              value={
                                license.last_version.remind_date
                                  ? moment(license.last_version.remind_date).format("YYYY-MM-DD")
                                  : t('未設定')
                              }
                            />
                          </WsFlex>
                        )}

                      {license.last_version.reminder &&
                        $_isShowFields('reminder') && (
                          <>
                            <View
                              style={{
                                marginTop: 8
                              }}
                            >
                              <WsInfo
                                labelWidth={120}
                                type="user"
                                label={t('管理者')}
                                value={
                                  license.last_version.reminder
                                    ? license.last_version.reminder
                                    : t('無')
                                }
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}
                              />
                            </View>
                          </>
                        )}

                      {license.last_version.agents &&
                        license.last_version.agents.length > 0 &&
                        $_isShowFields('agent') && (
                          <View
                            style={{
                            }}
                          >
                            <WsInfo
                              type={'users'}
                              labelWidth={120}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              value={
                                license.last_version.agents ? license.last_version.agents : t('無')
                              }
                              label={t('代理人')}
                            />
                          </View>
                        )}

                      {license.last_version &&
                        license.last_version.processing_at &&
                        $_isShowFields('processing_at') && (
                          <>
                            <View
                              style={{
                                marginTop: 4
                              }}
                            >
                              <WsInfo
                                labelWidth={120}
                                label={t('辦理日期')}
                                value={
                                  license.last_version.processing_at
                                    ? moment(license.last_version.processing_at).format('YYYY-MM-DD')
                                    : t('無')
                                }
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}
                              />
                            </View>
                          </>
                        )}

                      {license.last_version &&
                        license.last_version.retraining_at &&
                        $_isShowFields('retraining_at') && (
                          <>
                            <View
                              style={{
                                marginTop: 8
                              }}
                            >
                              <WsInfo
                                labelWidth={120}
                                label={t('回訓起算日')}
                                value={
                                  license.last_version.retraining_at
                                    ? moment(license.last_version.retraining_at).format('YYYY-MM-DD')
                                    : t('無')
                                }
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}
                              />
                            </View>
                          </>
                        )}

                      {license.last_version &&
                        (license.last_version.retraining_year || license.last_version.retraining_hour) &&
                        $_isShowFields('retraining_rule') && (
                          <>
                            <View
                              style={{
                                marginTop: 8
                              }}
                            >
                              <WsInfo
                                labelWidth={120}
                                label={t('回訓規則')}
                                value={
                                  `每${license.last_version.retraining_year ? license.last_version.retraining_year : '0'}年${license.last_version.retraining_hour ? license.last_version.retraining_hour : '0'}小時`
                                }
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}
                              />
                            </View>
                          </>
                        )}

                      {license.last_version &&
                        license.last_version.retraining_remind_date &&
                        $_isShowFields('retraining_remind_date') && (
                          <>
                            <View
                              style={{
                                marginTop: 8
                              }}
                            >
                              <WsInfo
                                labelWidth={120}
                                label={t('回訓提醒日')}
                                icon={'ws-outline-reminder'}
                                color={$color.primary3l}
                                textColor={$color.primary}
                                value={
                                  license.last_version.retraining_remind_date
                                    ? moment(license.last_version.retraining_remind_date).format('YYYY-MM-DD')
                                    : t('無')
                                }
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}
                              />
                            </View>
                          </>
                        )}

                      {/* 0 will get error */}
                      {license.last_version &&
                        license.license_type &&
                        license.license_type.name.includes(t('回訓')) && (
                          <>
                            <View
                              style={{
                                marginTop: 8
                              }}
                            >
                              <WsInfo
                                labelWidth={120}
                                label={t('總回訓時數')}
                                value={
                                  license.last_version?.trained_hours
                                    ? `${license.last_version.trained_hours}`
                                    : t('無')
                                }
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}
                              />
                            </View>
                          </>
                        )}
                    </WsPaddingContainer>
                  )}

                {/*  報准人員證照之證照資訊*/}
                {license.last_version &&
                  license.last_version.setup_license && (
                    <WsPaddingContainer
                      style={{
                        backgroundColor: $color.white,
                        paddingTop: 8
                      }}>
                      <WsText size={18} fontWeight={600} style={{ width: 128 }}>{t('證照資訊')}</WsText>
                      {license.system_subclasses && (
                        <WsFlex
                          style={{
                            alignItems: 'center',
                          }}
                        >
                          <WsText size={14} fontWeight={600} style={{ width: 128 }}>{t('領域')}</WsText>
                          <WsFlex
                            flexWrap={'wrap'}
                            style={{
                              maxWidth: width * 0.5
                            }}
                          >
                            {license.system_subclasses.map((systemSubclass, systemSubclassIndex) => {
                              return (
                                <WsTag
                                  key={systemSubclassIndex}
                                  style={{
                                    marginRight: 4,
                                  }}
                                  img={systemSubclass.icon}
                                  key={systemSubclassIndex}>
                                  {t(systemSubclass.name)}
                                </WsTag>
                              )
                            })}
                          </WsFlex>
                        </WsFlex>
                      )}
                      {license.last_version &&
                        license.last_version.setup_license &&
                        license.last_version.setup_license.last_version &&
                        license.last_version.setup_license.last_version.using_status != undefined && (
                          <WsFlex
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsText size={14} fontWeight={600} style={{ width: 128 }}>{t('使用狀態')}</WsText>
                            <WsTag
                              textColor={license.last_version.setup_license.last_version.using_status == 1 ? $color.primary : $color.gray}
                              backgroundColor={license.last_version.setup_license.last_version.using_status == 1 ? $color.primary11l : $color.white2d}
                              style={{
                                width: 'auto',
                              }}>
                              {license.last_version.setup_license.last_version.using_status == 1 ? t('使用中') : t('已停用')}
                            </WsTag>
                          </WsFlex>
                        )}
                      {license.last_version &&
                        license.last_version.setup_license &&
                        license.last_version.setup_license.last_version &&
                        license.last_version.setup_license.last_version.license_status_number != undefined && (
                          <WsFlex
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsText size={14} fontWeight={600} style={{ width: 128 }}>{t('辦理狀態')}</WsText>
                            <WsTag
                              textColor={license.last_version.setup_license.last_version.license_status_number == 1 ? $color.primary : $color.gray3d}
                              backgroundColor={license.last_version.setup_license.last_version.license_status_number == 1 ? $color.primary11l : $color.yellow11l}
                              style={{
                                width: 'auto',
                              }}>
                              {license.last_version.setup_license.last_version.license_status_number == 1 ? t('已核准') : t('辦理中')}
                            </WsTag>
                          </WsFlex>
                        )}

                      {license.last_version &&
                        license.last_version.setup_license && (
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              type='link'
                              size={14}
                              iconVisible={false}
                              labelWidth={120}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              value={
                                license.last_version.setup_license.name
                                  ? license.last_version.setup_license.name
                                  : t('無')
                              }
                              label={t('證照名稱')}
                              onPress={() => {
                                navigation.push('RoutesLicense', {
                                  screen: 'LicenseShow',
                                  params: {
                                    id: license.last_version.setup_license.id
                                  }
                                })
                              }}
                            />
                          </View>
                        )}

                      {/* 報准人員的證照持有人 */}
                      {license.last_version &&
                        license.last_version.setup_license &&
                        license.last_version.setup_license.last_version &&
                        license.last_version.setup_license.last_version.taker && (
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={120}
                              type={'user'}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              value={
                                license.last_version.setup_license.last_version.taker
                                  ? license.last_version.setup_license.last_version.taker
                                  : t('無')
                              }
                              label={t('持有人')}
                            />
                          </View>
                        )}

                      {/* 報准人員的證照證號 */}
                      {license.last_version &&
                        license.last_version.setup_license &&
                        license.last_version.setup_license.last_version &&
                        license.last_version.setup_license.last_version.license_number && (
                          <View
                            style={{
                              marginTop: 4
                            }}
                          >
                            <WsInfo
                              labelWidth={120}
                              value={
                                license.last_version.setup_license.last_version.license_number
                                  ? license.last_version.setup_license.last_version.license_number
                                  : t('無')
                              }
                              label={t('證號')}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            />
                          </View>
                        )}

                      {license.last_version &&
                        license.last_version.setup_license &&
                        license.last_version.setup_license.last_version && (
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={120}
                              value={license.last_version.setup_license.last_version.approval_letter ? license.last_version.setup_license.last_version.approval_letter : t('無')}
                              label={t('核准函號')}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            />
                          </View>
                        )}


                      <WsFlex
                        style={{
                        }}
                      >
                        <>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={120}
                              label={t('有效起迄')}
                              value={
                                license.last_version.setup_license.last_version.valid_start_date && license.last_version.setup_license.last_version.valid_end_date ?
                                  `${moment(license.last_version.setup_license.last_version.valid_start_date).format('YYYY-MM-DD')} ~ ${moment(license.last_version.setup_license.last_version.valid_end_date).format('YYYY-MM-DD')}` :
                                  license.last_version.setup_license.last_version.valid_start_date ?
                                    `${moment(license.last_version.setup_license.last_version.valid_start_date).format('YYYY-MM-DD')} ~ ${t('無')}` :
                                    `${t('無')}`
                              }
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                            />
                          </View>
                        </>
                      </WsFlex>

                      <WsFlex
                        style={{
                          marginTop: 8
                        }}
                      >
                        <WsInfo
                          labelWidth={120}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                          }}
                          label={t('續辦提醒')}
                          icon="ws-outline-reminder"
                          color={$color.primary3l}
                          textColor={$color.primary}
                          value={
                            license.last_version?.setup_license?.last_version?.remind_date
                              ? moment(license.last_version?.setup_license?.last_version?.remind_date).format('YYYY-MM-DD')
                              : t('未設定')
                          }
                        />
                      </WsFlex>

                      {license.last_version &&
                        license.last_version?.setup_license &&
                        license.last_version?.setup_license?.last_version && (
                          <>
                            <View
                              style={{
                                marginTop: 8
                              }}
                            >
                              <WsInfo
                                labelWidth={120}
                                type="user"
                                label={t('管理者')}
                                value={
                                  license.last_version?.setup_license?.last_version?.reminder
                                    ? license.last_version?.setup_license?.last_version.reminder
                                    : t('無')
                                }
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}
                              />
                            </View>
                          </>
                        )}
                    </WsPaddingContainer>
                  )}

                {license.last_version &&
                  !remarkInput &&
                  (license.license_type &&
                    license.license_type.show_fields &&
                    license.license_type.show_fields.includes('remark')) &&
                  (
                    <WsPaddingContainer
                      style={{
                        backgroundColor: $color.white,
                        marginTop: 8
                      }}>

                      <WsFlex
                        style={{
                        }}
                        justifyContent={'space-between'}
                      >
                        <WsInfo
                          infoMarginTop={16}
                          textSize={14}
                          label={i18next.t('備註')}
                          style={{
                          }}
                          value={
                            remark
                              ? remark
                              : i18next.t('無')
                          }
                        />
                      </WsFlex>
                      <LlBtn002
                        minHeight={0}
                        style={{
                          position: 'absolute',
                          right: 16,
                          top: 16,
                        }}
                        onPress={() => setRemarkInput(true)}
                      >
                        {t('編輯')}
                      </LlBtn002>

                      {license.last_version &&
                        license.last_version.remark_updated_at && (
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
                              <WsText color={$color.gray} size={12}>
                                {
                                  license.last_version.remark_updated_at && (
                                    <>
                                      {i18next.t('編輯時間')}
                                      {moment(license.last_version.remark_updated_at).format(
                                        'YYYY-MM-DD HH:mm:ss'
                                      )}
                                    </>
                                  )}
                              </WsText>
                            </View>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              {license.last_version &&
                                license.last_version.remark_updated_user &&
                                license.last_version.remark_updated_user.avatar && (
                                  <WsAvatar
                                    style={{
                                      marginRight: 4
                                    }}
                                    size={20}
                                    source={
                                      license.last_version.remark_updated_user.avatar
                                    }
                                  />
                                )
                              }

                              <WsText color={$color.gray} size={12}>
                                {
                                  license.last_version.remark_updated_user
                                    ? license.last_version.remark_updated_user.name
                                    : i18next.t('無')}
                              </WsText>
                            </View>
                          </WsFlex>
                        )}
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
                          setRemarkInput(false)
                        }}
                      >
                        {t('取消')}
                      </LlBtn002>
                      <LlBtn002
                        minHeight={0}
                        bgColor={$color.primary}
                        textColor={$color.white}
                        borderColor={$color.primary}
                        borderWidth={1}
                        style={{
                          width: 62,
                          // borderWidth:2,
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

                {license.last_version &&
                  license.last_version.file_attaches.length > 0 &&
                  $_isShowFields('attaches') && (
                    <WsPaddingContainer
                      style={{
                        marginTop: 8
                      }}>
                      <WsInfo
                        type="filesAndImages"
                        label={t('附件')}
                        value={license.last_version.file_attaches}
                      />
                    </WsPaddingContainer>
                  )}

                {((license.license_template &&
                  license.license_template.last_version &&
                  license.license_template.last_version.article_versions.length >
                  0) ||
                  (license.license_template &&
                    license.license_template.last_version.act_version_alls.length >
                    0)) && (
                    <>
                      <WsPaddingContainer
                        style={{
                          marginTop: 8,
                          backgroundColor: $color.white,
                          justifyContent: 'center',
                          alignItems: 'flex-start',
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                          }}>
                          <WsIcon name={'ll-nav-law-outline'} size={18} style={{ marginRight: 4 }} />
                          <WsText size={14} fontWeight={500}>{t('法規依據')}</WsText>
                        </View>
                        {license.license_template.last_version.article_versions.length != 0 && (
                          <>
                            {license.license_template.last_version.article_versions.map(
                              (article, articleIndex) => {
                                return (
                                  <View
                                    key={articleIndex}
                                    style={{
                                      marginTop: 8,
                                      flexDirection: 'row',
                                      justifyContent: 'flex-start',
                                      alignItems: 'center'
                                    }}>
                                    <WsInfo
                                      style={{
                                        flexWrap: 'wrap', // 250526
                                        // borderWidth:1,
                                        marginTop: articleIndex == 0 ? 0 : 8
                                      }}
                                      type="link"
                                      value={$_setArticleText(article)}
                                      onPress={() => {
                                        setSelectVersionId(article.id)
                                        setActModal(true)
                                      }}
                                    />
                                  </View>
                                )
                              }
                            )}
                          </>
                        )}
                        {license.license_template.last_version &&
                          license.license_template.last_version.act_version_alls &&
                          license.license_template.last_version.act_version_alls.length != 0 && (
                            <>
                              {license.license_template.last_version.act_version_alls.map(
                                (article, articleIndex) => {
                                  return (
                                    <WsInfo
                                      key={articleIndex}
                                      style={{
                                        marginTop: 8
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
                      </WsPaddingContainer>
                    </>
                  )}

                {(license.last_version &&
                  license.last_version.related_guidelines &&
                  license.last_version.related_guidelines.length > 0) && (
                    <WsPaddingContainer
                      padding={0}
                      style={{
                        marginTop: 8,
                        paddingTop: 16,
                        paddingHorizontal: 16,
                        paddingBottom: 16,
                        backgroundColor: $color.white,
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginBottom: 8
                        }}
                      >
                        {/* <WsIcon
                          size={20}
                          color={$color.black}
                          name={"ll-nav-internalegulations-outline"}
                          style={{
                            marginRight: 4
                          }}
                        ></WsIcon> */}
                        <WsText size={14} fontWeight={'600'} style={{}}>
                          {t('相關內規')}
                        </WsText>
                      </View>
                      {license.last_version &&
                        license.last_version.related_guidelines &&
                        license.last_version.related_guidelines.length > 0 && (
                          <>
                            <WsPassageCollapse
                              type={'array'}
                            >
                              {license.last_version.related_guidelines.map(
                                (item, index) => {
                                  return (
                                    <>
                                      <LlRelatedGuidelineItem001
                                        key={index}
                                        item={item}
                                      />
                                    </>
                                  )
                                }
                              )}
                            </WsPassageCollapse>
                          </>
                        )}
                    </WsPaddingContainer>
                  )}

                {license.license_template &&
                  license.license_template.last_version &&
                  license.license_template.last_version.precautions.length > 0 && (
                    <WsCardPassage
                      title={t('注意事項')}
                      passage={license.license_template.last_version.precautions}
                      style={{
                        marginTop: 8
                      }}
                    />
                  )}
                {license.license_template &&
                  license.license_template.last_version &&
                  license.license_template.last_version.expired_comment.length > 0 && (
                    <WsCardPassage
                      title={t('效期說明')}
                      passage={
                        license.license_template.last_version.expired_comment
                      }
                      style={{
                        marginTop: 8
                      }}
                    />
                  )}

                {license.versions.length > 1 && (
                  <WsPaddingContainer
                    style={{
                      marginTop: 8,
                      backgroundColor: $color.primary11l
                    }}>
                    <LlBtn002
                      onPress={() => {
                        setStateModal(true)
                      }}>
                      {t('查看歷史版本')}
                    </LlBtn002>
                  </WsPaddingContainer>
                )}

                <View
                  style={{
                    height: 50
                  }}
                >
                </View>

                <WsModal
                  title={license.name ? `${t('證照歷史版本')}-\n${license.name}` : t('證照歷史版本')}
                  visible={stateModal}
                  headerLeftOnPress={() => {
                    setStateModal(false)
                  }}
                  onBackButtonPress={() => {
                    setStateModal(false)
                  }}>
                  <WsVersionHistory
                    licenseName={license.name}
                    modelName="license_version"
                    versionId={license.last_version.id}
                    fields={license.license_type ? $_setFields() : {}}
                    nameKey={license.last_version?.valid_start_date ? "valid_start_date" : 'updated_at'}
                    formatNameKey={'YYYY-MM-DD'}
                    params={{
                      licenseId: license && license.id,
                    }}
                  />
                </WsModal>
                
                <WsModal
                  title={t('法規依據')}
                  visible={actModal}
                  headerLeftOnPress={() => {
                    setActModal(false)
                  }}
                  onBackButtonPress={() => {
                    setActModal(false)
                  }}>
                  <ViewArticleShowForModal versionId={selectVersionId} />
                </WsModal>
              </>
            )}
          </ScrollView>
          <WsBottomSheet
            snapPoints={[148, 208]}
            isActive={isBottomSheetActive}
            onDismiss={() => {
              setIsBottomSheetActive(false)
            }}
            items={bottomSheetItems}
            onItemPress={$_onBottomSheetItemPress}
          />
          <WsDialogDelete
            id={id}
            to="LicenseIndex"
            modelName="license"
            visible={dialogVisible}
            text={t('確定刪除嗎？')}
            setVisible={setDialogVisible}
          />
        </>
      )}
    </>
  )
}

export default LicenseOverview
