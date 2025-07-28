import React from 'react'
import { View, ScrollView, Dimensions } from 'react-native'
import { WsState, WsBtn, WsCardForSort, WsText } from '@/components'
import AsyncStorage from '@react-native-community/async-storage'
import S_CheckListQuestion from '@/services/api/v1/checklist_question'
import S_CheckList from '@/services/api/v1/checklist'
import S_CheckListVersion from '@/services/api/v1/checklist_version'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import store from '@/store'
import {
  setCurrentCheckListCreateData,
  setCurrentCheckListForEdit
} from '@/store/data'

const ChecklistSortedQuestion = ({ navigation, route }) => {
  const { t, i18n } = useTranslation()
  const screenWidth = Math.round(Dimensions.get('window').width)

  // Params
  const { modelName, name, modelId, updateVersion } = route.params

  // Redux
  const currentChecklistForEdit = useSelector(
    state => state.data.currentCheckListForEdit
  )
  const currentCheckListCreateData = useSelector(
    state => state.data.currentCheckListCreateData
  )
  const currentCheckListForUpdateVersion = useSelector(
    state => state.data.currentCheckListForUpdateVersion
  )

  // States
  const [value, setValue] = React.useState()
  const [isMounted, setIsMounted] = React.useState(false)
  const [items, setItems] = React.useState()

  // Storage
  const $_getStorage = async () => {
    if (modelName === 'checklist' && name === 'CheckListCreate') {
      setValue(currentCheckListCreateData)
      setItems(currentCheckListCreateData.selectedQuestions) //顯示挑選的題目
    }
    if (modelName === 'checklist' && name === 'CheckListUpdate') {
      setValue(currentChecklistForEdit)
      setItems(currentChecklistForEdit.selectedQuestions) //顯示挑選的題目
    }
    setIsMounted(true)
  }

  const $_setStorage = async () => {
    await AsyncStorage.setItem(name, JSON.stringify(value))
  }

  const $_storeSortToRedux = sortedQuestions => {
    if (modelName === 'checklist' && name === 'CheckListCreate') {
      store.dispatch(setCurrentCheckListCreateData(sortedQuestions))
    }
    if (modelName === 'checklist' && name === 'CheckListUpdate') {
      const _data = {
        ...currentChecklistForEdit,
        sortedQuestions: sortedQuestions.checklist_question_with_version
      }
      store.dispatch(setCurrentCheckListForEdit(_data))
    }
  }

  // Function
  const $_setNavigationOptions = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
            <WsBtn
              minHeight={40}
              isFullWidth={false}
              style={{
                marginRight: 16
              }}
              onPress={() => {
                $_onHeaderRightPress()
              }}>
              {t('下一步')}
            </WsBtn>
          </>
        )
      }
    })
  }

  const $_onHeaderRightPress = () => {
    navigation.navigate(`${name}Step4`)
  }

  React.useEffect(() => {
    $_getStorage()
    $_setNavigationOptions()
  }, [])

  React.useEffect(() => {
    if (value) {
      $_setStorage()
    }
  }, [value])

  React.useEffect(() => {
    if (updateVersion) {
      setItems(currentCheckListForUpdateVersion.selectedQuestions)
    }
  }, [updateVersion])

  return (
    <>
      {value && items && (
        <>
          <WsState
            value={items}
            onChange={$event => {
              setItems($event)
              let _value = { ...value }
              _value.checklist_question_with_version = $event
              setValue(_value)
              $_storeSortToRedux(_value)
            }}
            type="sort"
            keyExtractor={(item, index) => item.id}
            renderItem={(item, index) => {
              return (
                <View>
                  <WsCardForSort
                    index={index}
                    style={{
                      width: screenWidth
                    }}
                    title={
                      item.title
                        ? item.title
                        : item.last_version.title
                          ? item.last_version.title
                          : null
                    }
                    des={
                      item.type === 'template' ? t('建議題目') : t('自訂題目')
                    }
                  />
                </View>
              )
            }}
          />
        </>
      )}
    </>
  )
}

export default ChecklistSortedQuestion
