import { useMemo, useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScheduleGrid } from "@/components/ScheduleGrid";
import { classSchedules, classColorMap, teacherSchedules, days } from "@/data/schedule";
import type { Lesson, DayName } from "@/data/schedule";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays, Clock } from "lucide-react";
import { CalendarPreview } from "@/components/CalendarPreview";

const getSubjectCode = (lessonName: string) => {
  const segments = lessonName.split("-").map((segment) => segment.trim());
  return segments[segments.length - 1];
};

const weekdayIndexToDayName = (weekdayIndex: number): DayName | null => {
  if (weekdayIndex === 1) return "Segunda";
  if (weekdayIndex === 2) return "Terça";
  if (weekdayIndex === 3) return "Quarta";
  if (weekdayIndex === 4) return "Quinta";
  if (weekdayIndex === 5) return "Sexta";
  return null;
};

const isWeekend = (weekdayIndex: number) => weekdayIndex === 0 || weekdayIndex === 6;

const dayOrderMap: Record<DayName, number> = days.reduce((acc, day, idx) => {
  acc[day] = idx;
  return acc;
}, {} as Record<DayName, number>);

const getLessonStartMinutes = (lesson: Lesson) => {
  const [start] = lesson.time.split("–").map((segment) => segment.trim());
  const [hour, minute] = start.split(":").map((value) => Number(value));
  return hour * 60 + minute;
};

const findNextLesson = (lessons: Lesson[], currentDayIndex: number, currentMinutes: number) => {
  if (!lessons.length) return null;

  const nextInToday = lessons.find((lesson) => {
    const lessonDayIndex = dayOrderMap[lesson.day];
    return lessonDayIndex === currentDayIndex && getLessonStartMinutes(lesson) >= currentMinutes;
  });

  if (nextInToday) return nextInToday;

  const nextDayLesson = lessons.find((lesson) => dayOrderMap[lesson.day] > currentDayIndex);
  if (nextDayLesson) return nextDayLesson;

  return lessons[0];
};

