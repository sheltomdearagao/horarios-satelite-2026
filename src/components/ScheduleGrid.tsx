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
      "relative flex w-full items-start gap-3 rounded-2xl border bg-white px-3 py-2 md:px-4 md:py-3 text-left transition-all duration-300",
      "hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400",
      isActive 
        ? "scale-[1.02] z-10 border-2" 
        : "border-slate-100 shadow-sm"
    )}
    style={{
      borderColor: isActive ? highlightColor : undefined,
      boxShadow: isActive ? `0 20px 40px ${hexToRgba(highlightColor, 0.25)}` : undefined,
    }}
  >
    <span
      className="mt-0.5 h-9 w-1.5 rounded-full shrink-0 md:h-10"
      style={{
        backgroundColor: isActive ? highlightColor : accent,
      }}
    />
    <div className="flex flex-1 flex-col gap-1 overflow-hidden">
      <div className="flex items-center justify-between text-[0.6rem] font-bold uppercase tracking-wider text-slate-500">
        <span className={cn(isActive && "font-black")} style={{ color: isActive ? highlightColor : undefined }}>
          {lesson.periodLabel}
        </span>
        <span className="text-[0.55rem] text-slate-400">
          {lesson.shift === "morning" ? "MANHÃ" : "TARDE"}
        </span>
      </div>
      <p className="text-sm md:text-base font-bold leading-tight text-slate-900 truncate">
        {lesson.className}
      </p>
      <div className="flex items-center justify-between text-[0.7rem] text-slate-500">
        <span className="font-medium uppercase tracking-[0.25em]">{lesson.time}</span>
        {isActive && (
          <span 
            className="rounded-full px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.1em]"
            style={{ backgroundColor: hexToRgba(highlightColor, 0.1), color: highlightColor }}
          >
            Ativa
          </span>
        )}
      </div>
      {showTeacher && (
        <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.15em] text-slate-600 truncate">
          Prof(a). {lesson.teacher}
        </p>
      )}
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
  <div className="relative flex w-full items-start gap-3 rounded-2xl border border-slate-50 bg-white/40 px-3 py-2 md:px-4 md:py-3 text-left shadow-sm opacity-50">
    <span className="mt-0.5 h-9 w-1.5 rounded-full shrink-0 md:h-10 bg-slate-200" />
    <div className="flex flex-1 flex-col gap-1 overflow-hidden">
      <div className="flex items-center justify-between text-[0.6rem] font-bold uppercase tracking-wider text-slate-400">
        <span>{slotInfo.label}</span>
        <span className="text-[0.55rem]">{shift === "morning" ? "MANHÃ" : "TARDE"}</span>
      </div>
      <p className="text-sm md:text-base font-bold leading-tight text-slate-300">-</p>
      <div className="text-[0.7rem] text-slate-300">
        <span className="font-medium uppercase tracking-[0.25em]">{slotInfo.time}</span>
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
}: ScheduleGridProps) => (
  <div className="-mx-4 overflow-x-auto pb-4 scrollbar-hide">
    <div className="flex w-max gap-4 snap-x snap-mandatory px-4">
      {days.map((day) => {
        const dayLessons = scheduleByDay[day];

        return (
          <article
            key={day}
            className="flex-shrink-0 snap-start rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-2xl"
            style={{
              width: "84vw",
              maxWidth: 400,
            }}
          >
            <header className="mb-4 flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-base md:text-lg font-bold uppercase tracking-widest text-white">{day}</h3>
              <span className="text-[0.65rem] font-bold text-white/40 uppercase tracking-widest">
                Grade Completa
              </span>
            </header>

            <div className="flex flex-col gap-8">
              {/* Morning Shift */}
              <div className="space-y-3">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-emerald-400/80">Manhã</p>
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

              {/* Afternoon Shift */}
              <div className="space-y-3">
                <p className="text-[0.65rem] font-black uppercase tracking-[0.3em] text-amber-400/80">Tarde</p>
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
            </div>
          </article>
        );
      })}
    </div>
  </div>
);

ScheduleGrid.displayName = "ScheduleGrid";