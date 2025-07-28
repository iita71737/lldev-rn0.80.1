import React from 'react'
import { Pressable, ScrollView, View } from 'react-native'
import {
  WsPaddingContainer,
  WsText,
  WsModal,
  WsIconTitle,
  WsBtn,
  WsState,
  WsDialog,
  WsFlex,
  WsTag
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import S_CheckListRecord from '@/services/api/v1/checklist_record'
import S_CheckListVersion from '@/services/api/v1/checklist_version'
import { useSelector } from 'react-redux'
import moment from 'moment'
import i18next from 'i18next'

const ChangeAssignmentStep = props => {
  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)

  // Props
  const { item, value = {}, onChange, changeIndex, assignment } = props

  // State
  const [itemsToggleBtn] = React.useState([
    { label: i18next.t('無條件同意'), value: '16' },
    { label: i18next.t('有條件同意'), value: '17' },
    { label: i18next.t('不同意'), value: '18' }
  ])
  const [visible, setVisible] = React.useState(false)
  const [stateModal, setStateModal] = React.useState(false)
  const [remark, setRemark] = React.useState(value.remark)
  const [attaches, setAttaches] = React.useState(value.attaches)

  return (
    <>
      <ScrollView>
        {assignment.warningText != '' && (
          <WsPaddingContainer style={{ backgroundColor: $color.danger11l }}>
            <WsFlex>
              <WsText
                size={14}
                letterSpacing={1}
                fontWeight="700"
                style={{ marginVertical: 8 }}>
                {assignment.title}
              </WsText>
              <WsTag backgroundColor={$color.danger} textColor={$color.white}>
                {i18next.t('更改變因敘述')}
              </WsTag>
            </WsFlex>
            <WsText letterSpacing={1} size={14} style={{ marginBottom: 24 }}>
              {assignment.subtitle}
            </WsText>
          </WsPaddingContainer>
        )}
        <WsPaddingContainer
          style={{
            flex: 1
          }}>
          {!item.updateVersion && (
            <>
              <WsText
                size={18}
                letterSpacing={1}
                fontWeight="700"
                style={{ marginVertical: 8 }}>
                {assignment.title}
              </WsText>
              <WsText letterSpacing={1} size={18} style={{ marginBottom: 24 }}>
                {assignment.subtitle}
              </WsText>
            </>
          )}
          <WsFlex alignItems={'flex-start'}>
            <WsText style={{ marginRight: 8 }} >{item.index}{'. '}</WsText>
            <WsText letterSpacing={0.5} size={16} style={{ flex: 1 }}>
              {item.title}
            </WsText>
          </WsFlex>
          <WsState
            stateStyle={{
              height: 64,
              borderWidth: 0,
              shadowColor: 'rgba(0, 0, 0, 0.1)',
              shadowOpacity: 0.7,
              shadowOffset: {
                width: 4,
                height: 4
              }
            }}
            type="toggleBtn"
            items={itemsToggleBtn}
            value={value.score}
            onChange={$event => {
              setVisible(true)
              onChange($event, 'score', item, 'item')
            }}
          />
        </WsPaddingContainer>

        {(value.score !== 16) && (
          <View
            style={{
              paddingHorizontal: 16
            }}
          >
            <WsState
              label={i18next.t('條件說明')}
              multiline={true}
              value={remark}
              onChange={$event => {
                value.remark = $event
                setRemark($event)
                onChange(remark, 'remark', $event, 'item')
              }}
              rules={value.score != 16 ? 'required' : ''}
              placeholder={i18next.t('輸入')}
            />
            <WsState
              label={i18next.t('附件')}
              type="Ll_filesAndImages"
              style={{ marginTop: 8 }}
              modelName="change_record_answer"
              // uploadUrl={`factory/${currentFactory.id}/change_record_answer/attach`}
              onChange={$event => {
                value.attaches = $event
                setAttaches($event)
                if (attaches && attaches.length > 0) {
                  onChange(attaches, 'attaches', $event, 'item')
                }
              }}
              value={attaches}
            />
          </View>
        )}
      </ScrollView>
    </>
  )
}

export default ChangeAssignmentStep
