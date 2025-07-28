import React from 'react'
import { View, Pressable, TouchableOpacity } from 'react-native'
import {
  WsCard,
  WsText,
  WsFlex,
  WsIcon,
  WsNumberCircle,
  WsDes
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import S_ArticleVersion from '@/services/api/v1/article_version'

const LlRelatedArticleCard001 = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    item,
    onPress,
    style,
  } = props


  // STATES
  const [relativeArticle, setRelativeArticle] = React.useState()
  // console.log(relativeArticle,'relativeArticle--');

  // 取得相關法條
  const $_fetchRelativeArticle = async () => {
    try {
      const _article = await S_ArticleVersion.show(item.id)
      setRelativeArticle(_article)
    } catch (e) {
      console.log(e.message, 'error')
    }
  }

  React.useEffect(() => {
    if (item) {
      $_fetchRelativeArticle()
    }
  }, [item])

  return (
    <>
      {relativeArticle && (
        <View
          style={{
            marginTop: 16
          }}
        >
          <WsText
            fontWeight={500}
            style={{
              paddingHorizontal: 16,
            }}
          >{t('相關法條')}
          </WsText>

          <TouchableOpacity
            onPress={onPress}
            style={{
              marginTop: 8
            }}
          >
            <WsCard
              padding={0}
              style={[
                {
                  padding: 16,
                  marginHorizontal: 16
                },
                style
              ]}>
              <WsFlex>

                <View
                  style={{
                    flex: 1
                  }}
                >
                  <WsFlex
                    style={{
                    }}
                  >
                    <WsIcon
                      name="ll-nav-assignment-filled"
                      size={24}
                      style={{
                        marginRight: 4
                      }}
                      color={$color.primary}
                    />
                  </WsFlex>

                  <WsText
                    style={{
                      marginTop: 8
                    }}
                  >{`${relativeArticle?.act_version?.name} ${relativeArticle?.no_text}`}
                  </WsText>

                  <WsFlex
                    style={{
                      marginTop: 8
                    }}
                    justifyContent="space-between"
                  >
                    {relativeArticle &&
                      relativeArticle.announce_at && (
                        <WsFlex>
                          <WsDes
                            size={12}
                            color={$color.white9d}
                          >
                            {i18next.t('法條發布')} {moment(relativeArticle.announce_at).format('YYYY-MM-DD')}
                          </WsDes>
                        </WsFlex>
                      )}
                  </WsFlex>
                </View>
              </WsFlex>
            </WsCard>
          </TouchableOpacity>
        </View>
      )}
    </>
  )
}

export default LlRelatedArticleCard001
