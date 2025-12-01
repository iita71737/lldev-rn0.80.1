import React, { useState, useRef, useMemo } from 'react';
import { View, TouchableOpacity, Platform, Keyboard, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  WsPaddingContainer,
  WsInfo,
  WsIconBtn,
  WsFlex,
  WsText,
  LlPDFConvertingCard001,
  WsState,
  WsModal,
} from '@/components';
import $color from '@/__reactnative_stone/global/color';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import IonIcon from 'react-native-vector-icons/Ionicons';
import TinyMCEEditor from '@/views/PDFTool/TinyMCEEditor';

// -------------------- 型別 --------------------

type FileInfo = {
  id: string;
  name: string;
  fileType: string;
  url: string;
};

type Motion = {
  id: string;
  name: string;
  sequence: number;
  proposerDept: string;
  reporterName: string;
  attendees: string;
  content: string;
  attaches: FileInfo[];
  proposalFile: FileInfo | null;
  decisionSummary: string;
  decisionDetail: string;
  updatedAt: string;
};

export type Group = {
  id: string;
  name: string;
  sequence: number;
  articles: Motion[];
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
};

// -------------------- Component 本體 --------------------

const LlPDFMotionGroupCard001: React.FC<Props> = ({
  style,
  item,
  groups,
  onPressAddGroup,
  onPressEditGroup,
  onPressDeleteGroup,
}) => {
  const { t } = useTranslation();
  const scrollRef = useRef<KeyboardAwareScrollView | null>(null);
  const richText = useRef<any>(null);

  // 決定實際要畫哪些群組
  const sourceGroups: Group[] = useMemo(() => {
    if (groups && groups.length > 0) return groups;
    if (item) return [item];
    return []; // 沒資料就不畫
  }, [groups, item]);

  // 內外層收合狀態
  const [groupCollapsed, setGroupCollapsed] = useState<Record<string, boolean>>({});
  const [motionCollapsed, setMotionCollapsed] = useState<Record<string, boolean>>({});
  const [editMotionModalVisible, setEditMotionModalVisible] = useState(false);
  const [editingMotion, setEditingMotion] = useState<Motion | null>(null);
  const [content, setContent] = useState('<p>這是原始 HTML</p>');

  const toggleGroup = (groupId: string) => {
    setGroupCollapsed(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleMotion = (articleId: string) => {
    setMotionCollapsed(prev => ({ ...prev, [articleId]: !prev[articleId] }));
  };

  const openEditMotionModal = (motion: Motion) => {
    setEditingMotion(motion);
    setEditMotionModalVisible(true);
  };

  const renderArticle = (group: Group, motion: Motion) => {
    const isArticleCollapsed = motionCollapsed[motion.id] ?? false;

    return (
      <View key={motion.id} style={{ marginTop: 12 }}>
        {/* 內層 header */}
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
            onPress={() => toggleMotion(motion.id)}
          >
            <WsFlex
              style={{ paddingVertical: 12, paddingHorizontal: 8 }}
              justifyContent="space-between"
              alignItems="center"
            >
              <WsFlex alignItems="center">
                <WsText>{motion.name || t('議案名稱')}</WsText>
              </WsFlex>

              <WsFlex>
                <WsIconBtn
                  padding={0}
                  name="ws-outline-edit-pencil"
                  size={24}
                  color={$color.primary}
                  style={{ marginLeft: 8 }}
                  onPress={() => openEditMotionModal(motion)}
                />
                <WsIconBtn
                  padding={0}
                  name="ws-outline-delete"
                  size={24}
                  color={$color.danger}
                  style={{ marginLeft: 8 }}
                  onPress={() => onPressDeleteGroup?.(group)}
                />
                <WsIconBtn
                  padding={0}
                  name="ws-outline-eye-open"
                  size={24}
                  color={$color.primary}
                  style={{ marginLeft: 8 }}
                  onPress={() => {
                    // TODO: 開一個只讀檢視 modal
                  }}
                />

                <WsIconBtn
                  padding={0}
                  name={isArticleCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                  size={24}
                  color={$color.primary3l}
                  style={{ marginLeft: 8 }}
                />
              </WsFlex>
            </WsFlex>
          </TouchableOpacity>

          {/* 內層 body */}
          {!isArticleCollapsed && (
            <WsPaddingContainer
              padding={0}
              style={{ paddingHorizontal: 16, paddingBottom: 16 }}
            >
              <View style={{ marginTop: 8 }}>
                <WsInfo
                  label={t('議案名稱')}
                  style={{ flexDirection: 'row', alignItem: 'center' }}
                  labelColor={$color.gray}
                  value={motion.name}
                />
              </View>

              <View style={{ marginTop: 8 }}>
                <WsInfo
                  label={t('提案單位')}
                  style={{ flexDirection: 'row', alignItem: 'center' }}
                  labelColor={$color.gray}
                  value={motion.proposerDept}
                />
              </View>

              <View style={{ marginTop: 8 }}>
                <WsInfo
                  label={t('報告人')}
                  style={{ flexDirection: 'row', alignItem: 'center' }}
                  labelColor={$color.gray}
                  value={motion.reporterName}
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
                  value={motion.attendees}
                />
              </View>

              <View style={{ marginTop: 8 }}>
                <WsInfo
                  label={t('附件')}
                  labelColor={$color.gray}
                  type="files"
                  value={motion.attaches}
                />
              </View>

              {/* 這裡可以掛你原本的 PDF 轉檔狀態卡片 */}
              <LlPDFConvertingCard001 />
            </WsPaddingContainer>
          )}
        </View>
      </View>
    );
  };

  const renderGroup = (group: Group) => {
    const isGroupCollapsed = groupCollapsed[group.id] ?? false;

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
          >
            <WsFlex
              style={{ paddingVertical: 12, paddingHorizontal: 8 }}
              justifyContent="space-between"
              alignItems="center"
            >
              <WsFlex alignItems="center">
                <WsText>{group.name || t('自訂議案群組名稱')}</WsText>
              </WsFlex>

              <WsFlex>
                <WsIconBtn
                  padding={0}
                  name="md-add"
                  size={24}
                  style={{ marginLeft: 8 }}
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
                <WsIconBtn
                  padding={0}
                  name={isGroupCollapsed ? 'md-unfold-more' : 'md-unfold-less'}
                  size={20}
                  style={{ marginLeft: 8, marginRight: 8 }}
                  color={$color.primary3l}
                />
              </WsFlex>
            </WsFlex>
          </TouchableOpacity>

          {/* 外層 body：群組展開後的議案列表 */}
          {!isGroupCollapsed && (
            <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
              {group.articles.map(motion => renderArticle(group, motion))}
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
        headerLeftOnPress={() => setEditMotionModalVisible(false)}
        onBackButtonPress={() => setEditMotionModalVisible(false)}
        headerRightOnPress={() => setEditMotionModalVisible(false)}
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
          enableOnAndroid
          keyboardShouldPersistTaps="handled"
        >
          <WsState
            label={t('提案​單上​傳格式​範本​')}
            testID={'WsCharts-picker002'}
            style={{
              marginTop: 16
            }}
            borderRadius={10}
            borderWidth={0.3}
            placeholder={t('輸入')}
            type="picker"
            value={''}
            onChange={$event => {
            }}
            items={[
              {
                label: t('依建立日期由近至遠'),
                value: {
                  order_way: 'desc',
                  order_by: 'created_at'
                }
              },
              {
                label: t('依更新時間由近至遠'),
                value: {
                  order_way: 'desc',
                  order_by: 'updated_at'
                }
              },
            ]}
          />
          <WsState
            style={{
              marginTop: 8
            }}
            type="filesAndImages"
            label={t('提案單')}
            value={[]}
            onChange={$event => {
            }}
            remind={t('！​注意，​重新​上傳​提案​單，​會覆​蓋​名稱、​提案​單位、​報告人、​列席​人員、​內容。​')}
            remindColor={$color.danger}
            remindBtnDisabled={true}
            desVisible={false}
          />

          <WsState
            type="text"
            style={{
              marginTop: 8
            }}
            label={t('名稱')}
            value={''}
            onChange={() => { }}
            rules={'required'}
            remind={t('！​注意，​修改會​讓​提案​單​跟​欄位​不​一致。​​')}
            remindBtnDisabled={true}
            remindColor={$color.danger}
          />

          <WsState
            type="text"
            style={{
              marginTop: 8
            }}
            label={t('提案單位')}
            value={''}
            onChange={() => { }}
          />

          <WsState
            type="text"
            multiline={true}
            style={{
              marginTop: 8
            }}
            label={t('報告人')}
            value={''}
            onChange={() => { }}
            keyboardAwareRef={scrollRef}
          />

          <WsState
            type="text"
            multiline={true}
            style={{
              marginTop: 8
            }}
            label={t('列席​人​員')}
            value={''}
            onChange={() => { }}
            keyboardAwareRef={scrollRef}
          />

          <TinyMCEEditor
            initialHtml={content}
            onChange={(html) => {
              console.log('edited HTML:', html);
              setContent(html); // 你也可以存到 state / 丟回後端
            }}
          />

          {/* react-native-pell-rich-editor */}
          {/* <WsText size={14} style={{ marginTop: 16 }} fontWeight={600}>
            {t('內容 (含HTML)')}
          </WsText>
          <View
            style={{
              borderWidth: 0.8,
              marginTop: 8,
              minHeight: 400,
              maxHeight: 400,          // 可選：最多 400，高於就靠 RichEditor 自己捲
            }}
          >
            <RichToolbar
              editor={richText}
              actions={[
                actions.keyboard,
                'customAction',
                actions.setBold,
                actions.setItalic,
                actions.insertBulletsList,
                actions.insertOrderedList,
                actions.insertLink,
                actions.setStrikethrough,
                actions.setUnderline,
                actions.removeFormat,
                actions.checkboxList,
                actions.undo,
                actions.redo,
              ]}
              iconMap={{
                customAction: () => <IonIcon name="grid-outline" size={24} />,
              }}
              customAction={() => {
                // TODO: 開你的 insert table modal
              }}
            />

            <RichEditor
              ref={richText}
              style={[
                Platform.OS === 'ios'
                  ? {
                    minHeight: 200,
                    maxHeight: 360,        // 預留一點給 toolbar 高度
                    paddingHorizontal: 8,
                  }
                  : {
                    flex: 1,
                  },
              ]}
              containerStyle={{
                backgroundColor: 'transparent',
                cssText:
                  'body { margin: 0; padding: 10px; min-height: 200px; line-height: 1.5; }',
              }}
              initialContentHTML={'<h1>1111</h1>'}
              onChange={descriptionText => {
                const updatedHtml = descriptionText.replace(
                  /<p(?![^>]*style)/g,
                  '<p style="line-height:1.5;"'
                )
                console.log(updatedHtml, 'updatedHtml00')
                // 設回 state
              }}
              onHeightChange={h => {
                console.log(h, 'change height1')
              }}
              onFocus={() => {
                // ✅ 如果外層有 KeyboardAwareScrollView，可以在這裡手動推一下
                // scrollViewRef 是包住整個表單那個 KeyboardAwareScrollView
                if (scrollViewRef?.current && richText.current) {
                  // react-native-pell-rich-editor 實際上是 WebView，不一定吃 scrollToFocusedInput
                  // 這裡通常用 scrollToPosition 粗暴推就好
                  scrollViewRef.current.scrollToPosition(0, 800, true)
                }
              }}
              onBlur={() => { }}
              onDone={Keyboard.dismiss}
            />
          </View> */}


          <WsState
            style={{
              marginTop: 8
            }}
            type="filesAndImages"
            label={t('議案附件')}
            labelIcon={'md-photo'}
            value={[]}
            onChange={$event => {
            }}
          />

          <WsState
            type="text"
            multiline={true}
            style={{
              marginTop: 8
            }}
            label={t('決議-​簡述')}
            value={''}
            onChange={() => { }}
            keyboardAwareRef={scrollRef}
          />

          <WsState
            type="text"
            multiline={true}
            style={{
              marginTop: 8
            }}
            label={t('決議-​詳述')}
            value={''}
            onChange={() => { }}
            keyboardAwareRef={scrollRef}
          />

          <View
            style={{
              height: 100
            }}
          ></View>

        </ScrollView>
      </WsModal>
    </>
  );
};

export default LlPDFMotionGroupCard001;
