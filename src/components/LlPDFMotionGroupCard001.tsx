import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Alert } from 'react-native';
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
  WsUpdateBtn
} from '@/components';
import $color from '@/__reactnative_stone/global/color';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import JoditEditor from 'views/PDFTool/JoditEditor';
import S_MeetingItemGroup from '@/services/api/v1/meeting_item_group';
import S_MeetingItem from '@/services/api/v1/meeting_item';
import { pick } from '@react-native-documents/picker';

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
  onPressCreateVersion?: (motion: Motion) => void;
  onPressDeleteGroup?: (group: Group) => void;
  onPressDeleteMeetingItem?: (group: Group, meetingItem: Motion) => void;
  refreshKey?: number;
  meeting?: any;
};

// -------------------- Component 本體 --------------------

const initialMeetingItemContent = '<p>這是原始 HTML</p>';

const LlPDFMotionGroupCard001: React.FC<Props> = ({
  style,
  item,
  groups,
  onPressAddGroup,
  onPressEditGroup,
  onPressDeleteGroup,
  onPressDeleteMeetingItem,
  refreshKey,
  meeting,
}) => {
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

  const getGroupTemplateId = (value: any) => value?.id ?? value ?? null
  const getGroupTemplateValue = (value: any) =>
    value?.value ??
    value?.meeting_template_field?.value ??
    value?.name ??
    value ??
    null

  const contentsTemplateItems = getTemplateItems(meeting?.contents_template)
  const meetingTemplateItems = getTemplateItems(meeting?.meeting_template)
  const contentsTemplateIdSet = new Set(
    contentsTemplateItems.map((item: any) => item?.id).filter(Boolean)
  )
  const contentsTemplateValueSet = new Set(
    contentsTemplateItems
      .map((item: any) => item?.value ?? item?.meeting_template_field?.value ?? item)
      .filter(Boolean)
  )
  const meetingTemplateIdSet = new Set(
    meetingTemplateItems.map((item: any) => item?.id).filter(Boolean)
  )
  const meetingTemplateValueSet = new Set(
    meetingTemplateItems
      .map((item: any) => item?.value ?? item?.meeting_template_field?.value ?? item)
      .filter(Boolean)
  )

  // 內外層收合狀態
  const [groupCollapsed, setGroupCollapsed] = useState<Record<string, boolean>>({});
  const [motionCollapsed, setMotionCollapsed] = useState<Record<string, boolean>>({});
  const [meetingItemListByGroup, setMeetingItemListByGroup] = useState<Record<string, Motion[]>>({});
  const [meetingItemLoadingByGroup, setMeetingItemLoadingByGroup] = useState<Record<string, boolean>>({});
  const [meetingItemRefreshingIds, setMeetingItemRefreshingIds] = useState<Record<string, boolean>>({});
  const [meetingItemRefreshTimes, setMeetingItemRefreshTimes] = useState<Record<string, string>>({});
  const [editMotionModalVisible, setEditMotionModalVisible] = useState(false);
  const [editingMotion, setEditingMotion] = useState<Motion | null>(null);

  const [motionFiles, setMotionFiles] = useState<Array>([]);
  const [exportAttachmentName, setExportAttachmentName] = useState<boolean>(false);

  const [updateProposalModalVisible, setUpdateProposalModalVisible] = useState(false)
  const [updateProposalTargetMotion, setUpdateProposalTargetMotion] = useState<Motion | null>(null)
  const [updateFileData, setUpdateFileData] = useState();
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


  const openUpdateProposalModal = (group: Group, motion: Motion) => {
    setUpdateProposalTargetMotion(motion)
    setUpdateMeetingItemId(motion?.id ?? null)
    setUpdateProposalGroupId(group?.id ?? null)
    setUpdateFileData(undefined)
    setUpdateProposalModalVisible(true)
  }

  const closeUpdateProposalModal = () => {
    setUpdateProposalModalVisible(false)
    setUpdateProposalTargetMotion(null)
    setUpdateMeetingItemId(null)
    setUpdateProposalGroupId(null)
    setUpdateFileData(undefined)
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

  const normalizeFileName = (name: string) => {
    if (!name) return 'file';
    return name
      .trim()
      .replace(/\s+/g, '_'); // ✅ 只處理空白 → _
  };

  const pickWordFile = async () => {
    try {
      const res = await pick({
        mode: 'import',
        mimeTypes: [
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
        ]
      })
      if (!res || res.length === 0) {
        return
      }
      const fileUri = res[0].uri
      const originalName = res[0].name || ''
      const safeFileName = normalizeFileName(originalName)
      if (!safeFileName.toLowerCase().endsWith('.docx')) {
        Alert.alert(t('請選擇 .docx 檔案'))
        return
      }
      const fileType =
        res[0].type ||
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      setUpdateFileData({
        uri: fileUri,
        name: safeFileName,
        type: fileType,
      })
    } catch (err) {
      const isCancel =
        err?.code === 'DOCUMENT_PICKER_CANCELED' ||
        err?.message?.includes('user canceled') ||
        err?.message?.includes('The operation was cancelled')
      if (!isCancel) {
        console.error('❌ 發生其他錯誤:', err)
      }
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
    formData.append('factory', currentFactory.id);
    formData.append('item_label', readableItemLabel);
    formData.append('file', updateFileData);
    const _params = {
      formData: formData,
      meeting_item_it: updateMeetingItemId
    }
    console.log(_params, 'formData---')
    try {
      await S_MeetingItem.updateMeetingItemWord({ params: _params })
      closeUpdateProposalModal()
      if (updateProposalGroupId) {
        await fetchMeetingItemList(updateProposalGroupId)
      }
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
    const getId = (value: any) => value?.id ?? value ?? null
    const normalizeAttaches = (items: any[] = []) => {
      return items
        .map((item, index) => {
          const fileId =
            item?.file?.id ??
            item?.file_id ??
            item?.file ??
            null
          if (!fileId) return null
          const fileVersionId =
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
            name: item?.name ?? item?.file?.name ?? '',
            has_frame: item?.has_frame ?? false,
          }
        })
        .filter(Boolean)
    }
    const payload = {
      name: editMeetingItemName,
      sequence: editMeetingItemSequence,
      factory: currentFactory?.id ?? null,
      item_label: getId(editMeetingItemLabel),
      presenter: editMeetingItemPresenter,
      meeting_item_unit: getId(editMeetingItemUnit),
      attendees_present: editMeetingItemAttendeesPresent,
      resolution_summary: editMeetingItemResolutionSummary,
      resolution_details: editMeetingItemResolutionDetails,
      meeting_item_attaches: normalizeAttaches(motionFiles),
    }
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
      console.log(_res, 'S_MeetingItemGroup.show')
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
      if (!completeItems.length) {
        setMeetingItemListByGroup(prev => ({
          ...prev,
          [groupId]: list,
        }));
        return;
      }
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
        if (itemId) detailMap.set(itemId, detail as Motion);
      });
      const merged = list.map(item => {
        const detail = detailMap.get(item.id);
        return detail ? { ...item, ...detail } : item;
      });
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

  const toggleGroup = (groupId: string) => {
    const isCollapsed = groupCollapsed[groupId] ?? false;
    if (isCollapsed) {
      fetchMeetingItemGroup(groupId);
      fetchMeetingItemList(groupId);
    }
    setGroupCollapsed(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleMeetingItem = (meetingItemId: string) => {
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
    setMotionFiles(meetingItem?.meeting_item_attaches ?? [])
    setEditMotionModalVisible(true);
  };

  const renderListItem = (group: Group, meetingItem: Motion) => {
    const isMeetingItemCollapsed = motionCollapsed[meetingItem.id] ?? true;
    const isMeetingItemRefreshing = meetingItemRefreshingIds[meetingItem.id] ?? false;
    const formatList = (input: any) => {
      if (!input) return '-';
      if (Array.isArray(input)) {
        return input
          .map(item => item?.name ?? item?.label ?? item?.title ?? item)
          .filter(Boolean)
          .join(', ');
      }
      if (input?.name) return input.name;
      return input;
    };
    const itemLabelName =
      meetingItem?.item_label?.name ??
      meetingItem?.item_label ??
      '-';
    const meetingItemName = meetingItem?.name ?? '-';
    const presenter = meetingItem?.presenter ?? '-';
    const meetingItemUnit =
      meetingItem?.meeting_item_unit?.name ??
      meetingItem?.meeting_item_unit ??
      '-';
    const attendeesPresent = formatList(meetingItem?.attendees_present);
    const attendeesInvited = formatList(meetingItem?.attendees_invited);
    const resolutionSummary = meetingItem?.resolution_summary ?? '-';
    const resolutionDetails = meetingItem?.resolution_details ?? '-';
    const updatedAtValue = meetingItem?.updated_at ?? meetingItem?.updatedAt ?? null;
    const apiUpdatedAtText = updatedAtValue
      ? moment(updatedAtValue).format('YYYY-MM-DD HH:mm:ss')
      : '-';
    const updatedAtText = meetingItemRefreshTimes[meetingItem.id] ?? apiUpdatedAtText;
    const isConvert =
      meetingItem?.is_convert === true
        ? t('是')
        : meetingItem?.is_convert === false
          ? t('否')
          : '-';
    const rawParseStatus =
      meetingItem?.parse_status?.name ??
      meetingItem?.parse_status ??
      null;
    const parseStatus = rawParseStatus ?? '-';
    const parseStatusValue = String(rawParseStatus).toUpperCase();
    const isProcessing = parseStatusValue === 'PROCESSING';
    const isFailed = parseStatusValue === 'FAILED';

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
            onPress={() => toggleMeetingItem(meetingItem.id)}
          >
            <WsFlex
              style={{ paddingVertical: 12, paddingHorizontal: 12 }}
              justifyContent="space-between"
              alignItems="center"
            >
              <WsFlex alignItems="center">
                <WsText style={{ paddingRight: 28 }}>
                  {meetingItem?.name ?? itemLabelName ?? t('項目名稱')}
                </WsText>
              </WsFlex>

            </WsFlex>

            <View
              style={{
                position: 'absolute',
                top: 8,
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
                    <WsIconBtn
                      padding={0}
                      name="md-refresh"
                      size={24}
                      color={$color.primary}
                      style={{ marginRight: 8 }}
                      onPress={() => refreshMeetingItem(group.id, meetingItem.id)}
                    />

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
                      label={t('項目名稱')}
                      style={{ flexDirection: 'row', alignItem: 'center' }}
                      labelColor={$color.gray}
                      value={itemLabelName}
                    />
                  </View>

                  <View style={{ marginTop: 8 }}>
                    <WsInfo
                      label={t('名稱')}
                      style={{ flexDirection: 'row', alignItem: 'center' }}
                      labelColor={$color.gray}
                      value={meetingItemName}
                    />
                  </View>

                  <View style={{ marginTop: 8 }}>
                    <WsInfo
                      label={t('報告人')}
                      style={{ flexDirection: 'row', alignItem: 'center' }}
                      labelColor={$color.gray}
                      value={presenter}
                    />
                  </View>

                  <View style={{ marginTop: 8 }}>
                    <WsInfo
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
                      style={{
                        flexDirection: 'row',
                        alignItem: 'center',
                        flexWrap: 'wrap',
                      }}
                      label={t('列席單位/列席人員')}
                      labelColor={$color.gray}
                      value={attendeesInvited}
                    />
                  </View>

                  <View style={{ marginTop: 8 }}>
                    <WsInfo
                      label={t('決議-簡述')}
                      labelColor={$color.gray}
                      value={resolutionSummary}
                    />
                  </View>

                  <View style={{ marginTop: 8 }}>
                    <WsInfo
                      label={t('決議-詳述')}
                      labelColor={$color.gray}
                      value={resolutionDetails}
                    />
                  </View>

                  <View style={{ marginTop: 8 }}>
                    <WsInfo
                      label={t('是否轉檔中')}
                      labelColor={$color.gray}
                      value={isConvert}
                    />
                  </View>

                  <View style={{ marginTop: 8 }}>
                    <WsInfo
                      label={t('解析狀態')}
                      labelColor={$color.gray}
                      value={parseStatus}
                    />
                  </View>
                  {isProcessing && (
                    <View style={{ marginTop: 8 }}>
                      <LlPDFConvertingCard001 />
                    </View>
                  )}

                  <View style={{ marginTop: 8 }}>
                    <WsInfo
                      label={t('更新時間')}
                      labelColor={$color.gray}
                      value={updatedAtText}
                    />
                  </View>

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

    return (
      <View key={group.id} style={{ marginBottom: 16 }}>
        <View
          style={{
            borderRadius: 10,
            borderWidth: 0.5,
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
              <WsText
                style={{
                  flex: 1,
                }}
              >
                {group.name || t('自訂議案群組名稱')}
              </WsText>
              <WsIconBtn
                padding={0}
                name={isGroupCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                size={24}
                color={$color.primary3l}
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
                    flex: 1
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

              <View style={{ marginTop: 8 }}>
                <WsInfo
                  type={'filesAndImages'}
                  label={t('時序表範本')}
                  style={{
                  }}
                  labelColor={$color.gray}
                  value={[item?.schedule_template?.attach]}
                />
              </View>

              <View style={{ marginTop: 8 }}>
                <WsInfo
                  label={t('此​議案​群​組​對應​的​目錄​範本​區塊​')}
                  style={{
                  }}
                  labelColor={$color.gray}
                  value={
                    (contentsTemplateIdSet.has(getGroupTemplateId(group?.contents_template_variable)) ||
                      contentsTemplateValueSet.has(getGroupTemplateValue(group?.contents_template_variable)))
                      ? getGroupTemplateValue(group?.contents_template_variable)
                      : t('範本區塊需要重新選擇')
                  }
                />
              </View>

              <View style={{ marginTop: 8, marginBottom: 16 }}>
                <WsInfo
                  label={t('此議案群組對應的議程範本區塊')}
                  style={{
                  }}
                  textColor={
                    (meetingTemplateIdSet.has(getGroupTemplateId(group?.meeting_template_variable)) ||
                      meetingTemplateValueSet.has(getGroupTemplateValue(group?.meeting_template_variable)))
                      ? $color.gray
                      : $color.danger}
                  labelColor={$color.gray}
                  value={
                    (meetingTemplateIdSet.has(getGroupTemplateId(group?.meeting_template_variable)) ||
                      meetingTemplateValueSet.has(getGroupTemplateValue(group?.meeting_template_variable)))
                      ? getGroupTemplateValue(group?.meeting_template_variable)
                      : t('所對應範本區塊需要重新選擇')
                  }
                />
              </View>
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

          {/* <WsText
            style={{
              marginTop: 16,
            }}>{t('內容')}
          </WsText>
          <JoditEditor
            initialHtml={initialMeetingItemContent}
            onChange={(html) => {
              console.log('edited HTML:', html);
              // setContent(html); // 你也可以存到 state / 丟回後端
            }}
          /> */}

          <WsState
            style={{
              marginTop: 16,
            }}
            type="checkbox"
            label={t('是否​匯出​附件​名​稱')}
            value={exportAttachmentName}
            onChange={$event => {
              setExportAttachmentName($event)
            }}
          />

          <WsState
            style={{
              marginTop: 16,
            }}
            type="Ll_filesAndImages"
            label={t('附件')}
            modelName="meeting"
            exportAttachmentName={exportAttachmentName}
            value={motionFiles}
            onChange={$event => {
              console.log($event, 'event--')
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
              label={t('更新提案單')}
              value={updateFileData.name}
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
        </View>
      </WsModal>
    </>
  );
};

export default LlPDFMotionGroupCard001;
