# US-037: ProportionalBar Component

## Story
As the Insight platform user, I want a proportional bar visualization of my portfolio allocation so that I can see at a glance how my investments are distributed across platforms.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens
- US-011: Shared Formatters (Danish Locale)

## Requirements
- Create a `ProportionalBar` component for portfolio allocation per PRD §6.2.8 and §6.3
- Horizontal segmented bar: each segment proportional to its value
- Legend below the bar in a full-width vertical list showing colored squares, platform names, formatted values (DKK), and percentages
- Cash platforms should be visually distinguishable from investment platforms
- Support for at least 8-10 segments (platforms)
- Responsive: bar and legend adapt to mobile widths

## Shared Components Used
None — this story IS a shared component

## UI Specification

```tsx
/* === ProportionalBar === */
<div>
  {/* Segmented bar */}
  <div className="h-8 rounded-lg overflow-hidden flex">
    {/* Segment 1 (investment) */}
    <div
      className="h-full transition-all duration-300"
      style={{
        width: '42%',
        backgroundColor: '#22c55e', /* emerald-500 */
      }}
    />
    {/* Segment 2 (investment) */}
    <div
      className="h-full transition-all duration-300"
      style={{
        width: '28%',
        backgroundColor: '#3b82f6', /* blue-500 */
      }}
    />
    {/* Segment 3 (investment) */}
    <div
      className="h-full transition-all duration-300"
      style={{
        width: '18%',
        backgroundColor: '#a855f7', /* violet-500 */
      }}
    />
    {/* Segment 4 (cash — striped/pattern for distinction) */}
    <div
      className="h-full transition-all duration-300"
      style={{
        width: '12%',
        backgroundColor: '#94a3b8', /* slate-400 */
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(255,255,255,0.15) 4px, rgba(255,255,255,0.15) 8px)',
      }}
    />
  </div>

  {/* Legend — full-width vertical list */}
  <div className="space-y-2.5 mt-5">
    {/* Legend item (investment) */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
        <span className="text-sm">Nordnet (ASK)</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono-data text-sm">842.391</span>
        <span className="font-mono-data text-xs text-base-400 w-12 text-right">47,9%</span>
      </div>
    </div>

    {/* Legend item (cash — with "Cash" badge) */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-sm bg-base-300 dark:bg-base-500" />
        <span className="text-sm text-base-500 dark:text-base-400">Revolut</span>
        <span className="text-xs text-base-300 dark:text-base-500 bg-base-100 dark:bg-base-700 px-1.5 py-0.5 rounded">Cash</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono-data text-sm">273.973</span>
        <span className="font-mono-data text-xs text-base-400 w-12 text-right">15,6%</span>
      </div>
    </div>
  </div>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/portfolio-overview.html` L899--965 -- Portfolio Allocation: proportional bar (L903--909) + legend with values/percentages (L911--964)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-tables.png`

## Acceptance Criteria
- [ ] Bar is h-8 rounded-lg overflow-hidden flex
- [ ] Each segment width is proportional to its value (percentage of total)
- [ ] Segments transition smoothly when data changes (transition-all duration-300)
- [ ] Cash platforms have a visually distinct color (muted base-300/base-500)
- [ ] Legend below uses full-width vertical list (space-y-2.5)
- [ ] Each legend item shows: colored square (w-2.5 h-2.5 rounded-sm), name (text-sm), formatted DKK value (font-mono-data text-sm), percentage (font-mono-data text-xs text-base-400 w-12 text-right)
- [ ] Cash platforms show a separate "Cash" badge (text-xs bg-base-100 dark:bg-base-700 px-1.5 py-0.5 rounded) and muted name text (text-base-500)
- [ ] Values and percentages use font-mono-data
- [ ] Dark mode: legend text uses dark:text-base-300
- [ ] Component handles edge cases: single platform (100%), many platforms (10+)
- [ ] All tests pass and meet coverage target
- [ ] Edge cases (single segment, empty data) are tested

## Testing Requirements
- **Test file**: `src/components/shared/ProportionalBar.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 90%+ line coverage
- Test all prop variants and conditional rendering
- Test user interactions (click, keyboard) with `userEvent`
- Test accessibility: ARIA roles, labels, keyboard navigation where applicable
- Verify dark mode classes are applied
- Test segments render with correct width percentages matching allocation data
- Test legend labels display on segments (platform names, values, percentages)
- Test single segment renders at 100% width
- Test empty data (no segments) is handled gracefully without errors
- Test cash platform segments display the "Cash" badge and muted styling
- Test many segments (10+) render correctly without layout issues
- Test minimum visual width is enforced for very small segments (< 2%)
- Test `showLegend` prop controls whether the legend is rendered

## Technical Notes
- File to create: `src/components/shared/ProportionalBar.tsx`
- Props: `segments: Array<{ label: string, value: number, formattedValue?: string, color: string, isCash?: boolean }>`, `showLegend?: boolean` (default: true)
- The percentage is computed internally: `segment.value / totalValue * 100`
- Colors are passed in per-segment — the parent assigns colors from a predefined palette
- The diagonal stripe pattern for cash platforms uses CSS `repeating-linear-gradient`
- Very small segments (< 2%) should still be visible — enforce a minimum visual width
- Export as named export: `export { ProportionalBar }`
