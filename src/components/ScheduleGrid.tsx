import { cn } from "@/lib/utils";
import { DayName, Lesson, days } from "@/data/schedule";

type ScheduleByDay = Record<DayName, { morning: Lesson[]; afternoon: Lesson[] }>;

interface ScheduleGridProps {
  scheduleByDay: ScheduleByDay;
  activeClass: string | null;
  onLessonClick: (lesson: Lesson) => void;
  classColorMap: Map<string, string>;
  showTeacher?: boolean;
}

const LessonCard = ({
  lesson,
  accent,
  isActive,
  onClick,
  showTeacher,
}: {
  lesson: Lesson;
  accent: string;
  isActive: boolean;
  onClick: () => void;
  showTeacher?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={isActive}
    className={cn(
      "group flex w-full items-start gap-3 rounded-[1.9rem] border bg-white/90 px-4 py-3 text-left shadow-[0_15px_40px_rgba(15,23,42,0.25)] transition-all duration-200 hover:-translate-y-0.5",
      isActive
        ? "ring-2 ring-offset-2 ring-white/60 dark:ring-offset-slate-900"
        : "border-white/30",
    )}
    style={{
      borderColor: accent,
    }}
  >
    <span
      className="mt-0.5 h-10 w-1.5 rounded-2xl"
      style={{
        backgroundColor: accent,
      }}
    />
    <div className="flex flex-1 flex-col gap-1">
      <div className="flex items-center justify-between text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-slate-500">
        <span>{lesson.periodLabel}</span>
        <span className="text-right text-[0.55rem] tracking-[0.4em] text-slate-400">
          {lesson.shift === "morning" ? "MANHÃ" : "TARDE"}
        </span>
      </div>
      <p className="text-base font-semibold leading-tight text-slate-900">
        {lesson.className}
      </p>
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-slate-400">
        {lesson.time}
      </p>
      {showTeacher && (
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">
          Prof(a). {lesson.teacher}
        </p>
      )}
    </div>
  </button>
);

export const ScheduleGrid = ({
  scheduleByDay,
  activeClass,
  onLessonClick,
  classColorMap,
  showTeacher = false,
}: ScheduleGridProps) => (
  <div className="grid gap-4 md:grid-cols-2">
    {days.map((day) => {
      const dayLessons = scheduleByDay[day];
      const hasMorning = dayLessons.morning.length > 0;
      const hasAfternoon = dayLessons.afternoon.length > 0;

      return (
        <article
          key={day}
          className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_60px_rgba(15,23,42,0.25)]"
        >
          <header className="flex items-center justify-between">
            <h3 className="text-lg font-semibold uppercase tracking-[0.35em] text-white">
              {day}
            </h3>
            <span className="text-xs font-semibold uppercase tracking-[0.4em] text-white/60">
              {hasMorning || hasAfternoon ? "Ativo" : "Folga"}
            </span>
          </header>

          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
                  Manhã
                </p>
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                  {scheduleByDay[day].morning.length} aula(s)
                </p>
              </div>
              <div className="space-y-3">
                {hasMorning ? (
                  dayLessons.morning.map((lesson) => {
                    const accent = classColorMap.get(lesson.className) ?? "#A855F7";
                    return (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        accent={accent}
                        showTeacher={showTeacher}
                        isActive={lesson.className === activeClass}
                        onClick={() => onLessonClick(lesson)}
                      />
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400">Sem aulas programadas</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-300">
                  Tarde
                </p>
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                  {scheduleByDay[day].afternoon.length} aula(s)
                </p>
              </div>
              <div className="space-y-3">
                {hasAfternoon ? (
                  dayLessons.afternoon.map((lesson) => {
                    const accent = classColorMap.get(lesson.className) ?? "#A855F7";
                    return (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        accent={accent}
                        showTeacher={showTeacher}
                        isActive={lesson.className === activeClass}
                        onClick={() => onLessonClick(lesson)}
                      />
                    );
                  })
                ) : (
                  <p className="text-sm text-slate-400">Sem aulas programadas</p>
                )}
              </div>
            </div>
          </div>
        </article>
      );
    })}
  </div>
);

ScheduleGrid.displayName = "ScheduleGrid";
