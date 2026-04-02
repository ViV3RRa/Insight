# US-039: PlatformIcon Component

## Story
As the Insight platform user, I want circular platform icons at consistent sizes so that I can visually identify platforms across tables, headers, and dialogs.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens

## Requirements
- Create a `PlatformIcon` component for displaying platform images
- Circular image with subtle ring/shadow
- 3 sizes: sm (tables), md (detail headers), lg (dialogs/forms)
- Fallback: when no image is available, show the first letter of the platform name on a colored background
- Used on: platform list rows, platform detail headers, platform dialogs, dropdown switcher items

## Shared Components Used
None — this story IS a shared component

## UI Specification

```tsx
/* === sm size (w-5 h-5, for tables and dropdown items) === */
<div className="w-5 h-5 rounded-full shadow ring-1 ring-black/10 dark:ring-white/10 overflow-hidden flex-shrink-0">
  <img
    src="platform-icon-url"
    alt="Nordnet"
    className="w-full h-full object-cover"
  />
</div>

/* === md size (w-7 h-7, for detail page headers) === */
<div className="w-7 h-7 rounded-full shadow ring-1 ring-black/10 dark:ring-white/10 overflow-hidden flex-shrink-0">
  <img
    src="platform-icon-url"
    alt="Nordnet"
    className="w-full h-full object-cover"
  />
</div>

/* === lg size (w-10 h-10, for dialogs and cards) === */
<div className="w-10 h-10 rounded-full shadow ring-1 ring-black/10 dark:ring-white/10 overflow-hidden flex-shrink-0">
  <img
    src="platform-icon-url"
    alt="Nordnet"
    className="w-full h-full object-cover"
  />
</div>

/* === Fallback (no image — first letter on colored bg) === */

/* sm fallback */
<div
  className="
    w-5 h-5 rounded-full flex-shrink-0
    flex items-center justify-center
    text-[10px] font-semibold text-white
    shadow ring-1 ring-black/10 dark:ring-white/10
  "
  style={{ backgroundColor: '#3b82f6' }}
>
  N
</div>

/* md fallback */
<div
  className="
    w-7 h-7 rounded-full flex-shrink-0
    flex items-center justify-center
    text-xs font-semibold text-white
    shadow ring-1 ring-black/10 dark:ring-white/10
  "
  style={{ backgroundColor: '#3b82f6' }}
>
  N
</div>

/* lg fallback */
<div
  className="
    w-10 h-10 rounded-full flex-shrink-0
    flex items-center justify-center
    text-sm font-semibold text-white
    shadow ring-1 ring-black/10 dark:ring-white/10
  "
  style={{ backgroundColor: '#3b82f6' }}
>
  N
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/portfolio-overview.html` L663--665 -- Nordnet icon (rounded-full, shadow, ring)
- `design-artifacts/prototypes/portfolio-overview.html` L703--705 -- Mintos icon
- `design-artifacts/prototypes/icons/` -- Icon assets: icon_nordnet.webp, icon_mintos.webp, icon_kameo.png, etc.

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-tables.png`

## Acceptance Criteria
- [ ] sm size renders at w-5 h-5 (20px)
- [ ] md size renders at w-7 h-7 (28px)
- [ ] lg size renders at w-10 h-10 (40px)
- [ ] All sizes use rounded-full shadow ring-1 ring-black/10
- [ ] Image is displayed with object-cover inside overflow-hidden
- [ ] Fallback shows first letter of platform name in white on a colored background
- [ ] Fallback font size scales with icon size: text-[10px] (sm), text-xs (md), text-sm (lg)
- [ ] Fallback background color is derived from the platform name (deterministic hash) or passed as prop
- [ ] Dark mode ring uses dark:ring-white/10
- [ ] All sizes use flex-shrink-0 to prevent compression in flex layouts
- [ ] Image loading errors fall back to the letter display
- [ ] All tests pass and meet coverage target
- [ ] Fallback behavior (missing image, load error) is tested

## Testing Requirements
- **Test file**: `src/components/shared/PlatformIcon.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 90%+ line coverage
- Test all prop variants and conditional rendering
- Test user interactions (click, keyboard) with `userEvent`
- Test accessibility: ARIA roles, labels, keyboard navigation where applicable
- Verify dark mode classes are applied
- Test image renders with correct `src` and `alt` attributes when `imageUrl` is provided
- Test fallback displays the first letter of the platform name when no image URL is provided
- Test image `onError` triggers fallback to letter display
- Test all three sizes render at correct dimensions: sm (w-5 h-5), md (w-7 h-7), lg (w-10 h-10)
- Test fallback font size scales with icon size: text-[10px] (sm), text-xs (md), text-sm (lg)
- Test fallback background color is applied (either from `color` prop or deterministic hash)

## Technical Notes
- File to create: `src/components/shared/PlatformIcon.tsx`
- Props: `name: string`, `imageUrl?: string`, `size?: 'sm' | 'md' | 'lg'` (default: sm), `color?: string`
- The fallback color can either be passed explicitly or generated from the platform name using a simple hash function that maps to a predefined color palette
- Use an `onError` handler on the `<img>` tag to fall back to the letter display if the image URL is invalid
- The image URL comes from PocketBase's file URL builder (e.g., `pb.files.getUrl(record, 'icon')`)
- Export as named export: `export { PlatformIcon }`
