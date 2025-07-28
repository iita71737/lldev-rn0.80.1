import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

export default {
  async index({ params }) {
    return base.index({
      modelName: 'exit_checklist',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async indexV2({ params }) {
    return base.index({
      modelName: 'v2/exit_checklist',
      params: {
        ...params,
        ...S_Processor.getFactoryParams()
      }
    })
  },
  async show(modelId) {
    return base.show({
      modelName: 'exit_checklist',
      modelId: modelId,
      params: S_Processor.getFactoryParams()
    })
  },
  async create(data) {
    return base.create({
      modelName: 'exit_checklist',
      data: {
        ...data,
        ...S_Processor.getFactoryData()
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
  getExitChecklistCreateData(contractorEnter, enterDate, $event, _enterStatus, _remark) {
    const data = {
      owner: contractorEnter.owner.id,
      contractor: contractorEnter.contractor.id,
      contractor_enter_record: contractorEnter.contractor_enter_record && contractorEnter.contractor_enter_record.id ? contractorEnter.contractor_enter_record.id : null,
      operate_location: contractorEnter.operate_location,
      task_content: contractorEnter.task_content,
      enter_date: enterDate,
      enter_start_time: contractorEnter.enter_start_time,
      enter_end_time: contractorEnter.enter_end_time,
      checked_at: moment().utc(),

      enter_score: $event[0].enter_score ? $event[0].enter_score : undefined,
      // enter_attaches: $event[0].enter_attaches ? $event[0].enter_attaches : undefined,
      enter_attaches: $event[0].enter_attaches ? this.formattedForFileStore($event[0].enter_attaches) : [],
      enter_remark: $event[0].enter_score && $event[0].enter_remark ? $event[0].enter_remark : undefined,

      exit_check_item_score: $event[0].enter_score == 36 && $event[1] && $event[1].exit_check_item_score ? $event[1].exit_check_item_score : undefined,
      // exit_check_item_attaches: $event[0].enter_score == 36 && $event[1] && $event[1].exit_check_item_attaches ? $event[1].exit_check_item_attaches : undefined,
      exit_check_item_attaches: $event[0].enter_score == 36 && $event[1] && $event[1].exit_check_item_attaches ? this.formattedForFileStore($event[1].exit_check_item_attaches) : [],
      exit_check_item_remark: $event[0].enter_score == 36 && $event[1] && $event[1].exit_check_item_remark ? $event[1].exit_check_item_remark : undefined,

      exit_check_item: contractorEnter.exit_check_item,

      final_check_score: $event[0].enter_score == 36 && $event[2] && $event[2].final_check_score ? $event[2].final_check_score : undefined,
      // final_check_attaches: $event[0].enter_score == 36 && $event[2] && $event[2].final_check_attaches ? $event[2].final_check_attaches : undefined,
      final_check_attaches: $event[0].enter_score == 36 && $event[2] && $event[2].final_check_attaches ? this.formattedForFileStore($event[2].final_check_attaches) : [],
      final_check_remark: $event[0].enter_score == 36 && $event[2] && $event[2].final_check_remark ? $event[2].final_check_remark : undefined,

      enter_status: _enterStatus ? _enterStatus : undefined,
      remark: _remark ? _remark : undefined,
      exit_checklist_assignment: contractorEnter && contractorEnter.id ? contractorEnter.id : undefined
    }
    return data
  },
  getExitChecklistTag(list) {
    // enter_score 36-yes 37-no
    // exit_check_item_score 46-yes 47-no
    // final_check_score 56-yes 57-no
    if (
      list && list.enter_score === 36 &&
      list.exit_check_item_score === 46 &&
      list.final_check_score === 56
    ) {
      return '收工且復歸'
    }
    else if (list.enter_score == 36) {
      return '未復歸'
    }
    else if (list.exit_check_item_score === 46) {
      return '收工未檢查'
    } else {
      return '無進場'
    }
  },
  getExitChecklistTagColor(list) {
    // enter_score 36-yes 37-no
    // exit_check_item_score 46-yes 47-no
    // final_check_score 56-yes 57-no
    let _tagColor = ''
    if (
      list.enter_score === 36 &&
      list.exit_check_item_score === 46 &&
      list.final_check_score === 56
    ) {
      _tagColor = $color.green
    } else if (list.enter_score === 36) {
      _tagColor = $color.primary
    } else if (list.exit_check_item_score === 46) {
      _tagColor = $color.primary
    } else if (list.final_check_score === 57) {
      _tagColor = $color.danger
    } else {
      _tagColor = $color.gray5d
    }
    return _tagColor
  },
  getExitChecklistTagBackground(list) {
    // enter_score 36-yes 37-no
    // exit_check_item_score 46-yes 47-no
    // final_check_score 56-yes 57-no
    let _tagBgColor = ''
    if (
      list.enter_score === 36 &&
      list.exit_check_item_score === 46 &&
      list.final_check_score === 56
    ) {
      _tagBgColor = $color.green11l
    } else if (list.enter_score === 36) {
      _tagBgColor = $color.primary11l
    } else if (list.exit_check_item_score === 46) {
      _tagBgColor = $color.primary11l
    } else if (list.final_check_score === 57) {
      _tagBgColor = $color.danger11l
    } else {
      _tagBgColor = $color.white1d
    }
    return _tagBgColor
  },
  async formattedExitChecklistInit(value) {
    const startDate = moment(value.enter_start_date);
    const endDate = moment(value.enter_end_date);
    // 循环逐天递增日期，直到达到 endDate
    let _enterDate = startDate
    while (startDate.isSameOrBefore(endDate, 'day')) {
      const _value = {
        enter_date: startDate ? startDate : null, // enterDate
        factory: S_Processor.getFactoryParams().factory,
        owner: value.owner && value.owner.id ? value.owner.id : null,
        contractor: value.contractor && value.contractor.id ? value.contractor.id : null,
        contractor_enter_record: value.id ? value.id : null,
        operate_location: value.operate_location ? value.operate_location : null,
        task_content: value.task_content ? value.task_content : null,
        enter_start_time: value.enter_start_time ? value.enter_start_time : null,
        enter_end_time: value.enter_end_time ? value.enter_end_time : null,
        checked_at: null,
        enter_score: 37,
        enter_attaches: [],
        enter_remark: null,
        final_check_score: null,
        final_check_attaches: [],
        final_check_remark: null,
        exit_check_item_score: null,
        exit_check_item_attaches: [],
        exit_check_item_remark: null,
        exit_check_item: null
      }
      const res = await this.create(_value)
      _enterDate.add(1, 'day')
    }
  },
  checkExitChecklistsStatus(lists) {
    if (lists && lists.length > 0) {
      const hasFinalCheckAndReturn = lists.find(list => {
        if (list.final_check_score && list.exit_check_item_score && list.enter_score) {
          return list.final_check_score === 56 && list.exit_check_item_score === 46 && list.enter_score === 36
        }
      })
      const hasExitNonCheck = lists.find(list => {
        if (list.final_check_score && list.exit_check_item_score && list.enter_score) {
          list.final_check_score === 57 && list.exit_check_item_score === 47 && list.enter_score === 36
        }
      })
      // 收工且復歸
      if (hasFinalCheckAndReturn) {
        return hasFinalCheckAndReturn
      }
      // 收工未檢查
      if (hasExitNonCheck) {
        return hasExitNonCheck
      }
    }
  },
  getTimeFormat(time) {
    if (!time) return '';
    return moment(time).format('HH:mm');
  },
  getDateFormat(date) {
    if (!date) return '';
    return moment(date).format('YYYY-MM-DD');
  },
  checkExitChecklist(enterRecord) {
    //判斷進場狀態是否為收工未檢查
    const now = moment();
    const now_subtract_one_day = moment().subtract(1, 'days');
    if (parseInt(enterRecord.enter_period_type) === 1) {
      //單日進場
      //判斷現在時間是否為進場結束時間一小時後
      const enterNotifyTime = moment(
        `${this.getDateFormat(enterRecord.enter_end_date)} ${this.getTimeFormat(
          enterRecord.enter_end_time,
        )}`,
      ).subtract(1, 'hours');
      if (moment(enterNotifyTime).isSameOrBefore(now)) {
        //判斷有沒有exit_checklists
        return enterRecord.exit_checklists.length === 0 ? false : true;
      } else {
        return true;
      }
    } else if (parseInt(enterRecord.enter_period_type) === 2) {
      //連續進場
      const endDate = this.getDateFormat(enterRecord.enter_end_date);
      const startDate = this.getDateFormat(enterRecord.enter_start_date);
      const endTime = this.getTimeFormat(enterRecord.enter_end_time);
      if (moment(now).isAfter(endDate)) {
        //已結束
        return enterRecord.exit_checklists.length <
          moment(endDate).diff(moment(startDate), 'days')
          ? false
          : true;
      } else if (now.isBetween(startDate, endDate, 'days', '[]')) {
        //今天之前的進場
        const exit_checklists_before_todays = enterRecord.exit_checklists.filter(
          (item) => moment(item.enter_date).isBefore(now_subtract_one_day),
        );
        if (
          moment(now).diff(moment(startDate), 'days') - 1 >
          exit_checklists_before_todays.length
        ) {
          return false;
        }
        //今天的進場
        const exit_checklists_today = enterRecord.exit_checklists.find(
          (item) => {
            return moment(item.enter_date).isSame(now, 'day');
          },
        );
        const enterNotifyTime = moment(
          `${this.getDateFormat(now)} ${endTime}`,
        ).subtract(1, 'hours');
        const _futureTimeToEnter = !moment(enterNotifyTime).isSameOrBefore(now);
        if (!_futureTimeToEnter && !exit_checklists_today) {
          return false;
        } else {
          return true;
        }
      } else {
        return true;
      }
    }
  },
  getExitChecklistStatus(exit_checklist_status) {
    if (exit_checklist_status === 'uncheck') {
      return '收工未檢查'
    } else if (exit_checklist_status === 'no_enter') {
      return '無進場'
    } else if (exit_checklist_status === 'return') {
      return '已復歸'
    } else if (exit_checklist_status === 'no_return') {
      return '未復歸'
    } else if (exit_checklist_status === 'complete_return') {
      return '收工且復歸'
    }
  },
  getExitChecklistStatusTextColor(exit_checklist_status) {
    let _tagTextColor = ''
    if (exit_checklist_status === 'uncheck') {
      _tagTextColor = $color.danger
    } else if (exit_checklist_status === 'no_enter') {
      _tagTextColor = $color.green
    } else if (exit_checklist_status === 'return') {
      _tagTextColor = $color.green
    } else if (exit_checklist_status === 'no_return') {
      _tagTextColor = $color.danger
    } else if (exit_checklist_status === 'complete_return') {
      _tagTextColor = $color.green
    }
    return _tagTextColor
  },
  getExitChecklistStatusBgc(exit_checklist_status) {
    let _tagBgColor = ''
    if (exit_checklist_status === 'uncheck') {
      _tagBgColor = $color.danger11l
    } else if (exit_checklist_status === 'no_enter') {
      _tagBgColor = $color.green11l
    } else if (exit_checklist_status === 'return') {
      _tagBgColor = $color.green11l
    } else if (exit_checklist_status === 'no_return') {
      _tagBgColor = $color.danger11l
    } else if (exit_checklist_status === 'complete_return') {
      _tagBgColor = $color.green11l
    }
    return _tagBgColor
  },
  getEnterStatusText(enter_status) {
    if (enter_status === 'in_progress') {
      return '進行中'
    } else if (enter_status === 'deferred') {
      return '展延中'
    } else if (enter_status === 'complete') {
      return '已完工'
    } else if (enter_status === 'suspend') {
      return '已停工'
    }
  },
  getEnterStatusTextColor(enter_status) {
    let _tagBgColor = ''
    if (enter_status === 'in_progress') {
      return $color.primary
    } else if (enter_status === 'deferred') {
      return $color.black
    } else if (enter_status === 'complete') {
      return $color.green
    } else if (enter_status === 'suspend') {
      return $color.black
    }
  },
  getEnterStatusBgc(enter_status) {
    if (enter_status === 'in_progress') {
      return $color.primary11l
    } else if (enter_status === 'deferred') {
      return $color.yellow11l
    } else if (enter_status === 'complete') {
      return $color.green11l
    } else if (enter_status === 'suspend') {
      return $color.yellow11l
    }
  },
  validationQuestionSubmit($event) {
    let validation = false
    if ($event[0].enter_score && $event[0].enter_score == '37') {
      if ($event[0] && $event[0].enter_remark) {
        validation = true
      } else {
        validation = false
      }
    }
    if ($event[0] &&
      $event[0].enter_score &&
      $event[0].enter_score == '36' &&
      $event[1] &&
      $event[1].exit_check_item_score &&
      $event[2] &&
      $event[2].final_check_score) {
      validation = true
    }
    return validation
  }
}
