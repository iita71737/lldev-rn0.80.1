import React from 'react'
import { Pressable, View, TouchableOpacity } from 'react-native'
import {
  WsCard,
  WsFlex,
  WsText,
  WsIcon,
  WsDes,
  WsFastImage,
  LlNumCard001,
  WsInfo,
  WsTag,
  WsIconBtn,
  WsDialogDelete
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import H_time from '@/helpers/time';

const LlTrainingTimeRecordCard001 = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    item,
    onPress,
    style,
    onOnPressTopRight,
    children
  } = props


  const [dialogVisible, setDialogVisible] = React.useState(false)

  return (
    <>
      <TouchableOpacity
        disabled={true}
        style={{
          marginHorizontal: 16
        }}
        onPress={onPress}
      >
        <WsCard
          padding={16}
          style={[
            {
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2
              },
              borderRadius: 10,
              shadowRadius: 4,
              shadowOpacity: 0.25,
              elevation: 2
            },
            style
          ]}>

          <WsIconBtn
            name="md-delete"
            color={$color.primary}
            size={24}
            style={{
              position: 'absolute',
              right: 0
            }}
            onPress={() => {
              setDialogVisible(true)
            }}
          />

          <WsFlex>
            {children}

            <View>
              {item.user && (
                <WsIconBtn
                  name="md-add"
                  color={$color.primary}
                  size={24}
                  style={{
                    position: 'absolute',
                    right: 0
                  }}
                  onPress={() => {
                    onOnPressTopRight(item)
                  }}
                />
              )}

              <WsInfo
                labelWidth={100}
                style={{
                  flexDirection: 'row',
                  marginRight: 16,
                }}
                label={t('姓名')}
                labelColor={$color.gray}
                value={item.user_name ? item.user_name : t('無')}
              />

              <WsInfo
                labelWidth={100}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 16,
                }}
                label={t('email')}
                labelColor={$color.gray}
                value={item.user_email ? item.user_email : t('無')}
              />

              <WsInfo
                labelWidth={100}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 16,
                }}
                label={t('時數')}
                labelColor={$color.gray}
                value={item.hours ? item.hours : '0'}
              />

              {item &&
                item.lack_hours != undefined && (
                  <WsInfo
                    labelWidth={100}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginRight: 16,
                    }}
                    label={t('尚缺時數')}
                    labelColor={$color.gray}
                    value={item.lack_hours ? item.lack_hours : t('無')}
                  />
                )}

              {item.department && (
                <WsInfo
                  labelWidth={100}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginRight: 16,
                  }}
                  label={t('部門')}
                  labelColor={$color.gray}
                  value={item.department ? item.department : t('無')}
                />
              )}

              <WsInfo
                labelWidth={100}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginRight: 16,
                }}
                label={t('備註')}
                labelColor={$color.gray}
                value={item.remark ? item.remark : t('無')}
              />

            </View>

          </WsFlex>

        </WsCard>
      </TouchableOpacity>

      <WsDialogDelete
        id={item.id}
        modelName="training_time_record"
        visible={dialogVisible}
        text={t('確定刪除嗎？')}
        setVisible={setDialogVisible}
      />
    </>
  )
}

export default LlTrainingTimeRecordCard001
