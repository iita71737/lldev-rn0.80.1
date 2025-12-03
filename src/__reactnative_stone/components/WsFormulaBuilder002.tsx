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
  key: string;
  label: string;
  customLabel?: string;
  question_id?: string | number;
  option_id?: string | number;
};

type HeaderCol = { key: string; label: string };

/** COUNTIF 解析出來的目標：可以從公式裡拿到 label */
type CountTarget = {
  qid?: string;
  oid?: string;
  label: string;
};

/* ========================= 工具 ========================= */

// 把 SUM(..., ) 這種尾端多逗號的情況拿掉，讓 mathjs 能吃
const sanitizeForMath = (expr: string) => expr.replace(/,\s*\)/g, ')');

const toSafeVar = (id: string) => {
  const cleaned = String(id).replace(/[^A-Za-z0-9_]/g, "_");
  return `v_${cleaned}`;
};

const KNOWN_FUNCS = new Set(["SUM", "MAX", "MIN", "AVERAGE", "COUNTIF"]);
const RESERVED_WORDS = new Set([...KNOWN_FUNCS]);
const SAFE_NAME_RE = /^[A-Za-z_][A-Za-z0-9_\u4E00-\u9FFF]*$/;
const needsBacktickLoose = (s: string) =>
  !SAFE_NAME_RE.test(s || "") || RESERVED_WORDS.has(String(s).toUpperCase());

const isIdentChar = (ch: string) => {
  if (!ch) return false;
  if (/[A-Za-z0-9_]/.test(ch)) return true;
  const code = ch.charCodeAt(0);
  if (code >= 0x4E00 && code <= 0x9FFF) return true; // CJK
  return false;
};

const UUID_RE = /^[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}/;

/* ========= answer_value 解析 ========= */
const extractAnswerValue = (v: any): any => {
  if (v == null) return v;
  if (typeof v === 'number' || typeof v === 'string') return v;

  if (typeof v === 'object') {
    if (Number.isFinite(Number((v as any).risk_level))) {
      return Number((v as any).risk_level);
    }
    if (Number.isFinite(Number((v as any).value))) {
      return Number((v as any).value);
    }
    if (Number.isFinite(Number((v as any).score))) {
      return Number((v as any).score);
    }
  }
  return v;
};

const normalizeRawAnswer = (raw: any): any => {
  if (!raw || typeof raw !== 'object' || !('answer_value' in raw)) {
    return raw;
  }
  const av = (raw as any).answer_value;
  if (Array.isArray(av)) {
    return av.map(extractAnswerValue);
  }
  return extractAnswerValue(av);
};

const toNumberOrArray = (raw: any): number | number[] => {
  if (Array.isArray(raw)) {
    const arr = raw
      .map((v: any) => {
        if (v && typeof v === "object") {
          if (Number.isFinite(Number(v.risk_level))) return Number(v.risk_level);
          if (Number.isFinite(Number(v.value))) return Number(v.value);
          if (Number.isFinite(Number(v.score))) return Number(v.score);
          if (Number.isFinite(Number(v.id))) return Number(v.id);
          return NaN;
        }
        return Number(v);
      })
      .filter((n: number) => Number.isFinite(n));
    return arr;
  }

  if (typeof raw === 'string' && raw.includes(',')) {
    const arr = raw
      .split(',')
      .map(s => Number(s.trim()))
      .filter(v => Number.isFinite(v));
    return arr;
  }

  const num = Number(raw);
  return Number.isFinite(num) ? num : 0;
};

