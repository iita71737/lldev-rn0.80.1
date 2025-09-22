import React, { useState } from 'react'
import {
  StyleSheet,
  View,
  Linking,
  Text,
  Dimensions,
  Image
} from 'react-native'
import RenderHtml, {
  HTMLElementModel,
  HTMLContentModel,
  RenderHTMLProps,
  enableExperimentalPercentWidth
} from 'react-native-render-html'
import table,
{
  IGNORED_TAGS,
  defaultTableStylesSpecs,
  cssRulesFromSpecs,
  tableModel,
} from '@native-html/table-plugin';
import WebView from 'react-native-webview';
import { decode } from 'html-entities';

const WsHtmlRender = React.memo(({ content, contentWidth, keyword, collapsed = false }) => {
  const { width } = Dimensions.get('window')

  let displayContent = decode(content)
    // 將所有換行符（包括 \r\n 或 \n）轉換為 <br>
    .replace(/(\r?\n)+/g, '<br>')
    // 將連續兩個或以上的 <br> 標籤合併成一個
    .replace(/(<br\s*\/?>\s*){2,}/gi, '<br>')
    .replace(/<col[^>]*>/gi, '').replace(/<\/?colgroup[^>]*>/gi, '') // 250617
    .replace(/<br\s*\/?>/gi, '') // 移除 <br> // 250617
    .replace(/(\r?\n)+/g, '');   // 移除換行符 // 250617

  if (collapsed) {
    if (keyword) {
      const keywordRegex = new RegExp(keyword, 'i');
      const match = displayContent.match(keywordRegex);
      if (match && match.index !== undefined) {
        const index = match.index;
        const start = Math.max(0, index - 50);
        const end = index + keyword.length + 50;
        displayContent = displayContent.substring(start, end);
      } else {
        displayContent = displayContent.slice(0, 100);
      }
      if (displayContent.length < content.length) {
        displayContent += '...';
      }
    } else {
      displayContent = displayContent.slice(0, 100);
      if (content.length > 100) {
        displayContent += '...';
      }
    }
  }

  const highlighted = keyword
    ? displayContent.replace(new RegExp(`(${keyword})`, 'gi'), '<span class="__hl">$1</span>')
    : displayContent;

  const renderersProps = {
    a: {
      onPress(event, url, htmlAttribs, target) {
        Linking.canOpenURL(url).then(supported => {
          if (!supported) {
            console.log('Can\'t handle url: ' + url);
          } else {
            return Linking.openURL(url);
          }
        }).catch(err => console.error('An error occurred', err));
      }
    },
  }


  // Custom Styling
  const customHTMLElementModels = {
    em: HTMLElementModel.fromCustomModel({
      tagName: 'em',
      mixedUAStyles: {
        fontFamily: 'Open Sans',
      },
      contentModel: HTMLContentModel.block
    }),
    ul: HTMLElementModel.fromCustomModel({
      tagName: 'ul',
      mixedUAStyles: {
        marginVertical: 20
      },
      contentModel: HTMLContentModel.block
    }),
    li: HTMLElementModel.fromCustomModel({
      tagName: 'li',
      mixedUAStyles: {
        flexDirection: 'row',
      },
      contentModel: HTMLContentModel.block
    }),
    img: HTMLElementModel.fromCustomModel({
      tagName: 'img',
      mixedUAStyles: {
        borderWidth: 0.3,     // 若需要邊框，可以取消註解
      },
      contentModel: HTMLContentModel.block
    }),
    br: HTMLElementModel.fromCustomModel({
      tagName: 'br',
      mixedUAStyles: {
        // borderWidth: 1,
        marginBottom: 16 / 2,
      },
      contentModel: HTMLContentModel.block
    })
  }

  const customTableStylesSpecs = {
    ...defaultTableStylesSpecs,
    trOddBackground: 'transparent',
    outerBorderWidthPx: 1,
    columnsBorderWidthPx: 1,
  };

  // 取得預設的 CSS 規則字串
  const cssRules =
    cssRulesFromSpecs(customTableStylesSpecs) +
    `
    a {
      text-transform: uppercase;
    }
    table {
    }
    thead, tbody, tr, th, td, col, colgroup {
    }
    td {
    border-width: 0px 1pt 1pt !important;
    border-style: solid !important;
    border-color:rgb(213, 213, 213) !important;
    }

    html, body { margin:0; padding:0; background: transparent; }
    /* ✅ 讓 WebView 真的能左右滾動 */
    body { overflow-x: auto; -webkit-overflow-scrolling: touch; white-space: nowrap; padding-right: 16px; }

    /* ✅ 讓表格依內容展開，保證比 viewport 寬；用 inline-block + !important 把任何 100% 覆蓋掉 */
    table {
      display: inline-block !important;
      min-width: 100% !important;         /* 或用 100vw 也可 */
      width: auto !important;
      max-width: none !important;     
      border-collapse: collapse;
      border-spacing: 0;
      white-space: normal; /* 恢復表格內部自行換行控制 */
    }
    /* ✅ 每欄設最小寬，確保內容把整張表撐寬 */
    th, td { white-space: nowrap; }

    /* 你的原本邊框樣式（注意是 !important） */
    td {
      border-width: 0px 1pt 1pt !important;
      border-style: solid !important;
      border-color:rgb(213, 213, 213) !important;
    }
    /* ── 對齊規則：整列的儲存格一律靠左 ── */
    tr > th,
    tr > td {
      text-align: left !important;
    }
    table td, table td * {
      line-height: 0.8 !important;
    }
    `;


  // For HTML Tag Table
  const htmlProps = {
    WebView,
    renderers: {
      table
    },
    ignoredTags: IGNORED_TAGS,
    renderersProps: {
      table: {
        cssRules,
      }
    },
  };


  // Render
  return (
    <>

      <RenderHtml
        contentWidth={contentWidth ? contentWidth : width}
        source={{ html: `${highlighted}` }}
        enableCSSInlineProcessing
        allowedStyles={['color', 'backgroundColor', 'textDecorationLine']}
        defaultTextProps={{
          selectable: true,
          style: Platform.OS === 'android' ? { includeFontPadding: true } : undefined
        }}
        baseStyle={{ lineHeight: 24, fontSize: 16 }}
        customHTMLElementModels={customHTMLElementModels}
        renderersProps={{
          ...renderersProps
        }}
        ignoredStyles={['margin', 'padding']}
        classesStyles={{ __hl: { backgroundColor: '#fff59d' } }}
        tagsStyles={{
          p: { color: '#334155', lineHeight: 24, fontSize: 16, marginVertical: 8, paddingVertical: 0 },
          h2: { color: '#0f172a', fontWeight: '700', fontSize: 24, lineHeight: 24 * 1.6, marginTop: 12, marginBottom: 8 },
          h3: { color: '#0f172a', fontWeight: '700', fontSize: 20, lineHeight: 20 * 1.6, marginTop: 10, marginBottom: 6 },
          a: { color: '#2563eb', textDecorationLine: 'underline' },
          ul: { paddingLeft: 18, marginBottom: 12, listStyleType: 'none' },
          li: { color: '#334155', lineHeight: 24, fontSize: 16, marginLeft: 18 },
          nav: { marginVertical: 8, paddingVertical: 4 },
          blockquote: {
            borderLeftWidth: 4,
            borderLeftColor: '#94a3b8',
            paddingLeft: 12,
            color: '#475569',
            fontStyle: 'italic',
            marginVertical: 12,
          },
          img: { borderRadius: 12 },
          code: { fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }) },
          pre: { backgroundColor: '#0b1020', borderRadius: 12, padding: 12, marginVertical: 8 },
          strong: { marginVertical: 0, paddingVertical: 0 },
          span: { marginVertical: 0, paddingVertical: 0 },
        }}
        {...htmlProps}
      />

    </>
  )
})

export default WsHtmlRender

