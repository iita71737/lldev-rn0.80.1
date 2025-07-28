import React from 'react'
import { Pressable, ScrollView, TextInput } from 'react-native'

import {
  WsPaddingContainer,
  WsText,
  WsTag,
  WsIconBtn,
  WsTabView,
  WsIconTitle,
  WsBtn,
  WsBottomSheet,
  WsToggleTabBar,
  WsFlex,
  WsStateInput,
  WsTitle,
} from '@/components'
import i18next from 'i18next';

import { useNavigation } from '@react-navigation/native'

import gColor from '@/__reactnative_stone/global/color'

const CheckListAssignmentStepTwo = () => {

  const navigation = useNavigation();


  const $_onHeaderRightPress = () => {
  }

  const $_onPassStandardPress = () => {
    navigation.navigate('CheckListAssignmentPassStandard')
  }

  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            <WsIconBtn
              name="ws-outline-arrow-right"
              color="white"
              size={24}
              style={{
                marginRight: 4
              }}
              onPress={() => {
                $_onHeaderRightPress()
              }}
            ></WsIconBtn>
          </>
        )
      },
    })
  }

  React.useEffect(() => {
    $_setNavigationOption()
  }, [])


  return (
    <>
      <WsText
        size={18}
        style={{
          marginHorizontal: 16,
        }}>
        廢水家藥添加槽，50%2檸檬酸加藥量(kg/Ton)
      </WsText>

      <WsFlex
        flexDirection='column'>
        <Pressable
          onPress={() => {
            $_onPassStandardPress()
          }}>
          <WsIconTitle
            icon='ws-outline-light'
            size="h5"
            fontWeight="500"
            color={gColor.primary}
          >
            {i18next.t('查看合規標準')}
          </WsIconTitle>
        </Pressable>
      </WsFlex>

      <WsPaddingContainer>
        <WsText
          size={14}
          style={{
            marginBottom: 8,
          }}
        >{i18next.t('觀測值')}</WsText>
        <WsStateInput
          valut=''
          placeholder={i18next.t('請輸入觀測值')}
          backgroundColor={gColor.primary11l}
        />
      </WsPaddingContainer>

    </>
  )
}

export default CheckListAssignmentStepTwo