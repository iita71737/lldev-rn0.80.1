// JoditEditor.tsx
import React, { useRef, useMemo } from 'react';
import { View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

type Props = {
  initialHtml: string;                 // 一開始要編輯的 HTML
  onChange?: (html: string) => void;   // 編輯過程回傳 HTML
};

const JoditEditor: React.FC<Props> = ({ initialHtml, onChange }) => {
  const webviewRef = useRef<WebView | null>(null);

  // 用 JSON.stringify 包起來，避免字串插入 HTML 造成引號 / XSS 問題
  const escapedInitialHtml = useMemo(
    () => JSON.stringify(initialHtml || ''),
    [initialHtml],
  );

  const htmlTemplate = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=1"
    />

    <!-- Jodit CSS / JS CDN -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/jodit/es5/jodit.min.css"
    />
    <script src="https://cdn.jsdelivr.net/npm/jodit/es5/jodit.min.js"></script>

    <style>
      html, body {
        margin: 0;
        padding: 0;
        height: 100%;
        overflow: hidden;
      }
      #editor {
        height: 100%;
      }
      .jodit_container {
        height: 100% !important;
      }
      .jodit_workplace {
        height: calc(100% - 40px);
      }
    </style>
  </head>

  <body>
    <textarea id="editor"></textarea>

    <script>
      (function () {
        // 跟 React Native 同步的初始內容
        const INITIAL_HTML = ${escapedInitialHtml};

        function safePostMessage(message) {
          try {
            if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
              window.ReactNativeWebView.postMessage(JSON.stringify(message));
            }
          } catch (e) {
            console.log('postMessage error', e);
          }
        }

        document.addEventListener('DOMContentLoaded', function () {
          // 初始化 Jodit
          const editor = new Jodit('#editor', {
            height: '100%',
            toolbarAdaptive: false,
            // 需要的話可以在這裡加更多 options
          });

          // 設定初始內容
          editor.value = INITIAL_HTML;

          // 監聽內容變更，回傳給 React Native
          editor.events.on('change', function (value) {
            safePostMessage({
              type: 'CONTENT_CHANGE',
              payload: value || ''
            });
          });
        });
      })();
    </script>
  </body>
</html>
  `;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'CONTENT_CHANGE') {
        onChange?.(data.payload);
      }
    } catch (err) {
      console.warn('Jodit WebView message parse error', err);
    }
  };

  return (
    <View style={{ flex: 1, minHeight: 600, marginTop: 8 }}>
      <WebView
        ref={webviewRef}
        originWhitelist={['*']}
        source={{ html: htmlTemplate }}
        onMessage={handleMessage}
        // iOS 會比較吃這兩個設定，避免滾動怪怪的
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
};

export default JoditEditor;
