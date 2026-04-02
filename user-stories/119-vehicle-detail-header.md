# US-119: Vehicle Detail — Header + Metadata

## Story
As the Insight platform user, I want a vehicle detail page header showing the vehicle photo, metadata, and key information so that I can see the full context of the vehicle at a glance.

## Dependencies
- US-115: Fuel Type Badge Component
- US-032: DropdownSwitcher Component
- US-108: Vehicle Service

## Requirements
- Vehicle detail page header (PRD §7.5)
- **Switcher bar:** Back button + DropdownSwitcher showing vehicle name, "Vehicles" subtitle
- **Vehicle header card** with side-by-side layout (from ui-analysis §2.6):
  - Left: vehicle photo area (`h-36 sm:w-48 lg:w-56`)
  - Right: name, make/model/year subtitle, metadata chips
- **Metadata chips:**
  - License plate (generic chip: `bg-base-100 dark:bg-base-700`)
  - Fuel type (colored badge via FuelTypeBadge)
  - Status (active: accent with dot, sold: muted)
  - For sold vehicles: sale date, sale price, sale note displayed prominently
- Desktop action buttons: "+ Add Refueling" (secondary), "+ Add Maintenance" (primary)
- Mobile: full-width action buttons below header

## Shared Components Used
- `DropdownSwitcher` (US-032) — vehicle switcher
- `FuelTypeBadge` (US-115) — in metadata chips
- `Button` (US-013) — action buttons

## UI Specification

**Vehicle header card (from ui-analysis §2.6):**
```
<div className="bg-white dark:bg-base-800 rounded-2xl shadow-card dark:shadow-card-dark overflow-hidden mb-6 lg:mb-8">
  <div className="flex flex-col sm:flex-row">
    {/* Photo area */}
    <div className="h-36 sm:w-48 lg:w-56 flex-shrink-0 bg-gradient-to-br ${vehicleGradient} flex items-center justify-center">
      {vehicle.photo ? <img src={photoUrl} className="w-full h-full object-cover" /> : <VehicleSilhouette />}
    </div>
    {/* Content */}
    <div className="p-5 flex-1">
      <h2 className="text-lg font-bold">{vehicle.name}</h2>
      <p className="text-sm text-base-400">{vehicle.make} {vehicle.model} · {vehicle.year}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        <span className="px-2.5 py-1 text-xs bg-base-100 dark:bg-base-700 rounded-lg">{vehicle.licensePlate}</span>
        <FuelTypeBadge fuelType={vehicle.fuelType} />
        <span className="px-2.5 py-1 text-xs bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 rounded-lg flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-500" /> Active
        </span>
      </div>
      {vehicle.status === 'sold' && (
        <div className="mt-3 text-sm text-base-400">
          Sold {formattedSaleDate} · {formattedSalePrice} · {vehicle.saleNote}
        </div>
      )}
    </div>
  </div>
</div>
```

**Vehicle switcher dropdown:** Lists all vehicles with sold section, "Vehicles Overview" link at top.

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicle-detail.html`
- Vehicle header card (photo + metadata side-by-side): L216–259
- Photo placeholder with gradient: L220–223
- Name, make/model/year: L228–231
- Metadata chips (license plate, fuel type, vehicle type, status): L239–256
- Desktop action buttons (Edit, + Add Refueling, + Add Maintenance): L199–207
- Mobile action buttons: L210–214

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototype directly.

## Acceptance Criteria
- [ ] Switcher bar with back button and vehicle name
- [ ] Vehicle header card shows photo (or placeholder) and metadata
- [ ] Side-by-side layout on sm+, stacked on mobile
- [ ] Metadata chips: license plate, fuel type badge, status
- [ ] Sold vehicles show sale date, price, and note
- [ ] Action buttons in header (desktop) and full-width (mobile)
- [ ] Vehicle switcher allows direct navigation between vehicles
- [ ] PRD §7.5: Vehicle detail header with photo, name, metadata
- [ ] All tests pass and meet coverage target
- [ ] Component renders correctly with mocked vehicle data

## Testing Requirements
- **Test file**: `src/components/vehicles/VehicleDetailHeader.test.tsx` (co-located)
- **Approach**: React Testing Library with `renderWithProviders`, mocked data via MSW
- **Coverage target**: 80%+ line coverage
- Test vehicle name and make/model/year subtitle render correctly
- Test photo area shows vehicle photo when available, placeholder silhouette when not
- Test FuelTypeBadge renders with correct fuel type
- Test metadata chips: license plate, fuel type badge, status indicator
- Test sold vehicle shows sale date, price, and note
- Test active vehicle shows green "Active" status with dot indicator
- Test action buttons render ("+ Add Refueling", "+ Add Maintenance")
- Test side-by-side layout on sm+ (flex-row) and stacked on mobile (flex-col)

## Technical Notes
- File: `src/components/vehicles/VehicleDetail.tsx` (header section)
- Photo URL via `vehicleService.getVehiclePhotoUrl(vehicle)`
- Vehicle switcher items from `vehicleService.getAll()`, grouped into active and sold sections
