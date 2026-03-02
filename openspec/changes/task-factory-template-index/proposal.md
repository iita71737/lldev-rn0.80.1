# Task Factory Template Draft List (task-factory-template-index)

## Why
目前「任務公版(有草稿)」tab 只有占位內容，使用者無法查看或操作任務公版資料。
需要將該 tab 串接列表資料來源，使公版流程可被實際使用，同時不影響既有「任務」tab 的核心流程。

## What Changes
- 在任務頁第一層 tab 的 `taskTemplateDraft` 中，顯示任務公版清單（取代 placeholder）。
- 串接 `S_TaskFactoryTemplete.index` 取得公版列表資料。
- 提供可觀察的 loading / empty / error 狀態。
- 保持既有 `taskList` tab 的渲染、導頁、header-right 行為不變。

## Implementation Constraints (App / UI)
- UI MUST follow Ws* component conventions:
  - Layout row uses `WsFlex`
  - Text uses `WsText` (helper/description uses `WsDes`)
  - Form inputs (if any) default to `WsState`
  - Loading uses `WsLoading` or `WsSkeleton` (prefer `WsSkeleton` in list area)
  - Tabs use `WsTabView`
- Modal patterns MUST be respected:
  - Full-screen flow/process uses `WsModal`
  - Copy-only/message popup uses `WsPopup`
  - Bottom action options uses `WsBottomSheet`
- Colors MUST use design tokens (e.g., `$color.primary`). No hardcoded hex.
- Avoid raw RN primitives (View/Text/TextInput/TouchableOpacity) in feature UI unless strictly required.
- Component layering:
  - Prefer direct Ws* composition in screen.
  - Create `Ll*` only when a module-specific composite is needed and repeated within Task module.
  - `Ll*` MUST NOT be imported across modules.

## Capabilities

### New Capabilities
- `task-factory-template-list`: 在 `taskTemplateDraft` tab 提供可載入、可顯示的任務公版清單能力，資料來源為 `S_TaskFactoryTemplete.index`。

### Modified Capabilities
- None.

## Impact
### Affected code
- `src/views/Task/Index.tsx`（第一層 tab 導頁與顯示；替換 placeholder）
- `src/routes/RoutesTask.js`（tab / header-right 行為維持 tab-specific）
- `src/services/api/v1/task_factory_template.js`（新增或調整 index 串接）
- `src/services/api/v1/index.js`（export service）
- `src/views/Task/Tasks/Index.tsx`（回歸確認：既有任務清單不受影響）
- (Optional / if used by template modal flow)
  - `src/__reactnative_stone/components/WsStateFormView.js`
  - `src/__reactnative_stone/components/WsStepRoutesUpdate.js`
  - `src/__reactnative_stone/components/WsStepUpdatePage.js`
- (Optional) `src/components/LlTaskHeaderCard001.js`（Task 模組內的組合 UI，若此變更需要）

### APIs
- 使用既有 `S_TaskFactoryTemplete.index`，無 API contract breaking change。

### Affected teams
- 前端 App 團隊（Task 模組）
- 後端 API 團隊（僅需確認 `index` 回傳欄位完整）
- QA 團隊（Task tab 與 template list regression）

## Rollback plan
- 若上線後異常，回退到占位 UI 版本（恢復 `taskTemplateDraft` placeholder）。
- 保持 `taskList` tab 與既有 task create/show 流程不受影響，確保核心任務流程可用。

## Acceptance summary (quick)
- 切到 `taskTemplateDraft` tab 會看到公版清單（非 placeholder）
- loading / empty / error 狀態可被看見且不 crash
- 切回 `taskList` 後，任務清單與 header-right「建立任務」行為完全不變