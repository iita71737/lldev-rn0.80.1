import React from 'react'
import {
  Alert,
  Dimensions
} from 'react-native'
import {
  WsDialog,
  WsDes,
  WsText,
} from '@/components'
import Services from '@/services/api/v1/index'
import { useNavigation } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import store from '@/store'
import {
  setOfflineMsg,
  setRefreshCounter
} from '@/store/data'
import { useSelector } from 'react-redux'

const WsDialogDelete = props => {
  // i18n
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const { width, height } = Dimensions.get('window')

  // Props
  const {
    id,
    to,
    toTabIndex,
    modelName,
    title,
    text,
    des,
    contentHeight = des ? 138 : 208,
    visible = false,
    setVisible,
    mode = 2,
  } = props

  // REDUX
  const currentRefreshCounter = useSelector(state => state.data.refreshCounter)

  //Services
  const $_delServices = async () => {
    try {
      await Services[modelName].delete({ modelId: id })
      Alert.alert(t('已成功刪除'))
      if (to && toTabIndex) {
        navigation.reset({
          index: 0,
          routes: [{
            name: to,
            params: {
              _tabIndex: toTabIndex
            }
          }],
        });
      }
      else if (to) {
        navigation.reset({
          index: 0,
          routes: [{ name: to }],
        });
      }
      store.dispatch(setRefreshCounter(currentRefreshCounter + 1))
    } catch (e) {
      console.error(e);
    }
  }

  const dialogButtonItems = [
    {
      color: $color.gray,
      label: t('取消'),
      onPress: () => {
        setVisible(false)
      }
    },
    {
      label: t('確定'),
      color: $color.danger,
      backgroundColor: $color.danger11l,
      borderColor: $color.danger,
      onPress: async () => {
        await $_delServices()
        setVisible(false)
      }
    }
  ]

  // Render
  return (
    <>
      <WsDialog
        mode={mode}
        contentWidth={width * 0.8}
        title={title}
        dialogButtonItems={dialogButtonItems}
        dialogVisible={visible}
        setDialogVisible={() => {
          setVisible(false)
        }}
        contentHeight={contentHeight}
      >
        {text &&
          <WsText size={18}>{text}</WsText>
        }
        {des && (
          <WsText size={14} style={{ marginTop: 8 }}>{des}</WsText>
        )}
      </WsDialog>
    </>
  )
}

export default WsDialogDelete
