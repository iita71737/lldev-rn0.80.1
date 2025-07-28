import React from 'react'
import {
  LlActCard001,
  WsSnackBar,
  WsPageIndex
} from '@/components'
import S_Act from '@/services/api/v1/act'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

interface ActListingProps {
  navigation: any;
  searchValue?: string;
  defaultFilter?: any;
}

const ActListing: React.FC<ActListingProps> = props => {
  const { t } = useTranslation()

  // Props
  const {
    navigation,
  } = props

  // Redux
  const currentUser = useSelector(state => state.data.currentUser)

  // States
  const [isSnackBarVisible, setIsSnackBarVisible] = React.useState(false)
  const [snackBarText, setSnackBarText] = React.useState(
    t('已儲存至「我的收藏」')
  )
  const [params] = React.useState({
    order_by: 'announce_at',
    order_way: 'desc',
    time_field: 'announce_at',
  })
  const [filterFields] = React.useState({
    act_type: {
      type: 'checkbox',
      label: t('法規類別'),
      storeKey: 'actTypes'
    },
    act_status: {
      type: 'checkbox',
      label: t('法規狀態'),
      storeKey: "actStatus"
    },
    button: {
      type: 'date_range',
      label: t('異動日期'),
      time_field: 'announce_at'
    },
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    },
    factory_tags: {
      type: 'checkbox',
      label: t('標籤'),
      storeKey: "factoryTags",
      searchVisible: true,
      selectAllVisible: false,
      cancelAllVisible: false,
      defaultSelected: false
    },
  })

  return (
    <>
      <WsSnackBar
        text={snackBarText}
        setVisible={setIsSnackBarVisible}
        visible={isSnackBarVisible}
        quickHidden={true}
      />
      <WsPageIndex
        modelName={'act'}
        serviceIndexKey={'index'}
        params={params}
        filterFields={filterFields}
        renderItem={({ item, index, isLastItem }) => {
          return (
            <>
              <LlActCard001
                testID={`LlActCard001-${index}`}
                tags={item.factory_tags}
                // item={item.last_version}
                item={item}
                key={item.id}
                is_collect_visible={true}
                is_collect={currentUser ? currentUser.act_ids.find((_id: number) => _id == item.id) : null}
                setSnackBarText={setSnackBarText}
                setIsSnackBarVisible={setIsSnackBarVisible}
                systemSubClasses={item.system_subclasses}
                title={item.last_version ? item.last_version.name : null}
                announce_at_visible={true}
                effect_at_visible={false}
                act_status={item.act_status}
                isChange={
                  item.last_version && item.last_version.announce_at ?
                    S_Act.getActUpdateDateBadge(item.last_version.announce_at) : null
                }
                onPress={() => {
                  navigation.push('RoutesAct', {
                    screen: 'ActShow',
                    params: {
                      id: item.id
                    }
                  })
                }}
                style={{
                  marginTop: 8,
                  marginHorizontal: 16
                }}
              />
            </>
          )
        }}
      >
      </WsPageIndex>
    </>
  )
}

export default ActListing
