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
import {
  setSystemClasses,
  setActStatus,
  setActType,
  setSubAreas
} from '@/store/data'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import S_ActType from '@/services/api/v1/act_type'
import S_ActStatus from '@/services/api/v1/act_status'
import S_AreaSection from '@/services/api/v1/area_section'
import S_Alliance from '@/services/api/v1/alliance';
import { scopeSubscriptions } from '@/__reactnative_stone/global/permission'
import LinearGradient from 'react-native-linear-gradient';

const GRADIENT_COLORS = ['#537792', '#607BAA', '#8ea0bfff']; // 你要的卡片漸層
const GRADIENT_START = { x: 0, y: 0.5 };
const GRADIENT_END = { x: 1, y: 0.5 };

const BG_IMAGE = require('@/assets/img/hero-bg.png');

const Homepage = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();

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
  const $_systemClassSet = async (areaId: string) => {
    try {
      const _params = {
        order_by: 'sequence',
        order_way: 'asc',
        area: areaId ? areaId : undefined
      }
      const systemClasses = await S_SystemClass.index({
        params: _params
      })
      if (systemClasses && systemClasses.length > 0) {
        store.dispatch(setSystemClasses(systemClasses))
      } else {
        store.dispatch(setSystemClasses([]))
      }
    } catch (e) {
      console.error(e);
      store.dispatch(setSystemClasses(null))
    }
  }
  const $_subAreaSet = async (areaId: string) => {
    try {
      const _params = {
        areaId: areaId
      }
      const res = await S_AreaSection.index({
        params: _params
      })
      if (res) {
        store.dispatch(setSubAreas(res.data))
      }
    } catch (error) {
      console.log(error, '$_subAreaSet')
    }
  }
  const $_actTypeSet = async (areaId: string) => {
    let _params = {
      order_by: 'sequence',
      order_way: 'asc',
      area: areaId ? areaId : undefined
    }
    try {
      const actTypes = await S_ActType.index({ params: _params })
      store.dispatch(setActType(actTypes.data))
    } catch (error) {
      console.log(error, '$_actTypeSet')
    }
  }
  const $_actStatus = async (areaId: string) => {
    let _params = {
      area: areaId ? areaId : undefined
    }
    try {
      const actStatus = await S_ActStatus.index({ params: _params })
      store.dispatch(setActStatus(actStatus.data))
    } catch (error) {
      console.log(error, '$_actStatus')
    }
  }

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

  // helper
  const pickId = (a: any) =>
    a && typeof a === 'object' ? (a.id ?? a.area_id ?? a.code) : a;
  const getUsableAreaId = (
    allianceItem: any,
    currentFactory: any
  ): string | number | undefined => {
    const subs = currentFactory?.subscription_areas ?? [];
    const wantedId = pickId(allianceItem?.area) ?? allianceItem?.area_id;

    const hasWanted = subs.some((s: any) => pickId(s) === wantedId);
    if (hasWanted) return wantedId;

    const first = subs[0];
    return pickId(first) ?? undefined;
  };

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
                const areaId = getUsableAreaId(item, currentFactory);

                // 導頁時帶入修正後的 areaId（避免下一頁拿到未訂閱的區域）
                handleNavigate(opt.route, { item });

                try {
                  if (areaId != null) {
                    await Promise.all([
                      $_systemClassSet(areaId),
                      $_subAreaSet(areaId),
                      $_actTypeSet(areaId),
                      $_actStatus(areaId),
                    ]);
                  }
                } catch (err) {
                  console.error('初始化失敗：', err);
                }
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
                    disabled={true}
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
