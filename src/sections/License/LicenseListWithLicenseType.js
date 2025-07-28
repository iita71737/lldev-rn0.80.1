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
  } = props

  const currentFactory = useSelector(state => state.data.currentFactory)

  // States
  const [licenseWithTemplate, setLicenseWithTemplate] = React.useState()

  // Services
  const $_fetchLicenseWithTemplate = async () => {
    const _res = await S_License.indexAll({})
    const templates = await S_LicenseTemplate.index({
      parentId: currentFactory.id,
      params: {
        system_subclasses: systemSubclass,
        license_type: type
      }
    })
    const res = S_License.getLicenseNumWithTemplate(templates.data, _res.data)
    setLicenseWithTemplate(res)
  }

  React.useEffect(() => {
    $_fetchLicenseWithTemplate()
  }, [])

  return (
    <ScrollView>
      {licenseWithTemplate && (
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
                      navigation.push('IndexWithTemplate',{
                          templateId: template.id,
                          name: template.name,
                          systemSubclass: systemSubclass,
                          type: type,
                          licenseDelay: template.licenseDelay,
                          licenseConduct: template.licenseConduct,
                          licenseUsing: template.licenseUsing,
                          licensePause: template.licensePause,
                      })
                    }}
                  ></LlLicenseListCard001>
                </WsPaddingContainer>
              )
            }}
          />
        </>
      )}
    </ScrollView>
  )
}
export default LicenseListWithLicenseType