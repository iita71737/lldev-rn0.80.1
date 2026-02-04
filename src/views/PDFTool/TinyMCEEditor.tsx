// TinyMCEEditor.tsx
import React, { useRef, useMemo } from 'react';
import { View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

type Props = {
    initialHtml: string;          // 一開始要編輯的 HTML
    onChange?: (html: string) => void;  // 編輯過程回傳 HTML
};

const TinyMCEEditor: React.FC<Props> = ({ initialHtml, onChange }) => {
    const webviewRef = useRef<WebView | null>(null);

    // 避免直接把 HTML 插進模板造成 XSS / 引號爆炸
    const escapedInitialHtml = useMemo(
        () => JSON.stringify(initialHtml || ''),
        [initialHtml]
    );

    const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <script src="https://cdn.tiny.cloud/1/sksh7jsk5qd3cqnks1x4usezqmq33jtiemssnpi28mx4nicb/tinymce/8/tinymce.min.js" referrerpolicy="origin" crossorigin="anonymous"></script>
    <script>
      tinymce.init({
        selector: '#mytextarea'
      });
    </script>
  </head>

  <body>
    <h1>TinyMCE Quick Start Guide</h1>
    <form method="post">
      <textarea id="mytextarea">Hello, World!</textarea>
    </form>
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
            console.warn('TinyMCE WebView message parse error', err);
        }
    };

    const handleLoad = (event) => {
        const url = event.nativeEvent.url; // e.g. "https://editor.your-domain.com/page"
        console.log('url:', url);

        // 簡單取 domain（hostname）
        try {
            const { hostname } = new URL(url);
            console.log('hostname:', hostname); // e.g. "editor.your-domain.com"
        } catch (e) {
            console.log('URL parse error', e);
        }
    };

    return (
        <View style={{ flex: 1, minHeight: 500, marginTop: 16 }}>
            <WebView
                ref={webviewRef}
                originWhitelist={['*']}
                source={{uri: `https://pdftron.s3.amazonaws.com/downloads/pl/report.docx`}}
                onMessage={handleMessage}
                onLoad={handleLoad}
            />
        </View>
    );
};

export default TinyMCEEditor;
