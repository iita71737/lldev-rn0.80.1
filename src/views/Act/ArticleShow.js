import React from 'react'
import { ScrollView } from 'react-native'
import {
  WsFlex,
  WsText,
  WsPaddingContainer,
  WsInfo,
  WsIconBtn
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import S_ArticleVersion from '@/services/api/v1/article_version'

const ArticleShow = ({ route, navigation }) => {
  const { t, i18n } = useTranslation()
  //Params
  const { from, modelId, versionId } = route.params

  // State
  const [article, setArticle] = React.useState()


  // Services
  const $_fetchArticle = async () => {
    const res = await S_ArticleVersion.show(versionId)
    setArticle(res)
  }

  // Function
  const $_setTitle = article => {
    if (article && article.last_version && article.last_version.act_version) {
      return `${article.last_version.act_version.name} ${article.last_version.no_text}`
    } else if (article && article.last_version && article.last_version.act_versions) {
      return `${article.last_version.act_versions[0].name} ${article.last_version.no_text}`
    } else if (article.act_version && article.act_version.name) {
      return `${article.act_version.name}`
    } else {
      return toString(t('無'))
    }
  }

  // Options
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerLeft: () => (
        <WsIconBtn
          name={'md-arrow-back'}
          color="white"
          size={24}
          style={{
            marginRight: 4
          }}
          onPress={() => {
            if (from) {
              navigation.navigate({
                name: from.name,
                params: {
                  id: from.modelId
                }
              })
            } else {
              navigation.goBack()
            }
          }}
        />
      )
    })
  }

  React.useEffect(() => {
    $_fetchArticle()
  }, [versionId])

  React.useEffect(() => {
    if (from) {
      $_setNavigationOption()
    }
  }, [from])

  return (
    <ScrollView>
      {article && (
        <>
          <WsPaddingContainer style={{ backgroundColor: $color.white }}>
            <WsText size={28}>{$_setTitle(article.article)}{'  '}{article.no_text}</WsText>
          </WsPaddingContainer>
          <WsPaddingContainer style={{ backgroundColor: $color.white }}>
            <WsText>{article.content}</WsText>
          </WsPaddingContainer>
          {article.attaches.length != 0 && (
            <WsPaddingContainer>
              <WsInfo label={t('附件')} type="files" value={article.attaches} />
            </WsPaddingContainer>
          )}
        </>
      )}
    </ScrollView>
  )
}

export default ArticleShow
