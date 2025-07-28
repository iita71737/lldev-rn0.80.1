import React from 'react'
import {
  Pressable,
  View,
  TouchableOpacity
} from 'react-native'
import {
  WsFlex,
  WsTag,
  WsPaddingContainer,
  WsText,
  WsCard,
  WsDes,
  WsCard002,
  WsIconBtn,
  WsDialogDelete,
  WsInfo
} from '@/components'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'

const LlTrainingGroupCard001 = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    item,
    onPress,
    onPressEdit
  } = props

  const [dialogVisible, setDialogVisible] = React.useState(false)

  // Render
  return (
    <>
      <WsPaddingContainer
        padding={0}
        style={{
          marginTop: 16,
          marginHorizontal:16
        }}>
        <TouchableOpacity
          onPress={onPress}
        >
          {item && (
            <WsCard002 layerIndex={0} color="#f0f0f0" padding={4}>
              <WsCard002 layerIndex={1} color="#e8e8e8" padding={2}>
                <WsCard002 layerIndex={2} color="#ffffff" padding={0}>

                  <View style={{ padding: 16 }}>

                    <WsFlex
                      justifyContent={'space-between'}
                      style={{
                        marginBottom: 16
                      }}
                    >
                      <WsText style={{}}>{item.name}</WsText>

                      {/* <WsFlex>
                        <WsIconBtn
                          style={{
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
                      </WsFlex> */}
                    </WsFlex>

                    {item.system_subclasses && (
                      <WsFlex flexWrap="wrap">
                        {item.system_subclasses.map(
                          (systemSubclass, systemSubclassIndex) => {
                            return (
                              <View key={systemSubclassIndex}>
                                <WsTag
                                  img={systemSubclass.icon}
                                  style={{
                                    marginRight: 8,
                                    marginTop: 8
                                  }}>
                                  {t(systemSubclass.name)}
                                </WsTag>
                              </View>
                            )
                          }
                        )}
                      </WsFlex>
                    )}

                    {/* 0 will get error */}
                    {item.total_trained_hours != undefined && (
                      <WsFlex>
                        <WsDes
                          color={$color.black}
                          style={{
                            marginRight: 8,
                            width: 100
                          }}
                        >
                          {t('總訓練時數')}
                        </WsDes>
                        <WsDes color={$color.black}>{`${item.total_trained_hours}`}</WsDes>
                      </WsFlex>
                    )}

                    <WsInfo
                      labelWidth={100}
                      labelSize={12}
                      labelColor={$color.black}
                      labelFontWeight={"400"}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center'
                      }}
                      label={t('管理者')}
                      type="user"
                      isUri={true}
                      value={item.owner}
                      textSize={12}
                    />

                    {item.updated_at && (
                      <WsFlex
                        style={{
                        }}>
                        <WsDes
                          color={$color.black}
                          style={{
                            marginRight: 8,
                            width: 100
                          }}>
                          {t('更新時間')}
                        </WsDes>
                        <WsDes color={$color.black}>{moment(item.updated_at).format('YYYY-MM-DD HH:mm:ss')}</WsDes>
                      </WsFlex>
                    )}
                  </View>
                </WsCard002>
              </WsCard002>
            </WsCard002>
          )}
        </TouchableOpacity>
      </WsPaddingContainer>

      <WsDialogDelete
        id={item.id}
        modelName="internal_training_group"
        visible={dialogVisible}
        text={t('確定刪除嗎？')}
        setVisible={setDialogVisible}
      />
    </>
  )
}
export default LlTrainingGroupCard001
