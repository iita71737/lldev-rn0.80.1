import React, { useState, useEffect } from 'react'
import {
  Text,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native'
import {
  WsPaddingContainer,
  WsText,
  WsFlex,
  WsTag,
  WsInfiniteScroll,
  WsFilter,
  LlBtn002,
  LlCheckListCard001,
  WsBtn,
  WsGradientButton,
  WsIconBtn,
  WsSkeleton,
  WsPopup,
  WsEmpty,
  WsLoading,
  LlRetrainingRecordCard001
} from '@/components'
import i18next from 'i18next'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
// import S_DashboardService from '@/services/api/v1/dashboard'
import S_RetrainingTimeRecord from '@/services/api/v1/retraining_time_record'

const RetrainingTimeRecordList002 = props => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  // Props
  const {
    params,
    editable
  } = props

  // States
  const [loading, setLoading] = React.useState(true)
  const [pageNumber, setPageNumber] = React.useState()
  const [meta, setMeta] = React.useState()
  const [list, setList] = React.useState()

  const [popupActive, setPopupActive] = React.useState(false)
  const [popUpContent, setPopupContent] = React.useState(false)

  // Services
  const $_fetchApi = async (page = 1) => {
    try {
      let _params = {
        ...params,
        page: page
      }
      const res = await S_RetrainingTimeRecord.index({
        params: _params
      })
      setList(res.data)
      setMeta(res.meta)
      setPageNumber(res.meta.current_page)
      setLoading(false)
    } catch (e) {
      console.error(e);
      setLoading(false)
    }
  }

  // Function
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

  // Pagination
  const $_renderPagination = last_page => {
    const _copy = Array.from({ length: last_page }, (v, i) => i + 1)
    _copy.forEach(r => {
      return r
    })
    return _copy
  }

  React.useEffect(() => {
    if (params) {
      $_fetchApi()
    }
  }, [params])

  return (
    <>
      {meta ? !loading && (
        <>
          <FlatList
            initialNumToRender={15}
            nestedScrollEnabled={true}
            scrollEnabled={false}
            contentContainerStyle={{
              flexGrow: 1
            }}
            style={{
            }}
            onScroll={(event) => {
            }}
            data={list}
            keyExtractor={(item, index) => index}
            renderItem={({ item, index }) => {
              return (
                <>
                  <LlRetrainingRecordCard001
                    style={{
                      marginBottom: 16,
                    }}
                    item={item}
                    onPress={() => {
                    }}
                    onPressEdit={(item) => {
                      setEditId(item.id)
                      setHours(item.hours)
                      setTrainAt(item.train_at)
                      setAttaches(item.attaches)
                      setModalActive(true)
                    }}
                    editable={editable}
                  ></LlRetrainingRecordCard001>
                </>
              )
            }}
            ListEmptyComponent={() => {
              return (
                <>
                  {
                    list &&
                    list.length === 0 &&
                    (
                      <WsEmpty emptyTitle={t('目前尚無資料')} emptyText={''} />
                    )}
                </>
              )
            }}
          />

          <WsPopup
            testID={'WsPopup'}
            active={popupActive}
            onClose={() => {
              setPopupActive(false)
            }}>
            <View
              style={{
                padding: 16,
                width: width * 0.9,
                backgroundColor: $color.white,
                borderRadius: 10,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {popUpContent && (
                <View
                  style={{
                    flexDirection: 'column'
                  }}>
                  <WsText
                    fontWeight={'600'}
                    size={18}
                    style={{
                    }}
                  >
                    {/* {t(label)} */}
                    {t('各版次累計')}
                  </WsText>
                  <WsPaddingContainer
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                    <WsFlex>
                    </WsFlex>
                    <WsFlex>
                      <WsText size={14} color={$color.gray}>
                        {t('累計')}
                      </WsText>
                    </WsFlex>
                  </WsPaddingContainer>
                  <WsFlex
                    style={{
                      paddingLeft: 0,
                      paddingRight: 0,
                      padding: 12,
                      marginHorizontal: 12,
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                      alignItems: 'center',
                      borderTopWidth: 1,
                      borderColor: $color.primary10l,
                      borderBottomWidth: 1
                    }}>
                    <WsText
                      size={14}
                      style={{
                        flexWrap: 'nowrap',
                        paddingHorizontal: 16,
                        width: width * 0.75
                      }}>
                      {popUpContent.title}
                    </WsText>
                    {popUpContent.checklist_record_answers_count && (
                      <WsText
                        size={14}
                        style={{
                          marginHorizontal: 28
                        }}>
                        {popUpContent.checklist_record_answers_count}
                      </WsText>
                    )}
                    {popUpContent.audit_record_answers_count && (
                      <WsText size={14}>
                        {popUpContent.audit_record_answers_count}
                      </WsText>
                    )}
                  </WsFlex>
                </View>
              )}
            </View>
          </WsPopup>
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
              {/* <WsText size={12}>沒有更多了</WsText> */}
            </View>
          )
          }
        </>
      )}

      {/* pagination */}
      <>
        <WsPaddingContainer
          style={{
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
            testID={'前往第'}
            style={styles.input}
            onChangeText={e => {
              const num = parseInt(e, 10); // 将字符串转换为数字
              if (!isNaN(num)) {
                setPageNumber(num); // 只有在转换成功的情况下才更新状态
                $_clickPaginationPage(num)
              } else if (e === '') {
                setPageNumber(null); // 允许用户清空输入
              }
            }}
            value={pageNumber != undefined ? pageNumber.toString() : null}
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
              $_clickPaginationPage(pageNumber)
            }}>
            <WsText color={$color.white}>{t('前往')}</WsText>
          </WsGradientButton>
        </WsPaddingContainer>
        {list && meta && list.length > 0 && (
          <WsPaddingContainer
            style={{
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
              <WsFlex>
                <WsText>
                  {t('第{fromNum}-{toNum}筆 共{totalNum}筆', { totalNum: meta.total, fromNum: meta.from ? meta.from : 0, toNum: list + meta.from ? list.length + meta.from - 1 : '' })}
                </WsText>
              </WsFlex>
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
                      paddingVertical: 8
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
                      paddingVertical: 8
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
                  {$_renderPagination(meta.last_page).map((page, index) => {
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
                      paddingVertical: 8
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
                      paddingVertical: 8
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
    </>
  )
}

const styles = StyleSheet.create({
  input: {
    textAlign: 'center',
    height: 36,
    width: 60,
    margin: 12,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: $color.white5d,
    color: $color.black
  }
})

export default RetrainingTimeRecordList002
