import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import S_Checklist from '@/services/api/v1/checklist'
import moment from 'moment'
import store from '@/store'
import gColor from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import time from '@/__reactnative_stone/services/wasa/time'
import riskLevel from '@/models/risk-level'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import S_CheckListRecordAns from '@/services/api/v1/checklist_record_answer'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'

export default {
  checklistRecordTableHeader: [
    {
      id: 'result',
      textLabel: '結果',
      type: 'icon',
      tabletHide: false,
      width: '5%'
    },
    {
      id: 'subCategory',
      textLabel: '子領域',
      type: 'chips',
      tabletHide: false,
      width: '15%'
    },
    {
      id: 'name',
      textLabel: '名稱',
      type: 'text',
      tabletHide: false,
      overflowHide: true,
      width: '40%'
    },
    {
      id: 'compliance',
      textLabel: '合規率',
      type: 'text',
      tabletHide: true,
      width: '5%'
    },
    {
      id: 'checker',
      textLabel: '答題者',
      type: 'text',
      tabletHide: false,
      width: '5%'
    },
    {
      id: 'date',
      textLabel: '完成日',
      type: 'text',
      tabletHide: true,
      width: '10%'
    },
    {
      id: 'reviewer',
      textLabel: '覆核者',
      type: 'text',
      tabletHide: true,
      width: '5%'
    },
    {
      id: 'condition',
      textLabel: '狀態',
      type: 'text',
      tabletHide: true,
      width: '10%'
    },
    // {
    //   id: 'download',
    //   icon: 'icon-cloud-download',
    //   textLabel: '匯出報表',
    //   type: 'downloadPopup',
    //   tabletHide: true
    // }
  ],
  checklistUnrecordTableHeader: [
    {
      id: 'subCategory',
      textLabel: '子領域',
      type: 'chips',
      tabletHide: false,
      width: '10%'
    },
    {
      id: 'name',
      textLabel: '名稱',
      type: 'text',
      tabletHide: false,
      overflowHide: true,
      width: '70%'
    },
    {
      id: 'checker',
      textLabel: '答題者',
      type: 'text',
      tabletHide: false,
      width: '20%'
    }
  ],
  async index({ params }) {
    const unit = params?.factory
    return base.index({
      modelName: `checklist/${params.id}/checklist_record`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams(unit),
        ...S_Processor.getLocaleParams()
      }
    })
  },
  async factoryIndex({ params }) {
    const unit = params?.factory
    return await base.index({
      preUrl: S_Processor.getFactoryPreUrl(unit),
      modelName: 'checklist_record',
      params: {
        ...params,
        ...S_Processor.getLocaleParams(unit)
      }
    })
  },
  async analysisIndex({ params }) {
    return await base.index({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: `checklist_record/analysis/index`,
      params: {
        ...params,
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams()
      }
    })
  },
  async show({ modelId }) {
    return base.show({
      modelName: 'checklist_record',
      modelId: modelId,
      params: {
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams()
      }
    })
  },
  async showV2({ modelId }) {
    return base.show({
      modelName: 'v2/checklist_record',
      modelId: modelId,
      params: {
        ...S_Processor.getFactoryParams(),
        ...S_Processor.getLocaleParams()
      }
    })
  },
  getFormatted(checkListRecord) {
    const riskStandard = [
      {
        value: 'major',
        score: 23
      },
      {
        value: 'minor',
        score: 22
      },
      {
        value: 'ofi',
        score: 21
      },
      {
        value: 'pass',
        score: 25
      }
    ]
    let _riskScore = {}
    riskStandard.forEach(standard => {
      _riskScore[standard.value] =
        checkListRecord.checklist_record_answers.filter(ans => {
          if (ans.question_type == 2) {
            return ans.score == standard.score
          } else {
            return this.getAnsDataScore(ans, ans.score) == standard.score
          }
        }).length
    })
    let allScore = checkListRecord.checklist_record_answers.map(
      answer => answer.risk_level
    )

    return {
      id: checkListRecord.id,
      title: checkListRecord.name,
      systemSubclasses: checkListRecord.system_subclasses,
      result: allScore.every(score => score === 25)
        ? 'ws-filled-check-circle'
        : 'ws-filled-risk-high',
      risk: allScore.some(score => score === 23)
        ? gColor.danger
        : allScore.some(score => score === 22)
          ? gColor.yellow
          : allScore.some(score => score === 21)
            ? gColor.parimary
            : gColor.green,
      riskText: allScore.some(score => score === 23)
        ? i18next.t('高風險')
        : allScore.some(score => score === 22)
          ? i18next.t('中風險')
          : allScore.some(score => score === 21)
            ? i18next.t('低風險')
            : i18next.t('合格'),
      iconBgc: this.getIconBgc(allScore),
      record_at: checkListRecord.record_at,
      review_at: checkListRecord.review_at,
      // reviewer: {
      //   id: checkListRecord && checkListRecord.reviewer ? checkListRecord.reviewer.id : null,
      //   name: checkListRecord && checkListRecord.reviewer ? checkListRecord.reviewer.name : null,
      //   source: checkListRecord && checkListRecord.reviewer ? checkListRecord.reviewer.avatar : null
      // },
      reviewers: checkListRecord.reviewers,
      pass_rate: checkListRecord.pass_rate,
      record_remark: checkListRecord.record_remark,
      // checker: {
      //   id: checkListRecord.checker.id,
      //   name: checkListRecord.checker.name,
      //   source: checkListRecord.checker.avatar
      // },
      checkers: checkListRecord.checkers,
      review_remark: checkListRecord.review_remark,
      riskScore: _riskScore,
      tasks: checkListRecord.tasks,
      alert: checkListRecord.alert
    }
  },

  getFormattedList(checkListRecords) {
    const formats = checkListRecords.map(checkListRecord => {
      return this.getFormatted(checkListRecord)
    })
    return formats
  },
  getIconBgc(allScore) {
    return allScore.some(score => score === 23)
      ? gColor.danger11l
      : allScore.some(score => score === 22)
        ? gColor.yellow11l
        : allScore.some(score => score === 21)
          ? gColor.parimary11l
          : gColor.green11l
  },
  getAnsDataScore(ans, score) {
    // 判斷量性題目的風險值
    const controlLimitData = ans.controlLimitData
      ? ans.controlLimitData
      : {
        upper: ans.last_version && ans.last_version.control_limit_upper ?
          ans.last_version.control_limit_upper :
          ans.control_limit_upper ?
            ans.control_limit_upper :
            null,
        lower: ans.last_version && ans.last_version.control_limit_lower ?
          ans.last_version.control_limit_lower :
          ans.control_limit_lower ?
            ans.control_limit_lower
            : null
      }

    const specLimitData = ans.specLimitData
      ? ans.specLimitData
      : {
        upper: ans.last_version && ans.last_version.spec_limit_upper ?
          ans.last_version.spec_limit_upper :
          ans.spec_limit_upper ?
            ans.spec_limit_upper
            : null,
        lower: ans.last_version && ans.last_version.spec_limit_lower ?
          ans.last_version.spec_limit_lower :
          ans.spec_limit_lower ?
            ans.spec_limit_lower
            : null
      }

    if (!controlLimitData || !specLimitData) {
      return 20
    }
    if (!score) {
      return null
    }
    const upperMiddle =
      (parseFloat(controlLimitData.upper) + parseFloat(specLimitData.upper)) / 2
    const lowerMiddle =
      (parseFloat(controlLimitData.lower) + parseFloat(specLimitData.lower)) / 2

    if (
      parseFloat(controlLimitData.lower) <= parseFloat(score) &&
      parseFloat(score) <= parseFloat(controlLimitData.upper)
    ) {
      return 25
    } else {
      if (parseFloat(score) > upperMiddle || parseFloat(score) < lowerMiddle) {
        return 23
      }
      if (
        (lowerMiddle <= parseFloat(score) &&
          parseFloat(score) < controlLimitData.lower) ||
        (controlLimitData.upper < parseFloat(score) &&
          parseFloat(score) <= upperMiddle)
      ) {
        return 22
      } else {
        return null
      }
    }
  },
  getPassRate(answers) {
    const _risks = answers.map(answer => {
      return this.getRiskLevel(answer)
    })
    const passNum = _risks.filter(_risk => _risk == 25).length
    const quesNum = answers.length
    const passRate = (passNum / quesNum) * 100
    return passRate.toFixed(2)
  },
  getRiskLevel(answer) {
    if (
      answer.questionType == 2 ||
      answer.quesType == 2 ||
      answer.question_type == 2
    ) {
      return answer.score
    }
    if (
      answer.question_type == 1 ||
      answer.quesType == 1 ||
      answer.questionType == 1
    ) {
      const _score = this.getAnsDataScore(answer, answer.score)
      return _score
    }
  },
  getRiskLevelFromQuestions(answers) {
    const _risks = []
    answers.forEach(ans => {
      if (
        ans.question_type == 2 ||
        ans.quesType == 2 ||
        ans.questionType == 2
      ) {
        _risks.push(ans.score)
      }
      if (
        ans.question_type == 1 ||
        ans.quesType == 1 ||
        ans.questionType == 1
      ) {
        const _score = this.getAnsDataScore(ans, ans.score)
        _risks.push(_score)
      }
    })
    if (_risks.includes('23') || _risks.includes(23)) {
      return 23
    } else if (_risks.includes('22') || _risks.includes(22)) {
      return 22
    } else if (_risks.includes('21') || _risks.includes(21)) {
      return 21
    } else {
      return 25
    }
  },
  async create({ parentId, data }) {
    return base.create({
      parentId: parentId,
      parentName: 'checklist',
      modelName: 'checklist_record',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async update({ modelId, data }) {
    return base.update({
      modelName: 'checklist_record',
      modelId: modelId,
      data: {
        ...data,
        ...S_Processor.getFactoryData()
      }
    })
  },
  async getChecklistRecordSortedBySystemClasses(frequency, startTime, endTime) {
    // console.log(arguments, '=getChecklistRecordSortedBySystemClasses=')
    if (!frequency) {
      return
    }
    if (!startTime) {
      return
    }
    if (!endTime) {
      return
    }
    const _params = {
      frequency: frequency,
      get_all: 1,
      time_field: 'record_at',
      start_time: startTime,
      end_time: endTime
    }
    // IMPORTANT FOR SHOW UI
    let _selectedDate = {
      start: startTime,
      end: endTime
    }

    const checkListRecord = await this.factoryIndex({ params: _params }).then(
      res => {
        if (res && res.length > 0) {
          _selectedDate.start = moment(res.data[0].record_at).format(
            'YYYY-MM-DD'
          )
          _selectedDate.end = moment(res.data.reverse()[0]).format('YYYY-MM-DD')
        }
        return res
      }
    )

    let start = new Date().getTime()
    // console.log('<------API start------>')
    const checklistAll = await S_Checklist.indexAll({
      params: {
        frequency: frequency
      }
    })
    let end = new Date().getTime()
    // console.log('<-------API End , Cost is', `${end - start}ms------->`)

    const _checklistRecordList = this.$_setChecklistDataByDay(
      _selectedDate,
      checkListRecord.data,
      checklistAll.data,
      frequency,
      this.$_factorySeasonAllDates()
    )
    return _checklistRecordList
  },
  getPassRateFromSystemClasses(answers) {
    let passRate = 0
    answers.forEach(ans => {
      passRate += ans.pass_rate
    })
    if (passRate == 0) {
      return 0
    } else {
      return Math.round(passRate / answers.length)
    }
  },
  $_setChecklistDataByDay(
    selectDate,
    checklist_records,
    checklist,
    frequency,
    seasons
  ) {
    const _recordData = JSON.parse(JSON.stringify(checklist_records))
    const _listData = JSON.parse(JSON.stringify(checklist))
    // 產生日期陣列
    const _dateList = this.setDateByFrequency(selectDate, frequency, seasons)
    // 取所有領域
    const _allSystemClass = store.getState().data.systemClasses
    let _dataList = this.getDayRecordList(
      _dateList,
      _allSystemClass,
      _recordData,
      _listData,
      this.checklistRecordTableHeader,
      this.checklistUnrecordTableHeader,
      frequency
    )
    return _dataList
  },
  $_factorySeasonAllDates() {
    const state = store.getState()
    const currentFactory = state.data.currentFactory
    const factoryStartMonth = currentFactory.season_start_month
      ? currentFactory.season_start_month
      : parseInt(moment().startOf('month').format('M'))
    const _factorySeasonDates = []
    for (let i = 0; i < 4; i++) {
      const tarMonNumber =
        factoryStartMonth + i * 3 > 12
          ? factoryStartMonth + i * 3 - 12
          : factoryStartMonth + i * 3
      let season = {
        seasonNumber: i + 1,
        seasonMonths: []
      }
      for (let i = 0; i < 3; i++) {
        let seasonMonth =
          tarMonNumber + i > 12 ? tarMonNumber + i - 12 : tarMonNumber + i
        season.seasonMonths.push(seasonMonth)
      }
      _factorySeasonDates.push(season)
    }
    return _factorySeasonDates
  },
  //記錄列表 - 日的日期
  setDateByFrequency(selectDate, frequency, seasons) {
    const dateList = []
    const startDate = selectDate.start
    const endDate = selectDate.end
    if (frequency === 'day' || frequency === 'everyTime') {
      dateList.push(moment(endDate).format('YYYY-MM-DD'))
      if (startDate) {
        var i = 1
        let nextDate = endDate
        while (moment(nextDate).isAfter(startDate)) {
          nextDate = moment(nextDate).subtract(i, 'day').format('YYYY-MM-DD')
          dateList.push(nextDate)
        }
      }
      dateList.reverse()
    } else if (frequency === 'week' || frequency === 'month') {
      const start = moment(startDate).startOf(frequency)
      const end = moment(endDate).endOf(frequency)
      const diff = end.diff(start, `${frequency}s`)
      for (let i = 0; i < diff; i++) {
        const date = moment(end).subtract(i, `${frequency}s`)
        dateList.push(moment(date).format('YYYY-MM-DD'))
      }
    } else if (frequency === 'season') {
      //get month,seasons
      const startDateMonth = time.getDateMonth(startDate)
      const endDateMonth = time.getDateMonth(endDate)
      const startDateSeasons = seasons.find(season =>
        season.seasonMonths.includes(parseInt(startDateMonth))
      ).seasonMonths
      const endDateSeasons = seasons.find(item =>
        item.seasonMonths.includes(parseInt(endDateMonth))
      ).seasonMonths
      //get season start date
      const start = time.getSeasonStartDate(
        startDate,
        startDateMonth,
        startDateSeasons
      )
      const end = time.getSeasonStartDate(endDate, endDateMonth, endDateSeasons)
      const diffSeasons = moment(end).diff(start, 'months') / 3
      for (let i = 0; i <= diffSeasons; i++) {
        const date = moment(end).subtract(i * 3, 'months')
        dateList.push(moment(date).format('YYYY-MM-DD'))
      }
    } else if (frequency === 'year') {
      const start = moment(startDate).startOf('year')
      const end = moment(endDate).endOf('year')
      const diff = end.diff(start, 'years')
      if (diff === 0) {
        dateList.push(moment(end).format('YYYY-MM-DD'))
      } else {
        for (let i = 0; i <= diff; i++) {
          const date = moment(end).subtract(i, 'years')
          dateList.push(moment(date).format('YYYY-MM-DD'))
        }
      }
    }
    return dateList
  },
  //記錄列表 - 日
  getDayRecordList(
    dateList,
    systemList,
    recordList,
    checklistList,
    recordHeader,
    checklistHeader,
    type
  ) {
    let allClass = JSON.parse(JSON.stringify(systemList))
    let listWithSystemClass = []

    if (dateList && dateList.length > 0 && allClass) {
      dateList.reverse().forEach(date => {
        allClass.forEach((systemClass, index) => {
          let _item = {
            index: index,
            date: date,
            systemClassIcon: systemClass.icon,
            systemClass: systemClass.name,
            systemClassId: systemClass.id,
            recordDataTable: {
              columnHeader: recordHeader
            },
            unRecordDataTable: {
              columnHeader: checklistHeader
            }
          }
          const _recordList = this.getRecordListByDate(
            type,
            date,
            systemClass.id,
            recordList
          )
          _item.recordDataTable.rowData = this.getRecordListData(_recordList)

          let _unRecordList = []
          _item.unRecordDataTable.rowData = []
          if (type !== 'everyTime') {
            _unRecordList = this.getUnrecordChecklists(
              checklistList,
              systemClass.id,
              _recordList
            )
            _item.unRecordDataTable.rowData =
              this.getUnrecordChecklistData(_unRecordList)
          }
          if (_recordList.length || _unRecordList.length) {
            listWithSystemClass.push(_item)
          }
        })
      })
    }
    return listWithSystemClass
  },
  getRecordListByDate(type, startDate, systemClassId, records) {
    // console.log(JSON.stringify(arguments),'=getRecordListByDate=');
    if (!records) {
      return []
    }
    if (type === 'day' || type === 'everyTime') {
      const recordList = records.filter(record => {
        const systemClassIds = record.system_classes.map(item => item.id)
        return (
          systemClassIds.includes(systemClassId) &&
          moment(record.record_at).format('YYYY-MM-DD') === startDate
        )
      })
      return recordList
    } else if (type === 'week' || type === 'month' || type === 'year') {
      const recordList = records.filter(record => {
        const systemClassIds = record.system_classes.map(item => item.id)
        return (
          systemClassIds.includes(systemClassId) &&
          moment(record.record_at).isSame(startDate, type)
        )
      })
      return recordList
    } else if (type === 'season') {
      const endDate = moment(startDate).add(2, 'months').format('YYYY-MM-DD')
      const recordList = records.filter(record => {
        const systemClassIds = record.system_classes.map(item => item.id)
        return (
          systemClassIds.includes(systemClassId) &&
          moment(record.record_at).isBetween(startDate, endDate)
        )
      })
      return recordList
    }
  },
  getUnrecordChecklists(checklists, systemClassId, records) {
    // console.log(JSON.stringify(arguments),'=getUnrecordChecklists=');
    if (!records) {
      return
    }
    const recordChecklistIds = records
      ? records.map(record => record.checklist.id)
      : []
    const unrecordList = checklists.filter(checklist => {
      return (
        checklist.system_class_ids.includes(systemClassId) &&
        !recordChecklistIds.includes(checklist.id)
      )
    })
    return unrecordList
  },
  getRecordListData(records) {
    if (!records) {
      return
    }
    const list = records.map(record => {
      return {
        id: record.id,
        result: riskLevel.riskLevel.find(
          risk => risk.score === record.risk_level
        ).icon,
        risk: riskLevel.riskLevel.find(risk => risk.score === record.risk_level)
          .score,
        classification: record.system_classes.map(item => item.name).join('、'),
        subCategory: record.system_subclasses.map(item => {
          return {
            name: item.name,
            leadingIcon: item.icon
          }
        }),
        name: record.name,
        compliance: record.pass_rate + '%',
        checker: record.checker && record.checker.name ? record.checker.name : null,
        reviewer: record.reviewer && record.reviewer.name ? record.reviewer.name : null,
        date: moment(record.record_at).format('YYYY-MM-DD'),
        condition: record.review_at ? i18next.t('已覆核') : i18next.t('目前尚無資料'),
        download: [
          {
            text: '匯出 PDF',
            value: 'pdf',
            id: record.id
          },
          {
            text: '匯出 xlsx',
            value: 'xlsx',
            id: record.id
          },
          {
            text: '匯出 cvs',
            value: 'cvs',
            id: record.id
          }
        ]
      }
    })
    return list
  },
  getUnrecordChecklistData(checklists) {
    // console.log(JSON.stringify(checklists),'=getUnrecordChecklistData=');
    if (!checklists) {
      return
    }
    const list = checklists.map(checklist => {
      return {
        id: checklist.id,
        subCategory: checklist.system_subclasses.map(item => {
          return {
            name: item.name,
            leadingIcon: item.icon
          }
        }),
        name: checklist.name,
        checker: checklist && checklist[0] ? checklist.checkers[0].name : null,
        checkers: checklist && checklist.checkers ? checklist.checkers : null,
      }
    })
    return list
  },
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
  async formattedQuestionsForAPI(currentDraft, currentUserId) {
    let _questions = []
    for (const question of currentDraft) {
      const _questionShow = await S_CheckListQuestion.show({ modelId: question.id })
      const _formattedArticleVersions = this.transformArticleVersions(_questionShow.last_version.article_versions)
      const _formattedActVersionAlls = this.transformActVersionAlls(_questionShow.last_version.act_version_alls)
      if (question.question_setting != null &&
        question.question_setting.checkers &&
        question.question_setting.checkers.length > 0) {
        const hasCheckerWithIdOne = question.question_setting &&
          question.question_setting.checkers.some(checker => checker.id === currentUserId);

        if (question.score && hasCheckerWithIdOne) {
          _questions.push({
            id: question.checklist_record_answer_draft_id ? question.checklist_record_answer_draft_id : undefined,
            score: question.score ? question.score : null,
            risk_level: question.score
              ? this.getAnsDataScore(question, question.score)
              : null,
            remark: question.remark ? question.remark : null,
            // images: question.images ? question.images : [],
            // 檔案庫spec
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
            question_remark: question.question_remark
              ? question.question_remark
              : null,
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
            ocap_attaches: question.ocap_attaches ? question.ocap_attaches : [],
            ocap_remark: question.last_version
              ? question.last_version.ocap_remark
              : null,
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
            // 240625-new-spec
            act_version_alls: _formattedActVersionAlls ? _formattedActVersionAlls : undefined,
            act_versions: question.last_version &&
              question.last_version.act_versions &&
              question.last_version.act_versions.length > 0
              ? question.last_version.act_versions.map(item => item.id)
              : undefined,
            article_versions: _formattedArticleVersions ? _formattedArticleVersions : undefined,
            factory: S_Processor.getFactoryParams().factory
          })
        }
      } else if (question.score != null) {
        _questions.push({
          score: question.score ? question.score : null,
          risk_level: question.score
            ? this.getAnsDataScore(question, question.score)
            : null,
          remark: question.remark ? question.remark : null,
          images: question.images ? question.images : [],
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
          question_remark: question.question_remark
            ? question.question_remark
            : null,
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
          ocap_attaches: question.ocap_attaches ? question.ocap_attaches : [],
          ocap_remark: question.last_version
            ? question.last_version.ocap_remark
            : null,
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
          act_version_alls: question.last_version &&
            question.last_version.act_version_alls &&
            question.last_version.act_version_alls.length > 0 ?
            question.last_version.act_version_alls.map(item => item.id) :
            question &&
              question.act_version_alls &&
              question.act_version_alls.length > 0 ?
              question.act_version_alls.map(item => item.id) :
              [],
          act_versions: question.last_version &&
            question.last_version.act_versions &&
            question.last_version.act_versions.length > 0
            ? question.last_version.act_versions.map(item => item.id)
            : undefined,
          article_versions: question.last_version &&
            question.last_version.article_versions ?
            question.last_version.article_versions.map(item => {
              return {
                article_version_id: item.id,
                act_version_id: item.act_version.id,
              }
            })
            : question.article_versions ?
              question.article_versions.map(item => {
                return {
                  article_version_id: item.id,
                  act_version_id: item.act_version.id,
                }
              }) :
              undefined,
          factory: S_Processor.getFactoryParams().factory
        })
      }
    }
    return _questions
  },
  formattedQuestionsForDraftAPI(currentDraft) {
    const _question = currentDraft.map(question => {
      const _answers = {
        score: question.score,
        remark: question.remark,
        images: question.images
      }
      const _question = {
        ...question
      }
      return {
        question: _question,
        answer: _answers
      }
    })
    return {
      content: _question
    }
  },
  async createDraft({ params }) {
    const res = await base.create({
      preUrl: S_Processor.getFactoryPreUrl(),
      modelName: 'checklist_record_draft',
      data: {
        ...S_Processor.getFactoryParams(),
        ...params
      }
    })
    return res
  },
  async showDraft({ draftId, params }) {
    const _params = {
      ...S_Processor.getFactoryParams(),
      ...params
    }
    const res = await base.show({
      modelName: 'checklist_record_draft',
      modelId: draftId,
      params: _params
    })
    return res
  },
  async updateDraft({ modelId, params }) {
    const res = await base.update({
      modelName: 'checklist_record_draft',
      modelId: modelId,
      data: {
        ...S_Processor.getFactoryParams(),
        ...params
      }
    })
    return res
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
  setSubmitValue(
    checklist,
    currentUserId,
    currentFactoryId,
    currentChecklistDraft,
    versionId,
    questions,
    _formattedQuestions,
    draftId,
    checklistAssignmentId,
    remark,
    status,
    images,
    reviewers,
    linkId,
  ) {
    const _submitValue = {
      checklist_id: checklist ? checklist.id : null,
      factory: currentFactoryId,
      checklist_assignment: checklistAssignmentId ? checklistAssignmentId : undefined,
      remark: remark ? remark : null,
      status: status ? status : null,
      // 舊spec
      // images: images ? images : [],
      // 檔案庫
      images: images ? this.formattedForFileStore(images) : [],
      reviewers: reviewers ? reviewers.map(_ => _.id) : currentUserId,
      checklist_record_draft: draftId ? draftId : undefined,
      checklist_record_answers: _formattedQuestions,
      link: linkId
    }
    return _submitValue
  },
  setSubmitValueV2(
    checklist,
    currentUserId,
    currentFactoryId,
    currentChecklistDraft,
    versionId,
    questions,
    _formattedQuestions,
    draftId,
    remark,
    status,
    images,
    reviewers,
  ) {
    const _submitValue = {
      checklist_id: checklist?.id ? checklist.id : null,
      factory: currentFactoryId,
      remark: remark ? remark : null,
      status: status ? status : null,
      images: images && images.length > 0 ? this.formattedForFileStore(images) : [],
      reviewers: reviewers ? reviewers.map(_ => _.id) : currentUserId,
      checklist_record_draft: draftId ? draftId : undefined,
      checklist_record_answers: _formattedQuestions,
    }
    return _submitValue
  },
  setSubmitForDraft(
    checklist,
    currentUserId,
    currentFactoryId,
    currentChecklistDraft,
    versionId,
    questions,
    _formattedQuestions,
    draftId,

    checklistAssignmentId,
    remark,
    status,
    reviewers,
  ) {
    const _submitValue = {
      checklist: checklist ? checklist.id : null,
      checklist_assignment: checklistAssignmentId ? checklistAssignmentId : undefined,
      content: "content content",
      checker: currentUserId,
      factory: currentFactoryId,
      reviewers: reviewers ? reviewers.map(_ => _.id) : currentUserId,
      remark: remark ? remark : null,
      status: status ? status : null,
      // checklist_record_draft: draftId ? draftId : null,
      // name: checklist.name,
      // system_classes: S_SystemClass.$_formatDataWithId(
      //   checklist.system_classes
      // ),
      // system_subclasses: S_SystemClass.$_formatDataWithId(
      //   checklist.system_subclasses
      // ),
      // record_at: moment().format('YYYY-MM-DD'),
      // checker: currentUserId,
      // reviewer: checklist.reviewer && checklist.reviewer.id ? checklist.reviewer.id : null,
      risk_level: S_CheckListRecord.getRiskLevelFromQuestions(
        currentChecklistDraft ? currentChecklistDraft : questions
      ),
      // pass_rate: S_CheckListRecordAns.getPassRate(
      //   currentChecklistDraft ? currentChecklistDraft : questions
      // ),
      // checklist_version: versionId,
      // questions: questions,
      checklist_record_answer_drafts: _formattedQuestions,
    }
    return _submitValue
  },
  getSplitDateString(dateString) {
    const dateParts = dateString.split('-');
    const startDate = new Date(`${dateParts[0]}-${dateParts[1]}-${dateParts[2]}`);
    const endDate = new Date(`${dateParts[3]}-${dateParts[4]}-${dateParts[5]}`);
    const _startDate = moment(startDate).format('YYYY-MM-DD')
    const _endDate = moment(endDate).format('YYYY-MM-DD')
    console.log(_startDate, '_startDate-');
    return { _startDate, _endDate };
  },
  getStartAndEndDates(monthStr) {
    const year = parseInt(monthStr.substring(0, 4));
    const month = parseInt(monthStr.substring(5, 7));
    const startDate = `${monthStr}-01`;
    let daysInMonth;
    switch (month) {
      case 1: case 3: case 5: case 7: case 8: case 10: case 12:
        daysInMonth = 31;
        break;
      case 4: case 6: case 9: case 11:
        daysInMonth = 30;
        break;
      case 2:
        if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
          daysInMonth = 29;
        } else {
          daysInMonth = 28;
        }
        break;
      default:
        throw new Error('Invalid month');
    }
    const endDate = `${year}-${month.toString().padStart(2, '0')}-${daysInMonth.toString().padStart(2, '0')}`;
    return { startDate, endDate };
  }
}
