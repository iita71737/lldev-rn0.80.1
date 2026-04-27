---
name: ws-ui-kit
description: >
  Apply the project's Ws* component system with strong defaults: WsFlex for row
  layout, WsText for text, WsIconBtn for clickable icons, WsState for form
  inputs, WsInfo for read-only display, and WsModal/WsPopup/WsBottomSheet for
  modal patterns. Use tokens only; avoid raw RN primitives and hardcoded colors.
---

## Rules (must)

### UI primitives (preferred defaults)
- Row / same-line layout: **WsFlex**
- Text / labels / titles: **WsText**
- Helper / description text: **WsDes**
- Clickable icon: **WsIconBtn**
- Display-only icon: **WsIcon**
- Primary CTA (gradient): **WsGradientButton**

### Form & display
- Form input (default): **WsState** (choose `type`, pass `value`, `onChange`)
- Checkbox input: **WsStateCheckBox002** (or WsState checkbox type if supported)
- Read-only / info display (label-value): **WsInfo**

#### WsInfo spacing rule (must)
- Any `WsInfo` MUST be wrapped by an outer container that applies `marginTop: 8`.
- Prefer using **WsFlex** as the wrapper to avoid raw RN primitives:
  - Example pattern:
    - `<View style={{ marginTop: 8 }}> <WsInfo .../> </View>`
- If the surrounding layout requires a plain wrapper, using `View` is allowed, but still must apply `marginTop: 8`.

### Update action
- Update action button: **WsUpdateBtn** (when following existing pattern)

### Modal patterns (must)
- Full-screen flow / multi-step operations: **WsModal**
- Copy-only / message popup: **WsPopup**
- Bottom action options (edit/delete/select actions in-page): **WsBottomSheet**

### Async feedback (must)
- Spinner loading: **WsLoading**
- Skeleton placeholder: **WsSkeleton**

### Tabs
- Tab UI: **WsTabView**

### Prohibitions
- Avoid raw React Native primitives in feature UI (View/Text/TextInput/TouchableOpacity) unless explicitly required by integration constraints.
- Colors must come from tokens (e.g., `$color.primary`). **No hardcoded hex**.
- Follow i18n + testID conventions.

## Workflow
1) Identify UI intent:
   - layout row / text / helper text / icon / button / form field / read-only display / modal / loading / tab
2) Pick the preferred component based on the defaults above (or `references/component-map.md` if present).
3) Implement using tokens from `references/ui-kit.md` (or project tokens such as `$color`).
4) Validate:
   - used Ws* components as defaults
   - correct modal type (WsModal vs WsPopup vs WsBottomSheet)
   - WsInfo wrapped with marginTop: 8
   - no hardcoded colors
   - minimal/no raw RN primitives
