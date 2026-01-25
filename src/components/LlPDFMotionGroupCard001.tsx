import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import moment from 'moment';
import {
  WsPaddingContainer,
  WsInfo,
  WsIconBtn,
  WsFlex,
  WsText,
  LlPDFConvertingCard001,
  WsSkeleton,
  WsState,
  WsModal,
  WsTag,
  WsUpdateBtn,
  WsIcon,
  WsDes,
  WsDialog
} from '@/components';
import $color from '@/__reactnative_stone/global/color';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import S_MeetingItemGroup from '@/services/api/v1/meeting_item_group';
import S_MeetingItem from '@/services/api/v1/meeting_item';
import { pick, types } from '@react-native-documents/picker';
import { useNavigation } from '@react-navigation/native'

// -------------------- 型別 --------------------

type Motion = {
  id: string;
  name?: string;
  sequence?: number;
  item_label?: { name?: string } | string;
  presenter?: string;
  meeting_item_unit?: { name?: string } | string;
  attendees_present?: any;
  attendees_invited?: any;
  resolution_summary?: string;
  resolution_details?: string;
  is_convert?: boolean;
  parse_status?: { name?: string } | string;
  convert_status?: { name?: string } | string;
};

export type Group = {
  id: string;
  name: string;
  sequence: number;
  meetingItems?: Motion[];
};

type Props = {
  style?: any;

  // 給 FlatList 用：每個 item 就是一個 Group
  item?: Group;

  // 若之後有情境要一次丟很多群組，可以用這個
  groups?: Group[];

  // callback
  onPressAddGroup?: (group: Group) => void;
  onPressEditGroup?: (group: Group) => void;
  onPressDeleteGroup?: (group: Group) => void;
  onPressDeleteMeetingItem?: (group: Group, meetingItem: Motion) => void;
  onRequestMeetingItemsAll?: () => void;
  refreshKey?: number;
  meeting?: any;
  meetingItemListByGroupExternal?: Record<string, Motion[]>;
};

// -------------------- Component 本體 --------------------

