import React from "react";
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
import { useTranslation } from "react-i18next";

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

export default function WsFormulaBuilder002({
  placeholder = "點擊以建立或編輯公式…",
  params = [],
  records = [],
  onChange,
}: {
  placeholder?: string;
  params?: { question_id: string; label: string }[];
  records?: { [key: string]: any }[];
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
  const [displayExpression, setDisplayExpression] = React.useState(""); // 顯示中文 label
  const [realExpression, setRealExpression] = React.useState(""); // 實際計算式 (_A001)

  const [selection, setSelection] = React.useState({ start: 0, end: 0 });
  const [previewResults, setPreviewResults] = React.useState<any[]>([]);
  const inputRef = React.useRef<TextInput>(null);

  const fnDefs = [
    { key: "SUM", label: "加總", insert: "SUM(題目A, 題目B)" },
    { key: "MAX", label: "最大值", insert: "MAX(題目A, 題目B)" },
    { key: "MIN", label: "最小值", insert: "MIN(題目A, 題目B)" },
    { key: "AVERAGE", label: "平均值", insert: "AVERAGE(題目A, 題目B)" },
  ];

  // 🧩 轉換：顯示用(label) → 運算用(_A001)
  const convertToReal = (txt: string) => {
    let result = txt;
    params.forEach((p) => {
      const safe = p.label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safe, "g");
      result = result.replace(regex, "_" + p.question_id);
    });
    return result;
  };

  // 🧩 轉換：運算用(_A001) → 顯示用(label)
  const convertToDisplay = (txt: string) => {
    let result = txt;
    params.forEach((p) => {
      const regex = new RegExp(`_${p.question_id}`, "g");
      result = result.replace(regex, p.label);
    });
    return result;
  };

  // 🧮 預覽計算
  React.useEffect(() => {
    if (!realExpression || !records?.length) {
      setPreviewResults([]);
      return;
    }

    try {
      const newResults = records.map((r) => {
        const ctx: Record<string, number> = {};
        params.forEach((p) => {
          const val = r[p.label];
          ctx["_" + p.question_id] = Number(val) || 0;
        });

        let result: any = "❌";
        try {
          const val = math.evaluate(realExpression, ctx);
          const num = Number(val);
          result = Number.isFinite(num) ? num : "❌";
        } catch (e) {
          result = "❌";
        }
        return { ...r, 公式結果: result };
      });
      setPreviewResults(newResults);
    } catch {
      setPreviewResults(records.map((r) => ({ ...r, 公式結果: "❌" })));
    }
  }, [realExpression, records, params]);

  // ✏️ 使用者輸入（中文公式）
  const onDisplayChange = (txt: string) => {
    setDisplayExpression(txt);
    setRealExpression(convertToReal(txt));
  };

  // 🔁 開啟編輯器時，將 real → display
  const openEditor = () => {
    setDisplayExpression((prev) => prev || "");
    setVisible(true);
  };

  // 🧩 插入游標位置
  const insertAtCursor = (display: string, real: string) => {
    const start = selection.start ?? 0;
    const end = selection.end ?? 0;
    const before = displayExpression.slice(0, start);
    const after = displayExpression.slice(end);
    setDisplayExpression(before + display + after);

    const realBefore = realExpression.slice(0, start);
    const realAfter = realExpression.slice(end);
    setRealExpression(realBefore + real + realAfter);

    const newPos = start + display.length;
    setSelection({ start: newPos, end: newPos });
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // 🔘 點選參數插入
  const onSelectParam = (id: string, label: string) => {
    const cursorPos = selection.start ?? displayExpression.length;
    const leftChar = displayExpression[cursorPos - 1];
    const needsPlus =
      cursorPos > 0 && !["+", "-", "*", "/", "(", ",", " "].includes(leftChar);
    insertAtCursor(
      (needsPlus ? " + " : "") + label,
      (needsPlus ? " + " : "") + "_" + id
    );
  };

  // 🔘 插入函數
  const onInsertFunction = (fInsert: string) => {
    let real = convertToReal(fInsert);
    insertAtCursor(fInsert, real);
  };

  const clearExpression = () => {
    setDisplayExpression("");
    setRealExpression("");
    setPreviewResults([]);
  };

  // 📊 預覽表格 headers（不顯示 question_id）
  const headers = React.useMemo(() => {
    if (previewResults.length > 0)
      return Object.keys(previewResults[0]).filter((k) => k !== "question_id");
    if (records.length > 0)
      return [
        ...Object.keys(records[0]).filter((k) => k !== "question_id"),
        "公式結果",
      ];
    return ["公式結果"];
  }, [previewResults, records]);

  const columnWidths = headers.map((h) =>
    h === "time" ? 160 : Math.max(h.length * 10 + 40, 100)
  );

  return (
    <>
      {/* === 外層輸入框 === */}
      <TouchableOpacity
        onPress={openEditor}
        style={styles.inputBox}
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
                  <TouchableOpacity
                    onPress={() => {
                      setVisible(false);
                    }}
                  >
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
                  placeholder="例如：SUM(題目A, 題目B) 或 (題目A + 題目B) * 2"
                  multiline
                />

                {/* 可用參數 */}
                <Text style={styles.h3}>{t("可用參數")}</Text>
                <View style={styles.rowWrap}>
                  {params.map((p) => (
                    <TouchableOpacity
                      key={p.question_id}
                      onPress={() => onSelectParam(p.question_id, p.label)}
                      style={styles.paramBtn}
                    >
                      <Text>{p.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

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

              <ScrollView horizontal>
                <View
                  style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8 }}
                >
                  <View
                    style={[styles.tableRow, { backgroundColor: "#eef4ff" }]}
                  >
                    {headers.map((h, idx) => (
                      <Text
                        key={h}
                        style={[
                          styles.cell,
                          styles.headerCell,
                          { width: columnWidths[idx] },
                        ]}
                      >
                        {h}
                      </Text>
                    ))}
                  </View>
                  {previewResults.map((r, i) => (
                    <View
                      key={i}
                      style={[
                        styles.tableRow,
                        { backgroundColor: i % 2 ? "#fafafa" : "#fff" },
                      ]}
                    >
                      {headers.map((h, idx) => (
                        <Text
                          key={h}
                          style={[styles.cell, { width: columnWidths[idx] }]}
                        >
                          {String(r[h] ?? "")}
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
    borderWidth: 1,
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
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  paramBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
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
});
