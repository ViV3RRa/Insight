# US-130: Add/Edit Vehicle Dialog

## Story
As the Insight platform user, I want a dialog to create and edit vehicles so that I can manage vehicle metadata and lifecycle.

## Dependencies
- US-028: Dialog Shell Component
- US-030: Form Input Components
- US-031: File Upload Component
- US-107: Vehicle TypeScript Types
- US-108: Vehicle Service

## Requirements
- Modal dialog for creating and editing vehicles (PRD §9.8)
- **Fields:**
  1. **Name** (text, required) — e.g. "Family Car"
  2. **Type** (select: Car, Motorcycle, etc.)
  3. **Make** (text) — e.g. "Toyota"
  4. **Model** (text) — e.g. "Corolla"
  5. **Year** (number) — model year
  6. **License plate** (text)
  7. **Fuel type** (select: Petrol, Diesel, Electric, Hybrid)
  8. **Purchase date** (date, optional)
  9. **Purchase price** (number, optional, DKK suffix)
  10. **Photo** (file, optional) — vehicle image
- **Edit mode** additional feature — "Mark as Sold" danger zone:
  - Expandable section with rose styling (same pattern as platform close)
  - When expanded: Sale date (required), Sale price (optional), Sale note (optional)
  - Confirm button to mark as sold
- For already-sold vehicles: show sale info and "Reactivate Vehicle" option
- Dialog width: `sm:max-w-lg` (wider than standard dialogs)

## Shared Components Used
- `DialogShell` (US-028) — props: { title, isOpen, onClose, maxWidth: "lg" }
- `TextInput`, `SelectInput`, `NumberInput`, `DateInput` (US-030)
- `FileUpload` (US-031) — for Photo
- `Button` (US-013)

## UI Specification

**Form layout (two columns on desktop for compactness):**
```
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <TextInput label="Name" required className="sm:col-span-2" />
  <SelectInput label="Type" options={["Car", "Motorcycle"]} />
  <SelectInput label="Fuel Type" options={["Petrol", "Diesel", "Electric", "Hybrid"]} />
  <TextInput label="Make" />
  <TextInput label="Model" />
  <NumberInput label="Year" />
  <TextInput label="License Plate" />
  <DateInput label="Purchase Date" optional />
  <NumberInput label="Purchase Price" optional suffix="DKK" />
</div>
<FileUpload label="Vehicle Photo" accept="image/*" />
```

**Mark as Sold (edit mode, active vehicles):**
```
<div className="mt-4 pt-4 border-t border-base-100 dark:border-base-700">
  <button className="px-3 py-1.5 text-xs font-medium text-rose-600 ...">Mark as Sold</button>
  {showSaleFields && (
    <div className="mt-3 p-3 rounded-lg bg-rose-50/50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800 space-y-3">
      <DateInput label="Sale Date" required />
      <NumberInput label="Sale Price" optional suffix="DKK" />
      <TextInput label="Sale Note" optional />
      <Button variant="destructive">Confirm Sale</Button>
    </div>
  )}
</div>
```

## Design Reference
**Prototype:** `design-artifacts/prototypes/vehicles-overview.html`
- Add Vehicle dialog: L520–610
- Fields: Photo + Name row, Type/Fuel Type selects, Make/Model/Year, License Plate, Purchase Details section: L530–602

**Prototype:** `design-artifacts/prototypes/vehicle-detail.html`
- Edit Vehicle dialog (pre-filled): L930–983
- "Mark as Sold" expandable danger section with sale date/price/note fields: L961–972
- Delete Vehicle button: L975

**Screenshots:** No vehicle screenshots captured yet. Reference the HTML prototypes directly.

## Acceptance Criteria
- [ ] Create mode: all fields empty, Photo optional
- [ ] Edit mode: pre-filled with current vehicle values
- [ ] Name is required
- [ ] Photo upload with preview
- [ ] "Mark as Sold" danger section in edit mode (active vehicles)
- [ ] Sale date required when marking as sold
- [ ] Already-sold vehicles show sale info and "Reactivate" option
- [ ] Save calls vehicleService.create() / update()
- [ ] Mark as sold calls vehicleService.markAsSold()
- [ ] Dialog uses sm:max-w-lg (wider)
- [ ] Desktop: centered modal. Mobile: bottom sheet.
- [ ] PRD §9.8: Vehicle dialog fields match spec
- [ ] PRD §14 criteria 27-28: Vehicle CRUD and marking as sold

## Technical Notes
- File: `src/components/vehicles/dialogs/VehicleDialog.tsx`
- Props: `{ isOpen: boolean; onClose: () => void; vehicle?: Vehicle }`
- Use `useMutation` for create/update/markAsSold/reactivate; on success: `queryClient.invalidateQueries({ queryKey: ['vehicles'] })`, show toast, close dialog
- Photo via FormData for PocketBase file upload
