import React from 'react';
import {
  TouchableOpacity,
  View,
  Dimensions
} from 'react-native';
import {
  WsFlex,
  WsText,
  WsInfo,
  WsModal,
  WsCard,
  WsDes
} from '@/components'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import ViewGuidelineArticleShowForModal from '@/views/ActGuideline/GuidelineArticleShowForModal'
import { useNavigation } from '@react-navigation/native'
import S_GuidelineArticleVersionAdmin from '@/services/api/v1/guideline_article_version_admin'

const LlRelatedGuidelineItem001 = ({ index, item, modelName, cardStyle }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()

  // STATE
  const [modalArticle, setModalArticle] = React.useState(false)
  const [articleVersionId, setArticleVersionId] = React.useState()

  // helper
  let displayValue = '';
  if (modelName === 'act') {
    displayValue = `${item.name} ${item.announce_at ? moment(item.announce_at).format('YYYY-MM-DD') : ''}`
  }
  else {
    if (item.guideline_article_version) {
      displayValue = `${item.guideline_article_version.name} (${item.guideline_article_version?.announce_at ? moment(item.guideline_article_version.announce_at).format('YYYY-MM-DD') : ''})`
    } else if (item.guideline_article) {
      displayValue = `${item.guideline_article.last_version?.name} (Latest)`
    } else if (item.guideline_version) {
      displayValue = `${item.guideline_version.name} (${item.guideline_version?.announce_at ? moment(item.guideline_version.announce_at).format('YYYY-MM-DD') : ''})`
    } else if (item.guideline) {
      displayValue = `${item.guideline.name} (Latest)`
    }
  }

  // 計算點擊的層級是在GuidelineArticleVersionAdmin-IndexByGuidelineVersion的index
  const $_calScrollToTargetIndex = async (item) => {
    let _compareId
    let _guideline_version
    if (item.guideline_article_version) {
      _compareId = item.guideline_article_version?.id
      _guideline_version = item?.guideline_article_version?.guideline_version
    } else if (item.guideline_article && modelName !== 'act') {
      _compareId = item.guideline_article?.last_version?.id
      _guideline_version = item.guideline_article?.last_version?.guideline_version
    } else if (item.guideline_article && modelName === 'act') {
      _compareId = item?.id
      _guideline_version = item.guideline_version
    } else if (modelName === 'act') {
      _compareId = item?.id
      _guideline_version = item.guideline_version
    }
    try {
      const _params = {
        guideline_version_id: _guideline_version?.id
      }
      // console.log(_params,'_params---');
      const res = await S_GuidelineArticleVersionAdmin.indexByGuidelineVersion({ params: _params })
      if (res.data && res.data?.length > 0) {
        const _index = res.data.findIndex(i => i.id === _compareId);
        // console.log(_index, '_index----');
        if (_index != undefined) {
          navigation.push('RoutesAct', {
            screen: 'GuidelineShow',
            params: {
              id: item?.guideline?.id,
              routeByGuidelineVersion: _guideline_version,
              scrollToTargetIndex: _index,
              hintId: _compareId
            }
          })
        }
      }
    } catch (e) {
      console.error(e, 'S_GuidelineArticleVersionAdmin-indexByGuidelineVersion');
      navigation.goBack()
    }
  }

  // onPress Title
  const $_onTitlePress = () => {
    if (modelName === 'act') {
      if (item.type === 'article') {
        setModalArticle(true)
        setArticleVersionId(item?.id)
      } else if (item.type === 'title') {
        console.log('$_onTitlePress');
        $_calScrollToTargetIndex(item)
      } else {
        // 整部內規
        navigation.push('RoutesAct', {
          screen: 'GuidelineShow',
          params: {
            id: item?.guideline?.id,
          }
        })
      }
    } else {
      if (item.guideline_article_version) {
        if (item.guideline_article_version?.type === 'title') {
          $_calScrollToTargetIndex(item)
        } else if (item.guideline_article_version?.type === 'article') {
          setModalArticle(true)
          setArticleVersionId(item?.guideline_article_version?.id)
        }
      } else if (item.guideline_article) {
        if (item.guideline_article?.last_version?.type === 'title') {
          $_calScrollToTargetIndex(item)
        } else if (item.guideline_article?.last_version?.type === 'article') {
          setModalArticle(true)
          setArticleVersionId(item?.guideline_article?.last_version?.id)
        }
      } else if (item.guideline_version) {
        navigation.push('RoutesAct', {
          screen: 'GuidelineShow',
          params: {
            id: item?.guideline?.id,
            routeByGuidelineVersion: item?.guideline_version,
          }
        })
      } else if (item.guideline) {
        navigation.push('RoutesAct', {
          screen: 'GuidelineShow',
          params: {
            id: item?.guideline?.id,
          }
        })
      }
    }
  }

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          $_onTitlePress()
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'flex-start',
            alignItems: 'center',
            marginTop: 8,
          }}
        >
          {cardStyle ? (
            <>
              <TouchableOpacity
                onPress={() => {
                  $_onTitlePress()
                }}>
                <WsCard style={{ marginTop: 8 }}>
                  <WsText>{item.name ? item.name : item.guideline?.name ? item.guideline?.name : ''}</WsText>
                  {(item.announce_at || item.guideline?.announce_at) && (
                    <WsDes
                      style={{
                        marginTop: 8
                      }}>
                      {t('修正發布日')}{' '}
                      {moment(item.announce_at ? item.announce_at : item.guideline?.announce_at ? item.guideline?.announce_at : null).format('YYYY-MM-DD')}
                    </WsDes>
                  )}
                </WsCard>
              </TouchableOpacity>
            </>
          ) : (
            <WsInfo
              type="link"
              value={displayValue}
              style={{
                maxWidth: width * 0.8,
                flexWrap: 'wrap',
              }}
              onPress={() => {
                $_onTitlePress()
              }}
            />
          )}
        </View>
      </TouchableOpacity>

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
          _setModalArticle={setModalArticle}
        />
      </WsModal>
    </>
  );
};

export default LlRelatedGuidelineItem001;
