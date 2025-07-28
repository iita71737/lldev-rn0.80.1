import React from 'react'
import {
  Pressable,
  ScrollView,
  View,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Modal
} from 'react-native'
import {
  WsStepsTab,
  WsDialog,
  WsTabView,
  WsDes,
  WsText,
  WsSkeleton,
  WsPopup,
  WsBtn,
  WsLoading
} from '@/components'
import ChangeAssignmentStep from '@/sections/Change/Assignment/AssignmentStep'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import S_Change from '@/services/api/v1/change'
import S_ChangeItem from '@/services/api/v1/change_item'
import S_Risk from '@/services/api/v1/risk'
import S_ChangeAssignment from '@/services/api/v1/change_assignment'
import S_ChangeRecordAns from '@/services/api/v1/change_record_answer'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { WsEmpty } from '@/components'
import store from '@/store'
import {
  setRefreshCounter,
} from '@/store/data'

const ChangeAssignmentProcedure = ({ route, navigation }) => {
  const { t, i18n } = useTranslation()
  const _stack = navigation.getState().routes

  // Params
  const {
    name,
    changeId,
    changeVersionId,
    systemSubclass,
    risk,
    changeAssignmentsId,
    assignmentDataList
  } = route.params

  // Redux
  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // States
  const [onSubmitLoading, setOnSubmitLoading] = React.useState(false)
  const [disable, setDisable] = React.useState(true)
  const [currentTabIndex, setCurrentTabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState([])
  const [visible, setVisible] = React.useState(false)
  const dialogButtonItems = [
    {
      label: t('確定'),
      onPress: () => {
        setVisible(false)
      }
    }
  ]

  const $_fetchCurrentTabIndex = async () => {
    if (tabItems && tabItems.length > 0) {
      tabItems.forEach((item, dataIndex) => {
        if (item.props && item.props.value && item.props.value.index) {
          const _tabIndex = tabItems.findIndex(_item => _item.props.value.index == risk.index)
          if (_tabIndex > 0) {
            setCurrentTabIndex(_tabIndex)
          }
        }
      })
    }
  }

  const $_setTabItemsViews = () => {
    const _items = []
    assignmentDataList.forEach((data, dataIndex) => {
      if (data.id == systemSubclass.id) {
        data.assignmentList.forEach((assignment, assignmentIndex) => {
          if (assignment.changeList.length != 0) {
            assignment.changeList.forEach((change, changeIndex) => {
              _items.push({
                value: `ChangeAssignmentStep-${assignmentIndex}-${changeIndex}`,
                props: {
                  item: change,
                  assignment: assignment,
                  changeIndex: changeIndex,
                  value: change
                }
              })
            })
          }
        })
      }
    })
    setTabItems(_items)
  }

  const $_onChange = (itemIndex, $event, stateKey, item) => {
    setDisable(true)
    if ($event?.value && stateKey == 'score') {
      item.score = $event
      if ($event?.value == 16) {
        setDisable(false)
      }
    }
    if ($event && stateKey == 'remark') {
      item.remark = $event
      if ($event !== null && $event !== undefined && $event !== '') {
        setDisable(false)
      }
    }
    if ($event && stateKey == 'attaches') {
      item.attaches = $event
      if (tabItems[itemIndex] && (tabItems[itemIndex].props.value.score == 16 || tabItems[itemIndex].props.value.remark != '')) {
        setDisable(false)
      }
    }
  }

  const $_onSubmit = async $event => {
    setOnSubmitLoading(true)
    // 最後驗證
    const validation = $event.find(ans => {
      return !ans.score || ((ans.score == 17 || ans.score == 18) && !ans.remark)
    })
    if (validation) {
      setVisible(true)
      return
    }
    // 提交每一題變動評估結果
    const _datas = $event.map((answer, index) => {
      let _risk = tabItems[index].props.item
      return {
        approve_score: parseInt(answer.score),
        // attaches: _risk.attaches && _risk.attaches.length > 0 ? _risk.attaches : [],
        attaches: _risk.attaches && _risk.attaches.length > 0 ? S_ChangeRecordAns.formattedForFileStore(_risk.attaches) : [],
        change_version: changeVersionId,
        description: answer.remark,
        evaluate_at: moment().utc().format('YYYY-MM-DD'),
        factory: currentFactory ? currentFactory.id : null,
        id: _risk.id ? _risk.id : null,
        name: _risk.name ? _risk.name : _risk.title ? _risk.title : null,
        remark: _risk.remark ? _risk.remark : null,
        question_number: _risk.index,
        risk_template_version: _risk.riskTemplateVersionId,
        risk_version: _risk.riskVersion,
        system_class: _risk.systemClass ? _risk.systemClass.id : null,
        system_subclass: systemSubclass.id,
      }
    })
    // console.log(JSON.stringify(_datas), '_datas');
    let submitList = [];
    try {
      _datas.forEach((resultItem) => {
        if (resultItem.id) {
          submitList.push(
            S_ChangeRecordAns.updateAnswer({
              answerId: resultItem.id,
              data: resultItem
            })
          );
        } else {
          submitList.push(S_ChangeRecordAns.createAnswer({
            data: resultItem
          }));
        }
      });
      await Promise.all(submitList).then(res => {
        Alert.alert(t('變動評估題目送出成功'))
      }).catch(e => {
        console.error(e)
        Alert.alert(t('變動評估題目送出失敗'))
      })
      // 儲存變動評估結果
      const _evaluate_at = moment().utc().format('YYYY-MM-DD HH:mm')
      await S_ChangeAssignment.update({
        modelId: changeAssignmentsId,
        data: {
          evaluate_at: _evaluate_at
        }
      }).then((_res) => {
        console.log(_res, '_res');
      })
    } catch (e) {
      console.error(e.message, 'error')
    }
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'RoutesFactory',
          state: {
            routes: [
              {
                name: 'MyIndex'
              }
            ]
          }
        }
      ],
    });
    setTimeout(() => {
      navigation.push('RoutesChange', {
        screen: 'ChangeAssignmentIndex',
        params: {
          _tabIndex: 1,
        }
      });
    }, 1000);
    setOnSubmitLoading(false)
  }

  const $_backPreview = () => {
    navigation.goBack()
  }

  React.useEffect(() => {
    if (assignmentDataList) {
      $_setTabItemsViews()
    }
  }, [assignmentDataList])

  React.useEffect(() => {
    if (tabItems) {
      $_fetchCurrentTabIndex()
    }
  }, [tabItems])

  return (
    <>
      <Modal
        visible={onSubmitLoading}
        transparent={true}
        onRequestClose={() => {
        }}
      >
        <WsLoading
          type={'b'}
          style={{
            flex: 1,
            zIndex: 9999
          }}
        ></WsLoading>
      </Modal >

      {assignmentDataList && assignmentDataList.length > 0 ? (
        <>
          <KeyboardAwareScrollView
            contentContainerStyle={[
              {
                flex: 1,
              }
            ]}>
            <WsStepsTab
              currentTabIndex={currentTabIndex}
              setCurrentTabIndex={setCurrentTabIndex}
              items={tabItems}
              title={t('變動作業')}
              onSubmit={$event => {
                $_onSubmit($event)
              }}
              viewComponent={ChangeAssignmentStep}
              onChange={(itemIndex, $event, stateKey, item) => {
                $_onChange(itemIndex, $event, stateKey, item)
              }}
              btnRightDisable={disable}
              backBtnOnPress={() => $_backPreview()}
            />
          </KeyboardAwareScrollView>
          <WsDialog
            title="尚有說明未填寫或未答題"
            dialogButtonItems={dialogButtonItems}
            dialogVisible={visible}
            setDialogVisible={() => {
              setVisible(false)
            }}>
            <WsDes>{t('請填寫完畢後再送出')}</WsDes>
          </WsDialog>

          <SafeAreaView>
            <WsBtn
              onPress={() => {
                $_backPreview()
              }}>
              {t('返回')}
            </WsBtn>
          </SafeAreaView>

        </>
      ) : assignmentDataList &&
        assignmentDataList.length == 0 ? (
        <SafeAreaView>
          <WsEmpty
            emptyTitle="無"
            emptyText=""
          ></WsEmpty>
        </SafeAreaView>
      ) : (
        <>
          <SafeAreaView>
            <WsSkeleton />
            <WsSkeleton />
            <WsSkeleton />
          </SafeAreaView>
        </>
      )}
    </>
  )
}

export default ChangeAssignmentProcedure
