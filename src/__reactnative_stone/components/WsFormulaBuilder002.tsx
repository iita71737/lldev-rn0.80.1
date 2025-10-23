import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
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
} from '@/components';
import { useTranslation } from "react-i18next";
import $color from '@/__reactnative_stone/global/color';
import AsyncStorage from '@react-native-community/async-storage';

/* ========================= mathjs ========================= */
const math = create(all, { number: "number" });
// 自訂函數：支援陣列/巢狀陣列，通通攤平並轉數字
math.import(
  {
    SUM: (...args: any[]) => math.sum(args.flat(Infinity).map(Number)),
    MAX: (...args: any[]) => math.max(args.flat(Infinity).map(Number)),
    MIN: (...args: any[]) => math.min(args.flat(Infinity).map(Number)),
    AVERAGE: (...args: any[]) => math.mean(args.flat(Infinity).map(Number)),
  },
  { override: true }
);

/* ========================= 型別 ========================= */
type ParamItem = {
  key: string;           // 唯一鍵（通常為 question_id 或 UUID）
  label: string;         // 題目原始名稱
  customLabel?: string;  // 使用者自訂名稱（顯示用）
};

type HeaderCol = { key: string; label: string };

/* ========================= 工具 ========================= */
const toSafeVar = (id: string) => {
  const cleaned = String(id).replace(/[^A-Za-z0-9_]/g, "_");
  return `v_${cleaned}`;
};

const KNOWN_FUNCS = new Set(["SUM", "MAX", "MIN", "AVERAGE"]);

// CJK + 英數底線：視為可組成名稱的字元
const isIdentChar = (ch: string) => {
  if (!ch) return false;
  if (/[A-Za-z0-9_]/.test(ch)) return true;
  const code = ch.charCodeAt(0);
  if (code >= 0x4E00 && code <= 0x9FFF) return true; // CJK
  return false;
};

// 把任意輸入轉為 number | number[]
const toNumberOrArray = (raw: any): number | number[] => {
  // 陣列：每個元素轉數字，過濾 NaN
  if (Array.isArray(raw)) {
    const arr = raw.map(v => Number(v)).filter(v => Number.isFinite(v));
    return arr;
  }

  // CSV 字串：'1,2, 3' → [1,2,3]
  if (typeof raw === 'string' && raw.includes(',')) {
    const arr = raw
      .split(',')
      .map(s => Number(s.trim()))
      .filter(v => Number.isFinite(v));
    return arr;
  }

  // 單一字串/數字：轉成 number；失敗回 0
  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
};

// 把 math.js 回傳的結果轉成純 JS：支援 Matrix / Array / Number
const valueOfMathResult = (val: any): number | number[] | string => {
  // Matrix 轉陣列
  if (val && typeof val === 'object' && typeof val.valueOf === 'function') {
    const v = val.valueOf();
    if (Array.isArray(v)) return v;
    const num = Number(v);
    if (Number.isFinite(num)) return num;
  }
  if (Array.isArray(val)) return val;
  const n = Number(val);
  if (Number.isFinite(n)) return n;
  try { return JSON.stringify(val); } catch { return String(val); }
};

/* ========================= 新 Tokenizer ========================= */
type NewToken =
  | { type: "number"; text: string }
  | { type: "op"; text: string }        // + - * / ^
  | { type: "func"; text: string }      // 以小寫存 text：sum/max/...
  | { type: "lparen"; text: "(" }
  | { type: "rparen"; text: ")" }
  | { type: "comma"; text: "," }
  | { type: "name"; text: string }
  | { type: "other"; text: string };

