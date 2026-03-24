import React, { useRef, useState, useEffect } from 'react'
import {
  ScrollView,
  View,
  Text,
  Linking,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  Touchable,
  Dimensions,
  FlatList,
  Alert,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Button,
  Modal,
  TextInput,
  PanResponder,
  findNodeHandle
} from 'react-native'
import {
  WsFlex,
  WsTag,
  WsCard,
  WsCardPassage,
  WsText,
  WsDes,
  WsIconBtn,
  WsPaddingContainer,
  WsInfo,
  LlArticleCard001,
  WsInfiniteScroll,
  WsPageIndex,
  WsSnackBar,
  WsGradientButton,
  WsIcon,
  WsState,
  WsModal,
  WsPopup,
  WsDialog,
  WsBtnLeftIconCircle,
  LlBtnAct001,
  WsCollapsible,
  WsBottomSheet,
  LlRelatedLicenseTemplateCard001,
  LlRelatedChecklistTemplateCard001,
  LlRelatedAuditTemplateCard001,
  LlRelatedContractorLicenseTemplateCard001,
  LlRelatedTrainingTemplateCard001,
  LlRelatedAuditDocs001,
  LlRelatedTrainingDocs001,
  LlRelatedLicenseDocs001,
  LlRelatedContractorLicenseDocs001,
  LlRelatedChecklistDocs001,
  WsSkeleton,
  WsLoading,
  LlRelatedFileStoreFiles001,
  LlNavButton002,
  LlTaskCard002,
  LlGuidelineArticleCard001,
  LlInfoContainer001,
  LlGuidelineArticleEditCard001,
  WsDialogDelete,
  LlRelatedGuidelineItem001,
  WsErrorMessage,
  LlRelatedTaskCard001,
  LlGuidelineRelatedDocs001,
  LlGuidelineRelatedTask001,
  LlGuidelineRelatedActs001,
  LlGuidelineRelatedGuidelines001,
  LlTaskTemplateCard001,
  LlTaskTempalteResuePopup001
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import S_Act from '@/services/api/v1/act'
import S_ArticleVersion from '@/services/api/v1/article_version'
import { useSelector } from 'react-redux'
import store from '@/store'
import {
  setFactoryTags,
  setRefreshCounter
} from '@/store/data'
import { addToCollectIds, deleteCollectId } from '@/store/data'
import { useTranslation } from 'react-i18next'
import { setCurrentAct } from '@/store/data'
import S_FactoryTag from '@/services/api/v1/factory_tag'
import AsyncStorage from '@react-native-community/async-storage'
import S_ActVersion from '@/services/api/v1/act_version'
import S_Guideline from '@/services/api/v1/guideline'
import S_GuidelineVersion from '@/services/api/v1/guideline_version'
import S_GuidelineArticleVersion from '@/services/api/v1/guideline_article_version'
import S_GuidelineAdmin from '@/services/api/v1/guideline_admin'
import S_GuidelineVersionAdmin from '@/services/api/v1/guideline_version_admin'
import S_GuidelineArticleVersionAdmin from '@/services/api/v1/guideline_article_version_admin'
import S_GuidelineArticleAdmin from '@/services/api/v1/guideline_article_admin'
import S_TaskFactoryTemplate from '@/services/api/v1/task_factory_template'
import { actions, RichEditor, RichToolbar } from "react-native-pell-rich-editor";
import IonIcon from 'react-native-vector-icons/Ionicons'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import effects from '@/services/api/v1/effects'
import { DraggableList } from './DraggableList'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import { decode } from 'html-entities';
import guideline_status from '@/services/api/v1/guideline_status'

import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { pick, types } from '@react-native-documents/picker'
import * as XLSX from "xlsx";
import { Table, Row, Rows, TableWrapper } from 'react-native-table-component';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import FileViewer from "react-native-file-viewer";
import _ from 'lodash';
import { scopePermission } from '@/__reactnative_stone/global/permission'

const GuidelineAdminShow = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Params
  const {
    id,
    refreshKey
  } = route.params

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const collectIds = useSelector(state => state.data.collectIds)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentFactoryTags = useSelector(state => state.data.factoryTags)
  const currentActStatus = useSelector(state => state.data.actStatus)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentUserScope = useSelector(state => state.data.userScopes)
  const canReadTaskTemplate = scopePermission('task-factory-template-read', currentUserScope)

  // FOR ARTICLE CREATE
  const scrollViewRef = React.useRef();
  const richText = React.useRef();
  const [modalVisible, setModalVisible] = useState(false);
  const [rows, setRows] = useState("3");
  const [cols, setCols] = useState("3");
  // 自定義按鈕動作
  const handleCustomAction = (action) => {
    setModalVisible(true)
  };
  // 插入表格 HTML
  const insertTable = () => {
    const rowNum = parseInt(rows) || 3;
    const colNum = parseInt(cols) || 3;
    let tableHTML = `<table border="1" text-align:center;">`;
    for (let i = 0; i < rowNum; i++) {
      tableHTML += "<tr>";
      for (let j = 0; j < colNum; j++) {
        tableHTML += `<td>Row ${i + 1}, Col ${j + 1}</td>`;
      }
      tableHTML += "</tr>";
    }
    tableHTML += "</table>";
    richText.current?.insertHTML(tableHTML);
    setModalVisible(false);
  };

  // STATES
  const [loading, setLoading] = React.useState(true)

  const [modalActive002, setModalActive002] = React.useState(false)
  const [stepOneSelect, setStepOneSelect] = React.useState()
  const [stepTwoSelect, setStepTwoSelect] = React.useState()
  const [stepThreeSelect, setStepThreeSelect] = React.useState('add_layer')
  const [toAddSequence, setToAddSequence] = React.useState()
  const [toAddParentArticleVersionId, setToAddParentArticleVersionId] = React.useState()

  const [tempFakeId, setTempFakeId] = React.useState()
  const [initSequencePayload, setInitSequencePayload] = React.useState()
  const [modalActive003, setModalActive003] = React.useState(false)

  const [pickValue, setPickValue] = React.useState()
  const [guideline, setGuideline] = React.useState(null)
  const [guidelineVersion, setGuidelineVersion] = React.useState(null)
  const [guidelineIndexAnnounce, setGuidelineIndexAnnounce] = React.useState()
  const [params, setParams] = React.useState()

  // article and layers
  const [mode, setMode] = React.useState('add_layer')
  const [modalActive, setModalActive] = React.useState(false)
  const [step, setStep] = React.useState(0)
  const [layerOrArticleName, setLayerOrArticleName] = React.useState('')
  const [nextTopSequence, setNextTopSequence] = React.useState('')
  const [maxDepthSequence, setMaxDepthSequence] = React.useState('')
  const [articleData, setArticleData] = React.useState({})
  // editor height
  const [editorHeight, setHeight] = useState(400);

  // filter
  const [filterFields] = React.useState({
    act_type: {
      type: 'checkbox',
      label: t('法規類別'),
      storeKey: 'actTypes'
    },
    act_status: {
      type: 'checkbox',
      label: t('法規狀態'),
      storeKey: "actStatus"
    },
    button: {
      type: 'date_range',
      label: t('異動日期'),
      time_field: 'announce_at'
    },
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    },
    factory_tags: {
      type: 'checkbox',
      label: t('標籤'),
      items: currentFactoryTags ? currentFactoryTags : [],
      searchVisible: true,
      selectAllVisible: false,
      defaultSelected: false
    },
  })
  const [popupActive002, setPopupActive002] = React.useState(false)
  const [popupDelete, setPopupDelete] = React.useState(false)
  const [models, setModels] = React.useState()

  // state about excel
  const [excelPopupActive002, setExcelPopupActive002] = React.useState(false)
  const [excelLoading, setExcelLoading] = React.useState(false)
  const [fileData, setFileData] = useState();
  const [tableData, setTableData] = useState([]);
  const [tableHeaders, setTableHeaders] = useState([]);
  const [columnWidths, setColumnWidths] = useState([]);
  const [batchArticleData, setBatchArticleData] = useState([]);
  const [importExcelStep, setImportExcelStep] = useState(1);
  const [importModels, setImportModels] = React.useState()
  const [stateTaskCreateModeModal, setStateTaskCreateModeModal] = React.useState(false)
  const [taskCreateGuidelineArticleVersionId, setTaskCreateGuidelineArticleVersionId] = React.useState()
  const [stateTemplateModal, setStateTemplateModal] = React.useState(false)
  const [stateTemplateReuseModal, setStateTemplateReuseModal] = React.useState(false)
  const [pendingTemplate, setPendingTemplate] = React.useState(null)
  const [templateHasTaker, setTemplateHasTaker] = React.useState(false)
  const [templateHasSubTaskTaker, setTemplateHasSubTaskTaker] = React.useState(false)
  const [includeSubTaskTaker, setIncludeSubTaskTaker] = React.useState(true)
  const [includeTaskTaker, setIncludeTaskTaker] = React.useState(true)
  const includeSubTaskTakerRef = React.useRef(true)
  const includeTaskTakerRef = React.useRef(true)
  const [taskTemplateFilterFields] = React.useState({
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    },
    factory_tags: {
      type: 'checkbox',
      label: t('標籤'),
      items: currentFactoryTags ? currentFactoryTags : [],
      searchVisible: true,
      selectAllVisible: false,
      defaultSelected: false
    },
  })

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            <WsFlex>
              <WsIconBtn
                name="ws-outline-edit-pencil"
                size={24}
                color={$color.white}
                style={{
                }}
                onPress={() => {
                  setIsBottomSheetActive(true)
                }}
              />
              {(
                guideline?.last_version?.id === pickValue?.id) &&
                (
                  <WsIconBtn
                    name="ll-nav-add-assignment"
                    size={24}
                    color={$color.white}
                    style={{
                      marginRight: 4
                    }}
                    onPress={() => {
                      $_onPressTaskCreate()
                    }}
                  />
                )}
            </WsFlex>
          </>
        )
      },
      headerLeft: () => {
        return (
          <WsIconBtn
            testID="backButton"
            name="ws-outline-arrow-left"
            color="white"
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              navigation.goBack()
              if (refreshKey) {
                store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
              }
            }}
          />
        )
      }
    })
    setLoading(false)
  }

  // SERVICES
  const $_fetchGuideline = async (e) => {
    console.log(id, 'guidelineId');
    setLoading(true)
    const res = await S_GuidelineAdmin.show({
      modelId: id
    })
    if (res && res.last_version) {
      // 250416-state-issues
      setParams({
        guideline_version_id: e ? e.id : res.last_version && res.last_version.id ? res.last_version.id : undefined,
      })
      const localDate = moment.utc(res.last_version?.announce_at).local()
      if (typeof e === 'undefined') {
        setPickValue({
          announce_at: localDate,
          id: res.last_version?.id
        })
      }
      const res2 = await S_GuidelineVersionAdmin.show({
        modelId: e ? e.id : res.last_version?.id
      })
      const _announceParams = {
        guideline_id: id
      }
      const res3 = await S_GuidelineVersionAdmin.indexAnnounce({ params: _announceParams })
      setGuideline(res)
      console.log(res2?.id, 'guideline_version_id');
      setGuidelineVersion(res2)
      setArticleData({
        ...articleData,
        announce_at: res2.announce_at // 預帶此內規版本之發布日
      })
      setBatchArticleData({
        guideline_id: id,
        guideline_version_id: res.last_version?.id,
        announce_at: res2.announce_at, // 預帶此內規版本之發布日
        effect_at: res2.effect_at,
        guideline_status: res.guideline_status
      })
      setGuidelineIndexAnnounce(res3.data)
      store.dispatch(setCurrentAct(res))
    } else {
      setGuideline(res)
      setParams({})
      setGuidelineVersion({})
      setLoading(false)
      navigation.setOptions({
        headerRight: () => {
          return (
            <>
              <WsFlex>
                <WsIconBtn
                  name="ws-outline-edit-pencil"
                  size={24}
                  color={$color.white}
                  style={{
                  }}
                  onPress={() => {
                    setIsBottomSheetActive(true)
                  }}
                />
              </WsFlex>
            </>
          )
        },
        headerLeft: () => {
          return (
            <WsIconBtn
              testID="backButton"
              name="ws-outline-arrow-left"
              color="white"
              size={24}
              style={{
                marginRight: 4
              }}
              onPress={() => {
                navigation.goBack()
                if (refreshKey) {
                  store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
                }
              }}
            />
          )
        }
      })
    }
  }

  // 刪除條文版本
  const $_submitDelete = async () => {
    try {
      const _data = {
        guideline_article_version_id: articleData?.id,
        guideline_versions: [guidelineVersion?.id]
      }
      const res = await S_GuidelineArticleVersionAdmin.removeByGuidelineVersion({ data: _data })
      // 若前面API成功才繼續執行排序更新
      if (res) {
        const _updateSequenceParams = {
          guideline_version_id: guidelineVersion.id,
          order: initSequencePayload.order
        }

        await S_GuidelineVersionAdmin.updateArticleSequence({ params: _updateSequenceParams })
      }
    } catch (e) {
      console.error(e.message, 'submitForCreate')
    } finally {
      navigation.replace('RoutesAct', {
        screen: 'GuidelineAdminShow',
        params: {
          id
        }
      })
    }
  }


  // 送出
  const $_submit = async () => {
    if (mode === 'add_layer') {
      const _data = {
        guideline_version: guidelineVersion?.id,
        sequence: nextTopSequence,
        type: 'title',
        parent_article_version: undefined,
        name: layerOrArticleName,
        no_text: layerOrArticleName,
        guideline: guideline?.id,
        ...articleData,
        guideline_status: articleData.guideline_status?.id,
        announce_at: moment(articleData.announce_at, "YYYY-MM-DD").utc().toISOString(),
        effect_at: moment(articleData.effect_at, "YYYY-MM-DD").utc().toISOString()
      }
      const _formatted = S_GuidelineArticleAdmin.formattedForCreate(_data)
      console.log(_formatted, 'add_layer data');
      try {
        const res = await S_GuidelineArticleAdmin.create({ data: _formatted })
        if (res) {
          navigation.replace('RoutesAct', {
            screen: 'GuidelineAdminShow',
            params: {
              id: id
            }
          })
        }
      } catch (e) {
        console.error(e.message, 'submitForCreate')
        navigation.replace('RoutesAct', {
          screen: 'GuidelineAdminShow',
          params: {
            id: id
          }
        })
      }
    }
    else if (mode === 'add_article') {
      const _data = {
        ...articleData,
        guideline: guideline?.id,
        guideline_version: guidelineVersion?.id,
        sequence: nextTopSequence,
        type: 'article',
        parent_article_version: undefined,
      }
      try {
        const _formatted = S_GuidelineArticleAdmin.formattedForCreate(_data)
        const res = await S_GuidelineArticleAdmin.create({ data: _formatted })
        if (res) {
          navigation.replace('RoutesAct', {
            screen: 'GuidelineAdminShow',
            params: {
              id: id
            }
          })
        }
      } catch (e) {
        console.error(e.message, 'submitForCreate')
        Alert.alert(t('建立條文與條文版本異常'))
        navigation.replace('RoutesAct', {
          screen: 'GuidelineAdminShow',
          params: {
            id: id
          }
        })
      }
    }
    else if (mode === 'edit_layer') {
      const _data = {
        ...articleData,
        guideline: guideline?.id,
        guideline_version: guidelineVersion?.id,
        type: 'title',
      }
      try {
        const _formatted = S_GuidelineArticleVersionAdmin.formattedForEdit(_data)
        const res = await S_GuidelineArticleVersionAdmin.update({
          modelId: _data.id,
          data: _formatted
        })
        if (res) {
          navigation.replace('RoutesAct', {
            screen: 'GuidelineAdminShow',
            params: {
              id: id
            }
          })
        }
      } catch (e) {
        console.error(e.message, 'submitForCreate')
        Alert.alert(t('編輯層級異常'))
        navigation.replace('RoutesAct', {
          screen: 'GuidelineAdminShow',
          params: {
            id: id
          }
        })
      }
    }
    else if (mode === 'edit_article') {
      const _data = {
        ...articleData,
        guideline: guideline?.id,
        guideline_version: guidelineVersion?.id,
        type: 'article',
      }
      try {
        const _formatted = S_GuidelineArticleVersionAdmin.formattedForEdit(_data)
        const res = await S_GuidelineArticleVersionAdmin.update({
          modelId: _data.id,
          data: _formatted
        })
        if (res) {
          navigation.replace('RoutesAct', {
            screen: 'GuidelineAdminShow',
            params: {
              id: id
            }
          })
        }
      } catch (e) {
        console.error(e.message, 'submitForCreate')
        Alert.alert(t('編輯條文版本異常'))
        navigation.replace('RoutesAct', {
          screen: 'GuidelineAdminShow',
          params: {
            id: id
          }
        })
      }
    }
    else if (mode === 'create_article_version') {
      const _data = {
        ...articleData,
        guideline: guideline?.id,
        guideline_version: guidelineVersion?.id,
      }
      try {
        const _formatted = S_GuidelineArticleVersionAdmin.formattedForCreateVersion(_data)
        const res = await S_GuidelineArticleVersionAdmin.create({
          data: _formatted
        })
        if (res) {
          const replaceId = (data, oldId, newId) => {
            return {
              ...data,
              order: data.order.map(item => ({
                ...item,
                id: item.id === oldId ? newId : item.id,
                parentId: item.parentId === oldId ? newId : item.parentId,
              }))
            };
          };
          const newApiPayload = replaceId(initSequencePayload, tempFakeId, res.id);
          const _updateSequenceParams = {
            guideline_version_id: guidelineVersion.id,
            order: newApiPayload.order
          }
          const updateSequence = await S_GuidelineVersionAdmin.updateArticleSequence({ params: _updateSequenceParams })
          navigation.replace('RoutesAct', {
            screen: 'GuidelineAdminShow',
            params: {
              id: id
            }
          })
        }
      } catch (e) {
        console.error(e.message, 'create_article_version error')
        Alert.alert(t('條文更版異常'))
        navigation.replace('RoutesAct', {
          screen: 'GuidelineAdminShow',
          params: {
            id: id
          }
        })
      }
    }
    else if (mode === 'create_layer_version') {
      const _data = {
        ...articleData,
        guideline: guideline?.id,
        guideline_version: guidelineVersion?.id,
      }
      try {
        // console.log(JSON.stringify(_data), '=create_layer_version=');
        const _formatted = S_GuidelineArticleVersionAdmin.formattedForCreateVersion(_data)
        // console.log(JSON.stringify(_formatted), '_formatted');
        const res = await S_GuidelineArticleVersionAdmin.create({ data: _formatted })
        if (res) {
          const replaceId = (data, oldId, newId) => {
            return {
              ...data,
              order: data.order.map(item => ({
                ...item,
                id: item.id === oldId ? newId : item.id,
                parentId: item.parentId === oldId ? newId : item.parentId,
              }))
            };
          };
          const newApiPayload = replaceId(initSequencePayload, tempFakeId, res.id);
          const _updateSequenceParams = {
            guideline_version_id: guidelineVersion.id,
            order: newApiPayload.order
          }
          const updateSequence = await S_GuidelineVersionAdmin.updateArticleSequence({ params: _updateSequenceParams })
          navigation.replace('RoutesAct', {
            screen: 'GuidelineAdminShow',
            params: {
              id: id
            }
          })
        }
      } catch (e) {
        console.error(e.message, 'create_layer_version')
        Alert.alert(t('層級更版異常'))
        navigation.replace('RoutesAct', {
          screen: 'GuidelineAdminShow',
          params: {
            id: id
          }
        })
      }
    }
    else if (mode === 'add_inner_article_or_layer') {
      if (stepTwoSelect === 'add_parent' &&
        articleData.sequence.split('-').length === 1
      ) {
        const _data = {
          ...articleData,
          guideline_status: articleData.guideline_status?.id,
          announce_at: moment(articleData.announce_at, "YYYY-MM-DD").utc().toISOString(),
          effect_at: moment(articleData.effect_at, "YYYY-MM-DD").utc().toISOString(),
          guideline_version: guidelineVersion?.id,
          sequence: toAddSequence,
          type: stepThreeSelect === 'add_layer' ? 'title' : 'article',
          parent_article_version: toAddParentArticleVersionId,
          name: layerOrArticleName,
          no_text: layerOrArticleName,
          guideline: guideline?.id,
        }
        console.log(_data, '=add_inner_article_or_layer=');
        try {
          const _formatted = S_GuidelineArticleAdmin.formattedForCreate(_data)
          const res = await S_GuidelineArticleAdmin.create({ data: _formatted })
          if (res) {
            const _params = {
              guideline_article: res.id
            }
            const _guidelineArticleVersion = await S_GuidelineArticleVersionAdmin.index({ params: _params })
            const realParentId = _guidelineArticleVersion.data[0].id
            const replaceParentId = (data, oldId, newId) => {
              return {
                ...data,
                order: data.order.map(item => ({
                  ...item,
                  id: item.id === oldId ? newId : item.id,
                  parentId: item.parentId === oldId ? newId : item.parentId
                }))
              };
            };
            const newApiPayload = replaceParentId(initSequencePayload, tempFakeId, realParentId);
            const _updateSequenceParams = {
              guideline_version_id: guidelineVersion.id,
              order: newApiPayload.order
            }
            const updateSequence = await S_GuidelineVersionAdmin.updateArticleSequence({ params: _updateSequenceParams })
            if (res) {
              navigation.replace('RoutesAct', {
                screen: 'GuidelineAdminShow',
                params: {
                  id: id
                }
              })
            }
          }
        } catch (e) {
          Alert.alert(t('建立最外層條文層級異常'))
          console.error(e.message, 'submitForCreate')
          navigation.navigate('RoutesAct', {
            screen: 'GuidelineAdminIndex'
          })
        }
      } else if (stepTwoSelect === 'add_parent' &&
        articleData.sequence.split('-').length > 1
      ) {
        const _data = {
          ...articleData,
          guideline_status: articleData.guideline_status?.id,
          announce_at: moment(articleData.announce_at, "YYYY-MM-DD").utc().toISOString(),
          effect_at: moment(articleData.effect_at, "YYYY-MM-DD").utc().toISOString(),
          guideline_version: guidelineVersion?.id,
          sequence: toAddSequence,
          type: stepThreeSelect === 'add_layer' ? 'title' : 'article',
          parent_article_version: toAddParentArticleVersionId,
          name: layerOrArticleName,
          no_text: layerOrArticleName,
          guideline: guideline?.id,
        }
        try {
          const _formatted = S_GuidelineArticleAdmin.formattedForCreate(_data)
          const res = await S_GuidelineArticleAdmin.create({ data: _formatted })
          if (res) {
            const _params = {
              guideline_article: res.id
            }
            const _guidelineArticleVersion = await S_GuidelineArticleVersionAdmin.index({ params: _params })
            const realParentId = _guidelineArticleVersion.data[0].id
            const replaceParentId = (data, oldId, newId) => {
              return {
                ...data,
                order: data.order.map(item => ({
                  ...item,
                  id: item.id === oldId ? newId : item.id,
                  parentId: item.parentId === oldId ? newId : item.parentId
                }))
              };
            };
            const newApiPayload = replaceParentId(initSequencePayload, tempFakeId, realParentId);
            const _updateSequenceParams = {
              guideline_version_id: guidelineVersion.id,
              order: newApiPayload.order
            }
            const updateSequence = await S_GuidelineVersionAdmin.updateArticleSequence({ params: _updateSequenceParams })
            if (res) {
              navigation.replace('RoutesAct', {
                screen: 'GuidelineAdminShow',
                params: {
                  id: id
                }
              })
            }
          }
        } catch (e) {
          Alert.alert(t('建立內層條文層級異常'))
          console.error(e.message, 'submitForCreate')
          navigation.navigate('RoutesAct', {
            screen: 'GuidelineAdminIndex'
          })
        }
      }
      else {
        const _data = {
          ...articleData,
          guideline_status: articleData.guideline_status?.id,
          announce_at: moment(articleData.announce_at, "YYYY-MM-DD").utc().toISOString(),
          effect_at: moment(articleData.effect_at, "YYYY-MM-DD").utc().toISOString(),
          guideline_version: guidelineVersion?.id,
          sequence: toAddSequence,
          type: stepThreeSelect === 'add_layer' ? 'title' : 'article',
          parent_article_version: toAddParentArticleVersionId,
          name: layerOrArticleName,
          no_text: layerOrArticleName,
          guideline: guideline?.id,
        }
        try {
          // console.log(_data,'_data---');
          const _formatted = S_GuidelineArticleAdmin.formattedForCreate(_data)
          const res = await S_GuidelineArticleAdmin.create({ data: _formatted })
          if (res) {
            const _params = {
              guideline_article: res.id
            }
            const _guidelineArticleVersion = await S_GuidelineArticleVersionAdmin.index({ params: _params })
            const realId = _guidelineArticleVersion.data[0].id
            const replaceId = (data, oldId, newId) => {
              return {
                ...data,
                order: data.order.map(item => ({
                  ...item,
                  id: item.id === oldId ? newId : item.id,
                }))
              };
            };
            const newApiPayload = replaceId(initSequencePayload, tempFakeId, realId);
            const _updateSequenceParams = {
              guideline_version_id: guidelineVersion.id,
              order: newApiPayload.order
            }
            const updateSequence = await S_GuidelineVersionAdmin.updateArticleSequence({ params: _updateSequenceParams })
            if (res) {
              navigation.replace('RoutesAct', {
                screen: 'GuidelineAdminShow',
                params: {
                  id: id
                }
              })
            }
          }
        } catch (e) {
          console.error(e.message, 'S_GuidelineArticleAdmin.create')
          navigation.navigate('RoutesAct', {
            screen: 'GuidelineAdminIndex'
          })
        }
      }
    }
  }

  // 內規發布版本
  const $_onPressGuidelineVersionAdminRelease = async () => {
    try {
      const _res = await S_GuidelineVersionAdmin.release({ guideline_version_id: guidelineVersion.id })
      if (_res) {
        // console.log(_res, '_res---');
        Alert.alert(t('內規版本已發布\n可以建立任務來監督模組更新'))
        store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
        navigation.replace('RoutesAct', {
          screen: 'GuidelineAdminShow',
          params: {
            id: id
          }
        })
      }
    } catch (e) {
      console.log(e.message, 'error')
    }
  }

  // Services
  const $_fetchShow = async (item) => {
    try {
      const _params = {
        guideline_article_version: item.id,
        guideline_version: guidelineVersion?.id // 是現在選擇的內規版本，非條文所見的內規版本
      }
      // console.log(_params,'_params---');
      const res = await S_GuidelineArticleVersionAdmin.show({ params: _params })
      const _formatted = S_GuidelineArticleVersionAdmin.formattedFromShow(res)
      // console.log(_formatted, '_formatted--');
      setArticleData(_formatted)
      setLoading(false)
    } catch (e) {
      console.error(e);
    }
  }

  // SUBMIT VALIDATION
  const $_validate = () => {
    if (mode === 'add_layer' &&
      layerOrArticleName
    ) {
      return true
    }
    else if (
      mode === 'add_article' && (
        articleData.name &&
        articleData.announce_at &&
        articleData.guideline_status &&
        articleData.content &&
        articleData.rich_content
      )
    ) {
      return true
    }
    else if (
      mode === 'edit_layer' &&
      articleData.name
    ) {
      return true
    }
    else if (
      mode === 'edit_article' &&
      articleData.name &&
      articleData.announce_at &&
      articleData.content
    ) {
      return true
    }
    else if (
      mode === 'create_layer_version' &&
      articleData.name
    ) {
      return true
    }
    else if (
      mode === 'create_article_version' &&
      articleData.name &&
      articleData.announce_at &&
      articleData.content
    ) {
      return true
    }
    else {
      return false
    }
  }
  const $_validate002 = () => {
    if (
      mode === 'add_inner_article_or_layer' &&
      stepThreeSelect === 'add_layer' &&
      layerOrArticleName
    ) {
      return true
    }
    else if (
      mode === 'add_inner_article_or_layer' &&
      stepThreeSelect === 'add_article' &&
      layerOrArticleName &&
      articleData.announce_at &&
      articleData.guideline_status &&
      articleData.content
    ) {
      return true
    }
    else {
      return false
    }
  }
  const $_validate003 = () => {
    return true
  }

  // 新增父層級-送排序API前處理
  const setAddParentPayload = (selectedItem, originModels) => {
    const getParentSequence = (sequence) => {
      // 如果沒有 "-"，代表已是最上層，直接回傳自己
      if (!sequence.includes("-")) return sequence;
      // 拆分後移除最後一段，並以 "-" 連接起來
      return sequence.split("-").slice(0, -1).join("-");
    };
    let _toAddSequence = getParentSequence(selectedItem.sequence)
    setToAddSequence(_toAddSequence) // 後續建立用
    // **1️⃣ 深拷貝**
    const updatedData = JSON.parse(JSON.stringify(originModels));
    // **2️⃣ 生成 `fakeParentId`**
    const generateFakeId = () => `FakeId-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const fakeParentId = generateFakeId();
    setTempFakeId(fakeParentId)  // 後續建立用
    // **3️⃣ 創建新的父層**
    const newParent = {
      id: fakeParentId,
      sequence: selectedItem.sequence, // 🚨 保持原 sequence
      parent_article_version_id: null, // 根節點無 parentId
      type: "title",
      name: `Fake Parent`,
      guideline_version: { ...selectedItem.guideline_version },
    };
    // **4️⃣ 找到 `selectedItem` 在 `updatedData` 的索引**
    const targetItemIndex = updatedData.findIndex(item => item.id === selectedItem.id);
    if (targetItemIndex === -1) {
      console.error("❌ 未找到對應的項目:", selectedItem);
      return { order: [] }; // 找不到則回傳空資料
    }
    // **5️⃣ 更新 `selectedItem` 的 `parent_article_version_id`**
    updatedData[targetItemIndex].parent_article_version_id = fakeParentId;
    // **6️⃣ 插入 `newParent` 到 `selectedItem` 前面**
    updatedData.splice(targetItemIndex, 0, newParent);
    // **7️⃣ 轉換為 API 格式**
    const transformedData = {
      order: updatedData.map(item => ({
        id: item.id,
        sequence: item.sequence,
        parentId: item.parent_article_version_id || null, // 根節點 `parentId` 應為 null
      })),
    };
    return transformedData;
  };

  // 排序用
  const sortOrderPayload = (payload) => {
    // 取得原始 order 陣列（假設順序正確）
    const originalOrder = payload.order;
    // 建立一個 map，將每個 parentId 對應的子項目（依原順序排列）
    const childrenMap = {};
    originalOrder.forEach(item => {
      const p = item.parentId; // 父層 id (null 代表頂層)
      if (!childrenMap[p]) {
        childrenMap[p] = [];
      }
      childrenMap[p].push(item);
    });
    // 定義一個遞迴函式，依照傳入的父層新的 sequence 分配子項目的新 sequence
    const assignSequences = (parentId, parentSequence) => {
      const children = childrenMap[parentId] || [];
      children.forEach((child, index) => {
        // 若 parentSequence 為空（頂層），新 sequence 為頂層順序，從 "0001" 開始
        // 否則為 parent's new sequence 加上 "-" 加上當前子項在父層中的順序（四位數格式）
        const newSeq = parentSequence
          ? `${parentSequence}-${(index + 1).toString().padStart(4, '0')}`
          : (index + 1).toString().padStart(4, '0');
        child.sequence = newSeq;
        // 遞迴處理此 child 的子項目
        assignSequences(child.id, newSeq);
      });
    };
    // 從頂層開始分配（parentId 為 null）
    assignSequences(null, '');
    // 回傳新的 payload 格式
    return { order: originalOrder };
  };


  // HELPER-目前最外層sequence+1
  const getMaxTopLevelSequence = (data) => {
    // 过滤出 parent_article_version_id === null 的最外层
    const topLevelItems = data.filter(item => item.parent_article_version_id === null);
    // 如果 data 为空，返回 "0000"
    if (topLevelItems.length === 0) return "0001";
    // 提取 `sequence` 前四字元并转换成整数
    const topSequences = topLevelItems.map(item => parseInt(item.sequence.substring(0, 4), 10));
    // 找出最大值
    const maxSequence = Math.max(...topSequences, 0);
    // 计算新的 sequence（最大值 + 1，补零）
    const _newTopLevelSequence = String(maxSequence).padStart(4, '0');
    // 預新增最外層級sequence
    const _nextSequence = String(parseInt(_newTopLevelSequence, 10) + 1).padStart(4, '0');
    return _nextSequence
  };

  // HELPER-目前最深條文sequence
  const getDeepestLastSequence = (data) => {
    if (!data || data.length === 0) return null; // 處理空數據
    // 1. 計算最大層級
    const maxDepth = Math.max(...data.map(item => item.sequence.split('-').length));
    // 2. 篩選出最大層級的所有項目
    const deepestItems = data.filter(item => item.sequence.split('-').length === maxDepth);
    if (deepestItems.length === 0) return null; // 沒有符合的數據
    // 3. 按 `sequence` 排序，取最大（最後）值
    const maxDepthSequence = deepestItems.sort((a, b) => a.sequence.localeCompare(b.sequence)).pop().sequence;
    return maxDepthSequence;
  }

  // HELPER 新增子層級
  const getAddChildrenNextSequence = (selectedItem, originModels) => {
    if (!selectedItem || !selectedItem.sequence || !selectedItem.id) {
      return null;
    }
    // 直接將 "-0001" 附加到選中項目的 sequence 後面
    const newSequence = `${selectedItem.sequence}-0001`;
    setToAddSequence(newSequence)
    const newParentId = selectedItem.id
    // **1️⃣ 深拷貝數據**
    const updatedData = JSON.parse(JSON.stringify(originModels));
    // **2️⃣ 生成 `fakeParentId`**
    const generateFakeId = () => `FakeId-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const fakeChildrenId = generateFakeId();
    setTempFakeId(fakeChildrenId)
    // **3️⃣ 創建新的子層**
    const newChildren = {
      id: fakeChildrenId,
      sequence: newSequence,
      parent_article_version_id: newParentId,
      type: articleData.type,
      name: `Fake Children`,
    };
    // **4️⃣ 找到 `selectedItem` 在 `updatedData` 的索引**
    const targetItemIndex = updatedData.findIndex(item => item.id === selectedItem.id);
    if (targetItemIndex === -1) {
      console.error("❌ 未找到對應的項目:", selectedItem);
      return { order: [] }; // 找不到則回傳空資料
    }
    // **6️⃣ 插入 `newParent` 到 `selectedItem` 前面**
    updatedData.splice(targetItemIndex + 1, 0, newChildren);
    // **7️⃣ 轉換為 API 格式**
    const transformedData = {
      order: updatedData.map(item => ({
        id: item.id,
        sequence: item.sequence,
        parentId: item.parent_article_version_id || null, // 根節點 `parentId` 應為 null
      })),
    };
    return transformedData;
  }

  // 新增同層級
  const getAddSameLevelNextSequence = (selectedItem, originModels, stepOneSelect) => {
    if (!selectedItem || !selectedItem.sequence || !selectedItem.id) {
      return null;
    }
    const parts = selectedItem.sequence.split("-");
    const parentSequence = parts.length > 1 ? parts.slice(0, parts.length - 1).join("-") : "";
    let lastNumber = parseInt(parts[parts.length - 1], 10);
    // 2. 根據 stepTwoSelect 判斷是 +1 還是 -1
    if (stepOneSelect === "add_lower") {
      // 下方新增同層項目：+1
      lastNumber = lastNumber + 1;
    } else if (stepOneSelect === "add_upper") {
      // 上方新增同層項目：-1，但不低於1
      lastNumber = lastNumber > 1 ? lastNumber - 1 : 1;
    }
    const newLastNumber = lastNumber.toString().padStart(4, "0");
    const newSequence = parentSequence ? `${parentSequence}-${newLastNumber}` : newLastNumber;
    setToAddSequence(newSequence)
    const newParentId = selectedItem.parent_article_version_id
    // **2️⃣ 生成 `fakeParentId`**
    const generateFakeId = () => `FakeId-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const fakeId = generateFakeId();
    setTempFakeId(fakeId)
    const newItem = {
      id: fakeId, // 產生臨時 ID
      sequence: newSequence,
      parent_article_version_id: newParentId, // 同層的父層 id不變
      type: selectedItem.type, // 如需要，也可設定預設名稱或其他屬性
      name: "New Same Level Item"
    };
    const updatedData = JSON.parse(JSON.stringify(originModels));
    const index = updatedData.findIndex(item => item.id === selectedItem.id);
    if (index === -1) {
      console.error("❌ 未找到選擇的項目:", selectedItem);
      return { order: [] };
    }
    // 根據 stepOneSelect 判斷向上插入或向下插入
    const insertionIndex = stepOneSelect === "add_lower" ? index + 1 : index;
    console.log(insertionIndex, 'insertionIndex---');
    updatedData.splice(insertionIndex, 0, newItem);
    // 轉換為 API 格式
    const transformToApiFormat = (data) => ({
      order: data.map(item => ({
        id: item.id,
        sequence: item.sequence,
        parentId: item.parent_article_version_id || null,
      }))
    });
    return transformToApiFormat(updatedData);
  }

  // 內規刪版
  const $_onPressGuidelineVersionAdminDelete = async (item) => {
    try {
      const _res = await S_GuidelineVersionAdmin.delete({ modelId: item.last_version?.id })
      console.log(_res, '$_onPressGuidelineVersionAdminDelete');
      if (_res) {
        navigation.reset({
          index: 0,
          routes: [{
            name: 'GuidelineAdminIndex',
            params: {
            }
          }],
        });
      }
    } catch (e) {
      console.log(e.message, 'error')
    }
  }
  // 內規建立任務
  const $_getGuidelineTaskDefaultValue = (guidelineArticleVersionId) => {
    const _guidelineSubclasses = Array.isArray(guideline?.system_subclasses)
      ? guideline.system_subclasses
      : []
    return {
      guideline_id: guideline?.id,
      guideline_version: guidelineVersion?.id,
      guideline_article_version: guidelineArticleVersionId ? guidelineArticleVersionId : undefined,
      system_subclasses: _guidelineSubclasses,
      redirect_routes: [
        {
          name: 'GuidelineAdminIndex',
        },
        {
          name: 'GuidelineAdminShow',
          params: {
            id: guideline?.id,
            refreshKey: Date.now()
          }
        },
      ]
    }
  }

  const $_setTaskCreateStorage = async (guidelineArticleVersionId) => {
    const _data = $_getGuidelineTaskDefaultValue(guidelineArticleVersionId)
    const _value = JSON.stringify(_data)
    await AsyncStorage.setItem('TaskCreate', _value)
  }

  const $_createTaskFromTemplate = async (
    _template,
    {
      includeSubTaskTaker,
      includeTaskTaker
    },
    guidelineArticleVersionId
  ) => {
    const _taskCreateDraft = S_TaskFactoryTemplate.getTaskCreateDraftFromTemplate(_template, {
      includeSubTaskTaker,
      includeTaskTaker,
      currentUser: currentUser || null
    })
    const _guidelineDefaultValue = $_getGuidelineTaskDefaultValue(guidelineArticleVersionId)
    const _templateSubclasses = Array.isArray(_taskCreateDraft?.system_subclasses)
      ? _taskCreateDraft.system_subclasses
      : []
    const _guidelineSubclasses = Array.isArray(_guidelineDefaultValue?.system_subclasses)
      ? _guidelineDefaultValue.system_subclasses
      : []
    const _mergedSystemSubclasses = [..._templateSubclasses, ..._guidelineSubclasses].reduce((acc, item) => {
      if (!item) {
        return acc
      }
      const _key = typeof item === 'object'
        ? (item.id || item.name || JSON.stringify(item))
        : String(item)
      if (!acc._set.has(_key)) {
        acc._set.add(_key)
        acc._list.push(item)
      }
      return acc
    }, { _set: new Set(), _list: [] })._list

    await AsyncStorage.removeItem('TaskCreate')
    await AsyncStorage.setItem('TaskCreate', JSON.stringify({
      ..._taskCreateDraft,
      ..._guidelineDefaultValue,
      system_subclasses: _mergedSystemSubclasses
    }))
    navigation.push('RoutesTask', {
      screen: 'TaskCreate',
    })
  }

  const $_onSelectTemplateForCreate = async (template) => {
    try {
      if (!template?.id) {
        return
      }
      const _template = await S_TaskFactoryTemplate.show({
        modelId: template.id
      })
      const _hasTemplateTaker = Boolean(_template?.taker)
      const _hasSubTaskTaker = Array.isArray(_template?.subtask_factory_templates)
        && _template.subtask_factory_templates.some(subTask => Boolean(subTask?.taker))
      setPendingTemplate(_template)
      setTemplateHasTaker(_hasTemplateTaker)
      setTemplateHasSubTaskTaker(_hasSubTaskTaker)
      setIncludeTaskTaker(_hasTemplateTaker)
      setIncludeSubTaskTaker(_hasSubTaskTaker)
      includeTaskTakerRef.current = _hasTemplateTaker
      includeSubTaskTakerRef.current = _hasSubTaskTaker
      if (!_hasTemplateTaker && !_hasSubTaskTaker) {
        setStateTemplateModal(false)
        await $_createTaskFromTemplate(_template, {
          includeSubTaskTaker: false,
          includeTaskTaker: false
        }, taskCreateGuidelineArticleVersionId)
        return
      }
      setStateTemplateModal(false)
      setStateTemplateReuseModal(true)
    } catch (error) {
      console.log(error)
    }
  }

  const $_onPressTaskCreate = async (guidelineArticleVersionId) => {
    setTaskCreateGuidelineArticleVersionId(guidelineArticleVersionId)
    if (canReadTaskTemplate) {
      setStateTaskCreateModeModal(true)
      return
    }
    await $_setTaskCreateStorage(guidelineArticleVersionId)
    navigation.push('RoutesTask', {
      screen: 'TaskCreate',
    })
  }
  // 編輯內規
  const $_onPressEdit = async (item) => {
    try {
      const _res = await S_GuidelineAdmin.show({ modelId: item?.id })
      const _data = {
        ..._res.last_version,
        ..._res,
      }
      const _formatted = S_GuidelineAdmin.formattedBeforeEdit(_data)
      const _value = JSON.stringify(_formatted)
      if (guideline?.last_version?.id === pickValue?.id && item?.last_version) {
        await AsyncStorage.setItem('GuidelineAdminUpdate', _value)
        store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
        navigation.navigate('RoutesAct', {
          screen: 'GuidelineAdminUpdate',
          params: {
            id: item.id,
            versionId: item?.last_version?.id
          }
        })
      }
      else if (guideline?.last_version?.id) {
        // 編輯非最新版內規
        await AsyncStorage.setItem('GuidelineAdminUpdateNotLastVersion', _value)
        store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
        navigation.navigate('RoutesAct', {
          screen: 'GuidelineAdminUpdateNotLastVersion',
          params: {
            id: item.id
          }
        })
      } else if (!guideline?.last_version?.id) {
        // 編輯非最新版內規
        await AsyncStorage.setItem('GuidelineAdminUpdateNoVersion', _value)
        store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
        navigation.navigate('RoutesAct', {
          screen: 'GuidelineAdminUpdateNoVersion',
          params: {
            id: item.id
          }
        })
      }
    } catch (e) {
      console.log(e.message, 'error')
    }
  }
  // 更版內規版本
  const $_onPressGuidelineVersionAdminStore = async (item) => {
    try {
      const _res = await S_GuidelineAdmin.show({ modelId: item.id })
      const _data = {
        ..._res.last_version,
        ..._res,
        guideline: item.id
      }
      const _formatted = S_GuidelineVersionAdmin.formattedDataForRouteToGuidelineAdminUpdateVersion(_data)
      // console.log(_formatted, '_formatted--');
      const _value = JSON.stringify(_formatted)
      await AsyncStorage.setItem('GuidelineAdminUpdateVersion', _value)
      navigation.push('RoutesAct', {
        screen: 'GuidelineAdminUpdateVersion',
        params: {
          id: item.id
        }
      })
    } catch (e) {
      console.log(e.message, 'error')
    }
  }

  // 刪除條文前處理
  const deleteItemAndReassignChildren = (selectedItem, originModels) => {
    // 1. 深拷貝原始陣列，避免直接修改
    const updatedModels = JSON.parse(JSON.stringify(originModels));
    // 2. 移除 selectedItem（依 id 判斷）
    const remaining = updatedModels.filter(item => item.id !== selectedItem.id);
    // 3. 遞迴函式：將所有 parent_article_version_id 為 oldParentId 的項目，更新為 newParentId
    const updateChildren = (oldParentId, newParentId) => {
      remaining.forEach(item => {
        if (item.parent_article_version_id === oldParentId) {
          item.parent_article_version_id = newParentId;
          // 遞迴處理其子項目
          // updateChildren(item.id, newParentId); //250328-issue
        }
      });
    };
    // 將所有 selectedItem 的子項目更新為 selectedItem.parent_article_version_id
    updateChildren(selectedItem.id, selectedItem.parent_article_version_id);
    // 4. 轉換為 API 格式，將 parent_article_version_id 改名為 parentId
    const transformToApiFormat = (data) => ({
      order: data.map(item => ({
        id: item.id,
        sequence: item.sequence,
        parentId: item.parent_article_version_id || null,
      }))
    });
    return transformToApiFormat(remaining);
  };

  // 更版條文層級前處理
  const reassignChildren = (selectedItem, originModels) => {
    // 1. 生成 fakeId
    const generateFakeId = () => `FakeId-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const fakeId = generateFakeId();
    setTempFakeId(fakeId);
    // 2. 深拷貝原始資料，避免直接修改 state
    const updatedModels = JSON.parse(JSON.stringify(originModels));
    // 3. 更新 selectedItem 本身的 id 為 fakeId
    updatedModels.forEach(item => {
      if (item.id === selectedItem.id) {
        item.id = fakeId;
      }
    });
    // 4. 將所有直接子層 (parent_article_version_id === selectedItem.id)
    //    更新為 fakeId
    updatedModels.forEach(item => {
      if (item.parent_article_version_id === selectedItem.id) {
        item.parent_article_version_id = fakeId;
      }
    });
    // 5. 轉換為 API 格式，將 parent_article_version_id 改名為 parentId
    const transformToApiFormat = (data) => ({
      order: data.map(item => ({
        id: item.id,
        sequence: item.sequence,
        parentId: item.parent_article_version_id || null,
      }))
    });
    return transformToApiFormat(updatedModels);
  };

  // delete-dialog
  const [dialogVisible, setDialogVisible] = React.useState(false)
  const [popupActive, setPopupActive] = React.useState(false)
  // bottom-sheet
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const bottomSheetItems = React.useMemo(() => [
    ...((
      (
        ((
          guideline?.last_version?.id === pickValue?.id) &&
          (guideline?.has_unreleased === 0)
        ) || (_.isEmpty(guidelineVersion))
      )
    )
      ? [{
        to: {
          name: 'GuidelineAdminUpdateVersion',
          params: {
            id: id
          }
        },
        icon: 'md-update',
        label: t('建立新版本')
      }] : []),
    {
      to: {
        name: 'GuidelineAdminUpdate',
        params: {
          id: id
        }
      },
      icon: 'ws-outline-edit-pencil',
      label: t('編輯')
    },
    ...(guideline?.has_related_models === false ? [{
      onPress: () => {
        setDialogVisible(true);
      },
      color: $color.danger,
      labelColor: $color.danger,
      icon: 'ws-outline-delete',
      label: t('刪除')
    }] : []),
    ...((
      guidelineVersion &&
      guidelineVersion?.has_related_models === false) ? [{
        onPress: () => {
          setPopupActive(true);
        },
        color: $color.danger,
        labelColor: $color.danger,
        icon: 'ws-outline-delete',
        label: t('刪除版本')
      }] : [])
  ], [id, guideline?.has_unreleased, pickValue?.id, guidelineIndexAnnounce]);

  // 送出排序
  const $_updateArticleSequence = async () => {
    if (!(initSequencePayload?.order?.length > 0 && guidelineVersion?.id)) {
      return;
    }
    try {
      const _updateSequenceParams = {
        guideline_version_id: guidelineVersion?.id,
        order: initSequencePayload?.order
      }
      const updateSequence = await S_GuidelineVersionAdmin.updateArticleSequence({ params: _updateSequenceParams })
      navigation.replace('RoutesAct', {
        screen: 'GuidelineAdminShow',
        params: {
          id: id
        }
      })
    } catch (e) {
      Alert.alert(t('排序更新異常'))
      console.error(e);
    }
  }

  // 匯入xlsx
  const pickExcelFile = async () => {
    try {
      console.log("📂 開始選擇 Excel 檔案...");
      // 1️⃣ 打開檔案選擇器
      const res = await pick({});
      if (!res || res.length === 0) {
        console.warn("❌ 沒有選擇檔案");
        return;
      }
      setExcelLoading(true)
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
        Alert.alert(t("錯誤"), "Excel 檔案無內容");
        return;
      }
      // console.log("✅ 解析完成:", jsonData);
      // 4️⃣ 設定表頭 & 資料
      let headers
      let dataRows
      if (Platform.OS === 'android') {
        const _jsonData = jsonData.map(row => row.slice(1));
        headers = _jsonData[1];
        dataRows = _jsonData.slice(2)
        // console.log(dataRows, 'dataRows--');
      } else if (Platform.OS === 'ios') {
        headers = jsonData[0]; // 第一列為表頭
        dataRows = jsonData.slice(1); // 其餘為數據
      }
      // 設定列寬 (根據表頭長度估算)
      const columnWidths = headers.map(header => {
        const h = header ? header.toString() : '';
        if (h.toLowerCase() === 'content') {
          return Math.max(200, h.length * 100);
        }
        return Math.max(100, h.length * 15);
      });
      setTableHeaders(headers);
      setTableData(dataRows);
      setColumnWidths(columnWidths);
      Alert.alert("成功", `成功匯入 ${res[0].name}`);
    } catch (error) {
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
    setExcelLoading(false)
  };

  // 提交解析完的xlsx
  const $_submitBatch = async () => {
    setExcelLoading(true)
    try {
      // console.log(initSequencePayload, 'initSequencePayload');
      const _formattedData = S_GuidelineArticleAdmin.formattedImportData(importModels, initSequencePayload, batchArticleData, currentFactory)
      // console.log(_formattedData, '_formattedData111');
      const _importExcel = await S_GuidelineArticleAdmin.batch({ params: _formattedData })
      // console.log(_importExcel, '_importExcel');
      setTableHeaders([]);
      setTableData([]);
      setColumnWidths([]);
      setExcelPopupActive002(false)
      setLoading(true)
      store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
    } catch (e) {
      console.error(e);
    }
    setExcelLoading(false)
  }

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
        const fileUrl = "https://docs.google.com/spreadsheets/d/14WqczXQPPbgE5696hWHMlhnwLiCY7AEM/edit?usp=sharing&ouid=109138683405660630135&rtpof=true&sd=true"; // 替換為您的檔案 URL
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
      const fileName = "batchArticleExample.xlsx";
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

  React.useEffect(() => {
    $_fetchGuideline()
  }, [id, currentRefreshCounter])

  React.useEffect(() => {
    if (!_.isEmpty(guidelineVersion)) {
      $_setNavigationOption()
    }
  }, [guidelineVersion, refreshKey])

  return (
    <>
      {!loading &&
        guidelineVersion &&
        params &&
        mode !== 'dragSort' ? (
        <>
          <WsPageIndex
            filterVisible={false}
            modelName={guidelineVersion && guidelineVersion?.id ? 'guideline_article_version_admin' : undefined}
            serviceIndexKey={'indexByGuidelineVersion'}
            params={params}
            onRefresh={() => { $_fetchGuideline() }}
            hasMeta={false}
            getAll={true}
            filterFields={filterFields}
            emptyTitle={t('目前尚無資料')}
            ListFooterComponent={() => {
              return (
                <>
                  <View
                    style={{
                      height: 50,
                    }}
                  >
                  </View>
                </>
              )
            }}
            ListHeaderComponent={(models) => {
              setModels(models)
              // 計算最上層次序
              const _nextTopSequence = getMaxTopLevelSequence(models);
              // 計算最大層級
              const _maxDepthSequence = getDeepestLastSequence(models)
              return (
                <>
                  <WsPaddingContainer
                    style={{
                    }}>
                    <WsText size={24}>{guidelineVersion?.name}</WsText>
                    <WsPaddingContainer
                      padding={0}
                      style={{
                        marginTop: 8,
                      }}>
                      {id &&
                        guideline?.last_version && (
                          <WsState
                            preText={'Ver. '}
                            label={t('選擇版本')}
                            type="belongsto"
                            modelName={'guideline_version_admin'}
                            serviceIndexKey={'indexAnnounce'}
                            nameKey={'announce_at'}
                            hasMeta={false}
                            formatNameKey={'YYYY-MM-DD'}
                            suffixText={
                              (guideline?.has_unreleased === 1 &&
                                (guideline?.last_version?.id === pickValue?.id)) ? `(${t('未發布')})` : ''
                            }
                            value={pickValue}
                            params={{
                              guideline_id: id
                            }}
                            onChange={$event => {
                              if ($event) {
                                $_fetchGuideline($event)
                                setPickValue($event)
                                navigation.setOptions({
                                  headerRight: () => null,
                                });
                              }
                            }}
                            style={{
                              zIndex: 999
                            }}
                          />
                        )}
                    </WsPaddingContainer>
                  </WsPaddingContainer>

                  <WsPaddingContainer
                    padding={0}
                    style={{
                      paddingTop: 16,
                      paddingBottom: 16,
                      paddingHorizontal: 16,
                      backgroundColor: $color.white,
                    }}
                  >
                    {guideline?.owner &&
                      (guideline?.last_version?.id === pickValue?.id) && (
                        <WsInfo
                          labelWidth={180}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                          type="user"
                          label={t('管理者')}
                          value={guideline?.owner ? guideline.owner : null}
                        />
                      )}

                    <View
                      style={{
                        marginTop: 4,
                      }}
                    >
                      <WsInfo
                        style={{
                          flexDirection: 'row',
                        }}
                        labelWidth={180}
                        label={t('修正發布日')}
                        value={guidelineVersion?.announce_at ? moment(guidelineVersion.announce_at).format('YYYY-MM-DD') : t('無')}
                      />
                    </View>

                    <View
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsInfo
                        style={{
                          flexDirection: 'row',
                        }}
                        labelWidth={180}
                        label={t('生效日')}
                        value={guidelineVersion?.effect_at ? moment(guidelineVersion.effect_at).format('YYYY-MM-DD') : t('無')}
                      />
                    </View>

                    {(guideline?.last_version?.id === pickValue?.id) && (
                      <View
                        style={{
                          marginTop: 8
                        }}
                      >
                        <WsInfo
                          style={{
                            flexDirection: 'row',
                          }}
                          labelWidth={180}
                          label={t('施行狀態')}
                          value={guideline?.guideline_status?.name ? (guideline.guideline_status.name) : t('無')}
                        />
                      </View>
                    )}


                    {(guideline?.last_version?.id === pickValue?.id) && (
                      <View
                        style={{
                          marginTop: 8
                        }}
                      >
                        <WsInfo
                          style={{
                            flexDirection: 'row',
                          }}
                          labelWidth={180}
                          label={t('發布狀態')}
                          value={guideline?.has_unreleased === 1 ? t('未發布') : t('發布')}
                        />
                      </View>
                    )}

                    {(guideline?.last_version?.id === pickValue?.id) && (
                      <>
                        {(guideline?.users &&
                          guideline?.users.length > 0) ? (
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              type={'users'}
                              labelWidth={180}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              label={t('檢閱權限-依成員')}
                              value={guideline.users}
                            />
                          </View>
                        ) : (
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={180}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              label={t('檢閱權限-依成員')}
                              valueFontSize={14}
                              value={t('無')}
                            />
                          </View>
                        )}

                        {(
                          ((guideline?.user_factory_roles &&
                            guideline?.user_factory_roles?.length > 0) ||
                            (guideline?.user_factory_role_templates &&
                              guideline?.user_factory_role_templates?.length > 0)) &&
                          (guideline?.last_version?.id === pickValue?.id)) ? (
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              type={'belongstomany'}
                              labelWidth={180}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              label={t('權限-依角色')}
                              valueFontSize={14}
                              value={[...guideline.user_factory_roles, ...guideline.user_factory_role_templates]}
                            />
                          </View>
                        ) : (
                          <View
                            style={{
                              marginTop: 8
                            }}
                          >
                            <WsInfo
                              labelWidth={180}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                              }}
                              label={t('權限-依角色')}
                              valueFontSize={14}
                              value={t('無')}
                            />
                          </View>
                        )}
                      </>
                    )}



                    {(guideline?.last_version?.id === pickValue?.id) && (
                      <WsFlex
                        style={{
                          marginTop: 8
                        }}
                        flexWrap={'wrap'}
                      >
                        {guideline?.factory_tags.map(
                          (tag, index) => {
                            return (
                              <WsTag
                                style={{
                                  marginRight: 8,
                                  marginTop: 4
                                }}
                                key={index}
                                backgroundColor={$color.white2d}
                                textColor={$color.gray}
                              >
                                {`#${t(tag.name)}`}
                              </WsTag>
                            )
                          }
                        )}
                      </WsFlex>
                    )}

                    {guidelineVersion?.remark && (
                      <View
                        style={{
                          marginTop: 8,
                        }}
                      >
                        <WsCardPassage
                          title={t('說明')}
                          padding={0}
                          passage={guidelineVersion?.remark ? guidelineVersion.remark : t('無')}
                          style={{
                            borderTopWidth: 0.3,
                            paddingTop: 8
                          }}
                        />
                      </View>
                    )}


                    {guidelineVersion &&
                      guidelineVersion?.attaches &&
                      guidelineVersion?.attaches?.length > 0 && (
                        <WsInfo
                          style={{
                            marginTop: 8,
                            borderTopWidth: 0.3,
                            paddingTop: 8
                          }}
                          type="filesAndImages"
                          label={t('附件')}
                          value={guidelineVersion.attaches}
                        />
                      )}
                  </WsPaddingContainer>

                  {/* 法規依據 */}
                  {((guidelineVersion?.act_version_alls &&
                    guidelineVersion?.act_version_alls?.length > 0) || (
                      guidelineVersion?.article_versions &&
                      guidelineVersion?.article_versions?.length > 0
                    )) && (
                      <LlGuidelineRelatedActs001
                        guideline={guideline}
                        guidelineVersion={guidelineVersion}
                      ></LlGuidelineRelatedActs001>
                    )}

                  {/* 內規相關文件/相關文件 */}
                  {guideline &&
                    guideline.last_version &&
                    ((guideline.last_version.has_guideline_version ||
                      guideline.last_version.has_guideline_article_version ||
                      guideline.last_version.has_license ||
                      guideline.last_version.has_checklist ||
                      guideline.last_version.has_audit ||
                      // guideline.last_version.has_contractor_license ||
                      guideline.last_version.has_internal_training) &&
                      (guideline.last_version?.id === pickValue?.id)) && (
                      <>
                        <LlGuidelineRelatedDocs001
                          guideline={guideline}
                        ></LlGuidelineRelatedDocs001>
                      </>
                    )}

                  {/* 相關任務 */}
                  {guidelineVersion.has_task && (
                    <>
                      <LlGuidelineRelatedTask001
                        guideline={guideline}
                        guidelineVersion={guidelineVersion}
                      ></LlGuidelineRelatedTask001>
                    </>
                  )}

                  {/* 相關內規 */}
                  {(guidelineVersion?.related_guidelines &&
                    guidelineVersion?.related_guidelines?.length > 0) && (
                      <LlGuidelineRelatedGuidelines001
                        guideline={guideline}
                        guidelineVersion={guidelineVersion}
                      ></LlGuidelineRelatedGuidelines001>
                    )}

                  {guideline?.area &&
                    guideline?.area?.name &&
                    guideline?.area?.name != undefined && (
                      <WsPaddingContainer
                        padding={0}
                        style={{
                          paddingHorizontal: 16,
                          backgroundColor: $color.white,
                          marginTop: 8
                        }}>
                        <WsInfo
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                          type="text"
                          value={t(guideline.area.name)}
                          label={t('適用地區')}
                        />
                      </WsPaddingContainer>
                    )
                  }

                  {guidelineVersion &&
                    guidelineVersion?.reference_link && (
                      <WsPaddingContainer
                        padding={0}
                        style={{
                          padding: 16,
                          backgroundColor: $color.white,
                          marginTop: 8
                        }}>
                        <WsInfo
                          type="link"
                          value={guidelineVersion.reference_link}
                          label={t('來源連結')}
                          hasExternalLink={true}
                        />
                      </WsPaddingContainer>
                    )}

                  {guideline?.factory_tags &&
                    guideline?.factory_tags?.length > 0 && (
                      <WsPaddingContainer
                        padding={0}
                        style={{
                          backgroundColor: $color.white,
                          marginTop: 8
                        }}>

                      </WsPaddingContainer>
                    )}

                  {guidelineVersion &&
                    guidelineVersion.id && (
                      <WsFlex
                        style={{
                        }}
                        justifyContent="space-between"
                      >
                        <WsIconBtn
                          name="md-add"
                          size={24}
                          color={$color.primary}
                          style={{
                            alignItems: 'flex-end',
                          }}
                          onPress={() => {
                            setStep(0)
                            setMode('add_layer')
                            // 新增時，預帶值
                            const _defaultData = {
                              announce_at: moment(guidelineVersion?.announce_at).format('YYYY-MM-DD'),
                              guideline_status: guideline?.guideline_status
                            }
                            setArticleData(_defaultData)
                            setNextTopSequence(_nextTopSequence)
                            setMaxDepthSequence(_maxDepthSequence)
                            setModalActive(true)
                          }}
                        />

                        <WsFlex
                          style={{
                            marginRight: 4
                          }}
                        >

                          {models &&
                            models.length > 1 && (
                              <TouchableOpacity
                                style={{
                                  alignItems: 'flex-end'
                                }}
                                onPress={() => {
                                  setMode('dragSort')
                                  setModalActive003(true)
                                }}>
                                <WsTag
                                  style={{
                                  }}>
                                  {t('排序')}
                                </WsTag>
                              </TouchableOpacity>
                            )}
                          <TouchableOpacity
                            style={{
                              alignItems: 'flex-end'
                            }}
                            onPress={() => {
                              setExcelPopupActive002(true)
                            }}>
                            <WsTag
                              style={{
                              }}>
                              {t('匯入')}
                            </WsTag>
                          </TouchableOpacity>
                        </WsFlex>
                      </WsFlex>
                    )}
                </>
              )
            }}
            renderItem={({ item, index, items }) => {
              return (
                <>
                  <LlGuidelineArticleEditCard001
                    key={item.id}
                    guideline={guideline}
                    guidelineVersion={guidelineVersion}
                    pickValue={pickValue ? pickValue : undefined}
                    item={item}
                    // 新增層級條文
                    onPressAdd={() => {
                      setMode('add_inner_article_or_layer')
                      setStep(1)
                      setLayerOrArticleName(null)
                      const _defaultData = {
                        ...item,
                        announce_at: moment(guidelineVersion?.announce_at).format('YYYY-MM-DD'),
                        guideline_status: guideline?.guideline_status
                      }
                      setArticleData(_defaultData)
                      setModalActive002(true)
                    }}
                    // 編輯
                    onPressEdit={() => {
                      setLoading(true)
                      if (item.type === 'article') {
                        setMode('edit_article')
                        $_fetchShow(item)
                      } else if (item.type === 'title') {
                        setMode('edit_layer')
                        $_fetchShow(item)
                      }
                      setModalActive(true)
                    }}
                    // 更版
                    onPressCreateVersion={() => {
                      setLoading(true)
                      const _apiPayload = reassignChildren(item, models)
                      const newPayload = sortOrderPayload(_apiPayload)
                      // console.log(newPayload, 'newPayload--');
                      setInitSequencePayload(newPayload)
                      if (item.type === 'article') {
                        setMode('create_article_version')
                        $_fetchShow(item)
                        setModalActive(true)
                      } else if (item.type === 'title') {
                        setMode('create_layer_version')
                        $_fetchShow(item)
                        setModalActive(true)
                      }
                    }}
                    // 刪除
                    onPressDelete={async () => {
                      const _apiPayload = deleteItemAndReassignChildren(item, models)
                      // console.log(_apiPayload,'_apiPayload---');
                      const newPayload = sortOrderPayload(_apiPayload)
                      console.log(newPayload, 'newPayload--');
                      setInitSequencePayload(newPayload)
                      await $_fetchShow(item)
                      setPopupDelete(true)
                    }}
                    onPressTaskCreate={(articleItem) => {
                      $_onPressTaskCreate(articleItem?.id)
                    }}
                  />
                </>
              )
            }}
          >
          </WsPageIndex>
        </>
      ) : (
        <WsSkeleton></WsSkeleton>
      )}

      {(!loading &&
        guideline?.has_unreleased === 1 &&
        (guideline?.last_version?.id === guidelineVersion?.id)) && (
          <WsGradientButton
            borderRadius={25}
            style={{
              marginBottom: 16,
            }}
            onPress={() => {
              setPopupActive002(true)
            }}>
            <WsText color={$color.white} size={14}>{t('發布')}</WsText>
          </WsGradientButton>
        )}

      <WsPopup
        active={popupActive002}
        onClose={() => {
          setPopupActive002(false)
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
          >{t('確定發布嗎？')}
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
              onPress={() => {
                $_onPressGuidelineVersionAdminRelease()
                setPopupActive002(false)
              }}>
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>

      <WsModal
        visible={modalActive}
        onBackButtonPress={() => {
          setMode('add_layer')
          setModalActive(false)
        }}
        headerLeftOnPress={() => {
          setMode('add_layer')
          setModalActive(false)
        }}
        headerRightOnPress={() => {
          $_submit()
          setModalActive(false)
        }}
        RightOnPressIsDisabled={$_validate() ? false : true}
        headerRightText={t('儲存')}
        title={
          (mode === 'add_article' || mode === 'add_layer') ? t('新增') :
            (mode === 'edit_article' || mode === 'edit_layer') ? t('編輯') :
              (mode === 'create_article_version' || mode === 'create_layer_version') ? t('建立條文新版本') : t('')
        }
      >
        {mode !== 'dragSort' &&
          !loading ? (
          <>
            {(mode === 'edit_article' || mode === 'edit_layer') && (
              <WsFlex style={[
                {
                  flexWrap: 'nowrap',
                  paddingTop: 16,
                  paddingHorizontal: 16,
                  maxWidth: width * 0.9,
                }
              ]}
              >
                <WsIcon
                  name="md-info-outline"
                  color={$color.danger}
                  style={{
                    marginRight: 6
                  }}
                  size={16}
                />
                <WsText
                  color={$color.danger}
                  style={{
                  }}
                  size={14}
                >{t('注意，正在編輯現行版本，綁定此版本的相關資料將參照編輯後的結果')}</WsText>
              </WsFlex>
            )}
            {(mode === 'create_article_version' || mode === 'create_layer_version') && (
              <WsFlex style={[
                {
                  flexWrap: 'nowrap',
                  paddingTop: 16,
                  paddingHorizontal: 16,
                  maxWidth: width * 0.9,
                }
              ]}
              >
                <WsIcon
                  name="md-info-outline"
                  color={$color.danger}
                  style={{
                    marginRight: 6
                  }}
                  size={16}
                />
                <WsText
                  color={$color.danger}
                  style={{
                  }}
                  size={14}
                >{t('注意，正在建立新版本')}</WsText>
              </WsFlex>
            )}
            <KeyboardAwareScrollView
              ref={scrollViewRef}
              style={{
                flex: 1, // DO NOT CLEAN
              }}
              contentContainerStyle={[
                {
                }
              ]}>
              <WsPaddingContainer>
                {(mode === 'add_layer' || mode === 'add_article') && (
                  <WsFlex
                    style={{
                      flex: 1,
                    }}
                    alignItems="flex-start"
                  >
                    <WsState
                      type={"radio"}
                      label={t('新增類型')}
                      items={[
                        { label: t('新增層級'), value: 'add_layer' },
                        { label: t('新增條文'), value: 'add_article' },
                      ]}
                      value={mode}
                      onChange={(e) => {
                        setMode(e)
                        if (e === 'add_article') {
                          setArticleData({
                            ...articleData,
                            name: `第${parseInt(nextTopSequence, 10)}條`,
                            no_text: `第${parseInt(nextTopSequence, 10)}條`,
                          })
                        }
                      }}
                    ></WsState>
                  </WsFlex>
                )}
                {mode === 'add_layer' && (
                  <>
                    {/* 除錯用 */}
                    {/* <WsText
                      style={{
                        marginBottom: 8
                      }}
                    >{nextTopSequence}
                    </WsText> */}

                    <WsState
                      style={{
                      }}
                      label={t('標題')}
                      rules={'required'}
                      placeholder={t('輸入')}
                      value={layerOrArticleName}
                      onChange={(e) => {
                        setLayerOrArticleName(e)
                      }}
                      errorMessage={!layerOrArticleName && [t('此項目為必填')]}
                    >
                    </WsState>
                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="date"
                      label={t('修正發布日')}
                      value={articleData.announce_at}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          announce_at: e
                        })
                      }}
                      placeholder={t('請選擇修正發布日...')}
                    />
                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="date"
                      label={t('生效日')}
                      value={articleData.effect_at}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          effect_at: e
                        })
                      }}
                      placeholder={t('選擇')}
                      backgroundColor={$color.primary11l}
                    />
                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="Ll_filesAndImages"
                      label={t('附件')}
                      value={articleData.file_attaches}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          file_attaches: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="multipleBelongstomany002_CRUD"
                      modelName={['effects', 'factory_effects']}
                      innerLabel={[t('建議風險'), t('自訂風險')]}
                      nameKey={'name'}
                      hasMeta={true}
                      label={t('自訂風險')}
                      placeholder={t('選擇')}
                      addIconLabel={t('新增風險')}
                      manageIconLabel={t('管理風險')}
                      value={articleData.effects_all}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          effects_all: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="belongsto002_CRUD"
                      modelName={'guideline_status'}
                      nameKey={'name'}
                      label={t('施行狀態')}
                      translate={false}
                      addIconLabel={t('新增施行狀態')}
                      manageIconLabel={t('管理施行狀態')}
                      deletableFields={['guidelines_count', 'guideline_article_versions_count']}
                      searchBarVisible={true}
                      placeholder={t('選擇')}
                      value={articleData.guideline_status}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          guideline_status: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="Ll_relatedAct"
                      modelName={'act'}
                      serviceIndexKey={'index'}
                      params={{
                        lang: 'tw',
                        order_by: 'announce_at',
                        order_way: 'desc',
                        time_field: 'announce_at',
                        act_status: currentActStatus ? currentActStatus[0].id : ''
                      }}
                      label={t('關聯法規')}
                      searchBarVisible={true}
                      placeholder={t('選擇')}
                      value={articleData.relatedActsArticles}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          relatedActsArticles: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="Ll_relatedGuideline"
                      modelName={'guideline'}
                      serviceIndexKey={'index'}
                      params={{
                        lang: 'tw',
                        order_by: 'announce_at',
                        order_way: 'desc'
                      }}
                      label={t('相關內規')}
                      searchBarVisible={true}
                      placeholder={t('選擇')}
                      value={articleData.related_guidelines_articles}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          related_guidelines_articles: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8,
                      }}
                      label={t('內容')}
                      multiline={true}
                      value={articleData.content}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          content: e
                        })
                      }}
                      placeholder={t('輸入')}
                    />
                    <>
                      {/* react-native-pell-rich-editor */}
                      <WsText size={14} style={{ marginTop: 16 }} fontWeight={600}>{t('內容 (含HTML)')}</WsText>
                      <ScrollView
                        style={{
                          borderWidth: 0.8,
                          marginTop: 8,
                          minHeight: 200,
                        }}
                      >
                        <RichToolbar
                          editor={richText}
                          actions={[
                            actions.keyboard,
                            "customAction", // ✅ 自訂 "插入表格" 按鈕
                            // actions.insertImage,
                            actions.setBold,
                            actions.setItalic,
                            actions.insertBulletsList,
                            actions.insertOrderedList,
                            actions.insertLink,
                            actions.setStrikethrough,
                            actions.setUnderline,
                            actions.removeFormat,
                            actions.checkboxList,
                            actions.undo,
                            actions.redo,
                          ]}
                          iconMap={{
                            customAction: () => <IonIcon name="grid-outline" size={24} />, // ✅ 使用 <Text> 來正確渲染 emoji
                          }}
                          customAction={handleCustomAction}
                        // onPressAddImage={(e) => {
                        //   console.log(e, 'eeee222');
                        //   // 實作你的圖片選取邏輯，並插入圖片
                        //   const imageUrl = `https://stickershop.line-scdn.net/stickershop/v1/product/14677696/LINEStorePC/main.png?v=1`
                        //   const cleanedUrl = decodeURIComponent(imageUrl).replace(/^about\s+/, '');
                        //   console.log(cleanedUrl, 'cleanedUrl!!');
                        //   richText.current.insertImage(cleanedUrl);
                        // }}
                        />
                        <ScrollView
                          style={{
                            height: 400,
                            // borderWidth:2,
                            // backgroundColor: 'green'
                          }}
                          keyboardDismissMode={"none"}
                        >
                          <View style={[
                            {
                              height: 400,
                              width: '100%',
                            }
                          ]}
                          >
                            <RichEditor
                              style={[
                                Platform.OS === 'ios' ? {
                                  minHeight: 400,
                                  padding: 10,
                                  // backgroundColor: 'pink',
                                } : {
                                  flex: 1,
                                }
                              ]
                              }
                              ref={richText}
                              containerStyle={{
                                backgroundColor: 'transparent',
                                cssText: 'body { margin: 0; padding: 10px; min-height: 400px; }'
                              }}
                              initialContentHTML={
                                articleData.rich_content
                              }
                              onHeightChange={(e) => {
                                console.log(e, "change height1");
                                setHeight(e);
                              }}
                              onChange={descriptionText => {
                                const updatedHtml = descriptionText.replace(
                                  /<p(?![^>]*style)/g,
                                  '<p style="line-height:1.5;"'
                                );
                                console.log(updatedHtml, 'updatedHtml00');
                                setArticleData({
                                  ...articleData,
                                  rich_content: updatedHtml
                                })
                              }}
                              onBlur={() => { }}
                              onDone={() => Keyboard.dismiss} // 手動關閉鍵盤
                              onFocus={() => {
                                setTimeout(() => {
                                  scrollViewRef?.current?.scrollToPosition(0, 800, true)
                                }, 300);
                              }}
                            />
                          </View>
                        </ScrollView>
                      </ScrollView>
                      {/* 🔹 自訂行數/列數的 Modal 視窗 */}
                      <Modal visible={modalVisible} transparent animationType="slide">
                        <View
                          style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(0,0,0,0.5)",
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: "white",
                              padding: 20,
                              borderRadius: 10,
                              width: "80%",
                            }}
                          >
                            <Text>輸入表格行數：</Text>
                            <TextInput
                              value={rows}
                              onChangeText={setRows}
                              keyboardType="numeric"
                              style={{ borderBottomWidth: 1, marginBottom: 10 }}
                            />
                            <Text>輸入表格列數：</Text>
                            <TextInput
                              value={cols}
                              onChangeText={setCols}
                              keyboardType="numeric"
                              style={{ borderBottomWidth: 1, marginBottom: 20 }}
                            />
                            <Button title="插入表格" onPress={insertTable} />
                            <Button title="取消" onPress={() => setModalVisible(false)} />
                          </View>
                        </View>
                      </Modal>
                    </>

                  </>
                )}
                {mode === 'add_article' && (
                  <WsPaddingContainer
                    padding={0}
                    style={{
                      paddingTop: 4,
                    }}
                  >

                    {/* 除錯用 */}
                    {/* <WsText>{nextTopSequence}</WsText> */}

                    <WsState
                      style={{
                        marginTop: 8,
                      }}
                      label={t('標題')}
                      value={articleData?.name ? articleData.name : articleData?.no_text ? articleData.no_text : ''}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          name: e,
                          no_text: e
                        })
                      }}
                      placeholder={t('輸入')}
                      rules={'required'}
                      errorMessage={!articleData?.name && [t('此項目為必填')]}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="date"
                      label={t('修正發布日')}
                      value={articleData.announce_at}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          announce_at: e
                        })
                      }}
                      placeholder={t('請選擇修正發布日...')}
                    />
                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="date"
                      label={t('生效日')}
                      value={articleData.effect_at}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          effect_at: e
                        })
                      }}
                      placeholder={t('選擇')}
                      backgroundColor={$color.primary11l}
                    />
                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="Ll_filesAndImages"
                      label={t('附件')}
                      value={articleData.file_attaches}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          file_attaches: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="multipleBelongstomany002_CRUD"
                      modelName={['effects', 'factory_effects']}
                      innerLabel={[t('建議風險'), t('自訂風險')]}
                      nameKey={'name'}
                      label={t('自訂風險')}
                      placeholder={t('選擇')}
                      addIconLabel={t('新增風險')}
                      manageIconLabel={t('管理風險')}
                      value={articleData.effects_all}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          effects_all: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="belongsto002_CRUD"
                      modelName={'guideline_status'}
                      nameKey={'name'}
                      label={t('施行狀態')}
                      translate={false}
                      addIconLabel={t('新增施行狀態')}
                      manageIconLabel={t('管理施行狀態')}
                      searchBarVisible={true}
                      placeholder={t('選擇')}
                      value={articleData.guideline_status}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          guideline_status: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="Ll_relatedAct"
                      modelName={'act'}
                      serviceIndexKey={'index'}
                      params={{
                        lang: 'tw',
                        order_by: 'announce_at',
                        order_way: 'desc',
                        time_field: 'announce_at',
                        act_status: currentActStatus ? currentActStatus[0].id : ''
                      }}
                      label={t('關聯法規')}
                      searchBarVisible={true}
                      placeholder={t('選擇')}
                      value={articleData.relatedActsArticles}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          relatedActsArticles: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="Ll_relatedGuideline"
                      modelName={'guideline'}
                      serviceIndexKey={'index'}
                      params={{
                        lang: 'tw',
                        order_by: 'announce_at',
                        order_way: 'desc'
                      }}
                      label={t('相關內規')}
                      searchBarVisible={true}
                      placeholder={t('選擇')}
                      value={articleData.related_guidelines_articles}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          related_guidelines_articles: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8,
                      }}
                      label={t('內容')}
                      multiline={true}
                      value={articleData.content}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          content: e
                        })
                      }}
                      placeholder={t('請輸入條文內容')}
                      rules={'required'}
                      errorMessage={(!articleData?.content && !articleData?.rich_content) && [t('此項目為必填')]}
                    />
                    <>
                      {/* react-native-pell-rich-editor */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 8
                        }}
                      >
                        <WsText size={14} style={{}} fontWeight={600}>{t('內容 (含HTML)')}</WsText>
                        {true && (
                          <WsText size="14" color={$color.danger}>
                            {' '}
                            *
                          </WsText>
                        )}
                      </View>
                      <ScrollView
                        style={{
                          borderWidth: 0.8,
                          marginTop: 8,
                          minHeight: 200,
                        }}
                      >
                        <RichToolbar
                          editor={richText}
                          actions={[
                            actions.keyboard,
                            "customAction", // ✅ 自訂 "插入表格" 按鈕
                            // actions.insertImage,
                            actions.setBold,
                            actions.setItalic,
                            actions.insertBulletsList,
                            actions.insertOrderedList,
                            actions.insertLink,
                            actions.setStrikethrough,
                            actions.setUnderline,
                            actions.removeFormat,
                            // actions.insertVideo,
                            actions.checkboxList,
                            actions.undo,
                            actions.redo,
                          ]}
                          iconMap={{
                            customAction: () => <IonIcon name="grid-outline" size={24} />, // ✅ 使用 <Text> 來正確渲染 emoji
                          }}
                          customAction={handleCustomAction}
                          onPressAddImage={(e) => {
                            console.log(e, 'eeee222');
                            // 實作你的圖片選取邏輯，並插入圖片
                            const imageUrl = `https://stickershop.line-scdn.net/stickershop/v1/product/14677696/LINEStorePC/main.png?v=1`
                            const cleanedUrl = decodeURIComponent(imageUrl).replace(/^about\s+/, '');
                            console.log(cleanedUrl, 'cleanedUrl!!');
                            richText.current.insertImage(cleanedUrl);
                          }}
                        />
                        <ScrollView
                          style={{
                            height: 400,
                            // borderWidth:2,
                            // backgroundColor: 'green'
                          }}
                          keyboardDismissMode={"none"}
                        >
                          <View style={[
                            {
                              height: 400,
                              width: '100%',
                            }
                          ]}
                          >
                            <RichEditor
                              style={[
                                Platform.OS === 'ios' ? {
                                  minHeight: 400,
                                  padding: 10,
                                  // backgroundColor: 'pink',
                                } : {
                                  flex: 1,
                                }
                              ]
                              }
                              ref={richText}
                              containerStyle={{
                                backgroundColor: 'transparent',
                                cssText: 'body { margin: 0; padding: 10px; min-height: 400px; }'
                              }}
                              initialContentHTML={
                                articleData.rich_content
                              }
                              onHeightChange={(e) => {
                                console.log(e, "change height1");
                                setHeight(e);
                              }}
                              onChange={descriptionText => {
                                const updatedHtml = descriptionText.replace(
                                  /<p(?![^>]*style)/g,
                                  '<p style="line-height:1.5;"'
                                );
                                console.log(updatedHtml, 'updatedHtml00');
                                setArticleData({
                                  ...articleData,
                                  rich_content: updatedHtml
                                })
                              }}
                              onBlur={() => { }}
                              onDone={() => Keyboard.dismiss} // 手動關閉鍵盤
                              onFocus={() => {
                                setTimeout(() => {
                                  scrollViewRef?.current?.scrollToPosition(0, 800, true)
                                }, 300);
                              }}
                            />
                          </View>
                        </ScrollView>
                      </ScrollView>
                      {!articleData?.rich_content && (
                        <>
                          {[t('此項目為必填')].map(errorMessageItem => (
                            <WsErrorMessage
                              key={errorMessageItem}
                            >
                              {t(errorMessageItem)}
                            </WsErrorMessage>
                          ))}
                        </>
                      )}
                      {/* 🔹 自訂行數/列數的 Modal 視窗 */}
                      <Modal visible={modalVisible} transparent animationType="slide">
                        <View
                          style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(0,0,0,0.5)",
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: "white",
                              padding: 20,
                              borderRadius: 10,
                              width: "80%",
                            }}
                          >
                            <Text>輸入表格行數：</Text>
                            <TextInput
                              value={rows}
                              onChangeText={setRows}
                              keyboardType="numeric"
                              style={{ borderBottomWidth: 1, marginBottom: 10 }}
                            />

                            <Text>輸入表格列數：</Text>
                            <TextInput
                              value={cols}
                              onChangeText={setCols}
                              keyboardType="numeric"
                              style={{ borderBottomWidth: 1, marginBottom: 20 }}
                            />

                            <Button title="插入表格" onPress={insertTable} />
                            <Button title="取消" onPress={() => setModalVisible(false)} />
                          </View>
                        </View>
                      </Modal>
                    </>
                  </WsPaddingContainer>
                )}
                {mode === 'edit_article' && (
                  <WsPaddingContainer
                    padding={0}
                    style={{
                    }}
                  >
                    {/* 除錯用 */}
                    {/* <WsText>{articleData.sequence}</WsText> */}

                    <WsState
                      style={{
                        marginTop: 8,
                      }}
                      label={t('標題')}
                      value={articleData?.name ? articleData.name : articleData?.no_text ? articleData.no_text : ''}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          name: e,
                          no_text: e
                        })
                      }}
                      placeholder={t('輸入')}
                      rules={'required'}
                      errorMessage={!articleData?.name && [t('此項目為必填')]}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="date"
                      label={t('修正發布日')}
                      value={articleData.announce_at}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          announce_at: e
                        })
                      }}
                      placeholder={t('選擇修正發布日')}
                    />
                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="date"
                      label={t('生效日')}
                      value={articleData.effect_at}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          effect_at: e
                        })
                      }}
                      placeholder={t('選擇')}
                      backgroundColor={$color.primary11l}
                    />
                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="Ll_filesAndImages"
                      label={t('附件')}
                      value={articleData.file_attaches}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          file_attaches: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="multipleBelongstomany002_CRUD"
                      modelName={['effects', 'factory_effects']}
                      innerLabel={[t('建議風險'), t('自訂風險')]}
                      nameKey={'name'}
                      label={t('自訂風險')}
                      placeholder={t('選擇')}
                      addIconLabel={t('新增風險')}
                      manageIconLabel={t('管理風險')}
                      value={articleData.effects_all}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          effects_all: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="belongsto002_CRUD"
                      modelName={'guideline_status'}
                      nameKey={'name'}
                      label={t('施行狀態')}
                      translate={false}
                      addIconLabel={t('新增施行狀態')}
                      manageIconLabel={t('管理施行狀態')}
                      searchBarVisible={true}
                      placeholder={t('選擇')}
                      value={articleData.guideline_status}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          guideline_status: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="Ll_relatedAct"
                      modelName={'act'}
                      serviceIndexKey={'index'}
                      params={{
                        lang: 'tw',
                        order_by: 'announce_at',
                        order_way: 'desc',
                        time_field: 'announce_at',
                        act_status: currentActStatus ? currentActStatus[0].id : ''
                      }}
                      label={t('關聯法規')}
                      searchBarVisible={true}
                      placeholder={t('選擇')}
                      value={articleData.relatedActsArticles}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          relatedActsArticles: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="Ll_relatedGuideline"
                      modelName={'guideline'}
                      serviceIndexKey={'index'}
                      params={{
                        lang: 'tw',
                        order_by: 'announce_at',
                        order_way: 'desc'
                      }}
                      label={t('相關內規')}
                      searchBarVisible={true}
                      placeholder={t('選擇')}
                      value={articleData.related_guidelines_articles}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          related_guidelines_articles: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8,
                      }}
                      label={t('內容')}
                      multiline={true}
                      value={articleData.content}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          content: e
                        })
                      }}
                      placeholder={t('請輸入條文內容')}
                      rules={'required'}
                      errorMessage={(!articleData?.content && !articleData?.rich_content) && [t('此項目為必填')]}
                    />
                    <>
                      {/* react-native-pell-rich-editor */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 8
                        }}
                      >
                        <WsText size={14} style={{}} fontWeight={600}>{t('內容 (含HTML)')}</WsText>
                        {true && (
                          <WsText size="14" color={$color.danger}>
                            {' '}
                            *
                          </WsText>
                        )}
                      </View>
                      <ScrollView
                        style={{
                          borderWidth: 0.8,
                          marginTop: 8,
                          minHeight: 200,
                        }}
                      >
                        <RichToolbar
                          editor={richText}
                          actions={[
                            actions.keyboard,
                            "customAction", // ✅ 自訂 "插入表格" 按鈕
                            // actions.insertImage,
                            actions.setBold,
                            actions.setItalic,
                            actions.insertBulletsList,
                            actions.insertOrderedList,
                            actions.insertLink,
                            actions.setStrikethrough,
                            actions.setUnderline,
                            actions.removeFormat,
                            // actions.insertVideo,
                            actions.checkboxList,
                            actions.undo,
                            actions.redo,
                          ]}
                          iconMap={{
                            customAction: () => <IonIcon name="grid-outline" size={24} />, // ✅ 使用 <Text> 來正確渲染 emoji
                          }}
                          customAction={handleCustomAction}
                          onPressAddImage={(e) => {
                            console.log(e, 'eeee222');
                            // 實作你的圖片選取邏輯，並插入圖片
                            const imageUrl = `https://stickershop.line-scdn.net/stickershop/v1/product/14677696/LINEStorePC/main.png?v=1`
                            const cleanedUrl = decodeURIComponent(imageUrl).replace(/^about\s+/, '');
                            console.log(cleanedUrl, 'cleanedUrl!!');
                            richText.current.insertImage(cleanedUrl);
                          }}
                        />
                        <ScrollView
                          style={{
                            height: 400,
                            // borderWidth:2,
                            // backgroundColor: 'green'
                          }}
                          keyboardDismissMode={"none"}
                        >
                          <View style={[
                            {
                              height: 400,
                              width: '100%',
                            }
                          ]}
                          >
                            <RichEditor
                              style={[
                                Platform.OS === 'ios' ? {
                                  minHeight: 400,
                                  padding: 10,
                                  // backgroundColor: 'pink',
                                } : {
                                  flex: 1,
                                }
                              ]
                              }
                              ref={richText}
                              containerStyle={{
                                backgroundColor: 'transparent',
                                cssText: 'body { margin: 0; padding: 10px; min-height: 400px; }'
                              }}
                              initialContentHTML={
                                articleData.rich_content
                              }
                              onHeightChange={(e) => {
                                console.log(e, "change height1");
                                setHeight(e);
                              }}
                              onChange={descriptionText => {
                                const updatedHtml = descriptionText.replace(
                                  /<p(?![^>]*style)/g,
                                  '<p style="line-height:1.5;"'
                                );
                                console.log(updatedHtml, 'updatedHtml00');
                                setArticleData({
                                  ...articleData,
                                  rich_content: updatedHtml
                                })
                              }}
                              onBlur={() => { }}
                              onDone={() => Keyboard.dismiss} // 手動關閉鍵盤
                              onFocus={() => {
                                setTimeout(() => {
                                  scrollViewRef?.current?.scrollToPosition(0, 800, true)
                                }, 300);
                              }}
                            />
                          </View>
                        </ScrollView>
                      </ScrollView>
                      {!articleData?.rich_content && (
                        <>
                          {[t('此項目為必填')].map(errorMessageItem => (
                            <WsErrorMessage
                              key={errorMessageItem}
                            >
                              {t(errorMessageItem)}
                            </WsErrorMessage>
                          ))}
                        </>
                      )}

                      {/* 🔹 自訂行數/列數的 Modal 視窗 */}
                      <Modal visible={modalVisible} transparent animationType="slide">
                        <View
                          style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(0,0,0,0.5)",
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: "white",
                              padding: 20,
                              borderRadius: 10,
                              width: "80%",
                            }}
                          >
                            <Text>輸入表格行數：</Text>
                            <TextInput
                              value={rows}
                              onChangeText={setRows}
                              keyboardType="numeric"
                              style={{ borderBottomWidth: 1, marginBottom: 10 }}
                            />

                            <Text>輸入表格列數：</Text>
                            <TextInput
                              value={cols}
                              onChangeText={setCols}
                              keyboardType="numeric"
                              style={{ borderBottomWidth: 1, marginBottom: 20 }}
                            />

                            <Button title="插入表格" onPress={insertTable} />
                            <Button title="取消" onPress={() => setModalVisible(false)} />
                          </View>
                        </View>
                      </Modal>
                    </>
                  </WsPaddingContainer>
                )}
                {mode === 'edit_layer' && (
                  <WsPaddingContainer
                    padding={0}
                    style={{
                    }}
                  >
                    {/* 除錯用 */}
                    {/* <WsText>{articleData.sequence}</WsText> */}

                    <WsState
                      style={{
                        marginTop: 8,
                      }}
                      label={t('標題')}
                      value={articleData?.name ? articleData.name : articleData?.no_text ? articleData.no_text : ''}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          name: e,
                          no_text: e
                        })
                      }}
                      placeholder={t('輸入')}
                      rules={'required'}
                      errorMessage={!articleData?.name && [t('此項目為必填')]}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="date"
                      label={t('修正發布日')}
                      value={articleData.announce_at}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          announce_at: e
                        })
                      }}
                      placeholder={t('選擇修正發布日')}
                    />
                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="date"
                      label={t('生效日')}
                      value={articleData.effect_at}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          effect_at: e
                        })
                      }}
                      placeholder={t('選擇')}
                      backgroundColor={$color.primary11l}
                    />
                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="Ll_filesAndImages"
                      label={t('附件')}
                      value={articleData.file_attaches}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          file_attaches: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="multipleBelongstomany002_CRUD"
                      modelName={['effects', 'factory_effects']}
                      innerLabel={[t('建議風險'), t('自訂風險')]}
                      nameKey={'name'}
                      label={t('自訂風險')}
                      placeholder={t('選擇')}
                      addIconLabel={t('新增風險')}
                      manageIconLabel={t('管理風險')}
                      value={articleData.effects_all}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          effects_all: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="belongsto002_CRUD"
                      modelName={'guideline_status'}
                      nameKey={'name'}
                      label={t('施行狀態')}
                      translate={false}
                      addIconLabel={t('新增施行狀態')}
                      manageIconLabel={t('管理施行狀態')}
                      searchBarVisible={true}
                      placeholder={t('選擇')}
                      value={articleData.guideline_status}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          guideline_status: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="Ll_relatedAct"
                      modelName={'act'}
                      serviceIndexKey={'index'}
                      params={{
                        lang: 'tw',
                        order_by: 'announce_at',
                        order_way: 'desc',
                        time_field: 'announce_at',
                        act_status: currentActStatus ? currentActStatus[0].id : ''
                      }}
                      label={t('關聯法規')}
                      searchBarVisible={true}
                      placeholder={t('選擇')}
                      value={articleData.relatedActsArticles}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          relatedActsArticles: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="Ll_relatedGuideline"
                      modelName={'guideline'}
                      serviceIndexKey={'index'}
                      params={{
                        lang: 'tw',
                        order_by: 'announce_at',
                        order_way: 'desc'
                      }}
                      label={t('相關內規')}
                      searchBarVisible={true}
                      placeholder={t('選擇')}
                      value={articleData.related_guidelines_articles}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          related_guidelines_articles: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8,
                      }}
                      label={t('內容')}
                      multiline={true}
                      value={articleData.content}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          content: e
                        })
                      }}
                      placeholder={t('輸入')}
                    />
                    <>
                      {/* react-native-pell-rich-editor */}
                      <WsText size={14} style={{ marginTop: 16 }} fontWeight={600}>{t('內容 (含HTML)')}</WsText>
                      <ScrollView
                        style={{
                          borderWidth: 0.8,
                          marginTop: 8,
                          minHeight: 200,
                        }}
                      >
                        <RichToolbar
                          editor={richText}
                          actions={[
                            actions.keyboard,
                            "customAction", // ✅ 自訂 "插入表格" 按鈕
                            // actions.insertImage,
                            actions.setBold,
                            actions.setItalic,
                            actions.insertBulletsList,
                            actions.insertOrderedList,
                            actions.insertLink,
                            actions.setStrikethrough,
                            actions.setUnderline,
                            actions.removeFormat,
                            // actions.insertVideo,
                            actions.checkboxList,
                            actions.undo,
                            actions.redo,
                          ]}
                          iconMap={{
                            customAction: () => <IonIcon name="grid-outline" size={24} />, // ✅ 使用 <Text> 來正確渲染 emoji
                          }}
                          customAction={handleCustomAction}
                          onPressAddImage={(e) => {
                            console.log(e, 'eeee222');
                            // 實作你的圖片選取邏輯，並插入圖片
                            const imageUrl = `https://stickershop.line-scdn.net/stickershop/v1/product/14677696/LINEStorePC/main.png?v=1`
                            const cleanedUrl = decodeURIComponent(imageUrl).replace(/^about\s+/, '');
                            console.log(cleanedUrl, 'cleanedUrl!!');
                            richText.current.insertImage(cleanedUrl);
                          }}
                        />
                        <ScrollView
                          style={{
                            height: 400,
                            // borderWidth:2,
                            // backgroundColor: 'green'
                          }}
                          keyboardDismissMode={"none"}
                        >
                          <View style={[
                            {
                              height: 400,
                              width: '100%',
                            }
                          ]}
                          >
                            <RichEditor
                              style={[
                                Platform.OS === 'ios' ? {
                                  minHeight: 400,
                                  padding: 10,
                                  // backgroundColor: 'pink',
                                } : {
                                  flex: 1,
                                }
                              ]
                              }
                              ref={richText}
                              containerStyle={{
                                backgroundColor: 'transparent',
                                cssText: 'body { margin: 0; padding: 10px; min-height: 400px; }'
                              }}
                              initialContentHTML={
                                articleData.rich_content
                              }
                              onHeightChange={(e) => {
                                console.log(e, "change height1");
                                setHeight(e);
                              }}
                              onChange={descriptionText => {
                                const updatedHtml = descriptionText.replace(
                                  /<p(?![^>]*style)/g,
                                  '<p style="line-height:1.5;"'
                                );
                                console.log(updatedHtml, 'updatedHtml00');
                                setArticleData({
                                  ...articleData,
                                  rich_content: updatedHtml
                                })
                              }}
                              onBlur={() => { }}
                              onDone={() => Keyboard.dismiss} // 手動關閉鍵盤
                              onFocus={() => {
                                setTimeout(() => {
                                  scrollViewRef?.current?.scrollToPosition(0, 800, true)
                                }, 300);
                              }}
                            />
                          </View>
                        </ScrollView>
                      </ScrollView>

                      {/* 🔹 自訂行數/列數的 Modal 視窗 */}
                      <Modal visible={modalVisible} transparent animationType="slide">
                        <View
                          style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(0,0,0,0.5)",
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: "white",
                              padding: 20,
                              borderRadius: 10,
                              width: "80%",
                            }}
                          >
                            <Text>輸入表格行數：</Text>
                            <TextInput
                              value={rows}
                              onChangeText={setRows}
                              keyboardType="numeric"
                              style={{ borderBottomWidth: 1, marginBottom: 10 }}
                            />

                            <Text>輸入表格列數：</Text>
                            <TextInput
                              value={cols}
                              onChangeText={setCols}
                              keyboardType="numeric"
                              style={{ borderBottomWidth: 1, marginBottom: 20 }}
                            />

                            <Button title="插入表格" onPress={insertTable} />
                            <Button title="取消" onPress={() => setModalVisible(false)} />
                          </View>
                        </View>
                      </Modal>
                    </>
                  </WsPaddingContainer>
                )}
                {mode === 'create_article_version' && (
                  <WsPaddingContainer
                    padding={0}
                    style={{
                      // borderTopWidth: 1,
                    }}
                  >
                    {/* 除錯用 */}
                    {/* <WsText>{articleData.sequence}</WsText> */}

                    <WsState
                      style={{
                        marginTop: 8,
                      }}
                      label={t('標題')}
                      value={articleData?.name ? articleData.name : articleData?.no_text ? articleData.no_text : ''}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          name: e,
                          no_text: e
                        })
                      }}
                      placeholder={t('輸入')}
                      rules={'required'}
                      errorMessage={!articleData?.name && [t('此項目為必填')]}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="date"
                      label={t('修正發布日')}
                      value={articleData.announce_at}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          announce_at: e
                        })
                      }}
                      placeholder={t('選擇修正發布日')}
                    />
                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="date"
                      label={t('生效日')}
                      value={articleData.effect_at}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          effect_at: e
                        })
                      }}
                      placeholder={t('選擇')}
                      backgroundColor={$color.primary11l}
                    />
                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="Ll_filesAndImages"
                      label={t('附件')}
                      value={articleData.file_attaches}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          file_attaches: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="multipleBelongstomany002_CRUD"
                      modelName={['effects', 'factory_effects']}
                      innerLabel={[t('建議風險'), t('自訂風險')]}
                      nameKey={'name'}
                      label={t('自訂風險')}
                      placeholder={t('選擇')}
                      addIconLabel={t('新增風險')}
                      manageIconLabel={t('管理風險')}
                      value={articleData.effects_all}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          effects_all: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="belongsto002_CRUD"
                      modelName={'guideline_status'}
                      nameKey={'name'}
                      label={t('施行狀態')}
                      translate={false}
                      addIconLabel={t('新增施行狀態')}
                      manageIconLabel={t('管理施行狀態')}
                      searchBarVisible={true}
                      placeholder={t('選擇')}
                      value={articleData.guideline_status}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          guideline_status: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="Ll_relatedAct"
                      modelName={'act'}
                      serviceIndexKey={'index'}
                      params={{
                        lang: 'tw',
                        order_by: 'announce_at',
                        order_way: 'desc',
                        time_field: 'announce_at',
                        act_status: currentActStatus ? currentActStatus[0].id : ''
                      }}
                      label={t('關聯法規')}
                      searchBarVisible={true}
                      placeholder={t('選擇')}
                      value={articleData.relatedActsArticles}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          relatedActsArticles: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="Ll_relatedGuideline"
                      modelName={'guideline'}
                      serviceIndexKey={'index'}
                      params={{
                        lang: 'tw',
                        order_by: 'announce_at',
                        order_way: 'desc'
                      }}
                      label={t('相關內規')}
                      searchBarVisible={true}
                      placeholder={t('選擇')}
                      value={articleData.related_guidelines_articles}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          related_guidelines_articles: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8,
                      }}
                      label={t('內容')}
                      multiline={true}
                      rules={'required'}
                      value={articleData.content}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          content: e
                        })
                      }}
                      placeholder={t('請輸入條文內容')}
                      rules={'required'}
                      errorMessage={(!articleData?.content && !articleData?.rich_content) && [t('此項目為必填')]}
                    />
                    <>
                      {/* react-native-pell-rich-editor */}
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: 8
                        }}
                      >
                        <WsText size={14} style={{}} fontWeight={600}>{t('內容 (含HTML)')}</WsText>
                        {true && (
                          <WsText size="14" color={$color.danger}>
                            {' '}
                            *
                          </WsText>
                        )}
                      </View>
                      <ScrollView
                        style={{
                          borderWidth: 0.8,
                          marginTop: 8,
                          minHeight: 200,
                        }}
                      >
                        <RichToolbar
                          editor={richText}
                          actions={[
                            actions.keyboard,
                            "customAction", // ✅ 自訂 "插入表格" 按鈕
                            // actions.insertImage,
                            actions.setBold,
                            actions.setItalic,
                            actions.insertBulletsList,
                            actions.insertOrderedList,
                            actions.insertLink,
                            actions.setStrikethrough,
                            actions.setUnderline,
                            actions.removeFormat,
                            // actions.insertVideo,
                            actions.checkboxList,
                            actions.undo,
                            actions.redo,
                          ]}
                          iconMap={{
                            customAction: () => <IonIcon name="grid-outline" size={24} />, // ✅ 使用 <Text> 來正確渲染 emoji
                          }}
                          customAction={handleCustomAction}
                          onPressAddImage={(e) => {
                            console.log(e, 'eeee222');
                            // 實作你的圖片選取邏輯，並插入圖片
                            const imageUrl = `https://stickershop.line-scdn.net/stickershop/v1/product/14677696/LINEStorePC/main.png?v=1`
                            const cleanedUrl = decodeURIComponent(imageUrl).replace(/^about\s+/, '');
                            console.log(cleanedUrl, 'cleanedUrl!!');
                            richText.current.insertImage(cleanedUrl);
                          }}
                        />
                        <ScrollView
                          style={{
                            height: 400,
                            // borderWidth:2,
                            // backgroundColor: 'green'
                          }}
                          keyboardDismissMode={"none"}
                        >
                          <View style={[
                            {
                              height: 400,
                              width: '100%',
                            }
                          ]}
                          >
                            <RichEditor
                              style={[
                                Platform.OS === 'ios' ? {
                                  minHeight: 400,
                                  padding: 10,
                                  // backgroundColor: 'pink',
                                } : {
                                  flex: 1,
                                }
                              ]
                              }
                              ref={richText}
                              containerStyle={{
                                backgroundColor: 'transparent',
                                cssText: 'body { margin: 0; padding: 10px; min-height: 400px; }'
                              }}
                              initialContentHTML={
                                articleData.rich_content
                              }
                              onHeightChange={(e) => {
                                console.log(e, "change height1");
                                setHeight(e);
                              }}
                              onChange={descriptionText => {
                                const updatedHtml = descriptionText.replace(
                                  /<p(?![^>]*style)/g,
                                  '<p style="line-height:1.5;"'
                                );
                                console.log(updatedHtml, 'updatedHtml00');
                                setArticleData({
                                  ...articleData,
                                  rich_content: updatedHtml
                                })
                              }}
                              onBlur={() => { }}
                              onDone={() => Keyboard.dismiss} // 手動關閉鍵盤
                              onFocus={() => {
                                setTimeout(() => {
                                  scrollViewRef?.current?.scrollToPosition(0, 800, true)
                                }, 300);
                              }}
                            />
                          </View>
                        </ScrollView>
                      </ScrollView>
                      {!articleData?.rich_content && (
                        <>
                          {[t('此項目為必填')].map(errorMessageItem => (
                            <WsErrorMessage
                              key={errorMessageItem}
                            >
                              {t(errorMessageItem)}
                            </WsErrorMessage>
                          ))}
                        </>
                      )}
                      {/* 🔹 自訂行數/列數的 Modal 視窗 */}
                      <Modal visible={modalVisible} transparent animationType="slide">
                        <View
                          style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(0,0,0,0.5)",
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: "white",
                              padding: 20,
                              borderRadius: 10,
                              width: "80%",
                            }}
                          >
                            <Text>輸入表格行數：</Text>
                            <TextInput
                              value={rows}
                              onChangeText={setRows}
                              keyboardType="numeric"
                              style={{ borderBottomWidth: 1, marginBottom: 10 }}
                            />

                            <Text>輸入表格列數：</Text>
                            <TextInput
                              value={cols}
                              onChangeText={setCols}
                              keyboardType="numeric"
                              style={{ borderBottomWidth: 1, marginBottom: 20 }}
                            />

                            <Button title="插入表格" onPress={insertTable} />
                            <Button title="取消" onPress={() => setModalVisible(false)} />
                          </View>
                        </View>
                      </Modal>
                    </>
                  </WsPaddingContainer>
                )}
                {mode === 'create_layer_version' && (
                  <WsPaddingContainer
                    padding={0}
                    style={{
                      // borderTopWidth: 1,
                    }}
                  >
                    {/* 除錯用 */}
                    {/* <WsText>{articleData.sequence}</WsText> */}

                    <WsState
                      style={{
                        marginTop: 8,
                      }}
                      label={t('標題')}
                      value={articleData?.name ? articleData.name : articleData?.no_text ? articleData.no_text : ''}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          name: e,
                          no_text: e
                        })
                      }}
                      placeholder={t('輸入')}
                      rules={'required'}
                      errorMessage={!articleData?.name && [t('此項目為必填')]}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="date"
                      label={t('修正發布日')}
                      value={articleData.announce_at}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          announce_at: e
                        })
                      }}
                      placeholder={t('選擇修正發布日')}
                    />
                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="date"
                      label={t('生效日')}
                      value={articleData.effect_at}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          effect_at: e
                        })
                      }}
                      placeholder={t('選擇')}
                      backgroundColor={$color.primary11l}
                    />
                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="Ll_filesAndImages"
                      label={t('附件')}
                      value={articleData.file_attaches}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          file_attaches: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="multipleBelongstomany002_CRUD"
                      modelName={['effects', 'factory_effects']}
                      innerLabel={[t('建議風險'), t('自訂風險')]}
                      nameKey={'name'}
                      label={t('自訂風險')}
                      placeholder={t('選擇')}
                      addIconLabel={t('新增風險')}
                      manageIconLabel={t('管理風險')}
                      value={articleData.effects_all}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          effects_all: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="belongsto002_CRUD"
                      modelName={'guideline_status'}
                      nameKey={'name'}
                      label={t('施行狀態')}
                      translate={false}
                      addIconLabel={t('新增施行狀態')}
                      manageIconLabel={t('管理施行狀態')}
                      searchBarVisible={true}
                      placeholder={t('選擇')}
                      value={articleData.guideline_status}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          guideline_status: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="Ll_relatedAct"
                      modelName={'act'}
                      serviceIndexKey={'index'}
                      params={{
                        lang: 'tw',
                        order_by: 'announce_at',
                        order_way: 'desc',
                        time_field: 'announce_at',
                        act_status: currentActStatus ? currentActStatus[0].id : ''
                      }}
                      label={t('關聯法規')}
                      searchBarVisible={true}
                      placeholder={t('選擇')}
                      value={articleData.relatedActsArticles}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          relatedActsArticles: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8
                      }}
                      type="Ll_relatedGuideline"
                      modelName={'guideline'}
                      serviceIndexKey={'index'}
                      params={{
                        lang: 'tw',
                        order_by: 'announce_at',
                        order_way: 'desc'
                      }}
                      label={t('相關內規')}
                      searchBarVisible={true}
                      placeholder={t('選擇')}
                      value={articleData.related_guidelines_articles}
                      onChange={(e) => {
                        setArticleData({
                          ...articleData,
                          related_guidelines_articles: e
                        })
                      }}
                    />

                    <WsState
                      style={{
                        marginTop: 8,
                      }}
                      label={t('內容')}
                      multiline={true}
                      value={articleData.content}
                      onChange={e => {
                        setArticleData({
                          ...articleData,
                          content: e
                        })
                      }}
                      placeholder={t('輸入')}
                    />
                    <>
                      {/* react-native-pell-rich-editor */}
                      <WsText size={14} style={{ marginTop: 16 }} fontWeight={600}>{t('內容 (含HTML)')}</WsText>
                      <ScrollView
                        style={{
                          borderWidth: 0.8,
                          marginTop: 8,
                          minHeight: 200,
                        }}
                      >
                        <RichToolbar
                          editor={richText}
                          actions={[
                            actions.keyboard,
                            "customAction", // ✅ 自訂 "插入表格" 按鈕
                            // actions.insertImage,
                            actions.setBold,
                            actions.setItalic,
                            actions.insertBulletsList,
                            actions.insertOrderedList,
                            actions.insertLink,
                            actions.setStrikethrough,
                            actions.setUnderline,
                            actions.removeFormat,
                            // actions.insertVideo,
                            actions.checkboxList,
                            actions.undo,
                            actions.redo,
                          ]}
                          iconMap={{
                            customAction: () => <IonIcon name="grid-outline" size={24} />, // ✅ 使用 <Text> 來正確渲染 emoji
                          }}
                          customAction={handleCustomAction}
                          onPressAddImage={(e) => {
                            console.log(e, 'eeee222');
                            // 實作你的圖片選取邏輯，並插入圖片
                            const imageUrl = `https://stickershop.line-scdn.net/stickershop/v1/product/14677696/LINEStorePC/main.png?v=1`
                            const cleanedUrl = decodeURIComponent(imageUrl).replace(/^about\s+/, '');
                            console.log(cleanedUrl, 'cleanedUrl!!');
                            richText.current.insertImage(cleanedUrl);
                          }}
                        />
                        <ScrollView
                          style={{
                            height: 400,
                            // borderWidth:2,
                            // backgroundColor: 'green'
                          }}
                          keyboardDismissMode={"none"}
                        >
                          <View style={[
                            {
                              height: 400,
                              width: '100%',
                            }
                          ]}
                          >
                            <RichEditor
                              style={[
                                Platform.OS === 'ios' ? {
                                  minHeight: 400,
                                  padding: 10,
                                  // backgroundColor: 'pink',
                                } : {
                                  flex: 1,
                                }
                              ]
                              }
                              ref={richText}
                              containerStyle={{
                                backgroundColor: 'transparent',
                                cssText: 'body { margin: 0; padding: 10px; min-height: 400px; }'
                              }}
                              initialContentHTML={
                                articleData.rich_content
                              }
                              onHeightChange={(e) => {
                                console.log(e, "change height1");
                                setHeight(e);
                              }}
                              onChange={descriptionText => {
                                const updatedHtml = descriptionText.replace(
                                  /<p(?![^>]*style)/g,
                                  '<p style="line-height:1.5;"'
                                );
                                console.log(updatedHtml, 'updatedHtml00');
                                setArticleData({
                                  ...articleData,
                                  rich_content: updatedHtml
                                })
                              }}
                              onBlur={() => { }}
                              onDone={() => Keyboard.dismiss} // 手動關閉鍵盤
                              onFocus={() => {
                                setTimeout(() => {
                                  scrollViewRef?.current?.scrollToPosition(0, 800, true)
                                }, 300);
                              }}
                            />
                          </View>
                        </ScrollView>
                      </ScrollView>

                      {/* 🔹 自訂行數/列數的 Modal 視窗 */}
                      <Modal visible={modalVisible} transparent animationType="slide">
                        <View
                          style={{
                            flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "rgba(0,0,0,0.5)",
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: "white",
                              padding: 20,
                              borderRadius: 10,
                              width: "80%",
                            }}
                          >
                            <Text>輸入表格行數：</Text>
                            <TextInput
                              value={rows}
                              onChangeText={setRows}
                              keyboardType="numeric"
                              style={{ borderBottomWidth: 1, marginBottom: 10 }}
                            />

                            <Text>輸入表格列數：</Text>
                            <TextInput
                              value={cols}
                              onChangeText={setCols}
                              keyboardType="numeric"
                              style={{ borderBottomWidth: 1, marginBottom: 20 }}
                            />

                            <Button title="插入表格" onPress={insertTable} />
                            <Button title="取消" onPress={() => setModalVisible(false)} />
                          </View>
                        </View>
                      </Modal>
                    </>
                  </WsPaddingContainer>
                )}
              </WsPaddingContainer>
            </KeyboardAwareScrollView>
          </>
        ) : (
          <WsSkeleton></WsSkeleton>
        )}
      </WsModal>

      <WsModal
        visible={modalActive003}
        onBackButtonPress={() => {
          setMode('add_layer')
          setModalActive003(false)
        }}
        headerLeftOnPress={() => {
          setMode('add_layer')
          setModalActive003(false)
        }}
        headerRightOnPress={() => {
          Alert.alert(
            "",
            t('確定送出排序？'),
            [
              {
                text: t("取消"),
                onPress: () => {
                  setMode('add_layer')
                  setModalActive003(false)
                },
                style: "cancel",
              },
              {
                text: t("確定"),
                onPress: () => {
                  $_updateArticleSequence()
                  setMode('add_layer')
                  setModalActive003(false)
                },
              },
            ],
            { cancelable: false }
          )
        }}
        RightOnPressIsDisabled={$_validate003() ? false : true}
        headerRightText={t('送出')}
        title={
          t('排序')
        }
      >
        {mode === 'dragSort' &&
          models &&
          models.length > 1 && (
            <>
              <DraggableList
                items={models}
                setInitSequencePayload={setInitSequencePayload}
              ></DraggableList>
            </>
          )}
      </WsModal>

      <WsModal
        visible={modalActive002}
        headerLeftOnPress={() => {
          setStepOneSelect(null)
          setStepTwoSelect(null)
          setStepThreeSelect(null)
          setModalActive002(false)
        }}
        headerRightOnPress={() => {
          $_submit()
          setModalActive002(false)
        }}
        RightOnPressIsDisabled={$_validate002() ? false : true}
        headerRightText={t('儲存')}
        title={t('新增')}
      >
        <KeyboardAwareScrollView
          ref={scrollViewRef}
          style={{
            flex: 1, // DO NOT CLEAN
          }}
          contentContainerStyle={[
            {
            }
          ]}>
          <WsPaddingContainer>
            {mode === 'add_inner_article_or_layer' && (
              <>
                <WsFlex
                  style={{
                    flex: 1,
                  }}
                  alignItems="flex-start"
                >
                  <WsState
                    type={"radio"}
                    items={[
                      { label: t('上方新增'), value: 'add_upper' },
                      { label: t('下方新增'), value: 'add_lower' },
                    ]}
                    value={stepOneSelect}
                    onChange={(e) => {
                      setStepOneSelect(e)
                    }}
                  ></WsState>
                </WsFlex>

                <WsFlex
                  style={{
                    flex: 1,
                  }}
                  alignItems="flex-start"
                >
                  <WsState
                    type={"radio"}
                    items={
                      (articleData.type === 'title' && stepOneSelect === 'add_upper') &&
                        (articleData.sequence && articleData.sequence.split("-").length == 1) ?
                        [
                          { label: t('新增父層級'), value: 'add_parent' },
                          { label: t('新增同層級'), value: 'add_same_level' },
                        ]
                        :
                        (articleData.type === 'title' && stepOneSelect === 'add_upper') &&
                          (articleData.sequence && articleData.sequence.split("-").length != 1) ?
                          [
                            { label: t('新增父層級'), value: 'add_parent' },
                            { label: t('新增同層級'), value: 'add_same_level' },
                          ]
                          : (articleData.type === 'title' && stepOneSelect === 'add_lower') ?
                            [
                              { label: t('新增同層級'), value: 'add_same_level' },
                              { label: t('新增子層級'), value: 'add_children' },
                            ]
                            : (articleData.type === 'article' && stepOneSelect === 'add_upper') ?
                              [
                                { label: t('新增父層級'), value: 'add_parent' },
                                { label: t('新增同層級'), value: 'add_same_level' },
                              ]
                              : (articleData.type === 'article' && stepOneSelect === 'add_lower') ?
                                [
                                  { label: t('新增同層級'), value: 'add_same_level' },
                                ]
                                :
                                []
                    }
                    value={stepTwoSelect}
                    onChange={(e) => {
                      setToAddSequence(null)
                      if (e === 'add_parent') {
                        const _apiPayload = setAddParentPayload(articleData, models);
                        const newPayload = sortOrderPayload(_apiPayload)
                        setInitSequencePayload(newPayload)
                      }
                      else if (e === 'add_same_level') {
                        const _apiPayload = getAddSameLevelNextSequence(articleData, models, stepOneSelect);
                        // console.log(_apiPayload, '_apiPayload--');
                        const newPayload = sortOrderPayload(_apiPayload)
                        setInitSequencePayload(newPayload)
                      } else if (e === 'add_children') {
                        const _apiPayload = getAddChildrenNextSequence(articleData, models);
                        const newPayload = sortOrderPayload(_apiPayload)
                        setInitSequencePayload(newPayload)
                      }
                      setStepTwoSelect(e)
                    }}
                  ></WsState>
                </WsFlex>

                <WsFlex
                  style={{
                    flex: 1,
                  }}
                  alignItems="flex-start"
                >
                  <WsState
                    type={"radio"}
                    items={
                      (stepTwoSelect === 'add_parent' && articleData.type === 'title') ?
                        [
                          { label: t('新增層級'), value: 'add_layer' },
                        ] :
                        (stepTwoSelect === 'add_same_level' && articleData.type === 'title') ?
                          [
                            { label: t('新增層級'), value: 'add_layer' },
                            { label: t('新增條文'), value: 'add_article' },
                          ] :
                          (stepTwoSelect === 'add_children' && articleData.type === 'title') ?
                            [
                              { label: t('新增層級'), value: 'add_layer' },
                              { label: t('新增條文'), value: 'add_article' },
                            ] :
                            (stepTwoSelect === 'add_parent' && articleData.type === 'article') ?
                              [
                                { label: t('新增層級'), value: 'add_layer' },
                              ] :
                              (stepTwoSelect === 'add_same_level' && articleData.type === 'article') ?
                                [
                                  { label: t('新增層級'), value: 'add_layer' },
                                  { label: t('新增條文'), value: 'add_article' },
                                ] :
                                []
                    }
                    value={stepThreeSelect}
                    onChange={(e) => {
                      setStepThreeSelect(e)
                    }}
                  ></WsState>
                </WsFlex>

                {stepThreeSelect === 'add_layer' &&
                  stepOneSelect &&
                  stepTwoSelect &&
                  stepThreeSelect && (
                    <>
                      {/* 除錯用 */}
                      {/* <WsText
                        style={{
                          marginBottom: 8
                        }}
                      >{toAddSequence}
                      </WsText> */}

                      <WsState
                        style={{
                        }}
                        label={t('標題')}
                        rules={'required'}
                        placeholder={t('輸入')}
                        value={layerOrArticleName}
                        onChange={(e) => {
                          setLayerOrArticleName(e)
                        }}
                        errorMessage={!layerOrArticleName && [t('此項目為必填')]}
                      >
                      </WsState>

                      <WsState
                        style={{
                          marginTop: 8
                        }}
                        type="date"
                        label={t('修正發布日')}
                        value={articleData.announce_at}
                        onChange={e => {
                          setArticleData({
                            ...articleData,
                            announce_at: e
                          })
                        }}
                        placeholder={t('請選擇修正發布日...')}
                      />
                      <WsState
                        style={{
                          marginTop: 8
                        }}
                        type="date"
                        label={t('生效日')}
                        value={articleData.effect_at}
                        onChange={e => {
                          setArticleData({
                            ...articleData,
                            effect_at: e
                          })
                        }}
                        placeholder={t('選擇')}
                        backgroundColor={$color.primary11l}
                      />
                      <WsState
                        style={{
                          marginTop: 8
                        }}
                        type="Ll_filesAndImages"
                        label={t('附件')}
                        value={articleData.file_attaches}
                        onChange={(e) => {
                          setArticleData({
                            ...articleData,
                            file_attaches: e
                          })
                        }}
                      />

                      <WsState
                        style={{
                          marginTop: 8
                        }}
                        type="multipleBelongstomany002_CRUD"
                        modelName={['effects', 'factory_effects']}
                        innerLabel={[t('建議風險'), t('自訂風險')]}
                        nameKey={'name'}
                        label={t('自訂風險')}
                        placeholder={t('選擇')}
                        addIconLabel={t('新增風險')}
                        manageIconLabel={t('管理風險')}
                        value={articleData.effects_all}
                        onChange={(e) => {
                          setArticleData({
                            ...articleData,
                            effects_all: e
                          })
                        }}
                      />

                      <WsState
                        style={{
                          marginTop: 8
                        }}
                        type="belongsto002_CRUD"
                        modelName={'guideline_status'}
                        nameKey={'name'}
                        label={t('施行狀態')}
                        translate={false}
                        addIconLabel={t('新增施行狀態')}
                        manageIconLabel={t('管理施行狀態')}
                        searchBarVisible={true}
                        placeholder={t('選擇')}
                        value={articleData.guideline_status}
                        onChange={(e) => {
                          setArticleData({
                            ...articleData,
                            guideline_status: e
                          })
                        }}
                      />

                      <WsState
                        style={{
                          marginTop: 8
                        }}
                        type="Ll_relatedAct"
                        modelName={'act'}
                        serviceIndexKey={'index'}
                        params={{
                          lang: 'tw',
                          order_by: 'announce_at',
                          order_way: 'desc',
                          time_field: 'announce_at',
                          act_status: currentActStatus ? currentActStatus[0].id : ''
                        }}
                        label={t('關聯法規')}
                        searchBarVisible={true}
                        placeholder={t('選擇')}
                        value={articleData.relatedActsArticles}
                        onChange={(e) => {
                          setArticleData({
                            ...articleData,
                            relatedActsArticles: e
                          })
                        }}
                      />

                      <WsState
                        style={{
                          marginTop: 8
                        }}
                        type="Ll_relatedGuideline"
                        modelName={'guideline'}
                        serviceIndexKey={'index'}
                        params={{
                          lang: 'tw',
                          order_by: 'announce_at',
                          order_way: 'desc'
                        }}
                        label={t('相關內規')}
                        searchBarVisible={true}
                        placeholder={t('選擇')}
                        value={articleData.related_guidelines_articles}
                        onChange={(e) => {
                          setArticleData({
                            ...articleData,
                            related_guidelines_articles: e
                          })
                        }}
                      />

                      <WsState
                        style={{
                          marginTop: 8,
                        }}
                        label={t('內容')}
                        multiline={true}
                        value={articleData.content}
                        onChange={e => {
                          setArticleData({
                            ...articleData,
                            content: e
                          })
                        }}
                        placeholder={t('輸入')}
                      />
                      <>
                        {/* react-native-pell-rich-editor */}
                        <WsText size={14} style={{ marginTop: 16 }} fontWeight={600}>{t('內容 (含HTML)')}</WsText>
                        <ScrollView
                          style={{
                            borderWidth: 0.8,
                            marginTop: 8,
                            minHeight: 200,
                          }}
                        >
                          <RichToolbar
                            editor={richText}
                            actions={[
                              actions.keyboard,
                              "customAction", // ✅ 自訂 "插入表格" 按鈕
                              // actions.insertImage,
                              actions.setBold,
                              actions.setItalic,
                              actions.insertBulletsList,
                              actions.insertOrderedList,
                              actions.insertLink,
                              actions.setStrikethrough,
                              actions.setUnderline,
                              actions.removeFormat,
                              // actions.insertVideo,
                              actions.checkboxList,
                              actions.undo,
                              actions.redo,
                            ]}
                            iconMap={{
                              customAction: () => <IonIcon name="grid-outline" size={24} />, // ✅ 使用 <Text> 來正確渲染 emoji
                            }}
                            customAction={handleCustomAction}
                            onPressAddImage={(e) => {
                              console.log(e, 'eeee222');
                              // 實作你的圖片選取邏輯，並插入圖片
                              const imageUrl = `https://stickershop.line-scdn.net/stickershop/v1/product/14677696/LINEStorePC/main.png?v=1`
                              const cleanedUrl = decodeURIComponent(imageUrl).replace(/^about\s+/, '');
                              console.log(cleanedUrl, 'cleanedUrl!!');
                              richText.current.insertImage(cleanedUrl);
                            }}
                          />
                          <ScrollView
                            style={{
                              height: 400,
                              // borderWidth:2,
                              // backgroundColor: 'green'
                            }}
                            keyboardDismissMode={"none"}
                          >
                            <View style={[
                              {
                                height: 400,
                                width: '100%',
                              }
                            ]}
                            >
                              <RichEditor
                                style={[
                                  Platform.OS === 'ios' ? {
                                    minHeight: 400,
                                    padding: 10,
                                    // backgroundColor: 'pink',
                                  } : {
                                    flex: 1,
                                  }
                                ]
                                }
                                ref={richText}
                                containerStyle={{
                                  backgroundColor: 'transparent',
                                  cssText: 'body { margin: 0; padding: 10px; min-height: 400px; }'
                                }}
                                initialContentHTML={
                                  articleData.rich_content
                                }
                                onHeightChange={(e) => {
                                  console.log(e, "change height1");
                                  setHeight(e);
                                }}
                                onChange={descriptionText => {
                                  const updatedHtml = descriptionText.replace(
                                    /<p(?![^>]*style)/g,
                                    '<p style="line-height:1.5;"'
                                  );
                                  console.log(updatedHtml, 'updatedHtml00');
                                  setArticleData({
                                    ...articleData,
                                    rich_content: updatedHtml
                                  })
                                }}
                                onBlur={() => { }}
                                onDone={() => Keyboard.dismiss} // 手動關閉鍵盤
                                onFocus={() => {
                                  setTimeout(() => {
                                    scrollViewRef?.current?.scrollToPosition(0, 800, true)
                                  }, 300);
                                }}
                              />
                            </View>
                          </ScrollView>
                        </ScrollView>
                        {/* 🔹 自訂行數/列數的 Modal 視窗 */}
                        <Modal visible={modalVisible} transparent animationType="slide">
                          <View
                            style={{
                              flex: 1,
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: "rgba(0,0,0,0.5)",
                            }}
                          >
                            <View
                              style={{
                                backgroundColor: "white",
                                padding: 20,
                                borderRadius: 10,
                                width: "80%",
                              }}
                            >
                              <Text>輸入表格行數：</Text>
                              <TextInput
                                value={rows}
                                onChangeText={setRows}
                                keyboardType="numeric"
                                style={{ borderBottomWidth: 1, marginBottom: 10 }}
                              />
                              <Text>輸入表格列數：</Text>
                              <TextInput
                                value={cols}
                                onChangeText={setCols}
                                keyboardType="numeric"
                                style={{ borderBottomWidth: 1, marginBottom: 20 }}
                              />
                              <Button title="插入表格" onPress={insertTable} />
                              <Button title="取消" onPress={() => setModalVisible(false)} />
                            </View>
                          </View>
                        </Modal>
                      </>
                    </>
                  )}

                {stepThreeSelect === 'add_article' &&
                  stepOneSelect &&
                  stepTwoSelect &&
                  stepThreeSelect && (
                    <WsPaddingContainer
                      padding={0}
                      style={{
                        paddingTop: 4,
                      }}
                    >
                      {/* 除錯用 */}
                      {/* <WsText
                        style={{
                          marginBottom: 8
                        }}
                      >{toAddSequence}
                      </WsText> */}

                      <WsState
                        style={{
                          marginTop: 8,
                        }}
                        label={t('標題')}
                        placeholder={t('輸入')}
                        value={layerOrArticleName}
                        onChange={e => {
                          setLayerOrArticleName(e)
                        }}
                        rules={'required'}
                        errorMessage={!layerOrArticleName && [t('此項目為必填')]}
                      />

                      <WsState
                        style={{
                          marginTop: 8
                        }}
                        type="date"
                        label={t('修正發布日')}
                        value={articleData.announce_at}
                        onChange={e => {
                          setArticleData({
                            ...articleData,
                            announce_at: e
                          })
                        }}
                        placeholder={t('請選擇修正發布日...')}
                      />
                      <WsState
                        style={{
                          marginTop: 8
                        }}
                        type="date"
                        label={t('生效日')}
                        value={articleData.effect_at}
                        onChange={e => {
                          setArticleData({
                            ...articleData,
                            effect_at: e
                          })
                        }}
                        placeholder={t('選擇')}
                        backgroundColor={$color.primary11l}
                      />
                      <WsState
                        style={{
                          marginTop: 8
                        }}
                        type="Ll_filesAndImages"
                        label={t('附件')}
                        value={articleData.file_attaches}
                        onChange={(e) => {
                          setArticleData({
                            ...articleData,
                            file_attaches: e
                          })
                        }}
                      />

                      <WsState
                        style={{
                          marginTop: 8
                        }}
                        type="multipleBelongstomany002_CRUD"
                        modelName={['effects', 'factory_effects']}
                        innerLabel={[t('建議風險'), t('自訂風險')]}
                        nameKey={'name'}
                        label={t('自訂風險')}
                        placeholder={t('選擇')}
                        addIconLabel={t('新增風險')}
                        manageIconLabel={t('管理風險')}
                        value={articleData.effects_all}
                        onChange={(e) => {
                          setArticleData({
                            ...articleData,
                            effects_all: e
                          })
                        }}
                      />

                      <WsState
                        style={{
                          marginTop: 8
                        }}
                        type="belongsto002_CRUD"
                        modelName={'guideline_status'}
                        nameKey={'name'}
                        label={t('施行狀態')}
                        translate={false}
                        addIconLabel={t('新增施行狀態')}
                        manageIconLabel={t('管理施行狀態')}
                        searchBarVisible={true}
                        placeholder={t('選擇')}
                        value={articleData.guideline_status}
                        onChange={(e) => {
                          setArticleData({
                            ...articleData,
                            guideline_status: e
                          })
                        }}
                      />
                      <WsState
                        style={{
                          marginTop: 8
                        }}
                        type="Ll_relatedAct"
                        modelName={'act'}
                        serviceIndexKey={'index'}
                        params={{
                          lang: 'tw',
                          order_by: 'announce_at',
                          order_way: 'desc',
                          time_field: 'announce_at',
                          act_status: currentActStatus ? currentActStatus[0].id : ''
                        }}
                        label={t('關聯法規')}
                        searchBarVisible={true}
                        placeholder={t('選擇')}
                        value={articleData.relatedActsArticles}
                        onChange={(e) => {
                          setArticleData({
                            ...articleData,
                            relatedActsArticles: e
                          })
                        }}
                      />

                      <WsState
                        style={{
                          marginTop: 8
                        }}
                        type="Ll_relatedGuideline"
                        modelName={'guideline'}
                        serviceIndexKey={'index'}
                        params={{
                          lang: 'tw',
                          order_by: 'announce_at',
                          order_way: 'desc'
                        }}
                        label={t('相關內規')}
                        searchBarVisible={true}
                        placeholder={t('選擇')}
                        value={articleData.related_guidelines_articles}
                        onChange={(e) => {
                          setArticleData({
                            ...articleData,
                            related_guidelines_articles: e
                          })
                        }}
                      />

                      <WsState
                        style={{
                          marginTop: 8,
                        }}
                        label={t('內容')}
                        multiline={true}
                        value={articleData.content}
                        onChange={e => {
                          setArticleData({
                            ...articleData,
                            content: e
                          })
                        }}
                        placeholder={t('請輸入條文內容')}
                        rules={'required'}
                        errorMessage={(!articleData?.content && !articleData?.rich_content) && [t('此項目為必填')]}
                      />
                      <>
                        {/* react-native-pell-rich-editor */}
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 8
                          }}
                        >
                          <WsText size={14} style={{}} fontWeight={600}>{t('內容 (含HTML)')}</WsText>
                          {true && (
                            <WsText size="14" color={$color.danger}>
                              {' '}
                              *
                            </WsText>
                          )}
                        </View>
                        <ScrollView
                          style={{
                            borderWidth: 0.8,
                            marginTop: 8,
                            minHeight: 200,
                          }}
                        >
                          <RichToolbar
                            editor={richText}
                            actions={[
                              actions.keyboard,
                              "customAction", // ✅ 自訂 "插入表格" 按鈕
                              // actions.insertImage,
                              actions.setBold,
                              actions.setItalic,
                              actions.insertBulletsList,
                              actions.insertOrderedList,
                              actions.insertLink,
                              actions.setStrikethrough,
                              actions.setUnderline,
                              actions.removeFormat,
                              // actions.insertVideo,
                              actions.checkboxList,
                              actions.undo,
                              actions.redo,
                            ]}
                            iconMap={{
                              customAction: () => <IonIcon name="grid-outline" size={24} />, // ✅ 使用 <Text> 來正確渲染 emoji
                            }}
                            customAction={handleCustomAction}
                            onPressAddImage={(e) => {
                              console.log(e, 'eeee222');
                              // 實作你的圖片選取邏輯，並插入圖片
                              const imageUrl = `https://stickershop.line-scdn.net/stickershop/v1/product/14677696/LINEStorePC/main.png?v=1`
                              const cleanedUrl = decodeURIComponent(imageUrl).replace(/^about\s+/, '');
                              console.log(cleanedUrl, 'cleanedUrl!!');
                              richText.current.insertImage(cleanedUrl);
                            }}
                          />
                          <ScrollView
                            style={{
                              height: 400,
                              // borderWidth:2,
                              // backgroundColor: 'green'
                            }}
                            keyboardDismissMode={"none"}
                          >
                            <View style={[
                              {
                                height: 400,
                                width: '100%',
                              }
                            ]}
                            >
                              <RichEditor
                                style={[
                                  Platform.OS === 'ios' ? {
                                    minHeight: 400,
                                    padding: 10,
                                    // backgroundColor: 'pink',
                                  } : {
                                    flex: 1,
                                  }
                                ]
                                }
                                ref={richText}
                                containerStyle={{
                                  backgroundColor: 'transparent',
                                  cssText: 'body { margin: 0; padding: 10px; min-height: 400px; }'
                                }}
                                initialContentHTML={
                                  articleData.rich_content
                                }
                                onHeightChange={(e) => {
                                  console.log(e, "change height1");
                                  setHeight(e);
                                }}
                                onChange={descriptionText => {
                                  const updatedHtml = descriptionText.replace(
                                    /<p(?![^>]*style)/g,
                                    '<p style="line-height:1.5;"'
                                  );
                                  console.log(updatedHtml, 'updatedHtml00');
                                  setArticleData({
                                    ...articleData,
                                    rich_content: updatedHtml
                                  })
                                }}
                                onBlur={() => { }}
                                onDone={() => Keyboard.dismiss} // 手動關閉鍵盤
                                onFocus={() => {
                                  setTimeout(() => {
                                    scrollViewRef?.current?.scrollToPosition(0, 800, true)
                                  }, 300);
                                }}
                              />
                            </View>
                          </ScrollView>
                        </ScrollView>
                        {!articleData?.rich_content && (
                          <>
                            {[t('此項目為必填')].map(errorMessageItem => (
                              <WsErrorMessage
                                key={errorMessageItem}
                              >
                                {t(errorMessageItem)}
                              </WsErrorMessage>
                            ))}
                          </>
                        )}
                        {/* 🔹 自訂行數/列數的 Modal 視窗 */}
                        <Modal visible={modalVisible} transparent animationType="slide">
                          <View
                            style={{
                              flex: 1,
                              justifyContent: "center",
                              alignItems: "center",
                              backgroundColor: "rgba(0,0,0,0.5)",
                            }}
                          >
                            <View
                              style={{
                                backgroundColor: "white",
                                padding: 20,
                                borderRadius: 10,
                                width: "80%",
                              }}
                            >
                              <Text>輸入表格行數：</Text>
                              <TextInput
                                value={rows}
                                onChangeText={setRows}
                                keyboardType="numeric"
                                style={{ borderBottomWidth: 1, marginBottom: 10 }}
                              />
                              <Text>輸入表格列數：</Text>
                              <TextInput
                                value={cols}
                                onChangeText={setCols}
                                keyboardType="numeric"
                                style={{ borderBottomWidth: 1, marginBottom: 20 }}
                              />
                              <Button title="插入表格" onPress={insertTable} />
                              <Button title="取消" onPress={() => setModalVisible(false)} />
                            </View>
                          </View>
                        </Modal>
                      </>
                    </WsPaddingContainer>
                  )}
              </>
            )}
          </WsPaddingContainer>
        </KeyboardAwareScrollView>
      </WsModal >

      <WsPopup
        active={popupDelete}
        onClose={() => {
          setPopupDelete(false)
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
          >{t('確定要刪除嗎？')}
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
                setPopupDelete(false)
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
                $_submitDelete()
                setPopupDelete(false)
              }}>
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>

      {guideline && (
        <>
          <WsDialogDelete
            mode={2}
            id={guideline?.id}
            to={'GuidelineAdminIndex'}
            modelName="guideline_admin"
            visible={dialogVisible}
            text={t('確定要刪除嗎？')}
            des={t('請再三確認，刪除之後內規將一去不復返。')}
            setVisible={setDialogVisible}
          />
        </>
      )}

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
              top: 16,
              width: width * 0.8,
              flexWrap: 'wrap'
            }}
          >{guidelineIndexAnnounce && guidelineIndexAnnounce.length == 1 ? t('此為最後一個版本，刪除會造成資料缺失，確定要刪除嗎？') : t('確定刪除嗎？')}
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
                $_onPressGuidelineVersionAdminDelete(guideline)
                setPopupActive(false)
              }}>
              {t('確定')}
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>

      <WsPopup
        active={excelPopupActive002}
        onClose={() => {
          setExcelPopupActive002(false)
        }}
      >
        <>
          {excelLoading ? (
            <WsLoading></WsLoading>
          ) : (
            <View
              style={{
                width: width * 0.9,
                height: Platform.OS === 'ios' ? height * 0.85 : height * 0.9,
                backgroundColor: $color.white,
                borderRadius: 10,
              }}
            >
              <WsPaddingContainer>
                <WsText size={18}>{t('匯入')}</WsText>
                {importExcelStep === 3 && (
                  <WsText>{t('排序')}</WsText>
                )}
              </WsPaddingContainer>

              {importExcelStep === 1 && (
                <ScrollView
                  style={{
                    margin: 16,
                  }}
                >
                  <WsState
                    style={{
                    }}
                    type="date"
                    label={t('修正發布日')}
                    value={batchArticleData?.announce_at ? moment(batchArticleData.announce_at).format('YYYY-MM-DD') : t('無')}
                    onChange={e => {
                      setBatchArticleData({
                        ...batchArticleData,
                        announce_at: e
                      })
                    }}
                    placeholder={t('請選擇修正發布日...')}
                  />
                  <WsState
                    style={{
                      marginTop: 8
                    }}
                    type="date"
                    label={t('生效日')}
                    value={batchArticleData?.effect_at ? moment(batchArticleData.effect_at).format('YYYY-MM-DD') : t('無')}
                    onChange={e => {
                      setBatchArticleData({
                        ...batchArticleData,
                        effect_at: e
                      })
                    }}
                    placeholder={t('選擇')}
                    backgroundColor={$color.primary11l}
                  />

                  <WsState
                    style={{
                      marginTop: 8
                    }}
                    type="belongsto002_CRUD"
                    modelName={'guideline_status'}
                    nameKey={'name'}
                    label={t('施行狀態')}
                    translate={false}
                    addIconLabel={t('新增施行狀態')}
                    manageIconLabel={t('管理施行狀態')}
                    searchBarVisible={true}
                    placeholder={t('選擇')}
                    value={batchArticleData?.guideline_status ? batchArticleData.guideline_status : t('無')}
                    onChange={(e) => {
                      console.log(e, 'eee');
                      setBatchArticleData({
                        ...batchArticleData,
                        guideline_status: e
                      })
                    }}
                  />
                </ScrollView>
              )}

              {importExcelStep === 2 && (
                <>
                  <WsFlex
                    justifyContent={'space-around'}
                    style={{
                      marginTop: 8,
                      paddingHorizontal: 16,
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderColor: $color.gray,
                        borderRadius: 25,
                        borderWidth: 1,
                        width: 150,
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
                      >{t('下載xlsx範本')}
                      </WsText>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderColor: $color.gray,
                        borderRadius: 25,
                        borderWidth: 1,
                        width: 150,
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
                      >{t('匯入xlsx檔案')}
                      </WsText>
                    </TouchableOpacity>
                  </WsFlex>

                  {/* 水平滾動的表格 */}
                  {tableData.length > 0 && (
                    <ScrollView
                      horizontal={true}
                      style={{
                        margin: 16,
                        marginBottom: 16 * 5,
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: "#ddd",
                        // maxheight: Platform.OS === 'ios' ? height * 0.6 : height * 0.5,
                      }}
                    >
                      <Table>
                        {/* 表頭 */}
                        <TableWrapper style={{ backgroundColor: "#f1f8ff" }}>
                          <Row data={tableHeaders} widthArr={columnWidths} style={{ height: 40 }} textStyle={{ textAlign: "center", fontWeight: "bold" }} />
                        </TableWrapper>

                        <TableWrapper>
                          {/* <Rows data={tableData} widthArr={columnWidths} textStyle={{ textAlign: "center" }} /> */}
                          {tableData.map((rowData, index) => (
                            <Row
                              key={index}
                              data={rowData.map((cell, cellIndex) => {
                                // 根據 cellIndex 指定不同對齊樣式
                                let alignment = "center";
                                if (cellIndex === 3) {
                                  alignment = "start"; // 第一欄置左
                                }
                                // 你可以增加更多邏輯
                                return (
                                  <Text key={cellIndex} style={{ textAlign: alignment }}>
                                    {cell}
                                  </Text>
                                );
                              })}
                              widthArr={columnWidths}
                              style={{
                                backgroundColor: index % 2 === 0 ? "#fff" : "#f7f7f7"
                              }}
                              textStyle={{ textAlign: "center" }}
                            />
                          ))}
                        </TableWrapper>

                      </Table>
                    </ScrollView>
                  )}
                </>
              )}

              {importExcelStep === 3 &&
                importModels &&
                importModels.length > 0 && (
                  <DraggableList
                    items={importModels}
                    setInitSequencePayload={setInitSequencePayload}
                  ></DraggableList>
                )}

              <WsFlex
                justifyContent={'flex-end'}
                style={{
                  width: width * 0.85,
                  // borderWidth: 2,
                  position: 'absolute',
                  bottom: 16,
                  right: 0,
                }}
              >
                <TouchableOpacity
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderColor: $color.gray,
                    borderRadius: 25,
                    borderWidth: 1,
                    width: width * 0.25,
                    alignItems: 'center'
                  }}
                  onPress={() => {
                    setTableHeaders([]);
                    setTableData([]);
                    setColumnWidths([]);
                    setImportModels(null)
                    setImportExcelStep(1)
                    setExcelPopupActive002(false)
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
                {importExcelStep > 1 && (
                  <TouchableOpacity
                    style={{
                      marginLeft: 8,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderColor: $color.gray,
                      borderRadius: 25,
                      borderWidth: 1,
                      width: width * 0.25,
                      alignItems: 'center'
                    }}
                    onPress={() => {
                      setImportExcelStep(importExcelStep - 1)
                    }}>
                    <WsText
                      style={{
                        padding: 1
                      }}
                      size={14}
                      color={$color.gray}
                    >{t('上一步')}
                    </WsText>
                  </TouchableOpacity>
                )}
                {importExcelStep === 1 && (
                  <WsGradientButton
                    style={{
                      width: width * 0.25,
                    }}
                    onPress={() => {
                      setImportExcelStep(importExcelStep + 1)
                    }}>
                    {t('下一步')}
                  </WsGradientButton>
                )}
                {importExcelStep === 2 && (
                  <WsGradientButton
                    style={{
                      width: width * 0.25,
                    }}
                    disabled={tableData && tableData.length > 0 ? false : true}
                    onPress={() => {
                      if (tableData && tableData.length > 0) {
                        setImportExcelStep(3)
                        const _importModels = tableData.map((row, index) => ({
                          id: (index + 1).toString(),
                          parent_article_version_id: null,
                          name: row[0],
                          content: row[1],
                          sequence: (index + 1).toString().padStart(4, '0'),
                        }));
                        console.log(_importModels, '_importModels--');
                        setImportModels(_importModels)
                      }
                    }}>
                    {t('下一步')}
                  </WsGradientButton>
                )}
                {importExcelStep === 3 && (
                  <WsGradientButton
                    style={{
                      width: 110,
                    }}
                    onPress={() => {
                      $_submitBatch()
                    }}>
                    {t('確定')}
                  </WsGradientButton>
                )}

              </WsFlex>

            </View>
          )}

        </>
      </WsPopup >

      <WsModal
        animationType={'none'}
        visible={stateTaskCreateModeModal}
        onBackButtonPress={() => {
          setStateTaskCreateModeModal(false)
        }}
        headerLeftOnPress={() => {
          setStateTaskCreateModeModal(false)
        }}
        title={t('新增任務')}
      >
        <TouchableOpacity
          style={{
            marginTop: 8,
            marginHorizontal: 16
          }}
          onPress={async () => {
            setStateTaskCreateModeModal(false)
            await AsyncStorage.removeItem('TaskCreate')
            await $_setTaskCreateStorage(taskCreateGuidelineArticleVersionId)
            navigation.push('RoutesTask', {
              screen: 'TaskCreate'
            })
          }}
        >
          <WsCard>
            <WsText>{t('直接建立')}</WsText>
          </WsCard>
        </TouchableOpacity>
        {canReadTaskTemplate && (
          <TouchableOpacity
            style={{
              marginTop: 8,
              marginHorizontal: 16
            }}
            onPress={() => {
              setStateTaskCreateModeModal(false)
              setStateTemplateModal(true)
            }}
          >
            <WsCard>
              <WsText>{t('引用公版')}</WsText>
            </WsCard>
          </TouchableOpacity>
        )}
      </WsModal>

      <WsModal
        animationType={'none'}
        visible={stateTemplateModal}
        onBackButtonPress={() => {
          setStateTemplateModal(false)
        }}
        headerLeftOnPress={() => {
          setStateTemplateModal(false)
        }}
        title={t('引用任務公版')}
      >
        <WsPageIndex
          modelName={'task_factory_template'}
          params={{
            order_by: 'updated_at',
            order_way: 'desc',
            status: 'released'
          }}
          filterFields={taskTemplateFilterFields}
          renderItem={({ item, index }) => (
            <LlTaskTemplateCard001
              testID={`Guideline-TaskTemplateCard-${index}`}
              item={item}
              onPress={() => {
                $_onSelectTemplateForCreate(item)
              }}
              createTaskOnPress={() => {
                $_onSelectTemplateForCreate(item)
              }}
              canCreateTask={true}
            />
          )}
          ListFooterComponent={() => (
            <View
              style={{
                height: 50
              }}
            />
          )}
        />
      </WsModal>

      <LlTaskTempalteResuePopup001
        active={stateTemplateReuseModal}
        onClose={() => {
          setStateTemplateReuseModal(false)
        }}
        templateHasTaker={templateHasTaker}
        templateHasSubTaskTaker={templateHasSubTaskTaker}
        includeTaskTaker={includeTaskTaker}
        includeSubTaskTaker={includeSubTaskTaker}
        onChangeIncludeTaskTaker={(value) => {
          includeTaskTakerRef.current = value
          setIncludeTaskTaker(value)
        }}
        onChangeIncludeSubTaskTaker={(value) => {
          includeSubTaskTakerRef.current = value
          setIncludeSubTaskTaker(value)
        }}
        onConfirm={async () => {
          if (!pendingTemplate) {
            return
          }
          try {
            await $_createTaskFromTemplate(pendingTemplate, {
              includeSubTaskTaker: includeSubTaskTakerRef.current,
              includeTaskTaker: includeTaskTakerRef.current
            }, taskCreateGuidelineArticleVersionId)
            setStateTemplateReuseModal(false)
          } catch (error) {
            console.log(error)
          }
        }}
      />

      <WsBottomSheet
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        items={bottomSheetItems}
        snapPoints={[150, 308]}
        onItemPress={(e) => {
          if (e.to?.name === 'GuidelineAdminUpdateVersion') {
            $_onPressGuidelineVersionAdminStore(guideline)
          }
          else if (e.to?.name === 'GuidelineAdminUpdate') {
            $_onPressEdit(guideline)
          }
          else if (e.to?.name === 'TaskCreate') {
            $_onPressTaskCreate()
          }
          else {
            e.onPress()
          }
        }}
      />

    </>
  )
}

export default GuidelineAdminShow
