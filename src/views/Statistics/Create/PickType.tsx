import React, { useState } from 'react'
import {
  View,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Alert
} from 'react-native'
import {
  WsPaddingContainer,
  LlTemplatesCard001,
  WsSkeleton,
  WsModal,
  WsCard,
  WsFlex,
  WsText,
  WsGradientButton
} from '@/components'
import S_LicenseType from '@/services/api/v1/license_type'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import AsyncStorage from '@react-native-community/async-storage'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import PickTemplate from '@/views/License/Create/PickTemplate'
import S_LicenseTemplateVersion from '@/services/api/v1/license_template_version'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import CheckLists from '@/views/Statistics/Create/CheckLists'
import $color from '@/__reactnative_stone/global/color'
import { Table, Row, Rows, TableWrapper } from 'react-native-table-component';
import { pick, types } from '@react-native-documents/picker'

const LicensePickTypeTemplate = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const { width, height } = Dimensions.get('window')

  const {
    title,
    setModalAddRecord,
    statisticsId
  } = props

  // STATES
  const [stateModal001, setStateModal001] = React.useState(false)
  const [stateModal002, setStateModal002] = React.useState(false)

  const [tableHeaders, setTableHeaders] = useState([
    '訂單編號',
    '客戶',
    'Email',
    '國家/地區',
    '下單時間',
    '狀態',
    '數量',
    '總額(USD)',
  ]);

  const [columnWidths, setColumnWidths] = useState([120, 120, 220, 120, 160, 100, 80, 120]);

  // 假資料
  const genRows = (n = 20, start = 1000) =>
    Array.from({ length: n }, (_, i) => {
      const id = `ORD-${start + i}`;
      const name = `客戶 ${i + 1}`;
      const email = `user${i + 1}@demo.com`;
      const countries = ['Taiwan', 'Japan', 'USA', 'Singapore', 'Hong Kong', 'Germany', 'Australia'];
      const country = countries[i % countries.length];

      const day = String((i % 30) + 1).padStart(2, '0');
      const hh = String(9 + (i % 10)).padStart(2, '0');
      const mm = String((i * 7) % 60).padStart(2, '0');
      const time = `2025-09-${day} ${hh}:${mm}`;

      const statuses = ['已付款', '待付款', '取消'];
      const status = statuses[i % statuses.length];

      const qty = (i % 5) + 1;
      const total = (qty * (20 + (i % 10) * 5)).toFixed(2);

      return [id, name, email, country, time, status, String(qty), total];
    });

  const [tableData, setTableData] = useState(() => genRows(30));

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
      // setLoading(true)
      // const fileUri = res[0].uri;
      // const fileName = res[0].name;
      // const fileType = res[0].type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      // setFileData({
      //   uri: fileUri,
      //   name: fileName,
      //   type: fileType,
      // })
      // console.log(`📄 已選擇: ${res[0].name} (${fileUri})`);
      // // 2️⃣ 讀取檔案內容
      // const fileContent = await RNFS.readFile(fileUri, "base64");
      // // 3️⃣ 解析 Excel (使用 SheetJS)
      // const workbook = XLSX.read(fileContent, { type: "base64" });
      // const sheetName = workbook.SheetNames[0]; // 取得第一個 Sheet
      // const sheet = workbook.Sheets[sheetName];
      // const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // 轉換成 Array of Arrays
      // if (jsonData.length === 0) {
      //   Alert.alert("錯誤", "Excel 檔案無內容");
      //   return;
      // }
      // // console.log("✅ 解析完成:", jsonData);
      // // 4️⃣ 設定表頭 & 資料
      // const headers = jsonData[0]; // 第一列為表頭
      // const dataRows = jsonData.slice(1); // 其餘為數據
      // // 設定列寬 (根據表頭長度估算)
      // const columnWidths = headers.map(header => Math.max(100, header.length * 15));
      // setTableHeaders(headers);
      // setTableData(dataRows);
      // setColumnWidths(columnWidths);
      // Alert.alert("成功", `成功匯入 ${res[0].name}`);
    } catch (err) {
      // Android 有 code；iOS 可能只有 message
      // const isCancel =
      //   err?.code === 'DOCUMENT_PICKER_CANCELED' ||
      //   err?.message?.includes('user canceled') ||
      //   err?.message?.includes('The operation was cancelled')
      // if (isCancel) {
      //   console.log('✅ 使用者取消選擇')
      // } else {
      //   console.error('❌ 發生其他錯誤:', err)
      // }
    }
    // setLoading(false)
  };

  return (
    <>
      <>
        <View
          style={{
            padding: 16
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setStateModal001(true)
            }}
          >
            <WsCard
              style={[
                {
                  alignItems: 'flex-start',
                  // Android
                  elevation: 1,
                  // iOS
                  backgroundColor: 'white',
                  shadowColor: '#000000',
                  shadowOpacity: 0.1,
                  shadowRadius: 0.3,
                  shadowOffset: {
                    height: 1,
                    width: 0
                  }
                }
              ]}
            >
              <WsFlex>
                <WsText letterSpacing={1}>
                  {t('點檢表')}
                </WsText>
              </WsFlex>
            </WsCard>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 12 }}
            onPress={() => { }}
          >
            <WsCard
              style={[
                {
                  alignItems: 'flex-start',
                  // Android
                  elevation: 1,
                  // iOS
                  backgroundColor: 'white',
                  shadowColor: '#000000',
                  shadowOpacity: 0.1,
                  shadowRadius: 0.3,
                  shadowOffset: {
                    height: 1,
                    width: 0
                  }
                }
              ]}
            >
              <WsFlex>
                <WsText letterSpacing={1}>
                  {t('數量統計')}
                </WsText>
              </WsFlex>
            </WsCard>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: 12 }}
            onPress={() => {
              setStateModal002(true)
            }}
          >
            <WsCard
              style={[
                {
                  alignItems: 'flex-start',
                  // Android
                  elevation: 1,
                  // iOS
                  backgroundColor: 'white',
                  shadowColor: '#000000',
                  shadowOpacity: 0.1,
                  shadowRadius: 0.3,
                  shadowOffset: {
                    height: 1,
                    width: 0
                  }
                }
              ]}
            >
              <WsFlex>
                <WsText letterSpacing={1}>
                  {t('資料匯入')}
                </WsText>
              </WsFlex>
            </WsCard>
          </TouchableOpacity>
        </View>
      </>

      <WsModal
        animationType={'none'}
        visible={stateModal001}
        onBackButtonPress={() => {
          setStateModal001(false)
        }}
        headerLeftOnPress={() => {
          setStateModal001(false)
        }}
        title={t('點檢表')}
      >
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 16
          }}
        >
          <CheckLists
            setModalAddRecord={setModalAddRecord}
            setStateModal001={setStateModal001}
            statisticsId={statisticsId}
          ></CheckLists>
        </View>
      </WsModal >

      <WsModal
        animationType={'none'}
        visible={stateModal002}
        onBackButtonPress={() => {
          setStateModal002(false)
        }}
        headerLeftOnPress={() => {
          setStateModal002(false)
        }}
        title={t('匯入')}
      >
        <ScrollView
          style={{
            padding: 16
          }}
        >
          <WsFlex
            style={{
            }}
          >
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                alignItems: 'center'
              }}
              onPress={() => {
                pickExcelFile()
              }}>
              <WsText
                style={{
                }}
                size={14}
                color={$color.gray}
              >{t('匯入JSON檔案', { file: 'xlsx' })}
              </WsText>
            </TouchableOpacity>
          </WsFlex>

          {/* 水平滾動的表格 */}
          <View style={{ maxHeight: height * 0.6 }}>
            {tableData.length > 0 && (
              <ScrollView horizontal={true} style={{ marginTop: 16, borderWidth: 1, borderColor: "#ddd" }}>
                <Table>
                  {/* 表頭 */}
                  <TableWrapper style={{ backgroundColor: "#f1f8ff" }}>
                    <Row data={tableHeaders} widthArr={columnWidths} style={{ height: 40 }} textStyle={{ textAlign: "center", fontWeight: "bold" }} />
                  </TableWrapper>
                  {/* 垂直滾動的數據行 */}
                  <ScrollView
                    style={{
                    }}
                  >
                    <TableWrapper>
                      <Rows data={tableData} widthArr={columnWidths} textStyle={{ textAlign: "center" }} />
                    </TableWrapper>
                  </ScrollView>
                </Table>
              </ScrollView>
            )}
          </View>

          <WsFlex
            style={{
              marginTop: 16,
              alignSelf: 'flex-end'
            }}
          >
            <TouchableOpacity
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderColor: $color.gray,
                borderRadius: 25,
                borderWidth: 1,
                alignItems: 'center',
                backgroundColor: $color.white
              }}
              onPress={() => {
                // setTableHeaders([]);
                // setTableData([]);
                // setColumnWidths([]);
                // setPopupActive002(false)
              }}>
              <WsText
                style={{
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
                // $_submit()
              }}>
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </ScrollView>
      </WsModal >
    </>
  )
}
export default LicensePickTypeTemplate
