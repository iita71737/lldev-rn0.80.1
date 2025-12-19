import React, { useState } from 'react'
import {
  ScrollView,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  Alert,
  Platform,
  PermissionsAndroid,
  Linking
} from 'react-native'
import {
  WsFlex,
  WsPaddingContainer,
  LlTrainingHeaderCard001,
  WsInfo,
  WsIcon,
  WsIconBtn,
  WsText,
  WsBottomSheet,
  WsDialogDelete,
  WsInfoUser,
  WsCardPassage,
  WsCollapsible,
  WsModal,
  WsSkeleton,
  WsTabView,
  WsInfiniteScroll,
  LlTrainingTimeRecordCard001,
  LlChecklistGeneralScheduleListCard001,
  WsPageIndex,
  WsGradientButton,
  WsPopup,
  WsLoading
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import S_Training from '@/services/api/v1/training'
import S_GeneralSchedule from '@/services/api/v1/general_schedule_setting'
import store from '@/store'
import {
  setOfflineMsg,
  setRefreshCounter
} from '@/store/data'
import { useSelector } from 'react-redux'
import CheckBox from '@react-native-community/checkbox'
import $color from '@/__reactnative_stone/global/color'
import S_TrainingTimeRecord from '@/services/api/v1/training_time_record'

import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { pick, types } from '@react-native-documents/picker'
import * as XLSX from "xlsx";
import { Table, Row, Rows, TableWrapper } from 'react-native-table-component';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import FileViewer from "react-native-file-viewer";

const TrainingRecordList = (props) => {
  const navigation = useNavigation()
  const { t } = useTranslation()
  const { width, height } = Dimensions.get('window')

  const {
    id,
    tabIndex
  } = props

  // REDUX
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // STATES
  const [loading, setLoading] = React.useState(false)
  const [fileData, setFileData] = useState();
  const [tableData, setTableData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [columnWidths, setColumnWidths] = useState([]);

  const [popupActive002, setPopupActive002] = React.useState(false)

  const [popupActive, setPopupActive] = React.useState(false)
  const [selectedItems, setSelectedItems] = useState([]);
  const [models, setModels] = useState();

  // MEMO
  const _params = React.useMemo(() => {
    const params = {
      internal_training: id
    }
    return params
  }, [currentRefreshCounter, id]);

  // 切換選取項目
  const toggleSelection = (itemId) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(itemId)
        ? prevSelected.filter((id) => id !== itemId) // 取消選取
        : [...prevSelected, itemId] // 加入選取
    );
  };
  // 批次刪除選取的項目
  const deleteSelectedItems = async () => {
    try {
      const _params = {
        internal_training_id: id,
        ids: selectedItems.join(',')
      }
      const _res = await S_TrainingTimeRecord.deleteBatch({ params: _params })
      Alert.alert('批次刪除成功')
    } catch (error) {
      console.log(error, 'S_TrainingTimeRecord.deleteBatch')
      Alert.alert('批次刪除失敗')
    }
    setSelectedItems([]); // 清空選取的項目
    setPopupActive(false)
    store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
  };

  // 🔹 Android 需要請求「儲存檔案」權限
  const requestExternalWritePermission = async () => {
    let _permission = false;
    if (Platform.OS === 'android') {
      try {
        // 檢查 WRITE_EXTERNAL_STORAGE 權限
        console.log(Platform.Version, 'Platform.Version');
        if (Platform.Version >= 33) {
          const permissionStatus = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
          // 如果權限已經被授予
          if (permissionStatus === RESULTS.GRANTED) {
            _permission = true;
            console.log('READ_MEDIA_DOCUMENTS permission already granted');
          } else {
            // 如果權限未被授予，請求權限
            const granted = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
            if (granted === RESULTS.GRANTED) {
              _permission = true;
              console.log('READ_MEDIA_DOCUMENTS permission granted');
            } else {
              console.log('READ_MEDIA_DOCUMENTS permission denied');
            }
          }
          return _permission;
        } else {
          const permissionStatus = await check(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
          // 如果權限已經被授予
          if (permissionStatus === RESULTS.GRANTED) {
            _permission = true;
            console.log('WRITE_EXTERNAL_STORAGE permission already granted');
          } else {
            // 如果權限未被授予，請求權限
            const granted = await request(PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE);
            if (granted === RESULTS.GRANTED) {
              _permission = true;
              console.log('WRITE_EXTERNAL_STORAGE permission granted');
            } else {
              console.log('WRITE_EXTERNAL_STORAGE permission denied');
            }
          }
          return _permission;
        }
      } catch (err) {
        console.error('Error requesting permission:', err);
        return false;
      }
    }
    return _permission;
  };

  // helper
  const getDynamicFilename = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // 補零確保兩位數
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `example_${year}${month}${day}_${hours}${minutes}${seconds}.xlsx`;
  };

  // download xlsx example 
  const DownloadExcelButton = async () => {
    if (Platform.OS === 'android') {
      try {
        // 方法二
        const fileUrl = "https://docs.google.com/spreadsheets/d/1RRIq0ekFW0jiyNaahhco9pjIMuHDnKCk/export?format=xlsx"; // 替換為您的檔案 URL
        const filename = getDynamicFilename();
        const destPath = `${RNFS.DownloadDirectoryPath}/${filename}`; // 儲存到 Download 資料夾
        try {
          // 🔹 確保舊檔案已刪除
          const fileExists = await RNFS.exists(destPath);
          if (fileExists) {
            console.log("檔案已存在，刪除中...");
            await RNFS.unlink(destPath);
            await new Promise(resolve => setTimeout(resolve, 1000)); // 確保系統釋放資源
          }
          // 🔹 下載檔案
          console.log("開始下載...");
          const response = await RNFS.downloadFile({
            fromUrl: fileUrl,
            toFile: destPath,
          }).promise;
          if (response.statusCode === 200) {
            console.log("下載成功:", destPath);
            Alert.alert("下載成功:", destPath)
            // 🔹 確保檔案被寫入
            await new Promise(resolve => setTimeout(resolve, 500));
          } else {
            console.log("下載失敗:", response);
          }
        } catch (error) {
          console.error("發生錯誤:", error);
        }
      } catch (error) {
        console.error('Error opening file:', error);
      }
    } else if (Platform.OS === 'ios') {
      const fileName = "example.xlsx";
      const assetPath = `${RNFS.MainBundlePath}/${fileName}`
      const destinationPath = `${RNFS.DocumentDirectoryPath}/${fileName}`
      const downloadFile = async () => {
        console.log("🟢 嘗試下載 Excel 檔案...");
        try {
          if (Platform.OS === "android") {
            console.log(`📂 嘗試從 assets 複製 ${fileName} 到 ${destinationPath}`);
            // 🚀 **這是 Android 版本的關鍵！**
            await RNFS.copyFileAssets(fileName, destinationPath);
            console.log("✅ 檔案成功複製到:", destinationPath);
          } else {
            // 2️⃣ 檢查目標路徑是否已經有同名檔案，如果有，先刪除
            const fileExists = await RNFS.exists(destinationPath);
            if (fileExists) {
              console.log(`📂 檔案已存在，準備刪除: ${destinationPath}`);
              await RNFS.unlink(destinationPath);  // 刪除檔案
            }
            // iOS
            console.log(`📂 嘗試從 App Bundle 複製 ${assetPath} 到 ${destinationPath}`);
            await RNFS.copyFile(assetPath, destinationPath);
          }
          // 確認檔案是否存在
          const fileExists = await RNFS.exists(destinationPath);
          if (!fileExists) {
            throw new Error("❌ 檔案未成功複製，請檢查檔案是否存在");
          }
          console.log("✅ 檔案已成功複製");
          // 📂 讓使用者下載檔案 (透過 Share 選單)
          const shareOptions = {
            title: "下載 Excel 檔案",
            url: "file://" + destinationPath, // 需要加上 "file://"
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          };
          console.log("📂 Share Options:", shareOptions);
          if (Platform.OS === 'ios') {
            await Share.open(shareOptions);
            console.log("📂 Excel 檔案已提供下載");
          }
        } catch (error) {
          console.error("❌ 下載失敗:", error);
        }
      };
      downloadFile()
    }
  }

  // 匯入xlsx
  const pickExcelFile = async () => {
    try {
      console.log("📂 開始選擇 Excel 檔案...");
      // 1️⃣ 打開檔案選擇器
      const res = await pick({
        mode: 'import',
        mimeTypes: [
          'application/vnd.ms-excel',           // .xls
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
        ]
      })
      if (!res || res.length === 0) {
        console.warn("❌ 沒有選擇檔案");
        return;
      }
      setLoading(true)
      const fileUri = res[0].uri;
      const fileName = res[0].name;
      const fileType = res[0].type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      setFileData({
        uri: fileUri,
        name: fileName,
        type: fileType,
      })
      console.log(`📄 已選擇: ${res[0].name} (${fileUri})`);
      // 2️⃣ 讀取檔案內容
      const fileContent = await RNFS.readFile(fileUri, "base64");
      // 3️⃣ 解析 Excel (使用 SheetJS)
      const workbook = XLSX.read(fileContent, { type: "base64" });
      const sheetName = workbook.SheetNames[0]; // 取得第一個 Sheet
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // 轉換成 Array of Arrays
      if (jsonData.length === 0) {
        Alert.alert("錯誤", "Excel 檔案無內容");
        return;
      }
      // console.log("✅ 解析完成:", jsonData);
      // 4️⃣ 設定表頭 & 資料
      const headers = jsonData[0]; // 第一列為表頭
      const dataRows = jsonData.slice(1); // 其餘為數據
      // 設定列寬 (根據表頭長度估算)
      const columnWidths = headers.map(header => Math.max(100, header.length * 15));
      setTableHeaders(headers);
      setTableData(dataRows);
      setColumnWidths(columnWidths);
      Alert.alert("成功", `成功匯入 ${res[0].name}`);
    } catch (err) {
      // Android 有 code；iOS 可能只有 message
      const isCancel =
        err?.code === 'DOCUMENT_PICKER_CANCELED' ||
        err?.message?.includes('user canceled') ||
        err?.message?.includes('The operation was cancelled')
      if (isCancel) {
        console.log('✅ 使用者取消選擇')
      } else {
        console.error('❌ 發生其他錯誤:', err)
      }
    }
    setLoading(false)
  };

  // 提交解析完的xlsx
  const $_submit = async () => {
    setLoading(true)
    const formData = new FormData();
    formData.append('factory', currentFactory.id);
    formData.append('file', fileData);
    const _params = {
      formData: formData,
      internal_training_id: id
    }
    try {
      const _importExcel = await S_TrainingTimeRecord.importExcel({ params: _params })
      // console.log(_importExcel, '_importExcel');
      setPopupActive002(false)
      store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
    } catch (e) {
      console.error(e);
    }
    setLoading(false)
  }

  // Options
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => null,
      headerLeft: () => {
        return (
          <WsIconBtn
            testID={"backButton"}
            name="ws-outline-arrow-left"
            color="white"
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              navigation.goBack()
            }}
          />
        )
      }
    })
  }

  React.useEffect(() => {
    $_setNavigationOption()
  }, [tabIndex])

  return (
    <>
      <>
        <WsFlex
          justifyContent="space-between"
          style={{
            padding: 16
          }}
        >
          <View>
            {models &&
              models.length > 0 && (
                <WsFlex>
                  <WsText size={14} fontWeight={600}>{`${selectedItems.length}項${t('已選取')}`}</WsText>
                  <WsGradientButton
                    disabled={selectedItems.length > 0 ? false : true}
                    btnColor={[$color.danger, $color.danger5l]}
                    style={{
                      width: 128,
                      zIndex: 999
                    }}
                    onPress={() => {
                      console.log('1111');
                      setPopupActive(true)
                    }}>
                    {t('刪除')}
                  </WsGradientButton>
                </WsFlex>
              )}
          </View>
          <WsGradientButton
            style={{
              width: 128,
            }}
            onPress={() => {
              setPopupActive002(true)
            }}>
            {t('匯入')}
          </WsGradientButton>
        </WsFlex>
        {models &&
          models.length > 0 && (
            <WsFlex
              style={{
                paddingHorizontal: 16
              }}
            >
              <CheckBox
                boxType={'square'}
                animationDuration={0}
                disabled={false}
                style={{
                  ...(Platform.OS === 'ios' && {
                    width: 24,
                    height: 24,
                  }),
                  marginRight: 8,
                  zIndex: 999
                }}
                value={''}
                onValueChange={newValue => {
                  if (newValue) {
                    models.forEach(item => {
                      item.checked = newValue;
                    });
                    const updatedItems = models.map((item) => item.id);
                    setSelectedItems(updatedItems)
                  } else {
                    models.forEach(item => {
                      item.checked = newValue;
                    });
                    setSelectedItems([])
                  }
                }}
              />
              <WsText>{t('全選')}</WsText>
            </WsFlex>
          )}
      </>
      <WsPageIndex
        modelName={'training_time_record'}
        serviceIndexKey={'index'}
        params={_params}
        ListHeaderComponent={(models) => {
          setModels(models)
          return (
            <>
            </>
          )
        }}
        renderItem={({ item, index }: { item: TrainingItem, index: number }) => (
          <>
            <LlTrainingTimeRecordCard001
              style={{
                marginTop: 16
              }}
              item={item}
              onPress={() => {
              }}
            >
              <CheckBox
                boxType={'square'}
                animationDuration={0}
                disabled={false}
                style={{
                  ...(Platform.OS === 'ios' && {
                    width: 24,
                    height: 24,
                  }),
                  marginRight: 16,
                  zIndex: 999
                }}
                value={item.checked}
                onValueChange={newValue => {
                  if (Platform.OS === 'android') {
                    item.checked = newValue
                    toggleSelection(item.id)
                  } else {
                    item.checked = newValue
                    toggleSelection(item.id)
                  }
                }}
              />

            </LlTrainingTimeRecordCard001>
          </>
        )}
        emptyTitle={t('目前尚無資料')}
      >
      </WsPageIndex>

      <WsPopup
        active={popupActive}
        onClose={() => {
          setPopupActive(false)
        }}>
        <View
          style={{
            width: width * 0.9,
            height: height * 0.2,
            backgroundColor: $color.white,
            borderRadius: 10,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
          <WsText
            size={18}
            color={$color.black}
            style={{
              position: 'absolute',
              left: 16,
              top: 16
            }}
          >{t('確定批次刪除嗎？')}
          </WsText>
          <WsFlex
            style={{
              position: 'absolute',
              right: 16,
              bottom: 16,
            }}
          >
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                width: 110,
                alignItems: 'center'
              }}
              onPress={() => {
                setPopupActive(false)
              }}>
              <WsText
                style={{
                  padding: 1
                }}
                size={14}
                color={$color.gray}
              >{t('取消')}
              </WsText>
            </TouchableOpacity>
            <WsGradientButton
              style={{
                width: 110,
              }}
              onPress={() => {
                deleteSelectedItems()
              }}>
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>

      <WsPopup
        active={popupActive002}
        onClose={() => {
          setPopupActive002(false)
        }}
      >
        <>
          {loading ? (
            <WsLoading></WsLoading>
          ) : (
            <View
              style={{
                width: width * 0.9,
                height: height * 0.85,
                backgroundColor: $color.white,
                borderRadius: 10,
                justifyContent: 'center',
                alignItems: 'center'
              }}>
              <WsText
                size={18}
                color={$color.black}
                style={{
                  position: 'absolute',
                  left: 16,
                  top: 16
                }}
              >{'匯入'}
              </WsText>

              <WsFlex
                style={{
                  position: 'absolute',
                  top: 60,
                }}
              >
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderColor: $color.gray,
                    borderRadius: 25,
                    borderWidth: 1,
                    width: 160,
                    alignItems: 'center',
                    marginRight: 16,
                  }}
                  onPress={() => {
                    DownloadExcelButton()
                  }}>
                  <WsText
                    style={{
                      padding: 1
                    }}
                    size={14}
                    color={$color.gray}
                  >{t('下載{file}範本', { file: 'xlsx' })}
                  </WsText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderColor: $color.gray,
                    borderRadius: 25,
                    borderWidth: 1,
                    width: 160,
                    alignItems: 'center'
                  }}
                  onPress={() => {
                    pickExcelFile()
                  }}>
                  <WsText
                    style={{
                      padding: 1
                    }}
                    size={14}
                    color={$color.gray}
                  >{t('匯入{file}檔案', { file: 'xlsx' })}
                  </WsText>
                </TouchableOpacity>
              </WsFlex>

              {/* 水平滾動的表格 */}
              {tableData.length > 0 && (
                <ScrollView horizontal={true} style={{ marginTop: 100, borderWidth: 1, borderColor: "#ddd" }}>
                  <Table>
                    {/* 表頭 */}
                    <TableWrapper style={{ backgroundColor: "#f1f8ff" }}>
                      <Row data={tableHeaders} widthArr={columnWidths} style={{ height: 40 }} textStyle={{ textAlign: "center", fontWeight: "bold" }} />
                    </TableWrapper>
                    {/* 垂直滾動的數據行 */}
                    <ScrollView
                      style={{
                        maxHeight: height * 0.6,
                        // borderWidth: 2
                      }}
                    >
                      <TableWrapper>
                        <Rows data={tableData} widthArr={columnWidths} textStyle={{ textAlign: "center" }} />
                      </TableWrapper>
                    </ScrollView>
                  </Table>
                </ScrollView>
              )}

              <WsFlex
                style={{
                  position: 'absolute',
                  right: 16,
                  bottom: 16,
                }}
              >
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderColor: $color.gray,
                    borderRadius: 25,
                    borderWidth: 1,
                    width: 110,
                    alignItems: 'center'
                  }}
                  onPress={() => {
                    setTableHeaders([]);
                    setTableData([]);
                    setColumnWidths([]);
                    setPopupActive002(false)
                  }}>
                  <WsText
                    style={{
                      padding: 1
                    }}
                    size={14}
                    color={$color.gray}
                  >{t('取消')}
                  </WsText>
                </TouchableOpacity>
                <WsGradientButton
                  style={{
                    width: 110,
                  }}
                  disabled={tableData && tableData.length > 0 ? false : true}
                  onPress={() => {
                    $_submit()
                  }}>
                  {t('確定')}
                </WsGradientButton>
              </WsFlex>
            </View>
          )}

        </>
      </WsPopup >
    </>
  )
}

export default TrainingRecordList