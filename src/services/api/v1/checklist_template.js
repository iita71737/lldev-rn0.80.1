// import axios from 'axios';
import S_Processor from '@/services/app/processor'
import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_ChecklistQuesTem from '@/services/api/v1/checklist_question_template'
import i18next from 'i18next';

export default {
  async index({ params }) {
    return base.index({
      modelName: 'checklist_template',
      preUrl: S_Processor.getFactoryPreUrl(),
      // params: params,
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
      },
    })
  },
  async show({ modelId }) {
    const res = await base.show({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelId: modelId,
      modelName: 'checklist_template',
      params: S_Processor.getFactoryParams(),
    });
    return res;
  },
  async showVersion(versionId, params) {
    //取得template version內容
    const res = await base.show({
      modelName: 'checklist_template_version',
      modelId: versionId,
      // params: params,
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
      },
    });
    return res;
  },
  async quesVersionIndex(versionId) {
    //取得template version裡的question versions內容
    const params = {
      checklist_template_versions: versionId,
      ...S_Processor.getFactoryParams(),
    };
    const res = await base.index({
      modelName: 'cklist_ques_tmp_ver',
      params: params,
    });
    return res;
  },
  async quesIndex(versionId) {
    //取得template version裡的questions內容
    const params = {
      checklist_template_versions: versionId,
    };
    return S_ChecklistQuesTem.index(params)
    const res = await base.index({
      modelName: 'checklist_question_template',
      params: params,
    });
    return res;
  },
  getQuestionList(questions, questionSort) {
    //取得題目列表+題目版本
    const _questions = questionSort.map((question) => {
      const version = questions.find((ques) => ques.id === question.id)
        .last_version;
      return {
        acts: version.acts,
        articles: version.articles,
        quesType: version.question_type,
        controlLimitData: {
          upper:
            version.control_limit_upper || version.control_limit_upper === 0
              ? version.control_limit_upper.toString()
              : null,
          lower:
            version.control_limit_lower || version.control_limit_lower === 0
              ? version.control_limit_lower.toString()
              : null,
          controlLimitSuggest: version.control_limit_suggest,
        },
        specLimitData: {
          upper:
            version.spec_limit_upper || version.spec_limit_upper === 0
              ? version.spec_limit_upper.toString()
              : null,
          lower:
            version.spec_limit_lower || version.spec_limit_lower === 0
              ? version.spec_limit_lower.toString()
              : null,
          specLimitSuggest: version.spec_limit_suggest,
        },
        ocapRemark: '',
        ocapAttaches: [],
        attaches: version.attaches,
        images: version.images,
        riskSignal: version.effects,
        subtitle: i18next.t('建議題目'),
        title: version.title,
        type: 'template',
        templateId: question.id,
        templateVersionId: version.id,
        id: question.id,
        focus: 0,
        remark: version.remark,
      };
    });
    return _questions;
  },
  getTemplateData(template) {
    return {
      id: template.id,
      lastVersionId: template.last_version ? template.last_version.id : null,
      systemClass: template.system_class,
      systemSubclasses: template.system_subclasses,
      name: template.name,
      frequency: template.frequency,
      status: template.status,
    };
  },
  getVersionData(version) {
    return {
      id: version.id,
      questions: version.questions,
      remark: version.remark,
    };
  },
  filterTemplateFrequency(list, frequency) {
    if (frequency === 'all') {
      return list;
    }
    const _items = [];
    list.forEach((item) => {
      if (item.frequency === frequency) {
        _items.push(item);
      }
    });
    return _items;
  },
  filterTemplateType(templateInitList, allSystemClass, selectSystem) {
    const selectValue = selectSystem;
    const templateList = [];
    allSystemClass.forEach((system) => {
      system.system_subclasses.forEach((subclass) => {
        if (selectValue.includes(subclass.id)) {
          let buttonList = templateInitList.filter((template) => {
            let allSubclassIds = template.system_subclasses.map(
              (subclass) => subclass.id,
            );
            return allSubclassIds.includes(subclass.id);
          });
          let hasSystem = templateList.filter(
            (item) => item.titleId === system.id,
          );
          if (buttonList.length === 0) return;
          let list = {
            title: hasSystem.length === 0 ? system.name : '',
            titleId: system.id,
            subtitle: subclass.name,
            imgIcon: subclass.icon,
            buttonList: buttonList,
          };
          templateList.push(list);
        }
      });
    });
    return templateList;
  },
  //公版popup 列表
  getTemplateList(templates) {
    const _templates = templates.map((template) => {
      let _name = '';
      if (template.status === 2) {
        _name = `(${i18next.t('修訂中')}) ` + template.last_version.name;
      } else {
        _name = template.last_version.name;
      }
      return {
        id: template.id,
        name: _name,
        frequency: template.frequency,
        system_class: template.system_class ? template.system_class : null,
        system_subclasses: template.system_subclasses
          ? template.system_subclasses
          : null,
        disable: template.status === 2 ? true : false,
      };
    });
    return _templates;
  },
};
