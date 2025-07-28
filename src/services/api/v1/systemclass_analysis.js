import base from '@/__reactnative_stone/services/wasaapi/v1/__base'
import S_Processor from '@/services/app/processor'
import store from '@/store'
import moment from 'moment';
import i18next from 'i18next';

export default {
  async index({ params }) {
    return base.index({
      modelName: 'analysis/system_class_total',
      params: {
        ...params,
      },
    })
  },
  async indexV2({ params }) {
    return base.index({
      modelName: 'v2/analysis/system_class_total',
      params: {
        ...params,
        ...S_Processor.getLocaleParams()
      },
    })
  },
  async contractorEnterRecordIndex({ params }) {
    const res = await base.index({
      modelName: 'analysis/contractor_enter_record_total',
      params: {
        ...params,
      },
    });
    return res;
  },
  async contractorEnterRecordIndexV2({ params }) {
    const res = await base.index({
      modelName: 'v2/analysis/contractor_enter_record_total',
      params: {
        ...params,
        ...S_Processor.getLocaleParams()
      },
    });
    return res;
  },
  setNumberCardData(allSystemClass, systemData, totalData, contractorData) {
    let _result = [];
    if (
      allSystemClass &&
      allSystemClass.length > 0 &&
      systemData &&
      systemData.length > 0 &&
      contractorData &&
      contractorData.length > 0 &&
      totalData &&
      totalData.length > 0
    ) {
      _result = [
        {
          icon: 'll-nav-event-outline',
          title: i18next.t('風險事件處理中'),
          label: i18next.t('風險'),
          navigate: 'DashboardEvent',
          count: totalData[0] ? totalData[0].event_count : 0,
          numberInfos: [
            {
              numberTag: i18next.t('新增'),
              toolTips: i18next.t('24小時內新增且狀態為處理中的數量'),
            },
            {
              numberTag: i18next.t('累計'),
              toolTips: i18next.t('累計至累計至目前狀態為處理中的數量目前狀態為處理中的事件數'),
            },
          ],
          systemType: this.systemTypeDate(
            allSystemClass,
            systemData,
            'event_current_count',
            'event_total_count'
          ),
          update_at: moment().format("YYYY-MM-DD HH:mm:ss")
        },
        {
          title: i18next.t('證照即將到期'),
          label: i18next.t('證照'),
          icon: 'ws-outline-license',
          count: totalData[0] ? totalData[0].license_count : 0,
          navigate: 'DashboardLicenseExpired',
          numberInfos: [
            {
              numberTag: i18next.t('已逾期'),
              toolTips: i18next.t('已逾期的數量'),
            },
            {
              numberTag: i18next.t('即將到期'),
              toolTips: i18next.t('三個月內到期的數量'),
            },
          ],
          systemType: this.systemTypeDate(
            allSystemClass,
            systemData,
            'license_expired_count',
            'license_expiring_count'
          ),
          update_at: moment().format("YYYY-MM-DD HH:mm:ss")
        },
        {
          title: i18next.t('警示未排除'),
          label: i18next.t('警示'),
          icon: 'll-nav-alert-outline',
          count: totalData[0] ? totalData[0].alert_count : 0,
          isPercent: false,
          navigate: 'DashboardAlert',
          numberInfos: [
            {
              numberTag: i18next.t('新增'),
              toolTips: i18next.t('24小時內新增且狀態為處理中的數量'),
            },
            {
              numberTag: i18next.t('累計'),
              toolTips: i18next.t('累計至目前狀態為處理中的數量'),
            },
          ],
          systemType: this.systemTypeDate(
            allSystemClass,
            systemData,
            'alert_current_count',
            'alert_total_count'
          ),
          update_at: moment().format("YYYY-MM-DD HH:mm:ss")
        },
        {
          title: i18next.t('變動評估中'),
          label: i18next.t('變動'),
          icon: 'll-nav-change-outline',
          count: totalData[0] ? totalData[0].change_count : 0,
          isPercent: false,
          navigate: 'DashboardChange',
          numberInfos: [
            {
              numberTag: i18next.t('執行中'),
              toolTips: i18next.t('執行中的數量'),
            },
            {
              numberTag: i18next.t('評估中'),
              toolTips: i18next.t('狀態為評估中且逾期的數量'),
            },
          ],
          systemType: this.systemTypeDate(
            allSystemClass,
            systemData,
            'change_executing_count',
            'change_expired_count'
          ),
          update_at: moment().format("YYYY-MM-DD HH:mm:ss")
        },
        {
          title: i18next.t('任務處理中'),
          label: i18next.t('任務'),
          icon: 'll-nav-assignment-outline',
          count: totalData[0] ? totalData[0].task_count : 0,
          navigate: 'DashboardTask',
          numberInfos: [
            {
              numberTag: i18next.t('新增'),
              toolTips: i18next.t('24小時內新增且狀態為處理中的數量'),
            },
            {
              numberTag: i18next.t('累計'),
              toolTips: i18next.t('累計至目前狀態為處理中的數量'),
            },
          ],
          systemType: this.systemTypeDate(
            allSystemClass,
            systemData,
            'task_current_count',
            'task_total_count'
          ),
          update_at: moment().format("YYYY-MM-DD HH:mm:ss")
        },
        {
          title: i18next.t('今日進場'),
          icon: 'll-nav-entry-outline',
          count: totalData[0] ? totalData[0].contractor_enter_record_count : 0,
          isPercent: false,
          numberInfos: [],
          systemType: [],
          navigate: 'DashboardContractorEnter',
          bigNumber: [
            {
              title: i18next.t('今日未復歸'),
              tooltips: i18next.t('今日未復歸的數量'),
              num: contractorData[0]
                ? contractorData[0].non_return_current_count
                : 0,
            },
            {
              title: i18next.t('未復歸累計'),
              tooltips: i18next.t('未復歸累計的數量'),
              num: contractorData[0].non_return_total_count
                ? contractorData[0].non_return_total_count
                : 0,
            },
          ],
          update_at: moment().format("YYYY-MM-DD HH:mm:ss")
        },
      ];
    }
    return _result;
  },
  systemTypeDate(
    allSystemClass,
    systemData,
    systemKey,
    totalKey,
    preText = '',
  ) {
    const systemClass = JSON.parse(JSON.stringify(allSystemClass));
    const _systemData = JSON.parse(JSON.stringify(systemData));
    const _resultData = systemClass.map((systemItem) => {
      const _systemNumData = _systemData.find(
        (item) => item.system_class.id === systemItem.id,
      );
      if (_systemNumData) {
        return {
          id: systemItem.id,
          image: systemItem.icon,
          number1: _systemNumData[systemKey]
            ? preText + _systemNumData[systemKey]
            : 0,
          number2: _systemNumData[totalKey] ? _systemNumData[totalKey] : 0,
          systemTitle: systemItem.name,
        };
      } else {
        return {}
      }
    });
    return _resultData;
  },
  getFormattedValue(models, countKey, startTime, endTime) {
    // 保留，檢查長條圖資料用
    // console.log(JSON.stringify(models),'--models--')
    // console.log(countKey,'--countKey--')
    // console.log(startTime,'--startTime--')
    // console.log(endTime,'---endTime--')

    const _value = []
    const _startTime = moment(startTime).format('M')
    const _endTime = moment(endTime).format('M')
    const _diff = moment(endTime).diff(moment(startTime), 'months', true)

    for (let i = 0; i <= _diff; i++) {
      models.forEach(model => {
        const _startMonth = parseInt(_startTime) + i
        const modelMonth = moment(model.date).format('M')

        if (_startMonth == modelMonth && model.system_class) {
          _value[i] = {
            ..._value[i],
            [model.system_class.id]: model[countKey] ? model[countKey] : 0
          }
        }
        else if (_startMonth == modelMonth) {
          _value[i] = {
            ..._value[i],
            'all': model[countKey] ? model[countKey] : 0
          }
        }
      })
    }
    for (let i = 0; i <= _diff; i++) {
      if (_value[i] == null) {
        _value[i] = {}
      }
    }
    return _value
  },
  setNumberCardData_v2(totalData) {
    let _result = [];
    if (
      totalData &&
      totalData.length > 0
    ) {
      _result = [
        {
          icon: 'll-nav-event-filled',
          title: i18next.t('風險事件處理中'),
          label: i18next.t('風險'),
          navigateRoutesName: 'RoutesEvent',
          navigateScreen: 'DashboardEvent',
          count: totalData[0] ? totalData[0].event_count : 0,
          upperRightNavigate: 'RoutesEvent',
          upperRightNavigateScreen: 'EventIndex',
        },
        {
          title: i18next.t('證照即將到期'),
          label: i18next.t('證照'),
          icon: 'ws-outline-license',
          count: totalData[0] ? totalData[0].license_count : 0,
          navigateRoutesName: 'RoutesLicense',
          navigateScreen: 'DashboardLicenseExpired',
          upperRightNavigate: 'RoutesLicense',
          upperRightNavigateScreen: 'LicenseIndex',
        },
        {
          title: i18next.t('警示未排除'),
          label: i18next.t('警示'),
          icon: 'll-nav-alert-filled',
          count: totalData[0] ? totalData[0].alert_count : 0,
          isPercent: false,
          navigateRoutesName: 'RoutesAlert',
          navigateScreen: 'DashboardAlert',
          upperRightNavigate: 'RoutesAlert',
          upperRightNavigateScreen: 'AlertIndex',
        },
        {
          title: i18next.t('變動評估中'),
          label: i18next.t('變動'),
          icon: 'll-nav-change-filled',
          count: totalData[0] ? totalData[0].change_count : 0,
          isPercent: false,
          navigateRoutesName: 'RoutesChange',
          navigateScreen: 'DashboardChange',
          upperRightNavigate: 'RoutesChange',
          upperRightNavigateScreen: 'ChangeIndex',
        },
        {
          title: i18next.t('任務處理中'),
          label: i18next.t('任務'),
          icon: 'll-nav-assignment-filled',
          count: totalData[0] ? totalData[0].task_count : 0,
          navigateRoutesName: 'RoutesTask',
          navigateScreen: 'DashboardTask',
          upperRightNavigate: 'RoutesTask',
          upperRightNavigateScreen: 'TaskIndex',
        },
        {
          title: i18next.t('今日進場'),
          icon: 'll-nav-entry-filled',
          count: totalData[0] ? totalData[0].contractor_enter_record_count : 0,
          isPercent: false,
          navigateRoutesName: 'RoutesContractorEnter',
          navigateScreen: 'DashboardContractorEnter',
          upperRightNavigate: 'RoutesContractorEnter',
          upperRightNavigateScreen: 'ContractorEnter',
        },
      ];
    } else if (
      totalData &&
      totalData.length == 0
    ) {
      _result = [
        {
          icon: 'll-nav-event-filled',
          title: i18next.t('風險事件處理中'),
          label: i18next.t('風險'),
          navigateRoutesName: 'RoutesEvent',
          navigateScreen: 'DashboardEvent',
          count: 0,
          upperRightNavigate: 'RoutesEvent',
          upperRightNavigateScreen: 'EventIndex',
        },
        {
          title: i18next.t('證照即將到期'),
          label: i18next.t('證照'),
          icon: 'ws-outline-license',
          count: 0,
          navigateRoutesName: 'RoutesLicense',
          navigateScreen: 'DashboardLicenseExpired',
          upperRightNavigate: 'RoutesLicense',
          upperRightNavigateScreen: 'LicenseIndex',
        },
        {
          title: i18next.t('警示未排除'),
          label: i18next.t('警示'),
          icon: 'll-nav-alert-filled',
          count: 0,
          isPercent: false,
          navigateRoutesName: 'RoutesAlert',
          navigateScreen: 'DashboardAlert',
          upperRightNavigate: 'RoutesAlert',
          upperRightNavigateScreen: 'AlertIndex',
        },
        {
          title: i18next.t('變動評估中'),
          label: i18next.t('變動'),
          icon: 'll-nav-change-filled',
          count: 0,
          isPercent: false,
          navigateRoutesName: 'RoutesChange',
          navigateScreen: 'DashboardChange',
          upperRightNavigate: 'RoutesChange',
          upperRightNavigateScreen: 'ChangeIndex',
        },
        {
          title: i18next.t('任務處理中'),
          label: i18next.t('任務'),
          icon: 'll-nav-assignment-filled',
          count: 0,
          navigateRoutesName: 'RoutesTask',
          navigateScreen: 'DashboardTask',
          upperRightNavigate: 'RoutesTask',
          upperRightNavigateScreen: 'TaskIndex',
        },
        {
          title: i18next.t('今日進場'),
          icon: 'll-nav-entry-filled',
          count: 0,
          isPercent: false,
          navigateRoutesName: 'RoutesContractorEnter',
          navigateScreen: 'DashboardContractorEnter',
          upperRightNavigate: 'RoutesContractorEnter',
          upperRightNavigateScreen: 'ContractorEnter',
        },
      ];
    } else {
      _result = [
        {
          icon: 'll-nav-event-filled',
          title: i18next.t('風險事件處理中'),
          label: i18next.t('風險'),
          navigateRoutesName: 'RoutesEvent',
          navigateScreen: 'DashboardEvent',
          count: null,
          upperRightNavigate: 'RoutesEvent',
          upperRightNavigateScreen: 'EventIndex',
        },
        {
          title: i18next.t('證照即將到期'),
          label: i18next.t('證照'),
          icon: 'ws-outline-license',
          count: null,
          navigateRoutesName: 'RoutesLicense',
          navigateScreen: 'DashboardLicenseExpired',
          upperRightNavigate: 'RoutesLicense',
          upperRightNavigateScreen: 'LicenseIndex',
        },
        {
          title: i18next.t('警示未排除'),
          label: i18next.t('警示'),
          icon: 'll-nav-alert-filled',
          count: null,
          isPercent: false,
          navigateRoutesName: 'RoutesAlert',
          navigateScreen: 'DashboardAlert',
          upperRightNavigate: 'RoutesAlert',
          upperRightNavigateScreen: 'AlertIndex',
        },
        {
          title: i18next.t('變動評估中'),
          label: i18next.t('變動'),
          icon: 'll-nav-change-filled',
          count: null,
          isPercent: false,
          navigateRoutesName: 'RoutesChange',
          navigateScreen: 'DashboardChange',
          upperRightNavigate: 'RoutesChange',
          upperRightNavigateScreen: 'ChangeIndex',
        },
        {
          title: i18next.t('任務處理中'),
          label: i18next.t('任務'),
          icon: 'll-nav-assignment-filled',
          count: null,
          navigateRoutesName: 'RoutesTask',
          navigateScreen: 'DashboardTask',
          upperRightNavigate: 'RoutesTask',
          upperRightNavigateScreen: 'TaskIndex',
        },
        {
          title: i18next.t('今日進場'),
          icon: 'll-nav-entry-filled',
          count: null,
          isPercent: false,
          navigateRoutesName: 'RoutesContractorEnter',
          navigateScreen: 'DashboardContractorEnter',
          upperRightNavigate: 'RoutesContractorEnter',
          upperRightNavigateScreen: 'ContractorEnter',
        },
      ];
    }
    return _result;
  },
  queryRiskTypeDataByRoutePrefix(type, routePrefix, _data) {
    if (type === 'add' && _data) {
      if (routePrefix == 'DashboardEventList') {
        return _data.event_current_count
      }
      if (routePrefix == 'DashboardLicenseExpiredList') {
        return _data.license_expired_count
      }
      if (routePrefix == 'DashboardAlertList') {
        return _data.alert_current_count
      }
      if (routePrefix == 'DashboardChangeList') {
        return _data.change_executing_count
      }
      if (routePrefix == 'DashboardTaskList') {
        return _data.task_current_count
      }
    }
    if (type === 'count' && _data) {
      if (routePrefix == 'DashboardEventList') {
        return _data.event_total_count
      }
      if (routePrefix == 'DashboardLicenseExpiredList') {
        return _data.license_expiring_count
      }
      if (routePrefix == 'DashboardAlertList') {
        return _data.alert_total_count
      }
      if (routePrefix == 'DashboardChangeList') {
        return _data.change_expired_count
      }
      if (routePrefix == 'DashboardTaskList') {
        return _data.task_total_count
      }
    }
  },
  // getLabelTextByRoutePrefix(routePrefix) {
  //   if (routePrefix == 'DashboardEventList') {
  //     return i18next.t('風險')
  //   }
  //   if (routePrefix == 'DashboardLicenseExpiredList') {
  //     return i18next.t('證照')
  //   }
  //   if (routePrefix == 'DashboardAlertList') {
  //     return i18next.t('警示')
  //   }
  //   if (routePrefix == 'DashboardChangeList') {
  //     return i18next.t('變動')
  //   }
  //   if (routePrefix == 'DashboardTaskList') {
  //     return i18next.t('任務')
  //   }
  // },
  queryLabel001(routePrefix) {
    if (routePrefix == 'DashboardEventList') {
      return i18next.t('新增')
    }
    if (routePrefix == 'DashboardLicenseExpiredList') {
      return i18next.t('已逾期')
    }
    if (routePrefix == 'DashboardAlertList') {
      return i18next.t('新增')
    }
    if (routePrefix == 'DashboardChangeList') {
      return i18next.t('執行中')
    }
    if (routePrefix == 'DashboardTaskList') {
      return i18next.t('新增')
    }
  },
  queryLabel002(routePrefix) {
    if (routePrefix == 'DashboardEventList') {
      return i18next.t('累計')
    }
    if (routePrefix == 'DashboardLicenseExpiredList') {
      return i18next.t('即將到期')
    }
    if (routePrefix == 'DashboardAlertList') {
      return i18next.t('累計')
    }
    if (routePrefix == 'DashboardChangeList') {
      return i18next.t('評估逾期')
    }
    if (routePrefix == 'DashboardTaskList') {
      return i18next.t('累計')
    }
  },
  toolTipText001(routePrefix) {
    if (routePrefix == 'DashboardEventList') {
      return i18next.t('24小時內新增且狀態為處理中的數量')
    }
    if (routePrefix == 'DashboardLicenseExpiredList') {
      return i18next.t('已逾期的數量')
    }
    if (routePrefix == 'DashboardAlertList') {
      return i18next.t('24小時內新增且狀態為處理中的數量')
    }
    if (routePrefix == 'DashboardChangeList') {
      return i18next.t('執行中的數量')
    }
    if (routePrefix == 'DashboardTaskList') {
      return i18next.t('24小時內新增且狀態為處理中的數量')
    }
  },
  toolTipText002(routePrefix) {
    if (routePrefix == 'DashboardEventList') {
      return i18next.t('累計至目前狀態為處理中的數量')
    }
    if (routePrefix == 'DashboardLicenseExpiredList') {
      return i18next.t('三個月內到期的數量')
    }
    if (routePrefix == 'DashboardAlertList') {
      return i18next.t('累計至目前狀態為處理中的數量')
    }
    if (routePrefix == 'DashboardChangeList') {
      return i18next.t('狀態為評估中且逾期的數量')
    }
    if (routePrefix == 'DashboardTaskList') {
      return i18next.t('累計至目前狀態為處理中的數量')
    }
  },
}