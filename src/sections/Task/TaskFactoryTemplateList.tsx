import React from 'react'
import {
  Pressable,
  ScrollView,
  View,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Dimensions
} from 'react-native'
import {
  LlTaskTemplateCard001,
  WsPageIndex,
  WsSnackBar,
} from '@/components'
import { useTranslation } from 'react-i18next'
import S_TaskFactoryTemplate from '@/services/api/v1/task_factory_template'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'

const TaskFactoryTemplateList: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentFactoryTags = useSelector(state => state.data.factoryTags)

  // State
  const [refreshCounter, setRefreshCounter] = React.useState(0)
  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('已儲存至「我的收藏」')
  )
  const [filterValue, setFilterValue] = React.useState<any>();
  const [filterFields] = React.useState<any>({
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    },
    button: {
      type: 'date_range',
      label: t('建立日期'),
      time_field: 'created_at'
    },
    factory_tags: {
      type: 'checkbox',
      label: t('標籤'),
      items: currentFactoryTags ? currentFactoryTags : [],
      searchVisible: true,
      selectAllVisible: false,
      defaultSelected: false
    },
  })

  // MEMO
  const __params = React.useMemo(() => {
    const _params = {
      refresh_counter: refreshCounter
    }
    return _params
  }, [refreshCounter]);

  const bookmarkOnPress = async (item: any) => {
    try {
      if (!item?.id) {
        return
      }
      if (item?.is_collect) {
        setIsSnackBarVisible(false)
        setIsSnackBarVisible(true)
        setSnackBarText(t('已從我的收藏中移除'))
        await S_TaskFactoryTemplate.unCollect(item.id)
      } else {
        setIsSnackBarVisible(false)
        setIsSnackBarVisible(true)
        setSnackBarText(t('已儲存至「我的收藏」'))
        await S_TaskFactoryTemplate.collect(item.id)
      }
      setRefreshCounter(prev => prev + 1)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <>
      <WsSnackBar
        text={snackBarText}
        setVisible={setIsSnackBarVisible}
        visible={isSnackBarVisible}
        quickHidden={true}
      />
      <WsPageIndex
        modelName={'task_factory_template'}
        params={__params}
        filterFields={filterFields}
        defaultFilterValue={filterValue}
        // onParamsChange={(_params: any, filtersValue: any) => onParamsChange(_params, filtersValue)}
        renderItem={({ item, index }) => (
          <>
            <LlTaskTemplateCard001
              testID={`LlTaskTemplateCard001-${index}`}
              item={item}
              onPress={() => {
                navigation.push('TaskTemplateShow', {
                  id: item?.id
                })
              }}
              is_collect={item?.is_collect}
              is_collect_visible={true}
              bookmarkOnPress={() => {
                bookmarkOnPress(item)
              }}
            />
          </>
        )}
        emptyTitle={t('目前尚無資料')}
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
      >
      </WsPageIndex>
    </>
  )
}

export default TaskFactoryTemplateList
