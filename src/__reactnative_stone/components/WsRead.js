import React from 'react'
import services from '@/services/api/v1/index'
import {
  WsPaddingContainer,
  WsInfoForm,
  WsIconBtn,
  WsBottomSheet,
  WsDialogDelete
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import $color from '@/__reactnative_stone/global/color'
import { useFocusEffect } from '@react-navigation/native'
import { useTranslation } from 'react-i18next'

const WsRead = props => {
  // i18n
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Props
  const {
    fields = {},
    id,
    modelName,
    onFetched,
    updatable = true,
    deletable = true,
    deleteText,
    editNavigate,
    editText = t('編輯'),
    children,
    style
  } = props

  // State
  const [model, setModel] = React.useState()
  const [isBottomSheetActive, setIsBottomSheetActive] = React.useState(false)
  const [dialogVisible, setDialogVisible] = React.useState(false)
  const [bottomSheetItems, setBottomSheetItems] = React.useState([
    {
      to: { name: editNavigate, params: { id: id } },
      icon: 'ws-outline-edit-pencil',
      label: editText
    },
    {
      onPress: () => {
        setDialogVisible(true)
      },
      icon: 'ws-outline-delete',
      label: t('刪除')
    }
  ])

  // Services
  const $_fetchModel = async () => {
    const res = await services[modelName].show({ modelId: id })
    setModel(res)
    onFetched(res)
  }

  // Function
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <WsIconBtn
            name="ws-outline-edit-pencil"
            color={$color.white}
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              setIsBottomSheetActive(true)
            }}
          />
        )
      }
    })
  }
  const $_setBottomSheetItems = () => {
    if (!deletable) {
      setBottomSheetItems([
        {
          to: { name: editNavigate, params: { id: id } },
          icon: 'ws-outline-edit-pencil',
          label: editText
        }
      ])
    } else if (!updatable) {
      setBottomSheetItems([
        {
          onPress: () => {
            setDialogVisible(true)
          },
          icon: 'ws-outline-delete',
          label: t('刪除')
        }
      ])
    }
  }
  const $_onBottomSheetItemPress = item => {
    if (item.to) {
      navigation.navigate(item.to)
    } else {
      item.onPress()
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      if (modelName) {
        setModel(null)
        $_fetchModel()
      }
    }, [id])
  )
  React.useEffect(() => {
    $_setBottomSheetItems()
    if (updatable || deletable) {
      $_setNavigationOption()
    }
  }, [updatable, deletable])

  // Render
  return (
    <>
      {model && (
        <>
          <WsPaddingContainer style={[style]}>
            <WsInfoForm fields={fields} value={model} />
          </WsPaddingContainer>
        </>
      )}
      {children}
      <WsBottomSheet
        isActive={isBottomSheetActive}
        onDismiss={() => {
          setIsBottomSheetActive(false)
        }}
        items={bottomSheetItems}
        snapPoints={[148, 100]}
        onItemPress={$_onBottomSheetItemPress}
      />
      <WsDialogDelete
        id={id}
        to={navigation.getState().routeNames[0]}
        modelName={modelName}
        visible={dialogVisible}
        text={deleteText}
        setVisible={setDialogVisible}
      />
    </>
  )
}

export default WsRead
