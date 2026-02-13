import { useMemo, useState } from "react";
import { Sparkles } from "lucide-react";

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
        <section className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-950 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.75)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">Painel de Horários</p>
              <h1 className="text-3xl font-semibold leading-tight text-white md:text-4xl">
                Grade inteligente para professores e turmas
              </h1>
              <p className="text-base text-slate-200">
                Um app preparado para dispositivos móveis que coloca o horário completo na ponta dos dedos. Escolha seu nome,
                explore turmas e conte com uma cor exclusiva para cada classe, trazendo ordem visual à rotina semanal.
              </p>
              <p className="text-sm text-slate-300">
                A interação foca no toque — ao selecionar qualquer aula, todos os cartões daquela turma brilham com o mesmo tom
                por toda a semana.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-3xl border border-white/20 bg-white/10 p-4 text-sm text-slate-100 shadow-lg">
              <p className="font-semibold tracking-[0.35em] text-white/70">Turma em foco</p>
              <p className="text-lg font-bold text-white">
                {activeClass ?? "Clique em uma aula para destacar"}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-white/5 px-5 py-6 shadow-[0_25px_60px_rgba(15,23,42,0.5)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Selecione o professor</p>
                <h2 className="text-2xl font-semibold text-white">{selectedTeacher}</h2>
              </div>
              <div className="w-full max-w-sm">
                <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                  <SelectTrigger className="bg-slate-900/40 text-slate-100 shadow-lg">
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
                onLessonClick={handleLessonClick}
                activeClass={activeClass}
                showTeacher
              />
            )}
          </div>

          <div className="flex flex-col gap-2 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-slate-950/40 px-5 py-6 shadow-[0_25px_60px_rgba(15,23,42,0.6)]">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">Selecione a turma</p>
                <h2 className="text-2xl font-semibold text-white">{selectedClass}</h2>
              </div>
              <div className="w-full max-w-sm">
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="bg-slate-900/40 text-slate-100 shadow-lg">
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
                onLessonClick={handleLessonClick}
                activeClass={activeClass}
                showTeacher
              />
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_25px_60px_rgba(15,23,42,0.4)]">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.35em] text-white/60">Atalho rápido</p>
            <Sparkles className="h-5 w-5 text-amber-300" />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-slate-200">
            Use este app como uma PWA no seu dispositivo. Fixe o atalho e tenha acesso off-line ao plano de aulas em segundos.
            Combine os dois filtros para visualizar rapidamente quando uma turma aparece com um professor específico.
          </p>
        </section>
      </div>
    </main>
  );
};

export default Index;
