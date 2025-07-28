import React, { useState } from 'react'
import {
  ScrollView,
  View,
  Dimensions,
  TouchableOpacity
} from 'react-native'
import {
  WsFlex,
  LlBtn002,
  LlEventCard001,
  WsPage,
  LlEventHeaderNumCard,
  WsGrid,
  WsPageIndex,
  WsText,
  WsDes,
  WsCard,
  LlFileFolderCard,
  WsIconBtn
} from '@/components'
import S_EventType from '@/services/api/v1/event_type'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import moment from 'moment'
import $color from '@/__reactnative_stone/global/color'

const FileStoreTab3 = () => {
  const { t } = useTranslation()
  const navigation = useNavigation()

  // Redux
  const factory = useSelector(state => state.data.currentFactory)
  const currentUser = useSelector(state => state.data.currentUser)

  const [params, setParams] = React.useState({
    lang: 'tw',
    order_by: 'created_at',
    order_way: 'desc',
  })
  const [filterFields] = React.useState({
    search_type: {
      type: 'picker',
      label: t('搜尋種類'),
      placeholder: '選擇搜尋種類',
      items:
        [
          {
            label: i18next.t('資料夾名稱'),
            value: 'file_folder'
          },
          {
            label: i18next.t('檔案標題'),
            value: 'file'
          },
        ]
    },
    search: {
      type: 'search',
      label: t('搜尋'),
    },
    created_user: {
      type: 'belongstomany',
      label: t('上傳者'),
      nameKey: 'name',
      modelName: 'user',
      serviceIndexKey: 'simplifyFactoryIndex',
      customizedNameKey: 'userAndEmail',
      rules: 'required'
    },
    button: {
      type: 'date_range',
      label: t('更新日期'),
      time_field: 'updated_at'
    },
    order: {
      type: 'picker',
      label: t('排序'),
      items:
        [
          {
            label: i18next.t('依建立日期由近至遠'),
            value: {
              order_way: 'desc',
              order_by: 'created_at'
            }
          },
          {
            label: i18next.t('依更新時間由近至遠'),
            value: {
              order_way: 'desc',
              order_by: 'updated_at'
            }
          },

        ]
    }
  })

  // Option
  const $_setNavigationOption = () => {
    navigation.setOptions({
      headerRight: () => {
        return (
          <>
          </>
        )
      },
      headerLeft: () => {
        return (
          <WsIconBtn
            testID={'backButton'}
            name="ws-outline-arrow-left"
            color="white"
            size={24}
            style={{
              marginRight: 4
            }}
            onPress={() => {
              navigation.goBack()
            }}
          />
        )
      }
    })
  }

  React.useEffect(() => {
    $_setNavigationOption()
  }, [])


  return (
    <>
      <WsPageIndex
        modelName={'file_folder'}
        serviceIndexKey={'indexFromShare'}
        params={params}
        filterFields={filterFields}
        defaultFilterValue={
          {
            search_type: 'file',
            order: {
              order_way: 'desc',
              order_by: 'created_at'
            }
          }
        }
        searchVisible={false}
        renderItem={({ item, index, isLastItem }) => {
          return (
            <LlFileFolderCard
              testID={`LlFileFolderCard-${index}`}
              item={item}
              moreBtnVisible={false}
              tab={'tab3'}
            ></LlFileFolderCard>
          )
        }}
      >
      </WsPageIndex>
    </>
  )
}

export default FileStoreTab3