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
  // LlRelatedActModalPickerStep2,
  LlRelatedGuidelineModalPickerStep2,
  WsIconBtn,
  WsPageIndex,
  LlGuidelineCard001
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

const LlRelatedGuidelineModalPicker = props => {
  const { windowWidth, windowHeight } = layouts
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // REDUX
  const factory = useSelector(state => state.data.currentFactory)

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
  const [searchValue, setSearchValue] = React.useState()
  const [guidelineModalVisible, setGuidelineModalVisible] = React.useState(false)
  const [fetchItems, setFetchItems] = React.useState(value)
  const [text, setText] = React.useState()
  const [step2ModalVisible, setStep2ModalVisible] = React.useState(false)
  const [step2Value, setStep2Value] = React.useState()
  const [selectedGuideline, setSelectedGuideline] = React.useState()
  const [fields, setFields] = React.useState()

  // filter
  const [filterFields] = React.useState({
    button: {
      type: 'date_range',
      label: t('修正發布日'),
      time_field: 'announce_at'
    },
    guideline_status: {
      label: t('施行狀態'),
      type: 'belongstomany',
      modelName: 'guideline_status',
      nameKey: 'name',
      serviceIndexKey: 'index',
      hasMeta: false,
      translate: false,
      params: {
        order_by: 'sequence',
        order_way: 'asc',
        get_all: '1'
      }
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

  // MEMO
  const __params = React.useMemo(() => {
    const _params = {
      ...params,
      search: searchValue ? searchValue : undefined
    }
    if (searchValue && searchValue.trim() === '') {
      delete _params.search
    }
    if (!searchValue) {
      delete _params.search
    }
    return _params
  }, [searchValue]);

  // 取得內規版本service
  const $_fetchGuidelineVersion = async (event, value) => {
    // console.log(value,'$_fetchGuidelineVersion');
    try {
      const _guidelineVersion = await S_GuidelineVersion.show({ modelId: event.id })
      const _data = {
        ...value,
        guideline_id: value.id,
        guideline_version: event,
        ..._guidelineVersion,
        related_guidelines: value.related_guidelines
      }
      return _data
    } catch (e) {
      console.log(e.message, 'error')
    }
  }

  // Function
  const $_onClose = () => {
    setGuidelineModalVisible(false)
  }
  // 刪除
  const $_deleteOnPress = (index) => {
    const _value = [...fetchItems]
    _value.splice(index, 1)
    setFetchItems(_value)
    onChange(_value)
  }
  // Fields
  const $_setFields = () => {
    if (selectedGuideline) {
      const _fields = {
        name: {
          label: t('內規名稱'),
          rules: 'required',
          editable: false
        },
        bind_version: {
          label: t('關聯版本設定'),
          type: 'radio',
          items: [
            { label: t('最新版本 (將來此檔案有版本更新時，自動關聯至最新版本)'), value: 'last_ver' },
            { label: t('特定版本'), value: 'specific_ver' },
          ],
          rules: 'required',
          updateValueOnChange: (event, value, field, fields) => {
            if (event === 'last_ver') {
              fields.related_guidelines.params = {
                guideline_version_id: selectedGuideline?.last_version?.id
              }
              const _data = {
                guideline_id: value.id,
                bind_version: event,
                related_guidelines: []
              }
              return _data
            } else if (event === 'specific_ver') {
              fields.related_guidelines.params = {
                guideline_version_id: value?.guideline_version?.id
              }
              const _data = {
                bind_version: event,
                related_guidelines: []
              }
              return _data
            }
          },
        },
        guideline_version: {
          type: 'belongsto',
          label: t('選擇版本'),
          nameKey: 'announce_at',
          formatNameKey: 'YYYY-MM-DD',
          modelName: 'guideline_version',
          serviceIndexKey: 'indexAnnounce',
          hasMeta: false,
          preText: 'Ver. ',
          rules: 'required',
          params: {
            guideline_id: selectedGuideline.id
          },
          updateValueOnChange: (event, value, field, fields) => {
            if (event) {
              fields.related_guidelines.params = {
                guideline_version_id: event?.id
              }
              if (event.id !== value?.last_version?.id) {
                $_fetchGuidelineVersion(event, value)
                  .then(result => {
                    const _data = {
                      ...value,
                      ...result,
                      guideline_version: event,
                      guideline_id: selectedGuideline.id,
                    }
                    setStep2Value({
                      ..._data,
                      related_guidelines: value.related_guidelines
                    })
                    return _data
                  })
                  .catch(error => {
                    console.error(error);
                  });
              } else {
                $_fetchGuidelineVersion(event, value)
                  .then(result => {
                    const _data = {
                      ...value,
                      ...result,
                      guideline_version: event,
                      guideline_id: selectedGuideline.id,
                    }
                    setStep2Value({
                      ..._data,
                      related_guidelines: value.related_guidelines,
                    })
                    return _data
                  })
                  .catch(error => {
                    console.error(error);
                  });
              }
            }
          },
          displayCheck(fieldsValue) {
            if (
              fieldsValue?.bind_version === 'specific_ver'
            ) {
              return true
            } else {
              return false
            }
          }
        },
        bind_type: {
          label: t('綁定種類'),
          type: 'radio',
          items: [
            { label: t('綁定整部內規'), value: 'whole_guideline' },
            { label: t('綁定層級或條文'), value: 'specific_layer_or_article' },
          ],
          rules: 'required',
          updateValueOnChange: (event, value, field, fields) => {
            if (event === 'specific_layer_or_article' && value?.guideline_version) {
              fields.related_guidelines.params = {
                guideline_version_id: value?.guideline_version?.id
              }
            } else {
              fields.related_guidelines.params = {
                guideline_version_id: selectedGuideline?.last_version?.id
              }
            }
          }
        },
        related_guidelines: {
          type: 'Ll_belongstomany004',
          label: t('層級及條文'),
          modelName: 'guideline_article_version',
          serviceIndexKey: 'indexByGuidelineVersion',
          searchBarVisible: true,
          hasMeta: true,
          params: {
            lang: 'tw',
          },
          updateValueOnChange: (event, value, field, fields) => {
            if (event) {
              return event.forEach(item => {
                item.bind_type = value.bind_type
                item.bind_version = value.bind_version
                item.guideline_id = value.guideline_id
              });
            }
          },
          displayCheck(fieldsValue) {
            if (
              fieldsValue.bind_type == 'specific_layer_or_article'
            ) {
              return true
            } else {
              return false
            }
          },
        },
        guideline_id: {
          displayCheck(fieldsValue) {
            return false
          },
        }
      }
      setFields(_fields)
    }
  }

  // helper
  const $_checkVersion = (item) => {
    if (item?.bind_version === 'last_ver') {
      return `(${t('Latest')})`
    }
    else {
      return `(${moment(item.announce_at).format('YYYY-MM-DD')})`
    }
  }

  React.useEffect(() => {
    if (selectedGuideline) {
      $_setFields()
    }
  }, [selectedGuideline])

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
          setGuidelineModalVisible(true)
        }}
        placeholder={placeholder}
        text={text}
        style={{
        }}
        borderWidth={0.3}
        borderRadius={5}
      />

      {fetchItems &&
        fetchItems.length > 0 && (
          fetchItems.map((_item, index) => {
            return (
              <View
                style={{
                  borderRadius: 10,
                  borderWidth: 1,
                  marginTop: 4,
                  padding: 8,
                  borderColor: $color.gray
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
                    {`${_item.name} ${$_checkVersion(_item)}`}
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
              </View>
            )
          })
        )}

      <WsModal
        childrenScroll={true}
        onBackButtonPress={$_onClose}
        headerLeftOnPress={$_onClose}
        footerDisable={true}
        visible={guidelineModalVisible}
        title={title}
        style={[
          Platform.OS === 'ios'
            ? {
              marginTop: 40
            }
            : null
        ]}>
        <WsState
          type="search"
          stateStyle={{
            marginTop: 16,
            marginHorizontal: 16,
            height: Platform.OS == 'ios' ? 40 : 40,
            borderRadius: 10,
            backgroundColor: $color.white
          }}
          placeholder={t('搜尋')}
          value={searchValue}
          onChange={setSearchValue}
        />

        <View
          style={{
            height: height * 0.75, // affect inside filter
            // borderWidth: 3,
          }}
        >
          <WsPageIndex
            hasMeta={hasMeta}
            modelName={modelName}
            serviceIndexKey={serviceIndexKey}
            params={__params}
            filterVisible={true}
            filterFields={filterFields}
            renderItem={({ item, index }) => {
              return (
                <>
                  <LlGuidelineCard001
                    key={item.id}
                    item={item}
                    tags={item.factory_tags}
                    title={item.last_version ? item.last_version.name : null}
                    is_collect_visible={true}
                    announce_at_visible={true}
                    effect_at_visible={false}
                    is_collect_visible={false}
                    style={{
                      marginTop: 8,
                      marginHorizontal: 16
                    }}
                    act_status={item.guideline_status}
                    isChange={
                      item && item.updated_at ?
                        S_Act.getActUpdateDateBadge(item.updated_at) : null
                    }
                    onPress={() => {
                      setSelectedGuideline(item)
                      setStep2Value(item)
                      setGuidelineModalVisible(false)
                      setStep2ModalVisible(true)
                      store.dispatch(setCurrentSelectedGuidelineId(item.id))
                    }}
                  />
                </>
              )
            }}
          >
          </WsPageIndex>
        </View>

      </WsModal>

      <LlRelatedGuidelineModalPickerStep2
        step2ModalVisible={step2ModalVisible}
        setStep2ModalVisible={setStep2ModalVisible}
        setGuidelineModalVisible={setGuidelineModalVisible}
        onClose={() => {
          setStep2ModalVisible(false)
        }}
        fields={fields}
        value={step2Value}
        onChange={onChange}
        fetchItems={fetchItems}
        setFetchItems={setFetchItems}
      >
      </LlRelatedGuidelineModalPickerStep2>
    </>
  )
}

export default LlRelatedGuidelineModalPicker
