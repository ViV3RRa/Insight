# US-117: Vehicles Overview — Sold Vehicle Cards

## Story
As the Insight platform user, I want sold vehicles displayed with muted styling and total cost of ownership so that I can still access their historical data while clearly seeing they're no longer active.

## Dependencies
- US-116: Vehicles Overview — Active Vehicle Cards
- US-023: CollapsibleSection (Accordion) Component
- US-108: Vehicle Service
- US-113: Vehicle Cost Calculations

## Requirements
- Sold vehicles in a collapsible section below active cards (PRD §7.4 item 2)
- Same card structure as active cards but visually muted (`opacity-60 hover:opacity-90`)
- "Sold" badge at top-left of photo area
- Different gradient: grayscale (`from-base-100 to-base-150 dark:from-base-800 dark:to-base-750`)
- Card metrics for sold vehicles:
  - Total cost of ownership (fuel + maintenance lifetime)
  - Sale date
- Footer: 2-column layout (Total Cost of Ownership, Sale Date)
- Clickable → vehicle detail page (historical view)

## Shared Components Used
- `CollapsibleSection` (US-023) — props: { title: "Sold Vehicles", count: soldVehicles.length, defaultExpanded: false }

## UI Specification

**Sold vehicles section:**
```
{soldVehicles.length > 0 && (
  <CollapsibleSection title="Sold Vehicles" count={soldVehicles.length} defaultExpanded={false}>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
      {soldVehicles.map(v => <SoldVehicleCard key={v.id} vehicle={v} />)}
    </div>
  </CollapsibleSection>
)}
```

**Sold card modifications (from ui-analysis §2.5):**
```
<a className="... opacity-60 hover:opacity-90 transition-all">
  <div className="relative h-40 bg-gradient-to-br from-base-100 to-base-150 dark:from-base-800 dark:to-base-750 ...">
    {/* "Sold" badge top-left */}
    <span className="absolute top-3 left-3 px-2 py-0.5 text-xs font-medium bg-base-200 dark:bg-base-600 text-base-500 dark:text-base-400 rounded-md">
      Sold
    </span>
    {/* Vehicle silhouette in grayscale */}
  </div>
  <div className="p-5">
    <div className="text-sm font-semibold">{vehicle.name}</div>
    <div className="text-xs text-base-400">{vehicle.make} {vehicle.model} · {vehicle.year}</div>
    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-base-100 dark:border-base-700">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-base-300">Total Cost</div>
        <div className="font-mono-data text-sm font-medium">{formattedTotalCost}</div>
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-base-300">Sale Date</div>
        <div className="text-sm text-base-400">{formattedSaleDate}</div>
      </div>
    </div>
  </div>
</a>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicles-overview.html`
- Sold vehicles collapsible accordion toggle: L228–236
- Sold vehicles content container: L237–287
- Tesla Model 3 sold card (muted opacity, grayscale gradient, "Sold" badge top-left, "Electric" badge top-right): L240–284
- Sold card body with all-time efficiency, total km, lifetime cost: L253–283

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototype directly.

## Acceptance Criteria
- [ ] Sold vehicles in collapsible section, collapsed by default
- [ ] Cards use muted opacity (0.6, hover 0.9)
- [ ] "Sold" badge visible at top-left
- [ ] Grayscale gradient background
- [ ] Shows total cost of ownership
- [ ] Shows sale date
- [ ] Clickable → vehicle detail page
- [ ] Only rendered if sold vehicles exist
- [ ] PRD §7.4 item 2: Sold vehicles muted with required metrics
- [ ] PRD §14 criterion 29: Sold vehicles muted with total cost of ownership

## Technical Notes
- File: `src/components/vehicles/SoldVehicleCard.tsx`
- Data from `calculateTotalCostOfOwnership()` (US-113)
- Sale date formatted as human-readable date (e.g. "Mar 15, 2025")
