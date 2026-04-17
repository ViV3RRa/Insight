import { useRef, useEffect } from 'react'

interface DateTimeInputProps {
  id?: string
  value: string // "YYYY-MM-DDTHH:MM" format
  onChange: (value: string) => void
}

function getTodayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function getCurrentTime(): string {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const inputClass =
  'w-full px-3 py-2.5 border rounded-lg bg-white dark:bg-base-900 text-sm text-base-900 dark:text-white border-base-200 dark:border-base-600 focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 dark:focus:ring-accent-400/30 dark:focus:border-accent-400 outline-none transition-colors duration-150'

function DateTimeInput({ id, value, onChange }: DateTimeInputProps) {
  const [datePart = '', timePart = '00:00'] = value.split('T')
  const prevDateRef = useRef(datePart)
  const timeTouchedRef = useRef(false)

  useEffect(() => {
    prevDateRef.current = datePart
  }, [datePart])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value
    const oldDate = prevDateRef.current

    if (newDate !== oldDate) {
      prevDateRef.current = newDate
      if (timeTouchedRef.current) {
        // User manually set the time — keep it
        onChange(`${newDate}T${timePart}`)
      } else {
        const newTime = newDate === getTodayString() ? getCurrentTime() : '00:00'
        onChange(`${newDate}T${newTime}`)
      }
    }
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    timeTouchedRef.current = true
    onChange(`${datePart}T${e.target.value}`)
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      <input
        id={id}
        type="date"
        value={datePart}
        onChange={handleDateChange}
        className={inputClass}
      />
      <input
        type="time"
        value={timePart}
        onChange={handleTimeChange}
        className={inputClass}
      />
    </div>
  )
}

export { DateTimeInput }
