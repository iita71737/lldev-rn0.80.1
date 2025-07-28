import React from 'react'
import {
  Pressable,
  View,
  Image,
  TouchableOpacity,
  Dimensions
} from 'react-native'
import $color from '@/__reactnative_stone/global/color'
import {
  WsCard,
  WsText,
  WsFlex,
  WsTag,
  WsDes,
  WsBtn,
  WsIcon
} from '@/components'
import LlIconCard001 from '@/components/LlIconCard001'
import { useTranslation } from 'react-i18next'
import S_CheckList from '@/services/api/v1/checklist'

const LlCheckListRecordCard001 = props => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  const {
    name,
    content,
    icon,
    id,
    onPress,
    passRate,
    major,
    minor,
    ofi,
    pass,
    frequency,
    checkListRecords,
    style
  } = props

  // Function
  const $_getRiskNumberByRisk = (recordList, risk) => {
    if (!recordList) {
      return
    }
    const riskNumber = recordList.filter(record => {
      return record.risk === risk
    })
    return riskNumber.length
  }

  return (
    <>
      <TouchableOpacity onPress={onPress}>
        <WsCard
          style={[
            {
              shadowColor: 'gray',
              shadowOffset: {
                width: 2,
                height: 2
              },
              shadowOpacity: 0.4,
              shadowRadius: 5.16,
              elevation: 5,
            },
            style
          ]}
          padding={0}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              justifyContent: 'center',
              // borderWidth:1,
              marginTop: 16,
            }}>
            {checkListRecords.systemClassIcon && (
              <WsTag
                backgroundColor={$color.white}
                imgSize={30}
                img={checkListRecords.systemClassIcon}
              />
            )}
            <WsText size={18} fontWeight="700">
              {t(checkListRecords.systemClass)}
            </WsText>
          </View>
          <WsFlex
            justifyContent="space-between"
            style={{
              width: '100%',
              padding: 20
            }}>
            <LlIconCard001
              style={{}}
              iconColor={
                $_getRiskNumberByRisk(
                  checkListRecords.recordDataTable.rowData,
                  23
                )
                  ? $color.danger
                  : $color.gray2l
              }
              textColor={$color.black1l}
              backgroundColor={
                $_getRiskNumberByRisk(
                  checkListRecords.recordDataTable.rowData,
                  23
                )
                  ? $color.danger11l
                  : $color.white2d
              }
              icon="ws-filled-risk-high"
              text={$_getRiskNumberByRisk(
                checkListRecords.recordDataTable.rowData,
                23
              )}
            />
            <LlIconCard001
              style={{}}
              iconColor={
                $_getRiskNumberByRisk(
                  checkListRecords.recordDataTable.rowData,
                  22
                )
                  ? $color.yellow
                  : $color.gray2l
              }
              textColor={$color.black1l}
              backgroundColor={
                $_getRiskNumberByRisk(
                  checkListRecords.recordDataTable.rowData,
                  22
                )
                  ? $color.yellow11l
                  : $color.white2d
              }
              icon="ws-filled-risk-medium"
              text={$_getRiskNumberByRisk(
                checkListRecords.recordDataTable.rowData,
                22
              )}
            />
            <LlIconCard001
              style={{}}
              iconColor={
                $_getRiskNumberByRisk(
                  checkListRecords.recordDataTable.rowData,
                  21
                )
                  ? $color.blue
                  : $color.gray2l
              }
              textColor={$color.black1l}
              backgroundColor={
                $_getRiskNumberByRisk(
                  checkListRecords.recordDataTable.rowData,
                  21
                )
                  ? $color.blue11l
                  : $color.white2d
              }
              icon="ws-filled-risk-medium"
              text={$_getRiskNumberByRisk(
                checkListRecords.recordDataTable.rowData,
                21
              )}
            />
            <LlIconCard001
              style={{}}
              iconColor={
                $_getRiskNumberByRisk(
                  checkListRecords.recordDataTable.rowData,
                  25
                )
                  ? $color.green
                  : $color.gray2l
              }
              textColor={$color.black1l}
              backgroundColor={
                $_getRiskNumberByRisk(
                  checkListRecords.recordDataTable.rowData,
                  25
                )
                  ? $color.green11l
                  : $color.white2d
              }
              icon="ws-filled-check-circle"
              text={$_getRiskNumberByRisk(
                checkListRecords.recordDataTable.rowData,
                25
              )}
            />
          </WsFlex>
          <WsFlex
            justifyContent="space-between"
            style={{
              backgroundColor: $color.blue11l,
              height: 72,
              paddingHorizontal: 60
            }}>
            <View
              style={{
                alignItems: 'center'
              }}>
              <WsDes>{t('平均合規率')}</WsDes>
            </View>
            <View
              style={{
                borderWidth: 0.5,
                height: 30,
                borderColor: $color.gray3l
              }}
            />
            <View
              style={{
                alignItems: 'center'
              }}>
              <WsDes>{t('記錄筆數')}</WsDes>
              <WsText>
                {`${t('共{number}筆', {
                  number: checkListRecords.recordDataTable.rowData.length
                })}`}
              </WsText>
            </View>
          </WsFlex>

          <WsFlex
            justifyContent="center"
            style={{
              width: '100%',
              marginBottom: 16,
              paddingLeft: 32
            }}>
            <WsText size={14} color={$color.gray2l} letterSpacing={1}>
              {t('查看記錄')}
            </WsText>
            <WsIcon
              size={20}
              name="md-chevron-right"
              color={$color.gray2l}
              style={{
                marginLeft: 8
              }}
            />
          </WsFlex>
        </WsCard>
      </TouchableOpacity>
    </>
  )
}

export default LlCheckListRecordCard001
