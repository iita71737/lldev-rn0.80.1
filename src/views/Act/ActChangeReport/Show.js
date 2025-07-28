import React from 'react'
import { ScrollView, View, Text, Linking } from 'react-native'
import {
  WsFlex,
  WsTag,
  WsCardPassage,
  WsText,
  WsDes,
  WsIconBtn,
  WsPaddingContainer,
  WsInfo,
  LlArticleCard001,
  LlArticleCard002,
  WsInfiniteScroll,
  WsSnackBar,
  WsSkeleton,
  WsPassageCollapse
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import S_Act from '@/services/api/v1/act'
import S_ArticleVersion from '@/services/api/v1/article_version'
import { useSelector } from 'react-redux'
import store from '@/store'
import { addToCollectIds, deleteCollectId } from '@/store/data'
import { useTranslation } from 'react-i18next'
import { setCurrentAct } from '@/store/data'

const ActChangeReportShow = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()

  // Params
  const { id } = route.params

  // Redux
  const collectIds = useSelector(state => state.data.collectIds)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // States
  const [act, setAct] = React.useState(null)
  const [params, setParams] = React.useState()

  const [collectionIcon, setCollectionIcon] = React.useState()
  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('已儲存至「我的收藏」')
  )

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      title: t('法規變更報表'),
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
      headerLeft: () => (
        <WsIconBtn
          testID="backButton"
          name={'md-chevron-left'}
          color="white"
          size={32}
          style={{
            marginRight: 4,
          }}
          onPress={() => {
            navigation.goBack()
          }}
        />
      )
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

  React.useEffect(() => {
    // Services
    const $_fetchAct = async () => {
      const res = await S_Act.show({
        modelId: id
      })
      setAct(res)
      setParams({
        act_version: res.last_version?.id,
        order_by: 'no_number',
        order_way: 'asc'
      })
      store.dispatch(setCurrentAct(res))
    }
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
          <ScrollView>
            <>
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white
                }}
              >

                <WsText size={24} testID={'法規法條名稱'}>{act.last_version.name}</WsText>

                <WsFlex
                  flexWrap={'wrap'}
                  style={{
                    // borderWidth:1,
                  }}
                >
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

                {/* <View
                  style={{
                    marginTop: 8
                  }}
                >
                  <WsInfo
                    style={{
                      flexDirection: 'row',
                    }}
                    labelWidth={100}
                    label={t('修正發布日')}
                    value={moment(act.last_version && act.last_version.announce_at ? act.last_version.announce_at : null).format('YYYY-MM-DD')}
                  />
                </View> */}

                {act.last_version && act.last_version.effect_at && (
                  <View
                    style={{
                      marginTop: 8
                    }}
                  >
                    <WsInfo
                      style={{
                        flexDirection: 'row',
                      }}
                      labelWidth={100}
                      label={t('生效日')}
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
                    style={{
                      flexDirection: 'row',
                    }}
                    labelWidth={100}
                    label={t('法規狀態')}
                    value={act.act_status && act.act_status.name ? t(act.act_status.name) : t('無')}
                  />
                </View>

                {act.act_type &&
                  act.act_type.name && (
                    <View
                      style={{
                        marginTop: 8
                      }}
                    >
                      <WsInfo
                        labelWidth={100}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}
                        type="text"
                        value={t(act.act_type.name)}
                        label={t('法規類別')}
                      />
                    </View>
                  )}

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
                    style={{
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

              {act.last_version.act_comment != '' && (
                <>
                  <WsPaddingContainer
                    style={[
                      {
                        marginTop: 8,
                        backgroundColor: $color.white
                      },
                    ]}
                  >
                    <WsText fontWeight={600}>{t('立法總說明')}</WsText>
                    <WsPassageCollapse
                      passage={act.last_version.act_comment}
                    >
                    </WsPassageCollapse>
                  </WsPaddingContainer>
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
              {act.last_version.status != '' && (
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
            </>
            <WsInfiniteScroll
              service={S_ArticleVersion}
              params={params}
              // ListHeaderComponent={() => {
              //   return (
              //     <>
              //       <WsPaddingContainer
              //         style={{
              //           backgroundColor: $color.white
              //         }}
              //       >

              //         <WsText size={24} testID={'法規法條名稱'}>{act.last_version.name}</WsText>

              //         <WsFlex
              //           flexWrap={'wrap'}
              //           style={{
              //             // borderWidth:1,
              //           }}
              //         >
              //           {act.system_subclasses.map(
              //             (systemSubClass, systemSubClassIndex) => {
              //               return (
              //                 <WsTag
              //                   style={{
              //                     marginLeft: 4,
              //                     marginBottom: 4,
              //                   }}
              //                   key={systemSubClassIndex}
              //                   img={systemSubClass.icon}>
              //                   {t(systemSubClass.name)}
              //                 </WsTag>
              //               )
              //             }
              //           )}
              //         </WsFlex>

              //         {/* <WsDes
              //           style={{
              //             marginTop: 8,
              //           }}>
              //           {t('修正發布日')}{' '}
              //           {moment(act.last_version && act.last_version.announce_at ? act.last_version.announce_at : null).format(
              //             'YYYY-MM-DD'
              //           )}
              //         </WsDes> */}


              //         <View
              //           style={{
              //             marginTop: 8
              //           }}
              //         >
              //           <WsInfo
              //             style={{
              //               flexDirection: 'row',
              //             }}
              //             labelWidth={100}
              //             label={t('修正發布日')}
              //             value={moment(act.last_version && act.last_version.announce_at ? act.last_version.announce_at : null).format('YYYY-MM-DD')}
              //           />
              //         </View>

              //         {act.last_version && act.last_version.effect_at && (
              //           // <WsDes
              //           //   style={{
              //           //     marginTop: 8
              //           //   }}>
              //           //   {t('生效日')}{' '}
              //           //   {moment(act.last_version && act.last_version.effect_at ? act.last_version.effect_at : null).format(
              //           //     'YYYY-MM-DD'
              //           //   )}
              //           // </WsDes>

              //           <View
              //             style={{
              //               marginTop: 8
              //             }}
              //           >
              //             <WsInfo
              //               style={{
              //                 flexDirection: 'row',
              //               }}
              //               labelWidth={100}
              //               label={t('生效日')}
              //               value={moment(act.last_version && act.last_version.effect_at ? act.last_version.effect_at : null).format('YYYY-MM-DD')}
              //             />
              //           </View>
              //         )}

              //         {/* <WsDes
              //           style={{
              //             marginTop: 8,
              //             marginBottom: 8,
              //           }}>
              //           {t('法規狀態')}{' '}
              //           {act.act_status && act.act_status.name ? t(act.act_status.name) : null}
              //         </WsDes> */}

              //         <View
              //           style={{
              //             marginTop: 8
              //           }}
              //         >
              //           <WsInfo
              //             style={{
              //               flexDirection: 'row',
              //             }}
              //             labelWidth={100}
              //             label={t('法規狀態')}
              //             value={act.act_status && act.act_status.name ? t(act.act_status.name) : t('無')}
              //           />
              //         </View>

              //         {act.act_type &&
              //           act.act_type.name && (
              //             <View
              //               style={{
              //                 marginTop: 8
              //               }}
              //             >
              //               <WsInfo
              //                 labelWidth={100}
              //                 style={{
              //                   flexDirection: 'row',
              //                   alignItems: 'center',
              //                 }}
              //                 type="text"
              //                 value={t(act.act_type.name)}
              //                 label={t('法規類別')}
              //               />
              //             </View>
              //           )}

              //       </WsPaddingContainer>

              //       {act.area &&
              //         act.area.name &&
              //         act.area.name != undefined && (
              //           <WsPaddingContainer
              //             padding={0}
              //             style={{
              //               paddingHorizontal: 16,
              //               backgroundColor: $color.white,
              //               marginTop: 8
              //             }}>
              //             <WsInfo
              //               style={{
              //                 flexDirection: 'row',
              //                 alignItems: 'center',
              //               }}
              //               type="text"
              //               value={t(act.area.name)}
              //               label={t('適用地區')}
              //             />
              //           </WsPaddingContainer>
              //         )
              //       }

              //       {act.last_version &&
              //         act.last_version.reference_link && (
              //           <WsPaddingContainer
              //             style={{
              //               backgroundColor: $color.white,
              //               marginTop: 8
              //             }}>
              //             <WsInfo
              //               type="link"
              //               value={act.last_version.reference_link}
              //               label={t('來源連結')}
              //               hasExternalLink={true}
              //             />
              //           </WsPaddingContainer>
              //         )}

              //       {act.last_version.act_comment != '' && (
              //         <>
              //           <WsPaddingContainer
              //             style={[
              //               {
              //                 marginTop: 8,
              //                 backgroundColor: $color.white
              //               },
              //             ]}
              //           >
              //             <WsText fontWeight={600}>{t('立法總說明')}</WsText>
              //             <WsPassageCollapse
              //               passage={act.last_version.act_comment}
              //             >
              //             </WsPassageCollapse>
              //           </WsPaddingContainer>
              //         </>
              //       )}

              //       {act.last_version.ll_comment != '' && (
              //         <>
              //           <WsCardPassage
              //             title={t('ESGoal總評')}
              //             passage={act.last_version.ll_comment}
              //             style={{
              //               marginTop: 8
              //             }}
              //           />
              //         </>
              //       )}
              //       {act.last_version.status != '' && (
              //         <>
              //           <WsCardPassage
              //             title={t('施行狀態')}
              //             passage={act.last_version.status}
              //             style={{
              //               marginTop: 8
              //             }}
              //           />
              //         </>
              //       )}
              //     </>
              //   )
              // }}
              renderItem={({ item, index }) => {
                return (
                  <View
                    key={`article${index}`}
                    style={[
                      index == 0
                        ? {
                          marginTop: 8,
                        }
                        : null
                    ]}>
                    <LlArticleCard002
                      article={item}
                      actId={id}
                      articleId={item.id}
                      title={act.last_version.name}
                      style={{
                        marginTop: 8
                      }}
                      navigation={navigation}
                    />
                  </View>
                )
              }}
            />
          </ScrollView>
        </>
      ) : (
        <WsSkeleton></WsSkeleton>
      )}
    </>
  )
}
export default ActChangeReportShow
