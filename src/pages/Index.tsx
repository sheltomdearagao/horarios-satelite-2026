import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScheduleGrid } from "@/components/ScheduleGrid";
import { classSchedules, classColorMap, teacherSchedules, days } from "@/data/schedule";
import type { Lesson, DayName } from "@/data/schedule";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CalendarDays, Clock, LayoutGrid } from "lucide-react";
import { CalendarPreview } from "@/components/CalendarPreview";
import { OverviewCarousel } from "@/components/OverviewCarousel";

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

const dayNameToWeekdayIndex = (day: DayName) => {
  if (day === "Segunda") return 1;
  if (day === "Terça") return 2;
  if (day === "Quarta") return 3;
  if (day === "Quinta") return 4;
  if (day === "Sexta") return 5;
  return 1;
};

type ModalType = "calendar" | "today" | "overview" | null;

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
  const todayTeacherSchedule =
    teacherMap.get(todayTeacher) ?? teacherSchedules[0] ?? ({ name: "", lessons: [], scheduleByDay: {} } as any);
  const todayClassSchedule =
    classMap.get(todayClass) ?? classSchedules[0] ?? ({ name: "", lessons: [], scheduleByDay: {} } as any);

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

  const computeNextOccurrence = (lesson: Lesson, referenceDate: Date) => {
    const targetWeekday = dayNameToWeekdayIndex(lesson.day);
    const ref = new Date(referenceDate);
    const currentWeekday = ref.getDay();
    const delta = (targetWeekday - currentWeekday + 7) % 7;

    const [start] = lesson.time.split("–").map((s) => s.trim());
    const [hStr, mStr] = start.split(":").map((s) => s.trim());
    const h = Number(hStr) || 0;
    const m = Number(mStr) || 0;

    const candidate = new Date(ref);
    candidate.setHours(h, m, 0, 0);
    candidate.setDate(ref.getDate() + delta);

    if (candidate.getTime() < referenceDate.getTime()) {
      candidate.setDate(candidate.getDate() + 7);
    }

    return candidate;
  };

  const findNextLessonWithDate = (lessons: Lesson[]) => {
    if (!lessons || lessons.length === 0) return null;
    const reference = new Date();
    let best: { lesson: Lesson; date: Date } | null = null;

    for (const lesson of lessons) {
      const occ = computeNextOccurrence(lesson, reference);
      if (occ.getTime() >= reference.getTime()) {
        if (!best || occ.getTime() < best.date.getTime()) {
          best = { lesson, date: occ };
        }
      }
    }

    if (!best) {
      const lesson = lessons[0];
      const occ = computeNextOccurrence(lesson, reference);
      best = { lesson, date: occ };
    }

    return best;
  };

  const nextLessonWithDate = useMemo(() => {
    const baseLessons =
      todayMode === "teacher" ? todayTeacherSchedule?.lessons ?? [] : todayClassSchedule?.lessons ?? [];
    return findNextLessonWithDate(baseLessons);
  }, [todayClassSchedule?.lessons, todayMode, todayTeacherSchedule?.lessons]);

  const todayLessons = useMemo(() => {
    if (!todayName) return [];
    const scheduleByDay = todayMode === "teacher" ? todayTeacherSchedule.scheduleByDay : todayClassSchedule.scheduleByDay;
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
          <div className="flex-1 overflow-y-auto p-5 pb-safe sm:p-6">
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
              <div className="flex gap-2">
                <Button
                  onClick={() => setTodayMode("teacher")}
                  className={`h-10 rounded-2xl px-4 text-xs font-black uppercase tracking-[0.18em] ${
                    todayMode === "teacher" ? "bg-emerald-500/20" : "bg-white/5"
                  }`}
                >
                  Professor
                </Button>
                <Button
                  onClick={() => setTodayMode("class")}
                  className={`h-10 rounded-2xl px-4 text-xs font-black uppercase tracking-[0.18em] ${
                    todayMode === "class" ? "bg-amber-500/20" : "bg-white/5"
                  }`}
                >
                  Turma
                </Button>
              </div>

              <div className="flex items-center justify-end gap-3">
                {todayMode === "teacher" ? (
                  <Select value={todayTeacher} onValueChange={(v) => setTodayTeacher(v)}>
                    <SelectTrigger className="h-10 rounded-xl bg-slate-900/60 text-sm">
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
                    <SelectTrigger className="h-10 rounded-xl bg-slate-900/60 text-sm">
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

          <div className="flex-1 overflow-y-auto px-5 pb-safe pt-4 sm:px-6" style={{ maxHeight: "70vh" }}>
            <div className="space-y-4 pb-2">
              <div className="rounded-[2rem] border border-white/10 bg-slate-900/60 p-4">
                <p className="text-xs uppercase text-white/60">Próxima aula</p>
                {nextLessonWithDate ? (
                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: classColorMap.get(nextLessonWithDate.lesson.classGroup) ?? "#A855F7" }}
                        />
                        <div className="font-black text-white">{nextLessonWithDate.lesson.className}</div>
                      </div>
                      <div className="rounded-full px-3 py-1 text-xs font-bold text-white/80" style={{ backgroundColor: "#ffffff12" }}>
                        {nextLessonWithDate.lesson.periodLabel}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-white/70">
                      {nextLessonWithDate.lesson.time} •{" "}
                      {new Intl.DateTimeFormat("pt-BR", {
                        weekday: "long",
                        day: "2-digit",
                        month: "2-digit",
                      }).format(nextLessonWithDate.date)}
                    </div>
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
                        <div className="text-xs font-bold uppercase text-white/60">{lesson.periodLabel}</div>
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
                          <div className="text-xs uppercase text-white/70">{lesson.shift === "morning" ? "Manhã" : "Tarde"}</div>
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

    if (activeModal === "overview") {
      return (
        <div className="flex h-full flex-col overflow-hidden">
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-xl font-black uppercase tracking-[0.18em]">Visão Geral</DialogTitle>
            <p className="text-sm text-white/70">Deslize entre manhã e tarde em alta resolução.</p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-5 pb-safe sm:p-6">
            <OverviewCarousel />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-3 pb-safe pt-safe sm:px-4">
        <header className="rounded-[2.25rem] border border-white/10 bg-[#0d1b2a] px-5 py-4 shadow-[0_28px_80px_rgba(3,7,18,0.7)]">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white p-0.5 sm:h-20 sm:w-20">
              <img src="/icon-512-transparent.png" alt="Logo" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="text-[1.35rem] font-extrabold tracking-tight text-white sm:text-2xl">Horários 2026</div>
              <div className="mt-0.5 truncate text-sm text-white/80">Colégio Estadual Satélite</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Button onClick={() => openModal("calendar")} className="h-12 w-full justify-between rounded-2xl bg-white/5 px-4 text-white hover:bg-white/10">
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-emerald-300" />
                <span className="font-black uppercase tracking-[0.18em]">Calendário</span>
              </span>
              <span className="text-xs font-semibold text-white/70">{formatShortDateForButton(now)}</span>
            </Button>

            <Button onClick={() => openModal("today")} className="h-12 w-full justify-between rounded-2xl bg-emerald-500/10 px-4 text-white hover:bg-emerald-500/15">
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-emerald-300" />
                <span className="font-black uppercase tracking-[0.18em]">Aulas de hoje</span>
              </span>
              <span className="text-xs font-semibold text-white/70">{formatShortDateForButton(now)}</span>
            </Button>

            <Button onClick={() => openModal("overview")} className="h-12 w-full justify-between rounded-2xl bg-sky-500/10 px-4 text-white hover:bg-sky-500/15">
              <span className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-sky-300" />
                <span className="font-black uppercase tracking-[0.18em]">Visão Geral</span>
              </span>
              <span className="text-xs font-semibold text-white/70">Manhã / Tarde</span>
            </Button>
          </div>
        </header>

        <Dialog open={Boolean(activeModal)} onOpenChange={(open) => (!open ? closeModal() : undefined)}>
          {activeModal && (
            <DialogContent className="max-h-[92vh] max-w-[96vw] rounded-[2rem] border border-white/10 bg-slate-950/95 p-0 text-white shadow-2xl backdrop-blur sm:max-w-2xl">
              {renderModalBody()}
            </DialogContent>
          )}
        </Dialog>

        <div className="mt-6 space-y-6 sm:mt-8 sm:space-y-8">
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.5)] sm:p-5">
            <div className="flex items-center justify-center">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 p-1">
                <button
                  type="button"
                  onClick={() => setTodayMode("teacher")}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] transition ${
                    todayMode === "teacher" ? "bg-emerald-500/20 text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  Professor
                </button>
                <button
                  type="button"
                  onClick={() => setTodayMode("class")}
                  className={`rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] transition ${
                    todayMode === "class" ? "bg-amber-500/20 text-white" : "text-white/60 hover:text-white"
                  }`}
                >
                  Turma
                </button>
              </div>
            </div>

            <div className="mt-3 flex justify-center">
              <div className="w-full max-w-xs">
                {todayMode === "teacher" ? (
                  <Select
                    value={selectedTeacher}
                    onValueChange={(v) => {
                      setSelectedTeacher(v);
                      setSelectedClass("");
                      setShowTeacherSection(true);
                      setShowClassSection(false);
                    }}
                  >
                    <SelectTrigger className="h-10 rounded-xl border-white/10 bg-slate-900/60 text-sm text-white/90">
                      <SelectValue placeholder="Escolha" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-slate-900 text-white">
                      {teacherSchedules.map((t) => (
                        <SelectItem key={t.name} value={t.name}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={selectedClass}
                    onValueChange={(v) => {
                      setSelectedClass(v);
                      setSelectedTeacher("");
                      setShowClassSection(true);
                      setShowTeacherSection(false);
                    }}
                  >
                    <SelectTrigger className="h-10 rounded-xl border-white/10 bg-slate-900/60 text-sm text-white/90">
                      <SelectValue placeholder="Escolha" />
                    </SelectTrigger>
                    <SelectContent className="border-white/10 bg-slate-900 text-white">
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

            <div className="mt-3 flex justify-center">
              <Button
                onClick={() => {
                  if (todayMode === "teacher") setShowTeacherSection((p) => !p);
                  else setShowClassSection((p) => !p);
                }}
                className="h-10 rounded-full bg-white/10 px-4 text-xs font-black uppercase tracking-[0.22em] text-white hover:bg-white/15"
              >
                Ver horários
              </Button>
            </div>
          </div>

          {showTeacherSection && currentTeacher && (
            <div className="overflow-x-hidden rounded-[2.25rem] border border-white/10 bg-white/5 p-4 sm:rounded-[2.5rem] sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[0.65rem] font-bold uppercase text-white/40">Docente</div>
                  <div className="text-2xl font-black text-white">{selectedTeacher}</div>
                </div>
              </div>
              <ScheduleGrid
                scheduleByDay={currentTeacher.scheduleByDay}
                classColorMap={classColorMap}
                onLessonClick={handleTeacherLessonClick}
                activeKey={activeKeyTeacher}
                getLessonKey={(lesson) => `${getSubjectCode(lesson.className)}|${lesson.classGroup}`}
              />
            </div>
          )}

          {showClassSection && currentClassSchedule && (
            <div className="overflow-x-hidden rounded-[2.25rem] border border-white/10 bg-white/5 p-4 sm:rounded-[2.5rem] sm:p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="text-[0.65rem] font-bold uppercase text-white/40">Turma</div>
                  <div className="text-2xl font-black text-white">{selectedClass}</div>
                </div>
              </div>
              <ScheduleGrid
                scheduleByDay={currentClassSchedule.scheduleByDay}
                classColorMap={classColorMap}
                onLessonClick={handleClassLessonClick}
                activeKey={activeKeyGroup}
                getLessonKey={(lesson) => getSubjectCode(lesson.className)}
                showTeacher
                highlightColor="#f59e0b"
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Index;