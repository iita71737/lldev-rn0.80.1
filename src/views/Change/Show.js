import React, { useState } from 'react'
import {
  View,
  Pressable,
  ScrollView,
  Modal,
  StyleSheet,
  Text
} from 'react-native'
import {
  WsTag,
  WsText,
  WsTabView,
  WsFlex,
  WsPaddingContainer,
  WsBottomSheet,
  WsIconBtn,
  WsDialogDelete,
  WsDialog,
  WsStateFormModal,
  WsSubtaskCard
} from '@/components'
import AsyncStorage from '@react-native-community/async-storage'
import $color from '@/__reactnative_stone/global/color'
import S_Change from '@/services/api/v1/change'
import S_ChangeAssignment from '@/services/api/v1/change_assignment'
import S_Task from '@/services/api/v1/task'
import S_Wasa from '@/__reactnative_stone/services/wasa/index'
import EvaluateResult from '@/sections/Change/EvaluateResult'
import PlanData from '@/sections/Change/PlanData'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

const ChangeShow = ({ route, navigation }) => {
  const { t, i18n } = useTranslation()

  // Params
  const { id, versionId, from } = route.params

  // Redux
  const currentUser = useSelector(state => state.stone_auth.currentUser)
  const factory = useSelector(state => state.data.currentFactory)

  const fields = {
    name: {
      label: t('主旨'),
      rules: 'required'
    },
    remark: {
      label: t('說明'),
      type: 'text',
      placeholder: t('輸入')
    },
    taker: {
      type: 'belongsto',
      label: t('負責人'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
    },
    expired_at: {
      type: 'date',
      placeholder: t('YYYY-MM-DD'),
      label: t('期限'),
      rules: 'required',
      getMinimumDate: () => {
        return moment().format('YYYY-MM-DD')
      }
    },
    sub_tasks: {
      rules: 'at_least',
      type: 'models',
      fields: {
        name: {
          text: t('新增'),
          label: t('主旨'),
          autoFocus: true,
          rules: 'required'
        },
        remark: {
          label: t('說明'),
          rules: 'required'
        },
        taker: {
          type: 'belongsto',
          label: `${t('執行者')}`,
          nameKey: 'name',
          valueKey: 'id',
          modelName: 'user',
          serviceIndexKey: 'simplifyFactoryIndex',
          customizedNameKey: 'userAndEmail',
          rules: 'required'
        },
        expired_at: {
          type: 'date',
          label: `${t('期限')}`,
          rules: 'required'
        },
        file_attaches: {
          label: `${t('附件')}`,
          type: 'Ll_filesAndImages',
          modelName: 'change',
        }
      },
      renderCom: WsSubtaskCard,
      renderItem: ({ item, itemIndex }) => {
        return (
          <WsSubtaskCard
            name={item.name}
            modalItem={item.name}
            fields={fields.sub_tasks.fields}
            value={item}
          />
        )
      }
    },
    system_subclasses: {
      type: 'modelsSystemClass',
      placeholder: t('選擇'),
      disabled: true,
      label: t('領域'),
      rules: 'required'
    },
    relationChange: {
      type: 'card',
      cardType: 'relativeChange',
      modelId: id,
      info: true,
      label: t('相關變動'),
      displayCheck(fieldsValue) {
        if (fieldsValue.relationChange) {
          return true
        } else {
          return false
        }
      }
    },
  }

  // State
  const [dialogVisible, setDialogVisible] = React.useState(false)
  const [stoppedDialogVisible, setStoppedDialogVisible] = React.useState(false)
  const [closedDialogVisible, setClosedDialogVisible] = React.useState(false)
  const [restartDialogVisible, setRestartDialogVisible] = React.useState(false)
  const [startDialogVisible, setStartDialogVisible] = React.useState(false)
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [initValue, setInitValue] = React.useState()

  const [modalVisible, setModalVisible] = React.useState(false)
  const [change, setChange] = React.useState()
  const [tabIndex, settabIndex] = React.useState(0)
  const [statusChange, setStatusChange] = React.useState('')
  const tabItems = [
    {
      value: 'PlanData',
      label: t('總覽'),
      view: PlanData,
      props: {
        id: id,
        navigation: navigation
      }
    },
    {
      value: 'EvaluateResult',
      label: t('評估題目'),
      view: EvaluateResult,
      props: {
        id: id,
        versionId: versionId,
        navigation: navigation
      }
    }
  ]

  const [bottomSheetItems, setBottomSheetItems] = React.useState([])
  const stoppedDialogButton = [
    {
      label: t('取消'),
      onPress: () => {
        setStoppedDialogVisible(false)
      },
      color: $color.gray
    },
    {
      label: t('確定'),
      onPress: () => {
        $_stoppedChange()
      },
      color: $color.primary
    }
  ]
  const closedDialogButton = [
    {
      label: t('取消'),
      onPress: () => {
        setClosedDialogVisible(false)
      },
      color: $color.gray
    },
    {
      label: t('確認結案'),
      onPress: () => {
        $_closedChange()
      },
      color: $color.primary
    }
  ]
  const restartDialogButton = [
    {
      label: t('取消'),
      onPress: () => {
        setRestartDialogVisible(false)
      },
      color: $color.gray
    },
    {
      label: t('確定重啟'),
      onPress: () => {
        $_restartChange()
      },
      color: $color.primary
    }
  ]
  const startDialogButton = [
    {
      label: t('略過'),
      onPress: () => {
        setStartDialogVisible(false)
      },
      color: $color.gray
    },
    {
      label: t('建立任務'),
      onPress: () => {
        $_startChange()
      },
      color: $color.primary
    }
  ]

  // Services
  const $_fetchChange = async () => {
    const res = await S_Change.show(id)
    setChange(res)
    setInitValue({
      name: `${res.name}-${t('相關任務')}`,
      system_classes: res.last_version.system_classes,
      taker: res.last_version.owner,
      relationChange: res.last_version.id,
      system_subclasses: res.last_version.system_subclasses
    })
  }

  // Function
  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
    }
  }
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight:
        currentUser &&
          change.last_version.owner &&
          currentUser.id === change.last_version.owner.id
          ? () => {
            return (
              <>
                <WsIconBtn
                  name="ws-outline-edit-pencil"
                  size={24}
                  color={$color.white}
                  style={{
                    marginRight: 4
                  }}
                  onPress={() => {
                    setIsBottomSheetActive(!isBottomSheetActive)
                  }}
                />
              </>
            )
          }
          : undefined,
      headerLeft: () => {
        return (
          <WsIconBtn
            testID="backButton"
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
      },
    })
  }
  const $_setBottomSheetItems = () => {
    const _items = []
    if (change.change_status != 2) {
      _items.push(
        {
          onPress: () => {
            goEditChange(change)
          },
          icon: 'ws-outline-edit-pencil',
          label: t('編輯')
        },
        {
          onPress: () => {
            setStoppedDialogVisible(true)
          },
          icon: 'md-not-interested',
          label: t('中止計畫')
        }
      )
    }
    if (change.change_status == 1) {
      _items.push({
        onPress: () => {
          setStartDialogVisible(true)
        },
        icon: 'ws-outline-check-circle-outline',
        label: t('啟動計畫')
      })
    }
    if (change.change_status == 2) {
      _items.push({
        onPress: () => {
          setRestartDialogVisible(true)
        },
        icon: 'ws-outline-retry',
        label: t('重啟計畫')
      })
    }
    if (change.change_status == 3) {
      _items.push({
        onPress: () => {
          setClosedDialogVisible(true)
        },
        icon: 'md-inbox',
        label: t('結案')
      })
    }
    _items.push({
      onPress: () => {
        goUpdateChange(change)
      },
      icon: 'md-update',
      label: t('更新')
    })
    _items.push({
      onPress: () => {
        setDialogVisible(true)
      },
      icon: 'ws-outline-delete',
      label: t('刪除')
    })
    setBottomSheetItems(_items)
  }

  const $_stoppedChange = async () => {
    const res = await S_Change.stopChange(id)
    setStatusChange('stop')
    setStoppedDialogVisible(false)
  }

  const $_restartChange = async () => {
    const res = await S_Change.restartChange(id)
    setStatusChange('start')
    setRestartDialogVisible(false)
  }
  const $_closedChange = () => {
    setStatusChange('close')
  }
  const $_startChange = () => {
    setStartDialogVisible(false)
    setModalVisible(true)
  }
  const goEditChange = async change => {
    await AsyncStorage.setItem('ChangeEdit', JSON.stringify(change))
    navigation.navigate({
      name: 'ChangeEdit',
      params: {
        versionId: versionId,
        change: change
      }
    })
  }
  const goUpdateChange = async change => {
    let _change = JSON.parse(JSON.stringify(change))
    _change.owner = change.last_version.owner ? change.last_version.owner : null
    await AsyncStorage.setItem('ChangeUpdate', JSON.stringify(_change))
    navigation.navigate({
      name: 'ChangeUpdate',
      params: {
        id: versionId
      }
    })
  }
  const $_onTaskSubmit = async $event => {
    // create task api
    const _formattedValue = S_Wasa.getPostData(fields, $event)
    const _data = S_Task.getFormattedDataForCreate(_formattedValue, currentUser.id)
    try {
      const res = await S_Task.create({
        data: _data
      })
      AsyncStorage.removeItem('TaskCreate')
    } catch (e) {
      console.log(e.message, '===error===')
    }
    // start change api
    try {
      await S_Change.startChange(
        factory.id,
        id
      );
    } catch (err) {
      console.log(err);
    }
  }

  React.useEffect(() => {
    $_fetchChange()
  }, [statusChange])

  React.useEffect(() => {
    if (change) {
      // $_setNavigationOption()
      $_setBottomSheetItems()
    }
  }, [change])

  React.useEffect(() => {
    if (change) {
      // $_setNavigationOption()
    }
  }, [isBottomSheetActive])

  React.useEffect(() => {
    if (change) {
      // $_setNavigationOption()
    }
  }, [modalVisible])

  // Render
  return (
    <>
      {modalVisible && (
        <WsStateFormModal
          fields={fields}
          initValue={initValue}
          visible={modalVisible}
          onSubmit={$event => {
            $_onTaskSubmit($event)
            setModalVisible(false)
          }}
          onClose={() => setModalVisible(false)}
        />
      )}
      {!modalVisible && (
        <>
          {change && (
            <>
              <WsPaddingContainer
                style={{
                  backgroundColor: $color.white,
                  marginBottom: 8
                }}>
                <WsFlex
                  justifyContent="space-between"
                  alignItems="flex-start">
                  <WsText size={24} style={{ flex: 1 }}>
                    {change.name}
                  </WsText>
                  <WsTag
                    backgroundColor={
                      change.change_status == 1
                        ? $color.yellow11l
                        : change.change_status == 2
                          ? $color.gray6l
                          : change.change_status == 3
                            ? $color.green11l
                            : $color.gray3d
                    }
                    textColor={
                      change.change_status == 1 || change.change_status == 2
                        ? $color.gray3d
                        : change.change_status == 3
                          ? $color.green
                          : $color.white
                    }>
                    {change.change_status == 1
                      ? t('評估中')
                      : change.change_status == 2
                        ? t('中止')
                        : change.change_status == 3
                          ? t('執行中')
                          : t('已結案')}
                  </WsTag>
                </WsFlex>
                <WsFlex
                  style={{
                    marginRight: 16,
                  }}
                  flexWrap="wrap"
                >
                  {change.last_version.system_subclasses.map(
                    (subClass, subClassIndex) => {
                      return (
                        <WsTag
                          key={`${subClass.id}_${change.name}`}
                          img={subClass.icon}
                          style={{
                            marginTop: 8,
                            marginRight: 8,
                          }}>
                          {t(subClass.name)}
                        </WsTag>
                      )
                    }
                  )}
                </WsFlex>
              </WsPaddingContainer>

              <WsTabView
                items={tabItems}
                index={tabIndex}
                setIndex={settabIndex}
                isAutoWidth={true}
                scrollEnabled={true}
              />

            </>
          )}

          <WsBottomSheet
            isActive={isBottomSheetActive}
            onDismiss={() => {
              setIsBottomSheetActive(false)
            }}
            items={bottomSheetItems}
            snapPoints={[148, 288]}
            onItemPress={$_onBottomSheetItemPress}
          />
          <WsDialogDelete
            id={id}
            to="ChangeIndex"
            modelName="change"
            visible={dialogVisible}
            title={t('確定刪除嗎')}
            setVisible={setDialogVisible}
          />
          <WsDialog
            dialogVisible={stoppedDialogVisible}
            setDialogVisible={setStoppedDialogVisible}
            title={t('確定中止嗎')}
            dialogButtonItems={stoppedDialogButton}
            contentHeight={168}>
            <WsText>
              {t('中止計畫之後，每個評估者將收到變動計畫中止通知。')}
            </WsText>
          </WsDialog>
          <WsDialog
            dialogVisible={closedDialogVisible}
            setDialogVisible={setClosedDialogVisible}
            title={t('確定結案嗎')}
            dialogButtonItems={closedDialogButton}>
            <WsText>{t('結案之後，每個評估者將收到變動計畫結案通知。')}</WsText>
          </WsDialog>
          <WsDialog
            dialogVisible={restartDialogVisible}
            setDialogVisible={setRestartDialogVisible}
            title={t('確定重啟嗎？')}
            dialogButtonItems={restartDialogButton}
            contentHeight={168}>
            <WsText>
              {t('重啟計畫之後，每個評估者將收到變動計畫重新啟動通知。')}
            </WsText>
          </WsDialog>
          <WsDialog
            dialogVisible={startDialogVisible}
            setDialogVisible={setStartDialogVisible}
            title={t('即將啟動計畫')}
            dialogButtonItems={startDialogButton}
            contentStyle={{
              paddingBottom: 0,
              width: 310,
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop: 16,
              paddingBottom: 16,
              paddingLeft: 16,
              backgroundColor: 'white',
              borderRadius: 10,
              flexWrap: 'wrap'
            }}>
            <WsFlex
              style={{
                paddingRight: 24,
                width: 310
              }}>
              <WsText size={14}>
                {t('若你的計畫需要指派任務給他人執行，建議在此按下「建立任務」。若暫時不需委派任務，你也可以先選擇「略過」，待日後有需要時再來建立任務。')}
              </WsText>
            </WsFlex>
          </WsDialog>
        </>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    backgroundColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: '#F194FF'
  },
  buttonClose: {
    backgroundColor: '#2196F3'
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center'
  }
})

export default ChangeShow
