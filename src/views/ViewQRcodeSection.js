import React from 'react'
import {
  View,
  ImageBackground,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Touchable,
  Dimensions,
  FlatList,
  Linking
} from 'react-native'
import {
  WsText,
  WsFlex,
  WsBtn,
  WsState,
  WsErrorMessage,
  WsFastImage,
  WsPopup,
  WsDialog,
  WsGradientButton,
  WsBottomRoundContainer,
  WsInfiniteScroll,
  WsPaddingContainer,
  LlEventCard001,
  WsSkeleton
} from '@/components'
import gLayout from '@/__reactnative_stone/global/layout'
import $color from '@/__reactnative_stone/global/color'
import Validator from '@/__reactnative_stone/services/validator'
import $config from '@/__config'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { useRoute } from '@react-navigation/native';
import S_QRcode from '@/services/api/v1/qrcode'
import { useNavigation } from '@react-navigation/native'
import store from '@/store'
import { useSelector } from 'react-redux'
import {
  setCurrentFactory,
} from '@/store/data'
import S_Factory from '@/services/api/v1/factory'

const ViewQRcodeSection = (props) => {
  const { t, i18n } = useTranslation()
  const currentLang = i18n.language
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()
  const _stack = navigation.getState().routes

  // PROPS
  const {
    source = $config.component.LoginSection001.source,
  } = props

  const {
    url
  } = props.route.params

  // REDUX
  const currentFactory = useSelector(state => state.data.currentFactory)

  // STATES
  const [linkList, setLinkList] = React.useState()
  const [paramsForQRcodeList, setParamsForQRcodeList] = React.useState({})
  const [loading, setLoading] = React.useState(true)

  // Services
  const $_fetchApi = React.useCallback(async () => {
    if (!paramsForQRcodeList || !currentFactory) return;
    try {
      if (!paramsForQRcodeList.url) {
        return
      }
      const res = await S_QRcode.findByUrl({ params: paramsForQRcodeList });
      if (res) {
        setLoading(false);
        setLinkList(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [paramsForQRcodeList, currentFactory]);

  const $_checkoutFactory = async (id) => {
    const _factory = await S_Factory.show({ modelId: id })
    store.dispatch(setCurrentFactory(_factory))
  }

  React.useEffect(() => {
    if (url) {
      const _params = S_QRcode.parseUrlParamsByQRcodeList(url)
      setParamsForQRcodeList(_params)
      if (currentFactory && _params && (currentFactory.id != _params.factory)) {
        $_checkoutFactory(_params.factory)
      }
    }
  }, [url])

  React.useEffect(() => {
    if (paramsForQRcodeList) {
      $_fetchApi()
    }
  }, [currentFactory, paramsForQRcodeList])

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{
          flex: 1,
          backgroundColor: 'white'
        }}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View
            style={{
              flex: 1
            }}>
            <ImageBackground
              style={{
                alignItems: 'center',
                width: '100%',
                height: gLayout.windowWidth * 0.442,
                resizeMode: 'contain'
              }}
              source={source}>
              <View style={styles.heroOverlay} />
            </ImageBackground>

            <WsBottomRoundContainer
              style={{
                marginBottom: 150
              }}
            >
              {linkList ? (
                <FlatList
                  data={linkList.links}
                  keyExtractor={(item, itemIndex) => itemIndex}
                  renderItem={({ item, index }) => (
                    <WsGradientButton
                      onPress={() => {
                        if (item.url) {
                          const _params = S_QRcode.parseUrlParams(item.url)
                          if (_params.hasAssignmentIndex) {
                            navigation.navigate('RoutesCheckList', {
                              screen: 'RelatedChecklistAssignment',
                              params: {
                                id: _params.modelId,
                                checklistId: _params.modelId,
                                // lastVersionId: checkList.last_version.id
                              }
                            })
                          }
                          else if (_params && _params.modelId && _params.hasAssignmentIndex == false) {
                            // DON'T USE PUSH
                            navigation.navigate('RoutesCheckList', {
                              screen: 'CheckListShow',
                              params: {
                                id: _params.modelId
                              }
                            })
                          } else {
                            Linking.openURL(item.url);
                          }
                        }
                      }}
                      style={{
                        marginBottom: 16,
                      }}>
                      {t(item.name)}
                    </WsGradientButton>
                  )}
                />
              ) : (
                <WsSkeleton></WsSkeleton>
              )}
            </WsBottomRoundContainer>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  )
}

const styles = StyleSheet.create({
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: gLayout.windowWidth,
    height: gLayout.windowWidth * 0.442,
    backgroundColor: $color.primary,
    opacity: 0.5,
    zIndex: 0
  }
})

export default ViewQRcodeSection
