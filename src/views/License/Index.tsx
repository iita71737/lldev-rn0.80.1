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
  const [numLoading, setNumLoading] = React.useState(true)
  const [licenseTypesCards, setLicenseTypesCards] = React.useState([])

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

  const $_fetchMeta = async () => {
    try {
      const _params = {}
      const res = await S_LicenseType.index({ params: _params })
      if (res && res.data) {
        setLicenseTypesCards(res.data)
        setNumLoading(false)
      }
    } catch (error) {
      console.error(error);
    }
  }

  React.useEffect(() => {
    $_fetchMeta()
  }, [route])

  return (
    <>
      <WsPage002
        tabItems={toggleTabs}
        tabIndex={tabIndex}
        setTabIndex={setTabIndex}
      >
        <View
          style={{
            width: width,
            padding: 16,
          }}
        >
          <WsGrid
            numColumns={2}
            data={licenseTypesCards}
            keyExtractor={item => item.name}
            renderItem={({ item, index }) => (
              <LlLicenseHeaderNumCard
                testID={item && item.name}
                numLoading={numLoading}
                text={item && item.name ? t(item.name) : null}
                icon={item && item.icon}
                num={item && item.licenses_count ? item.licenses_count : '...'}
                style={{
                  marginRight: 8
                }}
              />
            )}
          />
        </View>
      </WsPage002>
    </>
  )
}

export default LicenseIndex
