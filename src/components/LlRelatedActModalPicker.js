import React from 'react'
import {
  Pressable,
  Platform,
  TouchableOpacity,
  Dimensions,
  View,
  TextInput,
  FlatList
} from 'react-native'
import {
  WsBtnSelect,
  WsModal,
  WsFlex,
  WsText,
  WsNavCheck,
  WsInfiniteScroll,
  WsState,
  LlRelatedActModalPickerStep2,
  WsIconBtn,
  WsLoading,
  WsPaddingContainer,
  WsGradientButton,
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import Services from '@/services/api/v1/index'
import { useTranslation } from 'react-i18next'
import layouts from '@/__reactnative_stone/global/layout'
import S_File from '@/services/api/v1/file'
import { useSelector } from 'react-redux'

const LlRelatedActModalPicker = props => {
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
    title = t('新增'),
    modelName,
    serviceIndexKey,
    nameKey,
    hasMeta = true,
    params
  } = props

  // States
  const [loading, setLoading] = React.useState(true)
  const [currentPage, setCurrentPage] = React.useState()
  const [meta, setMeta] = React.useState()
  const [list, setList] = React.useState()

  const [searchValue, setSearchValue] = React.useState()
  const [modalVisible, setModalVisible] = React.useState(false)
  const [fetchItems, setFetchItems] = React.useState(value)
  const [text, setText] = React.useState()
  const [step2ModalVisible, setStep2ModalVisible] = React.useState(false)
  const [selectedAct, setSelectedAct] = React.useState()
  const [fields, setFields] = React.useState()


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

  // Function
  const $_onClose = () => {
    setModalVisible(false)
  }
  // 點選的法規
  const $_setSelectedAct = (item) => {
    const _formattedSelectedActForFieldsValue = S_File.formattedSelectedActForFields(item)
    setSelectedAct(_formattedSelectedActForFieldsValue)
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
    if (selectedAct) {
      const _fields = {
        name: {
          label: t('名稱'),
          rules: 'required',
          editable: false
        },
        bind_type: {
          label: t('綁定種類'),
          type: 'radio',
          items: [
            { label: t('綁定整部法規'), value: 'whole_act' },
            { label: t('綁定特定法條'), value: 'specific_act' },
          ],
          rules: 'required',
        },
        specific_article: {
          type: 'Ll_belongstomany003',
          label: t('所選法條'),
          modelName: 'article_version',
          params: {
            lang: 'tw',
            order_by: 'no_number',
            order_way: 'asc',
            act_versions: selectedAct.act.last_version.id
          },
          serviceIndexKey: 'index',
          hasMeta: true,
          searchBarVisible: true,
          displayCheck(fieldsValue) {
            if (fieldsValue.bind_type == 'specific_act') {
              return true
            } else {
              return false
            }
          },
        },
      }
      setFields(_fields)
    }
  }

  const $_renderPagination = (totalPages, currentPage) => {
    // 當總頁數不超過 6 頁時，直接回傳所有頁碼
    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    // 固定的前後區間
    const firstSet = [1, 2, 3];
    const lastSet = [totalPages - 2, totalPages - 1, totalPages];
    // 定義中間要顯示的頁碼區間
    let middleRange = [];
    // 當目前頁碼位於前面(<=3)或後面(>= totalPages-2)時，僅額外加入當前相關頁碼
    if (currentPage === 3) {
      middleRange = [4];
    } else if (currentPage === totalPages - 2) {
      middleRange = [totalPages - 3];
    } else if (currentPage > 3 && currentPage < totalPages - 2) {
      // 常態狀況：顯示 currentPage 前後各一頁
      const start = Math.max(4, currentPage - 1);
      const end = Math.min(totalPages - 3, currentPage + 1);
      for (let i = start; i <= end; i++) {
        middleRange.push(i);
      }
    }
    // 如果不符合上述條件，middleRange 可能為空
    // 合併：先加入前面固定部分，然後插入 ellipsis (如果需要) ，再加入中間區間，再判斷中間與最後區間間是否需要省略號
    const pagination = [];
    // 加入前區間
    pagination.push(...firstSet);
    // 如果中間區域存在，判斷與前區間最後一項是否連續
    if (middleRange.length > 0) {
      if (middleRange[0] - firstSet[firstSet.length - 1] > 1) {
        pagination.push("...");
      }
      pagination.push(...middleRange);
    } else {
      // 若沒有中間區域，直接判斷前區與後區的差距
      if (lastSet[0] - firstSet[firstSet.length - 1] > 1) {
        pagination.push("...");
      }
    }
    // 判斷最後區間與（中間區或前區）是否連續
    const lastVal = (middleRange.length > 0 ? middleRange[middleRange.length - 1] : firstSet[firstSet.length - 1]);
    if (lastSet[0] - lastVal > 1) {
      pagination.push("...");
    }
    pagination.push(...lastSet);
    return pagination;
  }
  const $_clickPaginationPage = page => {
    $_fetchApi(page)
  }
  const $_clickPaginationIcon = type => {
    let page = params.page
    switch (type) {
      case 'ToFirstPage':
        page = 1
        break
      case 'Back':
        page = page - 1
        break
      case 'Forward':
        page = page + 1
        break
      case 'ToFinalPage':
        page = meta.last_page
        break
      default:
    }
    $_fetchApi(page)
  }
  // Services
  const $_fetchApi = async (page) => {
    const _ = Services[modelName]
    try {
      let _params = {
        ...__params,
        page: page
      }
      res = await _[serviceIndexKey]({
        params: _params,
      })
      setList(res.data)
      setMeta(res.meta)
      setCurrentPage(res.meta.current_page)
      setLoading(false)
    } catch (e) {
      console.error(e);
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (params) {
      $_fetchApi()
    }
  }, [__params])

  React.useEffect(() => {
    if (selectedAct) {
      $_setFields()
    }
  }, [selectedAct])

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
          setModalVisible(true)
        }}
        placeholder={placeholder}
        text={text}
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
                    testID={'法規法條名稱'}
                    style={{
                      marginLeft: 8,
                      maxWidth: width * 0.775,
                    }}
                    color={$color.gray}
                  >
                    {_item.last_version?.name ? _item.last_version.name :
                      _item.article && _item.article?.act_version ? `${_item.article?.act_version?.name} ${_item.no_text}` :
                        _item.article && _item.act_version ? `${_item.act_version?.name} ${_item.no_text}` :
                          _item.name ? _item.name : 'unknown'}
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
        visible={modalVisible}
        title={title}
        style={[
          Platform.OS === 'ios'
            ? {
              marginTop: 40
            }
            : null
        ]}
      >
        <WsState
          type="search"
          stateStyle={{
            margin: 16,
            height: Platform.OS == 'ios' ? 40 : 40,
            borderRadius: 10,
            backgroundColor: $color.white
          }}
          placeholder={'搜尋'}
          value={searchValue}
          onChange={setSearchValue}
        />

        <WsText
          style={{
            marginHorizontal: 16,
            marginBottom: 16,
          }}
          size={14}
          fontWeight={400}
          color={$color.gray}
        >{t('法規名稱')}
        </WsText>
        {meta ? !loading && (
          <>
            <FlatList
              data={list}
              keyExtractor={(item, index) => index}
              renderItem={({ item, index }) => {
                return (
                  <TouchableOpacity
                    key={index}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderTopWidth: 1,
                      borderBottomWidth: 1,
                      borderTopColor: $color.primary11l,
                      borderBottomColor: $color.primary11l
                    }}
                    onPress={() => {
                      $_setSelectedAct(item)
                      setModalVisible(false)
                      setStep2ModalVisible(true)
                    }}
                  >
                    <WsText>{item.name ? item.name : item.last_version?.name ? item.last_version.name : ''}</WsText>
                  </TouchableOpacity>
                )
              }}
            />
          </>
        ) : (
          <>
            {loading ? (
              <View
                style={{
                  transform: [{ rotate: '180deg' }],
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <WsLoading size={30}></WsLoading>
              </View>
            ) : (
              <View
                style={{
                  padding: 12,
                  alignItems: "center"
                }}
              >
              </View>
            )
            }
          </>
        )}

        {/* pagination */}
        <>
          <WsPaddingContainer
            style={{
              marginHorizontal: 16,
              paddingLeft: 0,
              paddingRight: 0,
              padding: 12,
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
              borderTopWidth: 1,
              borderColor: $color.primary10l,
            }}>
            <WsText>{`${t('前往頁數')}`}</WsText>
            <TextInput
              style={{
                textAlign: 'center',
                height: 36,
                width: 60,
                margin: 12,
                borderWidth: 1,
                borderRadius: 10,
                borderColor: $color.white5d,
                color: $color.black
              }}
              onChangeText={e => {
                const num = parseInt(e, 10); // 将字符串转换为数字
                if (!isNaN(num)) {
                  setPageNumber(num); // 只有在转换成功的情况下才更新状态
                  $_clickPaginationPage(num)
                } else if (e === '') {
                  setPageNumber(null); // 允许用户清空输入
                }
              }}
              value={currentPage != undefined ? currentPage.toString() : null}
              keyboardType="numeric"
            />
            {meta &&
              meta.last_page && (
                <WsText>
                  {t('共{number}頁', { number: meta.last_page })}
                </WsText>
              )}

            <WsGradientButton
              style={{
                flex: 1
              }}
              borderRadius={30}
              onPress={() => {
                $_clickPaginationPage(currentPage)
              }}>
              <WsText color={$color.white}>{t('前往')}</WsText>
            </WsGradientButton>
          </WsPaddingContainer>

          {list && meta && list.length > 0 && (
            <WsPaddingContainer
              style={{
                marginHorizontal: 16,
                padding: 0,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderColor: $color.primary10l,
                // borderWidth: 1,
              }}>
              <WsFlex>
                <WsText>
                  {t('第{fromNum}-{toNum}筆 共{totalNum}筆', { totalNum: meta.total, fromNum: meta.from ? meta.from : 0, toNum: list + meta.from ? list.length + meta.from - 1 : '' })}
                </WsText>
              </WsFlex>
            </WsPaddingContainer>
          )}

          {list && meta && list.length > 0 && (
            <WsPaddingContainer
              style={{
                marginTop: 8,
                marginHorizontal: 16,
                padding: 0,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderColor: $color.primary10l,
                // borderWidth: 1,
              }}>
              <WsFlex
                justifyContent={'space-between'}
                style={{
                  // borderWidth: 1
                }}
              >
                <>
                  <WsFlex
                    justifyContent={'space-between'}
                    style={{
                      flex: 1,
                      // borderWidth: 1
                    }}
                  >
                    <WsIconBtn
                      style={{
                      }}
                      padding={0}
                      disabled={meta.current_page === 1 ? true : false}
                      color={meta.current_page === 1 ? $color.gray : $color.primary}
                      name="ws-outline-chevron-back-start"
                      size={24}
                      onPress={() => {
                        $_clickPaginationIcon('ToFirstPage')
                      }}
                    />
                    <WsIconBtn
                      style={{
                      }}
                      padding={0}
                      disabled={meta.current_page === 1 ? true : false}
                      color={meta.current_page === 1 ? $color.gray : $color.primary}
                      name="ws-outline-chevron-back"
                      size={24}
                      onPress={() => {
                        $_clickPaginationIcon('Back')
                      }}
                    />
                    {$_renderPagination(meta.last_page, currentPage).map((page, index) => {
                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            index != 0 ?
                              {
                                marginLeft: 16
                              }
                              : null
                          ]}
                          onPress={() => {
                            $_clickPaginationPage(page)
                          }}>
                          <WsText
                            color={
                              page == meta.current_page ? $color.primary : $color.gray
                            }>
                            {page}
                          </WsText>
                        </TouchableOpacity>
                      )
                    })}
                    <WsIconBtn
                      style={{
                      }}
                      padding={0}
                      disabled={meta.current_page === meta.last_page ? true : false}
                      color={
                        meta.current_page === meta.last_page
                          ? $color.gray
                          : $color.primary
                      }
                      name="ws-outline-chevron-forward"
                      size={24}
                      onPress={() => {
                        $_clickPaginationIcon('Forward')
                      }}
                    />
                    <WsIconBtn
                      style={{
                      }}
                      padding={0}
                      disabled={meta.current_page === meta.last_page ? true : false}
                      color={
                        meta.current_page === meta.last_page
                          ? $color.gray
                          : $color.primary
                      }
                      name="ws-outline-chevron-forward-end"
                      size={24}
                      onPress={() => {
                        $_clickPaginationIcon('ToFinalPage')
                      }}
                    />
                  </WsFlex>
                </>
              </WsFlex>
            </WsPaddingContainer>
          )}
          <View
            style={{
              height: 50
            }}
          ></View>
        </>

      </WsModal>

      <LlRelatedActModalPickerStep2
        isVisible={step2ModalVisible}
        onClose={() => {
          setStep2ModalVisible(false)
        }}
        fields={fields}
        value={selectedAct}
        onChange={onChange}
        fetchItems={fetchItems}
        setFetchItems={setFetchItems}
      >
      </LlRelatedActModalPickerStep2>
    </>
  )
}

export default LlRelatedActModalPicker
