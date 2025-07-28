import React from 'react'
import { View, Pressable, TouchableOpacity, Dimensions } from 'react-native'
import {
  WsFlex,
  WsText,
  WsCard,
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
  WsStateShowImage,
  WsStateListWithModal,
  WsStateAlertCard,
  WsInfoTags,
  WsInfoUsers002,
  WsInfoBelongstomany
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const WsInfo = props => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // Props
  const {
    type = 'text',
    label,
    labelColor,
    labelSize = 14,
    labelFontWeight = "600",
    labelDisabled = true,
    style,
    value,
    valueFontSize,
    valueMaxWidth,
    text,
    fileType,
    color,
    iconColor,
    titleMarginBottom = 0,
    infoMarginBottom = 0,
    infoMarginTop = 0,
    icon,
    iconVisible,
    labelIcon,
    iconSize = 20,
    isUri = true,
    onPress,
    nameKey,
    labelBtnText,
    labelBtnOnPress,
    des,
    hasExternalLink,
    labelRemarkText,
    labelRemarkTextUser,
    labelRemarkIcon,
    labelRemarkIconSize,
    labelRemarkIconColor,
    defaultValue,
    cardType,
    modelId,
    emptyText,
    textColor,
    size,
    labelWidth,
    avatarSize,
    testID,
    values,
    avatarVisible,
    textSize = 14
  } = props

  // Render
  return (
    <>
      <View
        style={
          [
            style,
            {}
          ]
        }
      >
        {label && (
          <TouchableOpacity
            disabled={labelDisabled}
          >
            <WsFlex
              style={[
                {
                  marginBottom: titleMarginBottom,
                  // borderWidth:1,
                }
              ]}
              justifyContent="space-between"
            >
              <WsFlex
                justifyContent={'center'}
              >
                {labelIcon && (
                  <WsIcon
                    name={labelIcon}
                    size={iconSize}
                    color={iconColor}
                    style={{
                      marginRight: 4
                    }}
                  />
                )}
                {label && (
                  <WsText size={labelSize} fontWeight={labelFontWeight} color={labelColor}
                    style={[
                      {
                        marginRight: 4,
                      },
                      {
                        width: labelWidth ? labelWidth : undefined
                      }]}
                  >
                    {label}
                  </WsText>
                )}
              </WsFlex>
              {labelBtnText && (
                <TouchableOpacity
                  testID={`${testID}-編輯`}
                  onPress={labelBtnOnPress}
                >
                  <WsText size={14} color={$color.primary}>
                    {labelBtnText}
                  </WsText>
                </TouchableOpacity>
              )}
            </WsFlex>
          </TouchableOpacity>
        )}

        <WsFlex
          style={{
            marginTop: infoMarginTop,
            marginBottom: infoMarginBottom,
            marginLeft: style && style.flexDirection == 'row' ? 8 : 0,
            maxWidth: labelWidth ? width * 0.55 : undefined
          }}>
          {icon && (
            <WsIcon
              name={icon}
              size={iconSize}
              color={iconColor}
              style={{
                marginRight: 4
              }}
            />
          )}
          {(type == 'text' || type == 'date' || type == 'email' || type == 'dateTime') && (
            <WsInfoText
              testID={testID}
              style={style}
              fontWeight={400}
              textSize={textSize}
              textColor={textColor}
              label={label}
              emptyText={emptyText}
            >
              {type == 'date' && value ? moment(value).format('YYYY-MM-DD') : type == 'dateTime' && value ? moment(value).format('YYYY-MM-DD HH:mm') : value ? t(value) : ''}
            </WsInfoText>
          )}
          {type == 'link' && (
            <WsInfoLink
              testID={testID}
              value={value}
              text={text}
              onPress={onPress}
              icon={icon}
              hasExternalLink={hasExternalLink}
              iconVisible={iconVisible}
              iconSize={iconSize}
              size={size}
              style={style}
            />
          )}
          {type == 'file' && (
            <WsInfoFile fileName={text} fileType={fileType} value={value} />
          )}
          {type == 'files' && <WsInfoFiles value={value} />}
          {type == 'filesAndImages' && <WsInfoFiles value={value} label={label} emptyText={emptyText} />}
          {type == 'image' && (
            <WsInfoImage fileName={text} fileType={fileType} value={value} />
          )}
          {type == 'images' && <WsInfoImages value={value} label={label} emptyText={emptyText} />}
          {type == 'user' && (
            <WsInfoUser
              testID={testID}
              value={value}
              isUri={isUri}
              des={des}
              defaultValue={defaultValue}
              fontsize={textSize}
            />
          )}
          {type == 'users' && (
            <WsInfoUsers
              value={value}
              isUri={isUri}
              des={des}
              avatarSize={avatarSize}
              style={style}
              testID={testID}
              avatarVisible={avatarVisible}
            />
          )}
          {type == 'usersWithTag' && (
            <WsInfoUsers002
              value={value}
              isUri={isUri}
              des={des}
              avatarSize={avatarSize}
            >
            </WsInfoUsers002>
          )}
          {type == 'status' && <WsInfoStatus value={value} />}
          {type == 'belongsto' && (
            <WsInfoBelongsto value={value} nameKey={nameKey} onPress={onPress} />
          )}
          {type == 'tel' && (
            <WsInfoPhone value={value} color={color}>
              {text}
            </WsInfoPhone>
          )}
          {type == 'email' && (
            <WsInfoEmail value={value} color={color} style={style}>
              {text}
            </WsInfoEmail>
          )}
          {type == 'icon' && <WsStateShowImage value={value} style={style} iconSize={iconSize} />}
          {type == 'info_listWithModal' && <WsStateListWithModal value={value} />}
          {type == 'card' && <WsStateAlertCard value={value} cardType={cardType} modelId={modelId} values={values} />}
          {type == 'tags' && (
            <WsInfoTags value={value} color={color} style={style} />
          )}
          {type == 'belongstomany' && (
            <WsInfoBelongstomany
              value={value}
              nameKey={nameKey}
              onPress={onPress}
              style={style}
              valueFontSize={valueFontSize}
              valueMaxWidth={valueMaxWidth}
            />
          )}
        </WsFlex>
      </View>
      <WsFlex
        style={{
          right: 0
        }}
      >
        {labelRemarkIcon && (
          <WsIcon
            name={labelRemarkIcon}
            size={labelRemarkIconSize}
            color={labelRemarkIconColor}
            style={{
            }}
          />
        )}
        {labelRemarkText && (
          <WsText size={14} color={$color.gray}
            style={{
              marginLeft: 4,
            }}>
            {labelRemarkText}
          </WsText>
        )}
        {labelRemarkTextUser && (
          <WsText size={14} color={$color.gray}
            style={{
            }}>
            {labelRemarkTextUser}
          </WsText>
        )}
      </WsFlex>
    </>
  )
}

export default WsInfo
