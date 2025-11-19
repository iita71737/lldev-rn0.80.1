import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
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
  WsIconBtn,
} from "@/components";
import { useTranslation } from "react-i18next";
import $color from "@/__reactnative_stone/global/color";
import AsyncStorage from "@react-native-community/async-storage";

/* ========================= mathjs ========================= */
const math = create(all, { number: "number" });

/* ========================= 型別 ========================= */
type ParamItem = {
  key: string;
  label: string;
  customLabel?: string;
  option_id: string;
  question_id: string;
};

type HeaderCol = { key: string; label: string };

type NewToken =
  | { type: "number"; text: string }
  | { type: "op"; text: string }
  | { type: "func"; text: string }
  | { type: "lparen"; text: "(" }
  | { type: "rparen"; text: ")" }
  | { type: "comma"; text: "," }
  | { type: "name"; text: string }
  | { type: "other"; text: string };

type CountCall = {
  type: "COUNTIF" | "COUNTIFS";
  raw: string; // e.g. "COUNTIF(`xxx`,`yyy`)"
  labels: string[];
};

/* ========================= 工具 ========================= */

const KNOWN_FUNCS = new Set(["COUNTIF", "COUNTIFS"]);
const RESERVED_WORDS = new Set([...KNOWN_FUNCS]);
const SAFE_NAME_RE = /^[A-Za-z_][A-Za-z0-9_\u4E00-\u9FFF]*$/;

// 需要反引號的名稱
const needsBacktickLoose = (s: string) =>
  !SAFE_NAME_RE.test(s || "") ||
  RESERVED_WORDS.has(String(s).toUpperCase());

// for auto-wrap
const needsBacktick = (s: string) =>
  /[^A-Za-z0-9_\u4E00-\u9FFF]/.test(s || "") ||
  RESERVED_WORDS.has(String(s).toUpperCase());

// CJK + 英數底線：視為可組成名稱
const isIdentChar = (ch: string) => {
  if (!ch) return false;
  if (/[A-Za-z0-9_]/.test(ch)) return true;
  const code = ch.charCodeAt(0);
  if (code >= 0x4e00 && code <= 0x9fff) return true;
  return false;
};

// UUID（避免被拆開）
const UUID_RE = /^[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}/;

