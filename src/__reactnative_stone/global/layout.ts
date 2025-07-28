// 取用 螢幕裝置寬高度 或 statusBar高度

import { Dimensions } from 'react-native' // 用來抓取寬高的物件

interface Layouts {
  windowWidth: number;
  windowHeight: number;
  screenHeight: number;
}

const layouts: Layouts = {
  windowWidth: Dimensions.get('window').width,
  windowHeight: Dimensions.get('window').height,
  screenHeight: Dimensions.get('screen').height
}

export default layouts
