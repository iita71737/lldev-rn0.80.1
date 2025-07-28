import React, { useState, useEffect } from 'react'
import {
  View,
  FlatList,
  Alert
} from 'react-native'
import {
  LlAuditListCard001,
  LlBtn002,
  WsPaddingContainer,
  WsFilter,
  WsInfiniteScroll,
  WsText,
  WsSkeleton
} from '@/components'
import ServiceAudit from '@/services/api/v1/audit'
import { useNavigation } from '@react-navigation/native'
import i18next from 'i18next'
import { useSelector } from 'react-redux'

const AuditListBySystemClassesCard = props => {
  const navigation = useNavigation()

  // Props
  const {
    params
  } = props

  // STATE
  const [loading, setLoading] = React.useState(true)
  const [audits, setAudits] = React.useState()

  // SERVICES
  const $_AuditIndex = async () => {
    try {
      const resAudits = await ServiceAudit.index({ params: params })
      setAudits(resAudits.data)
      setLoading(false)
    } catch (e) {
      console.error(e);
    }
  }
  const bookmarkOnPress = async (audit) => {
    try {
      if (audit.is_collect) {
        await ServiceAudit.removeMyCollect(audit.id)
          .then(
            () => {
              Alert.alert(t('取消收藏成功'))
            })
      } else {
        await ServiceAudit.addMyCollect(audit.id)
          .then(() => {
            Alert.alert(t('加入收藏成功'))
          })
      }
    } catch (error) {
      alert(error)
    }
  }

  useEffect(() => {
    setLoading(true)
    $_AuditIndex()
  }, [params])

  return (
    <>
      <FlatList
        data={audits}
        renderItem={({ item, itemIndex }) => {
          return (
            <>
              <LlAuditListCard001
                is_collect={item.is_collect}
                is_collect_visible={true}
                item={item}

                auditId={item.id}
                style={{ marginBottom: 8 }}
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
        keyExtractor={(item, index) => index}
        ListEmptyComponent={!loading ? () => {
          return (
            <WsText style={{ marginLeft: 16 }}>{i18next.t('目前尚無資料')}</WsText>
          )
        } : () => {
          return (
            <WsSkeleton></WsSkeleton>
          )
        }}
      />
    </>
  )
}

export default AuditListBySystemClassesCard
