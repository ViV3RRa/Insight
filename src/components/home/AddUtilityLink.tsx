import { Plus } from 'lucide-react'

interface AddUtilityLinkProps {
  onAdd: () => void
}

function AddUtilityLink({ onAdd }: AddUtilityLinkProps) {
  return (
    <button
      onClick={onAdd}
      className="w-full py-3 text-sm font-medium text-base-400 hover:text-base-600 dark:hover:text-base-300 transition-colors flex items-center justify-center gap-1.5 mt-2 mb-2"
    >
      <Plus className="w-4 h-4" />
      Add Utility
    </button>
  )
}

export { AddUtilityLink }
