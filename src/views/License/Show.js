import React, { useCallback } from 'react'
import {
  ScrollView,
  Text,
  View,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Alert
} from 'react-native'
import AsyncStorage from '@react-native-community/async-storage'
import {
  WsFlex,
  WsText,
  WsPaddingContainer,
  WsInfo,
  WsIconBtn,
  WsBottomSheet,
  WsDialogDelete,
  WsModal,
  WsVersionHistory,
  LlLicenseHeaderCard001,
  LlBtn002,
  WsCardPassage,
  WsIcon,
  WsBtn,
  WsStateInput,
  WsCollapsible,
  WsInfoUser,
  WsAvatar,
  WsState,
  WsTag,
  WsTabView
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_License from '@/services/api/v1/license'
import licenseFields from '@/models/license'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import store from '@/store'
import { useSelector } from 'react-redux'
import { setCurrentLicense } from '@/store/data'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import i18next from 'i18next'
import { WsSkeleton } from '@/components'
import {
  setRefreshCounter,
} from '@/store/data'
import LicenseOverview from '@/sections/License/LicenseOverview'
import RetrainingTimeRecordList from '@/sections/License/RetrainingTimeRecordList'

const LicenseShow = ({ route, navigation }) => {
  const { t, i18n } = useTranslation()
  const _stack = navigation.getState().routes

  // Params
  const { id, type, refreshKey } = route.params

  // States
  const [license, setLicense] = React.useState()
  const [licenseLastVersionId, setLicenseLastVersionId] = React.useState()

  const [index, setIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState([
    {
      value: 'LicenseOverview',
      label: t('總覽'),
      view: LicenseOverview,
      props: {
        id: id,
      }
    },
    {
      value: 'RetrainingTimeRecordList',
      label: t('回訓記錄列表'),
      view: RetrainingTimeRecordList,
      props: {
        tabIndex: index,
      }
    },
  ])

  const $_setTabItems = () => {
    setTabItems([
      {
        value: 'LicenseOverview',
        label: t('總覽'),
        view: LicenseOverview,
        props: {
          id: id,
          refreshKey: refreshKey
        }
      },
      {
        value: 'RetrainingTimeRecordList',
        label: t('回訓記錄列表'),
        view: RetrainingTimeRecordList,
        props: {
          id: id,
          license: license,
          licenseLastVersionId: licenseLastVersionId,
          tabIndex: index,
          refreshKey: refreshKey
        }
      },
    ])
  }

  // Services
  const $_fetchLicense = async () => {
    try {
      const res = await S_License.show({ modelId: id })
      setLicense(res)
      if (res?.last_version?.id) {
        setLicenseLastVersionId(res.last_version.id)
      }
    } catch (e) {
      console.error(e);
    }
  }

  React.useEffect(() => {
    $_fetchLicense()
  }, [route])

  React.useEffect(() => {
    if (license && licenseLastVersionId) {
      $_setTabItems()
    }
  }, [license, licenseLastVersionId, refreshKey])

  return (
    <>
      {tabItems &&
        type &&
        type.name &&
        (type.name.includes('複訓') || type.name.includes('回訓')) ? (
        <WsTabView
          scrollEnabled={true}
          items={tabItems}
          index={index}
          isAutoWidth={true}
          setIndex={setIndex}
        />
      ) : (
        <LicenseOverview
          id={id}
          refreshKey={refreshKey}
        ></LicenseOverview>
      )}
    </>
  )
}
export default LicenseShow
