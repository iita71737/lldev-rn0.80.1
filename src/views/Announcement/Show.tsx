// Show.js
import React, { useMemo, useState, useCallback, useEffect, useRef } from 'react';
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
} from 'react-native';
import axios from 'axios';
import RenderHTML, {
  HTMLContentModel,
  defaultHTMLElementModels,
} from 'react-native-render-html';
import Video from 'react-native-video';
import { WebView } from 'react-native-webview';
import moment from 'moment';
import FastImage from 'react-native-fast-image';
import { useTranslation } from 'react-i18next';
import { useRoute, useNavigation } from '@react-navigation/native';
import S_Announcement from '@/services/api/v1/announcement'

// ==== 你的專案元件 / 色票（照需要保留或移除）====
import { WsIconBtn } from '@/components';
import $color from '@/__reactnative_stone/global/color';

// ---- 小封裝：FastImage + loading/失敗佔位 ----
const FastLoadingImage = ({ uri, style, resizeMode = 'cover', priority = 'normal', cache = 'immutable', headers, showPercent = false }) => {
  const [loading, setLoading] = useState(true);
  const [pct, setPct] = useState(0);
  const [error, setError] = useState(false);

  const onLoadStart = useCallback(() => {
    setLoading(true);
    setPct(0);
    setError(false);
  }, []);

  const onProgress = useCallback((e) => {
    const { loaded, total } = e?.nativeEvent || {};
    if (total) setPct(Math.round((loaded / total) * 100));
  }, []);

  const onLoad = useCallback(() => setLoading(false), []);
  const onError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  return (
    <View style={[style, { overflow: 'hidden' }]}>
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

// ---- 文字閱讀時間估算 ----
const calcReadingTime = (html) => {
  const text = String(html || '').replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).filter(Boolean).length || 0;
  return `${Math.max(1, Math.round(words / 250))} min read`;
};

export default function Show() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const id = route?.params?.id;

  const { width, height } = Dimensions.get('window');
  const contentWidth = width - 32;

  // 資料 state
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

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
          onPress={() => { }}
        />
      ),
      headerLeft: () => (
        <WsIconBtn
          testID="backButton"
          name="ws-outline-arrow-left"
          color="white"
          size={24}
          style={{
            marginRight: 4
          }}
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
        // 依你 API 路徑調整 URL
        const res = await S_Announcement.show({
          modelId: id
        })
        setPost(res);
      } catch (e) {
        if (axios.isCancel(e)) return;
        setErr(e?.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [id]);

  const reading = useMemo(() => calcReadingTime(post?.html), [post?.html]);
  const source = useMemo(() => ({ html: post?.content || '' }), [post?.content]);

  // 分享
  const onShare = useCallback(async () => {
    if (!post) return;
    try {
      await Share.share({ message: `Check this out: ${post.name}` });
    } catch { }
  }, [post]);

  // --- 自訂 <video> 與 <iframe>（v6.3.4 相容）---
  const customHTMLElementModels = {
    video: defaultHTMLElementModels.video.extend({ contentModel: HTMLContentModel.block }),
    iframe: defaultHTMLElementModels.iframe.extend({ contentModel: HTMLContentModel.block }),
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

  // --- 預設備用圖 ---
  const fallbackHero =
    'https://images.unsplash.com/photo-1707742984673-ae30d982bdec?q=80&w=3132&auto=format&fit=crop';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F8FB' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <FastLoadingImage
          uri={post.cover_image || fallbackHero}
          style={styles.hero}
          priority="high"
          showPercent={false}
        />

        {/* Title + Meta */}
        <View style={styles.container}>
          <Text style={styles.name}>{post.name}</Text>

          <View style={styles.metaRow}>
            <View style={styles.avatarWrap}>
              <FastImage
                style={styles.avatar}
                source={{ uri: post?.alliance?.avatar || 'https://picsum.photos/seed/avatar/120' }}
                resizeMode={FastImage.resizeMode.cover}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.alliance}>{post?.alliance?.name || '—'}</Text>
              <Text style={styles.metaLight}>
                {post.updated_at ? moment(post.updated_at).format('YYYY-MM-DD') : '—'} · {reading}
              </Text>
            </View>

            {/* <TouchableOpacity onPress={onShare} style={styles.shareBtn}>
              <Text style={styles.shareText}>分享</Text>
            </TouchableOpacity> */}
          </View>

          {/* Tags */}
          {!!post.tags?.length && (
            <View style={styles.tagsRow}>
              {post.tags.map((t) => (
                <View key={String(t)} style={styles.tag}>
                  <Text style={styles.tagText}>{String(t)}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Body：HTML */}
        <View style={[styles.container, { paddingTop: 0 }]}>
          <RenderHTML
            contentWidth={contentWidth}
            source={source}
            customHTMLElementModels={customHTMLElementModels}
            renderers={{ video: VideoRenderer, iframe: IframeRenderer }}
            enableExperimentalMarginCollapsing
            tagsStyles={{
              p: { color: '#334155', lineHeight: 22, marginBottom: 12, fontSize: 16 },
              h2: { color: '#0f172a', fontSize: 22, fontWeight: '800', marginTop: 16, marginBottom: 8 },
              h3: { color: '#0f172a', fontSize: 18, fontWeight: '800', marginTop: 14, marginBottom: 6 },
              a: { color: '#2563eb', textDecorationLine: 'underline' },
              ul: { paddingLeft: 18, marginBottom: 12 },
              li: { color: '#334155', lineHeight: 22, fontSize: 16 },
              blockquote: {
                borderLeftWidth: 4,
                borderLeftColor: '#94a3b8',
                paddingLeft: 12,
                color: '#475569',
                fontStyle: 'italic',
                marginVertical: 12,
              },
              img: { borderRadius: 12, marginVertical: 8 },
              code: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }) },
              pre: { backgroundColor: '#0b1020', borderRadius: 12, padding: 12, marginVertical: 8 },
            }}
            renderersProps={{
              a: {
                onPress: (_, href) => href && Linking.openURL(href).catch(() => { }),
              },
            }}
            defaultTextProps={{ selectable: true }}
          />
        </View>

        {/* Prev/Next（若 API 有回） */}
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
  );
}

const styles = StyleSheet.create({
  fillCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  container: { paddingHorizontal: 16, paddingTop: 16 },
  hero: { width: '100%', height: 220, backgroundColor: '#e2e8f0' },
  name: { fontSize: 26, fontWeight: '800', color: '#0f172a', lineHeight: 32 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  avatarWrap: {
    width: 36, height: 36, borderRadius: 18, marginRight: 10, overflow: 'hidden', backgroundColor: '#cbd5e1',
  },
  avatar: { width: '100%', height: '100%' },
  alliance: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
  metaLight: { fontSize: 13, color: '#64748b', marginTop: 2 },
  shareBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#0B5CAD', borderRadius: 10 },
  shareText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  tag: { backgroundColor: '#0B5CAD', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
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
