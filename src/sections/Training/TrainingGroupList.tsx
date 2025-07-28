import React from 'react'
import {
  View,
  ScrollView,
  Dimensions,
  Alert
} from 'react-native'
import {
  WsFilter,
  LlBtn002,
  WsPaddingContainer,
  LlTrainingCard001,
  WsPageIndex,
  WsIconBtn,
  WsModal,
  WsState,
  LlTrainingGroupCard001
} from '@/components'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import { useIsFocused } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import AsyncStorage from '@react-native-community/async-storage'
import S_InternalTrainingGroup from '@/services/api/v1/internal_training_group'
import store from '@/store'
import {
  setRefreshCounter
} from '@/store/data'
import S_Training from '@/services/api/v1/training'


interface TrainingListProps {
  tabIndex: number;
  searchValue: string;
  defaultFilter: any;
}

interface TrainingItem {
  id: number;
}

const TrainingGroupList: React.FC<TrainingListProps> = props => {
  const { t } = useTranslation()
  const navigation = useNavigation<any>()
  const isFocused = useIsFocused()
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    tabIndex,
    searchValue,
    defaultFilter,
  } = props

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  // STATES
  const [editId, setEditId] = React.useState()
  const [modalActive, setModalActive] = React.useState(false)

  const [name, setName] = React.useState()
  const [total_trained_hours, setTotal_trained_hours] = React.useState()
  const [owner, setOwner] = React.useState()
  const [internal_trainings, setInternal_trainings] = React.useState([])

  // MEMO
  const params = React.useMemo(() => {
    return {
      order_by: 'train_at',
      order_way: 'desc',
      lang: 'tw'
    }
  }, [isFocused, currentRefreshCounter]);

  // Field
  const [filterFields] = React.useState({
    button: {
      type: 'date_range',
      label: t('日期'),
      time_field: 'train_at'
    },
  })

  // Options
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: tabIndex == 1 ? () => {
        return (
          <WsIconBtn
            name="md-add"
            color={$color.white}
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              $_clearFieldValue()
              setEditId(null)
              setModalActive(true)
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

  // clear
  const $_clearFieldValue = () => {
    setEditId(null)
    setName(null)
    setOwner(null)
    setTotal_trained_hours(null)
    setInternal_trainings(null)
  }


  // submit
  const $_submit = async () => {
    if (editId) {
      const _params = {
        id: editId,
        name: name,
        total_trained_hours: total_trained_hours,
        owner: (owner && owner.id) ? owner.id : undefined,
        internal_trainings: internal_trainings && internal_trainings.length > 0 ? internal_trainings.map(_ => _.id) : [],
      };
      console.log(_params, '_params');
      S_InternalTrainingGroup.update({ params: _params })
        .then(async (res) => {
          Alert.alert('編輯教育訓練群組成功');
          $_clearFieldValue()
          store.dispatch(setRefreshCounter(currentRefreshCounter + 1));
        })
        .catch(error => {
          Alert.alert('編輯教育訓練群組失敗');
          console.error('Error during API process:', error);
        });
    } else {
      const _params = {
        name: name,
        total_trained_hours: total_trained_hours,
        owner: (owner && owner.id) ? owner.id : undefined,
        internal_trainings: internal_trainings && internal_trainings.length > 0 ? internal_trainings.map(_ => _.id) : [],
      };
      // console.log(_params, '_params');
      S_InternalTrainingGroup.create({ params: _params })
        .then(async (res) => {
          $_clearFieldValue()
          store.dispatch(setRefreshCounter(currentRefreshCounter + 1));
        })
        .catch(error => {
          console.error('Error during API process:', error);
        });
    }
  }

  const $_validation = () => {
    return name && total_trained_hours && owner;
  }

  React.useEffect(() => {
    // 顯示或隱藏新增功能
    $_setNavigationOption()
  }, [tabIndex])

  return (
    <>
      <WsPageIndex
        modelName={'internal_training_group'}
        params={params}
        extendParams={searchValue}
        renderItem={({ item, index }: { item: TrainingItem, index: number }) => (
          <>
            <View
              style={{
                paddingHorizontal: 16,
              }}
            >
              <LlTrainingGroupCard001
                item={item}
                onPressEdit={async (item) => {
                  setEditId(item.id)
                  const _params = {
                    internal_training_groups: item.id
                  }
                  const res = await S_Training.index({ params: _params })
                  setInternal_trainings(res.data)
                  setName(item.name)
                  setOwner(item.owner)
                  setTotal_trained_hours(item.total_trained_hours.toString())
                  setModalActive(true)
                }}
                onPress={() => {
                  navigation.push('RoutesTraining', {
                    screen: 'TrainingGroupShow',
                    params: {
                      id: item.id
                    }
                  })
                }}
              />
            </View>
          </>
        )}
      >
      </WsPageIndex>

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
        RightOnPressIsDisabled={!$_validation()}
        headerRightText={editId ? t('儲存') : t('儲存')}
        title={editId ? t('編輯教育訓練群組') : t('新增教育訓練群組')}
      >
        <ScrollView>
          <WsPaddingContainer>
            <WsState
              stateStyle={
                [
                  {
                  },
                  !name
                    ? {
                      borderWidth: 1,
                      borderRadius: 10,
                      borderColor: $color.danger,
                      backgroundColor: $color.danger11l
                    }
                    : null,
                ]}
              type="text"
              style={{
                marginVertical: 8
              }}
              label={t('名稱')}
              placeholder={t('輸入')}
              value={name}
              onChange={setName}
              rules={'required'}
              errorMessage={!name && [t('此項目為必填')]}
            />
            <WsState
              stateStyle={
                [
                  {
                  },
                  !total_trained_hours
                    ? {
                      borderWidth: 1,
                      borderRadius: 10,
                      borderColor: $color.danger,
                      backgroundColor: $color.danger11l
                    }
                    : null,
                ]}
              type="number"
              style={{
                marginVertical: 8
              }}
              maxLength={4}
              label={t('總訓練時數')}
              placeholder={t('輸入')}
              value={total_trained_hours}
              onChange={setTotal_trained_hours}
              rules={'required'}
              errorMessage={!total_trained_hours && [t('此項目為必填')]}
            />
            <WsState
              stateStyle={
                [
                  {
                  },
                  !owner
                    ? {
                      borderWidth: 1,
                      borderRadius: 10,
                      borderColor: $color.danger,
                      backgroundColor: $color.danger11l
                    }
                    : null,
                ]}
              type="user"
              modelName="user"
              nameKey="name"
              label={t('管理者')}
              value={owner}
              onChange={setOwner}
              rules={'required'}
              errorMessage={!owner && [t('此項目為必填')]}
            />
            <WsState
              type="belongstomany"
              modelName={'internal_training'}
              nameKey={'name'}
              nameKey2={'train_at'}
              params={{
                order_by: 'train_at',
                order_way: 'desc',
                time_field: 'train_at'
              }}
              label={t('教育訓練')}
              style={{
                marginTop: 16
              }}
              filterVisible={true}
              searchBarVisible={true}
              filterFields={filterFields}
              placeholder={'選擇'}
              value={internal_trainings}
              onChange={setInternal_trainings}
              showListBelow={true}
              pagination={true}
            />
          </WsPaddingContainer>
        </ScrollView>
      </WsModal>
    </>
  )
}
export default TrainingGroupList
