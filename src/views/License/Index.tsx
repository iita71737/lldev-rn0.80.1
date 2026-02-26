import React from 'react'
import {
  ScrollView,
  View,
  Dimensions
} from 'react-native'
import {
  WsText,
  WsState,
  WsPage,
  WsSkeleton,
  LlLicenseHeaderNumCard,
  WsPage002,
  WsGrid
} from '@/components'
import LicenseList from '@/sections/License/LicenseList'
import LicenseCalendarList from '@/sections/License/LicenseCalendarList'
import LicenseListWithSystemClasses from '@/sections/License/LicenseListWithSystemClasses'
import { useTranslation } from 'react-i18next'
import LicenseTemplateList from '@/sections/License/LicenseTemplateList'
import S_LicenseType from '@/services/api/v1/license_type'
import { useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux'
import { HeaderHeightContext } from '@react-navigation/elements';
import { useHeaderHeight } from '@react-navigation/elements';
interface LicenseIndexProps {
  route: any;
}

interface ToggleTab {
  value: string;
  label: string;
  view: React.FC<any>;
  props: any;
}

const LicenseIndex: React.FC<LicenseIndexProps> = ({ route }) => {
  const { width } = Dimensions.get('window')
  const { t } = useTranslation()

  const _tabIndex = route?.params?.tabIndex

  // State
  const [tabIndex, setTabIndex] = React.useState(_tabIndex ? _tabIndex : 0)
  const [toggleTabs, setToggleTabs] = React.useState<ToggleTab[]>([
    {
      value: 'licenseList',
      label: t('證照列表'),
      view: LicenseList,
      props: {
      }
    },
    {
      value: 'calendarList',
      label: t('行事曆'),
      view: LicenseCalendarList,
      props: {
      }
    },
    {
      value: 'licenseListWithSystemClasses',
      label: t('證照清單'),
      view: LicenseListWithSystemClasses,
      props: {
      }
    },
    {
      value: 'licenseTemplateList',
      label: t('證照公版'),
      view: LicenseTemplateList,
      props: {
      }
    }
  ])

  return (
    <>
      <WsPage002
        tabItems={toggleTabs}
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
      >
      </WsPage002>
    </>
  )
}

export default LicenseIndex
