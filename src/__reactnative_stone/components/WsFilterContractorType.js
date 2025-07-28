import React from 'react'
import { Pressable, View, TouchableOpacity } from 'react-native'
import { WsText, WsNavCheck, WsFlex } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

const WsFilterContractorType = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const { value, onChange, name } = props

  // Redux
  const contractorTypes = useSelector(state => state.data.contractorTypes)

  // Render
  return (
    <>
      <View>
        <WsFlex
          style={{
            padding: 16
          }}>
          <WsText
            color={$color.black}
            size={14}
            style={{
              flex: 1
            }}
            fontWeight="700">
            {t('承攬類別')}
          </WsText>
          <WsFlex>
            <TouchableOpacity
              onPress={() => {
                // $_onSystemClassSelectAll(systemClass)
              }}>
              <WsText color={$color.primary} size="14">
                {t('全選')}
              </WsText>
            </TouchableOpacity>
            <WsText
              color={$color.primary}
              size="14"
              style={{
                paddingLeft: 16,
                paddingRight: 16
              }}>
              |
            </WsText>
            <TouchableOpacity
              onPress={() => {
                // $_onSystemClassClearAll(systemClass)
              }}>
              <WsText color={$color.primary} size="14">
                {t('全取消')}
              </WsText>
            </TouchableOpacity>
          </WsFlex>
        </WsFlex>
        {contractorTypes.map((contractorType, contractorTypeIndex) => {
          return (
            <WsNavCheck
              onChange={$event => {
              }}
              key={`${contractorType} -${contractorTypeIndex} `}>
              {contractorType.name}
            </WsNavCheck>
          )
        })}
      </View>
    </>
  )
}
export default WsFilterContractorType
