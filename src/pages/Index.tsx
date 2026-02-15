import { useMemo, useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScheduleGrid } from "@/components/ScheduleGrid";
import { classSchedules, classColorMap, teacherSchedules, days } from "@/data/schedule";
import type { Lesson, DayName } from "@/data/schedule";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays, Clock, ChevronDown } from "lucide-react";
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
    const scheduleByDay =
      todayMode === "teacher" ? todayTeacherSchedule?.scheduleByDay : todayClassSchedule?.scheduleByDay;
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
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white p-1.5">
            <img
              src="/CES_Logo.png"
              alt="Logo C.E. Satélite"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <p className="text-2xl font-extrabold leading-tight text-white">Horários 2026</p>
            <p className="mt-0.5 text-base font-medium leading-tight text-white/80">
              Colégio Estadual Satélite
            </p>
          </div>
        </header>

        <section className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="secondary"
                className="h-12 w-full justify-between rounded-2xl border border-white/10 bg-white/5 px-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.45)] backdrop-blur-sm hover:bg-white/10 sm:w-auto sm:flex-1"
              >
                <span className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-emerald-300" />
                  <span className="text-sm font-black uppercase tracking-[0.22em]">Calendário</span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/60">
                  {new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(now)}
                </span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[92vw] rounded-[2rem] border border-white/10 bg-slate-950 p-0 text-white shadow-2xl sm:max-w-xl">
              <DialogHeader className="px-6 pt-6">
                <DialogTitle className="text-xl font-black uppercase tracking-[0.18em]">Calendário</DialogTitle>
                <p className="text-sm text-white/70">Visual rápido do mês atual, no mesmo estilo da home.</p>
              </DialogHeader>
              <div className="px-6 pb-6">
                <CalendarPreview
                  monthDate={monthDate}
                  selectedDate={selectedCalendarDate}
                  onSelectDate={(d) => setSelectedCalendarDate(d)}
                />
              </div>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="h-12 w-full justify-between rounded-2xl border border-white/10 bg-emerald-500/15 px-5 text-white shadow-[0_20px_50px_rgba(16,185,129,0.18)] backdrop-blur-sm hover:bg-emerald-500/20 sm:w-auto sm:flex-1"
              >
                <span className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-emerald-300" />
                  <span className="text-sm font-black uppercase tracking-[0.22em]">Aulas de hoje</span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">{formatShortDateForButton(now)}</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[92vw] rounded-[2rem] border border-white/10 bg-slate-950 p-0 text-white shadow-2xl sm:max-w-2xl">
              <DialogHeader className="px-6 pt-6">
                <DialogTitle className="text-xl font-black uppercase tracking-[0.18em]">Aulas de hoje</DialogTitle>
                <p className="text-sm text-white/70">O sistema usa automaticamente o dia/horário do seu dispositivo.</p>
              </DialogHeader>
              <div className="px-6 pb-6">
                <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    onClick={() => setTodayMode("teacher")}
                    className={`h-12 rounded-2xl border px-5 text-sm font-black uppercase tracking-[0.22em] ${
                      todayMode === "teacher"
                        ? "border-emerald-400/50 bg-emerald-500/20 text-white"
                        : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    Por professor
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setTodayMode("class")}
                    className={`h-12 rounded-2xl border px-5 text-sm font-black uppercase tracking-[0.22em] ${
                      todayMode === "class"
                        ? "border-amber-400/50 bg-amber-500/20 text-white"
                        : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    Por turma
                  </Button>
                </div>

                <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-white/50">Filtro</p>
                      <p className="mt-1 text-lg font-black text-white">
                        {todayMode === "teacher" ? todayTeacher : todayClass}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">{todayLabelFull}</p>
                    </div>

                    <div className="w-full sm:max-w-sm">
                      {todayMode === "teacher" ? (
                        <Select value={todayTeacher} onValueChange={setTodayTeacher}>
                          <SelectTrigger className="h-12 rounded-xl border-white/20 bg-slate-900/60 text-slate-100 shadow-inner backdrop-blur-sm">
                            <SelectValue placeholder="Escolha um professor" />
                          </SelectTrigger>
                          <SelectContent className="border-white/10 bg-slate-900 text-white">
                            {teacherSchedules.map((teacher) => (
                              <SelectItem key={teacher.name} className="rounded-lg focus:bg-emerald-500 focus:text-white" value={teacher.name}>
                                {teacher.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Select value={todayClass} onValueChange={setTodayClass}>
                          <SelectTrigger className="h-12 rounded-xl border-white/20 bg-slate-900/60 text-slate-100 shadow-inner backdrop-blur-sm">
                            <SelectValue placeholder="Escolha uma turma" />
                          </SelectTrigger>
                          <SelectContent className="border-white/10 bg-slate-900 text-white">
                            {classSchedules.map((classItem) => (
                              <SelectItem key={classItem.name} className="rounded-lg focus:bg-amber-500 focus:text-white" value={classItem.name}>
                                {classItem.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 space-y-4">
                    <NextLessonCard lesson={nextLesson} mode={todayMode} highlightColor={todayMode === "teacher" ? "#10b981" : "#f59e0b"} />

                    {isWeekend(weekdayIndex) || !todayName ? (
                      <div className="rounded-2xl border border-white/10 bg-slate-900/30 px-4 py-4 text-sm text-white/80">
                        <p className="text-base font-black text-white">Não há aulas hoje.</p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                          {days.length ? "Apenas Segunda a Sexta" : "Fim de semana"}
                        </p>
                      </div>
                    ) : todayLessons.length === 0 ? (
                      <div className="rounded-2xl border border-white/10 bg-slate-900/30 px-4 py-4 text-sm text-white/80">
                        <p className="text-base font-black text-white">Não há aulas hoje.</p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                          Nenhum horário cadastrado para {todayName}.
                        </p>
                      </div>
                    ) : (
                      todayLessons.map((lesson) => (
                        <LessonRow key={lesson.id} lesson={lesson} highlightColor={todayMode === "teacher" ? "#10b981" : "#f59e0b"} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </section>

        <section className="space-y-10">
          <div className="flex flex-col gap-6 rounded-[2.5rem] border border-white/10 bg-white/5 px-6 py-8 shadow-2xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/50">Visão por Docente</p>
                <h2 className="text-2xl font-black text-white">{selectedTeacher || "Selecione um professor"}</h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <div className="w-full max-w-sm">
                  <Select
                    value={selectedTeacher}
                    onValueChange={(value) => {
                      setSelectedTeacher(value);
                      setShowTeacherSection(true);
                    }}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-white/20 bg-slate-900/60 text-slate-100 shadow-inner backdrop-blur-sm">
                      <SelectValue placeholder="Escolha um professor" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-slate-900 text-white">
                      {teacherSchedules.map((teacher) => (
                        <SelectItem key={teacher.name} className="rounded-lg focus:bg-emerald-500 focus:text-white" value={teacher.name}>
                          {teacher.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowTeacherSection((prev) => !prev)}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-white/15"
                >
                  {showTeacherSection ? "Recolher" : "Expandir"}
                  <ChevronDown className={`h-4 w-4 transition-transform ${showTeacherSection ? "rotate-180" : ""}`} />
                </Button>
              </div>
            </div>

            {showTeacherSection && currentTeacher && (
              <ScheduleGrid
                scheduleByDay={currentTeacher.scheduleByDay}
                classColorMap={classColorMap}
                onLessonClick={handleTeacherLessonClick}
                activeKey={activeKeyTeacher}
                getLessonKey={(l) => `${getSubjectCode(l.className)}|${l.classGroup}`}
                showTeacher={false}
                highlightColor="#10b981"
              />
            )}
          </div>

          <div className="flex flex-col gap-6 rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/5 to-transparent px-6 py-8 shadow-2xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/50">Visão por Turma</p>
                <h2 className="text-2xl font-black text-white">{selectedClass || "Selecione uma turma"}</h2>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                <div className="w-full max-w-sm">
                  <Select
                    value={selectedClass}
                    onValueChange={(value) => {
                      setSelectedClass(value);
                      setShowClassSection(true);
                    }}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-white/20 bg-slate-900/60 text-slate-100 shadow-inner backdrop-blur-sm">
                      <SelectValue placeholder="Escolha uma turma" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-slate-900 text-white">
                      {classSchedules.map((classItem) => (
                        <SelectItem key={classItem.name} className="rounded-lg focus:bg-emerald-500 focus:text-white" value={classItem.name}>
                          {classItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowClassSection((prev) => !prev)}
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-white/15"
                >
                  {showClassSection ? "Recolher" : "Expandir"}
                  <ChevronDown className={`h-4 w-4 transition-transform ${showClassSection ? "rotate-180" : ""}`} />
                </Button>
              </div>
            </div>

            {showClassSection && currentClassSchedule && (
              <ScheduleGrid
                scheduleByDay={currentClassSchedule.scheduleByDay}
                classColorMap={classColorMap}
                onLessonClick={handleClassLessonClick}
                activeKey={activeKeyGroup}
                getLessonKey={(l) => getSubjectCode(l.className)}
                showTeacher={true}
                highlightColor="#f59e0b"
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Index;