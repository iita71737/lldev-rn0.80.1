import React from 'react'
import { Pressable, Dimensions, TouchableOpacity, TextInput } from 'react-native'
import {
  WsPaddingContainer,
  WsText,
  WsModal,
  WsIconTitle,
  WsBtn,
  WsState,
  WsDialog,
  WsFlex,
  WsIcon,
  LlChangeOtherCard,
  WsTag
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'

const ChangeCreateStep = props => {
  // i18n
  const { t, i18n } = useTranslation()
  const { width, height } = Dimensions.get('window')
  const navigation = useNavigation()

  // Props
  const { title, onChange, value = {}, currentPage, allStep, countersign } = props

  // States
  const [changeValue, setChangeValue] = React.useState()
  const [stateModal, setStateModal] = React.useState(false)
  const [remark, setRemark] = React.useState(value.remark)
  const [other, setOther] = React.useState()
  const fields = {
    name: {
      label: i18next.t('變因'),
      rules: 'required'
    },
    description: {
      label: i18next.t('敘述'),
      rules: 'required'
    },
    system_subclasses: {
      label: i18next.t('領域'),
      placeholder: i18next.t('選擇'),
      type: 'modelsSystemClass',
      rules: 'required'
    },
    risk: {
      label: i18next.t('評估項目')
    }
  }
  const [itemsToggleBtn] = React.useState([
    { label: i18next.t('涉及'), value: '11' },
    { label: i18next.t('不涉及'), value: '12' },
    { label: i18next.t('不確定'), value: '13' }
  ])

  // Functions
  const $_onPressRemark = countersign => {
    navigation.navigate({
      name: 'ChangeItemTemplateRemark',
      params: {
        remark: countersign.remark ? countersign.remark : i18next.t('無')
      }
    })
  }
  const $_setOtherChangeItems = () => {
    if (value.other) {
      setOther(value.other)
    }
  }

  React.useState(() => {
    if (value) {
      $_setOtherChangeItems()
    }
  }, [value])
  React.useState(() => {
    if (countersign) {
      onChange(countersign, 'countersign')
      onChange(countersign.last_version.system_subclasses, 'systemSubclasses')
    }
  }, [countersign])

  return (
    <>
      <WsPaddingContainer style={{}}>
        {countersign && (
          <>
            <WsText size={18}>{title}</WsText>
            <WsFlex flexDirection="column" style={{ marginTop: 16 }}>
              <TouchableOpacity
                onPress={() => {
                  $_onPressRemark(countersign)
                }}>
                <WsIconTitle
                  icon="ws-outline-light"
                  size="h5"
                  fontWeight="500"
                  color={$color.primary}>
                  {i18next.t('查看說明')}
                </WsIconTitle>
              </TouchableOpacity>
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
              value={changeValue}
              onChange={$event => {
                setChangeValue($event, 'score')
                onChange($event, 'factor_score')
                onChange(countersign, 'countersign')
                if ($event == 11) {
                  setRemark(countersign.description)
                }
                if ($event == 12) {
                  setRemark(t('不涉及此變因'))
                }
                if ($event == 13) {
                  setRemark(t('請評估人員協助判斷是否涉及此變因'))
                }
                if ($event != 12) {
                  onChange(
                    countersign.last_version.system_subclasses,
                    'systemSubclasses'
                  )
                }
              }}
            />
          </>
        )}
        {currentPage == allStep && (
          <>
            <WsText size={18}>{i18next.t('其他')}</WsText>
            <WsState
              type="models"
              fields={fields}
              value={other}
              renderCom={LlChangeOtherCard}
              onChange={$event => {
                setOther($event)
                onChange($event, 'other')
              }}
              text={i18next.t('新增其他變因')}
            />
          </>
        )}
      </WsPaddingContainer>
      {remark ? (
        <WsText
          style={{
            padding: 16
          }}>
          {remark}
        </WsText>
      ) : (
        <WsText
          style={{
            padding: 16
          }}
          color={$color.gray}>
          {`${t('尚無備註')}`}
        </WsText>
      )}
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
        {!remark ? (
          <WsTag
            size={12}
            fontWeight="700"
            textColor={$color.white}
            backgroundColor={$color.danger}
            style={{ borderRadius: 25, marginLeft: 8 }}>
            {t('必填')}
          </WsTag>
        ) : (
          <WsTag
            size={10}
            fontWeight="600"
            textColor={$color.white}
            backgroundColor={$color.black}
            paddingTop={2}
            paddingLeft={8}
            paddingRight={8}
            paddingBottom={2}
            style={{ borderRadius: 25, marginLeft: 8 }}>
            {t('1')}
          </WsTag>
        )}
      </TouchableOpacity>
      <WsModal
        title={i18next.t('輸入備註')}
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
          onChange(remark, 'remark')
          setStateModal(false)
        }}
        footerBtnLeftText={i18next.t('取消')}
        footerBtnLeftOnPress={() => {
          setStateModal(false)
        }}>
        <WsText
          color={$color.gray}
          style={{
            padding: 16
          }}>
          {t('請寫下涉及的變動初篩因素敘述內容')}
        </WsText>
        <TextInput
          autoFocus={true}
          style={{
            height: 40,
            marginHorizontal: 16
          }}
          placeholder="useless placeholder"
          onChangeText={setRemark}
          value={remark}
        />
      </WsModal>
    </>
  )
}

export default ChangeCreateStep
