import React from 'react'
import { NavigationScreenProp, NavigationRoute } from 'react-navigation'
import {
  LlActLibrarySystemClassCard001,
  LlSystemClassesList,
  WsPageIndex
} from '@/components'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import store from '@/store'
import {
  setIdleCounter
} from '@/store/data'
import { debounce } from 'lodash';
interface ActLibraryProps {
  navigation: NavigationScreenProp<NavigationRoute>;
  searchValue?: string;
  defaultFilter?: any;
}

const ActLibrary: React.FC<ActLibraryProps> = props => {
  const { t } = useTranslation()

  // Props
  const {
    defaultFilter
  } = props

  // REDUX
  const currentIdleCounter = useSelector(state => state.data.idleCounter)

  // Fields
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
    system_subclasses: {
      type: 'system_subclass',
      label: t('領域')
    },
    act_type: {
      type: 'checkbox',
      label: t('法規類別'),
      storeKey: "actTypes"
    },
    button: {
      type: 'date_range',
      label: t('異動日期'),
      time_field: 'announce_at'
    },
    factory_tags: {
      type: 'checkbox',
      label: t('標籤'),
      storeKey: "factoryTags",
      searchVisible: true,
      selectAllVisible: false,
      defaultSelected: false
    },
  })

  // DETECT IDLE
  const handleScroll = debounce((event) => {
    event.persist();
    store.dispatch(setIdleCounter(currentIdleCounter + 1))
  }, 1000);

  return (
    <>
      <WsPageIndex
        onScroll={handleScroll}
        mode={'system_classes'}
        filterFields={filterFields}
        defaultFilterValue={defaultFilter}
        renderItem={({ item, index, __params }) => {
          return (
            <LlActLibrarySystemClassCard001
              testID={`LlActLibrarySystemClassCard001-${index}`}
              key={index}
              item={item}
              params={__params}
            >
            </LlActLibrarySystemClassCard001>
          )
        }}
      >
      </WsPageIndex>
    </>
  )
}

export default ActLibrary
