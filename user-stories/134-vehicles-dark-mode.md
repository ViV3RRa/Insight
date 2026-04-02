# US-134: Vehicles Section — Dark Mode Polish

## Story
As the Insight platform user, I want the entire Vehicles section to render correctly in dark mode.

## Dependencies
- US-009: Theme Provider
- US-118: Vehicles Overview — Page Assembly
- US-129: Vehicle Detail — Page Assembly

## Requirements
- Audit all Vehicles pages for dark mode (PRD §8.4)
- Vehicle card gradients use dark variants:
  - Car: `dark:from-sky-950/60 dark:to-blue-900/40`
  - Motorcycle: `dark:from-slate-800/60 dark:to-slate-700/40`
  - Sold: `dark:from-base-800 dark:to-base-750`
- Fuel type badge dark colors
- Vehicle photo area readable in dark mode
- Metadata chips dark mode tokens
- Charts legible on dark backgrounds
- All surfaces, text, inputs use correct dark tokens

## Shared Components Used
- All shared components — verify dark tokens in Vehicles context

## UI Specification

**Vehicle gradient dark variants (from ui-analysis §1.4):**
Already defined in US-116, verify applied correctly.

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicles-overview.html`
- Dark mode toggle via `class="dark"` on `<html>`: L7
- Tailwind dark mode config: L41
- Vehicle card dark gradients: L115 (car: `dark:from-sky-950/60 dark:to-blue-900/40`), L173 (motorcycle: `dark:from-slate-800/60 dark:to-slate-700/40`), L243 (sold: `dark:from-base-800 dark:to-base-750`)
- Fuel type badge dark colors: L120, L178, L250
- Surface colors: `dark:bg-base-800`, `dark:shadow-card-dark` throughout

**Prototype:** `design-artifacts/prototypes/vehicle-detail.html`
- Dark mode tokens on all surfaces, inputs, charts, metadata chips, stat cards throughout
- Vehicle header dark gradient: L220

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototypes directly.

## Acceptance Criteria
- [ ] All vehicle pages render correctly with dark class
- [ ] Vehicle card gradients use dark variants
- [ ] Fuel type badges have dark mode colors
- [ ] Metadata chips readable in dark mode
- [ ] Charts legible
- [ ] Sold vehicle muting readable in dark mode
- [ ] No missed white elements
- [ ] Sufficient contrast
- [ ] PRD §14 criterion 46: Dark mode functional

## Technical Notes
- Visual audit, not new features
- Pay attention to gradient colors on vehicle cards
- Vehicle silhouette SVGs should use appropriate dark mode stroke colors
