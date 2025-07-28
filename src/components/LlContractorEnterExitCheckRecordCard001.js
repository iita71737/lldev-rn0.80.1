import React from 'react'
import { Pressable, View, TouchableOpacity } from 'react-native'
import gColor from '@/__reactnative_stone/global/color'
import {
  WsCard,
  WsText,
  WsFlex,
  WsTag,
  WsGrid,
  WsSpec,
  WsBtn,
  WsInfo
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import LlBtn001 from '@/components/LlBtn001'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import S_ExitChecklist from '@/services/api/v1/exit_checklist'

const LlContractorEnterExitCheckRecordCard001 = props => {
  const { t, i18n } = useTranslation()

  // Props
  const {
    item,
    onPress,
    style,
    isTodayEnter,
    testID
  } = props

  // Function
  const $_getTagsBySystemSubclasses = system_subclasses => {
    const _tags = []
    system_subclasses.forEach(system_subclass => {
      _tags.push({
        icon: system_subclass.icon,
        text: system_subclass.name
      })
    })
    return _tags
  }

  // Render
  return (
    <TouchableOpacity
      testID={testID}
      onPress={onPress}
    >
      <WsCard
        style={[
          {
            alignItems: 'flex-start'
          },
          style
        ]}>
        <WsFlex>
          {item &&
            item.enter_status && (
              <WsFlex style={{ marginBottom: 8, marginRight: 4 }}>
                <WsTag
                  backgroundColor={S_ExitChecklist.getEnterStatusBgc(item.enter_status)}
                  textColor={S_ExitChecklist.getEnterStatusTextColor(item.enter_status)}>
                  {t(S_ExitChecklist.getEnterStatusText(item.enter_status))}
                </WsTag>
              </WsFlex>
            )}
          {item &&
            item.exit_checklist_status ? (
            <WsFlex style={{ marginBottom: 8, marginRight: 4 }}>
              <WsTag
                backgroundColor={S_ExitChecklist.getExitChecklistStatusBgc(item.exit_checklist_status)}
                textColor={S_ExitChecklist.getExitChecklistStatusTextColor(item.exit_checklist_status)}>
                {t(S_ExitChecklist.getExitChecklistStatus(item.exit_checklist_status))}
              </WsTag>
            </WsFlex>
          ) : (
            <WsFlex style={{ marginBottom: 8 }}>
              <WsTag backgroundColor={$color.danger11l} textColor={$color.danger}>
                {t('收工未檢查')}
              </WsTag>
            </WsFlex>
          )}
        </WsFlex>
        {item.task_content && (
          <WsText size={16}>{t(item.task_content)}</WsText>
        )}

        {item.system_subclasses && item.system_subclasses.length > 0 && (
          <WsFlex flexWrap="wrap">
            {$_getTagsBySystemSubclasses(item.system_subclasses).map(
              (tag, tagIndex) => {
                return (
                  <View key={tagIndex}>
                    {tag.icon && tag.text && (
                      <WsTag
                        style={{
                          marginTop: 8,
                          marginRight: 8
                        }}
                        img={tag.icon}>
                        {t(tag.text)}
                      </WsTag>
                    )}
                  </View>
                )
              }
            )}
          </WsFlex>
        )
        }

        {item.enter_start_date && isTodayEnter ? (
          <WsSpec
            labelWidth={80}
            style={{
              marginTop: 8
            }}
            title={t('進場時間')}>
            {t('今天')}
          </WsSpec>
        ) : (
          <WsSpec
            labelWidth={80}
            style={{
              marginTop: 8
            }}
            title={t('進場時間')}>
            {`${moment(item.enter_date).format('YYYY-MM-DD')}`}
            {item.enter_start_time && item.enter_end_time && (
              <>
                {`  `}
                {moment(item.enter_start_time).format('HH:mm')}
                {' - '}
                {moment(item.enter_end_time).format('HH:mm')}
              </>
            )}
          </WsSpec>
        )
        }

        {item.contractor && item.contractor.name && (
          <WsSpec
            labelWidth={80}
            style={{
              marginTop: 8
            }}
            title={t('承攬商')}>
            {t(item.contractor.name)}
          </WsSpec>
        )}

        {item.operate_location && (
          <WsSpec
            labelWidth={80}
            style={{
              marginTop: 8
            }}
            title={t('作業地點')}>
            {t(item.operate_location)}
          </WsSpec>
        )}

        {item.checked_at && (
          <WsSpec
            labelWidth={80}
            style={{
              marginTop: 8
            }}
            title={t('檢查時間')}>
            {moment(item.checked_at).format('YYYY-MM-DD HH:mm')}
          </WsSpec>
        )}

        {item.owner && (
          <WsInfo
            labelWidth={76}
            labelSize={12}
            labelColor={$color.gray}
            labelFontWeight={"400"}
            style={{
              marginTop: 8,
              flexDirection: 'row',
              alignItems: 'center'
            }}
            label={t('負責人')}
            type="user"
            isUri={true}
            value={item.owner}
          />
        )}

        <LlBtn001
          onPress={onPress}
          isFullWidth={true}
          style={{
            marginTop: 16
          }}
          textColor={$color.white}
          borderColor={$color.primary}
        >
          {'查看'}
        </LlBtn001>
      </WsCard>
    </TouchableOpacity>
  )
}

export default LlContractorEnterExitCheckRecordCard001
