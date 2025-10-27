import React, { useCallback, useMemo } from 'react'
import {
    FlatList,
    View,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Text,
} from 'react-native'
import {
    WsAccordion,
    WsText,
    WsTag,
    WsFlex,
    WsInfo
} from '@/components'
import $color from '@/__reactnative_stone/global/color'

/** — 資料模型 — */
export type ChipItem = {
    key: string
    label: string
    withInput?: boolean
}

export type FormulaRow = {
    label: string            // 例如：'公式名稱 sum(result)'
    exportable?: boolean     // 顯示「匯出」鈕
    chartable?: boolean      // 顯示「圖/圖表」鈕
    chartLabel?: string      // 「圖」或「圖表」
}

export type VersionBlock = {
    id: string
    title: string | React.ReactNode
    defaultOpen?: boolean
    /** 二選一：你可以直接塞 content（客製 JSX），或是用下方 textLines/chips 來產 */
    content?: React.ReactNode
    textLines?: string[]
    chips?: ChipItem[]
}

export type SectionItem = {
    id: string
    title: string | React.ReactNode
    defaultOpen?: boolean
    showEdit?: boolean
    /** 這區塊最上面的資訊區（可選） */
    info?: { label: string; value: string; labelWidth?: number }
    /** 中段的「公式列」們 */
    formulas?: FormulaRow[]
    /** 巢狀的版本清單 */
    versions?: VersionBlock[]
    /** 最單純：直接給 body（若有此值，會放在最前面） */
    body?: React.ReactNode
    questions?: Array<{
        id: string;
        seq: string;
        title: string;
        type: string;
        options: string[];
    }>;
}

/** — 事件回呼 — */
export type SectionListProps = {
    sections: SectionItem[]
    onEditPress?: (section: SectionItem) => void
    onExportPress?: (section: SectionItem, row: FormulaRow) => void
    onChartPress?: (section: SectionItem, row: FormulaRow) => void
    /** Chip 事件（若使用 chips） */
    onChipRemove?: (chipKey: string) => void
    onChipInputChange?: (chipKey: string, value: string) => void
    step?: number;
}

