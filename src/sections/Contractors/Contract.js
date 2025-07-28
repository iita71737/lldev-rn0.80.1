import React from 'react'
import { ScrollView, Pressable, View, Dimensions } from 'react-native'
import {
  WsPaddingContainer,
  WsEmpty,
  LlContractCard001,
  WsGradientButton
} from '@/components'
import { useTranslation } from 'react-i18next'

const Contract = (props) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // Props
  const {
    contractor,
    navigation
  } = props

  // Render
  return (
    <>
      {contractor &&
        contractor.contracts &&
        contractor.contracts.length == 0 && (
          <>
            <WsEmpty
              emptyTitle={t('目前尚無資料')}
            />
          </>
        )}
      {contractor &&
        contractor.contracts &&
        contractor.contracts.length > 0 && (
          <>
            <ScrollView
              testID={'ScrollView'}
            >
              <WsPaddingContainer>
                {contractor.contracts.map((contract, contractIndex) => {
                  return (
                    <LlContractCard001
                      testID={`LlContractCard001-${contractIndex}`}
                      key={contractIndex}
                      contract={contract}
                      style={[contractIndex != 0 ? { marginTop: 16 } : null]}
                      onPress={() => {
                        navigation.navigate({
                          name: 'ContractorsContractShow',
                          params: {
                            id: contract.id
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
      {/* 230913-HIDDEN-暫時隱藏 */}
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
              name: 'ContractorsContractCreate',
              params: {
                contractor: contractor
              }
            })
          }}>
          {t('新增契約')}
        </WsGradientButton>
      </WsPaddingContainer> */}
    </>
  )
}

export default Contract
