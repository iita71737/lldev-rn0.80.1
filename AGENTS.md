# AGENTS.md

## UI / Form defaults (must)
- Prefer Ws* components for UI and forms.
- Row layout -> WsFlex
- Text -> WsText (WsDes for helper/description)
- Clickable icon -> WsIconBtn; display icon -> WsIcon
- Form input defaults -> WsState (choose type/value/onChange)
- Checkbox -> WsStateCheckBox002
- Gradient CTA -> WsGradientButton

## Modal policy (must)
- Full-screen flow/process -> WsModal
- Copy-only/message popup -> WsPopup
- Bottom action options (edit/delete/etc.) -> WsBottomSheet

## Async feedback
- Loading spinner -> WsLoading
- Skeleton placeholder -> WsSkeleton

## Engineering constraints (must)
- No hardcoded colors; use tokens (e.g., $color.primary).
- Avoid raw RN primitives (View/Text/TextInput/TouchableOpacity) in feature screens unless explicitly required.

## Ws vs Ll policy (OpenSpec)
- Implement OpenSpec UI/Form using Ws* first.
- Create Ll* only for module-specific composites; Ll* must be module-scoped and not imported across modules.
- Cross-module reuse => promote to Ws*.

## References
- docs/component-map.md
- docs/ui-kit.md
- .codex/skills/ws-ui-kit/SKILL.md