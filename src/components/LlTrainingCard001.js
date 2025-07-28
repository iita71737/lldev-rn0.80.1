import React from 'react'
import { Pressable, View, TouchableOpacity } from 'react-native'
import { WsFlex, WsTag, WsPaddingContainer, WsText, WsCard, WsDes, WsSpec } from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import gColor from '@/__reactnative_stone/global/color'

const LlTrainingCard001 = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    item,
    style,
    onPress,
    testID,
    modelName
  } = props

  // Render
  return (
    <TouchableOpacity onPress={onPress} testID={testID}>
      {item && (
        <WsCard style={[style]} padding={0}>
          <WsPaddingContainer>

            <WsFlex style={{
              marginBottom: 8
            }}>
              {item.status && item.status == 2 && (
                <WsTag
                  style={{
                  }}
                  backgroundColor={gColor.yellow11l}
                  textColor={gColor.gray}>
                  {t('修訂中')}
                </WsTag>
              )}
            </WsFlex>

            <WsText>{item.name}</WsText>

            {item.system_subclasses && (
              <WsFlex flexWrap="wrap">
                {item.system_subclasses.map(
                  (systemSubclass, systemSubclassIndex) => {
                    return (
                      <View key={systemSubclassIndex}>
                        <WsTag
                          img={systemSubclass.icon}
                          style={{
                            marginRight: 8,
                            marginTop: 8
                          }}>
                          {t(systemSubclass.name)}
                        </WsTag>
                      </View>
                    )
                  }
                )}
              </WsFlex>
            )}

            {modelName !== 'internal_training_template' && (
              <WsFlex
                style={{
                  marginTop: 8
                }}
              >
                <WsText size={12} style={{ marginRight: 8 }}>{t('訓練日期')}</WsText>
                <WsDes> {moment(item.train_at).format('YYYY-MM-DD')}</WsDes>
              </WsFlex>
            )}


            {item.last_version && (
              <WsFlex
                style={{
                  marginTop: 8
                }}
              >
                <WsText size={12} style={{ marginRight: 8 }}>{t('更新日期')}</WsText>
                <WsDes>{moment(item.last_version.updated_at).format('YYYY-MM-DD')}</WsDes>
              </WsFlex>
            )}

            {item.principal && (
              <WsFlex
                style={{
                  marginTop: 8
                }}>
                <WsDes color={$color.black} style={{ marginRight: 8 }}>
                  {t('負責人')}
                </WsDes>
                <WsDes>{item.principal.name}</WsDes>
              </WsFlex>
            )}

            {item.related_count >= 0 && (
              <WsFlex
                style={{
                  marginTop: 8
                }}
              >
                <WsText size={12} style={{ marginRight: 8 }}>{t('引用數量')}</WsText>
                <WsDes>{`${item.related_count}`}</WsDes>
              </WsFlex>
            )}

          </WsPaddingContainer>
        </WsCard>
      )}
    </TouchableOpacity>
  )
}
export default LlTrainingCard001
