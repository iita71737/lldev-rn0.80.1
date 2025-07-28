import React from 'react'
import { View, Pressable } from 'react-native'
import {
  WsFlex,
  WsText,
  WsInfoLink,
  WsInfoImage,
  WsInfoImages,
  WsInfoFile,
  WsInfoFiles,
  WsInfoUser,
  WsInfoUsers,
  WsInfoStatus,
  WsInfoBelongsto,
  WsIcon,
  WsInfoText,
  WsInfoPhone,
  WsInfoEmail,
  WsPaddingContainer
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const WsStateInfo = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    type = 'text',
    label,
    style,
    value,
    text,
    fileType,
    color,
    iconColor,
    titleMarginBottom = 16,
    infoMarginBottom = 0,
    icon,
    labelIcon,
    iconSize = 22,
    isUri,
    onPress,
    nameKey,
    labelBtnText,
    labelBtnOnPress,
    des
  } = props

  // Render
  return (
    <>
      <WsPaddingContainer
        style={{
          backgroundColor: $color.primary11l,
          borderRadius: 10
        }}>
        <WsFlex
          style={{
            marginBottom: infoMarginBottom
          }}>
          {icon && (
            <WsIcon
              name={icon}
              size={iconSize}
              color={iconColor}
              style={{
                marginRight: 8
              }}
            />
          )}
          {(type == 'text' || type == 'date' || type == 'email') && (
            <WsInfoText color={color}>
              {type == 'date'
                ? moment(value).format('YYYY-MM-DD')
                : value
                  ? value
                  : t('無')}
            </WsInfoText>
          )}
          {type == 'link' && (
            <WsInfoLink
              value={value}
              text={text}
              onPress={onPress}
              icon={icon}
            />
          )}
          {type == 'file' && (
            <WsInfoFile fileName={text} fileType={fileType} value={value} />
          )}
          {type == 'files' && <WsInfoFiles value={value} />}
          {type == 'image' && (
            <WsInfoImage fileName={text} fileType={fileType} value={value} />
          )}
          {type == 'images' && <WsInfoImages value={value} />}
          {type == 'user' && (
            <WsInfoUser value={value} isUri={isUri} des={des} />
          )}
          {type == 'users' && (
            <WsInfoUsers value={value} isUri={isUri} des={des} />
          )}
          {type == 'status' && <WsInfoStatus value={value} />}
          {type == 'belongsto' && (
            <WsInfoBelongsto
              value={value}
              nameKey={nameKey}
              onPress={onPress}
            />
          )}
          {type == 'tel' && (
            <WsInfoPhone value={value} color={color}>
              {text}
            </WsInfoPhone>
          )}
          {type == 'email' && (
            <WsInfoEmail value={value} color={color}>
              {text}
            </WsInfoEmail>
          )}
        </WsFlex>
      </WsPaddingContainer>
    </>
  )
}

export default WsStateInfo
