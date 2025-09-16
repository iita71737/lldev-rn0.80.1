// LlNewsCard.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  StyleSheet,
  ViewStyle,
  ImageSourcePropType,
} from 'react-native';
import {
  WsIconBtn,
  WsIcon
} from '@/components'; // ✅ 你的收藏按鈕
import S_Announcement from '@/services/api/v1/announcement'
import store from '@/store'
import { useSelector } from 'react-redux'
import {
  setRefreshCounter
} from '@/store/data'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment';

export type LlNewsCardProps = {
  id?: string;
  cover_image?: string;                 // 網路圖片
  coverSource?: ImageSourcePropType; // 本地圖片（擇一）
  updated_at?: string | Date;
  name: string;
  introduction?: string;
  alliance?: string;
  onPress?: () => void;
  style?: ViewStyle;
  width?: number | string;           // 卡片寬度
  imageHeight?: number;              // 封面高度
  radius?: number;                   // 圓角
  tagColor?: string;                 // 標籤底色
  titleLines?: number;               // 標題行數
  excerptLines?: number;             // 摘要行數
  activeOpacity?: number;            // 觸控透明度
  testID?: string;

  // ⭐ 收藏相關（新增）
  showCollect?: boolean;             // 是否顯示收藏按鈕
  is_collect?: boolean;               // 收藏狀態
  onPressCollect?: () => void;       // 收藏按鈕事件
  collectIconNames?: { active: string; inactive: string }; // 自訂圖示名稱
  collectButtonStyle?: ViewStyle;    // 自訂按鈕位置/樣式
  setIsSnackBarVisible?: () => void;
  setSnackBarText?: () => void;
};

const formatDate = (d?: string | Date) => {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  if (isNaN(+date)) return '';
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
};

export default function LlNewsCard({
  id,
  cover_image = 'https://picsum.photos/seed/d/900/600',
  coverSource,
  updated_at = '2025-09-04',
  name,
  introduction = '供應鏈轉移帶動越南快速崛起，投資熱度與政策觀察成為關鍵…',
  alliance,
  onPress,
  style,
  width,
  imageHeight = 150,
  radius = 20,
  tagColor = '#0B5CAD',
  titleLines = 2,
  excerptLines = 3,
  activeOpacity = 0.8,
  testID,

  // 收藏 props（新增）
  showCollect = true,
  is_collect = false,
  collectIconNames = { active: 'md-bookmark', inactive: 'ws-outline-bookmark' },
  collectButtonStyle,
  setIsSnackBarVisible,
  setSnackBarText,

}: LlNewsCardProps) {

  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // states
  const [isCollect, setIsCollect] = React.useState(is_collect)

  const bookmarkOnPress = async () => {
    try {
      if (isCollect) {
        setIsSnackBarVisible(false)
        setIsSnackBarVisible(true)
        setIsCollect(false)
        setSnackBarText('已從我的收藏中移除')
        const _params = {
          id: id,
          factory: currentFactory?.id
        }
        console.log(_params, '_params');
        await S_Announcement.removeMyCollect({ params: _params })
        store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
      } else {
        setIsSnackBarVisible(false)
        setIsSnackBarVisible(true)
        setIsCollect(true)
        setSnackBarText('已儲存至「我的收藏」')
        const _params = {
          id: id,
          factory: currentFactory?.id
        }
        console.log(_params, '_params');
        await S_Announcement.addMyCollect({ params: _params })
        store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
      }
    } catch (e) {
      console.error(e, 'e');
    }
  }

  return (
    // 外層用來做陰影（iOS shadow / Android elevation）
    <View style={[
      styles.shadowCard,
      {
        borderRadius: radius,
        width
      },
      style
    ]}
    >
      {/* 內層才裁切圓角內容，並提供點擊 */}
      <TouchableOpacity
        testID={testID}
        activeOpacity={activeOpacity}
        onPress={onPress}
        style={[styles.inner, { borderRadius: radius }]}
      >
        {/* 封面圖 */}
        <View style={[styles.imageWrap, { height: imageHeight }]}>
          {cover_image || coverSource ? (
            <Image
              source={coverSource ?? { uri: cover_image! }}
              resizeMode="cover"
              style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.imagePlaceholder]}>
              {/* <Image
                source={{ uri: 'https://images.unsplash.com/photo-1707742984673-ae30d982bdec?q=80&w=3132&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
                resizeMode="cover"
                style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]}
              /> */}
            </View>
          )}
        </View>

        {/* 內容區 */}
        <View style={styles.body}>
          {!!updated_at && (
            <View style={styles.row}>
              <WsIcon style={styles.calendarIcon} color={$color.gray} name={'ws-outline-calendar-date'} size={24}></WsIcon>
              <Text style={styles.dateText}>{moment(updated_at).format('YYYY-MM-DD  HH:mm:ss')}</Text>
            </View>
          )}

          <Text style={styles.name}
          >
            {name}
          </Text>

          {!!introduction && (
            <Text style={styles.introduction} numberOfLines={excerptLines}>
              {introduction}
            </Text>
          )}

          {!!alliance && (
            <View style={[styles.tag, { backgroundColor: tagColor }]}>
              <Text style={styles.tagText}>{alliance?.name}</Text>
            </View>
          )}
        </View>

        {/* ⭐ 收藏按鈕（右下角） */}
        {showCollect && (
          <View
            pointerEvents="box-none"
            style={[styles.collectWrap, collectButtonStyle]}
          >
            <WsIconBtn
              style={styles.collectBtn}
              name={is_collect ? collectIconNames.active : collectIconNames.inactive}
              size={28}
              onPress={bookmarkOnPress}
            />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowCard: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 5 },
    }),
  },
  inner: {
    backgroundColor: '#fff',
    overflow: 'hidden', // 讓封面圖與內容跟著圓角
  },
  imageWrap: {
    width: '100%',
    backgroundColor: '#ECEFF1',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECEFF1',
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  calendarIcon: {
    fontSize: 14,
    marginRight: 6,
    color: '#90A4AE',
  },
  dateText: {
    color: '#90A4AE',
    fontSize: 14,
    fontWeight: '600',
  },
  name: {
    color: '#173B63',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
    marginTop: 2,
  },
  introduction: {
    color: '#5B6B77',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  tag: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ⭐ 收藏按鈕定位（右下角）
  collectWrap: {
    position: 'absolute',
    right: 8,
    bottom: 4,
    zIndex: 99,
    elevation: 3,
  },
  collectBtn: {
    // 若 WsIconBtn 自帶觸控區即可不用額外 padding
  },
});
