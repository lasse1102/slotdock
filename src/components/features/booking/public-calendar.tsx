"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isBefore,
  isAfter,
  addDays,
  startOfDay,
  format,
} from "date-fns";
import { de } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface PublicCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  maxAdvanceDays: number;
}

const DAY_HEADERS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export function PublicCalendar({
  selectedDate,
  onDateSelect,
  maxAdvanceDays,
}: PublicCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(startOfMonth(selectedDate));

  const today = startOfDay(new Date());
  const maxDate = addDays(today, maxAdvanceDays);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  // Build 6-week calendar grid starting on Monday
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const isDayDisabled = (day: Date) => {
    const dayStart = startOfDay(day);
    return isBefore(dayStart, today) || isAfter(dayStart, maxDate);
  };

  // Disable previous month nav if entire previous month is before today
  const prevMonthEnd = endOfMonth(subMonths(currentMonth, 1));
  const canGoPrev = !isBefore(prevMonthEnd, today);

  // Disable next month nav if entire next month is after maxDate
  const nextMonthStart = startOfMonth(addMonths(currentMonth, 1));
  const canGoNext = !isAfter(nextMonthStart, maxDate);

  return (
    <div className="w-full">
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePreviousMonth}
          disabled={!canGoPrev}
          aria-label="Vorheriger Monat"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold text-text">
          {format(currentMonth, "MMMM yyyy", { locale: de })}
        </span>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleNextMonth}
          disabled={!canGoNext}
          aria-label="Nächster Monat"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Day headers */}
      <div className="mb-1 grid grid-cols-7 gap-1">
        {DAY_HEADERS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-text-secondary"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          const disabled = isDayDisabled(day);

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled || !isCurrentMonth}
              onClick={() => onDateSelect(day)}
              className={cn(
                "flex h-10 sm:h-9 w-full items-center justify-center rounded-[6px] text-sm transition-colors duration-150",
                // Base state
                !isCurrentMonth && "invisible",
                isCurrentMonth && !disabled && "cursor-pointer hover:bg-primary-light",
                // Disabled
                disabled && isCurrentMonth && "cursor-not-allowed text-text-secondary opacity-40",
                // Today ring
                isToday && !isSelected && !disabled && "ring-1 ring-primary font-semibold",
                // Selected
                isSelected && !disabled && "bg-primary text-white font-semibold hover:bg-primary",
                // Normal enabled
                !isSelected && !disabled && isCurrentMonth && "text-text"
              )}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
}
