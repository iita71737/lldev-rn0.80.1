import React from 'react'
import { Table, Row, Rows } from 'react-native-table-component'
import moment from 'moment'
import gColor from '@/__reactnative_stone/global/color'

const WsTable = props => {
  // Props
  const { fields, fieldsData } = props

  // Function
  const $_getTableHead = () => {
    const _tableHead = []
    for (let fieldKey in fields) {
      const _field = fields[fieldKey]
      _tableHead.push(_field.label)
    }
    return _tableHead
  }
  const $_getTableData = () => {
    const _tableData = []
    fieldsData.forEach(fieldsDataItem => {
      const _tableDataItemData = []
      for (let fieldKey in fields) {
        const _field = fields[fieldKey]
        const _type = _field.type
        if (_type == 'custom') {
          const res = _field.get(fieldsDataItem)
          _tableDataItemData.push(res)
        } else {
          if (!fieldsDataItem[fieldKey]) {
            _tableDataItemData.push(null)
          } else {
            if (_type == 'datetime') {
              const format = _field.format
                ? _field.format
                : 'YYYY/MM/DD HH:mm:ss'
              _tableDataItemData.push(
                moment(fieldsDataItem[fieldKey]).format(format)
              )
            } else {
              _tableDataItemData.push(fieldsDataItem[fieldKey])
            }
          }
        }
      }
      _tableData.push(_tableDataItemData)
    })
    return _tableData
  }

  // Render
  return (
    <Table
      borderStyle={{
        borderWidth: 0
      }}>
      <Row
        data={$_getTableHead()}
        style={{
          paddingBottom: 12
        }}
        textStyle={{
          color: gColor.primary,
          fontWeight: 'bold'
        }}
      />
      <Rows
        data={$_getTableData()}
        style={{
          borderTopWidth: 1,
          paddingVertical: 12,
          borderColor: gColor.white3d
        }}
        textStyle={{
          fontSize: 12
        }}
      />
    </Table>
  )
}

export default WsTable
