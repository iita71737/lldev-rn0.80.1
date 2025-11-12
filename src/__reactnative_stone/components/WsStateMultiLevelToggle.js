// WsStateMultiLevelToggle.js
import React from 'react';
import {
  View, Text, StyleSheet, Modal,
  TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { WsIcon, WsText, WsToggleBtn } from '@/components';
import $color from '@/__reactnative_stone/global/color';

const INDENT = 16;

const defaultGetId = (n) => n?.id;
const defaultGetName = (n) => n?.name ?? '';
const defaultGetChildren = (n) => Array.isArray(n?.question_setting_items) ? n.question_setting_items : [];
const defaultGetHasRemark = (n) => n?.has_remark === 1;

const WsStateMultiLevelToggle = ({
  visible = false,
  title = '請選擇',
  items = [],

  /** ─── 單/多選 ─── */
  multiple = false,                 // ← 新增：true=多選、false=單選（預設單選）

  /** 受控/不受控：選取（單選用 string，多選用 string[]） */
  value,                            // 單選: string | undefined；多選: string[] | undefined
  defaultValue = multiple ? [] : null,

  onChange = () => { },             // 單選: ({ selectedItem, pathIds, remark })
                                    // 多選: ({ selectedItems, pathIdsList, selectedIds, remark })

  /** 受控/不受控：展開 */
  expandedIds,
  defaultExpandedIds = [],

  /** 行為 */
  requireLeafSelect = true,
  autoConfirmOnLeaf = false,        // 多選時通常不自動送出

  /** 關閉 */
  closeOnBackdrop = true,
  onCancel = () => { },
  onConfirm = () => { },            // 同 onChange 的資料型態

  /** mapper */
  getId = defaultGetId,
  getName = defaultGetName,
  getChildren = defaultGetChildren,
  getHasRemark = defaultGetHasRemark,

  /** UI */
  cancelText = '取消',
  confirmText = '確認',
  testIDPrefix = 'WsStateMultiLevelToggle',
}) => {
  /** ------------ 受控/不受控：selected ------------ **/
  const isControlled = value !== undefined;

  // 單選：string | null；多選：Set<string>
  const [innerSelectedId, setInnerSelectedId] = React.useState(
    multiple ? null : (defaultValue ?? null)
  );
  const [innerSelectedIds, setInnerSelectedIds] = React.useState(
    new Set(Array.isArray(defaultValue) ? defaultValue : [])
  );

  const selectedId = multiple ? null : (isControlled ? value : innerSelectedId);
  const selectedIdsSet = React.useMemo(() => {
    if (!multiple) return null;
    const ids = isControlled ? (Array.isArray(value) ? value : []) : Array.from(innerSelectedIds);
    return new Set(ids);
  }, [multiple, isControlled, value, innerSelectedIds]);

  const setSelectedId = React.useCallback((nextId) => {
    if (multiple) return; // 多選不走這條
    if (!isControlled) setInnerSelectedId(nextId);
  }, [multiple, isControlled]);

  const setSelectedIdsSet = React.useCallback((nextSet) => {
    if (!multiple) return; // 單選不走這條
    if (!isControlled) setInnerSelectedIds(new Set(nextSet));
  }, [multiple, isControlled]);

  /** ------------ 受控/不受控：expanded ------------ **/
  const isExpandedControlled = expandedIds !== undefined;
  const [innerExpanded, setInnerExpanded] = React.useState(new Set(defaultExpandedIds));
  const expandedSet = React.useMemo(
    () => new Set(isExpandedControlled ? expandedIds : Array.from(innerExpanded)),
    [isExpandedControlled, expandedIds, innerExpanded]
  );
  const setExpandedSet = React.useCallback((nextSet) => {
    if (!isExpandedControlled) setInnerExpanded(new Set(nextSet));
  }, [isExpandedControlled]);

  /** ------------ remark（保留一組共用備註） ------------ **/
  const [remark, setRemark] = React.useState('');

  /** ------------ 開啟時初始化 ------------ **/
  React.useEffect(() => {
    if (visible) {
      if (!isExpandedControlled) setInnerExpanded(new Set(defaultExpandedIds));
      if (!isControlled) {
        if (multiple) {
          setInnerSelectedIds(new Set(Array.isArray(defaultValue) ? defaultValue : []));
        } else {
          setInnerSelectedId(defaultValue ?? null);
        }
      }
      setRemark('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  /** ------------ idMap / parentMap ------------ **/
  const { idMap, parentMap } = React.useMemo(() => {
    const idMapTemp = new Map();
    const parent = new Map();
    const walk = (nodes, parId = null) => {
      for (const n of nodes || []) {
        const id = getId(n);
        if (id == null) continue;
        idMapTemp.set(id, n);
        if (parId != null) parent.set(id, parId);
        const cs = getChildren(n);
        if (cs?.length) walk(cs, id);
      }
    };
    walk(items);
    return { idMap: idMapTemp, parentMap: parent };
  }, [items, getId, getChildren]);

  const getPathIds = React.useCallback((id) => {
    const path = [];
    let cur = id;
    while (cur != null) {
      path.unshift(cur);
      cur = parentMap.get(cur);
    }
    return path;
  }, [parentMap]);

  const hasChildren = React.useCallback((n) => {
    const cs = getChildren(n);
    return Array.isArray(cs) && cs.length > 0;
  }, [getChildren]);

  /** ------------ 展開/收合 ------------ **/
  const toggleExpand = React.useCallback((id) => {
    const next = new Set(expandedSet);
    next.has(id) ? next.delete(id) : next.add(id);
    setExpandedSet(next);
  }, [expandedSet, setExpandedSet]);

  /** ------------ 組合結果 ------------ **/
  const buildSingleResult = React.useCallback((node, customRemark) => {
    const id = getId(node);
    const pathIds = getPathIds(id);
    return { selectedItem: node, pathIds, remark: customRemark ?? remark };
  }, [getId, getPathIds, remark]);

  const buildMultiResult = React.useCallback((idsSet, customRemark) => {
    const ids = Array.from(idsSet || []);
    const selectedItems = ids.map(id => idMap.get(id)).filter(Boolean);
    const pathIdsList = ids.map(id => getPathIds(id));
    return { selectedItems, pathIdsList, selectedIds: ids, remark: customRemark ?? remark };
  }, [idMap, getPathIds, remark]);

  /** ------------ 點選節點（單/多選） ------------ **/
  const handleSelect = React.useCallback((node) => {
    const nodeId = getId(node);
    const children = hasChildren(node);

    if (requireLeafSelect && children) {
      // 只能選葉：點父節點改為展開/收合
      toggleExpand(nodeId);
      return;
    }

    // 沒備註就清空
    if (!getHasRemark(node)) setRemark('');

    if (multiple) {
      // 多選：切換選取集合
      const next = new Set(selectedIdsSet);
      next.has(nodeId) ? next.delete(nodeId) : next.add(nodeId);
      setSelectedIdsSet(next);

      const result = buildMultiResult(next);
      if (autoConfirmOnLeaf && !children) {
        onConfirm(result);
      } else {
        onChange(result);
      }
    } else {
      // 單選：覆寫單一選取
      setSelectedId(nodeId);
      if (children) {
        const next = new Set(expandedSet);
        next.add(nodeId);
        setExpandedSet(next);
      }
      const result = buildSingleResult(node);
      if (autoConfirmOnLeaf && !children) {
        onConfirm(result);
      } else {
        onChange(result);
      }
    }
  }, [
    multiple, getId, hasChildren, requireLeafSelect,
    toggleExpand, getHasRemark, setRemark,
    selectedIdsSet, setSelectedIdsSet, buildMultiResult,
    setSelectedId, expandedSet, setExpandedSet, buildSingleResult,
    autoConfirmOnLeaf, onConfirm, onChange
  ]);

  /** ------------ 單列（右側箭頭） ------------ **/
  const Row = React.useCallback(({ node, level }) => {
    const id = getId(node);
    const name = getName(node);
    const children = hasChildren(node);
    const isExpanded = expandedSet.has(id);
    const isSelected = multiple
      ? selectedIdsSet.has(id)
      : selectedId === id;

    // 第一層不縮排，第二層開始才縮排
    const effectiveLevel = level === 0 ? 0 : level;
    const marginLeft = effectiveLevel === 0 ? 0 : effectiveLevel * INDENT;

    return (
      <View style={{ marginLeft }}>
        <View style={styles.rowWrap}>
          <WsToggleBtn
            type="b"
            isActive={isSelected}
            onPress={() => handleSelect(node)}
            style={[
              { flex: 1, paddingVertical: 8, paddingRight: 4, borderRadius: 10 },
              isSelected && { backgroundColor: $color.primary10l }
            ]}
            textStyle={{ fontSize: 16 }}
          >
            {name}
          </WsToggleBtn>

          {children ? (
            <WsIcon
              name={isExpanded ? 'md-chevron-down' : 'md-chevron-up'}
              size={24}
              color={$color.gray2l}
              onPress={() => toggleExpand(id)}
              style={{ marginRight: 16 }}
            />
          ) : (
            <View style={{ width: 22, marginLeft: 6 }} />
          )}
        </View>
      </View>
    );
  }, [expandedSet, multiple, selectedId, selectedIdsSet, handleSelect, toggleExpand, getId, getName, hasChildren]);

  /** ------------ 遞迴渲染樹 ------------ **/
  const renderNode = React.useCallback((node, level = 0) => {
    const id = getId(node);
    const children = getChildren(node);
    const isExpanded = expandedSet.has(id);

    return (
      <View key={id}>
        <Row node={node} level={level} />
        {children?.length > 0 && isExpanded && (
          <View style={{ marginTop: 4 }}>
            {children.map((c) => renderNode(c, level + 1))}
          </View>
        )}
      </View>
    );
  }, [expandedSet, getId, getChildren, Row]);

  /** ------------ 確認按鈕可用性 ------------ **/
  const selectedNode = React.useMemo(() => {
    if (multiple) return null;
    if (!selectedId) return null;
    return idMap.get(selectedId) ?? null;
  }, [multiple, selectedId, idMap]);

  const confirmDisabled = multiple
    ? (selectedIdsSet.size === 0)
    : !selectedNode;

  const handleConfirm = React.useCallback(() => {
    if (multiple) {
      const result = buildMultiResult(selectedIdsSet);
      onConfirm(result);
    } else if (selectedNode) {
      onConfirm(buildSingleResult(selectedNode));
    }
  }, [multiple, selectedIdsSet, selectedNode, buildMultiResult, buildSingleResult, onConfirm]);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.centerWrap}
      >
        {/* 半透明底 */}
        <TouchableOpacity
          activeOpacity={1}
          style={styles.backdrop}
          onPress={() => (closeOnBackdrop ? onCancel() : null)}
        />

        {/* 置中卡片 */}
        <View style={styles.centerCard}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onCancel} style={styles.headerBtn}>
              <WsText color={$color.primary}>{cancelText}</WsText>
            </TouchableOpacity>

            <WsText size={16} fontWeight="bold" textAlign="center">{title}</WsText>

            <TouchableOpacity
              disabled={confirmDisabled}
              onPress={handleConfirm}
              style={[styles.headerBtn, confirmDisabled && { opacity: 0.4 }]}
            >
              <WsText color={$color.primary}>{confirmText}</WsText>
            </TouchableOpacity>
          </View>

          {/* List */}
          <ScrollView contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: 8 }}>
            {items?.length
              ? items.map((n) => renderNode(n, 0))
              : <Text style={{ color: $color.gray, padding: 16 }}>無資料</Text>}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default WsStateMultiLevelToggle;

const styles = StyleSheet.create({
  centerWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  centerCard: {
    width: '92%', maxHeight: '80%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 10,
  },
  header: {
    height: 48, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#eee',
  },
  headerBtn: { paddingHorizontal: 6, paddingVertical: 8 },
  rowWrap: { flexDirection: 'row', alignItems: 'center', paddingRight: 32 },
});
