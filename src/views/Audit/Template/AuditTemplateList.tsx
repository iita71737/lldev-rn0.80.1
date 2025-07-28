import React from 'react'
import {
  View,
  FlatList
} from 'react-native'
import {
  LlAuditListCard005,
  WsPageIndex,
  WsText,
  WsSkeleton
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import i18next from 'i18next'
import audit_template from '@/services/api/v1/audit_template'
interface AuditTemplateListProps {
  searchValue: string;
  params: any;
}

const AuditTemplateList: React.FC<AuditTemplateListProps> = props => {
  const navigation = useNavigation<any>()

  // Props
  const {
    params
  } = props

  const [loading, setLoading] = React.useState(true)
  const [auditTemplates, setAuditTemplates] = React.useState()


  const $_AuditTemplateIndex = async () => {
    try {
      const resAudits = await audit_template.index({ params: params })
      setAuditTemplates(resAudits.data)
      setLoading(false)
    } catch (e) {
      console.error(e);
    }
  }

  React.useEffect(() => {
    $_AuditTemplateIndex()
  }, [params])


  return (
    <>
      <FlatList
        keyExtractor={(item, index) => index}
        data={auditTemplates}
        renderItem={({ item, index }) => {
          return (
            <>
              <LlAuditListCard005
                key={index}
                item={item}
                style={{
                  marginHorizontal: 16,
                  marginBottom: 8
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

export default AuditTemplateList
