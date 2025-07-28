import React, { useMemo } from 'react'
import { View, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native'
import {
  WsPaddingContainer,
  WsIcon,
  WsFlex,
  WsText,
  WsInfo,
  LlNumCard001,
  WsTag,
  LlBtn002,
  WsState,
  WsInfoUser
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { ScrollView } from 'react-native-gesture-handler'
import S_Contractor from '@/services/api/v1/contractor'

const BasicData = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const { contractor } = props

  // const _value = (contractor?.contractor_types ?? [])
  //   .concat(contractor?.contractor_customed_types ?? [])
  //   .map((type, index) => {
  //     return index !== 0 ? `,${type.name}` : type.name;
  //   });

  const contractorTypesArray = useMemo(() => {
    const allTypes = [
      ...(contractor?.contractor_types ?? []),
      ...(contractor?.contractor_customed_types ?? []),
    ]
    return allTypes.map((t, i) => (i === 0 ? t.name : `${t.name}`))
  }, [
    contractor?.contractor_types,
    contractor?.contractor_customed_types,
  ])


  // STATES
  const [remark, setRemark] = React.useState(contractor.remark)
  const [remarkInput, setRemarkInput] = React.useState(false)

  // SERVICE
  const $_updateRemark = async () => {
    try {
      const _res = await S_Contractor.remarkUpdate({
        id: contractor.id,
        remark: remark
      })
      setRemark(_res.remark)
    } catch (e) {
      Alert.alert(t('編輯失敗'))
    }
  }

  // Render
  return (
    <>
      <ScrollView>
        <WsPaddingContainer
          style={{
            backgroundColor: $color.white
          }}>
          <WsFlex
            style={{
            }}
          >
            <WsText size={14} fontWeight="600" letterSpacing={1}>
              {t('合作狀態')}
            </WsText>
            <WsTag
              textColor={
                contractor.contractor_status == 1 ? $color.green : $color.danger
              }
              backgroundColor={
                contractor.contractor_status == 1
                  ? $color.green12l
                  : $color.danger11l
              }
              style={{
                marginLeft: 8,
              }}>
              {contractor.contractor_status == 1 ? t('合作中') : t('合作終止')}
            </WsTag>
          </WsFlex>

          <View
            style={{
              marginTop: 8
            }}
          >
            <WsInfo
              label={t('統一編號')}
              value={contractor.tax_id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}
            />
          </View>


          {contractor &&
            contractorTypesArray &&
            contractorTypesArray.length > 0 && (
              <View
                style={{
                  marginTop: 8,
                }}
              >
                <WsInfo
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                  label={t('承攬類別')}
                  value={contractorTypesArray.toString()}
                />
              </View>
            )}

          <WsFlex
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 8,
            }}>
            <WsText fontWeight={'600'} size={14}
              style={{
              }}>
              {t('是否為拒絕往來廠商')}
            </WsText>
            <WsTag
              style={{
                marginLeft: 8
              }}
              backgroundColor={
                contractor.review == 0 ? $color.danger11l : $color.primary11l
              }
              textColor={
                contractor.review == 0 ? $color.danger : $color.primary
              }>
              {contractor.review == 0 ? t('是') : t('否')}
            </WsTag>
          </WsFlex>

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <WsText
              fontWeight={'600'}
              size={14}
              style={{
                // marginBottom: 4 
              }}>
              {t('廠商評比')}
            </WsText>
            <WsText
              style={{
                marginLeft: 8
              }}
              size={14}
            >
              {contractor.review_remark ? contractor.review_remark : t('無')}
            </WsText>
          </View>

          <WsInfo
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 8,
            }}
            type={'user'}
            label={t('管理者')}
            value={contractor.owner ? contractor.owner : t('無')}
          />
        </WsPaddingContainer>

        {contractor.contact && (
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white,
              marginTop: 8
            }}>
            <WsText fontWeight={'600'} size={16} style={{}}>
              {t('聯絡資訊')}
            </WsText>


            <View
              style={{
                marginLeft: 16,
              }}
            >
              {contractor.contact.map((item, index) => {
                return (
                  <>
                    <WsText
                      fontWeight={'600'}
                      size={12}
                      style={{
                        marginTop: 16,
                      }}
                      color={$color.gray}
                    >
                      {`${t('聯絡人')}${index + 1}`}
                    </WsText>

                    <View
                      style={{
                        marginLeft: 16,
                      }}
                    >
                      <View
                        style={{
                          marginTop: 8,
                        }}
                      >
                        <WsInfo
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                          label={t('姓名')}
                          value={item.name}
                        />
                      </View>

                      <View
                        style={{
                          marginTop: 8
                        }}
                      >
                        <WsInfo
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                          label={t('信箱')}
                          value={item.email}
                        />
                      </View>

                      <View
                        style={{
                          marginTop: 8
                        }}
                      >
                        <WsInfo
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                          label={t('電話')}
                          value={item.tel}
                        />
                      </View>

                      <View
                        style={{
                          marginTop: 8
                        }}
                      >
                        <WsInfo
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                          label={t('手機')}
                          value={item.mobile}
                        />
                      </View>
                    </View >
                  </>
                )
              })}
            </View>
            
          </WsPaddingContainer>
        )}

        {remark && !remarkInput && (
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white,
              marginTop: 8
            }}>
            <WsFlex
              style={{
                // borderWidth:1,
              }}
              alignItems={'flex-start'}
              justifyContent={'space-between'}
            >
              <WsInfo
                label={t('備註')}
                value={remark}
              />
              <LlBtn002
                minHeight={0}
                style={{
                }}
                onPress={() => setRemarkInput(true)}
              >
                {t('編輯')}
              </LlBtn002>
            </WsFlex>

            {contractor.remark_updated_at && (
              <WsFlex
                style={{
                  marginTop: 8
                }}>
                <WsFlex>
                  {contractor.remark_updated_user && (
                    <>
                      <WsInfoUser
                        fontsize={14}
                        isUri={true}
                        value={contractor.remark_updated_user}
                        des={`${t('編輯時間')}${moment(contractor.remark_updated_at).format('YYYY-MM-DD HH:mm')}`}
                      />
                    </>
                  )}
                </WsFlex>
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
        )
        }

        <WsPaddingContainer>

          {contractor.file_attaches &&
            contractor.file_attaches.length > 0 && (
              <WsInfo
                label={t('附件')}
                type="filesAndImages"
                value={contractor.file_attaches}
              />
            )}

        </WsPaddingContainer>
      </ScrollView>
    </>
  )
}

export default BasicData
