import matrixARaw from "./horario-manha-corrigido.csv?raw";
import matrixBRaw from "./horario-tarde-corrigido.csv?raw";

const days = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"] as const;

type DayName = (typeof days)[number];

type Shift = "morning" | "afternoon";

type MatrixDayKey = "SEG" | "TER" | "QUA" | "QUI" | "SEX";

const matrixDayToDayName: Record<MatrixDayKey, DayName> = {
  SEG: "Segunda",
  TER: "Terça",
  QUA: "Quarta",
  QUI: "Quinta",
  SEX: "Sexta",
};

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

const stripBom = (s: string) => s.replace(/^\uFEFF/, "");

const detectDelimiter = (headerLine: string) => {
  const line = stripBom(headerLine);
  const semi = (line.match(/;/g) ?? []).length;
  const comma = (line.match(/,/g) ?? []).length;
  return semi >= comma ? ";" : ",";
};

const normalizeCell = (value: string) =>
  stripBom(value)
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^"|"$/g, "")
    .trim();

const normalizeClassGroup = (value: string) =>
  value
    .replace(/\t/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const createEmptySchedule = (): Record<DayName, { morning: Lesson[]; afternoon: Lesson[] }> => {
  return days.reduce((acc, day) => {
    acc[day] = { morning: [], afternoon: [] };
    return acc;
  }, {} as Record<DayName, { morning: Lesson[]; afternoon: Lesson[] }>);
};

const splitDisciplineTeacher = (value: string): { subject: string; teacher: string } | null => {
  const text = value.trim();
  if (!text) return null;
  if (text.toLowerCase() === "sem aula") return null;
  const idx = text.lastIndexOf(" - ");
  if (idx === -1) return null;
  const subject = text.slice(0, idx).trim();
  const teacher = text.slice(idx + 3).trim();
  if (!subject || !teacher) return null;
  return { subject, teacher };
};

const inferShiftFromHeaders = (headers: string[]): Shift | null => {
  const joined = headers.join("|");
  if (/\b\d+º\s*(AM|BM)\b/.test(joined)) return "morning";
  if (/\b\d+º\s*(AV|BV)\b/.test(joined)) return "afternoon";
  return null;
};

const mapRawDayToMatrixKey = (rawDay: string | undefined): MatrixDayKey | null => {
  if (!rawDay) return null;
  const v = rawDay.trim().toLowerCase();
  if (v.startsWith("seg")) return "SEG";
  if (v.startsWith("ter")) return "TER";
  if (v.startsWith("terça") || v.startsWith("terca")) return "TER";
  if (v.startsWith("qua")) return "QUA";
  if (v.startsWith("qui")) return "QUI";
  if (v.startsWith("sex")) return "SEX";
  return null;
};

const parseMatrixCsv = (csv: string, forceShift?: Shift) => {
  const lines = stripBom(csv)
    .split(/\r?\n/)
    .map((l) => l.trimEnd())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return { shift: null as Shift | null, classGroups: [] as string[], lessons: [] as Lesson[] };
  }

  const delimiter = detectDelimiter(lines[0]);
  const headers = lines[0].split(delimiter).map(normalizeCell);

  // Dia;Horário;Turma1;Turma2...
  const headerClassGroups = headers
    .slice(2)
    .map((h) => normalizeClassGroup(h))
    .filter((h) => h.length > 0);

  const inferred = inferShiftFromHeaders(headerClassGroups);
  const shift = forceShift ?? inferred;

  const slotInfoByIndex = (slotIndex: number) => {
    if (!shift) return null;
    const slots = shift === "morning" ? morningSlots : afternoonSlots;
    return slots[slotIndex] ?? null;
  };

  let currentMatrixDay: MatrixDayKey | null = null;
  const lessons: Lesson[] = [];

  for (let i = 1; i < lines.length; i += 1) {
    const cols = lines[i].split(delimiter).map(normalizeCell);
    const rawDay = cols[0];
    const rawHour = cols[1];

    if (rawDay) {
      const mapped = mapRawDayToMatrixKey(rawDay);
      if (mapped) currentMatrixDay = mapped;
    }

    if (!currentMatrixDay) continue;
    const day = matrixDayToDayName[currentMatrixDay];

    const hourNum = Number(rawHour);
    if (!Number.isFinite(hourNum) || hourNum < 1 || hourNum > 5) continue;
    const slot = hourNum - 1;

    if (!shift) continue;
    const slotInfo = slotInfoByIndex(slot);
    if (!slotInfo) continue;

    for (let c = 0; c < headerClassGroups.length; c += 1) {
      const classGroup = headerClassGroups[c];
      const cell = cols[2 + c] ?? "";
      if (!cell) continue;

      const parsed = splitDisciplineTeacher(cell);
      if (!parsed) continue;

      const className = `${classGroup} - ${parsed.subject}`;

      lessons.push({
        id: `${classGroup}__${day}__${shift}__${slot}__${className}__${parsed.teacher}`,
        teacher: parsed.teacher,
        className,
        classGroup,
        day,
        shift,
        slot,
        periodLabel: slotInfo.label,
        time: slotInfo.time,
      });
    }
  }

  return { shift, classGroups: headerClassGroups, lessons };
};

