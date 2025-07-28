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

const LlRetrainingRecordCard001 = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    item,
    onPress,
    style,
    onPressEdit,
    editable = true
  } = props

  const [dialogVisible, setDialogVisible] = React.useState(false)

  return (
    <>
      <TouchableOpacity
        disabled={true}
        style={{
          marginHorizontal: 16,
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
          ]}
        >
          {editable && (
            <>
              <WsIconBtn
                style={{
                  position: 'absolute',
                  right: 36,
                  padding: 16,
                  zIndex: 999
                }}
                name="md-edit"
                padding={0}
                size={28}
                onPress={() => {
                  if (item) {
                    onPressEdit(item)
                  }
                }}
              />
              <WsIconBtn
                style={{
                  position: 'absolute',
                  right: 0,
                  padding: 16,
                  zIndex: 999
                }}
                name="md-delete"
                padding={0}
                size={28}
                onPress={() => {
                  if (item) {
                    setDialogVisible(true)
                  }
                }}
              />
            </>
          )}
          <WsInfo
            type={'date'}
            labelWidth={100}
            style={{
              flexDirection: 'row',
              marginRight: 16,
            }}
            label={t('訓練日期')}
            labelColor={$color.gray}
            value={item.train_at ? item.train_at : ' '}
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
            value={item.hours ? item.hours : t('無')}
          />
          {item.attaches &&
            item.attaches.length > 0 ? (
            <WsInfo
              type="filesAndImages"
              labelColor={$color.gray}
              label={t('附件')}
              value={item.attaches}
            />
          ) : (
            <WsInfo
              labelColor={$color.gray}
              label={t('附件')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginRight: 16,
              }}
              value={' '}
            />
          )}
          <WsInfo
            labelWidth={100}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
            labelSize={14}
            label={t('更新時間')}
            labelColor={$color.gray}
            value={moment(item.updated_at).format('YYYY-MM-DD HH:mm:ss')}
            type="dateTime"
          />
        </WsCard>
      </TouchableOpacity>

      <WsDialogDelete
        id={item.id}
        modelName="retraining_time_record"
        visible={dialogVisible}
        text={t('確定刪除嗎？')}
        setVisible={setDialogVisible}
      />
    </>
  )
}

export default LlRetrainingRecordCard001
