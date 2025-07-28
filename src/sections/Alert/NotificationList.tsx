import React from 'react'
import {
  ScrollView,
  Pressable,
  View,
  Dimensions,
  TouchableOpacity,
  Platform
} from 'react-native'
import {
  WsText,
  LlNotificationCard,
  WsDialog,
  WsIcon,
  WsPageIndex
} from '@/components'
import S_Notification from '@/services/api/v1/notification'
import { useNavigation } from '@react-navigation/native'
import i18next from 'i18next'
import $color from '@/__reactnative_stone/global/color'
import { useTranslation } from 'react-i18next'
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import RNPushNotification from 'react-native-push-notification';

const NotificationList = props => {
  const { t, i18n } = useTranslation()
  const navigation = useNavigation()

  const {
    defaultFilter
  } = props

  // STATE
  const [refreshCounter, setRefreshCounter] = React.useState(0);
  const [filterFields] = React.useState({
    type: {
      type: 'checkbox',
      label: t('項目'),
      selectAllVisible: false,
      cancelAllVisible: false,
      items:
        [
          { id: "AuditRequestAuditeeRecord,AuditRequestAuditorRecord,AuditRequestCreated,AuditRecordCreated,AuditRecordReviewCreated,AuditTemplateVersionCreated", name: t("稽核") },
          { id: "TaskCreated,SubTaskCreated,SubTaskDone,TaskUpdated,SubTaskUndoRemind,TaskUndoRemind,TaskUnCheckRemind", name: t("任務") },
          { id: "EventCreated,EventDeleted,EventUpdated", name: t("事件") },
          { id: "ChecklistAssigned,ChecklistRecordCreated,ChecklistUpdated,ChecklistDeleted,ChecklistTemplateVersionCreated, ChecklistSampleCreated,ChecklistScheduleCreatedNotify,ChecklistAssignmentNotify,ChecklistAssignmentUndoNotify", name: t("點檢") },
          {
            id: "LicenseRemindDateExpired,LicenseValidEndDateExpired,LicenseStatitoryExtensionExpired,LicenseCreated,LicenseUpdated,LicenseRenewed,LicenseTemplateVersionCreated",
            name: t("證照"),
          },
          {
            id: "ContractorEnterRecordRemindCreated,ContractorEnterRecordCreated,ContractorEnterRecordUpdated,ContractorEnterRecordDeleted,ContractorLicenseTemplateVersionCreated",
            name: t("承攬商"),
          },
          {
            id: "contractor_enter_record",
            name: t("進場"),
          },
          {
            id: "ChangeStopped,ChangeRestarted,ChangeCreated,ChangeRemindEvaluatorExpired,ChangeRemindOwnerExpired,ChangeUpdated,ChangeAssignmentUpdated,ChangeAssignmentRenew,ChangeStarted,ChangeAssignmentCreated,ChangeVersionCreated,ChangeCompleted,ChangeDeleted",
            name: t("變動"),
          },
          {
            id: "LlBroadcastCreated",
            name: t("ESGoal快報"),
          },
          {
            id: "AlertCreated",
            name: t("警示"),
          },
          {
            id: "InternalTrainingCreated,InternalTrainingUpdated,InternalTrainingRemind,InternalTrainingTemplateVersionCreated",
            name: t("教育訓練"),
          },
        ]
    },
    button: {
      type: 'date_range',
      label: i18next.t('發布日期'),
      time_field: 'created_at'
    },
  })

  // MEMO
  const params = React.useMemo(() => {
    return {
      order_by: 'created_at',
      order_way: 'desc',
      time_field: 'created_at'
    }
  }, [refreshCounter]);

  // SERVICE
  const $_ReadAllNotification = async () => {
    const res = await S_Notification.readAll()
    if (res) {
      setRefreshCounter(refreshCounter + 1)
    }
    if (Platform.OS === 'ios') {
      PushNotificationIOS.setApplicationIconBadgeNumber(0);
    } else {
      RNPushNotification.setApplicationIconBadgeNumber(0);
    }
  }

  return (
    <>
      <WsPageIndex
        modelName={'ll_notification'}
        serviceIndexKey={'index'}
        params={params}
        filterFields={filterFields}
        filterValue={defaultFilter}
        searchVisible={false}
        renderItem={({ item, index, isLastItem }) => {
          return (
            <>
              <LlNotificationCard
                testID={`LlNotificationCard-${index}`}
                style={{ marginTop: 8 }}
                notification={item}
                navigation={navigation}
              />
            </>
          )
        }}
        ListHeaderComponent={() => {
          return (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingLeft: 8,
                paddingTop: 8
              }}>
              <View></View>
              <TouchableOpacity
                testID={'全部標示為已讀'}
                style={{
                  padding: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                onPress={() => {
                  setRefreshCounter(refreshCounter + 1)
                  $_ReadAllNotification()
                }}
              >
                <WsIcon name={'bih-check'} size={24} style={{ marginRight: 4 }}></WsIcon>
                <WsText color={$color.primary}>{t('全部標示為已讀')}</WsText>
              </TouchableOpacity>
            </View>
          )
        }}
      >
      </WsPageIndex>
    </>
  )
}

export default React.memo(NotificationList)
