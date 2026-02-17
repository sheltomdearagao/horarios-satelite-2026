import tarde from "@/data/horario-tarde.txt?raw";
import manha from "@/data/horario-manha.txt?raw";

const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"] as const;

type DayName = (typeof days)[number];

type Shift = "morning" | "afternoon";

const morningSlots = [
  { label: "1º Horário", time: "07:30 – 08:05" },
  { label: "2º Horário", time: "08:05 – 08:50" },
  { label: "3º Horário", time: "08:50 – 09:35" },
  { label: "4º Horário", time: "10:05 – 10:55" },
  { label: "5º Horário", time: "10:55 – 11:40" },
];

const afternoonSlots = [
  { label: "1º Horário", time: "13:30 – 14:10" },
  { label: "2º Horário", time: "14:10 – 14:50" },
  { label: "3º Horário", time: "14:50 – 15:30" },
  { label: "4º Horário", time: "16:00 – 16:40" },
  { label: "5º Horário", time: "16:40 – 17:20" },
];

interface Lesson {
  id: string;
  teacher: string;
  className: string;
  classGroup: string;
  day: DayName;
  shift: Shift;
  slot: number;
  periodLabel: string;
  time: string;
}

interface TeacherSchedule {
  name: string;
  lessons: Lesson[];
  scheduleByDay: Record<DayName, { morning: Lesson[]; afternoon: Lesson[] }>;
}

interface ClassSchedule {
  name: string;
  lessons: Lesson[];
  scheduleByDay: Record<DayName, { morning: Lesson[]; afternoon: Lesson[] }>;
}

type RawScheduleJson = unknown;

const normalizeDay = (value: string): DayName | null => {
  const v = value.trim().toLowerCase();
  if (v.startsWith("seg")) return "Segunda";
  if (v.startsWith("ter")) return "Terça";
  if (v.startsWith("qua")) return "Quarta";
  if (v.startsWith("qui")) return "Quinta";
  if (v.startsWith("sex")) return "Sexta";
  return null;
};

const createEmptySchedule = (): Record<DayName, { morning: Lesson[]; afternoon: Lesson[] }> =>
  days.reduce((acc, d) => {
    acc[d] = { morning: [], afternoon: [] };
    return acc;
  }, {} as Record<DayName, { morning: Lesson[]; afternoon: Lesson[] }>);

const safeJsonParse = (raw: string): RawScheduleJson => {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  return JSON.parse(trimmed) as RawScheduleJson;
};

const toArray = (data: RawScheduleJson): unknown[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data;
    if (Array.isArray(obj.aulas)) return obj.aulas;
    if (Array.isArray(obj.lessons)) return obj.lessons;
  }
  return [];
};

const getClassGroup = (item: Record<string, unknown>) =>
  (item.classGroup ?? item.turma ?? item.class ?? item.grupo ?? item.group) as string | undefined;

const getTeacher = (item: Record<string, unknown>) =>
  (item.teacher ?? item.professor ?? item.prof ?? item.docente) as string | undefined;

const getSubject = (item: Record<string, unknown>) =>
  (item.subject ?? item.disciplina ?? item.materia ?? item.sigla) as string | undefined;

const getDay = (item: Record<string, unknown>) => (item.day ?? item.dia) as string | undefined;

const getSlot = (item: Record<string, unknown>) => (item.slot ?? item.horario ?? item.aula) as number | string | undefined;

const parseLessonsFromJson = (data: RawScheduleJson, shift: Shift): Lesson[] => {
  const arr = toArray(data);
  const slotInfo = shift === "morning" ? morningSlots : afternoonSlots;

  const lessons: Lesson[] = [];

  arr.forEach((raw, index) => {
    if (!raw || typeof raw !== "object") return;
    const item = raw as Record<string, unknown>;

    const classGroup = getClassGroup(item);
    const teacher = getTeacher(item);
    const subject = getSubject(item);
    const dayRaw = getDay(item);

    const day = typeof dayRaw === "string" ? normalizeDay(dayRaw) : null;

    const slotRaw = getSlot(item);
    const slotNum =
      typeof slotRaw === "number"
        ? slotRaw
        : typeof slotRaw === "string"
          ? Number(slotRaw)
          : undefined;

    if (!classGroup || !teacher || !subject || !day || slotNum === undefined || Number.isNaN(slotNum)) return;

    const slot0 = slotNum >= 1 && slotNum <= 5 ? slotNum - 1 : slotNum;
    if (slot0 < 0 || slot0 >= slotInfo.length) return;

    const periodLabel = slotInfo[slot0].label;
    const time = slotInfo[slot0].time;

    lessons.push({
      id: `${teacher}-${classGroup}-${day}-${shift}-${slot0}-${subject}-${index}`,
      teacher,
      className: `${classGroup} - ${subject}`,
      classGroup,
      day,
      shift,
      slot: slot0,
      periodLabel,
      time,
    });
  });

  return lessons;
};

