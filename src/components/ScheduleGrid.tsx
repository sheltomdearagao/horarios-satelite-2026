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
      "group flex w-full items-start gap-3 rounded-[1.5rem] border border-white/20 bg-white/95 px-4 py-3 text-left shadow-md transition-all duration-200 hover:shadow-lg active:scale-[0.98]",
      isActive && "ring-2 ring-offset-2 ring-white/70",
    )}
    style={{
      borderColor: accent,
    }}
  >
    <span
      className="mt-0.5 h-10 w-1.5 rounded-full"
      style={{
        backgroundColor: accent,
      }}
    />
    <div className="flex flex-1 flex-col gap-0.5">
      <div className="flex items-center justify-between text-[0.6rem] font-bold uppercase tracking-widest text-slate-500">
        <span>{lesson.periodLabel}</span>
        <span className="text-[0.5rem] text-slate-400">
          {lesson.shift === "morning" ? "MANHÃ" : "TARDE"}
        </span>
      </div>
      <p className="text-sm font-bold leading-tight text-slate-900">{lesson.className}</p>
      <p className="text-[0.7rem] font-medium text-slate-500">{lesson.time}</p>
      {showTeacher && (
        <p className="mt-0.5 text-[0.65rem] font-semibold text-slate-600">
          {lesson.teacher}
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
  <div className="-mx-4 overflow-x-auto pb-2 scrollbar-hide">
    <div className="flex w-max gap-4 snap-x snap-mandatory px-4">
      {days.map((day) => {
        const dayLessons = scheduleByDay[day];
        const hasMorning = dayLessons.morning.length > 0;
        const hasAfternoon = dayLessons.afternoon.length > 0;

        if (!hasMorning && !hasAfternoon) return null;

        return (
          <article
            key={day}
            className="flex-shrink-0 snap-start w-[280px] rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-xl"
          >
            <header className="mb-4 flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-base font-bold uppercase tracking-widest text-white">{day}</h3>
              <span className="text-[0.6rem] font-bold uppercase tracking-tighter text-white/40">
                {dayLessons.morning.length + dayLessons.afternoon.length} AULAS
              </span>
            </header>

            <div className="space-y-6">
              {hasMorning && (
                <div className="space-y-2">
                  <p className="text-[0.65rem] font-black uppercase tracking-widest text-emerald-400/80">Manhã</p>
                  <div className="space-y-2">
                    {dayLessons.morning.map((lesson) => {
                      const accent = classColorMap.get(lesson.classGroup) ?? "#A855F7";
                      return (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          accent={accent}
                          showTeacher={showTeacher}
                          isActive={lesson.classGroup === activeClass}
                          onClick={() => onLessonClick(lesson)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {hasAfternoon && (
                <div className="space-y-2">
                  <p className="text-[0.65rem] font-black uppercase tracking-widest text-amber-400/80">Tarde</p>
                  <div className="space-y-2">
                    {dayLessons.afternoon.map((lesson) => {
                      const accent = classColorMap.get(lesson.classGroup) ?? "#A855F7";
                      return (
                        <LessonCard
                          key={lesson.id}
                          lesson={lesson}
                          accent={accent}
                          showTeacher={showTeacher}
                          isActive={lesson.classGroup === activeClass}
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
