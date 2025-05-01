"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { format, addDays, subDays, isToday, isSameDay } from "date-fns"

interface CalendarCarouselProps {
  onDateSelect: (date: Date) => void
  selectedDate: Date
}

export function CalendarCarousel({ onDateSelect, selectedDate }: CalendarCarouselProps) {
  const [dates, setDates] = useState<Date[]>([])
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    // Generate 7 days starting from current date
    const generateDates = () => {
      const newDates = Array.from({ length: 7 }, (_, i) => addDays(currentDate, i))
      setDates(newDates)
    }
    generateDates()
  }, [currentDate])

  const handlePrevWeek = () => {
    setCurrentDate(subDays(currentDate, 7))
  }

  const handleNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7))
  }

  const formatDayName = (date: Date) => {
    return format(date, "EEE")
  }

  const formatDayNumber = (date: Date) => {
    return format(date, "d")
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePrevWeek}
          className="rounded-full hover:bg-violet-50 dark:hover:bg-violet-900/50"
        >
          <ChevronLeft className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </Button>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          {format(currentDate, "MMM yyyy")}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextWeek}
          className="rounded-full hover:bg-violet-50 dark:hover:bg-violet-900/50"
        >
          <ChevronRight className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-2 px-2">
        {dates.map((date) => {
          const isSelected = isSameDay(date, selectedDate)
          const isCurrentDay = isToday(date)

          return (
            <button
              key={date.toString()}
              onClick={() => onDateSelect(date)}
              className={`flex flex-col items-center py-2 rounded-xl transition-all duration-300 ${
                isSelected
                  ? "bg-gradient-to-br from-violet-500 to-violet-600 text-white"
                  : isCurrentDay
                  ? "bg-violet-50 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400"
                  : "hover:bg-violet-50 dark:hover:bg-violet-900/50 text-gray-600 dark:text-gray-300"
              }`}
            >
              <span className="text-xs font-medium">{formatDayName(date)}</span>
              <span className="text-lg font-semibold mt-1">
                {formatDayNumber(date)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
} 