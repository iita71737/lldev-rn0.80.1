import React, { useState } from 'react'
import { StyleSheet, View, SafeAreaView, TouchableOpacity } from 'react-native'
import {
  WsDes,
  WsBtn,
  WsPaddingContainer,
  WsText,
  WsFlex,
  WsTitle,
  WsHtmlRender,
  LlBtnAct001,
  WsModal,
  WsStateInput,
  WsIcon,
  WsLoading,
  WsInfo,
  LlNavButton002,
  LlArticleDiffCard001
} from '@/components'
import LlToggleTabBar001 from '@/components/LlToggleTabBar001'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { WebView } from 'react-native-webview'
import AsyncStorage from '@react-native-community/async-storage'
import { useRoute } from '@react-navigation/native'

const LlArticleCard001 = props => {
  const { t, i18n } = useTranslation()
  const route = useRoute()

  // Props
  const {
    style,
    article,
    navigation,
    title,
    actId,
    articleId
  } = props

  // States
  const [stateModal, setStateModal] = React.useState(false)

  // Functions
  const $_setStorage = async articleId => {
    const _defaultValue = {
      article_version: articleId,
      name: '測試任務綁評析ＱＡＱ',
      system_classes: [4],
      system_subclasses: [
        {
          icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970290907Hxye/%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?expires=1654022963&signature=fa2d4a1bbc892bf1046257669688014c15daa7b243f86a44ed5607a9242995dc',
          id: 14,
          name: '空氣污染防治',
          sequence: '1'
        },
        {
          icon: 'https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970291166yRtf/%E6%B0%B4%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?expires=1654022963&signature=d5eaf009a52b405937170d07919064d13fcfeb46f1bda497d32d473a8dc3519e',
          id: 15,
          name: '水污染防治',
          sequence: '2'
        }
      ],
      remark: '測試任務綁評析',
      done_at: '2021-10-10',
      checked_at: '2022-09-10',
      expired_at: '2022-08-08',
      taker: {
        avatar:
          'https://api.ll-esh-app.wasateam.com/api/user/avatar/1629873393pKt66/heyhey.jpg?expires=1653989542&signature=d7aa21cc9e46e2a0caa5c88945f0f8bf1d5030f22819868bbb2482738e71dce3',
        id: 1,
        name: '蔡A辣'
      },
      creator: 1,
      sub_tasks: [
        {
          factory: 1,
          done_at: '2022-10-20',
          start_at: '2022-10-10',
          expired_at: '2020-10-21',
          name: 'name',
          remark: 'remark',
          reply: 'reply',
          taker: 1,
          leader: 1,
          creator: 1,
          images: [],
          attaches: [],
          reply_images: [],
          reply_attaches: []
        }
      ],
      factory: 1
    }

    const _task = JSON.stringify(_defaultValue)
    await AsyncStorage.setItem('TaskCreate', _task)
  }

  const $_createTask = () => {
    navigation.push('RoutesTask', {
      screen: 'TaskCreateFromAct',
      params: {
        articleId: articleId,
      }
    })
  }

  const $_isEffect = effect => {
    const diff = moment(new Date()).diff(moment(effect), 'days')
    if (diff < 0) {
      return true
    } else {
      return false
    }
  }

  return (
    <>
      {article && (
        <>
          <WsPaddingContainer
            style={[
              {
                backgroundColor: $color.white
              },
              style
            ]}>
            {article.no_text != '' && (
              <WsFlex
                justifyContent="space-between"
                style={{
                  marginBottom: 16,
                  // borderWidth:2
                }}>
                <WsText size={14} fontWeight={'600'}>
                  {article.no_text}
                </WsText>

                {article.effect_at && (
                  <WsDes
                    style={{
                    }}>
                    {t('生效日')}
                    {moment(article.effect_at).format('YYYY-MM-DD')}
                  </WsDes>
                )}

              </WsFlex>
            )}

            <LlArticleDiffCard001
              article={article}
              articleId={article.article.id}
              prevId={article.prev_version && article.prev_version[0] ? article.prev_version[0].id : null}
            />

          </WsPaddingContainer>
          {article.ll_comment != '' && (
            <WsModal
              title={t('ESGoal評析')}
              visible={stateModal}
              onBackButtonPress={() => {
                setStateModal(false)
              }}
              headerLeftOnPress={() => {
                setStateModal(false)
              }}
              footerBtnLeftIcon={'ws-outline-advisory'}
              footerBtnLeftText={t('諮詢')}
              footerBtnLeftOnPress={() => {
                setStateModal(false)
                navigation.navigate('LegalAdvice')
              }}
              footerBtnRightText={t('建立任務')}
              footerBtnRightIcon={'ll-nav-assignment-filled'}
              footerBtnRightOnPress={() => {
                setStateModal(false)
                $_createTask()
              }}
              animationType="slide">
              {title && <WsText style={{ padding: 16 }}>{title}</WsText>}
              <WsPaddingContainer
                padding={0}
                style={{
                  backgroundColor: $color.primary11l
                }}>
                <WsFlex
                  style={{
                    padding: 16,
                    paddingBottom: 0
                  }}
                  justifyContent="space-between">
                  <WsText fontWeight={'600'}>{t('ESGoal評析')}</WsText>
                  <WsText color={$color.gray} size={12}>
                    {t('更新時間')}
                    {moment(article.updated_at).format('YYYY-MM-DD')}
                  </WsText>
                </WsFlex>
                <WsInfo
                  style={{ marginHorizontal: 16 }}
                  type="icon"
                  value={article.effects}
                />
                <WsFlex>
                  <WsText style={{ padding: 16 }}>
                    {article.ll_comment ? article.ll_comment : t('無')}
                  </WsText>
                </WsFlex>
                {article.task && (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      padding: 16,
                    }}
                    onPress={() => {
                      setStateModal(false)
                      navigation.push('RoutesTask', {
                        screen: 'TaskShow',
                        params: {
                          id: article.task.id,
                        }
                      })
                    }}>
                    <View
                      style={{
                        flexDirection: 'row'
                      }}>
                      <WsIcon name="ll-nav-assignment-filled" size={24} />
                      <WsText color={$color.primary}>
                        {t('查看此評析相關任務')}
                      </WsText>
                    </View>
                    <View>
                      <WsIcon name="ws-outline-arrow-right" size={24} />
                    </View>
                  </TouchableOpacity>
                )}
              </WsPaddingContainer>
            </WsModal>
          )}
        </>
      )}
    </>
  )
}

export default LlArticleCard001
