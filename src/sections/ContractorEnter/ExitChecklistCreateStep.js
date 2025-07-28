import React from 'react'
import {
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  View,
  SafeAreaView,
  Dimensions
} from 'react-native'
import {
  WsPaddingContainer,
  WsText,
  WsTag,
  WsModal,
  WsTabView,
  WsIconTitle,
  WsBtn,
  WsState,
  WsStateFormModal,
  WsFlex,
  LlBtnFullFooter001
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

const ExitChecklistCreateStep = props => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const { width, height } = Dimensions.get('window')

  // Redux
  const factoryId = useSelector(state => state.data.currentFactory.id)

  // Props
  const {
    page,
    contractorEnter,
    onChange
  } = props

  // States
  const [enterScore, setEnterScore] = React.useState(contractorEnter.enter_score)
  const [exitCheckItem, setExitCheckItem] = React.useState(contractorEnter.exit_check_item_score)
  const [finalCheckScore, setFinalCheckScore] = React.useState(contractorEnter.final_check_score)

  const [stateModal, setStateModal] = React.useState(false)
  const [stateModal002, setStateModal002] = React.useState(false)

  const [pageTwoValue, setPageTwoValue] = React.useState(
    {
      exit_check_item_attaches: contractorEnter.exit_check_item_attaches,
      remark: contractorEnter.exit_check_item_remark
    }
  )
  const [pageThreeValue, setPageThreeValue] = React.useState(
    {
      final_check_attaches: contractorEnter.final_check_attaches,
      remark: contractorEnter.final_check_remark
    }
  )

  const [attaches, setAttaches] = React.useState(
    page == 1 ? contractorEnter.enter_attaches :
      page == 2 ? contractorEnter.exit_check_item_attaches :
        page == 3 ? contractorEnter.final_check_attaches : null)

  const [stepRemark, setStepRemark] = React.useState(
    page == 1 ? contractorEnter.enter_remark :
      page == 2 ? contractorEnter.exit_check_item_remark :
        page == 3 ? contractorEnter.final_check_remark : null
  )

  const [hadEnter, setHadEnter] = React.useState(contractorEnter.enter_score ? true : false)

  const [itemsToggleBtn] = React.useState([
    { label: i18next.t('有'), value: '36' },
    { label: i18next.t('無'), value: '37' }
  ])
  const [exitItemsToggleBtn] = React.useState([
    { label: i18next.t('已復歸'), value: '46' },
    { label: i18next.t('尚未復歸'), value: '47' }
  ])
  const [finalCheckToggleBtn] = React.useState([
    { label: i18next.t('是'), value: '56' },
    { label: i18next.t('否'), value: '57' }
  ])
  const [enterModalFields] = React.useState({
    enter_attaches: {
      type: 'Ll_filesAndImages',
      label: t('附件'),
      modelName: 'exit_checklist',
      testID: 'Ll_filesAndImages'
      // uploadUrl: `factory/${factoryId}/exit_checklist/enter_attach`
    },
  })
  const [exitModalFields] = React.useState({
    remark: {
      type: 'text',
      multiline: true,
      label: t('復歸檢查說明'),
      placeholder: t('請輸入復歸檢查說明'),
      testID: '復歸檢查說明',
    },
    exit_check_item_attaches: {
      type: 'Ll_filesAndImages',
      label: t('現場復歸照片或相關資料'),
      modelName: 'exit_checklist',
      // uploadUrl: `factory/${factoryId}/exit_checklist/exit_check_item_attach`
    }
  })
  const [finalCheckModalFields] = React.useState({
    remark: {
      type: 'text',
      multiline: true,
      label: t('現場復歸備註'),
      placeholder: t('請輸入現場復歸照片或相關資料'),
      testID: '現場復歸備註'
    },
    final_check_attaches: {
      type: 'Ll_filesAndImages',
      label: t('現場復歸照片或相關資料'),
      modelName: 'exit_checklist',
      // uploadUrl: `factory/${factoryId}/exit_checklist/final_check_attach`
    },
  })

  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
        }}
      >
        <WsFlex justifyContent="center" />
        {page == 1 && (
          <>
            <WsPaddingContainer
              style={{
                flex: 1
              }}>
              <WsText
                size={18}
                style={{
                  marginVertical: 16
                }}>
                {t('本日有無進場')}
              </WsText>
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
                value={enterScore}
                onChange={$event => {
                  // console.log($event,'$event--');
                  onChange($event, 'enter_score', contractorEnter)
                  setEnterScore($event)
                  if ($event.value == 36) {
                    setHadEnter(true)
                  } else {
                    setHadEnter(false)
                  }
                }}
              />
            </WsPaddingContainer>
            <LlBtnFullFooter001
              testID={hadEnter ? t('附件') : t('備註')}
              required={hadEnter ? false : true}
              text={hadEnter ? t('附件') : t('備註')}
              icon={hadEnter ? 'ws-outline-attachment' : 'ws-outline-edit-pencil'}
              onPress={() => {
                setStateModal(true)
              }}
            />
          </>
        )}
        {page == 2 && (
          <>
            <WsPaddingContainer
              style={{
                flex: 1
              }}>
              <>
                <WsText size={18}>{t('復歸事項')}</WsText>
                {contractorEnter &&
                  contractorEnter.exit_check_item && (
                    <WsText
                      size={18}
                      style={{
                        marginVertical: 24
                      }}>
                      {contractorEnter.exit_check_item}
                    </WsText>
                  )
                }
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
                  items={exitItemsToggleBtn}
                  value={exitCheckItem}
                  onChange={$event => {
                    setExitCheckItem($event)
                    onChange($event, 'exit_check_item_score', contractorEnter)
                  }}
                />
              </>
            </WsPaddingContainer>
            <LlBtnFullFooter001
              testID={'復歸檢查說明'}
              required={false}
              text={t('復歸檢查說明')}
              icon={'ws-outline-edit-pencil'}
              onPress={() => {
                setStateModal002(true)
              }}
            />
          </>
        )}
        {page == 3 && (
          <>
            <WsPaddingContainer
              style={{
                flex: 1
              }}>
              <>
                <WsText
                  style={{
                    marginBottom: 40
                  }}
                  size={18}>
                  {t('今日全部收工且復歸')}
                </WsText>
                <WsState
                  stateStyle={{
                    height: 64,
                    borderWidth: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.1)',
                    shadowOpacity: 0.7,
                    shadowOffset: {
                      width: 4,
                      height: 4
                    },
                    textColor: $color.black
                  }}
                  type="toggleBtn"
                  items={finalCheckToggleBtn}
                  value={finalCheckScore}
                  onChange={$event => {
                    setFinalCheckScore($event)
                    onChange($event, 'final_check_score', contractorEnter)
                  }}
                />
              </>
            </WsPaddingContainer>
            <LlBtnFullFooter001
              testID={t('備註')}
              required={false}
              text={t('備註')}
              icon={'ws-outline-edit-pencil'}
              onPress={() => {
                setStateModal002(true)
              }}
            />
          </>
        )}
        <WsStateFormModal
          fields={page == 2 ? exitModalFields : page == 3 ? finalCheckModalFields : enterModalFields}
          visible={stateModal002}
          initValue={page == 2 ? pageTwoValue : page == 3 ? pageThreeValue : null}
          onClose={() => {
            setStateModal002(false)
          }}
          onSubmit={$event => {
            if (page == 2) {
              setPageTwoValue($event)
              if ($event) {
                onChange($event.remark, 'exit_check_item_remark', contractorEnter)
                onChange($event.exit_check_item_attaches, 'exit_check_item_attaches', contractorEnter)
              }
            }
            if (page == 3) {
              setPageThreeValue($event)
              if ($event) {
                onChange($event.remark, 'final_check_remark', contractorEnter)
                onChange($event.final_check_attaches, 'final_check_attaches', contractorEnter)
              }
            }
            setStateModal002(false)
          }}
        />
        <WsModal
          title={hadEnter ? i18next.t('附件') : i18next.t('備註')}
          visible={stateModal}
          onBackButtonPress={() => {
            setStateModal(false)
          }}
          headerLeftOnPress={() => {
            setStateModal(false)
          }}
          headerRightOnPress={() => { }}
          animationType="slide"
          footerBtnRightText={i18next.t('送出')}
          footerBtnRightOnPress={() => {
            setStateModal(false)
          }}
          footerBtnLeftText={i18next.t('取消')}
          footerBtnLeftOnPress={() => {
            setStateModal(false)
          }}>
          <KeyboardAvoidingView
            style={{
              flex: 1,
            }}
            behavior={Platform.OS === 'ios' ? 'padding' : null}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View
                style={{
                  height: height
                }}
              >
                <WsState
                  testID={hadEnter ? 'Ll_filesAndImages' : '備註'}
                  style={{
                    padding: 16,
                  }}
                  placeholder={t('輸入')}
                  label={!hadEnter && t('備註')}
                  multiline={!hadEnter && true}
                  rules={!hadEnter && 'required'}
                  type={hadEnter ? 'Ll_filesAndImages' : 'text'}
                  value={hadEnter ? attaches : stepRemark}

                  onChange={$event => {
                    if (hadEnter) {
                      if (page == 1) {
                        contractorEnter.enter_attaches = $event
                        onChange($event, 'enter_attaches', contractorEnter)
                        setAttaches($event)
                      }
                    } else {
                      if (page == 1) {
                        onChange(stepRemark, 'enter_remark', contractorEnter)
                        setStepRemark($event)
                      }
                    }
                  }}
                  uploadUrl={
                    page == 1 ? `factory/${factoryId}/exit_checklist/enter_attach` :
                      page == 2 ? `factory/${factoryId}/exit_checklist/exit_check_item_attach` :
                        page == 3 ? `factory/${factoryId}/exit_checklist/final_check_attach` : null}
                />
              </View>

            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </WsModal>

      </SafeAreaView>
    </>
  )
}

export default ExitChecklistCreateStep