const manhaJson = safeJsonParse(manha);
const tardeJson = safeJsonParse(tarde);

const lessons = [...parseLessonsFromJson(manhaJson, "morning"), ...parseLessonsFromJson(tardeJson, "afternoon")];

const teacherScheduleMap = lessons.reduce<Map<string, TeacherSchedule>>((map, lesson) => {
  const existing = map.get(lesson.teacher);
  if (!existing) {
    map.set(lesson.teacher, {
      name: lesson.teacher,
      lessons: [lesson],
      scheduleByDay: createEmptySchedule(),
    });
  } else {
    existing.lessons.push(lesson);
  }
  return map;
}, new Map());

const teacherSchedules = Array.from(teacherScheduleMap.values());
teacherSchedules.forEach((teacher) => {
  teacher.lessons.forEach((lesson) => {
    teacher.scheduleByDay[lesson.day][lesson.shift].push(lesson);
  });
  days.forEach((d) => {
    teacher.scheduleByDay[d].morning.sort((a, b) => a.slot - b.slot);
    teacher.scheduleByDay[d].afternoon.sort((a, b) => a.slot - b.slot);
  });
});

const classLessonsMap = lessons.reduce((acc, lesson) => {
  const list = acc.get(lesson.classGroup) ?? [];
  list.push(lesson);
  acc.set(lesson.classGroup, list);
  return acc;
}, new Map<string, Lesson[]>());

const classGroups = Array.from(classLessonsMap.keys()).sort((a, b) => a.localeCompare(b, "pt-BR"));

const classSchedules: ClassSchedule[] = classGroups.map((groupName) => {
  const groupLessons = classLessonsMap.get(groupName) ?? [];
  const sortedLessons = [...groupLessons].sort((a, b) => {
    const dayDiff = days.indexOf(a.day) - days.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    if (a.shift !== b.shift) return a.shift === "morning" ? -1 : 1;
    return a.slot - b.slot;
  });

  const scheduleByDay = createEmptySchedule();
  sortedLessons.forEach((lesson) => {
    scheduleByDay[lesson.day][lesson.shift].push(lesson);
  });
  days.forEach((d) => {
    scheduleByDay[d].morning.sort((a, b) => a.slot - b.slot);
    scheduleByDay[d].afternoon.sort((a, b) => a.slot - b.slot);
  });

  return {
    name: groupName,
    lessons: sortedLessons,
    scheduleByDay,
  };
});

const classColorPalette = [
  "#EF4444",
  "#EA580C",
  "#F97316",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#0EA5E9",
  "#6366F1",
  "#A855F7",
  "#EC4899",
  "#F43F5E",
  "#14B8A6",
  "#0F766E",
  "#2563EB",
  "#0EA5E9",
  "#F472B6",
  "#C084FC",
];

const pickColor = (name: string) => {
  const hash = Array.from(name).reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return classColorPalette[hash % classColorPalette.length];
};

const classColorMap = new Map<string, string>();
classSchedules.forEach((classItem) => {
  classColorMap.set(classItem.name, pickColor(classItem.name));
});

const classScheduleMap = new Map(classSchedules.map((item) => [item.name, item]));

export {
  days,
  morningSlots,
  afternoonSlots,
  teacherSchedules,
  classSchedules,
  classScheduleMap,
  classColorMap,
  classGroups,
};
export type { DayName, Lesson, TeacherSchedule, ClassSchedule };