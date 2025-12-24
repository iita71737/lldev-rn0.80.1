import React from 'react'
import { TouchableOpacity, View, Dimensions, StyleProp, ViewStyle } from 'react-native'
import { WsText, WsTag, WsCard, WsFlex, WsInfo, WsSpec } from '@/components'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'

type FactoryTag = {
  id: string
  name: string
}

type Item = {
  id: string
  name: string
  created_at?: string
  updated_at?: string
  factory_tags?: FactoryTag[]
}

type Props = {
  style?: StyleProp<ViewStyle>
  onPress?: () => void
  item: Item

  /** 若你要隱藏編輯時間，可用這個控制（預設顯示） */
  showCreatedAt?: boolean

  /** 若你要限制 title 行數（預設 1） */
  titleNumberOfLines?: number
}

const LlPDFToolListCard001: React.FC<Props> = React.memo(props => {
  const { t } = useTranslation()
  const { width } = Dimensions.get('window')

  const {
    style,
    onPress,
    item,
    showCreatedAt = true,
    titleNumberOfLines = 1,
  } = props

  const tags = item?.factory_tags ?? []
  const createdAtText =
    item?.created_at && moment(item.created_at).isValid()
      ? moment(item.created_at).format('YYYY-MM-DD HH:mm:ss')
      : null

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <WsCard padding={16} style={style}>
        {/* Title */}
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
          }}
        >
          <WsText style={{ maxWidth: width * 0.86 }} numberOfLines={titleNumberOfLines}>
            {item?.name ?? ''}
          </WsText>
        </View>

        <View>
          <WsInfo
            labelSize={14}
            labelColor={$color.black5l}
            labelWidth={100}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 8
            }}
            label={t('負責人')}
            type="user"
            value={item.owner}
          />
        </View>

        <View
          style={{
            marginTop: 8
          }}
        >
          <WsInfo
            labelSize={14}
            labelColor={$color.black5l}
            labelWidth={100}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
            label={t('議事日期')}
            value={moment(item.meeting_date).format('YYYY-MM-DD')}
          />
        </View>

        {/* Tags */}
        {tags.length > 0 ? (
          <WsFlex style={{ marginTop: 8 }} flexWrap="wrap">
            {tags.map(tag => (
              <View key={tag.id} style={{ marginRight: 8, marginTop: 6 }}>
                <WsTag size={12} backgroundColor={'#f5f5f5'} textColor={'#373737'}>
                  {`#${tag.name}`}
                </WsTag>
              </View>
            ))}
          </WsFlex>
        ) : null}

        {/* Created At */}
        {showCreatedAt && createdAtText ? (
          <View style={{ marginTop: 10 }}>
            <WsInfo
              labelWidth={100}
              labelFontWeight={400}
              labelSize={12}
              labelColor={$color.gray}
              textSize={12}
              label={t('建立時間')}
              value={createdAtText}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            />
          </View>
        ) : null}
      </WsCard>
    </TouchableOpacity>
  )
})

export default LlPDFToolListCard001
