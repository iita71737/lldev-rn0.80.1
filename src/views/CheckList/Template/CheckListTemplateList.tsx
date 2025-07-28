import React, { useState } from 'react'
import {
  LlCheckListCard001,
  WsPageIndex
} from '@/components'
import { useNavigation } from '@react-navigation/native'
import i18next from 'i18next'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

interface CheckListTemplateListProps {
  frequency?: string;
  search?: string;
  defaultFilter?: any;
}

const CheckListTemplateList: React.FC<CheckListTemplateListProps> = (props) => {
  const navigation = useNavigation()
  const { t, i18n } = useTranslation()

  // Props
  const {
    frequency,
    search,
    defaultFilter,
  } = props

  // REDUX
  const currentUser = useSelector(state => state.data.currentUser)

  // State
  const [params] = useState({
    frequency: frequency ? frequency : undefined,
    order_by: 'created_at',
    order_way: 'desc',
    lang: currentUser?.locale?.code ? currentUser?.locale?.code : 'tw'
  })
  const [filterFields] = React.useState({
    system_subclasses: {
      type: 'system_subclass',
      label: i18next.t('領域')
    },
  })

  return (
    <>
      <WsPageIndex
        modelName={'checklist_template'}
        serviceIndexKey={'index'}
        params={params}
        extendParams={search}
        filterFields={filterFields}
        filterValue={defaultFilter}
        renderItem={({ item, index, isLastItem }) => {
          return (
            <>
              <LlCheckListCard001
                modelName={'checklist_template'}
                testID={`LlCheckListCard001-${index}`}
                key={item.id}
                item={item}
                style={[
                  index == 0
                    ? {
                      marginTop: 16
                    }
                    : {
                      marginTop: 8
                    }
                ]}
                name={item.name}
                id={item.id}
                is_collect={item.is_collect}
                tagIcon={item.tagIcon}
                tagText={item.tagText}
                frequency={
                  item.frequency === 'week'
                    ? t('每週')
                    : item.frequency === 'month'
                      ? t('每月')
                      : item.frequency === 'season'
                        ? t('每季')
                        : item.frequency === 'year'
                          ? t('每年')
                          : item.frequency === 'everyTime'
                            ? t('每次作業')
                            : item.frequency === 'day'
                              ? `${t('每日')}`
                              : ''
                }
                taker={
                  item.owner
                    ? item.owner
                    : item.taker
                      ? item.taker
                      : i18next.t('無')
                }
                system_subclasses={item.system_subclasses}
                factory_tags={item.factory_tags}
                onPress={() => {
                  navigation.push('CheckListTemplateShow', {
                    id: item.id
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

export default CheckListTemplateList
