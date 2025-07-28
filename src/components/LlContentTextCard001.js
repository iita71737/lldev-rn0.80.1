import React from 'react'
import {
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native'
import { useWindowDimensions } from 'react-native'
import {
  WsIcon,
  WsText,
  WsUser,
  WsInfo,
  WsFlex,
  WsPaddingContainer,
  WsInfoForm,
  WsCard,
  WsIconBtn,
  WsModal,
  WsState,
  WsAvatar,
  WsLoading
} from '@/components'
import { useSelector } from 'react-redux'
import {
  setCurrentUser
} from '@/store/data'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation, withSSR } from 'react-i18next'
import moment from 'moment'
import store from '@/store'
import {
  setRefreshCounter
} from '@/store/data'
import S_FactoryTranslation from '@/services/api/v1/factory_translation'
import S_ContextText from '@/services/api/v1/content_text'
import G_i18n from '@/__reactnative_stone/global/i18n'
import i18next from 'i18next'
import S_API_Auth from '@/__reactnative_stone/services/api/v1/auth'
import S_Lang from '@/__reactnative_stone/services/app/lang'

const LlContentTextCard001 = props => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    item,
    style,
    contentTextLocale
  } = props

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentUser = useSelector(state => state.data.currentUser)

  // STATES
  const [loading, setLoading] = React.useState(false)
  const [modalActive002, setModalActive002] = React.useState(false)
  const [modalActive, setModalActive] = React.useState(false)
  const [_data, setData] = React.useState({
    ...item,
    content_text: item?.id,
    factory_translation: item?.factory_translation?.id,
    translation: item?.translation.id,
    text: item?.factory_translation?.text,
    locale: contentTextLocale.id,
  })

  // console.log(_data,'_data--');


  // helper 
  const $_validation = () => {
    return false
  }

  const updateI18nFromApi = async (_locale) => {
    const res = await S_ContextText.i18nIndex({
      params: { locale: _locale?.locale?.id }
    })
    const payload = S_Lang.i18nVueToReactFormat(res.data)
    i18next.addResourceBundle(_locale?.locale?.id, 'translation', payload, true, true)
    await i18next.changeLanguage(_locale?.locale?.id)
    console.log('✅ 語系已更新:', _locale?.locale?.name)
    store.dispatch(setRefreshCounter(currentRefreshCounter + 1));
    setTimeout(() => {
      setLoading(false)
    }, 300)
  }

  // submit
  const $_submit = () => {
    setLoading(true)
    if (_data.factory_translation) {
      const _params = {
        content_text: _data?.content_text_id,
        factory_translation: _data?.factory_translation?.id,
        locale: _data?.locale_id,
        text: _data?.text ? _data?.text : null,
        translation: _data?.translation_id,
      };
      console.log(_params, '_params111');
      S_FactoryTranslation.update({ params: _params })
        .then(async (res) => {
          console.log(res, 'S_FactoryTranslation.update success');
          updateI18nFromApi(res)
        })
        .catch(error => {
          Alert.alert(t('編輯異常'));
          console.error('Error during API process:', error);
        });
    } else {
      const _params = {
        text: _data?.text,
        content_text: _data?.content_text_id,
        locale: _data?.locale_id,
        translation: _data?.translation_id,
      };
      console.log(_params, '_params222');
      S_FactoryTranslation.create({ params: _params })
        .then(async (res) => {
          console.log(res, 'S_FactoryTranslation.create success');
          store.dispatch(setRefreshCounter(currentRefreshCounter + 1));
          updateI18nFromApi(res)
        })
        .catch(error => {
          Alert.alert(t('建立異常'));
          console.error('Error during API process:', error);
        });
    }
  }

  // Render
  return (
    <>
      <TouchableOpacity
        onPress={() => {
          setData({
            ...item,
            text: item?.factory_translation?.text,
            content_text_id: item?.id,
            locale_id: contentTextLocale.id,
            translation_id: item?.translation.id
          })
          setModalActive002(true)
        }}
      >
        <WsCard
          padding={0}
          style={{
            marginHorizontal: 8,
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: $color.white,
            marginBottom: 8,
          }}
        >
          <WsIconBtn
            padding={0}
            name="md-edit"
            size={24}
            color={$color.primary}
            style={{
              position: 'absolute',
              right: 16,
              top: 8,
              zIndex: 999
            }}
            onPress={() => {
              setData({
                ...item,
                text: item?.factory_translation?.text ? item?.factory_translation?.text : null,
                content_text_id: item?.id,
                locale_id: contentTextLocale.id,
                translation_id: item?.translation.id
              })
              setModalActive(true)
            }}
          />

          <View
            style={{
              // borderWidth: 1,
            }}
            flexWrap={'wrap'}
            justifyContent={'space-between'}
          >
            <WsText fontWeight={600}>{t('初始文案')}</WsText>
            <WsText
              style={{
                maxWidth: width * 0.9,
              }}
            >
              {item?.translation?.text ? item?.translation?.text : t('無')}
            </WsText>
          </View>

          <View
            style={{
              marginTop: 8,
              // borderWidth: 1,
            }}
            flexWrap={'wrap'}
            justifyContent={'space-between'}
          >
            <WsText fontWeight={600}>{t('自設文案')}</WsText>
            {loading ? (
              <View
                style={{
                  transform: [{ rotate: '180deg' }],
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <WsLoading size={30}></WsLoading>
              </View>
            ) : (
              <WsText
                style={{
                  maxWidth: width * 0.9,
                }}>
                {item?.factory_translation?.text ? item?.factory_translation?.text : ''}
              </WsText>
            )}
          </View>



        </WsCard>
      </TouchableOpacity>

      <WsModal
        visible={modalActive}
        onBackButtonPress={() => {
          setModalActive(false)
        }}
        headerLeftOnPress={() => {
          setModalActive(false)

        }}
        headerRightOnPress={() => {
          $_submit()
          setModalActive(false)
        }}
        RightOnPressIsDisabled={$_validation()}
        headerRightText={t('儲存')}
        title={t('編輯自設文案')}
      >
        <ScrollView>
          <WsPaddingContainer>

            <WsState
              editable={false}
              type="text"
              style={{
                marginVertical: 8
              }}
              label={t('語言')}
              value={contentTextLocale?.name}
              onChange={() => { }}
            />

            <WsState
              editable={false}
              type="text"
              style={{
                marginVertical: 8
              }}
              label={t('初始文案')}
              value={_data?.translation?.text ? _data?.translation?.text : t('無')}
              onChange={() => { }}
            />

            <WsState
              type="text"
              style={{
                marginVertical: 8
              }}
              label={t('自設文案')}
              value={_data?.text}
              onChange={(e) => {
                setData({
                  ..._data,
                  text: e,
                })
              }}
            />
          </WsPaddingContainer>
        </ScrollView>
      </WsModal>

      <WsModal
        visible={modalActive002}
        onBackButtonPress={() => {
          setModalActive002(false)
        }}
        headerLeftOnPress={() => {
          setModalActive002(false)
        }}
        headerRightOnPress={() => {
          setModalActive002(false)
        }}
        title={t('文案')}
      >
        <ScrollView>
          <WsPaddingContainer>
            <View
              style={{
              }}
            >
              <WsInfo
                labelWidth={100}
                value={contentTextLocale?.name ? contentTextLocale.name : currentUser?.locale?.name}
                label={t('語言')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              />
            </View>

            <View
              style={{
                // borderWidth: 1,
                marginTop: 8
              }}
              flexWrap={'wrap'}
              justifyContent={'space-between'}
            >
              <WsText fontWeight={600}>{t('初始文案')}</WsText>
              <WsText
                style={{
                  maxWidth: width * 0.9,
                }}
              >
                {item?.translation?.text ? item?.translation?.text : t('無')}
              </WsText>
            </View>

            <View
              style={{
                marginTop: 8,
                // borderWidth: 1,
              }}
              flexWrap={'wrap'}
              justifyContent={'space-between'}
            >
              <WsText fontWeight={600}>{t('自設文案')}</WsText>
              <WsText
                style={{
                  maxWidth: width * 0.9,
                }}>
                {item?.factory_translation?.text ? item?.factory_translation?.text : ''}
              </WsText>
            </View>

            <View
              style={{
                marginTop: 8
              }}
            >
              <WsInfo
                labelWidth={100}
                type="user"
                label={t('編輯者')}
                value={_data?.factory_translation?.updated_user}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              />
            </View>

            <View
              style={{
                marginTop: 8
              }}
            >
              <WsInfo
                labelWidth={100}
                label={t('編輯時間')}
                value={_data?.factory_translation?.updated_at ? moment(_data?.factory_translation?.updated_at).format('YYYY-MM-DD HH:mm:ss') : t('無')}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              />
            </View>

          </WsPaddingContainer>
        </ScrollView>
      </WsModal>
    </>
  )
}

export default LlContentTextCard001
