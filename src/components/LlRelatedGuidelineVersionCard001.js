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
// import S_GuidelineArticleVersionAdmin from '@/services/api/v1/guideline_article_version_admin'
import S_GuidelineVersion from '@/services/api/v1/guideline_version'
import { useNavigation } from '@react-navigation/native'

const LlRelatedGuidelineVersionCard001 = (props) => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const {
    guideline_version
  } = props

  const [item, setItem] = React.useState()
  const [loading, setLoading] = React.useState(true)

  // Services
  const $_fetchGuidelineVersion = async () => {
    try {
      const res = await S_GuidelineVersion.show({ modelId: guideline_version?.id })
      if (res && res?.message !== 'invalid scopes') {
        navigation.push('RoutesAct', {
          screen: 'GuidelineShow',
          params: {
            id: guideline_version?.guideline?.id,
            routeByGuidelineVersion: res
          }
        })
      }
      else if (res?.message === 'invalid scopes') {
        Alert.alert(t('無權限'))
      }
      setLoading(false)
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <>
      {loading && !guideline_version ? (
        <WsSkeleton></WsSkeleton>
      ) : (
        <WsPaddingContainer>
          <WsText>{t('相關內規')}</WsText>
          <TouchableOpacity
            onPress={() => {
              $_fetchGuidelineVersion()
            }}>
            <WsCard style={{ marginTop: 8 }}>
              <WsText>{guideline_version.name}</WsText>
              <WsDes
                style={{
                  marginTop: 8
                }}>
                {t('修正發布日')}{' '}
                {moment(guideline_version.announce_at ? guideline_version.announce_at : null).format('YYYY-MM-DD')}
              </WsDes>
            </WsCard>
          </TouchableOpacity>
        </WsPaddingContainer>
      )}
    </>
  )
}

export default LlRelatedGuidelineVersionCard001