import React from 'react'
import { Pressable, Dimensions, ScrollView, TouchableOpacity } from 'react-native'
import {
  WsPaddingContainer,
  WsText,
  WsState,
  WsBtn,
  WsLoading,
  WsIconBtn
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import AsyncStorage from '@react-native-community/async-storage'
import { useSelector } from 'react-redux'
import changeModels from '@/models/change'
import S_WaSa from '@/__reactnative_stone/services/wasa/index'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class.js'
import S_Change from '@/services/api/v1/change'
import S_ChangeVersion from '@/services/api/v1/change_version'
import S_ChangeItem from '@/services/api/v1/change_item'
import S_ChangeAssignment from '@/services/api/v1/change_assignment'
import S_Risk from '@/services/api/v1/risk'
import { useTranslation } from 'react-i18next'

const AssignChange = ({ navigation }) => {
  const { t, i18n } = useTranslation()

  // State
  const [loading, setLoading] = React.useState(false)
  const [createValue, setCreateValue] = React.useState({})
  const [assignmentValue, setAssignmentValue] = React.useState([])
  const [btnDisable, setDisable] = React.useState(true)

  // Storage
  const $_setCreateValueFromStorage = async () => {
    const _item = await AsyncStorage.getItem('ChangeCreate')
    const _value = JSON.parse(_item)
    $_getChangeAssignmentSystemSubclasses(_value)
  }
  const $_setStorage = async () => {
    await AsyncStorage.setItem('ChangeCreate', JSON.stringify(createValue))
  }

  // Function
  const $_getChangeAssignmentSystemSubclasses = value => {
    const _systemSubClasses = [...$_setDateFromChangeAssignmentOther(value)]
    value.changes.forEach(change => {
      // From Change Item Template
      if (change.systemSubclasses && change.factor_score != 12) {
        change.systemSubclasses.forEach(systemSubclass => {
          const _hasSubClass = _systemSubClasses.find(_createSubclass => {
            return systemSubclass.id == _createSubclass.id
          })
          if (!_hasSubClass) {
            _systemSubClasses.push(systemSubclass)
          }
        })
      }
    })
    setCreateValue({
      ...value,
      system_subclasses: _systemSubClasses
    })
  }
  const $_setDateFromChangeAssignmentOther = value => {
    const lenght = value.changes.length - 1
    let _subClassDatas = []
    const _systemSubclasses = []
    if (value.changes[lenght].other) {
      value.changes[lenght].other.forEach((assignment, assignmentIndex) => {
        assignment.system_subclasses.forEach(subClass => {
          const _hasSubClass = _systemSubclasses.find(_subClass => {
            return subClass.id == _subClass.id
          })
          if (!_hasSubClass) {
            _systemSubclasses.push(subClass)
          }
        })
      })
    }
    return _systemSubclasses
  }
  const $_setAssignment = ($event, subClass, subClassIndex) => {
    // WsStateValue
    const _assignmentValue = [...assignmentValue]
    if (_assignmentValue.length == 0) {
      createValue.system_subclasses.forEach(_subClasses => {
        _assignmentValue.push({})
      })
    }
    Array.prototype.splice.apply(
      _assignmentValue,
      [subClassIndex, 1].concat($event)
    )
    setAssignmentValue(_assignmentValue)

    // CreateValue
    if ($event) {
      const _assignment = createValue.change_assignment
        ? createValue.change_assignment
        : []
      _assignment.push({
        evaluator: $event.id,
        system_subclass: subClass.id
      })
      setCreateValue({
        ...createValue,
        change_assignment: _assignment
      })
    }
  }
  const $_onSubmit = async () => {
    const _formatted = S_WaSa.getPostData(changeModels.getFields(), createValue)
    // Create Change
    const _change = await S_Change.create({ name: createValue.name })
    // Create Change Version
    const _changeVersion = await S_ChangeVersion.create({
      data: _formatted,
      parentId: _change.id
    })
    // Create Change Item with version
    if (createValue && createValue.changes) {
      const _changeItems = await S_ChangeItem.createFromFormatedDatas(
        createValue.changes,
        _change,
        _changeVersion
      )
      // Create Risk with version
      const _risks = await S_Risk.createFromFormatedData(
        createValue.changes,
        _changeItems,
        _changeVersion
      )
      // Create Change Assignment
      const assignment = await S_ChangeAssignment.createDatasFormat(
        createValue,
        _change.id,
        _changeVersion.id
      )

      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'ChangeIndex'
          },
          {
            name: 'ChangeShow',
            params: {
              id: _change.id,
              versionId: _changeVersion.id,
            }
          }
        ],
        key: null
      })
    }
    await AsyncStorage.removeItem('ChangeCreate')
  }

  const $_valueValidation = () => {
    if (createValue.system_subclasses && createValue.change_assignment && createValue.expired_date) {
      setDisable(false)
    } else {
      setDisable(true)
    }
  }

  // setOption
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <WsBtn
            isDisabled={btnDisable || loading ? true : false}
            minHeight={40}
            isFullWidth={false}
            style={{
              marginRight: 16
            }}
            onPress={() => {
              setDisable(true)
              setLoading(true)
              $_onSubmit()
            }}>
            {t('送出')}
          </WsBtn>
        )
      },
      headerLeft: () => (
        <>
          <WsIconBtn
            disabled={btnDisable || loading ? true : false}
            name={'md-arrow-back'}
            onPress={() => {
              navigation.goBack()
            }}
            size={22}
            color={$color.white}
          />
        </>
      )
    })
  }

  React.useEffect(() => {
    $_setCreateValueFromStorage()
  }, [])

  React.useEffect(() => {
    if (createValue) {
      $_valueValidation()
      $_setNavigationOption()
    }
  }, [btnDisable, createValue])

  React.useEffect(() => {
    if (createValue) {
      $_setStorage()
    }
  }, [createValue])

  return (
    <>
      {loading ? (
        <WsLoading
          type="b"
          style={{
            flex: 1,
            backgroundColor: 'rgba(3,13,31,0.15)'
          }}
        />
      ) : (
        <ScrollView>
          <WsPaddingContainer>
            <WsState
              type="date"
              rules="required"
              label={t('到期日')}
              onChange={$event => {
                setCreateValue({
                  ...createValue,
                  expired_date: $event
                })
              }}
            />
            {createValue && createValue.system_subclasses && (
              <>
                {createValue.system_subclasses.map((subClass, subClassIndex) => {
                  return (
                    <WsState
                      rules="required"
                      style={{
                        marginTop: 16
                      }}
                      key={subClass.id}
                      type="user"
                      modelName="user"
                      nameKey="name"
                      pressText="選擇指定評估人員"
                      label={subClass.name}
                      value={assignmentValue[subClassIndex]}
                      onChange={$event => {
                        $_setAssignment($event, subClass, subClassIndex)
                      }}
                    />
                  )
                })}
                <WsText
                  style={{
                    marginVertical: 16
                  }}
                  size={14}
                  color={$color.gray2d}>
                  {t('沒有想找的人員？')}
                </WsText>
                <TouchableOpacity onPress={() => { }}>
                  <WsText color={$color.primary} size={14}>
                    {t('點此前往成員設定頁')}
                  </WsText>
                </TouchableOpacity>
              </>
            )}
          </WsPaddingContainer>
        </ScrollView>
      )}
    </>
  )
}

export default AssignChange
