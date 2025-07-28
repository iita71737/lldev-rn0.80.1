import React from 'react'
import { ScrollView, Pressable, View, Dimensions } from 'react-native'
import {
  WsPaddingContainer,
  WsEmpty,
  WsBtn,
  LlContractorLicenseCard001,
  WsGradientButton
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { WsSkeleton } from '@/components'

const ContractorsLicense = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Props
  const { contractor, navigation, contractorLicenses } = props

  // Render
  return (
    <>
      {contractor &&
        contractorLicenses &&
        contractorLicenses.length != 0 && (
          <>
            <ScrollView
              testID={'ScrollView'}
            >
              <WsPaddingContainer>
                {contractorLicenses.map((license, licenseIndex) => {
                  return (
                    <LlContractorLicenseCard001
                      testID={`LlContractorLicenseCard001-${licenseIndex}`}
                      key={licenseIndex}
                      license={license}
                      style={[licenseIndex != 0 ? { marginTop: 16 } : null]}
                      onPress={() => {
                        navigation.navigate({
                          name: 'ContractorsLicenseShow',
                          params: {
                            id: license.id,
                            license: license,
                            contractor: contractor
                          }
                        })
                      }}
                    />
                  )
                })}
              </WsPaddingContainer>
            </ScrollView>
          </>
        )}
        
      {contractor &&
        contractorLicenses &&
        contractorLicenses.length == 0 && (
          <>
            <View>
              <WsEmpty
                emptyTitle={t('目前尚無資料')}
              />
            </View>
          </>
        )}

      {!contractorLicenses && (
        <WsSkeleton></WsSkeleton>
      )}

      {/* 230913-HIDDEN */}
      {/* <WsPaddingContainer
        padding={0}
        style={{
          width: width,
          position: 'absolute',
          bottom: 0
        }}>
        <WsGradientButton
          borderRadius={30}
          style={{
            marginTop: 24
          }}
          onPress={() => {
            navigation.navigate({
              name: 'ContractorsLicensePickTypeTemplate',
              params: {
                contractorId: contractor.id,
                contractor: contractor
              }
            })
          }}>
          {t('新增資格證')}
        </WsGradientButton>
      </WsPaddingContainer> */}
    </>
  )
}

export default ContractorsLicense
