import act from '@/services/api/v1/act'
import act_status from '@/services/api/v1/act_status'
import act_version from '@/services/api/v1/act_version'
import article_version from '@/services/api/v1/article_version'
import my_act from '@/services/api/v1/my_act'
import event from '@/services/api/v1/event'
import event_type from '@/services/api/v1/event_type'
import user from '@/services/api/v1/user'
import system_class from '@/services/api/v1/system_class'
import license from '@/services/api/v1/license'
import license_type from '@/services/api/v1/license_type'
import license_version from '@/services/api/v1/license_version'
import retraining_time_record from '@/services/api/v1/retraining_time_record'
import internal_training_group from '@/services/api/v1/internal_training_group'
import license_templates from '@/services/api/v1/license_templates'
import internal_training_template from '@/services/api/v1/internal_training_template'
import internal_training from '@/services/api/v1/training'
import task from '@/services/api/v1/task'
import audit from '@/services/api/v1/audit'
import audit_template from '@/services/api/v1/audit_template'
import audit_template_version from '@/services/api/v1/audit_template_version'
import audit_record from '@/services/api/v1/audit_record'
import checklist_template from '@/services/api/v1/checklist_template'
import checklist from '@/services/api/v1/checklist'
import checklist_record_answer from '@/services/api/v1/checklist_record_answer'
import checklist_record from '@/services/api/v1/checklist_record'
import contractor_enter_record from '@/services/api/v1/contractor_enter_record'
import contractor from '@/services/api/v1/contractor'
import contractor_type from '@/services/api/v1/contractor_type'
import contractor_customized_type from '@/services/api/v1/contractor_customized_type'
import contractor_license from '@/services/api/v1/contractor_license'
import contractor_license_version from '@/services/api/v1/contractor_license_version'
import contractor_license_template from '@/services/api/v1/contractor_license_template'
import contract from '@/services/api/v1/contract'
import change_version from '@/services/api/v1/change_version'
import change from '@/services/api/v1/change'
import user_factory_role from '@/services/api/v1/user_factory_role'
import user_role from '@/services/api/v1/user_role'
import factory from '@/services/api/v1/factory'
import dashboard from '@/services/api/v1/dashboard'
import card from '@/services/api/v1/card'
import factoryTag from '@/services/api/v1/factory_tag'
import ll_broadcast from '@/services/api/v1/ll_broadcast'
import ll_notification from '@/services/api/v1/notification'
import ll_alert from '@/services/api/v1/alert'
import other_data from '@/services/api/v1/other_data'
import file_folder from '@/services/api/v1/file_folder'
import file from '@/services/api/v1/file'
import file_version from '@/services/api/v1/file_version'
import file_log from '@/services/api/v1/file_log'
import user_factory_role_template from '@/services/api/v1/user_factory_role_template'
import training_time_record from '@/services/api/v1/training_time_record'
import effects from '@/services/api/v1/effects'
import factory_effects from '@/services/api/v1/factory_effects'
import factory_tag from '@/services/api/v1/factory_tag'
import guideline from '@/services/api/v1/guideline'
import guideline_version from '@/services/api/v1/guideline_version'
import guideline_article_version from '@/services/api/v1/guideline_article_version'
import guideline_status from '@/services/api/v1/guideline_status'
import guideline_admin from '@/services/api/v1/guideline_admin'
import guideline_version_admin from '@/services/api/v1/guideline_version_admin'
import guideline_article_version_admin from '@/services/api/v1/guideline_article_version_admin'
import guideline_article_admin from '@/services/api/v1/guideline_article_admin'
import user_organization_factory_scope from '@/services/api/v1/user_organization_factory_scope'
import locale from '@/services/api/v1/locale'
import content_text from '@/services/api/v1/content_text'
import exit_checklist from '@/services/api/v1/exit_checklist'
import exit_checklist_assignment from '@/services/api/v1/exit_checklist_assignment'

export default {
  act,
  act_status,
  act_version,
  article_version,
  my_act,
  dashboard,
  event,
  event_type,
  user,
  system_class,
  license_type,
  license_version,
  license_templates,
  license,
  internal_training_template,
  internal_training,
  task,
  audit,
  audit_record,
  audit_template,
  audit_template_version,
  checklist,
  checklist_template,
  checklist_record,
  checklist_record_answer,
  contractor_enter_record,
  contractor,
  contract,
  contractor_type,
  contractor_customized_type,
  contractor_license,
  contractor_license_version,
  contractor_license_template,
  change_version,
  change,
  user_factory_role,
  user_role,
  factory,
  card,
  factoryTag,
  ll_broadcast,
  ll_notification,
  ll_alert,
  other_data,
  file_folder,
  file,
  file_version,
  file_log,
  user_factory_role_template,
  retraining_time_record,
  internal_training_group,
  training_time_record,
  effects,
  factory_effects,
  factory_tag,
  guideline,
  guideline_version,
  guideline_article_version,
  guideline_status,
  guideline_admin,
  guideline_version_admin,
  guideline_article_version_admin,
  guideline_article_admin,
  user_organization_factory_scope,
  locale,
  content_text,
  exit_checklist,
  exit_checklist_assignment
}
