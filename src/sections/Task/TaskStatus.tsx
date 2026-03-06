import {
  LlTaskCard001,
  WsPageIndex
} from '@/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'

interface TaskStatusProps {
  status: string;
  navigation: any;
  searchValue: string;
  defaultFilter: any;
}

const TaskStatus: React.FC<TaskStatusProps> = props => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()

  // Props
  const {
    status,
    filterFields,
    filterValue,
    params,
    onParamsChange
  } = props

  return (
    <>
      <WsPageIndex
        modelName={'task'}
        params={params}
        filterFields={filterFields}
        defaultFilterValue={filterValue}
        onParamsChange={(_params: any, filtersValue: any) => onParamsChange(_params, filtersValue)}
        renderItem={({ item, index }) => (
          <>
            <LlTaskCard001
              testID={`LlTaskCard001-${index}`}
              item={item}
              onPress={() => {
                navigation.push('RoutesTask', {
                  screen: 'TaskShow',
                  params: {
                    id: item.id,
                    taskStatus: status
                  }
                })
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

export default TaskStatus
