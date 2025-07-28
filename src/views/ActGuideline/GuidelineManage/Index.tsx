import React from 'react'
import { View } from 'react-native'
import {
  LlActCard001,
  WsSnackBar,
  WsPageIndex,
  LlGuidelineCard001,
  WsIconBtn,
  WsBottomSheet
} from '@/components'
import S_Act from '@/services/api/v1/act'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { SafeAreaView } from 'react-native-safe-area-context'
import $color from '@/__reactnative_stone/global/color'
import { scopePermission, scopeSubscriptions } from '@/__reactnative_stone/global/permission'
import AsyncStorage from '@react-native-community/async-storage'
import S_GuidelineAdmin from '@/services/api/v1/guideline_admin'
import S_GuidelineVersionAdmin from '@/services/api/v1/guideline_version_admin'
import store from '@/store'
import {
  setRefreshCounter,
} from '@/store/data'
import { useNavigation } from '@react-navigation/native'
interface ActListingProps {
  navigation: any;
  searchValue?: string;
  defaultFilter?: any;
}

const GuidelineList: React.FC<ActListingProps> = ({ route }) => {
  const { t } = useTranslation()
  const navigation = useNavigation()

  // Redux
  const currentUser = useSelector(state => state.data.currentUser)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentUserScope = useSelector(state => state.data.userScopes)

  // MEMO
  const _params = React.useMemo(() => {
    const params = {
      lang: 'tw',
      order_by: 'announce_at',
      order_way: 'desc',
    }
    return params
  }, [currentRefreshCounter]);

  // States
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [bottomSheetItems, setBottomSheetItems] = React.useState([])

  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('已儲存至「我的收藏」')
  )
  const [filterFields] = React.useState({
    button: {
      type: 'date_range',
      label: t('修正發布日'),
      time_field: 'announce_at'
    },
    owner: {
      type: 'belongsto',
      label: t('管理者'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      placeholder: t('選擇')
    },
    guideline_status: {
      label: t('施行狀態'),
      placeholder: t('選擇'),
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
    has_unreleased: {
      type: 'checkbox',
      label: t('發布狀態'),
      items: [
        {
          id: 0,
          name: t('發布'),
        },
        {
          id: 1,
          name: t('未發布'),
        },
      ]
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

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: true ? () => {
        return (
          <WsIconBtn
            name="md-add"
            color={$color.white}
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              setIsBottomSheetActive(true)
            }}
          />
        )
      } : undefined,
      headerLeft: () => {
        return (
          <WsIconBtn
            testID="backButton"
            name="ws-outline-arrow-left"
            color="white"
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              navigation.goBack()
            }}
          />
        );
      }
    });
  }

  const $_setBottomSheet = () => {
    setBottomSheetItems([
      {
        to: {
          name: 'GuidelineAdminCreate',
          params: {
          }
        },
        icon: 'md-add',
        label: t('新增內規')
      }
    ])
  }
  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
    }
  }

  // 編輯內規
  const $_onPressEdit = async (item: object) => {
    try {
      const _res = await S_GuidelineAdmin.show({ modelId: item.id })
      const _data = {
        ..._res.last_version,
        ..._res,
      }
      const _formatted = S_GuidelineAdmin.formattedBeforeEdit(_data)
      const _value = JSON.stringify(_formatted)
      await AsyncStorage.setItem('GuidelineAdminUpdate', _value)
      store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
      navigation.push('RoutesAct', {
        screen: 'GuidelineAdminUpdate',
        params: {
          id: item.id
        }
      })
    } catch (e: any) {
      console.log(e.message, 'error')
    }
  }

  // 更版
  const $_onPressGuidelineVersionAdminStore = async (item: any) => {
    try {
      const _res = await S_GuidelineAdmin.show({ modelId: item.id })
      const _data = {
        ..._res.last_version,
        ..._res,
        guideline: item.id
      }
      const _formatted = S_GuidelineVersionAdmin.formattedDataForRouteToGuidelineAdminUpdateVersion(_data)
      const _value = JSON.stringify(_formatted)
      await AsyncStorage.setItem('GuidelineAdminUpdateVersion', _value)
      navigation.push('RoutesAct', {
        screen: 'GuidelineAdminUpdateVersion',
        params: {
          id: item.id
        }
      })
    } catch (e: any) {
      console.log(e.message, 'error')
    }
  }

  // 刪版
  const $_onPressGuidelineVersionAdminDelete = async (item: any) => {
    try {
      const _res = await S_GuidelineVersionAdmin.delete({ modelId: item.last_version?.id })
      if (_res) {
        navigation.reset({
          index: 0,
          routes: [{
            name: 'GuidelineAdminIndex',
            params: {
            }
          }],
        });
      }
    } catch (e: any) {
      console.log(e.message, 'error')
    }
  }

  React.useEffect(() => {
    $_setNavigationOption()
    $_setBottomSheet()
  }, [])

  return (
    <>
      <WsSnackBar
        text={snackBarText}
        setVisible={setIsSnackBarVisible}
        visible={isSnackBarVisible}
        quickHidden={true}
      />
      <WsPageIndex
        modelName={'guideline_admin'}
        serviceIndexKey={'index'}
        params={_params}
        searchLabel={'名稱'}
        filterFields={filterFields}
        ListFooterComponent={() => {
          return (
            <>
              <View
                style={{
                  height: 50,
                }}
              >
              </View>
            </>
          )
        }}
        renderItem={({ item, index, isLastItem }) => {
          return (
            <>
              <LlGuidelineCard001
                key={item.id}
                ownerVisible={true}
                tags={item.factory_tags}
                item={item}
                is_collect_visible={false}
                title={item.last_version ? item.last_version.name : null}
                announce_at_visible={true}
                effect_at_visible={false}
                deletable={currentUserScope ? scopePermission(['guideline-admin-destroy', 'guideline-admin-destroy-owner'], currentUserScope) : false}
                editable={true}
                updatable={true}
                onPressEdit={(item: any) => {
                  $_onPressEdit(item)
                }}
                onPressGuidelineVersionAdminStore={(item: any) => {
                  $_onPressGuidelineVersionAdminStore(item)
                }}
                onPressGuidelineVersionAdminDelete={(item: any) => {
                  $_onPressGuidelineVersionAdminDelete(item)
                }}
                guideline_status={item.guideline_status}
                isChange={
                  item && item.updated_at ?
                    S_Act.getActUpdateDateBadge(item.updated_at) : null
                }
                onPress={() => {
                  navigation.push('RoutesAct', {
                    screen: 'GuidelineAdminShow',
                    params: {
                      id: item.id,
                    }
                  })
                }}
                style={{
                  marginTop: 8,
                  marginHorizontal: 16
                }}
              />
            </>
          )
        }}
      >
      </WsPageIndex>

      <WsBottomSheet
        snapPoints={[148, 148]}
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        items={bottomSheetItems}
        onItemPress={$_onBottomSheetItemPress}
      />
    </>
  )
}

export default GuidelineList
