import React from 'react'
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
  LlInfoContainer001,
  LlRelatedGuidelineItem001,
  WsPageIndex,
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
  setFactoryTags
} from '@/store/data'
import { addToCollectIds, deleteCollectId } from '@/store/data'
import { useTranslation } from 'react-i18next'
import { setCurrentAct } from '@/store/data'
import S_FactoryTag from '@/services/api/v1/factory_tag'
import AsyncStorage from '@react-native-community/async-storage'
import S_ActVersion from '@/services/api/v1/act_version'
import S_GuidelineArticleVersion from '@/services/api/v1/guideline_article_version'
import S_GuidelineVersion from '@/services/api/v1/guideline_version'
import S_TaskFactoryTemplate from '@/services/api/v1/task_factory_template'
import { scopeSubscriptions, scopePermission } from '@/__reactnative_stone/global/permission'

const ActShow = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Params
  const { id } = route.params

  // Redux
  const collectIds = useSelector(state => state.data.collectIds)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentFactoryTags = useSelector(state => state.data.factoryTags)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentUserScope = useSelector(state => state.data.userScopes)
  const canReadTaskTemplate = scopePermission('task-factory-template-read', currentUserScope)

  // States
  const [pickValue, setPickValue] = React.useState()
  const [actVersionRelatedTask, setActVersionRelatedTask] = React.useState()
  const [actVersionRelatedGuideline, setActVersionRelatedGuideline] = React.useState()
  const [actVersionRelatedGuidelineCollapsed, setActVersionRelatedGuidelineCollapsed] = React.useState(true)
  const [actVersionRelatedGuidelineArticles, setActVersionRelatedGuidelineArticles] = React.useState()

  const [actRelatedTaskCollapsed, setActRelatedTaskCollapsed] = React.useState(true)
  const [actRelatedTemplateCollapsed, setActRelatedTemplateCollapsed] = React.useState(true)
  const [actRelatedDocsCollapsed, setActRelatedDocsCollapsed] = React.useState(true)
  const [actRelatedFileStoreFilesCollapsed, setActRelatedFileStoreFilesCollapsed] = React.useState(true)

  const [stateModal, setStateModal] = React.useState(false)
  const [stateTaskCreateModeModal, setStateTaskCreateModeModal] = React.useState(false)
  const [stateTemplateModal, setStateTemplateModal] = React.useState(false)
  const [stateTemplateReuseModal, setStateTemplateReuseModal] = React.useState(false)
  const [taskCreateArticleVersionId, setTaskCreateArticleVersionId] = React.useState()
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

  const [tags, setTags] = React.useState(currentFactoryTags ? currentFactoryTags : [])
  const [tagsSearchValue, setTagsSearchValue] = React.useState('')
  const [tagAddName, setTagAddName] = React.useState('')
  const [tagEditId, setTagEditId] = React.useState()
  const [tagEditName, setTagEditName] = React.useState('')
  const [tagOrder, setTagOrder] = React.useState()
  const [tagCount, setTagCount] = React.useState()
  const [loading, setLoading] = React.useState(false)

  const [popupType, setPopupType] = React.useState('')
  const [popupActive, setPopupActive] = React.useState(false)
  const [popupActiveForEdit, setPopupActiveForEdit] = React.useState(false)
  const [popupActiveForDelete, setPopupActiveForDelete] = React.useState(false)

  const [act, setAct] = React.useState(null)
  const [params, setParams] = React.useState()
  // MEMO
  const _params = React.useMemo(() => {
    return {
      ...params
    }
  }, [params, actRelatedTaskCollapsed, actRelatedTemplateCollapsed, actRelatedDocsCollapsed, actRelatedFileStoreFilesCollapsed, actVersionRelatedGuidelineCollapsed, actVersionRelatedGuidelineArticles]);
  console.log(_params,'_params_params')

  const [actTags, setActTags] = React.useState([])
  const [collectionIcon, setCollectionIcon] = React.useState()
  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('已儲存至「我的收藏」')
  )

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      title: act ? act.last_version?.name : '法規',
      headerRight: () => {
        return (
          <>
            <WsIconBtn
              name={collectionIcon}
              size={24}
              color={$color.white}
              underlayColorPressIn="transparent"
              style={{
                marginRight: 4
              }}
              onPress={$_setCollection}
            />
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
            }}
          />
        )
      }
    })
  }
  // Functions
  const $_isCollection = () => {
    return collectIds.includes(id)
  }
  const $_setCollection = async () => {
    if ($_isCollection()) {
      setIsSnackBarVisible(false)
      setSnackBarText('已從我的收藏中移除')
      setCollectionIcon('md-turned-in-not')
      store.dispatch(deleteCollectId(id))
      setIsSnackBarVisible(true)
      await S_Act.removeMyCollect(id)
    } else {
      setIsSnackBarVisible(false)
      setSnackBarText('已儲存至「我的收藏」')
      setCollectionIcon('md-turned-in')
      store.dispatch(addToCollectIds(id))
      setIsSnackBarVisible(true)
      await S_Act.addMyCollect(id)
    }
  }

  // SERVICES
  const $_fetchAct = async (e) => {
    try {
      const res = await S_Act.show({
        modelId: id
      })
      console.log(id, '=id=');
      if (res) {
        setAct(res)
        setPickValue({
          announce_at: res.last_version?.announce_at,
          id: res.last_version?.id
        })
        const _versionId = e ? e.id : res.last_version?.id
        $_fetchActVersion(_versionId)
        $_fetchRelativeGuideline(id)
        $_fetchRelativeGuidelineArticles(id)
        if (res.factory_tags && res.factory_tags.length > 0) {
          const _tags = res.factory_tags.map(_tag => _tag.id)
          setActTags(_tags)
        }
        if (e) {
          setParams({
            act_versions: e.id,
            order_by: 'no_number',
            order_way: 'asc'
          })
        } else {
          setParams({
            act_versions: res.last_version && res.last_version.id ? res.last_version.id : undefined,
            order_by: 'no_number',
            order_way: 'asc'
          })
        }
        store.dispatch(setCurrentAct(res))
      }
    } catch (e) {
      if (e.response?.status === 429) {
        console.warn('⚠️ 太多請求，請稍後再試')
        Alert.alert(t('請求次數過多，請稍候再試'))
      } else {
        console.error('⛔ 其他錯誤:', e)
      }
    }
  }
  // 取得法規版本相關內規
  const $_fetchRelativeGuideline = async (id) => {
    try {
      const _params = {
        act_versions: id
      }
      const _guideline = await S_GuidelineVersion.indexByAct({ params: _params })
      setActVersionRelatedGuideline(_guideline.data)
    } catch (e) {
      console.log(e, 'error')
    }
  }
  // 取得法規版本相關內規條文
  const $_fetchRelativeGuidelineArticles = async (id) => {
    try {
      const _params = {
        act_versions: id
      }
      const _guidelineArticles = await S_GuidelineArticleVersion.indexByAct({ params: _params })
      setActVersionRelatedGuidelineArticles(_guidelineArticles.data)
    } catch (e) {
      console.log(e, 'error')
    }
  }
  // 取得法規版本相關任務
  const $_fetchActVersion = async (id) => {
    try {
      const _actVersion = await S_ActVersion.show({ modelId: id })
      setActVersionRelatedTask(_actVersion.task)
    } catch (e) {
      if (e.response?.status === 429) {
        console.warn('⚠️ 太多請求，請稍後再試')
        Alert.alert(t('請求次數過多，請稍候再試'))
      } else {
        console.error('⛔ 其他錯誤:', e)
      }
    }
  }

  // 取得所有標籤
  const $_factoryTags = async () => {
    let _params = {
      order_by: "sequence",
      order_way: "asc",
      get_all: 1
    }
    try {
      const _res = await S_FactoryTag.indexV2({ params: _params })
      setTags(_res.data)
      store.dispatch(setFactoryTags(_res.data))
    } catch (error) {
      console.log(error, '$_factoryTags')
    }
  }
  // 更新此法規標籤
  const $_onSubmit = async () => {
    const _params = {
      id: id,
      factory_tags: actTags
    }
    try {
      const _res = await S_FactoryTag.updateActTag({ params: _params })
      if (_res) {
        $_fetchAct()
      }
    } catch (error) {
      console.log(error, '$_factoryTags')
    }
  }
  // 新增標籤
  const $_onSubmitAddTag = async () => {
    let _data = {
      name: tagAddName,
      sequence: tagOrder
    }
    try {
      const _res = await S_FactoryTag.create({ data: _data })
      if (_res) {
        $_factoryTags()
      }
      Alert.alert('標籤新增成功')
    } catch (error) {
      console.log(error, '$_factoryTags Add')
      Alert.alert('標籤新增失敗')
    }
  }
  // 更新標籤
  const $_onSubmitEditTag = async () => {
    let _data = {
      id: tagEditId,
      name: tagEditName,
      sequence: tagOrder
    }
    try {
      const _res = await S_FactoryTag.update({ data: _data })
      if (_res) {
        $_factoryTags()
      }
    } catch (error) {
      console.log(error, '$_factoryTags Edit')
    }
  }
  // 刪除標籤
  const $_onSubmitDeleteTag = async (_tagId = tagEditId) => {
    if (!_tagId) {
      return
    }
    try {
      const _res = await S_FactoryTag.delete(_tagId)
      $_factoryTags()
      Alert.alert('標籤刪除成功')
    } catch (error) {
      console.log(error, '$_factoryTags Delete')
      Alert.alert('標籤刪除失敗')
    }
  }
  // 搜尋標籤
  const $_filterTag = () => {
    if (!tags) {
      return
    }
    const results = tags.filter(item => item.name.includes(tagsSearchValue));
    return results;
  }
  // FactoryTag-show
  const $_fetchFactoryTag = async (id) => {
    setLoading(true)
    try {
      const _res = await S_FactoryTag.show({ modelId: id })
      setTagCount(_res)
      setLoading(false)
      return _res
    } catch (error) {
      setLoading(false)
      console.log(error, '$_factoryTags Show')
      return null
    }
  }
  const $_hasAnyRelationCount = (_tagCount) => {
    if (!_tagCount || typeof _tagCount !== 'object') {
      return false
    }
    return Object.keys(_tagCount).some(key => {
      if (!key.endsWith('_count')) {
        return false
      }
      return Number(_tagCount?.[key] || 0) > 0
    })
  }

  // RENDER
  const renderInnerItem002 = ({ item, index }) => {
    return (
      <WsFlex key={index}
        style={{
          width: width * 0.75
        }}
        justifyContent="space-between"
      >
        <WsText testID={item.name}>{item.name}</WsText>
        <WsFlex>
          <WsIconBtn
            testID={`ws-outline-edit-pencil-${index}`}
            name={'ws-outline-edit-pencil'}
            size={24}
            onPress={() => {
              setTagEditId(item.id)
              setTagEditName(item.name)
              setTagOrder(index)
              setPopupActiveForEdit(true)
            }}
          ></WsIconBtn>
          <WsIconBtn
            testID={`ws-outline-delete-${index}`}
            name={'ws-outline-delete'}
            size={24}
            onPress={async () => {
              setTagEditId(item.id)
              const _tag = await $_fetchFactoryTag(item.id)
              if ($_hasAnyRelationCount(_tag)) {
                setPopupActiveForDelete(true)
                return
              }
              $_onSubmitDeleteTag(item.id)
            }}
          ></WsIconBtn>
        </WsFlex>
      </WsFlex >
    );
  };

  // Storage-Create-Task-Bind-Act
  const $_getActTaskDefaultValue = (articleVersionId) => {
    const _actSystemSubclasses = act?.system_subclasses ? act.system_subclasses : []
    return {
      act_id: id,
      act_version: pickValue && pickValue.id ? pickValue.id : undefined,
      article_version: articleVersionId ? articleVersionId : undefined,
      system_subclasses: _actSystemSubclasses,
      redirect_routes: [
        {
          name: 'ActIndex',
        },
        {
          name: 'ActShow',
          params: {
            id: id,
          }
        }
      ]
    }
  }

  const $_setStorage = async (articleVersionId) => {
    const _defaultValue = $_getActTaskDefaultValue(articleVersionId)
    const _task = JSON.stringify(_defaultValue)
    await AsyncStorage.setItem('TaskCreate', _task)
  }

  const $_createTaskFromTemplate = async (
    _template,
    {
      includeSubTaskTaker,
      includeTaskTaker
    },
    articleVersionId
  ) => {
    const _taskCreateDraft = S_TaskFactoryTemplate.getTaskCreateDraftFromTemplate(_template, {
      includeSubTaskTaker,
      includeTaskTaker,
      currentUser: currentUser || null
    })
    const _actDefaultValue = $_getActTaskDefaultValue(articleVersionId)
    const _templateSubclasses = Array.isArray(_taskCreateDraft?.system_subclasses)
      ? _taskCreateDraft.system_subclasses
      : []
    const _actSubclasses = Array.isArray(_actDefaultValue?.system_subclasses)
      ? _actDefaultValue.system_subclasses
      : []
    const _mergedSystemSubclasses = [..._templateSubclasses, ..._actSubclasses].reduce((acc, item) => {
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
      ..._actDefaultValue,
      system_subclasses: _mergedSystemSubclasses
    }))
    navigation.push('RoutesTask', {
      screen: 'TaskCreate'
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
        }, taskCreateArticleVersionId)
        return
      }
      setStateTemplateModal(false)
      setStateTemplateReuseModal(true)
    } catch (error) {
      console.log(error)
    }
  }
  // HELPER
  const $_ratio = (item) => {
    const _isDone = item && item.sub_tasks.filter(task => {
      return task.done_at
    })
    if (item.sub_tasks.length * 100 != 0) {
      return Math.round((_isDone.length / item.sub_tasks.length) * 1000) / 10
    } else if (item.done_at) {
      return 100
    } else {
      return 0
    }
  }

  React.useEffect(() => {
    $_fetchAct()
  }, [id])

  React.useEffect(() => {
    $_setNavigationOption()
  }, [collectionIcon, act])

  React.useEffect(() => {
    if ($_isCollection()) {
      setCollectionIcon('md-turned-in')
    } else {
      setCollectionIcon('md-turned-in-not')
    }
  }, [])

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      $_fetchAct()
    });

    return unsubscribe;
  }, [navigation]);

  // helper area
  const namesFrom = (val: any) => {
    const arr = Array.isArray(val) ? val : (val ? [val] : []);
    return arr
      .map((a) => (typeof a === 'string' ? a : a?.name ?? a?.label ?? ''))
      .filter(Boolean)
      .join('、');
  };
  const areaNames = namesFrom(act?.areas ?? act?.area);
  const areaSectionNames = namesFrom(act?.area_sections);

  return (
    <>
      {act && act.last_version && params ? (
        <>
          <WsSnackBar
            text={snackBarText}
            setVisible={setIsSnackBarVisible}
            visible={isSnackBarVisible}
            quickHidden={true}
          />
          <WsInfiniteScroll
            service={S_ArticleVersion}
            params={_params}
            shouldHandleScroll={false}
            ListHeaderComponent={() => {
              return (
                <>
                  <WsPaddingContainer
                    style={{
                      backgroundColor: $color.white
                    }}>
                    <WsText size={24} testID={'法規法條名稱'}>{act.last_version.name}</WsText>

                    {act.areas && (
                      <View
                        style={{
                          marginTop: 8
                        }}
                      >
                        <WsInfo
                          labelSize={12}
                          textSize={12}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                          labelWidth={100}
                          type="text"
                          value={areaNames}
                          label={t('地區')}
                        />
                      </View>
                    )}

                    {act.area_sections &&
                      act.area_sections.length > 0 && (
                        <View
                          style={{
                            marginTop: 8
                          }}
                        >
                          <WsInfo
                            labelSize={12}
                            textSize={12}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                            labelWidth={100}
                            type="text"
                            value={areaSectionNames}
                            label={t('子地區')}
                          />
                        </View>
                      )}

                    <WsFlex
                      flexWrap={'wrap'}
                      style={{
                        // borderWidth:1,
                      }}
                    >
                      <WsText size={12} fontWeight={600} style={{ width: 108 }}>{t('領域')}</WsText>
                      {act.system_subclasses.map(
                        (systemSubClass, systemSubClassIndex) => {
                          return (
                            <WsTag
                              style={{
                                marginLeft: 4,
                                marginBottom: 4,
                              }}
                              key={systemSubClassIndex}
                              img={systemSubClass.icon}>
                              {t(systemSubClass.name)}
                            </WsTag>
                          )
                        }
                      )}
                    </WsFlex>

                    {act.act_type &&
                      act.act_type.name && (
                        <View
                          style={{
                            // marginTop: 8
                          }}
                        >
                          <WsInfo
                            labelSize={12}
                            textSize={12}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}
                            labelWidth={100}
                            type="text"
                            value={t(act.act_type.name)}
                            label={t('法規類別')}
                          />
                        </View>
                      )}

                    <View
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsInfo
                        labelSize={12}
                        textSize={12}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                        labelWidth={100}
                        label={t('修正發布日')}
                        value={moment(act.last_version && act.last_version.announce_at ? act.last_version.announce_at : null).format('YYYY-MM-DD')}
                      />
                    </View>

                    {act.last_version && act.last_version.effect_at && (
                      <View
                        style={{
                          marginTop: 8
                        }}
                      >
                        <WsInfo
                          labelSize={12}
                          textSize={12}
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                          labelWidth={100}
                          label={t('修正發布日')}
                          value={moment(act.last_version && act.last_version.effect_at ? act.last_version.effect_at : null).format('YYYY-MM-DD')}
                        />
                      </View>
                    )}

                    <View
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsInfo
                        labelSize={12}
                        textSize={12}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                        labelWidth={100}
                        type="text"
                        value={t(act.act_status && act.act_status.name ? t(act.act_status.name) : null)}
                        label={t('法規狀態')}
                      />
                    </View>

                    <WsPaddingContainer
                      padding={0}
                      style={{
                        marginTop: 16,
                      }}>
                      {id && (
                        <WsState
                          preText={'Ver. '}
                          label={t('選擇版本')}
                          type="belongsto"
                          modelName={'act_version'}
                          serviceIndexKey={'indexAnnounce'}
                          nameKey={'announce_at'}
                          hasMeta={false}
                          formatNameKey={'YYYY-MM-DD'}
                          value={pickValue}
                          params={{
                            act_id: id
                          }}
                          onChange={async $event => {
                            await $_fetchAct($event)
                            setPickValue($event)
                          }}
                          style={{
                            zIndex: 999
                          }}
                        />
                      )}
                    </WsPaddingContainer>
                  </WsPaddingContainer>

                  {act.area &&
                    act.area.name &&
                    act.area.name != undefined && (
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
                          value={t(act.area.name)}
                          label={t('適用地區')}
                        />
                      </WsPaddingContainer>
                    )
                  }

                  {act.last_version &&
                    act.last_version.reference_link && (
                      <WsPaddingContainer
                        padding={0}
                        style={{
                          padding: 16,
                          backgroundColor: $color.white,
                          marginTop: 8
                        }}>
                        <WsInfo
                          type="link"
                          value={act.last_version.reference_link}
                          label={t('來源連結')}
                          hasExternalLink={true}
                        />
                      </WsPaddingContainer>
                    )}

                  {act.factory_tags && act.factory_tags.length > 0 && (
                    <WsPaddingContainer
                      padding={0}
                      style={{
                        backgroundColor: $color.white,
                        marginTop: 8
                      }}>
                      <WsFlex
                        style={{
                          padding: 16
                        }}
                        flexWrap={'wrap'}
                      >
                        {act.factory_tags.map(
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
                    </WsPaddingContainer>
                  )}

                  {act.last_version.act_comment != '' && (
                    <>
                      <WsCardPassage
                        title={t('立法總說明')}
                        passage={act.last_version.act_comment}
                        style={{
                          marginTop: 8
                        }}
                      />
                    </>
                  )}

                  {act.last_version.ll_comment != '' && (
                    <>
                      <WsCardPassage
                        title={t('ESGoal總評')}
                        passage={act.last_version.ll_comment}
                        style={{
                          marginTop: 8
                        }}
                      />
                    </>
                  )}

                  {act.last_version &&
                    act.last_version.status != '' && (
                      <>
                        <WsCardPassage
                          title={t('施行狀態')}
                          passage={act.last_version.status}
                          style={{
                            marginTop: 8
                          }}
                        />
                      </>
                    )}

                  {act.last_version &&
                    act.last_version.attaches &&
                    act.last_version.attaches.length > 0 && (
                      <WsInfo
                        style={{
                          padding: 16,
                          marginTop: 8,
                          backgroundColor: $color.white,
                        }}
                        type="filesAndImages"
                        label={t('附件')}
                        value={act.last_version.attaches}
                      />
                    )}

                  {act.last_version &&
                    (act.last_version.has_license_template ||
                      act.last_version.has_checklist_template ||
                      act.last_version.has_audit_template ||
                      act.last_version.has_contractor_license_template ||
                      act.last_version.has_internal_training_template) && (
                      <>
                        <WsPaddingContainer
                          padding={0}
                          style={{
                            backgroundColor: $color.white,
                            marginTop: 8,
                          }}>
                          <LlBtnAct001
                            testID={`${id}-查看相關公版`}
                            style={{
                              marginTop: 16,
                              marginBottom: actRelatedTemplateCollapsed ? 16 : 0,
                              marginHorizontal: 16,
                              borderTopLeftRadius: 10,
                              borderTopRightRadius: 10,
                              borderBottomLeftRadius: actRelatedTemplateCollapsed ? 10 : 0,
                              borderBottomRightRadius: actRelatedTemplateCollapsed ? 10 : 0,
                            }}
                            onPress={() => {
                              console.log('1111');
                              setActRelatedTemplateCollapsed(!actRelatedTemplateCollapsed)
                            }}
                          >
                            <WsText color={$color.primary3l}>{t('相關公版')}</WsText>
                            <WsIcon
                              name={actRelatedTemplateCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                              size={24}
                              color={$color.primary3l}
                            ></WsIcon>
                          </LlBtnAct001>

                          {!actRelatedTemplateCollapsed && (
                            <WsPaddingContainer
                              padding={16}
                              style={{
                                marginHorizontal: 16,
                                marginBottom: 16,
                                borderBottomRightRadius: actRelatedTemplateCollapsed ? 0 : 10,
                                backgroundColor: $color.primary11l
                              }}>
                              {act.last_version.has_license_template &&
                                scopeSubscriptions(currentFactory, 'license') &&
                                (
                                  <LlRelatedLicenseTemplateCard001
                                    acts={act.id}
                                  ></LlRelatedLicenseTemplateCard001>
                                )}
                              {act.last_version.has_checklist_template &&
                                scopeSubscriptions(currentFactory, 'checklist') && (
                                  <LlRelatedChecklistTemplateCard001
                                    acts={act.id}
                                  ></LlRelatedChecklistTemplateCard001>
                                )}
                              {act.last_version.has_audit_template &&
                                scopeSubscriptions(currentFactory, 'audit') && (
                                  <LlRelatedAuditTemplateCard001
                                    acts={act.id}
                                  ></LlRelatedAuditTemplateCard001>
                                )}
                              {act.last_version.has_contractor_license_template &&
                                scopeSubscriptions(currentFactory, 'contractor_license') && (
                                  <LlRelatedContractorLicenseTemplateCard001
                                    acts={act.id}
                                  ></LlRelatedContractorLicenseTemplateCard001>
                                )}
                              {act.last_version.has_internal_training_template &&
                                scopeSubscriptions(currentFactory, 'internal_training') && (
                                  <LlRelatedTrainingTemplateCard001
                                    acts={act.id}
                                  ></LlRelatedTrainingTemplateCard001>
                                )}
                            </WsPaddingContainer>
                          )}

                        </WsPaddingContainer>
                      </>
                    )}

                  {act.last_version &&
                    (act.last_version.has_license ||
                      act.last_version.has_checklist ||
                      act.last_version.has_audit ||
                      act.last_version.has_contractor_license ||
                      act.last_version.has_internal_training) &&
                    (act.last_version.id === pickValue.id) && (
                      <>
                        <WsPaddingContainer
                          padding={0}
                          style={{
                            backgroundColor: $color.white,
                            marginTop: 8,
                          }}>
                          <LlBtnAct001
                            testID={`${id}-相關文件`}
                            style={{
                              margin: 16,
                              marginBottom: actRelatedDocsCollapsed ? 16 : 0,
                              borderTopLeftRadius: 10,
                              borderTopRightRadius: 10,
                              borderBottomLeftRadius: actRelatedDocsCollapsed ? 10 : 0,
                              borderBottomRightRadius: actRelatedDocsCollapsed ? 10 : 0,
                            }}
                            onPress={() => {
                              setActRelatedDocsCollapsed(!actRelatedDocsCollapsed)
                            }}
                          >
                            <WsText color={$color.primary3l}>{t('相關文件')}</WsText>
                            <WsIcon
                              name={actRelatedDocsCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                              size={24}
                              color={$color.primary3l}
                            ></WsIcon>
                          </LlBtnAct001>
                          {!actRelatedDocsCollapsed && (
                            <WsPaddingContainer
                              padding={16}
                              style={{
                                marginHorizontal: 16,
                                marginBottom: 16,
                                borderBottomRightRadius: actRelatedDocsCollapsed ? 0 : 10,
                                backgroundColor: $color.primary11l
                              }}
                            >

                              {act.last_version.has_license &&
                                scopeSubscriptions(currentFactory, 'license') && (
                                  <LlRelatedLicenseDocs001
                                    acts={act.id}
                                  ></LlRelatedLicenseDocs001>
                                )}

                              {act.last_version.has_checklist &&
                                scopeSubscriptions(currentFactory, 'checklist') ? (
                                <LlRelatedChecklistDocs001
                                  acts={act.id}
                                ></LlRelatedChecklistDocs001>
                              ) : null}

                              {act.last_version.has_audit &&
                                scopeSubscriptions(currentFactory, 'audit') && (
                                  <LlRelatedAuditDocs001
                                    acts={act.id}
                                  ></LlRelatedAuditDocs001>
                                )}

                              {act.last_version.has_contractor_license &&
                                scopeSubscriptions(currentFactory, 'contractior_license') && (
                                  <LlRelatedContractorLicenseDocs001
                                    acts={act.id}
                                  >
                                  </LlRelatedContractorLicenseDocs001>
                                )}

                              {act.last_version.has_internal_training &&
                                scopeSubscriptions(currentFactory, 'internal_traing') && (
                                  <LlRelatedTrainingDocs001
                                    acts={act.id}
                                  ></LlRelatedTrainingDocs001>
                                )}
                            </WsPaddingContainer>
                          )}
                        </WsPaddingContainer>
                      </>
                    )}

                  {act.last_version &&
                    act.last_version.has_file &&
                    (act.last_version.id === pickValue.id) && (
                      <>
                        <WsPaddingContainer
                          padding={0}
                          style={{
                            backgroundColor: $color.white,
                            marginTop: 8,
                          }}>

                          <LlBtnAct001
                            style={{
                              margin: 16,
                              marginBottom: actRelatedFileStoreFilesCollapsed ? 16 : 0,
                              borderTopLeftRadius: 10,
                              borderTopRightRadius: 10,
                              borderBottomLeftRadius: actRelatedFileStoreFilesCollapsed ? 10 : 0,
                              borderBottomRightRadius: actRelatedFileStoreFilesCollapsed ? 10 : 0,
                            }}
                            onPress={() => {
                              setActRelatedFileStoreFilesCollapsed(!actRelatedFileStoreFilesCollapsed)
                            }}
                          >
                            <WsText color={$color.primary3l}>{t('相關檔案庫文件')}</WsText>
                            <WsIcon
                              name={actRelatedFileStoreFilesCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                              size={24}
                              color={$color.primary3l}
                            ></WsIcon>
                          </LlBtnAct001>

                          {!actRelatedFileStoreFilesCollapsed && (
                            <WsPaddingContainer
                              padding={16}
                              style={{
                                marginHorizontal: 16,
                                marginBottom: 16,
                                // borderWidth:2,
                                borderBottomRightRadius: actRelatedFileStoreFilesCollapsed ? 0 : 10,
                                backgroundColor: $color.primary11l
                              }}
                            >
                              {act.last_version.has_file && (
                                <LlRelatedFileStoreFiles001
                                  acts={act.id}
                                ></LlRelatedFileStoreFiles001>
                              )}
                            </WsPaddingContainer>
                          )}

                        </WsPaddingContainer>
                      </>
                    )}

                  {actVersionRelatedTask &&
                    scopeSubscriptions(currentFactory, 'task') && (
                      <>
                        <WsPaddingContainer
                          padding={0}
                          style={{
                            backgroundColor: $color.white,
                            marginTop: 8,
                          }}>
                          <LlBtnAct001
                            style={{
                              margin: 16,
                              marginBottom: actRelatedTaskCollapsed ? 16 : 0,
                              borderTopLeftRadius: 10,
                              borderTopRightRadius: 10,
                              borderBottomLeftRadius: actRelatedTaskCollapsed ? 10 : 0,
                              borderBottomRightRadius: actRelatedTaskCollapsed ? 10 : 0,
                            }}
                            onPress={() => {
                              setActRelatedTaskCollapsed(!actRelatedTaskCollapsed)
                            }}
                          >
                            <WsText color={$color.primary3l}>{t('相關任務')}</WsText>
                            <WsIcon
                              name={actRelatedTaskCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                              size={24}
                              color={$color.primary3l}
                            ></WsIcon>
                          </LlBtnAct001>

                          {!actRelatedTaskCollapsed && (
                            <WsPaddingContainer
                              padding={16}
                              style={{
                                marginHorizontal: 16,
                                marginBottom: 16,
                                borderBottomRightRadius: actRelatedTaskCollapsed ? 0 : 10,
                                borderBottomLeftRadius: actRelatedTaskCollapsed ? 0 : 10,
                                backgroundColor: $color.primary11l
                              }}
                            >
                              <LlTaskCard002
                                item={actVersionRelatedTask}
                                onPress={() => {
                                  navigation.push('RoutesTask', {
                                    screen: 'TaskShow',
                                    params: {
                                      id: actVersionRelatedTask.id
                                    }
                                  })
                                }}
                              />
                            </WsPaddingContainer>
                          )}

                        </WsPaddingContainer>
                      </>
                    )}

                  {(
                    (act.last_version.has_guidelines &&
                      (actVersionRelatedGuideline &&
                        actVersionRelatedGuideline.length > 0)) ||
                    (act.last_version.has_guideline_articles &&
                      (actVersionRelatedGuidelineArticles &&
                        actVersionRelatedGuidelineArticles.length > 0))
                  ) && (
                      <>
                        <WsPaddingContainer
                          padding={0}
                          style={{
                            backgroundColor: $color.white,
                            marginTop: 8,
                          }}>
                          <LlBtnAct001
                            style={{
                              marginTop: 16,
                              marginBottom: actVersionRelatedGuidelineCollapsed ? 16 : 0,
                              marginHorizontal: 16,
                              borderTopLeftRadius: 10,
                              borderTopRightRadius: 10,
                              borderBottomLeftRadius: actVersionRelatedGuidelineCollapsed ? 10 : 0,
                              borderBottomRightRadius: actVersionRelatedGuidelineCollapsed ? 10 : 0,
                            }}
                            onPress={() => {
                              setActVersionRelatedGuidelineCollapsed(!actVersionRelatedGuidelineCollapsed)
                            }}
                          >
                            <WsText color={$color.primary3l}>{t('相關內規')}</WsText>
                            <WsIcon
                              name={actVersionRelatedGuidelineCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                              size={24}
                              color={$color.primary3l}
                            ></WsIcon>
                          </LlBtnAct001>
                          {!actVersionRelatedGuidelineCollapsed && (
                            <WsPaddingContainer
                              padding={0}
                              style={{
                                paddingHorizontal: 16,
                                paddingBottom: 16,
                                marginHorizontal: 16,
                                marginBottom: 16,
                                borderBottomRightRadius: actVersionRelatedGuidelineCollapsed ? 0 : 10,
                                borderBottomLeftRadius: actVersionRelatedGuidelineCollapsed ? 0 : 10,
                                backgroundColor: $color.primary11l
                              }}>
                              <>
                                {(actVersionRelatedGuideline &&
                                  actVersionRelatedGuideline.length > 0) && (
                                    <>
                                      <WsText fontWeight={500}>{t('相關內規')}</WsText>
                                      {actVersionRelatedGuideline.map(
                                        (guideline, guidelineIndex) => {
                                          return (
                                            <>
                                              <LlRelatedGuidelineItem001
                                                key={guidelineIndex}
                                                item={guideline}
                                                modelName='act'
                                              />
                                            </>
                                          )
                                        }
                                      )}
                                    </>
                                  )}
                                {(actVersionRelatedGuidelineArticles &&
                                  actVersionRelatedGuidelineArticles.length > 0) && (
                                    <>
                                      <WsText
                                        fontWeight={500}
                                        style={{
                                          marginTop: 8
                                        }}
                                      >{t('相關內規條文')}
                                      </WsText>
                                      {actVersionRelatedGuidelineArticles.map(
                                        (article, articleIndex) => {
                                          return (
                                            <>
                                              <LlRelatedGuidelineItem001
                                                key={articleIndex}
                                                item={article}
                                                modelName='act'
                                              />
                                            </>
                                          )
                                        }
                                      )}
                                    </>
                                  )}
                              </>
                            </WsPaddingContainer>
                          )}
                        </WsPaddingContainer>
                      </>
                    )}

                </>
              )
            }}
            renderItem={({ item, index, items }) => {
              return (
                <LlArticleCard001
                  testID={item.id}
                  article={item}
                  actVersionId={act.last_version && act.last_version.id ? act.last_version.id : undefined}
                  pickValueId={pickValue && pickValue.id ? pickValue.id : undefined}
                  actId={id}
                  articleId={item.id}
                  title={act.last_version.name}
                  style={{
                    marginTop: 8,
                  }}
                  navigation={navigation}
                  system_subclasses={act.system_subclasses}
                  onTaskCreatePress={async (articleItem) => {
                    const _articleVersionId = articleItem?.id
                    if (canReadTaskTemplate) {
                      setTaskCreateArticleVersionId(_articleVersionId)
                      setStateTaskCreateModeModal(true)
                      return
                    }
                    await AsyncStorage.removeItem('TaskCreate')
                    await $_setStorage(_articleVersionId)
                    navigation.push('RoutesTask', {
                      screen: 'TaskCreate'
                    })
                  }}
                />
              )
            }}
          />
          <WsModal
            visible={stateModal}
            onBackButtonPress={() => {
              setStateModal(false)
            }}
            headerLeftOnPress={() => {
              setStateModal(false)
            }}
            headerRightText={t('儲存')}
            headerRightOnPress={() => {
              $_onSubmit()
              setStateModal(false)
            }}
            animationType="slide"
          >
            <KeyboardAvoidingView
              style={{
                padding: 16,
              }}
              behavior={Platform.OS === 'ios' ? 'padding' : null}
              keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
              enabled
            >
              <TouchableWithoutFeedback onPress={Keyboard.dismiss} disabled={true}>
                <View>
                  <WsState
                    testID={'搜尋'}
                    style={{
                      marginBottom: 16,
                    }}
                    label={t('搜尋')}
                    type="search"
                    placeholder={t('搜尋')}
                    value={tagsSearchValue}
                    onChange={setTagsSearchValue}
                  >
                  </WsState>
                  <WsState
                    style={{
                      height: 450,
                    }}
                    label={t('標籤')}
                    type="checkboxes"
                    items={tagsSearchValue && tags ? $_filterTag() : tags ? tags : []}
                    value={actTags}
                    onChange={setActTags}
                  >
                  </WsState>
                  <View
                    style={{
                      height: 2,
                      borderBottomWidth: 2,
                      borderColor: 'transparent',
                      shadowColor: 'rgba(0, 0, 0, 0.5)',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 1,
                      shadowRadius: 5,
                      elevation: 5,
                    }}>
                  </View>
                  <TouchableOpacity
                    testID={'Modal新增標籤'}
                    style={{
                      borderTopWidth: 0.3,
                      paddingTop: 16,
                      flexDirection: 'row',
                      alignItems: 'center',

                    }}
                    onPress={() => {
                      setPopupType('add')
                      setTagAddName('')
                      setPopupActive(true)
                    }}
                  >
                    <WsIcon
                      name={'md-add-circle'}
                      size={24}
                    ></WsIcon>
                    <WsText
                      style={{
                        marginLeft: 8
                      }}
                    >
                      {t('新增標籤')}
                    </WsText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    testID={'Modal管理標籤'}
                    style={{
                      paddingTop: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      zIndex: 999
                    }}
                    onPress={() => {
                      setPopupType('edit')
                      setPopupActive(true)
                    }}
                  >
                    <WsIcon
                      name={'ws-outline-edit'}
                      size={24}
                    ></WsIcon>
                    <WsText
                      style={{
                        marginLeft: 8
                      }}
                    >
                      {t('管理標籤')}
                    </WsText>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </KeyboardAvoidingView>

            <WsPopup
              active={popupActive}
              onClose={() => {
                setPopupActive(false)
              }}>
              {popupType === 'add' && (
                <View
                  style={{
                    paddingTop: 16,
                    width: width * 0.9,
                    backgroundColor: $color.white,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                  <WsText size={14} fontWeight={500} style={{ alignSelf: 'center' }}>{popupType === 'edit' ? t('編輯標籤') : t('新增標籤')}</WsText>
                  <WsState
                    style={{
                      width: width * 0.8
                    }}
                    label={t('名稱')}
                    value={tagAddName}
                    onChange={setTagAddName}
                    rules={'required'}
                    placeholder={t('輸入')}
                  />
                  <WsState
                    style={{
                      marginTop: 16,
                      width: width * 0.8
                    }}
                    type="number"
                    label={t('排序')}
                    value={tagOrder}
                    onChange={setTagOrder}
                    placeholder={t('輸入')}
                  />
                  <WsFlex
                    style={{
                      width: width * 0.8,
                      paddingVertical: 16,
                      backgroundColor: $color.white,
                    }}>
                    <WsBtnLeftIconCircle
                      onPress={() => {
                        setPopupActive(false)
                      }}
                      style={{
                        width: width * 0.375,
                        marginRight: 16,
                      }}
                      borderRadius={24}
                      color="transparent"
                      borderWidth={1}
                      borderColor={
                        $color.gray
                      }
                      icon={null}
                      textColor={$color.gray}
                      textSize={14}>
                      {t('取消')}
                    </WsBtnLeftIconCircle>

                    <WsGradientButton
                      style={{
                        width: width * 0.375
                      }}
                      onPress={() => {
                        $_onSubmitAddTag()
                        setPopupActive(false)
                      }}>
                      <View
                        style={{
                          paddingTop: 8,
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center'
                        }}>
                        <WsText color={$color.white} size={14}>
                          {t('儲存')}
                        </WsText>
                      </View>
                    </WsGradientButton>
                  </WsFlex>
                </View>
              )}
              {popupType === 'edit' && (
                <View
                  style={{
                    paddingTop: 16,
                    width: width * 0.9,
                    height: height * 0.8,
                    backgroundColor: $color.white,
                    borderRadius: 10,
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                  <WsFlex
                    style={{
                      width: width * 0.9,
                      padding: 16,
                      // borderWidth:1,
                    }}
                    justifyContent={'space-between'}
                  >
                    <WsText>{t('管理標籤')}</WsText>
                    <WsIconBtn
                      testID={'管理標籤內的md-close'}
                      padding={0}
                      name={'md-close'}
                      size={24}
                      onPress={() => {
                        setPopupActive(false)
                      }}
                    ></WsIconBtn>
                  </WsFlex>
                  <WsState
                    testID={'管理標籤內的搜尋'}
                    style={{
                      marginBottom: 16,
                      width: width * 0.8
                    }}
                    label={t('搜尋')}
                    type="search"
                    placeholder={t('搜尋')}
                    value={tagsSearchValue}
                    onChange={setTagsSearchValue}
                  />
                  <FlatList
                    data={tagsSearchValue ? $_filterTag() : tags}
                    keyExtractor={(item, index) => item + index}
                    renderItem={({ item, index }) => renderInnerItem002({ item, index })}
                  />
                  <WsPopup
                    active={popupActiveForEdit}
                    onClose={() => {
                      setPopupActiveForEdit(false)
                    }}>
                    <View
                      style={{
                        paddingTop: 16,
                        width: width * 0.9,
                        backgroundColor: $color.white,
                        borderRadius: 10,
                        justifyContent: 'center',
                        alignItems: 'center'
                      }}>
                      <WsText size={14} fontWeight={500} style={{ alignSelf: 'center' }}>{popupType === 'edit' ? t('編輯標籤') : t('新增標籤')}</WsText>
                      <WsState
                        style={{
                          width: width * 0.8
                        }}
                        label={t('名稱')}
                        value={tagEditName}
                        onChange={setTagEditName}
                        rules={'required'}
                        placeholder={t('輸入')}
                      />
                      <WsState
                        testID={'編輯Modal排序'}
                        style={{
                          marginTop: 16,
                          width: width * 0.8
                        }}
                        type={'number'}
                        label={t('排序')}
                        value={tagOrder}
                        onChange={setTagOrder}
                        placeholder={t('輸入')}
                      />
                      <WsFlex
                        style={{
                          width: width * 0.8,
                          paddingVertical: 16,
                          backgroundColor: $color.white,
                        }}>
                        <WsBtnLeftIconCircle
                          onPress={() => {
                            setPopupActiveForEdit(false)
                          }}
                          style={{
                            width: width * 0.375,
                            marginRight: 16,
                          }}
                          borderRadius={24}
                          color="transparent"
                          borderWidth={1}
                          borderColor={
                            $color.gray
                          }
                          icon={null}
                          textColor={$color.gray}
                          textSize={14}>
                          {t('取消')}
                        </WsBtnLeftIconCircle>

                        <WsGradientButton
                          testID={'編輯送出'}
                          style={{
                            width: width * 0.375
                          }}
                          onPress={() => {
                            $_onSubmitEditTag()
                            setPopupActiveForEdit(false)
                          }}>
                          <View
                            style={{
                              paddingTop: 8,
                              flexDirection: 'row',
                              justifyContent: 'center',
                              alignItems: 'center'
                            }}>
                            <WsText color={$color.white} size={14}>
                              {t('儲存')}
                            </WsText>
                          </View>
                        </WsGradientButton>
                      </WsFlex>
                    </View>
                  </WsPopup>

                  <WsPopup
                    active={popupActiveForDelete}
                    onClose={() => {
                      setPopupActiveForDelete(false)
                    }}>
                    <View
                      style={{
                        width: width * 0.9,
                        height: 208,
                        backgroundColor: $color.white,
                        borderRadius: 10,
                        padding: 16,
                      }}>
                      {loading ? (
                        <WsLoading></WsLoading>
                      ) : (
                        <>
                          <WsText
                            size={18}
                            color={$color.black}
                            style={{
                            }}
                          >{t('確定刪除嗎？')}
                          </WsText>

                          <WsFlex
                            style={{
                            }}
                            flexWrap={'wrap'}
                          >
                            <WsText
                              size={14}
                              color={$color.black}
                              style={{
                              }}
                            >{t(`下列項目正在使用此標籤，如刪除將會移除標籤`)}
                            </WsText>
                            {tagCount?.acts_count > 0 && (
                              <WsText
                                size={14}
                                color={$color.black}
                                style={{}}
                              >
                                {t('{number}部法規', { number: tagCount.acts_count })}
                              </WsText>
                            )}
                            {tagCount?.audits_count > 0 && (
                              <WsText
                                size={14}
                                color={$color.black}
                                style={{}}
                              >
                                {t('{number}張稽核表', { number: tagCount.audits_count })}
                              </WsText>
                            )}
                            {tagCount?.changes_count > 0 && (
                              <WsText
                                size={14}
                                color={$color.black}
                                style={{}}
                              >
                                {t('{number}個變動計畫', { number: tagCount.changes_count })}
                              </WsText>
                            )}
                            {tagCount?.checklists_count > 0 && (
                              <WsText
                                size={14}
                                color={$color.black}
                                style={{}}
                              >
                                {t('{number}張點檢表', { number: tagCount.checklists_count })}
                              </WsText>
                            )}
                            {tagCount?.contractor_enter_records_count > 0 && (
                              <WsText
                                size={14}
                                color={$color.black}
                                style={{}}
                              >
                                {t('{number}個承攬商進場記錄', { number: tagCount.contractor_enter_records_count })}
                              </WsText>
                            )}
                            {tagCount?.contractor_licenses_count > 0 && (
                              <WsText
                                size={14}
                                color={$color.black}
                                style={{}}
                              >
                                {t('{number}張承攬商資格證', { number: tagCount.contractor_licenses_count })}
                              </WsText>
                            )}
                            {tagCount?.contractors_count > 0 && (
                              <WsText
                                size={14}
                                color={$color.black}
                                style={{}}
                              >
                                {t('{number}家承攬商', { number: tagCount.contractors_count })}
                              </WsText>
                            )}
                            {tagCount?.contracts_count > 0 && (
                              <WsText
                                size={14}
                                color={$color.black}
                                style={{}}
                              >
                                {t('{number}份承攬商契約', { number: tagCount.contracts_count })}
                              </WsText>
                            )}
                            {tagCount?.events_count > 0 && (
                              <WsText
                                size={14}
                                color={$color.black}
                                style={{}}
                              >
                                {t('{number}個風險事件', { number: tagCount.events_count })}
                              </WsText>
                            )}
                            {tagCount?.internal_trainings_count > 0 && (
                              <WsText
                                size={14}
                                color={$color.black}
                                style={{}}
                              >
                                {t('{number}個教育訓練', { number: tagCount.internal_trainings_count })}
                              </WsText>
                            )}
                            {tagCount?.licenses_count > 0 && (
                              <WsText
                                size={14}
                                color={$color.black}
                                style={{}}
                              >
                                {t('{number}張證照', { number: tagCount.licenses_count })}
                              </WsText>
                            )}
                            {tagCount?.tasks_count > 0 && (
                              <WsText
                                size={14}
                                color={$color.black}
                                style={{}}
                              >
                                {t('{number}個任務', { number: tagCount.tasks_count })}
                              </WsText>
                            )}
                            {tagCount?.qrcodes_count > 0 && (
                              <WsText
                                size={14}
                                color={$color.black}
                                style={{}}
                              >
                                {t('{number}個QRcode', { number: tagCount.qrcodes_count })}
                              </WsText>
                            )}
                          </WsFlex>

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
                                borderWidth: 1,
                                borderColor: $color.gray,
                                borderRadius: 25,
                                alignItems: 'center',
                                width: 110,
                                height: 48,
                                paddingVertical: 9,
                              }}
                              onPress={() => {
                                setPopupActiveForDelete(false)
                              }}>
                              <WsText
                                color={$color.gray}
                              >{t('取消')}
                              </WsText>
                            </TouchableOpacity>
                            <WsGradientButton
                              style={{
                                width: 110,
                              }}
                              onPress={() => {
                                $_onSubmitDeleteTag()
                                setPopupActiveForDelete(false)
                              }}>
                              {t('確定')}
                            </WsGradientButton>
                          </WsFlex>
                        </>
                      )}
                    </View>
                  </WsPopup>

                </View>
              )}
            </WsPopup>

          </WsModal>
          {act &&
            act.last_version &&
            !act.last_version.task &&
            (act.last_version.id === pickValue.id) &&
            scopeSubscriptions(currentFactory, 'task') && (
              <WsGradientButton
                borderRadius={25}
                style={{
                  marginBottom: 8,
                }}
                onPress={async () => {
                  if (canReadTaskTemplate) {
                    setTaskCreateArticleVersionId(undefined)
                    setStateTaskCreateModeModal(true)
                    return
                  }
                  await $_setStorage()
                  navigation.push('RoutesTask', {
                    screen: 'TaskCreate'
                  })
                }}
                renderLeadingIcon={() => (
                  <WsIcon
                    color={$color.white}
                    name={'ll-nav-assignment-filled'}
                    size={24}
                    style={{ marginRight: 8 }}
                  />
                )}
              >
                {t('建立任務')}
            </WsGradientButton>
          )}

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
                await $_setStorage(taskCreateArticleVersionId)
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
                  testID={`Act-TaskTemplateCard-${index}`}
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
                }, taskCreateArticleVersionId)
                setStateTemplateReuseModal(false)
              } catch (error) {
                console.log(error)
              }
            }}
          />

          {(act.last_version.id === pickValue.id) && (
            <WsGradientButton
              testID={'新增標籤'}
              borderRadius={25}
              style={{
                marginBottom: 16,
              }}
              onPress={() => {
                setStateModal(true)
              }}
              renderLeadingIcon={() => (
                <WsIcon
                  color={$color.white}
                  name={'ws-outline-edit-pencil'}
                  size={24}
                  style={{
                    marginRight: 8
                  }}
                />
              )}
            >
              {t('新增標籤')}
            </WsGradientButton>
          )}

        </>
      ) : (
        <WsSkeleton></WsSkeleton>
      )}
    </>
  )
}
export default ActShow
