import React from 'react'
import {
  WsPaddingContainer,
  LlTemplatesCard001,
  WsSkeleton,
  WsModal
} from '@/components'
import S_LicenseType from '@/services/api/v1/license_type'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import AsyncStorage from '@react-native-community/async-storage'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import PickTemplate from '@/views/License/Create/PickTemplate'
import S_LicenseTemplateVersion from '@/services/api/v1/license_template_version'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

const LicensePickTypeTemplate = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const {
    title,
    setParentStateModal
  } = props

  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)
  const systemClasses = useSelector(state => state.data.systemClasses)

  // STATES
  const [stateModal, setStateModal] = React.useState(false)
  const [selectType, setSelectType] = React.useState()

  const [loading, setLoading] = React.useState(true)
  const [typeList, setTypeList] = React.useState()
  const [filterValue, setFiltersValue] = React.useState()

  // Services
  const $_fetchLicenseType = async () => {
    const _params = {
      order_by: 'sequence',
      order_way: 'asc'
    }
    const res = await S_LicenseType.index({ params: _params })
      .then(res => {
        setTypeList(res.data)
        setLoading(false)
      })
  }

  // 選擇證照類型STEP2
  const $_templateOnPress = async (template, subClass, systemClass) => {
    try {
      const _params = {
        license_template: template.id
      }
      const res = await S_LicenseTemplateVersion.index({
        params: _params
      }).then(async _res => {
        const _data = {
          license_owned_factory: currentFactory,
          using_status: 1,
          system_subclasses: subClass,
          license_template: template,
          license_type: selectType,
          name: template.name,
          valid_end_date_checkbox: false,
          statitory_extension_period: _res.data[0].statitory_extension_period
            ? _res.data[0].statitory_extension_period
            : null,
          recommend_notify_period: _res.data[0].recommend_notify_period
            ? _res.data[0].recommend_notify_period
            : null,
          training_hours: _res.data[0].training_hours
            ? _res.data[0].training_hours
            : null,
          agents: selectType && selectType.id === 3 ?
            {
              id: currentUser.id,
              name: currentUser.name,
              avatar: currentUser.avatar
            } : null,
          // 報准人員類型需設定的「設定本廠報准掛證人員」
          licenseTypeUserLicense: typeList && typeList[0] ? typeList[0] : undefined,
        }
        // 續辦提醒設定日期
        const _valid_end_day = _data.valid_end_date
        const _day = _data.statitory_extension_period + _data.recommend_notify_period
        const _remind_data = moment(_valid_end_day).add(-_day, 'days').format('YYYY-MM-DD')
        _data.remind_date = _remind_data
        _data.remind_date_radio = 1
        const _value = JSON.stringify(_data)
        await AsyncStorage.setItem('LicenseCreate', _value)
        setStateModal(false)
        setParentStateModal(false)
        navigation.reset({
          index: 1,
          routes: [
            {
              name: 'LicenseIndex',
              params: {
              }
            },
            {
              name: 'LicenseCreate',
              params: {
              }
            }
          ],
          key: `${Date.now()}`
        })
      })
    } catch (error) {
      console.log(error)
    }
  }
  const $_otherTemplateOnPress = async (licenseType) => {
    console.log(licenseType,'$_otherTemplateOnPress');
    const _data = {
      license_owned_factory: currentFactory,
      using_status: 1,
      license_type: licenseType,
      name: licenseType ? licenseType.name : '其他',
      // 有效迄日的顯示與否
      valid_end_date_checkbox: false,
    }
    const _value = JSON.stringify(_data)
    await AsyncStorage.setItem('LicenseCreate', _value)
    setStateModal(false)
    setParentStateModal(false)
    navigation.reset({
      index: 1,
      routes: [
        {
          name: 'LicenseIndex',
          params: {
          }
        },
        {
          name: 'LicenseCreate',
          params: {
          }
        }
      ],
      key: `${Date.now()}`
    })
  }

  const $_setDefaultSubClasses = () => {
    const system_subclasses =
      S_SystemClass.getAllSubSystemClassesId(systemClasses)
    setFiltersValue({
      system_subclasses
    })
  }

  React.useEffect(() => {
    $_fetchLicenseType()
  }, [])

  React.useEffect(() => {
    if (systemClasses) {
      $_setDefaultSubClasses()
    }
  }, [systemClasses])

  return (
    <>
      {loading ? (
        <WsSkeleton />
      ) : (
        <>
          {typeList && (
            <>
              <WsPaddingContainer>
                {typeList.map((type, typeIndex) => {
                  return (
                    <LlTemplatesCard001
                      key={type.id}
                      onPress={() => {
                        if (type.name === t('其他')) {
                          $_otherTemplateOnPress(type)
                        }
                        else {
                          setSelectType(type)
                          setStateModal(true)
                        }
                      }}
                      img={type.icon}
                      name={type.name}
                      style={{ marginTop: 8 }}
                    />
                  )
                })}
              </WsPaddingContainer>
            </>
          )}
        </>
      )}

      <WsModal
        animationType={'none'}
        visible={stateModal}
        onBackButtonPress={() => {
          setStateModal(false)
        }}
        headerLeftOnPress={() => {
          setStateModal(false)
        }}
        title={title}
      >
        <PickTemplate
          onPress={$_templateOnPress}
          onPressOthers={$_otherTemplateOnPress}
          type={selectType}
        ></PickTemplate>
      </WsModal >
    </>
  )
}
export default LicensePickTypeTemplate
