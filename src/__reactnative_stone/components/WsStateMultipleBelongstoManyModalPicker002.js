import React from 'react'
import {
  Pressable,
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
  WsInfiniteScrollMultiple,
  WsFlex,
  WsText,
  WsNavCheck,
  WsInfiniteScroll,
  WsState,
  WsIcon,
  WsPopup,
  WsBtnLeftIconCircle,
  WsGradientButton,
  WsIconBtn,
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import Services from '@/services/api/v1/index'
import layouts from '@/__reactnative_stone/global/layout'
import { useTranslation } from 'react-i18next'
import store from '@/store'
import {
  setRefreshCounter
} from '@/store/data'
import { useSelector } from 'react-redux'

const WsStateMultipleBelongstoManyModalPicker002 = props => {
  const { windowWidth, windowHeight } = layouts
  const { width, height } = Dimensions.get('window')
  // i18n
  const { t, i18n } = useTranslation()

  // Props
  const {
    value = [],
    onChange,
    isError,
    selectAllVisible = true,
    cancelAllVisible = true,
    searchBarVisible = true,
    placeholder = `${t('選擇')}`,
    title = t('選擇'),
    innerLabel,
    modelName = [],
    serviceIndexKey,
    nameKey,
    params,
    hasMeta = false,
    defaultValue = [],
    testID,
    addIconLabel = t('新增文字'),
    manageIconLabel = t('編輯文字'),
  } = props

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // State
  const [modalVisible, setModalVisible] = React.useState(false)
  const [selectedItems, setSelectedItems] = React.useState([])
  const [search, setSearch] = React.useState()

  const [popupActive, setPopupActive] = React.useState(false)
  const [popupType, setPopupType] = React.useState()
  const [data, setData] = React.useState({})
  const [popupActiveForEdit, setPopupActiveForEdit] = React.useState(false)
  const [popupActiveForDelete, setPopupActiveForDelete] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  // MEMO
  const __params = React.useMemo(() => {
    const _params = {
      ...params,
    }
    if (search) {
      _params.search = search
    } else {
      delete _params.search
    }
    return _params
  }, [search, currentRefreshCounter]);

  // Function
  const _setText = () => {
    if (value) {
      const _text = []
      value.forEach(_value => {
        _text.push(_value.name)
      })
      return _text.join(', ')
    }
  }
  const $_onSubmit = () => {
    setModalVisible(false)
    onChange(selectedItems)
  }

  const $_onClose = () => {
    setModalVisible(false)
  }

  const $_onSelectAll = (items, _m) => {
    const updatedItems = items.map(item => ({
      ...item,
      role_type: _m
    }));
    setSelectedItems([...selectedItems, ...updatedItems])
  }

  const $_onClearAll = items => {
    const _value = value ? [...value] : []
    items.forEach(item => {
      const tarIndex = _value.findIndex(e => {
        return e == item.id
      })
      if (tarIndex >= 0) {
        _value.splice(tarIndex, 1)
      }
    })
    setSelectedItems(_value)
  }
  const $_onPress = ($event, item, _m) => {
    const _fetchItems = selectedItems ? JSON.parse(JSON.stringify(selectedItems)) : []
    const tarIndex = _fetchItems.findIndex(e => {
      return e.id == item.id
    })
    if (!$event) {
      if (tarIndex >= 0) {
        _fetchItems.splice(tarIndex, 1)
      }
    } else {
      if (tarIndex < 0) {
        item.role_type = _m
        _fetchItems.push(item)
      }
    }
    setSelectedItems(_fetchItems)
  }

  const $_CheckValue = item => {
    if (!selectedItems) {
      return false
    }
    return selectedItems.some(x => x.id === item.id)
  }

  // Services
  const $_createItem = async () => {
    try {
      const res = await Services[modelName[1]].create({
        data: {
          ...data,
        }
      })
      if (res) {
        Alert.alert(t('新增成功'))
        store.dispatch(setRefreshCounter(currentRefreshCounter + 1));
      }
    } catch (e) {
      console.error(e.message, '$_createItem')
    }
  }

  const $_onSubmitEdit = async () => {
    try {
      const res = await Services[modelName[1]].update({
        data: {
          ...data,
          [modelName[1]]: data.id
        }
      })
      if (res) {
        Alert.alert(t('編輯成功'))
        store.dispatch(setRefreshCounter(currentRefreshCounter + 1));
      }
    } catch (e) {
      console.error(e.message, '$_onSubmitEdit')
    }
  }
  const $_onSubmitDelete = async () => {
    try {
      const res = await Services[modelName[1]].delete(data.id)
      if (res) {
        Alert.alert(t('刪除成功'))
        store.dispatch(setRefreshCounter(currentRefreshCounter + 1));
      }
    } catch (e) {
      console.error(e.message, '$_onSubmitDelete')
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
        <WsText>{item.name}</WsText>
        <WsFlex>
          <WsIconBtn
            testID={`ws-outline-edit-pencil-${index}`}
            name={'ws-outline-edit-pencil'}
            size={24}
            onPress={() => {
              setData(item)
              setPopupActiveForEdit(true)
            }}
          ></WsIconBtn>
          <WsIconBtn
            testID={`ws-outline-delete-${index}`}
            name={'ws-outline-delete'}
            size={24}
            onPress={() => {
              setData(item)
              setPopupActiveForDelete(true)
            }}
          ></WsIconBtn>
        </WsFlex>
      </WsFlex >
    );
  };

  // Render
  return (
    <>
      <WsBtnSelect
        testID={testID}
        onPress={() => {
          setModalVisible(true)
          setSelectedItems([...defaultValue, ...value])
        }}
        placeholder={placeholder}
        text={_setText()}
        borderWidth={0.3}
        borderRadius={5}
        isError={isError}
      />
      <WsModal
        onBackButtonPress={$_onClose}
        headerLeftOnPress={$_onClose}
        childrenScroll={true}
        footerBtnRightOnPress={$_onSubmit}
        footerBtnLeftText={t('重設')}
        footerBtnRightText={t('確定')}
        visible={modalVisible}
        title={title}
        style={[
          Platform.OS === 'ios'
            ? {
              marginTop: 40
            }
            : null,
        ]}
      >
        {searchBarVisible && (
          <WsState
            style={{
              paddingTop: 16,
              paddingHorizontal: 16,
            }}
            type="search"
            placeholder={t('搜尋')}
            value={search}
            onChange={setSearch}
          >
          </WsState>
        )}

        {modelName &&
          modelName.length > 0 && (
            modelName.map((_m, index) => {
              return (
                <>
                  <WsInfiniteScroll
                    key={index}
                    service={Services[_m]}
                    serviceIndexKey={serviceIndexKey}
                    params={__params}
                    hasMeta={hasMeta}
                    listBottomPaddingVisible={false}
                    ListHeaderComponent={(models) => {
                      return (
                        <>
                          {(selectAllVisible || cancelAllVisible) && (
                            <WsFlex
                              style={{
                                paddingTop: 16,
                                paddingHorizontal: 16,
                              }}>
                              <WsFlex>
                                {selectAllVisible && (
                                  <>
                                    <TouchableOpacity
                                      onPress={() => {
                                        $_onSelectAll(models, _m)
                                      }}>
                                      <WsText color={$color.primary} size="14">
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
                                      $_onClearAll(models)
                                    }}>
                                    <WsText color={$color.primary} size="14">
                                      {t('全取消')}
                                    </WsText>
                                  </TouchableOpacity>
                                )}
                              </WsFlex>
                            </WsFlex>
                          )}
                          {innerLabel &&
                            innerLabel.length > 0 && (
                              <WsText
                                size={14}
                                style={{
                                  padding: 16,
                                  color: $color.gray
                                }}
                              >
                                {t(innerLabel[index])}
                              </WsText>
                            )}
                        </>
                      )
                    }}
                    renderItem={({ item, index }) => {
                      return (
                        <WsNavCheck
                          testID={`${item.name}`}
                          key={`${item.name}${index}`}
                          value={$_CheckValue(item)}
                          onChange={$event => {
                            $_onPress($event, item, _m)
                          }}>
                          {item.name}
                        </WsNavCheck>
                      )
                    }}
                  />
                </>
              )
            })
          )}

        <View
          style={{
            marginTop: 16,
            paddingHorizontal: 16,
            borderTopWidth: 0.3,
          }}
        >
          <TouchableOpacity
            style={{
              paddingTop: 16,
              flexDirection: 'row',
              alignItems: 'center',

            }}
            onPress={() => {
              setPopupType('add')
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
              {t(addIconLabel)}
            </WsText>
          </TouchableOpacity>
          <TouchableOpacity
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
              {t(manageIconLabel)}
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
                // height: height * 0.8,
                backgroundColor: $color.white,
                borderRadius: 10,
                alignItems: 'center'
              }}>
              <View
                style={{
                  // flex: 1,
                }}
              >
                <WsText size={14} fontWeight={500} style={{ alignSelf: 'center' }}>{addIconLabel}</WsText>
                <WsState
                  style={{
                    width: width * 0.8
                  }}
                  label={t('名稱')}
                  value={data.name}
                  onChange={(e) => {
                    setData({
                      ...data,
                      name: e
                    })
                  }}
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
                  value={data.sequence}
                  onChange={(e) => {
                    setData({
                      ...data,
                      sequence: e
                    })
                  }}
                  placeholder={t('輸入')}
                />
              </View>
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
                    $_createItem()
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
                <WsText>{t(manageIconLabel)}</WsText>
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
                style={{
                  marginBottom: 16,
                  width: width * 0.8
                }}
                type="search"
                placeholder={t('搜尋')}
                value={search}
                onChange={setSearch}
              />

              <WsInfiniteScroll
                service={Services[modelName[1]]}
                serviceIndexKey="index"
                params={__params}
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
                    alignItems: 'center',
                  }}>
                  <WsState
                    style={{
                      width: width * 0.8
                    }}
                    label={t('名稱')}
                    value={data?.name}
                    onChange={(e) => {
                      setData({
                        ...data,
                        name: e
                      })
                    }}
                    rules={'required'}
                    placeholder={t('輸入')}
                  />
                  <WsState
                    style={{
                      marginTop: 16,
                      width: width * 0.8
                    }}
                    type={'number'}
                    label={t('排序')}
                    value={data?.sequence}
                    onChange={(e) => {
                      setData({
                        ...data,
                        sequence: e
                      })
                    }}
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
                      style={{
                        width: width * 0.375
                      }}
                      onPress={() => {
                        $_onSubmitEdit()
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
                            $_onSubmitDelete()
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

        <View
          style={{
            marginBottom: 120
          }}
        >
        </View>

      </WsModal>
    </>
  )
}

export default WsStateMultipleBelongstoManyModalPicker002
