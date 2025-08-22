import React from 'react'
import { View } from 'react-native'
import {
  WsFilter,
  LlBtn002,
  WsPaddingContainer,
  LlTrainingCard001,
  WsPageIndex,
  WsIconBtn,
  WsModal
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import AsyncStorage from '@react-native-community/async-storage'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import PickTemplate from '@/views/Training/Create/PickTemplate'

interface TrainingListProps {
  tabIndex: number;
  searchValue: string;
  defaultFilter: any;
}

interface TrainingItem {
  id: number;
}

const TrainingList: React.FC<TrainingListProps> = props => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()

  // Props
  const {
    tabIndex,
    searchValue,
    defaultFilter
  } = props

  // STATES
  const [stateModal, setStateModal] = React.useState(false)

  // MEMO
  const params = React.useMemo(() => {
    return {
      order_by: 'train_at',
      order_way: 'desc',
      time_field: 'train_at',
      timezone: 'Asia/Taipei',
      lang: 'tw'
    }
  }, []);

  // Field
  const [filterFields] = React.useState({
    button: {
      type: 'date_range',
      label: t('日期'),
      time_field: 'created_at'
    },
    created_user: {
      type: 'belongstomany',
      label: t('管理者'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required'
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

  // Options
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <WsIconBtn
            name="md-add"
            color={$color.white}
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              navigation.navigate('StatisticsCreate')
            }}
          />
        )
      },
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
  }, [])

  return (
    <>
      <WsPageIndex
        modelName={'internal_training'}
        params={params}
        extendParams={searchValue}
        filterFields={filterFields}
        filterValue={defaultFilter}
        renderItem={({ item, index }: { item: TrainingItem, index: number }) => (
          <WsPaddingContainer
            key={index}
            padding={0}
            style={{
              paddingHorizontal: 16
            }}>
            <LlTrainingCard001
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
                navigation.push('RoutesStatistics', {
                  screen: 'StatisticsShow',
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
export default TrainingList
