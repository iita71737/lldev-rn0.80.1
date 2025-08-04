import React from 'react';
import {
  View,
  ScrollView,
  FlatList
} from 'react-native'
import {
  WsText,
  WsFilter,
  WsPaddingContainer,
  LlLicenseListCard001,
  LlBtn002,
  WsSkeleton
} from '@/components'
import S_License from '@/services/api/v1/license'
import S_LicenseTemplate from '@/services/api/v1/license_templates'
import { useSelector } from 'react-redux'

const LicenseListWithLicenseType = (props) => {
  // Props
  const {
    type,
    navigation,
    systemSubclass,
    typeName
  } = props

  const currentFactory = useSelector(state => state.data.currentFactory)

  // States
  const [loading, setLoading] = React.useState(true)
  const [licenseWithTemplate, setLicenseWithTemplate] = React.useState()

  // Services
  const $_fetchLicenseWithTemplate = async () => {
    const _res = await S_License.indexAll({})
    const _params = {
      system_subclasses: systemSubclass,
      license_type: type
    }
    const _templates = await S_LicenseTemplate.index({ params: _params })
    const res = S_License.getLicenseNumWithTemplate(_templates.data, _res.data, typeName)
    setLicenseWithTemplate(res)
    setLoading(false)
  }

  const $_fetchLicense = async () => {
    const _res = await S_License.indexAll({})
    const _params = {
      system_subclasses: systemSubclass,
      license_type: type
    }
    const _templates = await S_License.index({ params: _params })
    const res = S_License.getLicenseNumWithTemplate(_templates.data, _res.data, typeName)
    setLicenseWithTemplate(res)
    setLoading(false)
  }

  React.useEffect(() => {
    if (typeName === '其他') {
      $_fetchLicense()
    } else {
      $_fetchLicenseWithTemplate()
    }
  }, [])

  return (
    <ScrollView>
      {licenseWithTemplate && !loading ? (
        <>
          <FlatList
            data={licenseWithTemplate}
            keyExtractor={(item, index) => index}
            renderItem={({ item: template, index }) => {
              return (
                <WsPaddingContainer>
                  <LlLicenseListCard001
                    title={template.name}
                    licenseNum={template.licenseNum}
                    licenseConduct={template.licenseConduct}
                    licenseUsing={template.licenseUsing}
                    licenseDelay={template.licenseDelay}
                    licensePause={template.licensePause}
                    style={{
                      marginTop: 8,
                    }}
                    onPress={() => {
                      if (typeName === '其他') {
                        navigation.push('RoutesLicense', {
                          screen: 'LicenseShow',
                          params: {
                            id: template.id
                          }
                        })
                      } else {
                        navigation.push('IndexWithTemplate', {
                          templateId: template.id,
                          name: template.name,
                          systemSubclass: systemSubclass,
                          type: type,
                          licenseDelay: template.licenseDelay,
                          licenseConduct: template.licenseConduct,
                          licenseUsing: template.licenseUsing,
                          licensePause: template.licensePause,
                        })
                      }
                    }}
                  ></LlLicenseListCard001>
                </WsPaddingContainer>
              )
            }}
          />
        </>
      ) : (
        <WsSkeleton></WsSkeleton>
      )}
    </ScrollView>
  )
}
export default LicenseListWithLicenseType