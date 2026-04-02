# US-017: CurrencyDisplay Component

## Story
As the Insight platform user, I want non-DKK values displayed with both native currency and DKK equivalent so that I can understand values in my home currency without losing the original denomination.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens
- US-011: Shared Formatters (Danish Locale)

## Requirements
- Create a `CurrencyDisplay` component per PRD §4.3
- DKK-only platforms: single line with formatted DKK value
- Non-DKK platforms: primary line in native currency, secondary line below in smaller muted text with "≈" prefix showing DKK equivalent
- Values formatted using Danish locale conventions (period thousands separator, comma decimal)
- Support for sign prefixes (+/-) on gain/loss values
- Optional color coding: emerald for positive, rose for negative, neutral for plain values

## Shared Components Used
None — this story IS a shared component

## UI Specification

```tsx
/* === DKK-only (single line) === */
<div>
  <span className="font-mono-data">5.057,80 DKK</span>
</div>

/* === Non-DKK with DKK equivalent (dual line) === */
<div>
  <span className="font-mono-data">1.000,00 EUR</span>
  <p className="text-xs text-base-300 dark:text-base-500 mt-0.5 font-mono-data">
    ≈ 7.460,00 DKK
  </p>
</div>

/* === Non-DKK with colored value (positive gain) === */
<div>
  <span className="font-mono-data text-emerald-600 dark:text-emerald-400">
    +182,50 EUR
  </span>
  <p className="text-xs text-base-300 dark:text-base-500 mt-0.5 font-mono-data">
    ≈ +1.361,85 DKK
  </p>
</div>

/* === Non-DKK with colored value (negative loss) === */
<div>
  <span className="font-mono-data text-rose-600 dark:text-rose-400">
    -42,30 EUR
  </span>
  <p className="text-xs text-base-300 dark:text-base-500 mt-0.5 font-mono-data">
    ≈ -315,56 DKK
  </p>
</div>

/* === In table cells (compact, right-aligned) === */
<td className="px-4 py-3 text-right">
  <span className="font-mono-data text-sm">1.000,00 EUR</span>
  <p className="text-[11px] text-base-300 dark:text-base-500 font-mono-data">
    ≈ 7.460,00 DKK
  </p>
</td>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/portfolio-overview.html` L668 -- DKK platform: `842.391 DKK` (single line)
- `design-artifacts/prototypes/portfolio-overview.html` L708--711 -- EUR platform: `58.924 EUR` + `≈ 439.282 DKK` (two lines)

**Screenshots:**
- `design-artifacts/prototypes/screenshots/investment/overview-desktop-tables.png`

## Acceptance Criteria
- [ ] DKK values render as a single line with no secondary text
- [ ] Non-DKK values render with native currency on the primary line and "≈ X DKK" below
- [ ] Secondary DKK line uses text-xs text-base-300 with font-mono-data
- [ ] The "≈" prefix is present on the DKK equivalent line
- [ ] Values are formatted with Danish locale (period thousands, comma decimal)
- [ ] Positive gain values render in emerald-600 when `trend` is positive
- [ ] Negative loss values render in rose-600 when `trend` is negative
- [ ] Sign prefix (+/-) is shown when `showSign` prop is true
- [ ] Dark mode applies correct colors (emerald-400, rose-400, base-500 for secondary)
- [ ] Component works in both block and table cell contexts

## Technical Notes
- File to create: `src/components/shared/CurrencyDisplay.tsx`
- Props: `amount: number`, `currency: string`, `dkkEquivalent?: number`, `trend?: 'positive' | 'negative' | 'neutral'`, `showSign?: boolean`, `size?: 'sm' | 'md'`
- Use `formatCurrency` from US-011 for value formatting
- The DKK equivalent is computed outside this component (by the service layer using exchange rates)
- When `currency === 'DKK'`, the `dkkEquivalent` prop is ignored and no secondary line is shown
- Export as named export: `export { CurrencyDisplay }`
