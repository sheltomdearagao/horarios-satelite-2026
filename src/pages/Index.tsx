
import { useMemo, useState } from "react";
import { CalendarDays, Layers, Sparkles, Users } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScheduleGrid } from "@/components/ScheduleGrid";
import { classSchedules, classColorMap, teacherSchedules } from "@/data/schedule";
import type { Lesson } from "@/data/schedule";

const totalLessons = teacherSchedules.reduce((acc, teacher) => acc + teacher.lessons.length, 0);
const uniqueClassCount = classSchedules.length;

const stats = [
  {
    label: "Professores ativos",
    value: teacherSchedules.length,
    icon: Users,
  },
  {
    label: "Turmas em acompanhamento",
    value: uniqueClassCount,
    icon: Layers,
  },
  {
    label: "Aulas por semana",
    value: totalLessons,
    icon: CalendarDays,
  },
];

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
    setActiveClass((current) => (current === lesson.className ? null : lesson.className));
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
                explore as turmas e acompanhe rapidamente os turnos com uma paleta cromática constante para cada turma.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-3xl border border-white/20 bg-white/10 p-4 text-sm text-slate-100 shadow-lg">
              <p className="font-semibold tracking-[0.35em] text-white/70">Turma em foco</p>
              <p className="text-lg font-bold text-white">
                {activeClass ?? "Clique em uma aula para destacar"}
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <article key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.35em] text-white/60">{stat.label}</span>
                  <stat.icon className="h-5 w-5 text-emerald-300" />
                </div>
                <p className="mt-3 text-3xl font-semibold text-white">{stat.value}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-[1.2fr,0.8fr]">
            <div className="rounded-3xl border border-white/20 bg-white/5 p-4 shadow-xl">
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Modo de uso</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-200">
                Utilize os menus suspensos para filtrar seu nome e turmas. Ao tocar em qualquer aula, todos os cartões dessa
                turma escurecem o contorno e ajudam a visualizar cada ocorrência em manhã e tarde.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-transparent p-4 shadow-xl">
              <div className="relative h-32 overflow-hidden rounded-2xl">
                <img
                  src="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=900&q=80"
                  alt="Professores planejando aulas"
                  className="h-full w-full object-cover object-center"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" aria-hidden />
              </div>
              <p className="mt-4 text-sm text-white/80">
                Cada turma recebe uma cor exclusiva e consistente. Assim você rapidamente reconhece os blocos na sequência de dias.
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
