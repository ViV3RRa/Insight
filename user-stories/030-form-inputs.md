# US-030: FormField Wrapper and Input Components

## Story
As the Insight platform user, I want consistent, well-labeled form inputs across all dialogs so that data entry is fast, clear, and error-free.

## Dependencies
- US-002: Tailwind Configuration and Design Tokens

## Requirements
- Create a `FormField` wrapper component and individual input components
- **FormField**: Wraps any input with a label, optional required asterisk, and error message slot
- **TextInput**: Standard text input
- **NumberInput**: Numeric input with font-mono-data for value display
- **SelectInput**: Dropdown select using the form-select CSS class from US-002
- **TextareaInput**: Multi-line text input
- All inputs share the same visual style: border, rounded-lg, consistent padding, focus ring
- Error state: rose border + error icon + error message below
- Inputs work in both Dialog body (space-y-4) and standalone form contexts

## Shared Components Used
None — this story IS a shared component

## UI Specification

```tsx
/* === FormField wrapper === */
<div className="space-y-1">
  {/* Label */}
  <label className="block text-xs font-medium text-base-500 dark:text-base-400">
    Amount
    {/* Required asterisk (optional) */}
    <span className="text-rose-500 ml-0.5">*</span>
  </label>

  {/* Input slot (children) */}
  {children}

  {/* Error message (conditional) */}
  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
    <svg className="w-3 h-3 flex-shrink-0">{/* AlertCircle icon */}</svg>
    Amount is required
  </p>
</div>

/* === TextInput === */
<input
  type="text"
  className="
    w-full px-3 py-2.5
    border border-base-200 dark:border-base-600
    rounded-lg
    bg-white dark:bg-base-900
    text-sm text-base-900 dark:text-white
    placeholder:text-base-300 dark:placeholder:text-base-500
    focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500
    dark:focus:ring-accent-400/30 dark:focus:border-accent-400
    transition-colors duration-150
    outline-none
  "
  placeholder="Enter value..."
/>

/* === NumberInput === */
<input
  type="number"
  className="
    w-full px-3 py-2.5
    border border-base-200 dark:border-base-600
    rounded-lg
    bg-white dark:bg-base-900
    text-sm font-mono-data text-base-900 dark:text-white
    placeholder:text-base-300 dark:placeholder:text-base-500
    focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500
    dark:focus:ring-accent-400/30 dark:focus:border-accent-400
    transition-colors duration-150
    outline-none
  "
  placeholder="0,00"
/>

/* === SelectInput === */
<select
  className="
    form-select
    w-full px-3 py-2.5
    border border-base-200 dark:border-base-600
    rounded-lg
    bg-white dark:bg-base-900
    text-sm text-base-900 dark:text-white
    focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500
    dark:focus:ring-accent-400/30 dark:focus:border-accent-400
    transition-colors duration-150
    outline-none
    appearance-none
  "
>
  <option value="">Select platform...</option>
  <option value="nordnet">Nordnet</option>
  <option value="ib">Interactive Brokers</option>
</select>

/* === TextareaInput === */
<textarea
  className="
    w-full px-3 py-2.5
    border border-base-200 dark:border-base-600
    rounded-lg
    bg-white dark:bg-base-900
    text-sm text-base-900 dark:text-white
    placeholder:text-base-300 dark:placeholder:text-base-500
    focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500
    dark:focus:ring-accent-400/30 dark:focus:border-accent-400
    transition-colors duration-150
    outline-none
    resize-none
  "
  rows={3}
  placeholder="Optional note..."
/>

/* === Error state (any input) === */
<input
  className="
    w-full px-3 py-2.5
    border border-rose-400 dark:border-rose-500
    rounded-lg
    bg-white dark:bg-base-900
    text-sm text-base-900 dark:text-white
    focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500
    outline-none
  "
/>

/* === Full FormField example === */
<div className="space-y-1">
  <label className="block text-xs font-medium text-base-500 dark:text-base-400">
    Value <span className="text-rose-500 ml-0.5">*</span>
  </label>
  <input
    type="number"
    className="w-full px-3 py-2.5 border border-rose-400 rounded-lg bg-white text-sm font-mono-data focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 outline-none"
  />
  <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
    <svg className="w-3 h-3 flex-shrink-0">{/* AlertCircle */}</svg>
    Value must be a positive number
  </p>
</div>
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/ui-states.html` L258--295 -- Form validation states (valid inputs, error with rose border + message)
- `design-artifacts/prototypes/home-overview.html` L441--468 -- Dialog form fields (select, number, datetime-local, text, file upload)
- `design-artifacts/prototypes/portfolio-overview.html` L1247--1284 -- Data Point dialog fields (select with optgroups, number with suffix, datetime-local)
- `design-artifacts/prototypes/portfolio-overview.html` L1318--1370 -- Transaction dialog fields (radio buttons for type, amount with currency suffix, exchange rate)

## Acceptance Criteria
- [ ] FormField renders label as text-xs font-medium text-base-500
- [ ] Required asterisk renders as text-rose-500 when `required` prop is true
- [ ] Error message renders as text-xs text-rose-500 with AlertCircle icon
- [ ] All inputs use px-3 py-2.5 border border-base-200 rounded-lg bg-white text-sm
- [ ] All inputs show focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500
- [ ] Error state changes border to border-rose-400 and focus ring to rose
- [ ] NumberInput uses font-mono-data for tabular number display
- [ ] SelectInput uses form-select class for custom arrow (from US-002)
- [ ] TextareaInput uses resize-none and configurable rows
- [ ] Dark mode: bg-base-900, border-base-600, text-white, placeholder:text-base-500
- [ ] All inputs forward standard HTML input attributes (name, value, onChange, etc.)

## Technical Notes
- Files to create: `src/components/shared/FormField.tsx`, `src/components/shared/inputs/TextInput.tsx`, `src/components/shared/inputs/NumberInput.tsx`, `src/components/shared/inputs/SelectInput.tsx`, `src/components/shared/inputs/TextareaInput.tsx`, `src/components/shared/inputs/index.ts` (barrel export)
- FormField Props: `label: string`, `required?: boolean`, `error?: string`, `children: ReactNode`, `htmlFor?: string`
- Input Props: extend standard HTML input attributes + `error?: boolean` (for border state)
- The `form-select` class provides a custom dropdown arrow defined in US-002's global CSS
- Consider using `React.forwardRef` for all inputs to support form library integration
- Export all as named exports from respective files
