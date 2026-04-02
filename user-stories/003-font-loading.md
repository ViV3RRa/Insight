# US-003: Font Loading (DM Sans + DM Mono)

## Story
As the Insight platform user, I want the correct fonts loaded so that the UI matches the prototype typography exactly.

## Dependencies
- US-001: Project Scaffolding (must be completed first)

## Requirements
- Load **DM Sans** from Google Fonts: weights 400, 500, 600, 700 (normal), 400 (italic), optical size 9..40
- Load **DM Mono** from Google Fonts: weights 400, 500
- Set body font-family to `'DM Sans', system-ui, sans-serif`
- Google Fonts URL: `https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap`
- Apply `font-display: swap` for performance
- **NOT Inter or JetBrains Mono** — the design-system.md spec is outdated; prototypes use DM Sans + DM Mono

## Shared Components Used
N/A

## UI Specification
N/A — configuration story

## Design Reference
**Prototype (font loading reference):**
- `design-artifacts/prototypes/home-overview.html` L16 -- Google Fonts `<link>` for DM Sans + DM Mono
- `design-artifacts/prototypes/home-overview.html` L18--19 -- CSS declarations: `font-family` for body and `.font-mono-data`

## Acceptance Criteria
- [ ] DM Sans renders for all UI text (navigation, labels, buttons, headings)
- [ ] DM Mono renders for all numeric data when `.font-mono-data` class is applied
- [ ] Font weights 400, 500, 600, 700 are available for DM Sans
- [ ] Font weights 400, 500 are available for DM Mono
- [ ] Fonts load with `swap` display strategy (no FOIT)
- [ ] All tests pass and meet coverage target

## Testing Requirements
- **Test file**: N/A — configuration story, validated by build succeeding
- Font loading validated by build process and visual verification in component tests
- Correct `<link>` tags and `preconnect` hints verified by inspecting `index.html`

## Technical Notes
- Add the Google Fonts `<link>` to `index.html` `<head>` (preferred for fast loading)
- Alternatively, import in CSS — but `<link>` with `preconnect` is faster
- Add `<link rel="preconnect" href="https://fonts.googleapis.com">` and `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`
- File to modify: `index.html`
