import React from 'react'
import {
  Pressable,
  Platform,
  TouchableOpacity,
  Dimensions,
  View
} from 'react-native'
import {
  WsBtnSelect,
  WsModal,
  WsFlex,
  WsText,
  WsNavCheck,
  WsInfiniteScroll,
  WsState,
  WsPaddingContainer,
  // LlRelatedActModalPickerStep2,
  LlRelatedGuidelineModalPickerStep2,
  WsIconBtn,
  WsPageIndex,
  LlGuidelineCard001,
  LlCheckListCard001,
  LlLicenseCard001,
  LlTrainingCard001,
  LlTrainingGroupCard001,
  LlEventCard001,
  LlContractorsCard001,
  LlContractorEnterCard001,
  // LlContractorEnterExitCheckRecordCard001
  LlExitChecklistCard001,
  LlCheckListResultCard,
  LlFileFolderCard,
  LlTaskCard001,
  LlAlertCard001,
  WsPopup,
  WsBtnLeftIconCircle,
  WsGradientButton
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import Services from '@/services/api/v1/index'
import { useTranslation } from 'react-i18next'
import layouts from '@/__reactnative_stone/global/layout'
import S_File from '@/services/api/v1/file'
import { useSelector } from 'react-redux'
import moment from 'moment'
import S_Act from '@/services/api/v1/act'
import S_GuidelineVersion from '@/services/api/v1/guideline_version'
import guideline from '@/services/api/v1/guideline'
import store from '@/store'
import {
  setCurrentSelectedGuidelineId
} from '@/store/data'
import S_Alert from '@/services/api/v1/alert'
import i18next from 'i18next'
import S_ConstantData from '@/services/api/v1/constant_data'
import factory from '@/services/api/v1/factory'
import S_ModulePage from '@/services/api/v1/module_page'

const LlRelatedModuleModalPicker = props => {
  const { windowWidth, windowHeight } = layouts
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // REDUX
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)
  const currentViewMode = useSelector(state => state.data.currentViewMode)

  // Props
  const {
    value = [],
    onChange,
    placeholder = `${t('選擇')}`,
    title = t('新增關聯法規'),
    modelName,
    serviceIndexKey,
    nameKey,
    hasMeta = true,
    params
  } = props


  // State
  const [selectedIndex, setSelectedIndex] = React.useState(null)
  const [popupActiveEdit, setPopupActiveEdit] = React.useState(false)
  const [popupActiveCreate, setPopupActiveCreate] = React.useState(false)
  const [popupActiveFileStore, setPopupActiveFileStore] = React.useState(false)

  const [name, setName] = React.useState()
  const [content, setContent] = React.useState()
  const [remark, setRemark] = React.useState('')

  const [selectedType, setSelectedType] = React.useState()
  const [selectedFactory, setSelectedFactory] = React.useState()
  const [selectedModule, setSelectedModule] = React.useState('checklist')
  const [moduleItems, setModuleItems] = React.useState([
    { label: t('點檢表'), value: 'checklist' },
    { label: t('點檢作業'), value: 'checklist_assignment' },
    { label: t('點檢紀錄'), value: 'checklist_record' },
  ])
  const [selectedModuleItem, setSelectedModuleItem] = React.useState('checklist')
  const [selectedModel, setSelectedModel] = React.useState()

  // console.log(selectedModule, 'selectedModule 111');
  // console.log(selectedModuleItem, 'selectedModuleItem 222');
  // console.log(selectedModel, 'selectedModel 3333');

  const [step1Visible, setStep1Visible] = React.useState(false)
  const [fetchItems, setFetchItems] = React.useState(value)
  const [step2Visible, setStep2Visible] = React.useState(false)
  const [constantData, setConstantData] = React.useState()

  // MEMO
  const __params = React.useMemo(() => {
    if (!selectedFactory) {
      return
    }
    // 點檢表
    if (selectedModule === 'checklist' && !selectedModel?.id) {
      const _params = {
        order_by: 'created_at',
        order_way: 'desc',
        lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw',
        factory: selectedFactory ? selectedFactory : currentFactory?.id,
      }
      return _params
    } else if (selectedModule === 'checklist' && selectedModuleItem === 'checklist_record' && selectedModel?.id) {
      const _params = {
        order_by: 'record_at',
        order_way: 'desc',
        id: selectedModel?.id,
        factory: selectedFactory ? selectedFactory : currentFactory?.id,
      }
      return _params
    }
    // 證照
    else if (selectedModule === 'license') {
      const _params = {
        order_by: 'valid_end_date',
        order_way: 'asc',
        license_status: selectedModuleItem,
        lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw',
        factory: selectedFactory ? selectedFactory : currentFactory?.id,
      }
      return _params
    }
    // 教育訓練
    else if (selectedModule === 'internal_training') {
      const _params = {
        order_by: 'train_at',
        order_way: 'desc',
        time_field: 'train_at',
        timezone: 'Asia/Taipei',
        lang: 'tw',
        factory: selectedFactory ? selectedFactory : currentFactory?.id,
      }
      return _params
    }
    // 教育訓練群組
    else if (selectedModule === 'internal_training_group') {
      const _params = {
        order_by: 'train_at',
        order_way: 'desc',
        lang: 'tw',
        factory: selectedFactory ? selectedFactory : currentFactory?.id,
      }
      return _params
    }
    // 風險事件
    else if (selectedModule === 'event') {
      const _params = {
        order_by: 'occur_at',
        order_way: 'desc',
        time_field: 'occur_at',
        // search: filterValue && filterValue.search ? filterValue.search : undefined,
        // event_type: filterValue && filterValue.event_type ? filterValue.event_type.join(',') : undefined, // IMPORTANT !!
        lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw',
        factory: selectedFactory ? selectedFactory : currentFactory?.id,
      }
      return _params
    }
    // 承攬商
    else if (selectedModule === 'contractor') {
      const _params = {
        order_by: 'created_at',
        order_way: 'desc',
        contractor_status: 1,
        lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw',
        factory: selectedFactory ? selectedFactory : currentFactory?.id,
      }
      return _params
    }
    // 進場紀錄
    else if (selectedModule === 'contractor_enter' && !selectedModel?.id) {
      const _params = {
        factory: selectedFactory ? selectedFactory : currentFactory?.id,
        target_factory: selectedFactory ? selectedFactory : currentFactory?.id,
        order_by: "enter_start_date",
        order_way: "desc",
        lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw'
      }
      return _params
    }
    // 收工檢查紀錄
    else if (selectedModule === 'contractor_enter' && selectedModuleItem === 'exit_checklist_assignment' && selectedModel?.id) {
      const _params = {
        contractor_enter_record: selectedModel?.id,
        contractor: selectedModel?.contractor?.id ? selectedModel?.contractor?.id : undefined,
        factory: selectedFactory ? selectedFactory : currentFactory?.id,
        target_factory: selectedFactory ? selectedFactory : undefined,
        order_by: 'enter_date',
        order_way: 'desc',
        lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw'
      }
      return _params
    }
    // 檔案庫
    else if (selectedModule === 'file_folder') {
      const _params = {
        factory: selectedFactory ? selectedFactory : undefined,
        lang: 'tw',
        order_by: 'created_at',
        order_way: 'desc',
        file_folder: selectedModel?.id ? selectedModel?.id : undefined
      }
      return _params
    }
    // 任務
    else if (selectedModule === 'task') {
      const _params = {
        order_way: "desc",
        order_by: "created_at",
        time_field: 'created_at',
        done_at:
          selectedModuleItem === 'advance' ? 'null' :
            selectedModuleItem === 'pending' ? 'not_null' :
              selectedModuleItem === 'complete' ? 'not_null' :
                selectedModuleItem === 'all' ? undefined :
                  'null',
        checked_at:
          selectedModuleItem === 'advance' ? 'null' :
            selectedModuleItem === 'pending' ? 'null' :
              selectedModuleItem === 'complete' ? 'not_null' :
                selectedModuleItem === 'all' ? undefined :
                  'null',
        factory: selectedFactory
      }
      return _params
    }
    // 警示
    else if (selectedModule === 'll_alert') {
      const _params = {
        solved_at:
          selectedModuleItem === 'NoneSolve' ? 'null' :
            selectedModuleItem === 'Solved' ? 'not_null' :
              selectedModuleItem === 'All' ? undefined :
                'null',
        order_by: 'created_at',
        order_way: 'desc',
        time_field: 'created_at',
        factory: selectedFactory ? selectedFactory : currentFactory?.id
      }
      return _params
    }
  }, [selectedFactory, selectedModule, selectedModuleItem, selectedModel]);

  // console.log(__params, '-__params-----');

  // filter
  const filterFields = React.useMemo(() => {
    switch (selectedModule) {
      case 'checklist':
        return {
          system_subclasses: {
            type: 'system_subclass',
            label: t('領域')
          },
        }
      case 'license':
        return {
          license_type: {
            type: 'checkbox',
            label: t('類型'),
            storeKey: "licenseType",
          },
          system_subclasses: {
            type: 'system_subclass',
            label: t('領域')
          }
        }
      case 'internal_training':
        return {
          button: {
            type: 'date_range',
            label: t('日期'),
            time_field: 'created_at'
          },
          system_subclasses: {
            type: 'system_subclass',
            label: t('領域')
          }
        }
      case 'internal_training_group':
        return {
          button: {
            type: 'date_range',
            label: t('日期'),
            time_field: 'train_at'
          },
        }
      case 'event':
        return {
          event_type: {
            type: 'checkbox',
            label: t('類型'),
            storeKey: 'eventTypes'
          },
          system_subclasses: {
            type: 'system_subclass',
            label: t('領域')
          },
          button: {
            type: 'date_range',
            label: t('發生日期'),
            time_field: 'occur_at'
          },
        }
      case 'contractor':
        return {
          button: {
            type: 'date_range',
            label: i18next.t('最後進場日期')
          },
          contractor_types: {
            type: 'checkbox',
            label: i18next.t('承攬類別'),
            storeKey: "contractorTypes",
          },
          contractor_customed_types: {
            type: 'checkbox',
            label: i18next.t('自訂類別'),
            storeKey: "contractorCustomTypes",
          },
          system_subclasses: {
            type: 'system_subclass',
            label: i18next.t('領域')
          }
        }

      case 'contractor_enter_record':
        return {
          contractor: {
            type: 'checkbox',
            label: t('承攬商'),
            items: contractor,
            searchVisible: true,
          },
          enter_status: {
            type: 'checkbox',
            label: t('進場狀態'),
            items: [
              {
                id: 'in_progress',
                name: t('進行中'),
              },
              {
                id: 'deferred',
                name: t('展延中'),
              },
              {
                id: 'complete',
                name: t('已完工'),
              },
              {
                id: 'suspend',
                name: t('已停工'),
              }
            ],
          },
          exit_checklist_status: {
            type: 'checkbox',
            label: t('收工檢查狀態'),
            items: [
              {
                id: 'uncheck',
                name: t('收工未檢查'),
              },
              {
                id: 'no_enter',
                name: t('無進場'),
              },
              {
                id: 'return',
                name: t('已復歸'),
              },
              {
                id: 'no_return',
                name: t('未復歸'),
              },
              {
                id: 'complete_return',
                name: t('收工且復歸'),
              }
            ],
          },
          system_subclasses: {
            type: 'system_subclass',
            label: t('領域')
          },
          button: {
            type: 'date_range',
            label: t('預計進場日期'),
            order_way: 'desc',
            order_by: 'enter_start_date',
            time_field: 'enter_start_date'
          },
        }
      case 'task':
        return {
          system_subclasses: {
            type: 'system_subclass',
            label: t('領域')
          },
          button: {
            type: 'date_range',
            label: t('建立日期'),
            time_field: 'created_at'
          },
        }
      case 'll_alert':
        return {
          from: {
            type: 'checkbox',
            label: t('項目'),
            items:
              [
                {
                  id: "event",
                  name: t("事件")
                },
                {
                  id: "audit_record",
                  name: t("稽核")
                },
                {
                  id: "checklist_record",
                  name: t("點檢")
                },
                {
                  id: "license",
                  name: t("證照"),
                },
                {
                  id: "contractor_license",
                  name: t("承攬商"),
                },
                {
                  id: "contractor_enter_record",
                  name: t("進場"),
                },
                {
                  id: "exit_checklist",
                  name: t("收工檢查"),
                },
              ]
          },
          button: {
            type: 'date_range',
            label: i18next.t('發布日期'),
            time_field: 'created_at'
          },
        }
      default:
        return {} // 沒篩選條件
    }
  }, [selectedModule])

  // Function
  const $_onClose = () => {
    setStep1Visible(false)
    setSelectedModule(null)
    setSelectedModuleItem(null)
    setSelectedModel(null)
  }
  // 刪除
  const $_deleteOnPress = (index) => {
    const _value = [...fetchItems]
    _value.splice(index, 1)
    setFetchItems(_value)
    onChange(_value)
  }

  // HELPER
  const transformFactoriesToOptions = (factories, t) => {
    // 展開所有 child_factories，遞迴扁平化
    const flattenFactories = (factories) => {
      let result = [];
      factories.forEach(factory => {
        result.push(factory); // 加入自己
        if (Array.isArray(factory.child_factories) && factory.child_factories.length > 0) {
          // 遞迴展開子工廠
          const children = flattenFactories(factory.child_factories);
          result = result.concat(children);
        }
      });
      return result;
    };
    const flat = flattenFactories(factories);
    return flat.map(factory => ({
      label: factory.name,      // 如果 factory.name 是語系 key，也可以改成 t(factory.name)
      value: factory.id
    }));
  };
  const $_setText = (moduleName) => {
    // console.log(moduleName, 'moduleName--');
    if (moduleName === 'checklist') {
      return t('點檢表')
    }
    else if (moduleName === 'checklist_assignment') {
      return t('點檢作業')
    }
    else if (moduleName === 'checklist_record') {
      return t('點檢記錄')
    }
    else if (moduleName === 'license') {
      return t('證照')
    }
    else if (moduleName === 'internal_training') {
      return t('教育訓練')
    }
    else if (moduleName === 'internal_training_group') {
      return t('教育訓練群組')
    }
    else if (moduleName === 'event') {
      return t('事件')
    }
    else if (moduleName === 'contractor') {
      return t('承攬商')
    }
    else if (moduleName === 'contractor_enter') {
      return t('進場記錄')
    }
    else if (moduleName === 'exit_checklist_assignment') {
      return t('收工檢查記錄')
    }
    else if (moduleName === 'file_folder') {
      return t('文件檔案庫')
    }
    else if (moduleName === 'task') {
      return t('任務')
    }
    else if (moduleName === 'alert') {
      return t('警示')
    }
    else if (moduleName === 'contractor_enter_record') {
      return t('進場記錄')
    }
    else if (moduleName === 'exit_checklist') {
      return t('收工檢查記錄')
    }
    else {
      return moduleName
    }
  }

  // SUBMIT
  const $_onHeaderRightPress = async () => {
    const _data = {
      name: name,
      url: content,
      remark: remark,
      type: 'custom'
    }
    console.log(_data, '_data222');
    setFetchItems([...fetchItems, _data])
    onChange([...fetchItems, _data])
    $_onClose()
  }
  const $_onSubmit = () => {
    console.log('$_onSubmit');
    const _selectedModel = {
      ...selectedModel,
      custom_name: name,
      remark: remark,
    }
    setFetchItems([...fetchItems, _selectedModel])
    onChange([...fetchItems, _selectedModel])
    $_onClose()
  }
  const $_onSubmitEdit = () => {
    if (selectedIndex === null) return
    const updatedItems = [...fetchItems]
    updatedItems[selectedIndex] = {
      ...fetchItems[selectedIndex],
      custom_name: name,
      remark: remark,
    }
    setFetchItems(updatedItems)
    onChange(updatedItems)
    setSelectedModel(null)
    setSelectedIndex(null)
  }


  // INIT
  const $_fetchConstantData = async () => {
    try {
      const _params = {
        model: 'checklist',
        type: 'result'
      }
      const res = await S_ConstantData.index({
        params: _params
      })
      if (res && res.data) {
        setConstantData(res.data)
      }
    } catch (e) {
      console.error(e);
    }
  }

  React.useEffect(() => {
    $_fetchConstantData()
    setStep2Visible(false)
  }, [])

  React.useEffect(() => {
    if (JSON.stringify(fetchItems) !== JSON.stringify(value)) {
      setFetchItems(value ?? []);
    }
  }, [value]);

  // Render
  return (
    <>
      <WsBtnSelect
        onPress={() => {
          setStep1Visible(true)
        }}
        placeholder={placeholder}
        style={{
        }}
        borderWidth={0.3}
        borderRadius={5}
      />

      {fetchItems &&
        fetchItems.length > 0 && (
          fetchItems.map((_item, index) => {
            return (
              <TouchableOpacity
                key={index}
                style={{
                  borderRadius: 10,
                  borderWidth: 1,
                  marginTop: 4,
                  padding: 8,
                  borderColor: $color.gray
                }}
                onPress={() => {
                  setSelectedModel({ ..._item })
                  setName(_item.custom_name || _item.name || '')
                  setRemark(_item.remark || '')
                  setSelectedIndex(index)
                  setPopupActiveEdit(true)
                }}
              >
                <WsFlex
                  justifyContent="space-between"
                >
                  <WsText
                    style={{
                      marginLeft: 8,
                      maxWidth: width * 0.775,
                    }}
                    color={$color.gray}
                  >
                    {`[${_item.from_module ? $_setText(_item.from_module) : t('自訂')}] ${_item.custom_name ? _item.custom_name : _item.name} (${_item.type === 'custom' ? t('外部鏈結') : t('ESGoal連結')})`}
                  </WsText>
                  <WsIconBtn
                    name={'scc-liff-close-circle'}
                    color={$color.gray}
                    onPress={() => {
                      $_deleteOnPress(index)
                    }}
                    padding={0}
                    size={24}
                  />
                </WsFlex>
              </TouchableOpacity>
            )
          })
        )}

      <WsPopup
        active={popupActiveEdit}
        onClose={() => {
          setPopupActiveEdit(false)
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
          <WsState
            style={{
              width: width * 0.8
            }}
            label={t('名稱')}
            value={name}
            onChange={setName}
            rules={'required'}
            placeholder={t('輸入')}
          />
          <WsState
            style={{
              marginTop: 16,
              width: width * 0.8
            }}
            multiline={true}
            label={t('備注')}
            value={remark}
            onChange={setRemark}
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
                setPopupActiveEdit(false)
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
              textSize={12}>
              {t('取消')}
            </WsBtnLeftIconCircle>

            <WsGradientButton
              style={{
                width: width * 0.375
              }}
              onPress={() => {
                $_onSubmitEdit()
                setPopupActiveEdit(false)
              }}>
              <View
                style={{
                  paddingTop: 8,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}>
                <WsText color={$color.white} size={12}>
                  {t('送出')}
                </WsText>
              </View>
            </WsGradientButton>
          </WsFlex>
        </View>
      </WsPopup>

      <WsModal
        childrenScroll={true}
        onBackButtonPress={$_onClose}
        headerLeftOnPress={$_onClose}
        footerDisable={true}
        visible={step1Visible}
        title={title}
        headerRightText={selectedType === 'outsideUrl' ? t('儲存') : undefined}
        headerRightOnPress={() => {
          $_onHeaderRightPress()
          setStep1Visible(false)
        }}
      >
        <View
          style={{
            // borderWidth: 3,
            paddingHorizontal: 16,
            paddingTop: 8,
            // backgroundColor:'pink',
          }}
        >
          <WsPopup
            active={popupActiveCreate}
            onClose={() => {
              setPopupActiveCreate(false)
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
              <WsState
                style={{
                  width: width * 0.8
                }}
                label={t('名稱')}
                value={name}
                onChange={setName}
                rules={'required'}
                placeholder={t('輸入')}
              />
              <WsState
                style={{
                  marginTop: 16,
                  width: width * 0.8
                }}
                multiline={true}
                label={t('備注')}
                value={remark}
                onChange={setRemark}
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
                    setStep2Visible(false)
                    setSelectedModel(null)
                    setPopupActiveCreate(false)
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
                  textSize={12}>
                  {t('取消')}
                </WsBtnLeftIconCircle>

                <WsGradientButton
                  style={{
                    width: width * 0.375
                  }}
                  onPress={() => {
                    $_onSubmit()
                    setPopupActiveCreate(false)
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                    <WsText color={$color.white} size={12}>
                      {t('送出')}
                    </WsText>
                  </View>
                </WsGradientButton>
              </WsFlex>
            </View>
          </WsPopup>

          <WsState
            style={{
            }}
            type="radio"
            items={[
              { label: t('ESGoal連結'), value: 'insideModule' },
              { label: t('自訂'), value: 'outsideUrl' }
            ]}
            value={selectedType}
            onChange={setSelectedType}
          >
          </WsState>

          {selectedType === 'insideModule' && (
            <>
              <WsState
                type="picker"
                placeholder={t('關聯單位')}
                items={transformFactoriesToOptions(currentUser?.factories, t)}
                value={selectedFactory}
                onChange={(e) => {
                  setSelectedFactory(e)
                }}
              />

              {selectedFactory && (
                <WsState
                  type="picker"
                  placeholder={t('關聯模組')}
                  items={
                    [
                      { label: t('點檢'), value: 'checklist' },
                      { label: t('證照'), value: 'license' },
                      { label: t('教育訓練'), value: 'internal_training' },
                      { label: t('教育訓練群組'), value: 'internal_training_group' },
                      { label: t('風險事件'), value: 'event' },
                      { label: t('承攬商'), value: 'contractor' },
                      { label: t('進場管理'), value: 'contractor_enter' },
                      // { label: t('文件檔案庫'), value: 'file_folder' }, // 250704-issue
                      { label: t('任務'), value: 'task' },
                      { label: t('警示'), value: 'll_alert' },
                    ]
                  }
                  style={{
                    marginTop: 16
                  }}
                  value={selectedModule}
                  onChange={(e) => {
                    setRemark('')
                    let _moduleItems = {}
                    setSelectedModuleItem(null)
                    if (e === 'checklist') {
                      _moduleItems = [
                        { label: t('點檢表'), value: 'checklist' },
                        { label: t('點檢作業'), value: 'checklist_assignment' },
                        { label: t('點檢紀錄'), value: 'checklist_record' },
                      ]
                      setSelectedModuleItem('checklist')
                      setModuleItems(_moduleItems)
                      setSelectedModule(e)
                      setSelectedModel(null)
                    } else if (e === 'license') {
                      _moduleItems = [
                        { label: t('逾期'), value: 'status_number0' },
                        { label: t('辦理中'), value: 'status_number1' },
                        { label: t('使用中'), value: 'status_number2' },
                        { label: t('已停用'), value: 'status_number3' },
                        { label: t('全部'), value: 'null' },
                      ]
                      setSelectedModuleItem('status_number0')
                      setSelectedModule(e)
                      setModuleItems(_moduleItems)
                    } else if (e === 'internal_training') {
                      setModuleItems(null)
                      setSelectedModule(e)
                    } else if (e === 'internal_training_group') {
                      setModuleItems(null)
                      setSelectedModule(e)
                    } else if (e === 'event') {
                      setModuleItems(null)
                      setSelectedModule(e)
                    } else if (e === 'contractor') {
                      setModuleItems(null)
                      setSelectedModule(e)
                    } else if (e === 'contractor_enter') {
                      _moduleItems = [
                        { label: t('進場記錄'), value: 'contractor_enter_record' },
                        { label: t('收工檢查記錄'), value: 'exit_checklist_assignment' },
                      ]
                      setSelectedModuleItem('contractor_enter_record')
                      setModuleItems(_moduleItems)
                      setSelectedModule(e)
                      setSelectedModel(null)
                    }
                    else if (e === 'file_folder') {
                      _moduleItems = [
                        { label: t('本單位'), value: 'indexWithFile' },
                        { label: t('分享至其他單位'), value: 'indexToShare' },
                        { label: t('其他單位的分享'), value: 'indexFromShare' },
                        { label: t('系統資料夾'), value: 'indexSystem' },
                      ]
                      setSelectedModuleItem('indexWithFile')
                      setModuleItems(_moduleItems)
                      setSelectedModule(e)
                    }
                    else if (e === 'task') {
                      _moduleItems = [
                        { label: t('進行中'), value: 'advance' },
                        { label: t('待審核'), value: 'pending' },
                        { label: t('已完成'), value: 'complete' },
                        { label: t('全部'), value: 'all' },
                      ]
                      setSelectedModuleItem('advance')
                      setModuleItems(_moduleItems)
                      setSelectedModule(e)
                    } else if (e === 'll_alert') {
                      _moduleItems = [
                        { label: t('未排除'), value: 'NoneSolve' },
                        { label: t('已排除'), value: 'Solved' },
                        { label: t('全部'), value: 'All' },
                      ]
                      setSelectedModuleItem('NoneSolve')
                      setModuleItems(_moduleItems)
                      setSelectedModule(e)
                    }
                    else {
                      setSelectedModule(e)
                      setModuleItems(null)
                    }
                  }}
                />
              )}

              {moduleItems && selectedFactory && (
                <WsState
                  type="picker"
                  placeholder={t('關聯模組項目')}
                  items={moduleItems}
                  style={{
                    marginTop: 16
                  }}
                  value={selectedModuleItem}
                  onChange={(e) => {
                    setStep2Visible(false)
                    setSelectedModuleItem(e)
                    setSelectedModel(null)
                  }}
                />
              )}

              {selectedModule &&
                __params && (
                  <WsPageIndex
                    mode={'pagination'}
                    hasMeta={hasMeta}
                    modelName={
                      (selectedModuleItem === 'contractor_enter_record' || (selectedModuleItem === 'exit_checklist_assignment' && !selectedModel?.id)) ? 'contractor_enter_record' :
                        (selectedModuleItem === 'exit_checklist_assignment' && selectedModel?.id) ? 'exit_checklist_assignment' :
                          (selectedModuleItem === 'checklist_record' && selectedModel?.id) ? selectedModuleItem :
                            selectedModule
                    }
                    serviceIndexKey={
                      (selectedModuleItem === 'checklist_record' && selectedModel?.id) ? 'index' :
                        selectedModuleItem === 'contractor_enter_record' ? 'indexV2' :
                          selectedModule === 'file_folder' && selectedModuleItem ? selectedModuleItem :
                            serviceIndexKey
                    }
                    params={__params}
                    searchVisible={selectedModule === 'll_alert' ? false : true}
                    filterVisible={false}
                    filterFields={filterFields}
                    renderItem={({ item, index }) => {
                      return (
                        <>
                          <View
                            style={{
                            }}
                          >
                            {selectedModule === 'checklist' && !step2Visible && (
                              <LlCheckListCard001
                                key={item.id}
                                item={item}
                                bookmarkBtnVisible={false}
                                style={[
                                  {
                                    marginTop: 8,
                                  }
                                ]}
                                name={item.name}
                                id={item.id}
                                is_collect={item.is_collect}
                                tagIcon={item.tagIcon}
                                tagText={item.tagText}
                                taker={
                                  item.owner
                                    ? item.owner
                                    : item.taker
                                      ? item.taker
                                      : t('無')
                                }
                                system_subclasses={item.system_subclasses}
                                factory_tags={item.factory_tags}
                                onPress={async () => {
                                  // 點檢記錄
                                  if (selectedModuleItem === 'checklist_record') {
                                    setSelectedModel(item)
                                    setStep2Visible(true)
                                  }
                                  // 點檢作業
                                  else if (selectedModuleItem === 'checklist_assignment') {
                                    const _params = {
                                      module: 'checklist',
                                      value: 'checklist-assignment-temporary'
                                    }
                                    const _res = await S_ModulePage.index({ params: _params })
                                    const _url_pattern = _res.data[0].pattern

                                    const _data = {
                                      ...item,
                                      type: 'domain',
                                      factory: selectedFactory,
                                      from_module: selectedModuleItem ? selectedModuleItem : selectedModule,
                                      url_pattern: _url_pattern,
                                      url_factory_id: selectedFactory,
                                      from_module_id: item?.id
                                    }
                                    setSelectedModel(_data)
                                    setName(item.name)
                                    setStep2Visible(false)
                                    setPopupActiveCreate(true)
                                  }
                                  // 點檢表
                                  else {
                                    const _params = {
                                      module: 'checklist',
                                      value: 'checklist-content'
                                    }
                                    const _res = await S_ModulePage.index({ params: _params })
                                    const _url_pattern = _res.data[0].pattern
                                    const _data = {
                                      ...item,
                                      type: 'domain',
                                      factory: selectedFactory,
                                      from_module: selectedModuleItem ? selectedModuleItem : selectedModule,
                                      url_pattern: _url_pattern,
                                      url_factory_id: selectedFactory,
                                      from_module_id: item?.id
                                    }
                                    console.log(_data, '_data');
                                    setSelectedModel(_data)
                                    setName(item.name)
                                    setStep2Visible(false)
                                    setPopupActiveCreate(true)
                                  }
                                }}
                              />
                            )}
                            {selectedModule === 'checklist' &&
                              (selectedModuleItem === 'checklist_record' && selectedModel?.id) && (
                                <>
                                  <LlCheckListResultCard
                                    key={item.id}
                                    style={{
                                      borderWidth: 0.5,
                                      marginHorizontal: 0,
                                      // borderWidth: 5
                                    }}
                                    constantData={constantData}
                                    item={item}
                                    id={item.id}
                                    risk={item.risk_level}
                                    status={item.status}
                                    title={item.name}
                                    passRate={item.pass_rate}
                                    date={moment(item.record_at).format('YYYY-MM-DD')}
                                    review={item.reviewer ? item.reviewer.name : i18next.t('無')}
                                    onPress={async () => {
                                      const _params = {
                                        module: 'checklist',
                                        value: 'checklist-result-view'
                                      }
                                      const _res = await S_ModulePage.index({ params: _params })
                                      const _url_pattern = _res.data[0].pattern
                                      const _data = {
                                        ...item,
                                        type: 'domain',
                                        factory: selectedFactory,
                                        from_module: selectedModuleItem ? selectedModuleItem : selectedModule,
                                        url_pattern: _url_pattern,
                                        url_factory_id: selectedFactory,
                                        from_module_id: item?.id
                                      }
                                      setSelectedModel(_data)
                                      setName(item.name)
                                      setPopupActiveCreate(true)
                                    }}
                                  />
                                </>
                              )}
                            {selectedModule === 'license' && (
                              <LlLicenseCard001
                                item={item}
                                onPress={async () => {
                                  const _params = {
                                    module: 'license',
                                    value: 'license-content-main'
                                  }
                                  const _res = await S_ModulePage.index({ params: _params })
                                  const _url_pattern = _res.data[0].pattern
                                  const _data = {
                                    ...item,
                                    type: 'domain',
                                    factory: selectedFactory,
                                    from_module: selectedModule,
                                    url_pattern: _url_pattern,
                                    url_factory_id: selectedFactory,
                                    from_module_id: item?.id
                                  }
                                  setSelectedModel(_data)
                                  setName(item.name)
                                  setPopupActiveCreate(true)
                                }}
                                style={{
                                  marginTop: 8
                                }}
                              />
                            )}
                            {selectedModule === 'internal_training' && (
                              <LlTrainingCard001
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
                                onPress={async () => {
                                  const _params = {
                                    module: 'internal_training',
                                    value: 'internal-training-content'
                                  }
                                  const _res = await S_ModulePage.index({ params: _params })
                                  const _url_pattern = _res.data[0].pattern
                                  const _data = {
                                    ...item,
                                    type: 'domain',
                                    factory: selectedFactory,
                                    from_module: selectedModule,
                                    url_pattern: _url_pattern,
                                    url_factory_id: selectedFactory,
                                    from_module_id: item?.id
                                  }
                                  setSelectedModel(_data)
                                  setName(item.name)
                                  setPopupActiveCreate(true)
                                }}
                              />
                            )}
                            {selectedModule === 'internal_training_group' && (
                              <LlTrainingGroupCard001
                                item={item}
                                onPress={async () => {
                                  const _params = {
                                    module: 'internal_training',
                                    value: 'internal-training-group-content'
                                  }
                                  const _res = await S_ModulePage.index({ params: _params })
                                  const _url_pattern = _res.data[0].pattern
                                  const _data = {
                                    ...item,
                                    type: 'domain',
                                    factory: selectedFactory,
                                    from_module: selectedModule,
                                    url_pattern: _url_pattern,
                                    url_factory_id: selectedFactory,
                                    from_module_id: item?.id
                                  }
                                  setSelectedModel(_data)
                                  setName(item.name)
                                  setPopupActiveCreate(true)
                                }}
                              />
                            )}
                            {selectedModule === 'event' && (
                              <LlEventCard001
                                key={index}
                                event={item}
                                style={{
                                  marginTop: 8
                                }}
                                onPress={async () => {
                                  const _params = {
                                    module: 'event',
                                    value: 'event-content'
                                  }
                                  const _res = await S_ModulePage.index({ params: _params })
                                  const _url_pattern = _res.data[0].pattern

                                  const _data = {
                                    ...item,
                                    type: 'domain',
                                    factory: selectedFactory,
                                    from_module: selectedModule,
                                    url_pattern: _url_pattern,
                                    url_factory_id: selectedFactory,
                                    from_module_id: item?.id
                                  }
                                  setSelectedModel(_data)
                                  setName(item.name)
                                  setPopupActiveCreate(true)
                                }}
                              />
                            )}
                            {selectedModule === 'contractor' && (
                              <LlContractorsCard001
                                key={index}
                                item={item}
                                style={[
                                  index != 0
                                    ? {
                                      marginTop: 8,
                                    }
                                    : {
                                      marginTop: 8,
                                    }
                                ]}
                                onPress={async () => {
                                  const _params = {
                                    module: 'contractor',
                                    value: 'contractor-content'
                                  }
                                  const _res = await S_ModulePage.index({ params: _params })
                                  const _url_pattern = _res.data[0].pattern

                                  const _data = {
                                    ...item,
                                    type: 'domain',
                                    factory: selectedFactory,
                                    from_module: selectedModule,
                                    url_pattern: _url_pattern,
                                    url_factory_id: selectedFactory,
                                    from_module_id: item?.id
                                  }
                                  setSelectedModel(_data)
                                  setName(item.name)
                                  setPopupActiveCreate(true)
                                }}
                              />
                            )}
                            {selectedModule === 'contractor_enter' &&
                              selectedModuleItem === 'contractor_enter_record' && (
                                <LlContractorEnterCard001
                                  item={item}
                                  style={[
                                    index != 0
                                      ? {
                                        marginTop: 8
                                      }
                                      : {
                                        marginTop: 8
                                      },
                                  ]}
                                  onPress={async () => {
                                    const _params = {
                                      module: 'contractor',
                                      value: 'contractor-operation-content'
                                    }
                                    const _res = await S_ModulePage.index({ params: _params })
                                    const _url_pattern = _res.data[0].pattern

                                    const _data = {
                                      ...item,
                                      type: 'domain',
                                      factory: selectedFactory,
                                      from_module: selectedModule,
                                      url_pattern: _url_pattern,
                                      url_factory_id: selectedFactory,
                                      from_module_id: item?.id
                                    }
                                    setSelectedModel(_data)
                                    setName(item.task_content)
                                    setPopupActiveCreate(true)
                                  }}
                                />
                              )}
                            {selectedModule === 'contractor_enter' &&
                              selectedModuleItem === 'exit_checklist_assignment' &&
                              (item.exit_checklists || item.exit_checklist) && 
                              (
                                <LlExitChecklistCard001
                                  key={index}
                                  item={item}
                                  btnColor={
                                    [$color.primary, $color.primary11l]
                                  }
                                  textColor={
                                    $color.white
                                  }
                                  borderColor={
                                    $color.primary
                                  }
                                  style={{
                                    marginTop: 8,
                                    // borderWidth: 5,
                                  }}
                                  onPress={async () => {
                                    if (!selectedModel) {
                                      console.log(item, 'itemQAQ111');
                                      setSelectedModel(item)
                                      setStep2Visible(false)
                                    } else {
                                      console.log(item, 'itemQAQ');
                                      const _params = {
                                        module: 'contractor',
                                        value: 'contractor-operation-result-view'
                                      }
                                      const _res = await S_ModulePage.index({ params: _params })
                                      const _url_pattern = _res.data[0].pattern

                                      const _data = {
                                        ...item,
                                        type: 'domain',
                                        factory: selectedFactory,
                                        from_module: selectedModuleItem,
                                        id: item?.exit_checklist?.id,
                                        url_pattern: _url_pattern,
                                        url_factory_id: selectedFactory,
                                        from_module_id: item?.exit_checklist?.id,
                                      }
                                      setSelectedModel(_data)
                                      setName(item.task_content)
                                      setPopupActiveCreate(true)
                                    }
                                  }}
                                />
                              )}
                            {selectedModule === 'file_folder' &&
                              !step2Visible && (
                                <>
                                  <WsPopup
                                    active={popupActiveFileStore}
                                    onClose={() => {
                                      setPopupActiveFileStore(false)
                                    }}>
                                    <View
                                      style={{
                                        width: width * 0.9,
                                        height: height * 0.2,
                                        backgroundColor: $color.white,
                                        borderRadius: 10,
                                        padding: 16,
                                      }}>
                                      <WsText
                                        size={18}
                                        color={$color.black}
                                        style={{
                                          flex: 1,
                                        }}
                                      >{t('選擇此資料夾或進入資料夾')}
                                      </WsText>
                                      <WsFlex
                                        flexWrap={'wrap'}
                                        justifyContent={'flex-end'}
                                        alignItems="flex-end"
                                        style={{
                                        }}
                                      >
                                        <TouchableOpacity
                                          style={{
                                            paddingVertical: 9,
                                            borderColor: $color.gray,
                                            borderRadius: 25,
                                            borderWidth: 1,
                                            alignItems: 'center',
                                            width: 110,
                                            height: 48
                                          }}
                                          onPress={async () => {
                                            const _params = {
                                              module: 'file',
                                              value: 'fileIndex'
                                            }
                                            const _res = await S_ModulePage.index({ params: _params })
                                            const _url_pattern = _res.data[0].pattern

                                            const _data = {
                                              ...item,
                                              type: 'domain',
                                              factory: selectedFactory,
                                              from_module: selectedModule,
                                              url_pattern: _url_pattern,
                                              url_factory_id: selectedFactory,
                                              from_module_id: item?.id,
                                            }
                                            setSelectedModel(_data)
                                            setName(item.name)
                                            setPopupActiveFileStore(false)
                                            setPopupActiveCreate(true)
                                            setStep2Visible(true)
                                          }}>
                                          <WsText
                                            style={{
                                            }}
                                            size={14}
                                            color={$color.gray}
                                          >{t('選擇')}
                                          </WsText>
                                        </TouchableOpacity>
                                        <WsGradientButton
                                          style={{
                                            width: 110
                                          }}
                                          onPress={async () => {
                                            const _params = {
                                              module: 'file',
                                              value: 'fileIndex'
                                            }
                                            const _res = await S_ModulePage.index({ params: _params })
                                            const _url_pattern = _res.data[0].pattern

                                            const _data = {
                                              ...item,
                                              type: 'domain',
                                              factory: selectedFactory,
                                              from_module: selectedModule,
                                              url_pattern: _url_pattern,
                                              url_factory_id: selectedFactory,
                                              from_module_id: item?.exit_checklist?.id,
                                            }
                                            setSelectedModel(_data)
                                            setName(item.name)
                                            setPopupActiveFileStore(false)
                                          }}>
                                          {t('進入')}
                                        </WsGradientButton>
                                      </WsFlex>
                                    </View>
                                  </WsPopup>
                                  <LlFileFolderCard
                                    item={item}
                                    tab={
                                      selectedModuleItem === 'indexWithFile' ? 'tab1' :
                                        selectedModuleItem === 'indexToShare' ? 'tab2' :
                                          selectedModuleItem === 'indexFromShare' ? 'tab3' :
                                            selectedModuleItem === 'indexSystem' ? 'tab4' :
                                              'tab1'}
                                    fileFolderId={selectedModel?.id ? selectedModel?.id : undefined}
                                    style={{
                                      paddingHorizontal: 0
                                    }}
                                    moreBtnVisible={false}
                                    onPress={async () => {
                                      if (item?.type === 'file_folder') {
                                        setPopupActiveFileStore(true)
                                      } else {
                                        const _params = {
                                          module: 'file',
                                          value: 'fileContent'
                                        }
                                        const _res = await S_ModulePage.index({ params: _params })
                                        const _url_pattern = _res.data[0].pattern

                                        const _data = {
                                          ...item,
                                          type: 'domain',
                                          factory: selectedFactory,
                                          from_module: selectedModule,
                                          url_pattern: _url_pattern,
                                          url_factory_id: selectedFactory,
                                          from_module_id: item?.id,
                                        }
                                        setSelectedModel(_data)
                                        setName(item.name)
                                        setPopupActiveCreate(true)
                                      }
                                    }}
                                  ></LlFileFolderCard>
                                </>
                              )}
                            {selectedModule === 'task' && (
                              <LlTaskCard001
                                item={item}
                                style={{
                                  marginHorizontal: 0
                                }}
                                onPress={async () => {
                                  const _params = {
                                    module: 'task',
                                    value: 'task-content'
                                  }
                                  const _res = await S_ModulePage.index({ params: _params })
                                  const _url_pattern = _res.data[0].pattern

                                  const _data = {
                                    ...item,
                                    type: 'domain',
                                    factory: selectedFactory,
                                    from_module: selectedModule,
                                    url_pattern: _url_pattern,
                                    url_factory_id: selectedFactory,
                                    from_module_id: item?.id,
                                  }
                                  setSelectedModel(_data)
                                  setName(item.name)
                                  setStep2Visible(false)
                                  setPopupActiveCreate(true)
                                }}
                              />
                            )}
                            {selectedModule === 'll_alert' && (
                              <LlAlertCard001
                                key={item.id}
                                style={[
                                  {
                                    marginTop: 8,
                                    borderWidth: 0.5,
                                    borderRadius: 10,
                                  }
                                ]}
                                alert={item}
                                onPress={async () => {
                                  const _params = {
                                    module: 'alert',
                                    value: 'alert-content'
                                  }
                                  const _res = await S_ModulePage.index({ params: _params })
                                  const _url_pattern = _res.data[0].pattern

                                  const _data = {
                                    ...item,
                                    type: 'domain',
                                    factory: selectedFactory ? selectedFactory : currentFactory?.id,
                                    from_module: 'alert',
                                    url_pattern: _url_pattern,
                                    url_factory_id: selectedFactory,
                                    from_module_id: item?.id,
                                  }
                                  setSelectedModel(_data)
                                  const _alert = S_Alert.setAlertContent(item)
                                  setName(_alert?.title ? _alert.title : item.payload?.name)
                                  setStep2Visible(false)
                                  setPopupActiveCreate(true)
                                }}
                              />
                            )}
                          </View>
                        </>
                      )
                    }}
                    ListHeaderComponent={() => {
                      return (
                        <>
                          {/* {selectedModule === 'file_folder' &&
                            selectedModel && (
                              <WsGradientButton
                                style={{
                                  width: 110
                                }}
                                onPress={() => {
                                  setSelectedModel(null)
                                }}>
                                {t('返回上層')}
                              </WsGradientButton>
                            )} */}
                          {selectedModel &&
                            selectedModule &&
                            !step2Visible && (
                              <WsGradientButton
                                style={{
                                  width: 110
                                }}
                                onPress={() => {
                                  setSelectedModel(null)
                                }}>
                                {t('返回')}
                              </WsGradientButton>
                            )}
                        </>
                      )
                    }}
                  >
                  </WsPageIndex>
                )}

            </>
          )}

          {selectedType === 'outsideUrl' && (
            <>
              <WsState
                style={{
                  marginTop: 8,
                }}
                value={name}
                onChange={setName}
                placeholder={t('名稱')}
              />

              <WsState
                style={{
                  marginTop: 8,
                }}
                multiline={true}
                value={content}
                onChange={setContent}
                placeholder={t('輸入URL')}
              />

              <WsState
                placeholder={t('備註')}
                labelIcon={'ws-outline-edit-pencil'}
                multiline={true}
                style={{
                  marginTop: 16
                }}
                value={remark}
                onChange={setRemark}
              />
            </>
          )}

        </View>
      </WsModal >

    </>
  )
}

export default LlRelatedModuleModalPicker
