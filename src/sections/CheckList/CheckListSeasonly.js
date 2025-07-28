import React, { useState, useEffect } from 'react'
import { Text, View, ScrollView } from 'react-native'
import i18next from 'i18next'
import LlCheckListCard001 from '@/components'

import {
  WsBtn,
  WsPaddingContainer,
  WsTitle,
  WsText,
  WsFlex,
  WsIcon,
  WsGrid,
  WsManageCard,
  WsIconTitle,
  WsTabView,
  WsModal,
  WsFilter
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import LlBtn002 from '@/components/LlBtn002'
import ServiceCheckList from '@/services/api/v1/checklist'
import { useTranslation } from 'react-i18next'

const CheckListSeasonly = () => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // States
  const [modalVisible, setModalVisible] = useState(false)
  const [checklistWithSystemClass, setChecklistWithSystemClass] = useState([])
  const [filtersValue, setFiltersValue] = useState({})

  // Services
  const $_fetchAudits = async () => {
    const res = await ServiceCheckList.index({ parentId: 1 })
    setChecklistWithSystemClass(ServiceCheckList.getChecksWithSystemClass(res))
  }

  // Filter
  const filterFields = [
    {
      name: 'system_subclass',
      topic: i18next.t('領域'),
      type: 'system_subclass'
    }
  ]

  // Function
  const $_onFilterSubmit = $event => {
    setModalVisible(false)
    setFiltersValue($event)
  }

  useEffect(() => {
    $_fetchAudits()
  }, [])

  return (
    <>
      <ScrollView>
        <WsFilter
          visible={modalVisible}
          setModalVisible={setModalVisible}
          onClose={() => {
            setModalVisible(false)
          }}
          filterTypeName={i18next.t('篩選條件')}
          filterFields={filterFields}
          currentValue={filtersValue}
          onSubmit={$_onFilterSubmit}
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
              {i18next.t('篩選條件')}
            </LlBtn002>
          </View>
          {checklistWithSystemClass.map(systemClass => (
            <View key={systemClass.id}>
              <WsText
                style={{
                  marginTop: 24
                }}
                fontWeight="bold"
                size={24}>
                {systemClass.name}
              </WsText>
              {systemClass.system_subclasses.map(systemSubclass => (
                <View key={systemSubclass.id}>
                  <WsIconTitle
                    icon={systemSubclass.icon}
                    style={{
                      marginTop: 24
                    }}>
                    {t(systemSubclass.name)}
                  </WsIconTitle>
                  {systemSubclass.checklist.map((checklist, auditIndex) => (
                    <LlCheckListCard001
                      key={checklist.id}
                      style={[
                        auditIndex == 0
                          ? null
                          : {
                            marginTop: 12
                          }
                      ]}
                      name={checklist.name}
                      tagIcon={checklist.tagIcon}
                      tagText={checklist.tagText}
                      writer={checklist.writer}
                      checker={checklist.checker}
                      taker={
                        checklist.owner
                          ? checklist.owner
                          : checklist.taker
                            ? checklist.taker
                            : null
                      }
                      frequency={checklist.frequency}
                      onPress={() => {
                        navigation.navigate({
                          name: 'CheckListShow',
                          params: {
                            id: checklist.id
                          }
                        })
                      }}
                    />
                  ))}
                </View>
              ))}
            </View>
          ))}
        </WsPaddingContainer>
      </ScrollView>
    </>
  )
}

export default CheckListSeasonly
