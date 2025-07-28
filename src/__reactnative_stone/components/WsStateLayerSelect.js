import React from 'react'
import {
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Text,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  StyleSheet
} from 'react-native'
import {
  WsText,
  WsNavCheck,
  WsFlex,
  WsBtnSelect,
  WsModal,
  WsSkeleton,
  WsState,
  WsIcon,
  WsTag,
  WsCollapsible,
  WsPaddingContainer,
  WsIconBtn
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { actions, RichEditor, RichToolbar } from "react-native-pell-rich-editor";
import { WebView } from "react-native-webview";
import DraggableFlatList from "react-native-draggable-flatlist";

const WsStateLayerSelect = props => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // Props
  const {
    value,
    onChange,
    items = [
      {
        id: '1',
        name: '第一章',
        parentId: null,
      },
      {
        id: '2',
        name: '第一節',
        parentId: '1',
      },
      {
        id: '3',
        name: '1-1條',
        parentId: '2',
      },
      {
        id: '4',
        name: '第二節',
        parentId: '1',
      },
      {
        id: '5',
        name: '2-1條',
        parentId: '4',
      },
    ],
    placeholder,
    title,
  } = props

  const webViewRef = React.useRef(null);

  // ✅ 確保 WebView 內的 JavaScript 允許 `postMessage`
  const injectedJavaScript = `
    window.ReactNativeWebView.postMessage("WebView Initialized");
    true;
  `;

  // 取得 HTML 內容
  const handleMessage = (event) => {
    console.log("HTML 內容:", event.nativeEvent.data);
  };

  // State
  const richText = React.useRef();
  const handleHead = ({ tintColor }) => <Text style={{ color: tintColor }}>H1</Text>
  const [articleCollapsed, setArticleCollapsed] = React.useState(true)
  const [mode, setMode] = React.useState('add_layer')
  const [data, setData] = React.useState(items);
  const [modalActive, setModalActive] = React.useState(false)

  // 點擊非編輯器區域時關閉鍵盤
  const dismissKeyboard = () => {
    richText.current?.blurContentEditor(); // 關閉 RichEditor 鍵盤
    Keyboard.dismiss(); // 確保鍵盤關閉
  };

  // func
  const $_addLayerOrArticle = (e) => {
    if (e === 'add_layer') {
      const newId = (data.length + 1).toString(); // 產生新的 ID
      const newItem = {
        id: newId,
        name: `新項目 ${newId}`,
        parentId: null
      }; // 新增的物件
      setData([...data, newItem]); // 更新陣列
    } else if (e === 'add_article') {
      const newId = (data.length + 1).toString(); // 產生新的 ID
      const newItem = {
        id: newId,
        name: `新項目 ${newId}`,
        parentId: null
      }; // 新增的物件
      setData([...data, newItem]); // 更新陣列
    }
  }

  // Render
  return (
    <>
      <WsFlex
        style={{
          // borderWidth:2,
        }}
        justifyContent="space-between"
      >
        <WsState
          type={"radio"}
          items={[
            { label: t('新增層級'), value: 'add_layer' },
            { label: t('新增條文'), value: 'add_article' },
          ]}
          value={mode}
          onChange={(e) => {
            setMode(e)
            $_addLayerOrArticle(e)
          }}
          style={{
          }}
        ></WsState>
      </WsFlex>

      {mode === 'add_layer' && (
        <WsState
          style={{
            flex: 1,
            // marginLeft: 16,
          }}
          label={t('層級名稱')}
          placeholder={t(' ')}
          value={''}
          onChange={() => { }}
        >
        </WsState>
      )}
      {mode === 'add_article' && (
        <ScrollView>
          <WsPaddingContainer
            padding={16}
            style={{
              // marginLeft: 16 * 2,
              marginLeft: 4,
              borderBottomRightRadius: articleCollapsed ? 0 : 10,
              borderBottomLeftRadius: articleCollapsed ? 0 : 10,
              backgroundColor: $color.white,
              borderWidth: 0.3,
              borderTopWidth: 0,
              borderLeftWidth: 5,
              borderLeftColor: $color.primary4l,
            }}
          >

            <WsState
              style={{
              }}
              type="date"
              label={t('發布日期')}
              value={''}
              onChange={$event => {
                // onChange($event, 'answer_value', question, 'question')
              }}
              placeholder={t('選擇日期')}
              backgroundColor={$color.primary11l}
            />
            <WsState
              style={{
                marginTop: 8
              }}
              type="date"
              label={t('生效日期')}
              value={''}
              onChange={$event => {
                // onChange($event, 'answer_value', question, 'question')
              }}
              placeholder={t('選擇日期')}
              backgroundColor={$color.primary11l}
            />
            <WsState
              style={{
                marginTop: 8
              }}
              type="Ll_filesAndImages"
              label={t('附件')}
              value={[]}
              onChange={() => {

              }}
            />
            <WsState
              style={{
                marginTop: 8
              }}
              type="belongstomany"
              modelName={'factory_effects'}
              nameKey={'name'}
              label={t('風險燈號')}
              searchBarVisible={true}
              placeholder={'select...'}
              value={[]}
              onChange={() => { }}
            />
            <WsState
              style={{
                marginTop: 8
              }}
              type="switch"
              label={t('啟用')}
              value={''}
              onChange={() => {

              }}
            />
            <WsState
              style={{
                marginTop: 8
              }}
              type="belongstomany"
              modelName={'act_status'}
              nameKey={'name'}
              label={t('狀態')}
              searchBarVisible={true}
              placeholder={'select...'}
              value={[]}
              onChange={() => { }}
            />
            <WsState
              style={{
                marginTop: 8,
              }}
              label={t('法條內容')}
              multiline={true}
              value={''}
              onChange={$event => {
              }}
              placeholder={t('請輸入法條內容')}
            />

            <>
              <WsText size={14} style={{ marginTop: 16 }} fontWeight={600}>{t('法條內容 (含HTML)')}</WsText>

              <View
                style={{
                  // flex: 1
                  height: 500,
                  width: width * 0.9
                }}
              >
                <WebView
                  ref={webViewRef}
                  originWhitelist={["*"]}
                  source={{ html: htmlContent }}
                  javaScriptEnabled
                  domStorageEnabled
                  injectedJavaScript={injectedJavaScript}
                  onMessage={handleMessage} // 監聽 WebView 內 TinyMCE 的變化
                />
              </View>
            </>
          </WsPaddingContainer>
        </ScrollView>
      )}
      {mode === 'dragSort' && (
        <DraggableFlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index, drag, isActive }) => (
            <View key={index}>
              {item.parentId == null && (
                <TouchableOpacity
                  style={[
                    { backgroundColor: isActive ? "lightgray" : "white" }
                  ]}
                  onLongPress={drag} // 長按開始拖動
                >
                  <WsFlex
                    style={{
                      padding: 16,
                      borderWidth: 1,
                      borderRadius: 10,
                      borderLeftWidth: 5,
                      borderLeftColor: $color.primary,
                      marginTop: 16,
                    }}
                  >
                    <WsText>{t('章')}</WsText>
                    <WsState
                      style={{
                        flex: 1,
                        marginLeft: 16,
                      }}
                      placeholder={t(' ')}
                      value={item.name}
                      onChange={() => { }}
                    >
                    </WsState>
                  </WsFlex>
                </TouchableOpacity>
              )}

              {item.parentId == '1' && (
                <TouchableOpacity
                  key={index}
                  style={[
                    { backgroundColor: isActive ? "lightgray" : "white" }
                  ]}
                  onLongPress={drag} // 長按開始拖動
                >
                  <WsFlex
                    style={{
                      marginLeft: 16 * 1,
                      marginTop: 8,
                      padding: 16,
                      borderWidth: 1,
                      borderRadius: 10,
                      borderLeftWidth: 5,
                      borderLeftColor: $color.primary1l
                    }}
                  >
                    <WsText>{t('節')}</WsText>
                    <WsState
                      style={{
                        flex: 1,
                        marginLeft: 16,
                      }}
                      placeholder={t(' ')}
                      value={item.name}
                      onChange={() => { }}
                    >
                    </WsState>
                  </WsFlex>
                </TouchableOpacity>
              )}

              {item.parentId == '2' && (
                <>
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      // setArticleCollapsed(!articleCollapsed)
                      setModalActive(true)
                    }}
                    style={[
                      {
                        marginBottom: articleCollapsed ? 16 : 0,
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        borderBottomLeftRadius: articleCollapsed ? 10 : 0,
                        borderBottomRightRadius: articleCollapsed ? 10 : 0,
                        marginLeft: 16 * 2,
                        marginTop: 8,
                        padding: 16,
                        borderWidth: 1,
                        borderBottomWidth: articleCollapsed ? 1 : 0.3,
                        borderRadius: 10,
                        borderLeftWidth: 5,
                        borderLeftColor: $color.primary4l,
                      },
                      { backgroundColor: isActive ? "lightgray" : "white" }
                    ]}
                    onLongPress={drag} // 長按開始拖動
                  >
                    <WsFlex
                      style={{
                        maxWidth: width * 0.75
                      }}
                      justifyContent={'space-between'}
                    >
                      <WsFlex>
                        <WsText>{t('條')}</WsText>
                        <WsState
                          style={{
                            marginLeft: 16,
                            flex: 1,
                            flexWrap: 'wrap',
                          }}
                          value={item.name}
                          onChange={$event => {
                          }}
                          placeholder={t('請輸入法條內容')}
                        />
                      </WsFlex>
                      <WsIcon
                        name={articleCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                        size={24}
                        color={$color.primary3l}
                      ></WsIcon>
                    </WsFlex>
                  </TouchableOpacity>

                  <WsCollapsible isCollapsed={articleCollapsed}>
                    {!articleCollapsed && (
                      <WsPaddingContainer
                        padding={16}
                        style={{
                          marginLeft: 16 * 2,
                          borderBottomRightRadius: articleCollapsed ? 0 : 10,
                          borderBottomLeftRadius: articleCollapsed ? 0 : 10,
                          backgroundColor: $color.white,
                          borderWidth: 0.3,
                          borderTopWidth: 0,
                          borderLeftWidth: 5,
                          borderLeftColor: $color.primary4l,
                        }}
                      >

                        <WsState
                          style={{
                          }}
                          type="date"
                          label={t('發布日期')}
                          value={''}
                          onChange={$event => {
                            // onChange($event, 'answer_value', question, 'question')
                          }}
                          placeholder={t('選擇日期')}
                          backgroundColor={$color.primary11l}
                        />
                        <WsState
                          style={{
                            marginTop: 8
                          }}
                          type="date"
                          label={t('生效日期')}
                          value={''}
                          onChange={$event => {
                            // onChange($event, 'answer_value', question, 'question')
                          }}
                          placeholder={t('選擇日期')}
                          backgroundColor={$color.primary11l}
                        />
                        <WsState
                          style={{
                            marginTop: 8
                          }}
                          type="Ll_filesAndImages"
                          label={t('附件')}
                          value={[]}
                          onChange={() => {

                          }}
                        />
                        <WsState
                          style={{
                            marginTop: 8
                          }}
                          type="belongstomany"
                          modelName={'factory_effects'}
                          nameKey={'name'}
                          label={t('風險燈號')}
                          searchBarVisible={true}
                          placeholder={'select...'}
                          value={[]}
                          onChange={() => { }}
                        />
                        <WsState
                          style={{
                            marginTop: 8
                          }}
                          type="switch"
                          label={t('啟用')}
                          value={''}
                          onChange={() => {

                          }}
                        />
                        <WsState
                          style={{
                            marginTop: 8
                          }}
                          type="belongstomany"
                          modelName={'act_status'}
                          nameKey={'name'}
                          label={t('狀態')}
                          searchBarVisible={true}
                          placeholder={'select...'}
                          value={[]}
                          onChange={() => { }}
                        />
                        <WsState
                          style={{
                            marginTop: 8,
                          }}
                          label={t('法條內容')}
                          multiline={true}
                          value={''}
                          onChange={$event => {
                          }}
                          placeholder={t('請輸入法條內容')}
                        />

                        <>
                          <WsText size={14} style={{ marginTop: 16 }} fontWeight={600}>{t('法條內容 (含HTML)')}</WsText>
                          <View
                            style={{
                              borderWidth: 0.8,
                              marginTop: 8,
                              height: 200,
                            }}
                          >
                            <KeyboardAvoidingView
                              style={{
                                flex: 1, // DO NOT CLEAR,
                              }}
                              enabled
                              keyboardVerticalOffset={0}
                              behavior={Platform.OS === 'ios' ? 'padding' : null}
                            >
                              <RichToolbar
                                editor={richText}
                                actions={[
                                  actions.insertImage,
                                  actions.setBold,
                                  actions.setItalic,
                                  actions.insertBulletsList,
                                  actions.insertOrderedList,
                                  actions.insertLink,
                                  actions.keyboard,
                                  actions.setStrikethrough,
                                  actions.setUnderline,
                                  actions.removeFormat,
                                  actions.insertVideo,
                                  actions.checkboxList,
                                  actions.undo,
                                  actions.redo,
                                ]}
                                iconMap={{ [actions.heading1]: handleHead }}
                              />
                              <RichEditor
                                ref={richText}
                                onChange={descriptionText => {
                                  console.log("descriptionText:", descriptionText);
                                }}
                                onBlur={() => console.log("編輯器失焦")}
                                onFocus={() => console.log("編輯器獲得焦點")}
                                onDone={() => Keyboard.dismiss} // 手動關閉鍵盤
                              />
                            </KeyboardAvoidingView>
                          </View>
                        </>
                      </WsPaddingContainer>
                    )}
                  </WsCollapsible>
                </>
              )}
            </View>
          )}
          onDragEnd={({ data }) => {
            console.log(data, 'data')
            setData(data)
          }} // 更新排序後的資料
        />
      )}
    </>
  )
}

export default WsStateLayerSelect

const styles = StyleSheet.create({
  item: {
    padding: 20,
    marginVertical: 5,
    marginHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2 // Android 陰影
  },
  text: {
    fontSize: 18
  }
});
