import React, { Fragment, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const weekdayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const buildWeeks = (year: number, month: number) => {
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weeks: (number | null)[][] = [];
  let currentDay = 1;

  let week: (number | null)[] = Array.from({ length: firstDayIndex }, () => null);
  while (currentDay <= daysInMonth) {
    week.push(currentDay);
    if (week.length === 7) {
      weeks.push(week);
      week = [];
    }
    currentDay += 1;
  }

  if (week.length) {
    while (week.length < 7) {
      week.push(null);
    }
    weeks.push(week);
  }

  return weeks;
};

interface CalendarPreviewProps {
  monthDate?: Date;
  selectedDate?: Date | null;
  onSelectDate?: (d: Date) => void;
}

export const CalendarPreview = ({ monthDate, selectedDate = null, onSelectDate }: CalendarPreviewProps) => {
  const today = new Date();
  const [focusedMonth, setFocusedMonth] = useState<Date>(monthDate ? new Date(monthDate) : new Date(today.getFullYear(), today.getMonth(), 1));
  const [internalSelected, setInternalSelected] = useState<Date | null>(selectedDate);

  // If parent changes selectedDate or monthDate, keep component in sync.
  useEffect(() => {
    if (selectedDate) {
      setInternalSelected(selectedDate);
      setFocusedMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }
  }, [selectedDate]);

  useEffect(() => {
    if (monthDate) {
      setFocusedMonth(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
    }
  }, [monthDate]);

  const year = focusedMonth.getFullYear();
  const month = focusedMonth.getMonth();
  const weeks = buildWeeks(year, month);
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(focusedMonth);

  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

  const handlePrev = () => {
    setFocusedMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  };

  const handleNext = () => {
    setFocusedMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const d = new Date(year, month, day, today.getHours(), today.getMinutes(), today.getSeconds());
    setInternalSelected(d);
    onSelectDate?.(d);
  };

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  return (
    <article className="rounded-[2.5rem] border border-white/10 bg-white/5 p-4 shadow-[0_30px_80px_rgba(15,23,42,0.6)]">
      <header className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.4em] text-emerald-400/70">Calendário</p>
          <h3 className="text-lg font-black uppercase tracking-[0.15em] text-white mt-1">{monthLabel}</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            aria-label="Mês anterior"
            onClick={handlePrev}
            className="rounded-xl border border-white/10 bg-slate-900/40 p-2 text-slate-200 hover:bg-slate-900/60"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            aria-label="Próximo mês"
            onClick={handleNext}
            className="rounded-xl border border-white/10 bg-slate-900/40 p-2 text-slate-200 hover:bg-slate-900/60"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-7 gap-2 text-[0.55rem] font-bold uppercase tracking-[0.3em] text-slate-400">
        {weekdayLabels.map((label) => (
          <div key={label} className="text-center">
            {label}
          </div>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-7 gap-2 text-sm">
        {weeks.map((week, weekIndex) => (
          <Fragment key={`week-${weekIndex}`}>
            {week.map((day, dayIndex) => {
              if (!day) {
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className="h-10 rounded-2xl border border-white/10 bg-slate-900/30"
                  />
                );
              }

              const thisDate = new Date(year, month, day);
              const isToday = isCurrentMonth && day === today.getDate();
              const isSelected = internalSelected ? isSameDay(thisDate, internalSelected) : false;

              const baseClasses = "flex h-10 items-center justify-center rounded-2xl border px-1 text-sm font-black transition";
              const classes = isSelected
                ? "border-emerald-400 bg-emerald-400/12 text-emerald-300 shadow-[0_12px_30px_rgba(16,185,129,0.12)]"
                : isToday
                ? "border-emerald-500 bg-emerald-500/15 text-emerald-200 shadow-[0_8px_20px_rgba(16,185,129,0.08)]"
                : "border-white/5 bg-white/5 text-slate-200 hover:border-white/40";

              return (
                <button
                  key={`${weekIndex}-${day}`}
                  onClick={() => handleDayClick(day)}
                  className={`${baseClasses} ${classes}`}
                  type="button"
                >
                  {day}
                </button>
              );
            })}
          </Fragment>
        ))}
      </div>

      <footer className="mt-4 rounded-2xl border border-white/5 bg-slate-900/40 px-4 py-3 text-xs text-slate-300">
        <p className="font-semibold text-white">
          {internalSelected ? (isSameDay(internalSelected, today) ? "Dia selecionado (Hoje)" : "Dia selecionado") : (isCurrentMonth ? "Mês em andamento" : "Exibindo outro mês")}
        </p>
        <p>{internalSelected ? new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(internalSelected) : "Clique em um dia para destacá-lo."}</p>
      </footer>
    </article>
  );
};

CalendarPreview.displayName = "CalendarPreview";