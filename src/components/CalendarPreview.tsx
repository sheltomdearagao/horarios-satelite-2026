import { Fragment } from "react";

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

export const CalendarPreview = ({ monthDate }: { monthDate: Date }) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const weeks = buildWeeks(year, month);
  const monthLabel = new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(monthDate);
  const today = new Date();
  const todayLabel = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
  }).format(today);
  const isCurrentMonth =
    today.getFullYear() === year && today.getMonth() === month;

  return (
    <article className="rounded-[2.5rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.6)]">
      <header className="mb-4 flex flex-col gap-1">
        <p className="text-[0.65rem] uppercase tracking-[0.4em] text-emerald-400/70">
          Calendário
        </p>
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-black uppercase tracking-[0.15em] text-white">
            {monthLabel}
          </h3>
          <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white/70">
            Hoje
          </span>
        </div>
        <p className="text-sm text-slate-200/80">{todayLabel}</p>
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
                    className="h-11 rounded-2xl border border-white/10 bg-slate-900/30"
                  />
                );
              }

              const isToday = isCurrentMonth && day === today.getDate();
              return (
                <div
                  key={`${weekIndex}-${day}`}
                  className={`flex h-11 items-center justify-center rounded-2xl border px-1 text-sm font-black transition ${
                    isToday
                      ? "border-emerald-500 bg-emerald-500/15 text-emerald-200 shadow-[0_15px_30px_rgba(16,185,129,0.25)]"
                      : "border-white/5 bg-white/5 text-slate-200 hover:border-white/40"
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </Fragment>
        ))}
      </div>

      <footer className="mt-5 rounded-2xl border border-white/5 bg-slate-900/40 px-4 py-3 text-xs text-slate-300">
        <p className="font-semibold text-white">
          {isCurrentMonth ? "Mês em andamento" : "Exibindo outro mês"}
        </p>
        <p>Confira as aulas planejadas e evite atropelos de última hora.</p>
      </footer>
    </article>
  );
};

CalendarPreview.displayName = "CalendarPreview";