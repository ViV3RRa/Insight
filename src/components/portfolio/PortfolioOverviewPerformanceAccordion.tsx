import type { ReactNode } from 'react'
import { BarChart3 } from 'lucide-react'
import { CollapsibleSection } from '@/components/shared/CollapsibleSection'

interface PortfolioOverviewPerformanceAccordionProps {
  children: ReactNode
}

export function PortfolioOverviewPerformanceAccordion({
  children,
}: PortfolioOverviewPerformanceAccordionProps) {
  return (
    <CollapsibleSection
      title="Performance Charts & Analysis"
      icon={BarChart3}
      defaultExpanded={false}
    >
      <div className="p-4 sm:p-6 space-y-6">
        {children}
      </div>
    </CollapsibleSection>
  )
}