const tokenize = (input: string): NewToken[] => {
  const out: NewToken[] = [];
  const n = input.length;
  let i = 0;

  const pushOp = (v: string) => out.push({ type: "op", text: v });

  while (i < n) {
    const ch = input[i];

    // 跳過空白（不輸出空白 token）
    if (/\s/.test(ch)) { i++; continue; }

    // number：支援 123、2.1、.5、1e3、1.2e-3
    if (/[0-9]/.test(ch) || (ch === '.' && i + 1 < n && /[0-9]/.test(input[i + 1]))) {
      let j = i;
      let sawDot = false;

      if (input[j] === '.') { sawDot = true; j++; }
      else { while (j < n && /[0-9]/.test(input[j])) j++; }

      if (j < n && input[j] === '.' && !sawDot) { sawDot = true; j++; }
      while (j < n && /[0-9]/.test(input[j])) j++;

      if (j < n && (input[j] === 'e' || input[j] === 'E')) {
        const k = j + 1;
        const hasSign = k < n && (input[k] === '+' || input[k] === '-');
        const nextIsDigit = (hasSign ? k + 1 : k) < n && /[0-9]/.test(input[hasSign ? k + 1 : k]);
        if (nextIsDigit) {
          j++; if (hasSign) j++; while (j < n && /[0-9]/.test(input[j])) j++;
        }
      }

      out.push({ type: "number", text: input.slice(i, j) });
      i = j;
      continue;
    }

    if ("+-*/^".includes(ch)) { pushOp(ch); i++; continue; }
    if (ch === "(") { out.push({ type: "lparen", text: "(" }); i++; continue; }
    if (ch === ")") { out.push({ type: "rparen", text: ")" }); i++; continue; }
    if (ch === ",") { out.push({ type: "comma", text: "," }); i++; continue; }

    if (isIdentChar(ch)) {
      let j = i + 1;
      while (j < n && isIdentChar(input[j])) j++;
      const word = input.slice(i, j);
      const upper = word.toUpperCase();
      if (KNOWN_FUNCS.has(upper)) out.push({ type: "func", text: word.toLowerCase() });
      else out.push({ type: "name", text: word });
      i = j;
      continue;
    }

    out.push({ type: "other", text: ch });
    i++;
  }

  return out;
};

// tokens → 可運算字串（把顯示名稱換成變數名）
const untokenizeToReal = (
  tokens: NewToken[],
  displayNameToParam: Map<string, ParamItem>,
  idToVar: Map<string, string>,
  uniqueKey: string
) => {
  const parts: string[] = [];
  for (const tok of tokens) {
    switch (tok.type) {
      case "func":
        parts.push(tok.text.toUpperCase());
        break;
      case "name": {
        const p = displayNameToParam.get(tok.text);
        if (p) {
          const id = (p as any)?.[uniqueKey] ?? (p as any)?.question_id ?? p.key;
          const vname = idToVar.get(String(id)) || toSafeVar(String(id));
          parts.push(vname);
        } else {
          parts.push(tok.text);
        }
        break;
      }
      default:
        parts.push(tok.text);
    }
  }
  return parts.join("");
};

