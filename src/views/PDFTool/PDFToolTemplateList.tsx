import React from 'react'
import { View } from 'react-native'
import {
  LlActCard001,
  WsSnackBar,
  WsPageIndex,
  LlGuidelineCard001,
  WsIconBtn,
  WsBottomSheet,
  LlPDFToolListCard001
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

const PDFToolTemplateList: React.FC<ActListingProps> = ({ route }) => {
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
      label: t('編輯時間'),
      time_field: 'updated_at'
    },
    meeting_template_type: {
      type: 'belongsto',
      label: t('類型'),
      nameKey: 'name',
      modelName: 'meeting_template_type',
      serviceIndexKey: 'index',
      placeholder: t('選擇')
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
          name: 'PDFToolAdminCreateTemplate',
          params: {
          }
        },
        icon: 'md-add',
        label: t('新增範本')
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
        modelName={'meeting_template'}
        serviceIndexKey={'index'}
        params={_params}
        searchLabel={'名稱'}
        filterFields={filterFields}
        hasMeta={false}
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
              <LlPDFToolListCard001
                key={item.id}
                ownerVisible={true}
                item={item}

                onPress={() => {
                  navigation.push('RoutesPDFTool', {
                    screen: 'PDFToolAdminTemplateShow',
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
        snapPoints={[168, 148]}
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

export default PDFToolTemplateList
