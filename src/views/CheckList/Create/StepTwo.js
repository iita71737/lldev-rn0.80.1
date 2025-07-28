import React, { useEffect } from 'react'
import { View, ScrollView, Text } from 'react-native'
import {
  WsPaddingContainer,
  WsBtn,
  WsText,
  WsIcon,
  WsInfo,
  WsIconBtn,
  WsSkeleton,
  LlQuestionPickTemplate,
  LlCreateQuestionCard,
  // LlCustomTemplateCard
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import AsyncStorage from '@react-native-community/async-storage'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import S_CheckListQuestionTemplate from '@/services/api/v1/checklist_question_template'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import store from '@/store'
import { setCurrentCheckListCreateData } from '@/store/data'

const CheckListCreateStepTwo = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  // Params
  const { fields, name } = route.params

  // redux
  const factoryId = useSelector(state => state.data.currentFactory.id)

  // States
  const [loading, setLoading] = React.useState(true)
  const [createValue, setCreateValue] = React.useState()
  const [quesWithTemplate, setQuesWithTemplate] = React.useState([])
  const [stateSwitch, setStateSwitch] = React.useState(false)
  const [isStorageMounted, setStorageIsMounted] = React.useState(false)

  const [selectedQuestions, setSelectedQuestions] = React.useState([])
  const [defaultCustomizeQuesValue, setDefaultCustomizeQuesValue] =
    React.useState({
      title: '自訂題目',
      keypoint: 0,
      question_type: 2
    })

  // Fields
  const quesStateFields = {
    title: {
      label: t('標題'),
      placeholder: t('輸入'),
      editable: false,
      rules: 'required'
    },
    keypoint: {
      type: 'radio',
      label: t('重點關注'),
      items: [
        { label: t('是'), value: 1 },
        { label: t('否'), value: 0 }
      ],
      rules: 'required'
    },
    control_limit_lower: {
      type: 'number',
      placeholder: t('管制界線下限'),
      label: t('Control Limit (管制界線) 下限'),
      displayCheck(fieldsValue) {
        return fieldsValue.question_type == 1
      },
      updateValueOnChange(event, value, field) {
        if (value.question_type == 1) {
          field.rules = 'required'
        }
      }
    },
    control_limit_upper: {
      type: 'number',
      placeholder: t('管制界線上限'),
      label: t('Control Limit (管制界線) 上限'),
      displayCheck(fieldsValue) {
        return fieldsValue.question_type == 1
      },
      updateValueOnChange(event, value, field) {
        if (value.question_type == 1) {
          field.rules = 'required'
        }
      }
    },
    spec_limit_lower: {
      type: 'number',
      placeholder: t('合規界線下限'),
      label: `${t('Spec Limit (合規界線)')}`,
      displayCheck(fieldsValue) {
        return fieldsValue.question_type == 1
      },
      updateValueOnChange(event, value, field) {
        if (value.question_type == 1) {
          field.rules = 'required'
        }
      }
    },
    spec_limit_upper: {
      type: 'number',
      placeholder: t('合規界線上限'),
      label: `${t('Spec Limit (合規界線)')}`,
      displayCheck(fieldsValue) {
        return fieldsValue.question_type == 1
      },
      updateValueOnChange(event, value, field) {
        if (value.question_type == 1) {
          field.rules = 'required'
        }
      }
    },
    remark: {
      info: true,
      label: (
        <View
          style={{
            flexDirection: 'row'
          }}>
          <WsIcon
            name={'ws-outline-reminder'}
            size={24}
            style={{
              marginRight: 8
            }}
          />
          <WsText size={14} fontWeight={'600'}>
            {t('合規標準')}
          </WsText>
        </View>
      ),
      displayCheck(fieldsValue) {
        if (fieldsValue.remark) {
          return true
        } else {
          return false
        }
      }
    },
    article_versions: {
      label: (
        <View
          style={{
            flexDirection: 'row'
          }}>
          <WsIcon
            name={'ll-nav-law-outline'}
            size={24}
            style={{
              marginRight: 8
            }}
          />
          <WsText size={14} fontWeight={'600'}>
            {t('法規依據')}
          </WsText>
        </View>
      ),
      title: t('法規依據'),
      type: 'info_listWithModal',
      info: true,
      displayCheck(fieldsValue) {
        if (
          fieldsValue.article_versions &&
          fieldsValue.article_versions.length > 0
        ) {
          return true
        } else {
          return false
        }
      }
    },
    ocap_remark: {
      label: 'OCAP',
      multiline: true,
      placeholder: t('請輸入OCAP說明'),
      type: 'text'
    },
    ocap_attaches: {
      label: `OCAP${t('附件')}`,
      type: 'filesAndImages',
      uploadUrl: `factory/${factoryId}/checklist_question_version/attach`
    }
  }
  const customer_quesStateFields = {
    title: {
      label: t('標題'),
      placeholder: t('輸入'),
      rules: 'required'
    },
    keypoint: {
      type: 'radio',
      label: t('重點關注'),
      items: [
        { label: t('是'), value: 1 },
        { label: t('否'), value: 0 }
      ],
      defaultValue: 0,
      rules: 'required',
      autoFocus: true
    },
    question_type: {
      type: 'radio',
      label: t('題型'),
      items: [
        { label: t('質性'), value: 2 },
        { label: t('量性'), value: 1 }
      ],
      defaultValue: 2,
      rules: 'required'
    },
    control_limit_lower: {
      label: t('Control Limit (管制界線) 下限'),
      placeholder: t('管制界線下限'),
      displayCheck(fieldsValue) {
        return fieldsValue.question_type == 1
      },
      updateValueOnChange(event, value, field) {
        if (value.question_type == 1) {
          field.rules = 'required'
        }
      }
    },
    control_limit_upper: {
      label: t('Control Limit (管制界線) 上限'),
      placeholder: t('管制界線上限'),
      displayCheck(fieldsValue) {
        return fieldsValue.question_type == 1
      }
    },
    spec_limit_lower: {
      label: `${t('Spec Limit (合規界線) 下限')} ${t('下限')}`,
      placeholder: t('合規界線下限'),
      displayCheck(fieldsValue) {
        return fieldsValue.question_type == 1
      }
    },
    spec_limit_upper: {
      label: `${t('Spec Limit (合規界線) 上限')} ${t('上限')}`,
      placeholder: t('合規界線上限'),
      displayCheck(fieldsValue) {
        return fieldsValue.question_type == 1
      }
    },
    remark: {
      label: (
        <View
          style={{
            flexDirection: 'row'
          }}>
          <WsIcon
            name={'ws-outline-reminder'}
            size={24}
            style={{
              marginRight: 8
            }}
          />
          <WsText size={14} fontWeight={'600'}>
            {t('合規標準')}
          </WsText>
        </View>
      ),
      multiline: true,
      type: 'text'
    },
    template_attaches: {
      label: t('附件'),
      type: 'filesAndImages',
      uploadUrl: `factory/${factoryId}/checklist_question_version/attach`
    },
    ocap_remark: {
      label: 'OCAP',
      multiline: true,
      placeholder: t('請輸入OCAP說明')
    },
    ocap_attaches: {
      type: 'filesAndImages',
      label: t('附件'),
      uploadUrl: `factory/${factoryId}/checklist_question_version/attach`
    }
  }

  // Storage
  const $_getStorage = async () => {
    const _item = await AsyncStorage.getItem('CheckListCreate')
    const _value = JSON.parse(_item)
    setCreateValue(_value)
    setStorageIsMounted(true)
    $_fetchQuestions(_value)
  }

  const $_formatResDataToAddLastVersionType = res => {
    const _res = res.map(r => {
      if (r.last_version) {
        const _last_version = {
          ...r.last_version,
          type: 'template'
        }
        const _r = {
          ...r,
          last_version: _last_version
        }
        return _r
      }
    })
    return _res
  }

  // Services
  const $_fetchQuestions = async createValue => {
    const params = {
      checklist_template_versions: createValue.checklist_template.last_version.id,
    };
    const res = await S_CheckListQuestionTemplate.index(
      params
    )
    setQuesWithTemplate(res.data)
    setCreateValue({
      ...createValue,
      checklist_question_with_version: res.data
    })
    setLoading(false)
  }

  // Function
  const $_setNavigationOptions = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            <WsBtn
              minHeight={40}
              isFullWidth={false}
              style={{
                marginRight: 16
              }}
              onPress={$_onHeaderRightPress}>
              {t('下一步')}
            </WsBtn>
          </>
        )
      },
      headerLeft: () => (
        <>
          <WsIconBtn
            name={'md-arrow-back'}
            onPress={$_onHeaderLeftPress}
            size={22}
            color={$color.white}
          />
        </>
      )
    })
  }
  const $_storeToRedux = () => {
    const _data = {
      ...createValue,
      selectedQuestions: selectedQuestions
    }
    store.dispatch(
      setCurrentCheckListCreateData(_data)
    )
  }

  const $_onHeaderRightPress = () => {
    $_storeToRedux()
    navigation.navigate(`${name}Step3`)
  }
  const $_onHeaderLeftPress = () => {
    navigation.goBack()
  }

  // 切換挑選的題目
  const $_switchTemplate = ($event, question) => {
    if ($event) {
      setSelectedQuestions([...selectedQuestions, question])
    } else {
      const result = selectedQuestions.filter(item => {
        return item.id !== question.id
      })
      setSelectedQuestions(result)
    }
  }

  // 複製題目
  const $_onCopyPress = question => {
    const _copy_question_from_last_version = {
      ...question.last_version,
      title: question.last_version.title + '-複製',
      type: 'custom',
      remark: null,
      article_versions: null
    }
    delete _copy_question_from_last_version.id
    const _copy_question = {
      ...question,
      _id: '_' + question.id,
      last_version: _copy_question_from_last_version
    }
    delete _copy_question.id
    delete _copy_question.checklist_templates
    delete _copy_question.checklist_template_versions

    setSelectedQuestions([...selectedQuestions, _copy_question])
    const _questions = [
      ...createValue.checklist_question_with_version,
      _copy_question
    ]
    setCreateValue({
      ...createValue,
      checklist_question_with_version: _questions
    })
    setQuesWithTemplate(_questions)
  }

  // 刪除題目
  const $_deleteOnPress = questionId => {
    const _arr = quesWithTemplate.filter(r => r.id !== questionId)
    setQuesWithTemplate(_arr)
    const _selectedQuestionArr = selectedQuestions.filter(
      r => r.id !== questionId
    )
    setSelectedQuestions(_selectedQuestionArr)
  }

  //新增自訂題目
  const $_customQuestionOnSubmit = event => {
    const _copy_question_from_last_version = {
      ...event,
      type: 'custom',
      article_versions: null
    }
    const _copy_question = {
      _id: moment().format('YYYYMMDDHHmmss'),
      updated_at: moment(),
      last_version: _copy_question_from_last_version
    }
    setSelectedQuestions([...selectedQuestions, _copy_question])
    const _questions = [
      ...createValue.checklist_question_with_version,
      _copy_question
    ]
    setCreateValue({
      ...createValue,
      checklist_question_with_version: _questions
    })
    setQuesWithTemplate(_questions)
  }

  // 編輯題目
  const $_onSubmitPress = $event => {
    if ($event.type === 'custom') {
      const _currentQuestions = quesWithTemplate.map(item => {
        if (item.last_version.type === 'custom' && item._id === $event._id) {
          const _formatted_last_version = {
            ...item.last_version,
            ...$event
          }
          const _formatted = {
            ...item,
            last_version: _formatted_last_version
          }
          return _formatted
        } else {
          return item
        }
      })
      setQuesWithTemplate(_currentQuestions)
      // 編輯題目的相關Function
      const $_comparisonDataAndIsCustom = (
        _currentQuestion,
        selectedQuestion
      ) => {
        if (
          _currentQuestion._id === selectedQuestion._id &&
          _currentQuestion.last_version.type ===
          selectedQuestion.last_version.type
        ) {
          return _currentQuestion
        }
      }
      // 挑選的題目
      const _selectedQuestions = selectedQuestions.map(item => {
        //  編輯後的題目
        const _copy_editCustomizeQuestions = _currentQuestions.find(r =>
          $_comparisonDataAndIsCustom(r, item)
        )
        if (_copy_editCustomizeQuestions._id == item._id) {
          return _copy_editCustomizeQuestions
        } else {
          return item
        }
      })
      setSelectedQuestions(_selectedQuestions)
    } else {
      const _currentQuestions = quesWithTemplate.map(item => {
        if (item.last_version.id == $event.id) {
          const _formatted_last_version = {
            ...item.last_version,
            ...$event
          }
          const _formatted = {
            ...item,
            last_version: _formatted_last_version
          }
          return _formatted
        } else {
          return item
        }
      })
      setQuesWithTemplate(_currentQuestions)

      const _selectedQuestions = selectedQuestions.map(item => {
        const _copy_editTemplateQuestion = _currentQuestions.find(
          r => item.id == r.id
        )
        if (_copy_editTemplateQuestion.id == item.id) {
          return _copy_editTemplateQuestion
        } else {
          return item
        }
      })
      setSelectedQuestions(_selectedQuestions)
    }
  }

  // Fetch Init Data
  const $_formatInitialData = originalData => {
    const _data = { ...originalData, ...originalData.last_version }
    if (!_data.keypoint) {
      _data.keypoint = 0
    }
    if (_data.control_limit_lower) {
      _data.control_limit_lower = _data.control_limit_lower.toString()
    }
    if (_data.control_limit_upper) {
      _data.control_limit_upper = _data.control_limit_upper.toString()
    }
    if (_data.spec_limit_lower) {
      _data.spec_limit_lower = _data.spec_limit_lower.toString()
    }
    if (_data.spec_limit_upper) {
      _data.spec_limit_upper = _data.spec_limit_upper.toString()
    }

    return _data
  }

  // Effect
  React.useEffect(() => {
    $_getStorage()
  }, [])

  React.useEffect(() => {
    if (!isStorageMounted) {
      return
    }
    $_setNavigationOptions()
  }, [isStorageMounted])

  React.useEffect(() => {
    $_setNavigationOptions()
  }, [selectedQuestions])

  return (
    <ScrollView>
      {loading ? (
        <>
          <WsSkeleton />
          <WsSkeleton />
          <WsSkeleton />
        </>
      ) : (
        <WsPaddingContainer>
          <>
            {quesWithTemplate.map((question, questionIndex) => {
              return (
                <View key={questionIndex}>
                  <LlQuestionPickTemplate
                    style={{
                      marginTop: 8
                    }}
                    no={questionIndex + 1}
                    title={
                      question.last_version.title
                        ? question.last_version.title
                        : ''
                    }
                    des={
                      question.last_version.type === 'custom'
                        ? t('自訂題目')
                        : t('建議題目')
                    }
                    isFocus={
                      question.last_version.keypoint == true ? true : false
                    }
                    type={
                      question.last_version.type === 'custom'
                        ? 'custom'
                        : 'template'
                    }
                    value={$_formatInitialData(question)}
                    switchValue={stateSwitch}
                    onSwitch={$event => {
                      $_switchTemplate($event, question)
                    }}
                    deleteOnPress={() => {
                      $_deleteOnPress(question.id)
                    }}
                    fields={
                      question.last_version.type === 'custom'
                        ? customer_quesStateFields
                        : quesStateFields
                    }
                    onSubmit={$event => {
                      $_onSubmitPress($event)
                    }}
                    copyOnPress={() => {
                      $_onCopyPress(question)
                    }}
                    questionId={question.id}
                  />
                </View>
              )
            })}
          </>
          <LlCreateQuestionCard
            value={defaultCustomizeQuesValue}
            fields={customer_quesStateFields}
            onSubmit={$event => {
              $_customQuestionOnSubmit($event)
            }}
          />
        </WsPaddingContainer>
      )}
    </ScrollView>
  )
}

export default CheckListCreateStepTwo
