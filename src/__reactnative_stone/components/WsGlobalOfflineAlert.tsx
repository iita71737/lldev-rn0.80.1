import { View, Text, Alert, TouchableOpacity } from 'react-native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { addEventListener } from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-community/async-storage'
import Services from '@/services/api/v1/index'
import store from '@/store'
import {
  setOfflineMsg,
  setConnectionState,
  setPreloadChecklistAssignment,
  setRefreshCounter,
} from '@/store/data'
import {
  WsSnackBar,
  WsText
} from '@/components'
import { useSelector } from 'react-redux'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import { setCurrentChecklistRecordDraft } from '@/store/data'

const WsGlobalOfflineAlert = () => {
  const { t, i18n } = useTranslation()

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const offlineMsg = useSelector(state => state.data.offlineMsg);

  // STATES
  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('已儲存至「我的收藏」')
  )

  // FUNC
  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('offlineTempMsg');
      return jsonValue != null ? JSON.parse(jsonValue) : offlineMsg ? offlineMsg : null;
    } catch (e) {
    }
  };

  const removeValue = async () => {
    try {
      await AsyncStorage.removeItem('offlineTempMsg')
    } catch (e) {
    }
  }
  
  React.useEffect(() => {
    // NETWORK STATE 
    const unsubscribe = addEventListener(async (state) => {
      if (!state.isConnected) {
        store.dispatch(setConnectionState(false))
        setSnackBarText(t('您目前已離線，請重新連線網路。'))
        Alert.alert('網路連線異常，請稍候再試。')
        setIsSnackBarVisible(true)
      } else if (state.isConnected) {
        store.dispatch(setConnectionState(true))
        setSnackBarText(t('網路已連線'))
        setIsSnackBarVisible(true)
        // try {
        //   const _offlineTempMsg = await getData()
        //   if (_offlineTempMsg && _offlineTempMsg.length > 0) {
        //     let maxRetries = 1
        //     let retryCount = 0;
        //     while (retryCount < maxRetries) {
        //       try {
        //         await Promise.all(_offlineTempMsg.map(async (item, index) => {
        //           const { service, method, data, modelId } = item;
        //           // Alert.alert(
        //           //   `test`,
        //           //   `${data.checklist_id}-checklist_id
        //           //   \n
        //           //   ${data.checklist_assignment}-data.checklist_assignment`
        //           // );
        //           const _data = await S_CheckListRecordAns.convertLocalImagesToHttp(data);
        //           let _service = Services[service][method];
        //           const res = await _service({ params: _data });
        //             console.log(res, `res${index}`);
        //             setIsSnackBarVisible(true)
        //             await removeValue()
        //             await store.dispatch(setOfflineMsg([]))
        //             await store.dispatch(setPreloadChecklistAssignment(null))
        //             await store.dispatch(setCurrentChecklistRecordDraft(null));
        //             setTimeout(() => {
        //               store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
        //             }, 3000)
        //             setSnackBarText('資料已全數上傳完成')
        //             Alert.alert('資料已全數上傳完成。')
        //         }));
        //         break;
        //       } catch (error) {
        //         retryCount++;
        //         console.error('Error occurred:', error.message);
        //         // await new Promise(resolve => setTimeout(resolve, 2000)); // 等待 2 秒後重試
        //       }
        //     }
        //   }
        // } catch (error) {
        //   console.error(error.message);
        // }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);


  return (
    <>
      <WsSnackBar
        text={snackBarText}
        setVisible={setIsSnackBarVisible}
        visible={isSnackBarVisible}
        quickHidden={true}
      />
    </>
  )
}

export default WsGlobalOfflineAlert