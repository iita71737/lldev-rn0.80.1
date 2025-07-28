import React, { useState } from 'react'
import {
  ScrollView,
  View,
  Text,
  Dimensions,
  Alert,
  TouchableOpacity
} from 'react-native'
import {
  WsFlex,
  WsPaddingContainer,
  LlTrainingHeaderCard001,
  WsInfo,
  WsIcon,
  WsIconBtn,
  WsText,
  WsBottomSheet,
  WsDialogDelete,
  WsInfoUser,
  WsCardPassage,
  WsCollapsible,
  WsPassageCollapse,
  WsModal,
  WsSkeleton,
  WsTabView,
  WsInfiniteScroll,
  LlTrainingTimeRecordCard001,
  LlChecklistGeneralScheduleListCard001,
  WsPageIndex,
  WsState,
  WsPopup,
  WsGradientButton,
  LlRetrainingRecordCard001
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import S_License from '@/services/api/v1/license'
import S_LicenseVersion from '@/services/api/v1/license_version'
import AsyncStorage from '@react-native-community/async-storage'
import license_version from '@/services/api/v1/license_version'
import S_RetrainingTimeRecord from '@/services/api/v1/retraining_time_record'
import {
  setRefreshCounter,
} from '@/store/data'
import store from '@/store'

const RetrainingTimeRecordList = (props) => {
  const navigation = useNavigation()
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  const {
    id,
    license,
    licenseLastVersionId,
    tabIndex,
    editable,
    filterVisible = true
  } = props

  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // STATES
  const [modalActive, setModalActive] = React.useState(false)
  const [popupActive, setPopupActive] = React.useState(false)
  const [popupTextNumber, setPopupTextNumber] = React.useState()

  const [editId, setEditId] = React.useState()
  const [train_at, setTrainAt] = React.useState()
  const [hours, setHours] = React.useState()
  const [attaches, setAttaches] = React.useState()

  // MEMO
  const _params = React.useMemo(() => {
    const params = {
      license_version: licenseLastVersionId,
      lang: 'tw',
      order_by: 'train_at',
      order_way: 'desc'
    }
    return params
  }, [currentRefreshCounter]);

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
    if (_copy_last_version.valid_end_date === null) {
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
      statitory_extension_period: statitory_extension_period ? statitory_extension_period : undefined,
      recommend_notify_period: recommend_notify_period ? recommend_notify_period : undefined,
      valid_end_date_checkbox: _checkbox,
      // 來自後台的證照類型顯示欄位(廠證)
      license_owned_factory: currentFactory
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
    // 回訓起算日清空
    delete _license.retraining_at
    delete _license.retraining_remind_date
    // 續辦提醒設定日期
    if (_license.remind_date) {
      _license.remind_date_radio = 2
    } else {
      _license.remind_date_radio = 1
    }
    const _value = JSON.stringify(_license)
    await AsyncStorage.setItem('LicenseUpdate', _value)
  }

  // clear
  const $_clearFieldValue = () => {
    setEditId(null)
    setHours(null)
    setTrainAt(null)
    setAttaches([])
  }

  // submit
  const $_submit = () => {
    if (editId) {
      const _params = {
        id: editId,
        train_at: train_at,
        hours: hours,
        attaches: attaches ? S_License.formattedForFileStore(attaches) : [],
      };
      S_RetrainingTimeRecord.update({ params: _params })
        .then(async (res) => {
          // console.log(licenseLastVersionId,'licenseLastVersionId');
          // // 创建回訓紀錄成功后，直接调用 S_LicenseVersion.show
          // const _res = await S_LicenseVersion.show({ modelId: licenseLastVersionId });
          // console.log(_res,'_res S_LicenseVersion.show');
          // console.log(id,'id');
          const _res = await S_License.show({ modelId: id });
          if (_res.last_version?.trained_hours) {
            setPopupTextNumber(_res.last_version.trained_hours);
          }
          setPopupActive(true);
          console.log('Retraining record updated successfully!');
          $_setStorage()
          $_clearFieldValue()
          store.dispatch(setRefreshCounter(currentRefreshCounter + 1));
        })
        .catch(error => {
          Alert.alert('編輯回訓紀錄失敗');
          console.error('Error during API process:', error);
        });
    } else {
      const _params = {
        id: licenseLastVersionId,
        train_at: train_at,
        hours: hours,
        attaches: attaches ? S_License.formattedForFileStore(attaches) : [],
      };
      S_RetrainingTimeRecord.create({ params: _params })
        .then(async (res) => {
          // 创建回訓紀錄成功后，直接调用 S_LicenseVersion.show
          // console.log(licenseLastVersionId,'licenseLastVersionId');
          // const _res = await S_LicenseVersion.show({ modelId: licenseLastVersionId });
          // console.log(_res,'_res S_LicenseVersion.show');
          // console.log(id,'id');
          const _res = await S_License.show({ modelId: id });
          if (_res.last_version?.trained_hours) {
            setPopupTextNumber(_res.last_version.trained_hours);
          }
          setPopupActive(true);
          console.log('Retraining record created successfully!');
          $_setStorage()
          $_clearFieldValue()
          store.dispatch(setRefreshCounter(currentRefreshCounter + 1));
        })
        .catch(error => {
          Alert.alert('新增回訓紀錄失敗');
          console.error('Error during API process:', error);
        });
    }
  }

  const $_validation = () => {
    if (train_at && hours) {
      return false
    } else {
      return true
    }
  }

  // navigation
  const $_redirection = () => {
    setPopupActive(false)
    navigation.navigate({
      name: 'LicenseUpdate',
      params: {
        id: id,
        versionId: licenseLastVersionId ? licenseLastVersionId : ''
      }
    })
  }

  // Options
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            <WsIconBtn
              name="md-add"
              size={24}
              color={$color.white}
              style={{
                marginRight: 4
              }}
              onPress={() => {
                setEditId(null)
                $_setStorage()
                setModalActive(true)
              }}
            />
          </>
        )
      },
      headerLeft: () => {
        return (
          <WsIconBtn
            testID={"backButton"}
            name="ws-outline-arrow-left"
            color="white"
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              navigation.goBack()
            }}
          />
        )
      }
    })
  }

  React.useEffect(() => {
    $_setNavigationOption()
  }, [tabIndex])

  return (
    <>
      <WsPageIndex
        modelName={'retraining_time_record'}
        serviceIndexKey={'index'}
        params={_params}
        filterVisible={filterVisible}
        renderItem={({ item, index }: { item: TrainingItem, index: number }) => (
          <>
            <LlRetrainingRecordCard001
              style={{
                marginTop: 16
              }}
              item={item}
              onPress={() => {
              }}
              onPressEdit={(item) => {
                setEditId(item.id)
                setHours(item.hours)
                setTrainAt(item.train_at)
                setAttaches(item.attaches)
                setModalActive(true)
              }}
              editable={editable}
            ></LlRetrainingRecordCard001>
          </>
        )}
      >
      </WsPageIndex>

      <WsModal
        visible={modalActive}
        onBackButtonPress={() => {
          setModalActive(false)
        }}
        headerLeftOnPress={() => {
          setModalActive(false)
        }}
        headerRightOnPress={() => {
          $_submit()
          setModalActive(false)
        }}
        RightOnPressIsDisabled={$_validation()}
        headerRightText={editId ? t('編輯') : t('儲存')}
        title={t('新增回訓紀錄')}
      >
        <ScrollView>
          <WsPaddingContainer>
            <WsState
              type="date"
              style={{
                marginVertical: 8
              }}
              label={t('訓練日期')}
              value={train_at}
              onChange={setTrainAt}
              rules={'required'}
            />
            <WsState
              type="number"
              style={{
                marginVertical: 8,
                maxWidth: width * 0.3
              }}
              maxLength={3}
              label={t('時數')}
              value={hours ? hours.toString() : ''}
              onChange={setHours}
              rules={'required'}
            />
            <WsState
              style={{
                marginVertical: 8
              }}
              type="Ll_filesAndImages"
              label={t('附件')}
              value={attaches}
              onChange={setAttaches}
            />
          </WsPaddingContainer>
        </ScrollView>
      </WsModal>

      <WsPopup
        active={popupActive}
        onClose={() => {
          setPopupActive(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            height: height * 0.2,
            backgroundColor: $color.white,
            borderRadius: 10,
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}>
          <WsText
            size={18}
            color={$color.black}
            style={{
              padding: 16
            }}
          >{t(`已送出，目前總回訓時數為{number}小時，請問要更新回訓起算日、回訓提醒日嗎？`, { number: popupTextNumber })}
          </WsText>
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
                borderWidth: 1,
                borderColor: $color.gray,
                borderRadius: 25,
              }}
              onPress={() => {
                setPopupActive(false)
              }}>
              <WsText
                style={{
                  width: 60,

                }}
                textAlign={'center'}
                size={14}
                color={$color.gray}
              >{t('取消')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              style={{
                width: 96,
              }}
              onPress={() => {
                $_redirection()
              }}>
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>

    </>
  )
}

export default RetrainingTimeRecordList