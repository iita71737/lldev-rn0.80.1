import React from 'react';
import { Text, StyleSheet, TextProps } from 'react-native';
import $color from '@/__reactnative_stone/global/color';
import { WsHtmlRender } from '@/components';

type Props = {
  children: string;
  keyword: string;
  collapsed?: boolean;
  contextLength?: number;
  color?: string;
  size?: 60 | 48 | 36 | 28 | 24 | 18 | 16 | 14 | 12;
  fontWeight?: TextProps['style']['fontWeight'];
  style?: TextProps['style'];
  highlightStyle?: TextProps['style'];
  textAlign?: TextProps['style']['textAlign'];
  letterSpacing?: number;
  numberOfLines?: number;
  ellipsizeMode?: TextProps['ellipsizeMode'];
  selectable?: boolean;
  testID?: string;
  onTextLayout?: TextProps['onTextLayout'];
  richContent?: string;
};

const WsTextHighlight = ({
  children,
  keyword,
  collapsed = true,
  contextLength = 40,
  color = $color.black,
  size = 14,
  fontWeight,
  style,
  highlightStyle,
  textAlign,
  letterSpacing,
  numberOfLines,
  ellipsizeMode,
  selectable = false,
  testID,
  onTextLayout,
  richContent
}: Props) => {
  // ✅ 如果有 richContent 且非空字串，優先使用 HTML 渲染
  if (typeof richContent === 'string' && richContent.trim() !== '') {
    return (
      <WsHtmlRender
        content={richContent}
        keyword={keyword}
        collapsed={collapsed}
      />
    );
  }

  if (!children || !keyword) {
    return <Text style={[styles[`text${size}`], { color }, style]}>{children}</Text>;
  }

  const regex = new RegExp(`(${keyword})`, 'gi');
  const allParts = children.split(regex);

  // collapsed 模式下裁切只保留最早出現的 keyword 前後字元
  if (collapsed) {
    const matchIndex = allParts.findIndex(part => part.toLowerCase() === keyword.toLowerCase());
    if (matchIndex === -1) {
      return <Text style={[styles[`text${size}`], { color }, style]}>{children}</Text>;
    }

    const beforePart = allParts.slice(0, matchIndex).join('');
    const afterPart = allParts.slice(matchIndex + 1).join('');
    const before = beforePart.slice(-contextLength);
    const match = allParts[matchIndex];
    const after = afterPart.slice(0, contextLength);

    const prefix = beforePart.length > contextLength ? '... ' : '';
    const suffix = afterPart.length > contextLength ? ' ...' : '';

    return (
      <Text
        selectable={selectable}
        testID={testID}
        numberOfLines={numberOfLines}
        ellipsizeMode={ellipsizeMode}
        onTextLayout={onTextLayout}
        style={[
          styles[`text${size}`],
          {
            color,
            fontWeight,
            textAlign,
            letterSpacing,
            flexWrap: 'wrap',
          },
          style,
        ]}
      >
        {prefix + before}
        <Text style={[{ backgroundColor: $color.yellow11l, fontWeight: 'bold' }, highlightStyle]}>
          {match}
        </Text>
        {after + suffix}
      </Text>
    );
  }

  // 展開模式，highlight 所有 keyword
  return (
    <Text
      selectable={selectable}
      testID={testID}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      onTextLayout={onTextLayout}
      style={[
        styles[`text${size}`],
        {
          color,
          fontWeight,
          textAlign,
          letterSpacing,
          flexWrap: 'wrap',
        },
        style,
      ]}
    >
      {allParts.map((part, index) =>
        part.toLowerCase() === keyword.toLowerCase() ? (
          <Text
            key={index}
            style={[{ backgroundColor: $color.yellow11l, fontWeight: 'bold' }, highlightStyle]}
          >
            {part}
          </Text>
        ) : (
          <Text key={index}>{part}</Text>
        )
      )}
    </Text>
  );
};

const styles = StyleSheet.create({
  text60: { fontSize: 60, lineHeight: 84, letterSpacing: 1 },
  text48: { fontSize: 48, lineHeight: 60, letterSpacing: 1 },
  text36: { fontSize: 36, lineHeight: 48, letterSpacing: 1 },
  text28: { fontSize: 28, lineHeight: 36, letterSpacing: 1 },
  text24: { fontSize: 24, lineHeight: 28, letterSpacing: 0.6 },
  text18: { fontSize: 18, lineHeight: 24, letterSpacing: 0.6 },
  text16: { fontSize: 16, lineHeight: 22, letterSpacing: 0.6 },
  text14: { fontSize: 14, lineHeight: 20, letterSpacing: 0.6 },
  text12: { fontSize: 12, lineHeight: 16, letterSpacing: 0.6 },
});

export default WsTextHighlight;
