import React from 'react'
import {
  LlTaskTemplateCard001,
  WsPageIndex,
  WsSnackBar,
} from '@/components'
import { useTranslation } from 'react-i18next'
import S_TaskFactoryTemplate from '@/services/api/v1/task_factory_template'
import { useNavigation } from '@react-navigation/native'

const TaskTemplateColloction: React.FC = () => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const [refreshCounter, setRefreshCounter] = React.useState(0)
  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('已儲存至「我的收藏」')
  )

  const __params = React.useMemo(() => {
    const _params = {
      refresh_counter: refreshCounter
    }
    return _params
  }, [refreshCounter])

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
        serviceIndexKey={'authCollectIndex'}
        params={__params}
        renderItem={({ item, index }) => (
          <>
            <LlTaskTemplateCard001
              testID={`LlTaskTemplateCard001-collect-${index}`}
              item={item}
              onPress={() => {
                navigation.push('TaskTemplateShow', {
                  id: item?.id
                })
              }}
              is_collect={true}
              is_collect_visible={true}
              bookmarkOnPress={() => {
                bookmarkOnPress(item)
              }}
            />
          </>
        )}
        emptyTitle={t('目前尚無資料')}
      >
      </WsPageIndex>
    </>
  )
}

export default TaskTemplateColloction
