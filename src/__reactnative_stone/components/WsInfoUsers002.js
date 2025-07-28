import React from 'react'
import { View, Pressable, TouchableOpacity, Dimensions } from 'react-native'
import { WsFlex, WsInfoUser, WsText, WsDes, WsTag, WsAvatar } from '@/components'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

const WsInfoUsers002 = props => {
  const { t, i18n } = useTranslation()

  // Props
  const { value = [], isUri, avatarSize } = props

  // Render
  return (
    <>
      <WsFlex
        flexWrap="wrap"
        style={{
          // borderWidth:1,
        }}
      >
        {value &&
          value.length > 0 &&
          value.map((item, itemIndex) => (
            <>
              <WsFlex
                key={itemIndex}
                style={{
                  // borderWidth:1,
                }}
              >
                <WsAvatar
                  size={42}
                  isUri={true}
                  source={item.avatar ? item.avatar : null}
                  style={{
                  }}
                />
                <View
                  style={{
                    justifyContent: 'center',
                  }}
                >
                  <WsText
                    size={12}
                    style={{
                      paddingLeft: 8
                    }}
                  >
                    {item.name}
                  </WsText>
                  {item.checklist_record_answer && item.checklist_record_answer.updated_at &&
                    (
                      <WsFlex
                        style={{
                          paddingLeft: 8
                        }}
                      >
                        {item.checklist_record_answer && item.checklist_record_answer.updated_at && (
                          <WsTag>
                            {t('已完成')}
                          </WsTag>
                        )}
                        <WsDes
                          style={{
                            padding: 4
                          }}
                        >
                          {item.checklist_record_answer &&
                            item.checklist_record_answer.updated_at ?
                            moment(item.checklist_record_answer.updated_at).format('YYYY-MM-DD HH:mm') :
                            null
                          }
                        </WsDes>

                      </WsFlex>
                    )}
                </View>
              </WsFlex>
            </>
          ))}
      </WsFlex>
    </>
  )
}

export default WsInfoUsers002
