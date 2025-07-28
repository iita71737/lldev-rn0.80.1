import React from 'react'
import {
  Pressable,
  Platform,
  TouchableHighlight,
  TouchableOpacity,
  Dimensions,
  View,
  Alert,
  FlatList
} from 'react-native'
import {
  WsModal,
  WsInfiniteScroll,
  WsText,
  WsFlex,
  WsPaddingContainer,
  WsCard,
  WsBtnSelect,
  WsIcon,
  WsTag,
  LlBtn002,
  WsState,
  WsPopup,
  WsBtnLeftIconCircle,
  WsGradientButton,
  WsIconBtn,
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import Services from '@/services/api/v1/index'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import store from '@/store'
import {
  setRefreshCounter
} from '@/store/data'
import { useSelector } from 'react-redux'

const WsStateBelongstoModalPicker002 = props => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Props
  const {
    label,
    pressText = t('選取'),
    placeholder = `${t('選擇')}`,
    value,
    modelName,
    onChange,
    nameKey,
    nameKey2,
    formatNameKey2 = 'YYYY-MM-DD',
    onPress,
    params,
    hasMeta = true,
    getAll = false,
    editable = true,
    formatNameKey,
    pickerStyle,
    isError,
    borderColorError = $color.danger,
    renderCom,
    preText,
    serviceIndexKey,
    testID,
    renderCustomizedCom,
    rules,
    addIconLabel = t('新增文字'),
    manageIconLabel = t('編輯文字'),
    deletableFields,
    translate = true
  } = props

  const FlatListRenderCom = renderCom
  const _renderCustomizedCom = renderCustomizedCom

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // States
  const [stateModal, setStateModal] = React.useState(false)
  const [popupType, setPopupType] = React.useState()
  const [popupActive, setPopupActive] = React.useState(false)
  const [popupActiveForEdit, setPopupActiveForEdit] = React.useState(false)
  const [popupActiveForDelete, setPopupActiveForDelete] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const [data, setData] = React.useState({})
  const [search, setSearch] = React.useState()

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

  // Services
  const $_createItem = async () => {
    try {
      const res = await Services[modelName].create({
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
      const res = await Services[modelName].update({
        data: {
          ...data,
          [modelName]: data.id
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
      const res = await Services[modelName].delete(data.id)
      if (res) {
        Alert.alert(t('刪除成功'))
        store.dispatch(setRefreshCounter(currentRefreshCounter + 1));
      }
    } catch (e) {
      console.error(e.message, '$_onSubmitDelete')
    }
  }
  const $_show = async (id) => {
    try {
      const res = await Services[modelName].show({ modelId: id })
      setData(res)
    } catch (e) {
      console.error(e.message, '$_show')
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
              $_show(item.id)
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
      {pickerStyle != 'picker' && (
        <>
          <TouchableOpacity
            testID={testID}
            onPress={() => {
              if (onPress) {
                onPress(navigation)
              } else {
                if (editable) {
                  setStateModal(true)
                }
              }
            }}>
            <WsPaddingContainer
              padding={0}
              style={[
                {
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 0.3,
                  borderRadius: 5,
                  backgroundColor: editable === false ? $color.white2d : $color.white
                },
                isError
                  ? {
                    borderWidth: 1,
                    borderColor: borderColorError,
                    backgroundColor: $color.danger11l
                  }
                  : null
              ]}>
              <WsFlex justifyContent="space-between">
                <WsFlex>
                  {modelName === 'user' && (
                    <WsIcon
                      style={{
                        marginRight: 8
                      }}
                      name="md-person"
                      size={20}
                      color={$color.gray}
                    />
                  )}
                  <WsText
                    style={{
                      marginTop: 0
                    }}
                    color={
                      value != undefined && editable ? $color.black :
                        (isError && rules && rules.includes('required')) ? $color.danger :
                          $color.gray
                    }
                  >
                    {
                      `${preText ? preText : ''}${value != null ? (formatNameKey ? moment(value[nameKey]).utc().format(formatNameKey) : value[nameKey]) : t(placeholder)}`
                    }
                  </WsText>
                </WsFlex>
                <WsIcon
                  name="ws-outline-chevron-down"
                  size={24}
                  color={$color.gray}
                />
              </WsFlex>
            </WsPaddingContainer>
          </TouchableOpacity>
        </>
      )}
      {pickerStyle == 'picker' && (
        <>
          {label && (
            <WsText
              size={14}
              style={{
                margin: 8
              }}>
              {label}
            </WsText>
          )}
          <WsPaddingContainer
            style={[
              {
                borderWidth: 0.3,
                borderRadius: 10,
                backgroundColor: editable === false && $color.white2d,
              },
              isError
                ? {
                  borderWidth: 1,
                  borderColor: borderColorError,
                }
                : null
            ]}
            padding={0}>
            <WsBtnSelect
              style={{
                // borderWidth: 1,
              }}
              onPress={() => {
                setStateModal(true)
              }}
              text={
                value
                  ? formatNameKey
                    ? moment(t(item[nameKey])).format(formatNameKey)
                    : value[nameKey]
                  : t(placeholder)
              }
            />
          </WsPaddingContainer>
        </>
      )}
      <WsModal
        visible={stateModal}
        onBackButtonPress={() => {
          setStateModal(false)
        }}
        headerLeftOnPress={() => {
          setStateModal(false)
        }}
        animationType="slide"
      >
        {_renderCustomizedCom ? (
          <>
            <_renderCustomizedCom
              setParentStateModal={setStateModal}
              onPress={(item) => {
                onChange(item)
                setStateModal(false)
              }}
              onPressOthers={(item) => {
                const _item = {
                  name: '其他'
                }
                onChange(_item)
                setStateModal(false)
              }}
            ></_renderCustomizedCom>
          </>
        )
          : (
            <>
              <WsInfiniteScroll
                hasMeta={hasMeta}
                getAll={getAll}
                service={Services[modelName]}
                serviceIndexKey={serviceIndexKey}
                params={__params}
                renderItem={({ item, index }) => {
                  return (
                    <TouchableOpacity
                      testID={item.name}
                      onPress={() => {
                        onChange(item)
                        setStateModal(false)
                      }}>
                      <WsCard
                        style={[
                          index != 0 ?
                            {
                              marginTop: 8
                            } :
                            null,
                          {
                            flexDirection: 'row'
                          }
                        ]}>
                        <WsFlex
                          style={{
                            flex: 1
                          }}
                          flexWrap={'wrap'}
                          justifyContent={formatNameKey2 ? 'space-between' : 'flex-start'}
                        >
                          <WsText
                            style={[
                              formatNameKey2 ?
                                {
                                  maxWidth: width * 0.6
                                } : null
                            ]}
                          >
                            {preText ? t(preText) : ''}
                            {formatNameKey
                              ? moment(item[nameKey]).format(formatNameKey)
                              : translate ? t(item[nameKey]) : item[nameKey]
                            }
                          </WsText>
                          {nameKey2 && (
                            <WsText
                              size={12}
                            >
                              {formatNameKey2 ? moment(t(item[nameKey2])).format(formatNameKey2) : t(item[nameKey2])}
                            </WsText>
                          )}
                        </WsFlex>
                        {FlatListRenderCom && (
                          <FlatListRenderCom {...item} />
                        )}
                      </WsCard>
                    </TouchableOpacity>
                  )
                }}
                ListHeaderComponent={() => {
                  return (
                    <>
                      <View
                        style={{
                          alignItems: 'center',
                          marginVertical: 8,
                          marginHorizontal: 8,
                        }}>
                        <WsState
                          type="search"
                          stateStyle={{
                            backgroundColor: $color.white,
                            width: width * 0.95,
                            borderRadius: 10
                          }}
                          value={search}
                          onChange={(e) => {
                            setSearch(e)
                          }}
                        />
                      </View>
                    </>
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
                      backgroundColor: $color.white,
                      borderRadius: 10,
                      alignItems: 'center'
                    }}>
                    <View
                      style={{
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
                      service={Services[modelName]}
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
                          alignItems: 'center'
                        }}>
                        <WsText size={14} fontWeight={500} style={{ alignSelf: 'center' }}>{`${t(`編輯${label}`)}`}</WsText>
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
                                alignItems: 'center',
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
                            >
                              {t('確定刪除嗎？')}
                            </WsText>

                            <WsText
                              style={{
                              }}
                            >{t('下列項目正在使用此施行狀態，無法刪除')}</WsText>

                            <WsText
                              size={14}
                              color={$color.black}
                              style={{
                              }}
                            >
                              {t('{number}部內規', { number: data.guidelines_count })}
                            </WsText>

                            <WsText
                              size={14}
                              color={$color.black}
                              style={{
                              }}
                            >
                              {t('{number}條條文', { number: data.guideline_article_versions_count })}
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
                                  borderWidth: 1,
                                  borderColor: $color.gray,
                                  borderRadius: 25,
                                  width: 110,
                                  alignItems: 'center',
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
                                disabled={deletableFields && deletableFields.length > 0 ? deletableFields.some(field => Boolean(data[field])) : false}
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
            </>
          )}
      </WsModal>
    </>
  )
}
export default WsStateBelongstoModalPicker002
