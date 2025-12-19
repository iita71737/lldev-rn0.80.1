import React, { useState, useRef, useMemo } from 'react';
import { View, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
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
  WsTag,
} from '@/components';
import $color from '@/__reactnative_stone/global/color';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import TinyMCEEditor from '@/views/PDFTool/TinyMCEEditor';
import DraggableFlatList from 'react-native-draggable-flatlist';
import JoditEditor from 'views/PDFTool/JoditEditor';

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
  const { width, height } = Dimensions.get('window');

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
  const [motionFiles, setMotionFiles] = useState<Array>([]);

  // --------- 議案排序相關 state ---------
  // 哪一個 group 正在「議案排序模式」
  const [articleSortGroupId, setArticleSortGroupId] = useState<string | null>(null);

  // 已確認的新排序（每個 group 一份）
  const [articleState, setArticleState] = useState<Record<string, Motion[]>>({});

  // 排序中的暫存順序（只有在排序模式時用）
  const [articleSortTemp, setArticleSortTemp] = useState<Record<string, Motion[]>>({});

  // 取得某個 group 應該顯示的議案順序（若有確認過排序，就用 articleState，否則用原本 group.articles）
  const getGroupArticles = (group: Group): Motion[] => {
    return articleState[group.id] ?? group.articles;
  };

  // 開啟某個 group 的議案排序模式
  const startArticleSort = (group: Group) => {
    const current = getGroupArticles(group);
    setArticleSortGroupId(group.id);
    setArticleSortTemp(prev => ({
      ...prev,
      [group.id]: [...current], // 複製一份做暫存
    }));
  };

  // 取消議案排序（丟棄暫存）
  const cancelArticleSort = () => {
    if (!articleSortGroupId) return;
    const gid = articleSortGroupId;
    setArticleSortGroupId(null);
    setArticleSortTemp(prev => {
      const next = { ...prev };
      delete next[gid];
      return next;
    });
  };

  // 確認議案排序（把暫存寫入正式 articleState）
  const confirmArticleSort = () => {
    if (!articleSortGroupId) return;
    const gid = articleSortGroupId;
    const temp = articleSortTemp[gid];
    if (!temp) {
      setArticleSortGroupId(null);
      return;
    }
    setArticleState(prev => ({
      ...prev,
      [gid]: temp,
    }));
    setArticleSortGroupId(null);
    setArticleSortTemp(prev => {
      const next = { ...prev };
      delete next[gid];
      return next;
    });
  };

  // 當 DraggableFlatList 拖曳結束時更新暫存
  const handleArticleDragEnd = (groupId: string, data: Motion[]) => {
    setArticleSortTemp(prev => ({
      ...prev,
      [groupId]: data,
    }));
  };

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
                  label={t('項目符號')}
                  style={{ flexDirection: 'row', alignItem: 'center' }}
                  labelColor={$color.gray}
                  value={t('第一案')}
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
                  label={t('列席單位')}
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

              <View style={{ marginTop: 8, marginBottom: 8 }}>
                <WsInfo
                  label={t('附件')}
                  labelColor={$color.gray}
                  type="files"
                  value={['docd.docx']}
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

    const isArticleSortMode = articleSortGroupId === group.id;
    const baseArticles = getGroupArticles(group);
    const displayArticles =
      isArticleSortMode && articleSortTemp[group.id]
        ? articleSortTemp[group.id]
        : baseArticles;

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

            <WsFlex
              style={{
                marginTop: 8,
                marginBottom: isGroupCollapsed ? 8 : 0
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

              {/* 議案排序模式切換 + 確定 / 取消 */}
              <WsFlex
                style={{
                }}
              >
                {isArticleSortMode ? (
                  <>
                    <TouchableOpacity
                      style={{ marginRight: 8 }}
                      onPress={cancelArticleSort}
                    >
                      <WsTag>{t('取消')}</WsTag>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={confirmArticleSort}
                    >
                      <WsTag>{t('確定')}</WsTag>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    onPress={() => startArticleSort(group)}
                  >
                    <WsTag>{t('排序議案')}</WsTag>
                  </TouchableOpacity>
                )}
              </WsFlex>

            </WsFlex>

            <View style={{ marginTop: 8 }}>
              <WsInfo
                type={'filesAndImages'}
                label={t('時序表範本')}
                style={{
                }}
                labelColor={$color.gray}
                value={['時序表範本.xlsx']}
              />
            </View>

            <View style={{ marginTop: 8 }}>
              <WsInfo
                label={t('此​議案​群​組​對應​的​目錄​範本​區塊​')}
                style={{
                  // flexDirection: 'row',
                  alignItem: 'center',
                  flexWrap: 'wrap',
                }}
                labelColor={$color.gray}
                value={'xxxxxxx'}
              />
            </View>

            <View style={{ marginTop: 8 }}>
              <WsInfo
                label={t('此​議案​群​組​對應​的​議程​範本​區塊​')}
                style={{
                  // flexDirection: 'row',
                  alignItem: 'center',
                  flexWrap: 'wrap',
                }}
                labelColor={$color.gray}
                value={'zzzzzzz'}
              />
            </View>

          </TouchableOpacity>

          {/* 外層 body：群組展開後的議案列表 */}
          {!isGroupCollapsed && (
            <View style={{ paddingHorizontal: 12, paddingBottom: 12 }}>
              {isArticleSortMode ? (
                // 排序模式：用 DraggableFlatList 拖曳排序（只顯示簡化版 row）
                <DraggableFlatList
                  data={displayArticles}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false} // 交給外層 ScrollView/FlatList 滾動
                  renderItem={({ item, drag, isActive, getIndex }) => {
                    const index = getIndex?.() ?? 0;

                    return (
                      <TouchableOpacity
                        style={{
                          marginTop: 8,
                          borderRadius: 8,
                          borderWidth: 0.4,
                          borderColor: $color.black,
                          backgroundColor: isActive ? $color.primary10l : $color.white,
                          paddingHorizontal: 8,
                          paddingVertical: 8,
                        }}
                        onLongPress={drag}
                        onPressIn={drag}
                      >
                        <WsFlex justifyContent="space-between" alignItems="center">
                          <WsText style={{ flex: 1 }}>
                            {`${index + 1}. ${item.name || t('議案名稱')}`}
                          </WsText>
                          <WsIconBtn
                            padding={0}
                            name="ws-outline-drag-horizontal"
                            size={24}
                            color={$color.primary}
                          />
                        </WsFlex>
                      </TouchableOpacity>
                    );
                  }}
                  onDragEnd={({ data }) => {
                    handleArticleDragEnd(group.id, data);
                  }}
                />
              ) : (
                // 一般模式：顯示原本完整的議案卡片
                displayArticles.map(motion => renderArticle(group, motion))
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
          keyboardShouldPersistTaps="handled"
        >
          <WsState
            label={t('提案​單上​傳格式​範本​')}
            testID={'WsCharts-picker002'}
            style={{
              marginTop: 16,
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
                  order_by: 'created_at',
                },
              },
              {
                label: t('依更新時間由近至遠'),
                value: {
                  order_way: 'desc',
                  order_by: 'updated_at',
                },
              },
            ]}
          />
          <WsState
            style={{
              marginTop: 8,
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
              marginTop: 16,
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
              marginTop: 8,
            }}
            label={t('提案單位')}
            value={''}
            onChange={() => { }}
          />

          <WsState
            type="text"
            multiline={true}
            style={{
              marginTop: 8,
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
              marginTop: 8,
            }}
            label={t('列席人員')}
            value={''}
            onChange={() => { }}
            keyboardAwareRef={scrollRef}
          />

          {/* <TinyMCEEditor
            initialHtml={content}
            onChange={(html) => {
              console.log('edited HTML:', html);
              setContent(html); // 你也可以存到 state / 丟回後端
            }}
          /> */}

          <WsText
            style={{
              marginTop: 16,
            }}>{t('內容')}
          </WsText>
          <JoditEditor
            initialHtml={content}
            onChange={(html) => {
              console.log('edited HTML:', html);
              // setContent(html); // 你也可以存到 state / 丟回後端
            }}
          />

          <WsState
            style={{
              marginTop: 8,
            }}
            type="filesAndImages"
            label={t('議案附件')}
            labelIcon={'md-photo'}
            value={motionFiles}
            onChange={$event => {
              console.log($event,'event--')
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
            value={''}
            onChange={() => { }}
            keyboardAwareRef={scrollRef}
          />

          <WsState
            type="text"
            multiline={true}
            style={{
              marginTop: 8,
            }}
            label={t('決議-​詳述')}
            value={''}
            onChange={() => { }}
            keyboardAwareRef={scrollRef}
          />

          <View
            style={{
              height: 100,
            }}
          />
        </ScrollView>
      </WsModal>
    </>
  );
};

export default LlPDFMotionGroupCard001;
