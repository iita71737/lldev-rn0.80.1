export default {
  getFileName(str) {
    if (typeof str === 'string') {
      // 提取最後的檔案路徑部分
      const file = str.split('//').pop().split('/').pop();
      // 如果有查詢參數，去掉查詢參數
      const fileNameWithoutParams = file.indexOf('?') >= 0
        ? file.substring(0, file.lastIndexOf('?'))
        : file;
      // 判斷檔案名稱是否包含副檔名
      const hasExtension = fileNameWithoutParams.lastIndexOf('.') > 0;
      // 如果有副檔名，去掉副檔名，否則返回完整名稱
      if (hasExtension) {
        return fileNameWithoutParams.substring(0, fileNameWithoutParams.lastIndexOf('.'));
      } else {
        return fileNameWithoutParams; // 沒有副檔名，返回完整名稱
      }
    }
    return null; // 如果不是字串，返回null
  }
}
