# US-038: TransactionTypeBadge Component

## Story
As the Insight platform user, I want color-coded badges for transaction types (Deposit/Withdrawal) so that I can visually distinguish between money flowing in and money flowing out in transaction tables.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens

## Requirements
- Create a `TransactionTypeBadge` component
- 2 types: Deposit (green/emerald) and Withdrawal (rose/red)
- Small pill shape with colored background and text
- Mobile abbreviations: "Dep." for Deposit, "Wdl." for Withdrawal (saves horizontal space)
- Desktop: full labels "Deposit" / "Withdrawal"
- Used in transaction tables on platform detail pages

## Shared Components Used
None — this story IS a shared component

## UI Specification

```tsx
/* === Deposit badge (desktop) === */
<span
  className="
    inline-flex items-center
    px-2 py-0.5
    text-xs font-medium
    rounded-full
    bg-emerald-50 text-emerald-700
    dark:bg-emerald-900/30 dark:text-emerald-400
  "
>
  <span className="hidden sm:inline">Deposit</span>
  <span className="sm:hidden">Dep.</span>
</span>

/* === Withdrawal badge (desktop) === */
<span
  className="
    inline-flex items-center
    px-2 py-0.5
    text-xs font-medium
    rounded-full
    bg-rose-50 text-rose-700
    dark:bg-rose-900/30 dark:text-rose-400
  "
>
  <span className="hidden sm:inline">Withdrawal</span>
  <span className="sm:hidden">Wdl.</span>
</span>
```

## Design Reference
**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/detail-desktop-transactions.png`
- `design-artifacts/prototypes/screenshots/investment/detail-mobile-transactions.png`

## Acceptance Criteria
- [ ] Deposit badge uses bg-emerald-50 text-emerald-700 (light) and dark:bg-emerald-900/30 dark:text-emerald-400 (dark)
- [ ] Withdrawal badge uses bg-rose-50 text-rose-700 (light) and dark:bg-rose-900/30 dark:text-rose-400 (dark)
- [ ] Badge shape: px-2 py-0.5 text-xs font-medium rounded-full
- [ ] Desktop (sm+) shows full label: "Deposit" / "Withdrawal"
- [ ] Mobile (<sm) shows abbreviated label: "Dep." / "Wdl."
- [ ] Component accepts a `type` prop of `'deposit' | 'withdrawal'`

## Technical Notes
- File to create: `src/components/shared/TransactionTypeBadge.tsx`
- Props: `type: 'deposit' | 'withdrawal'`
- The responsive label swap uses `hidden sm:inline` / `sm:hidden` Tailwind classes
- This is a purely presentational component with no state or callbacks
- Export as named export: `export { TransactionTypeBadge }`
