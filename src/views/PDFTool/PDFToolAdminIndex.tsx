import React, { useState } from 'react'
import {
  ScrollView,
  View,
  Dimensions,
  TouchableOpacity
} from 'react-native'
import {
  WsFlex,
  LlBtn002,
  LlEventCard001,
  WsPage,
  LlEventHeaderNumCard,
  WsGrid,
  WsPageIndex,
  WsText,
  WsDes,
  WsCard,
  WsTabView,
  WsBottomSheet
} from '@/components'
import S_EventType from '@/services/api/v1/event_type'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import PDFToolList from '@/views/PDFTool/PDFToolList'
import PDFToolTemplateList from '@/views/PDFTool/PDFToolTemplateList'
import AsyncStorage from '@react-native-community/async-storage'

const PDFToolAdminIndex = (props) => {
  const { t } = useTranslation()
  const navigation = useNavigation()

  const {
    initTabIndex = 0
  } = props

  // States
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [bottomSheetItems, setBottomSheetItems] = React.useState([])
  // Tabs
  const [tabIndex, settabIndex] = React.useState(initTabIndex ? initTabIndex : 0)
  const [tabItems] = React.useState([
    {
      value: 'PDFToolList',
      label: i18next.t('議事列表'),
      view: PDFToolList,
      props: {
      },
    },
    {
      value: 'PDFToolTemplateList',
      label: i18next.t('範本'),
      view: PDFToolTemplateList,
      props: {
      },
    }
  ])

  // Storage
  const $_clearStorage = async () => {
    await AsyncStorage.removeItem('PDFToolAdminCreateTemplate')
  }
  // Bottom Sheet
  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
    }
  }
  // Bottom Sheet
  const $_setBottomSheet = () => {
    if (tabIndex == 0) {
      setBottomSheetItems([
        {
          to: {
            name: 'PDFToolAdminCreate',
            params: {
            }
          },
          icon: 'md-add',
          label: t('新增議事')
        }
      ])
    } else if (tabIndex == 1) {
      setBottomSheetItems([
        {
          onPress: () => {
            $_clearStorage()
            navigation.push('RoutesPDFTool', {
              screen: 'PDFToolAdminCreateTemplate',
            })
          },
          icon: 'md-add',
          label: t('新增範本')
        }
      ])
    }
  }

  React.useEffect(() => {
    $_setBottomSheet()
  }, [tabIndex])


  return (
    <>
      <WsPage
        title={t('議事管理')}
        showRightBtn={true}
        iconRight="md-add"
        rightOnPress={async () => {
          if (tabIndex == 0) {
            const _defaultValue = {
              "name": "踏平瑪雷",
              "remark": "remark",
              "chairperson": "艾主席",
              "meeting_date": "2025-12-28 04:00",
              "date_format": {
                "id": "a3e32c77-ef14-475f-ba41-2bc2437d74b4",
                "value": "roc_format",
                "name": "一​一​四​年​十一月​二十四日​(​星期四​)​下午​2點15​分"
              },
              "meeting_date_format": "一一四年十二月二十八日（週日）上午4時00分",
              "location": "瑪雷大陸",
              "owner": {
                "id": "bff06c0a-81ff-11ee-89b0-42010a8c000b",
                "name": "蔡A辣",
                "email": "aa@wasateam.com"
              },
              "expired_at": "2025-12-31",
              "meeting_item_template": {
                "id": "097a817f-71f3-4ddc-b84c-d57c4241649f",
                "updated_at": "2025-12-24T01:57:32.000000Z",
                "created_at": "2025-12-24T01:57:32.000000Z",
                "name": "Test meeting  item",
                "factory_tags": [
                  {
                    "id": "9dd4c577-86dd-44d3-965e-445b56d129d3",
                    "name": "Qqqqq"
                  }
                ]
              },
              "meeting_template": {
                "id": "3644c702-8d6c-4f6c-914f-b2450dc8baed",
                "updated_at": "2025-12-24T01:55:50.000000Z",
                "created_at": "2025-12-24T01:55:50.000000Z",
                "name": "Meeting template",
                "factory_tags": [
                  {
                    "id": "bfea5afa-81ff-11ee-89b0-42010a8c000b",
                    "name": "公司治理"
                  }
                ]
              },
              "contents_template": {
                "id": "3cbbb920-d9ea-415e-86d8-21ad787086f3",
                "updated_at": "2025-12-24T01:49:13.000000Z",
                "created_at": "2025-12-24T01:49:13.000000Z",
                "name": "Catalog",
                "factory_tags": [
                  {
                    "id": "bfea5ddb-81ff-11ee-89b0-42010a8c000b",
                    "name": "環安衛管理"
                  }
                ]
              },
              "cover_template": {
                "id": "94464a2d-473d-4562-ad8e-4f15fd0f9785",
                "updated_at": "2025-12-24T02:09:28.000000Z",
                "created_at": "2025-12-24T02:09:27.000000Z",
                "name": "Cover template",
                "factory_tags": [
                  {
                    "id": "9dd4c577-86dd-44d3-965e-445b56d129d3",
                    "name": "Qqqqq"
                  }
                ]
              },
              "item_label_type": {
                "id": "7df5a394-4870-4019-a2ba-450b388e746b",
                "value": "^第[一二三四五六七八九十百]+案\\s?",
                "name": "第一案"
              },
              "factory_tags": [
                {
                  "id": "bfea5afa-81ff-11ee-89b0-42010a8c000b",
                  "name": "公司治理",
                  "target": null,
                  "sequence": "2"
                },
                {
                  "id": "ce238274-89e7-4a55-9746-86f14e598336",
                  "name": "Beautiful",
                  "target": null,
                  "sequence": "0"
                }
              ],
              "file_attaches": [
                {
                  "file": {
                    "id": "d658fb83-45e9-43aa-b661-acb500afd67e",
                    "updated_at": "2025-12-24T02:55:27.000000Z",
                    "created_at": "2025-12-24T02:55:26.000000Z",
                    "updated_user": {
                      "id": "bff06c0a-81ff-11ee-89b0-42010a8c000b",
                      "name": "蔡A辣",
                      "avatar": "https://api.ll-esh-app.wasateam.com/api/user/avatar/1754365746fCn2w/5A0D3BA9-8F5E-47CE-B6D8-A869CCA6B93E.jpg?signature=98c856a75b992806a1ad706b1396db4339b07d04207ea1ea22ae77930f7d27b2"
                    },
                    "created_user": {
                      "id": "bff06c0a-81ff-11ee-89b0-42010a8c000b",
                      "name": "蔡A辣",
                      "avatar": "https://api.ll-esh-app.wasateam.com/api/user/avatar/1754365746fCn2w/5A0D3BA9-8F5E-47CE-B6D8-A869CCA6B93E.jpg?signature=98c856a75b992806a1ad706b1396db4339b07d04207ea1ea22ae77930f7d27b2"
                    },
                    "name": "word_template_with_variables_example",
                    "source_url": "https://api.ll-esh-app.wasateam.com/api/factory/23/meeting/attach/1766544926Cr2AZ/word_template_with_variables_example.docx.docx?au=1&expires=1766580927&signature=6e1fb3074322ecccd9f9cc229aa5f5642e13070ce58597bd5b0c4186ea354ab1",
                    "public_url": null,
                    "tags": null,
                    "file_type": "docx",
                    "des": null,
                    "version_number": 1,
                    "is_secret": 0,
                    "is_public": 0,
                    "is_system": 1,
                    "is_invalid": 0,
                    "file_path": "系統資料夾/meeting/word_template_with_variables_example",
                    "file_uuid_path": "add3f15d-3c90-4231-b813-1f3ef1bbbb3c/8531e0e4-d6c9-4041-ba66-88af259ca884/d658fb83-45e9-43aa-b661-acb500afd67e",
                    "remark": null,
                    "remark_updated_at": "2025-12-24T02:55:26.000000Z",
                    "remark_updated_user": {
                      "id": "bff06c0a-81ff-11ee-89b0-42010a8c000b",
                      "name": "蔡A辣",
                      "avatar": "https://api.ll-esh-app.wasateam.com/api/user/avatar/1754365746fCn2w/5A0D3BA9-8F5E-47CE-B6D8-A869CCA6B93E.jpg?signature=98c856a75b992806a1ad706b1396db4339b07d04207ea1ea22ae77930f7d27b2"
                    },
                    "file_folder": {
                      "id": "8531e0e4-d6c9-4041-ba66-88af259ca884",
                      "name": "meeting",
                      "module": "system_files_meeting",
                      "is_secret": 0,
                      "is_public": 0,
                      "is_system": 1,
                      "folder_path": "系統資料夾/meeting",
                      "folder_uuid_path": "add3f15d-3c90-4231-b813-1f3ef1bbbb3c/8531e0e4-d6c9-4041-ba66-88af259ca884"
                    },
                    "share_factories": [],
                    "last_version": {
                      "id": "d642701a-af76-47e8-930b-dd325a46daab"
                    },
                    "article_versions": [],
                    "act_version_alls": [],
                    "factory_tags": []
                  }
                }
              ],
              "sign_in_form": [
                {
                  "file": {
                    "id": "fea3cdb8-d2fa-4197-a423-c89fb5f77daa",
                    "updated_at": "2025-12-24T02:55:37.000000Z",
                    "created_at": "2025-12-24T02:55:37.000000Z",
                    "updated_user": {
                      "id": "bff06c0a-81ff-11ee-89b0-42010a8c000b",
                      "name": "蔡A辣",
                      "avatar": "https://api.ll-esh-app.wasateam.com/api/user/avatar/1754365746fCn2w/5A0D3BA9-8F5E-47CE-B6D8-A869CCA6B93E.jpg?signature=98c856a75b992806a1ad706b1396db4339b07d04207ea1ea22ae77930f7d27b2"
                    },
                    "created_user": {
                      "id": "bff06c0a-81ff-11ee-89b0-42010a8c000b",
                      "name": "蔡A辣",
                      "avatar": "https://api.ll-esh-app.wasateam.com/api/user/avatar/1754365746fCn2w/5A0D3BA9-8F5E-47CE-B6D8-A869CCA6B93E.jpg?signature=98c856a75b992806a1ad706b1396db4339b07d04207ea1ea22ae77930f7d27b2"
                    },
                    "name": "example",
                    "source_url": "https://api.ll-esh-app.wasateam.com/api/factory/23/meeting/attach/1766544937lrdkE/example.xlsx.xlsx?au=1&expires=1766580937&signature=399b615db71770072e707bcebc28c8af9587dd5819730eab2ef5d757a784170e",
                    "public_url": null,
                    "tags": null,
                    "file_type": "xlsx",
                    "des": null,
                    "version_number": 1,
                    "is_secret": 0,
                    "is_public": 0,
                    "is_system": 1,
                    "is_invalid": 0,
                    "file_path": "系統資料夾/meeting/example",
                    "file_uuid_path": "add3f15d-3c90-4231-b813-1f3ef1bbbb3c/8531e0e4-d6c9-4041-ba66-88af259ca884/fea3cdb8-d2fa-4197-a423-c89fb5f77daa",
                    "remark": null,
                    "remark_updated_at": "2025-12-24T02:55:37.000000Z",
                    "remark_updated_user": {
                      "id": "bff06c0a-81ff-11ee-89b0-42010a8c000b",
                      "name": "蔡A辣",
                      "avatar": "https://api.ll-esh-app.wasateam.com/api/user/avatar/1754365746fCn2w/5A0D3BA9-8F5E-47CE-B6D8-A869CCA6B93E.jpg?signature=98c856a75b992806a1ad706b1396db4339b07d04207ea1ea22ae77930f7d27b2"
                    },
                    "file_folder": {
                      "id": "8531e0e4-d6c9-4041-ba66-88af259ca884",
                      "name": "meeting",
                      "module": "system_files_meeting",
                      "is_secret": 0,
                      "is_public": 0,
                      "is_system": 1,
                      "folder_path": "系統資料夾/meeting",
                      "folder_uuid_path": "add3f15d-3c90-4231-b813-1f3ef1bbbb3c/8531e0e4-d6c9-4041-ba66-88af259ca884"
                    },
                    "share_factories": [],
                    "last_version": {
                      "id": "2ce4fe92-842a-4dd4-9e27-46158544e4f6"
                    },
                    "article_versions": [],
                    "act_version_alls": [],
                    "factory_tags": []
                  }
                }
              ],
              "users": [
                {
                  "id": "bff06c0a-81ff-11ee-89b0-42010a8c000b",
                  "name": "蔡A辣",
                  "email": "aa@wasateam.com"
                }
              ],
              "roles": [
                {
                  "id": "bff2af36-81ff-11ee-89b0-42010a8c000b",
                  "name": "總管理者",
                  "owner": {
                    "id": "bff06c0a-81ff-11ee-89b0-42010a8c000b",
                    "name": "蔡A辣",
                    "avatar": "https://api.ll-esh-app.wasateam.com/api/user/avatar/1754365746fCn2w/5A0D3BA9-8F5E-47CE-B6D8-A869CCA6B93E.jpg?signature=98c856a75b992806a1ad706b1396db4339b07d04207ea1ea22ae77930f7d27b2"
                  },
                  "scopes": [
                    "dashboard-read",
                    "organization-dashboard-read",
                    "factory-dashboard-read",
                    "llbroadcast-read",
                    "act-read",
                    "act-inquiry",
                    "act-update-factory-tag",
                    "alert-read",
                    "alert-slove",
                    "task-read",
                    "task-create",
                    "task-update-creator",
                    "task-update-taker",
                    "task-update",
                    "task-check-taker",
                    "task-delete-creator",
                    "task-delete-taker",
                    "task-delete",
                    "contractor-read",
                    "contractor-create",
                    "contractor-update-creator",
                    "contractor-update-owner",
                    "contractor-update",
                    "contractor-delete-creator",
                    "contractor-delete-owner",
                    "contractor-delete",
                    "contractor-license-read",
                    "contractor-license-create",
                    "contractor-license-update-creator",
                    "contractor-license-update-reminder",
                    "contractor-license-update",
                    "contractor-license-delete-creator",
                    "contractor-license-delete-reminder",
                    "contractor-license-delete",
                    "contract-read",
                    "contract-create",
                    "contract-update-creator",
                    "contract-update-owner",
                    "contract-update",
                    "contract-delete-creator",
                    "contract-delete-owner",
                    "contract-delete",
                    "license-read",
                    "license-create",
                    "license-update-creator",
                    "license-update-reminder",
                    "license-update",
                    "license-delete-creator",
                    "license-delete-reminder",
                    "license-delete",
                    "internal-training-read",
                    "internal-training-create",
                    "internal-training-update-creator",
                    "internal-training-update-principal",
                    "internal-training-update",
                    "internal-training-delete-creator",
                    "internal-training-delete-principal",
                    "internal-training-delete",
                    "event-read",
                    "event-create",
                    "event-update-creator",
                    "event-update-owner",
                    "event-update",
                    "event-delete-creator",
                    "event-delete-owner",
                    "event-delete",
                    "contractor-enter-record-read",
                    "contractor-enter-record-create",
                    "contractor-enter-record-update-creator",
                    "contractor-enter-record-update-owner",
                    "contractor-enter-record-update",
                    "contractor-enter-record-delete-creator",
                    "contractor-enter-record-delete-owner",
                    "contractor-enter-record-delete",
                    "exit-checklist",
                    "audit-read",
                    "audit-create",
                    "audit-update-creator",
                    "audit-update-owner",
                    "audit-update",
                    "audit-delete-creator",
                    "audit-delete-owner",
                    "audit-delete",
                    "audit-record",
                    "auditee-record",
                    "checklist-read",
                    "checklist-create",
                    "checklist-update-creator",
                    "checklist-update-owner",
                    "checklist-update",
                    "checklist-delete-creator",
                    "checklist-delete-owner",
                    "checklist-delete",
                    "checklist-record-checker",
                    "checklist-record-manager",
                    "checklist-review-record",
                    "checklist-sample-record",
                    "common-choice-read",
                    "common-choice-create",
                    "common-choice-update-owner",
                    "common-choice-update",
                    "common-choice-destroy-owner",
                    "common-choice-destroy",
                    "change-read",
                    "change-create",
                    "change-update-creator",
                    "change-update-owner",
                    "change-update",
                    "change-delete-creator",
                    "change-delete-owner",
                    "change-delete",
                    "change-record",
                    "user-factory-manage",
                    "role-read",
                    "role-create",
                    "role-update-creator",
                    "role-update-owner",
                    "role-update",
                    "role-delete-creator",
                    "role-delete-owner",
                    "role-delete",
                    "factory-manage",
                    "sos-create",
                    "app-apply",
                    "factory-tag-read",
                    "factory-tag-create",
                    "factory-tag-update",
                    "factory-tag-delete",
                    "factory-effect-read",
                    "factory-effect-create",
                    "factory-effect-update",
                    "factory-effect-delete",
                    "qrcode-read",
                    "qrcode-create",
                    "qrcode-update",
                    "qrcode-delete",
                    "guideline-read",
                    "guideline-history-read",
                    "guideline-admin-read",
                    "guideline-admin-create",
                    "guideline-admin-update-owner",
                    "guideline-admin-update",
                    "guideline-admin-destroy-owner",
                    "guideline-admin-destroy",
                    "guideline-admin-release",
                    "factory-translation-manage",
                    "meeting-read",
                    "meeting-create",
                    "meeting-update",
                    "meeting-update-owner",
                    "meeting-destroy",
                    "meeting-destroy-owner",
                    "meeting-template-read",
                    "meeting-template-create",
                    "meeting-template-update",
                    "meeting-template-destroy"
                  ],
                  "scope_factories": [
                    {
                      "id": "c6c9228a-5493-45d7-9e76-7116e514d407",
                      "name": "ESGoal新莊廠",
                      "factory": {
                        "id": "9b720f8a-81ff-11ee-89b0-42010a8c000b",
                        "name": "ESGoal台灣廠",
                        "factory": {
                          "id": "9b72209e-81ff-11ee-89b0-42010a8c000b",
                          "name": "ESGoal集團",
                          "factory": null
                        }
                      }
                    }
                  ],
                  "scope_factory_ids": [
                    "c6c9228a-5493-45d7-9e76-7116e514d407"
                  ],
                  "system_classes": [
                    {
                      "id": "070dd076-9354-11ee-89b0-42010a8c000b",
                      "name": "環保"
                    },
                    {
                      "id": "070dd213-9354-11ee-89b0-42010a8c000b",
                      "name": "生產安全"
                    },
                    {
                      "id": "070dd18b-9354-11ee-89b0-42010a8c000b",
                      "name": "勞工及職業病"
                    },
                    {
                      "id": "070dd10a-9354-11ee-89b0-42010a8c000b",
                      "name": "專門領域"
                    },
                    {
                      "id": "070dd3da-9354-11ee-89b0-42010a8c000b",
                      "name": "通用領域"
                    }
                  ],
                  "system_class_ids": [
                    4,
                    7,
                    6,
                    5,
                    10
                  ],
                  "system_subclasses": [
                    {
                      "id": "071076a4-9354-11ee-89b0-42010a8c000b",
                      "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970290907Hxye/%E7%A9%BA%E6%B0%A3%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=92e2de79f59870c095a20f86b32f91b7c6c0cafb97a13a17300c44a72b253361",
                      "name": "空氣污染防治"
                    },
                    {
                      "id": "071076f7-9354-11ee-89b0-42010a8c000b",
                      "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/15970291166yRtf/%E6%B0%B4%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=a6a7398e07bf6b21a3f7a69cadaa964af1a9c7a892c5fb8a2744409f6e9bdc8e",
                      "name": "水污染防治"
                    },
                    {
                      "id": "07107744-9354-11ee-89b0-42010a8c000b",
                      "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029106MXgKP/%E5%9B%BA%E9%AB%94%E5%BB%A2%E7%89%A9%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=4b212fb6aa6509693f16bdf1dbb00b70792a930791a5cde04cfff6374b334a1a",
                      "name": "廢棄物清理"
                    },
                    {
                      "id": "0710778d-9354-11ee-89b0-42010a8c000b",
                      "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/159702917197pRF/%E5%99%AA%E9%9F%B3%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=32d6a7e86a52eceff4a0ad7481987109be95b91e15e03d5e901d6ea21bbf6ac6",
                      "name": "噪音污染管制"
                    },
                    {
                      "id": "071077d6-9354-11ee-89b0-42010a8c000b",
                      "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029126OUp6b/%E5%9C%9F%E5%A3%A4%E6%B1%A1%E6%9F%93%E9%98%B2%E6%B2%BB.png?signature=30e6c8de279241ab70f68a7f20b400faa7fc013d0ac724555096c89709b5bb58",
                      "name": "土壤及地下水防治"
                    },
                    {
                      "id": "07107820-9354-11ee-89b0-42010a8c000b",
                      "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1629862124R0fss/ll-esh-toxicity.png?signature=e3772e6e45c4e85ffa112a1f0b45936dda36bb0bb73ae4cd453ca1f6cbb61ad3",
                      "name": "毒性及關注化學物質管理"
                    },
                    {
                      "id": "0710798b-9354-11ee-89b0-42010a8c000b",
                      "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029226UcPd9/%E5%BB%BA%E7%AF%89%E6%B6%88%E9%98%B2.png?signature=0b8087b5385841655e0ae823ff11e8820d5bcf658d2a0e8638fd22f6210553bf",
                      "name": "建築及消防安全管理"
                    },
                    {
                      "id": "071079d6-9354-11ee-89b0-42010a8c000b",
                      "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1629862081HLVIU/ll-esh-poison.png?signature=58f04a2b7c3457ffef6ca823418ba1738b827f3c508c1c1814651bdf49598b2d",
                      "name": "毒化物管理"
                    },
                    {
                      "id": "071078d5-9354-11ee-89b0-42010a8c000b",
                      "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029246Lyb7U/%E5%8B%9E%E5%8B%95%E9%97%9C%E4%BF%82.png?signature=749a66e8d292ca2b4e57a4bca3e8d1012b51a9b61268145403c6327a15e878c6",
                      "name": "勞動關係管理"
                    },
                    {
                      "id": "07107938-9354-11ee-89b0-42010a8c000b",
                      "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1597029239w4xZJ/%E8%81%B7%E6%A5%AD%E7%97%85%E9%98%B2%E6%B2%BB.png?signature=ea5317e6c205e50ba0d246bb495b10e7c1ac91aa64f60ec1125af941a05385fa",
                      "name": "職業安全衛生"
                    },
                    {
                      "id": "07107875-9354-11ee-89b0-42010a8c000b",
                      "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1629861988AjY7F/ll-esh-food-safety.png?signature=0a8ca19f3b74323d3973aefd4f6b9a76a2bbab69e1a8619bf4f013df3a09c455",
                      "name": "食品安全衛生"
                    },
                    {
                      "id": "07107a78-9354-11ee-89b0-42010a8c000b",
                      "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1629861938rotMB/ll-esh-common.png?signature=2728bebf6a45f86e71ff5eda41b76a4e966003973e134a7143801b756d639e27",
                      "name": "通用領域"
                    },
                    {
                      "id": "07107b33-9354-11ee-89b0-42010a8c000b",
                      "icon": "https://api.ll-esh-app.wasateam.com/api/system_class/icon/1644926708wQ7Zn/screenshot%202022-02-15%20%E4%B8%8B%E5%8D%885.17.28.png?signature=7393dd2499134980ac93a178db5795a6917df19dafc6671071435ed9e2129fc1",
                      "name": "20220215測試新增子領域"
                    }
                  ],
                  "system_subclass_ids": [
                    14,
                    15,
                    16,
                    17,
                    18,
                    19,
                    23,
                    24,
                    21,
                    22,
                    20,
                    26,
                    28
                  ],
                  "is_default": 1,
                  "role_type": "user_role"
                },
                {
                  "id": "0713c2f9-9354-11ee-89b0-42010a8c000b",
                  "name": "Maintainer(所有權限)",
                  "scopes": [
                    "dashboard-read",
                    "organization-dashboard-read",
                    "factory-dashboard-read",
                    "llbroadcast-read",
                    "act-read",
                    "act-inquiry",
                    "act-update-factory-tag",
                    "alert-read",
                    "alert-slove",
                    "task-read",
                    "task-create",
                    "task-update-creator",
                    "task-update-taker",
                    "task-update",
                    "task-check-taker",
                    "task-delete-creator",
                    "task-delete-taker",
                    "task-delete",
                    "contractor-read",
                    "contractor-create",
                    "contractor-update-creator",
                    "contractor-update-owner",
                    "contractor-update",
                    "contractor-delete-creator",
                    "contractor-delete-owner",
                    "contractor-delete",
                    "contractor-license-read",
                    "contractor-license-create",
                    "contractor-license-update-creator",
                    "contractor-license-update-reminder",
                    "contractor-license-update",
                    "contractor-license-delete-creator",
                    "contractor-license-delete-reminder",
                    "contractor-license-delete",
                    "contract-read",
                    "contract-create",
                    "contract-update-creator",
                    "contract-update-owner",
                    "contract-update",
                    "contract-delete-creator",
                    "contract-delete-owner",
                    "contract-delete",
                    "license-read",
                    "license-create",
                    "license-update-creator",
                    "license-update-reminder",
                    "license-update",
                    "license-delete-creator",
                    "license-delete-reminder",
                    "license-delete",
                    "internal-training-read",
                    "internal-training-create",
                    "internal-training-update-creator",
                    "internal-training-update-principal",
                    "internal-training-update",
                    "internal-training-delete-creator",
                    "internal-training-delete-principal",
                    "internal-training-delete",
                    "event-read",
                    "event-create",
                    "event-update-creator",
                    "event-update-owner",
                    "event-update",
                    "event-delete-creator",
                    "event-delete-owner",
                    "event-delete",
                    "contractor-enter-record-read",
                    "contractor-enter-record-create",
                    "contractor-enter-record-update-creator",
                    "contractor-enter-record-update-owner",
                    "contractor-enter-record-update",
                    "contractor-enter-record-delete-creator",
                    "contractor-enter-record-delete-owner",
                    "contractor-enter-record-delete",
                    "exit-checklist",
                    "audit-read",
                    "audit-create",
                    "audit-update-creator",
                    "audit-update-owner",
                    "audit-update",
                    "audit-delete-creator",
                    "audit-delete-owner",
                    "audit-delete",
                    "audit-record",
                    "auditee-record",
                    "checklist-read",
                    "checklist-create",
                    "checklist-update-creator",
                    "checklist-update-owner",
                    "checklist-update",
                    "checklist-delete-creator",
                    "checklist-delete-owner",
                    "checklist-delete",
                    "checklist-record-checker",
                    "checklist-record-manager",
                    "checklist-review-record",
                    "checklist-sample-record",
                    "common-choice-read",
                    "common-choice-create",
                    "common-choice-update-owner",
                    "common-choice-update",
                    "common-choice-destroy-owner",
                    "common-choice-destroy",
                    "change-read",
                    "change-create",
                    "change-update-creator",
                    "change-update-owner",
                    "change-update",
                    "change-delete-creator",
                    "change-delete-owner",
                    "change-delete",
                    "change-record",
                    "user-factory-manage",
                    "role-read",
                    "role-create",
                    "role-update-creator",
                    "role-update-owner",
                    "role-update",
                    "role-delete-creator",
                    "role-delete-owner",
                    "role-delete",
                    "factory-manage",
                    "sos-create",
                    "app-apply",
                    "factory-tag-read",
                    "factory-tag-create",
                    "factory-tag-update",
                    "factory-tag-delete",
                    "factory-effect-read",
                    "factory-effect-create",
                    "factory-effect-update",
                    "factory-effect-delete",
                    "qrcode-read",
                    "qrcode-create",
                    "qrcode-update",
                    "qrcode-update-owner",
                    "qrcode-delete",
                    "qrcode-delete-owner",
                    "system-file-read",
                    "system-file-delete",
                    "first-folder-create",
                    "first-folder-update",
                    "first-folder-delete",
                    "other-folder-create",
                    "other-folder-update",
                    "other-folder-delete",
                    "file-create",
                    "file-update",
                    "file-delete",
                    "guideline-read",
                    "guideline-history-read",
                    "guideline-admin-read",
                    "guideline-admin-create",
                    "guideline-admin-update-owner",
                    "guideline-admin-update",
                    "guideline-admin-destroy-owner",
                    "guideline-admin-destroy",
                    "guideline-admin-release",
                    "factory-translation-manage"
                  ],
                  "is_default": 0,
                  "role_type": "user_factory_role_template"
                }
              ]
            }
            const payload = JSON.stringify(_defaultValue)
            await AsyncStorage.setItem('PDFToolAdminCreate', payload);
          }
          setIsBottomSheetActive(true)
        }}
      >
        <WsTabView
          index={tabIndex}
          setIndex={settabIndex}
          items={tabItems}
          isAutoWidth={true}
        />
      </WsPage>

      <WsBottomSheet
        snapPoints={[168, 148]}
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        items={bottomSheetItems}
        onItemPress={$_onBottomSheetItemPress}
      />
    </>
  )
}

export default PDFToolAdminIndex