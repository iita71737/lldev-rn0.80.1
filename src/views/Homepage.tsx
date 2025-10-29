import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  Platform,
  UIManager,
  StyleSheet,
  Dimensions,
  Alert,
  ImageBackground,
  TouchableHighlight
} from 'react-native';
import {
  WsGrid,
  WsText,
  WsPaddingContainer,
  WsCard,
} from '@/components';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import gColor from '@/__reactnative_stone/global/color';
import $color from '@/__reactnative_stone/global/color';
import store from '@/store'
import { setSubAreas } from '@/store/data'
import { scopeSubscriptions } from '@/__reactnative_stone/global/permission'
import S_Alliance from '@/services/api/v1/alliance';
import S_AreaSection from '@/services/api/v1/area_section'
import LinearGradient from 'react-native-linear-gradient';

const GRADIENT_COLORS = ['#537792', '#607BAA', '#8ea0bfff']; // 你要的卡片漸層
const GRADIENT_START = { x: 0, y: 0.5 };
const GRADIENT_END = { x: 1, y: 0.5 };

const BG_IMAGE = require('@/assets/img/hero-bg.png');

const Homepage = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { width } = Dimensions.get('window');

  // Redux
  const currentFactory = useSelector((state) => state.data.currentFactory);

  // State
  const [manageList, setManageList] = useState([]);

  // 子選單
  const subOptions = [
    { label: t('新訊'), route: 'ViewAnnouncement' },
    { label: t('法規'), route: 'Act' },
  ];

  const ROUTE_TO_SUBKEY = {
    ViewAnnouncement: 'announcement',
    Act: 'act',
  };

  // 載入聯盟清單
  const initManageList = useCallback(async () => {
    try {
      const res = await S_Alliance.index({});
      if (res && Array.isArray(res.data)) {
        const mapped = res.data.map((it) => ({
          ...it,
          title: t(it.name),
          permission: true,
        }));
        setManageList(mapped);
      } else {
        setManageList([]);
      }
    } catch (e) {
      console.log(e);
      setManageList([]);
    }
  }, [t]);

  useEffect(() => {
    initManageList();
  }, [initManageList, currentFactory]);

  // Service
  const $_subAreaSet = async (_areaId) => {
    try {
      const _params = { areaId: _areaId };
      const res = await S_AreaSection.index({ params: _params });
      if (res) store.dispatch(setSubAreas(res.data));
    } catch (error) {
      console.log(error, '$_subAreaSet');
    }
  };

  // 若點到的 alliance.area 不在工廠訂閱清單，替換為第一個訂閱的 area
  const pickAllianceFor = useCallback(
    (allianceItem) => {
      const areas = currentFactory?.subscription_areas ?? [];
      const wantedId = allianceItem?.area?.id ?? allianceItem?.area_id;

      const hasMatch = areas.some((a) => (a?.id ?? a) === wantedId);
      if (hasMatch) return allianceItem;

      const first = areas[0];
      if (!first) return allianceItem;

      const firstAreaObj = typeof first === 'object' ? first : { id: first };
      return { ...allianceItem, area: firstAreaObj };
    },
    [currentFactory?.subscription_areas]
  );

  // 直接導頁（有訂閱就跳）
  const handleNavigate = useCallback(
    (routeName, allianceItem) => {
      const subKey = ROUTE_TO_SUBKEY[routeName];
      if (!scopeSubscriptions(currentFactory, subKey)) {
        Alert.alert(t('無訂閱此模組'));
        return;
      }
      const payload = { alliance: pickAllianceFor(allianceItem) };
      navigation.navigate(routeName, payload);
    },
    [currentFactory, pickAllianceFor, t, navigation]
  );

  // ---- 卡片主體 ----
  const renderCardBody = (item) => {
    const content = (
      <>
        {/* 上方：標題 */}
        <View style={styles.titleWrap}>
          <WsText
            size="h5"
            fontWeight="bold"
            color={$color.white}
            numberOfLines={1}
            style={styles.titleText}
          >
            {t(item.title)}
          </WsText>
        </View>

        {/* 下方：左右平均 subOptions */}
        <View style={styles.bottomRow}>
          {subOptions.map((opt, idx) => (
            <TouchableOpacity
              key={opt.route || idx}
              style={styles.optionBtn}
              onPress={async () => {
                handleNavigate(opt.route, item);
                await $_subAreaSet(item.area?.id);
              }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <WsText color={$color.white} size={14} textAlign="center">
                {opt.label}
              </WsText>
            </TouchableOpacity>
          ))}
        </View>
      </>
    );

    // 有底圖：底圖在外層，漸層覆蓋（absolute）
    if (item.backgroundImg) {
      return (
        <ImageBackground
          // source={{ uri: '' }}
          style={[styles.Image, { justifyContent: 'space-between' }]}
          imageStyle={{ opacity: 0.7, backfaceVisibility: 'visible' }}
        >
          <LinearGradient
            colors={GRADIENT_COLORS}
            start={GRADIENT_START}
            end={GRADIENT_END}
            style={styles.gradientOverlay}
          />
          {content}
        </ImageBackground>
      );
    }

    // 沒底圖：直接用漸層當容器
    return (
      <LinearGradient
        colors={GRADIENT_COLORS}
        start={GRADIENT_START}
        end={GRADIENT_END}
        style={[styles.Image, { justifyContent: 'space-between' }]}
      >
        {content}
      </LinearGradient>
    );
  };

  return (
    <ImageBackground
      source={BG_IMAGE}
      style={{ flex: 1 }}
      resizeMode="cover"
      imageStyle={{ opacity: 0.2 }}     // 全頁背景淡一點
    >
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <WsPaddingContainer
          padding={0}
          style={{
            // backgroundColor: gColor.primary11l,
            paddingHorizontal: 16
          }}
        >
          <WsGrid
            numColumns={1}
            spacing={4}
            keyExtractor={(item) => String(item.id)}
            data={manageList}
            renderItem={({ item }) => (
              <View style={styles.cardWrap}>
                <WsCard style={styles.Card} padding={0}>
                  <TouchableHighlight
                    disabled={true} // 卡片整塊不點，交由下方兩個按鈕
                    activeOpacity={0.6}
                    underlayColor="transparent"
                    style={{
                      backgroundColor: 'transparent',
                    }}
                  >
                    {renderCardBody(item)}
                  </TouchableHighlight>
                </WsCard>
              </View>
            )}
          />
        </WsPaddingContainer>
      </SafeAreaView>
    </ImageBackground>
  );
};

export default Homepage;

const styles = StyleSheet.create({
  cardWrap: {
    position: 'relative',
    marginBottom: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  Card: {
    overflow: 'hidden',
    margin: 4,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  Image: {
    flex: 1,
    minHeight: 120,
    borderRadius: 16,
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,   // 疊在底圖上
    borderRadius: 16,
    opacity: 1,
  },
  titleWrap: {
    padding: 16,
  },
  titleText: {
    maxWidth: '100%',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
    padding: 16,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
});
