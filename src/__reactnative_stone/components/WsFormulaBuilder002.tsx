import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { create, all } from "mathjs";
import { SafeAreaView, useSafeAreaInsets, SafeAreaProvider } from "react-native-safe-area-context";
import $color from "@/__reactnative_stone/global/color";
import { useTranslation } from "react-i18next";

// ============== mathjs 實例 ==============
const math = create(all, { number: "number" });
math.import(
  {
    SUM: (...args: number[]) => math.sum(args as any),
    MAX: (...args: number[]) => math.max(args as any),
    MIN: (...args: number[]) => math.min(args as any),
    AVERAGE: (...args: number[]) => math.mean(args as any),
  },
  { override: true }
);

export type FormulaParam = {
  key: string;
  value: number;
  label?: string;
};

export type FormulaChangePayload = {
  expression: string;
  value: number;
  displayText: string;
  unit?: string;
};

const buildScope = (params: FormulaParam[]) =>
  Object.fromEntries(params.map((p) => [p.key, p.value]));

export default function WsFormulaBuilder002({
  placeholder = "點擊以建立/編輯公式…",
  onChange,
  params = [],
}: {
  placeholder?: string;
  onChange?: (payload: FormulaChangePayload) => void;
  params?: FormulaParam[];
}) {
  const { t } = useTranslation();
  const { width, height } = Dimensions.get("window");
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  const [visible, setVisible] = React.useState(false);
  const [expression, setExpression] = React.useState<string>("");
  const [resultNum, setResultNum] = React.useState<number | null>(null);
  const [err, setErr] = React.useState<string>("");

  const [suggestions, setSuggestions] = React.useState<string[]>([]);

  // 定義函數時就寫好範例字串
  const fnDefs = React.useMemo(
    () => [
      { key: "SUM", label: t("加總1"), insert: "SUM(arg1, arg2, ...)" },
      { key: "MAX", label: t("最大值"), insert: "MAX(arg1, arg2, ...)" },
      { key: "MIN", label: t("最小值"), insert: "MIN(arg1, arg2, ...)" },
      { key: "AVERAGE", label: t("平均值"), insert: "AVERAGE(arg1, arg2, ...)" },
    ],
    [t]
  );

  const openModal = () => setVisible(true);

  const compute = () => {
    try {
      const val = math.evaluate(expression, buildScope(params));
      if (typeof val === "number" && isFinite(val)) {
        setResultNum(val);
        setErr("");
      } else {
        throw new Error("結果非數值");
      }
    } catch (e: any) {
      setErr(e?.message ?? "公式錯誤");
      setResultNum(null);
    }
  };

  const applyAndClose = () => {
    try {
      const rawVal = math.evaluate(expression, buildScope(params));
      const num = Number(rawVal);
      if (!Number.isFinite(num)) throw new Error("結果非數值");

      onChange?.({
        expression,
        value: num,
        displayText: `${expression} = ${num.toFixed(3)}`,
      });
      setErr("");
      setVisible(false);
    } catch (e: any) {
      setErr(e?.message ?? "計算錯誤");
    }
  };

  const onChangeExpr = (txt: string) => {
    setExpression(txt);

    const lastWord = txt.split(/[^a-zA-Z0-9_]/).pop() || "";
    if (!lastWord) {
      setSuggestions([]);
      return;
    }

    const matches = [
      ...fnDefs.map((f) => f.key).filter((fn) => fn.startsWith(lastWord.toUpperCase())),
      ...params
        .map((p) => p.key)
        .filter((p) => p.toLowerCase().startsWith(lastWord.toLowerCase())),
    ];
    setSuggestions(matches);
  };

  const onSelectSuggestion = (s: string) => {
    const fn = fnDefs.find((f) => f.key === s);
    const insertText = fn ? fn.insert : s;
    const prefix = expression.replace(/([a-zA-Z0-9_]*)$/, "");
    setExpression(prefix + insertText);
    setSuggestions([]);
  };

  const clearExpression = () => {
    setExpression("");
    setResultNum(null);
    setErr("");
  };

  const fg = isDark ? "#111" : "#111";
  const sub = "#555";
  const cardBg = "#fff";
  const border = $color.gray;

  return (
    <>
      {/* ===== 外層顯示 ===== */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={openModal}
        style={[styles.inputBox, { borderColor: border, backgroundColor: cardBg }]}
      >
        <TextInput
          editable={false}
          placeholder={placeholder}
          placeholderTextColor={"rgba(0,0,0,0.35)"}
          value={expression}
          style={[styles.input, { color: fg }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        />
        <Text style={{ color: sub }}>✎</Text>
      </TouchableOpacity>

      {/* ===== Modal ===== */}
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        transparent={false}
        onRequestClose={() => setVisible(false)}
      >
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top", "bottom"]}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : undefined}
              style={{ flex: 1, backgroundColor: "#fff" }}
            >
              <ScrollView
                contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}
                keyboardShouldPersistTaps="handled"
              >
                {/* 標題 */}
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>{t("公式編輯器")}</Text>
                  <TouchableOpacity onPress={() => {
                    clearExpression()
                    setVisible(false)
                  }
                  }
                  >
                    <Text style={styles.headerAction}>{t("關閉")}</Text>
                  </TouchableOpacity>
                </View>

                {/* 自由輸入公式 */}
                <Text style={styles.h3}>{t("輸入公式")}</Text>
                <TextInput
                  style={styles.freeInput}
                  value={expression}
                  onChangeText={onChangeExpr}
                  placeholder="例如：SUM(A1, 10)"
                  multiline
                />

                {/* snippets 候選 */}
                {suggestions.length > 0 && (
                  <View style={styles.suggestionBox}>
                    {suggestions.map((s) => (
                      <TouchableOpacity
                        key={s}
                        onPress={() => onSelectSuggestion(s)}
                        style={styles.suggestionItem}
                      >
                        <Text style={{ fontWeight: "600", color: "#0b5aaa" }}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* 函數區塊（hint + 可點擊插入） */}
                <Text style={styles.h3}>{t("可用函數")}</Text>
                <View style={styles.fnWrap}>
                  {fnDefs.map((f) => (
                    <TouchableOpacity
                      key={f.key}
                      onPress={() => onSelectSuggestion(f.key)}
                      style={styles.fnCard}
                    >
                      <Text style={{ fontWeight: "700", color: "#3f51b5" }}>
                        {f.label} {f.key}
                      </Text>
                      <Text style={{ fontSize: 12, color: "#555" }}>{f.insert}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 可用參數 */}
                <Text style={styles.h3}>{t("可用參數")}</Text>
                <View style={styles.rowWrap}>
                  {params.length === 0 ? (
                    <Text style={{ color: "#777" }}>（{t("目前沒有可用參數")}）</Text>
                  ) : (
                    params.map((p) => (
                      <TouchableOpacity
                        key={p.key}
                        onPress={() => onSelectSuggestion(p.key)}
                        style={styles.paramBtn}
                      >
                        <Text>{p.label ? `${p.key} (${p.label})` : p.key}</Text>
                      </TouchableOpacity>
                    ))
                  )}
                </View>

                {/* 操作列 */}
                <View style={styles.row}>
                  <TouchableOpacity style={styles.calcBtn} onPress={compute}>
                    <Text style={{ color: "#fff" }}>{t("計算")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.calcBtn} onPress={applyAndClose}>
                    <Text style={{ color: "#fff" }}>{t("套用並關閉")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.calcBtn, { backgroundColor: "#b42318" }]} // 紅色清除
                    onPress={clearExpression}
                  >
                    <Text style={{ color: "#fff" }}>{t("清除")}</Text>
                  </TouchableOpacity>
                </View>

                {/* 結果 */}
                <View style={[styles.resultCard, !!err ? styles.resultCardError : styles.resultCardOk]}>
                  <Text style={{ fontWeight: "700" }}>
                    {err ? `❌ ${err}` : `= ${resultNum ?? "-"}`}
                  </Text>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal >
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
    gap: 8,
    backgroundColor: "#fff",
  },
  input: { flex: 1, padding: 0, margin: 0 },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: "700" },
  headerAction: { fontSize: 16, color: "#3f51b5" },
  h3: { fontSize: 14, fontWeight: "600", marginTop: 16, marginBottom: 6 },
  freeInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    minHeight: 60,
    fontSize: 16,
  },
  suggestionBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginTop: 4,
    backgroundColor: "#fff",
  },
  suggestionItem: { padding: 8 },
  fnWrap: { flexDirection: "column", gap: 8 },
  fnCard: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
    backgroundColor: "#f9f9ff",
  },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  paramBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
  },
  row: { flexDirection: "row", gap: 8, marginTop: 12 },
  calcBtn: {
    backgroundColor: "#3f51b5",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  resultCard: {
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  resultCardOk: { borderColor: "#cfe2ff", backgroundColor: "#f0f7ff" },
  resultCardError: { borderColor: "#ffd6d6", backgroundColor: "#fff3f3" },
});
