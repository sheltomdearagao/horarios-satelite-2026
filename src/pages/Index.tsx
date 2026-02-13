import { useMemo, useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScheduleGrid } from "@/components/ScheduleGrid";
import { classSchedules, classColorMap, teacherSchedules } from "@/data/schedule";
import type { Lesson } from "@/data/schedule";

const Index = () => {
  const [selectedTeacher, setSelectedTeacher] = useState(teacherSchedules[0]?.name ?? "");
  const [selectedClass, setSelectedClass] = useState(classSchedules[0]?.name ?? "");
  const [activeClass, setActiveClass] = useState<string | null>(null);

  const teacherMap = useMemo(
    () => new Map(teacherSchedules.map((teacher) => [teacher.name, teacher])),
    [],
  );

  const classMap = useMemo(
    () => new Map(classSchedules.map((classItem) => [classItem.name, classItem])),
    [],
  );

  const currentTeacher = teacherMap.get(selectedTeacher) ?? teacherSchedules[0];
  const currentClassSchedule = classMap.get(selectedClass) ?? classSchedules[0];

  const handleLessonClick = (lesson: Lesson) => {
    setActiveClass((current) => (current === lesson.classGroup ? null : lesson.classGroup));
  };

  return (
    <main className="min-h-screen bg-slate-950 py-6 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
        <section className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.75)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-bold uppercase tracking-[0.5em] text-emerald-400">Sistema de Gestão</p>
              <h1 className="text-3xl font-black leading-tight text-white md:text-5xl">
                Horários Colégio Estadual Satélite 2026
              </h1>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl border border-white/20 bg-white/10 p-4 text-center shadow-xl backdrop-blur-md">
              <p className="text-[0.6rem] font-black uppercase tracking-widest text-white/60">Turma em foco</p>
              <p className="text-lg font-bold text-emerald-300">
                {activeClass ?? "Nenhuma selecionada"}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-10">
          {/* Teacher Section */}
          <div className="flex flex-col gap-6 rounded-[2.5rem] border border-white/10 bg-white/5 px-6 py-8 shadow-2xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.4em] text-white/40">Visão por Docente</p>
                <h2 className="text-2xl font-black text-white">{selectedTeacher}</h2>
              </div>
              <div className="w-full max-w-sm">
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
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
            </div>
            {currentTeacher && (
              <ScheduleGrid
                scheduleByDay={currentTeacher.scheduleByDay}
                classColorMap={classColorMap}
                onLessonClick={handleLessonClick}
                activeClass={activeClass}
                showTeacher={false}
              />
            )}
          </div>

          {/* Class Section */}
          <div className="flex flex-col gap-6 rounded-[2.5rem] border border-white/10 bg-gradient-to-b from-white/5 to-transparent px-6 py-8 shadow-2xl">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.4em] text-white/40">Visão por Turma</p>
                <h2 className="text-2xl font-black text-white">{selectedClass}</h2>
              </div>
              <div className="w-full max-w-sm">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
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
            </div>
            {currentClassSchedule && (
              <ScheduleGrid
                scheduleByDay={currentClassSchedule.scheduleByDay}
                classColorMap={classColorMap}
                onLessonClick={handleLessonClick}
                activeClass={activeClass}
                showTeacher={true}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default Index;
