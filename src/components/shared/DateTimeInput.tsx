import { useRef, useEffect, useState } from 'react'

interface DateTimeInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
}

function getTodayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function DateTimeInput({ id, value, onChange }: DateTimeInputProps) {
  const prevDateRef = useRef(value.split('T')[0])
  const [hint, setHint] = useState<string | null>(null)
  const hintTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    prevDateRef.current = value.split('T')[0]
  }, [value])

  useEffect(() => {
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    const newDate = newValue.split('T')[0]
    const oldDate = prevDateRef.current

    if (newDate !== oldDate) {
      prevDateRef.current = newDate
      const today = getTodayString()
      let adjusted: string
      let hintText: string
      if (newDate === today) {
        const now = new Date()
        const h = String(now.getHours()).padStart(2, '0')
        const min = String(now.getMinutes()).padStart(2, '0')
        adjusted = `${newDate}T${h}:${min}`
        hintText = `Time set to ${h}:${min}`
      } else {
        adjusted = `${newDate}T00:00`
        hintText = 'Time set to 00:00'
      }
      onChange(adjusted)

      // Show brief hint that the time was auto-adjusted
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current)
      setHint(hintText)
      hintTimerRef.current = setTimeout(() => setHint(null), 2500)
    } else {
      onChange(newValue)
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        type="datetime-local"
        value={value}
        onChange={handleChange}
        className="w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-base-900 text-sm text-base-900 dark:text-white border-base-200 dark:border-base-600 focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 dark:focus:ring-accent-400/30 dark:focus:border-accent-400 outline-none transition-colors duration-150"
      />
      {hint && (
        <span className="absolute -bottom-5 left-0 text-[11px] text-accent-600 dark:text-accent-400 animate-pulse">
          {hint}
        </span>
      )}
    </div>
  )
}

export { DateTimeInput }
