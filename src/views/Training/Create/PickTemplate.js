import React, { version } from 'react'
import { ScrollView } from 'react-native'
import {
  WsPaddingContainer,
  WsState,
  WsPickTemplateWithSystemClass,
  LlTemplatesCard001,
  WsModal
} from '@/components'
import S_TrainingTemplate from '@/services/api/v1/internal_training_template'
import AsyncStorage from '@react-native-community/async-storage'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import { useTranslation } from 'react-i18next'
import $color from '@/__reactnative_stone/global/color'
import { useNavigation } from '@react-navigation/native'
import { useSelector } from 'react-redux'

const TrainingTemplatesPicker = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // PROPS
  const {
    onPress,
    onPressOthers
  } = props

  // Redux
  const currentFactory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.stone_auth.currentUser)

  // States
  const [searchValue, setSearchValue] = React.useState('')
  const [subSystemClasses, setSubSystemClasses] = React.useState([])
  const [params, setParams] = React.useState({
    search: searchValue ? searchValue : undefined,
    lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw',
    get_all: 1
  })

  return (
    <>
      <ScrollView>
        <WsPaddingContainer>
          <WsState
            type="search"
            value={searchValue}
            onChange={setSearchValue}
            placeholder={t('搜尋')}
            style={{ marginBottom: 16 }}
          />
          <WsState
            placeholder={t('全部')}
            type="modelsSystemClass"
            style={{
              marginBottom: 16,
              backgroundColor: $color.white
            }}
            value={subSystemClasses}
            onChange={setSubSystemClasses}
          />
          <WsPickTemplateWithSystemClass
            modelName="internal_training_template"
            params={params}
            text={t('找不到想新增的種類嗎？')}
            onPressText={t('點此新增「其他」')}
            onPress={onPressOthers}
            keyExtractor={(item, index) => {
              item.id
            }}
            renderItem={(item, index, subClass) => {
              return (
                <>
                  <LlTemplatesCard001
                    key={index}
                    name={item.name}
                    onPress={() => {
                      AsyncStorage.removeItem('TrainingCreate')
                      onPress(item)
                    }}
                    style={[
                      index != 0
                        ? {
                          marginTop: 8
                        }
                        : null
                    ]}
                  />
                </>
              )
            }}
          />
        </WsPaddingContainer>
      </ScrollView>
    </>
  )
}

export default TrainingTemplatesPicker
