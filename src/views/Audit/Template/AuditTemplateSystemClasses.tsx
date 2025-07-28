import React, { useState, useEffect } from 'react'
import { View, FlatList } from 'react-native'
import {
  WsFilter,
  WsText,
  WsTag,
  WsPageIndex,
  LlAuditListCard005
} from '@/components'
import i18next from 'i18next'
import { useNavigation } from '@react-navigation/native'
interface AuditTemplateSystemClassesProps {
}

const AuditTemplateSystemClasses: React.FC<AuditTemplateSystemClassesProps> = props => {
  const navigation = useNavigation<any>()

  // Props
  const {
  } = props

  //state
  const [params] = React.useState({
    order_by: 'updated_at',
    order_way: 'desc'
  })
  const [filterFields] = useState({
    system_subclasses: {
      type: 'system_subclass',
      label: i18next.t('領域')
    }
  })

  return (
    <>
      <WsPageIndex
        modelName={"audit_template"}
        params={params}
        filterFields={filterFields}
        renderItem={({ item, index }: { item: any; index: number; }) => {
          return (
            <>
              <LlAuditListCard005
                key={index}
                item={item}
                style={{
                  marginTop:16,
                  marginHorizontal:16,
                }}
                onPress={() => {
                  navigation.navigate({
                    name: 'AuditTemplateShow',
                    params: {
                      id: item.id,
                    }
                  })
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

export default AuditTemplateSystemClasses
