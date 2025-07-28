import React from 'react'
import {
  ScrollView,
  Pressable,
  TouchableOpacity,
  View,
  Text,
  FlatList
} from 'react-native'
import {
  WsTabView,
  WsPaddingContainer,
  WsFlex,
  WsText,
  WsIcon,
  WsBtn,
  WsDes,
  WsTag,
  WsCard,
  WsSkeleton,
  LlContractorEnterCard001,
  WsEmpty,
  WsDialog,
  WsInfiniteScroll,
  LlContractorEnterCard002
} from '@/components'
import i18next from 'i18next'
import S_ContractorEnterRecord from '@/services/api/v1/contractor_enter_record'
import $color from '@/__reactnative_stone/global/color'
import layouts from '@/__reactnative_stone/global/layout'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import config from '@/__config'
import { useNavigation } from '@react-navigation/native'

const ContractorEnterList = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const {
    type,
    tabNum
  } = props

  // States
  const [popUpVisible, setPopUpVisible] = React.useState(false)
  const dialogButton = [
    {
      label: i18next.t('知道了'),
      onPress: () => {
        setPopUpVisible(false)
      }
    }
  ]
  const [contractorEnter, setContractorEnter] = React.useState()
  const [params, setParams] = React.useState({})

  return (
    <>
      <WsDialog
        dialogVisible={popUpVisible}
        setDialogVisible={setPopUpVisible}
        title={i18next.t('請使用網頁版查看詳細內容')}
        dialogButtonItems={dialogButton}
      />
      <WsInfiniteScroll
        service={S_ContractorEnterRecord}
        serviceIndexKey={type == 1 ? 'getNonReturnCurrentIndex' : 'getNonReturnYesterdayIndex'}
        params={params}
        hasMeta={false}
        getAll={true}
        renderItem={({ item, index }) => {
          return (
            <>
              <LlContractorEnterCard002
                style={[
                  index != 0
                    ? {
                      marginTop: 8
                    }
                    : null
                ]}
                type={type}
                item={item}
                onPress={() => {
                  navigation.push('ContractorEnterShow', {
                    id: item.id
                  })
                }}
              />
            </>
          )
        }}
      />
    </>
  )
}

export default ContractorEnterList
