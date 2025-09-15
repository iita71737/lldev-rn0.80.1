// WsFormulaBuilder.tsx
import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView, useColorScheme, Modal, TextInput,
  KeyboardAvoidingView, Platform, StyleProp, ViewStyle, TextStyle, Dimensions, InteractionManager
} from 'react-native';
import { create, all } from 'mathjs';
import { SafeAreaView, useSafeAreaInsets, SafeAreaProvider } from 'react-native-safe-area-context';
import $color from '@/__reactnative_stone/global/color';
import { WsPopup, WsText, WsGradientButton, WsFlex } from '@/components';
import { useTranslation } from 'react-i18next';

// ============== 1) mathjs 實例與可用函數（只保留：SUM / MAX / MIN / AVERAGE） ==============
const math = create(all, { number: 'number' });
math.import(
  {
    SUM: (...args: number[]) => math.sum(args as any),
    MAX: (...args: number[]) => math.max(args as any),
    MIN: (...args: number[]) => math.min(args as any),
    AVERAGE: (...args: number[]) => math.mean(args as any),
  },
  { override: true }
);

// ============== 2) 可用參數（由外層傳入） ==============
export type FormulaParam = {
  key: string;     // 公式中的變數名，例如 "A1"、"total"
  value: number;   // 對應數值
  label?: string;  // （可選）顯示文字
};

export type FormulaChangePayload = {
  expression: string;
  value: number;
  displayText: string;
  unit?: string;
};

// 單位推斷（如需可擴充：可依 key 規則或 tokens 判斷）
type TokType = 'name' | 'number' | 'op' | 'lparen' | 'rparen' | 'comma' | 'func';
type Token = { type: TokType; text: string };
function inferUnit(_tokens: Token[]): string {
  return '';
}

// ============== 3) Token 工具 ==============
const tokensToFormula = (toks: Token[]) => toks.map(t => t.text).join('');
const parenBalance = (toks: Token[]) =>
  toks.reduce((acc, t) => (t.type === 'lparen' ? acc + 1 : t.type === 'rparen' ? acc - 1 : acc), 0);

// 由外層傳入的 params 產生 scope
const buildScope = (params: FormulaParam[]) =>
  Object.fromEntries(params.map(p => [p.key, p.value]));

// ============== 4) UI helpers ==============
function tokenPalette(t: Token) {
  switch (t.type) {
    case 'func': return { fg: '#5b33aa', bg: '#efe7ff', border: '#d9c8ff' }; // 函數：紫
    case 'name': return { fg: '#0b5aaa', bg: '#e6f0ff', border: '#cfe2ff' }; // 變數：藍
    case 'number': return { fg: '#0a6640', bg: '#e9f7ef', border: '#cdeede' }; // 數字：綠
    case 'op': return { fg: '#8a6d3b', bg: '#fff6e5', border: '#ffe2b8' }; // 運算子：橘
    case 'lparen':
    case 'rparen':
    case 'comma': return { fg: '#5f5f5f', bg: '#f3f3f5', border: '#e1e1e6' }; // 括號/逗號：灰
    default: return { fg: '#111', bg: '#f4f4f6', border: '#ddd' };
  }
}

function UnitChip({ text }: { text: string }) {
  if (!text) return null;
  return (
    <View style={styles.unitChip}>
      <Text style={styles.unitChipTxt}>{text}</Text>
    </View>
  );
}

