import React from 'react';
import { View, ScrollView } from 'react-native';
import {
  WsPaddingContainer,
  WsBtn,
  LlQuestionPickTemplate,
  LlCreateQuestionCard,
  WsSkeleton,
  WsIcon,
  WsText,
} from '@/components';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';
import S_CheckListQuestion from '@/services/api/v1/checklist_question';
import S_CheckList from '@/services/api/v1/checklist';
import S_CheckListVersion from '@/services/api/v1/checklist_version';
import S_Wasa from '@/__reactnative_stone/services/wasa';
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux';
import store from '@/store';
import {
  setCurrentCheckListForEdit,
} from '@/store/data';

const CheckListUpdateStepTwo = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  // Params
  const { name, modelId } = route.params;

  // Redux
  const factoryId = useSelector(state => state.data.currentFactory.id);
  const currentChecklistForEdit = useSelector(
    state => state.data.currentCheckListForEdit,
  );

  // States
  const [updateValue, setUpdateValue] = React.useState()
  const [questions, setQuestions] = React.useState();
  const [selectedQuestions, setSelectedQuestions] = React.useState()
  const [checklistVersion, setChecklistVersion] = React.useState();

  const [loading, setLoading] = React.useState(true);
  const [defaultCustomizeQuesValue, setDefaultCustomizeQuesValue] = React.useState({ "title": "自訂題目" })

  // Fields
  const quesStateFields = {
    title: {
      label: t('標題'),
      placeholder: t('輸入'),
      editable: false,
      rules: 'required',
    },
    keypoint: {
      type: 'radio',
      label: t('重點關注'),
      items: [
        { label: t('是'), value: 1 },
        { label: t('否'), value: 0 },
      ],
      rules: 'required',
    },
    question_type: {
      type: 'radio',
      label: t('題型'),
      items: [
        { label: t('質性'), value: 2 },
        { label: t('量性'), value: 1 },
      ],
      rules: 'required',
      disabled: true
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
              marginRight: 8,
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
      },
    },
    article_versions: {
      label: (
        <View
          style={{
            flexDirection: 'row',
          }}>
          <WsIcon
            name={'ll-nav-law-outline'}
            size={24}
            style={{
              marginRight: 8,
            }}
          />
          <WsText size={14} fontWeight={'600'}>
            {t('法規依據')}
          </WsText>
        </View>
      ),
      title: (t('法規依據')),
      type: 'info_listWithModal',
      info: true,
      displayCheck(fieldsValue) {
        if (fieldsValue.article_versions && fieldsValue.article_versions.length > 0) {
          return true
        } else {
          return false
        }
      },
    },
    ocap_remark: {
      label: 'OCAP',
      multiline: true,
    },
    ocap_attaches: {
      label: `OCAP${t('附件')}`,
      type: 'filesAndImages',
      uploadUrl: `factory/${factoryId}/checklist_question_version/attach`,
    },
  };
  const customer_quesStateFields = {
    title: {
      label: t('標題'),
      placeholder: t('輸入'),
      rules: 'required',
    },
    keypoint: {
      type: 'radio',
      label: t('重點關注'),
      items: [
        { label: t('是'), value: 1 },
        { label: t('否'), value: 0 },
      ],
      value: 0,
      rules: 'required',
    },
    question_type: {
      type: 'radio',
      label: t('題型'),
      items: [
        { label: t('質性'), value: 2 },
        { label: t('量性'), value: 1 },
      ],
      value: 2,
      rules: 'required',
    },
    spec_limit_lower: {
      label: t('Control Limit (管制界線) 下限'),
      displayCheck(fieldsValue) {
        return fieldsValue.question_type == 1;
      },
      placeholder: t('管制界線下限'),
    },
    spec_limit_upper: {
      label: t('Control Limit (管制界線) 上限'),
      displayCheck(fieldsValue) {
        return fieldsValue.question_type == 1;
      },
      placeholder: t('管制界線上限'),
    },
    control_limit_lower: {
      label: `${t('Spec Limit (合規界線)')} ${t('下限')}`,
      displayCheck(fieldsValue) {
        return fieldsValue.question_type == 1;
      },
      placeholder: t('合規界線下限'),
    },
    control_limit_upper: {
      label: `${t('Spec Limit (合規界線)')} ${t('上限')}`,
      displayCheck(fieldsValue) {
        return fieldsValue.question_type == 1;
      },
      placeholder: t('合規界線上限'),
    },
    remark: {
      label: (
        <View
          style={{
            flexDirection: 'row',
          }}>
          <WsIcon
            name={'ws-outline-reminder'}
            size={24}
            style={{
              marginRight: 8,
            }}
          />
          <WsText size={14} fontWeight={'600'}>
            {t('合規標準')}
          </WsText>
        </View>
      ),
      multiline: true,
      type: 'text',
    },
    template_attaches: {
      label: t('附件'),
      type: 'filesAndImages',
      uploadUrl: `factory/${factoryId}/checklist_question_version/attach`,
    },
    ocap_remark: {
      label: 'OCAP',
      multiline: true,
      placeholder: t('請輸入OCAP說明'),
    },
    ocap_attaches: {
      type: 'filesAndImages',
      label: t('附件'),
      uploadUrl: `factory/${factoryId}/checklist_question_version/attach`,
    },
  };

  // Services
  const $_getQuesFromChecklistVersion = async () => {
    //取得點檢表
    const checklist = await S_CheckList.show({
      modelId: modelId
    });
    // 取得點檢表目前版本
    const checklistVersion = await S_CheckListVersion.show(
      checklist.last_version.id,
    );
    setChecklistVersion(checklistVersion);
    //  取得點檢表目前版本的所有題目
    const allQuestions = await S_CheckListQuestion.getQuesFromCheckListVersion(
      checklistVersion
    );
    //  取得點檢表目前版本的被選取的題目
    const selectedQuestions = await S_CheckListQuestion.getSelectedQuesFromCheckListVersion(
      checklistVersion
    );
    setQuestions(allQuestions);
    setSelectedQuestions(selectedQuestions.data)
    const _currentChecklistForEdit = {
      ...updateValue,
      checklist_question_with_version: allQuestions,
      selectedQuestions: selectedQuestions.data,
    };
    store.dispatch(setCurrentCheckListForEdit(_currentChecklistForEdit));
    setLoading(false);
  };

  // Options
  const $_setNavigationOptions = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            <WsBtn
              minHeight={40}
              isFullWidth={false}
              style={{
                marginRight: 16,
              }}
              onPress={() => {
                $_onHeaderRightPress();
              }}>
              {t('下一步')}
            </WsBtn>
          </>
        );
      },
    });
  };

  // 切換題目開關
  const $_switchTemplate = ($event, question) => {
    const _checklistAllQuestions = JSON.parse(JSON.stringify(selectedQuestions))
    if ($event) {
      _checklistAllQuestions.push(question)
      setSelectedQuestions(_checklistAllQuestions)
      const _currentChecklistForEdit = {
        ...currentChecklistForEdit,
        selectedQuestions: _checklistAllQuestions,
      };
      store.dispatch(setCurrentCheckListForEdit(_currentChecklistForEdit));
    }
    else {
      const _currentQuestions = _checklistAllQuestions.filter(ques => {
        return ques.id !== question.id;
      });
      const _currentChecklistForEdit = {
        ...currentChecklistForEdit,
        selectedQuestions: _currentQuestions,
      };
      setSelectedQuestions(_currentQuestions)
      store.dispatch(setCurrentCheckListForEdit(_currentChecklistForEdit));
    }
  };

  // 複製題目
  const $_onCopyPress = question => {
    const _questions = JSON.parse(JSON.stringify(questions))
    const _selectedQuestions = JSON.parse(JSON.stringify(selectedQuestions))
    const _copy_question_last_version = {
      ...question.last_version,
      title: question.title + t('-複製'),
      type: 'custom',
      keypoint: question.keypoint ? 1 : 0,
    };
    delete _copy_question_last_version.id
    const _copy_question = {
      checklist_question_template: question.checklist_question_template,
      _id: moment().format('YYYYMMDDhhmmSS'),
      title: question.title + t('-複製'),
      type: 'custom',
      keypoint: question.keypoint ? 1 : 0,
      last_version: _copy_question_last_version
    }
    delete _copy_question.id
    delete _copy_question.checklist_templates
    delete _copy_question.checklist_template_versions

    const _copy_questions = [..._questions, _copy_question];
    setQuestions(_copy_questions);
    const _selectedQues = [..._selectedQuestions, _copy_question]
    setSelectedQuestions(_selectedQues)

    const _currentChecklistForEdit = {
      ...currentChecklistForEdit,
      selectedQuestions: _selectedQues,
    };
    store.dispatch(setCurrentCheckListForEdit(_currentChecklistForEdit));
  };

  // 新增自訂題目
  const $_customQuestionOnSubmit = $event => {
    const _selectedQuestions = JSON.parse(JSON.stringify(selectedQuestions))
    const _question_last_version = {
      ...$event,
      type: 'custom',
    };
    const _question = {
      title: $event.title,
      _id: moment().format('YYYYMMDDhhmmss'),
      type: 'custom',
      last_version: _question_last_version
    }
    const _questions = [...questions, _question];
    setQuestions(_questions);
    _selectedQuestions.push(_question)
    setSelectedQuestions(_selectedQuestions)
    const _currentChecklistForEdit = {
      ...currentChecklistForEdit,
      selectedQuestions: _selectedQuestions
    };
    store.dispatch(setCurrentCheckListForEdit(_currentChecklistForEdit));
  };

  // 編輯題目
  const $_editQuestion = ($event, questionIndex) => {
    const _questions = questions.map((r, index) => {
      if (index === questionIndex) {
        const _ques_last_version = {
          ...$event
        }
        const _ques = {
          id: questions[index].id,
          checklist_question_template: questions[index].checklist_question_template,
          title: $event.title,
          type: questions[index].type,
          last_version: _ques_last_version
        }
        return _ques
      }
      else {
        return r
      }
    })
    setQuestions(_questions)

    // 更新已選取的題目
    const _newSelectedQues = []
    currentChecklistForEdit.selectedQuestions.forEach(r => {
      _questions.forEach(k => {
        if (k.id === r.id) {
          _newSelectedQues.push(k)
        }
      })
    })
    const _currentChecklistForEdit = {
      ...currentChecklistForEdit,
      selectedQuestions: _newSelectedQues,
    };
    store.dispatch(setCurrentCheckListForEdit(_currentChecklistForEdit));
  };

  // 刪除題目
  const $_deleteOnPress = (question, questionIndex) => {
    const _currentQuestions = questions.filter((ques, index) => {
      return index !== questionIndex;
    });
    const _selectedQuestions = currentChecklistForEdit.selectedQuestions.filter(r => {
      return r.id !== question.id
    })

    // 邏輯上只會有自訂或複製被刪除
    setQuestions(_currentQuestions);
    const _currentChecklistForEdit = {
      ...currentChecklistForEdit,
      selectedQuestions: _selectedQuestions,
    };
    store.dispatch(setCurrentCheckListForEdit(_currentChecklistForEdit));
  };

  // 目前點檢表題目是否被選擇
  const $_setSwitchQuestions = (question, checklistVersion) => {
    if (checklistVersion) {
      let hasSelect = false;
      if (question.checklist_question_template) {
        checklistVersion.checklist_question_templates.forEach(
          selectQuestion => {
            if (selectQuestion.id == question.checklist_question_template.id) {
              hasSelect = true;
            }
          },
        );
      }
      return hasSelect;
    }
  };

  const $_onHeaderRightPress = () => {
    navigation.navigate(`${name}Step3`);
  };

  // Storage
  const $_getStorage = async () => {
    const _item = await AsyncStorage.getItem(name)
    const _value = JSON.parse(_item)
    setUpdateValue(_value)
  }

  const $_setStorage = async () => {
    const _value = JSON.stringify(updateValue)
    await AsyncStorage.setItem(name, _value)
  }

  React.useEffect(() => {
    $_getStorage()
    $_setNavigationOptions();
  }, []);

  React.useEffect(() => {
    if (updateValue) {
      $_getQuesFromChecklistVersion();
      $_setStorage()
    }
  }, [updateValue])

  return (
    <ScrollView>
      <WsPaddingContainer>
        {loading ? (
          <>
            <WsSkeleton />
            <WsSkeleton />
            <WsSkeleton />
            <WsSkeleton />
          </>
        ) : (
          <>
            {questions.map((question, questionIndex) => {
              return (
                <View key={questionIndex}>
                  <LlQuestionPickTemplate
                    style={{
                      marginTop: 8,
                    }}
                    no={questionIndex + 1}
                    title={question.title}
                    des={
                      question.type == 'template'
                        ? t('建議題目')
                        : t('自訂題目')
                    }
                    isFocus={(question.last_version.keypoint == true ? true : false)}
                    type={question.type}
                    value={question.last_version}
                    switchValue={$_setSwitchQuestions(
                      question,
                      checklistVersion,
                    )}
                    onSwitch={$event => {
                      $_switchTemplate($event, question);
                    }}
                    deleteOnPress={() => {
                      $_deleteOnPress(question, questionIndex);
                    }}
                    fields={
                      question.type === "custom"
                        ? customer_quesStateFields
                        : quesStateFields
                    }
                    onSubmit={$event => {
                      $_editQuestion($event, questionIndex);
                    }}
                    copyOnPress={() => {
                      $_onCopyPress(question);
                    }}
                  />
                </View>
              );
            })}
            <LlCreateQuestionCard
              value={defaultCustomizeQuesValue}
              fields={customer_quesStateFields}
              onSubmit={$event => {
                $_customQuestionOnSubmit($event);
              }}
            />
          </>
        )}
      </WsPaddingContainer>
    </ScrollView>
  );
};

export default CheckListUpdateStepTwo;
