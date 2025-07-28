import React from 'react'
import { ScrollView, View } from 'react-native'
import {
  WsFlex,
  WsPaddingContainer,
  LlTrainingHeaderCard001,
  WsInfo,
  WsIcon,
  WsIconBtn,
  WsText,
  WsBottomSheet,
  WsDialogDelete,
  WsInfoUser,
  WsCardPassage,
  WsCollapsible,
  WsModal,
  WsSkeleton,
  WsTabView,
  LlTrainingTimeRecordCard001,
  LlTrainingCard001
} from '@/components'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import AsyncStorage from '@react-native-community/async-storage'
import $color from '@/__reactnative_stone/global/color'
import S_TrainingGroup from '@/services/api/v1/internal_training_group'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import store from '@/store'
import license from '@/services/api/v1/license'
import { useNavigation } from '@react-navigation/native'
import { useIsFocused } from '@react-navigation/native'
import WsPageIndex from '@/__reactnative_stone/components/WsPageIndex'
import PickTemplate from '@/views/Training/Create/PickTemplate'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'

const TrainingGroupTrainingList = ({ route, ...props }) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const isFocused = useIsFocused()

  // Params
  const id = props?.id || route?.params?.id || null;

  // REDUX
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // MEMO
  const params = React.useMemo(() => {
    return {
      order_by: 'train_at',
      order_way: 'desc',
      lang: 'tw',
      internal_training_groups: id
    }
  }, [isFocused, currentRefreshCounter, id]);

  // States
  const [stateModal, setStateModal] = React.useState(false)
  const [selectVersionId, setSelectVersionId] = React.useState()
  const [dialogVisible, setDialogVisible] = React.useState(false)
  const [training, setTraining] = React.useState(null)
  // const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  // const [bottomSheetItems, setBottomSheetItems] = React.useState([
  //   {
  //     to: {
  //       name: 'TrainingUpdate',
  //       params: {
  //         id: id
  //       }
  //     },
  //     icon: 'ws-outline-edit-pencil',
  //     label: t('編輯記錄')
  //   },
  //   {
  //     onPress: () => {
  //       setDialogVisible(true)
  //     },
  //     color: $color.danger,
  //     labelColor: $color.danger,
  //     icon: 'ws-outline-delete',
  //     label: t('刪除')
  //   }
  // ])
  const [loading, setLoading] = React.useState(false)

  // Services
  const $_fetchTraining = async () => {
    setLoading(true)
    try {
      const res = await S_TrainingGroup.show({ modelId: id })
      setTraining(res)
      $_setStorage(res)
    } catch (e) {
      console.error(e);
    }
  }

  // Storage
  const $_setStorage = async res => {
    const _value = JSON.stringify(res)
    await AsyncStorage.setItem('TrainingUpdate', _value)
  }

  // Options
  const $_setNavigationOption = () => {
    const isExpired = new Date(training?.expired_at) <= new Date()
    navigation.setOptions({
      headerRight: () => {
        if (isExpired) {
          return null; // 如果已过期，不显示 headerLeft
        }
        return (
          <WsIconBtn
            testID={'ws-outline-edit-pencil'}
            name="md-add"
            color={$color.white}
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              // setIsBottomSheetActive(true)
              setStateModal(true)
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
  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
    }
  }

  const $_setArticleText = article => {
    if (article.act_version) {
      return `${article.act_version.name} ${article.no_text}`
    } else if (article.act_versions) {
      return `${article.act_versions[0].name} ${article.no_text}`
    } else {
      return t('無')
    }
  }

  // 選擇教育訓練公版
  const $_templateOnPress = async (template) => {
    let method = ''
    if (method && method != 'edit') {
      try {
        await AsyncStorage.setItem(
          'TrainingCreate',
          JSON.stringify({
            internal_training_groups: id,
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
            internal_training_groups: id,
            name: template.name,
            internal_training_template: template,
            internal_training_template_version: template.last_version,
            system_classes:
              S_SystemClass.getSystemClassesObjectWithSystemSubclasses(
                template.system_subclasses
              ),
            system_subclasses: template.system_subclasses,
            redirect_routes: [
              {
                name: 'TrainingIndex',
                params: {
                  _tabIndex: 1
                }
              },
              {
                name: 'TrainingGroupShow',
                params: {
                  id: id,
                  _tabIndex:1
                }
              }
            ]
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
    $_fetchTraining()
  }, [route, id])

  React.useEffect(() => {
    if (training) {
      $_setNavigationOption()
    }
  }, [training])

  return (
    <>
      <WsPageIndex
        modelName={'internal_training'}
        serviceIndexKey={'index'}
        params={params}
        // filterFields={filterFields}
        // filterValue={defaultFilter}
        renderItem={({ item, index }: { item: TrainingItem, index: number }) => (
          <>
            <WsPaddingContainer
              padding={0}
              style={{
                paddingHorizontal: 16
              }}>
              <LlTrainingCard001
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
          </>
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
      >
        <PickTemplate
          onPress={$_templateOnPress}
          onPressOthers={$_otherOnPress}
        ></PickTemplate>
      </WsModal>
    </>
  )
}
export default TrainingGroupTrainingList