// ============== 5) 主組件：單一輸入匡 + Modal 編輯器 ==============
export default function WsFormulaBuilder({
  placeholder = '點擊以建立/編輯公式…',
  onChange,
  params = [],
}: {
  placeholder?: string;
  onChange?: (payload: FormulaChangePayload) => void;
  params?: FormulaParam[];
}) {
  const { t } = useTranslation();
  const { width, height } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === 'dark';
  const [visible, setVisible] = React.useState(false);

  // 外層顯示：只需要公式字串
  const [expression, setExpression] = React.useState<string>('');   // 公式字串
  const [resultNum, setResultNum] = React.useState<number | null>(null); // 結果（提供 onChange 用）
  const [unit, setUnit] = React.useState<string>('');               // 單位（如需）

  // Modal 內：公式建構狀態
  const [pendingClose, setPendingClose] = React.useState(false);
  const [popupActive, setPopupActive] = React.useState(false);

  const [toks, setToks] = React.useState<Token[]>([]);
  const [preview, setPreview] = React.useState<string>('-');
  const [err, setErr] = React.useState<string>('');


  // 只顯示四個函數（加總 / 最大值 / 最小值 / 平均值）
  const fnDefs = React.useMemo(
    () => [
      { key: 'SUM', label: t('加總') },
      { key: 'MAX', label: t('最大值') },
      { key: 'MIN', label: t('最小值') },
      { key: 'AVERAGE', label: t('平均值') },
    ],
    [t]
  );

  const openModal = () => setVisible(true);

  const last = toks[toks.length - 1];
  const bal = parenBalance(toks);
  // 公式是否可計算（避免空字串、以運算子/左括號/逗號結尾、只有 "SUM(" 這種）
  const isExpressionReady = React.useMemo(() => {
    if (!toks.length) return false;

    const lastTok = toks[toks.length - 1];
    if (!['name', 'number', 'rparen'].includes(lastTok.type)) return false;

    // 只有「函數 + 左括號」視為不完整，例如 ["func:SUM","("]
    if (toks.length === 2 && toks[0].type === 'func' && toks[1].type === 'lparen') return false;

    return true;
  }, [toks]);

  const canAdd = {
    name: !last || ['op', 'lparen', 'comma'].includes(last.type),
    number: !last || ['op', 'lparen', 'comma'].includes(last.type) || last.type === 'number',
    func: !last || ['op', 'lparen', 'comma'].includes(last.type),
    lparen: !last || ['op', 'lparen', 'comma', 'func'].includes(last.type),
    rparen: bal > 0 && last && ['name', 'number', 'rparen'].includes(last.type),
    comma: last && ['name', 'number', 'rparen'].includes(last.type) && bal > 0,
    op: last && ['name', 'number', 'rparen'].includes(last.type),
  };

  const push = (t: Token) => setToks(prev => [...prev, t]);
  const pop = () => {
    setToks(prev => {
      const last = prev[prev.length - 1];
      if (last?.type === 'number' && last.text.length > 1) {
        const next = [...prev];
        next[next.length - 1] = { ...last, text: last.text.slice(0, -1) };
        return next;
      }
      return prev.slice(0, -1);
    });
  };
  const clearTokens = () => setToks([]);
  const insertFunc = (fn: string) => { if (canAdd.func) { push({ type: 'func', text: fn }); push({ type: 'lparen', text: '(' }); } };
  const insertName = (name: string) => { if (canAdd.name) push({ type: 'name', text: name }); };
  const insertNumber = (n: string) => {
    setToks(prev => {
      const last = prev[prev.length - 1];
      if (last?.type === 'number') {
        if (n === '.' && last.text.includes('.')) return prev;
        const next = [...prev];
        next[next.length - 1] = { ...last, text: last.text + n };
        return next;
      }
      if (!last || ['op', 'lparen', 'comma'].includes(last.type)) {
        return [...prev, { type: 'number', text: n }];
      }
      return prev;
    });
  };
  const insertOp = (op: string) => { if (canAdd.op) push({ type: 'op', text: op }); };
  const insertComma = () => { if (canAdd.comma) push({ type: 'comma', text: ',' }); };
  const insertLParen = () => { if (canAdd.lparen) push({ type: 'lparen', text: '(' }); };
  const insertRParen = () => { if (canAdd.rparen) push({ type: 'rparen', text: ')' }); };
  const autoCloseParens = (arr: Token[]) => {
    const needs = parenBalance(arr);
    if (needs > 0 && arr.length && ['name', 'number', 'rparen'].includes(arr[arr.length - 1].type)) {
      return [...arr, ...Array.from({ length: needs }, () => ({ type: 'rparen', text: ')' as const }))];
    }
    return arr;
  };

  const compute = () => {
    if (!isExpressionReady) {
      setErr('請先建立完整公式');
      setPreview('-');
      return;
    }
    try {
      const closed = autoCloseParens(toks);
      const expr = tokensToFormula(closed);
      const val = math.evaluate(expr, buildScope(params));
      const u = inferUnit(closed);
      if (typeof val === 'number' && isFinite(val)) {
        setErr('');
        setPreview(`${val.toFixed(3)}${u ? ` ${u}` : ''}`);
      } else {
        // 非數值或 undefined 一律當作錯誤處理
        throw new Error('公式不完整或結果非數值');
      }
    } catch (e: any) {
      setErr(e?.message ?? '公式錯誤');
      setPreview('-');
    }
  };

  const applyAndClose = () => {
    if (!isExpressionReady) {
      setErr('請先建立完整公式');
      return;
    }
    try {
      const closed = autoCloseParens(toks);
      const expr = tokensToFormula(closed);
      const rawVal = math.evaluate(expr, buildScope(params));
      const num = Number(rawVal);
      if (!Number.isFinite(num)) throw new Error('結果非數值');

      const u = inferUnit(closed);
      setExpression(expr);
      setResultNum(num);
      setUnit(u);
      onChange?.({
        expression: expr,
        value: num,
        displayText: `${expr} = ${num.toFixed(3)}${u ? ` ${u}` : ''}`,
        unit: u || undefined,
      });
      setErr('');
      setVisible(false);
    } catch (e: any) {
      setErr(e?.message ?? '計算錯誤');
    }
  };

  const resetAll = () => {
    setExpression('');
    setResultNum(null);
    setUnit('');
    setToks([]);
    setPreview('-');
    setErr('');
  };

  // ====== 外層輸入框樣式 ======
  const fg = isDark ? '#111' : '#111';
  const sub = '#555';
  const cardBg = '#fff';
  const border = $color.gray;

  // 數字鍵盤可按規則
  const lastTok = toks[toks.length - 1];
  const canTapDigit = !lastTok || ['op', 'lparen', 'comma', 'number'].includes(lastTok?.type);
  const canTapDot =
    !lastTok ||
    ['op', 'lparen', 'comma'].includes(lastTok?.type) ||
    (lastTok?.type === 'number' && !lastTok.text.includes('.'));

  // 關閉流程（多一步確認）
  const requestCloseModal = () => setPopupActive(true);
  const cancelCloseModal = () => setPopupActive(false);
  const confirmCloseModal = () => { setPendingClose(true); setPopupActive(false); };
  React.useEffect(() => {
    if (pendingClose && !popupActive) {
      const raf = requestAnimationFrame(() => {
        InteractionManager.runAfterInteractions(() => {
          setVisible(false);
          setPendingClose(false);
        });
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [pendingClose, popupActive]);

  return (
    <>
      {/* ===== 外層顯示：單一輸入匡（顯示已設定的公式） ===== */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={openModal}
        style={[styles.inputBox, { borderColor: border, backgroundColor: cardBg }]}
      >
        <TextInput
          editable={false}
          placeholder={placeholder}
          placeholderTextColor={'rgba(0,0,0,0.35)'}
          value={expression}
          style={[styles.input, { color: fg }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        />
        <Text style={{ color: sub }}>✎</Text>
      </TouchableOpacity>

      {/* ===== Modal 編輯器 ===== */}
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="fullScreen"
        statusBarTranslucent
        hardwareAccelerated
        transparent={false}
        onRequestClose={requestCloseModal}
      >
        <SafeAreaProvider>
          <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={{ flex: 1, backgroundColor: '#fff' }}
            >
              {/* Header：標題 + 關閉 */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('公式編輯器')}</Text>
                <TouchableOpacity onPress={requestCloseModal} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.headerAction}>{t('關閉')}</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={[styles.wrap, { backgroundColor: '#fff', paddingBottom: 16 + insets.bottom }]}
                contentInsetAdjustmentBehavior="never"
                keyboardShouldPersistTaps="handled"
              >
                {/* 可用參數（由外層傳入） */}
                <Text style={[styles.h3, { color: '#111' }]}>{t('可用參數')}</Text>
                <View style={styles.rowWrap}>
                  {params.length === 0 ? (
                    <Text style={{ color: '#777' }}>（{t('目前沒有可用參數')}）</Text>
                  ) : (
                    params.map(p => (
                      <Btn
                        key={p.key}
                        label={p.label ? `${p.key} (${p.label})` : p.key}
                        onPress={() => insertName(p.key)}
                      />
                    ))
                  )}
                </View>

                {/* 公式顯示（醒目卡片） */}
                <Text style={[styles.h2, { color: '#111' }]}>{t('公式')}</Text>
                <View style={styles.formulaCard}>
                  <View style={styles.formulaHeader}>
                    <View style={styles.accentBar} />
                    <Text style={styles.formulaTitle}>{t('目前公式')}</Text>
                    {bal > 0 ? <Text style={styles.parenHint}>{t('將自動補上')} {bal} {t('個「)」')}</Text> : null}
                  </View>

                  {/* Token 區（彩色語法 + 可水平捲動） */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tokenRow}>
                    {toks.length === 0 ? (
                      <View style={styles.tokenPlaceholderBox}>
                        <Text style={[styles.tokenPlaceholder, { textAlign: 'center' }]}>
                          {t('尚未建立公式，請從按鈕插入參數 / 函數 / 數字')}
                        </Text>
                      </View>
                    ) : (
                      toks.map((tk, i) => {
                        const pal = tokenPalette(tk);
                        return <Badge key={i} text={tk.text} border={pal.border} fg={pal.fg} bg={pal.bg} />;
                      })
                    )}
                  </ScrollView>

                  {/* 操作列 */}
                  <View style={styles.row}>
                    <Btn label={t('計算')} onPress={compute} primary disabled={!isExpressionReady} />
                    <Btn label={t('套用並關閉')} onPress={applyAndClose} disabled={!isExpressionReady} />
                    <Btn label={t('刪除一格')} onPress={pop} />
                    <Btn label={t('清空')} onPress={clearTokens} />
                    <Btn label={t('關閉')} onPress={requestCloseModal}
                      style={{ backgroundColor: $color.danger }} textStyle={{ color: $color.white }} />
                  </View>


                  {/* 結果 / 狀態（預覽） */}
                  <View style={[styles.resultCard, !!err ? styles.resultCardError : styles.resultCardOk]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                      <Text style={[styles.resultLabel, !!err ? styles.resultLabelError : styles.resultLabelOk]}>
                        {err ? t('計算錯誤') : t('試算結果')}
                      </Text>
                      {!err && <UnitChip text={inferUnit(toks)} />}
                    </View>
                    <Text style={[styles.resultText, !!err ? styles.resultTextError : styles.resultTextOk]}>
                      {err ? `❌ ${err}` : preview}
                    </Text>
                  </View>
                </View>

                {/* ✅ 函數（只顯示四個） */}
                <Text style={[styles.h3, { color: '#111' }]}>{t('函數')}</Text>
                <View style={styles.rowWrap}>
                  {fnDefs.map(def => (
                    <Btn
                      key={def.key}
                      label={`${def.label} ${def.key}(`}   // 例如「加總 SUM(」
                      onPress={() => insertFunc(def.key)}
                      disabled={!(!toks.length || ['op', 'lparen', 'comma'].includes((toks[toks.length - 1] || {} as any).type))}
                    />
                  ))}
                </View>

                {/* 運算子 / 括號 / 逗號 */}
                <Text style={[styles.h3, { color: '#111' }]}>{t('運算子 / 括號 / 逗號')}</Text>
                <View style={styles.rowWrap}>
                  <Btn label="+" onPress={() => insertOp('+')} disabled={!(['name', 'number', 'rparen'].includes((toks[toks.length - 1]?.type || '')))} />
                  <Btn label="-" onPress={() => insertOp('-')} disabled={!(['name', 'number', 'rparen'].includes((toks[toks.length - 1]?.type || '')))} />
                  <Btn label="*" onPress={() => insertOp('*')} disabled={!(['name', 'number', 'rparen'].includes((toks[toks.length - 1]?.type || '')))} />
                  <Btn label="/" onPress={() => insertOp('/')} disabled={!(['name', 'number', 'rparen'].includes((toks[toks.length - 1]?.type || '')))} />
                  <Btn label="(" onPress={insertLParen} disabled={!(!toks.length || ['op', 'lparen', 'comma', 'func'].includes((toks[toks.length - 1]?.type || '')))} />
                  <Btn label=")" onPress={insertRParen} disabled={!(parenBalance(toks) > 0 && ['name', 'number', 'rparen'].includes((toks[toks.length - 1]?.type || '')))} />
                  <Btn label="," onPress={insertComma} disabled={!(['name', 'number', 'rparen'].includes((toks[toks.length - 1]?.type || '')) && parenBalance(toks) > 0)} />
                </View>

                {/* 數字鍵盤 */}
                <Text style={[styles.h3, { color: '#111' }]}>{t('數字鍵盤')}</Text>
                <View style={styles.rowWrap}>
                  {[...'1234567890'].map(n => (
                    <Btn key={n} label={n} onPress={() => insertNumber(n)} disabled={!canTapDigit} />
                  ))}
                  <Btn label="." onPress={() => insertNumber('.')} disabled={!canTapDot} />
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </SafeAreaProvider>

        {/* 關閉確認 */}
        <WsPopup active={popupActive} onClose={() => setPopupActive(false)}>
          <View
            style={{
              width: width * 0.9,
              height: height * 0.2,
              backgroundColor: $color.white,
              borderRadius: 10,
              flexDirection: 'row',
            }}
          >
            <WsText size={18} color={$color.black} style={{ padding: 16 }}>
              {t('確定捨棄嗎？')}
            </WsText>
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
                onPress={cancelCloseModal}
              >
                <WsText size={14} color={$color.gray}>{t('取消')}</WsText>
              </TouchableOpacity>
              <WsGradientButton style={{ width: 110 }} onPress={confirmCloseModal}>
                {t('確定')}
              </WsGradientButton>
            </WsFlex>
          </View>
        </WsPopup>
      </Modal>
    </>
  );
}

// ============== 小元件/樣式 ==============
type BtnProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  primary?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

function Btn({ label, onPress, disabled, primary, style, textStyle }: BtnProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        primary && { backgroundColor: '#3f51b5', borderColor: '#3f51b5' },
        disabled && { opacity: 0.35 },
        style,
      ]}
    >
      <Text style={[styles.btnText, primary && { color: '#fff' }, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
}

function Badge({ text, border, fg, bg }: { text: string; border: string; fg: string; bg?: string }) {
  return (
    <View style={[styles.badge, { borderColor: border, backgroundColor: bg || '#f4f4f6' }]}>
      <Text style={{ color: fg, fontWeight: '600' }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // 外層輸入框
  inputBox: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
  },
  input: { flex: 1, padding: 0, margin: 0 },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#111' },
  headerAction: { fontSize: 16, color: '#3f51b5' },

  // Modal 內容
  wrap: { padding: 16, gap: 12, backgroundColor: '#fff' },
  h2: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  h3: { fontSize: 14, fontWeight: '600', marginTop: 8 },
  row: { flexDirection: 'row', gap: 8, marginTop: 8, flexWrap: 'wrap' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

  btn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#f4f4f6',
    borderColor: '#ddd',
  },
  btnText: { color: '#111' },
  badge: { paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderRadius: 14, marginRight: 6, marginBottom: 6 },

  // === Formula card ===
  formulaCard: {
    borderWidth: 1,
    borderRadius: 14,
    borderColor: '#e6e6ea',
    backgroundColor: '#fff',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  formulaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  accentBar: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#3f51b5',
  },
  formulaTitle: { fontSize: 14, fontWeight: '700', color: '#111', flex: 0 },
  parenHint: { fontSize: 12, color: '#8a8a8a', marginLeft: 6, flex: 1 },

  tokenRow: { paddingVertical: 6, gap: 6 },
  tokenPlaceholderBox: { width: '100%', paddingVertical: 8, paddingHorizontal: 6 },
  tokenPlaceholder: { color: '#999', fontStyle: 'italic', lineHeight: 18 },

  resultCard: {
    marginTop: 10,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  resultCardOk: { backgroundColor: '#f0f7ff', borderColor: '#cfe2ff' },
  resultCardError: { backgroundColor: '#fff3f3', borderColor: '#ffd6d6' },

  resultLabel: { fontSize: 12, fontWeight: '700' },
  resultLabelOk: { color: '#0b5aaa' },
  resultLabelError: { color: '#b42318' },

  resultText: { fontSize: 18, fontWeight: '800', marginTop: 2 },
  resultTextOk: { color: '#0b5aaa' },
  resultTextError: { color: '#b42318' },

  unitChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#e6f0ff',
    borderColor: '#cfe2ff',
    borderWidth: 1,
    borderRadius: 999,
  },
  unitChipTxt: { fontSize: 11, color: '#0b5aaa', fontWeight: '700' },
});