const valueOfMathResult = (val: any): number | number[] | string => {
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

/* ========================= Tokenizer ========================= */
type NewToken =
  | { type: "number"; text: string }
  | { type: "op"; text: string }
  | { type: "func"; text: string }
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

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    if (/[0-9.]/.test(ch)) {
      let j = i;
      let sawDot = false;

      if (ch === '.') {
        sawDot = true;
        j++;
      } else {
        while (j < n && /[0-9]/.test(input[j])) j++;
      }

      if (j < n && input[j] === '.' && !sawDot) {
        sawDot = true;
        j++;
      }
      while (j < n && /[0-9]/.test(input[j])) j++;

      if (j < n && (input[j] === 'e' || input[j] === 'E')) {
        const k = j + 1;
        const hasSign = k < n && (input[k] === '+' || input[k] === '-');
        const nextIsDigit = (hasSign ? k + 1 : k) < n && /[0-9]/.test(input[hasSign ? k + 1 : k]);
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

    const uuidMatch = input.slice(i).match(UUID_RE);
    if (uuidMatch) {
      const token = uuidMatch[0];
      out.push({ type: "name", text: token });
      i += token.length;
      continue;
    }

    if (/[+\-*/^]/.test(ch)) {
      if (ch === '-' && i + 1 < n && /[0-9.]/.test(input[i + 1])) {
        let j = i + 1;
        let sawDot = false;
        while (j < n && /[0-9]/.test(input[j])) j++;
        if (j < n && input[j] === '.' && !sawDot) {
          sawDot = true;
          j++;
        }
        while (j < n && /[0-9]/.test(input[j])) j++;
        if (j < n && (input[j] === 'e' || input[j] === 'E')) {
          const k = j + 1;
          const hasSign = k < n && (input[k] === '+' || input[k] === '-');
          const nextIsDigit = (hasSign ? k + 1 : k) < n && /[0-9]/.test(input[hasSign ? k + 1 : k]);
          if (nextIsDigit) {
            j++;
            if (hasSign) j++;
            while (j < n && /[0-9]/.test(input[j])) j++;
          }
        }
        out.push({ type: "number", text: input.slice(i, j) });
        i = j;
      } else {
        pushOp(ch);
        i++;
      }
      continue;
    }

    if (ch === "(") {
      out.push({ type: "lparen", text: ch });
      i++;
      continue;
    }
    if (ch === ")") {
      out.push({ type: "rparen", text: ch });
      i++;
      continue;
    }
    if (ch === ",") {
      out.push({ type: "comma", text: ch });
      i++;
      continue;
    }

    if (isIdentChar(ch)) {
      let j = i + 1;
      while (j < n && isIdentChar(input[j])) j++;
      const name = input.slice(i, j);
      const upper = name.toUpperCase();
      if (KNOWN_FUNCS.has(upper)) {
        out.push({ type: "func", text: upper.toLowerCase() });
      } else {
        out.push({ type: "name", text: name });
      }
      i = j;
      continue;
    }

    out.push({ type: "other", text: ch });
    i++;
  }

  return out;
};

/* ========= COUNTIF 解析（ID 版：COUNTIF('qid','oid?')） ========= */
const extractCountTargetsFromReal = (real: string) => {
  const targets: Array<{ qid: string; oid?: string; raw: string }> = [];
  const re = /COUNTIF\s*\(\s*'([^']+)'\s*(?:,\s*'([^']+)')?\s*\)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(real))) {
    const qid = m[1];
    const oid = m[2];
    targets.push({ qid, oid, raw: m[0] });
  }
  return targets;
};

/* ========= COUNTIF 解析（名稱版：COUNTIF(`xxx`,`yyy?`)） ========= */
const extractCountTargetsFromDisplay = (display: string, params: any[]): CountTarget[] => {
  const out: CountTarget[] = [];
  const re = /COUNTIF\s*\(\s*`([^`]+)`\s*(?:,\s*`([^`]+)`)?\s*\)/gi;
  let m: RegExpExecArray | null;

  const findByLabel = (label: string) =>
    params.find(
      (p: any) =>
        String(p?.label) === String(label) ||
        String(p?.customLabel) === String(label)
    );

  while ((m = re.exec(display))) {
    const n1 = m[1];
    const n2 = m[2];

    const labelText = n2 ? `${n1}：${n2}` : n1;

    if (n1 && !n2) {
      const p1 = findByLabel(n1);
      out.push({
        qid: p1?.question_id ? String(p1.question_id) : undefined,
        oid: p1?.option_id ? String(p1.option_id) : undefined,
        label: labelText,
      });
    } else if (n1 && n2) {
      const p2 = findByLabel(n2) || findByLabel(labelText) || findByLabel(n1);
      out.push({
        qid: p2?.question_id ? String(p2.question_id) : undefined,
        oid: p2?.option_id ? String(p2.option_id) : undefined,
        label: labelText,
      });
    }
  }

  return out;
};

/* ========= 顯示字串 → Tokens（含反引號） ========= */
const parseDisplayExpression = (input: string): NewToken[] => {
  const placeholders: string[] = [];
  let placeholderIdx = 0;
  const replaced = input.replace(/`([^`]+)`/g, (_m, g1) => {
    const id = `__BK_${placeholderIdx++}__`;
    placeholders.push(g1);
    return id;
  });

  const tokens = tokenize(replaced);

  for (const tok of tokens) {
    if (tok.type === "name" && tok.text.startsWith("__BK_")) {
      const idx = Number(tok.text.replace(/^__BK_([0-9]+)__$/, "$1"));
      const label = placeholders[idx] ?? "";
      tok.text = "`" + label + "`";
    }
  }

  return tokens;
};

/* ========= Tokens → 實際式 ========= */
const convertTokensToReal = (
  tokens: NewToken[],
  displayNameToParam: Map<string, ParamItem>,
  idToVar: Map<string, string>
): {
  real: string;
  usedParams: ParamItem[];
} => {
  const parts: string[] = [];
  const used: Map<string, ParamItem> = new Map();

  for (let idx = 0; idx < tokens.length; idx++) {
    const tok = tokens[idx];

    switch (tok.type) {
      case "func":
        // 函數名稱一律大寫
        parts.push(tok.text.toUpperCase());
        break;

      case "name": {
        let name = tok.text;

        const prev = tokens[idx - 1];
        const next = tokens[idx + 1];

        // 如果是 COUNTIF('qid','oid') 內部的 UUID → 直接原樣保留
        const insideSingleQuoted =
          prev &&
          next &&
          prev.type === "other" &&
          next.type === "other" &&
          prev.text === "'" &&
          next.text === "'";

        if (insideSingleQuoted && UUID_RE.test(name)) {
          parts.push(name);
          break;
        }

        // 處理 `label` 形式
        let rawLabel: string | null = null;
        if (name.startsWith("`") && name.endsWith("`")) {
          rawLabel = name.slice(1, -1).replace(/\\`/g, "`");
          name = rawLabel;
        }

        const param =
          displayNameToParam.get(name) ||
          (rawLabel ? displayNameToParam.get(rawLabel) : undefined);

        if (param) {
          const id = (param as any).question_id ?? (param as any).key;
          const vname = idToVar.get(String(id)) || toSafeVar(String(id));
          parts.push(vname);
          used.set(String(id), param);
        } else if (rawLabel != null) {
          const safe = rawLabel.replace(/'/g, "\\'");
          parts.push(`'${safe}'`);
        } else {
          parts.push(name);
        }
        break;
      }

      default:
        parts.push(tok.text);
    }
  }

  const real = parts.join("");
  return { real, usedParams: Array.from(used.values()) };
};

