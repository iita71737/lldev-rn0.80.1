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
import { useIsFocused } from '@react-navigation/native'
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
  const isFocused = useIsFocused()

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
  }, [isFocused]);

  // Field
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
      headerRight: tabIndex == 0 ? () => {
        return (
          <WsIconBtn
            name="md-add"
            color={$color.white}
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              setStateModal(true)
            }}
          />
        )
      } : undefined,
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

  // 選擇教育訓練公版
  const $_templateOnPress = async (template) => {
    // console.log(template,'template--');
    let method = ''
    if (method && method != 'edit') {
      try {
        await AsyncStorage.setItem(
          'TrainingCreate',
          JSON.stringify({
            name: template.name,
            internal_training_template: template,
            internal_training_template_version: template.last_version,
            system_classes:
              S_SystemClass.getSystemClassesObjectWithSystemSubclasses(
                template.system_subclasses
              ),
            system_subclasses: template.system_subclasses
          })
        )
        navigation.push('RoutesTraining', {
          screen: 'TrainingCreate',
        })
        setStateModal(false)
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        await AsyncStorage.setItem(
          'TrainingCreate',
          JSON.stringify({
            name: template.name,
            internal_training_template: template,
            internal_training_template_version: template.last_version,
            system_classes:
              S_SystemClass.getSystemClassesObjectWithSystemSubclasses(
                template.system_subclasses
              ),
            system_subclasses: template.system_subclasses
          })
        )
        navigation.push('RoutesTraining', {
          screen: 'TrainingCreate',
          params: {
            template: template
          }
        })
        setStateModal(false)
      } catch (e) {
        console.error(e);
      }
    }
  }

  // 新增其他
  const $_otherOnPress = async () => {
    let method = ''
    if (method && method != 'edit') {
      try {
        await AsyncStorage.setItem(
          'TrainingUpdate',
          JSON.stringify({
            name: '其他',
            internal_training_template: {
              name: '其他'
            }
          })
        )
        navigation.navigate('TrainingCreate')
      } catch (e) {
        console.error(e);
      }
    } else {
      try {
        await AsyncStorage.setItem(
          'TrainingCreate',
          JSON.stringify({
            name: '其他',
            internal_training_template: {
              name: '其他'
            },
          })
        )
        navigation.push('RoutesTraining', {
          screen: 'TrainingCreate',
          params: {
          }
        })
      } catch (e) {
        console.error(e);
      }
    }
  }

  React.useEffect(() => {
    // 顯示或隱藏新增功能
    $_setNavigationOption()
  }, [tabIndex])

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
                navigation.navigate({
                  name: 'TrainingShow',
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

      <WsModal
        animationType={'fade'}
        visible={stateModal}
        onBackButtonPress={() => {
          setStateModal(false)
        }}
        headerLeftOnPress={() => {
          setStateModal(false)
        }}
        title={t('新增教育訓練')}
      >
        <PickTemplate
          onPress={$_templateOnPress}
          onPressOthers={$_otherOnPress}
        ></PickTemplate>
      </WsModal>
    </>
  )
}
export default TrainingList
