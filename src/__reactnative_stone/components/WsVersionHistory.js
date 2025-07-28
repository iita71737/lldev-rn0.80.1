import React from 'react'
import {
  ScrollView,
  Text,
  View,
  Dimensions,
  FlatList
} from 'react-native'
import {
  WsPaddingContainer,
  WsState,
  WsInfoForm,
  WsInfoImage,
  WsInfo,
  WsFlex,
  WsSkeleton,
  WsLoading,
  WsText,
  WsTag,
  LlLicenseHeaderCard001,
  LlInfoContainer001,
  LlRelatedGuidelineItem001
} from '@/components'
import Services from '@/services/api/v1/index'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import PlanVersionData from '@/sections/Change/PlanVersionData'
import i18next from 'i18next'
import RetrainingTimeRecordList from '@/sections/License/RetrainingTimeRecordList'
import RetrainingTimeRecordList002 from '@/sections/License/RetrainingTimeRecordList002'
import { useSelector } from 'react-redux'

const WsVersionHistory = props => {
  // i18n
  const { t, i18n } = useTranslation()
  const windowWidth = Dimensions.get('window').width
  const windowHeight = Dimensions.get('window').height

  // Props
  const {
    modelName,
    versionId,
    nameKey,
    formatNameKey,
    params
  } = props

  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)

  // State
  const [version, setVersion] = React.useState(versionId)
  const [value, setValue] = React.useState()

  // MEMO
  const _params = React.useMemo(() => {
    if (modelName === 'license_version') {
      const params = {
        license_version: version,
        lang: 'tw',
        order_by: 'train_at',
        order_way: 'desc',
        page: 1
      }
      return params
    }
  }, [version, versionId]);

  // Services
  const $_fetchShow = async () => {
    try {
      const res = await Services[modelName].show({
        modelId: version
      });
      if (res) {
        setValue(res);
      } else {
        console.warn(`無回傳資料，modelName: ${modelName}, version: ${version}`);
      }
    } catch (error) {
      console.error(`取得 ${modelName}(${version}) 詳細資料時發生錯誤:`, error);
      // 若需要顯示錯誤訊息給使用者，也可加入：
      // Toast.show('取得資料失敗，請稍後再試');
    }
  };


  // helper
  const $_getAgents = () => {
    let agents = ''
    if (value.agents) {
      value.agents.map(agent => {
        agents += agent.name
      })
    }
    return agents
  }
  // helper
  const $_validEndDate = (validEndDate) => {
    if (!validEndDate) return '';
    let today = new Date();
    const newDate = moment(today);
    const secondDate = moment(validEndDate);
    return newDate.diff(secondDate, 'days') > 0 ? t('逾期') : '';
  }

  React.useEffect(() => {
    $_fetchShow()
  }, [version])

  // Render
  return (
    <>
      {value && (
        <>
          <ScrollView
            style={{
              // 20250203-retraining-index-issue
              flexGrow: 1
            }}
          >
            <WsPaddingContainer
              style={{
                borderBottomWidth: 0.3
              }}>
              <WsText>{value.label}</WsText>
              <WsState
                preText={'Ver. '}
                label={t('選擇版本')}
                type="belongsto"
                serviceIndexKey={'index'}
                modelName={modelName}
                nameKey={nameKey}
                value={value}
                formatNameKey={formatNameKey}
                params={params}
                onChange={$event => {
                  setVersion($event.id)
                }}
              />
            </WsPaddingContainer>
            <WsPaddingContainer
              padding={0}
              style={{
              }}
            >
              {/* 證照版本 */}
              {modelName === 'license_version' &&
                value && (
                  <>
                    {value.file_image &&
                      value.file_image.length > 0 && (
                        <>
                          <WsPaddingContainer
                            style={{
                              marginTop: 8
                            }}>
                            {value.file_image.map(_value => {
                              return (
                                <WsInfoImage height={200} width={windowWidth - 16} value={_value} />
                              )
                            })}
                          </WsPaddingContainer>
                        </>
                      )}
                    <WsPaddingContainer
                      style={{
                        backgroundColor: $color.white,
                        paddingTop: 0
                      }}>
                      {value && value.using_status != undefined && (
                        <WsFlex
                          style={{
                            marginTop: 8
                          }}
                        >
                          <WsText size={14} fontWeight={600} style={{ width: 108 }}>{t('使用狀態')}</WsText>
                          <WsTag
                            textColor={$color.primary}
                            backgroundColor={$color.primary11l}
                            style={{
                              width: 'auto',
                            }}>
                            {value.using_status == 1 ? t('使用中') : t('已停用')}
                          </WsTag>
                        </WsFlex>
                      )}
                      {value && value.license_status_number != undefined && (
                        <WsFlex
                          style={{
                            marginTop: 8
                          }}
                        >
                          <WsText size={14} fontWeight={600} style={{ width: 108 }}>{t('辦理狀態')}</WsText>
                          <WsTag
                            textColor={value.license_status_number == 1 ? $color.primary : $color.gray3d}
                            backgroundColor={value.license_status_number == 1 ? $color.primary11l : $color.yellow11l}
                            style={{
                              width: 'auto',
                            }}>
                            {value.license_status_number == 1 ? t('已核准') : t('辦理中')}
                          </WsTag>
                        </WsFlex>
                      )}

                      {value &&
                        value.setup_license && (
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              type='link'
                              size={14}
                              iconVisible={false}
                              labelWidth={100}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              value={
                                value.setup_license.name
                                  ? value.setup_license.name
                                  : t('無')
                              }
                              label={t('證照名稱')}
                              onPress={() => {
                                navigation.push('RoutesLicense', {
                                  screen: 'LicenseShow',
                                  params: {
                                    id: value.setup_license.id
                                  }
                                })
                              }}
                            />
                          </View>
                        )}

                      {/* 報准人員的證照持有人 */}
                      {value &&
                        value.setup_license &&
                        value.setup_license.last_version &&
                        value.setup_license.last_version.taker && (
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
                                value.setup_license.last_version.taker
                                  ? value.setup_license.last_version.taker
                                  : t('無')
                              }
                              label={t('持有人')}
                            />
                          </View>
                        )}

                      {/* 報准人員的證照證號 */}
                      {value &&
                        value.setup_license &&
                        value.setup_license.last_version &&
                        value.setup_license.last_version.license_number && (
                          <View
                            style={{
                              marginTop: 4
                            }}
                          >
                            <WsInfo
                              labelWidth={100}
                              value={
                                value.setup_license.last_version.license_number
                                  ? value.setup_license.last_version.license_number
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

                      {value && value.taker && (
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
                              value.taker
                                ? value.taker
                                : t('無')
                            }
                            label={t('持有人')}
                          />
                        </View>
                      )}

                      {value.license_type &&
                        currentFactory &&
                        value.license_type.show_fields &&
                        value.license_type.show_fields.includes('license_owned_factory') && (
                          <WsInfo
                            labelWidth={100}
                            type={'user'}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                            value={
                              currentFactory
                                ? currentFactory
                                : t('無')
                            }
                            label={t('證照持有單位')}
                          />
                        )}


                      {value.license_number && (
                        <View
                          style={{
                            marginTop: 4
                          }}
                        >
                          <WsInfo
                            labelWidth={100}
                            value={
                              value.license_number
                                ? value.license_number
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

                      <View
                        style={{
                          marginTop: 8
                        }}
                      >
                        <WsInfo
                          labelWidth={100}
                          value={value.approval_letter ? value.approval_letter : t('無')}
                          label={t('核准函號')}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        />
                      </View>

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
                              labelWidth={100}
                              label={t('有效起迄')}
                              value={
                                (value.valid_start_date && value.valid_end_date) ?
                                  `${value.valid_start_date} - ${value.valid_end_date}` :
                                  value.valid_start_date ?
                                    `${value.valid_start_date} - ${t('無')}` :
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
                          labelWidth={100}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center'
                          }}
                          label={t('續辦提醒')}
                          icon="ws-outline-reminder"
                          color={$color.primary3l}
                          textColor={$color.primary}
                          value={
                            value.remind_date
                              ? value.remind_date
                              : t('未設定')
                          }
                        />
                      </WsFlex>

                      {value.reminder && (
                        <>
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={100}
                              type="user"
                              label={t('管理者')}
                              value={
                                value.reminder
                                  ? value.reminder
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

                      {value.agents &&
                        value.agents.length > 0 && (
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              type={'users'}
                              labelWidth={100}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              value={
                                value.agents ? value.agents : t('無')
                              }
                              label={t('代理人')}
                            />
                          </View>
                        )}

                      {value &&
                        value.processing_at && (
                          <>
                            <View
                              style={{
                                marginTop: 4
                              }}
                            >
                              <WsInfo
                                labelWidth={100}
                                label={t('辦理日期')}
                                value={
                                  value.processing_at
                                    ? moment(value.processing_at).format('YYYY-MM-DD')
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

                      {value &&
                        value.retraining_at && (
                          <>
                            <View
                              style={{
                                marginTop: 8
                              }}
                            >
                              <WsInfo
                                labelWidth={100}
                                label={t('回訓起算日')}
                                value={
                                  value.retraining_at
                                    ? moment(value.retraining_at).format('YYYY-MM-DD')
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

                      {value &&
                        (value.retraining_year || value.retraining_hour) && (
                          <>
                            <View
                              style={{
                                marginTop: 8
                              }}
                            >
                              <WsInfo
                                labelWidth={100}
                                label={t('回訓規則')}
                                value={
                                  `每${value.retraining_year ? value.retraining_year : '0'}年${value.retraining_hour ? value.retraining_hour : '0'}小時`
                                }
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}
                              />
                            </View>
                          </>
                        )}

                      {value &&
                        value.retraining_remind_date && (
                          <>
                            <View
                              style={{
                                marginTop: 8
                              }}
                            >
                              <WsInfo
                                labelWidth={100}
                                label={t('回訓提醒日')}
                                icon={'ws-outline-reminder'}
                                color={$color.primary3l}
                                textColor={$color.primary}
                                value={
                                  value.retraining_remind_date
                                    ? moment(value.retraining_remind_date).format('YYYY-MM-DD')
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

                      {value &&
                        value.retraining_at &&
                        value.retraining_year &&
                        value.retraining_hour &&
                        value.retraining_remind_date && (
                          <>
                            <View
                              style={{
                                marginTop: 8
                              }}
                            >
                              <WsInfo
                                labelWidth={100}
                                label={t('總回訓時數')}
                                value={
                                  value.trained_hours
                                    ? `${value.trained_hours}`
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

                    <WsPaddingContainer
                      padding={0}
                      style={{
                        backgroundColor: $color.white,
                        paddingHorizontal: 16,
                      }}>

                      <WsFlex
                        style={{
                        }}
                        justifyContent={'space-between'}
                      >
                        <WsInfo
                          label={i18next.t('備註')}
                          style={{
                          }}
                          value={
                            value.remark
                              ? value.remark
                              : i18next.t('無')
                          }
                        />
                      </WsFlex>
                    </WsPaddingContainer>

                    {(value &&
                      value.related_guidelines &&
                      value.related_guidelines.length > 0) && (
                        <WsPaddingContainer
                          padding={0}
                          style={{
                            marginTop: 16,
                            paddingHorizontal: 16,
                            backgroundColor: $color.white,
                          }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <WsText
                              size={14}
                              fontWeight={'600'}
                              style={{
                                marginBottom: 8
                              }}
                            >
                              {t('相關內規')}
                            </WsText>
                          </View>
                          {value &&
                            value.related_guidelines &&
                            value.related_guidelines.length > 0 && (
                              <>
                                <FlatList
                                  data={value.related_guidelines}
                                  keyExtractor={item => item.id}
                                  renderItem={({ item, index }) => {
                                    return (
                                      <LlRelatedGuidelineItem001
                                        key={index}
                                        item={item}
                                      />
                                    );
                                  }}
                                  ListEmptyComponent={() => {
                                    return (
                                      <WsEmpty />
                                    )
                                  }}
                                />
                              </>
                            )}
                        </WsPaddingContainer>
                      )}

                    {value.file_attaches &&
                      value.file_attaches.length > 0 && (
                        <WsPaddingContainer
                          padding={0}
                          style={{
                            marginTop: 16,
                            paddingHorizontal: 16
                          }}>
                          <WsInfo
                            type="filesAndImages"
                            label={t('附件')}
                            value={value.file_attaches}
                          />
                        </WsPaddingContainer>
                      )}

                    {version &&
                      value &&
                      value.retraining_at &&
                      value.retraining_year &&
                      value.retraining_hour &&
                      value.retraining_remind_date && (
                        <>
                          <WsPaddingContainer
                            padding={0}
                            style={{
                              marginTop: 16,
                              paddingHorizontal: 16
                            }}>
                            <WsText
                              size={14}
                              fontWeight={600}
                              style={{
                              }}>
                              {t('回訓記錄列表')}
                            </WsText>
                            <RetrainingTimeRecordList002
                              editable={false}
                              params={_params}
                            >
                            </RetrainingTimeRecordList002>
                          </WsPaddingContainer>
                        </>
                      )}
                  </>
                )}

              {/* 變動計劃版本 */}
              {modelName === 'change_version' && (
                <>
                  <PlanVersionData versionId={version} />
                </>
              )}

              {/* 承攬商資格證版本 */}
              {modelName === 'contractor_license_version' && (
                <>
                  {value && (
                    <>
                      {value.file_image &&
                        value.file_image.length > 0 && (
                          <>
                            <WsPaddingContainer
                              style={{
                                marginTop: 8
                              }}>
                              {value.file_image.map(_value => {
                                return (
                                  <WsInfoImage height={200} width={windowWidth - 16} value={_value} />
                                )
                              })}
                            </WsPaddingContainer>
                          </>
                        )}
                      <WsPaddingContainer
                        style={{
                          backgroundColor: $color.white,
                          paddingTop: 0
                        }}
                      >

                        {value &&
                          value.taker_text ? (
                          <WsFlex style={{ marginTop: 8 }}>
                            <WsDes style={{ marginRight: 8 }}>
                              {t('持有人')}
                            </WsDes>
                            <WsDes>
                              {value?.taker_text
                                ? value.taker_text
                                : '無'}
                            </WsDes>
                          </WsFlex>
                        ) : (
                          value.contractor &&
                          value.contractor.name) && (
                          <WsFlex style={{ marginTop: 8 }}>
                            <WsDes style={{ marginRight: 8 }}>
                              {t('持有人')}
                            </WsDes>
                            <WsDes>
                              {value.contractor.name
                                ? value.contractor.name
                                : '無'}
                            </WsDes>
                          </WsFlex>
                        )}

                        {value && value.using_status != undefined && (
                          <WsFlex
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsText size={14} fontWeight={600} style={{ width: 108 }}>{t('使用狀態')}</WsText>
                            <WsTag
                              textColor={$color.primary}
                              backgroundColor={$color.primary11l}
                              style={{
                                width: 'auto',
                              }}>
                              {value.using_status == 1 ? t('使用中') : t('已停用')}
                            </WsTag>
                          </WsFlex>
                        )}
                        {value && value.license_status_number != undefined && (
                          <WsFlex
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsText size={14} fontWeight={600} style={{ width: 108 }}>{t('辦理狀態')}</WsText>
                            <WsTag
                              textColor={value.license_status_number == 1 ? $color.primary : $color.gray3d}
                              backgroundColor={value.license_status_number == 1 ? $color.primary11l : $color.yellow11l}
                              style={{
                                width: 'auto',
                              }}>
                              {value.license_status_number == 1 ? t('已核准') : t('辦理中')}
                            </WsTag>
                          </WsFlex>
                        )}

                        {value &&
                          value.setup_license && (
                            <View
                              style={{
                                marginTop: 8
                              }}
                            >
                              <WsInfo
                                type='link'
                                size={14}
                                iconVisible={false}
                                labelWidth={100}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}
                                value={
                                  value.setup_license.name
                                    ? value.setup_license.name
                                    : t('無')
                                }
                                label={t('證照名稱')}
                                onPress={() => {
                                  navigation.push('RoutesLicense', {
                                    screen: 'LicenseShow',
                                    params: {
                                      id: value.setup_license.id
                                    }
                                  })
                                }}
                              />
                            </View>
                          )}

                        {/* 報准人員的證照持有人 */}
                        {value &&
                          value.setup_license &&
                          value.setup_license.last_version &&
                          value.setup_license.last_version.taker && (
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
                                  value.setup_license.last_version.taker
                                    ? value.setup_license.last_version.taker
                                    : t('無')
                                }
                                label={t('持有人')}
                              />
                            </View>
                          )}

                        {/* 報准人員的證照證號 */}
                        {value &&
                          value.setup_license &&
                          value.setup_license.last_version &&
                          value.setup_license.last_version.license_number && (
                            <View
                              style={{
                                marginTop: 4
                              }}
                            >
                              <WsInfo
                                labelWidth={100}
                                value={
                                  value.setup_license.last_version.license_number
                                    ? value.setup_license.last_version.license_number
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

                        {value.license_type &&
                          currentFactory &&
                          value.license_type.show_fields &&
                          value.license_type.show_fields.includes('license_owned_factory') && (
                            <WsInfo
                              labelWidth={100}
                              type={'user'}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              value={
                                currentFactory
                                  ? currentFactory
                                  : t('無')
                              }
                              label={t('證照持有單位')}
                            />
                          )}

                        <View
                          style={{
                            marginTop: 8
                          }}
                        >
                          <WsInfo
                            labelWidth={100}
                            value={value.approval_letter ? value.approval_letter : t('無')}
                            label={t('核准函號')}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                          />
                        </View>

                        {value.license_number && (
                          <View
                            style={{
                              marginTop: 4
                            }}
                          >
                            <WsInfo
                              labelWidth={100}
                              value={
                                value.license_number
                                  ? value.license_number
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
                                labelWidth={100}
                                label={t('有效起迄')}
                                value={
                                  (value.valid_start_date && value.valid_end_date) ?
                                    `${value.valid_start_date} - ${value.valid_end_date}` :
                                    value.valid_start_date ?
                                      `${value.valid_start_date} - ${t('無')}` :
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
                            labelWidth={100}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center'
                            }}
                            label={t('續辦提醒')}
                            icon="ws-outline-reminder"
                            color={$color.primary3l}
                            textColor={$color.primary}
                            value={
                              value.remind_date
                                ? value.remind_date
                                : t('未設定')
                            }
                          />
                        </WsFlex>

                        {value.reminder && (
                          <>
                            <View
                              style={{
                                marginTop: 8
                              }}
                            >
                              <WsInfo
                                labelWidth={100}
                                type="user"
                                label={t('管理者')}
                                value={
                                  value.reminder
                                    ? value.reminder
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

                        {value.agents &&
                          value.agents.length > 0 && (
                            <View
                              style={{
                                marginTop: 8
                              }}
                            >
                              <WsInfo
                                type={'users'}
                                labelWidth={100}
                                style={{
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                }}
                                value={
                                  value.agents ? value.agents : t('無')
                                }
                                label={t('代理人')}
                              />
                            </View>
                          )}

                        {value &&
                          value.processing_at && (
                            <>
                              <View
                                style={{
                                  marginTop: 4
                                }}
                              >
                                <WsInfo
                                  labelWidth={100}
                                  label={t('辦理日期')}
                                  value={
                                    value.processing_at
                                      ? moment(value.processing_at).format('YYYY-MM-DD')
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

                        {value &&
                          value.retraining_at && (
                            <>
                              <View
                                style={{
                                  marginTop: 8
                                }}
                              >
                                <WsInfo
                                  labelWidth={100}
                                  label={t('回訓起算日')}
                                  value={
                                    value.retraining_at
                                      ? moment(value.retraining_at).format('YYYY-MM-DD')
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

                        {value &&
                          (value.retraining_year || value.retraining_hour) && (
                            <>
                              <View
                                style={{
                                  marginTop: 8
                                }}
                              >
                                <WsInfo
                                  labelWidth={100}
                                  label={t('回訓規則')}
                                  value={
                                    `每${value.retraining_year ? value.retraining_year : '0'}年${value.retraining_hour ? value.retraining_hour : '0'}小時`
                                  }
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}
                                />
                              </View>
                            </>
                          )}

                        {value &&
                          value.retraining_remind_date && (
                            <>
                              <View
                                style={{
                                  marginTop: 8
                                }}
                              >
                                <WsInfo
                                  labelWidth={100}
                                  label={t('回訓提醒日')}
                                  icon={'ws-outline-reminder'}
                                  color={$color.primary3l}
                                  textColor={$color.primary}
                                  value={
                                    value.retraining_remind_date
                                      ? moment(value.retraining_remind_date).format('YYYY-MM-DD')
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

                        {value &&
                          value.retraining_at &&
                          value.retraining_year &&
                          value.retraining_hour &&
                          value.retraining_remind_date && (
                            <>
                              <View
                                style={{
                                  marginTop: 8
                                }}
                              >
                                <WsInfo
                                  labelWidth={100}
                                  label={t('總回訓時數')}
                                  value={
                                    value.trained_hours
                                      ? `${value.trained_hours}`
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

                      <WsPaddingContainer
                        padding={0}
                        style={{
                          backgroundColor: $color.white,
                          paddingHorizontal: 16,
                        }}>

                        <WsFlex
                          style={{
                          }}
                          justifyContent={'space-between'}
                        >
                          <WsInfo
                            label={i18next.t('備註')}
                            style={{
                            }}
                            value={
                              value.remark
                                ? value.remark
                                : i18next.t('無')
                            }
                          />
                        </WsFlex>
                      </WsPaddingContainer>

                      {(value &&
                        value.related_guidelines &&
                        value.related_guidelines.length > 0) && (
                          <WsPaddingContainer
                            padding={0}
                            style={{
                              marginTop: 16,
                              paddingHorizontal: 16,
                              backgroundColor: $color.white,
                            }}>
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}>
                              <WsText
                                size={14}
                                fontWeight={'600'}
                                style={{
                                  marginBottom: 8
                                }}
                              >
                                {t('相關內規')}
                              </WsText>
                            </View>
                            {value &&
                              value.related_guidelines &&
                              value.related_guidelines.length > 0 && (
                                <>
                                  <FlatList
                                    data={value.related_guidelines}
                                    keyExtractor={item => item.id}
                                    renderItem={({ item, index }) => {
                                      return (
                                        <LlRelatedGuidelineItem001
                                          key={index}
                                          item={item}
                                        />
                                      );
                                    }}
                                    ListEmptyComponent={() => {
                                      return (
                                        <WsEmpty />
                                      )
                                    }}
                                  />
                                </>
                              )}
                          </WsPaddingContainer>
                        )}

                      {value.file_attaches &&
                        value.file_attaches.length > 0 && (
                          <WsPaddingContainer
                            padding={0}
                            style={{
                              marginTop: 16,
                              paddingHorizontal: 16
                            }}>
                            <WsInfo
                              type="filesAndImages"
                              label={t('附件')}
                              value={value.file_attaches}
                            />
                          </WsPaddingContainer>
                        )}

                      {version &&
                        value &&
                        value.retraining_at &&
                        value.retraining_year &&
                        value.retraining_hour &&
                        value.retraining_remind_date && (
                          <>
                            <WsPaddingContainer
                              padding={0}
                              style={{
                                marginTop: 16,
                                paddingHorizontal: 16
                              }}>
                              <WsText
                                size={14}
                                fontWeight={600}
                                style={{
                                }}>
                                {t('回訓記錄列表')}
                              </WsText>
                              <RetrainingTimeRecordList002
                                editable={false}
                                params={_params}
                              >
                              </RetrainingTimeRecordList002>
                            </WsPaddingContainer>
                          </>
                        )}
                    </>
                  )}
                </>
              )}

              <View
                style={{
                  height: 100
                }}
              >
              </View>

            </WsPaddingContainer>
          </ScrollView>
        </>
      )}
    </>
  )
}

export default WsVersionHistory
