import i18next from 'i18next';
import moment from 'moment'
import S_Notification from '@/services/api/v1/notification'
import store from '@/store'
import {
  setCurrentFactory,
} from '@/store/data';

export default {
  redirectFromMessage(message, navigation) {

    const data = message.data
    const type = data ? data.type : null

    // REDIRECT DETECT 除錯用
    console.log(data, 'redirectFromMessage data');

    switch (type) {
      case 'AlertCreated':
        navigation.push('RoutesAlert', {
          screen: 'AlertShow',
          params: {
            id: data.alert_id
          }
        })
        break
      case 'ActVersionCreated':
        navigation.push('RoutesAct', {
          screen: 'ActShow',
          params: {
            id: data.act_id,
          }
        })
        break

      case 'EventCreated':
        try {
          navigation.push('RoutesEvent', {
            screen: 'EventShow',
            params: {
              id: data.id
            }
          })
        } catch (error) {
          console.error(error);
        }
        break

      case 'EventUpdated':
        try {
          navigation.push('RoutesEvent', {
            screen: 'EventShow',
            params: {
              id: data.id
            }
          })
        } catch (error) {

        }
        break

      case 'ChecklistRecordCreated':
        navigation.push('RoutesCheckList', {
          // screen: 'CheckListReviewResultShow',
          screen: 'CheckListAssignmentShow',
          params: {
            id: data.id,
          }
        })
        break
      case 'TaskCreated':
        navigation.push('RoutesTask', {
          screen: 'TaskShow',
          params: {
            id: data.id,
          }
        })
        break
      case 'TaskUpdated':
        navigation.push('RoutesTask', {
          screen: 'TaskShow',
          params: {
            id: data.id
          }
        })
        break
      case 'TaskUnCheckRemind':
        navigation.push('RoutesTask', {
          screen: 'TaskShow',
          params: {
            id: data.id
          }
        })
        break
      case 'TaskUndoRemind':
        navigation.push('RoutesTask', {
          screen: 'TaskShow',
          params: {
            id: data.id
          }
        })
        break
      case 'SubTaskCreated':
        navigation.push('RoutesTask', {
          screen: 'TaskShow',
          params: {
            id: data.task_id
          }
        })
        break
      case 'SubTaskDone':
        try {
          navigation.push('RoutesTask', {
            screen: 'TaskShow',
            params: {
              id: data.task_id
            }
          })
        } catch (e) {
          console.error(e);
        }
        break
      case 'SubTaskUndoRemind':
        navigation.push('RoutesTask', {
          screen: 'TaskShow',
          params: {
            id: data.task_id
          }
        })
        break

      case 'LicenseUpdated':
        navigation.push('RoutesLicense', {
          screen: 'LicenseShow',
          params: {
            id: data.id
          }
        })
        break

      case 'LicenseExtensionDate':
        navigation.push('RoutesLicense', {
          screen: 'LicenseShow',
          params: {
            id: data.id
          }
        })
        break

      case 'LicenseValidStartDate':
        navigation.push('RoutesLicense', {
          screen: 'LicenseShow',
          params: {
            id: data.id
          }
        })
        break

      case 'LicenseRemindDate':
        navigation.push('RoutesLicense', {
          screen: 'LicenseShow',
          params: {
            id: data.id
          }
        })
        break

      case 'LicenseCreated':
        navigation.push('RoutesLicense', {
          screen: 'LicenseShow',
          params: {
            id: data.id
          }
        })
        break

      case 'LicenseRenewed':
        navigation.push('RoutesLicense', {
          screen: 'LicenseShow',
          params: {
            id: data.id
          }
        })
        break

      case 'ChecklistAssigned':
        try {
          navigation.push('RoutesCheckList', {
            screen: 'CheckListShow',
            params: {
              id: data.checklist_id
            }
          })
        } catch (error) {
        }
        break
      case 'ChecklistScheduleCreatedNotify':
        try {
          navigation.push('RoutesCheckList', {
            screen: 'GeneralScheduleSettingShow',
            params: {
              id: data.general_schedule_setting_id,
              checklistVersionId: data.checklist_version_id
            }
          })
        } catch (error) {
        }
        break
      case 'ChecklistUpdated':
        try {
          navigation.push('RoutesCheckList', {
            screen: 'CheckListShow',
            params: {
              id: data.checklist_id
            }
          })
        } catch (error) {
          console.error(error);
        }
        break

      case 'ChecklistAssignmentUndoNotify':
        try {
          navigation.push('RoutesCheckList', {
            screen: 'CheckListAssignmentIntroduction',
            params: {
              id: data.checklist_assignment_id
            }
          })
        } catch (error) {
          console.error(error);
        }
        break
      case 'ChecklistAssignmentNotify':
        try {
          navigation.push('RoutesCheckList', {
            screen: 'CheckListAssignmentIntroduction',
            params: {
              id: data.checklist_assignment_id
            }
          })
        } catch (error) {
          console.error(error);
        }
        break

      case 'ChecklistSampleCreated':
        try {
          navigation.push('RoutesCheckList', {
            screen: 'CheckListAssignmentShow',
            params: {
              id: data.checklist_record_id
            }
          })
        } catch (error) {
          console.error(error);
        }
        break

      case 'AuditRequestRecord':
        navigation.push('RoutesAudit', {
          screen: 'AuditAssignmentIntroduction',
          params: {
            requestId: data.id,
            // auditId: data.audit_id
          }
        })
        break
      case 'AuditRequestCreated':
        navigation.push('RoutesAudit', {
          screen: 'AuditeeQuestion',
          params: {
            requestId: data.id,
            auditId: data.audit_id
          }
        })
        break
      case 'AuditRecordReviewCreated':
        navigation.push('RoutesAudit', {
          screen: 'AuditRecordsShow',
          params: {
            requestId: data.id,
            auditId: data.audit_id
          }
        })
        break

      case 'AuditRequestAuditorRecord':
        navigation.push('RoutesAudit', {
          screen: 'AuditAssignmentIntroduction',
          params: {
            requestId: data.id,
            auditId: data.audit_id
          }
        })
        break

      case 'AuditRequestAuditeeRecord':
        navigation.push('RoutesAudit', {
          screen: 'AuditAssignmentIntroduction',
          params: {
            requestId: data.id,
            auditId: data.audit_id
          }
        })
        break

      case 'AuditTemplateVersionCreated':
        navigation.push('RoutesAudit', {
          screen: 'AuditTemplateShow',
          params: {
            id: data.template_id
          }
        })
        break

      case 'LicenseRemindDateExpired':
        navigation.push('RoutesLicense', {
          screen: 'LicenseShow',
          params: {
            id: data.id
          }
        })
        break

      case 'LicenseRetrainRemind ':
        navigation.push('RoutesLicense', {
          screen: 'LicenseShow',
          params: {
            id: data.id
          }
        })
        break

      case 'LicenseValidEndDateExpired':
        navigation.push('RoutesLicense', {
          screen: 'LicenseShow',
          params: {
            id: data.id
          }
        })
        break
      case 'LicenseStatitoryExtensionExpired':
        navigation.push('RoutesLicense', {
          screen: 'LicenseShow',
          params: {
            id: data.id
          }
        })
        break
      case 'ChangeStopped':
        navigation.push('RoutesLicense', {
          screen: 'LicenseShow',
          params: {
            id: data.id
          }
        })
        break
      case 'ChangeRestarted':
        navigation.push('RoutesChange', {
          screen: 'ChangeShow',
          params: {
            id: data.id
          }
        })
        break
      case 'ChangeCreated':
        navigation.push('RoutesChange', {
          screen: 'ChangeAssignmentIntroduction',
          params: {
            id: data.id
          }
        })
        break
      case 'ChangeRemindEvaluatorExpired':
        navigation.push('RoutesChange', {
          screen: 'ChangeAssignmentIntroduction',
          params: {
            id: data.id
          }
        })
        break
      case 'ChangeAssignmentCreated':
        navigation.push('RoutesChange', {
          screen: 'ChangeAssignmentIntroduction',
          params: {
            id: data.id
          }
        })
        break
      case 'ChangeRemindOwnerExpired':
        navigation.push('RoutesChange', {
          screen: 'ChangeShow',
          params: {
            id: data.id
          }
        })
        break
      case 'ChangeCompleted':
        navigation.push('RoutesChange', {
          screen: 'ChangeShow',
          params: {
            id: data.id
          }
        })
        break
      case 'InternalTrainingCreated':
        navigation.push('RoutesTraining', {
          screen: 'TrainingShow',
          params: {
            id: data.id
          }
        })
        break
      case 'InternalTrainingUpdated':
        navigation.push('RoutesTraining', {
          screen: 'TrainingShow',
          params: {
            id: data.training_id
          }
        })
        break
      case 'InternalTrainingRemind':
        navigation.push('RoutesTraining', {
          screen: 'TrainingShow',
          params: {
            id: data.id
          }
        })
        break
      case 'AuditRecordCreated':
        navigation.push('RoutesAudit', {
          screen: 'AuditRecordsShow',
          params: {
            id: data.id
          }
        })
        break
      case 'ContractorEnterRecordCreated':
        navigation.push('RoutesContractorEnter', {
          screen: 'ContractorEnterShow',
          params: {
            id: data.id,
          }
        })
        break
      case 'ContractorEnterRecordRemindCreated':
        navigation.push('RoutesContractorEnter', {
          screen: 'ContractorEnterShow',
          params: {
            id: data.id
          }
        })
        break

      case 'ContractorEnterRecordNotifyAtRemind':
        navigation.push('RoutesContractorEnter', {
          screen: 'ContractorEnterShow',
          params: {
            id: data.id,
          }
        })
        break

      case 'LlBroadcastCreated':
        navigation.push('RoutesApp', {
          screen: 'BroadCastShow',
          params: {
            id: data.id,
          }
        })
        break
      default:
        return
    }
  },
  setTitle(title) {
    return title
  },
  setContent(content) {
    return content
  },
  getNoticeTitle(notice) {
    if (!notice || !notice.data || !notice.data.type)
      return;
    if (notice.data.type === 'ActVersionCreated' || notice.data.type === 'LlCommentUpdated') {
      return `[${notice.data.factory_name || i18next.t('工廠名稱')}][${i18next.t('法令更新',)}] ${notice.data.act_name || i18next.t('法規名稱')}`;
    }
    else if (notice.data.type === 'EventCreated') {
      if (notice.data.notified_type === 'member') {
        return `[${i18next.t('發生事件')}]${notice.data.event_type_name || i18next.t('事件種類')}:${notice.data.event_name || i18next.t('事件主旨')}`;
      } else if (notice.data.notified_type === 'owner') {
        return `[${i18next.t('事件')}] ${notice.data.event_type_name || i18next.t('事件種類')}: ${i18next.t('您已被指定為本次風險事件的負責人')}: [${notice.data.event_name || i18next.t('事件主旨')}]`;
      } else {
        return `[${i18next.t('事件')}] ${i18next.t('一則通知')}`;
      }
    }
    else if (notice.data.type === 'EventDeleted') {
      return `[${i18next.t('事件')}] [${notice.data.delete_user_name || i18next.t('刪除者')}]${i18next.t('已刪除您建立的風險事件')}: [${notice.data.event_name || i18next.t('事件主旨')}]`;
    }
    else if (notice.data.type === 'EventUpdated') {
      if (notice.data.notified_type === 'creator') {
        return `[${i18next.t('事件')}] [${notice.data.updated_user_name || notice.data.editor_name || i18next.t('編輯者')}]${i18next.t('已編輯您建立的風險事件內容')}: [${notice.data.event_name || i18next.t('事件主旨')}]`;
      }
      else if (notice.data.notified_type === 'owner') {
        return `[${i18next.t('事件')}] [${notice.data.updated_user_name || notice.data.editor_name || i18next.t('編輯者')}]${i18next.t('已編輯您負責的風險事件內容')}: [${notice.data.event_name || i18next.t('事件主旨')}]`;
      }
    }
    else if (notice.data.type === 'ChecklistRecordCreated') {
      return `[${i18next.t('點檢')}] [${notice.data.checklist_name || i18next.t('填表人')}]${i18next.t('已提交[{name}]的點檢記錄,尚待您的覆核', { name: notice.data.checklist_name || i18next.t('點檢表'), })}`;
    }
    else if (notice.data.type === 'ChecklistUpdated') {
      if (notice.data.notified_type === 'creator') {
        return `[${i18next.t('點檢')}] [${notice.data.updated_user_name || i18next.t('編輯者')}]${i18next.t('已編輯您建立的點檢作業內容')}: [${notice.data.checklist_name || i18next.t('點檢表')}]`;
      }
      else if (notice.data.notified_type === 'checker') {
        return `[${i18next.t('點檢')}] [${notice.data.updated_user_name || i18next.t('編輯者')}]${i18next.t('已編輯您負責填表的點檢作業內容',)}: [${notice.data.checklist_name || i18next.t('點檢表')}]`;
      }
      else if (notice.data.notified_type === 'reviewer') {
        return `[${i18next.t('點檢')}] [${notice.data.updated_user_name || i18next.t('編輯者')}]${i18next.t('已編輯您負責覆核的點檢作業內容',)}: [${notice.data.checklist_name || i18next.t('點檢表')}]`;
      }
      else if (notice.data.notified_type === 'owner') {
        return `[${i18next.t('點檢')}] [${notice.data.updated_user_name || i18next.t('編輯者')}]${i18next.t('已編輯您負責管理的點檢表內容')}: [${notice.data.checklist_name || i18next.t('點檢表')}]`;
      }
      else {
        return `[${i18next.t('點檢')}]${i18next.t('一則通知')}`;
      }
    }
    else if (notice.data.type === 'ChecklistDeleted') {
      return `[${i18next.t('點檢')}] [${notice.data.delete_user_name || i18next.t('刪除者')}]已刪除點檢作業: [${notice.data.checklist_name || i18next.t('點檢表')}]`;
    }
    else if (notice.data.type === 'ChecklistAssigned') {
      if (notice.data.notified_type === 'checker') {
        return `[${i18next.t('點檢')}] ${i18next.t('您已被指定為一個點檢作業的填表人',)}: [${notice.data.checklist_name || i18next.t('點檢表')}]`;
      }
      else if (notice.data.notified_type === 'reviewer') {
        return `[${i18next.t('點檢')}] ${i18next.t('您已被指定為一個點檢作業的覆核人',)}: [${notice.data.checklist_name || i18next.t('點檢表')}]`;
      }
      else if (notice.data.notified_type === 'owner') {
        return `[${i18next.t('點檢')}] ${i18next.t('您已被指定為一個點檢表的管理者',)}: [${notice.data.checklist_name || i18next.t('點檢表')}]`;
      }
      else {
        return `[${i18next.t('點檢')}]${i18next.t('一則通知')}`;
      }
    }
    else if (notice.data.type === 'ChecklistTemplateVersionCreated') {
      return `[${i18next.t('更新點檢表公版')}]${i18next.t('已更新管理文件')}[${notice.data.checklist_name || i18next.t('點檢表名稱')}]${i18next.t('的預設公版',)}[${notice.data.template_name || i18next.t('點檢表公版名稱')}]${i18next.t('，點此查看更新後內容，請評估是否調整現有題目。')}`;
    }
    else if (notice.data.type === 'TaskCreated') {
      return `[${i18next.t('任務')}] ${i18next.t('您已被指定為一個任務的負責人',)}:[${notice.data.task_name || i18next.t('任務主旨')}]`;
    }
    else if (notice.data.type === 'TaskUpdated') {
      if (notice.data.notified_type === 'creator') {
        return `[${i18next.t('任務')}] [${notice.data.editor_name || i18next.t('編輯者')}]已編輯您建立的任務內容: [${notice.data.task_name || i18next.t('任務主旨')})]`;
      }
      else if (notice.data.notified_type === 'taker') {
        return `[${i18next.t('任務')}] [${notice.data.editor_name || i18next.t('編輯者')}]已編輯您負責的任務內容: [${notice.data.task_name || i18next.t('任務主旨')})]`;
      }
      else {
        return `[${i18next.t('任務')}]${i18next.t('一則通知')}`;
      }
    }
    else if (notice.data.type === 'SubTaskCreated') {
      return `[${i18next.t('待辦事項')}] ${i18next.t('您有一個任務下的待辦事項',)}: [${notice.data.sub_task_name || i18next.t('待辦事項主旨')}]`;
    }
    else if (notice.data.type === 'SubTaskDone') {
      return `[${i18next.t('任務')}]${notice.data.taker_name || '待辦執行人'}完成了${notice.data.sub_task_name || '待辦事項主旨'}，快前往查看吧！`;
    }
    else if (notice.data.type === 'AuditRecordCreated') {
      return `[${i18next.t('稽核')}] ${i18next.t('稽核作業已完成, 點此查看受稽結果並儘速回覆',)}: [${notice.data.audit_record_name || i18next.t('稽核表名稱')}]`;
    }
    else if (notice.data.type === 'AuditRecordReviewCreated') {
      return `[${i18next.t('稽核')}] [${notice.data.auditee || i18next.t('受稽者')}]${i18next.t('已對稽核結果進行回覆, 點此查看')}: [${notice.data.audit_record_name || i18next.t('稽核表')}]`;
    }
    else if (notice.data.type === 'AuditRequestCreated') {
      if (notice.data.notified_type === 'auditor') {
        return `[${i18next.t('稽核')}] ${i18next.t('您將於[{date}]進行一個新的稽核行程',
          {
            date: notice.data.record_at
              ? moment(notice.data.record_at).format('YYYY-MM-DD')
              : 'YYYY-MM-DD',
          },
        )}: [${notice.data.audit_request_name || i18next.t('稽核表名稱')}]`;
      }
      else if (notice.data.notified_type === 'auditee') {
        return `[${i18next.t('稽核')}] ${i18next.t(
          '您將於[{date}]進行一個新的受稽行程',
          {
            date: notice.data.record_at
              ? moment(notice.data.record_at).format('YYYY-MM-DD')
              : 'YYYY-MM-DD',
          },
        )}: [${notice.data.audit_request_name || i18next.t('稽核表名稱')}]`;
      }
      else {
        return `[${i18next.t('稽核')}] ${i18next.t('一則通知')}`;
      }
    }
    else if (notice.data.type === 'AuditRequestAuditeeRecord') {
      return `[${i18next.t('稽核提醒')}] ${i18next.t('您今日有一個受稽行程',)}: [(${notice.data.audit_request_name || i18next.t('稽核表名稱')})]`;
    }
    else if (notice.data.type === 'AuditRequestAuditorRecord') {
      return `[${i18next.t('稽核提醒')}] ${i18next.t('您今日有一個稽核行程',)}: [(${notice.data.audit_request_name || i18next.t('稽核表名稱')})]`;
    }
    else if (notice.data.type === 'AuditTemplateVersionCreated') {
      return `[${i18next.t('更新稽核表公版')}]${i18next.t('已更新管理文件')}[${notice.data.audit_name || i18next.t('稽核表名稱')}] ${i18next.t('的預設公版',)}[${notice.data.template_name || i18next.t('稽核表公版名稱')}] ${i18next.t('，點此查看更新後內容，請評估是否調整現有題目。')}`;
    }
    else if (notice.data.type === 'AlertCreated') {
      const level = notice.data.alert_level;
      let level_title = '';
      if (level && level === 1) {
        level_title = i18next.t('預警');
      } else {
        level_title = i18next.t('警示');
      }
      let title =
        notice.data && notice.data.alert_name
          ? notice.data.alert_name
          : i18next.t('警示標題');
      return `[${level_title}]${title}, 請儘速前往查看並排除風險`;
    }
    else if (notice.data.type === 'LicenseRemindDateExpired') {
      if (notice.data.notified_type === 'taker') {
        return `[${i18next.t('證照續辦提醒')}] ${i18next.t('您所持證照應行續辦',)}: [${notice.data.license_name || i18next.t('證照名稱')}]`;
      }
      else if (notice.data.notified_type === 'reminder') {
        return `[${i18next.t('證照續辦提醒')}] ${i18next.t('[{name}]所持證照應行續辦',
          {
            name:
              notice.data.taker_name ||
              notice.data.factory_name ||
              i18next.t('人員名稱'),
          },
        )}: [${notice.data.license_name || i18next.t('證照名稱')}]`;
      }
    }
    else if (notice.data.type === 'LicenseRetrainRemind') {
      if (notice.data.notified_type === 'taker') {
        return `[${i18next.t('證照回訓提醒')}] ${i18next.t('您所持證照應行回訓',)}: [${notice.data.license_name || i18next.t('證照名稱')}]`;
      }
      else if (notice.data.notified_type === 'reminder') {
        return `[${i18next.t('證照回訓提醒')}] ${i18next.t('[{name}]所持證照應行續辦',
          {
            name:
              notice.data.taker_name ||
              notice.data.factory_name ||
              i18next.t('人員名稱'),
          },
        )}: [${notice.data.license_name || i18next.t('證照名稱')}]`;
      }
    }
    else if (notice.data.type === 'LicenseStatitoryExtensionExpired') {
      if (notice.data.notified_type === 'taker') {
        return `[${i18next.t('證照展延期限屆至')}] ${i18next.t('您所持證照的法定展延期限屆至',)}: [${notice.data.license_name || i18next.t('證照名稱')}]`;
      }
      else if (notice.data.notified_type === 'reminder') {
        return `[${i18next.t('證照展延期限屆至')}] ${i18next.t('[{name}]所持證照的法定展延期限屆至',
          {
            name:
              notice.data.taker_name ||
              notice.data.factory_name ||
              i18next.t('人員名稱'),
          },
        )}: [${notice.data.license_name || i18next.t('證照名稱')}]`;
      }
    }
    else if (notice.data.type === 'LicenseValidEndDateExpired') {
      if (notice.data.notified_type === 'taker') {
        return `[${i18next.t('證照逾期通知')}] 您所持證照的有效期限屆至: [${notice.data.license_name || i18next.t('證照名稱')}]`;
      }
      else if (notice.data.notified_type === 'reminder') {
        return `[${i18next.t('證照逾期通知')}] [${notice.data.taler_name || notice.data.factory_name || i18next.t('人員名稱')}]${i18next.t('所持證照的有效期限屆至')}: [${notice.data.license_name || i18next.t('證照名稱')}]`;
      }
    }
    else if (notice.data.type === 'LicenseCreated') {
      if (notice.data.notified_type === 'taker') {
        return `[${i18next.t('證照')}] ${i18next.t('已新增一則您持有的證照資訊',)}: [${notice.data.license_name || i18next.t('證照名稱')}]`;
      }
      else if (notice.data.notified_type === 'reminder') {
        return `[${i18next.t('證照')}] ${i18next.t('已新增一則您管理的證照資訊',)}: [${notice.data.license_name || i18next.t('證照名稱')}]`;
      }
      else if (notice.data.notified_type === 'agent') {
        return `[${i18next.t('證照')}] ${i18next.t('已新增一則您作為代理人的報准人員證照資訊',)}: [${notice.data.license_name || i18next.t('證照名稱')}]`;
      }
      else {
        return `[${i18next.t('證照')}]${i18next.t('一則通知')}`;
      }
    }
    else if (notice.data.type === 'LicenseRenewed') {
      if (notice.data.notified_type === 'taker') {
        return `[${i18next.t('證照')}] [${notice.data.editor_name || i18next.t('更新者')}]已更新您持有的證照資訊: [${notice.data.license_name || i18next.t('證照名稱')}]`;
      }
      else if (notice.data.notified_type === 'reminder') {
        return `[${i18next.t('證照')}] [${notice.data.editor_name || i18next.t('更新者')}]已更新您管理的證照資訊: [${notice.data.license_name || i18next.t('證照名稱')}]`;
      }
      else if (notice.data.notified_type === 'agent') {
        return `[${i18next.t('證照')}] [${notice.data.editor_name || i18next.t('更新者')}]已更新您作為代理人的報准人員證照資訊: [${notice.data.license_name || i18next.t('證照名稱')}]`;
      }
      else {
        return `[${i18next.t('證照')}]${i18next.t('一則通知')}`;
      }
    }
    else if (notice.data.type === 'LicenseUpdated') {
      if (notice.data.notified_type === 'taker') {
        return `[${i18next.t('證照')}] [${notice.data.editor_name || i18next.t('編輯者')}]已編輯您持有的證照資訊: [${notice.data.license_name || i18next.t('證照名稱')}]`;
      }
      else if (notice.data.notified_type === 'reminder') {
        return `[${i18next.t('證照')}] [${notice.data.editor_name || i18next.t('編輯者')}]已編輯您管理的證照資訊: [${notice.data.license_name || i18next.t('證照名稱')}]`;
      }
      else if (notice.data.notified_type === 'agent') {
        return `[${i18next.t('證照')}] [${notice.data.editor_name || i18next.t('編輯者')}]已編輯您作為代理人的報准人員證照資訊: [${notice.data.license_name || i18next.t('證照名稱')}]`;
      }
      else {
        return `[${i18next.t('證照')}]${i18next.t('一則通知')}`;
      }
    }
    else if (notice.data.type === 'LicenseTemplateVersionCreated') {
      return `[${i18next.t('更新證照公版')}]${i18next.t('已更新管理文件')}[${notice.data.license_name || i18next.t('證照名稱')}]${i18next.t('的預設公版',)}[${notice.data.template_name || i18next.t('證照公版名稱')}]${i18next.t('，點此查看更新後內容。',)}`;
    }
    else if (notice.data.type === 'ChangeRemindEvaluatorExpired') {
      return `[${i18next.t('變動計畫評估到期通知')}] ${i18next.t('{item_name}將於今日到期，請盡快前往變動風險評估',
        {
          item_name: notice.data.change_name || i18next.t('計劃名稱'),
        },
      )}`;
    }
    else if (notice.data.type === 'ChangeRemindOwnerExpired') {
      return `[${i18next.t('變動計畫評估到期通知')}] ${i18next.t('{item_name}將於今日到期，請盡快提醒尚未評估的評估人員前往變動風險評估',
        {
          item_name: notice.data.change_name || i18next.t('計劃名稱'),
        },
      )}`;
    }
    else if (notice.data.type === 'ChangeVersionCreated') {
      if (notice.data.notified_type === 'creator') {
        return `[${i18next.t('變動計畫')}] [${notice.data.update_user_name || i18next.t('更新者')}]${i18next.t('已更新您建立的變動計畫內容')}: [${notice.data.change_name || i18next.t('計畫名稱')}]`;
      }
      else if (notice.data.notified_type === 'owner-original') {
        return `[${i18next.t('變動計畫')}] [${notice.data.update_user_name || i18next.t('更新者')}]${i18next.t('已更新您建立的變動計畫內容')}: [${notice.data.change_name || i18next.t('計畫名稱')}]`;
      }
      else if (notice.data.notified_type === 'owner-new') {
        return `[${i18next.t('變動計畫')}] ${i18next.t('您已被指定為一項變動計畫的負責人, 點此查看',)}: [${notice.data.change_name || i18next.t('計畫名稱')}]`;
      }
    }
    else if (notice.data.type === 'ChangeStopped') {
      if (notice.data.notified_type === 'evaluator') {
        return `[${i18next.t('變動計畫')}] ${i18next.t('[{name}]已中止您參與評估的變動計畫',
          {
            name: notice.data.stop_user_name || i18next.t('中止者'),
          },
        )}: [${notice.data.change_name || i18next.t('計畫名稱')}]`;
      }
      else if (notice.data.notified_type === 'owner') {
        return `[${i18next.t('變動計畫')}] ${i18next.t('[{name}]已中止您負責的變動計畫',
          {
            name: notice.data.stop_user_name || i18next.t('中止者'),
          },
        )}: [${notice.data.change_name || i18next.t('計畫名稱')}]`;
      }
      else if (notice.data.notified_type === 'creator') {
        return `[${i18next.t('變動計畫')}] ${i18next.t('[{name}]已中止您建立的變動計畫',
          {
            name: notice.data.stop_user_name || i18next.t('中止者'),
          },
        )}: [${notice.data.change_name || i18next.t('計畫名稱')}]`;
      }
    }
    else if (notice.data.type === 'ChangeRestarted') {
      if (notice.data.notified_type === 'evaluator') {
        return `[${i18next.t('變動計畫')}] ${i18next.t('[{name}]已重啟您參與評估的變動計畫',
          {
            name: notice.data.restart_user_name || i18next.t('重啟者'),
          },
        )}: [${notice.data.change_name || i18next.t('計畫名稱')}]`;
      }
      else if (notice.data.notified_type === 'owner') {
        return `[${i18next.t('變動計畫')}] ${i18next.t('[{name}]已重啟您負責的變動計畫',
          {
            name: notice.data.restart_user_name || i18next.t('重啟者'),
          },
        )}: [${notice.data.change_name || i18next.t('計畫名稱')}]`;
      }
      else if (notice.data.notified_type === 'creator') {
        return `[${i18next.t('變動計畫')}] ${i18next.t('[{name}]已重啟您建立的變動計畫',
          {
            name: notice.data.restart_user_name || i18next.t('重啟者'),
          },
        )}: [${notice.data.change_name || i18next.t('計畫名稱')}]`;
      }
    }
    else if (notice.data.type === 'ChangeAssignmentCreated') {
      return `[${i18next.t('變動計畫')}] ${i18next.t('您已被指定為一項變動計畫的領域評估人員, 請儘速處理',)} :[${notice.data.change_name || i18next.t('計畫名稱')}]`;
    }
    else if (notice.data.type === 'ChangeCreated') {
      return `[${i18next.t('變動計畫')}] ${i18next.t('您已被指定為一項變動計畫的負責人, 點此查看',)}: [${notice.data.change_name || i18next.t('計畫名稱')}]`;
    }
    else if (notice.data.type === 'ChangeUpdated') {
      if (notice.data.notified_type === 'creator') {
        return `[${i18next.t('變動計畫')}] [${notice.data.update_user_name || i18next.t('編輯者')}]${i18next.t('已編輯您建立的變動計畫內容')}: [${notice.data.change_name || i18next.t('計畫名稱')}]`;
      }
      else if (notice.data.notified_type === 'owner-original') {
        return `[${i18next.t('變動計畫')}] [${notice.data.update_user_name || i18next.t('編輯者')}]${i18next.t('已編輯您負責的變動計畫內容')}: [${notice.data.change_name || i18next.t('計畫名稱')}]`;
      }
      else if (notice.data.notified_type === 'owner-new') {
        return `[${i18next.t('變動計畫')}] ${i18next.t('您已被指定為一項變動計畫的負責人, 點此查看',)}: [${notice.data.change_name || i18next.t('計畫名稱')}]`;
      }
    }
    else if (notice.data.type === 'ChangeStarted') {
      return `[${i18next.t('變動計畫')}] [${notice.data.start_user_name || i18next.t('負責人名稱')}]${i18next.t('已正式啟動您建立的變動計畫',)}: [${notice.data.change_name || i18next.t('計畫名稱')}]`;
    }
    else if (notice.data.type === 'ChangeAssignmentUpdated') {
      if (notice.data.notified_type === 'original') {
        return `[${i18next.t('變動計畫')}] [${notice.data.update_user_name || i18next.t('編輯者')}]${i18next.t('已編輯您參與評估的變動計畫內容',)}: [${notice.data.change_name || i18next.t('計畫名稱')}]`;
      }
      else if (notice.data.notified_type === 'new') {
        return `[${i18next.t('變動計畫')}] [${notice.data.update_user_name || i18next.t('編輯者')}]${i18next.t('您已被指定為一項變動計畫的領域評估人員, 請儘速處理',)}: [${notice.data.change_name || i18next.t('計畫名稱')}]`;
      }
    }
    else if (notice.data.type === 'ChangeDeleted') {
      return `[${i18next.t('變動計畫')}] ${i18next.t('[{name}]已刪除您建立的變動計畫',
        {
          name: notice.data.delete_user_name || i18next.t('刪除者'),
        },
      )}: [${notice.data.change_name || i18next.t('計畫名稱')}]`;
    }
    else if (notice.data.type === 'ContractorEnterRecordRemindCreated') {
      if (notice.data.notified_type === 'member') {
        return `[${i18next.t('進廠')}] ${(i18next.t('今日有外部廠商[{name}]進廠作業'),
        {
          name: notice.data.contractor_name || i18next.t('承攬商名稱'),
        })}: [${notice.data.task_content || i18next.t('進廠主旨')}]`;
      }
      else if (notice.data.notified_type === 'owner') {
        return `[${i18next.t('進廠提醒')}] 您為今日外部廠商[${notice.data.contractor_name || i18next.t('承攬商名稱',)}]進廠作業的紀錄負責人, 請於廠商收工後進行檢查: [${notice.data.task_content || i18next.t('進廠主旨')}]`;
      }
      else {
        return `[${i18next.t('進廠')}] ${i18next.t('一則通知')}`;
      }
    }
    else if (notice.data.type === 'ContractorEnterRecordCreated') {
      return `[${i18next.t('進廠')}] ${i18next.t('您已被指定為一個進廠記錄的負責人',)}: [${notice.data.task_content || i18next.t('進廠主旨')}]`;
    }
    else if (notice.data.type === 'ContractorEnterRecordUpdated') {
      if (notice.data.notified_type === 'creator') {
        return `[${i18next.t('進廠')}] [${notice.data.updated_user_name || i18next.t('編輯者')}]${i18next.t('已編輯您建立的進廠紀錄表內容')}: [${notice.data.task_content || i18next.t('進廠主旨')}]`;
      }
      else if (notice.data.notified_type === 'owner') {
        return `[${i18next.t('進廠')}] [${notice.data.updated_user_name || i18next.t('編輯者')}]${i18next.t('已編輯您負責的進廠紀錄表內容')}: [${notice.data.task_content || i18next.t('進廠主旨')}]`;
      }
      else {
        return `[${i18next.t('進廠')}] ${i18next.t('一則通知')}`;
      }
    }
    else if (notice.data.type === 'ContractorEnterRecordDeleted') {
      return `[${i18next.t('進廠')}] [${notice.data.delete_user_name || i18next.t('刪除者')}]${i18next.t('已刪除您建立的進廠紀錄表')}: [${notice.data.task_content}]`;
    }
    else if (notice.data.type === 'LlBroadcastCreated') {
      if (notice.data.factory_name) {
        return ` [${notice.data.factory_name || i18next.t('工廠名稱')}][${i18next.t('ESGoal快報',)}] ${notice.data.ll_broadcast_name || i18next.t('快報主旨')}`;
      }
      else {
        return ` [${notice.data.organization_name || i18next.t('集團名稱')}][${i18next.t('ESGoal快報')}] ${notice.data.ll_broadcast_name || i18next.t('快報主旨')}`;
      }
    }
    else if (notice.data.type === 'InternalTrainingCreated') {
      return `[${i18next.t('教育訓練')}] ${i18next.t('您已被指定為一項教育訓練的負責人',)}: [${notice.data.training_name || i18next.t('教育訓練名稱')}]`;
    }
    else if (notice.data.type === 'InternalTrainingRemind') {
      return `[${i18next.t('教育訓練提醒')}] ${i18next.t('今日將進行一項由您負責的教育訓練, 請記得填寫教育訓練紀錄',)}: [${notice.data.training_name || i18next.t('教育訓練名稱')}]`;
    }
    else if (notice.data.type === 'InternalTrainingUpdated') {
      if (notice.data.notified_type === 'creator') {
        return `[${i18next.t('教育訓練')}] [${notice.data.updated_user_name || i18next.t('編輯者')}]${i18next.t('已編輯您建立的教育訓練內容')}: [${notice.data.training_name || i18next.t('教育訓練名稱')}]`;
      }
      else if (notice.data.notified_type === 'principal') {
        return `[${i18next.t('教育訓練')}] [${notice.data.updated_user_name || i18next.t('編輯者')}]${i18next.t('已編輯您負責的教育訓練內容')}: [${notice.data.training_name || i18next.t('教育訓練名稱')}]`;
      }
      else {
        return `[${i18next.t('教育訓練')}] ${i18next.t('一則通知')}`;
      }
    }
    else if (notice.data.type === 'InternalTrainingDeleted') {
      return `[${i18next.t('教育訓練')}] ${i18next.t('[{name}]已刪除您建立的教育訓練',
        {
          name: notice.data.delete_user_name || i18next.t('刪除者'),
        },
      )}: [${notice.data.training_name || i18next.t('教育訓練名稱')}]`;
    }
    else if (notice.data.type === 'InternalTrainingTemplateVersionCreated') {
      return `[${i18next.t('更新教育訓練公版')}]${i18next.t('已更新管理文件',)}[${notice.data.internal_training_name || i18next.t('教育訓練名稱')}] ${i18next.t('的預設公版')}[${notice.data.template_name || i18next.t('教育訓練公版名稱')}]${i18next.t('，點此查看更新後內容。',)}`;
    }
    else if (notice.data.type === 'SubTaskUndoRemind') {
      return `[${i18next.t('待辦事項提醒')}] ${i18next.t('您的待辦事項期限屆至, 請儘速處理',)}: [${notice.data.sub_task_name || i18next.t('待辦事項主旨')}]`;
    }
    else if (notice.data.type === 'TaskUndoRemind') {
      return `[${i18next.t('任務提醒')}] ${i18next.t('您所負責任務[{task}]中有待辦事項期限屆至, 已通知負責人員[{name}]儘速處理',
        {
          task: notice.data.task_name || i18next.t('任務主旨'),
          name: notice.data.sub_task_taker_name || i18next.t('待辦執行人'),
        },
      )}: [${notice.data.sub_task_name || i18next.t('待辦事項主旨')}]`;
    }
    else if (notice.data.type === 'TaskUnCheckRemind') {
      if (notice.data.notified_type === 'taker') {
        return `[${i18next.t('任務提醒')}] ${i18next.t('您所負責任務的到期日屆至, 請儘速處理',
        )}: [${notice.data.task_name || i18next.t('任務主旨')}]`;
      }
      else if (notice.data.notified_type === 'creator') {
        return `[${i18next.t('任務提醒')}] ${i18next.t('您所建立任務的到期日屆至, 但負責人尚未完成審核',)}: [${notice.data.task_name || i18next.t('任務主旨')}]`;
      }
    }
    else if (notice.data.type === 'ContractorEnterRecordNotifyAtRemind') {
      let _enterStartDate = 'YYYY-MM-DD';
      if (notice.data.enter_start_date) {
        _enterStartDate = moment(notice.data.enter_start_date).format('YYYY-MM-DD',);
      }
      return `[${i18next.t('進廠')}-${i18next.t('自設提醒事項')}] ${i18next.t('外部廠商',)}[${notice.data.contractor_name || i18next.t('進廠承攬商名稱',)}]於[${_enterStartDate}]進廠作業，請確認自設提醒事項。`;
    }
    else if (notice.data.type === 'ContractorLicenseTemplateVersionCreated') {
      return `[${i18next.t('更新承攬商資格證公版')}] ${i18next.t('已更新管理文件',)}[${notice.data.contractor_license_name || i18next.t('承攬商資格證名稱')}]${i18next.t('的預設公版')}[${notice.data.template_name || i18next.t('承攬商資格證公版名稱')}]${i18next.t('，點此查看更新後內容。',)}`;
    }
    else if (notice.data.type === 'ChangeAssignmentRenew') {
      return `[${i18next.t('變動計畫')}][${notice.data.update_user_name || i18next.t('更新者')}]${i18next.t('已更新您參與評估的變動計畫內容')}:[${notice.data.change_name || i18next.t('計畫名稱')}]`;
    }
    else if (notice.data.type === 'ChangeCompleted') {
      return `[${i18next.t('變動計畫提醒')}]您所負責變動計畫的評估已完成:[${notice.data.change_name || i18next.t('計畫名稱')}]`;
    }
    else if (notice.data.type === 'ChangeRecordAnswerUpdated') {
      return `[${i18next.t('變動計畫')}][${notice.data.evaluator_name}]已更新[${notice.data.change_record_answer_name}]評估結果,點此查看: [${notice.data.change_name || i18next.t('計畫名稱')}]`;
    }
    else if (notice.data.type === 'ChecklistAssignmentUndoNotify') {
      return `[${i18next.t('點檢預警')}] 您有尚未完成的點檢作業, 請儘速處理: [${notice.data.checklist_name || i18next.t('點檢表')}]`;
    }
    else if (notice.data.type === 'ChecklistAssignmentNotify') {
      return `[${i18next.t('點檢')}] 您今日的點檢作業: [${notice.data.checklist_name || i18next.t('點檢表')}]`;
    }
    else if (notice.data.type === 'ChecklistScheduleCreatedNotify') {
      return `[${i18next.t('點檢')}] 您已被指定為一個點檢作業的填表人: [${notice.data.checklist_name || i18next.t('點檢表')}]`;
    }
    else if (notice.type === 'ChecklistSampleCreated') {
      const { record_type: recordType, score, created_user_name: creator, checklist_record_name: checklistName } = notice.data;
      const subText = recordType === 'reviewers'
        ? '曾覆核'
        : recordType === 'samples'
          ? '曾抽檢'
          : '';
      return score === 10
        ? `[${i18next.t('點檢')}] [${creator || i18next.t('抽檢者')}] 已抽檢您${subText}的點檢作業 [${checklistName || i18next.t('點檢表名稱')}] ，抽檢結果為 通過`
        : score === 5
          ? `[${i18next.t('點檢')}] [${creator || i18next.t('抽檢者')}] 已抽檢您${subText}的點檢作業 [${checklistName || i18next.t('點檢表名稱')}] ，抽檢結果為 未通過，請儘速查看抽檢評價`
          : i18next.t('一則通知');
    } else {
      return i18next.t('一則通知');
    }
  }
}
