import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { create, all } from "mathjs";
import {
  SafeAreaView,
  useSafeAreaInsets,
  SafeAreaProvider,
} from "react-native-safe-area-context";
import {
  WsState,
  WsFlex,
  WsText,
  WsGradientButton,
  WsIconBtn
} from '@/components'
import { useTranslation } from "react-i18next";
import $color from '@/__reactnative_stone/global/color'

// type
type ParamItem = {
  key: string;
  label: string;
  customLabel?: string;
};

const math = create(all, { number: "number" });
math.import(
  {
    SUM: (...args: number[]) => math.sum(args.flat()),
    MAX: (...args: number[]) => math.max(args.flat()),
    MIN: (...args: number[]) => math.min(args.flat()),
    AVERAGE: (...args: number[]) => math.mean(args.flat()),
  },
  { override: true }
);

// ========== NEW: 把任何 id 轉成 mathjs 安全變數名 ==========
const toSafeVar = (id: string) => {
  const cleaned = String(id).replace(/[^A-Za-z0-9_]/g, "_"); // 把 - 等符號轉 _
  return `v_${cleaned}`; // 以字母/底線開頭，避免與函數名衝突
};

export default function WsFormulaBuilder002({
  style,
  placeholder = "點擊以建立或編輯公式…",
  params = [],
  records = [],
  uniqueKey = "question_id", // 可外部指定唯一識別欄位
  onChange,
}: {
  style?: any;
  placeholder?: string;
  params?: Record<string, any>[]; // 可含 question_id 或 key
  records?: { [key: string]: any }[];
  uniqueKey?: string;
  onChange?: (payload: {
    expression: string;
    value: number;
    displayText: string;
  }) => void;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [visible, setVisible] = React.useState(false);
  const [tableVisible, setTableVisible] = React.useState(false);

  // === 雙 state ===
  const [displayExpression, setDisplayExpression] = React.useState(""); // 顯示 label / A1
  const [realExpression, setRealExpression] = React.useState("");       // 運算式（安全變數名)

  const [selection, setSelection] = React.useState({ start: 0, end: 0 });
  const [previewResults, setPreviewResults] = React.useState<any[]>([]);
  const inputRef = React.useRef<TextInput>(null);

  const fnDefs = [
    { key: "SUM", label: "加總", insert: "SUM(題目A, 題目B)" },
    { key: "MAX", label: "最大值", insert: "MAX(題目A, 題目B)" },
    { key: "MIN", label: "最小值", insert: "MIN(題目A, 題目B)" },
    { key: "AVERAGE", label: "平均值", insert: "AVERAGE(題目A, 題目B)" },
  ];

  // ========== NEW: 建立參數映射（安全變數名 + A1/A2... 別名）==========
  const paramMaps = React.useMemo(() => {
    const sorted = [...params].sort(
      (a: any, b: any) => ((b.label?.length || 0) - (a.label?.length || 0))
    );

    const labelToVar = new Map<string, string>();
    const idToVar = new Map<string, string>();
    const aliasToVar = new Map<string, string>();

    sorted.forEach((p: any, idx: number) => {
      const id = p?.[uniqueKey] ?? p?.question_id ?? p?.key;
      if (!id) return;
      const safe = toSafeVar(String(id));
      idToVar.set(String(id), safe);

      if (p.label) labelToVar.set(String(p.label), safe);   // ✅ 只放 label
      // if (p.customLabel) labelToVar.set(String(p.customLabel), safe); // ❌ 拿掉

      // aliasToVar.set(`A${idx + 1}`, safe); // 需要 A1/A2 才打開
    });

    return { labelToVar, idToVar, aliasToVar };
  }, [params, uniqueKey]);


  // ========== UPDATED: 顯示式 → 安全 realExpression ==========
  // 放在元件內（替換你原本的 convertToReal）
  const convertToReal = (txt: string) => {
    if (!txt) return "";

    // 建立可匹配對 (from -> to)，同時支援 label/customLabel 與 A1/A2...
    type Pair = { from: string; to: string };
    const pairs: Pair[] = [];

    // 先收集（label/customLabel）
    paramMaps.labelToVar.forEach((to, from) => {
      if (from) pairs.push({ from, to });
    });
    // 再收集（A1/A2…）
    paramMaps.aliasToVar.forEach((to, from) => {
      if (from) pairs.push({ from, to });
    });

    // 長度由長到短，避免子字串搶先命中（例如「pH值」先搶了「pH值 v1」）
    pairs.sort((a, b) => b.from.length - a.from.length);

    const isWordChar = (ch: string) => /[A-Za-z0-9_]/.test(ch || "");

    // 單趟掃描原始輸入字串，不在已產生的輸出上再做替換（杜絕黏連/重複替換）
    let i = 0;
    const n = txt.length;
    let out = "";

    while (i < n) {
      let matched = false;

      for (const { from, to } of pairs) {
        if (!from) continue;

        if (txt.startsWith(from, i)) {
          const prev = txt[i - 1] || "";
          const next = txt[i + from.length] || "";

          // 邊界判斷：前後不能是 [A-Za-z0-9_]
          if (!isWordChar(prev) && !isWordChar(next)) {
            out += ` ${to} `;       // 兩側補空白，避免和其他變數黏在一起
            i += from.length;       // 游標跳過已匹配片段
            matched = true;
            break;
          }
        }
      }

      if (!matched) {
        out += txt[i];
        i += 1;
      }
    }

    // 清除多餘空白
    return out.replace(/\s+/g, " ").trim();
  };

  const [paramList, setParamList] = useState<ParamItem[]>(
    params.map((p: any) => ({ ...p, customLabel: p.customLabel ?? "" }))
  );
  const [inputValue, setInputValue] = React.useState("");
  const [modalVisible, setModalVisible] = React.useState(false);
  const [editingParam, setEditingParam] = React.useState<{
    id: string;
    label: string;
  } | null>(null);

  /** 點擊某個 param → 開啟 Modal */
  const handleOpenModal = (item: ParamItem) => {
    setEditingParam(item as any);
    setInputValue(item.customLabel || item.label);
    setModalVisible(true);
  };
  /** 儲存使用者輸入的 customLabel */
  const handleSaveLabel = () => {
    if (!editingParam) return;
    setParamList((prev) =>
      prev.map((p) =>
        p.key === (editingParam as any).key ? { ...p, customLabel: inputValue } : p
      )
    );
    setModalVisible(false);
  };

  // 🧮 預覽計算（用安全變數名建立 ctx）
  React.useEffect(() => {
    if (!realExpression || !records?.length) {
      setPreviewResults([]);
      return;
    }

    try {
      const newResults = records.map((r) => {
        const ctx: Record<string, number> = {};

        params.forEach((p: any) => {
          const id = p?.[uniqueKey] ?? p?.question_id ?? p?.key;
          if (!id) return;

          const val =
            r[p.label] ??
            r[id] ??
            r[p.key] ??
            0;

          const vname = paramMaps.idToVar.get(String(id)) || toSafeVar(String(id));
          ctx[vname] = Number(val) || 0;
        });

        let result: any = "❌";
        try {
          const val = math.evaluate(realExpression, ctx);
          const num = Number(val);
          result = Number.isFinite(num) ? num : "❌";
        } catch {
          // 友善提示：找出 realExpression 中 ctx 未知符號
          const tokens = Array.from(new Set(realExpression.match(/[A-Za-z_][A-Za-z0-9_]*/g) || []));
          const knownFns = new Set(["SUM", "MAX", "MIN", "AVERAGE"]);
          const unknown = tokens.filter(tok => !knownFns.has(tok) && !(tok in ctx));
          result = unknown.length ? `未識別: ${unknown.join(",")}` : "❌";
        }
        console.log('realExpression: ', realExpression);
        console.log('ctx keys:', Object.keys(ctx));
        return { ...r, 公式結果: result };
      });

      setPreviewResults(newResults);
    } catch {
      setPreviewResults(records.map((r) => ({ ...r, 公式結果: "❌" })));
    }

  }, [realExpression, records, params, uniqueKey, paramMaps]);

  // ✏️ 使用者輸入（中文/別名公式）
  const onDisplayChange = (txt: string) => {
    setDisplayExpression(txt);
    setRealExpression(convertToReal(txt));
  };

  // 🔁 開啟編輯器
  const openEditor = () => {
    setDisplayExpression((prev) => prev || "");
    setVisible(true);
  };

  // 🧩 插入游標位置
  const insertAtCursor = (displayPiece: string) => {
    const start = selection.start ?? 0;
    const end = selection.end ?? 0;

    const newDisplay =
      displayExpression.slice(0, start) +
      displayPiece +
      displayExpression.slice(end);

    setDisplayExpression(newDisplay);
    setRealExpression(convertToReal(newDisplay)); // ★ 重算 real

    const newPos = start + displayPiece.length;
    setSelection({ start: newPos, end: newPos });

    // 讓 TextInput 保持焦點
    setTimeout(() => inputRef.current?.focus(), 0);
  };


  // 🔘 點選參數插入（顯示插 label，real 插安全變數名）
  const onSelectParam = (item?: ParamItem | Record<string, any>) => {
    if (!item) return;

    const anyItem: any = item;
    const id =
      anyItem.key ??
      anyItem[uniqueKey] ??
      anyItem.question_id ??
      anyItem.id ??
      "";

    if (!id) return;

    const displayName = anyItem.label || "";  //

    const cursorPos = selection.start ?? displayExpression.length;
    const leftChar = displayExpression[cursorPos - 1];
    const needsPlus =
      cursorPos > 0 && !["+", "-", "*", "/", "(", ",", " "].includes(leftChar);

    insertAtCursor((needsPlus ? " + " : "") + displayName);
  };

  // 🔘 插入函數（將函數示例內的 label 也轉為安全變數名）
  const onInsertFunction = (fInsert: string) => {
    insertAtCursor(fInsert); // 顯示層插 demo 片段，real 由 insertAtCursor 內重算
  };

  const clearExpression = () => {
    setDisplayExpression("");
    setRealExpression("");
    setPreviewResults([]);
  };

  // 📊 預覽表格 headers（不顯示唯一識別欄，確保包含「公式結果」）
  const headers = React.useMemo(() => {
    const base = previewResults.length ? previewResults : records;
    if (!base.length) return [{ key: "公式結果", label: "公式結果" }];

    const rawKeys = Object.keys(base[0]).filter(k => k !== uniqueKey && k !== "key");

    const labelMap = Object.fromEntries(
      params.map((p: any) => [
        p?.[uniqueKey] ?? p?.key,
        p.customLabel || p.label,      // ✅ 顯示用 customLabel 優先
      ])
    );

    const cols = rawKeys.map(k => ({
      key: k,                          // ✅ 拿值用 UUID 或 time / 公式結果
      label: labelMap[k] || k,         // ✅ 顯示用
    }));

    if (!cols.find(c => c.key === "公式結果")) {
      cols.push({ key: "公式結果", label: "公式結果" });
    }
    return cols;
  }, [previewResults, records, params, uniqueKey]);


  // 算欄寬
  const columnWidths = headers.map(h =>
    h.key === "紀錄時間" ? 200 : Math.max(h.label.length * 10 + 40, 100)
  );

  // console.log('displayExpression:', displayExpression)
  // console.log('realExpression:', realExpression)
  // console.log('previewResults', previewResults)

  return (
    <>
      {/* === 外層輸入框 === */}
      <TouchableOpacity
        onPress={openEditor}
        style={[styles.inputBox, style]}
        activeOpacity={0.8}
      >
        <TextInput
          editable={false}
          placeholder={placeholder}
          value={displayExpression}
          placeholderTextColor={"rgba(0,0,0,0.35)"}
          style={styles.input}
        />
        <Text style={{ color: "#777" }}>✎</Text>
      </TouchableOpacity>

      {/* === 主編輯器 Modal === */}
      <Modal visible={visible} animationType="slide">
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <ScrollView
                contentContainerStyle={{
                  padding: 16,
                  paddingBottom: insets.bottom + 60,
                }}
              >
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>{t("公式編輯器")}</Text>
                  <TouchableOpacity onPress={() => setVisible(false)}>
                    <Text style={styles.headerAction}>{t("關閉")}</Text>
                  </TouchableOpacity>
                </View>

                {/* 公式輸入 */}
                <Text style={styles.h3}>{t("輸入公式")}</Text>
                <TextInput
                  ref={inputRef}
                  style={styles.freeInput}
                  value={displayExpression}
                  onChangeText={onDisplayChange}
                  onSelectionChange={(e) =>
                    setSelection(e.nativeEvent.selection)
                  }
                  placeholder={t('輸入')}
                  placeholderTextColor="rgba(185,184,184,0.5)"
                  multiline
                />

                {/* 可用參數 */}
                <Text style={styles.h3}>{t("可用參數")}</Text>
                <View style={styles.rowWrap}>
                  {paramList.map((p: any) => {
                    const displayLabel = p.customLabel

                    return (
                      <TouchableOpacity
                        key={p.key || p[uniqueKey] || p.question_id}
                        style={styles.paramBtn}
                        onPress={() => onSelectParam(p)}
                      >
                        <WsFlex>
                          <View>
                            <Text style={styles.originalLabel}>{p.label}</Text>
                            {displayLabel && (
                              <Text style={styles.customLabel}>{`參數：${displayLabel}`}</Text>
                            )}
                          </View>
                          <WsIconBtn
                            padding={0}
                            style={{
                              marginLeft: 8,
                              zIndex: 99
                            }}
                            size={28}
                            name="md-edit"
                            label="編輯"
                            onPress={() => handleOpenModal(p)}
                          />
                        </WsFlex>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Modal 區域 */}
                <Modal
                  visible={modalVisible}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setModalVisible(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                      <WsState
                        style={{
                          flex: 1,
                          marginTop: 16,
                        }}
                        label={t('參數名稱')}
                        placeholder={t('輸入')}
                        value={inputValue}
                        onChange={setInputValue}
                      >
                      </WsState>

                      <WsFlex style={{ position: 'absolute', right: 16, bottom: 16 }}>
                        <TouchableOpacity
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 9,
                            borderColor: $color.gray,
                            borderRadius: 25,
                            borderWidth: 1,
                            width: 110,
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 48
                          }}
                          onPress={() => setModalVisible(false)}
                        >
                          <WsText size={14} color={$color.gray}>{t('取消')}</WsText>
                        </TouchableOpacity>
                        <WsGradientButton style={{ width: 110 }} onPress={handleSaveLabel}>
                          {t('確定')}
                        </WsGradientButton>
                      </WsFlex>

                    </View>
                  </View>
                </Modal>

                {/* 可用函數 */}
                <Text style={styles.h3}>{t("可用函數")}</Text>
                <View style={styles.fnWrap}>
                  {fnDefs.map((f) => (
                    <TouchableOpacity
                      key={f.key}
                      style={styles.fnCard}
                      onPress={() => onInsertFunction(f.insert)}
                    >
                      <Text style={{ fontWeight: "700", color: "#3f51b5" }}>
                        {f.key}（{f.label}）
                      </Text>
                      <Text style={{ fontSize: 12, color: "#666" }}>
                        {f.insert}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 操作按鈕 */}
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.calcBtn, { backgroundColor: "#0b5aaa" }]}
                    onPress={() => setTableVisible(true)}
                  >
                    <Text style={{ color: "#fff" }}>{t("預覽")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.calcBtn}
                    onPress={() => {
                      onChange?.({
                        expression: realExpression,
                        value: 0,
                        displayText: displayExpression,
                      });
                      setVisible(false);
                    }}
                  >
                    <Text style={{ color: "#fff" }}>{t("套用並關閉")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.calcBtn, { backgroundColor: "#b42318" }]}
                    onPress={clearExpression}
                  >
                    <Text style={{ color: "#fff" }}>{t("清除")}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </SafeAreaProvider>

        {/* 📊 預覽表格 */}
        <Modal visible={tableVisible} animationType="fade" transparent>
          <View style={styles.overlay}>
            <View style={styles.tableModal}>
              <View style={styles.tableHeader}>
                <Text style={styles.tableTitle}>{t("試算結果預覽")}</Text>
                <TouchableOpacity onPress={() => setTableVisible(false)}>
                  <Text style={{ color: "#3f51b5" }}>{t("關閉")}</Text>
                </TouchableOpacity>
              </View>

              {/* 方便除錯：目前運算式 */}
              {/* <Text style={{ marginBottom: 8, color: "#666" }}>
                {t("實際運算式")}: {realExpression || "—"}
              </Text> */}

              <ScrollView horizontal>
                <View
                  style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8 }}
                >
                  <View style={[styles.tableRow, { backgroundColor: "#eef4ff" }]}>
                    {headers.map((h, idx) => (
                      <Text key={h.key} style={[styles.cell, styles.headerCell, { width: columnWidths[idx] }]}>
                        {h.label}
                      </Text>
                    ))}
                  </View>

                  {previewResults.map((r, i) => (
                    <View key={i} style={[styles.tableRow, { backgroundColor: i % 2 ? "#fafafa" : "#fff" }]}>
                      {headers.map((h, idx) => (
                        <Text key={h.key} style={[styles.cell, { width: columnWidths[idx] }]}>
                          {String(r[h.key] ?? "")}   {/* ✅ 用 key 取值 */}
                        </Text>
                      ))}
                    </View>
                  ))}

                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  inputBox: {
    borderWidth: 0.5,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  input: { flex: 1, fontSize: 16 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "700" },
  headerAction: { color: "#3f51b5", fontSize: 16 },
  h3: { fontSize: 14, fontWeight: "600", marginTop: 16 },
  freeInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
    fontSize: 16,
  },
  fnWrap: { flexDirection: "column", gap: 8, marginTop: 4 },
  fnCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#f9f9ff",
  },
  row: { flexDirection: "row", gap: 8, marginTop: 16 },
  calcBtn: {
    backgroundColor: "#3f51b5",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  tableModal: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
    width: "95%",
    maxHeight: "80%",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  tableTitle: { fontSize: 16, fontWeight: "700" },
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#eee" },
  cell: { paddingVertical: 6, paddingHorizontal: 8, textAlign: "center" },
  headerCell: { fontWeight: "700" },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  paramBtn: {
    margin: 6,
    padding: 8,
    backgroundColor: "#ffffffff",
    borderRadius: 8,
    borderWidth: 0.5,
    justifyContent: 'space-between'
  },
  container: { padding: 12 },
  originalLabel: { color: "#5d5d5d", fontSize: 12 },
  customLabel: { color: "#0a0a0aff", fontSize: 12, marginTop: 4, borderTopWidth: 0.5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(144, 142, 142, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    height: 260,
    backgroundColor: "#ffffffff",
    borderRadius: 10,
    padding: 16,
  },
  modalTitle: { color: "#090909ff", fontSize: 14, marginBottom: 8 },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
