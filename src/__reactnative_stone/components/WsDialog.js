import React from 'react'
import {
  Platform,
  View,
  Dimensions,
  TouchableOpacity
} from 'react-native'
import {
  WsFlex,
  WsText,
  WsIcon,
  WsPopup,
  WsGradientButton
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import Dialog from 'react-native-dialog'
import layouts from '@/__reactnative_stone/global/layout'
import { useTranslation } from 'react-i18next'

const WsDialog = props => {
  // i18n
  const { t, i18n } = useTranslation()
  const { windowWidth, windowHeight } = layouts
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    children,
    dialogVisible,
    setDialogVisible,
    dialogButtonItems,
    btnBorderWidth = 0.3,
    headerStyle,
    contentStyle,
    backgroundColor = $color.white,
    title,
    contentHeight,
    contentPadding = 0,
    btnMarginTop = Platform.OS === 'ios' ? -16 : 0,
    contentWidth = width * 0.8,
    mode = 1,
  } = props

  // Render
  return (
    <>
      {mode === 1 && (
        <Dialog.Container
          visible={dialogVisible}
          onBackdropPress={setDialogVisible}
          headerStyle={headerStyle}
          blurComponentIOS={<View />}
          contentStyle={[
            {
              ...contentStyle,
              backgroundColor: backgroundColor,
              borderRadius: 10,
              padding: contentPadding,
              height: contentHeight ? contentHeight : 208,
              ...(contentWidth ? { width: contentWidth } : {}),
            },
          ]
          }
        >
          <>
            <Dialog.Title
              style={{
                color: $color.black,
                letterSpacing: 1,
                fontWeight: 'normal',
                fontSize: 18,
              }}>
              {title}
            </Dialog.Title>
            {title && (
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                }}
                onPress={() => {
                  setDialogVisible(false)
                }}>
                <WsIcon name={'md-close'} size={24} />
              </TouchableOpacity>
            )}
          </>
          <Dialog.Description>
            {children}
          </Dialog.Description>
          {dialogButtonItems && (
            <>
              <View
                style={{
                  position: 'absolute',
                  bottom: 8,
                  // right: 16, // 240408-datePicker-issue
                  flexDirection: 'row',
                  // alignItems: 'flex-end', // 240408-datePicker-issue
                  // width: width * 0.55, // 240408-datePicker-issue
                  backgroundColor: $color.white,
                  // borderWidth: 2, 
                }}>
                {dialogButtonItems.map((item, itemIndex) => (
                  <Dialog.Button
                    style={{
                      overflow: 'hidden',
                      borderColor: item.borderColor ? item.borderColor : $color.white9d,
                      borderWidth: btnBorderWidth,
                      paddingVertical: 8,
                      width: 100,
                      // borderWidth:1,
                      backgroundColor: item.backgroundColor ? item.backgroundColor : $color.white,
                      borderRadius: item.borderRadius ? item.borderRadius : 15,
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: 14,
                    }}
                    key={itemIndex}
                    label={t(item.label)}
                    color={item.color}
                    onPress={item.onPress}
                  />
                ))}
              </View>
            </>
          )}
        </Dialog.Container>
      )}

      {mode === 2 && (
        <WsPopup
          active={dialogVisible}
          onClose={() => {
            setDialogVisible(false)
          }}
        >
          <View
            style={{
              width: width * 0.9,
              height: height * 0.2,
              backgroundColor: $color.white,
              borderRadius: 10,
              flexDirection: 'row',
            }}>
            <View
              style={{
                padding: 16
              }}>
              {children}
            </View>
            <WsFlex
              style={{
                position: 'absolute',
                right: 16,
                bottom: 16,
              }}
            >
              {dialogButtonItems.map((item, itemIndex) => {
                if (itemIndex === 0) {
                  return (
                    <TouchableOpacity
                      key={itemIndex}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderColor: $color.gray,
                        borderRadius: 25,
                        borderWidth: 1,
                        width: 110,
                        alignItems: 'center'
                      }}
                      onPress={item.onPress}
                    >
                      <WsText
                        style={{
                          padding: 1
                        }}
                        size={14}
                        color={$color.gray}
                      >{t(item.label)}
                      </WsText>
                    </TouchableOpacity>
                  )
                }
                if (itemIndex === 1) {
                  return (
                    <WsGradientButton
                      style={{
                        width: 110,
                      }}
                      onPress={item.onPress}
                    >
                      {t(item.label)}
                    </WsGradientButton>
                  )
                }
              })}
            </WsFlex>
          </View>
        </WsPopup>
      )}

      {mode === 3 && (
        <Dialog.Container
          visible={dialogVisible}
          onBackdropPress={setDialogVisible}
          headerStyle={headerStyle}
          blurComponentIOS={<View />}
          contentStyle={[
            {
              ...contentStyle,
              backgroundColor: backgroundColor,
              borderRadius: 10,
              padding: contentPadding,
              height: contentHeight ? contentHeight : undefined, // 250418-create-event-issues-remindRenderItem
              ...(contentWidth ? { width: contentWidth } : {}),
            },
          ]
          }
        >
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
            }}
            onPress={() => {
              setDialogVisible(false)
            }}>
            <WsIcon name={'md-close'} size={24} />
          </TouchableOpacity>
          <Dialog.Title
            style={{
              color: $color.black,
              letterSpacing: 1,
              fontWeight: 'normal',
              fontSize: 18,
              alignSelf: 'flex-start',
              marginBottom: 16,
            }}
          >
            {title}
          </Dialog.Title>

          <Dialog.Description>
            {children}
          </Dialog.Description>

          {dialogButtonItems && (
            <>
              <View
                style={{
                  position: 'absolute',
                  bottom: 8,
                  right: 16,
                  flexDirection: 'row',
                  alignItems: 'flex-end',
                  width: width * 0.55,
                  // borderWidth:2,
                }}>
                {dialogButtonItems.map((item, itemIndex) => (
                  <Dialog.Button
                    style={{
                      overflow: 'hidden',
                      borderColor: item.borderColor ? item.borderColor : $color.white9d,
                      borderWidth: btnBorderWidth,
                      paddingVertical: 8,
                      width: 100,
                      backgroundColor: item.backgroundColor ? item.backgroundColor : $color.white,
                      borderRadius: item.borderRadius ? item.borderRadius : 15,
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: 14,
                    }}
                    key={itemIndex}
                    label={t(item.label)}
                    color={item.color}
                    onPress={item.onPress}
                  />
                ))}
              </View>
            </>
          )}
        </Dialog.Container>
      )}
    </>
  )
}

export default WsDialog
