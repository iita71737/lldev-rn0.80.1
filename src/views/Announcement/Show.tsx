// Show.js
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Share,
  Dimensions,
  StyleSheet,
  Platform,
  ActivityIndicator,
  Linking,
  useWindowDimensions
} from 'react-native';
import {
  WsSnackBar,
  WsIconBtn,
  WsInfo
} from '@/components'
import axios from 'axios';
import RenderHTML, {
  HTMLContentModel,
  defaultHTMLElementModels,
  HTMLElementModel,
} from 'react-native-render-html';
import Video from 'react-native-video';
import moment from 'moment';
import $color from '@/__reactnative_stone/global/color';
import FastImage from 'react-native-fast-image';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import S_Announcement from '@/services/api/v1/announcement'
import { useSelector } from 'react-redux'
import store from '@/store'
import { setRefreshCounter } from '@/store/data'
import table, {
  IGNORED_TAGS,
  defaultTableStylesSpecs,
  cssRulesFromSpecs,
  tableModel,
} from '@native-html/table-plugin';
import { WebView } from 'react-native-webview';

// ---- 小封裝：FastImage + loading/失敗佔位 ----
const FastLoadingImage = ({
  uri,
  style,
  resizeMode = 'contain',
  priority = 'normal',
  cache = 'immutable',
  headers,
  showPercent = false,
  fitWidth = false,
  placeholderRatio = 16 / 9,
  knownSize,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [pct, setPct] = useState(0);
  const [error, setError] = useState(false);
  const [ratio, setRatio] = useState(
    knownSize?.w && knownSize?.h ? knownSize.w / knownSize.h : null
  );

  const onLoadStart = useCallback(() => {
    setLoading(true);
    setPct(0);
    setError(false);
  }, []);

  const onProgress = useCallback((e) => {
    const { loaded, total } = e?.nativeEvent || {};
    if (total) setPct(Math.round((loaded / total) * 100));
  }, []);

  const onLoad = useCallback((e) => {
    setLoading(false);
    const { width, height } = e?.nativeEvent || {};
    if (width && height) setRatio(width / height);
  }, []);

  const onError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  const containerStyle = [
    style,
    fitWidth && { width: screenWidth, aspectRatio: ratio || placeholderRatio },
    { overflow: 'hidden' },
  ];

  return (
    <View style={containerStyle}>
      <FastImage
        style={StyleSheet.absoluteFillObject}
        source={{
          uri,
          priority: FastImage.priority[priority],
          cache: FastImage.cacheControl[cache],
          headers,
        }}
        resizeMode={FastImage.resizeMode[resizeMode]}
        onLoadStart={onLoadStart}
        onProgress={onProgress}
        onLoad={onLoad}
        onError={onError}
      />
      {loading && !error && (
        <View style={[StyleSheet.absoluteFillObject, styles.center]}>
          <ActivityIndicator />
          {showPercent && pct > 0 ? <Text style={styles.gray}>{pct}%</Text> : null}
        </View>
      )}
      {error && (
        <View style={[StyleSheet.absoluteFillObject, styles.center, { backgroundColor: '#e2e8f0' }]}>
          <Text style={styles.gray}>Image failed</Text>
        </View>
      )}
    </View>
  );
};

export default function Show() {
  const { t } = useTranslation();
  const { width } = Dimensions.get('window');
  const contentWidth = width - 32;
  const navigation = useNavigation();
  const route = useRoute();
  const id = route?.params?.id;

  // redux
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // states
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('已儲存至「我的收藏」')
  )
  const [isCollect, setIsCollect] = React.useState()

  // Service
  const bookmarkOnPress = async () => {
    try {
      if (isCollect) {
        setIsSnackBarVisible(false)
        setIsSnackBarVisible(true)
        setIsCollect(false)
        setSnackBarText('已從我的收藏中移除')
        const _params = { id, factory: currentFactory?.id }
        await S_Announcement.removeMyCollect({ params: _params })
        store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
      } else {
        setIsSnackBarVisible(false)
        setIsSnackBarVisible(true)
        setIsCollect(true)
        setSnackBarText('已儲存至「我的收藏」')
        const _params = { id, factory: currentFactory?.id }
        await S_Announcement.addMyCollect({ params: _params })
        store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
      }
    } catch (e) {
      console.error(e, 'e');
    }
  }

  // 設置 Header
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <WsIconBtn
          name={post?.is_collect ? 'md-bookmark' : 'ws-outline-bookmark'}
          size={24}
          color={$color.white}
          underlayColorPressIn="transparent"
          style={{ marginRight: 4 }}
          onPress={bookmarkOnPress}
        />
      ),
      headerLeft: () => (
        <WsIconBtn
          testID="backButton"
          name="ws-outline-arrow-left"
          color="white"
          size={24}
          style={{ marginRight: 4 }}
          onPress={() => navigation.goBack()}
        />
      ),
      name: post?.name || 'News',
    });
  }, [navigation, post?.name, post?.is_collect]);

  // 抓資料
  useEffect(() => {
    if (!id) {
      setLoading(false);
      setErr('Invalid id');
      return;
    }
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await S_Announcement.show({ modelId: id })
        setPost(res);
        setIsCollect(res.is_collect)
      } catch (e) {
        if (axios.isCancel(e)) return;
        setErr(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [id, currentRefreshCounter]);

  const source = useMemo(() => ({ html: post?.content || '' }), [post?.content]);

  // 定義 nav：把它視為 block 容器
  const navModel = HTMLElementModel.fromCustomModel({
    tagName: 'nav',
    contentModel: HTMLContentModel.block
  });

  // Custom Styling models
  const _customHTMLElementModels = {
    em: HTMLElementModel.fromCustomModel({
      tagName: 'em',
      mixedUAStyles: { fontFamily: 'Open Sans' },
      contentModel: HTMLContentModel.block
    }),
    ul: HTMLElementModel.fromCustomModel({
      tagName: 'ul',
      mixedUAStyles: { marginVertical: 20 },
      contentModel: HTMLContentModel.block
    }),
    li: HTMLElementModel.fromCustomModel({
      tagName: 'li',
      mixedUAStyles: { flexDirection: 'row' },
      contentModel: HTMLContentModel.block
    }),
    img: HTMLElementModel.fromCustomModel({
      tagName: 'img',
      mixedUAStyles: { borderWidth: 0.3 },
      contentModel: HTMLContentModel.block
    }),
    br: HTMLElementModel.fromCustomModel({
      tagName: 'br',
      mixedUAStyles: { marginBottom: 8 },
      contentModel: HTMLContentModel.block
    }),
    mark: HTMLElementModel.fromCustomModel({
      tagName: 'mark',
      contentModel: HTMLContentModel.textual,
    }),
  }

  // ✅ 關鍵 CSS：讓 WebView 內的表格能水平滾動、且不被壓縮
  const tableCss =
    cssRulesFromSpecs({
      ...defaultTableStylesSpecs,
      outerBorderWidthPx: 1,
      columnsBorderWidthPx: 1,
      fitContainerWidth: false,
      fitContainerHeight: false,
    }) +
    `
    html, body { margin:0; padding:0; background: transparent; }
    /* ✅ 讓 WebView 真的能左右滾動 */
    body { overflow-x: auto; -webkit-overflow-scrolling: touch; white-space: nowrap; padding-right: 16px; }

    /* ✅ 讓表格依內容展開，保證比 viewport 寬；用 inline-block + !important 把任何 100% 覆蓋掉 */
    table {
      display: inline-block !important;
      min-width: 100% !important;         /* 或用 100vw 也可 */
      width: auto !important;
      max-width: none !important;     
      border-collapse: collapse;
      border-spacing: 0;
      white-space: normal; /* 恢復表格內部自行換行控制 */
    }

    /* ✅ 每欄設最小寬，確保內容把整張表撐寬 */
    th, td { white-space: nowrap; }

    /* 你的原本邊框樣式（注意是 !important） */
    td {
      border-width: 0px 1pt 1pt !important;
      border-style: solid !important;
      border-color:rgb(213, 213, 213) !important;
    }
    /* ── 對齊規則：整列的儲存格一律靠左 ── */
    tr > th,
    tr > td {
      text-align: left !important;
    }
    table td, table td * {
      line-height: 0.8 !important;
    }
  `;


  // --- 自訂 <video> 與 <iframe>（RNRH v6 相容）+ 註冊 tableModel ---
  const customHTMLElementModels = {
    video: defaultHTMLElementModels.video.extend({ contentModel: HTMLContentModel.block }),
    iframe: defaultHTMLElementModels.iframe.extend({ contentModel: HTMLContentModel.block }),
    nav: navModel,
    table: tableModel, // ✅ 讓 RNRH 正確認得 <table>
    ..._customHTMLElementModels
  };

  const VideoRenderer = ({ tnode }) => {
    const attrs = (tnode?.attributes ?? {});
    let src = attrs.src;
    if (!src && Array.isArray(tnode?.children)) {
      const child = tnode.children.find((c) => c?.tagName === 'source' && c?.attributes?.src);
      src = child?.attributes?.src;
    }
    if (!src) return null;

    const poster = attrs.poster;
    const wAttr = Number(attrs.width);
    const hAttr = Number(attrs.height);
    const w = Number.isFinite(wAttr) && wAttr > 0 ? Math.min(wAttr, contentWidth) : contentWidth;
    const h = Number.isFinite(hAttr) && hAttr > 0 ? hAttr : Math.round((w * 9) / 16);

    return (
      <View style={{ width: w, height: h, backgroundColor: '#000', borderRadius: 12, overflow: 'hidden', marginVertical: 8 }}>
        <Video
          source={{ uri: src }}
          poster={poster}
          style={{ width: '100%', height: '100%' }}
          controls
          paused
          resizeMode="contain"
        />
      </View>
    );
  };

  const IframeRenderer = ({ tnode }) => {
    const attrs = (tnode?.attributes ?? {});
    const src = attrs.src;
    if (!src) return null;

    const wAttr = Number(attrs.width);
    const hAttr = Number(attrs.height);
    const w = Number.isFinite(wAttr) && wAttr > 0 ? Math.min(wAttr, contentWidth) : contentWidth;
    const h = Number.isFinite(hAttr) && hAttr > 0 ? hAttr : Math.round((w * 9) / 16);

    return (
      <View style={{ width: w, height: h, borderRadius: 12, overflow: 'hidden', marginVertical: 8, backgroundColor: '#000' }}>
        <WebView
          source={{ uri: src }}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
    );
  };

  // --- Loading / Error ---
  if (loading) {
    return (
      <SafeAreaView style={[styles.fillCenter]}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }
  if (err || !post) {
    return (
      <SafeAreaView style={[styles.fillCenter, { paddingHorizontal: 16 }]}>
        <Text style={{ color: '#ef4444' }}>{err || 'No data'}</Text>
      </SafeAreaView>
    );
  }

  const fallbackHero =
    'https://images.unsplash.com/photo-1707742984673-ae30d982bdec?q=80&w=3132&auto=format&fit=crop'

  return (
    <>
      <WsSnackBar
        text={snackBarText}
        setVisible={setIsSnackBarVisible}
        visible={isSnackBarVisible}
        quickHidden
      />

      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          directionalLockEnabled
        >
          {/* Hero */}
          {/* <FastLoadingImage
            uri={post.cover_image || fallbackHero}
            fitWidth
            placeholderRatio={3 / 2}
            showPercent={false}
          /> */}

          {/* Title + Meta */}
          <View style={[styles.container, { marginTop: 16 }]}>
            <Text style={styles.name}>{post.name}</Text>
            <View style={styles.metaRow}>
              {!!post?.alliance && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{post?.alliance?.name}</Text>
                </View>
              )}
              <Text style={styles.metaLight}>
                {post.updated_at ? moment(post.updated_at).format('YYYY-MM-DD  HH:mm:ss') : ''}
              </Text>
            </View>

            <View
              style={{
              }}
            >
              <WsInfo
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                label={t('作者')}
                color={$color.primary3l}
                value={post.author}
              />
            </View>

            <View
              style={{
                marginTop: 8
              }}
            >
              <WsInfo
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                label={t('授權者')}
                color={$color.primary3l}
                value={post.authorizer}
              />
            </View>

            {/* {!!post.tags?.length && (
              <View style={styles.tagsRow}>
                {post.tags.map((t) => (
                  <View key={String(t)} style={styles.tag}>
                    <Text style={styles.tagText}>{String(t)}</Text>
                  </View>
                ))}
              </View>
            )} */}

          </View>

          {/* Body：HTML */}
          {post && (
            <ScrollView style={{ flex: 1 }} nestedScrollEnabled>
              <View style={[styles.container]}>
                <RenderHTML
                  WebView={WebView}
                  contentWidth={contentWidth}
                  source={source}
                  customHTMLElementModels={customHTMLElementModels}
                  renderers={{
                    table,
                    video: VideoRenderer,
                    iframe: IframeRenderer,
                  }}
                  ignoredDomTags={IGNORED_TAGS}
                  renderersProps={{
                    table: {
                      displayMode: 'embedded',
                      cssRules: tableCss,
                      animationType: 'none',
                      animationDuration: 0,
                      webViewProps: {
                        nestedScrollEnabled: true,
                        scrollEnabled: true,
                        showsHorizontalScrollIndicator: true,
                        bounces: true,
                        overScrollMode: 'always',
                        scalesPageToFit: false,
                      },
                    },
                    a: {
                      onPress: (_, href) => href && Linking.openURL(href).catch(() => { }),
                    },
                  }}
                  enableExperimentalMarginCollapsing
                  enableCSSInlineProcessing
                  defaultTextProps={{
                    selectable: true,
                    style: Platform.OS === 'android' ? { includeFontPadding: true } : undefined
                  }}
                  baseStyle={{ lineHeight: 24, fontSize: 16 }}
                  ignoredStyles={['lineHeight']}
                  tagsStyles={{
                    p: { color: '#334155', lineHeight: 24, fontSize: 16, marginVertical: 8, paddingVertical: 0 },
                    h2: { color: '#0f172a', fontWeight: '700', fontSize: 24, lineHeight: 24 * 1.6, marginTop: 12, marginBottom: 8 },
                    h3: { color: '#0f172a', fontWeight: '700', fontSize: 20, lineHeight: 20 * 1.6, marginTop: 10, marginBottom: 6 },
                    a: { color: '#2563eb', textDecorationLine: 'underline' },
                    ul: { paddingLeft: 18, marginBottom: 12, listStyleType: 'none' },
                    li: { color: '#334155', lineHeight: 24, fontSize: 16, marginLeft: 18 },
                    nav: { marginVertical: 8, paddingVertical: 4 },
                    blockquote: {
                      borderLeftWidth: 4,
                      borderLeftColor: '#94a3b8',
                      paddingLeft: 12,
                      color: '#475569',
                      fontStyle: 'italic',
                      marginVertical: 12,
                    },
                    img: { borderRadius: 12 },
                    code: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }) },
                    pre: { backgroundColor: '#0b1020', borderRadius: 12, padding: 12, marginVertical: 8 },
                    strong: { marginVertical: 0, paddingVertical: 0 },
                    span: { marginVertical: 0, paddingVertical: 0 },
                    mark: {},
                  }}
                />
              </View>
            </ScrollView>
          )}

          {post.attaches?.length > 0 && (
            <View style={{ padding: 16 }}>
              <WsInfo
                label={t('附件')}
                type="filesAndImages"
                labelColor={$color.gray}
                value={post.attaches}
              />
            </View>
          )}

          {!!(post.prev || post.next) && (
            <View style={[styles.container, { marginTop: 16 }]}>
              <Text style={{ fontSize: 15, color: '#64748b', marginBottom: 8 }}>More</Text>
              <View style={{ gap: 12 }}>
                {!!post.prev && (
                  <TouchableOpacity style={styles.moreItem} onPress={() => navigation.push('RoutesApp', { screen: 'ViewNewsShow', params: { id: post.prev.id } })}>
                    <FastLoadingImage uri={post.prev.cover_image || 'https://picsum.photos/seed/prev/900/600'} style={styles.moreThumb} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.moreTitle} numberOfLines={2}>← {post.prev.name}</Text>
                      <Text style={styles.moreMeta}>{post.prev.date || ''}</Text>
                    </View>
                  </TouchableOpacity>
                )}

                {!!post.next && (
                  <TouchableOpacity style={styles.moreItem} onPress={() => navigation.push('RoutesApp', { screen: 'ViewNewsShow', params: { id: post.next.id } })}>
                    <FastLoadingImage uri={post.next.cover_image || 'https://picsum.photos/seed/next/900/600'} style={styles.moreThumb} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.moreTitle} numberOfLines={2}>{post.next.name} →</Text>
                      <Text style={styles.moreMeta}>{post.next.date || ''}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  fillCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { paddingHorizontal: 16, paddingTop: 16 },
  hero: { width: '100%', minHeight: 220, backgroundColor: '#e2e8f0' },
  name: { fontSize: 26, fontWeight: '800', color: '#0f172a', lineHeight: 32 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 16 },
  avatarWrap: { width: 36, height: 36, borderRadius: 18, marginRight: 10, overflow: 'hidden', backgroundColor: '#cbd5e1' },
  avatar: { width: '100%', height: '100%' },
  alliance: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  metaLight: { fontSize: 13, color: '#64748b', marginTop: 2 },
  shareBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#0B5CAD', borderRadius: 10 },
  shareText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  tag: { backgroundColor: '#0B5CAD', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 8 },
  tagText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  moreItem: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 2 },
    }),
  },
  moreThumb: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#e2e8f0' },
  moreTitle: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  moreMeta: { fontSize: 12, color: '#64748b', marginTop: 4 },
  center: { alignItems: 'center', justifyContent: 'center' },
  gray: { marginTop: 6, color: '#94a3b8' },
});
