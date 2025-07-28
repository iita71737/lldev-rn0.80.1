import React from 'react'
import {
  Platform,
  TouchableOpacity,
  View,
  Dimensions,
  FlatList,
  Alert
} from 'react-native'
import {
  WsBtnSelect,
  WsModal,
  WsFlex,
  WsText,
  WsNavCheck,
  WsInfiniteScroll,
  WsState,
  WsFilter002,
  WsIconBtn,
  WsIcon,
  WsGradientButton,
  WsPopup,
  WsBtnLeftIconCircle
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import Services from '@/services/api/v1/index'
import { useTranslation } from 'react-i18next'
import layouts from '@/__reactnative_stone/global/layout'
import moment from 'moment'
import S_Processor from '@/services/app/processor'
import store from '@/store'
import {
  setFactoryTags
} from '@/store/data'
import { useSelector } from 'react-redux'
import S_FactoryTag from '@/services/api/v1/factory_tag'

const LlStateRelatedTags = props => {
  const { windowWidth, windowHeight } = layouts
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    value = [],
    onChange = () => { },
    isError,
    placeholder = `${t('選擇')}`,
    placeholderIcon,
    selectAllVisible = true,
    cancelAllVisible = true,
    searchBarVisible = false,
    btnLeftHidden,
    title = t('選擇'),
    modelName,
    serviceIndexKey,
    nameKey,
    nameKey2,
    hasMeta = true,
    defaultValue = [],
    params = {},
    testID,
    formatNameKey2 = 'YYYY-MM-DD',
    filterVisible = false,
    _filterFields,
  } = props

  // Redux
  const collectIds = useSelector(state => state.data.collectIds)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentFactoryTags = useSelector(state => state.data.factoryTags)

  // State
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

  const [filterModalVisible, setFilterModalVisible] = React.useState(false)
  const [filterFields] = React.useState(_filterFields ? _filterFields : {})
  const [filtersValue, setFiltersValue] = React.useState({})

  const [modalVisible, setModalVisible] = React.useState(false)
  const [fetchItems, setFetchItems] = React.useState([])
  const [text, setText] = React.useState()
  const [search, setSearch] = React.useState()

  // MEMO
  const __params = React.useMemo(() => {
    let _params = {
      ...params,
    }
    if (filtersValue) {
      const _filtersValue = S_Processor.getFormattedFiltersValue(
        filterFields,
        filtersValue
      )
      _params = {
        ..._filtersValue,
      }
    }
    return _params
  }, [filtersValue]);

  // Function
  const $_onFilterSubmit = $event => {
    if (search) {
      setSearch($event.search)
    }
    setFiltersValue($event)
    setFilterModalVisible(false)
  }

  const $_setText = () => {
    if (value) {
      const _text = []
      value.forEach(_value => {
        value.forEach(item => {
          if (_value.id == item.id) {
            _text.push(item[nameKey])
          }
        })
      })
      setText(_text.join(', '))
    }
  }
  const $_onSubmit = () => {
    setModalVisible(false)
    onChange(fetchItems)
  }
  const $_onClose = () => {
    setModalVisible(false)
  }
  const $_onSelectAll = items => {
    const _value = value ? [...value] : []
    items.forEach(item => {
      if (!_value.includes(item.id)) {
        _value.push(item)
      }
    })
    setFetchItems(_value)
  }
  const $_onClearAll = items => {
    const _value = value ? [...value] : []
    items.forEach(item => {
      const tarIndex = _value.findIndex(e => {
        return e.id == item.id
      })
      if (tarIndex >= 0) {
        _value.splice(tarIndex, 1)
      }
    })
    setFetchItems(_value)
  }
  const $_onPress = ($event, item) => {
    const _fetchItems = fetchItems ? [...fetchItems] : []
    const tarIndex = _fetchItems.findIndex(e => {
      return e.id == item.id
    })
    if (!$event) {
      if (tarIndex >= 0) {
        _fetchItems.splice(tarIndex, 1)
      }
    } else {
      if (tarIndex < 0) {
        _fetchItems.push(item)
      }
    }
    setFetchItems(_fetchItems)
  }
  const _CheckValue = item => {
    const _fetchItems = fetchItems.map(item => item.id)
    if (!fetchItems) {
      return false
    } else if (_fetchItems.includes(item.id)) {
      return true
    } else {
      return false
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
  const $_onSubmitDeleteTag = async () => {
    try {
      const _res = await S_FactoryTag.delete(tagEditId)
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
    } catch (error) {
      console.log(error, '$_factoryTags Show')
    }
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
            onPress={() => {
              setPopupActiveForDelete(true)
              $_fetchFactoryTag(item.id)
              setTagEditId(item.id)
            }}
          ></WsIconBtn>
        </WsFlex>
      </WsFlex >
    );
  };

  React.useEffect(() => {
    if (defaultValue.length != 0 && value.length != 0) {
      setFetchItems([...defaultValue, ...value])
    }
  }, [defaultValue])

  React.useEffect(() => {
    if (value) {
      $_setText()
    }
  }, [value])

  // Render
  return (
    <>
      <WsBtnSelect
        style={{
        }}
        testID={testID}
        onPress={() => {
          setModalVisible(true)
          if (value && value.length > 0) {
            setFetchItems([...defaultValue, ...value])
          }
        }}
        placeholder={placeholder}
        text={text}
        icon={modelName === 'user' && 'md-people'}
        borderWidth={0.3}
        borderRadius={5}
        isError={isError}
      />
      <WsModal
        childrenScroll={true}
        onBackButtonPress={$_onClose}
        headerLeftOnPress={$_onClose}
        footerBtnRightOnPress={$_onSubmit}
        btnLeftHidden={(!selectAllVisible && !cancelAllVisible) ? true : false}
        footerBtnLeftText={t('重設')}
        footerBtnRightText={t('確定')}
        visible={modalVisible}
        title={title}
        style={[
          Platform.OS === 'ios'
            ? {
              marginTop: 40
            }
            : null
        ]}>
        <WsFilter002
          visible={filterModalVisible}
          setModalVisible={setFilterModalVisible}
          onClose={() => {
            setFilterModalVisible(false)
          }}
          filterTypeName={t('篩選條件')}
          fields={filterFields}
          searchVisible={false}
          onSubmit={$_onFilterSubmit}
        />
        {searchBarVisible && (
          <WsState
            style={{
              padding: 16,
            }}
            type="search"
            placeholder={t('搜尋')}
            value={search}
            onChange={e => {
              setSearch(e)
              const _params = {
                search: e
              }
              setFiltersValue(_params)
            }}
          >
          </WsState>
        )}
        {(selectAllVisible || cancelAllVisible) && (
          <WsFlex
            style={{
              padding: 16
            }}>
            <WsFlex>
              {selectAllVisible && (
                <>
                  <TouchableOpacity
                    onPress={() => {
                      $_onSelectAll(fetchItems)
                    }}>
                    <WsText color={$color.primary} size={14}>
                      {t('全選')}
                    </WsText>
                  </TouchableOpacity>
                  <WsText
                    color={$color.primary}
                    size="14"
                    style={{
                      paddingLeft: 16,
                      paddingRight: 16
                    }}>
                    |
                  </WsText>
                </>
              )}
              {cancelAllVisible && (
                <TouchableOpacity
                  onPress={() => {
                    $_onClearAll(fetchItems)
                  }}>
                  <WsText color={$color.primary} size="14">
                    {t('全取消')}
                  </WsText>
                </TouchableOpacity>
              )}
            </WsFlex>
            {filterVisible && (
              <WsIconBtn
                name="bih-filter"
                underlayColor={$color.primary}
                underlayColorPressIn={$color.primary2d}
                color={$color.white}
                size={24}
                style={{
                  zIndex: 1,
                  position: 'absolute',
                  top: 8,
                  right: 16
                }}
                onPress={() => {
                  setFilterModalVisible(true)
                }}
              />
            )}
          </WsFlex>
        )}
        <WsInfiniteScroll
          style={{
            height: height * 0.55
          }}
          hasMeta={hasMeta}
          service={Services[modelName]}
          serviceIndexKey={serviceIndexKey}
          params={params}
          renderItem={({ item, index }) => {
            return (
              <WsNavCheck
                testID={item.name}
                value={_CheckValue(item)}
                onChange={$event => {
                  $_onPress($event, item)
                }}
                textRight={nameKey2 ? moment(t(item[nameKey2])).format(formatNameKey2) : t(item[nameKey2])}
                defaultRightWidthTimes={0.3}
                textRightWidthTimes={0.2}
                defaultLeftWidthTime={0.6}
                textLeftWidthTimes={0.5}
              >
                {item.name ? item.name : item.content ? item.content : ''}
              </WsNavCheck>
            )
          }}
        />

        <View
          style={{
            paddingHorizontal: 16,
            borderTopWidth: 0.3,
          }}
        >
          <TouchableOpacity
            testID={'Modal新增標籤'}
            style={{
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
              }}
            >
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
                  testID={'送出'}
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
                      {t('送出')}
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
                          {t('送出')}
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
                    height: 200,
                    backgroundColor: $color.white,
                    borderRadius: 10,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
                  {loading ? (
                    <WsLoading></WsLoading>
                  ) : (
                    <>
                      <WsText
                        size={18}
                        color={$color.black}
                        style={{
                          position: 'absolute',
                          left: 16,
                          top: 16
                        }}
                      >{t('確定刪除嗎？')}
                      </WsText>

                      <WsFlex
                        style={{
                          paddingHorizontal: 16
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
                            {t('{number}個承攬商進廠紀錄', { number: tagCount.contractor_enter_records_count })}
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
                            paddingVertical: 8,
                            borderWidth: 1,
                            borderColor: $color.gray,
                            borderRadius: 25,
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
    </>
  )
}

export default LlStateRelatedTags
