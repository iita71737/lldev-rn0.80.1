import React from 'react'
import { View, ScrollView, FlatList } from 'react-native'
import {
  WsText,
  WsFilter,
  WsPaddingContainer,
  LlLicenseListCard001,
  LlBtn002,
  WsPageIndex,
  WsIconBtn
} from '@/components'
import S_License from '@/services/api/v1/license'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { WsSkeleton } from '@/components'

interface ActChangeReportProps {
  searchValue?: string;
}

const LicenseListWithSystemClasses = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const {
    searchValue,
  } = props

  // Redux
  const systemClasses = useSelector(state => state.data.systemClasses)

  // States
  const [params] = React.useState({
    get_all: 1
  })
  const [filterFields] = React.useState({
    system_subclasses: {
      type: 'system_subclass',
      label: i18next.t('領域')
    }
  })
  const [licensesWithSystemSubclasses, setLicensesWithSystemSubclasses] = React.useState()

  // Services
  const $_fetchLicenses = async () => {
    const _params = {
      get_all: 1
    }
    const res = await S_License.index({ params: _params })
    const _licenseNum = S_License.getLicenseNumWithSystemSubclasses(
      systemClasses,
      res.data
    )
    setLicensesWithSystemSubclasses(_licenseNum)
  }

   // Options
    const $_setNavigationOption = () => {
      navigation.setOptions({
        headerRight: () => null,
        headerLeft: () => {
          return (
            <WsIconBtn
              testID={"backButton"}
              name="ws-outline-arrow-left"
              color="white"
              size={24}
              style={{
                marginRight: 4
              }}
              onPress={() => {
                navigation.goBack()
              }}
            />
          )
        }
      })
    }
  
  
    React.useEffect(() => {
      // 顯示或隱藏新增功能
      $_setNavigationOption()
    }, [])

  React.useEffect(() => {
    $_fetchLicenses()
  }, [])

  return (
    <>
      {licensesWithSystemSubclasses &&
        licensesWithSystemSubclasses != undefined &&
        licensesWithSystemSubclasses.length > 0 ? (
        <>
          <WsPageIndex
            mode={'system_classes'}
            data={licensesWithSystemSubclasses}
            params={params}
            extendParams={searchValue}
            filterFields={filterFields}
            searchVisible={false}

            renderItem={({ item: systemSubclass, index: systemSubclassIndex, _params }) => {
              return (
                <View
                  key={systemSubclassIndex}
                  style={{
                    padding: 16,
                  }}>
                  <LlLicenseListCard001
                    title={t(systemSubclass.name)}
                    icon={systemSubclass.icon}
                    licenseNum={systemSubclass.licenseNum}
                    licenseConduct={systemSubclass.licenseConduct}
                    licenseUsing={systemSubclass.licenseUsing}
                    licenseDelay={systemSubclass.licenseDelay}
                    licensePause={systemSubclass.licensePause}
                    style={{ marginTop: 8 }}
                    onPress={() => {
                      
                      navigation.push('IndexWithLicenseType', {
                        id: systemSubclass.id
                      })
                    }}
                  />
                </View>
              )
            }}
          >
          </WsPageIndex>
        </>
      ) : (
        <WsSkeleton></WsSkeleton>
      )}
    </>
  )
}
export default LicenseListWithSystemClasses
