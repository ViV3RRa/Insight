import { Button } from '@/components/shared/Button'

interface HomeQuickActionsProps {
  onAddReading: () => void
  onAddBill: () => void
}

function HomeQuickActionsDesktop({ onAddReading, onAddBill }: HomeQuickActionsProps) {
  return (
    <div className="hidden lg:flex items-center gap-2" data-testid="quick-actions-desktop">
      <Button variant="secondary" onClick={onAddBill}>
        + Add Bill
      </Button>
      <Button variant="primary" onClick={onAddReading}>
        + Add Reading
      </Button>
    </div>
  )
}

function HomeQuickActionsMobile({ onAddReading, onAddBill }: HomeQuickActionsProps) {
  return (
    <div className="flex gap-2 mb-4 lg:hidden" data-testid="quick-actions-mobile">
      <Button variant="secondary" fullWidth onClick={onAddBill}>
        + Add Bill
      </Button>
      <Button variant="primary" fullWidth onClick={onAddReading}>
        + Add Reading
      </Button>
    </div>
  )
}

export { HomeQuickActionsDesktop, HomeQuickActionsMobile }
export type { HomeQuickActionsProps }
