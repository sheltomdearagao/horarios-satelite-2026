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
        <section className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 p-8 shadow-[0_30px_90px_rgba(15,23,42,0.75)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-baseline md:gap-6">
            <h1 className="text-4xl font-black text-white md:text-6xl whitespace-nowrap">
              Horários 2026
            </h1>
            <p className="text-sm font-bold uppercase tracking-[0.4em] text-emerald-400 md:text-xl">
              Colégio Estadual Satélite
            </p>
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
                onLessonClick={handleTeacherLessonClick}
                activeClass={activeClassTeacher}
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
