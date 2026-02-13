import { cn } from "@/lib/utils";
import { DayName, Lesson, days } from "@/data/schedule";

type ScheduleByDay = Record<DayName, { morning: Lesson[]; afternoon: Lesson[] }>;

interface ScheduleGridProps {
  scheduleByDay: ScheduleByDay;
  activeSubject: string | null;
  onLessonClick: (lesson: Lesson) => void;
  classColorMap: Map<string, string>;
  showTeacher?: boolean;
}

const getSubjectCode = (lessonName: string) => {
  const segments = lessonName.split("-").map((segment) => segment.trim());
  return segments[segments.length - 1];
};

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
      "relative flex w-full items-start gap-3 rounded-2xl border bg-white/95 transition-all duration-200",
      "hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
      "px-3 py-2 md:px-4 md:py-3 shadow-sm",
      isActive
        ? "ring-4 ring-emerald-400/30 bg-emerald-50 text-emerald-900 shadow-[0_25px_45px_rgba(16,185,129,0.2)]"
        : "border-white/20"
    )}
    style={{
      borderLeftWidth: isActive ? undefined : 6,
      borderLeftColor: isActive ? undefined : accent,
    }}
  >
    <span
      className="mt-0.5 h-9 w-1.5 rounded-full md:h-10"
      style={{
        backgroundColor: accent,
      }}
    />
    <div className="flex flex-1 flex-col gap-0.5">
      <div className="flex items-center justify-between text-[0.6rem] font-bold uppercase tracking-wider text-slate-500">
        <span className={cn(isActive && "text-emerald-600")}>{lesson.periodLabel}</span>
        <span className="text-[0.55rem] text-slate-400">{lesson.shift === "morning" ? "MANHÃ" : "TARDE"}</span>
      </div>
      <p className="text-sm md:text-base font-semibold leading-tight text-slate-900 truncate">
        {lesson.className}
      </p>
      <div className="flex items-center justify-between text-[0.7rem] text-slate-500">
        <span className="font-medium uppercase tracking-[0.25em]">{lesson.time}</span>
        {isActive && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Selecionada
          </span>
        )}
      </div>
      {showTeacher && (
        <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-slate-600">
          Prof(a). {lesson.teacher}
        </p>
      )}
    </div>
  </button>
);

export const ScheduleGrid = ({
  scheduleByDay,
  activeSubject,
  onLessonClick,
  classColorMap,
  showTeacher = false,
}: ScheduleGridProps) => (
  <div className="-mx-4 overflow-x-auto pb-4 scrollbar-hide">
    <div className="flex w-max gap-4 snap-x snap-mandatory px-4">
      {days.map((day) => {
        const dayLessons = scheduleByDay[day];
        const morningCount = dayLessons.morning.length;
        const afternoonCount = dayLessons.afternoon.length;
        const totalCount = morningCount + afternoonCount;

        if (totalCount === 0) return null;

        const baseHeight = 120;
        const perLessonHeight = 72;
        const minHeight = Math.max(150, baseHeight + totalCount * perLessonHeight);

        return (
          <article
            key={day}
            className="flex-shrink-0 snap-start rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl transition-transform duration-200 hover:-translate-y-[2px]"
            style={{
              width: "84vw",
              maxWidth: 420,
              minHeight: `${minHeight}px`,
            }}
          >
            <header className="mb-3 flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-base md:text-lg font-semibold uppercase tracking-wider text-white">{day}</h3>
              <span className="text-xs md:text-sm font-semibold uppercase tracking-tight text-white/50">
                {totalCount} aula{totalCount !== 1 && "s"}
              </span>
            </header>

            <div className="flex flex-col gap-4">
              {morningCount > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-emerald-400/80">Manhã</p>
                    <p className="text-xs uppercase tracking-tight text-white/50">{morningCount} aula(s)</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {dayLessons.morning.map((lesson) => {
                      const accent = classColorMap.get(lesson.classGroup) ?? "#A855F7";
                      const subjectCode = getSubjectCode(lesson.className);
                      const isActive = subjectCode === activeSubject;
                      return (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          accent={accent}
                          showTeacher={showTeacher}
                          isActive={isActive}
                          onClick={() => onLessonClick(lesson)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {afternoonCount > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-[0.35em] text-amber-400/80">Tarde</p>
                    <p className="text-xs uppercase tracking-tight text-white/50">{afternoonCount} aula(s)</p>
                  </div>
                  <div className="flex flex-col gap-3">
                    {dayLessons.afternoon.map((lesson) => {
                      const accent = classColorMap.get(lesson.classGroup) ?? "#A855F7";
                      const subjectCode = getSubjectCode(lesson.className);
                      const isActive = subjectCode === activeSubject;
                      return (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          accent={accent}
                          showTeacher={showTeacher}
                          isActive={isActive}
                          onClick={() => onLessonClick(lesson)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </article>
        );
      })}
    </div>
  </div>
);

ScheduleGrid.displayName = "ScheduleGrid";