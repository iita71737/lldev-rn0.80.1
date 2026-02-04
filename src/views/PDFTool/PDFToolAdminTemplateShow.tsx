import React, { useRef, useState, useEffect } from 'react'
import {
  View,
  Dimensions,
  FlatList,
  Alert,
  TouchableOpacity,
} from 'react-native'
import {
  WsFlex,
  WsText,
  WsIconBtn,
  WsPaddingContainer,
  WsInfo,
  WsGradientButton,
  WsIcon,
  WsPopup,
  WsBottomSheet,
  WsSkeleton,
  WsDialogDelete,
  WsCard,
  WsAvatar
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import AsyncStorage from "@react-native-community/async-storage";
import Clipboard from '@react-native-clipboard/clipboard'
import S_MeetingTemplate from '@/services/api/v1/meeting_template'

export type PDFProposalItem = {
  id: string
  name: string
  sequence: string
  parent_article_version_id: string | null
  type: 'title' | 'article'
}

const PDFToolAdminTemplateShow = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Params
  const { id } = route.params

  console.log(id, '=id=')

  // REDUX
  const currentUserScope = useSelector(state => state.data.userScopes)

  // STATES
  const [popupDelete, setPopupDelete] = useState(false)

  const [meetingTemplate, setMeetingTemplate] = useState<any>(null)
  const meetingTemplateRef = useRef(null)
  const [wordFields, setWordFields] = useState([])
  const wordFieldsRef = useRef([])

  const $_setStorage = async () => {
    const mt = meetingTemplateRef.current
    // 1) 如果 mt 還沒來，就不要存
    if (!mt?.id) {
      Alert.alert(t('資料載入中，請稍後再試'))
      return
    }
    // 2) word fields 由 meeting_template_items 整理取得
    let wf = wordFieldsRef.current || []
    if (!wf.length) {
      wf = normalizeWordFields(mt?.meeting_template_items ?? [])
      console.log(wf, 'wf--')
      setWordFields(wf)
      wordFieldsRef.current = wf
    }
    // 3) attach / items 用 null 保底（避免 undefined 被 stringify 吃掉）
    const meetingTemplateItems = (mt?.meeting_template_items ?? []).map((item, index) => {
      if (!item || typeof item !== 'object') return item
      const sequence = String(index + 1).padStart(4, '0')
      return { ...item, sequence }
    })
    console.log(JSON.stringify(meetingTemplateItems), 'meetingTemplateItems')
    const _file_attaches = {
      file: mt?.attach?.file ?? null,
      file_version: mt?.attach?.file_version ?? null,
      word_fields: wf ?? [],
      meeting_template_items: meetingTemplateItems,
    }
    const _meetingTemplate = {
      ...mt,
      file_attaches: [_file_attaches],
    }
    await AsyncStorage.setItem('PDFToolAdminTemplateEdit', JSON.stringify(_meetingTemplate))
  }

  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerLeft: () => {
        return (
          <WsIconBtn
            testID="backButton"
            name="ws-outline-arrow-left"
            color="white"
            size={24}
            style={{ marginRight: 4 }}
            onPress={() => {
              navigation.goBack()
            }}
          />
        )
      },
      headerRight: () => {
        if (!canManageTemplateMenu) return null
        return (
          <>
            <WsIconBtn
              name="ws-outline-edit-pencil"
              size={24}
              color={$color.white}
              style={{
                marginRight: 4
              }}
              onPress={async () => {
                await $_setStorage()
                setIsBottomSheetActive(true)
              }}
            />
          </>
        )
      },
    })
  }

  // 去重 + 依 sequence 排序（避免你資料中 customerName 重複）
  const normalizeWordFields = (raw = []) => {
    const seen = new Set()
    return (Array.isArray(raw) ? raw : [])
      .filter(f => {
        const key = f?.value
        if (!key) return false
        if (seen.has(key)) return false
        seen.add(key)
        return true
      })
      .sort((a, b) => String(a?.sequence || '').localeCompare(String(b?.sequence || '')))
  }

  const $_fetchMeetingTemplate = async () => {
    try {
      const res = await S_MeetingTemplate.show({ modelId: id })
      const _template = {
        ...res,
        file_attachs: [res?.attach]
      }
      setMeetingTemplate(_template)
      if (res) {
        const fields = normalizeWordFields(res?.meeting_template_items ?? [])
        setWordFields(fields)
      }
    } catch (e) {
      console.log(e, 'fetch meeting_template failed')
    }
  }

  const [dialogVisible, setDialogVisible] = React.useState(false)
  const [isBottomSheetActive, setIsBottomSheetActive] = useState(false)
  const canUpdateTemplate =
    Array.isArray(currentUserScope) &&
    currentUserScope.includes('meeting-template-update')
  const canDestroyTemplate =
    Array.isArray(currentUserScope) &&
    currentUserScope.includes('meeting-template-destroy')
  const canCreateTemplate =
    Array.isArray(currentUserScope) &&
    currentUserScope.includes('meeting-template-create')
  const canManageTemplateMenu =
    canCreateTemplate || canUpdateTemplate || canDestroyTemplate
  const bottomSheetItems = React.useMemo(
    () => [
      canUpdateTemplate && {
        to: {
          name: 'PDFToolAdminTemplateEdit',
          params: {
            id: id,
          },
        },
        icon: 'ws-outline-edit-pencil',
        label: t('編輯範本'),
      },
      canDestroyTemplate && {
        onPress: () => {
          setDialogVisible(true)
        },
        color: $color.danger,
        labelColor: $color.danger,
        icon: 'ws-outline-delete',
        label: t('刪除範本'),
      },
    ].filter(Boolean),
    [canDestroyTemplate, canUpdateTemplate, id, t],
  )
  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
    }
  }

  useEffect(() => {
    $_fetchMeetingTemplate()
    $_setNavigationOption()
  }, [id])

  useEffect(() => {
    meetingTemplateRef.current = meetingTemplate
  }, [meetingTemplate])

  useEffect(() => {
    wordFieldsRef.current = wordFields
  }, [wordFields])



  const renderVariableItem = ({ item }: { item: any }) => {
    const fieldName =
      item?.meeting_template_field?.name ??
      item?.meeting_template_field?.value ??
      ''

    const onCopy = () => {
      const rawValue = item?.value ?? ''
      Clipboard.setString(rawValue)
      Alert.alert(t('已成功複製'))
    }

    return (
      <View style={{ marginHorizontal: 16, marginTop: 12 }}>
        <WsCard
          borderRadius={12}
          style={{
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderWidth: 1,
            borderColor: $color.gray,
          }}
        >
          {/* 第 1 行：變數 + copy */}
          <WsFlex alignItems="center" style={{ marginBottom: 6 }}>
            <WsText size={14} style={{ width: 108 }}>
              {t('變數')}
            </WsText>

            <WsText size={14}>{item?.value ?? ''}</WsText>

            <TouchableOpacity style={{ marginLeft: 8 }} onPress={onCopy}>
              <WsIcon name="md-content-copy" size={20} color={$color.primary} />
            </TouchableOpacity>
          </WsFlex>

          {/* 第 2 行：名稱 */}
          <WsFlex alignItems="center" style={{ marginBottom: 4 }} flexWrap={'wrap'}>
            <WsText size={14} style={{ width: 108 }}>
              {t('名稱')}
            </WsText>
            <WsText size={14}>
              {item?.name ?? ''}
            </WsText>
          </WsFlex>

          <View
            style={{
              marginTop: 8
            }}
          >
            <WsInfo
              value={fieldName}
              label={t('對應ESGoal欄位')}
              style={{
              }}
            />
          </View>

        </WsCard>
      </View>
    )
  }

  return (
    <>
      {!meetingTemplate ? (
        <View style={{ paddingHorizontal: 16, paddingTop: 8 }}>
          <WsSkeleton />
        </View>
      ) : (
        <FlatList
          data={meetingTemplate?.meeting_template_items ?? []}
          keyExtractor={(item: any) => item.id}
          renderItem={renderVariableItem}
          ListHeaderComponent={() => (
            <>
              <WsPaddingContainer style={{ paddingTop: 8, paddingBottom: 8 }}>
                <WsText size={24}>
                  {meetingTemplate?.name ?? t('使用者​自訂格式​範本​名​稱')}
                </WsText>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    marginVertical: 8
                  }}>
                  <WsAvatar size={36} source={meetingTemplate?.updated_user?.avatar} />
                  <View
                    style={{
                      marginLeft: 8
                    }}>
                    <WsText color={$color.gray} size={12}>{t(meetingTemplate?.updated_user?.name)}</WsText>
                    <WsText color={$color.gray} size={12}>
                      {t('編輯時間')} {moment(meetingTemplate?.updated_at).format('YYYY-MM-DD HH:mm:ss')}
                    </WsText>
                  </View>
                </View>
              </WsPaddingContainer>

              <WsPaddingContainer
                padding={0}
                style={{
                  paddingTop: 16,
                  paddingBottom: 16,
                  paddingHorizontal: 16,
                  backgroundColor: $color.white,
                  zIndex: 1
                }}
              >
                <View style={{}}>
                  <WsInfo
                    labelWidth={100}
                    label={t('類型')}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                    value={meetingTemplate?.meeting_template_type?.name}
                  />
                </View>

                {/* 範本檔案 */}
                <View style={{ marginTop: 8 }}>
                  <WsInfo label={t('範本')} type="filesAndImages" value={meetingTemplate?.file_attachs} />
                </View>

                {/* 標籤 */}
                <View style={{ marginTop: 8 }}>
                  <WsInfo type="tags" value={meetingTemplate?.factory_tags} />
                </View>

                <View style={{ marginTop: 8 }}>
                  <WsInfo
                    label={t('備註')}
                    value={meetingTemplate?.remark}
                  />
                </View>
              </WsPaddingContainer>

              <WsPaddingContainer
                padding={0}
                style={{
                  paddingTop: 8,
                  paddingHorizontal: 16,
                }}
              >
                <WsText size={14} fontWeight={500}>
                  {t('標記設定')}
                </WsText>
              </WsPaddingContainer>
            </>
          )}
          ListEmptyComponent={() => (
            <WsPaddingContainer>
              <WsText color={$color.gray}>{t('尚無標記')}</WsText>
            </WsPaddingContainer>
          )}
          ListFooterComponent={() => <View style={{ height: 50 }} />}
        />
      )}


      <WsPopup
        active={popupDelete}
        onClose={() => {
          setPopupDelete(false)
        }}
      >
        <View
          style={{
            width: width * 0.9,
            height: height * 0.2,
            backgroundColor: $color.white,
            borderRadius: 10,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <WsText
            size={18}
            color={$color.black}
            style={{
              position: 'absolute',
              left: 16,
              top: 16,
            }}
          >
            {t('確定要刪除嗎？')}
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
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                width: 110,
                alignItems: 'center',
              }}
              onPress={() => {
                setPopupDelete(false)
              }}
            >
              <WsText
                style={{
                  padding: 1,
                }}
                size={14}
                color={$color.gray}
              >
                {t('取消')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              style={{
                width: 110,
              }}
              onPress={() => {
                setPopupDelete(false)
              }}
            >
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>

      <WsBottomSheet
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        items={bottomSheetItems}
        snapPoints={[150, 208]}
        onItemPress={$_onBottomSheetItemPress}
      />
      <WsDialogDelete
        id={id}
        to="PDFToolAdminIndex"
        toTabIndex={1}
        modelName="meeting_template"
        visible={dialogVisible}
        text={t('確定刪除嗎？')}
        setVisible={setDialogVisible}
      />
    </>
  )
}

export default PDFToolAdminTemplateShow
