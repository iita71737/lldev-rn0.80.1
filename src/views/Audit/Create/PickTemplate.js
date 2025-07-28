import React, { useState, useEffect } from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import {
  WsFilter,
  WsPaddingContainer,
  WsText,
  WsIconTitle,
  WsPickTemplateWithSystemClass,
  LlTemplatesCard001,
  LlBtn002
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import AsyncStorage from '@react-native-community/async-storage'
import S_AuditTemplates from '@/services/api/v1/audit_template'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const PickTemplate = () => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // State
  const [defaultFilter, setDefaultFilter] = useState({
    system_subclasses: [14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26, 28]
  })
  const [modalVisible, setModalVisible] = useState(false)
  const [filtersValue, setFiltersValue] = useState({})
  const [filtersAudit, setFiltersAudit] = useState([])
  const [params, setParams] = useState({})

  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)

  // Fields
  const fields = {
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    }
  }
  // Services
  const $_getFiltersAudit = async () => {
    const res = await S_AuditTemplates.getFilteredTemplateList({
      params: params,
      parentId: currentFactory?.id
    })
    setFiltersAudit(res)
  }

  const $_setParams = () => {
    const params = { status: '1,2' }
    if (Object.keys(filtersValue).length !== 0) {
      const string = filtersValue.system_subclasses.join()
      params.system_subclasses = string
    }
    setParams({
      ...params
    })
  }

  // Function
  const $_onFilterSubmit = $event => {
    setModalVisible(false)
    setFiltersValue($event)
  }

  // Press
  const $_templateOnPress = async audit => {
    if (audit.status == 1) {
      await AsyncStorage.setItem(
        'AuditCreate',
        JSON.stringify({
          name: audit.name,
          audit_template: audit
        })
      )
      navigation.navigate('AuditCreate')
    }
  }
  const $_otherOnPress = async () => {
    await AsyncStorage.setItem(
      'AuditCreate',
      JSON.stringify({
        name: t('其他'),
        audit_template: {
          name: t('其他')
        }
      })
    )
    navigation.navigate('AuditCreate')
  }

  useEffect(() => {
    $_getFiltersAudit()
    $_setParams()
  }, [filtersValue])

  return (
    <ScrollView>
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
        defaultFilter={defaultFilter}
      />
      <WsPaddingContainer>
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
          modelName="audit_template"
          params={params}
          text={t('找不到想新增的種類嗎？')}
          onPressText={t('點此新增「其他」')}
          onPress={$_otherOnPress}
          keyExtractor={(item, index) => {
            item.id
          }}
          renderItem={(item, index, subClass) => {
            return (
              <>
                {(item.status == 1 || item.status == 2) && (
                  <LlTemplatesCard001
                    key={item.id}
                    fontColor={item.status == 2 ? $color.gray : $color.black}
                    style={[
                      index != 0
                        ? {
                          marginTop: 8
                        }
                        : null
                    ]}
                    name={
                      item.status == 2
                        ? `${t('修訂中')}${item.name}`
                        : item.name
                    }
                    onPress={() => {
                      $_templateOnPress(item)
                    }}
                  />
                )}
              </>
            )
          }}
        />
      </WsPaddingContainer>
    </ScrollView>
  )
}

export default PickTemplate
