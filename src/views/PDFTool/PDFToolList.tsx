import React from 'react'
import { View } from 'react-native'
import { WsSnackBar, WsPageIndex, LlPDFToolListCard001 } from '@/components'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
interface ActListingProps {
  navigation: any;
  searchValue?: string;
  defaultFilter?: any;
}

const PDFToolList: React.FC<ActListingProps> = ({ route }) => {
  const { t } = useTranslation()
  const navigation = useNavigation()

  // Redux
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // MEMO
  const _params = React.useMemo(() => {
    const params = {
      lang: 'tw',
      order_by: 'updated_at',
      order_way: 'desc',
    }
    return params
  }, [currentRefreshCounter]);

  // States
  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('已儲存至「我的收藏」')
  )
  const [filterFields] = React.useState({
    factory_tags: {
      type: 'checkbox',
      label: t('標籤'),
      storeKey: "factoryTags",
      searchVisible: true,
      selectAllVisible: false,
      defaultSelected: false
    },
    owner: {
      type: 'belongsto',
      label: t('負責人'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      placeholder: t('選擇')
    },
    button: {
      type: 'date_range',
      label: t('編輯時間'),
      time_field: 'updated_at',
    },
  })

  return (
    <>
      <WsSnackBar
        text={snackBarText}
        setVisible={setIsSnackBarVisible}
        visible={isSnackBarVisible}
        quickHidden={true}
      />

      <WsPageIndex
        modelName={'meeting'}
        serviceIndexKey={'index'}
        params={_params}
        searchLabel={t('標題')}
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
              <LlPDFToolListCard001
                module={'meeting'}
                key={item.id}
                ownerVisible={true}
                item={item}
                onPress={() => {
                  navigation.push('RoutesPDFTool', {
                    screen: 'PDFToolAdminShow',
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
    </>
  )
}

export default PDFToolList
