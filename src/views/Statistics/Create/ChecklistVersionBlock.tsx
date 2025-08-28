import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ViewStyle, TextStyle } from 'react-native';

export type ChipItem = { key: string; label: string; withInput?: boolean };

type Version3BlockProps = {
  /* 受控 / 不受控：公式 */
  formulas?: string[];
  onFormulasChange?: (next: string[]) => void;

  /* 受控 / 不受控：已選題目 */
  chips?: ChipItem[];
  onChipsChange?: (next: ChipItem[]) => void;

  /* 行為 callback（外層可接管） */
  onSelectSource?: (index: number) => void;      // 點「選取原始資料」
  onRemoveFormula?: (index: number) => void;     // 刪除某條公式
  onAddFormula?: () => void;                     // 按「＋」
  onRemoveChip?: (key: string) => void;          // 刪除 chip
  onChipInputChange?: (key: string, value: string) => void; // chip 內的小輸入框
  setModalVisibleSourceData?: () => void;
  setModalActiveFormula?: () => void;

  /* 標題/文案 */
  title?: string;                // 默認：題目之間的關係公式
  addLabel?: string;             // 默認：＋
  selectSourceLabel?: string;    // 默認：選取原始資料
  deleteLabel?: string;          // 默認：刪除
  selectedTitle?: string;        // 默認：已選擇的題目

  /* 檔案列 / 分頁（可選） */
  showFilePanel?: boolean;       // 是否顯示底下示意的檔案列
  fileTitle?: string;            // 檔案列標題
  pageTotal?: number;            // 總頁數
  pageInit?: number;             // 初始頁碼
  onGoPage?: (page: number) => void;
  goLabel?: string;              // 默認：前往
  pageTextBuilder?: (current: number, total: number) => string; // 自訂「第 1-1 筆 共 1 筆」

  /* 樣式覆寫（必要時） */
  style?: ViewStyle;
  formulaPillStyle?: ViewStyle;
  actionButtonStyle?: ViewStyle;
  actionButtonTextStyle?: TextStyle;
};

