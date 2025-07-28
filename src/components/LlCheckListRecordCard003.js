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

const LlCheckListRecordCard003 = props => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()

  const {
    item,
    style,
    onPress,
    testID
  } = props

  return (
    <>
      <TouchableOpacity
        testID={testID}
        onPress={onPress}
      >
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
            {item.ststem_class && (
              <WsTag
                backgroundColor={$color.white}
                imgSize={30}
                img={item.ststem_class.icon}
              />
            )}
            <WsText size={18} fontWeight="700">
              {t(item.ststem_class.name)}
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
                item.risk_level_23_count > 0
                  ? $color.danger
                  : $color.gray2l
              }
              textColor={$color.black1l}
              backgroundColor={
                item.risk_level_23_count > 0
                  ? $color.danger11l
                  : $color.white2d
              }
              icon="ws-filled-risk-high"
              text={item.risk_level_23_count}
            />
            <LlIconCard001
              style={{}}
              iconColor={
                item.risk_level_22_count > 0
                  ? $color.yellow
                  : $color.gray2l
              }
              textColor={$color.black1l}
              backgroundColor={
                item.risk_level_22_count > 0
                  ? $color.yellow11l
                  : $color.white2d
              }
              icon="ws-filled-risk-medium"
              text={item.risk_level_22_count}
            />
            <LlIconCard001
              style={{}}
              iconColor={
                item.risk_level_21_count > 0
                  ? $color.blue
                  : $color.gray2l
              }
              textColor={$color.black1l}
              backgroundColor={
                item.risk_level_21_count > 0
                  ? $color.blue11l
                  : $color.white2d
              }
              icon="ws-filled-risk-medium"
              text={item.risk_level_21_count}
            />
            <LlIconCard001
              style={{}}
              iconColor={
                item.risk_level_25_count > 0
                  ? $color.green
                  : $color.gray2l
              }
              textColor={$color.black1l}
              backgroundColor={
                item.risk_level_25_count > 0
                  ? $color.green11l
                  : $color.white2d
              }
              icon="ws-filled-check-circle"
              text={item.risk_level_25_count}
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
                alignItems: 'center',
                maxWidth: width * 0.5
              }}>
              <WsText>
                {item.incomplete_assignments_count != undefined
                  ? `${t('未完成{number}筆', { number: item.incomplete_assignments_count })}`
                  : t('無')}
              </WsText>
            </View>
            <View
              style={{
                borderWidth: 0.5,
                height: 30,
                marginHorizontal:16,
                borderColor: $color.gray3l,
              }}
            />
            <View
              style={{
                alignItems: 'center',
                maxWidth: width * 0.5
              }}>
              {/* <WsDes>{t('紀錄筆數')}</WsDes> */}
              <WsText>
                {`${t('已完成{number}筆', {
                  number: item.record_count ? item.record_count : 0
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

export default LlCheckListRecordCard003
