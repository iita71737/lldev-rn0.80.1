import React, { useMemo, useState, useCallback } from 'react';
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
} from 'react-native';
import RenderHTML from 'react-native-render-html';
import moment from 'moment';
import FastImage, { OnLoadEvent, OnProgressEvent } from 'react-native-fast-image';
import {
  WsIconBtn,
} from '@/components';
import { useTranslation } from 'react-i18next';
import $color from '@/__reactnative_stone/global/color';

// ===== Demo 假資料（把這裡換成 Strapi 回傳）=====
const post = {
  title: 'Not a Guide to Integrating Strapi with Next.js',
  coverUrl: 'https://picsum.photos/seed/strapi/1200/700',
  author: { name: 'Jane Doe', avatar: 'https://picsum.photos/seed/jane/120' },
  publishedAt: '2025-08-30T12:00:00.000Z',
  tags: ['Strapi', 'Next.js', 'Best Practices'],
  html: `
    <p>In this not-a-guide, we walk through the <strong>decisions</strong> you should consider when integrating <em>Strapi</em> with <code>Next.js</code>.</p>
    <h2>Why not a step-by-step?</h2>
    <p>Because your use case is unique. Still, here are common patterns:</p>
    <ul>
      <li>Static generation via <code>getStaticProps</code></li>
      <li>Server actions for drafts</li>
      <li>Incremental revalidation</li>
    </ul>
    <blockquote>“APIs are contracts; design them intentionally.”</blockquote>
    <p>And don't forget to handle <a href="https://example.com">preview mode</a>!</p>
    <img src="https://picsum.photos/seed/diagram/900/480" alt="diagram" />
  `,
  next: {
    title: 'Ship Content Safely with Webhooks',
    coverUrl: 'https://picsum.photos/seed/next/900/600',
    date: '2025-09-04',
    excerpt: 'Webhooks enable event-driven pipelines. Here is how to design them...',
  },
  prev: {
    title: 'From CMS to Content Platform',
    coverUrl: 'https://picsum.photos/seed/prev/900/600',
    date: '2025-08-24',
    excerpt: 'A playbook to evolve your stack...',
  },
};
// ===== End 假資料 =====

const calcReadingTime = (html: string) => {
  const text = html.replace(/<[^>]+>/g, ' ');
  const words = text.trim().split(/\s+/).length;
  const min = Math.max(1, Math.round(words / 250)); // 約 250 wpm
  return `${min} min read`;
};

// ---- 小封裝：可重用的 FastImage + 讀取指示 + 失敗佔位 + 淡入 ----
type FastLoadingImageProps = {
  uri: string;
  style?: any;
  resizeMode?: keyof typeof FastImage.resizeMode;
  priority?: keyof typeof FastImage.priority;
  cache?: keyof typeof FastImage.cacheControl;
  headers?: Record<string, string>;
  showPercent?: boolean;
};