/* ========= COUNTIF 欄位工具 ========= */
const makeCountColKey = (qid: string, oid?: string) =>
  oid ? `COUNTIF(${qid},${oid})` : `COUNTIF(${qid})`;

// COUNTIF 對應的變數名
const makeCountVarKey = (qid: string, oid?: string) => {
  const colKey = makeCountColKey(qid, oid);
  return toSafeVar(`COUNT_${colKey}`);
};

const makeCountColLabel = (qid: string, oid: string | undefined, params: any[]) => {
  const q = params.find((p: any) => String(p.question_id) === String(qid));
  if (!oid) {
    return q?.customLabel || q?.label || '';
  }
  const opt = params.find(
    (p: any) =>
      String(p.question_id) === String(qid) &&
      String(p.option_id) === String(oid)
  );
  if (q && opt) return `${q.customLabel || q.label || ''}：${opt.label}`;
  if (q) return q.customLabel || q.label || '';
  return opt?.label || '';
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
    previewResults?: any[];
    formula_used_params?: ParamItem[];
  }) => void;
  statisticsId?: string | number;
  sectionId?: string | number;
}) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const buildDatasetKey = (statisticsId?: string | number, sectionId?: string | number) =>
    `${statisticsId}-${sectionId}-@dataSet`;

  const [visible, setVisible] = useState(false);
  const [previewOverlayVisible, setPreviewOverlayVisible] = useState(false);

  const [displayExpression, setDisplayExpression] = useState("");
  const [realExpression, setRealExpression] = useState("");

  const [usedParams, setUsedParams] = useState<ParamItem[]>([]);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [previewResults, setPreviewResults] = useState<any[]>([]);
  const inputRef = useRef<TextInput>(null);

  // 紀錄上一次點擊的是「參數」還是「函數」
  const [lastClickType, setLastClickType] = useState<"param" | "func" | null>(null);

  // 用 ref 記錄最新 selection，避免 setState 延遲
  const selectionRef = useRef({ start: 0, end: 0 });

  const fnDefs = [
    { key: "COUNTIF", label: "統計（有作答筆數）", insert: "COUNTIF(A)" },
    { key: "SUM", label: "加總", insert: "SUM(A)" },
    { key: "MAX", label: "最大值", insert: "MAX(A)" },
    { key: "MIN", label: "最小值", insert: "MIN(A)" },
    { key: "AVERAGE", label: "平均值", insert: "AVERAGE(A)" },
  ];

  const [paramList, setParamList] = useState<ParamItem[]>(
    (params as any[]).map((p: any) => ({
      ...p,
      key: p.key ?? p.option_id ?? `${p.question_id}_${p.option_id ?? ""}`,
      customLabel: p.customLabel ?? "",
    }))
  );

  useEffect(() => {
    setParamList(
      (params as any[]).map((p: any) => ({
        ...p,
        key: p.key ?? p.option_id ?? `${p.question_id}_${p.option_id ?? ""}`,
        customLabel: p.customLabel ?? "",
      }))
    );
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

      displayNameToParam.set(String(id), p as ParamItem);
      if (p.label) displayNameToParam.set(String(p.label), p as ParamItem);
      if (p.customLabel) displayNameToParam.set(String(p.customLabel), p as ParamItem);
    });

    return { idToVar, displayNameToParam };
  }, [effectiveParams, uniqueKey]);

  const convertDisplayToReal = useCallback(
    (txt: string) => {
      const tokens = parseDisplayExpression(txt);
      const { real, usedParams } = convertTokensToReal(tokens, displayNameToParam, idToVar);
      setUsedParams(usedParams as ParamItem[]);
      return real;
    },
    [displayNameToParam, idToVar]
  );

  /* ========= COUNTIF API 注入 ========= */
  useEffect(() => {
    const api = {
      COUNTIF: (questionId: string, optionId?: string) => {
        if (!questionId) return 0;
        let total = 0;

        const getAnswers = (rec: any) => {
          const raw = (rec as any)?.[questionId];
          if (!raw) return [];
          if (raw && typeof raw === 'object' && 'answer_value' in raw) {
            const av = (raw as any).answer_value;
            if (Array.isArray(av)) return av;
            if (av == null) return [];
            return [av];
          }
          if (Array.isArray(raw)) return raw;
          return [raw];
        };

        const matchOption = (item: any, target: string) => {
          if (item && typeof item === 'object') {
            if (String((item as any).id) === target) return true;
            if (String((item as any).value) === target) return true;
            if (String((item as any).score) === target) return true;
          }
          return String(item) === target;
        };

        for (const r of records || []) {
          const arr = getAnswers(r);
          if (optionId == null) {
            if (arr.length > 0) total += 1;
          } else {
            const target = String(optionId);
            if (arr.some((it: any) => matchOption(it, target))) total += 1;
          }
        }
        return total;
      },
    };
    math.import(api as any, { override: true });
  }, [records]);

  /* ========= 載入上次儲存 ========= */
  useEffect(() => {
    const loadSaved = async () => {
      try {
        if (statisticsId == null || sectionId == null) return;
        const storageKey = buildDatasetKey(statisticsId, sectionId);

        const saved = await AsyncStorage.getItem(storageKey);
        if (!saved) return;

        const parsed = JSON.parse(saved);
        if (parsed.displayExpression) {
          setDisplayExpression(parsed.displayExpression);
          setRealExpression(parsed.realExpression || "");
          setPreviewResults(parsed.previewResults || []);
        }
      } catch (err) {
        console.warn("Failed to load formula:", err);
      }
    };
    loadSaved();
  }, [statisticsId, sectionId]);

  // 把顯示用的表達式（含 label 的 COUNTIF）轉成
  // 實際運算用的表達式（COUNTIF 變成對應的變數名稱）
  function buildRealExpressionWithIds(
    displayExpression: string,
    params: any[]
  ): string {
    if (!displayExpression) return "";

    return displayExpression.replace(
      /COUNTIF\s*\(\s*`([^`]+)`\s*(?:,\s*`([^`]+)`)?\s*\)/gi,
      (match, name1: string, name2?: string) => {
        const findParamByLabel = (label: string) =>
          params.find(
            (p: any) =>
              String(p?.label) === String(label) ||
              String(p?.customLabel) === String(label)
          );

        if (name1 && !name2) {
          const p1 = findParamByLabel(name1);
          if (!p1) return "0";

          const qid = p1.question_id ? String(p1.question_id) : "";
          const oid = p1.option_id ? String(p1.option_id) : undefined;

          if (!qid) return "0";

          const varName = makeCountVarKey(qid, oid);
          return varName;
        } else if (name1 && name2) {
          const pQ = findParamByLabel(name1);
          const pO = findParamByLabel(name2);

          const qid = pQ?.question_id ? String(pQ.question_id) : "";
          const oid = pO?.option_id ? String(pO.option_id) : undefined;

          if (!qid) return "0";

          const varName = makeCountVarKey(qid, oid);
          return varName;
        }

        return "0";
      }
    );
  }

  const handleDisplayChange = (text: string) => {
    setDisplayExpression(text);

    // 處理 COUNTIF(`label`) → 對應的變數名
    const withIds = buildRealExpressionWithIds(text, effectiveParams);

    // 再用 convertTokensToReal 處理一般變數
    const tokens = parseDisplayExpression(withIds);
    const { real, usedParams } = convertTokensToReal(tokens, displayNameToParam, idToVar);

    setUsedParams(usedParams as ParamItem[]);
    setRealExpression(real);
  };

  // Modal 開啟時重置 lastClickType
  useEffect(() => {
    if (visible) {
      setLastClickType(null);
    }
  }, [visible]);

  /* ========= 預覽欄位 & 結果 ========= */
  const [headers, setHeaders] = useState<HeaderCol[]>([]);

  useEffect(() => {
    if (!records || !records.length) {
      setHeaders([]);
      return;
    }

    const expr = displayExpression || "";
    if (!expr) {
      setHeaders([{ key: "created_at", label: "created_at" }, { key: "公式結果", label: "公式結果" }]);
      return;
    }

    // 先抓出 COUNTIF(...) 的區間，等下用來判斷哪些 `label` 是 COUNTIF 內部的
    const countifRanges: Array<{ start: number; end: number }> = [];
    const cfRe = /COUNTIF\s*\(\s*`([^`]+)`\s*(?:,\s*`([^`]+)`)?\s*\)/gi;
    let m: RegExpExecArray | null;

    while ((m = cfRe.exec(expr))) {
      countifRanges.push({ start: m.index, end: cfRe.lastIndex });
    }

    // 工具：判斷一個 index 是否在任一個 COUNTIF 區間內
    const isInsideCountif = (idx: number) => {
      return countifRanges.some(r => idx >= r.start && idx < r.end);
    };

    const orderedCols: { start: number; key: string; label: string }[] = [];
    const pushedKeys = new Set<string>();

    const findParamByLabel = (label: string) =>
      effectiveParams.find(
        (p: any) =>
          String(p?.label) === String(label) ||
          String(p?.customLabel) === String(label)
      );

    // 1) 依照出現順序掃 COUNTIF(`...`)
    cfRe.lastIndex = 0;
    while ((m = cfRe.exec(expr))) {
      const matchStart = m.index;
      const name1 = m[1];
      const name2 = m[2];

      // 跟 extractCountTargetsFromDisplay 裡邏輯一樣，決定 qid / oid / label
      let qid: string | undefined;
      let oid: string | undefined;
      let labelText: string;

      if (name1 && !name2) {
        const p1: any = findParamByLabel(name1);
        qid = p1?.question_id ? String(p1.question_id) : undefined;
        oid = p1?.option_id ? String(p1.option_id) : undefined;
        labelText = name1;
      } else {
        const pQ: any = findParamByLabel(name1);
        const pO: any = findParamByLabel(name2);
        qid = pQ?.question_id ? String(pQ.question_id) : undefined;
        oid = pO?.option_id ? String(pO.option_id) : undefined;
        labelText = name2 ? `${name1}：${name2}` : name1;
      }

      if (!qid) continue;
      const colKey = makeCountColKey(qid, oid);

      if (!pushedKeys.has(colKey)) {
        pushedKeys.add(colKey);
        orderedCols.push({
          start: matchStart,
          key: colKey,
          label: labelText,
        });
      }
    }

    // 2) 再掃所有 `label`，但排除在 COUNTIF(...) 裡面的，這些就是一般題目/數值題
    const labelRe = /`([^`]+)`/g;
    let lm: RegExpExecArray | null;
    while ((lm = labelRe.exec(expr))) {
      const matchStart = lm.index;
      const labelText = lm[1];

      // 在 COUNTIF 區間內的 `label` 是 COUNTIF 的參數，前面已經處理過了，這裡跳過
      if (isInsideCountif(matchStart)) continue;

      const p: any = findParamByLabel(labelText);
      if (!p) continue;

      const id = p?.[uniqueKey] ?? p?.question_id ?? p?.key;
      if (!id) continue;

      const colKey = String(id);
      if (pushedKeys.has(colKey)) continue;

      pushedKeys.add(colKey);
      orderedCols.push({
        start: matchStart,
        key: colKey,
        label: p.customLabel || p.label || labelText,
      });
    }

    // 3) 依照在公式中的位置排序
    orderedCols.sort((a, b) => a.start - b.start);

    const finalCols: HeaderCol[] = [
      { key: "created_at", label: "created_at" },
      ...orderedCols.map((c) => ({ key: c.key, label: c.label })),
      { key: "公式結果", label: "公式結果" },
    ];

    setHeaders(finalCols);
  }, [records, effectiveParams, uniqueKey, displayExpression]);


  const columnWidths = headers.map((h) =>
    h.key === "created_at" ? 200 : Math.max(h.label.length * 10 + 80, 100)
  );

  // 預覽結果（每筆 record 一列）
  useEffect(() => {
    if (!realExpression) {
      setPreviewResults([]);
      return;
    }

    const byIdRaw = extractCountTargetsFromReal(realExpression);
    const byName = extractCountTargetsFromDisplay(displayExpression, effectiveParams);

    const seen = new Set<string>();
    const countTargets: CountTarget[] = [];

    for (const t of byName) {
      if (!t.qid) continue;
      const key = `${t.qid}|${t.oid ?? ""}|${t.label}`;
      if (!seen.has(key)) {
        seen.add(key);
        countTargets.push(t);
      }
    }

    for (const r of byIdRaw) {
      const key = `${r.qid}|${r.oid ?? ""}`;
      if (seen.has(key)) continue;
      seen.add(key);
      countTargets.push({
        qid: r.qid,
        oid: r.oid,
        label: makeCountColLabel(r.qid, r.oid, effectiveParams),
      });
    }

    try {
      if (!records?.length) {
        setPreviewResults([]);
        return;
      }

      const next = records.map((r, index) => {
        const ctx: Record<string, any> = {};

        // 塞一般題目的值進 ctx（給 SUM / MAX / ... 用）
        effectiveParams.forEach((p: any) => {
          const id = p?.[uniqueKey] ?? p?.question_id ?? p?.key;
          if (!id) return;
          const raw =
            r[id] ??
            r[p.label] ??
            (p.customLabel ? r[p.customLabel] : undefined);
          const normalized = normalizeRawAnswer(raw);
          const vname = idToVar.get(String(id)) || toSafeVar(String(id));
          ctx[vname] = toNumberOrArray(normalized);
        });

        const row: any = {
          _rowIndex: index,
          created_at: r.created_at ?? "",
        };

        // ✅ 把一般題目的 display 值也放進 row，對應 headers 的 paramCols
        usedParams.forEach((p: any) => {
          const id = p?.[uniqueKey] ?? p.question_id ?? p.key;
          if (!id) return;

          const raw =
            r[id] ??
            r[p.label] ??
            (p.customLabel ? r[p.customLabel] : undefined);

          let display: any = "";

          if (raw && typeof raw === 'object' && 'answer_value' in raw) {
            const av = (raw as any).answer_value;
            if (Array.isArray(av)) {
              display = av
                .map((it: any) =>
                  it && typeof it === 'object'
                    ? (it.name ?? it.label ?? it.risk_level ?? it.value ?? it.score ?? it.id ?? "")
                    : String(it)
                )
                .join(", ");
            } else if (av && typeof av === 'object') {
              display =
                av.name ?? av.label ?? av.risk_level ?? av.value ?? av.score ?? av.id ?? "";
            } else {
              display = av ?? "";
            }
          } else if (Array.isArray(raw)) {
            display = raw
              .map((it: any) =>
                it && typeof it === 'object'
                  ? (it.name ?? it.label ?? it.risk_level ?? it.value ?? it.score ?? it.id ?? "")
                  : String(it)
              )
              .join(", ");
          } else if (raw && typeof raw === 'object') {
            display =
              raw.name ?? raw.label ?? raw.risk_level ?? raw.value ?? raw.score ?? raw.id ?? "";
          } else if (raw != null) {
            display = raw;
          }

          row[String(id)] = display;
        });

        // COUNTIF 欄位：0 / 1 + 對應變數
        for (const t of countTargets) {
          if (!t.qid) continue;
          const rawTarget = (r as any)[t.qid];
          let arr: any[] = [];

          if (rawTarget && typeof rawTarget === 'object' && 'answer_value' in rawTarget) {
            const av = (rawTarget as any).answer_value;
            if (Array.isArray(av)) arr = av;
            else if (av != null) arr = [av];
          } else if (Array.isArray(rawTarget)) {
            arr = rawTarget;
          } else if (rawTarget != null) {
            arr = [rawTarget];
          }

          let v = 0;
          if (t.oid) {
            const target = String(t.oid);
            const match = (it: any) => {
              if (it && typeof it === 'object') {
                if (String((it as any).id) === target) return true;
                if (String((it as any).value) === target) return true;
                if (String((it as any).score) === target) return true;
              }
              return String(it) === target;
            };
            v = arr.some((it) => match(it)) ? 1 : 0;
          } else {
            v = arr.length > 0 ? 1 : 0;
          }
          const colKey = makeCountColKey(t.qid ?? t.label, t.oid);
          row[colKey] = v;

          const varKey = makeCountVarKey(t.qid, t.oid);
          ctx[varKey] = v;
        }

        let result: any = "❌";
        try {
          // 用 per-row 的 ctx 直接算 realExpression
          const safeExpr = sanitizeForMath(realExpression);
          const val = math.evaluate(safeExpr, ctx);
          const v = valueOfMathResult(val);

          if (Array.isArray(v)) {
            result = v
              .map((n) => (Number.isFinite(n) ? Math.round(n * 100) / 100 : n))
              .join(", ");
          } else if (Number.isFinite(v as number)) {
            result = Math.round((v as number) * 100) / 100;
          } else {
            result = String(v);
          }
        } catch (err) {
          console.warn("eval error:", err);
          result = "❌";
        }

        return {
          ...row,
          公式結果: result,
        };
      });

      setPreviewResults(next);
    } catch (err) {
      console.warn("Failed to preview formula:", err);
      setPreviewResults([]);
    }
  }, [realExpression, records, effectiveParams, displayExpression, idToVar, uniqueKey, usedParams]);

  /**
    * 在目前游標位置或選取區插入文字
    */
  const insertAtCursor = (
    rawText: string,
    opts?: { autoComma?: boolean; caretOffset?: number }
  ) => {
    const ref = inputRef.current;
    const prev = displayExpression || "";
    const sel = selectionRef.current;

    const start = sel.start;
    const end = sel.end;

    const before = prev.slice(0, start);
    const after = prev.slice(end);

    let prefix = "";

    if (opts?.autoComma) {
      const trimmed = before.replace(/\s+$/g, "");
      const lastChar = trimmed.slice(-1);
      if (trimmed.length > 0 && lastChar !== "(" && lastChar !== ",") {
        prefix = ", ";
      }
    }

    const insertText = prefix + rawText;
    const next = before + insertText + after;

    setDisplayExpression(next);
    const real = convertDisplayToReal(next);
    setRealExpression(real);

    const base = before.length + prefix.length;
    const caretOffset = opts?.caretOffset ?? rawText.length;
    const pos = base + caretOffset;

    const newSel = { start: pos, end: pos };
    selectionRef.current = newSel;
    setSelection(newSel);

    setTimeout(() => {
      ref?.setNativeProps?.({ selection: newSel });
    }, 0);
  };

  /**
  * 點參數
  */
  const onSelectParam = (p: ParamItem) => {
    const label = p.customLabel || p.label;
    const text = needsBacktickLoose(label) ? `\`${label}\`` : label;

    const ref = inputRef.current;
    const prev = displayExpression || "";
    const sel = selectionRef.current;
    const start = sel.start;
    const end = sel.end;

    const selectedText = prev.slice(start, end);

    // 覆蓋模板裡的 A
    if (start !== end && selectedText === "A") {
      const before = prev.slice(0, start);
      const after = prev.slice(end);

      const beforeUpToStart = prev.slice(0, start);
      const countifMatches = Array.from(
        beforeUpToStart.matchAll(/COUNTIF\s*\(/g)
      );
      const lastMatch = countifMatches.length
        ? countifMatches[countifMatches.length - 1]
        : null;

      const isCountifPlaceholder = (() => {
        if (!lastMatch) return false;
        const openIdx = (lastMatch.index ?? 0) + lastMatch[0].length;
        const between = prev.slice(openIdx, start);
        return !between.includes(")");
      })();

      const replaced = before + text + after;

      if (!isCountifPlaceholder) {
        setDisplayExpression(replaced);
        const real = convertDisplayToReal(replaced);
        setRealExpression(real);

        const pos = before.length + text.length;
        const newSel = { start: pos, end: pos };
        selectionRef.current = newSel;
        setSelection(newSel);
        setTimeout(() => {
          ref?.setNativeProps?.({ selection: newSel });
        }, 0);

        setLastClickType("param");
        return;
      }

      // COUNTIF 特例：自動在後面補逗號
      const closeParenIdxInPrev = prev.indexOf(")", end);
      const delta = text.length - (end - start);
      const closeParenIdxInReplaced = closeParenIdxInPrev + delta;

      const beforeClose = replaced.slice(0, closeParenIdxInReplaced + 1);
      const afterClose = replaced.slice(closeParenIdxInReplaced + 1);

      const trimmedAfter = afterClose.replace(/^\s+/, "");
      let finalExpr = replaced;
      let caretPos = closeParenIdxInReplaced + 1;

      if (!trimmedAfter.startsWith(",")) {
        finalExpr = beforeClose + ", " + afterClose;
        caretPos = closeParenIdxInReplaced + 3;
      }

      setDisplayExpression(finalExpr);
      const real = convertDisplayToReal(finalExpr);
      setRealExpression(real);

      const newSel = { start: caretPos, end: caretPos };
      selectionRef.current = newSel;
      setSelection(newSel);
      setTimeout(() => {
        ref?.setNativeProps?.({ selection: newSel });
      }, 0);

      setLastClickType("param");
      return;
    }

    // 沒選取範圍 → 一般插入
    const needComma = lastClickType === "param";
    insertAtCursor(text, { autoComma: needComma });
    setLastClickType("param");
  };

  /**
   * 點函數：插入模板並反選 A
   */
  const onInsertFunction = (fn: { key: string; insert: string }) => {
    const snippet = fn.insert;

    const ref = inputRef.current;
    const prev = displayExpression || "";
    const sel = selectionRef.current;
    const start = sel.start;
    const end = sel.end;

    const before = prev.slice(0, start);
    const after = prev.slice(end);

    const placeholderIndex = snippet.indexOf("A");

    if (placeholderIndex === -1) {
      const next = before + snippet + after;
      setDisplayExpression(next);
      const real = convertDisplayToReal(next);
      setRealExpression(real);

      const pos = before.length + snippet.length;
      const newSel = { start: pos, end: pos };
      selectionRef.current = newSel;
      setSelection(newSel);
      setTimeout(() => {
        ref?.setNativeProps?.({ selection: newSel });
      }, 0);

      setLastClickType("func");
      return;
    }

    const next = before + snippet + after;
    setDisplayExpression(next);
    const real = convertDisplayToReal(next);
    setRealExpression(real);

    const placeholderStart = before.length + placeholderIndex;
    const placeholderEnd = placeholderStart + 1;

    const newSel = { start: placeholderStart, end: placeholderEnd };
    selectionRef.current = newSel;
    setSelection(newSel);
    setTimeout(() => {
      ref?.setNativeProps?.({ selection: newSel });
    }, 0);

    setLastClickType("func");
  };

  /* ========= 參數別名 Modal ========= */
  const [aliasModalVisible, setAliasModalVisible] = useState(false);
  const [editingParam, setEditingParam] = useState<ParamItem | null>(null);
  const [inputValue, setInputValue] = useState("");

  const handleOpenAliasModal = (p: ParamItem) => {
    setEditingParam(p);
    setInputValue(p.customLabel ?? "");
    setAliasModalVisible(true);
  };

  const handleSaveLabel = () => {
    if (!editingParam) return;
    const key = editingParam.key;
    setParamList((prev) =>
      prev.map((p) =>
        p.key === key
          ? {
            ...p,
            customLabel: inputValue,
          }
          : p
      )
    );
    setAliasModalVisible(false);
  };

  /* ========= 套用 ========= */
  const handleApplyAndClose = useCallback(async () => {
    try {
      if (statisticsId != null && sectionId != null) {
        const storageKey = buildDatasetKey(statisticsId, sectionId);
        const payload = JSON.stringify({
          displayExpression,
          realExpression,
          previewResults,
        });
        await AsyncStorage.setItem(storageKey, payload);
      }
    } catch (err) {
      console.warn("Failed to save formula:", err);
    }

    const prettyPreview = previewResults.map((row) => {
      const out: any = {};
      headers.forEach((h) => {
        out[h.label] = row[h.key];
      });
      return out;
    });

    onChange?.({
      expression: realExpression,
      value: 0,
      displayText: displayExpression,
      previewResults: prettyPreview,
      formula_used_params: usedParams,
    });
    setVisible(false);
  }, [
    displayExpression,
    realExpression,
    previewResults,
    usedParams,
    statisticsId,
    sectionId,
    onChange,
    headers,
  ]);

  /* ========================= UI ========================= */
  return (
    <>
      {/* 外層顯示框 */}
      <TouchableOpacity
        style={[styles.inputWrap, style]}
        onPress={() => setVisible(true)}
        activeOpacity={0.7}
      >
        <TextInput
          editable={false}
          placeholder={placeholder}
          value={displayExpression}
          placeholderTextColor="rgba(0,0,0,0.35)"
          style={styles.input}
        />
        <Text style={{ color: "#777" }}>✎</Text>
      </TouchableOpacity>

      {/* === 公式編輯器 Modal === */}
      <Modal
        visible={visible}
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
              <View style={{ flex: 1 }}>
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
                    style={styles.editorInput}
                    value={displayExpression}
                    onChangeText={handleDisplayChange}
                    onSelectionChange={(e) => {
                      const sel = e.nativeEvent.selection;
                      setSelection(sel);
                      selectionRef.current = sel;
                    }}
                    placeholder="例如：COUNTIF(`廚餘設備檢查：閥門Ａ 高風險`)"
                    placeholderTextColor="rgba(185,184,184,0.5)"
                    multiline
                  />

                  {/* 可用參數 */}
                  <Text style={styles.h3}>{t("可用參數")}</Text>
                  <View style={styles.rowWrap}>
                    {paramList.map((p: any) => {
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
                              onPress={() => handleOpenAliasModal(p)}
                            />
                          </WsFlex>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* 參數別名 Modal */}
                  <Modal
                    visible={aliasModalVisible}
                    transparent
                    animationType="fade"
                    onRequestClose={() => setAliasModalVisible(false)}
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
                            onPress={() => setAliasModalVisible(false)}
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
                        onPress={() => onInsertFunction(f)}
                        activeOpacity={0.8}
                      >
                        <Text style={{ fontWeight: "700", color: "#3f51b5" }}>
                          {f.key}（{f.label}）
                        </Text>
                        <Text style={{ fontSize: 12, color: "#666" }}>
                          {f.example || f.insert}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* 操作按鈕 */}
                  <View style={styles.row}>
                    <TouchableOpacity
                      style={[styles.calcBtn, { backgroundColor: "#0b5aaa" }]}
                      onPress={() => {
                        if (!realExpression && displayExpression) {
                          handleDisplayChange(displayExpression);
                        }
                        setPreviewOverlayVisible(true);
                      }}
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
                      style={[styles.calcBtn, { backgroundColor: $color.danger }]}
                      onPress={() => {
                        setDisplayExpression("");
                        setRealExpression("");
                        setPreviewResults([]);
                        setUsedParams([]);
                        setLastClickType(null);
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={{ color: "#fff" }}>{t("清空")}</Text>
                    </TouchableOpacity>
                  </View>
                </ScrollView>

                {/* 預覽 overlay 疊在同一個 Modal 上 */}
                {previewOverlayVisible && (
                  <View style={styles.previewOverlay}>
                    <View style={styles.header}>
                      <Text style={styles.headerTitle}>{t("預覽結果")}</Text>
                      <TouchableOpacity onPress={() => setPreviewOverlayVisible(false)}>
                        <Text style={styles.headerAction}>{t("關閉")}</Text>
                      </TouchableOpacity>
                    </View>

                    {!realExpression ? (
                      <View style={{ padding: 16 }}>
                        <Text style={{ color: "#666" }}>
                          {t("尚未輸入有效公式，無法預覽結果")}
                        </Text>
                      </View>
                    ) : !records?.length ? (
                      <View style={{ padding: 16 }}>
                        <Text style={{ color: "#666" }}>
                          {t("目前沒有資料可預覽（records 為空）")}
                        </Text>
                      </View>
                    ) : (
                      <ScrollView horizontal>
                        <View style={{ padding: 16 }}>
                          {headers.length === 0 ? (
                            <Text style={{ color: "#666" }}>{t("沒有可顯示的欄位")}</Text>
                          ) : (
                            <>
                              <View style={[styles.tableRow, styles.tableHeader]}>
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
                                      key={h.key}
                                      style={[styles.cell, { width: columnWidths[idx] }]}
                                    >
                                      {String(r[h.key] ?? "")}
                                    </Text>
                                  ))}
                                </View>
                              ))}
                            </>
                          )}
                        </View>
                      </ScrollView>
                    )}
                  </View>
                )}
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </SafeAreaProvider>
      </Modal>
    </>
  );
}