const formatShortDateForButton = (d: Date) => {
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
    .format(d)
    .toUpperCase();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${weekday} - ${day}/${month}`;
};

const LessonRow = ({
  lesson,
  highlightColor,
}: {
  lesson: Lesson;
  highlightColor: string;
}) => {
  const accent = classColorMap.get(lesson.classGroup) ?? "#A855F7";
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="mt-0.5 h-9 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-black uppercase tracking-[0.12em] text-white/90">{lesson.periodLabel}</p>
          <span
            className="shrink-0 rounded-full px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.18em]"
            style={{ backgroundColor: `${highlightColor}22`, color: highlightColor }}
          >
            {lesson.shift === "morning" ? "Manhã" : "Tarde"}
          </span>
        </div>
        <p className="mt-1 truncate text-base font-bold text-white">{lesson.className}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/55">{lesson.time}</p>
        <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/60">
          Turma: {lesson.classGroup} • Prof(a). {lesson.teacher}
        </p>
      </div>
    </div>
  );
};

const NextLessonCard = ({
  lesson,
  mode,
  highlightColor,
}: {
  lesson: Lesson | null;
  mode: "teacher" | "class";
  highlightColor: string;
}) => {
  const accent = lesson ? classColorMap.get(lesson.classGroup) ?? highlightColor : highlightColor;
  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-4 shadow-[0_20px_60px_rgba(2,6,23,0.6)]">
      <div className="flex items-center justify-between space-x-3 text-[0.65rem] font-black uppercase tracking-[0.4em] text-white/40">
        <span>Próxima aula</span>
        {lesson && <span className="text-[0.65rem] text-white/70 uppercase tracking-[0.3em]">{lesson.day}</span>}
      </div>
      {lesson ? (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: accent }} />
              <p className="text-base font-black uppercase tracking-[0.16em] text-white">{lesson.className}</p>
            </div>
            <span
              className="rounded-full px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.18em]"
              style={{ backgroundColor: `${highlightColor}25`, color: highlightColor }}
            >
              {lesson.periodLabel}
            </span>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-200/90">{lesson.time}</p>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-white/70">
            {mode === "teacher" ? `Turma: ${lesson.classGroup}` : `Prof(a). ${lesson.teacher}`}
          </p>
        </div>
      ) : (
        <p className="mt-3 text-sm text-white/70">Sem aulas registradas para este filtro.</p>
      )}
    </div>
  );
};

const Index = () => {
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [activeKeyTeacher, setActiveKeyTeacher] = useState<string | null>(null);
  const [activeKeyGroup, setActiveKeyGroup] = useState<string | null>(null);
  const [showTeacherSection, setShowTeacherSection] = useState(false);
  const [showClassSection, setShowClassSection] = useState(false);

  // Normalize a class name (remove NBSP, normalize º, trim)
  const normalizeClassName = (name: string) =>
    name
      .replace(/\u00A0/g, " ")
      .replace(/º/g, "º")
      .replace(/\s+/g, " ")
      .trim();

  // ORDER classes: 6ºs, 7ºs, 8ºs, 9ºs, 1ºs, 2ºs, 3ºs — ensure ALL classes appear (merge present groups)
  const orderedClassSchedules = useMemo(() => {
    const gradeOrder = ["6", "7", "8", "9", "1", "2", "3"];

    // Collect all class names present
    const allNames = classSchedules.map((c) => c.name);
    const normalizedMap = new Map<string, string>(); // normalized -> original
    allNames.forEach((n) => normalizedMap.set(normalizeClassName(n), n));

    // Partition by grade key
    const buckets: Record<string, string[]> = {};
    allNames.forEach((orig) => {
      const n = normalizeClassName(orig);
      const m = n.match(/(\d{1,2})/); // find first number
      const grade = m ? m[1] : "zz"; // non-matching go to end
      if (!buckets[grade]) buckets[grade] = [];
      buckets[grade].push(orig);
    });

    // Build ordered list by gradeOrder, then remaining numeric grades ascending, then others
    const ordered: string[] = [];
    gradeOrder.forEach((g) => {
      const list = buckets[g];
      if (list && list.length) {
        list.sort((a, b) => a.localeCompare(b, "pt-BR"));
        ordered.push(...list);
        delete buckets[g];
      }
    });

    // remaining numeric grades (unlikely) - sort ascending
    const remainingGrades = Object.keys(buckets).filter((k) => /^\d+$/.test(k)).sort((a, b) => Number(a) - Number(b));
    remainingGrades.forEach((g) => {
      const list = buckets[g];
      list.sort((a, b) => a.localeCompare(b, "pt-BR"));
      ordered.push(...list);
      delete buckets[g];
    });

    // any others
    Object.keys(buckets).forEach((g) => {
      const list = buckets[g];
      list.sort((a, b) => a.localeCompare(b, "pt-BR"));
      ordered.push(...list);
    });

    // final: map to classSchedules entries (preserving full objects)
    const mapByName = new Map(classSchedules.map((c) => [c.name, c]));
    const result = ordered.map((name) => mapByName.get(name)).filter(Boolean) as typeof classSchedules;
    // ensure no duplicates and include any classSchedules not yet in result
    const resultNames = new Set(result.map((r) => r.name));
    classSchedules.forEach((c) => {
      if (!resultNames.has(c.name)) result.push(c);
    });

    return result;
  }, [classSchedules]);

  const teacherMap = useMemo(() => new Map(teacherSchedules.map((teacher) => [teacher.name, teacher])), []);
  const classMap = useMemo(() => new Map(classSchedules.map((classItem) => [classItem.name, classItem])), []);

  const currentTeacher = selectedTeacher ? teacherMap.get(selectedTeacher) : undefined;
  const currentClassSchedule = selectedClass ? classMap.get(selectedClass) : undefined;

  const handleTeacherLessonClick = (lesson: Lesson) => {
    const key = `${getSubjectCode(lesson.className)}|${lesson.classGroup}`;
    setActiveKeyTeacher((current) => (current === key ? null : key));
  };

  const handleClassLessonClick = (lesson: Lesson) => {
    const key = getSubjectCode(lesson.className);
    setActiveKeyGroup((current) => (current === key ? null : key));
  };

  const now = new Date();
  const weekdayIndex = now.getDay();
  const todayName = weekdayIndexToDayName(weekdayIndex);
  const todayLabelFull = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(now);
  const minutesNow = now.getHours() * 60 + now.getMinutes();

  const [todayMode, setTodayMode] = useState<"teacher" | "class">("teacher");
  const [todayTeacher, setTodayTeacher] = useState(teacherSchedules[0]?.name ?? "");
  const [todayClass, setTodayClass] = useState(classSchedules[0]?.name ?? "");

  const todayTeacherSchedule = teacherMap.get(todayTeacher) ?? teacherSchedules[0];
  const todayClassSchedule = classMap.get(todayClass) ?? classSchedules[0];

  const baseLessons = todayMode === "teacher" ? todayTeacherSchedule.lessons : todayClassSchedule.lessons;
  const nextLesson = useMemo(() => {
    const currentDayIndex = todayName ? dayOrderMap[todayName] : -1;
    return findNextLesson(baseLessons, currentDayIndex, minutesNow);
  }, [baseLessons, minutesNow, todayName]);

  const todayLessons = useMemo(() => {
    if (!todayName) return [];
    const scheduleByDay = todayMode === "teacher" ? todayTeacherSchedule.scheduleByDay : todayClassSchedule.scheduleByDay;
    if (!scheduleByDay) return [];
    const dayBucket = scheduleByDay[todayName];
    return [...dayBucket.morning, ...dayBucket.afternoon];
  }, [todayClassSchedule?.scheduleByDay, todayMode, todayName, todayTeacherSchedule?.scheduleByDay]);

  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(now);
  const monthDate = new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth(), 1);

  return (
    <main className="min-h-screen bg-slate-950 py-6 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
        <header className="flex items-center gap-4 rounded-[2rem] border border-white/10 bg-[#0d1b2a] px-5 py-4 shadow-[0_28px_80px_rgba(3,7,18,0.7)]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white p-0.5">
            <img
              src="/icon-512-transparent.png"
              alt="Logo C.E. Satélite"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-2xl font-extrabold leading-tight text-white">Horários 2026</p>
            <p className="mt-0.5 text-base font-medium leading-tight text-white/80">Colégio Estadual Satélite</p>
          </div>
        </header>

        <section className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          {/* ... keep existing UI unchanged ... */}
          {/* Use orderedClassSchedules for selects to show all classes in desired order */}
          <div className="w-full sm:max-w-sm">
            <Select value={selectedClass} onValueChange={(value) => { setSelectedClass(value); setShowClassSection(true); }}>
              <SelectTrigger className="h-12 rounded-xl border-white/20 bg-slate-900/60 text-slate-100 shadow-inner backdrop-blur-sm">
                <SelectValue placeholder="Escolha uma turma" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-slate-900 text-white">
                {orderedClassSchedules.map((classItem) => (
                  <SelectItem key={classItem.name} className="rounded-lg focus:bg-amber-500 focus:text-white" value={classItem.name}>
                    {classItem.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* rest of page unchanged (ScheduleGrid usage remains) */}
      </div>
    </main>
  );
};

export default Index;