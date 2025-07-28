import React from 'react'
import { TouchableOpacity } from 'react-native'
import { WsFlex, WsText, WsTag, WsCard, WsDes } from '@/components'
import $color from '@/__reactnative_stone/global/color'
import moment from 'moment'
import i18next from 'i18next'

const LlContractorsCard001 = props => {

  // Props
  const {
    item,
    onPress,
    style,
    testID
  } = props

  // State
  const [hasDue, setHasDue] = React.useState()

  // Function
  const $_getContractorTypesText = () => {
    if (item.contractor_types) {
      const contractorTypes = item.contractor_types.map((type, index) =>
        index != 0 ? `,${type.name}` : type.name
      )
      const customizedContractorTypes = item.contractor_customed_types.map(
        (type, index) => (index != 0 ? `,${type.name}` : type.name)
      )
      const _text = contractorTypes.concat(customizedContractorTypes)
      return _text
    }
  }

  const $_setQuaStatus = () => {
    if (!item.contracts) {
      return
    }
    let _hasDue = false
    item.contracts.forEach(contract => {
      const findDue = contract.licenses.find(license => {
        return moment().isAfter(license.last_version.valid_end_date)
      })
      if (findDue) {
        _hasDue = true
      }
    })
    setHasDue(_hasDue)
  }

  React.useEffect(() => {
    $_setQuaStatus()
  }, [])

  // Render
  return (
    <>
      <TouchableOpacity
        testID={testID}
        onPress={onPress}
      >
        <WsCard style={style}>
          <WsFlex
            style={{
              marginBottom: 8,
              flexWrap: 'wrap'
            }}
            justifyContent="flex-start">
            {hasDue && (
              <WsTag
                backgroundColor={$color.danger11l}
                textColor={$color.danger}>
                {i18next.t('資格逾期')}
              </WsTag>
            )}
            {item.review == 0 && (
              <WsTag
                style={{ marginLeft: 4 }}
                backgroundColor={$color.danger11l}
                textColor={$color.danger}>
                {i18next.t('拒絕往來')}
              </WsTag>
            )}
          </WsFlex>
          <WsFlex>
            <WsText>{item.name ? item.name : item.contractor?.name ? item.contractor?.name : ''}</WsText>
          </WsFlex>
          <WsFlex
            style={{
              marginVertical: 8
            }}
            alignItems="flex-start">
            <WsText
              size={12}
              color={$color.gray3d}
              style={{
                marginRight: 8
              }}>
              {i18next.t('承攬類別')}
            </WsText>
            <WsText
              size={12}
              color={$color.gray}
              style={{
                flex: 1
              }}>
              {$_getContractorTypesText()}
            </WsText>
          </WsFlex>
          <WsFlex
            style={{
              marginBottom: 8
            }}>
            <WsText
              size={12}
              color={$color.gray3d}
              style={{
                marginRight: 8
              }}>
              {i18next.t('最後進場日期')}
            </WsText>
            <WsText size={12} color={$color.gray}>
              {item.last_contractor_enter_record
                ? moment(
                  item.last_contractor_enter_record.enter_end_date
                ).format('YYYY-MM-DD')
                : i18next.t('無')}
            </WsText>
          </WsFlex>
          {item.last_contractor_enter_record &&
            item.last_contractor_enter_record.enter_start_date && (
              <WsFlex>
                <WsText
                  size={12}
                  color={$color.gray3d}
                  style={{
                    marginRight: 8
                  }}>
                  {i18next.t('進場時間')}
                </WsText>
                <WsText size={12} color={$color.gray}>
                  {moment(item.last_contractor_enter_record.enter_start_time).format('HH:mm')}{' '}
                  {item.last_contractor_enter_record.enter_end_time
                    ? `- ${moment(item.last_contractor_enter_record.enter_end_time).format('HH:mm')}`
                    : null}
                </WsText>
              </WsFlex>
            )}
        </WsCard>
      </TouchableOpacity>
    </>
  )
}

export default LlContractorsCard001
