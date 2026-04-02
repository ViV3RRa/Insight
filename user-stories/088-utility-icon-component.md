# US-088: Utility Icon Component

## Story
As the Insight platform user, I want each utility to display a colored icon based on its type so that I can visually distinguish between utilities at a glance.

## Dependencies
- US-080: Home (Utilities) TypeScript Types

## Requirements
- Create a `UtilityIcon` component that maps a utility's `icon` and `color` fields to a styled icon display
- **Icon mapping** (PRD §5.1.1): Maps icon string to lucide-react icon:
  - "bolt" → Zap, "droplet" → Droplet, "flame" → Flame, "sun" → Sun, "wind" → Wind, "thermometer" → Thermometer, "wifi" → Wifi, "trash" → Trash2
- **Color mapping** (from ui-analysis §1.4): Maps color string to background and icon color classes:
  - "amber" → `bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400`
  - "blue" → `bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400`
  - "orange" → `bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400`
  - "emerald" → `bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400`
  - "violet" → `bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400`
  - "rose" → `bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400`
  - "cyan" → `bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400`
  - "slate" → `bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400`
- **Size variants**: `sm` (w-6 h-6 icon w-3.5 h-3.5), `md` (w-8 h-8 icon w-4 h-4), `lg` (w-10 h-10 icon w-5 h-5)
- Container: `rounded-lg flex items-center justify-center`

## Shared Components Used
None — this story IS a shared component

## UI Specification

```
<div className={`${sizeClasses} ${colorClasses.bg} rounded-lg flex items-center justify-center`}>
  <IconComponent className={`${iconSizeClasses} ${colorClasses.text}`} />
</div>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/home-overview.html`
- Electricity icon (amber): L117-120
- Water icon (blue): L170-172
- Heat icon (orange): L215-218
- Icon picker in Add Utility dialog: L640-673

**Screenshots:**
- `design-artifacts/prototypes/screenshots/home/overview-desktop-top.png`

## Acceptance Criteria
- [ ] Renders correct lucide-react icon for each icon string
- [ ] Applies correct color classes for each color string
- [ ] Size variants (sm, md, lg) render at correct dimensions
- [ ] Dark mode colors use appropriate opacity/shade variants
- [ ] Falls back gracefully for unknown icon/color strings
- [ ] Container uses rounded-lg styling

## Technical Notes
- File: `src/components/shared/UtilityIcon.tsx`
- Props: `{ icon: UtilityIcon; color: UtilityColor; size?: 'sm' | 'md' | 'lg' }`
- Default size: `md`
- Used by: utility summary cards (US-089), utility list (US-091), utility detail header (US-097), utility switcher
