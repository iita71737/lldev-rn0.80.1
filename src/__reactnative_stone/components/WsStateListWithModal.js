import React from 'react'
import { ScrollView, View, TouchableOpacity } from 'react-native'
import {
  WsText,
  WsInfo,
  WsTag,
  WsFlex,
  WsPaddingContainer,
  WsInfoImage,
  WsIcon,
  WsModal
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import gColor from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'

const WsStateListWithModal = props => {
  // i18n
  const { t, i18n } = useTranslation()

  // State
  const [stateModal, setStateModal] = React.useState(false)
  const [selectVersionId, setSelectVersionId] = React.useState()

  const { value, title } = props

  //Function
  const $_setArticleText = article => {
    if (article.act_version) {
      return `${article.act_version.name} ${article.no_text}`
    } else if (article.act_versions) {
      return `${article.act_versions[0].name} ${article.no_text}`
    } else {
      return t('無')
    }
  }

  return (
    <>
      <View
        style={{
          borderRadius: 10
        }}>
        {value && value.length !== 0 ? (
          <>
            {value.map((article, articleIndex) => {
              return (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectVersionId(article.id)
                      setStateModal(true)
                    }}>
                    <View
                      style={{
                        marginHorizontal: 16,
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center'
                      }}>
                      <WsInfo
                        type="link"
                        value={$_setArticleText(article)}
                        style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginHorizontal: 16
                        }}
                        onPress={() => {
                          setSelectVersionId(article.id)
                          setStateModal(true)
                        }}
                      />
                    </View>
                  </TouchableOpacity>
                </>
              )
            })}
            <WsModal
              title={title}
              visible={stateModal}
              headerLeftOnPress={() => {
                setStateModal(false)
              }}
              onBackButtonPress={() => {
                setStateModal(false)
              }}>
              <ViewArticleShowForModal versionId={selectVersionId} />
            </WsModal>
          </>
        ) : (
          <WsText>{t('無')}</WsText>
        )}
      </View>
    </>
  )
}

export default WsStateListWithModal
