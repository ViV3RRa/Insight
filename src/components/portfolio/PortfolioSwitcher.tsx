import { useState, useRef, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Check, ChevronDown, Pencil, Plus } from 'lucide-react'
import { getAll, getDefault } from '@/services/portfolios'
import { useInvestmentUIStore } from '@/stores/investmentUIStore'
import type { Portfolio } from '@/types/investment'

interface PortfolioSwitcherProps {
  onEditPortfolio?: (id: string) => void
  onAddPortfolio?: () => void
}

export function PortfolioSwitcher({ onEditPortfolio, onAddPortfolio }: PortfolioSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selectedPortfolioId = useInvestmentUIStore((s) => s.selectedPortfolioId)
  const setSelectedPortfolioId = useInvestmentUIStore((s) => s.setSelectedPortfolioId)

  const { data: portfolios, isLoading } = useQuery({
    queryKey: ['portfolios'],
    queryFn: getAll,
  })

  // Auto-select default portfolio on mount when none is selected
  useEffect(() => {
    if (selectedPortfolioId !== null) return
    if (!portfolios || portfolios.length === 0) return

    const defaultPortfolio = portfolios.find((p) => p.isDefault)
    if (defaultPortfolio) {
      setSelectedPortfolioId(defaultPortfolio.id)
    } else {
      // Fallback to getDefault service call
      getDefault()
        .then((p) => setSelectedPortfolioId(p.id))
        .catch(() => {
          // If getDefault fails, select first portfolio
          if (portfolios.length > 0) {
            setSelectedPortfolioId(portfolios[0]!.id)
          }
        })
    }
  }, [portfolios, selectedPortfolioId, setSelectedPortfolioId])

  const activePortfolio = portfolios?.find((p) => p.id === selectedPortfolioId)

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSelect = useCallback(
    (portfolio: Portfolio) => {
      setSelectedPortfolioId(portfolio.id)
      setIsOpen(false)
    },
    [setSelectedPortfolioId],
  )

  const handleEdit = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.stopPropagation()
      onEditPortfolio?.(id)
    },
    [onEditPortfolio],
  )

  const handleAdd = useCallback(() => {
    setIsOpen(false)
    onAddPortfolio?.()
  }, [onAddPortfolio])

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 text-sm text-base-400 dark:text-base-500">
        Loading...
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-base-800 border border-base-200 dark:border-base-600 rounded-lg text-sm font-medium shadow-sm hover:border-base-300 dark:hover:border-base-500"
      >
        {activePortfolio ? (
          <>
            {activePortfolio.name}
            <span className="font-normal text-base-400"> · {activePortfolio.ownerName}</span>
          </>
        ) : (
          <span className="text-base-400">Select...</span>
        )}
        <ChevronDown
          className="w-3.5 h-3.5 text-base-400 transition-transform"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {isOpen && portfolios && (
        <>
          {/* Desktop dropdown */}
          <div className="hidden lg:block absolute top-full left-0 mt-1.5 w-64 bg-white dark:bg-base-800 border border-base-200 dark:border-base-600 rounded-xl shadow-lg z-40 py-1.5">
            {portfolios.map((portfolio) => {
              const isActive = portfolio.id === selectedPortfolioId
              return isActive ? (
                <div
                  key={portfolio.id}
                  className="px-3 py-2 flex items-center justify-between bg-accent-50/50 dark:bg-accent-900/20"
                >
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-accent-600 dark:text-accent-400" />
                    <span className="text-sm font-medium">
                      {portfolio.name}
                      <span className="text-xs font-normal text-base-400">
                        {' '}· {portfolio.ownerName}
                      </span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleEdit(e, portfolio.id)}
                    className="p-1 text-base-400 hover:text-base-600 dark:hover:text-base-300"
                    aria-label={`Edit ${portfolio.name}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  key={portfolio.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelect(portfolio)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelect(portfolio)
                    }
                  }}
                  className="px-3 py-2 flex items-center justify-between hover:bg-base-50 dark:hover:bg-base-700/50 cursor-pointer"
                >
                  <span className="text-sm">
                    {portfolio.name}
                    <span className="text-xs text-base-400"> · {portfolio.ownerName}</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => handleEdit(e, portfolio.id)}
                    className="p-1 text-base-400 hover:text-base-600 dark:hover:text-base-300"
                    aria-label={`Edit ${portfolio.name}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
            <div className="border-t border-base-100 dark:border-base-700 mt-1.5 pt-1.5">
              <button
                type="button"
                onClick={handleAdd}
                className="w-full px-3 py-2 flex items-center gap-2 text-sm text-base-400 hover:text-base-600 dark:hover:text-base-300"
              >
                <Plus className="w-3.5 h-3.5" /> Add Portfolio
              </button>
            </div>
          </div>

          {/* Mobile dropdown */}
          <div className="lg:hidden absolute left-0 right-0 top-full bg-white dark:bg-base-800 border-t border-base-150 dark:border-base-700 shadow-lg z-40">
            {portfolios.map((portfolio) => {
              const isActive = portfolio.id === selectedPortfolioId
              return isActive ? (
                <div
                  key={portfolio.id}
                  className="flex items-center gap-3 px-4 py-2.5 bg-accent-50/50 dark:bg-accent-900/15 border-l-2 border-accent-600 dark:border-accent-400"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">
                      {portfolio.name}
                      <span className="text-xs font-normal text-base-400">
                        {' '}· {portfolio.ownerName}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleEdit(e, portfolio.id)}
                    className="p-1.5 text-base-400 dark:hover:text-base-300"
                    aria-label={`Edit ${portfolio.name}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div
                  key={portfolio.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelect(portfolio)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleSelect(portfolio)
                    }
                  }}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-base-50 dark:hover:bg-base-700/50 cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <span className="text-sm">
                      {portfolio.name}
                      <span className="text-xs text-base-400"> · {portfolio.ownerName}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleEdit(e, portfolio.id)}
                    className="p-1.5 text-base-400 dark:hover:text-base-300"
                    aria-label={`Edit ${portfolio.name}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
            <div className="border-t border-base-100 dark:border-base-700 mt-1 pt-1">
              <button
                type="button"
                onClick={handleAdd}
                className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-base-400 hover:text-base-600 dark:hover:text-base-300"
              >
                <Plus className="w-3.5 h-3.5" /> Add Portfolio
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
