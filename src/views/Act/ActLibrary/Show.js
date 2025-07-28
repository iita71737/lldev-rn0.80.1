import React from 'react'
import { View, Image, ScrollView, SafeAreaView, FlatList } from 'react-native'
import {
  WsDes,
  WsFlex,
  WsPaddingContainer,
  WsText,
  WsIconBtn,
  WsFilter,
  LlBtn002,
  LlActLibraryArticleCard001,
  WsSkeleton
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import S_Act from '@/services/api/v1/act'
import { useTranslation } from 'react-i18next'

const ActLibrary = ({ navigation, route }, props) => {
  const { t, i18n } = useTranslation()
  // Params
  const { systemSubclassId, systemClassId, title } = route.params

  // const {
  //   systemSubclassId, 
  //   systemClassId, 
  //   title
  // } = props

  // Redux
  const actTypes = useSelector(state => state.data.actTypes)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // States

  const [loading, setLoading] = React.useState(true)
  const [actWithActTypes, setActWithActTypes] = React.useState(null)

  // Services
  const $_fetchActWithActTypes = async () => {
    const res = await S_Act.actWithActTypes({
      parentId: currentFactory.id,
      params: {
        system_classes: systemClassId,
        system_subclasses: systemSubclassId
      },
      actTypes: actTypes
    })
    setActWithActTypes(res)
    setLoading(false)
  }

  // Option
  // const $_setNavigationOption = () => {
  //   navigation.setOptions({
  //     title: `${t('法規圖書館')} - ${title}`
  //   })
  // }

  const $_isChangeInThreeMonths = update => {
    const diff = moment(new Date()).diff(moment(update), 'days')
    if (diff <= 90) {
      return 3
    } else if (diff < 180) {
      return 6
    } else {
      return null
    }
  }

  React.useEffect(() => {
    if (actTypes) {
      $_fetchActWithActTypes()
    }
  }, [actTypes])

  React.useEffect(() => {
    // $_setNavigationOption()
    $_fetchActWithActTypes()
  }, [title])

  // SECOND LAYER DATA
  const renderInnerItem = ({ item, index, _icon }) => {
    return (
      <LlActLibraryArticleCard001
        key={index}
        text={item.last_version ? item.last_version.name : null}
        img={_icon ? _icon : null}
        isChange={$_isChangeInThreeMonths(
          item.last_version.announce_at
        )}
        style={{
          marginTop: 16
        }}
        onPress={() => {
          navigation.push('RoutesAct', {
            screen: 'ActShow',
            params: {
              id: item.id
            }
          })
        }}
      />
    );
  };

  // FIRST LAYER DATA
  const renderOuterItem = ({ item, index }) => {
    const _icon = item.icon
    return (
      <View key={index}>
        {item.acts.length > 0 && (
          <View>
            <WsFlex>
              <Image
                style={{
                  width: 22,
                  height: 22
                }}
                source={{ uri: item.icon }}
              />
              <WsText
                style={{
                  marginTop: 16
                }}>
                {t(item.actType)}
              </WsText>
            </WsFlex>
            <FlatList
              data={item.acts}
              renderItem={({ item, index }) => renderInnerItem({ item, index, _icon })} // 傳遞母層的 item 給子層的 renderItem
              keyExtractor={(item, index) => item + index}
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <>
      {loading ? (
        <>
          <SafeAreaView>
            <WsSkeleton />
            <WsSkeleton />
            <WsSkeleton />
          </SafeAreaView>
        </>
      ) : (
        <>
          <ScrollView>
            {actWithActTypes && (
              <>
                <WsPaddingContainer>
                  <WsText>{t('法規圖書館')}</WsText>
                  <WsText
                    size={24}
                    style={{
                      marginBottom: 16,
                      marginTop: 8
                    }}>
                    {t(title)}
                  </WsText>

                  <FlatList
                    ListHeaderComponent={() => {
                      return (
                        <>
                          <View
                            style={{
                              alignItems: 'flex-start',
                              marginBottom: 16,
                            }}>
                            <LlBtn002
                              style={{
                                width: 92,
                                height: 40
                              }}
                              onPress={() => setModalVisible(true)}>
                              {t('篩選條件')}
                            </LlBtn002>
                          </View>
                        </>
                      )
                    }}
                    data={actWithActTypes}
                    renderItem={renderOuterItem}
                    keyExtractor={(item, index) => item + index}
                  />

                </WsPaddingContainer>
              </>
            )}
          </ScrollView>
        </>
      )}
    </>
  )
}
export default ActLibrary
