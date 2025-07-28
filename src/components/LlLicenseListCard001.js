import React from 'react'
import { Pressable, View } from 'react-native'
import {
  WsCard,
  WsFlex,
  WsText,
  WsIcon,
  WsDes,
  WsFastImage,
  LlNumCard001
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlLicenseListCard001 = props => {
  const { t, i18n } = useTranslation()
  // Props
  const {
    icon,
    title,
    licenseNum,
    licenseDelay,
    licenseConduct,
    licenseUsing,
    licensePause,
    onPress,
    style
  } = props

  return (
    <>
      <Pressable onPress={onPress}>
        <WsCard
          padding={0}
          style={[
            {
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2
              },
              borderRadius: 10,
              shadowRadius: 4,
              shadowOpacity: 0.25,
              elevation: 2
            },
            style
          ]}>
          <WsFlex
            justifyContent="center"
            flexDirection="column"
            style={{
              width: '100%',
              marginTop: 16
            }}
          >

            {icon && (
              <WsFastImage widthLoad={30} heightLoad={30} source={icon} isUri={true} />
            )}
            <WsText
              size={18}
              style={{
                paddingHorizontal: 16
                // flex: 1,
              }}>
              {title}
            </WsText>

          </WsFlex>
          <WsFlex
            justifyContent="space-between"
            style={{
              width: '100%',
              padding: 20
            }}>
            <LlNumCard001
              text={t('逾期')}
              num={licenseDelay}
              backgroundColor={$color.danger11l}
            />
            <LlNumCard001
              text={t('辦理中')}
              backgroundColor={$color.yellow11l}
              num={licenseConduct}
            />
            <LlNumCard001
              text={t('使用中')}
              backgroundColor={$color.primary11l}
              num={licenseUsing}
            />
            <LlNumCard001
              text={t('已停用')}
              backgroundColor={$color.white2d}
              num={licensePause}
            />
          </WsFlex>
          <WsFlex
            justifyContent="center"
            style={{
              backgroundColor: $color.primary10l,
              marginVertical: 16,
              height: 72,
              paddingHorizontal: 60
            }}>
            <View
              style={{
                alignItems: 'center'
              }}>
              <WsDes>{t('證照數')}</WsDes>
              <WsText>{licenseNum}</WsText>
            </View>
          </WsFlex>
          <WsFlex
            justifyContent="center"
            style={{
              width: '100%',
              marginBottom: 16,
              paddingLeft: 32
            }}>
            <WsText size={14} color={$color.gray2l}>
              {t('查看')}
            </WsText>
            <WsIcon
              size={24}
              name="md-chevron-right"
              color={$color.gray2l}
              style={{
                marginLeft: 8
              }}
            />
          </WsFlex>
        </WsCard>
      </Pressable>
    </>
  )
}

export default LlLicenseListCard001
