import { cn } from "@/lib/utils";
import { DayName, Lesson, days, morningSlots, afternoonSlots } from "@/data/schedule";

type ScheduleByDay = Record<DayName, { morning: Lesson[]; afternoon: Lesson[] }>;

interface ScheduleGridProps {
  scheduleByDay: ScheduleByDay;
  activeKey: string | null;
  onLessonClick: (lesson: Lesson) => void;
  classColorMap: Map<string, string>;
  showTeacher?: boolean;
  highlightColor?: string;
  getLessonKey: (lesson: Lesson) => string;
  visibleShift?: "morning" | "afternoon" | "both";
}

const hexToRgba = (hex: string, alpha: number) => {
  const sanitized = hex.replace("#", "");
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const LessonCard = ({
  lesson,
  accent,
  isActive,
  onClick,
  showTeacher,
  highlightColor = "#34d399",
}: {
  lesson: Lesson;
  accent: string;
  isActive: boolean;
  onClick: () => void;
  showTeacher?: boolean;
  highlightColor?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-pressed={isActive}
    className={cn(
      "relative flex w-full items-start gap-3 rounded-2xl border bg-slate-900/65 p-3 md:p-4 text-left transition-all duration-200",
      "hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
      isActive ? "scale-[1.02] z-10 border-2" : "border-white/10"
    )}
    style={{
      borderColor: isActive ? highlightColor : undefined,
      boxShadow: isActive ? `0 18px 36px ${hexToRgba(highlightColor, 0.18)}` : undefined,
    }}
  >
    <span
      className="mt-0.5 h-9 w-1.5 rounded-full shrink-0 md:h-10"
      style={{
        backgroundColor: isActive ? highlightColor : accent,
      }}
    />
    <div className="flex flex-1 flex-col gap-1 overflow-hidden">
      <div className="flex items-center justify-between text-[0.65rem] font-bold uppercase tracking-wider text-white/60">
        <span className={cn(isActive && "font-black", "truncate")} style={{ color: isActive ? highlightColor : undefined }}>
          {lesson.periodLabel}
        </span>
        <span className="text-[0.65rem] text-white/50">
          {lesson.shift === "morning" ? "MANHÃ" : "TARDE"}
        </span>
      </div>

      <p className="text-sm md:text-base font-extrabold leading-tight text-white truncate">{lesson.className}</p>

      <div className="flex items-center justify-between text-[0.75rem] text-white/60">
        <span className="font-medium uppercase tracking-[0.18em]">{lesson.time}</span>
        {showTeacher ? (
          <span className="ml-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white/70 truncate">Prof(a). {lesson.teacher}</span>
        ) : null}
      </div>
    </div>
  </button>
);

const EmptySlotCard = ({
  slotInfo,
  shift,
}: {
  slotInfo: { label: string; time: string };
  shift: "morning" | "afternoon";
}) => (
  <div className="relative flex w-full items-start gap-3 rounded-2xl border border-white/6 bg-slate-800/40 p-3 md:p-4 text-left shadow-sm">
    <span className="mt-0.5 h-9 w-1.5 rounded-full shrink-0 md:h-10 bg-slate-600" />
    <div className="flex flex-1 flex-col gap-1 overflow-hidden">
      <div className="flex items-center justify-between text-[0.65rem] font-bold uppercase tracking-wider text-white/50">
        <span className="truncate">{slotInfo.label}</span>
        <span className="text-[0.65rem]">{shift === "morning" ? "MANHÃ" : "TARDE"}</span>
      </div>
      <p className="text-sm md:text-base font-bold leading-tight text-white/40 truncate">Sem aula</p>
      <div className="text-[0.75rem] text-white/40">
        <span className="font-medium uppercase tracking-[0.18em]">{slotInfo.time}</span>
      </div>
    </div>
  </div>
);

export const ScheduleGrid = ({
  scheduleByDay,
  activeKey,
  onLessonClick,
  classColorMap,
  showTeacher = false,
  highlightColor = "#34d399",
  getLessonKey,
  visibleShift = "both",
}: ScheduleGridProps) => (
  <div className="-mx-4 overflow-x-auto pb-4 no-scrollbar">
    <div className="flex w-max gap-4 snap-x snap-mandatory px-4">
      {days.map((day) => {
        const dayLessons = scheduleByDay[day];

        return (
          <article
            key={day}
            className="flex-shrink-0 snap-start rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl"
            style={{
              width: "84vw",
              maxWidth: 420,
            }}
          >
            <header className="mb-4 flex items-start justify-between border-b border-white/6 pb-3">
              <div>
                <h3 className="text-lg md:text-xl font-extrabold uppercase tracking-widest text-white">{day}</h3>
                <div className="mt-1 text-xs text-white/50 uppercase">Grade Completa</div>
              </div>
            </header>

            <div className="flex flex-col gap-8">
              {/* Morning Shift */}
              {visibleShift !== "afternoon" && (
                <div className="space-y-3">
                  <p className="text-[0.72rem] font-black uppercase tracking-[0.28em] text-emerald-400/85">Manhã</p>
                  <div className="flex flex-col gap-3">
                    {morningSlots.map((slotInfo, index) => {
                      const lesson = dayLessons.morning.find((l) => l.slot === index);
                      if (lesson) {
                        const accent = classColorMap.get(lesson.classGroup) ?? "#A855F7";
                        const isActive = getLessonKey(lesson) === activeKey;
                        return (
                          <LessonCard
                            key={lesson.id}
                            lesson={lesson}
                            accent={accent}
                            showTeacher={showTeacher}
                            highlightColor={highlightColor}
                            isActive={isActive}
                            onClick={() => onLessonClick(lesson)}
                          />
                        );
                      }
                      return <EmptySlotCard key={`empty-m-${day}-${index}`} slotInfo={slotInfo} shift="morning" />;
                    })}
                  </div>
                </div>
              )}

              {/* Afternoon Shift */}
              {visibleShift !== "morning" && (
                <div className="space-y-3">
                  <p className="text-[0.72rem] font-black uppercase tracking-[0.28em] text-amber-400/85">Tarde</p>
                  <div className="flex flex-col gap-3">
                    {afternoonSlots.map((slotInfo, index) => {
                      const lesson = dayLessons.afternoon.find((l) => l.slot === index);
                      if (lesson) {
                        const accent = classColorMap.get(lesson.classGroup) ?? "#A855F7";
                        const isActive = getLessonKey(lesson) === activeKey;
                        return (
                          <LessonCard
                            key={lesson.id}
                            lesson={lesson}
                            accent={accent}
                            showTeacher={showTeacher}
                            highlightColor={highlightColor}
                            isActive={isActive}
                            onClick={() => onLessonClick(lesson)}
                          />
                        );
                      }
                      return <EmptySlotCard key={`empty-a-${day}-${index}`} slotInfo={slotInfo} shift="afternoon" />;
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