const tokenize = (input: string): NewToken[] => {
  const out: NewToken[] = [];
  const n = input.length;
  let i = 0;
  const pushOp = (v: string) => out.push({ type: "op", text: v });

  while (i < n) {
    const ch = input[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // number
    if (
      /[0-9]/.test(ch) ||
      (ch === "." && i + 1 < n && /[0-9]/.test(input[i + 1]))
    ) {
      let j = i;
      let sawDot = false;

      if (input[j] === ".") {
        sawDot = true;
        j++;
      } else {
        while (j < n && /[0-9]/.test(input[j])) j++;
      }

      if (j < n && input[j] === "." && !sawDot) {
        sawDot = true;
        j++;
      }
      while (j < n && /[0-9]/.test(input[j])) j++;

      if (j < n && (input[j] === "e" || input[j] === "E")) {
        const k = j + 1;
        const hasSign = k < n && (input[k] === "+" || input[k] === "-");
        const nextIsDigit =
          (hasSign ? k + 1 : k) < n &&
          /[0-9]/.test(input[hasSign ? k + 1 : k]);
        if (nextIsDigit) {
          j++;
          if (hasSign) j++;
          while (j < n && /[0-9]/.test(input[j])) j++;
        }
      }

      out.push({ type: "number", text: input.slice(i, j) });
      i = j;
      continue;
    }

    // UUID
    const uuidSlice = input.slice(i);
    const uuidMatch = uuidSlice.match(UUID_RE);
    if (uuidMatch) {
      out.push({ type: "name", text: uuidMatch[0] });
      i += uuidMatch[0].length;
      continue;
    }

    // 反引號名稱
    if (ch === "`") {
      let j = i + 1;
      while (j < n && input[j] !== "`") j++;
      if (j < n && input[j] === "`") {
        const nameInside = input.slice(i + 1, j);
        out.push({ type: "name", text: nameInside });
        i = j + 1;
        continue;
      }
    }

    if ("+-*/^".includes(ch)) {
      pushOp(ch);
      i++;
      continue;
    }
    if (ch === "(") {
      out.push({ type: "lparen", text: "(" });
      i++;
      continue;
    }
    if (ch === ")") {
      out.push({ type: "rparen", text: ")" });
      i++;
      continue;
    }
    if (ch === ",") {
      out.push({ type: "comma", text: "," });
      i++;
      continue;
    }

    if (isIdentChar(ch)) {
      let j = i + 1;
      while (j < n && isIdentChar(input[j])) j++;
      const word = input.slice(i, j);
      const upper = word.toUpperCase();
      if (KNOWN_FUNCS.has(upper))
        out.push({ type: "func", text: word.toLowerCase() });
      else out.push({ type: "name", text: word });
      i = j;
      continue;
    }

    out.push({ type: "other", text: ch });
    i++;
  }

  return out;
};

// 解析 COUNTIF / COUNTIFS 呼叫
const extractCountCalls = (display: string): CountCall[] => {
  const out: CountCall[] = [];
  const re = /(COUNTIF|COUNTIFS)\s*\(([^)]*)\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(display))) {
    const fn = m[1].toUpperCase() as "COUNTIF" | "COUNTIFS";
    const inside = m[2];
    const labels: string[] = [];
    const reLabel = /`([^`]+)`/g;
    let lm: RegExpExecArray | null;
    while ((lm = reLabel.exec(inside))) {
      labels.push(lm[1]);
    }
    out.push({ type: fn, raw: m[0], labels });
  }
  return out;
};

const escapeRegExp = (s: string) =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// 由 label 建 map
const buildLabelToParamMap = (params: ParamItem[]) => {
  const map = new Map<string, ParamItem>();
  params.forEach((p) => {
    map.set(p.label, p);
    if (p.customLabel) map.set(p.customLabel, p);
  });
  return map;
};

// 某筆 record 是否有選到該選項
const recordHasOption = (
  record: Record<string, any>,
  param: ParamItem
): boolean => {
  const arr = Array.isArray(record[param.question_id])
    ? record[param.question_id]
    : [];
  return arr.some((it: any) => String(it?.id) === String(param.option_id));
};

// COUNTIF：labels = [labelA, labelB...]  → OR 邏輯
const computeCOUNTIF = (
  labels: string[],
  labelToParam: Map<string, ParamItem>,
  records: Record<string, any>[]
): number => {
  if (!labels.length) return 0;
  const params: ParamItem[] = [];
  for (const lb of labels) {
    const p = labelToParam.get(lb);
    if (p) params.push(p);
  }
  if (!params.length) return 0;

  let total = 0;
  for (const r of records || []) {
    const ok = params.some((p) => recordHasOption(r, p));
    if (ok) total += 1;
  }
  return total;
};

// COUNTIFS：labels = [labelA, labelB...] → AND 邏輯
const computeCOUNTIFS = (
  labels: string[],
  labelToParam: Map<string, ParamItem>,
  records: Record<string, any>[]
): number => {
  if (!labels.length) return 0;
  const params: ParamItem[] = [];
  for (const lb of labels) {
    const p = labelToParam.get(lb);
    if (p) params.push(p);
  }
  if (!params.length) return 0;

  let total = 0;
  for (const r of records || []) {
    const ok = params.every((p) => recordHasOption(r, p));
    if (ok) total += 1;
  }
  return total;
};

// 從 displayExpression 抓出有用到的參數（看反引號裡的 label）
const extractUsedParams = (
  display: string,
  paramList: ParamItem[],
  labelToParam: Map<string, ParamItem>
) => {
  const re = /`([^`]+)`/g;
  let m: RegExpExecArray | null;
  const used = new Map<string, ParamItem>();

  while ((m = re.exec(display))) {
    const lb = m[1];
    const p = labelToParam.get(lb);
    if (p) used.set(p.key, p);
  }
  return Array.from(used.values()).map((p) => ({
    key: p.key,
    label: p.label,
    customLabel: p.customLabel,
  }));
};

/* ========================= 元件 ========================= */

export default function WsFormulaBuilder003({
  style,
  placeholder = "點擊以建立或編輯公式…",
  params = [],
  records = [],
  onChange,
  statisticsId,
  sectionId,
}: {
  style?: any;
  placeholder?: string;
  params?: Record<string, any>[];
  records?: { [key: string]: any }[];
  onChange?: (payload: {
    expression: string;
    value: number;
    displayText: string;
    previewResults?: any[];
    formula_used_params?: Array<{
      key: string;
      label: string;
      customLabel?: string;
    }>;
  }) => void;
  statisticsId?: string | number;
  sectionId?: string | number;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const buildDatasetKey = (
    statisticsId?: string | number,
    sectionId?: string | number
  ) => `${statisticsId}-${sectionId}-@dataSet`;

  const [visible, setVisible] = useState(false);
  const [tableVisible, setTableVisible] = useState(false);

  const [displayExpression, setDisplayExpression] = useState("");
  const [previewResults, setPreviewResults] = useState<any[]>([]);
  const [usedParams, setUsedParams] = useState<
    Array<{ key: string; label: string; customLabel?: string }>
  >([]);

  const [toks, setToks] = useState<NewToken[]>([]);

  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const inputRef = useRef<TextInput>(null);

  // 允許修改 customLabel
  const [paramList, setParamList] = useState<ParamItem[]>(
    (params as any[]).map((p: any) => ({
      ...p,
      key:
        p.key ??
        p.option_id ??
        `${p.question_id}_${p.option_id ?? ""}`,
      customLabel: p.customLabel ?? "",
    }))
  );

  useEffect(() => {
    setParamList(
      (params as any[]).map((p: any) => ({
        ...p,
        key:
          p.key ??
          p.option_id ??
          `${p.question_id}_${p.option_id ?? ""}`,
        customLabel: p.customLabel ?? "",
      }))
    );
  }, [params]);

  const labelToParam = useMemo(
    () => buildLabelToParamMap(paramList),
    [paramList]
  );

  const knownLabels = useMemo(() => {
    const set = new Set<string>();
    paramList.forEach((p) => {
      if (p.label) set.add(p.label);
      if (p.customLabel) set.add(p.customLabel);
    });
    return set;
  }, [paramList]);

  /* ========== header：目前只顯示 公式結果 一欄 ========== */

  const headers: HeaderCol[] = useMemo(() => {
    if (!previewResults.length) return [];
    const keys = Object.keys(previewResults[0]);
    return keys.map((k) => ({ key: k, label: k }));
  }, [previewResults]);

  const columnWidths = headers.map((h) =>
    Math.max(h.label.length * 10 + 80, 100)
  );

  /* ========== 公式變更 & 預覽計算 ========== */

  // 自動反引號包 unsafe 名稱（只針對已知 label）
  const autoWrapUnsafeNamesInDisplay = useCallback(
    (txt: string) => {
      const tokens = tokenize(txt);
      let changed = false;
      const parts: string[] = [];

      for (const tok of tokens) {
        if (tok.type === "name") {
          const isKnown = knownLabels.has(tok.text);
          if (isKnown && needsBacktickLoose(tok.text)) {
            parts.push("`" + tok.text + "`");
            changed = true;
          } else {
            parts.push(tok.text);
          }
        } else {
          parts.push(tok.text);
        }
      }

      if (changed) {
        setToks(tokenize(parts.join("")));
        return parts.join("");
      } else {
        setToks(tokens);
        return txt;
      }
    },
    [knownLabels]
  );

  const recalcPreview = useCallback(
    (expr: string) => {
      const trimmed = (expr || "").trim();
      if (!trimmed) {
        setPreviewResults([]);
        setUsedParams([]);
        return;
      }

      // 抓 COUNTIF / COUNTIFS 呼叫
      const calls = extractCountCalls(trimmed);

      // 算出每個呼叫的數值
      const valueMap = new Map<string, number>();
      for (const c of calls) {
        let val = 0;
        if (c.type === "COUNTIF") {
          val = computeCOUNTIF(c.labels, labelToParam, records);
        } else {
          val = computeCOUNTIFS(c.labels, labelToParam, records);
        }
        valueMap.set(c.raw, val);
      }

      // 將 COUNTIF/COUNTIFS(...) 替換成實際數字
      let evalExpr = trimmed;
      for (const [raw, val] of valueMap.entries()) {
        const pattern = new RegExp(escapeRegExp(raw), "g");
        evalExpr = evalExpr.replace(pattern, String(val));
      }

      // 用 math.js 只做四則運算
      let result: any = "";
      try {
        const v = math.evaluate(evalExpr);
        if (typeof v === "number" && Number.isFinite(v)) {
          result = Math.round(v * 1000000) / 1000000;
        } else {
          result = String(v);
        }
      } catch (err) {
        result = "公式錯誤";
      }

      setPreviewResults([{ 公式結果: result }]);
      setUsedParams(extractUsedParams(trimmed, paramList, labelToParam));
    },
    [labelToParam, paramList, records]
  );

  const onDisplayChange = (txt: string) => {
    const incoming = autoWrapUnsafeNamesInDisplay(txt);
    setDisplayExpression(incoming);
    recalcPreview(incoming);
  };

  /* ========== 參數插入 ========== */

  const insertAtCursor = (piece: string) => {
    const start = selection.start ?? 0;
    const end = selection.end ?? 0;

    const newDisplay =
      displayExpression.slice(0, start) +
      piece +
      displayExpression.slice(end);

    setDisplayExpression(newDisplay);
    setToks(tokenize(newDisplay));

    const newPos = start + piece.length;
    setSelection({ start: newPos, end: newPos });

    recalcPreview(newDisplay);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const onSelectParam = (item?: ParamItem | Record<string, any>) => {
    if (!item) return;
    const p = item as any;
    const displayName =
      (typeof p.customLabel === "string" && p.customLabel.trim()) ||
      p.label ||
      "";
    const piece = needsBacktick(displayName)
      ? "`" + displayName + "`"
      : displayName;
    insertAtCursor(piece);
  };

  const onInsertFunction = (type: "COUNTIF" | "COUNTIFS") => {
    if (type === "COUNTIF") {
      insertAtCursor("COUNTIF(A)");
    } else {
      insertAtCursor("COUNTIFS(A,B)");
    }
  };

  const clearExpression = () => {
    setDisplayExpression("");
    setPreviewResults([]);
    setUsedParams([]);
    setToks([]);
  };

  /* ========== 自訂名稱 Modal ========== */

  const [inputValue, setInputValue] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingParam, setEditingParam] = useState<ParamItem | null>(null);

  const handleOpenModal = (item: ParamItem) => {
    setEditingParam(item);
    setInputValue(item.customLabel || item.label);
    setModalVisible(true);
  };

  const handleSaveLabel = () => {
    if (!editingParam) return;
    setParamList((prev) =>
      prev.map((p) =>
        p.key === editingParam.key
          ? { ...p, customLabel: inputValue }
          : p
      )
    );
    setModalVisible(false);
    recalcPreview(displayExpression);
  };

  const openEditor = () => {
    setDisplayExpression((prev) => prev || "");
    setVisible(true);
  };

  /* ========== 套用並關閉（寫入 storage，含 toks） ========== */

  const handleApplyAndClose = useCallback(async () => {
    const formulaPayload = {
      displayExpression,
      previewResults,
      formula_used_params: usedParams,
      toks,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (statisticsId != null && sectionId != null) {
        const storageKey = buildDatasetKey(statisticsId, sectionId);

        const raw = await AsyncStorage.getItem(storageKey);
        let obj: any = {};
        if (raw) {
          try {
            obj = JSON.parse(raw) ?? {};
          } catch {
            obj = {};
          }
        }

        const next = { ...obj, formula_builder: formulaPayload };
        await AsyncStorage.setItem(storageKey, JSON.stringify(next));
      }
    } catch (err) {
      console.warn("Failed to save formula to storage:", err);
    }

    const val =
      typeof previewResults[0]?.["公式結果"] === "number"
        ? previewResults[0]["公式結果"]
        : 0;

    onChange?.({
      expression: displayExpression,
      value: val,
      displayText: displayExpression,
      previewResults,
      formula_used_params: usedParams,
    });

    setVisible(false);
  }, [
    displayExpression,
    previewResults,
    usedParams,
    toks,
    statisticsId,
    sectionId,
    onChange,
  ]);

  /* ========== 初始載入 storage ========== */

  useEffect(() => {
    const loadSaved = async () => {
      try {
        if (statisticsId == null || sectionId == null) return;
        const storageKey = buildDatasetKey(statisticsId, sectionId);
        const saved = await AsyncStorage.getItem(storageKey);
        if (!saved) return;

        const parsed: any = JSON.parse(saved);
        const fb = parsed?.formula_builder;
        if (fb) {
          if (typeof fb.displayExpression === "string") {
            const txt = fb.displayExpression;
            setDisplayExpression(txt);
            setToks(Array.isArray(fb.toks) ? (fb.toks as NewToken[]) : tokenize(txt));
            recalcPreview(txt);
          }
        }
      } catch (err) {
        console.warn("載入已存資料失敗：", err);
      }
    };
    loadSaved();
  }, [statisticsId, sectionId, recalcPreview]);

  /* ========================= Render ========================= */

  return (
    <>
      {/* 外層輸入框 */}
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

      {/* 主編輯器 Modal */}
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
                  placeholder="例如：COUNTIF(A) 或 COUNTIFS(A,B)；A/B 可以改成點選的選項"
                  placeholderTextColor="rgba(185,184,184,0.5)"
                  multiline
                />

                {/* 可用參數 */}
                <Text style={styles.h3}>{t("可用參數")}</Text>
                <View style={styles.rowWrap}>
                  {paramList.map((p) => {
                    const displayLabel = p.customLabel;
                    return (
                      <TouchableOpacity
                        key={p.key}
                        style={styles.paramBtn}
                        onPress={() => onSelectParam(p)}
                        activeOpacity={0.8}
                      >
                        <WsFlex>
                          <View>
                            <Text style={styles.originalLabel}>
                              {p.label}
                            </Text>
                            {displayLabel && (
                              <Text style={styles.customLabel}>
                                {`參數：${displayLabel}`}
                              </Text>
                            )}
                          </View>
                          <WsIconBtn
                            padding={0}
                            style={{ marginLeft: 8, zIndex: 99 }}
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

                {/* 自訂名稱 Modal */}
                <Modal
                  visible={modalVisible}
                  transparent
                  animationType="fade"
                  onRequestClose={() => setModalVisible(false)}
                >
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                      <WsState
                        style={{ flex: 1, marginTop: 16 }}
                        label={t("參數名稱")}
                        placeholder={t("輸入")}
                        value={inputValue}
                        onChange={setInputValue}
                      />
                      <WsFlex
                        style={{
                          position: "absolute",
                          right: 16,
                          bottom: 16,
                        }}
                      >
                        <TouchableOpacity
                          style={styles.cancelBtn}
                          onPress={() => setModalVisible(false)}
                        >
                          <WsText size={14} color={$color.gray}>
                            {t("取消")}
                          </WsText>
                        </TouchableOpacity>
                        <WsGradientButton
                          style={{ width: 110 }}
                          onPress={handleSaveLabel}
                        >
                          {t("確定")}
                        </WsGradientButton>
                      </WsFlex>
                    </View>
                  </View>
                </Modal>

                {/* 可用函數 */}
                <Text style={styles.h3}>{t("可用函數")}</Text>
                <View style={styles.fnWrap}>
                  <TouchableOpacity
                    key="COUNTIF"
                    style={styles.fnCard}
                    onPress={() => onInsertFunction("COUNTIF")}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        color: "#3f51b5",
                      }}
                    >
                      COUNTIF（{t("計算至少一個選項被選到的紀錄數")}）
                    </Text>
                    <Text style={{ fontSize: 12, color: "#666" }}>
                      COUNTIF(A) → A 改成 `選項label`
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    key="COUNTIFS"
                    style={styles.fnCard}
                    onPress={() => onInsertFunction("COUNTIFS")}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={{
                        fontWeight: "700",
                        color: "#3f51b5",
                      }}
                    >
                      COUNTIFS（{t("計算同時滿足多個選項的紀錄數")}）
                    </Text>
                    <Text style={{ fontSize: 12, color: "#666" }}>
                      COUNTIFS(A,B) → A/B 改成 `選項label`
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 操作按鈕 */}
                <View style={styles.row}>
                  <TouchableOpacity
                    style={[styles.calcBtn, { backgroundColor: "#0b5aaa" }]}
                    onPress={() => setTableVisible(true)}
                    activeOpacity={0.85}
                  >
                    <Text style={{ color: "#fff" }}>{t("預覽")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.calcBtn}
                    onPress={handleApplyAndClose}
                    activeOpacity={0.85}
                  >
                    <Text style={{ color: "#fff" }}>{t("套用並關閉")}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.calcBtn,
                      { backgroundColor: "#b42318" },
                    ]}
                    onPress={clearExpression}
                    activeOpacity={0.85}
                  >
                    <Text style={{ color: "#fff" }}>{t("清除")}</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </SafeAreaProvider>

        {/* 預覽表格 */}
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
                  style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 8,
                  }}
                >
                  {headers.length > 0 && (
                    <View
                      style={[
                        styles.tableRow,
                        { backgroundColor: "#eef4ff" },
                      ]}
                    >
                      {headers.map((h, idx) => (
                        <Text
                          key={h.key}
                          style={[
                            styles.cell,
                            styles.headerCell,
                            { width: columnWidths[idx] },
                          ]}
                        >
                          {h.label}
                        </Text>
                      ))}
                    </View>
                  )}

                  {previewResults.map((r, i) => (
                    <View
                      key={i}
                      style={[
                        styles.tableRow,
                        {
                          backgroundColor:
                            i % 2 ? "#fafafa" : "#fff",
                        },
                      ]}
                    >
                      {headers.map((h, idx) => (
                        <Text
                          key={h.key}
                          style={[
                            styles.cell,
                            { width: columnWidths[idx] },
                          ]}
                        >
                          {String(r[h.key] ?? "")}
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

/* ========================= styles ========================= */

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
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
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
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  cell: { paddingVertical: 6, paddingHorizontal: 8, textAlign: "center" },
  headerCell: { fontWeight: "700" },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  paramBtn: {
    margin: 6,
    padding: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 0.5,
    justifyContent: "space-between",
  },
  originalLabel: { color: "#5d5d5d", fontSize: 12 },
  customLabel: {
    color: "#0a0a0a",
    fontSize: 12,
    marginTop: 4,
    borderTopWidth: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(144, 142, 142, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: "80%",
    height: 260,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 16,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderColor: $color.gray,
    borderRadius: 25,
    borderWidth: 1,
    width: 110,
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
});
