## 1. Task Template Draft List Integration

- [x] 1.1 建立任務公版草稿列表 view/section（Ws 元件為主）並定義 `loading/data/error` 本地狀態
- [x] 1.2 串接 `S_TaskFactoryTemplete.index` 取得列表資料，完成成功與失敗回應處理
- [x] 1.3 實作列表渲染與 empty state，替換 `taskTemplateDraft` 現有占位內容

## 2. Task Index Tab and Header Behavior

- [x] 2.1 在 `TaskIndex` 內將 `taskTemplateDraft` tab 指向新的任務公版草稿列表 view
- [x] 2.2 確保 `headerRight` 在三個首層 tab 行為正確：`taskList=建立任務`、`taskTemplateDraft=開 modal`、`taskCommonTemplate=隱藏/不可用`
- [ ] 2.3 驗證切換 tab 不影響既有 `taskList` 的列表與建立任務流程

## 3. Quality and Regression Validation

- [ ] 3.1 補上最小驗證案例：首次進入 `taskTemplateDraft`、API 成功、API 空資料、API 失敗
- [ ] 3.2 回歸檢查 Task 主要流程：TaskCreate/TaskUpdate/TaskShow 返回 TaskIndex 的 header 與導航穩定性
- [ ] 3.3 確認 rollback 方案可行（快速回退為占位 UI，不影響 taskList）
