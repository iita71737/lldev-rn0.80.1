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
    ? displayContent.replace(new RegExp(`(${keyword})`, 'gi'), '<mark>$1</mark>')
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
    }),
    mark: HTMLElementModel.fromCustomModel({
      tagName: 'mark',
      contentModel: HTMLContentModel.textual,
    }),
  }

  const customTableStylesSpecs = {
    ...defaultTableStylesSpecs,
    // thBorderColor: '#000000',
    // tdBorderColor: '#000000',
    // thOddBackground : '#000000',
    // thOddColor : '#000000',
    // thEvenBackground: '#000000',
    // thEvenColor: '#000000',
    trOddBackground: 'transparent',
    // trOddColor : '#000000',
    // trEvenBackground : '#000000',
    // trEvenColor : '#000000',
    outerBorderWidthPx: 1,
    columnsBorderWidthPx: 1,
    // outerBorderColor: '#000000',
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
        customHTMLElementModels={customHTMLElementModels}
        defaultTextProps={{
          style: {
            color: '#000',
            lineHeight: 24
          },
        }}
        renderersProps={{
          ...renderersProps
        }}
        ignoredStyles={['margin', 'padding']}
        tagsStyles={{
          p: {
            marginVertical: 8, // 移除上下間距
            paddingVertical: 0,
          },
          strong: {
            marginVertical: 0, // 移除上下間距
            paddingVertical: 0,
          },
          span: {
            marginVertical: 0, // 移除上下間距
            paddingVertical: 0,
          },
          mark: {
            backgroundColor: 'yellow',
            fontWeight: 'bold',
          },
        }}
        {...htmlProps}
      />

    </>
  )
})

export default WsHtmlRender

