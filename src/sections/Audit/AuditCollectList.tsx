import React, { useState, useEffect } from 'react'
import { View, FlatList, Alert } from 'react-native'
import {
  LlAuditListCard001,
  LlBtn002,
  WsPaddingContainer,
  WsFilter,
  WsInfiniteScroll,
  WsText,
  WsTag,
  WsPageIndex
} from '@/components'
import ServiceAudit from '@/services/api/v1/audit'
import { useNavigation } from '@react-navigation/native'
import i18next from 'i18next'
import { useSelector } from 'react-redux'
import $color from '@/__reactnative_stone/global/color'
import S_SystemClass from '@/__reactnative_stone/services/api/v1/system_class'
import AuditCollectListBySystemClasses from '@/sections/Audit/AuditCollectListBySystemClasses'
interface AuditCollectListProps {
  refreshCounter: string;
}

interface AuditCollectListItem {
  name: string;
  icon: string;
}

const AuditCollectList: React.FC<AuditCollectListProps> = props => {
  const navigation = useNavigation<any>()

  // Props
  const {
    refreshCounter = 1
  } = props

  //state
  const [params, setParams] = React.useState({
    order_by: 'created_at',
    order_way: 'desc'
  })
  const [filterFields] = useState({
    system_subclasses: {
      type: 'system_subclass',
      label: i18next.t('領域')
    }
  })

  const bookmarkOnPress = async (audit) => {
    try {
      if (audit.is_collect) {
        await ServiceAudit.removeMyCollect(audit.id)
          .then(
            () => {
              Alert.alert(t('取消收藏成功'))
              setParams({
                order_by: 'created_at',
                order_way: 'desc',
                refreshCounter: refreshCounter+1
              })
            })
      } else {
        await ServiceAudit.addMyCollect(audit.id)
          .then(() => {
            Alert.alert(t('加入收藏成功'))
            setParams({
              order_by: 'created_at',
              order_way: 'desc',
              refreshCounter: refreshCounter+1
            })
          })
      }
    } catch (error) {
      alert(error)
    }
  }

  return (
    <>
      <WsPageIndex
        modelName={"audit"}
        serviceIndexKey={"collect"}
        params={params}
        filterFields={filterFields}
        renderItem={({ item, index, __params }: { item: AuditCollectListItem, index: number, __params: any }) => {
          return (
            <>
              <LlAuditListCard001
                item={item}
                is_collect={item.is_collect}
                is_collect_visible={true}
                auditId={item.id}
                style={{ 
                  marginTop:16,
                  marginHorizontal:16,
                }}
                name={item.name}
                owner={item.owner}
                system_subclasses={item.system_subclasses}
                onPress={() => {
                  navigation.navigate({
                    name: 'AuditShow',
                    params: {
                      id: item.id,
                      versionId: item.last_version.id
                    }
                  })
                }}
                createOnPress={() => {
                  navigation.navigate({
                    name: 'AuditCreateRequest',
                    params: {
                      audit: item
                    }
                  })
                }}
                bookmarkOnPress={() => {
                  bookmarkOnPress(item)
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

export default AuditCollectList
