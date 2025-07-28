import React from 'react';
import { View, ScrollView } from 'react-native';
import {
  WsText,
  WsPaddingContainer,
  WsBtn,
  WsModal,
  WsLoading,
  LlQuestionPickTemplate,
  LlCreateQuestionCard,
  // LlCustomTemplateCard,
} from '@/components';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';
import S_CheckListQuestion from '@/services/api/v1/checklist_question';
import S_CheckList from '@/services/api/v1/checklist';
import S_CheckListVersion from '@/services/api/v1/checklist_version';
import S_CheckListTemplate from '@/services/api/v1/checklist_template';
import S_CheckListQuestionTemplate from '@/services/api/v1/checklist_question_template';
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux';
import store from '@/store';
import {
  setCurrentCheckListForUpdateVersion
} from '@/store/data';

const CheckListTemplateUpdate = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  // Params
  const { id, versionId, name } = route.params;

  // Redux
  const factoryId = useSelector(state => state.data.currentFactory.id);
  const currentCheckListForUpdateVersion = useSelector(state => state.data.currentCheckListForUpdateVersion)

  // States
  const [updateValue, setUpdateValue] = React.useState();
  const [checklistVersion, setChecklistVersion] = React.useState();
  const [checklistTemplate, setChecklistTemplate] = React.useState();
  const [questions, setQuestions] = React.useState([]);
  const [stateSwitch, setStateSwitch] = React.useState(false);
  const [defaultCustomizeQuesValue, setDefaultCustomizeQuesValue] = React.useState({ "title": "自訂題目" })
  const quesStateFields = {
    title: {
      label: t('標題'),
      placeholder: t('輸入'),
    },
    keypoint: {
      type: 'radio',
      label: t('重點關注'),
      items: [
        { label: t('是'), value: 1 },
        { label: t('否'), value: 0 },
      ],
    },
    remark: {
      label: t('合規標準'),
      multiline: true,
      placeholder: t('請輸入合規標準'),
    },
    ocap_images: {
      label: `OCAP${t('圖片')}`,
      type: 'images',
    },
    ocap_remark: {
      label: 'OCAP',
      multiline: true,
    },
    ocap_attaches: {
      label: `OCAP${t('附件')}`,
      type: 'filesAndImages',
    },
  };



  // Services
  const $_getQuesFromChecklistVersion = async () => {

    // 取得點檢表
    const checklist = await S_CheckList.show({ modelId: id });

    // 取得點檢表版本
    const checklistVersion = await S_CheckListVersion.show(
      checklist.last_version.id,
    );

    // 取得點檢表公版
    const template = await S_CheckListTemplate.show(
      checklist.checklist_template.id,
    );

    // 取得點檢表題目
    const checklistQuestions = await S_CheckListQuestion.index({
      checklist_versions: checklist.last_version.id,
    });

    // 取得點檢表題目公版
    const templateQuestions = await S_CheckListQuestionTemplate.index({
      checklist_template_versions: checklist.checklist_template.last_version.id,
    });
    setChecklistVersion(checklistVersion);
    setChecklistTemplate(template);

    // 處理資料
    const questions = await S_CheckListQuestion.getQuesFromVersionAndTemplate(
      checklistVersion,
      template,
      checklistQuestions.data,
      templateQuestions.data,
    );

    setQuestions(questions);

    const _selectedQuestions = questions.filter(r => {
      return r.type === 'custom'
    })

    const _allData = {
      ...updateValue,
      checklist_template_version:
        checklistVersion.checklist_template_version.id,
      originalQuestions: questions,
      allListingQuestions: questions,
      selectedQuestions: _selectedQuestions ? _selectedQuestions : []
    }
    setUpdateValue(_allData);

    const _reduxData = {
      ...currentCheckListForUpdateVersion,
      ..._allData,
    }
    store.dispatch(setCurrentCheckListForUpdateVersion(_reduxData))
  };

  // 切換挑選題目
  const $_switchTemplate = async ($event, question) => {
    const _selectedQuestions = updateValue.selectedQuestions
    if ($event) {
      _selectedQuestions.push(question)
      const _updateValue = {
        ...updateValue,
        selectedQuestions: _selectedQuestions
      }
      setUpdateValue(_updateValue)

      const _reduxData = {
        ...currentCheckListForUpdateVersion,
        selectedQuestions: _selectedQuestions
      }
      store.dispatch(setCurrentCheckListForUpdateVersion(_reduxData))
    }
    else {
      const _filterSelectedQuestions = _selectedQuestions.filter(r => {
        return r.id !== question.id
      })
      const _updateValue = {
        ...updateValue,
        selectedQuestions: _filterSelectedQuestions
      }
      setUpdateValue(_updateValue)

      const _reduxData = {
        ...currentCheckListForUpdateVersion,
        selectedQuestions: _filterSelectedQuestions
      }
      store.dispatch(setCurrentCheckListForUpdateVersion(_reduxData))
    }
  };

  // 複製題目
  const $_onCopyPress = question => {

    const _selectedQuestions = updateValue.selectedQuestions
    const _questions = [...questions];

    const _copy_question_last_version = {
      ...question.last_version,
      title: question.last_version.title + t('-複製'),
      type: 'custom',
      keypoint: question.keypoint ? 1 : 0,
    };
    const _copy_question = {
      ...question,
      title: question.last_version.title + t('-複製'),
      type: "custom",
      last_version: _copy_question_last_version,
    }

    _questions.push(_copy_question)
    _selectedQuestions.push(_copy_question)
    const _updateValue = {
      ...updateValue,
      allListingQuestions: _questions,
      selectedQuestions: _selectedQuestions
    }
    setUpdateValue(_updateValue)
    setQuestions(_questions);

    const _reduxData = {
      ...currentCheckListForUpdateVersion,
      selectedQuestions: _selectedQuestions
    }
    store.dispatch(setCurrentCheckListForUpdateVersion(_reduxData))
  };

  // 刪除題目
  const $_deleteOnPress = (question, questionIndex) => {
    const _questions = [...questions];
    _questions.splice(questionIndex, 1);
    setQuestions(_questions);
    const _selectedQuestions = updateValue.selectedQuestions.filter(r => {
      return r.id !== question.id
    })
    const _updateValue = {
      ...updateValue,
      allListingQuestions: _questions,
      selectedQuestions: _selectedQuestions
    }
    setUpdateValue(_updateValue)

    const _reduxData = {
      ...currentCheckListForUpdateVersion,
      selectedQuestions: _selectedQuestions
    }
    store.dispatch(setCurrentCheckListForUpdateVersion(_reduxData))
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
          status: questions[index].status,
          keypoint: questions[index].keypoint,
          last_version: _ques_last_version
        }
        return _ques
      }
      else {
        return r
      }
    })
    setQuestions(_questions)

    // 更新已挑選的題目
    const _newSelectedQues = []
    updateValue.selectedQuestions.forEach(r => {
      _questions.forEach(k => {
        if (k.id === r.id) {
          _newSelectedQues.push(k)
        }
      })
    })
    const _updateValue = {
      ...updateValue,
      allListingQuestions: _questions,
      selectedQuestions: _newSelectedQues
    }
    setUpdateValue(_updateValue)

    const _reduxData = {
      ...currentCheckListForUpdateVersion,
      selectedQuestions: _newSelectedQues
    }
    store.dispatch(setCurrentCheckListForUpdateVersion(_reduxData))
  };

  // 新增自訂題目
  const $_customQuestionOnSubmit = $event => {
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

    const _selectedQuestions = [
      ...updateValue.selectedQuestions,
      _question
    ]
    const _updateValue = {
      ...updateValue,
      allListingQuestions: _questions,
      selectedQuestions: _selectedQuestions
    }
    setUpdateValue(_updateValue)

    const _reduxData = {
      ...currentCheckListForUpdateVersion,
      selectedQuestions: _selectedQuestions
    }
    store.dispatch(setCurrentCheckListForUpdateVersion(_reduxData))
  };

  // 處理後端資料
  const $_formatDataWithId = (data) => {
    const result = data.map(r => {
      return r.id
    })
    return result
  }

  // Update Version API
  const $_putApi = async () => {

    const _checklistData = {
      name: currentCheckListForUpdateVersion.name,
      frequency: currentCheckListForUpdateVersion.frequency,
      expired_before_days: currentCheckListForUpdateVersion.expired_before_days ? currentCheckListForUpdateVersion.expired_before_days : 'QQ',
      reviewers: currentCheckListForUpdateVersion.reviewers ? $_formatDataWithId(currentCheckListForUpdateVersion.reviewers) : null,
      checklist_template: currentCheckListForUpdateVersion.checklist_template
        ? currentCheckListForUpdateVersion.checklist_template.id
        : null,
      checkers: currentCheckListForUpdateVersion.checkers ? $_formatDataWithId(currentCheckListForUpdateVersion.checkers) : [],
      system_subclasses: currentCheckListForUpdateVersion.system_subclasses ? $_formatDataWithId(currentCheckListForUpdateVersion.system_subclasses) : [],
      system_classes: currentCheckListForUpdateVersion.system_classes ? $_formatDataWithId(currentCheckListForUpdateVersion.system_classes) : [],
    };


    // update點檢表
    const result = await S_CheckList.update({
      checklistId: currentCheckListForUpdateVersion.id,
      checklistData: _checklistData,
    });

    const _versionData = {
      checklist_template_version: currentCheckListForUpdateVersion.checklist_template.last_version.id,
      checklist_question_templates: currentCheckListForUpdateVersion.checklist_template.last_version.checklist_question_templates
        ? $_formatDataWithId(currentCheckListForUpdateVersion.checklist_template.last_version.checklist_question_templates)
        : null
    };


    // update點檢表版本
    const checklistVersion = await S_CheckListVersion.createVersion({
      checklistId: result.id,
      data: _versionData
    });
    $_createQuesWithVersion(result.id, checklistVersion.id)
  }

  const $_createQuesWithVersion = async (checklistId, versionId) => {
    let _allQues = updateValue.selectedQuestions;

    _allQues.forEach((ques) => {
      ques.checklist_question_template = ques.checklist_question_template ? ques.checklist_question_template.id : null,
        ques.checklist_question_template_version = ques.checklist_question_template_version ? $_formatDataWithId(ques.checklist_question_template_version.id) : null,
        ques.images = ques.last_version.images,
        ques.attaches = ques.last_version.attaches,
        ques.template_images = ques.last_version.template_images,
        ques.template_attaches = ques.last_version.template_attaches,
        ques.ocap_attaches = ques.last_version.ocap_attaches,
        ques.ocap_remark = ques.last_version.ocap_remark
      ques.title = ques.last_version.title,
        ques.remark = ques.last_version.remark,
        ques.spec_limit_lower = ques.last_version.spec_limit_lower,
        ques.spec_limit_upper = ques.last_version.spec_limit_upper,
        ques.spec_limit_suggest = ques.last_version.spec_limit_suggest,
        ques.control_limit_suggest = ques.last_version.control_limit_suggest,
        ques.control_limit_lower = ques.last_version.control_limit_lower,
        ques.control_limit_upper = ques.last_version.control_limit_upper,
        ques.articles = ques.last_version.articles,
        ques.acts = ques.last_version.acts,
        ques.act_version_alls = ques.last_version.act_version_alls ? $_formatDataWithId(ques.last_version.act_version_alls) : [],
        ques.act_versions = ques.last_version.act_versions ? $_formatDataWithId(ques.last_version.act_versions) : [],
        ques.article_versions = ques.last_version.article_versions ? $_formatDataWithId(ques.last_version.article_versions) : [],
        ques.effects = ques.last_version.effects ? $_formatDataWithId(ques.last_version.effects) : [],
        ques.keypoint = ques.last_version.keypoint
      ques.question_type = ques.last_version.question_type,
        ques.locales = ques.last_version.question_type,
        ques.payload = ques.last_version.payload,
        ques.status = ques.status,
        ques.type = ques.type,
        ques.checklists = checklistId,
        ques.checklist_versions = versionId,
        ques.factory = factoryId
    });
    const res = await S_CheckList.createAllQuesWithVersion(_allQues);

    const resIds = res.map((ques) => ques.data.data.id);
    $_updateVersionQues(resIds, versionId, _allQues);
  }

  const $_updateVersionQues = async (quesIds, versionId, _allQues) => {
    const allIds = quesIds;
    const questions = S_CheckList.getSortQuesUpdate(
      allIds,
      _allQues
    );
    const version = {
      questions: questions,
      factory: factoryId,
    };

    await S_CheckList.updateVersion(versionId, version);
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

  // 送出
  const $_onHeaderRightPress = async () => {
    await $_putApi();
    setTimeout(() => {
      navigation.navigate('CheckList', {
        checklistUpdateDone: true
      });
    }, 0);
  };

  React.useEffect(() => {
    $_getQuesFromChecklistVersion();
  }, []);
  React.useEffect(() => {
    $_setNavigationOptions();
  }, [updateValue]);

  return (
    <>
      <ScrollView>
        <WsPaddingContainer>
          {!updateValue && (
            <>
              <WsLoading />
            </>
          )}
          {questions && updateValue && (
            <>
              {questions.map((question, questionIndex) => {
                return (
                  <>
                    {question && question.last_version && (
                      <>
                        <View key={questionIndex}>
                          <LlQuestionPickTemplate
                            style={{
                              marginTop: 8,
                            }}
                            no={questionIndex + 1}
                            title={
                              question.title
                                ? question.title
                                : question.last_version.title
                                  ? question.last_version.title
                                  : t('無')
                            }
                            des={
                              question.type == 'template'
                                ? t('建議題目')
                                : t('自訂題目')
                            }
                            isFocus={(question.keypoint = 1 ? true : false)}
                            type={question.type}
                            value={question.last_version}
                            switchValue={stateSwitch}
                            onSwitch={$event => {
                              $_switchTemplate($event, question);
                            }}
                            deleteOnPress={() => {
                              $_deleteOnPress(question, questionIndex);
                            }}
                            fields={quesStateFields}
                            onSubmit={$event => {
                              $_editQuestion($event, questionIndex);
                            }}
                            copyOnPress={() => {
                              $_onCopyPress(question);
                            }}
                            status={question.status}
                          />
                        </View>
                      </>
                    )}
                  </>
                );
              })}
              <LlCreateQuestionCard
                value={defaultCustomizeQuesValue}
                fields={quesStateFields}
                onSubmit={$event => {
                  $_customQuestionOnSubmit($event);
                }}
              />
            </>
          )}
        </WsPaddingContainer>
      </ScrollView>
    </>
  );
};
export default CheckListTemplateUpdate;
