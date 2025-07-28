import React from 'react'
import {
  ScrollView,
  View,
  Alert
} from 'react-native'
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
  WsAvatar,
  WsDes,
  WsState,
  WsLoading
} from '@/components'
import ViewArticleShowForModal from '@/views/Act/ArticleShowForModal'
import AsyncStorage from '@react-native-community/async-storage'
import $color from '@/__reactnative_stone/global/color'
import S_Training from '@/services/api/v1/training'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import store from '@/store'
import {
  setRefreshCounter
} from '@/store/data'
import S_TrainingGroup from '@/services/api/v1/internal_training_group'
import TrainingRecordList from '@/sections/Training/TrainingRecordList'
import TrainingGroupUserTotalTimeRecord from '@/sections/Training/TrainingGroup/TrainingGroupUserTotalTimeRecord'
import TrainingGroupTrainingList from '@/sections/Training/TrainingGroup/TrainingGroupTrainingList'
import TrainingGroupTaskList from '@/sections/Training/TrainingGroup/TrainingGroupTaskList'
import S_InternalTrainingGroup from '@/services/api/v1/internal_training_group'


const TrainingShow = ({ route, navigation }) => {
  const { t, i18n } = useTranslation()

  // Field
  const [filterFields] = React.useState({
    button: {
      type: 'date_range',
      label: t('訓練日期'),
      time_field: 'train_at'
    },
  })

  // Params
  const {
    id,
    _tabIndex
  } = route.params

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // States
  const [loading, setLoading] = React.useState(true)

  const [name, setName] = React.useState()
  const [total_trained_hours, setTotal_trained_hours] = React.useState()
  const [owner, setOwner] = React.useState()
  const [internal_trainings, setInternal_trainings] = React.useState([])
  const [modalActive, setModalActive] = React.useState(false)
  const [dialogVisible, setDialogVisible] = React.useState(false)

  const [trainingGroup, setTrainingGroup] = React.useState()

  const [index, setIndex] = React.useState(_tabIndex ? _tabIndex : 0)
  const [tabItems, setTabItems] = React.useState([
    {
      value: 'TrainingGroupUserTotalTimeRecord',
      label: t('人員總時數列表'),
      view: TrainingGroupUserTotalTimeRecord,
      props: {
        id: id,
        tabIndex: index
      }
    },
    {
      value: 'TrainingGroupTrainingList',
      label: t('教育訓練列表'),
      view: TrainingGroupTrainingList,
      props: {
      }
    },
    {
      value: 'TrainingGroupTaskList',
      label: t('相關任務'),
      view: TrainingGroupTaskList,
      props: {
      }
    },
  ])

  const $_setTabItems = () => {
    setTabItems([
      {
        value: 'TrainingGroupUserTotalTimeRecord',
        label: t('人員總時數列表'),
        view: TrainingGroupUserTotalTimeRecord,
        props: {
          id: id,
          tabIndex: index
        }
      },
      {
        value: 'TrainingGroupTrainingList',
        label: t('教育訓練列表'),
        view: TrainingGroupTrainingList,
        props: {
          id: trainingGroup ? trainingGroup.id : undefined,
          tabIndex: index
        }
      },
      {
        value: 'TrainingGroupTaskList',
        label: t('相關任務'),
        view: TrainingGroupTaskList,
        props: {
          id: trainingGroup ? trainingGroup.id : undefined,
          tabIndex: index
        }
      },
    ])
    setLoading(false)
  }

  // Services
  const $_fetchTrainingGroup = async () => {
    setLoading(true)
    try {
      const res = await S_TrainingGroup.show({ modelId: id })
      setTrainingGroup(res)
      if (res) {
        const _params = {
          internal_training_groups: res?.id,
          order_way: 'desc',
          order_by: 'train_at',
          get_all: 1
        }
        const res2 = await S_Training.index({ params: _params })
        setInternal_trainings(res2.data)
        setName(res.name)
        setOwner(res.owner)
        setTotal_trained_hours(res.total_trained_hours.toString())
      }
    } catch (e) {
      console.error(e);
    }
  }
  // submit
  const $_submit = async () => {
    if (trainingGroup && trainingGroup.id) {
      const _params = {
        id: trainingGroup.id,
        name: name,
        total_trained_hours: total_trained_hours,
        owner: (owner && owner.id) ? owner.id : undefined,
        internal_trainings: internal_trainings && internal_trainings.length > 0 ? internal_trainings.map(_ => _.id) : [],
      };
      console.log(_params, '_params');
      S_InternalTrainingGroup.update({ params: _params })
        .then(async (res) => {
          Alert.alert('編輯教育訓練群組成功');

          store.dispatch(setRefreshCounter(currentRefreshCounter + 1));
        })
        .catch(error => {
          Alert.alert('編輯教育訓練群組失敗');
          console.error('Error during API process:', error);
        });
    }
  }

  React.useEffect(() => {
    if (id) {
      $_fetchTrainingGroup()
    }
  }, [id, currentRefreshCounter])

  React.useEffect(() => {
    $_setTabItems()
  }, [index, trainingGroup])

  return (
    <>
      {loading && (
        <View
          style={{
            transform: [{ rotate: '180deg' }],
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <WsLoading size={30}></WsLoading>
        </View>
      )}

      {(trainingGroup &&
        !loading &&
        name) && (
          <WsPaddingContainer
            style={{
              backgroundColor: $color.white,
            }}
          >
            <WsFlex justifyContent="space-between" alignItems="flex-start">
              <WsText
                style={{
                  flex: 1,
                  // borderWidth:1,
                }}
                size={24}>
                {trainingGroup.name}
              </WsText>

              {name && (
                <WsIconBtn
                  style={{
                    marginRight: 8
                  }}
                  name="md-edit"
                  padding={0}
                  size={28}
                  onPress={() => {
                    setModalActive(true)
                  }}
                />
              )}
              <WsIconBtn
                style={{
                }}
                name="md-delete"
                padding={0}
                size={28}
                onPress={() => {
                  setDialogVisible(true)
                }}
              />
            </WsFlex>

            <WsPaddingContainer
              padding={0}
              style={{
                marginTop: 16,
                paddingHorizontal: 8,
                backgroundColor: $color.white,
              }}>

              {/* 0 will get error */}
              {trainingGroup.total_trained_hours != undefined && (
                <View
                  style={{
                    marginTop: 4
                  }}
                >
                  <WsInfo
                    labelWidth={100}
                    value={trainingGroup.total_trained_hours ? trainingGroup.total_trained_hours : t('無')}
                    label={t('總訓練時數')}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}
                  />
                </View>
              )}

              {trainingGroup.owner && (
                <>
                  <View
                    style={{
                      marginTop: 4
                    }}
                  >
                    <WsInfo
                      labelWidth={100}
                      type="user"
                      label={t('管理者')}
                      value={trainingGroup.owner}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    />
                  </View>
                </>
              )}

              {trainingGroup.updated_at && (
                <>
                  <View
                    style={{
                      marginTop: 4
                    }}
                  >
                    <WsInfo
                      labelWidth={100}
                      label={t('更新時間')}
                      value={moment(trainingGroup.updated_at).format('YYYY-MM-DD HH:mm:ss')}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}
                    />
                  </View>
                </>
              )}
            </WsPaddingContainer>
          </WsPaddingContainer>
        )}

      {tabItems && !loading && (
        <WsTabView
          scrollEnabled={true}
          items={tabItems}
          index={index}
          isAutoWidth={true}
          setIndex={setIndex}
        />
      )}

      <WsModal
        visible={modalActive}
        onBackButtonPress={() => {
          setModalActive(false)
        }}
        headerLeftOnPress={() => {
          setModalActive(false)
        }}
        headerRightOnPress={() => {
          $_submit()
          setModalActive(false)
        }}
        // RightOnPressIsDisabled={$_validation()}
        headerRightText={trainingGroup?.id ? t('儲存') : t('儲存')}
        title={t('編輯教育訓練群組')}
      >
        <ScrollView>
          <WsPaddingContainer>
            <WsState
              type="text"
              style={{
                marginVertical: 8
              }}
              label={t('名稱')}
              value={name}
              onChange={setName}
              rules={'required'}
            />
            <WsState
              type="number"
              style={{
                marginVertical: 8
              }}
              label={t('總訓練時數')}
              value={total_trained_hours}
              onChange={setTotal_trained_hours}
              rules={'required'}
            />
            <WsState
              type="user"
              modelName="user"
              nameKey="name"
              label={t('管理者')}
              value={owner}
              onChange={setOwner}
              rules={'required'}
            />
            <WsState
              type="belongstomany"
              modelName={'internal_training'}
              nameKey={'name'}
              nameKey2={'train_at'}
              showListBelow={true}
              pagination={true}
              label={t('教育訓練')}
              style={{
                marginTop: 16
              }}
              params={{
                order_by: 'train_at',
                order_way: 'desc',
              }}
              filterVisible={true}
              searchBarVisible={true}
              filterFields={filterFields}
              placeholder={t('教育訓練...')}
              value={internal_trainings}
              onChange={setInternal_trainings}
            />
          </WsPaddingContainer>
        </ScrollView>
      </WsModal>

      <WsDialogDelete
        id={trainingGroup?.id}
        to="TrainingIndex"
        toTabIndex="1"
        modelName="internal_training_group"
        visible={dialogVisible}
        text={t('確定刪除嗎？')}
        setVisible={setDialogVisible}
      />
    </>
  )
}
export default TrainingShow
