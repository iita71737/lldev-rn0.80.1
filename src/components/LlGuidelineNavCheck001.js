import React, { useState, useEffect } from 'react'
import {
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native';
import { WsNavButton, LlGuidelineNavButton001, WsModal } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import ViewGuidelineArticleShowForModal from '@/views/ActGuideline/GuidelineArticleShowForModal'
import { useNavigation } from '@react-navigation/native'
import store from '@/store'
import { useSelector } from 'react-redux'
import GuidelineArticleShowLayerForModal from '@/views/ActGuideline/GuidelineArticleShowLayerForModal'
import S_GuidelineArticleVersionAdmin from '@/services/api/v1/guideline_article_version_admin'

const LlGuidelineNavCheck001 = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()

  // Props
  const {
    style,
    paddingHorizontal,
    paddingVertical,
    backgroundColor,
    children,
    bottomLine = false,
    value,
    onChange,
    disabled,
    fontColor,
    testID,
    textRight,
    defaultRightWidthTimes,
    textRightWidthTimes,
    defaultLeftWidthTime,
    textLeftWidthTimes,
    iconRightVisible,
    iconLeft,
    item,
  } = props

  // REDUX
  const currentSelectedGuidelineId = useSelector(state => state.data.currentSelectedGuidelineId)

  // State
  const [iconRight, setIconRight] = useState('md-check-box-outline-blank')
  const [iconRightColor, setIconRightColor] = useState($color.gray)

  const [modalArticle, setModalArticle] = React.useState(false)
  const [articleVersionId, setArticleVersionId] = React.useState()

  const [modalArticle002, setModalArticle002] = React.useState(false)
  const [routeByGuidelineVersion, setRouteByGuidelineVersion] = React.useState(false)
  const [scrollToTargetIndex, setScrollToTargetIndex] = React.useState(false)


  // 計算點擊的層級是在GuidelineArticleVersionAdmin-IndexByGuidelineVersion的index
  const $_calScrollToTargetIndex = async (item) => {
    try {
      const _params = {
        guideline_version_id: item.guideline_version?.id
      }
      const res = await S_GuidelineArticleVersionAdmin.indexByGuidelineVersion({ params: _params })
      if (res.data && res.data?.length > 0) {
        const _index = res.data.findIndex(i => i.id === item.id);
        if (_index != undefined) {
          setScrollToTargetIndex(_index)
          setArticleVersionId(item.id)
          setRouteByGuidelineVersion(item.guideline_version)
          setModalArticle002(true)
        }
      }
    } catch (e) {
      console.error(e, 'S_GuidelineArticleVersionAdmin-indexByGuidelineVersion');
    }
  }

  // onPress Title
  const $_onTitlePress = () => {
    if (item.type === 'article') {
      setArticleVersionId(item.id)
      setModalArticle(true)
    }
    else if (item.type === 'title') {
      if (!currentSelectedGuidelineId) {
        return
      }
      $_calScrollToTargetIndex(item)
    }
  }

  // Function
  const $_onPress = () => {
    onChange(!value)
  }
  const $_setIcon = () => {
    if (disabled) {
      setIconRight('ws-filled-indeterminate-check-box')
      setIconRightColor($color.white2d)
    }
    else if (value) {
      setIconRight('md-check-box')
      setIconRightColor($color.primary)
    }
    else {
      setIconRight('md-check-box-outline-blank')
      setIconRightColor($color.gray)
    }
  }

  useEffect(() => {
    $_setIcon()
  }, [value, disabled])

  // Render
  return (
    <>
      <LlGuidelineNavButton001
        paddingHorizontal={paddingHorizontal}
        paddingVertical={paddingVertical}
        style={style}
        backgroundColor={backgroundColor}
        iconRight={iconRight}
        iconLeft={iconRight}
        iconLeftColor={iconRightColor}
        iconRightColor={iconRightColor}
        bottomLine={bottomLine}
        onPress={$_onPress}
        disabled={disabled}
        fontColor={fontColor}
        textRight={textRight}
        textRightSize={12}
        defaultRightWidthTimes={defaultRightWidthTimes}
        textRightWidthTimes={textRightWidthTimes}
        defaultLeftWidthTime={defaultLeftWidthTime}
        textLeftWidthTimes={textLeftWidthTimes}
        iconRightVisible={iconRightVisible}
        setModalArticle={setModalArticle}
        onTitlePress={$_onTitlePress}
      >
        {children}
      </LlGuidelineNavButton001>

      <WsModal
        title={t('內規條文版本依據')}
        visible={modalArticle}
        headerLeftOnPress={() => {
          setModalArticle(false)
        }}
        onBackButtonPress={() => {
          setModalArticle(false)
        }}>
        <ViewGuidelineArticleShowForModal
          versionId={articleVersionId}
        />
      </WsModal>

      <WsModal
        title={t('相關內規')}
        visible={modalArticle002}
        headerLeftOnPress={() => {
          setModalArticle002(false)
        }}
        onBackButtonPress={() => {
          setModalArticle002(false)
        }}>
          <GuidelineArticleShowLayerForModal
            id={currentSelectedGuidelineId}
            routeByGuidelineVersion={routeByGuidelineVersion ? routeByGuidelineVersion : undefined}
            scrollToTargetIndex={scrollToTargetIndex !== undefined ? scrollToTargetIndex : scrollToTargetIndex}
            hintId={articleVersionId}
          />
      </WsModal>
    </>
  )
}

export default LlGuidelineNavCheck001
