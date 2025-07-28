import store from '@/store'
import moment from 'moment'
export default {
  getFactoryPreUrl(unit) {
    const state = store.getState()
    const currentViewMode = state.data.currentViewMode
    const organization = state.data.currentOrganization
    const currentFactory = state.data.currentFactory
    if (currentViewMode === 'organization') {
      return `factory/${organization?.id}`
    } 
    else if (unit) {
      return `factory/${unit}`
    }
    else {
      return `factory/${currentFactory?.id}`
    }
  },
  getOrganizationPreUrl() {
    const state = store.getState()
    const organization = state.data.currentOrganization
    return `organization/${organization.id}`
  },
  getFormattedFiltersValue(filterFields, filtersValue) {
    const _filtersValue = {}
    for (const fieldKey in filterFields) {
      const field = filterFields[fieldKey]
      const value = filtersValue[fieldKey]
      if (field.type == 'system_subclass') {
        if (typeof value === 'string') {
          _filtersValue[fieldKey] = value
        } else if (typeof value === 'object') {
          _filtersValue[fieldKey] = value.toString()
        }
      } else if (field.type == 'checkbox') {
        if (value && typeof value === 'string') {
          _filtersValue[fieldKey] = value
        } else if (value && typeof value === 'object') {
          // 全選則不送PARAMS
          if (value && field && field.items && (value.length === field.items.length)) {
            _filtersValue[fieldKey] = undefined
          } else {
            // follow web design
            // _filtersValue[fieldKey] = value.toString() 
            _filtersValue[fieldKey] = value.map(_item => _item.id).join(',').toString()
          }
        } else {
          _filtersValue[fieldKey] = undefined
        }
      } else if (field.type == 'date_range') {
        if (value && value.range == "nolimit") {
          _filtersValue.start_time = undefined,
            _filtersValue.end_time = undefined
        } else if (value && value.range === "1month") {
          // _filtersValue.start_time = moment().subtract(1, 'months').format('YYYY-MM-DD'),
          //   _filtersValue.end_time = moment().format('YYYY-MM-DD')
          _filtersValue.start_time = moment().subtract(1, 'months').utc().toISOString();
          _filtersValue.end_time = moment().utc().toISOString();
          _filtersValue.time_field = filtersValue.time_field ? filtersValue.time_field : undefined
        } else if (value && value.range === "3month") {
          // _filtersValue.start_time = moment().subtract(3, 'months').format('YYYY-MM-DD'),
          //   _filtersValue.end_time = moment().format('YYYY-MM-DD')
          _filtersValue.start_time = moment().subtract(3, 'months').utc().toISOString();
          _filtersValue.end_time = moment().utc().toISOString();
          _filtersValue.time_field = filtersValue.time_field ? filtersValue.time_field : undefined
        } else if (value && value.range === "custom") {
          // _filtersValue.start_time = moment(value.start_time).format('YYYY-MM-DD HH:mm:ss Z'),
          //   _filtersValue.end_time = moment(value.end_time).endOf('day').format('YYYY-MM-DD HH:mm:ss Z')
          _filtersValue.start_time = moment(value.start_time).utc().toISOString();
          _filtersValue.end_time = moment(value.end_time).endOf('day').utc().toISOString();
          _filtersValue.time_field = filtersValue.time_field ? filtersValue.time_field : undefined
        } else {
          // _filtersValue.start_time = value && value.start_time ? value.start_time : undefined
          // _filtersValue.end_time = value && value.end_time ? value.end_time : undefined
          _filtersValue.start_time = value && value.start_time ? moment(value.start_time).utc().toISOString() : undefined;
          _filtersValue.end_time = value && value.end_time ? moment(value.end_time).utc().toISOString() : undefined;
          _filtersValue.time_field = filtersValue.time_field ? filtersValue.time_field : undefined
        }
      } else if (field.type == 'date_range002') {
        if (value && value.range === "nolimit") {
          _filtersValue.start_date = moment().subtract(12, 'months').utc().startOf('month').format('YYYY-MM-DD'),
            _filtersValue.end_date = moment().format('YYYY-MM-DD')
        } else if (value && value.range === "1month") {
          _filtersValue.start_date = moment().subtract(1, 'months').format('YYYY-MM-DD'),
            _filtersValue.end_date = moment().format('YYYY-MM-DD')
        } else if (value && value.range === "3month") {
          _filtersValue.start_date = moment().subtract(3, 'months').format('YYYY-MM-DD'),
            _filtersValue.end_date = moment().format('YYYY-MM-DD')
        } else {
          _filtersValue.start_date = value && value.start_date ? value.start_date : undefined
          _filtersValue.end_date = value && value.end_date ? value.end_date : undefined
        }
      } else if (field.type == 'multiLayerToggle') {
        if (value && typeof value === 'string' && value === 'all') {
          _filtersValue[fieldKey] = undefined
        } else {
          _filtersValue[fieldKey] = value
        }
      } else if (field.type == 'picker') {
        if (value != undefined && typeof value === 'object') {
          delete filtersValue.order
          _filtersValue['order_way'] = value.order_way
          _filtersValue['order_by'] = value.order_by
        } else {
          _filtersValue[fieldKey] = value
        }
      } else if (field.type == 'belongstomany') {
        if (value != undefined && value.length > 0) {
          _filtersValue[fieldKey] = value.map(_item => _item.id).join(',')
        } else {
          _filtersValue[fieldKey] = value
        }
      }
      else if (field.type == 'belongsto') {
        if (value != undefined) {
          _filtersValue[fieldKey] = value.id
        }
      }
      else {
        _filtersValue[fieldKey] = value
      }
    }
    if (filtersValue && filtersValue.search && filtersValue.search.trim() !== '') {
      _filtersValue.search = filtersValue.search;
    }
    return _filtersValue
  },
  getFactoryParams(unit) {
    const state = store.getState()
    const currentViewMode = state.data.currentViewMode
    const organization = state.data.currentOrganization
    const currentFactory = state.data.currentFactory
    if (currentViewMode === 'organization') {
      return {
        factory: organization && organization.id ? organization.id : null
      }
    } 
    else if (unit) {
      return {
        factory: unit
      }
    }
    else {
      return {
        factory: currentFactory && currentFactory.id ? currentFactory.id : null
      }
    }
  },
  getOrganizationParams() {
    const state = store.getState()
    const organization = state.data.currentOrganization
    return {
      organization: organization.id
    }
  },
  getFactoryData() {
    const state = store.getState()
    const currentFactory = state.data.currentFactory
    return {
      factory: currentFactory.id
    }
  },
  getDatasWithFactory(datas) {
    const state = store.getState()
    const currentFactory = state.data.currentFactory
    return datas.map(data => {
      return {
        ...data,
        factory: currentFactory.id
      }
    })
  },
  getParamsWithFactory(params) {
    const state = store.getState()
    const currentFactory = state.data.currentFactory
    return params.map(param => {
      return {
        ...param,
        factory: currentFactory.id
      }
    })
  },
  getLocaleParams() {
    const state = store.getState()
    const currentUser = state.data.currentUser
    return {
      lang: currentUser?.locale?.code ? currentUser?.locale?.code : undefined
    }
  },
}
