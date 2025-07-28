import React, { useState, useEffect } from 'react'
import { Pressable, ScrollView, View, Alert, Dimensions, KeyboardAvoidingView } from 'react-native'
import {
  WsPaddingContainer,
  WsText,
  WsTag,
  WsIconBtn,
  WsTabView,
  WsState,
  WsDialog,
  WsBottomSheet,
  WsFlex,
  WsDialogDelete,
  LlTopAlertBar001,
  LlInfoUserCard001,
  WsSkeleton,
  WsGradientButton,
  WsModal
} from '@/components'
import AsyncStorage from '@react-native-community/async-storage'
import { useTranslation } from 'react-i18next'
import CheckListQuestion from '@/sections/CheckList/CheckListQuestion'
import CheckListSampleRecordList from '@/sections/CheckList/CheckListSampleRecordList'
import CheckListGeneralScheduleList from '@/sections/CheckList/CheckListGeneralScheduleList'
import CheckListRecordList from '@/sections/CheckList/CheckListRecordList'
import CheckListTemplateOverview from '@/views/CheckList/Template/CheckListTemplateOverview'
import { useNavigation } from '@react-navigation/native'
import S_Checklist from '@/services/api/v1/checklist'
import S_ChecklistVersion from '@/services/api/v1/checklist_version'
import $color from '@/__reactnative_stone/global/color'
import store from '@/store'
import {
  setCurrentCheckList,
  setCurrentCheckListForUpdateVersion,
  setCurrentChecklistRecordDraft
} from '@/store/data'
import { useSelector } from 'react-redux'
import S_ChecklistAssignment from '@/services/api/v1/checklist_assignment'
import S_CheckListTemplate from '@/services/api/v1/checklist_template'
import CheckListTemplateQuestion from '@/views/CheckList/Template/CheckListTemplateQuestion'

const CheckListTemplateShow = ({ route }) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const _stack = navigation.getState().routes

  // Params
  const { id } = route.params

  // REDUX
  const currentUser = useSelector(state => state.data.currentUser)
  const currentUserScope = useSelector(state => state.data.userScopes)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // State
  const [loading, setLoading] = useState(true)
  const [checkList, setCheckList] = useState()

  const [index, setIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState([
    {
      value: 'CheckListTemplateOverview',
      label: t('資訊'),
      view: CheckListTemplateOverview,
      props: {
        id: id
      }
    },
    {
      value: 'CheckListTemplateQuestion',
      label: t('題目'),
      view: CheckListTemplateQuestion,
      props: {
        id: id
      }
    }
  ])

  // Services
  const $_fetchCheckList = async () => {
    const res = await S_CheckListTemplate.show({
      modelId: id
    })
    setCheckList(res)
    setLoading(false)
  }

  const $_setTabItems = () => {
    setTabItems([
      {
        value: 'CheckListTemplateOverview',
        label: t('資訊'),
        view: CheckListTemplateOverview,
        props: {
          id: id
        }
      },
      {
        value: 'CheckListTemplateQuestion',
        label: t('題目'),
        view: CheckListTemplateQuestion,
        props: {
          id: id,
          versionId: checkList.last_version ? checkList.last_version.id : null
        }
      }
    ])
  }


  React.useEffect(() => {
    if (id) {
      setLoading(true)
      $_fetchCheckList()
    }
  }, [id])

  React.useEffect(() => {
    if (checkList && checkList.last_version) {
      $_setTabItems()
    }
  }, [checkList])

  return (
    <>
      <ScrollView>
        <View
          style={{ flex: 1 }}
        >
          {!loading && checkList ? (
            <>
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white
                }}>
                <WsFlex justifyContent="space-between" alignItems="flex-start">
                  <WsText
                    style={{
                      flex: 1
                    }}
                    size={24}>
                    {checkList.name}
                  </WsText>
                </WsFlex>
              </WsPaddingContainer>

              {tabItems && (
                <WsTabView
                  scrollEnabled={true}
                  items={tabItems}
                  index={index}
                  isAutoWidth={true}
                  setIndex={setIndex}
                  fixedContainerHeight={height - 256}
                />
              )}
            </>
          ) : (
            <WsSkeleton></WsSkeleton>
          )}
        </View>
      </ScrollView>
    </>
  )
}

export default CheckListTemplateShow