/* ========================= 元件 ========================= */
export default function WsFormulaBuilder002({
  style,
  placeholder = "點擊以建立或編輯公式…",
  params = [],
  records = [],
  uniqueKey = "question_id",
  onChange,
  statisticsId,
  sectionId,
}: {
  style?: any;
  placeholder?: string;
  params?: Record<string, any>[];
  records?: { [key: string]: any }[];
  uniqueKey?: string;
  onChange?: (payload: {
    expression: string;
    value: number;
    displayText: string;
  }) => void;
  statisticsId?: string | number;
  sectionId?: string | number;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const buildDatasetKey = (statisticsId?: string | number, sectionId?: string | number) =>
    `${statisticsId}-${sectionId}-@dataSet`;

  const [visible, setVisible] = useState(false);
  const [tableVisible, setTableVisible] = useState(false);

  // 顯示/實際公式
  const [displayExpression, setDisplayExpression] = useState("");
  const [realExpression, setRealExpression] = useState("");

  // tokens 狀態
  const [toks, setToks] = useState<NewToken[]>([]);

  // 實際用到的參數
  const [usedParams, setUsedParams] = useState<Array<{ key: string; label: string; customLabel?: string }>>([]);

  // 游標與預覽
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [previewResults, setPreviewResults] = useState<any[]>([]);
  const inputRef = useRef<TextInput>(null);

  const fnDefs = [
    { key: "SUM", label: "加總", insert: "SUM(A, B)" },
    { key: "MAX", label: "最大值", insert: "MAX(A, B)" },
    { key: "MIN", label: "最小值", insert: "MIN(A, B)" },
    { key: "AVERAGE", label: "平均值", insert: "AVERAGE(A, B)" },
  ];

  // 允許編輯自訂名稱（從 params 來）
  const [paramList, setParamList] = useState<ParamItem[]>(
    (params as any[]).map((p: any) => ({ ...p, customLabel: p.customLabel ?? "" }))
  );

  // 讓外部 props 變動時，同步 paramList（避免只吃初始值）
  useEffect(() => {
    setParamList((params as any[]).map((p: any) => ({ ...p, customLabel: p.customLabel ?? "" })));
  }, [params]);

  const effectiveParams = useMemo(
    () => (paramList && paramList.length ? paramList : (params as any[])),
    [paramList, params]
  );

  const { idToVar, displayNameToParam } = useMemo(() => {
    const idToVar = new Map<string, string>();
    const displayNameToParam = new Map<string, ParamItem>();

    effectiveParams.forEach((p: any) => {
      const id = p?.[uniqueKey] ?? p?.question_id ?? p?.key;
      if (!id) return;

      const safe = toSafeVar(String(id));
      idToVar.set(String(id), safe);

      if (p.label) displayNameToParam.set(String(p.label), p);
      if (p.customLabel) displayNameToParam.set(String(p.customLabel), p);
    });

    return { idToVar, displayNameToParam };
  }, [effectiveParams, uniqueKey]);

  // 解析 display → tokens → real + used
  const convertDisplayToReal = useCallback((txt: string) => {
    if (!txt) {
      return { real: "", used: [] as Array<{ key: string; label: string; customLabel?: string }>, tokens: [] as NewToken[] };
    }
    const tokens = tokenize(txt);

    const usedMap = new Map<string, { key: string; label: string; customLabel?: string }>();
    for (const tok of tokens) {
      if (tok.type === "name") {
        const p = displayNameToParam.get(tok.text);
        if (p) {
          const id = (p as any)?.[uniqueKey] ?? (p as any)?.question_id ?? p.key;
          usedMap.set(String(id), { key: String(id), label: String(p.label ?? ""), customLabel: p.customLabel });
        }
      }
    }

    const real = untokenizeToReal(tokens, displayNameToParam, idToVar, uniqueKey);
    const used = Array.from(usedMap.values());
    return { real, used, tokens };
  }, [displayNameToParam, idToVar, uniqueKey]);

  // 使用者輸入（display）→ 即時轉 real + used + toks
  const onDisplayChange = (txt: string) => {
    setDisplayExpression(txt);
    const { real, used, tokens } = convertDisplayToReal(txt);
    setRealExpression(real);
    setUsedParams(used);
    setToks(tokens);
  };

  /* ========================= 預覽運算 ========================= */
  useEffect(() => {
    if (!realExpression || !records?.length) {
      setPreviewResults([]);
      return;
    }
    try {
      const newResults = records.map((r) => {
        const ctx: Record<string, any> = {};

        // 把每個參數（依 uniqueKey 取得對應欄位）放入 ctx（允許 number 或 number[] 或 csv）
        effectiveParams.forEach((p: any) => {
          const id = p?.[uniqueKey] ?? p?.question_id ?? p?.key;
          if (!id) return;
          const raw = r[id];
          const vname = idToVar.get(String(id)) || toSafeVar(String(id));
          ctx[vname] = toNumberOrArray(raw);
        });

        let result: any = "❌";
        try {
          const val = math.evaluate(realExpression, ctx);
          const v = valueOfMathResult(val); // number | number[] | string

          if (Array.isArray(v)) {
            result = v
              .map(n => (Number.isFinite(n) ? Math.round(n * 100) / 100 : n))
              .join(", ");
          } else if (Number.isFinite(v as number)) {
            result = Math.round((v as number) * 100) / 100;
          } else {
            result = String(v);
          }
        } catch {
          const tokens = Array.from(new Set(realExpression.match(/[A-Za-z_][A-Za-z0-9_]*/g) || []));
          const unknown = tokens.filter(tok => !KNOWN_FUNCS.has(tok) && !(tok in ctx));
          result = unknown.length ? `未識別: ${unknown.join(", ")}` : "❌";
        }
        return { ...r, 公式結果: result };
      });

      setPreviewResults(newResults);
    } catch {
      setPreviewResults(records.map((r) => ({ ...r, 公式結果: "❌" })));
    }
  }, [realExpression, records, effectiveParams, uniqueKey, idToVar]);

  /* ========================= 插入/選取 ========================= */
  const insertAtCursor = (displayPiece: string) => {
    const start = selection.start ?? 0;
    const end = selection.end ?? 0;

    const newDisplay =
      displayExpression.slice(0, start) +
      displayPiece +
      displayExpression.slice(end);

    setDisplayExpression(newDisplay);

    const { real, used, tokens } = convertDisplayToReal(newDisplay);
    setRealExpression(real);
    setUsedParams(used);
    setToks(tokens);

    const newPos = start + displayPiece.length;
    setSelection({ start: newPos, end: newPos });
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // 點參數插入（只插入名稱，不額外加 + 或空白）
  const onSelectParam = (item?: ParamItem | Record<string, any>) => {
    if (!item) return;
    const anyItem: any = item;
    const displayName =
      (typeof anyItem.customLabel === "string" && anyItem.customLabel.trim()) ||
      anyItem.label ||
      "";
    insertAtCursor(displayName);
  };

  const onInsertFunction = (fInsert: string) => insertAtCursor(fInsert);

  // 清除
  const clearExpression = () => {
    setDisplayExpression("");
    setRealExpression("");
    setUsedParams([]);
    setPreviewResults([]);
    setToks([]);
  };

  /* ========================= 自訂名稱 Modal ========================= */
  const [inputValue, setInputValue] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingParam, setEditingParam] = useState<{ id: string; label: string } | null>(null);

  const handleOpenModal = (item: ParamItem) => {
    setEditingParam(item as any);
    setInputValue(item.customLabel || item.label);
    setModalVisible(true);
  };
  const handleSaveLabel = () => {
    if (!editingParam) return;
    setParamList((prev) =>
      prev.map((p) =>
        p.key === (editingParam as any).key ? { ...p, customLabel: inputValue } : p
      )
    );
    setModalVisible(false);

    // 重新解析一次顯示式→避免舊自訂名殘留，並更新 toks
    const { real, used, tokens } = convertDisplayToReal(displayExpression);
    setRealExpression(real);
    setUsedParams(used);
    setToks(tokens);
  };

  /* ========================= 表頭（顯示 customLabel 優先） ========================= */
  const headers: HeaderCol[] = useMemo(() => {
    const base = previewResults.length ? previewResults : records;
    if (!base.length) return [{ key: "公式結果", label: "公式結果" }];

    const rawKeys =
      Object.keys(base[0])?.filter((k) => k !== uniqueKey && k !== "key") ?? [];

    const labelMap = Object.fromEntries(
      effectiveParams.map((p: any) => [
        p?.[uniqueKey] ?? p?.key,
        p.customLabel || p.label,
      ])
    );

    const cols = rawKeys.map((k) => ({
      key: k,
      label: (labelMap as any)[k] || k,
    }));

    if (!cols.find((c) => c.key === "公式結果")) {
      cols.push({ key: "公式結果", label: "公式結果" });
    }
    return cols;
  }, [previewResults, records, effectiveParams, uniqueKey]);

  const columnWidths = headers.map((h) =>
    h.key === "created_at" ? 200 : Math.max(h.label.length * 10 + 80, 100)
  );

  const openEditor = () => {
    setDisplayExpression((prev) => prev || "");
    setVisible(true);
  };

  /* ========================= 套用並關閉（寫入 storage，含 toks） ========================= */
  const handleApplyAndClose = useCallback(async () => {
    const formulaPayload = {
      displayExpression,
      realExpression,
      previewResults,
      formula_used_params: usedParams,
      toks, // ★ 一起存
      updatedAt: new Date().toISOString(),
    };

    try {
      if (statisticsId != null && sectionId != null) {
        const storageKey = buildDatasetKey(statisticsId, sectionId);

        const raw = await AsyncStorage.getItem(storageKey);
        let obj: any = {};
        if (raw) {
          try { obj = JSON.parse(raw) ?? {}; } catch { obj = {}; }
        }

        const next = { ...obj, formula_builder: formulaPayload };
        await AsyncStorage.setItem(storageKey, JSON.stringify(next));
      }
    } catch (err) {
      console.warn("Failed to save formula to storage:", err);
    }

    onChange?.({ expression: realExpression, value: 0, displayText: displayExpression });
    setVisible(false);
  }, [displayExpression, realExpression, previewResults, usedParams, toks, statisticsId, sectionId, onChange]);

  // 初始載入 storage：帶回 display/real/preview/usedParams/toks
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
          if (typeof fb.displayExpression === "string") setDisplayExpression(fb.displayExpression);
          if (typeof fb.realExpression === "string") setRealExpression(fb.realExpression);
          if (Array.isArray(fb.previewResults)) setPreviewResults(fb.previewResults);
          if (Array.isArray(fb.formula_used_params)) setUsedParams(fb.formula_used_params);
          if (Array.isArray(fb.toks)) setToks(fb.toks as NewToken[]);
        }
      } catch (err) {
        console.warn('載入已存資料失敗：', err);
      }
    };
    loadSaved();
  }, [statisticsId, sectionId]);

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
                  placeholder="例如：SUM(題目A, 題目B) 或 (題目A + 題目B) * 2；支援自訂名稱"
                  placeholderTextColor="rgba(185,184,184,0.5)"
                  multiline
                />

                {/* 可用參數（可點插入 / 可編輯自訂名） */}
                <Text style={styles.h3}>{t("可用參數")}</Text>
                <View style={styles.rowWrap}>
                  {paramList.map((p: any) => {
                    const displayLabel = p.customLabel;

                    return (
                      <TouchableOpacity
                        key={p.key || p[uniqueKey] || p.question_id}
                        style={styles.paramBtn}
                        onPress={() => onSelectParam(p)}
                        activeOpacity={0.8}
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
                        label={t('參數名稱')}
                        placeholder={t('輸入')}
                        value={inputValue}
                        onChange={setInputValue}
                      />
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
                      activeOpacity={0.8}
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
                    style={[styles.calcBtn, { backgroundColor: "#b42318" }]}
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
                <View style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8 }}>
                  <View style={[styles.tableRow, { backgroundColor: "#eef4ff" }]}>
                    {headers.map((h, idx) => (
                      <Text
                        key={h.key}
                        style={[styles.cell, styles.headerCell, { width: columnWidths[idx] }]}
                      >
                        {h.label}
                      </Text>
                    ))}
                  </View>
                  {previewResults.map((r, i) => (
                    <View
                      key={i}
                      style={[styles.tableRow, { backgroundColor: i % 2 ? "#fafafa" : "#fff" }]}
                    >
                      {headers.map((h, idx) => (
                        <Text key={h.key} style={[styles.cell, { width: columnWidths[idx] }]}>
                          {(() => {
                            const raw = r[h.key];
                            if (Array.isArray(raw)) {
                              return raw
                                .map((n: any) => (Number.isFinite(n) ? Math.round(n * 100) / 100 : n))
                                .join(", ");
                            }
                            if (typeof raw === "number" && Number.isFinite(raw)) {
                              return (Math.round(raw * 100) / 100).toString();
                            }
                            return String(raw ?? "");
                          })()}
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
  tableRow: { flexDirection: "row", borderBottomWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
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
    justifyContent: 'space-between'
  },
  container: { padding: 12 },
  originalLabel: { color: "#5d5d5d", fontSize: 12 },
  customLabel: { color: "#0a0a0a", fontSize: 12, marginTop: 4, borderTopWidth: 0.5 },

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
  modalTitle: { color: "#090909", fontSize: 14, marginBottom: 8 },
  btnRow: { flexDirection: "row", justifyContent: "space-between" },
});