const LlPDFMotionGroupCard001: React.FC<Props> = ({
  style,
  item,
  groups,
  onPressAddGroup,
  onPressEditGroup,
  onPressDeleteGroup,
  onPressDeleteMeetingItem,
  onRequestMeetingItemsAll,
  refreshKey,
  meeting,
  meetingItemListByGroupExternal,
  remind = '處理失敗建議',
  remindBtnDisabled = false,
  dialogButtonItems = [],
  dialogTitle,
  contentHeight
}) => {
   const navigation = useNavigation()
  const { t } = useTranslation();
  const scrollRef = useRef<KeyboardAwareScrollView | null>(null);
  const currentFactory = useSelector(state => state.data.currentFactory);

  // 決定實際要畫哪些群組
  const sourceGroups: Group[] = useMemo(() => {
    if (groups && groups.length > 0) return groups;
    if (item) return [item];
    return []; // 沒資料就不畫
  }, [groups, item]);

  const getTemplateItems = (template: any) =>
    template?.meeting_template_items ??
    template?.file_attaches?.[0]?.meeting_template_items ??
    template?.file_attachs?.[0]?.meeting_template_items ??
    []

  const getTemplateItemId = (value: any) => value?.id ?? value ?? null
  const getTemplateItemValue = (value: any) =>
    value?.value ??
    value?.meeting_template_field?.value ??
    value?.name ??
    value ??
    null

  const getGroupTemplateId = (value: any) => value?.id ?? value ?? null
  const getGroupTemplateValue = (value: any) =>
    value?.name ??
    value ??
    null

  const contentsTemplateItems = getTemplateItems(meeting?.contents_template)
  const meetingTemplateItems = getTemplateItems(meeting?.meeting_template)
  const contentsTemplateIdSet = new Set(
    contentsTemplateItems.map(getTemplateItemId).filter(Boolean)
  )
  const contentsTemplateValueSet = new Set(
    contentsTemplateItems.map(getTemplateItemValue).filter(Boolean)
  )
  const meetingTemplateIdSet = new Set(
    meetingTemplateItems.map(getTemplateItemId).filter(Boolean)
  )
  const meetingTemplateValueSet = new Set(
    meetingTemplateItems.map(getTemplateItemValue).filter(Boolean)
  )

  const isTemplateVariableValid = (
    templateIdSet: Set<any>,
    templateValueSet: Set<any>,
    groupTemplateValue: any
  ) => {
    const id = getGroupTemplateId(groupTemplateValue)
    if (id && templateIdSet.has(id)) return true
    const value = getGroupTemplateValue(groupTemplateValue)
    if (value && templateValueSet.has(value)) return true
    return false
  }

  // 內外層收合狀態
  const [groupCollapsed, setGroupCollapsed] = useState<Record<string, boolean>>({});
  const [motionCollapsed, setMotionCollapsed] = useState<Record<string, boolean>>({});
  const [meetingItemListByGroup, setMeetingItemListByGroup] = useState<Record<string, Motion[]>>({});
  const [meetingItemLoadingByGroup, setMeetingItemLoadingByGroup] = useState<Record<string, boolean>>({});
  const [meetingItemRefreshingIds, setMeetingItemRefreshingIds] = useState<Record<string, boolean>>({});
  const [meetingItemRefreshTimes, setMeetingItemRefreshTimes] = useState<Record<string, string>>({});
  const [meetingItemAttachesById, setMeetingItemAttachesById] = useState<Record<string, any[]>>({});
  const [editMotionModalVisible, setEditMotionModalVisible] = useState(false);
  const [editingMotion, setEditingMotion] = useState<Motion | null>(null);

  const [motionFiles, setMotionFiles] = useState<Array>([]);

  const [updateProposalModalVisible, setUpdateProposalModalVisible] = useState(false)
  const [updateProposalTargetMotion, setUpdateProposalTargetMotion] = useState<Motion | null>(null)
  const [updateFileData, setUpdateFileData] = useState();

  const [updateFileOriginalName, setUpdateFileOriginalName] = useState('');
  const [updateMeetingItemId, setUpdateMeetingItemId] = useState<string | null>(null)
  const [updateProposalGroupId, setUpdateProposalGroupId] = useState<string | null>(null)
  const [editMeetingItemName, setEditMeetingItemName] = useState('')
  const [editMeetingItemSequence, setEditMeetingItemSequence] = useState('')
  const [editMeetingItemLabel, setEditMeetingItemLabel] = useState<any>(null)
  const [editMeetingItemPresenter, setEditMeetingItemPresenter] = useState('')
  const [editMeetingItemUnit, setEditMeetingItemUnit] = useState<any>(null)
  const [editMeetingItemAttendeesPresent, setEditMeetingItemAttendeesPresent] = useState('')
  const [editMeetingItemResolutionSummary, setEditMeetingItemResolutionSummary] = useState('')
  const [editMeetingItemResolutionDetails, setEditMeetingItemResolutionDetails] = useState('')
  const [editMeetingItemGroupId, setEditMeetingItemGroupId] = useState<string | null>(null)

  const [visible, setVisible] = React.useState(false)
  const [remindValue, setRemindValue] = React.useState()

  const openUpdateProposalModal = (group: Group, motion: Motion) => {
    setUpdateProposalTargetMotion(motion)
    setUpdateMeetingItemId(motion?.id ?? null)
    setUpdateProposalGroupId(group?.id ?? null)
    setUpdateFileData(undefined)
    setUpdateFileOriginalName('')
    setUpdateProposalModalVisible(true)
  }

  const closeUpdateProposalModal = () => {
    setUpdateProposalModalVisible(false)
    setUpdateProposalTargetMotion(null)
    setUpdateMeetingItemId(null)
    setUpdateProposalGroupId(null)
    setUpdateFileData(undefined)
    setUpdateFileOriginalName('')
  }

  const closeEditMeetingItemModal = () => {
    setEditMotionModalVisible(false)
    setEditingMotion(null)
    setEditMeetingItemName('')
    setEditMeetingItemSequence('')
    setEditMeetingItemLabel(null)
    setEditMeetingItemPresenter('')
    setEditMeetingItemUnit(null)
    setEditMeetingItemAttendeesPresent('')
    setEditMeetingItemResolutionSummary('')
    setEditMeetingItemResolutionDetails('')
    setEditMeetingItemGroupId(null)
    setMotionFiles([])
  }


  const pickWordFile = async () => {
    try {
      const res = await pick({
        mode: 'import',
        type: [types.doc, types.docx],
      })
      if (!res || res.length === 0) return

      const rawUri = res[0].uri
      const originalName = res[0].name || rawUri.split('/').pop() || 'file.docx'

      const isWordFile = (name: string) => {
        const lower = (name || '').toLowerCase()
        return lower.endsWith('.doc') || lower.endsWith('.docx')
      }
      if (!isWordFile(originalName)) {
        Alert.alert(t('請選擇 .doc 或 .docx 檔案'))
        return
      }

      const fileType =
        res[0].type ||
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

      const _pickFileData = {
        uri: rawUri,
        name: originalName,
        displayName: originalName,
        type: fileType,
      }
      setUpdateFileData(_pickFileData)

      // ✅ 留著給 UI 顯示 / 後端存原名用
      setUpdateFileOriginalName(originalName)
    } catch (err: any) {
      const isCancel =
        err?.code === 'DOCUMENT_PICKER_CANCELED' ||
        err?.message?.includes('user canceled') ||
        err?.message?.includes('The operation was cancelled')
      if (!isCancel) console.error('❌ 發生其他錯誤:', err)
    }
  }


  const submitUpdateProposal = async () => {
    if (!updateMeetingItemId) {
      Alert.alert(t('請先選擇議案'))
      return
    }
    if (!updateFileData) {
      Alert.alert(t('請先上傳檔案'))
      return
    }
    const readableItemLabel =
      typeof updateProposalTargetMotion?.item_label === 'string'
        ? updateProposalTargetMotion?.item_label
        : updateProposalTargetMotion?.item_label?.name ?? ''
    const formData = new FormData();
    formData.append('factory', currentFactory.id)
    formData.append('item_label', readableItemLabel)
    const rawUri = updateFileData?.uri ?? ''
    const normalizedUri =
      Platform.OS === 'ios' && rawUri && !rawUri.startsWith('file://')
        ? `file:/${rawUri}`
        : rawUri
    const uploadFileData = {
      ...(updateFileData ?? {}),
      uri: normalizedUri,
    }
    formData.append('file', uploadFileData as any)
    if (updateFileOriginalName) {
      formData.append('original_filename', updateFileOriginalName)
    }
    const _params = {
      formData: formData,
      meeting_item_id: updateMeetingItemId
    }
    console.log(JSON.stringify(_params), '_params_params')
    try {
      const _res = await S_MeetingItem.updateMeetingItemWord({ params: _params })
      closeUpdateProposalModal()
      if (updateProposalGroupId) {
        await fetchMeetingItemList(updateProposalGroupId)
      }
      onRequestMeetingItemsAll?.()
      console.log(JSON.stringify(_res), 'S_MeetingItem update')
      Alert.alert(t('更新成功，伺服器正在處理中，請到匯出紀錄確認處理狀態'))
    } catch (e) {
      console.error(e);
    }
  }

  const submitEditMeetingItem = async () => {
    if (!editingMotion?.id) {
      Alert.alert(t('請先選擇議案'))
      return
    }
    const normalizeAttaches = (items: any[] = []) => {
      return items
        .map((item, index) => {
          const fileId =
            item?.original_attach?.file?.id ??
            item?.file?.id ??
            item?.file_id ??
            item?.file ??
            null
          if (!fileId) return null
          const fileVersionId =
            item?.original_attach?.file_version?.id ??
            item?.file_version?.id ??
            item?.file?.last_version?.id ??
            item?.file_version ??
            null
          return {
            factory: currentFactory?.id ?? null,
            sequence: String(index + 1).padStart(4, '0'),
            original_attach: {
              file: fileId,
              file_version: fileVersionId,
            },
            name:
              item?.export_attachment_name ??
              item?.original_attach?.file?.name ??
              item?.file?.name ??
              '',
            has_frame: item?.has_frame ?? false,
          }
        })
        .filter(Boolean)
    }
    const payload = {
      name: editMeetingItemName,
      sequence: undefined,
      factory: currentFactory?.id ?? null,
      item_label: editMeetingItemLabel?.name,
      presenter: editMeetingItemPresenter,
      meeting_item_unit: editMeetingItemUnit,
      attendees_present: editMeetingItemAttendeesPresent,
      resolution_summary: editMeetingItemResolutionSummary,
      resolution_details: editMeetingItemResolutionDetails,
      meeting_item_attaches: normalizeAttaches(motionFiles),
    }
    console.log(JSON.stringify(payload), 'meeting-item-payload--')
    try {
      await S_MeetingItem.update({ data: payload, modelId: editingMotion.id })
      if (editMeetingItemGroupId) {
        await fetchMeetingItemList(editMeetingItemGroupId)
      }
      closeEditMeetingItemModal()
      Alert.alert(t('更新成功'))
    } catch (e) {
      console.error(e)
    }
  }

  const fetchMeetingItemGroup = async (groupId: string) => {
    try {
      console.log('S_MeetingItemGroup.show request', { groupId })
      const _res = await S_MeetingItemGroup.show({ modelId: groupId });
      // console.log(_res, 'S_MeetingItemGroup.show')
    } catch (err) {
      console.log('S_MeetingItemGroup.show error', err);
    }
  };

  const fetchMeetingItemList = async (groupId: string) => {
    console.log(groupId, 'meeting_item_group_id')
    setMeetingItemLoadingByGroup(prev => ({
      ...prev,
      [groupId]: true,
    }));
    try {
      const res = await S_MeetingItem.index({
        params: {
          meeting_item_group_id: groupId,
          order_way: 'asc',
          order_by: 'sequence',
        }
      });
      const list = res?.data ?? [];
      const getParseStatus = (item: Motion) =>
        String(item?.parse_status?.name ?? item?.parse_status ?? '').toUpperCase();
      const completeItems = list.filter(item => getParseStatus(item) === 'COMPLETE');
      const completeItemIdSet = new Set(completeItems.map(item => item.id));
      const nextAttaches: Record<string, any[]> = {};
      let merged = list;

      if (completeItems.length) {
        const detailResults = await Promise.all(
          completeItems.map(item =>
            S_MeetingItem.show({ modelId: item.id })
              .then(detail => detail?.data ?? detail)
              .catch(err => {
                console.log('S_MeetingItem.show error', err);
                return null;
              })
          )
        );
        const detailMap = new Map<string, Motion>();
        detailResults.forEach((detail, index) => {
          if (!detail) return;
          const itemId = completeItems[index]?.id;
          if (itemId) {
            detailMap.set(itemId, detail as Motion);
            if ('meeting_item_attaches' in (detail as Motion)) {
              nextAttaches[itemId] = (detail as Motion).meeting_item_attaches ?? [];
            }
          }
        });
        merged = list.map(item => {
          const detail = detailMap.get(item.id);
          return detail ? { ...item, ...detail } : item;
        });
      }

      const itemsNeedingAttaches = list.filter(
        item =>
          item?.id &&
          meetingItemAttachesById[item.id] === undefined &&
          !completeItemIdSet.has(item.id)
      );
      if (itemsNeedingAttaches.length) {
        const attachResults = await Promise.all(
          itemsNeedingAttaches.map(item =>
            S_MeetingItem.show({ modelId: item.id })
              .then(detail => detail?.data ?? detail)
              .catch(err => {
                console.log('S_MeetingItem.show error', err);
                return null;
              })
          )
        );
        attachResults.forEach((detail, index) => {
          if (!detail) return;
          const itemId = itemsNeedingAttaches[index]?.id;
          if (itemId && 'meeting_item_attaches' in (detail as Motion)) {
            nextAttaches[itemId] = (detail as Motion).meeting_item_attaches ?? [];
          }
        });
      }

      if (Object.keys(nextAttaches).length) {
        setMeetingItemAttachesById(prev => ({
          ...prev,
          ...nextAttaches,
        }));
      }
      setMeetingItemListByGroup(prev => ({
        ...prev,
        [groupId]: merged,
      }));
    } catch (err) {
      console.log('S_MeetingItem.index error', err);
      setMeetingItemListByGroup(prev => ({
        ...prev,
        [groupId]: [],
      }));
    } finally {
      setMeetingItemLoadingByGroup(prev => ({
        ...prev,
        [groupId]: false,
      }));
    }
  };

  const refreshMeetingItem = async (groupId: string, meetingItemId: string) => {
    const refreshTime = moment().format('YYYY-MM-DD HH:mm:ss');
    setMeetingItemRefreshTimes(prev => ({
      ...prev,
      [meetingItemId]: refreshTime,
    }));
    setMeetingItemRefreshingIds(prev => ({
      ...prev,
      [meetingItemId]: true,
    }));
    try {
      const res = await S_MeetingItem.show({ modelId: meetingItemId });
      const detail = res?.data ?? res;
      if (!detail) return;
      if ('meeting_item_attaches' in (detail as Motion)) {
        setMeetingItemAttachesById(prev => ({
          ...prev,
          [meetingItemId]: (detail as Motion).meeting_item_attaches ?? [],
        }));
      }
      setMeetingItemListByGroup(prev => {
        const list = prev[groupId] ?? [];
        const next = list.map(item =>
          item.id === meetingItemId ? { ...item, ...detail } : item
        );
        return {
          ...prev,
          [groupId]: next,
        };
      });
    } catch (err) {
      console.log('S_MeetingItem.show error', err);
    } finally {
      setMeetingItemRefreshingIds(prev => ({
        ...prev,
        [meetingItemId]: false,
      }));
    }
  };

  useEffect(() => {
    if (!sourceGroups.length) return;
    sourceGroups.forEach(group => {
      fetchMeetingItemList(group.id);
    });
  }, [sourceGroups, refreshKey]);

  useEffect(() => {
    if (!sourceGroups.length) return;
    setGroupCollapsed(prev => {
      const next = { ...prev };
      sourceGroups.forEach(group => {
        if (next[group.id] === undefined) {
          next[group.id] = true;
        }
      });
      return next;
    });
  }, [sourceGroups]);

  const normalizeStatusField = (value: any) => {
    if (!value) return value;
    if (typeof value === 'string') return value;
    if (value?.name) return value;
    if (value?.value) return { name: value.value };
    return value;
  };

  const getStatusFromItem = (item: any, key: 'parse_status' | 'convert_status') => {
    const direct = item?.[key];
    if (direct !== undefined && direct !== null) {
      return normalizeStatusField(direct);
    }
    const nameKey = item?.[`${key}_name`] ?? item?.[`${key}Name`];
    if (nameKey) return normalizeStatusField(nameKey);
    const valueKey = item?.[`${key}_value`] ?? item?.[`${key}Value`];
    if (valueKey) return normalizeStatusField(valueKey);
    return undefined;
  };

  useEffect(() => {
    if (!meetingItemListByGroupExternal) return;
    setMeetingItemListByGroup(prev => {
      const next = { ...prev };
      Object.entries(meetingItemListByGroupExternal).forEach(([groupId, items]) => {
        if (!Array.isArray(items)) return;
        const prevList = prev[groupId] ?? [];
        const prevMap = new Map(prevList.map(item => [item.id, item]));
        const externalIdSet = new Set(items.map(item => item.id));
        const mergedList = items.map(item => {
          const prevItem = prevMap.get(item.id);
          if (!prevItem) return item;
          const nextItem = { ...prevItem, ...item };
          const parseStatus = getStatusFromItem(item, 'parse_status');
          if (parseStatus !== undefined) nextItem.parse_status = parseStatus;
          const convertStatus = getStatusFromItem(item, 'convert_status');
          if (convertStatus !== undefined) nextItem.convert_status = convertStatus;
          return nextItem;
        });
        prevList.forEach(item => {
          if (!externalIdSet.has(item.id)) {
            mergedList.push(item);
          }
        });
        next[groupId] = mergedList;
      });
      return next;
    });
  }, [meetingItemListByGroupExternal]);

  const toggleGroup = (groupId: string) => {
    const isCollapsed = groupCollapsed[groupId] ?? false;
    if (isCollapsed) {
      fetchMeetingItemGroup(groupId);
      fetchMeetingItemList(groupId);
    }
    setGroupCollapsed(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleMeetingItem = (groupId: string, meetingItemId: string) => {
    const isCollapsed = motionCollapsed[meetingItemId] ?? true;
    if (isCollapsed) {
      refreshMeetingItem(groupId, meetingItemId);
    }
    setMotionCollapsed(prev => ({
      ...prev,
      [meetingItemId]: !(prev[meetingItemId] ?? true),
    }));
  };

  const normalizeItemLabel = (value: any) => {
    if (!value) return null;
    if (typeof value === 'string') {
      return { name: value };
    }
    return value;
  };

  const openEditMeetingItemModal = (group: Group, meetingItem: Motion) => {
    const toText = (value: any) => {
      if (!value) return '';
      if (Array.isArray(value)) {
        return value
          .map(item => item?.name ?? item?.label ?? item?.title ?? item)
          .filter(Boolean)
          .join(', ');
      }
      return value?.name ?? value;
    };
    setEditingMotion(meetingItem);
    setEditMeetingItemName(meetingItem?.name ?? '')
    setEditMeetingItemSequence(meetingItem?.sequence ? String(meetingItem.sequence) : '')
    setEditMeetingItemLabel(normalizeItemLabel(meetingItem?.item_label))
    setEditMeetingItemPresenter(meetingItem?.presenter ?? '')
    setEditMeetingItemUnit(meetingItem?.meeting_item_unit ?? '')
    setEditMeetingItemAttendeesPresent(toText(meetingItem?.attendees_present))
    setEditMeetingItemResolutionSummary(meetingItem?.resolution_summary ?? '')
    setEditMeetingItemResolutionDetails(meetingItem?.resolution_details ?? '')
    setEditMeetingItemGroupId(group?.id ?? null)
    const rawAttaches =
      meetingItemAttachesById[meetingItem.id] ??
      meetingItem?.meeting_item_attaches ??
      [];
    const normalizedMotionFiles = Array.isArray(rawAttaches)
      ? rawAttaches
        .map(attach => ({
          file: attach?.original_attach?.file ?? null,
          file_version: attach?.original_attach?.file_version ?? null,
          export_attachment_name: attach?.name ?? '',
        }))
      : [];
    setMotionFiles(normalizedMotionFiles)
    setEditMotionModalVisible(true);
  };

  const decodeFilename = (name: string) => {
    if (!name) return name
    // 先處理後端可能用 + 當空白
    const normalized = name.replace(/\+/g, ' ')

    try {
      // 只要包含 %xx 就試著 decode
      if (/%[0-9A-Fa-f]{2}/.test(normalized)) {
        return decodeURIComponent(normalized)
      }
      return normalized
    } catch {
      // 避免重複 decode 或破損字串造成 crash
      return normalized
    }
  }

  const renderListItem = (group: Group, meetingItem: Motion) => {
    const isMeetingItemCollapsed = motionCollapsed[meetingItem.id] ?? true;
    const isMeetingItemRefreshing = meetingItemRefreshingIds[meetingItem.id] ?? false;
    const meetingItemAttaches =
      meetingItemAttachesById[meetingItem.id] ??
      meetingItem?.meeting_item_attaches ??
      [];

    const meetingItemExportAttachName = Array.isArray(meetingItemAttaches)
      ? meetingItemAttaches
        .map(attach => attach?.name)
        .filter(Boolean)
      : [];

    const meetingItemAttachesValue = Array.isArray(meetingItemAttaches)
      ? meetingItemAttaches
        .map(attach => attach?.original_attach)
        .filter(Boolean)
      : [];

    const formatList = (input: any) => {
      if (!input) return '';
      if (Array.isArray(input)) {
        const joined = input
          .map(item => item?.name ?? item?.label ?? item?.title ?? item)
          .filter(Boolean)
          .join(', ');
        return joined;
      }
      if (input?.name) return input.name;
      return input;
    };
    const itemLabelName =
      meetingItem?.item_label?.name ??
      meetingItem?.item_label ??
      '-';
    const meetingItemName = decodeFilename(meetingItem?.name ?? '-');
    const presenter = meetingItem?.presenter ?? '';
    const meetingItemUnit =
      meetingItem?.meeting_item_unit?.name ??
      meetingItem?.meeting_item_unit ??
      '';
    const attendeesPresent = formatList(meetingItem?.attendees_present);
    const attendeesInvited = formatList(meetingItem?.attendees_invited);
    const hasPresenter =
      typeof presenter === 'string' ? presenter.trim() !== '' : !!presenter;
    const hasMeetingItemUnit =
      typeof meetingItemUnit === 'string' ? meetingItemUnit.trim() !== '' : !!meetingItemUnit;
    const hasAttendeesPresent =
      typeof attendeesPresent === 'string' ? attendeesPresent.trim() !== '' : !!attendeesPresent;
    const hasAttendeesInvited =
      typeof attendeesInvited === 'string' ? attendeesInvited.trim() !== '' : !!attendeesInvited;
    const resolutionSummary = meetingItem?.resolution_summary ?? '';
    const resolutionDetails = meetingItem?.resolution_details ?? '';
    const hasResolutionSummary =
      typeof resolutionSummary === 'string' ? resolutionSummary.trim() !== '' : !!resolutionSummary;
    const hasResolutionDetails =
      typeof resolutionDetails === 'string' ? resolutionDetails.trim() !== '' : !!resolutionDetails;
    const updatedAtValue = meetingItem?.updated_at ?? meetingItem?.updatedAt ?? null;
    const apiUpdatedAtText = updatedAtValue
      ? moment(updatedAtValue).format('YYYY-MM-DD HH:mm:ss')
      : '-';
    const updatedAtText = meetingItemRefreshTimes[meetingItem.id] ?? apiUpdatedAtText;
    const hasConvert =
      meetingItem?.is_convert === true || meetingItem?.is_convert === false;
    const isConvert =
      meetingItem?.is_convert === true
        ? t('是')
        : meetingItem?.is_convert === false
          ? t('否')
          : '';
    const rawParseStatus =
      meetingItem?.parse_status?.name ??
      meetingItem?.parse_status ??
      null;
    const rawConvertStatus =
      meetingItem?.convert_status?.name ??
      meetingItem?.convert_status ??
      null;
    const parseStatus = rawParseStatus ?? '-';
    const parseStatusValue = String(rawParseStatus).toUpperCase();
    const convertStatusValue = String(rawConvertStatus).toUpperCase();
    const isParseProcessing =
      parseStatusValue === 'PENDING' || parseStatusValue === 'PROCESSING';
    const isConvertProcessing =
      convertStatusValue === 'PENDING' || convertStatusValue === 'PROCESSING';
    const isParseFailed = parseStatusValue === 'FAILED';
    const isConvertFailed = convertStatusValue === 'FAILED';
    const isFailed = isParseFailed || isConvertFailed;
    const isComplete = parseStatusValue === 'COMPLETE' || parseStatusValue === 'COMPLETED';
    const statusTagText = isParseFailed
      ? t('解析失敗')
      : isConvertFailed
        ? t('轉檔失敗')
        : isParseProcessing
          ? t('解析中')
          : isConvertProcessing
            ? t('轉檔中')
            : null;
    const statusTagColors =
      isParseFailed || isConvertFailed
        ? { backgroundColor: $color.danger11l, textColor: $color.danger }
        : { backgroundColor: $color.yellow11l, textColor: $color.gray };


    return (
      <View key={meetingItem.id} style={{ marginTop: 16 }}>
        <View
          style={{
            borderRadius: 10,
            borderWidth: 0.4,
            borderColor: $color.black,
            backgroundColor: $color.white,
            overflow: 'hidden',
          }}
        >
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toggleMeetingItem(group.id, meetingItem.id)}
          >
            <WsFlex
              style={{ paddingVertical: 12, paddingHorizontal: 12 }}
              justifyContent="space-between"
              alignItems="center"
            >
              <WsFlex alignItems="center">
                <WsText style={{ paddingRight: 28 }}>
                  {`${itemLabelName} ${meetingItemName}`}
                </WsText>
              </WsFlex>
            </WsFlex>
            {statusTagText && (
              <WsTag
                textColor={statusTagColors.textColor}
                backgroundColor={statusTagColors.backgroundColor}
                style={{
                  borderRadius: 0,
                  justifyContent: 'center'
                }}
              >
                {statusTagText}
              </WsTag>
            )}

            <View
              style={{
                position: 'absolute',
                top: 12,
                right: 8,
              }}
            >
              <WsIconBtn
                padding={0}
                name={isMeetingItemCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                size={24}
                color={$color.primary3l}
              />
            </View>

          </TouchableOpacity>

          {/* 內層 body */}
          {!isMeetingItemCollapsed && (
            <WsPaddingContainer
              padding={0}
              style={{ paddingHorizontal: 16, paddingBottom: 16 }}
            >
              {isMeetingItemRefreshing ? (
                <View style={{ marginTop: 8 }}>
                  <WsSkeleton />
                </View>
              ) : (
                <>
                  <WsFlex
                    style={{ paddingTop: 8, paddingBottom: 12 }}
                    justifyContent="space-bewteen"
                  >

                    <TouchableOpacity
                      onPress={() => openUpdateProposalModal(group, meetingItem)}
                    >
                      <WsTag>{t('更新提案單')}</WsTag>
                    </TouchableOpacity>
                    <WsIconBtn
                      padding={0}
                      name="ws-outline-edit-pencil"
                      size={24}
                      color={$color.primary}
                      style={{ marginLeft: 8 }}
                      onPress={() => openEditMeetingItemModal(group, meetingItem)}
                    />
                    <WsIconBtn
                      padding={0}
                      name="ws-outline-delete"
                      size={24}
                      color={$color.danger}
                      style={{ marginLeft: 8 }}
                      onPress={() => onPressDeleteMeetingItem?.(group, meetingItem)}
                    />
                  </WsFlex>
                  <View style={{ marginTop: 8 }}>
                    <WsInfo
                      labelWidth={80}
                      label={t('項目符號')}
                      style={{ flexDirection: 'row', alignItem: 'center' }}
                      labelColor={$color.gray}
                      value={itemLabelName}
                    />
                  </View>

                  <View style={{ marginTop: 8 }}>
                    <WsInfo
                      labelWidth={80}
                      label={t('名稱')}
                      style={{ flexDirection: 'row', alignItem: 'center' }}
                      labelColor={$color.gray}
                      value={meetingItemName}
                    />
                  </View>

                  {hasPresenter && (
                    <View style={{ marginTop: 8 }}>
                      <WsInfo
                        labelWidth={80}
                        label={t('報告人')}
                        style={{ flexDirection: 'row', alignItem: 'center', flexWrap: 'wrap' }}
                        labelColor={$color.gray}
                        value={presenter}
                      />
                    </View>
                  )}

                  {hasMeetingItemUnit && (
                    <View style={{ marginTop: 8 }}>
                      <WsInfo
                        labelWidth={80}
                        label={t('提案單位')}
                        style={{
                          flexDirection: 'row',
                          alignItem: 'center',
                          flexWrap: 'wrap',
                        }}
                        labelColor={$color.gray}
                        value={meetingItemUnit}
                      />
                    </View>
                  )}

                  {hasAttendeesPresent && (
                    <View style={{ marginTop: 8 }}>
                      <WsInfo
                        labelWidth={80}
                        label={t('列席人員')}
                        style={{
                          flexDirection: 'row',
                          alignItem: 'center',
                          flexWrap: 'wrap',
                        }}
                        labelColor={$color.gray}
                        value={attendeesPresent}
                      />
                    </View>
                  )}

                  {hasAttendeesInvited && (
                    <View style={{ marginTop: 8 }}>
                      <WsInfo
                        labelWidth={80}
                        style={{
                          flexDirection: 'row',
                          alignItem: 'center',
                          flexWrap: 'wrap',
                        }}
                        label={t('列席單位')}
                        labelColor={$color.gray}
                        value={attendeesInvited}
                      />
                    </View>
                  )}

                  {meetingItemAttachesValue.length ? (
                    <View style={{ marginTop: 8 }}>
                      <WsInfo
                        type={'filesAndImages'}
                        exportAttachmentName={meetingItemExportAttachName ? meetingItemExportAttachName : ''}
                        style={{
                          flexDirection: 'row',
                          alignItem: 'center',
                          flexWrap: 'wrap',
                        }}
                        label={t('附件')}
                        labelColor={$color.gray}
                        value={meetingItemAttachesValue}
                      />

                    </View>
                  ) : null}

                  <View
                    style={{
                      height: 1,
                      backgroundColor: $color.white2d,
                      marginTop: 16,
                    }}
                  />

                  {meetingItem?.original_attach && (
                    <View style={{ marginTop: 8 }}>
                      <WsInfo
                        type={'filesAndImages'}
                        label={t('提案單')}
                        labelColor={$color.gray}
                        value={[meetingItem?.original_attach]}
                      />
                    </View>
                  )}

                  <View
                    style={{
                      height: 1,
                      backgroundColor: $color.white2d,
                      marginTop: 16,
                    }}
                  />

                  {hasResolutionSummary && (
                    <View style={{ marginTop: 8 }}>
                      <WsInfo
                        label={t('決議-簡述')}
                        style={{
                          flexDirection: 'row',
                          alignItem: 'center',
                          flexWrap: 'wrap',
                        }}
                        labelColor={$color.gray}
                        value={resolutionSummary}
                      />
                    </View>
                  )}

                  {hasResolutionDetails && (
                    <View style={{ marginTop: 8 }}>
                      <WsInfo
                        label={t('決議-詳述')}
                        style={{
                          flexDirection: 'row',
                          alignItem: 'center',
                          flexWrap: 'wrap',
                        }}
                        labelColor={$color.gray}
                        value={resolutionDetails}
                      />
                    </View>
                  )}

                  <View
                    style={{
                      height: 1,
                      backgroundColor: $color.white2d,
                      marginTop: 16,
                    }}
                  />

                  {hasConvert && (
                    <View style={{ marginTop: 8 }}>
                      <WsInfo
                        label={t('是否轉檔中')}
                        labelColor={$color.gray}
                        value={isConvert}
                      />
                    </View>
                  )}

                  {isComplete && meetingItem?.convert_attach && (
                    <View style={{ marginTop: 8 }}>
                      <WsInfo
                        type={'filesAndImages'}
                        label={t('議案(DOCX)')}
                        labelColor={$color.gray}
                        value={[meetingItem?.convert_attach]}
                      />
                    </View>
                  )}

                  {isComplete && meetingItem?.convert_pdf_attach && (
                    <View style={{ marginTop: 8 }}>
                      <WsInfo
                        type={'filesAndImages'}
                        label={t('議案(PDF)')}
                        labelColor={$color.gray}
                        value={[meetingItem?.convert_pdf_attach]}
                      />
                    </View>
                  )}

                  {isFailed && (
                    <View style={{ marginTop: 8 }}>
                      <WsText color={$color.danger}>
                        {t('重新上傳提案單解析')}
                      </WsText>
                    </View>
                  )}

                </>
              )}
            </WsPaddingContainer>
          )}
        </View>
      </View>
    );
  };

  const renderGroup = (group: Group) => {
    const isGroupCollapsed = groupCollapsed[group.id] ?? false;
    const isMeetingItemLoading = meetingItemLoadingByGroup[group.id] ?? false;
    const meetingItemList = meetingItemListByGroup[group.id] ?? [];
    const groupMeetingItems =
      (group as any)?.meeting_items ??
      (group as any)?.meetingItems ??
      (group as any)?.articles ??
      [];
    const statusItems = Array.isArray(meetingItemList) && meetingItemList.length > 0
      ? meetingItemList
      : Array.isArray(groupMeetingItems)
        ? groupMeetingItems
        : [];

    const getStatusValue = (value: any) =>
      String(value?.name ?? value ?? '').toUpperCase();

    const hasFailedStatus = statusItems.some(item => {
      const parseStatus = getStatusValue(item?.parse_status);
      const convertStatus = getStatusValue(item?.convert_status);
      return parseStatus === 'FAILED' || convertStatus === 'FAILED';
    });

    const hasProcessingStatus = statusItems.some(item => {
      const parseStatus = getStatusValue(item?.parse_status);
      const convertStatus = getStatusValue(item?.convert_status);
      const isParseComplete =
        parseStatus === 'COMPLETE' || parseStatus === 'COMPLETED';

      const isConvertComplete =
        convertStatus === 'COMPLETE' || convertStatus === 'COMPLETED';

      const isBothComplete = isParseComplete && isConvertComplete;
      if (isBothComplete) return false;
      return (
        (parseStatus === 'PENDING' ||
          parseStatus === 'PROCESSING') ||
        (convertStatus === 'PENDING' ||
          convertStatus === 'PROCESSING')
      );
    });

    const groupStatusText = hasFailedStatus
      ? t('處理失敗')
      : hasProcessingStatus
        ? t('處理中')
        : null;

    const groupStatusTextColor = hasFailedStatus ? $color.danger : $color.gray;
    const groupStatusBackgroundColor = hasFailedStatus
      ? $color.danger11l
      : $color.yellow11l;

    return (
      <View key={group.id} style={{ marginBottom: 16 }}>
        <View
          style={{
            borderRadius: 10,
            borderWidth: 0.6,
            borderColor: $color.black,
            backgroundColor: $color.white,
            overflow: 'hidden',
            marginHorizontal: 16,
          }}
        >
          {/* 外層 header */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => toggleGroup(group.id)}
            style={{
              paddingTop: 8,
              paddingHorizontal: 16,
              paddingBottom: groupCollapsed ? 8 : 0
            }}
          >
            <WsFlex
              justifyContent="space-between"
              alignItems="center"
            >
              <View style={{ flex: 1 }}>
                <WsText>
                  {group.name || t('自訂議案群組名稱')}
                </WsText>
                {groupStatusText && (
                  <View style={{ marginTop: 4, alignSelf: 'flex-start' }}>
                    <WsTag
                      textColor={groupStatusTextColor}
                      backgroundColor={groupStatusBackgroundColor}
                      style={{ borderRadius: 4 }}
                    >
                      {groupStatusText}
                    </WsTag>
                  </View>
                )}

                {
                  hasFailedStatus &&
                  remind && (
                    <>
                      <TouchableOpacity
                        disabled={remindBtnDisabled}
                        onPress={() => {
                          if (!remindBtnDisabled) {
                            setVisible(true)
                          }
                        }}>
                        <WsFlex style={[{ marginTop: 4 }]}>
                          <WsIcon
                            name="md-info-outline"
                            color={$color.danger}
                            style={{
                              marginRight: 6
                            }}
                            size={16}
                          />
                          <WsText
                            style={{
                              paddingRight: 16
                            }}
                            size={10}
                            color={$color.danger}>
                            {remind}
                          </WsText>
                        </WsFlex>
                      </TouchableOpacity>
                      <WsDialog
                        value={remindValue}
                        onChange={setRemindValue}
                        dialogButtonItems={dialogButtonItems}
                        title={dialogTitle}
                        dialogVisible={visible}
                        setDialogVisible={() => {
                          setVisible(false)
                        }}
                        contentHeight={contentHeight}
                        mode={3}
                      >
                        <>
                          <View style={{ marginHorizontal: 16, paddingBottom: 16 }}>
                            <WsFlex flexWrap="wrap">
                              <WsDes size={14}>{`1. ${t('檢查提案單跟提案單範本是否格式一致')}`}</WsDes>
                            </WsFlex>
                          </View>
                        </>
                      </WsDialog>
                    </>
                  )}

              </View>
              <WsIconBtn
                padding={0}
                name={isGroupCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                size={24}
                color={$color.primary3l}
                onPress={() => toggleGroup(group.id)}
              />
            </WsFlex>

          </TouchableOpacity>

          {/* 外層 body：群組展開後的 meetingItem 列表 */}
          {!isGroupCollapsed && (
            <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
              <WsFlex
                style={{
                  marginTop: 8,
                  marginBottom: 8,
                  paddingHorizontal: 4,
                }}
                justifyContent="space-bewteen"
              >
                <WsFlex
                  style={{
                    flex: 1,
                    // borderWidth:1
                  }}
                >
                  <WsIconBtn
                    padding={0}
                    name="md-add"
                    size={24}
                    color={$color.primary}
                    onPress={() => onPressAddGroup?.(group)}
                  />
                  <WsIconBtn
                    padding={0}
                    name="ws-outline-edit-pencil"
                    size={24}
                    style={{ marginLeft: 8 }}
                    color={$color.primary}
                    onPress={() => onPressEditGroup?.(group)}
                  />
                  <WsIconBtn
                    padding={0}
                    name="ws-outline-delete"
                    size={24}
                    style={{ marginLeft: 8 }}
                    color={$color.danger}
                    onPress={() => onPressDeleteGroup?.(group)}
                  />
                </WsFlex>
              </WsFlex>

              {item?.schedule_template?.attach && (
                <View style={{ marginTop: 8 }}>
                  <WsInfo
                    type="link"
                    label={`${t('時序表範本')}  `}
                    value={item?.schedule_template?.name}
                    style={{
                      flexDirection: 'row'
                    }}
                    onPress={() => {
                      console.log('3333')
                      navigation.push('RoutesPDFTool', {
                        screen: 'PDFToolAdminTemplateShow',
                        params: {
                          id: item?.schedule_template?.id,
                        }
                      })
                    }}
                  />
                  <WsInfo
                    type={'filesAndImages'}
                    // label={t('時序表範本')}
                    style={{
                    }}
                    labelColor={$color.gray}
                    value={[item?.schedule_template?.attach]}
                  />
                </View>
              )}

              {contentsTemplateIdSet.size !== 0 && (
                <View style={{ marginTop: 8 }}>
                  <WsInfo
                    label={t('目錄範本區塊')}
                    textSize={
                      isTemplateVariableValid(
                        contentsTemplateIdSet,
                        contentsTemplateValueSet,
                        group?.contents_template_variable
                      )
                        ? 14
                        : 12
                    }
                    textColor={
                      isTemplateVariableValid(
                        contentsTemplateIdSet,
                        contentsTemplateValueSet,
                        group?.contents_template_variable
                      )
                        ? $color.black
                        : $color.danger
                    }
                    labelColor={$color.gray}
                    value={
                      isTemplateVariableValid(
                        contentsTemplateIdSet,
                        contentsTemplateValueSet,
                        group?.contents_template_variable
                      )
                        ? getGroupTemplateValue(group?.contents_template_variable)
                        : t('範本區塊需要重新選擇')
                    }
                  />
                </View>
              )}


              {meetingTemplateIdSet.size !== 0 && (
                <View style={{ marginTop: 8, marginBottom: 16 }}>
                  <WsInfo
                    label={t('議程範本區塊')}
                    style={{
                    }}
                    textColor={
                      isTemplateVariableValid(
                        meetingTemplateIdSet,
                        meetingTemplateValueSet,
                        group?.meeting_template_variable
                      )
                        ? $color.black
                        : $color.danger}
                    labelColor={$color.gray}
                    value={
                      isTemplateVariableValid(
                        meetingTemplateIdSet,
                        meetingTemplateValueSet,
                        group?.meeting_template_variable
                      )
                        ? getGroupTemplateValue(group?.meeting_template_variable)
                        : t('所對應範本區塊需要重新選擇')
                    }
                  />
                </View>
              )}

              {isMeetingItemLoading ? (
                <View style={{ marginTop: 8 }}>
                  <WsSkeleton />
                </View>
              ) : (
                meetingItemList && meetingItemList.map(meetingItem => renderListItem(group, meetingItem))
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <>
      <View style={style}>
        {sourceGroups.map(renderGroup)}
      </View>

      {/* 編輯議案 Modal（簡化版，先保留骨架） */}
      <WsModal
        title={t('編輯議案')}
        visible={editMotionModalVisible}
        headerLeftOnPress={closeEditMeetingItemModal}
        onBackButtonPress={closeEditMeetingItemModal}
        headerRightOnPress={submitEditMeetingItem}
        headerRightText={t('送出')}
        avoidKeyboard={false}
        childrenScroll={false}
      >
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <WsState
            type="text"
            style={{
              marginTop: 16,
            }}
            label={t('名稱')}
            value={editMeetingItemName}
            onChange={setEditMeetingItemName}
            rules={'required'}
            remind={t('注意，​修改​以​下​欄​位​會讓​提案​單​跟​欄位​不​一​致​​​')}
            remindBtnDisabled={true}
            remindColor={$color.danger}
          />

          <WsState
            style={{
              marginTop: 16,
            }}
            label={t('項目符號')}
            type="belongsto"
            modelName={'item_label_type'}
            serviceIndexKey={'index'}
            nameKey={'name'}
            hasMeta={false}
            value={editMeetingItemLabel}
            params={{
            }}
            onChange={setEditMeetingItemLabel}
          />

          <WsState
            type="text"
            style={{
              marginTop: 8,
            }}
            label={t('提案單位')}
            value={editMeetingItemUnit}
            onChange={setEditMeetingItemUnit}
          />

          <WsState
            type="text"
            multiline={true}
            style={{
              marginTop: 8,
            }}
            label={t('報告人')}
            value={editMeetingItemPresenter}
            onChange={setEditMeetingItemPresenter}
            keyboardAwareRef={scrollRef}
          />

          <WsState
            type="text"
            multiline={true}
            style={{
              marginTop: 8,
            }}
            label={t('列席人員')}
            value={editMeetingItemAttendeesPresent}
            onChange={setEditMeetingItemAttendeesPresent}
            keyboardAwareRef={scrollRef}
          />

          <WsState
            style={{
              marginTop: 16,
            }}
            type="Ll_filesAndImages"
            label={t('附件')}
            modelName="meeting"
            limitFileExtension={'pdf'}
            exportAttachmentName={true}
            value={motionFiles}
            onChange={$event => {
              setMotionFiles($event)
            }}
          />

          <WsState
            type="text"
            multiline={true}
            style={{
              marginTop: 8,
            }}
            label={t('決議-​簡述')}
            value={editMeetingItemResolutionSummary}
            onChange={setEditMeetingItemResolutionSummary}
            keyboardAwareRef={scrollRef}
          />

          <WsState
            type="text"
            multiline={true}
            style={{
              marginTop: 8,
            }}
            label={t('決議-​詳述')}
            value={editMeetingItemResolutionDetails}
            onChange={setEditMeetingItemResolutionDetails}
            keyboardAwareRef={scrollRef}
          />

          <View
            style={{
              height: 100,
            }}
          />
        </ScrollView>
      </WsModal>

      <WsModal
        title={t('更新提案單')}
        visible={updateProposalModalVisible}
        headerLeftOnPress={closeUpdateProposalModal}
        onBackButtonPress={closeUpdateProposalModal}
        footerBtnLeftText={t('取消')}
        footerBtnLeftOnPress={closeUpdateProposalModal}
        footerBtnRightText={t('確定')}
        footerBtnRightOnPress={() => {
          submitUpdateProposal()
        }}
        avoidKeyboard={false}
        childrenScroll={false}
      >
        <View
          style={{
            marginVertical: 16,
            paddingHorizontal: 16,
          }}
        >
          {updateFileData && (
            <WsInfo
              style={{
                marginTop: 8,
              }}
              label={t('已上傳提案單')}
              value={updateFileOriginalName || decodeURI(updateFileData?.name)}
            >
            </WsInfo>
          )}
          <WsUpdateBtn
            onPress={() => {
              pickWordFile()
            }}
          >
            {t('上傳')}
          </WsUpdateBtn>
          <WsDes
            color={$color.gray}
            style={{
              paddingTop: 8
            }}>
            {`${t('檔案大小限制')} ≤ 30MB`}
          </WsDes>

          <TouchableOpacity
            disabled={true}
          >
            <WsFlex
              style={[false ? null : { marginTop: 4 }]}
            >
              <WsIcon
                name="md-info-outline"
                color={$color.danger}
                style={{
                  marginRight: 6
                }}
                size={18}
              />
              <WsText
                style={{
                  paddingRight: 16
                }}
                size={12}
                color={$color.danger}>
                {t('注意，​重新​上傳​提案​單，​會覆​蓋​標題、​提案​單位、​報告人、​列席​人員、​內容​等​')}
              </WsText>
            </WsFlex>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={true}
          >
            <WsFlex
              style={[false ? null : { marginTop: 4 }]}
            >
              <WsIcon
                name="md-info-outline"
                color={$color.danger}
                style={{
                  marginRight: 6
                }}
                size={18}
              />
              <WsText
                style={{
                  paddingRight: 16
                }}
                size={12}
                color={$color.danger}>
                {t('注意，提案單需與提案單範本一致​')}
              </WsText>
            </WsFlex>
          </TouchableOpacity>

        </View>
      </WsModal>
    </>
  );
};

export default LlPDFMotionGroupCard001;
