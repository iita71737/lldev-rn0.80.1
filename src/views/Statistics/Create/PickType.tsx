import React from 'react'
import {
  View,
  TouchableOpacity
} from 'react-native'
import {
  WsPaddingContainer,
  LlTemplatesCard001,
  WsSkeleton,
  WsModal,
  WsCard,
  WsFlex,
  WsText,
} from '@/components'
import S_LicenseType from '@/services/api/v1/license_type'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import AsyncStorage from '@react-native-community/async-storage'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import PickTemplate from '@/views/License/Create/PickTemplate'
import S_LicenseTemplateVersion from '@/services/api/v1/license_template_version'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import CheckLists from '@/views/Statistics/Create/CheckLists'

const LicensePickTypeTemplate = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const {
    title,
    setModalAddRecord
  } = props


  // STATES
  const [stateModal, setStateModal] = React.useState(false)

  return (
    <>
      <>
        <View
          style={{
            padding: 16
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setStateModal(true)
            }}
          >
            <WsCard
              style={[
                {
                  alignItems: 'flex-start',
                  // Android
                  elevation: 1,
                  // iOS
                  backgroundColor: 'white',
                  shadowColor: '#000000',
                  shadowOpacity: 0.1,
                  shadowRadius: 0.3,
                  shadowOffset: {
                    height: 1,
                    width: 0
                  }
                }
              ]}
            >
              <WsFlex>
                <WsText letterSpacing={1}>
                  {t('點檢表')}
                </WsText>
              </WsFlex>
            </WsCard>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 12 }}
            onPress={() => { }}
          >
            <WsCard
              style={[
                {
                  alignItems: 'flex-start',
                  // Android
                  elevation: 1,
                  // iOS
                  backgroundColor: 'white',
                  shadowColor: '#000000',
                  shadowOpacity: 0.1,
                  shadowRadius: 0.3,
                  shadowOffset: {
                    height: 1,
                    width: 0
                  }
                }
              ]}
            >
              <WsFlex>
                <WsText letterSpacing={1}>
                  {t('數量統計')}
                </WsText>
              </WsFlex>
            </WsCard>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ marginTop: 12 }}
            onPress={() => { }}
          >
            <WsCard
              style={[
                {
                  alignItems: 'flex-start',
                  // Android
                  elevation: 1,
                  // iOS
                  backgroundColor: 'white',
                  shadowColor: '#000000',
                  shadowOpacity: 0.1,
                  shadowRadius: 0.3,
                  shadowOffset: {
                    height: 1,
                    width: 0
                  }
                }
              ]}
            >
              <WsFlex>
                <WsText letterSpacing={1}>
                  {t('資料匯入')}
                </WsText>
              </WsFlex>
            </WsCard>
          </TouchableOpacity>
        </View>
      </>

      <WsModal
        animationType={'none'}
        visible={stateModal}
        onBackButtonPress={() => {
          setStateModal(false)
        }}
        headerLeftOnPress={() => {
          setStateModal(false)
        }}
        title={title}
      >
        <View
          style={{
            marginHorizontal: 16,
            marginBottom: 16
          }}
        >
          <CheckLists
            setModalAddRecord={setModalAddRecord}
            setStateModal={setStateModal}
          ></CheckLists>
        </View>
      </WsModal >
    </>
  )
}
export default LicensePickTypeTemplate
