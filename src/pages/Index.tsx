import { useMemo, useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScheduleGrid } from "@/components/ScheduleGrid";
import { classSchedules, classColorMap, teacherSchedules } from "@/data/schedule";
import type { Lesson } from "@/data/schedule";

const Index = () => {
  const [selectedTeacher, setSelectedTeacher] = useState(teacherSchedules[0]?.name ?? "");
  const [selectedClass, setSelectedClass] = useState(classSchedules[0]?.name ?? "");
  
  // Independent highlight states for each section
  const [activeClassTeacher, setActiveClassTeacher] = useState<string | null>(null);
  const [activeClassGroup, setActiveClassGroup] = useState<string | null>(null);

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

  const handleTeacherLessonClick = (lesson: Lesson) => {
    setActiveClassTeacher((current) => (current === lesson.classGroup ? null : lesson.classGroup));
  };

  const handleClassLessonClick = (lesson: Lesson) => {
    setActiveClassGroup((current) => (current === lesson.classGroup ? null : lesson.classGroup));
  };

  return (
    <main className="min-h-screen bg-slate-950 py-6 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 p-6 md:p-8 shadow-[0_30px_90px_rgba(15,23,42,0.75)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-baseline gap-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
                Horários 2026
              </h1>
              <span className="hidden md:inline-block text-sm uppercase tracking-[0.35em] font-semibold text-emerald-300">
                Colégio Estadual Satélite
              </span>
            </div>

            <div className="ml-0 md:ml-4 flex items-center gap-2">
              <span className="inline-block md:hidden text-sm uppercase tracking-[0.35em] font-semibold text-emerald-300">Colégio Estadual Satélite</span>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          {/* Teacher Section */}
          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-6 md:px-6 md:py-8 shadow-lg">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wide text-white/50">Visão por Docente</p>
                <h2 className="text-xl md:text-2xl font-extrabold text-white truncate">{selectedTeacher}</h2>
              </div>
              <div className="w-full max-w-sm">
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger className="h-11 w-full rounded-lg border-white/10 bg-slate-900/50 text-slate-100">
                    <SelectValue placeholder="Escolha um professor" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 text-white">
                    {teacherSchedules.map((teacher) => (
                      <SelectItem key={teacher.name} className="text-sm text-white" value={teacher.name}>
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
                onLessonClick={handleTeacherLessonClick}
                activeClass={activeClassTeacher}
                showTeacher={false}
              />
            )}
          </div>

          {/* Class Section */}
          <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent px-4 py-6 md:px-6 md:py-8 shadow-lg">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wide text-white/50">Visão por Turma</p>
                <h2 className="text-xl md:text-2xl font-extrabold text-white truncate">{selectedClass}</h2>
              </div>
              <div className="w-full max-w-sm">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="h-11 w-full rounded-lg border-white/10 bg-slate-900/50 text-slate-100">
                    <SelectValue placeholder="Escolha uma turma" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-950 text-white">
                    {classSchedules.map((classItem) => (
                      <SelectItem key={classItem.name} className="text-sm text-white" value={classItem.name}>
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
                onLessonClick={handleClassLessonClick}
                activeClass={activeClassGroup}
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