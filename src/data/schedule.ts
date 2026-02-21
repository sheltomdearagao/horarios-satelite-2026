import scheduleCsv from "./horario-2026.csv?raw";

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

const periodOrder = ["1ª", "2ª", "3ª", "4ª", "5ª", "6ª", "7ª", "8ª", "9ª", "10ª"];

type CsvRow = {
  teacher: string;
  period: string;
  byDay: Partial<Record<DayName, string>>;
};

const normalizeCell = (value: string) => value.replace(/^"|"$/g, "").trim();

const parseScheduleCsvToRows = (csv: string): CsvRow[] => {
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((c) => normalizeCell(c));
  const dayHeaders = headers.slice(2).filter(Boolean) as DayName[];

  const rows: CsvRow[] = [];
  let currentTeacher = "";

  for (let i = 1; i < lines.length; i += 1) {
    const cols = lines[i].split(",").map((c) => normalizeCell(c));

    const teacher = cols[0] || currentTeacher;
    const period = cols[1];
    if (!teacher || !period) continue;

    currentTeacher = teacher;

    const byDay: CsvRow["byDay"] = {};
    dayHeaders.forEach((day, idx) => {
      const cell = cols[2 + idx] ?? "";
      if (cell) byDay[day] = cell;
    });

    rows.push({ teacher, period, byDay });
  }

  return rows;
};

const extractClassGroup = (className: string) => {
  // CSV segue padrão: "8º AM - MAT" => grupo é a parte antes de " - "
  const idx = className.indexOf(" - ");
  if (idx === -1) return className.trim();
  return className.slice(0, idx).trim();
};

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

const createEmptySchedule = (): Record<DayName, { morning: Lesson[]; afternoon: Lesson[] }> => {
  return days.reduce((acc, day) => {
    acc[day] = { morning: [], afternoon: [] };
    return acc;
  }, {} as Record<DayName, { morning: Lesson[]; afternoon: Lesson[] }>);
};

const buildSchedulesFromRows = (rows: CsvRow[]) => {
  const teacherMap = new Map<string, TeacherSchedule>();
  const classLessonBuckets = new Map<string, Lesson[]>();

  for (const row of rows) {
    const periodIndex = periodOrder.indexOf(row.period);
    if (periodIndex === -1) continue;

    const shift: Shift = periodIndex < 5 ? "morning" : "afternoon";
    const slot = shift === "morning" ? periodIndex : periodIndex - 5;
    const slotInfo = shift === "morning" ? morningSlots[slot] : afternoonSlots[slot];
    if (!slotInfo) continue;

    if (!teacherMap.has(row.teacher)) {
      teacherMap.set(row.teacher, {
        name: row.teacher,
        lessons: [],
        scheduleByDay: createEmptySchedule(),
      });
    }

    const teacherSchedule = teacherMap.get(row.teacher)!;

    for (const day of days) {
      const lessonName = row.byDay[day];
      if (!lessonName) continue;

      const classGroup = extractClassGroup(lessonName);
      const lesson: Lesson = {
        id: `${row.teacher}__${day}__${row.period}__${lessonName}`,
        teacher: row.teacher,
        className: lessonName,
        classGroup,
        day,
        shift,
        slot,
        periodLabel: slotInfo.label,
        time: slotInfo.time,
      };

      teacherSchedule.lessons.push(lesson);
      teacherSchedule.scheduleByDay[day][shift].push(lesson);

      const bucket = classLessonBuckets.get(classGroup) ?? [];
      bucket.push(lesson);
      classLessonBuckets.set(classGroup, bucket);
    }
  }

  // sort teacher lessons & per-day buckets
  const dayOrder: Record<DayName, number> = days.reduce((acc, day, idx) => {
    acc[day] = idx;
    return acc;
  }, {} as Record<DayName, number>);
  const shiftOrder: Record<Shift, number> = { morning: 0, afternoon: 1 };

  const sortLessons = (lessons: Lesson[]) => {
    lessons.sort((a, b) => {
      const dayDiff = dayOrder[a.day] - dayOrder[b.day];
      if (dayDiff !== 0) return dayDiff;
      const shiftDiff = shiftOrder[a.shift] - shiftOrder[b.shift];
      if (shiftDiff !== 0) return shiftDiff;
      return a.slot - b.slot;
    });
  };

  const teacherSchedules = Array.from(teacherMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  teacherSchedules.forEach((t) => {
    sortLessons(t.lessons);
    days.forEach((d) => {
      t.scheduleByDay[d].morning.sort((a, b) => a.slot - b.slot);
      t.scheduleByDay[d].afternoon.sort((a, b) => a.slot - b.slot);
    });
  });

  // Build class list from CSV truth, preserving CSV order of first appearance
  const classOrder: string[] = [];
  const seen = new Set<string>();
  rows.forEach((r) => {
    for (const day of days) {
      const lessonName = r.byDay[day];
      if (!lessonName) continue;
      const group = extractClassGroup(lessonName);
      if (!seen.has(group)) {
        seen.add(group);
        classOrder.push(group);
      }
    }
  });

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

  const classSchedules: ClassSchedule[] = classOrder.map((className) => {
    const lessons = classLessonBuckets.get(className) ?? [];
    const sorted = [...lessons];
    sortLessons(sorted);
    return {
      name: className,
      lessons: sorted,
      scheduleByDay: groupByDay(sorted),
    };
  });

  return { teacherSchedules, classSchedules, classOrder };
};

const rows = parseScheduleCsvToRows(scheduleCsv);
const { teacherSchedules, classSchedules, classOrder: classGroups } = buildSchedulesFromRows(rows);

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
