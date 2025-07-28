import React from 'react'
import { Pressable, View, TouchableOpacity } from 'react-native'
import gColor from '@/__reactnative_stone/global/color'
import {
  WsCard,
  WsText,
  WsFlex,
  WsTag,
  WsGrid,
  WsSpec,
  WsBtn
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import LlBtn001 from '@/components/LlBtn001'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

const LlContractorEnterRecordCard001 = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    item,
    onPress,
    style,
    btnColor,
    textColor,
    borderColor,
    btnText = '查看',
    isTodayEnter,
    testID
  } = props

  // Function
  const $_getTagsBySystemSubclasses = system_subclasses => {
    const _tags = []
    system_subclasses.forEach(system_subclass => {
      _tags.push({
        icon: system_subclass.icon,
        text: system_subclass.name
      })
    })
    return _tags
  }

  // Render
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
    >
      <WsCard
        style={[
          {
            alignItems: 'flex-start'
          },
          style
        ]}>

        {item.task_content && (
          <WsText size={16}>{t(item.task_content)}</WsText>
        )}

        {item.system_subclasses && item.system_subclasses.length > 0 && (
          <WsFlex flexWrap="wrap">
            {$_getTagsBySystemSubclasses(item.system_subclasses).map(
              (tag, tagIndex) => {
                return (
                  <View key={tagIndex}>
                    {tag.icon && tag.text && (
                      <WsTag
                        style={{
                          marginTop: 8,
                          marginRight: 8
                        }}
                        img={tag.icon}>
                        {tag.text}
                      </WsTag>
                    )}
                  </View>
                )
              }
            )}
          </WsFlex>
        )
        }

        {item.enter_date && isTodayEnter && (
          <WsSpec
            labelWidth={80}
            style={{
              marginTop: 8

            }}
            title={t('進場時間')}>
            {t('今天')}
            {`  `}
            {moment(item.enter_start_time).format('HH:mm')}
            {' - '}
            {moment(item.enter_end_time).format('HH:mm')}
          </WsSpec>
        )}

        {!isTodayEnter &&
          item.enter_start_date &&
          item.enter_end_date && (
            <WsSpec
              labelWidth={80}
              style={{
                marginTop: 8
              }}
              title={t('進場日期')}>
              {`${moment(item.enter_start_date).format('YYYY-MM-DD')}`}
              {' - '}
              {`${moment(item.enter_end_date).format('YYYY-MM-DD')}`}
            </WsSpec>
          )}

        {!isTodayEnter &&
          item.enter_start_date &&
          item.enter_end_date && (
            <WsSpec
              labelWidth={80}
              style={{
                marginTop: 8
              }}
              title={t('進場時間')}
            >
              {moment(item.enter_start_time).format('HH:mm')}
              {' - '}
              {moment(item.enter_end_time).format('HH:mm')}
            </WsSpec>
          )}

        {item.contractor && item.contractor.name && (
          <WsSpec
            labelWidth={80}
            style={{
              marginTop: 8
            }}
            title={t('承攬商')}>
            {t(item.contractor.name)}
          </WsSpec>
        )}

        {item.operate_location && (
          <WsSpec
            labelWidth={80}
            style={{
              marginTop: 8
            }}
            title={t('作業地點')}>
            {t(item.operate_location)}
          </WsSpec>
        )}

        <LlBtn001
          onPress={onPress}
          isFullWidth={true}
          style={{
            marginTop: 16
          }}
          btnColor={btnColor}
          textColor={textColor}
          borderColor={borderColor}
        >
          {btnText}
        </LlBtn001>
      </WsCard>
    </TouchableOpacity>
  )
}

export default LlContractorEnterRecordCard001
