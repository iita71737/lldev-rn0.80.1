import React from 'react'
import {
  Pressable,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  View,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard
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
  WsDialog,
  WsFlex,
  WsStateInput,
  WsTitle,
  WsIcon,
  WsHtmlRender,
  WsInfo
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { useSelector } from 'react-redux'
import ViewArticleShowForModal from '@/views/AuditQuestion/AuditQuestionPassStandardForModal'

const AuditAssignmentStep = props => {
  const { width, height } = Dimensions.get('window')
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Props
  const {
    question,
    value = {},
    onChange
  } = props

  // Redux
  const factoryId = useSelector(state => state.data.currentFactory.id)

  // States
  const [stateModal, setStateModal] = React.useState(false)
  const [visible, setVisible] = React.useState(false)

  const [remark, setRemark] = React.useState(value.remark)
  const [remarkImages, setRemarkImages] = React.useState(value.images && value.images.length > 0 ? value.images : [])

  const [minorValueToggle, setMinorValueToggle] = React.useState('25')
  const [itemsToggleBtn, setItemToggleBtn] = React.useState([
    { label: i18next.t('合規'), value: '25' },
    { label: i18next.t('不合規'), value: 'bad' },
    { label: i18next.t('不適用'), value: '20' }
  ])
  const [minorToggleBtn] = React.useState([
    { label: t('Major(主要缺失)'), value: '23' },
    { label: t('Minor(次要缺失)'), value: '22' },
    { label: t('OFI(待改善)'), value: '21' }
  ])
  const [passStandardDialog, setPassStandardDialog] = React.useState(false)
  const [selectedMainIndex, setSelectedMainIndex] = React.useState(question.itemsToggleBtnSelected != undefined ? question.itemsToggleBtnSelected : undefined)

  // Functions
  const $_setItemToggleBtn = (value) => {
    setItemToggleBtn([
      { label: i18next.t('合規'), value: '25' },
      { label: i18next.t('不合規'), value: 'bad' },
      { label: i18next.t('不適用'), value: '20' }
    ])
    setVisible(false)
  }

  const $_onPassStandardPress = () => {
    setPassStandardDialog(true)
  }

  React.useEffect(() => {
    if (value.score == 21 || value.score == 22 || value.score == 23) {
      value.score = 'bad'
    }
  }, [value])

  return (
    <>
      <ScrollView
        style={{
          flex: 1,
          marginBottom: 100,
        }}
      >
        <WsPaddingContainer>
          <WsFlex
            justifyContent="center"
          >
            <WsText
              size={14}
              style={{
                marginVertical: 16
              }}>
              {question.chapterTitle}{' | '}
            </WsText>
            <WsText
              fontWeight={600}
              size={14}
              style={{
                marginVertical: 16
              }}>
              {question.sectionTitle}
            </WsText>
          </WsFlex>
          <WsText
            size={18}
            style={{
              marginVertical: 16
            }}>
            {question.title}
          </WsText>
          <WsFlex flexDirection="column">

            {question.versionId && (
              <TouchableOpacity
                style={{
                  marginTop: 40,
                  marginVertical: 16,
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row',
                  paddingRight: 12
                }}
                onPress={() => {
                  $_onPassStandardPress()
                }}>
                <WsIcon name={'ws-outline-light'} size={24} />
                <WsTitle fontSize={14} fontWeight="400" color={$color.primary}>
                  {t('查看查核提示')}
                </WsTitle>
              </TouchableOpacity>
            )}

          </WsFlex>
          <WsState
            stateStyle={{
              height: 64,
              borderWidth: 0,
              shadowColor: 'rgba(0, 0, 0, 0.3)',
              shadowOpacity: 0.7,
              shadowOffset: {
                width: 4,
                height: 4
              }
            }}
            type="toggleBtn"
            items={itemsToggleBtn}
            value={selectedMainIndex != null ? itemsToggleBtn[selectedMainIndex] : value.score}
            onChange={($event, index) => {
              setSelectedMainIndex(index)
              if (!$event) {
                return
              }
              if ($event.value == 'bad') {
                setMinorValueToggle(question.score ? question.score : $event)
                setVisible(true)
              } else {
                setMinorValueToggle(value)
                onChange($event, 'score')
              }
            }}
          />
        </WsPaddingContainer>
        {(!value?.score || (value?.score?.value != 25 && !remark)) && (
          <>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
                marginHorizontal: 16
              }}>
              <WsIcon
                name={'ws-outline-warning'}
                size={16}
                color={$color.danger}
              />
              <WsText
                style={{
                  marginLeft: 8
                }}
                color={$color.danger}>
                {t('請填寫備註')}
              </WsText>
            </View>
          </>
        )}
        {remark ? (
          <WsInfo
            style={{
              padding: 16
            }}
            label={t('備註')}
            value={remark ? remark : t('無')}
          />
        ) : (
          <WsText
            style={{
              padding: 16
            }}
            color={$color.gray}>
            {`${t('尚無備註')}`}
          </WsText>
        )}
        {remarkImages && remarkImages.length > 0 && (
          <WsInfo
            style={{
              padding: 16
            }}
            label={t('附件')}
            type="files"
            value={remarkImages}
          />
        )}
      </ScrollView>
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 0,
          height: 60,
          width: width,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgb(219,230,238)',
          flexDirection: 'row'
        }}
        minHeight={64}
        color={$color.gray}
        borderRadius={0}
        onPress={() => {
          setStateModal(true)
        }}>
        <WsIcon color={$color.black} name="ws-outline-edit-pencil" size={30}>
          {' '}
        </WsIcon>
        <WsText
          style={{
            marginLeft: 8
          }}
          letterSpacing={1}
          fontWeight="300">
          {t('輸入備註')}
        </WsText>
      </TouchableOpacity>
      <WsDialog
        contentHeight={{ flex: 1 }}
        contentWidth={{ flex: 1 }}
        dialogVisible={visible}
        setDialogVisible={() => {
          setVisible(false)
        }}
        paddingLeft={0}>
        <WsState
          stateStyle={{
            backgroundColor: 'rgba(242, 248, 253, 1)',
            height: 64,
            width: 295,
            borderWidth: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowOpacity: 0.7,
            shadowOffset: {
              width: 4,
              height: 4
            }
          }}
          type="toggleBtn"
          items={minorToggleBtn}
          value={minorValueToggle}
          onChange={($event, index) => {
            if ($event) {
              setStateModal(false)
              setMinorValueToggle($event)
              onChange($event, 'bad')
              $_setItemToggleBtn($event, index)
              if (!remark) {
                setTimeout(() => {
                  setStateModal(true)
                }, 1000)
              }
            }
          }}
        />
      </WsDialog>

      {question.versionId && (
        <WsDialog
          contentHeight={500}
          title={
            <>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  paddingRight: 14,
                }}>
                <WsTitle fontSize={24} fontWeight="700" color={$color.black}>
                  <WsIcon
                    color={$color.black}
                    name={'ws-outline-light'}
                    size={28}
                  />
                  {t('查核提示')}
                </WsTitle>
              </View>
            </>
          }
          dialogVisible={passStandardDialog}
          setDialogVisible={() => {
            setPassStandardDialog(false)
          }}
          paddingLeft={0}
        >
          <View
            style={{
              marginTop: 16
            }}
          >
            <ViewArticleShowForModal versionId={question.versionId} />
          </View>
        </WsDialog>
      )}

      <WsModal
        title={t('輸入備註')}
        visible={stateModal}
        onBackButtonPress={() => {
          setStateModal(false)
        }}
        headerLeftOnPress={() => {
          setStateModal(false)
        }}
        headerRightOnPress={() => {
          onChange({ remark: remark }, 'remark')
          if (remark && remarkImages) {
            onChange({ remark: remark, images: remarkImages }, 'remark')
          }
          setStateModal(false)
        }}
        animationType="slide"
        footerBtnRightText={t('儲存')}
        footerBtnRightOnPress={() => {
          onChange({ remark: remark }, 'remark')
          if (remark && remarkImages) {
            onChange({ remark: remark, images: remarkImages }, 'remark')
          }
          setStateModal(false)
        }}
        footerBtnLeftText={t('取消')}
        footerBtnLeftOnPress={() => {
          setStateModal(false)
        }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={{
                marginTop: 16
              }}
            >
              <WsState
                testID={'備註'}
                label={t('備註')}
                labelIcon={'ws-outline-edit-pencil'}
                autoFocus={true}
                multiline={true}
                style={{
                  marginHorizontal: 16
                }}
                placeholder={t('請寫下檢查當場處理情況、以及填報當場未能解決之問題。')}
                value={remark}
                onChange={setRemark}
              />
              <WsState
                style={{
                  marginVertical: 16,
                  padding: 16
                }}
                type="Ll_filesAndImages"
                label={t('圖片')}
                labelIcon={'md-photo'}
                value={remarkImages}
                onChange={setRemarkImages}
                modelName="checklist_record_answer"
                uploadUrl={`factory/${factoryId}/audit_record_answer/image`}
              />
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </WsModal>
    </>
  )
}

export default AuditAssignmentStep
