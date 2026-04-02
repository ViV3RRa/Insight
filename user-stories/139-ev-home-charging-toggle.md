# US-139: EV Home-Charging Toggle on Electricity Utility

## Story
As the Insight platform user, I want a toggle on my electricity utility detail page to exclude home-charging kWh from consumption so that I can see true household electricity usage when vehicle charging is reimbursed.

## Dependencies
- US-114: EV Home-Charging Crossover Logic
- US-101: Utility Detail — Page Assembly

## Requirements
- Toggle on the electricity utility detail page (PRD §7.3)
- When toggle is ON: home-charging kWh subtracted from consumption views
- When toggle is OFF: consumption shown as-is (includes home charging)
- Show total home-charging kWh as a supplementary metric regardless of toggle state
- Toggle only appears when:
  - The utility is identified as electricity (icon="bolt" or similar heuristic)
  - There exists at least one EV refueling with `chargedAtHome=true`

## Shared Components Used
- Uses existing utility detail components, adds toggle control

## UI Specification

**Toggle placement:** In the chart card header area, next to other controls:
```
{hasEvChargingData && (
  <label className="flex items-center gap-1.5 text-xs text-base-400 cursor-pointer">
    <input type="checkbox" checked={excludeEvCharging} onChange={...}
           className="rounded border-base-300 text-accent-600 focus:ring-accent-500/30" />
    Exclude EV charging
  </label>
)}
```

**Supplementary metric:** Below stat cards or in a small info card:
```
{totalHomeChargingKwh > 0 && (
  <div className="text-xs text-base-400 flex items-center gap-1.5">
    <Zap className="w-3.5 h-3.5" />
    {formattedKwh} kWh used for EV home charging (YTD)
  </div>
)}
```

## Design Reference
**Prototype:**
- `design-artifacts/prototypes/utility-detail.html` — Electricity detail page (toggle not yet present in prototype; implement per UI Specification above)
- `design-artifacts/prototypes/vehicle-detail.html` — EV refueling entries with `chargedAtHome` flag context

## Acceptance Criteria
- [ ] Toggle visible on electricity utility detail when EV charging data exists
- [ ] Toggle OFF by default (full consumption shown)
- [ ] Toggle ON: home-charging kWh subtracted from consumption views
- [ ] Chart updates when toggle changes
- [ ] Stat cards update when toggle changes
- [ ] Total home-charging kWh shown as supplementary info
- [ ] Toggle hidden when no EV charging data exists
- [ ] Toggle hidden on non-electricity utilities
- [ ] Adjusted consumption never goes negative
- [ ] PRD §7.3: EV home-charging crossover
- [ ] PRD §14 criterion 49: EV home-charging kWh excludable from electricity
- [ ] All tests pass and meet coverage target
- [ ] Integration tests verify toggle behavior on electricity utility detail

## Testing Requirements
- **Test file**: `src/test/integration/ev-home-charging-toggle.test.tsx`
- **Approach**: Integration tests verifying cross-component behavior
- Test toggle only appears on electricity utility detail page (not on water, heat, etc.)
- Test toggle only appears when EV charging data exists (at least one refueling with `chargedAtHome=true`)
- Test toggle ON: home-charging kWh subtracted from consumption in chart and stat cards
- Test toggle OFF: full consumption shown (includes home-charging kWh)
- Test total home-charging kWh displayed as supplementary metric regardless of toggle state
- Test adjusted consumption never goes negative (clamp to zero)
- Test toggle is hidden when no EV charging data exists
- Test chart and stat cards update reactively when toggle changes

## Technical Notes
- Integrated into `src/components/home/UtilityDetail.tsx`
- Uses `adjustConsumptionForEvCharging()` from US-114
- Electricity utility identification: check `utility.icon === 'bolt'` or `utility.name.toLowerCase().includes('electric')`
- Toggle state: local component state (or persisted in settings as extension)
