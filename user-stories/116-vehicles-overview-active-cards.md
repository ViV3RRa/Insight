# US-116: Vehicles Overview — Active Vehicle Cards

## Story
As the Insight platform user, I want cards for each active vehicle on the Vehicles overview showing key metrics so that I can see fuel efficiency, costs, and trends at a glance.

## Dependencies
- US-115: Fuel Type Badge Component
- US-015: ChangeIndicator Component
- US-108: Vehicle Service
- US-111: Fuel Efficiency Calculation
- US-113: Vehicle Cost Calculations

## Requirements
- One card per active vehicle (PRD §7.4 item 1)
- Each card shows:
  - Vehicle photo placeholder area (gradient background with vehicle silhouette SVG)
  - Fuel type badge (absolute top-right)
  - Hover chevron overlay
  - Name, make/model/year subtitle
  - Metrics grid:
    - **Efficiency**: current year weighted average (km/l or km/kWh based on fuelType)
    - **YTD Fuel Cost**: year-to-date fuel cost (DKK)
  - Change indicator (efficiency vs prior year)
  - Footer stats:
    - **YTD Total Cost**: fuel + maintenance combined
    - **YTD km**: distance driven this year
    - **Updated**: date of most recent refueling
- Card is clickable → navigates to vehicle detail page
- Grid: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4`

## Shared Components Used
- `FuelTypeBadge` (US-115) — positioned absolute top-right of photo area
- `ChangeIndicator` (US-015) — for efficiency change vs prior year

## UI Specification

**Card container (from ui-analysis §2.5):**
```
<a href={`/vehicles/${vehicle.id}`}
   className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden
              block hover:shadow-lg transition-shadow cursor-pointer group">
```

**Photo area:**
```
<div className={`relative h-40 ${vehicleGradient(vehicle.type)} flex items-center justify-center overflow-hidden`}>
  {vehicle.photo ? (
    <img src={photoUrl} className="w-full h-full object-cover" />
  ) : (
    <VehicleSilhouette type={vehicle.type} className="w-24 h-24 stroke-width-[0.8]" />
  )}
  <FuelTypeBadge fuelType={vehicle.fuelType} className="absolute top-3 right-3" />
  {/* Hover chevron */}
  <div className="absolute inset-0 flex items-center justify-end pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
    <ChevronRight className="w-6 h-6 text-white/80" />
  </div>
</div>
```

**Vehicle gradient colors (from ui-analysis §1.4):**
- Car: `from-sky-50 to-blue-100 dark:from-sky-950/60 dark:to-blue-900/40`
- Motorcycle: `from-slate-100 to-slate-200 dark:from-slate-800/60 dark:to-slate-700/40`

**Card body:**
```
<div className="p-5">
  <div className="text-sm font-semibold">{vehicle.name}</div>
  <div className="text-xs text-base-400">{vehicle.make} {vehicle.model} · {vehicle.year}</div>
  {/* Metrics grid similar to utility cards */}
  {/* Footer stats */}
</div>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicles-overview.html`
- Active vehicle cards grid: L109–225
- Family Car card (petrol, car silhouette, metrics, footer stats): L112–168
- Work Bike card (petrol, motorcycle silhouette): L170–223
- Photo placeholder with gradient + fuel type badge + hover chevron: L114–125
- Card body with name, make/model/year, metrics grid, change indicator, footer stats: L127–167

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototype directly.

## Acceptance Criteria
- [ ] One card per active vehicle
- [ ] Photo area shows vehicle photo or placeholder silhouette with gradient
- [ ] Fuel type badge positioned top-right
- [ ] Card shows name, make/model/year
- [ ] Current year efficiency displayed with correct unit (km/l or km/kWh)
- [ ] YTD fuel cost displayed in DKK
- [ ] Change indicator shows efficiency trend vs prior year
- [ ] Footer shows YTD Total Cost, YTD km, Updated date
- [ ] Card clickable → navigates to vehicle detail
- [ ] Grid: 1 col mobile, 2 sm, 3 lg
- [ ] Hover effect: shadow-lg + chevron overlay
- [ ] PRD §7.4 item 1: Active vehicle cards with required metrics
- [ ] All tests pass and meet coverage target
- [ ] Component renders correctly with mocked vehicle data

## Testing Requirements
- **Test file**: `src/components/vehicles/VehicleCard.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked data via MSW
- **Coverage target**: 80%+ line coverage
- Test one card rendered per active vehicle
- Test card displays vehicle name, make/model/year
- Test current year efficiency displayed with correct unit (km/l or km/kWh based on fuelType)
- Test YTD fuel cost displayed in DKK
- Test footer stats (YTD Total Cost, YTD km, Updated date) render
- Test FuelTypeBadge is present with correct fuel type
- Test card is clickable and links to correct vehicle detail route
- Test placeholder silhouette shown when no photo
- Test loading and empty states

## Technical Notes
- File: `src/components/vehicles/VehicleCard.tsx`
- Vehicle silhouette: inline SVG based on vehicle type (car vs motorcycle)
- Data from `calculateVehicleMetrics()` (US-113)
- Efficiency unit derived from `vehicle.fuelType`
- Updated date: most recent refueling date, formatted as "MMM DD"
