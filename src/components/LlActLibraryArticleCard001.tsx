import React, { useState } from 'react'
import {
  Image,
  View,
  Pressable
} from 'react-native'
import {
  WsCard,
  WsText,
  WsTag,
  WsIcon,
  WsFlex,
  WsInfo
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

interface LlActLibraryArticleCard001Props {
  img?: string;
  text: string;
  isChange?: number;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  item: object;
}

const LlActLibraryArticleCard001: React.FC<LlActLibraryArticleCard001Props> = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    img,
    text,
    item,
    isChange,
    onPress,
    style,
    testID
  } = props


  // helper area
  const areaNames = Array.isArray(item.areas)
    ? item.areas
      .map(a => (typeof a === 'string' ? a : a?.name ?? a?.label ?? ''))
      .filter(Boolean)
      .join('、')
    : (typeof item.areas === 'string'
      ? item.areas
      : item.areas?.name ?? item.areas?.label ?? '');
  const subAreaNames = Array.isArray(item.area_sections)
    ? item.area_sections
      .map(a => (typeof a === 'string' ? a : a?.name ?? a?.label ?? ''))
      .filter(Boolean)
      .join('、')
    : (typeof item.area_sections === 'string'
      ? item.area_sections
      : item.area_sections?.name ?? item.area_sections?.label ?? '');
  // 最終字串（只有有值才出現，且不會多出「 | 」）
  const metaLine = [areaNames, subAreaNames]
    .map(s => (typeof s === 'string' ? s.trim() : s))
    .filter(Boolean)
    .join('・');

  return (
    <>
      <Pressable
        testID={testID}
        onPress={onPress}
      >
        <WsCard
          style={[
            {
              paddingVertical: 8,
              paddingHorizontal: 16,
              flex: 0
            },
            style
          ]}>
          {isChange && (
            <WsFlex
              style={{
                marginBottom: 8
              }}>
              <WsTag
                borderRadius={16}
                backgroundColor={$color.yellow11l}
                textColor={$color.gray}
                style={{
                  marginLeft: 28
                }}>
                {isChange == 3
                  ? t('近{number}個月異動', { number: 3 })
                  : isChange == 6
                    ? t('近{number}個月異動', { number: 6 })
                    : null}
              </WsTag>
            </WsFlex>
          )}
          <WsFlex>
            {img && (
              <Image
                source={{
                  width: 22,
                  height: 22,
                  uri: img
                }}
                alt={'loading'}
              />
            )}

            <View
              style={{
                marginLeft: 8,
              }}
            >
              <WsText
                style={{
                }}>
                {t(text)}
              </WsText>

              <WsFlex
                style={{
                  marginTop: 4
                }}
                flexWrap={'wrap'}
              >
                <WsText color={$color.gray} size={12}>
                  {`${metaLine}`}
                </WsText>
              </WsFlex>

              <WsText color={$color.gray} size={12}>
                {t('生效日')}{' '}
                {moment(item.last_version.effect_at).format('YYYY-MM-DD')}
              </WsText>
            </View>

          </WsFlex>

          <WsFlex
            style={{
              marginBottom: 4
            }}
            flexWrap="wrap"
          >
            {item &&
              item.factory_tags &&
              item.factory_tags.length > 0 && item.factory_tags.map((tag, index) => {
                return (
                  <View key={index}>
                    {tag.id && (
                      <WsTag
                        size={12}
                        backgroundColor={'#f5f5f5'}
                        textColor={'#373737'}
                        style={{
                          marginRight: 8
                        }}
                      >
                        {`#${tag.name}`}
                      </WsTag>
                    )}
                  </View>
                )
              })}
          </WsFlex>
        </WsCard>
      </Pressable>
    </>
  )
}

export default LlActLibraryArticleCard001
