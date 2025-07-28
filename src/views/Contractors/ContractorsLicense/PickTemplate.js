import React from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import {
  LlTemplatesCard001,
  WsPaddingContainer,
  WsFilter,
  LlBtn002,
  WsText,
  WsFlex,
  WsFastImage,
  WsDes,
  WsPickTemplateWithSystemClass,
  WsState
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import AsyncStorage from '@react-native-community/async-storage'
import { useTranslation } from 'react-i18next'
import store from '@/store'
import { setCurrentCreateLicense } from '@/store/data'

const ContractorsLicensePickTemplate = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  // Props
  const { contractorId, contractor } = route.params

  // Redux
  const factoryId = useSelector(state => state.data.currentFactory.id)
  const systemClasses = useSelector(state => state.data.systemClasses)
  const currentContractorBasicData = useSelector(
    state => state.data.currentContractorBasicData
  )

  // States
  const [searchValue, setSearchValue] = React.useState('')
  const [modalVisible, setModalVisible] = React.useState(false)
  const [filtersValue, setFiltersValue] = React.useState({})
  const [params, setParams] = React.useState()
  const [_systemClass, setSystemClass] = React.useState([])

  const fields = {
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    }
  }

  // Function
  const $_setParams = () => {
    const _params = {
      search: searchValue,
      ...filtersValue,
      contractor: contractorId
    }
    setParams(_params)
  }

  const $_onFilterSubmit = $event => {
    setModalVisible(false)
    setFiltersValue($event)
  }

  const $_templateOnPress = async (template, subClass, systemClassId) => {
    const create_license_type = {
      agent_text: contractor.name ? contractor.name : null,
      currentContractorBasicData,
      templateId: template.id,
      system_classes: systemClassId,
      system_subclasses: subClass,
      license_template: template,
      contractor_license_template: template,
      last_version: template.last_version,
      name: template.name
    }
    const _string_create_license_type = JSON.stringify(create_license_type)
    await AsyncStorage.setItem(
      'ContractorsLicenseCreate',
      _string_create_license_type
    )
    navigation.navigate('ContractorsLicenseCreate')
  }

  const $_otherOnPress = async () => {
    const create_license_type = {
      agent_text: contractor.name ? contractor.name : null,
      currentContractorBasicData,
      contractor_license_template: {
        name: '其他'
      },
      name: t('其他')
    }
    const _string_create_license_type = JSON.stringify(create_license_type)
    await AsyncStorage.setItem(
      'ContractorsLicenseCreate',
      _string_create_license_type
    )
    navigation.navigate('ContractorsLicenseCreate')
  }

  React.useEffect(() => {
    $_setParams()
  }, [filtersValue, searchValue, contractorId])

  return (
    <>
      <ScrollView>
        <WsPaddingContainer>
          <WsState
            type="search"
            value={searchValue}
            onChange={setSearchValue}
            placeholder={t('搜尋')}
            stateStyle={{
              backgroundColor: $color.primary11l,
              borderColor: $color.gray,
              borderWidth: 1
            }}
            style={{
              marginBottom: 16
            }}
          />
          <WsFilter
            visible={modalVisible}
            setModalVisible={setModalVisible}
            onClose={() => {
              setModalVisible(false)
            }}
            filterTypeName={t('篩選條件')}
            fields={fields}
            currentValue={filtersValue}
            onSubmit={$_onFilterSubmit}
          />
          <View
            style={{
              alignItems: 'flex-start'
            }}>
            <LlBtn002
              style={{
                width: 92,
                height: 40
              }}
              onPress={() => setModalVisible(true)}>
              {t('篩選條件')}
            </LlBtn002>
          </View>
          <WsPickTemplateWithSystemClass
            text={t('找不到想新增的種類嗎？')}
            onPressText={t('點此新增「其他」')}
            onPress={$_otherOnPress}
            modelName="contractor_license_template"
            parentId={factoryId}
            params={params}
            keyExtractor={(item, index) => {
              item.id
            }}
            renderItem={(item, index) => {
              return (
                <>
                  <LlTemplatesCard001
                    key={item.id}
                    name={item.name}
                    style={[
                      index != 0
                        ? {
                          marginTop: 8
                        }
                        : null
                    ]}
                    onPress={() => {
                      $_templateOnPress(
                        item,
                        item.system_subclasses,
                        item.system_classes
                      )
                    }}
                  />
                </>
              )
            }}
          />
        </WsPaddingContainer>
      </ScrollView>
    </>
  )
}

export default ContractorsLicensePickTemplate