const FastLoadingImage: React.FC<FastLoadingImageProps> = ({
  uri,
  style,
  resizeMode = 'cover',
  priority = 'normal',
  cache = 'immutable',
  headers,
  showPercent = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [pct, setPct] = useState(0);
  const [error, setError] = useState(false);

  const onLoadStart = useCallback(() => {
    setLoading(true);
    setPct(0);
    setError(false);
  }, []);

  const onProgress = useCallback((e: OnProgressEvent) => {
    const { loaded, total } = e?.nativeEvent || {};
    if (total) setPct(Math.round((loaded / total) * 100));
  }, []);

  const onLoad = useCallback((_e: OnLoadEvent) => {
    setLoading(false);
  }, []);

  const onError = useCallback(() => {
    setLoading(false);
    setError(true);
  }, []);

  return (
    <View style={[style, { overflow: 'hidden' }]}>
      <FastImage
        style={StyleSheet.absoluteFillObject}
        source={{ uri, priority: FastImage.priority[priority], cache: FastImage.cacheControl[cache], headers }}
        resizeMode={FastImage.resizeMode[resizeMode]}
        onLoadStart={onLoadStart}
        onProgress={onProgress}
        onLoad={onLoad}
        onError={onError}
      />
      {loading && !error && (
        <View style={[StyleSheet.absoluteFillObject, styles.center]}>
          <ActivityIndicator />
          {showPercent && pct > 0 ? (
            <Text style={styles.gray}>{pct}%</Text>
          ) : null}
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
// ----------------------------------------------------------------

type Props = {
  navigation: any;
  route: any;
};

export default function BlogDetailScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { width } = Dimensions.get('window');

  const reading = useMemo(() => calcReadingTime(post.html), []);
  const source = useMemo(() => ({ html: post.html }), []);

  const [collectionIcon] = useState<'md-turned-in-not' | 'md-turned-in'>('md-turned-in-not');
  const onShare = async () => {
    try {
      await Share.share({ message: `Check this out: ${post.title}` });
    } catch {}
  };

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => (
        <WsIconBtn
          name={collectionIcon}
          size={24}
          color={$color.white}
          underlayColorPressIn="transparent"
          style={{ marginRight: 4 }}
          onPress={() => {}}
        />
      ),
      headerLeft: () => (
        <WsIconBtn
          testID="backButton"
          name="ws-outline-arrow-left"
          color="white"
          size={24}
          style={{ marginRight: 4 }}
          onPress={() => {
            navigation.goBack();
          }}
        />
      ),
    });
  };

  React.useEffect(() => {
    $_setNavigationOption();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 預設備用圖
  const fallbackHero =
    'https://images.unsplash.com/photo-1707742984673-ae30d982bdec?q=80&w=3132&auto=format&fit=crop';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F6F8FB' }}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero（FastImage） */}
        <FastLoadingImage
          uri={post?.coverUrl || fallbackHero}
          style={styles.hero}
          priority="high"
          showPercent={false}
        />

        {/* Title + Meta */}
        <View style={styles.container}>
          <Text style={styles.title}>{post.title}</Text>

          <View style={styles.metaRow}>
            {/* Avatar（FastImage） */}
            <View style={styles.avatarWrap}>
              <FastImage
                style={styles.avatar}
                source={{ uri: post.author.avatar, priority: FastImage.priority.normal }}
                resizeMode={FastImage.resizeMode.cover}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.author}>{post.author.name}</Text>
              <Text style={styles.metaLight}>
                {moment(post.publishedAt).format('YYYY-MM-DD')} · {reading}
              </Text>
            </View>

            <TouchableOpacity onPress={onShare} style={styles.shareBtn}>
              <Text style={styles.shareText}>分享</Text>
            </TouchableOpacity>
          </View>

          {/* Tags */}
          <View style={styles.tagsRow}>
            {post.tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Body：HTML 渲染 */}
        <View style={[styles.container, { paddingTop: 0 }]}>
          <RenderHTML
            contentWidth={width - 32}
            source={source}
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
              pre: {
                backgroundColor: '#0b1020',
                borderRadius: 12,
                padding: 12,
                marginVertical: 8,
              },
            }}
            defaultTextProps={{ selectable: true }}
          />
        </View>

        {/* Prev/Next（簡化；縮圖也改 FastImage） */}
        <View style={[styles.container, { marginTop: 16 }]}>
          <Text style={{ fontSize: 15, color: '#64748b', marginBottom: 8 }}>More</Text>

          <View style={{ gap: 12 }}>
            <TouchableOpacity style={styles.moreItem}>
              <FastLoadingImage uri={post.prev.coverUrl} style={styles.moreThumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.moreTitle} numberOfLines={2}>← {post.prev.title}</Text>
                <Text style={styles.moreMeta}>{post.prev.date}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.moreItem}>
              <FastLoadingImage uri={post.next.coverUrl} style={styles.moreThumb} />
              <View style={{ flex: 1 }}>
                <Text style={styles.moreTitle} numberOfLines={2}>{post.next.title} →</Text>
                <Text style={styles.moreMeta}>{post.next.date}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 16 },
  hero: { width: '100%', height: 220, backgroundColor: '#e2e8f0' },
  title: { fontSize: 26, fontWeight: '800', color: '#0f172a', lineHeight: 32 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 14 },
  avatarWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    overflow: 'hidden',
    backgroundColor: '#cbd5e1',
  },
  avatar: { width: '100%', height: '100%' },
  author: { fontSize: 15, fontWeight: '700', color: '#0f172a' },
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
