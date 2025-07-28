import base from '@/__reactnative_stone/services/wasaapi/v1/__base';
import { StyleSheet, View, ScrollView, Platform } from 'react-native';
import S_Processor from '@/services/app/processor';
import S_Effects from '@/services/api/v1/effects';
import ServiceCheckList from '@/services/api/v1/checklist';
import S_CheckListRecord from '@/services/api/v1/checklist_record';
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer';
import $color from '@/__reactnative_stone/global/color';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next'

import S_Keychain from '@/__reactnative_stone/services/app/keychain'
import $config from '@/__config'
import axios from 'axios'
import store from '@/store'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import moment from 'moment'
import RNBlobUtil from 'react-native-blob-util'

export default {
  async index({ parentId, params }) {
    return base.index({
      parentId: parentId,
      parentName: 'checklist_record',
      modelName: 'checklist_record_answer',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams()
      },
    });
  },
  async indexV2({ parentId, params }) {
    return base.index({
      parentId: parentId,
      parentName: 'v2/checklist_record',
      modelName: 'checklist_record_answer',
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams()
      },
    });
  },
  // getFormat(answers, _titleWithScore) {
  //   // Format過用於紀錄內頁包含回答和頁面所需資料
  //   let titleWithScore = [
  //     {
  //       title: i18next.t('未答題'),
  //       icon: 'ws-filled-help',
  //       color: $color.gray,
  //       backgroundColor: $color.gray9l,
  //       score: null,
  //     },
  //     {
  //       title: i18next.t('不合規'),
  //       icon: 'ws-filled-risk-high',
  //       color: $color.danger,
  //       backgroundColor: $color.danger9l,
  //       score: 23,
  //     },
  //     {
  //       title: i18next.t('中度異常'),
  //       icon: 'ws-filled-risk-medium',
  //       color: $color.yellow,
  //       backgroundColor: $color.yellow11l,
  //       score: 22,
  //     },
  //     {
  //       title: i18next.t('輕度異常'),
  //       icon: 'ws-filled-risk-low',
  //       color: $color.blue,
  //       backgroundColor: $color.blue9l,
  //       score: 21,
  //     },
  //     {
  //       title: i18next.t('合規'),
  //       icon: 'ws-filled-check-circle',
  //       color: $color.green,
  //       backgroundColor: $color.green9l,
  //       score: 25,
  //     },
  //     {
  //       title: i18next.t('數值紀錄'),
  //       icon: 'ws-filled-check-circle',
  //       color: $color.gray,
  //       backgroundColor: $color.gray9l,
  //       score: 26,
  //     },
  //     {
  //       title: i18next.t('不適用'),
  //       icon: 'scc-liff-close-circle',
  //       color: $color.gray,
  //       backgroundColor: $color.gray9l,
  //       score: 20,
  //     },
  //   ];

  //   // API Constant Index 整合
  //   if (_titleWithScore && _titleWithScore.length > 0) {
  //     titleWithScore = titleWithScore.map(item => {
  //       _titleWithScore.forEach(_item => {
  //         if (item.score && (item.score == _item.value)) {
  //           const _res = {
  //             ...item,
  //             ..._item
  //           }
  //           return _res
  //         }
  //       })
  //       return item
  //     })
  //   }
  //   const data = titleWithScore.map(item => {
  //     const _ans = answers.filter(ans => {
  //       if (ans.score) {
  //         if (ans.question_type == 2 || ans.quesType == 2 || ans.questionType == 2) {
  //           return ans.score == item.score;
  //         }
  //         if (ans.question_type == 1 || ans.quesType == 1 || ans.questionType == 1) {
  //           const _score = this.getAnsDataScore(ans, ans.score)
  //           return _score == item.score;
  //         }
  //       }
  //       else {
  //         return ans.score == item.score;
  //       }
  //     });
  //     const title = `${item.title}`
  //     let allScore = answers.map(answer => answer.score);
  //     const result = allScore.every(score => score === 25 || score === 20 || score === 26)
  //       ? 'ws-filled-check-circle'
  //       : 'ws-filled-risk-high';
  //     const risk = allScore.some(score => score === 23)
  //       ? $color.danger
  //       : allScore.some(score => score === 22)
  //         ? 'rgb(255,213,0)'
  //         : allScore.some(score => score === 21)
  //           ? $color.primary
  //           : 'green';

  //     return {
  //       title: title,
  //       icon: item.icon,
  //       color: item.color,
  //       backgroundColor: item.backgroundColor,
  //       tag: item.title,
  //       result: result,
  //       risk: risk,
  //       score: item.score,
  //       ans: _ans,
  //       keypoint: item.keypoint,
  //       images: item.images
  //     };
  //   });
  //   return data;
  // },
  getFormatV3(answers, _titleWithScore) {
    let titleWithScore = [
      {
        title: i18next.t('高風險'),
        icon: 'ws-filled-risk-high',
        color: $color.danger,
        backgroundColor: $color.danger9l,
        score: 23,
      },
      {
        title: i18next.t('中風險'),
        icon: 'ws-filled-risk-medium',
        color: $color.yellow,
        backgroundColor: $color.yellow11l,
        score: 22,
      },
      {
        title: i18next.t('低風險'),
        icon: 'ws-filled-risk-low',
        color: $color.blue,
        backgroundColor: $color.blue9l,
        score: 21,
      },
      {
        title: i18next.t('無異常'),
        icon: 'ws-filled-check-circle',
        color: $color.green,
        backgroundColor: $color.green9l,
        score: 25,
      },
      {
        title: i18next.t('不涉及風險'),
        icon: 'ws-filled-check-circle',
        color: $color.gray,
        backgroundColor: $color.gray9l,
        score: null,
      },
      {
        title: i18next.t('未答題'),
        riskIcon: 'md-help',
        icon: 'ws-filled-help',
        color: $color.gray,
        backgroundColor: $color.gray9l,
        score: 'unanswered',
      },
    ];

    // 合併外部 _titleWithScore 資料
    if (_titleWithScore && _titleWithScore.length > 0) {
      titleWithScore = titleWithScore.map(item => {
        const override = _titleWithScore.find(_item => item.score !== undefined && item.score == _item.value)
        return override ? { ...item, ...override } : item
      })
    }

    // 統計整體風險指標
    const allScore = answers.map(answer => answer.risk_level);
    const result = allScore.every(score => score == 25 || score == 20)
      ? 'ws-filled-check-circle'
      : 'ws-filled-risk-high';
    const risk = allScore.includes(23)
      ? $color.danger
      : allScore.includes(22)
        ? 'rgb(255,213,0)'
        : allScore.includes(21)
          ? $color.primary
          : $color.green;

    // 建構輸出資料，只保留有資料的項目
    const data = titleWithScore.reduce((acc, item) => {
      const matchedAns = answers.filter(answer => {
        if (answer && answer.answer_value) {
          const score = this.getRiskLevelScore(answer, answer.answer_value);
          return score === item.score;
        } else {
          return item.score === 'unanswered';
        }
      });

      if (matchedAns.length > 0) {
        acc.push({
          title: item.title,
          icon: item.icon,
          color: item.color,
          backgroundColor: item.backgroundColor,
          tag: item.title,
          result,
          risk,
          score: item.score,
          keypoint: item.keypoint,
          images: item.images,
          ans: matchedAns,
        });
      }

      return acc;
    }, []);

    return data;
  },

  getFormatV2(answers, _titleWithScore) {
    let titleWithScore = [
      {
        title: i18next.t('高風險'),
        icon: 'ws-filled-risk-high',
        color: $color.danger,
        backgroundColor: $color.danger9l,
        score: 23,
      },
      {
        title: i18next.t('中風險'),
        icon: 'ws-filled-risk-medium',
        color: $color.yellow,
        backgroundColor: $color.yellow11l,
        score: 22,
      },
      {
        title: i18next.t('低風險'),
        icon: 'ws-filled-risk-low',
        color: $color.blue,
        backgroundColor: $color.blue9l,
        score: 21,
      },
      {
        title: i18next.t('無異常'),
        icon: 'ws-filled-check-circle',
        color: $color.green,
        backgroundColor: $color.green9l,
        score: 25,
      },
      // {
      //   title: i18next.t('不適用'),
      //   icon: 'scc-liff-close-circle',
      //   color: $color.gray,
      //   backgroundColor: $color.gray9l,
      //   score: 20,
      // },
      {
        title: i18next.t('不涉及風險'),
        icon: 'ws-filled-check-circle',
        color: $color.gray,
        backgroundColor: $color.gray9l,
        score: null,
      },
      // https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1721
      {
        title: i18next.t('未答題'),
        riskIcon: 'md-help',
        icon: 'ws-filled-help',
        color: $color.gray,
        backgroundColor: $color.gray9l,
        score: 'unanswered'
      },
    ];

    // API Constant Index 整合
    if (_titleWithScore && _titleWithScore.length > 0) {
      titleWithScore = titleWithScore.map(item => {
        _titleWithScore.forEach(_item => {
          if (item.score && (item.score == _item.value)) {
            const _res = {
              ...item,
              ..._item
            }
            return _res
          }
        })
        return item
      })
    }

    const data = titleWithScore.map(item => {
      const _ans = answers.filter(answer => {
        if (answer && answer.answer_value) {
          const _risk_level = this.getRiskLevelScore(answer, answer.answer_value)
          return _risk_level == item.score;
        }
        else {
          // https://gitlab.com/ll_esh/ll_esh_lobby/ll_esh_lobby_app_issue/-/issues/1721
          return item.score == 'unanswered'
        }
      });

      let allScore = answers.map(answer => answer.risk_level);
      const result = allScore.every(score => score == 25 || score == 20)
        ? 'ws-filled-check-circle'
        : 'ws-filled-risk-high';
      const risk = allScore.some(score => score == 23)
        ? $color.danger
        : allScore.some(score => score == 22)
          ? 'rgb(255,213,0)'
          : allScore.some(score => score == 21)
            ? $color.primary
            : 'green';

      return {
        title: item.title,
        icon: item.icon,
        color: item.color,
        backgroundColor: item.backgroundColor,
        tag: item.title,
        result: result,
        risk: risk,
        score: item.score,
        keypoint: item.keypoint,
        images: item.images,
        ans: _ans,
      };
    });
    return data;
  },

  getAnsDataScoreV2(ans, score) {
    // 判斷量性題目的風險值
    const controlLimitData = Array.isArray(ans.question_setting_items) && ans.question_setting_items.length > 0 ? {
      upper: ans.question_setting_items[0].control_limit_upper !== undefined ? ans.question_setting_items[0].control_limit_upper : null,
      lower: ans.question_setting_items[0].control_limit_lower !== undefined ? ans.question_setting_items[0].control_limit_lower : null
    } : { upper: null, lower: null };

    const specLimitData = Array.isArray(ans.question_setting_items) && ans.question_setting_items.length > 0 ? {
      upper: ans.question_setting_items[0].spec_limit_upper !== undefined ? ans.question_setting_items[0].spec_limit_upper : null,
      lower: ans.question_setting_items[0].spec_limit_lower !== undefined ? ans.question_setting_items[0].spec_limit_lower : null
    } : { upper: null, lower: null };

    if (!score) {
      return null;
    }
    if (!controlLimitData.lower &&
      !controlLimitData.upper &&
      !specLimitData.lower &&
      !specLimitData.upper) {
      return 26;
    }
    // if (!controlLimitData.lower || !specLimitData.lower) {
    //   return 20;
    // }
    if (controlLimitData.upper != undefined &&
      controlLimitData.lower != undefined &&
      specLimitData.upper != undefined &&
      specLimitData.lower != undefined) {
      const upperMiddle =
        (controlLimitData.upper !== null && specLimitData.upper !== undefined &&
          controlLimitData.upper !== null && specLimitData.upper !== undefined) ?
          (parseFloat(controlLimitData.upper) + parseFloat(specLimitData.upper)) / 2 : null
      const lowerMiddle =
        (controlLimitData.lower !== null && controlLimitData.lower !== undefined &&
          specLimitData.lower !== null && specLimitData.lower !== undefined) ?
          (parseFloat(controlLimitData.lower) + parseFloat(specLimitData.lower)) / 2 : null;
      if (parseFloat(score) >= parseFloat(controlLimitData.lower) && parseFloat(score) <= parseFloat(controlLimitData.upper)) {
        return 25;
      } else {
        if (parseFloat(score) > specLimitData.upper || parseFloat(score) < specLimitData.lower) {
          return 23;
        }
        if (parseFloat(score) > upperMiddle && parseFloat(score) <= specLimitData.upper ||
          parseFloat(score) < lowerMiddle && parseFloat(score) >= specLimitData.lower) {
          return 22;
        }
        if ((parseFloat(score) >= lowerMiddle && parseFloat(score) < controlLimitData.lower) ||
          (parseFloat(score) > controlLimitData.upper && parseFloat(score) <= upperMiddle)) {
          return 21;
        } else {
          return null;
        }
      }
    } else if (controlLimitData.upper != undefined && controlLimitData.lower != undefined && (!specLimitData.upper && !specLimitData.lower)) {
      if (parseFloat(score) >= parseFloat(controlLimitData.lower) && parseFloat(score) <= parseFloat(controlLimitData.upper)) {
        return 25;
      } else {
        return 23
      }
    } else if (specLimitData.upper != undefined && specLimitData.lower != undefined && (!controlLimitData.upper && !controlLimitData.lower)) {
      if (parseFloat(score) >= parseFloat(specLimitData.lower) && parseFloat(score) <= parseFloat(specLimitData.upper)) {
        return 25;
      } else {
        return 23
      }
    }
  },
  getTypeCustomNumAnsScore(ans, score) {
    const state = store.getState()
    const riskLevelList = state.data.constantData
    // 如果 score 是 undefined，直接返回 "未答題" 對應的風險值
    if (score === undefined && riskLevelList) {
      const noAnswerRisk = riskLevelList.find(risk => risk.code === "checklist_question_no_answer");
      return noAnswerRisk ? noAnswerRisk.value : null; // 如果找不到，返回 null
    }
    // 判斷數值題且自定義條件式的Score
    // lowVal: value_operator === 'in' || value_operator === 'not_in' ? limit_lower : value,
    // highVal: value_operator === 'in' || value_operator === 'not_in' ? limit_upper : null,
    let riskLevelScore = null;
    if (
      ans &&
      ans.question_setting_items &&
      ans.question_setting_items.length > 0
    ) {
      const conditionList = ans.question_setting_items
      conditionList.forEach(({ value, limit_lower, limit_upper, risk_level, value_operator }) => {
        if (
          (value_operator === 'in' && score <= limit_upper && score >= limit_lower) ||
          (value_operator === 'not_in' && (score > limit_upper || score < limit_lower)) ||
          (value_operator === 'eq' && score == value) ||
          (value_operator === 'neq' && score != value) ||
          (value_operator === 'gt' && score > value) ||
          (value_operator === 'gte' && score >= value) ||
          (value_operator === 'lt' && score < value) ||
          (value_operator === 'lte' && score <= value)
        )
          riskLevelScore = risk_level;
      })
      const foundRisk = riskLevelList.find(risk => risk.value == riskLevelScore);
      return foundRisk.value
    }
  },
  getAnsDataScore(ans, score) {
    // 判斷量性題目的風險值
    const controlLimitData = ans.controlLimitData ? ans.controlLimitData : {
      upper: ans.last_version && ans.last_version.control_limit_upper != undefined ? ans.last_version.control_limit_upper : ans.control_limit_upper != undefined ? ans.control_limit_upper : null,
      lower: ans.last_version && ans.last_version.control_limit_lower != undefined ? ans.last_version.control_limit_lower : ans.control_limit_lower != undefined ? ans.control_limit_lower : null
    }

    const specLimitData = ans.specLimitData ? ans.specLimitData : {
      upper: ans.last_version && ans.last_version.spec_limit_upper != undefined ? ans.last_version.spec_limit_upper : ans.spec_limit_upper != undefined ? ans.spec_limit_upper : null,
      lower: ans.last_version && ans.last_version.spec_limit_lower != undefined ? ans.last_version.spec_limit_lower : ans.spec_limit_lower != undefined ? ans.spec_limit_lower : null
    }
    if (!score) {
      return null;
    }
    if (!controlLimitData.lower &&
      !controlLimitData.upper &&
      !specLimitData.lower &&
      !specLimitData.upper) {
      return 26;
    }
    // if (!controlLimitData.lower || !specLimitData.lower) {
    //   return 20;
    // }
    if (controlLimitData.upper != undefined &&
      controlLimitData.lower != undefined &&
      specLimitData.upper != undefined &&
      specLimitData.lower != undefined) {

      const upperMiddle =
        (controlLimitData.upper && specLimitData.upper) ?
          (parseFloat(controlLimitData.upper) + parseFloat(specLimitData.upper)) / 2 : null
      const lowerMiddle =
        (controlLimitData.lower && specLimitData.lower) ?
          (parseFloat(controlLimitData.lower) + parseFloat(specLimitData.lower)) / 2 : null

      if (parseFloat(score) >= parseFloat(controlLimitData.lower) && parseFloat(score) <= parseFloat(controlLimitData.upper)) {
        return 25;
      } else {
        if (parseFloat(score) > specLimitData.upper ||
          parseFloat(score) < specLimitData.lower) {
          return 23;
        }
        if (parseFloat(score) > upperMiddle && parseFloat(score) < specLimitData.upper ||
          parseFloat(score) < lowerMiddle && parseFloat(score) < specLimitData.lower) {
          return 22;
        }
        if ((parseFloat(score) >= lowerMiddle && parseFloat(score) < controlLimitData.lower) ||
          (parseFloat(score) > controlLimitData.upper && parseFloat(score) <= upperMiddle)) {
          return 21;
        } else {
          return null;
        }
      }
    } else if (controlLimitData.upper != undefined && controlLimitData.lower != undefined && (!specLimitData.upper && !specLimitData.lower)) {
      if (parseFloat(score) >= parseFloat(controlLimitData.lower) && parseFloat(score) <= parseFloat(controlLimitData.upper)) {
        return 25;
      } else {
        return 23
      }
    } else if (specLimitData.upper != undefined && specLimitData.lower != undefined && (!controlLimitData.upper && !controlLimitData.lower)) {
      if (parseFloat(score) >= parseFloat(specLimitData.lower) && parseFloat(score) <= parseFloat(specLimitData.upper)) {
        return 25;
      } else {
        return 23
      }
    }
  },
  getSortedWithQues({ record, answers }) {
    const sortedWithQues = [];
    record && record.checklist_record_answers && record.checklist_record_answers.forEach(item => {
      answers.forEach((ans, ansIndex) => {
        if (item.id == ans.id) {
          sortedWithQues.push({
            ...ans,
            no: ansIndex + 1,
          });
        }
      });
    });
    return sortedWithQues;
  },
  getSortedWithQuesV2({ record, answers }) {
    const sortedWithQues = [];
    record && record.checklist_record_answers && record.checklist_record_answers.forEach(item => {
      answers.forEach((ans, ansIndex) => {
        if (item.id == ans.id) {
          sortedWithQues.push({
            ...ans,
            no: ansIndex + 1,
          });
        }
      });
    });
    return sortedWithQues;
  },
  // async getSortedByResult(id) {
  //   // 開始計時
  //   const startTime = performance.now();
  //   // Answers
  //   const answersApi = await this.index({ parentId: id });
  //   const _formattedAnswers = this.getFormat(answersApi.data);
  //   // 結束計時
  //   const endTime = performance.now();
  //   const duration = endTime - startTime;
  //   console.log('answersApi API 執行時間：', duration, '毫秒');
  //   return _formattedAnswers;
  // },
  async getSortedByResultV2(id) {
    const answersApi = await this.indexV2({ parentId: id });
    const _formattedAnswers = this.getFormatV2(answersApi.data);
    return _formattedAnswers;
  },
  async show({ modelId }) {
    return base.show({
      modelId: modelId,
      modelName: 'checklist_record_answer',
      params: {
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams()
      }
    });
  },
  async showV2({ modelId }) {
    return base.show({
      modelId: modelId,
      modelName: 'v2/checklist_record_answer',
      params: {
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams()
      }
    });
  },
  // async getRiskStandardForEffects(id) {
  //   // 判斷回答後Effect用於紀錄內頁的刑責區塊
  //   // getEffectNum
  //   const riskStandard = [
  //     {
  //       value: 'major',
  //       score: 23,
  //     },
  //     {
  //       value: 'minor',
  //       score: 22,
  //     },
  //     {
  //       value: 'ofi',
  //       score: 21,
  //     },
  //     {
  //       value: 'pass',
  //       score: 25,
  //     },
  //   ];
  //   const resAns = await this.index({ parentId: id });
  //   const answers = this.getFormat(resAns.data);
  //   const effects = await S_Effects.index();
  //   // getRiskScore
  //   let _riskScore = {};
  //   riskStandard.forEach(standard => {
  //     _riskScore[standard.value] = answers.filter(ans => {
  //       if (ans.question_type == 2 || ans.quesType == 2 || ans.questionType == 2) {
  //         return ans.score == standard.score;
  //       } else {
  //         const _score = this.getAnsDataScore(ans, ans.score)
  //         return _score == standard.score;
  //       }
  //     }).length;
  //   });
  //   let allScore = answers.map(answer => answer.score);
  //   const format = [];
  //   const effectsNum = effects.data.map(effect => {
  //     const num = this.getEffectNum({
  //       effectId: effect.id,
  //       answers: answers,
  //     });
  //     return {
  //       id: effect.id,
  //       num: num,
  //     };
  //   });
  //   riskStandard.forEach(standard => {
  //     // EffectNum
  //     const value = [];
  //     effects.forEach(effect => {
  //       value.push(S_Effects.getEffectsWithRisk(effectsNum));
  //     });

  //     format.push({
  //       icon: allScore.every(score => score === 25 || score === 20)
  //         ? 'ws-filled-check-circle'
  //         : 'ws-filled-risk-high',
  //       iconColor: allScore.some(score => score === 23)
  //         ? $color.danger
  //         : allScore.some(score => score === 22)
  //           ? $color.yellow
  //           : allScore.some(score => score === 21)
  //             ? $color.parimary
  //             : $color.green,
  //       label: allScore.some(score => score === 23)
  //         ? i18next.t('嚴重異常')
  //         : allScore.some(score => score === 22)
  //           ? i18next.t('中度異常')
  //           : allScore.some(score => score === 21)
  //             ? i18next.t('輕度異常')
  //             : i18next.t('合規'),
  //       num: 'num',
  //       score: standard.score,
  //       value: value,
  //     });
  //   });
  // },
  getRisk(answers, status, constantData) {
    let riskStandard = {
      noYet: {
        label: i18next.t('尚無結果'),
        riskText: i18next.t('尚無結果'),
        riskIcon: 'md-help',
        score: null,
        icon: 'ws-filled-help',
        color: $color.gray,
        bgc: $color.gray9l,
        colors: [$color.gray, $color.white5d]
      },
      major: {
        label: i18next.t('高風險'),
        riskText: i18next.t('高風險'),
        riskIcon: 'md-info',
        score: 23,
        icon: 'ws-filled-risk-high',
        color: $color.danger,
        bgc: $color.danger11l,
        colors: [$color.danger, $color.danger11l]
      },
      minor: {
        label: i18next.t('中風險'),
        riskText: i18next.t('中風險'),
        riskIcon: 'md-info',
        score: 22,
        icon: 'ws-filled-risk-medium',
        color: $color.yellow,
        bgc: $color.yellow11l,
        colors: [$color.yellow, $color.yellow11l]
      },
      ofi: {
        label: i18next.t('低風險'),
        riskText: i18next.t('低風險'),
        riskIcon: 'md-info',
        score: 21,
        icon: 'ws-filled-risk-low',
        color: $color.primary,
        bgc: $color.primary11l,
        colors: [$color.primary, $color.primary11l]
      },
      pass: {
        label: i18next.t('合規'),
        riskText: i18next.t('合規'),
        riskIcon: 'md-check-circle',
        score: 25,
        icon: 'ws-filled-check-circle',
        color: $color.green,
        bgc: $color.green11l,
        colors: [$color.green, $color.green11l]
      },
      justRecord: {
        label: i18next.t('不需點檢'),
        riskText: i18next.t('不需點檢'),
        riskIcon: 'md-check-circle',
        icon: 'ws-filled-check-circle',
        color: $color.gray,
        bgc: $color.gray9l,
        colors: [$color.gray, $color.white5d]
      }
    }

    // API CONSTANT DATA MERGE
    let mergedData = {}
    if (constantData) {
      constantData.forEach(item => {
        for (const key in riskStandard) {
          if (riskStandard[key].score == item.value) {
            mergedData[key] = {
              ...riskStandard[key],
              ...item
            };
          }
        }
      });
    }

    let allScore = []
    answers.forEach((answer) => {
      if (answer.score) {
        if (answer.question_type == 2 || answer.quesType == 2 || answer.questionType == 2) {
          allScore.push(answer.score)
        }
        if (answer.question_type == 1 || answer.quesType == 1 || answer.questionType == 1) {
          const _score = this.getAnsDataScore(answer, answer.score)
          allScore.push(_score)
        }
      }
    });
    const risk = allScore.some((score) => score == 23)
      ? 'major'
      : allScore.some(score => score == 22)
        ? 'minor'
        : allScore.some(score => score == 21)
          ? 'ofi'
          : allScore.some(score => score == 25)
            ? 'pass'
            : 'noYet'
    if (status && status == 1) {
      return riskStandard['justRecord'];
    }
    else if (status != 1) {
      return riskStandard[risk];
    }
  },
  // 用在作業頁
  getRiskV2(answers, status, constantData) {
    let riskStandard = {
      noYet: {
        label: i18next.t('尚無結果'),
        riskText: i18next.t('尚無結果'),
        riskIcon: 'md-help',
        score: null,
        icon: 'ws-filled-help',
        color: $color.gray,
        bgc: $color.gray9l,
        colors: [$color.gray, $color.white5d]
      },
      major: {
        label: i18next.t('高風險'),
        riskText: i18next.t('高風險'),
        riskIcon: 'md-info',
        score: 23,
        icon: 'ws-filled-risk-high',
        color: $color.danger,
        bgc: $color.danger11l,
        colors: [$color.danger, $color.danger11l]
      },
      minor: {
        label: i18next.t('中風險'),
        riskText: i18next.t('中風險'),
        riskIcon: 'md-info',
        score: 22,
        icon: 'ws-filled-risk-medium',
        color: $color.yellow,
        bgc: $color.yellow11l,
        colors: [$color.yellow, $color.yellow11l]
      },
      ofi: {
        label: i18next.t('低風險'),
        riskText: i18next.t('低風險'),
        riskIcon: 'md-info',
        score: 21,
        icon: 'ws-filled-risk-low',
        color: $color.primary,
        bgc: $color.primary11l,
        colors: [$color.primary, $color.primary11l]
      },
      pass: {
        label: i18next.t('無異常'),
        riskText: i18next.t('無異常'),
        riskIcon: 'md-check-circle',
        score: 25,
        icon: 'ws-filled-check-circle',
        color: $color.green,
        bgc: $color.green11l,
        colors: [$color.green, $color.green11l]
      },
      justRecord: {
        label: i18next.t('不涉及風險'),
        riskText: i18next.t('不涉及風險'),
        riskIcon: 'md-check-circle',
        icon: 'ws-filled-check-circle',
        color: $color.gray,
        bgc: $color.gray9l,
        colors: [$color.gray, $color.white5d]
      }
    }

    // API CONSTANT DATA MERGE
    let mergedData = {}
    if (constantData) {
      constantData.forEach(item => {
        for (const key in riskStandard) {
          if (riskStandard[key].score == item.value) {
            mergedData[key] = {
              ...riskStandard[key],
              ...item
            };
          }
        }
      });
    }

    const risk = answers.some(answer => answer.is_in_stats && answer.risk_level == 23)
      ? 'major'
      : answers.some(answer => answer.is_in_stats && answer.risk_level == 22)
        ? 'minor'
        : answers.some(answer => answer.is_in_stats && answer.risk_level == 21)
          ? 'ofi'
          : answers.some(answer => answer.is_in_stats && answer.risk_level == 25)
            ? 'pass'
            : 'noYet'
    if (status && status == 1) {
      return riskStandard['justRecord'];
    }
    else if (status != 1) {
      return riskStandard[risk];
    }
  },
  // 用在結果頁
  getRiskV3(risk_level, status, constantData) {
    let riskStandard = {
      noYet: {
        label: i18next.t('尚無結果'),
        riskText: i18next.t('尚無結果'),
        riskIcon: 'md-help',
        score: null,
        icon: 'ws-filled-help',
        color: $color.gray,
        bgc: $color.gray9l,
        colors: [$color.gray, $color.white5d],
      },
      major: {
        label: i18next.t('高風險'),
        riskText: i18next.t('高風險'),
        riskIcon: 'md-info',
        score: 23,
        icon: 'ws-filled-risk-high',
        color: $color.danger,
        bgc: $color.danger11l,
        colors: [$color.danger, $color.danger11l]
      },
      minor: {
        label: i18next.t('中風險'),
        riskText: i18next.t('中風險'),
        riskIcon: 'md-info',
        score: 22,
        icon: 'ws-filled-risk-medium',
        color: $color.yellow,
        bgc: $color.yellow11l,
        colors: [$color.yellow, $color.yellow11l]
      },
      ofi: {
        label: i18next.t('低風險'),
        riskText: i18next.t('低風險'),
        riskIcon: 'md-info',
        score: 21,
        icon: 'ws-filled-risk-low',
        color: $color.primary,
        bgc: $color.primary11l,
        colors: [$color.primary, $color.primary11l]
      },
      pass: {
        label: i18next.t('無異常'),
        riskText: i18next.t('無異常'),
        riskIcon: 'md-check-circle',
        score: 25,
        icon: 'ws-filled-check-circle',
        color: $color.green,
        bgc: $color.green11l,
        colors: [$color.green, $color.green11l]
      },
      justRecord: {
        label: i18next.t('不涉及風險'),
        riskText: i18next.t('不涉及風險'),
        riskIcon: 'md-check-circle',
        icon: 'ws-filled-check-circle',
        color: $color.gray,
        bgc: $color.gray9l,
        colors: [$color.gray, $color.white5d]
      }
    }

    // API CONSTANT DATA MERGE
    let mergedData = {}
    if (constantData) {
      constantData.forEach(item => {
        for (const key in riskStandard) {
          if (riskStandard[key].score == item.value) {
            mergedData[key] = {
              ...riskStandard[key],
              ...item
            };
          }
        }
      });
    }
    const risk = risk_level == 23
      ? 'major'
      : risk_level == 22
        ? 'minor'
        : risk_level == 21
          ? 'ofi'
          : risk_level == 25
            ? 'pass'
            : 'noYet'
    if (status && status == 1) {
      return riskStandard['justRecord'];
    }
    else if (status != 1) {
      return riskStandard[risk];
    }
  },
  getRiskNumInAnswers(answers, riskScore) {
    const _ans = answers.filter(ans => {
      if (ans.question_type == 2 || ans.quesType == 2 || ans.questionType == 2) {
        return ans.score == riskScore;
      }
      if (ans.question_type == 1 || ans.quesType == 1 || ans.questionType == 1) {
        const _score = this.getAnsDataScore(ans, ans.score)
        return _score == riskScore;
      }
    });
    return _ans.length;
  },
  getRiskEffectCalcs(score, effects, answers) {
    const _calcs = [];
    effects.forEach(effect => {
      const _effectNum = this.getEffectNumFromAnsAndScore(
        answers,
        score,
        effect,
      );
      _calcs.push({
        icon: effect.icon,
        label: effect.name,
        num: _effectNum,
        color: $color.danger,
      });
    });
    _calcs.push({
      icon: "",
      label: i18next.t('重點關注'),
      num: 0,
      color: $color.primary
    })
    return _calcs;
  },
  getRiskEffectCalcsV2(score, effects, answers) {
    const _calcs = [];
    let _calcsKeyPoint
    effects.forEach(effect => {
      const { _effectNum, _keyPointCount } = this.getEffectNumFromAnsAndScoreV2(
        answers,
        score,
        effect,
      );
      if (_effectNum) {
        _calcs.push({
          icon: effect.icon,
          label: effect.name,
          num: _effectNum,
          color: $color.danger,
        });
      }
      if (_keyPointCount) {
        _calcsKeyPoint = _keyPointCount
      }
    })
    if (_calcsKeyPoint) {
      _calcs.push({
        icon: null,
        label: '重點關注',
        num: _calcsKeyPoint ? _calcsKeyPoint : '-',
        color: $color.primary
      })
    }
    return _calcs;
  },
  getEffectNumFromAnsAndScore(answers, score, effect) {
    const _num = [];
    answers.forEach(answer => {
      if (answer.question_type == 2 || answer.quesType == 2 || answer.questionType == 2) {
        if (answer.score == score) {
          const _effect = answer.effects && answer.effects.find(ansEffect => {
            return ansEffect.id == effect.id;
          });
          if (_effect) {
            _num.push(_effect);
          }
        }
      } else {
        if (this.getAnsDataScore(answer, answer.score) == score) {
          const _effect = answer.effects && answer.effects.find(ansEffect => {
            return ansEffect.id == effect.id;
          });
          if (_effect) {
            _num.push(_effect);
          }
        }
      }
    });
    return _num.length;
  },
  getEffectNumFromAnsAndScoreV2(answers, score, effect) {
    const _num = [];
    let keyPointCount = 0; // 初始化累加器
    answers.forEach(answer => {
      if (answer.risk_level == score) {
        const _effect = answer.effects && answer.effects.find(ansEffect => {
          return ansEffect.id == effect.id;
        });
        if (_effect) {
          _num.push(_effect);
        }
        const _factory_effect = answer.factory_effects && answer.factory_effects.find(ansEffect => {
          return ansEffect.id == effect.id;
        });
        if (_factory_effect) {
          _num.push(_factory_effect);
        }
        if (answer.keypoint) {
          keyPointCount += 1
        }
      }
    });
    return { _effectNum: _num.length, _keyPointCount: keyPointCount };
  },
  // getRiskWithEffect({ effects, answers }) {
  //   const riskStandard = {
  //     major: {
  //       label: i18next.t('高風險'),
  //       riskText: i18next.t('不合規'),
  //       riskIcon: 'md-info',
  //       score: 23,
  //       icon: 'ws-filled-risk-high',
  //       color: $color.danger,
  //       bgc: $color.danger11l,
  //     },
  //     minor: {
  //       label: i18next.t('中風險'),
  //       riskText: i18next.t('中度異常'),
  //       riskIcon: 'md-info',
  //       score: 22,
  //       icon: 'ws-filled-risk-medium',
  //       color: $color.yellow,
  //       bgc: $color.yellow11l,
  //     },
  //     ofi: {
  //       label: i18next.t('低風險'),
  //       riskText: i18next.t('輕度異常'),
  //       riskIcon: 'md-info',
  //       score: 21,
  //       icon: 'ws-filled-risk-low',
  //       color: $color.primary,
  //       bgc: $color.primary11l,
  //     },
  //     pass: {
  //       label: i18next.t('合規'),
  //       riskText: i18next.t('合規'),
  //       riskIcon: 'md-check-circle',
  //       score: 25,
  //       icon: 'ws-filled-check-circle',
  //       color: $color.green,
  //       bgc: $color.green11l,
  //     },
  //   }
  //   const _riskWithEffect = [];
  //   for (let riskKey in riskStandard) {
  //     const risk = riskStandard[riskKey];

  //     const _num = this.getRiskNumInAnswers(answers, risk.score);

  //     _riskWithEffect.push({
  //       icon: risk.riskIcon,
  //       iconColor: risk.color,
  //       label: risk.riskText,
  //       num: _num,
  //       items: this.getRiskEffectCalcs(risk.score, effects, answers),
  //     });
  //   }
  //   return _riskWithEffect;
  // },
  getRiskWithEffectV2({ effects, answers }) {
    const riskStandard = {
      major: {
        label: i18next.t('高風險'),
        riskText: i18next.t('高風險'),
        riskIcon: 'md-info',
        score: 23,
        icon: 'ws-filled-risk-high',
        color: $color.danger,
        bgc: $color.danger11l,
      },
      minor: {
        label: i18next.t('中風險'),
        riskText: i18next.t('中風險'),
        riskIcon: 'md-info',
        score: 22,
        icon: 'ws-filled-risk-medium',
        color: $color.yellow,
        bgc: $color.yellow11l,
      },
      ofi: {
        label: i18next.t('低風險'),
        riskText: i18next.t('低風險'),
        riskIcon: 'md-info',
        score: 21,
        icon: 'ws-filled-risk-low',
        color: $color.primary,
        bgc: $color.primary11l,
      },
      pass: {
        label: i18next.t('無異常'),
        riskText: i18next.t('無異常'),
        riskIcon: 'md-check-circle',
        score: 25,
        icon: 'ws-filled-check-circle',
        color: $color.green,
        bgc: $color.green11l,
      },
    }
    const _riskWithEffect = [];
    for (let riskKey in riskStandard) {
      const risk = riskStandard[riskKey];
      const _num = answers.filter(ans => ans.is_in_stats === 1 && ans.risk_level == risk.score).length;
      _riskWithEffect.push({
        icon: risk.riskIcon,
        iconColor: risk.color,
        label: risk.riskText,
        num: _num,
        items: this.getRiskEffectCalcsV2(risk.score, effects, answers),
      });
    }
    return _riskWithEffect;
  },
  getEffectNum({ effectId, answers }) {
    const numData = [];
    answers.forEach(aRiskBlock => {
      numData.push({
        score: aRiskBlock.score,
      });
      const _effect = aRiskBlock.ans.filter(answer => {
        const effectIds = answer.effects.map(effect => {
          return effect.id;
        });
        return effectIds.includes(effectId);
      });
      return _effect.length;
    });
  },
  getAllRiskNumFormRecord(answers) {
    const riskStandard = [
      {
        value: 'major',
        score: 23,
      },
      {
        value: 'minor',
        score: 22,
      },
      {
        value: 'ofi',
        score: 21,
      },
      {
        value: 'pass',
        score: 25,
      },
    ];
    let major = 0;
    let minor = 0;
    let ofi = 0;
    let pass = 0;
    answers.forEach(ans => {
      if (ans.question_type == 2) {
        switch (ans.score) {
          case 25:
            pass++;
            break;
          case 21:
            ofi++;
            break;
          case 22:
            minor++;
            break;
          case 23:
            major++;
            break;
        }
      } else {
        switch (this.getAnsDataScoreV2(ans, ans.score)) {
          case 25:
            pass++;
            break;
          case 21:
            ofi++;
            break;
          case 22:
            minor++;
            break;
          case 23:
            major++;
            break;
        }
      }
    });
    return {
      major: major,
      minor: minor,
      ofi: ofi,
      pass: pass,
    };
  },
  // 整理點檢表答題後存API前的資料
  $_setProcedureAnswerData(score, remark = '', questionIndex, question, produceData) {
    //處理成存後端的資料格式的Func
    const $_formatDataWithId = data => {
      const result = data.map(r => {
        return r.id;
      });
      return result;
    };
    // redux 初始 checklist_record_answers
    const arr = produceData.checklist_record_answers
      ? produceData.checklist_record_answers
      : [];
    // 整理要存後端的資料
    const _checklist_record_answers = {
      ...question.last_version,
      act_version_alls: question.last_version.act_version_alls
        ? $_formatDataWithId(question.last_version.act_version_alls)
        : '',
      article_versions: question.last_version.article_versions
        ? $_formatDataWithId(question.last_version.article_versions)
        : '',
      act_versions: question.last_version.act_versions
        ? $_formatDataWithId(question.last_version.act_versions)
        : '',
      checklist_question: question.id ? question.id : '',
      checklist_question_version: question.last_version.id
        ? question.last_version.id
        : '',
      checklist_question_template: question.checklist_question_template
        ? question.checklist_question_template.id
        : '',
      checklist_question_template_version: question.checklist_question_template
        ? question.checklist_question_template.last_version.id
        : '',
      title: question.title ? question.title : '',
      remark: remark ? remark : "",
      score: score ? parseFloat(score) : '',
      risk_level: score ? parseInt(score) : '',
      questionIndex: questionIndex,
      factory: S_Processor.getFactoryParams().factory,
    };
    delete _checklist_record_answers.id;
    arr.splice(questionIndex, 1, _checklist_record_answers)
    return arr;
  },
  validationQuestionSubmit(questions = [], currentUser) {
    let _validations = []
    questions.forEach(question => {
      const checkers = question &&
        question.question_setting &&
        question.question_setting.checkers &&
        question.question_setting.checkers.length > 0 ? question.question_setting.checkers : [];
      const selfId = currentUser && currentUser.id
      // 題目我是否為 答題者 或 不限制答題者
      const includesSelf = checkers && checkers.length > 0 ? checkers.some(checker => checker.id === selfId) : checkers && checkers.length == 0 ? true : false
      if (includesSelf) {
        let score
        if (question.question_type == 2 || question.quesType == 2 || question.questionType == 2) {
          score = question.score;
        }
        if (question.question_type == 1 || question.quesType == 1 || question.questionType == 1) {
          _score = S_CheckListRecordAns.getAnsDataScore(question, question.score)
          score = _score
        }
        const isScoreValid = score == 25 || score == 26;
        const remark = question.remark;
        const hasRemark = remark != null && remark != undefined && remark.trim() != '';

        if (isScoreValid || hasRemark) {
          _validations.push(true)
        } else {
          _validations.push(false)
        }
      }
    });
    const allTrue = _validations.every(quesValid => quesValid === true);
    return allTrue
  },
  validationQuestionSubmitV2(questions = [], currentUser) {
    // 先篩選出 question_setting.checkers 包含 currentUser.id 題目
    const userQuestions = questions.filter(question =>
      question.question_setting &&
      Array.isArray(question.question_setting.checkers) &&
      question.question_setting.checkers.some(checker => checker.id === currentUser.id)
    );

    // 如果過濾後沒有題目，那就不用驗證，或根據需求返回 true 或 false
    if (userQuestions.length === 0) {
      // 可依需求調整，這裡假設如果沒有屬於 currentUser 的題目，就返回 true 可以送出
      return true;
    }

    // Step 1: 檢查是否有任一題 is_in_stats為1 但不具有 risk_level ，就返回 true 可以送出
    const hasRiskLevel = userQuestions.some(question => {
      return question.is_in_stats == 1 && (question.risk_level == null || question.risk_level == undefined);
    });
    console.log(hasRiskLevel, 'hasRiskLevel222');
    if (hasRiskLevel) {
      return true;
    }

    // Step 2: 確認是否有任一題 isNeedCheckAns 為 true
    const hasNeedCheckAns = userQuestions.some(question => question.isNeedCheckAns === true);
    if (hasNeedCheckAns) {
      return false;
    }
    // Step 3: 確認每一題都具有 answer_value
    const allHaveAnswerValues = userQuestions.every(
      question => question.answer_value !== null && question.answer_value !== undefined
    );
    if (!allHaveAnswerValues) {
      return false;
    }
    // Step 4: 確認每個 answer_value 通過 validationRemark 驗證
    const validationRemark = userQuestions.every(
      question => !this.validationRemark(question) || (this.validationRemark(question) && question.remark)
    );
    // 最終結果：若都符合條件，返回 true，否則 false
    return validationRemark;
  },
  getRiskLevelScore(answer, answer_value) {
    const _questionType = answer.question_type_setting?.value
    const _answer_setting = answer.answer_setting?.type
    const _is_in_stats = answer.is_in_stats
    const _score = answer.risk_level
    if (
      (_questionType === 'date' ||
        _questionType === 'text' ||
        (_questionType === 'num' && _answer_setting === 'num-only') ||
        (_questionType === 'num' && _is_in_stats === 0)
      )
      && answer.answer_value
    ) {
      return answer.risk_level
    }
    if (
      _questionType === 'num' && _answer_setting === 'control-limit'
    ) {
      const _score = this.getAnsDataScoreV2(answer, answer.answer_value)
      return _score
    }
    if (
      _questionType === 'num' && _answer_setting === 'custom-num'
    ) {
      const _score = this.getTypeCustomNumAnsScore(answer, answer.answer_value)
      return parseInt(_score)
    }
    if (
      _questionType === 'single-choice' &&
      Array.isArray(answer.answer_value)
    ) {
      const _score = answer.answer_value[0] && answer.answer_value[0].risk_level
      return _score
    }
    if (
      _questionType === 'single-choice' &&
      typeof answer.answer_value === 'object'
    ) {
      return answer.answer_value?.value
    }
    else {
      return answer.risk_level
    }
  },
  getScoreTextV2(answer) {
    const { t, i18n } = useTranslation();
    const _questionType = answer.question_type_setting?.value
    const _answer_setting = answer.answer_setting?.type
    const _is_in_stats = answer.is_in_stats
    if (
      (_questionType === 'date' ||
        _questionType === 'text' ||
        (_questionType === 'num' && _answer_setting === 'num-only') ||
        (_questionType === 'num' && _is_in_stats === 0)
      )
      && answer.answer_value
    ) {
      return `${t('不涉及風險')} ${answer.answer_value}`
    }
    if (
      _questionType === 'num' && _answer_setting === 'control-limit'
    ) {
      const _score = this.getAnsDataScoreV2(answer, answer.answer_value)
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? t('未答題')
        : _score == 21 ?
          `${t('低風險')} ${answer.answer_value}`
          : _score == 22 ?
            `${t('中風險')} ${answer.answer_value}`
            : _score == 23 ?
              `${t('高風險')} ${answer.answer_value}`
              : `${t('無異常')} ${answer.answer_value}`
    }
    if (
      _questionType === 'num' && _answer_setting === 'custom-num'
    ) {
      const _score = this.getTypeCustomNumAnsScore(answer, answer.answer_value)
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? t('未答題')
        : _score == 21 ?
          `${t('低風險')} ${answer.answer_value}`
          : _score == 22 ?
            `${t('中風險')} ${answer.answer_value}`
            : _score == 23 ?
              `${t('高風險')} ${answer.answer_value}`
              : `${t('無異常')} ${answer.answer_value}`
    }
    if (
      _questionType === 'single-choice' &&
      answer.answer_value &&
      answer.answer_value[0]
    ) {
      const _score = answer.answer_value && answer.answer_value[0]?.risk_level
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? t('未答題')
        : _score == 21 ?
          `${t('低風險')} ${answer.answer_value[0]?.name}`
          : _score == 22 ?
            `${t('中風險')} ${answer.answer_value[0]?.name}`
            : _score == 23 ?
              `${t('高風險')} ${answer.answer_value[0]?.name}`
              : _score == 25 ?
                `${t('無異常')} ${answer.answer_value[0]?.name}`
                : `${t('不適用')}`
    }
    else {
      const _score = answer.risk_level ? answer.risk_level : answer.answer_value?.value
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? t('未答題')
        : _score == 21 ?
          `${t('低風險')} ${_questionType === 'single-choice' ? answer.answer_value?.label : answer.answer_value}`
          : _score == 22 ?
            `${t('中風險')} ${_questionType === 'single-choice' ? answer.answer_value?.label : answer.answer_value}`
            : _score == 23 ?
              `${t('高風險')} ${_questionType === 'single-choice' ? answer.answer_value?.label : answer.answer_value}`
              : _score == 25 ?
                `${t('無異常')} ${_questionType === 'single-choice' ? answer.answer_value?.label : answer.answer_value}`
                : `${t('不適用')}`
    }
  },
  getScoreTextV3(answer) {
    const { t, i18n } = useTranslation();
    const _questionType = answer.question_type_setting?.value
    const _is_in_stats = answer.is_in_stats
    const _score = answer.risk_level
    const _unit = answer.unit
    return answer.answer_value == null || Number.isNaN(answer.answer_value)
      ? `${t('未答題')}`
      : _score == 21 ?
        `${t('低風險')}`
        : _score == 22 ?
          `${t('中風險')}`
          : _score == 23 ?
            `${t('高風險')}`
            : _score == 25 ?
              `${t('無異常')}`
              : `${t('不涉及風險')}`
  },
  getScoreTextV4(answer) {
    const { t, i18n } = useTranslation();
    const _questionType = answer.question_type_setting?.value
    const _is_in_stats = answer.is_in_stats
    const _score = answer.risk_level
    const _unit = answer.unit
    if (
      _questionType === 'date' && answer.answer_value
    ) {
      return `${t('觀測日期')}`
    }
    if (
      _questionType === 'text' && answer.answer_value
    ) {
      return `${t('觀測內容')}`
    }
    if (
      _questionType === 'num' && answer.answer_value
    ) {
      return `${t('觀測值')}`
    }
    if (
      _questionType === 'single-choice' &&
      Array.isArray(answer.answer_value) && // 確認是陣列
      answer.answer_value[0]
    ) {
      return `${t('作答')}`
    }
    if (
      _questionType === 'single-choice' &&
      !Array.isArray(answer.answer_value) && // 確認不是陣列（可能是字串或物件）
      answer.answer_value
    ) {
      return `${t('作答')}`
    }
    else {
      return ``
    }
  },
  getScoreTextV5(answer) {
    const { t, i18n } = useTranslation();
    const _questionType = answer.question_type_setting?.value
    const _is_in_stats = answer.is_in_stats
    const _score = answer.risk_level
    const _unit = answer.unit
    if (
      _questionType === 'date' && answer.answer_value
    ) {
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? ` `
        : _score == 21 ?
          `${moment(answer.answer_value).format('YYYY-MM-DD HH:mm')}`
          : _score == 22 ?
            `${moment(answer.answer_value).format('YYYY-MM-DD HH:mm')}`
            : _score == 23 ?
              `${moment(answer.answer_value).format('YYYY-MM-DD HH:mm')}`
              : _score == 25 ?
                `${moment(answer.answer_value).format('YYYY-MM-DD HH:mm')}`
                : `${moment(answer.answer_value).format('YYYY-MM-DD HH:mm')}`
    }
    if (
      _questionType === 'text' && answer.answer_value
    ) {
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? ` `
        : _score == 21 ?
          `${answer.answer_value}`
          : _score == 22 ?
            `${answer.answer_value}`
            : _score == 23 ?
              `${answer.answer_value}`
              : _score == 25 ?
                `${answer.answer_value}`
                : `${answer.answer_value}`
    }
    if (
      _questionType === 'num' && answer.answer_value
    ) {
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? t('未答題')
        : _score == 21 ?
          `${answer.answer_value}${_unit ? _unit : ''}`
          : _score == 22 ?
            `${answer.answer_value}${_unit ? _unit : ''}`
            : _score == 23 ?
              `${answer.answer_value}${_unit ? _unit : ''}`
              : `${answer.answer_value}${_unit ? _unit : ''}`
    }
    if (
      _questionType === 'single-choice' &&
      Array.isArray(answer.answer_value) &&
      answer.answer_value[0]
    ) {
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? t('未答題')
        : _score == 21 ?
          `${answer.answer_value[0]?.name ? answer.answer_value[0]?.name : ''}`
          : _score == 22 ?
            `${answer.answer_value[0]?.name ? answer.answer_value[0]?.name : ''}`
            : _score == 23 ?
              `${answer.answer_value[0]?.name ? answer.answer_value[0]?.name : ''}`
              : _score == 25 ?
                `${answer.answer_value[0]?.name ? answer.answer_value[0]?.name : ''}`
                : ``
    }
    if (
      _questionType === 'single-choice' &&
      !Array.isArray(answer.answer_value) &&
      answer.answer_value
    ) {
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? t('未答題')
        : _score == 21 ?
          `${answer.answer_value ? answer.answer_value.label : ''}`
          : _score == 22 ?
            `${answer.answer_value ? answer.answer_value.label : ''}`
            : _score == 23 ?
              `${answer.answer_value ? answer.answer_value.label : ''}`
              : _score == 25 ?
                `${answer.answer_value ? answer.answer_value.label : ''}`
                : ``
    }
    else {
      return answer.answer_value == null || Number.isNaN(answer.answer_value)
        ? ` `
        : _score == 21 ?
          `${_questionType === 'single-choice' && answer.answer_value[0] ? answer.answer_value[0]?.name : answer.answer_value ? answer.answer_value : ''}`
          : _score == 22 ?
            `${_questionType === 'single-choice' && answer.answer_value[0] ? answer.answer_value[0]?.name : answer.answer_value ? answer.answer_value : ''}`
            : _score == 23 ?
              `${_questionType === 'single-choice' && answer.answer_value[0] ? answer.answer_value[0]?.name : answer.answer_value ? answer.answer_value : ''}`
              : _score == 25 ?
                `${_questionType === 'single-choice' && answer.answer_value[0] ? answer.answer_value[0]?.name : answer.answer_value ? answer.answer_value : ''}`
                : `${_questionType === 'single-choice' && answer.answer_value[0] ? answer.answer_value[0]?.name : answer.answer_value ? answer.answer_value : ''}`
    }
  },
  validationRemark(answer) {
    const _questionType = answer.question_type_setting?.value
    const _answer_setting = answer.answer_setting?.type
    if (
      (_questionType === 'date' ||
        _questionType === 'text' ||
        (_questionType === 'num' && _answer_setting === 'num-only'))
      && answer.answer_value
    ) {
      return false
    }
    if (
      _questionType === 'num' && _answer_setting === 'control-limit'
    ) {
      const _score = this.getAnsDataScoreV2(answer, answer.answer_value)
      return _score == null || Number.isNaN(_score)
        ? false
        : _score == 21 ?
          true
          : _score == 22 ?
            true
            : _score == 23 ?
              true
              : false
    }
    if (
      _questionType === 'num' && _answer_setting === 'custom-num'
    ) {
      const _score = this.getTypeCustomNumAnsScore(answer, answer.answer_value)
      return _score == null || Number.isNaN(_score)
        ? false
        : _score == 21 ?
          true
          : _score == 22 ?
            true
            : _score == 23 ?
              true
              : false
    }
    else {
      const _score = answer.answer_value?.value
      return _score == null || Number.isNaN(_score)
        ? false
        : _score == 20 ?
          true
          : _score == 21 ?
            true
            : _score == 22 ?
              true
              : _score == 23 ?
                true
                : _score == 25 ?
                  false
                  : false
    }
  },
  getScoreRemarkColor(answer) {
    const _questionType = answer.question_type_setting?.value
    const _answer_setting = answer.answer_setting?.type
    if (
      (_questionType === 'date' ||
        _questionType === 'text' ||
        (_questionType === 'num' && _answer_setting === 'num-only'))
      && answer.answer_value
    ) {
      return $color.gray
    }
    if (
      _questionType === 'num' && _answer_setting === 'control-limit'
    ) {
      const _score = this.getAnsDataScoreV2(answer, answer.answer_value)
      return _score == null
        ? $color.gray
        : _score == 21 ?
          $color.danger
          : _score == 22 ?
            $color.danger
            : _score == 23 ?
              $color.danger
              : $color.gray
    }
    if (
      _questionType === 'num' && _answer_setting === 'custom-num'
    ) {
      const _score = this.getTypeCustomNumAnsScore(answer, answer.answer_value)
      return _score == null
        ? $color.gray
        : _score == 21 ?
          $color.danger
          : _score == 22 ?
            $color.danger
            : _score == 23 ?
              $color.danger
              : $color.gray
    }
    else {
      const _score = answer.answer_value?.value
      return _score == null
        ? $color.gray
        : _score == 20 ?
          $color.danger
          : _score == 21 ?
            $color.danger
            : _score == 22 ?
              $color.danger
              : _score == 23 ?
                $color.danger
                : $color.gray
    }
  },
  getScoreIconV2(answer) {
    const _questionType = answer.question_type_setting?.value
    const _answer_setting = answer.answer_setting?.type
    const _is_in_stats = answer.is_in_stats
    const _score = answer.risk_level
    if (
      (_questionType === 'date' ||
        _questionType === 'text' ||
        (_questionType === 'num' && _answer_setting === 'num-only') ||
        (_questionType === 'num' && _is_in_stats === 0)
      )
      && answer.answer_value
    ) {
      return 'sc-liff-check-circle'
    }
    if (
      _questionType === 'num' &&
      _answer_setting === 'control-limit'
    ) {
      const _score = this.getAnsDataScoreV2(answer, answer.answer_value)
      return _score == 25
        ? 'md-check-circle'
        : _score == 26
          ? 'md-check-circle'
          : _score == 20
            ? 'ws-filled-cancel'
            : _score == 21 || _score == 22 || _score == 23
              ? 'ws-filled-warning'
              : 'ws-filled-help'
    }
    if (
      _questionType === 'num' &&
      _answer_setting === 'custom-num'
    ) {
      const _score = this.getTypeCustomNumAnsScore(answer, answer.answer_value)
      return _score == 25
        ? 'md-check-circle'
        : _score == 26
          ? 'md-check-circle'
          : _score == 20
            ? 'ws-filled-cancel'
            : _score == 21 || _score == 22 || _score == 23
              ? 'ws-filled-warning'
              : 'ws-filled-help'
    }
    if (
      _questionType === 'single-choice' &&
      Array.isArray(answer.answer_value)
    ) {
      const _score = answer.answer_value && answer.answer_value[0]?.risk_level
      return _score == 25
        ? 'md-check-circle'
        : _score == 20
          ? 'scc-liff-close-circle'
          : _score == 21 || _score == 22 || _score == 23
            ? 'ws-filled-warning'
            : 'ws-filled-help'
    }
    if (
      _questionType === 'single-choice' &&
      typeof answer.answer_value === 'object'
    ) {
      const _score = answer.risk_level && answer.answer_value?.value
      return _score == 25
        ? 'md-check-circle'
        : _score == 20
          ? 'scc-liff-close-circle'
          : _score == 21 || _score == 22 || _score == 23
            ? 'ws-filled-warning'
            : 'ws-filled-help'
    }
    if (
      answer.risk_level && answer.answer_value
    ) {
      const _score = answer.answer_value && answer.risk_level
      return _score == 25
        ? 'md-check-circle'
        : _score == 20
          ? 'scc-liff-close-circle'
          : _score == 21 || _score == 22 || _score == 23
            ? 'ws-filled-warning'
            : 'ws-filled-help'
    }
    else {
      return 'sc-liff-help-circle'
    }
  },
  getScoreIconV3(answer) {
    const _score = answer.risk_level
    return _score == 21 || _score == 22 || _score == 23 ? 'ws-filled-warning' : 'md-check-circle'
  },
  getScoreIcon(answer) {
    if (
      answer.question_type == 1
      || answer.quesType == 1
      || answer.questionType == 1
    ) {
      return S_CheckListRecordAns.getAnsDataScore(answer, answer.score) == 25
        ? 'md-check-circle'
        : S_CheckListRecordAns.getAnsDataScore(answer, answer.score) == 26
          ? 'md-check-circle'
          : S_CheckListRecordAns.getAnsDataScore(answer, answer.score) == 20
            ? 'ws-filled-cancel'
            : S_CheckListRecordAns.getAnsDataScore(answer, answer.score) == 21
              || S_CheckListRecordAns.getAnsDataScore(answer, answer.score) == 22
              || S_CheckListRecordAns.getAnsDataScore(answer, answer.score) == 23
              ? 'ws-filled-warning'
              : 'ws-filled-help'
    }
    if (
      answer.question_type == 2
      || answer.quesType == 2
      || answer.questionType == 2
    ) {
      return answer.score == 25
        ? 'md-check-circle'
        : answer.score == 20
          ? 'scc-liff-close-circle'
          : answer.score == 21 || answer.score == 22 || answer.score == 23
            ? 'ws-filled-warning'
            : 'ws-filled-help'
    }
    else {
      return 'sc-liff-help-circle'
    }
  },
  getScoreIconColorV2(answer) {
    const _questionType = answer.question_type_setting?.value
    const _answer_setting = answer.answer_setting?.type
    const _is_in_stats = answer.is_in_stats
    const _score = answer.risk_level
    if (
      (_questionType === 'date' ||
        _questionType === 'text' ||
        (_questionType === 'num' && _answer_setting === 'num-only') ||
        (_questionType === 'num' && _is_in_stats === 0)
      )
      && answer.answer_value
    ) {
      return $color.gray
    }
    if (
      _questionType === 'num' &&
      _answer_setting === 'control-limit'
    ) {
      const _score = this.getAnsDataScoreV2(answer, answer.answer_value)
      return _score == 25
        ? $color.green
        : _score == 20
          ? $color.gray
          : _score == 21
            ? $color.primary
            : _score == 22
              ? $color.yellow
              : _score == 23
                ? $color.danger
                : $color.gray
    }
    if (
      _questionType === 'num' && _answer_setting === 'custom-num'
    ) {
      const _score = this.getTypeCustomNumAnsScore(answer, answer.answer_value)
      return _score == 25
        ? $color.green
        : _score == 20
          ? $color.gray
          : _score == 21
            ? $color.primary
            : _score == 22
              ? $color.yellow
              : _score == 23
                ? $color.danger
                : $color.gray
    }
    if (
      _questionType === 'single-choice' &&
      answer.answer_value &&
      answer.answer_value[0]
    ) {
      const _score = answer.answer_value && answer.answer_value[0]?.risk_level
      return _score == 23
        ? $color.danger
        : _score == 22
          ? $color.yellow
          : _score == 21
            ? $color.primary
            : _score == 25
              ? $color.green
              : $color.gray;
    }
    else {
      const _score = answer.risk_level ? answer.risk_level : _questionType === 'single-choice' ? answer.answer_value?.value : answer.answer_value
      return _score == 23
        ? $color.danger
        : _score == 22
          ? $color.yellow
          : _score == 21
            ? $color.primary
            : _score == 25
              ? $color.green
              : $color.gray;
    }
  },
  getScoreIconColorV3(answer) {
    const _score = answer.risk_level
    return _score == 23
      ? $color.danger
      : _score == 22
        ? $color.yellow
        : _score == 21
          ? $color.primary
          : _score == 25
            ? $color.green
            : $color.gray;
  },
  getScoreIconColor(answer) {
    if (
      answer.question_type == 1
      || answer.quesType == 1
      || answer.questionType == 1
    ) {
      return S_CheckListRecordAns.getAnsDataScore(answer, answer.score) == 25
        ? $color.green
        : S_CheckListRecordAns.getAnsDataScore(answer, answer.score) == 20
          ? $color.gray
          : S_CheckListRecordAns.getAnsDataScore(answer, answer.score) == 21
            ? $color.primary
            : S_CheckListRecordAns.getAnsDataScore(answer, answer.score) == 22
              ? $color.yellow
              : S_CheckListRecordAns.getAnsDataScore(answer, answer.score) == 23
                ? $color.danger
                : $color.gray
    }
    return answer.score == 23
      ? $color.danger
      : answer.score == 22
        ? $color.yellow
        : answer.score == 21
          ? $color.primary
          : answer.score == 25
            ? $color.green
            : $color.gray;
  },
  setRiskHeaderColors(answers) {
    let score = answers.map((answer) => answer.score);
    return score == 23
      ? [$color.danger, $color.danger10l]
      : score == 22
        ? [$color.yellow, $color.yellow10l]
        : score == 21
          ? [$color.primary, $color.primary10l]
          : score == 25
            ? [$color.green, $color.green10l]
            : [$color.white, $color.black]
  },
  getFormatRiskHeaderAns(answers) {
    const _answers = []
    answers.forEach(answer => {
      if (answer.ans && answer.ans.length > 0) {
        answer.ans.forEach(_ans => {
          _answers.push(_ans)
        }
        )
      }
    })
    return _answers
  },
  getQuestionsWithSequence(answers) {
    const _sequenceAns = answers.map((ans, index) => {
      const _no = index + 1
      const _ans = {
        ...ans,
        no: _no
      }
      return _ans
    })
    return _sequenceAns
  },
  getPassRate(answers) {
    // 點檢題目合規率公式： 合規題數 / (總題數-不適用題數)*100%
    const _allLength = answers.length
    const _disableLength = answers.filter(ans => ans.score == 20).length
    const _safeLength = answers.filter(ans => ans.score == 25).length
    const _passRate = Math.round((_safeLength / (_allLength - _disableLength)) * 10000) / 100
    return _passRate
  },
  getPassRateV2(answers) {
    // 合規題數 / (總題數-不適用題數)*100%
    // 不適用題數，是包含不涉及風險及不列入統計的題數
    const _allLength = answers.length;
    // 不適用題數
    const _disableLength = answers.filter(ans => ans.risk_level == 20 || ans.is_in_stats == 0).length
    //  合規題數
    const _safeLength = answers.filter(ans => ans.risk_level == 25 && ans.is_in_stats == 1).length
    const _passRate = Math.round((_safeLength / (_allLength - _disableLength)) * 10000) / 100
    return _passRate
  },
  getValidationQuestions(answers, targetId) {
    answers.forEach(item => {
      if (item.id === targetId) {
        return {
          ...item,
          validation: false
        }
      } else {
        return {
          ...item,
          validation: true
        }
      }
    });
  },
  async batchStore({ params }) {
    const _checklistId = params.checklist_id
    return base.create({
      modelName: `v1/checklist/${_checklistId}/checklist_record_answer/batch/store`,
      data: {
        ...params
      }
    })
  },
  async batchStoreV2({ params }) {
    const _checklistId = params.checklist_id
    return base.create({
      modelName: `v2/checklist/${_checklistId}/checklist_record_answer/batch/store`,
      data: {
        ...params
      }
    })
  },
  getResultRiskStyle(risk, status, constantData) {
    let riskList = [
      {
        title: i18next.t('未答題'),
        icon: 'ws-filled-help',
        color: $color.gray,
        backgroundColor: $color.gray9l,
        score: null
      },
      {
        title: i18next.t('高風險'),
        icon: 'ws-filled-risk-high',
        color: $color.danger,
        backgroundColor: $color.danger9l,
        score: 23
      },
      {
        title: i18next.t('中風險'),
        icon: 'ws-filled-risk-medium',
        color: $color.yellow,
        backgroundColor: $color.yellow11l,
        score: 22
      },
      {
        title: i18next.t('低風險'),
        icon: 'ws-filled-risk-low',
        color: $color.blue,
        backgroundColor: $color.blue9l,
        score: 21
      },
      {
        title: i18next.t('無異常'),
        icon: 'ws-filled-check-circle',
        color: $color.green,
        backgroundColor: $color.green9l,
        score: 25
      },
      {
        title: i18next.t('不適用'),
        icon: 'scc-liff-close-circle',
        color: $color.gray,
        backgroundColor: $color.gray9l,
        score: 20
      },
      {
        title: i18next.t('不需點檢'),
        // riskIcon: 'md-check-circle',
        icon: 'ws-filled-check-circle',
        color: $color.gray,
        backgroundColor: $color.gray9l,
      },
    ]
    // API Constant Index 整合
    if (constantData && constantData.length > 0) {
      riskList = riskList.map(item => {
        constantData.forEach(_item => {
          if (item.score && (item.score == _item.value)) {
            const _res = {
              ...item,
              ..._item
            }
            return _res
          }
        })
        return item
      })
    }
    for (let key in riskList) {
      if (riskList[key].score == risk && risk != undefined) {
        return riskList[key]
      } else if (status == 1) {
        return riskList[6]
      }
    }
  },
  // async convertLocalImagesToHttp(jsonData) {
  //   // await new Promise(resolve => setTimeout(resolve, 5000));

  //   const uploadImageToServer = async (localPath) => {
  //     let lazyUri = localPath
  //     // 这里应调用实际的上传逻辑，返回上传后的URL
  //     let uri = Platform.OS === 'android'
  //       ? lazyUri
  //       : decodeURIComponent(lazyUri.replace('file://', '').replace('file://', ''));
  //     const endpoint = axios.defaults.baseURL;
  //     const token = await S_Keychain.getToken();
  //     const fileName = localPath.match(/[^/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/);
  //     const _uploadUrl = `factory/${S_Processor.getFactoryParams().factory}/checklist_record_answer/image/${encodeURI(fileName)}`
  //     try {
  //       // 模擬一個錯誤
  //       // throw new Error('This is a deliberate error.')
  //       const res = await RNBlobUtil.fetch(
  //         'PUT',
  //         `${endpoint}/${_uploadUrl}`,
  //         {
  //           'Authorization': token
  //         },
  //         RNBlobUtil.wrap(uri)
  //       );
  //       let status = res.info().status;
  //       if (status === 200) {
  //         let json = res.json();
  //         console.log(json, 'json');
  //         // 模拟返回值
  //         return json.signed_url
  //       } else if (status === 201) {
  //         // 230816 新上传方式
  //         let json = res.json();
  //         return json.signed_url
  //       } else {
  //         throw new Error(`Upload failed with status: ${status}`);
  //       }
  //     } catch (error) {
  //       console.log(error.message, 'error');
  //       alert(`${error.message}`)
  //     }
  //   };
  //   // 遍历 jsonData 对象中的所有记录
  //   for (const record of jsonData.checklist_record_answers) {
  //     // 检查每个 record 的 images 数组
  //     const updatedImages = [];
  //     for (const imagePath of record.images) {
  //       if (imagePath.startsWith('/private/var/mobile/Containers/Data/Application/')) {
  //         // 上传图片并获取新的 URL
  //         const newUrl = await uploadImageToServer(imagePath);
  //         updatedImages.push(newUrl);
  //       } else {
  //         // 如果已是网络地址，则直接使用
  //         updatedImages.push(imagePath);
  //       }
  //     }
  //     // 更新 record 的 images 数组
  //     record.images = updatedImages;
  //   }
  //   // 返回更新后的 JSON 数据
  //   return jsonData;
  // },
  transformArticleVersions(articleVersions) {
    return articleVersions.map(version => {
      const actVersionId = version.act_versions[0]?.id || null;
      const articleId = version.article?.id || null;
      return {
        article_version_id: version.id,
        article_id: articleId,
        act_version_id: actVersionId,
      }
    })
  },
  transformActVersionAlls(actVersionAlls) {
    return actVersionAlls.map(version => {
      const actVersionId = version.id || null;
      const actId = version.act?.id || null;
      return {
        act_id: actId,
        act_version_id: actVersionId,
      }
    })
  },
  formattedForFileStore(attaches) {
    return attaches.map(item => {
      const newItem = {
        file: item.file.id
      };
      if (item.file_version) {
        newItem.file_version = item.file_version.id;
      }
      return newItem;
    });
  },
  formattedForFileStore(attaches) {
    return attaches.map(item => {
      const newItem = {
        file: item.file.id
      };
      if (item.file_version) {
        newItem.file_version = item.file_version.id;
      }
      return newItem;
    });
  },
  transformRelatedGuidelines(related_guidelines) {
    return related_guidelines.map(item => {
      const result = {
        guideline_id: item.guideline?.id
      }
      if (item.guideline_article_version?.id) {
        // 綁特定版本條文
        result.guideline_version_id = item.guideline_article_version.guideline_version?.id
        result.guideline_article_id = item.guideline_article?.id
        result.guideline_article_version_id = item.guideline_article_version.id
      } else if (item.guideline_article?.id) {
        // 綁最新條文
        result.guideline_version_id = item.guideline_version?.id
        result.guideline_article_id = item.guideline_article.id
      } else if (item.guideline_version?.id) {
        // 綁特定版本整部
        result.guideline_version_id = item.guideline_version.id
      }
      // else：只綁 guideline_id（綁最新整部）
      return result
    })
  },
  async formattedQuestionsForAPI_V2(currentDraft, currentUserId) {
    let _questions = []
    for (const question of currentDraft) {
      const _questionShow = await S_CheckListQuestion.showV2({ modelId: question.id })
      const _formattedArticleVersions = this.transformArticleVersions(_questionShow.last_version.article_versions)
      const _formattedActVersionAlls = this.transformActVersionAlls(_questionShow.last_version.act_version_alls)
      const _formattedRelatedGuidelines = this.transformRelatedGuidelines(_questionShow.last_version.related_guidelines)
      if (question.question_setting != null &&
        question.question_setting.checkers &&
        question.question_setting.checkers.length > 0) {
        const hasCheckerWithIdOne = question.question_setting &&
          question.question_setting.checkers.some(checker => checker.id === currentUserId);

        if (question.answer_value && hasCheckerWithIdOne) {
          _questions.push({
            id: question.checklist_record_answer_draft_id ? question.checklist_record_answer_draft_id : undefined,
            answer_value:
              question.answer_value &&
                question.question_type_setting &&
                question.question_type_setting.value === 'single-choice' ? [question.answer_value.id] : question.answer_value ? question.answer_value : null,
            risk_level: question.answer_value
              ? this.getAnsDataScoreV2(question, question.answer_value)
              : null,
            remark: question.remark ? question.remark : null,
            images: question.images ? this.formattedForFileStore(question.images) : [],
            checklist_question: question.id ? question.id : null,
            checklist_question_version: question.last_version
              ? question.last_version.id
              : null,
            checklist_question_template: question.checklist_question_template
              ? question.checklist_question_template.id
              : null,

            checklist_question_template_version:
              question.checklist_question_template &&
                question.checklist_question_template.last_version
                ? question.checklist_question_template.last_version.id
                : question.checklist_question_template &&
                  question.checklist_question_template.checklist_template_versions
                  ? question.checklist_question_template.checklist_template_versions
                    .id
                  : null,

            question_images: question.question_images
              ? question.question_images
              : [],
            question_attaches: question.question_attaches
              ? question.question_attaches
              : [],
            question_template_images: question.question_template_images
              ? question.question_template_images
              : [],
            question_template_attaches: question.question_template_attaches
              ? question.question_template_attaches
              : [],
            title: question.title ? question.title : null,
            spec_limit_lower: question.last_version &&
              question.last_version.spec_limit_lower != undefined ?
              question.last_version.spec_limit_lower :
              question.spec_limit_lower != undefined ?
                question.spec_limit_lower
                : null,
            spec_limit_upper: question.last_version &&
              question.last_version.spec_limit_upper ?
              question.last_version.spec_limit_upper :
              question.spec_limit_upper ?
                question.spec_limit_upper
                : null,
            control_limit_lower:
              question.last_version &&
                question.last_version.control_limit_lower ?
                question.last_version.control_limit_lower :
                question.control_limit_lower ?
                  question.control_limit_lower
                  : null,
            control_limit_upper:
              question.last_version &&
                question.last_version.control_limit_upper
                ? question.last_version.control_limit_upper :
                question.control_limit_upper ?
                  question.control_limit_upper
                  : null,
            // 241216
            ocap_attaches: question.last_version && question.last_version.file_ocap_attaches ? this.formattedForFileStore(question.last_version.file_ocap_attaches) : [],
            ocap_remark: question.last_version && question.last_version.ocap_remark ? question.last_version.ocap_remark : undefined,
            // 241227
            question_remark: question.last_version && question.last_version.remark ? question.last_version.remark : null,
            question_attaches: question.last_version && question.last_version.file_attaches && question.last_version.file_attaches.length > 0 ? this.formattedForFileStore(question.last_version.file_attaches) : [],
            articles: question.last_version ? question.last_version.articles : [],
            effects: question.last_version &&
              question.last_version.effects &&
              question.last_version.effects.length > 0 ?
              question.last_version.effects.map(_ => _.id) :
              question &&
                question.effects &&
                question.effects.length > 0 ?
                question.effects.map(_ => _.id) :
                [],
            factory_effects: question.factory_effects && question.factory_effects.length > 0 ?
              question.factory_effects.map(item => {
                return {
                  factory_effect_id: item.id,
                  model: "checklist_record_answer",
                }
              })
              : undefined,
            acts: question.last_version ? question.last_version.acts : [],
            keypoint: question.keypoint ? question.keypoint : 0,
            question_type: question.question_type
              ? question.question_type
              : question.questionType
                ? question.questionType
                : question.quesType
                  ? question.quesType
                  : null,
            // 250107
            question_type_setting: question.question_type_setting && question.question_type_setting.id ?
              question.question_type_setting.id : null,
            // 240625-new-spec
            act_version_alls: _formattedActVersionAlls ? _formattedActVersionAlls : undefined,
            article_versions: _formattedArticleVersions ? _formattedArticleVersions : undefined,
            act_versions: question.last_version &&
              question.last_version.act_versions &&
              question.last_version.act_versions.length > 0
              ? question.last_version.act_versions.map(item => item.id)
              : undefined,
            sequence: question.sequence,
            factory: S_Processor.getFactoryParams().factory,
            related_guidelines: _formattedRelatedGuidelines ? _formattedRelatedGuidelines : undefined,
            lat: question?.latLng?.latitude,
            lng: question?.latLng?.longitude
          })
        }
      } else if (question.answer_value != null) {
        _questions.push({
          answer_value:
            question.question_type_setting &&
              question.question_type_setting.value === 'single-choice' &&
              question.answer_value && question.answer_value[0] ? [question.answer_value[0].id] :
              question.answer_value.id ? [question.answer_value.id] :
                question.answer_value ? question.answer_value : null,
          risk_level: this.getRiskLevelScore(question, question.answer_value),
          remark: question.remark ? question.remark : null,
          images: question.images ? this.formattedForFileStore(question.images) : [],
          checklist_question: question.id ? question.id : null,
          checklist_question_version: question.last_version
            ? question.last_version.id
            : null,
          checklist_question_template: question.checklist_question_template
            ? question.checklist_question_template.id
            : null,

          checklist_question_template_version:
            question.checklist_question_template &&
              question.checklist_question_template.last_version
              ? question.checklist_question_template.last_version.id
              : question.checklist_question_template &&
                question.checklist_question_template.checklist_template_versions
                ? question.checklist_question_template.checklist_template_versions
                  .id
                : null,

          question_images: question.question_images
            ? question.question_images
            : [],
          question_attaches: question.question_attaches
            ? question.question_attaches
            : [],
          question_template_images: question.question_template_images
            ? question.question_template_images
            : [],
          question_template_attaches: question.question_template_attaches
            ? question.question_template_attaches
            : [],
          title: question.title ? question.title : null,
          spec_limit_lower: question.last_version &&
            question.last_version.spec_limit_lower != undefined ?
            question.last_version.spec_limit_lower :
            question.spec_limit_lower != undefined ?
              question.spec_limit_lower
              : null,
          spec_limit_upper: question.last_version &&
            question.last_version.spec_limit_upper ?
            question.last_version.spec_limit_upper :
            question.spec_limit_upper ?
              question.spec_limit_upper
              : null,
          control_limit_lower:
            question.last_version &&
              question.last_version.control_limit_lower ?
              question.last_version.control_limit_lower :
              question.control_limit_lower ?
                question.control_limit_lower
                : null,
          control_limit_upper:
            question.last_version &&
              question.last_version.control_limit_upper
              ? question.last_version.control_limit_upper :
              question.control_limit_upper ?
                question.control_limit_upper
                : null,
          // 241227
          ocap_attaches: question.last_version && question.last_version.file_ocap_attaches ? this.formattedForFileStore(question.last_version.file_ocap_attaches) : [],
          ocap_remark: question.last_version ? question.last_version.ocap_remark : null,
          question_remark: question.last_version && question.last_version.remark ? question.last_version.remark : null,
          question_attaches: question.last_version && question.last_version.file_attaches && question.last_version.file_attaches.length > 0 ? this.formattedForFileStore(question.last_version.file_attaches) : [],
          articles: question.last_version ? question.last_version.articles : [],
          effects: question.last_version &&
            question.last_version.effects &&
            question.last_version.effects.length > 0 ?
            question.last_version.effects.map(_ => _.id) :
            question &&
              question.effects &&
              question.effects.length > 0 ?
              question.effects.map(_ => _.id) :
              [],
          factory_effects: question.factory_effects && question.factory_effects.length > 0 ?
            question.factory_effects.map(item => {
              return {
                factory_effect_id: item.id,
                model: "checklist_record_answer",
              }
            })
            : undefined,
          acts: question.last_version ? question.last_version.acts : [],
          keypoint: question.keypoint ? question.keypoint : 0,
          question_type: question.question_type
            ? question.question_type
            : question.questionType
              ? question.questionType
              : question.quesType
                ? question.quesType
                : null,
          // 250115
          question_type_setting: question.question_type_setting && question.question_type_setting.id ?
            question.question_type_setting.id : null,
          act_version_alls: _formattedActVersionAlls ? _formattedActVersionAlls : undefined,
          article_versions: _formattedArticleVersions ? _formattedArticleVersions : undefined,
          act_versions: question.last_version &&
            question.last_version.act_versions &&
            question.last_version.act_versions.length > 0
            ? question.last_version.act_versions.map(item => item.id)
            : undefined,
          sequence: question.sequence,
          factory: S_Processor.getFactoryParams().factory,
          related_guidelines: _formattedRelatedGuidelines ? _formattedRelatedGuidelines : undefined,
          lat: question?.latLng?.latitude,
          lng: question?.latLng?.longitude
        })
      }
    }
    return _questions
  },
}