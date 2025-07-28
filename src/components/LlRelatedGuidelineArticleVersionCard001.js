import React from 'react'
import { ScrollView, View, Text, SafeAreaView, Dimensions, Alert } from 'react-native'
import {
  WsIcon,
  WsInfo,
  WsFlex,
  WsText,
  WsPaddingContainer,
  WsModal,
  WsBottomSheet,
  WsIconBtn,
  WsDialogDelete,
  WsStateSubtaskCardShow,
  WsSnackBar,
  WsState,
  WsAvatar,
  LlTaskHeaderCard001,
  LlNavButton002,
  WsLoading,
  WsInfoForm,
  WsBtn,
  WsGradientButton,
  WsInfoUser,
  WsTag,
  WsGradientProgressBar,
  WsCard,
  WsSkeleton,
  WsDes
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import S_Task from '@/services/api/v1/task'
import S_SubTask from '@/services/api/v1/sub_task'
import AsyncStorage from '@react-native-community/async-storage'
import moment from 'moment'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import { useRoute } from '@react-navigation/native'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import ViewGuidelineArticleShowForModal from '@/views/ActGuideline/GuidelineArticleShowForModal'
import store from '@/store'
import {
  setRefreshCounter
} from '@/store/data'
import { TouchableOpacity } from 'react-native-gesture-handler'
import S_GuidelineArticleVersionAdmin from '@/services/api/v1/guideline_article_version_admin'
import S_GuidelineArticleVersion from '@/services/api/v1/guideline_article_version'
import { useNavigation } from '@react-navigation/native'

const LlRelatedGuidelineArticleVersionCard001 = (props) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
 const navigation = useNavigation()

  const {
    guideline_article_version,
    _setModalArticle
  } = props

  const [item, setItem] = React.useState()
  const [loading, setLoading] = React.useState(false)

  const [modalArticle, setModalArticle] = React.useState(false)
  const [articleVersionId, setArticleVersionId] = React.useState()


  // helper 
  // 計算點擊的層級是在GuidelineArticleVersionAdmin-IndexByGuidelineVersion的index
  const $_calScrollToTargetIndex = async (item) => {
    try {
      const _params = {
        guideline_version_id: item?.guideline_version?.id
      }
      const res = await S_GuidelineArticleVersionAdmin.indexByGuidelineVersion({ params: _params })
      if (res.data && res.data?.length > 0) {
        const _index = res.data.findIndex(i => i.id === item.id);
        if (_index != undefined) {
          navigation.push('RoutesAct', {
            screen: 'GuidelineShow',
            params: {
              id: item?.guideline?.id,
              routeByGuidelineVersion: item?.guideline_version,
              scrollToTargetIndex: _index,
              hintId: item.id
            }
          })
        }
      }
    } catch (e) {
      console.error(e, 'S_GuidelineArticleVersionAdmin-indexByGuidelineVersion');
      navigation.goBack()
    }
  }

  // Services
  const $_fetchShow = async () => {
    setLoading(true)
    try {
      const res = await S_GuidelineArticleVersion.show({ modelId: guideline_article_version.id })
      if (res && res?.message !== 'invalid scopes') {
        if (item?.type === 'article') {
          setModalArticle(true)
          setArticleVersionId(guideline_article_version.id)
        } else if (item?.type === 'title') {
          $_calScrollToTargetIndex(guideline_article_version)
        } else {
          setModalArticle(true)
          setArticleVersionId(guideline_article_version.id)
        }
      }
      else if (res?.message === 'invalid scopes') {
        Alert.alert(t('無權限'))
        setModalArticle(false)
        _setModalArticle(false)
      }
      setLoading(false)
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      {loading && !guideline_article_version ? (
        <WsSkeleton></WsSkeleton>
      ) : (
        <WsPaddingContainer>
          <WsText>{'相關內規層級條文'}</WsText>
          <TouchableOpacity
            onPress={() => {
              $_fetchShow()
            }}>
            <WsCard style={{ marginTop: 8 }}>
              <WsText>{guideline_article_version.name}</WsText>
              {guideline_article_version.announce_at && (
                <WsDes
                  style={{
                    marginTop: 8
                  }}>
                  {t('修正發布日')}{' '}
                  {moment(guideline_article_version.announce_at ? guideline_article_version.announce_at : null).format('YYYY-MM-DD')}
                </WsDes>
              )}
            </WsCard>
          </TouchableOpacity>
        </WsPaddingContainer>
      )}

      <WsModal
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
    </>
  )
}

export default LlRelatedGuidelineArticleVersionCard001