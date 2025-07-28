import React from 'react'
import {
  View,
  Image,
  FlatList,
  FlatListProps
} from 'react-native'
import {
  WsFlex,
  WsText,
  LlActLibraryArticleCard001,
  WsSkeleton,
  WsCard,
  WsCollapsible,
  WsIcon,
  WsBtn,
  WsLoading,
  WsEmpty
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import S_Act from '@/services/api/v1/act'

interface LlActTypeCard001Props {
  iconRight?: string;
  iconRightSize?: number;
  iconRightColor?: string;
  item: any;
  _actTypeId: number;
  actType: any;
  params: any;
  testID?: string;
}

const LlActTypeCard001: React.FC<LlActTypeCard001Props> = (props) => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()

  const {
    iconRight = 'md-chevron-up',
    iconRightSize = 24,
    iconRightColor = $color.gray,
    parentIsCollapsed,
    actType,
    params,
    testID,
    to
  } = props

  // STATES
  const [currentPage, setCurrentPage] = React.useState(1)
  const [lastPage, setLastPage] = React.useState()
  const [loading, setLoading] = React.useState(true)
  const [isCollapsed, setIsCollapsed] = React.useState(true)
  const [actWithActTypes, setActWithActTypes] = React.useState([])

  // SERVICE
  const updatePageValue = async (page: number) => {
    setLoading(true)
    try {
      const _params = {
        ...params,
        order_by: 'announce_at',
        order_way: 'desc',
        time_field: 'announce_at',
        act_type: actType?.id,
        page: page ? page : currentPage,
        lang: 'tw',
      }
      const res = await S_Act.indexAll({
        params: _params
      })
      const isSamePage = page === currentPage || page === undefined;
      const _acts = isSamePage
        ? [...new Set([...res.data])]
        : [...new Set([...actWithActTypes, ...res.data])];
      setCurrentPage(res.meta?.current_page)
      setLastPage(res.meta?.last_page)
      setActWithActTypes(_acts)
      setLoading(false)
    } catch (e) {
      console.error(e);
    }
  }

  // HELPER
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

  // 法條層級
  const renderInnerItem002 = ({ item, index }) => {
    const _icon = item.act_type && item.act_type.icon
    if (item.act_type &&
      item.act_type.id == actType.id &&
      _icon &&
      item.last_version &&
      item.last_version.name) {
      return (
        <View key={index}
          style={
            [{
              marginVertical: 1,
            }
            ]}
        >
          <LlActLibraryArticleCard001
            testID={`LlActLibraryArticleCard001-${index}`}
            item={item}
            text={item.last_version && item.last_version.name ? item.last_version.name : ''}
            img={_icon}
            isChange={$_isChangeInThreeMonths(
              item.last_version.announce_at
            )}
            style={{
              padding: 16,
              marginHorizontal: 16,
            }}
            onPress={() => {
              if (to) {
                // ActChangeReportShow
                navigation.push('RoutesAct', {
                  screen: to,
                  params: {
                    id: item.id
                  }
                })
              } else {
                navigation.push('RoutesAct', {
                  screen: 'ActShow',
                  params: {
                    id: item.id
                  }
                })
              }

            }}
          />
        </View >
      );
    }
  }

  return (
    <>
      <TouchableOpacity
        testID={testID}
        onPress={async () => {
          await updatePageValue(currentPage)
          setIsCollapsed(!isCollapsed)
        }}
      >
        <WsCard
          style={[
            {
              marginHorizontal: 16,
              paddingVertical: 8,
              paddingHorizontal: 16,
              flex: 0,
              backgroundColor: $color.primary11l,
              marginTop: 16,
              marginBottom: 2
            }
          ]}>
          <WsFlex>
            <WsFlex
              style={{
                height: 22,
                flex: 1
              }}>
              <Image
                source={{ uri: actType.icon }}
                style={{
                  width: 22,
                  height: 22
                }}
                alt={actType.name}

              />
              <WsText
                style={{
                  marginLeft: 6,
                }}>
                {t(actType.name)}
              </WsText>
            </WsFlex>

            {iconRight && (
              <WsIcon
                name={isCollapsed ? 'md-chevron-down' : 'md-chevron-up'}
                size={iconRightSize}
                color={iconRightColor}
              />
            )}
          </WsFlex>
        </WsCard>
      </TouchableOpacity>

      <WsCollapsible isCollapsed={isCollapsed}>
        {isCollapsed === false && (
          <View
            style={{
              marginBottom: 16,
            }}
          >
            {actWithActTypes && actWithActTypes.length > 0 ? (
              <FlatList
                data={actWithActTypes}
                renderItem={({ item, index }: { item: any, index: number }) => renderInnerItem002({ item, index })}
                keyExtractor={(item, index) => item + index}
                ListEmptyComponent={() => {
                  return (
                    <WsText style={{ padding: 16 }}>{`找不到符合篩選條件的結果`}</WsText>
                  )
                }}
                ListFooterComponent={
                  <>
                    {
                      (currentPage != lastPage) && loading &&
                      (
                        <View
                          style={{
                            transform: [{ rotate: '180deg' }],
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <WsLoading size={30}></WsLoading>
                        </View>
                      )}
                    {currentPage !== lastPage && !loading && (
                      <View
                        style={{
                          marginTop: 8,
                          marginHorizontal: 16
                        }}
                      >
                        <WsBtn
                          onPress={() => {
                            updatePageValue(currentPage + 1)
                          }}
                          style={{
                          }}
                          borderColor={$color.gray}
                          borderWidth={0.4}
                          textColor={$color.gray}
                          color={$color.white}
                          borderRadius={25}>
                          {t('載入更多')}
                        </WsBtn>
                      </View>
                    )}
                  </>
                }
              />
            ) : (
              <WsEmpty emptyTitle={'找不到符合篩選條件的結果'} emptyText={''} />
            )}

          </View>
        )}
      </WsCollapsible>
    </>
  )
}

export default LlActTypeCard001