import React from 'react'
import {
  Pressable,
  ScrollView,
  Text,
  View,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Modal
} from 'react-native'
import {
  WsState,
  WsStepsTab,
  WsText,
  WsSkeleton,
  WsTabView,
  LlRiskHeaderCalc,
  LlEffectWithAuditRisk,
  WsPaddingContainer,
  WsFlex,
  WsInfo,
  WsModal,
  WsIconBtn,
  WsBtn,
  WsIcon,
  WsModalFooter,
  WsLoading
} from '@/components'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import S_Change from '@/services/api/v1/change'
import S_ChangeAssignment from '@/services/api/v1/change_assignment'
import ChangeAssignmentOverview from '@/sections/Change/Assignment/ChangeAssignmentOverview'
import ChangeAssignmentQuestionsDraft from '@/sections/Change/Assignment/ChangeAssignmentQuestionsDraft'
import S_ChangeRecordAns from '@/services/api/v1/change_record_answer'
import moment from 'moment'

const Preview = ({ route, navigation }) => {
  const { t, i18n } = useTranslation()
  const _stack = navigation.getState().routes

  // Params
  const {
    name,
    changeId,
    changeVersionId,
    systemSubclass,
  } = route.params

  // Redux
  const currentUser = useSelector(state => state.data.currentUser)
  const currentFactory = useSelector(state => state.data.currentFactory)

  // STATES
  const [onSubmitLoading, setOnSubmitLoading] = React.useState(false)

  const [changeAssignmentsId, setChangeAssignmentsId] = React.useState()
  const [assignmentDataList, setAssignmentDataList] = React.useState()

  const [btnRightDisable, setBtnRightDisable] = React.useState(true)
  const [loading, setLoading] = React.useState(true)

  const [tabIndex, settabIndex] = React.useState(0)
  const [tabItems, setTabItems] = React.useState([
    {
      value: 'ChangeAssignmentQuestionsDraft',
      label: t('評估題目'),
      view: ChangeAssignmentQuestionsDraft,
      props: {
      }
    }
  ])

  const $_refreshTabItems = () => {
    const _tabItems = [
      {
        value: 'ChangeAssignmentQuestionsDraft',
        label: t('評估題目'),
        view: ChangeAssignmentQuestionsDraft,
        props: {
          answers: assignmentDataList,
          name,
          changeId,
          changeVersionId,
          systemSubclass,
          changeAssignmentsId
        }
      }
    ]
    setTabItems(_tabItems)
  }

  const $_getChange = async () => {
    // 230928
    const changeAssignments = await S_ChangeAssignment.index({
      params: { change_version: changeVersionId }
    })
    let evaluatorId
    if (changeAssignments.data) {
      changeAssignments.data.forEach(item => {
        if (item.system_subclass && systemSubclass && item.system_subclass.id == systemSubclass.id) {
          evaluatorId = item.id
        }
      })
      setChangeAssignmentsId(evaluatorId)
    }
    // 以下是以前既有的
    const res = await S_Change.show(changeId)
    // 變動評估作業基本資料
    const assignmentData = S_Change.getChangeDataAssignment(res)
    const current = await S_Change.getVersionChangeItem(
      res.last_version.id,
      systemSubclass,
    )
    let content
    if (assignmentData.versions.length > 1) {
      const beforeVersion = assignmentData.versions.find(
        version => assignmentData.lastVersionId !== version.id
      )
      const before = await S_Change.getVersionChangeItem(
        beforeVersion.id,
        systemSubclass,
        currentUser
      )
      content = await S_Change.getContent(
        before.evaluators,
        current.evaluators,
        before.changeItems,
        current.changeItems,
        before.risks,
        current.risks,
        systemSubclass,
        currentUser,
        before.answers,
        current.answers
      )
    } else {
      content = await S_Change.getContent(
        [],
        current.evaluators,
        [],
        current.changeItems,
        [],
        current.risks,
        systemSubclass,
        currentUser,
        [],
        current.answers
      )
    }
    const filteredAssignments = content.filter(assignment => assignment.id === systemSubclass.id);
    setAssignmentDataList(filteredAssignments)
    setLoading(false)
  }

  // SUBMIT
  const $_onHeaderRightPress = () => {
    const _formattedAnswers = S_ChangeRecordAns.formattedAnswers001(assignmentDataList)
    const _validation = S_ChangeRecordAns.validationQuestionSubmit(_formattedAnswers)
    if (_validation === false) {
      Alert.alert(t('有變動項目尚未作答'))
      return
    }
    if (_validation === true) {
      $_putApi(_formattedAnswers)
    }
  }

  // 送出變動答題結果
  const $_putApi = async (_formattedAnswers) => {
    setOnSubmitLoading(true)
    // 提交每一題變動評估結果
    const _datas = _formattedAnswers.map((_risk, index) => {
      return {
        approve_score: parseInt(_risk.score),
        // attaches: _risk.attaches && _risk.attaches.length > 0 ? _risk.attaches : [],
        attaches: _risk.attaches && _risk.attaches.length > 0 ? S_ChangeRecordAns.formattedForFileStore(_risk.attaches) : [],
        change_version: changeVersionId,
        description: _risk.remark,
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
        console.log(_res, '_res 儲存變動評估結果成功');
      })
    } catch (e) {
      console.error(e.message, 'error')
    }
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MyIndex',
          params: {
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

  React.useEffect(() => {
    $_getChange()
  }, [])

  React.useEffect(() => {
    if (assignmentDataList) {
      $_refreshTabItems()
    }
  }, [assignmentDataList])

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

      <StatusBar barStyle={'dark-content'} />
      {loading ? (
        <>
          <SafeAreaView>
            <WsSkeleton />
            <WsSkeleton />
            <WsSkeleton />
          </SafeAreaView>
        </>
      ) : (
        <>
          <WsTabView
            isAutoWidth={true}
            index={tabIndex}
            setIndex={settabIndex}
            items={tabItems}
            scrollEnabled={false}
          />
          <WsModalFooter
            btnLeftHidden={true}
            btnRightText={t('送出')}
            btnRightOnPress={() => {
              $_onHeaderRightPress()
            }}
          />
        </>
      )
      }
    </>
  )
}

export default Preview