/* ========================= 樣式 ========================= */
const styles = StyleSheet.create({
  inputWrap: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  input: {
    flex: 1,
    padding: 0,
    margin: 0,
    marginRight: 8,
    color: "#222",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 16, fontWeight: "600", color: "#111" },
  headerAction: { color: "#0b79d0", fontSize: 14 },
  h3: { fontSize: 14, fontWeight: "600", marginTop: 16, marginBottom: 8 },
  editorInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    textAlignVertical: "top",
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  paramBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f3f5ff",
    borderWidth: 1,
    borderColor: "#d0d7ff",
    marginHorizontal: 4,
    marginVertical: 4,
  },
  originalLabel: { fontSize: 13, color: "#111" },
  customLabel: { fontSize: 11, color: "#666", marginTop: 2 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalBox: {
    width: "80%",
    height: 260,
    backgroundColor: "#ffffffff",
    borderRadius: 10,
    padding: 16,
  },
  fnWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -4,
  },
  fnCard: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d0d7ff",
    marginHorizontal: 4,
    marginVertical: 4,
    backgroundColor: "#f3f5ff",
  },
  row: { flexDirection: "row", gap: 8, marginTop: 16 },
  calcBtn: {
    backgroundColor: "#3f51b5",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tableHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#ccc",
  },
  cell: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    color: "#111",
  },
  headerCell: {
    fontWeight: "600",
    color: "#333",
  },
  previewOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
  },
});
