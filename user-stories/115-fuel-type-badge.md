# US-115: Fuel Type Badge Component

## Story
As the Insight platform user, I want fuel type badges on vehicle cards so that I can visually distinguish between petrol, diesel, electric, and hybrid vehicles.

## Dependencies
- US-107: Vehicle TypeScript Types

## Requirements
- Small badge component showing the vehicle's fuel type
- Color-coded per fuel type (from ui-analysis §1.4):
  - **Petrol**: `bg-orange-100 text-orange-700 border-orange-200/80` / `dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-700/60`
  - **Diesel**: `bg-slate-100 text-slate-700 border-slate-200/80` / `dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600/60`
  - **Electric**: `bg-blue-50 text-blue-600 border-blue-200/70` / `dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700/60`
  - **Hybrid**: `bg-emerald-50 text-emerald-600 border-emerald-200/70` / `dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700/60`
- Badge style: `text-xs font-medium px-2 py-0.5 rounded-md border`

## Shared Components Used
None — this story IS a shared component

## UI Specification

```
<span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${fuelTypeColors[fuelType]}`}>
  {fuelType}
</span>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicles-overview.html`
- Petrol badge on vehicle cards: L119–120, L178
- Electric badge on sold Tesla card: L249–250

**Prototype:** `design-artifacts/prototypes/vehicle-detail.html`
- Fuel type chip in vehicle header metadata: L244–247

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototypes directly.

## Acceptance Criteria
- [ ] Renders correct colors for Petrol, Diesel, Electric, Hybrid
- [ ] Dark mode colors applied correctly
- [ ] Falls back gracefully for unknown fuel types
- [ ] Badge styling matches prototype
- [ ] All tests pass and meet coverage target
- [ ] Component renders correctly with test utilities

## Testing Requirements
- **Test file**: `src/components/shared/FuelTypeBadge.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`
- **Coverage target**: 80%+ line coverage
- Test all 4 fuel types render correct label text: Petrol, Diesel, Electric, Hybrid
- Test each fuel type applies the correct color classes
- Test dark mode variant classes are present
- Test fallback behavior for unknown/unexpected fuel type values

## Technical Notes
- File: `src/components/shared/FuelTypeBadge.tsx`
- Props: `{ fuelType: FuelType }`
- Used by vehicle cards (US-116), vehicle detail header (US-119)
