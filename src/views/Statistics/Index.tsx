import React from 'react'
import {
  View,
  FlatList
} from 'react-native'
import {
  WsPageIndex,
  WsIconBtn,
  LlStatisticsCard001
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import AsyncStorage from '@react-native-community/async-storage'

interface TrainingListProps {
  tabIndex: number;
  searchValue: string;
  defaultFilter: any;
}

interface TrainingItem {
  id: number;
}

const TrainingList: React.FC<TrainingListProps> = props => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()

  // Props
  const {
    searchValue,
    defaultFilter
  } = props

  // STATES

  // MEMO
  const params = React.useMemo(() => {
    return {
      order_by: 'train_at',
      order_way: 'desc',
      time_field: 'train_at',
      timezone: 'Asia/Taipei',
      lang: 'tw'
    }
  }, []);

  // Field
  const [filterFields] = React.useState({
    button: {
      type: 'date_range',
      label: t('日期'),
      time_field: 'created_at'
    },
    created_user: {
      type: 'belongstomany',
      label: t('管理者'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required'
    },
    factory_tags: {
      type: 'checkbox',
      label: t('標籤'),
      storeKey: "factoryTags",
      searchVisible: true,
      selectAllVisible: false,
      defaultSelected: false
    },
  })

  // Options
  const $_setNavigationOption = () => {
    navigation.setOptions({
      // headerRight: () => {
      //   return (
      //     <WsIconBtn
      //       name="md-add"
      //       color={$color.white}
      //       size={24}
      //       style={{
      //         marginRight: 4
      //       }}
      //       onPress={() => {
      //         navigation.navigate('StatisticsCreate')
      //       }}
      //     />
      //   )
      // },
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
    // 顯示或隱藏新增功能
    $_setNavigationOption()
  }, [])

  // -------------
  const [demoData, setDemoData] = React.useState([{ "name": "測試用3", "owner": "bff06c0a-81ff-11ee-89b0-42010a8c000b", "date_picker_type": 2, "end_time": "2025-10-16", "start_time": "2025-08-16", "time_unit": "day", "users": ["bff0c481-81ff-11ee-89b0-42010a8c000b", "bff06c0a-81ff-11ee-89b0-42010a8c000b"], "user_factory_role_templates": [{ "id": "bff2af36-81ff-11ee-89b0-42010a8c000b", "name": "總管理者", "owner": { "id": "bff06c0a-81ff-11ee-89b0-42010a8c000b", "name": "蔡A辣", "avatar": "https://api.ll-esh-app.wasateam.com/api/user/avatar/1754365746fCn2w/5A0D3BA9-8F5E-47CE-B6D8-A869CCA6B93E.jpg?signature=98c856a75b992806a1ad706b1396db4339b07d04207ea1ea22ae77930f7d27b2" }, "scopes": ["dashboard-read", "organization-dashboard-read", "factory-dashboard-read", "llbroadcast-read", "act-read", "act-inquiry", "act-update-factory-tag", "alert-read", "alert-slove", "task-read", "task-create", "task-update-creator", "task-update-taker", "task-update", "task-check-taker", "task-delete-creator", "task-delete-taker", "task-delete", "contractor-read", "contractor-create", "contractor-update-creator", "contractor-update-owner", "contractor-update", "contractor-delete-creator", "contractor-delete-owner", "contractor-delete", "contractor-license-read", "contractor-license-create", "contractor-license-update-creator", "contractor-license-update-reminder", "contractor-license-update", "contractor-license-delete-creator", "contractor-license-delete-reminder", "contractor-license-delete", "contract-read", "contract-create", "contract-update-creator", "contract-update-owner", "contract-update", "contract-delete-creator", "contract-delete-owner", "contract-delete", "license-read", "license-create", "license-update-creator", "license-update-reminder", "license-update", "license-delete-creator", "license-delete-reminder", "license-delete", "internal-training-read", "internal-training-create", "internal-training-update-creator", "internal-training-update-principal", "internal-training-update", "internal-training-delete-creator", "internal-training-delete-principal", "internal-training-delete", "event-read", "event-create", "event-update-creator", "event-update-owner", "event-update", "event-delete-creator", "event-delete-owner", "event-delete", "contractor-enter-record-read", "contractor-enter-record-create", "contractor-enter-record-update-creator", "contractor-enter-record-update-owner", "contractor-enter-record-update", "contractor-enter-record-delete-creator", "contractor-enter-record-delete-owner", "contractor-enter-record-delete", "exit-checklist", "audit-read", "audit-create", "audit-update-creator", "audit-update-owner", "audit-update", "audit-delete-creator", "audit-delete-owner", "audit-delete", "audit-record", "auditee-record", "checklist-read", "checklist-create", "checklist-update-creator", "checklist-update-owner", "checklist-update", "checklist-delete-creator", "checklist-delete-owner", "checklist-delete", "checklist-record-checker", "checklist-record-manager", "checklist-review-record", "checklist-sample-record", "common-choice-read", "common-choice-create", "common-choice-update-owner", "common-choice-update", "common-choice-destroy-owner", "common-choice-destroy", "change-read", "change-create", "change-update-creator", "change-update-owner", "change-update", "change-delete-creator", "change-delete-owner", "change-delete", "change-record", "user-factory-manage", "role-read", "role-create", "role-update-creator", "role-update-owner", "role-update", "role-delete-creator", "role-delete-owner", "role-delete", "factory-manage", "sos-create", "app-apply", "factory-tag-read", "factory-tag-create", "factory-tag-update", "factory-tag-delete", "factory-effect-read", "factory-effect-create", "factory-effect-update", "factory-effect-delete", "qrcode-read", "qrcode-create", "qrcode-update", "qrcode-delete", "guideline-read", "guideline-history-read", "guideline-admin-read", "guideline-admin-create", "guideline-admin-update-owner", "guideline-admin-update", "guideline-admin-destroy-owner", "guideline-admin-destroy", "guideline-admin-release", "factory-translation-manage"], "scope_factories": [{ "id": "c6c9228a-5493-45d7-9e76-7116e514d407", "name": "ESGoal新莊廠", "factory": { "id": "9b720f8a-81ff-11ee-89b0-42010a8c000b", "name": "ESGoal台灣廠", "factory": { "id": "9b72209e-81ff-11ee-89b0-42010a8c000b", "name": "ESGoal集團", "factory": null } } }], "scope_factory_ids": ["c6c9228a-5493-45d7-9e76-7116e514d407"], "system_classes": [{ "id": "070dd076-9354-11ee-89b0-42010a8c000b", "name": "環保" }, { "id": "070dd213-9354-11ee-89b0-42010a8c000b", "name": "生產安全" }, { "id": "070dd18b-9354-11ee-89b0-42010a8c000b", "name": "勞工及職業病" }, { "id": "070dd10a-9354-11ee-89b0-42010a8c000b", "name": "專門領域" }, { "id": "070dd3da-9354-11ee-89b0-42010a8c000b", "name": "通用領域" }], "system_class_ids": [4, 7, 6, 5, 10], "system_subclasses": [{ "id": "071076a4-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970290907Hxye/%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=92e2de79f59870c095a20f86b32f91b7c6c0cafb97a13a17300c44a72b253361", "name": "空氣污染防治" }, { "id": "071076f7-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970291166yRtf/%E6%B0%B4%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=a6a7398e07bf6b21a3f7a69cadaa964af1a9c7a892c5fb8a2744409f6e9bdc8e", "name": "水污染防治" }, { "id": "07107744-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029106MXgKP/%E5%9B%BA%E9%AB%94%E5%BB%A2%E7%89%A9%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=4b212fb6aa6509693f16bdf1dbb00b70792a930791a5cde04cfff6374b334a1a", "name": "廢棄物清理" }, { "id": "0710778d-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/159702917197pRF/%E5%99%AA%E9%9F%B3%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=32d6a7e86a52eceff4a0ad7481987109be95b91e15e03d5e901d6ea21bbf6ac6", "name": "噪音污染管制" }, { "id": "071077d6-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029126OUp6b/%E5%9C%9F%E5%A3%A4%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=30e6c8de279241ab70f68a7f20b400faa7fc013d0ac724555096c89709b5bb58", "name": "土壤及地下水防治" }, { "id": "07107820-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1629862124R0fss/ll-esh-toxicity.png?signature=e3772e6e45c4e85ffa112a1f0b45936dda36bb0bb73ae4cd453ca1f6cbb61ad3", "name": "毒性及關注化學物質管理" }, { "id": "0710798b-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029226UcPd9/%E5%BB%BA%E7%AF%89%E6%B6%88%E9%98%B2.png?signature=0b8087b5385841655e0ae823ff11e8820d5bcf658d2a0e8638fd22f6210553bf", "name": "建築及消防安全管理" }, { "id": "071079d6-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1629862081HLVIU/ll-esh-poison.png?signature=58f04a2b7c3457ffef6ca823418ba1738b827f3c508c1c1814651bdf49598b2d", "name": "毒化物管理" }, { "id": "071078d5-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029246Lyb7U/%E5%8B%9E%E5%8B%95%E9%97%9C%E4%BF%82.png?signature=749a66e8d292ca2b4e57a4bca3e8d1012b51a9b61268145403c6327a15e878c6", "name": "勞動關係管理" }, { "id": "07107938-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029239w4xZJ/%E8%81%B7%E6%A5%AD%E7%97%85%E9%98%B2%E6%B2%BB.png?signature=ea5317e6c205e50ba0d246bb495b10e7c1ac91aa64f60ec1125af941a05385fa", "name": "職業安全衛生" }, { "id": "07107875-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1629861988AjY7F/ll-esh-food-safety.png?signature=0a8ca19f3b74323d3973aefd4f6b9a76a2bbab69e1a8619bf4f013df3a09c455", "name": "食品安全衛生" }, { "id": "07107a78-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1629861938rotMB/ll-esh-common.png?signature=2728bebf6a45f86e71ff5eda41b76a4e966003973e134a7143801b756d639e27", "name": "通用領域" }, { "id": "07107b33-9354-11ee-89b0-42010a8c000b", "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1644926708wQ7Zn/screenshot%202022-02-15%20%E4%B8%8B%E5%8D%885.17.28.png?signature=7393dd2499134980ac93a178db5795a6917df19dafc6671071435ed9e2129fc1", "name": "20220215測試新增子領域" }], "system_subclass_ids": [14, 15, 16, 17, 18, 19, 23, 24, 21, 22, 20, 26, 28], "is_default": 1, "role_type": "user_role" }, { "id": "bff2b05b-81ff-11ee-89b0-42010a8c000b", "name": "工程師", "owner": null, "scopes": ["dashboard-read", "llbroadcast-read", "act-read", "alert-read", "alert-slove", "task-read", "task-create", "task-update", "contractor-read", "contractor-create", "contractor-update", "license-read", "license-create", "internal-training-read", "internal-training-create", "event-read", "event-create", "event-update", "contractor-enter-record-read", "contractor-enter-record-create", "contractor-enter-record-update", "exit-checklist", "audit-read", "audit-create", "audit-update", "audit-record", "auditee-record", "checklist-read", "checklist-create", "checklist-update", "checklist-record-checker", "checklist-review-record", "change-read", "change-create", "change-update", "change-record", "app-apply", "task-check-taker"], "scope_factories": [], "scope_factory_ids": [], "system_classes": [], "system_class_ids": [], "system_subclasses": [], "system_subclass_ids": [], "is_default": 1, "role_type": "user_role" }], "factory_tags": [{ "id": "ce238274-89e7-4a55-9746-86f14e598336", "name": "Beautiful", "target": null, "sequence": "0" }, { "id": "bfea5afa-81ff-11ee-89b0-42010a8c000b", "name": "公司治理", "target": null, "sequence": "2" }, { "id": "a717924d-2c30-4402-b1b8-ecedd6d53096", "name": "HRqqqqqq", "target": null, "sequence": "2" }], "remark": "測試備註", "id": "tZXKS05HM1zVg4t1QvJIn", "created_at": "2025-10-21T02:47:51.102Z" }])
  const loadStatistics = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(`@statistics_data`);
      const parsed = JSON.parse(jsonValue);
      const newArray = [parsed]; // ✅ 包成一個陣列
      // setDemoData(newArray);
    } catch (e) {
      console.error('讀取錯誤:', e);
    }
  };

  React.useEffect(() => {
    loadStatistics()
  }, [])

  return (
    <>
      {/* <WsPageIndex
        modelName={'statistics'}
        params={params}
        extendParams={searchValue}
        filterFields={filterFields}
        filterValue={defaultFilter}
        renderItem={({ item, index }: { item: TrainingItem, index: number }) => (
          <LlStatisticsCard001
            testID={`LlTrainingCard001-${index}`}
            item={item}
            style={[
              index != 0
                ? {
                  marginTop: 8
                }
                : {
                  marginTop: 8
                }
            ]}
            onPress={() => {
              navigation.push('RoutesStatistics', {
                screen: 'StatisticsShow',
                params: {
                  id: item.id
                }
              })
            }}
          />
        )}
      >
      </WsPageIndex> */}

      <FlatList
        data={demoData}
        keyExtractor={(item, index) => index}
        renderItem={({ item, index }) => {
          return (
            <LlStatisticsCard001
              item={item}
              style={[
                index != 0
                  ? {
                    marginTop: 8
                  }
                  : {
                    marginTop: 8
                  }
              ]}
              onPress={() => {
                navigation.push('RoutesStatistics', {
                  screen: 'StatisticsShow',
                  params: {
                    id: item.id
                  }
                })
              }}
            />
          )
        }}
      />
    </>
  )
}
export default TrainingList
