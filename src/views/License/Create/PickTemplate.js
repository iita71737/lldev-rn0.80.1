import React from 'react'
import { View, ScrollView, Pressable } from 'react-native'
import {
  LlTemplatesCard001,
  WsPaddingContainer,
  WsFilter,
  LlBtn002,
  WsText,
  WsFlex,
  WsFastImage,
  WsDes,
  WsPickTemplateWithSystemClass,
  WsState
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useSelector } from 'react-redux'
import S_LicenseTemplates from '@/services/api/v1/license_templates'
import S_LicenseTemplateVersion from '@/services/api/v1/license_template_version'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import AsyncStorage from '@react-native-community/async-storage'
import { useTranslation } from 'react-i18next'
import S_Processor from '@/services/app/processor'
import store from '@/store'
import { setCurrentCreateLicense } from '@/store/data'
import { useNavigation } from '@react-navigation/native'

const LicensePickTemplate = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  // Props
  const {
    type,
    onPress,
    onPressOthers,
  } = props

  // Redux
  const systemClasses = useSelector(state => state.data.systemClasses)
  const currentUser = useSelector(state => state.data.currentUser)

  // States
  const [searchValue, setSearchValue] = React.useState('')
  const [subSystemClasses, setSubSystemClasses] = React.useState([])
  const [modalVisible, setModalVisible] = React.useState(false)


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
            text={t('找不到想新增的種類嗎？')}
            onPressText={t('點此新增「其他」')}
            onPress={() => {
              onPressOthers()
            }}
            modelName="license_templates"
            parentId={type ? type.id : undefined}
            params={{
              license_type: type ? type?.id : undefined,
              system_subclasses: subSystemClasses ? subSystemClasses.map(_ => _.id).toString() : undefined
            }}
            keyExtractor={(item, index) => {
              item.id
            }}
            renderItem={(item, index) => {
              return (
                <>
                  <LlTemplatesCard001
                    key={index}
                    name={item.name}
                    style={[
                      index != 0
                        ? {
                          marginTop: 8
                        }
                        : null
                    ]}
                    onPress={() => {
                      onPress(item, item.system_subclasses, item.system_classes)
                    }}
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

export default LicensePickTemplate
