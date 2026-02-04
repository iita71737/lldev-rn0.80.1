import React from 'react'
import { View } from 'react-native'
import { WsPageIndex, LlPDFToolListCard001 } from '@/components'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
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
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // MEMO
  const _params = React.useMemo(() => {
    const params = {
      lang: 'tw',
      order_by: 'updated_at',
      order_way: 'desc'
    }
    return params
  }, [currentRefreshCounter]);

  // States
  const [filterFields] = React.useState({
    meeting_template_type: {
      type: 'belongstomany',
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
    button: {
      type: 'date_range',
      label: t('編輯時間'),
      time_field: 'updated_at'
    },
  })

  return (
    <>
      <WsPageIndex
        modelName={'meeting_template'}
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
              <LlPDFToolListCard001
                key={item.id}
                ownerVisible={true}
                item={item}
                module={'meeting_template'}
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
    </>
  )
}

export default PDFToolTemplateList
