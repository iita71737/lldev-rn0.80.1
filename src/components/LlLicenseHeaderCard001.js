import React from 'react'
import { Image, Dimensions, View } from 'react-native'
import {
  WsAvatar,
  WsFlex,
  WsTag,
  WsPaddingContainer,
  WsText,
  WsInfoImage
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlLicenseHeaderCard001 = props => {
  const { t, i18n } = useTranslation()
  // Props
  const {
    title,
    license,
    update,
    img,
    systemSubclasses = [],
    showFields,
    lastEditUserImg,
    lastEditUserName,
  } = props

  // Variable
  const windowWidth = Dimensions.get('window').width
  const windowHeight = Dimensions.get('window').height

  // Function
  const $_isShowFields = fields => {
    return showFields.includes(fields)
  }

  return (
    <>
      <WsPaddingContainer
        style={{
          backgroundColor: $color.white
        }}>
        <WsFlex
          style={{
            border: 0,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start'
          }}>
          <WsFlex
            style={{
              width: 'auto'
            }}>
            {license.last_version &&
              license.last_version.valid_end_date &&
              moment().isAfter(license.last_version?.valid_end_date) && (
                <WsTag
                  textColor={$color.danger}
                  backgroundColor={$color.danger11l}
                  style={{
                    width: 'auto',
                    margin: 2
                  }}>
                  {t('逾期')}
                </WsTag>
              )}
            {license.last_version?.license_status_number == 0 && (
              <WsTag
                textColor={$color.gray3d}
                backgroundColor={$color.yellow11l}
                style={{
                  width: 'auto',
                  margin: 2
                }}>
                {t('辦理中')}
              </WsTag>
            )}
            {license.last_version?.using_status == 0 && (
              <WsTag
                textColor={$color.gray}
                backgroundColor={$color.white2d}
                style={{
                  width: 'auto',
                  margin: 2
                }}>
                {t('已停用')}
              </WsTag>
            )}
          </WsFlex>
          <WsText
            size={24}
            style={{
              marginTop: 8,
              marginBottom: 4,
              flex: 1
            }}>
            {title}
          </WsText>
        </WsFlex>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginVertical: 8
          }}>
          <WsAvatar size={36} source={lastEditUserImg} />
          <View
            style={{
              marginLeft: 8
            }}>
            <WsText color={$color.gray} size={12}>{t(lastEditUserName)}</WsText>
            <WsText color={$color.gray} size={12}>
              {t('編輯時間')} {moment(update).format('YYYY-MM-DD HH:mm:ss')}
            </WsText>
          </View>
        </View>
      </WsPaddingContainer>
      {img && (
        <>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              paddingHorizontal: 8,
            }}>
            <WsInfoImage height={200} width={windowWidth - 16} value={img} />
          </View>
        </>
      )}
    </>
  )
}

export default LlLicenseHeaderCard001
