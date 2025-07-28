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

import CheckListRecordList from '@/sections/CheckList/CheckListRecordList'
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
import CheckListSampleRecordList from '@/sections/CheckList/CheckListSampleRecordList'

const CheckListOverview = (props) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Params
  const { id } = props

  // REDUX
  const currentUser = useSelector(state => state.data.currentUser)
  const currentUserScope = useSelector(state => state.data.userScopes)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // State
  const [loading, setLoading] = useState(true)
  const [checkList, setCheckList] = useState()

  const [templateVersion, setTemplateVersion] = useState()
  const [lastTemplateVersion, setLastTemplateVersion] = useState()

  const [bottomSheetItems, setBottomSheetItems] = React.useState([])
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [copyDialogVisible, setCopyDialogVisible] = React.useState(false)
  const [dialogVisible, setDialogVisible] = React.useState(false)

  const [copyChecklistName, setCopyChecklistName] = React.useState()

  const fields = {
    checkers: {
      type: 'users',
      label: t('答題者')
    },
    reviewer: {
      type: 'user',
      label: t('覆核者')
    },
    deadline: {
      type: 'text',
      label: t('期限')
    }
  }

  // Sample
  const [reviewContent, setReviewContent] = React.useState()
  const [reviewScore, setReviewScore] = React.useState(0)
  const [reviewUploadFileURL, setReviewUploadFileURL] = React.useState()

  // Services
  const $_fetchCheckList = async () => {
    const res = await S_Checklist.show({
      modelId: id
    })
    setCopyChecklistName(`${res.name}-拷貝`)
    setCheckList(res)
    if (res.last_version && res.last_version.checklist_template_version) {
      setTemplateVersion(res.last_version.checklist_template_version.id)
    }
    if (res.checklist_template && res.checklist_template.last_version) {
      setLastTemplateVersion(res.checklist_template.last_version.id)
    }
    setLoading(false)
  }

  const $_onEditPress = () => {
    navigation.navigate('CheckListUpdate')
  }

  const $_postCopyChecklist = async () => {
    try {
      const res = await S_Checklist.copyChecklist(id, copyChecklistName)
      Alert.alert(t('複製點檢表成功'))
    } catch (error) {
      console.error(error, '=error=')
      Alert.alert(t('複製點檢表失敗'))
    } finally {
    }
  }

  const startCheckOnPress = () => {
    navigation.navigate({
      name: 'CheckListAssignmentIntroduction',
      params: {
        id: id,
        versionId: checkList.last_version ? checkList.last_version.id : null,
        name: checkList.name
      }
    })
  }

  React.useEffect(() => {
    if (id) {
      setLoading(true)
      $_fetchCheckList()
    }
  }, [id])

  return (
    <>
      <ScrollView>
        <View
          style={{ flex: 1 }}
        >
          {!loading && checkList ? (
            <>
              {/* {templateVersion < lastTemplateVersion && (
                <LlTopAlertBar001
                  text={'更新提醒'}
                  onPress={() => {
                    // navigation.navigate({
                    //   name: 'CheckListTemplateUpdate',
                    //   params: {
                    //     id: id,
                    //     versionId: checkList.last_version.id
                    //   }
                    // })
                  }}>
                  {t('請儘速更新題庫版本，以降低法律風險')}
                </LlTopAlertBar001>
              )} */}
              {/* <WsPaddingContainer
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
                  {templateVersion < lastTemplateVersion && (
                    <WsTag
                      backgroundColor="rgb(255, 247, 208)"
                      textColor={$color.gray6d}>
                      {t('版本更新')}
                    </WsTag>
                  )}
                </WsFlex>
                <WsFlex
                  style={{
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start'
                  }}>
                  {checkList.system_subclasses.map(
                    (systemSubclass, systemSubclassIndex) => {
                      return (
                        <WsTag
                          key={systemSubclassIndex}
                          style={{
                            marginTop: 16,
                            marginRight: 8
                          }}
                          img={systemSubclass.icon}>
                          {systemSubclass.name}
                        </WsTag>
                      )
                    }
                  )}
                </WsFlex>
              </WsPaddingContainer> */}
              
              {/* <LlInfoUserCard001
                frequency={checkList.frequency}
                owner={
                  checkList.owner
                    ? checkList.owner
                    : checkList.taker
                      ? checkList.taker
                      : null
                }
                factory_tags={checkList.factory_tags}
                fields={fields}
                onPress={() => {
                  $_onEditPress()
                }}
                style={{
                  marginVertical: 8
                }}
              /> */}
            </>
          ) : (
            <WsSkeleton></WsSkeleton>
          )}
        </View>
      </ScrollView>
    </>
  )
}

export default CheckListOverview
