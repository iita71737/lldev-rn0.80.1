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
  WsDialog,
  WsLoading
} from '@/components';
import $color from '@/__reactnative_stone/global/color';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import S_MeetingItemGroup from '@/services/api/v1/meeting_item_group';
import S_MeetingItem from '@/services/api/v1/meeting_item';
import S_Meeting from '@/services/api/v1/meeting';
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
  dialogTitle = '處理失敗建議',
  contentHeight
}) => {
  const navigation = useNavigation()
  const { t } = useTranslation();
  const scrollRef = useRef<KeyboardAwareScrollView | null>(null);
  const currentFactory = useSelector(state => state.data.currentFactory);
  const currentUserScope = useSelector(state => state.data.userScopes);
  const currentUser = useSelector(state => state.data.currentUser);
  const canUpdateMeeting =
    Array.isArray(currentUserScope) &&
    (currentUserScope.includes('meeting-update') ||
      (currentUserScope.includes('meeting-update-owner') &&
        !!meeting?.owner?.id &&
        meeting?.owner?.id === currentUser?.id));

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
  const [meetingItemReParsingIds, setMeetingItemReParsingIds] = useState<Record<string, boolean>>({});
  const [meetingItemRefreshTimes, setMeetingItemRefreshTimes] = useState<Record<string, string>>({});
  const [meetingItemAttachesById, setMeetingItemAttachesById] = useState<Record<string, any[]>>({});
  const [editMotionModalVisible, setEditMotionModalVisible] = useState(false);
  const [editingMotion, setEditingMotion] = useState<Motion | null>(null);

  const [motionFiles, setMotionFiles] = useState<Array>([]);

  const [updateProposalModalVisible, setUpdateProposalModalVisible] = useState(false)
  const [updateProposalTargetMotion, setUpdateProposalTargetMotion] = useState<Motion | null>(null)
  const [updateUploadMode, setUpdateUploadMode] = useState<'proposal' | 'convert_attach'>('proposal')
  const [updateFileData, setUpdateFileData] = useState();

  const [updateFileOriginalName, setUpdateFileOriginalName] = useState('');
  const [updateMeetingItemId, setUpdateMeetingItemId] = useState<string | null>(null)
  const [updateProposalGroupId, setUpdateProposalGroupId] = useState<string | null>(null)
  const [editMeetingItemName, setEditMeetingItemName] = useState<string | null>(null)
  const [editMeetingItemSequence, setEditMeetingItemSequence] = useState<string | null>(null)

  const [editMeetingItemLabel, setEditMeetingItemLabel] = useState<any>(null)
  const [editMeetingItemPresenter, setEditMeetingItemPresenter] = useState(null)
  const [editMeetingItemUnit, setEditMeetingItemUnit] = useState<any>(null)
  const [editMeetingItemAttendeesPresent, setEditMeetingItemAttendeesPresent] = useState(null)
  const [editMeetingItemResolutionSummary, setEditMeetingItemResolutionSummary] = useState(null)
  const [editMeetingItemResolutionDetails, setEditMeetingItemResolutionDetails] = useState(null)
  const [editMeetingItemGroupId, setEditMeetingItemGroupId] = useState<string | null>(null)
  const [editMeetingItemSubmitting, setEditMeetingItemSubmitting] = useState(false)

  const [visible, setVisible] = React.useState(false)
  const [remindValue, setRemindValue] = React.useState()

  const openUpdateProposalModal = (group: Group, motion: Motion) => {
    setUpdateUploadMode('proposal')
    setUpdateProposalTargetMotion(motion)
    setUpdateMeetingItemId(motion?.id ?? null)
    setUpdateProposalGroupId(group?.id ?? null)
    setUpdateFileData(undefined)
    setUpdateFileOriginalName('')
    setUpdateProposalModalVisible(true)
  }

  const openUpdateConvertAttachModal = (group: Group, motion: Motion) => {
    setUpdateUploadMode('convert_attach')
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
    setEditMeetingItemName(null)
    setEditMeetingItemSequence(null)
    setEditMeetingItemLabel(null)
    setEditMeetingItemPresenter(null)
    setEditMeetingItemUnit(null)
    setEditMeetingItemAttendeesPresent(null)
    setEditMeetingItemResolutionSummary(null)
    setEditMeetingItemResolutionDetails(null)
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

  const updateConvertAttach = (group: Group, meetingItem: Motion | null) => {
    if (!meetingItem?.id) {
      Alert.alert(t('請先選擇議案'))
      return
    }
    openUpdateConvertAttachModal(group, meetingItem)
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
      const _res = updateUploadMode === 'convert_attach'
        ? await S_MeetingItem.updateConvertAttach({ params: _params })
        : await S_MeetingItem.updateMeetingItemWord({ params: _params })
      closeUpdateProposalModal()
      if (updateProposalGroupId) {
        console.log(updateProposalGroupId, 'updateProposalGroupId')
        await fetchMeetingItemList(updateProposalGroupId)
      }
      console.log(JSON.stringify(_res), 'S_MeetingItem update')
      Alert.alert(
        updateUploadMode === 'convert_attach'
          ? t('更新成功')
          : t('更新成功，伺服器正在處理中，請到匯出紀錄確認處理狀態')
      )
      setTimeout(() => {
        onRequestMeetingItemsAll?.()
      }, 300)
    } catch (e) {
      console.error(e);
    }
  }

  const submitEditMeetingItem = async () => {
    if (editMeetingItemSubmitting) return
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
            has_frame: item?.export_attachment_name_enabled ?? true,
          }
        })
        .filter(Boolean)
    }
    const payload = {
      name: editMeetingItemName,
      sequence: editMeetingItemSequence ? editMeetingItemSequence : undefined,
      factory: currentFactory?.id ?? null,
      item_label: editMeetingItemLabel,
      presenter: editMeetingItemPresenter,
      meeting_item_unit: editMeetingItemUnit,
      attendees_present: editMeetingItemAttendeesPresent,
      resolution_summary: editMeetingItemResolutionSummary,
      resolution_details: editMeetingItemResolutionDetails,
      meeting_item_attaches: normalizeAttaches(motionFiles),
    }
    console.log(editingMotion?.id, 'modelId=-')
    console.log(JSON.stringify(payload), 'meeting-item-payload--')
    try {
      setEditMeetingItemSubmitting(true)
      await S_MeetingItem.update({
        data: payload,
        modelId: editingMotion.id
      })
      if (editMeetingItemGroupId) {
        await fetchMeetingItemList(editMeetingItemGroupId)
      }
      closeEditMeetingItemModal()
      Alert.alert(t('更新成功'))
    } catch (e) {
      console.error(e)
    } finally {
      setEditMeetingItemSubmitting(false)
      onRequestMeetingItemsAll?.()
    }
  }

  const fetchMeetingItemGroup = async (groupId: string) => {
    try {
      console.log('S_MeetingItemGroup.show request', { groupId })
      const _res = await S_MeetingItemGroup.show({ modelId: groupId });
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

  const openEditMeetingItemModal = (
    group: Group,
    meetingItem: Motion,
    meetingItemIndex: number,
  ) => {
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
    const sequenceText = String(meetingItemIndex + 1).padStart(4, '0')
    setEditMeetingItemSequence(sequenceText)

    setEditMeetingItemLabel(meetingItem?.item_label)
    setEditMeetingItemPresenter(meetingItem?.presenter ?? null)
    setEditMeetingItemUnit(meetingItem?.meeting_item_unit ?? null)
    setEditMeetingItemAttendeesPresent(toText(meetingItem?.attendees_present) || null)
    setEditMeetingItemResolutionSummary(meetingItem?.resolution_summary ?? null)
    setEditMeetingItemResolutionDetails(meetingItem?.resolution_details ?? null)
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

  const renderListItem = (group: Group, meetingItem: Motion, meetingItemIndex: number) => {
    const isMeetingItemCollapsed = motionCollapsed[meetingItem.id] ?? true;
    const isMeetingItemRefreshing = meetingItemRefreshingIds[meetingItem.id] ?? false;
    const isMeetingItemReParsing = meetingItemReParsingIds[meetingItem.id] ?? false;
    const meetingItemAttaches =
      meetingItemAttachesById[meetingItem.id] ??
      meetingItem?.meeting_item_attaches ??
      [];

    const meetingItemExportAttachHasFrame = Array.isArray(meetingItemAttaches)
      ? meetingItemAttaches
        .map(attach => attach?.has_frame)
      : [];

    const meetingItemExportAttachName = Array.isArray(meetingItemAttaches)
      ? meetingItemAttaches
        .map(attach => attach?.name)
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
    const parseStatusValue = String(rawParseStatus).toUpperCase();
    const convertStatusValue = String(rawConvertStatus).toUpperCase();
    const isParseProcessing =
      parseStatusValue === 'PENDING' || parseStatusValue === 'PROCESSING';
    const isConvertProcessing =
      convertStatusValue === 'PENDING' || convertStatusValue === 'PROCESSING';
    const isParseFailed = parseStatusValue === 'FAILED';
    const isConvertFailed = convertStatusValue === 'FAILED';
    const hasFailedStatus = isParseFailed || isConvertFailed;
    const failedTitle = isParseFailed
      ? t('解析失敗')
      : isConvertFailed
        ? t('轉檔失敗')
        : '';
    const failedReasonText = isParseFailed
      ? t('檢查提案單跟提案單範本是否格式一致')
      : isConvertFailed
        ? t('檢查議程範本是否設定正確')
        : '';

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
    const meetingItemExportAttachStatusTagText = statusTagText;
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
              style={{ paddingHorizontal: 16, paddingBottom: 12 }}
            >
              {isMeetingItemRefreshing ? (
                <View style={{ marginTop: 8 }}>
                  <WsSkeleton />
                </View>
              ) : (
                <>
                  {canUpdateMeeting && (
                    <WsFlex
                      style={{
                        paddingTop: statusTagText ? 8 : 0,
                      }}
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <WsFlex>
                        <WsIconBtn
                          padding={0}
                          name="ws-outline-edit-pencil"
                          size={24}
                          color={$color.primary}
                          style={{ marginLeft: 0 }}
                          onPress={() => openEditMeetingItemModal(group, meetingItem, meetingItemIndex)}
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
                    </WsFlex>
                  )}

                  {hasFailedStatus && (
                    <>
                      <TouchableOpacity
                        disabled={remindBtnDisabled}
                        onPress={() => {
                          if (!remindBtnDisabled) {
                            setVisible(true)
                          }
                        }}>
                        <WsFlex
                          style={[{
                            marginTop: 8,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: $color.danger11l,
                            borderRadius: 10,
                            backgroundColor: $color.danger11l
                          }]}
                        >
                          <View style={{}}>
                            <WsText size={14} fontWeight="600" color={$color.danger}>
                              {failedTitle}
                            </WsText>
                            <WsFlex flexWrap="wrap" style={{ marginTop: 4 }}>
                              <WsText size={14} color={$color.danger}>{`1. ${failedReasonText}`}</WsText>
                            </WsFlex>
                          </View>
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
                          <View style={{ paddingBottom: 16 }}>
                            <WsText size={14} fontWeight="600" style={{}}>
                              {failedTitle}
                            </WsText>
                            <WsFlex flexWrap="wrap" style={{ marginTop: 4 }}>
                              <WsDes size={14}>{`1. ${failedReasonText}`}</WsDes>
                            </WsFlex>
                          </View>
                        </>
                      </WsDialog>
                    </>
                  )}

                  <View style={{ marginTop: 8 }}>
                    <WsInfo
                      labelWidth={80}
                      label={t('編輯時間')}
                      style={{ flexDirection: 'row', alignItem: 'center' }}
                      labelColor={$color.gray}
                      value={meetingItem.updated_at ? moment(meetingItem.updated_at).format('YYYY-MM-DD HH:mm:ss') : '-'}
                    />
                  </View>

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

                  <View style={{ marginTop: 8 }}>
                    <WsInfo
                      labelWidth={80}
                      label={t('報告人')}
                      style={{ flexDirection: 'row', alignItem: 'center', flexWrap: 'wrap' }}
                      labelColor={$color.gray}
                      value={presenter}
                    />
                  </View>

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

                  {meetingItemAttachesValue.length > 0 ? (
                    <View style={{ marginTop: 8 }}>
                      <WsInfo
                        type={'filesAndImages'}
                        hasFrame={meetingItemExportAttachHasFrame}
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

                  {/* <View style={{ marginTop: 8 }}>
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

                  <View
                    style={{
                      height: 1,
                      backgroundColor: $color.white2d,
                      marginTop: 16,
                    }}
                  /> */}

                  {meetingItem?.original_attach && (
                    <View style={{ marginTop: 8 }}>
                      <WsInfo
                        type={'filesAndImages'}
                        label={t('提案單')}
                        labelColor={$color.gray}
                        value={[meetingItem?.original_attach]}
                        labelBtnIcon="ws-outline-cloud-upload"
                        labelBtnOnPress={() => openUpdateProposalModal(group, meetingItem)}
                      />
                    </View>
                  )}

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
                        label={t('調整檔 (DOCX)')}
                        labelColor={$color.gray}
                        value={[meetingItem?.convert_attach]}
                        labelBtnIcon="ws-outline-cloud-upload"
                        labelBtnOnPress={() => updateConvertAttach(group, meetingItem)}
                      />
                    </View>
                  )}

                  {isComplete && meetingItem?.convert_pdf_attach && (
                    <View style={{ marginTop: 8 }}>
                      <WsInfo
                        type={'filesAndImages'}
                        label={t('議案 (PDF)')}
                        labelColor={$color.gray}
                        value={[meetingItem?.convert_pdf_attach]}
                      />
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

    const hasFailedStatusGroup = statusItems.some(item => {
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

    const groupStatusText = hasFailedStatusGroup
      ? t('處理失敗')
      : hasProcessingStatus
        ? t('處理中')
        : null;

    const groupStatusTextColor = hasFailedStatusGroup ? $color.danger : $color.gray;
    const groupStatusBackgroundColor = hasFailedStatusGroup
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
                <WsText fontWeight="600">
                  {group.name || t('自訂議案群組名稱')}
                </WsText>
                {groupStatusText &&
                  (
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
              {canUpdateMeeting && (
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
              )}

              {item?.schedule_template?.attach && (
                <View style={{
                  marginLeft: 8,
                  marginTop: 8
                }}>
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
                </View>
              )}

              {contentsTemplateIdSet.size !== 0 && (
                <View style={{
                  marginLeft: 8,
                  marginTop: 8
                }}>
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
                <View style={{
                  marginLeft: 8,
                  marginTop: 8,
                }}>
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
                meetingItemList && meetingItemList.map((meetingItem, index) => (
                  renderListItem(group, meetingItem, index)
                ))
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
        {editMeetingItemSubmitting && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              zIndex: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <WsLoading />
          </View>
        )}
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
            value={editMeetingItemName ?? ''}
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
            onChange={value => setEditMeetingItemUnit(value ? value : null)}
          />

          <WsState
            type="text"
            multiline={true}
            style={{
              marginTop: 8,
            }}
            label={t('報告人')}
            value={editMeetingItemPresenter}
            onChange={value => setEditMeetingItemPresenter(value ? value : null)}
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
            onChange={value => setEditMeetingItemAttendeesPresent(value ? value : null)}
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
            remindColor={$color.danger}
            remind={t('附件加密 或 附件無法編輯 會造成匯出失敗')}
          />

          {/* <WsState
            type="text"
            multiline={true}
            style={{
              marginTop: 8,
            }}
            label={t('決議-​簡述')}
            value={editMeetingItemResolutionSummary}
            onChange={value => setEditMeetingItemResolutionSummary(value ? value : null)}
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
            onChange={value => setEditMeetingItemResolutionDetails(value ? value : "")}
            keyboardAwareRef={scrollRef}
          /> */}

          <View
            style={{
              height: 100,
            }}
          />
        </ScrollView>
      </WsModal>

      <WsModal
        title={updateUploadMode === 'convert_attach' ? t('上傳') : t('更新提案單')}
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
              label={updateUploadMode === 'convert_attach' ? t('已上傳匯出調整檔') : t('已上傳提案單')}
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

          {updateUploadMode !== 'convert_attach' && (
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
                  {t('注意，重新上傳提案單，會覆蓋調整檔 (DOCX)、標題、提案單位、報告人、列席人員、內容等​')}
                </WsText>
              </WsFlex>
            </TouchableOpacity>
          )}
          {updateUploadMode !== 'convert_attach' && (
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
          )}
        </View>
      </WsModal>
    </>
  );
};

export default LlPDFMotionGroupCard001;
