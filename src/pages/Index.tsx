import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScheduleGrid } from "@/components/ScheduleGrid";
import { classSchedules, classColorMap, teacherSchedules, days } from "@/data/schedule";
import type { Lesson, DayName } from "@/data/schedule";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, Clock } from "lucide-react";
import { CalendarPreview } from "@/components/CalendarPreview";

const getSubjectCode = (lessonName: string) => {
  const segments = lessonName.split("-").map((s) => s.trim());
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

type ModalType = "calendar" | "today" | null;

const formatShortDateForButton = (d: Date) => {
  const weekday = new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(d).toUpperCase();
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${weekday} - ${day}/${month}`;
};

const Index: React.FC = () => {
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [activeKeyTeacher, setActiveKeyTeacher] = useState<string | null>(null);
  const [activeKeyGroup, setActiveKeyGroup] = useState<string | null>(null);
  const [showTeacherSection, setShowTeacherSection] = useState(false);
  const [showClassSection, setShowClassSection] = useState(false);

  const [todayMode, setTodayMode] = useState<"teacher" | "class">("teacher");
  const [todayTeacher, setTodayTeacher] = useState<string>(teacherSchedules[0]?.name ?? "");
  const [todayClass, setTodayClass] = useState<string>(classSchedules[0]?.name ?? "");
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const modalRef = useRef<ModalType | null>(null);

  const now = new Date();
  const weekdayIndex = now.getDay();
  const todayName = weekdayIndexToDayName(weekdayIndex);
  const todayLabelFull = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(now);
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date>(now);

  const teacherMap = useMemo(() => new Map(teacherSchedules.map((t) => [t.name, t])), []);
  const classMap = useMemo(() => new Map(classSchedules.map((c) => [c.name, c])), []);

  const orderedClassSchedules = useMemo(() => {
    const gradeOrder = ["6", "7", "8", "9", "1", "2", "3"];
    return [...classSchedules].sort((a, b) => {
      const matchA = a.name.match(/(\d+)º/);
      const matchB = b.name.match(/(\d+)º/);
      const ga = matchA ? gradeOrder.indexOf(matchA[1]) : gradeOrder.length;
      const gb = matchB ? gradeOrder.indexOf(matchB[1]) : gradeOrder.length;
      if (ga !== gb) return ga - gb;
      return a.name.localeCompare(b.name, "pt-BR");
    });
  }, []);

  const currentTeacher = selectedTeacher ? teacherMap.get(selectedTeacher) : undefined;
  const currentClassSchedule = selectedClass ? classMap.get(selectedClass) : undefined;
  const todayTeacherSchedule = teacherMap.get(todayTeacher) ?? teacherSchedules[0] ?? ({ name: "", lessons: [], scheduleByDay: {} } as any);
  const todayClassSchedule = classMap.get(todayClass) ?? classSchedules[0] ?? ({ name: "", lessons: [], scheduleByDay: {} } as any);

  const dayOrder = days.reduce<Record<DayName, number>>((acc, d, idx) => {
    acc[d] = idx;
    return acc;
  }, {} as Record<DayName, number>);

  const findNextLesson = (lessons: Lesson[]) => {
    if (!lessons || lessons.length === 0) return null;
    const currentDayIndex = todayName ? dayOrder[todayName] : -1;
    for (const lesson of lessons) {
      const lessonDayIndex = dayOrder[lesson.day];
      if (lessonDayIndex < currentDayIndex) continue;
      if (lessonDayIndex === currentDayIndex) {
        const [start] = lesson.time.split("–").map((s) => s.trim());
        const [h, m] = start.split(":").map(Number);
        const minutes = (h || 0) * 60 + (m || 0);
        if (minutes >= minutesNow) return lesson;
      } else {
        return lesson;
      }
    }
    return lessons[0] ?? null;
  };

  const baseLessons = todayMode === "teacher" ? (todayTeacherSchedule?.lessons ?? []) : (todayClassSchedule?.lessons ?? []);
  const nextLesson = useMemo(() => findNextLesson(baseLessons), [baseLessons, minutesNow, todayMode, todayTeacher, todayClass]);

  const openModal = useCallback((modal: Exclude<ModalType, null>) => {
    if (typeof window === "undefined") return;
    if (modalRef.current === null) {
      window.history.pushState({ modal }, "", `#${modal}`);
    } else {
      window.history.replaceState({ modal }, "", `#${modal}`);
    }
    modalRef.current = modal;
    setActiveModal(modal);
  }, []);

  const closeModal = useCallback((fromPopState = false) => {
    modalRef.current = null;
    setActiveModal(null);
    if (!fromPopState && typeof window !== "undefined") {
      window.history.back();
    } else if (typeof window !== "undefined") {
      window.history.replaceState({}, "", "/");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const onPop = () => {
      if (modalRef.current) {
        closeModal(true);
      } else {
        window.history.replaceState({}, "", "/");
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [closeModal]);

  const handleTeacherLessonClick = (lesson: Lesson) => {
    const key = `${getSubjectCode(lesson.className)}|${lesson.classGroup}`;
    setActiveKeyTeacher((cur) => (cur === key ? null : key));
  };

  const handleClassLessonClick = (lesson: Lesson) => {
    const key = getSubjectCode(lesson.className);
    setActiveKeyGroup((cur) => (cur === key ? null : key));
  };

  const todayLessons = useMemo(() => {
    if (!todayName) return [];
    const scheduleByDay = todayMode === "teacher" ? todayTeacherSchedule.scheduleByDay : todayClassSchedule.scheduleByDay;
    if (!scheduleByDay) return [];
    const dayBucket = scheduleByDay[todayName];
    return [...(dayBucket?.morning ?? []), ...(dayBucket?.afternoon ?? [])];
  }, [todayClassSchedule?.scheduleByDay, todayMode, todayName, todayTeacherSchedule?.scheduleByDay]);

  const renderModalBody = () => {
    if (activeModal === "calendar") {
      return (
        <div className="flex h-full flex-col overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-xl font-black uppercase tracking-[0.18em]">Calendário</DialogTitle>
            <p className="text-sm text-white/70">Visual do mês atual</p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            <CalendarPreview
              monthDate={new Date(selectedCalendarDate.getFullYear(), selectedCalendarDate.getMonth(), 1)}
              selectedDate={selectedCalendarDate}
              onSelectDate={(d) => setSelectedCalendarDate(d)}
            />
          </div>
        </div>
      );
    }

    if (activeModal === "today") {
      return (
        <div className="flex h-full flex-col">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-xl font-black uppercase tracking-[0.18em]">Aulas de hoje</DialogTitle>
            <p className="text-sm text-white/70">O sistema usa o dia/horário do seu dispositivo</p>
          </DialogHeader>

          <div className="px-6 pt-4 pb-3 bg-slate-950/80 z-10">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex gap-3">
                <Button onClick={() => setTodayMode("teacher")} className={`h-11 rounded-2xl ${todayMode === "teacher" ? "bg-emerald-500/20" : "bg-white/5"}`}>
                  Por professor
                </Button>
                <Button onClick={() => setTodayMode("class")} className={`h-11 rounded-2xl ${todayMode === "class" ? "bg-amber-500/20" : "bg-white/5"}`}>
                  Por turma
                </Button>
              </div>

              <div className="flex items-center justify-end gap-3">
                {todayMode === "teacher" ? (
                  <Select value={todayTeacher} onValueChange={(v) => setTodayTeacher(v)}>
                    <SelectTrigger className="h-11 rounded-xl bg-slate-900/60">
                      <SelectValue placeholder="Escolha um professor" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900">
                      {teacherSchedules.map((t) => (
                        <SelectItem key={t.name} value={t.name}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select value={todayClass} onValueChange={(v) => setTodayClass(v)}>
                    <SelectTrigger className="h-11 rounded-xl bg-slate-900/60">
                      <SelectValue placeholder="Escolha uma turma" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900">
                      {orderedClassSchedules.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
            <div className="space-y-4">
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-4">
                <p className="text-xs uppercase text-white/60">Próxima aula</p>
                {nextLesson ? (
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: classColorMap.get(nextLesson.classGroup) ?? "#A855F7" }}
                        />
                        <div className="font-black text-white">{nextLesson.className}</div>
                      </div>
                      <div
                        className="text-xs font-bold px-3 py-1 rounded-full text-white/80"
                        style={{ backgroundColor: "#ffffff12" }}
                      >
                        {nextLesson.periodLabel}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-white/70">{nextLesson.time}</div>
                  </div>
                ) : (
                  <div className="mt-2 text-sm text-white/70">Sem próxima aula encontrada.</div>
                )}
              </div>

              {(!todayName || weekdayIndex === 0 || weekdayIndex === 6) ? (
                <div className="rounded-2xl border border-white/10 bg-slate-900/30 px-4 py-4 text-sm text-white/80">
                  <p className="text-base font-black text-white">Não há aulas hoje.</p>
                  <p className="mt-1 text-xs text-white/60">Apenas Segunda a Sexta</p>
                </div>
              ) : todayLessons.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-slate-900/30 px-4 py-4 text-sm text-white/80">
                  <p className="text-base font-black text-white">Não há aulas hoje.</p>
                  <p className="mt-1 text-xs text-white/60">Nenhum horário cadastrado para {todayName}.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayLessons.map((lesson) => (
                    <div key={lesson.id}>
                      <div className="mb-2 flex items-center justify-between">
                        <div className="text-xs text-white/60 font-bold uppercase">{lesson.periodLabel}</div>
                        <div className="text-xs text-white/60">{lesson.time}</div>
                      </div>
                      <div className="mb-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: classColorMap.get(lesson.classGroup) ?? "#A855F7" }}
                            />
                            <div className="font-bold text-white">{lesson.className}</div>
                          </div>
                          <div className="text-xs text-white/70 uppercase">
                            {lesson.shift === "morning" ? "Manhã" : "Tarde"}
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-white/70">
                          {lesson.teacher} • {lesson.classGroup}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <main className="min-h-screen bg-slate-950 py-6 text-slate-100">
      <div className="mx-auto max-w-6xl px-4">
        <header className="flex items-center gap-4 rounded-[2rem] border border-white/10 bg-[#0d1b2a] px-5 py-4 shadow-[0_28px_80px_rgba(3,7,18,0.7)]">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white p-0.5">
            <img src="/icon-512-transparent.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">Horários 2026</div>
            <div className="text-sm text-white/80">Colégio Estadual Satélite</div>
          </div>
        </header>

        <div className="flex gap-3 mt-6">
          <Button onClick={() => openModal("calendar")} className="flex-1 h-12 rounded-2xl">
            <span className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-300" /> Calendário
            </span>
            <span className="text-xs text-white/70 ml-auto">{formatShortDateForButton(now)}</span>
          </Button>

          <Button onClick={() => openModal("today")} className="flex-1 h-12 rounded-2xl bg-emerald-500/10">
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-300" /> Aulas de hoje
            </span>
            <span className="text-xs text-white/70 ml-auto">{formatShortDateForButton(now)}</span>
          </Button>
        </div>

        <Dialog open={Boolean(activeModal)} onOpenChange={(open) => (!open ? closeModal() : undefined)}>
          {activeModal && (
            <DialogContent className="max-h-[92vh] max-w-[94vw] rounded-[2rem] border border-white/10 bg-slate-950 p-0 text-white shadow-2xl sm:max-w-2xl">
              {renderModalBody()}
            </DialogContent>
          )}
        </Dialog>

        <div className="mt-8 space-y-8">
          <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[0.65rem] font-bold uppercase text-white/40">Visão por Docente</div>
                <div className="text-2xl font-black text-white">{selectedTeacher || "Selecione um professor"}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-64">
                  <Select
                    value={selectedTeacher}
                    onValueChange={(v) => {
                      setSelectedTeacher(v);
                      setShowTeacherSection(true);
                    }}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-slate-900/60">
                      <SelectValue placeholder="Escolha um professor" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900">
                      {teacherSchedules.map((t) => (
                        <SelectItem key={t.name} value={t.name}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => setShowTeacherSection((p) => !p)} variant="secondary">
                  {showTeacherSection ? "Recolher" : "Expandir"}
                </Button>
              </div>
            </div>

            {showTeacherSection && currentTeacher && (
              <ScheduleGrid
                scheduleByDay={currentTeacher.scheduleByDay}
                classColorMap={classColorMap}
                onLessonClick={handleTeacherLessonClick}
                activeKey={activeKeyTeacher}
                getLessonKey={(lesson) => `${getSubjectCode(lesson.className)}|${lesson.classGroup}`}
              />
            )}
          </div>

          <div className="rounded-[2.5rem] border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[0.65rem] font-bold uppercase text-white/40">Visão por Turma</div>
                <div className="text-2xl font-black text-white">{selectedClass || "Selecione uma turma"}</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-64">
                  <Select
                    value={selectedClass}
                    onValueChange={(v) => {
                      setSelectedClass(v);
                      setShowClassSection(true);
                    }}
                  >
                    <SelectTrigger className="h-12 rounded-xl bg-slate-900/60">
                      <SelectValue placeholder="Escolha uma turma" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900">
                      {orderedClassSchedules.map((c) => (
                        <SelectItem key={c.name} value={c.name}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => setShowClassSection((p) => !p)} variant="secondary">
                  {showClassSection ? "Recolher" : "Expandir"}
                </Button>
              </div>
            </div>

            {showClassSection && currentClassSchedule && (
              <ScheduleGrid
                scheduleByDay={currentClassSchedule.scheduleByDay}
                classColorMap={classColorMap}
                onLessonClick={handleClassLessonClick}
                activeKey={activeKeyGroup}
                getLessonKey={(lesson) => getSubjectCode(lesson.className)}
                showTeacher
                highlightColor="#f59e0b"
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Index;
