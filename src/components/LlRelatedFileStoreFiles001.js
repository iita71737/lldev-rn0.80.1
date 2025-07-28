import React from 'react'
import {
  StyleSheet,
  TouchableHighlight,
  View,
  Image,
  TouchableOpacity
} from 'react-native'
import {
  WsFlex,
  WsIcon,
  WsText,
  WsDes,
  WsCollapsible,
  WsInfiniteScroll,
  WsFilter,
  WsPaddingContainer,
  LlBtn002,
  LlContractorLicenseCard002,
  WsSkeleton,
  LlLicenseCard001,
  WsInfo,
  LlFileFolderCard002
} from '@/components'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import { useNavigation } from '@react-navigation/native'
import S_File from '@/services/api/v1/file'

const LlRelatedFileStoreFiles001 = (props) => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()
  const _stack = navigation.getState().routes

  const {
    articles,
    acts
  } = props

  const [params, setParams] = React.useState({
    articles: articles ? articles : undefined,
    acts: acts ? acts : undefined
  })

  return (
    <View
      style={{
      }}
    >
      <WsText fontWeight={'600'}>{t('查看相關檔案庫文件')}</WsText>
      <WsInfiniteScroll
        service={S_File}
        serviceIndexKey={'index'}
        params={params}
        renderItem={({ item, index }) => {
          return (
            <LlFileFolderCard002
              item={item}
            ></LlFileFolderCard002>
          )
        }}
        emptyTitle={t('找不到符合篩選條件的結果')}
        emptyText={t('請重新設定您的篩選條件')}
      />
    </View>
  )
}

export default LlRelatedFileStoreFiles001