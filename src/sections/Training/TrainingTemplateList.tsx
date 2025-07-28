import React from 'react'
import {
  WsFilter,
  LlBtn002,
  WsPaddingContainer,
  LlTrainingCard001,
  WsPageIndex,
  WsIconBtn
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

interface TrainingTemplateListProps {
  tabIndex: number;
  searchValue: string;
}

interface TrainingItem {
  id: number;
}


const TrainingTemplateList: React.FC<TrainingTemplateListProps> = props => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()

  // Props
  const {
    tabIndex
  } = props

  // States
  const [params] = React.useState({
    order_by: 'created_at',
    order_way: 'desc',
    get_all: 0,
  })

  const [filterFields] = React.useState({
    button: {
      type: 'date_range',
      label: t('日期'),
      time_field: 'created_at'
    },
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    }
  })

  // Options
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: undefined,
      headerLeft: () => {
        return (
          <WsIconBtn
            testID={"backButton"}
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
        )
      }
    })
  }

  React.useEffect(() => {
    // 顯示或隱藏新增功能
    $_setNavigationOption()
  }, [tabIndex])

  return (
    <>
      <WsPageIndex
        modelName={'internal_training_template'}
        params={params}
        filterFields={filterFields}
        renderItem={({ item, index }: { item: TrainingItem, index: number }) => (
          <WsPaddingContainer
            padding={0}
            style={{
              paddingHorizontal: 16
            }}>
            <LlTrainingCard001
              modelName={'internal_training_template'}
              testID={`LlTrainingCard001-${index}`}
              item={item}
              style={[
                index != 0
                  ? {
                    marginTop: 8
                  }
                  : {
                    marginTop: 8
                  }
              ]}
              onPress={() => {
                navigation.navigate({
                  name: 'TrainingTemplateShow',
                  params: {
                    id: item.id
                  }
                })
              }}
            />
          </WsPaddingContainer>
        )}
      >
      </WsPageIndex>
    </>
  )
}
export default TrainingTemplateList
