import React from 'react'
import { Pressable, Dimensions, ScrollView } from 'react-native'
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

const UpdateAssignChange = ({ navigation }) => {
  const { t, i18n } = useTranslation()

  // State
  const [loading, setLoading] = React.useState(false)
  const [createValue, setCreateValue] = React.useState({})
  const [assignmentValue, setAssignmentValue] = React.useState([])
  const [submitDisable, setSubmitDisable] = React.useState(false)

  // Storage
  const $_setCreateValueFromStorage = async () => {
    const _item = await AsyncStorage.getItem('ChangeUpdate')
    const _value = JSON.parse(_item)
    $_getChangeAssignmentSystemSubclasses(_value)
  }
  const $_setStorage = async () => {
    await AsyncStorage.setItem('ChangeUpdate', JSON.stringify(createValue))
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
    setLoading(true)
    setSubmitDisable(true)
    const _formatted = S_WaSa.getPostData(changeModels.getFields(), createValue)

    // 1.更新變動計畫
    const _change = await S_Change.update({
      data: {
        change_status: createValue.change_status
      },
      modelId: createValue.id
    })
    // 2.建立變動計畫版本
    const _changeVersion = await S_ChangeVersion.create({
      data: _formatted,
      parentId: _change.id
    })
    // 3.建立變動項目版本
    if (createValue && createValue.changes) {
      const _changeItems = await S_ChangeItem.createFromFormatedDatas(
        createValue.changes,
        _change,
        _changeVersion
      )
      // 4.建立變動項目風險版本
      const _risks = await S_Risk.createFromFormatedData(
        createValue.changes,
        _changeItems,
        _changeVersion
      )

      // 5.更新變動計畫版本
      const changeVersion = await S_ChangeVersion.update({
        modelId: createValue.id,
        data: {
          owner: createValue.owner.id,
          expired_date: createValue.expired_date,
          attaches: createValue.attaches
        }
      })

      // 6.建立變動作業
      const assignment = await S_ChangeAssignment.createDatasFormat(
        createValue,
        _change.id,
        _changeVersion.id
      )

      Promise.all([_change, _changeVersion, _changeItems, _risks, assignment]).then(values => {
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
      });
    }
    await AsyncStorage.removeItem('ChangeUpdate')
  }

  // setOption
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <WsBtn
            isDisabled={submitDisable}
            minHeight={40}
            isFullWidth={false}
            style={{
              marginRight: 16
            }}
            onPress={() => {
              $_onSubmit()
            }}>
            {t('送出')}
          </WsBtn>
        )
      },
      headerLeft: () => {
        return (
          <WsIconBtn
            disabled={submitDisable}
            name={'md-arrow-back'}
            onPress={() => { navigation.goBack() }}
            size={22}
            color={$color.white}
          />
        )
      }
    })
  }

  React.useEffect(() => {
    $_setCreateValueFromStorage()
  }, [])

  React.useEffect(() => {
    $_setNavigationOption()
  }, [submitDisable, createValue])

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
        ></WsLoading>
      ) : (
        <ScrollView>
          <WsPaddingContainer>
            <WsState
              type="date"
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
                      key={subClass.id}
                      type="user"
                      modelName="user"
                      nameKey="name"
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
                <Pressable onPress={() => { }}>
                  <WsText color={$color.primary} size={14}>
                    {t('點此前往成員設定頁')}
                  </WsText>
                </Pressable>
              </>
            )}
          </WsPaddingContainer>
        </ScrollView>
      )
      }
    </>
  )
}

export default UpdateAssignChange