const sortLessons = (lessons: Lesson[]) => {
  const dayOrder: Record<DayName, number> = days.reduce((acc, d, idx) => {
    acc[d] = idx;
    return acc;
  }, {} as Record<DayName, number>);
  const shiftOrder: Record<Shift, number> = { morning: 0, afternoon: 1 };

  lessons.sort((a, b) => {
    const dayDiff = dayOrder[a.day] - dayOrder[b.day];
    if (dayDiff !== 0) return dayDiff;
    const shiftDiff = shiftOrder[a.shift] - shiftOrder[b.shift];
    if (shiftDiff !== 0) return shiftDiff;
    return a.slot - b.slot;
  });
};

const groupByDay = (lessons: Lesson[]): Record<DayName, { morning: Lesson[]; afternoon: Lesson[] }> => {
  const grouped = createEmptySchedule();
  lessons.forEach((lesson) => {
    grouped[lesson.day][lesson.shift].push(lesson);
  });
  days.forEach((day) => {
    grouped[day].morning.sort((a, b) => a.slot - b.slot);
    grouped[day].afternoon.sort((a, b) => a.slot - b.slot);
  });
  return grouped;
};

const parsedA = parseMatrixCsv(matrixARaw as string, "morning");
const parsedB = parseMatrixCsv(matrixBRaw as string, "afternoon");

const allLessons = [...parsedA.lessons, ...parsedB.lessons];

// class order: (A headers) + (B headers) + (any group found in lessons)
const classGroups: string[] = [];
const seen = new Set<string>();

[parsedA.classGroups, parsedB.classGroups].forEach((groups) => {
  groups.forEach((g) => {
    const key = normalizeClassGroup(g);
    if (!key) return;
    if (seen.has(key)) return;
    seen.add(key);
    classGroups.push(key);
  });
});

allLessons.forEach((l) => {
  const key = normalizeClassGroup(l.classGroup);
  if (!key) return;
  if (seen.has(key)) return;
  seen.add(key);
  classGroups.push(key);
});

// class schedules
const classLessonBuckets = new Map<string, Lesson[]>();
allLessons.forEach((lesson) => {
  const key = normalizeClassGroup(lesson.classGroup);
  const bucket = classLessonBuckets.get(key) ?? [];
  bucket.push({ ...lesson, classGroup: key });
  classLessonBuckets.set(key, bucket);
});

const classSchedules: ClassSchedule[] = classGroups.map((groupName) => {
  const lessons = [...(classLessonBuckets.get(groupName) ?? [])];
  sortLessons(lessons);
  return {
    name: groupName,
    lessons,
    scheduleByDay: groupByDay(lessons),
  };
});

// teacher schedules
const teacherMap = new Map<string, Lesson[]>();
allLessons.forEach((lesson) => {
  const bucket = teacherMap.get(lesson.teacher) ?? [];
  bucket.push(lesson);
  teacherMap.set(lesson.teacher, bucket);
});

const teacherSchedules: TeacherSchedule[] = Array.from(teacherMap.entries())
  .sort(([a], [b]) => a.localeCompare(b, "pt-BR"))
  .map(([teacher, lessons]) => {
    const sorted = [...lessons];
    sortLessons(sorted);
    return {
      name: teacher,
      lessons: sorted,
      scheduleByDay: groupByDay(sorted),
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
  "#06B6D4",
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

const classScheduleMap = new Map(classSchedules.map((item) => [item.name, item] as const));

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