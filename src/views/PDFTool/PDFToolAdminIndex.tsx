import React from 'react'
import { WsPage, WsTabView, WsBottomSheet } from '@/components'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import PDFToolList from '@/views/PDFTool/PDFToolList'
import PDFToolTemplateList from '@/views/PDFTool/PDFToolTemplateList'
import AsyncStorage from '@react-native-community/async-storage'

const PDFToolAdminIndex = (props) => {
  const { t } = useTranslation()
  const navigation = useNavigation()

  const initTabIndex =
  props?.route?.params?.initTabIndex ??
  props?.route?.params?._tabIndex ??
  0

  // States
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [bottomSheetItems, setBottomSheetItems] = React.useState([])
  const currentUserScope = useSelector(state => state.data.userScopes)
  const canReadMeeting =
    Array.isArray(currentUserScope) &&
    currentUserScope.includes('meeting-read')
  const canReadMeetingTemplate =
    Array.isArray(currentUserScope) &&
    currentUserScope.includes('meeting-template-read')
  const canCreateMeeting =
    Array.isArray(currentUserScope) &&
    currentUserScope.includes('meeting-create')
  const canUpdateMeeting =
    Array.isArray(currentUserScope) &&
    (currentUserScope.includes('meeting-update') ||
      currentUserScope.includes('meeting-update-owner'))
  const canDestroyMeeting =
    Array.isArray(currentUserScope) &&
    (currentUserScope.includes('meeting-destroy') ||
      currentUserScope.includes('meeting-destroy-owner'))
  const canCreateMeetingTemplate =
    Array.isArray(currentUserScope) &&
    currentUserScope.includes('meeting-template-create')
  const canUpdateMeetingTemplate =
    Array.isArray(currentUserScope) &&
    currentUserScope.includes('meeting-template-update')
  const canDestroyMeetingTemplate =
    Array.isArray(currentUserScope) &&
    currentUserScope.includes('meeting-template-destroy')
  // Tabs
  const [tabIndex, settabIndex] = React.useState(initTabIndex)
  const tabItems = React.useMemo(
    () =>
      [
        canReadMeeting && {
          value: 'PDFToolList',
          label: i18next.t('議事'),
          view: PDFToolList,
          props: {},
        },
        canReadMeetingTemplate && {
          value: 'PDFToolTemplateList',
          label: i18next.t('範本'),
          view: PDFToolTemplateList,
          props: {},
        },
      ].filter(Boolean),
    [canReadMeeting, canReadMeetingTemplate],
  )

  // Storage
  const $_clearStorage = async () => {
    await AsyncStorage.removeItem('PDFToolAdminCreateTemplate')
  }
  // Bottom Sheet
  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
    }
  }
  // Bottom Sheet
  const $_setBottomSheet = () => {
    if (tabIndex == 0) {
      setBottomSheetItems([
        {
          to: {
            name: 'PDFToolAdminCreate',
            params: {
            }
          },
          icon: 'md-add',
          label: t('新增議事')
        }
      ])
    } else if (tabIndex == 1) {
      setBottomSheetItems([
        canCreateMeetingTemplate && {
          onPress: () => {
            $_clearStorage()
            navigation.push('RoutesPDFTool', {
              screen: 'PDFToolAdminCreateTemplate',
            })
          },
          icon: 'md-add',
          label: t('新增範本')
        }
      ].filter(Boolean))
    }
  }

  React.useEffect(() => {
    $_setBottomSheet()
  }, [tabIndex, canCreateMeetingTemplate])

  React.useEffect(() => {
    if (tabIndex >= tabItems.length) {
      settabIndex(0)
    }
  }, [tabIndex, tabItems.length])

  React.useEffect(() => {
    const maxIndex = tabItems.length ? tabItems.length - 1 : 0
    const safeIndex = Math.min(initTabIndex, maxIndex)
    settabIndex(safeIndex)
  }, [initTabIndex, tabItems.length])


  return (
    <>
      <WsPage
        title={t('議事管理')}
        showRightBtn={true}
        iconRight={
          tabIndex === 0
            ? (canCreateMeeting || canUpdateMeeting || canDestroyMeeting ? 'md-add' : undefined)
            : tabIndex === 1
              ? (canCreateMeetingTemplate || canUpdateMeetingTemplate || canDestroyMeetingTemplate
                ? 'md-add'
                : undefined)
              : undefined
        }
        rightOnPress={async () => {
          setIsBottomSheetActive(true)
        }}
      >
        <WsTabView
          index={tabIndex}
          setIndex={settabIndex}
          items={tabItems}
          isAutoWidth={true}
        />
      </WsPage>

      <WsBottomSheet
        snapPoints={[168, 148]}
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        items={bottomSheetItems}
        onItemPress={$_onBottomSheetItemPress}
      />
    </>
  )
}

export default PDFToolAdminIndex
