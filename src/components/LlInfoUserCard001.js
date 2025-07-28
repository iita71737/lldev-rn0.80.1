import React from 'react'
import { Pressable, View, Image } from 'react-native'
import { useWindowDimensions } from 'react-native'
import { TabView, TabBar, SceneMap } from 'react-native-tab-view'
import {
  WsIcon,
  WsText,
  WsUser,
  WsInfo,
  WsFlex,
  WsPaddingContainer,
  WsInfoForm,
  fields
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import S_CheckList from '@/services/api/v1/checklist'

const LlInfoUserCard001 = props => {
  const { t, i18n } = useTranslation()
  // Props
  const {
    checkers,
    reviewers,
    owner,
    fields,
    style,
    onPress,
    value,
    frequency,
    expired_before_days,
    factory_tags
  } = props

  // Functions
  const $_getCheckersFormat = checkers => {
    const checkersFormat = []
    checkers.forEach(checker => {
      const _source = checker.avatar
        ? {
          uri: checker.avatar
        }
        : null
      checkersFormat.push({
        name: checker.name,
        source: _source
      })
    })
    return checkersFormat
  }

  const $_getReviewerFormat = reviewers => {
    const reviewersFormat = []
    reviewers.forEach(reviewer => {
      const _source = reviewer.avatar
        ? {
          uri: reviewer.avatar
        }
        : null
      reviewersFormat.push({
        name: reviewer.name,
        source: _source
      })
    })
    return reviewersFormat
  }

  const $_getOwnerFormat = owner => {
    const _source = owner.avatar ? { uri: owner.avatar } : null
    return {
      name: owner.name,
      avatar: _source
    }
  }

  const $_checklistContentDeadline = (frequency, expired_before_days) => {
    return S_CheckList.getChecklistContentDeadline(
      frequency,
      expired_before_days
    )
  }

  // Render
  return (
    <WsPaddingContainer
      padding={0}
      style={[
        {
          backgroundColor: $color.white,
          paddingTop: 8,
        },
        style
      ]}>
      {/* <WsText
        style={{
          marginBottom: 16
        }}
        size={24}>
        {t('資訊')}
      </WsText> */}
      {checkers && (
        <WsInfo
          type="users"
          label={t('答題者')}
          value={checkers ? $_getCheckersFormat(checkers) : null}
        />
      )}

      {reviewers && (
        <WsInfo
          type="users"
          label={t('覆核者')}
          value={reviewers ? $_getReviewerFormat(reviewers) : null}
        />
      )}

      {owner && (
        <View
          style={{
            marginTop: 8
          }}
        >
          <WsInfo
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
            type="user"
            label={t('管理者')}
            value={owner ? $_getOwnerFormat(owner) : null}
          />
        </View>
      )}

      {factory_tags && factory_tags.length > 0 && (
        <View
          style={{
            marginTop: 8
          }}
        >
          <WsInfo
            style={{
            }}
            type="tags"
            value={factory_tags}
          />
        </View>
      )}

    </WsPaddingContainer>
  )
}

export default LlInfoUserCard001