/** 你現有的 Chip 元件（若位置不同請自行 import） */
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
        <View style={styles.chipContainer}>
            {/* {!!prefix && (
                <View style={styles.chipPrefixBadge}>
                    <Text style={styles.chipPrefixText}>{prefix}</Text>
                </View>
            )} */}

            {withInput ? (
                <TextInput
                    style={styles.chipInput}
                    value={label}                       // 受控
                    onChangeText={onInputChange}
                    placeholder=""
                    placeholderTextColor="#9AA0A6"
                />
            ) : (
                <Text style={styles.chipLabel} numberOfLines={1}>
                    {label}
                </Text>
            )}

            {!!onRemove && (
                <TouchableOpacity style={styles.removeBtn} onPress={onRemove}>
                    <Text style={styles.removeText}>✕</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const FormulaRowView = ({
    section,
    row,
    onExportPress,
    onChartPress,
}: {
    section: SectionItem
    row: FormulaRow
    onExportPress?: SectionListProps['onExportPress']
    onChartPress?: SectionListProps['onChartPress']
}) => {
    return (
        <WsFlex flexWrap="wrap" style={{ marginTop: 6 }}>
            <WsText color={$color.gray}>{row.label}</WsText>

            {row.exportable && (
                <TouchableOpacity
                    style={{ marginLeft: 8, marginRight: 8 }}
                    onPress={() => onExportPress?.(section, row)}
                >
                    {/* <WsTag>{'匯出'}</WsTag> */}
                </TouchableOpacity>
            )}

            {row.chartable && (
                <TouchableOpacity onPress={() => onChartPress?.(section, row)}>
                    {/* <WsTag>{row.chartLabel ?? '圖'}</WsTag> */}
                </TouchableOpacity>
            )}
        </WsFlex>
    )
}

const VersionBlockView = ({
    block,
    onChipRemove,
    onChipInputChange,
}: {
    block: VersionBlock
    onChipRemove?: SectionListProps['onChipRemove']
    onChipInputChange?: SectionListProps['onChipInputChange']
}) => {
    if (block.content) {
        return (
            <WsAccordion title={block.title} defaultOpen={block.defaultOpen}>
                {block.content}
            </WsAccordion>
        )
    }

    return (
        <WsAccordion title={block.title} defaultOpen={block.defaultOpen}>
            <View>
                {block.textLines?.map((ln, i) => (
                    <WsText key={i} size={12} color={$color.gray}>
                        {ln}
                    </WsText>
                ))}

                {block.chips?.map((c, idx) => (
                    <Chip
                        key={c.key}
                        prefix={String.fromCharCode(65 + idx)} // A/B/C...
                        label={c.label}
                        withInput={c.withInput}
                        onRemove={() => onChipRemove?.(c.key)}
                        onInputChange={(v: string) => onChipInputChange?.(c.key, v)}
                    />
                ))}
            </View>
        </WsAccordion>
    )
}

type SectionCardProps = {
    item: SectionItem
} & Omit<SectionListProps, 'sections'>

const SectionCard = ({
    item,
    onEditPress,
    onExportPress,
    onChartPress,
    onChipRemove,
    onChipInputChange,
    step
}: SectionCardProps) => {

    return (
        <WsAccordion
            title={item.title}
            defaultOpen={item.defaultOpen}
            rightActions={
                item.showEdit ? (
                    <TouchableOpacity onPress={() => onEditPress?.(item)}>
                        {/* <WsTag>{'編輯'}</WsTag> */}
                    </TouchableOpacity>
                ) : undefined
            }
        >
            {/* 直接 body（若提供） */}
            {item.body}

            {/* info 區 */}
            {item.info && (
                <View style={{ marginTop: 8 }}>
                    <WsInfo
                        label={item.info.label}
                        value={item.info.value}
                        labelWidth={item.info.labelWidth ?? 100}
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                    />
                </View>
            )}

            {/* 公式列 */}
            {!!item.formulas?.length && (step != 0) && (
                <View style={{ marginTop: item.info ? 10 : 0 }}>
                    {item.formulas.map((row, i) => (
                        <FormulaRowView
                            key={`${item.id}-formula-${i}`}
                            section={item}
                            row={row}
                            onExportPress={onExportPress}
                            onChartPress={onChartPress}
                        />
                    ))}
                </View>
            )}

            {/* 巢狀版本清單 */}
            {!!item.versions?.length && (
                <View style={{ marginTop: 12, gap: 10 }}>
                    {item.versions.map((v) => (
                        <VersionBlockView
                            key={v.id}
                            block={v}
                            onChipRemove={onChipRemove}
                            onChipInputChange={onChipInputChange}
                        />
                    ))}
                </View>
            )}

            {item.questions?.length ? (
                <View style={{ marginTop: 12 }}>
                    {item.questions.map(q => (
                        <View key={q.id} style={{ paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: '#eee' }}>
                            <WsText weight="700">{`${q.seq} ${q.title}`}</WsText>
                            <WsText size={12} color={$color.gray}>{q.type}</WsText>
                            {!!q.options.length && (
                                <WsText size={12} color={$color.gray}>{q.options.join('、')}</WsText>
                            )}
                        </View>
                    ))}
                </View>
            ) : null}

        </WsAccordion>
    )
}

export default function LlSectionList({
    sections,
    onEditPress,
    onExportPress,
    onChartPress,
    onChipRemove,
    onChipInputChange,
    step
}: SectionListProps) {
    const data = useMemo(() => sections, [sections])
    const keyExtractor = useCallback((it: SectionItem) => it.id, [])

    const renderItem = useCallback(
        ({ item }: { item: SectionItem }) => (
            <SectionCard
                item={item}
                onEditPress={onEditPress}
                onExportPress={onExportPress}
                onChartPress={onChartPress}
                onChipRemove={onChipRemove}
                onChipInputChange={onChipInputChange}
                step={step}
            />
        ),
        [onEditPress, onExportPress, onChartPress, onChipRemove, onChipInputChange]
    )

    return (
        <FlatList
            data={data}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={{ gap: 10 }}
            showsVerticalScrollIndicator={false}
        />
    )
}

const styles = StyleSheet.create({
    /** Chip 專用樣式（統一命名） */
    chipContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: '#F1F3F4',
        marginRight: 8,
        marginTop: 8,
        gap: 8,
    },
    chipPrefixBadge: {
        width: 18,
        height: 18,
        borderRadius: 999,
        backgroundColor: $color?.primary ?? '#0B57D0',
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipPrefixText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '700',
        lineHeight: 14,
    },
    chipLabel: {
        color: '#202124',
        fontSize: 14,
        maxWidth: 180,
    },
    chipInput: {
        paddingVertical: 2,
        minWidth: 80,
        maxWidth: 200,
        fontSize: 14,
        color: '#202124',
    },
    removeBtn: {
        paddingLeft: 4,
        paddingVertical: 2,
    },
    removeText: {
        fontSize: 14,
        color: $color?.gray ?? '#5F6368',
    },
})
