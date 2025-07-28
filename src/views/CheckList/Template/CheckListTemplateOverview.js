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
  WsModal,
  WsInfo
} from '@/components'
import AsyncStorage from '@react-native-community/async-storage'
import { useTranslation } from 'react-i18next'
import CheckListQuestion from '@/sections/CheckList/CheckListQuestion'
import moment from 'moment'
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
import S_CheckListTemplate from '@/services/api/v1/checklist_template'
import ServiceCard from '@/services/api/v1/card'

const CheckListTemplateOverview = (props) => {
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

  // Services
  const $_fetchCheckList = async () => {
    const res = await S_CheckListTemplate.show({
      modelId: id
    })
    setCheckList(res)
    setLoading(false)
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
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                }}>

                <WsFlex
                  style={{
                  }}
                  alignItems={'center'}
                >
                  {checkList &&
                    checkList.system_subclasses &&
                    checkList.system_subclasses.length > 0 && (
                      <>
                        <WsText size={14}
                          fontWeight="600"
                          letterSpacing={1}
                          style={{ width: 110 }}
                        >
                          {t('領域')}
                        </WsText>
                        <WsFlex
                          style={{
                          }}
                          flexWrap="wrap"
                        >
                          {checkList.system_subclasses.map((subClass) => (
                            <WsTag
                              key={subClass.id}
                              img={subClass.icon}
                            >
                              {subClass.name}
                            </WsTag>
                          ))}
                        </WsFlex>
                      </>
                    )}
                </WsFlex>

                {checkList && checkList.updated_at && (
                  <>
                    <WsFlex
                      alignItems="flex-start"
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsText
                        size={14}
                        fontWeight={600}
                        style={{
                          marginRight: 8,
                          width: 100
                        }}
                      >
                        {t('狀態')}
                      </WsText>
                      {ServiceCard.getTags(checkList, 'props') && (
                        <WsTag
                          backgroundColor={$color.yellow11l}
                          textColor={$color.gray}>
                          {ServiceCard.getTags(checkList, 'props')}
                        </WsTag>
                      )}
                      {checkList.status && checkList.status == 2 && (
                        <WsTag
                          testID={'標籤'}
                          style={{
                            marginLeft: 4
                          }}
                          backgroundColor={$color.yellow11l}
                          textColor={$color.gray}>
                          {t('修訂中')}
                        </WsTag>
                      )}
                    </WsFlex>

                    <View
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsInfo
                        labelWidth={100}
                        label={t('更新日期')}
                        value={checkList && checkList.updated_at ? moment(checkList.updated_at).format('YYYY-MM-DD') : null}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center'
                        }}
                      />
                    </View>
                  </>
                )}

                {checkList.frequency && (
                  <View
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsInfo
                      labelWidth={100}
                      label={t('頻率')}
                      value={checkList && checkList.frequency ?
                        checkList.frequency === 'week'
                          ? t('每週')
                          : checkList.frequency === 'month'
                            ? t('每月')
                            : checkList.frequency === 'season'
                              ? t('每季')
                              : checkList.frequency === 'year'
                                ? t('每年')
                                : checkList.frequency === 'everyTime'
                                  ? t('每次作業')
                                  : checkList.frequency === 'day'
                                    ? `${t('每日')}`
                                    : '' : null}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                    />
                  </View>
                )}
              </WsPaddingContainer>
            </>
          ) : (
            <WsSkeleton></WsSkeleton>
          )}
        </View>
      </ScrollView>

    </>
  )
}

export default CheckListTemplateOverview
