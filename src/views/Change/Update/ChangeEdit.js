import React from 'react'
import { View, Dimensions } from 'react-native'
import { WsStepsTab, WsStateFormView } from '@/components'
import ChangeCreateStep from '@/sections/Change/Create/CreateStep'
import S_ChangeAssignment from '@/services/api/v1/change_assignment'
import S_ChangeVersion from '@/services/api/v1/change_version'
import AsyncStorage from '@react-native-community/async-storage'
import { useSelector } from 'react-redux'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

const ChangeEdit = ({ route, navigation }) => {
  const { t, i18n } = useTranslation()
  // Params
  const { change, versionId } = route.params

  // Redux
  const factoryId = useSelector(state => state.data.currentFactory.id)

  // State
  const [isSubmitable, setIsSubmitable] = React.useState(false)
  const [fields, setFields] = React.useState({})
  const [assignments, setAssignments] = React.useState()
  const [initValue, setInitValue] = React.useState()

  // Services
  const $_fetchAssignments = async () => {
    const res = await S_ChangeAssignment.index({
      params: {
        change_version: versionId
      }
    })
    setAssignments(res.data)
  }
  const $_onSubmit = async $event => {
    // Change version Update
    const changeVersion = await S_ChangeVersion.update({
      modelId: versionId,
      data: {
        owner: $event.owner.id,
        expired_date: $event.expired_date,
        attaches: $event.attaches
      }
    })
    // Assignment Update
    const _datas = []
    assignments.forEach(assignment => {
      _datas.push({
        change_version: versionId,
        id: assignment.id,
        change: change.id,
        evaluator: assignment.evaluator.id,
        evaluate_at: assignment.evaluate_at
          ? $event[assignment.system_subclass.id].id != assignment.evaluator.id
            ? ''
            : moment(assignment.evaluate_at).format('YYYY-MM-DD')
          : ''
      })
    })
    const createdAssignments = await S_ChangeAssignment.updateAll(_datas)
    navigation.goBack()
  }

  // Function
  const $_setFields = () => {
    const _assignmentFields = {}
    assignments.forEach(assignment => {
      _assignmentFields[`'system_subclass'${assignment.system_subclass.id}`] = {
        label: assignment.system_subclass.name,
        type: 'belongsto',
        nameKey: 'name',
        modelName: 'user',
        serviceIndexKey: 'simplifyFactoryIndex',
        customizedNameKey: 'userAndEmail',
      }
    })
    const _field = {
      name: {
        label: t('名稱'),
        editable: false
      },
      owner: {
        type: 'belongsto',
        label: t('負責人'),
        nameKey: 'name',
        modelName: 'user'
      },
      expired_date: {
        type: 'date',
        label: t('到期日')
      },
      ..._assignmentFields,
      attaches: {
        type: 'filesAndImages',
        label: t('附件'),
        uploadUrl: `factory/${factoryId}/change_version/attach`
      }
    }
    setFields(_field)
  }
  const $_setInitValues = () => {
    const _assignmentvalue = {}
    assignments.forEach(assignment => {
      _assignmentvalue[`'system_subclass'${assignment.system_subclass.id}`] = assignment.evaluator
    })
    setInitValue({
      name: change.name,
      owner: change.last_version.owner,
      expired_date: change.last_version.expired_date,
      ..._assignmentvalue,
      attaches: change.last_version.attaches
    })
  }

  React.useEffect(() => {
    $_fetchAssignments()
  }, [])

  React.useEffect(() => {
    if (assignments) {
      $_setFields()
      $_setInitValues()
    }
  }, [assignments])

  // Render
  return (
    <>
      <WsStateFormView
        isSubmitable={isSubmitable}
        setIsSubmitable={setIsSubmitable}
        fields={fields}
        initValue={initValue}
        onSubmit={$_onSubmit}
      />
    </>
  )
}
export default ChangeEdit
