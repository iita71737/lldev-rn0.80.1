import React from 'react';
import { AppState } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNetInfo } from '@react-native-community/netinfo';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import { WsSnackBar } from '@/components';
import Services from '@/services/api/v1/index';
import store from '@/store';
import {
  setConnectionState,
  setOfflineMsg,
  // setPreloadChecklistAssignment,
  // setCurrentChecklistRecordDraft,
  // setRefreshCounter,
} from '@/store/data';

const WsGlobalOfflineAlert = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isConnected, isInternetReachable } = useNetInfo();
  const online = !!isConnected && !!(isInternetReachable ?? false);

  const currentRefreshCounter = useSelector(s => s.data.refreshCounter);
  const offlineMsg = useSelector(s => s.data.offlineMsg);

  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false);
  const [snackBarText, setSnackBarText] = React.useState('');

  // --- 前後狀態 / 前景狀態 / 去抖 / 待補發旗標 ---
  const prevOnlineRef = React.useRef<boolean | null>(null);
  const appStateRef = React.useRef(AppState.currentState);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = React.useRef<null | 'online' | 'offline'>(null);

  // ============ 離線佇列：保留 getOfflineQueue（必要時會被使用） ============
  const getOfflineQueue = React.useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('offlineTempMsg');
      return jsonValue ? JSON.parse(jsonValue) : (offlineMsg ?? null);
    } catch (e) {
      return null;
    }
  }, [offlineMsg]);

  const clearOfflineQueue = React.useCallback(async () => {
    try {
      await AsyncStorage.removeItem('offlineTempMsg');
    } catch (e) {
      console.error(e, 'clearOfflineQueue')
    }
    store.dispatch(setOfflineMsg([]));
  }, []);

  const uploadOfflineQueue = React.useCallback(async () => {
    const queue = await getOfflineQueue();
    if (!Array.isArray(queue) || queue.length === 0) return;

    // 你原本的上傳流程；這裡先走一次性 Promise.all（需要更完整保護可加重試/逐筆 try/catch）
    await Promise.all(queue.map(async (item) => {
      const { service, method, data } = item || {};
      const fn = Services?.[service]?.[method];
      if (typeof fn === 'function') {
        await fn({ params: data });
      }
    }));

    // 清空離線佇列
    await clearOfflineQueue();

    // 如需重置草稿/刷新資料等，可按需打開：
    // store.dispatch(setPreloadChecklistAssignment(null));
    // store.dispatch(setCurrentChecklistRecordDraft(null));
    // setTimeout(() => store.dispatch(setRefreshCounter(currentRefreshCounter + 1)), 3000);

    setSnackBarText(t('資料已全數上傳完成'));
    setIsSnackBarVisible(true);
  }, [getOfflineQueue, clearOfflineQueue]);
  // =====================================================================================

  // AppState 監聽：回到前景時補發 pending 的提示（解「切飛航模式時漏訊」）
  React.useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      appStateRef.current = s;
      if (s === 'active' && pendingRef.current) {
        const kind = pendingRef.current;
        pendingRef.current = null;

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (kind === 'online') {
            setSnackBarText(t('網路已連線'));
            setIsSnackBarVisible(true);
            // 回到前景且線上 → 嘗試送離線佇列
            // uploadOfflineQueue().catch(() => { });
          } else {
            setSnackBarText(t('您目前已離線，請重新連線網路。'));
            setIsSnackBarVisible(true);
          }
          timerRef.current = null;
        }, 200);
      }
    });
    return () => sub.remove();
  }, [uploadOfflineQueue]);

  React.useEffect(() => {
    if (prevOnlineRef.current === null) {
      prevOnlineRef.current = online;
      dispatch(setConnectionState(online));
    }
  }, [online, dispatch]);

  // 邊界變化才提示；不在前景就暫存，回前景再補發；並在恢復連線時上傳離線佇列
  React.useEffect(() => {
    if (prevOnlineRef.current === null) return;
    if (prevOnlineRef.current === online) return;

    dispatch(setConnectionState(online));

    const fire = async (kind: 'online' | 'offline') => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        if (kind === 'online') {
          setSnackBarText(t('網路已連線'));
          setIsSnackBarVisible(true);
          // 線上 → 嘗試送離線佇列
          // try { await uploadOfflineQueue(); } catch { }
        } else {
          setSnackBarText(t('您目前已離線，請重新連線網路。'));
          setIsSnackBarVisible(true);
        }
        timerRef.current = null;
      }, 250); // 去抖時間可調
    };

    if (appStateRef.current === 'active') {
      fire(online ? 'online' : 'offline');
    } else {
      // 不在前景：先記下，等回前景再補發
      pendingRef.current = online ? 'online' : 'offline';
    }

    prevOnlineRef.current = online;
  }, [online, dispatch, t, uploadOfflineQueue]);

  return (
    <WsSnackBar
      text={snackBarText}
      setVisible={setIsSnackBarVisible}
      visible={isSnackBarVisible}
      quickHidden={true}
    />
  );
};

export default WsGlobalOfflineAlert;