export default function Version3Block({
  // 受控 / 不受控資料
  formulas: cFormulas,
  onFormulasChange,
  chips: cChips,
  onChipsChange,

  // 行為
  onSelectSource,
  onRemoveFormula,
  onAddFormula,
  onRemoveChip,
  onChipInputChange,
  setModalVisibleSourceData,
  setModalActiveFormula,

  // 文案
  title = '題目之間的關係公式',
  addLabel = '＋',
  selectSourceLabel = '選取原始資料',
  deleteLabel = '刪除',
  selectedTitle = '已選擇的題目',

  // 檔案列 / 分頁
  showFilePanel = true,
  fileTitle = '共享檔案來自大陸廠-改檔名',
  pageTotal = 1,
  pageInit = 1,
  onGoPage,
  goLabel = '前往',
  pageTextBuilder = (c, t) => `第 ${c}-${c} 筆 共 ${t} 筆`,

  // 樣式
  style,
  formulaPillStyle,
  actionButtonStyle,
  actionButtonTextStyle,
}: Version3BlockProps) {
  /* ===== 內部 state（當外部不受控時使用） ===== */
  const [uFormulas, setUFormulas] = React.useState<string[]>([
    '(A - B) + (C - D) + E',
    'A + E',
  ]);
  const [uChips, setUChips] = React.useState<ChipItem[]>([
    { key: 'A', label: '作廠版本測試', withInput: true },
    { key: 'B', label: 'ISO 14001', withInput: true },
    { key: 'C', label: '7.1 to 1mb', withInput: true },
    { key: 'D', label: 'wmv' },
    { key: 'E', label: 'webm', withInput: true },
  ]);
  const [page, setPage] = React.useState<number>(pageInit);

  /* 同步外部受控值 */
  React.useEffect(() => { if (cFormulas) setUFormulas(cFormulas); }, [cFormulas]);
  React.useEffect(() => { if (cChips) setUChips(cChips); }, [cChips]);
  React.useEffect(() => { setPage(pageInit); }, [pageInit]);

  /* 取得目前實際使用的資料源 */
  const formulas = cFormulas ?? uFormulas;
  const chips = cChips ?? uChips;

  /* 寫入工具：若受控則呼叫外部 onChange，否則寫入內部 state */
  const updateFormulas = (next: string[]) => {
    onFormulasChange ? onFormulasChange(next) : setUFormulas(next);
  };
  const updateChips = (next: ChipItem[]) => {
    onChipsChange ? onChipsChange(next) : setUChips(next);
  };

  /* 行為實作（提供預設） */
  const addFormula = () => {
    if (onAddFormula) return onAddFormula();
    updateFormulas([...formulas, '']);
  };
  const removeFormula = (idx: number) => {
    if (onRemoveFormula) return onRemoveFormula(idx);
    updateFormulas(formulas.filter((_, i) => i !== idx));
  };
  const removeChip = (k: string) => {
    if (onRemoveChip) return onRemoveChip(k);
    updateChips(chips.filter(c => c.key !== k));
  };

  const handleGo = () => {
    const next = Math.min(Math.max(1, page), pageTotal || 1);
    setPage(next);
    onGoPage?.(next);
  };

  return (
    <View style={[styles.root, style]}>

      {/* 已選擇的題目 */}
      <Text style={[styles.sectionTitle, { marginTop: 4 }]}>{selectedTitle}</Text>
      <View style={styles.chipsWrap}>
        {chips.map((c, idx) => (
          <Chip
            key={c.key}
            prefix={String.fromCharCode(65 + idx)} // A/B/C...
            label={c.label}
            withInput={c.withInput}
            onRemove={() => removeChip(c.key)}
            onInputChange={(v) => onChipInputChange?.(c.key, v)}
          />
        ))}
      </View>

      {/* 檔案列 & 分頁（可選） */}
      {showFilePanel && (
        <View style={styles.fileCard}>
          <View style={styles.fileRow}>
            <View style={styles.checkbox} />
            <Text style={styles.fileTitle} numberOfLines={1}>
              {fileTitle}
            </Text>
          </View>

          <View style={styles.pagerRow}>
            <Text style={styles.pagerTxt}>前往頁數</Text>
            <View style={styles.pageInput}>
              <TextInput
                style={styles.pageInputTxt}
                value={String(page)}
                onChangeText={(t) => setPage(Number(t.replace(/[^\d]/g, '')) || 1)}
                keyboardType="number-pad"
              />
            </View>
            <Text style={styles.pagerTxt}>共 {pageTotal} 頁</Text>
            <TouchableOpacity style={styles.goBtn} onPress={handleGo}>
              <Text style={{ color: '#fff' }}>{goLabel}</Text>
            </TouchableOpacity>
            <Text style={[styles.pagerTxt, { marginLeft: 8 }]}>
              {pageTextBuilder(page, pageTotal)}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

/* ===== 小元件 ===== */
function OutlineBtn({
  label,
  onPress,
  style,
  textStyle,
}: {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.outlineBtn, style]}>
      <Text style={[styles.outlineBtnTxt, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Chip({
  prefix,
  label,
  onRemove,
  withInput,
  onInputChange,
}: {
  prefix?: string;
  label: string;
  withInput?: boolean;
  onRemove?: () => void;
  onInputChange?: (v: string) => void;
}) {
  return (
    <View style={styles.chip}>
      {!!prefix && (
        <View style={styles.chipPrefix}>
          <Text style={styles.chipPrefixTxt}>{prefix}</Text>
        </View>
      )}
      <Text style={styles.chipLabel} numberOfLines={1}>{label}</Text>
      {withInput && (
        <View style={styles.chipSmallInput}>
          <TextInput
            style={styles.chipSmallInputTxt}
            placeholder=""
            onChangeText={onInputChange}
          />
        </View>
      )}
      <TouchableOpacity onPress={onRemove} style={styles.chipClose}>
        <Text style={styles.chipCloseTxt}>×</Text>
      </TouchableOpacity>
    </View>
  );
}

/* ===== 樣式 ===== */
const styles = StyleSheet.create({
  root: { paddingTop: 2 },
  sectionTitle: { fontSize: 16, color: '#111', marginBottom: 6 },

  /* 公式 */
  formulaRow: { flexDirection: 'column', alignItems: 'stretch', marginBottom: 8 },
  formulaPill: {
    borderWidth: 2, borderColor: '#111', borderRadius: 6,
    backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6,
    width: '100%', minWidth: 0,
  },
  formulaText: { fontSize: 16, color: '#111', lineHeight: 22 },
  actionGroupRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8, alignSelf: 'flex-start',
  },
  outlineBtn: {
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 2, borderColor: '#111', borderRadius: 16, backgroundColor: '#fff',
  },
  outlineBtnTxt: { color: '#111' },

  /* 加號 */
  addRow: { paddingVertical: 2, paddingHorizontal: 4, marginBottom: 8 },
  addPlus: { fontSize: 28, color: '#111' },

  /* Chips */
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f7f9fb', borderWidth: 1, borderColor: '#d9dbe2',
    borderRadius: 999, paddingHorizontal: 8, paddingVertical: 6,
  },
  chipPrefix: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#e6eef6', alignItems: 'center', justifyContent: 'center',
    marginRight: 6,
  },
  chipPrefixTxt: { color: '#0b5aaa', fontSize: 12 },
  chipLabel: { color: '#111', maxWidth: 160 },
  chipSmallInput: {
    marginLeft: 6, borderWidth: 1, borderColor: '#d9dbe2',
    borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2, minWidth: 40, backgroundColor: '#fff',
  },
  chipSmallInputTxt: { padding: 0, margin: 0, minWidth: 32, color: '#111' },
  chipClose: {
    marginLeft: 6, width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#e9edf2', alignItems: 'center', justifyContent: 'center',
  },
  chipCloseTxt: { color: '#111', fontSize: 14, lineHeight: 18 },

  /* 檔案列 & 分頁 */
  fileCard: {
    backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e8ef', overflow: 'hidden',
  },
  fileRow: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: '#1e88e5' },
  fileTitle: { flex: 1, fontSize: 16, color: '#111' },
  pagerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 12, gap: 8 },
  pagerTxt: { color: '#555' },
  pageInput: { borderWidth: 1, borderColor: '#d9dbe2', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, minWidth: 46 },
  pageInputTxt: { padding: 0, margin: 0, textAlign: 'center', color: '#111' },
  goBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#1e88e5', borderRadius: 16 },
});
