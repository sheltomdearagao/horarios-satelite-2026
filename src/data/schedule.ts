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

const classGroups = [
  "8º AM", "8º BM", "9º AM", "9º BM", "2º AM", "2º BM", "3º AM", "3º BM",
  "1º AI - P", "1º BI", "1º CI", "2º A Int",
  "6º AV", "6º BV", "7º AV", "7º BV", "8º AV", "9º AV"
];

interface Lesson {
  id: string;
  teacher: string;
  className: string; // Full name e.g. "3º AM - CPEP"
  classGroup: string; // Group name e.g. "3º AM"
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

const findClassGroup = (lessonName: string): string => {
  // Sort groups by length descending to match longest prefix first (e.g. "1º AI - P" before "1º AI")
  const sortedGroups = [...classGroups].sort((a, b) => b.length - a.length);
  for (const group of sortedGroups) {
    if (lessonName.startsWith(group)) {
      return group;
    }
  }
  return "Outros";
};

const rawCsv = scheduleCsv;

const parseCsv = (csv: string): TeacherSchedule[] => {
  const lines = csv.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const headers = lines[0].split(",").map((col) => col.trim());
  const dayHeaders = headers.slice(2).filter(Boolean) as DayName[];

  const createEmptySchedule = (): Record<DayName, { morning: Lesson[]; afternoon: Lesson[] }> => {
    return days.reduce((acc, day) => {
      acc[day] = { morning: [], afternoon: [] };
      return acc;
    }, {} as Record<DayName, { morning: Lesson[]; afternoon: Lesson[] }>);
  };

  const teacherSchedules: TeacherSchedule[] = [];
  let currentTeacher: TeacherSchedule | null = null;

  for (let index = 1; index < lines.length; index += 1) {
    const rawLine = lines[index];
    if (!rawLine.trim()) continue;
    const row = rawLine.split(",").map((cell) => cell.trim());
    const hasMeaning = row.some((cell) => cell.length > 0);
    if (!hasMeaning) continue;

    const teacherName = row[0] || currentTeacher?.name;
    const periodLabel = row[1];
    if (!teacherName || !periodLabel) continue;

    if (!currentTeacher || currentTeacher.name !== teacherName) {
      currentTeacher = {
        name: teacherName,
        lessons: [],
        scheduleByDay: createEmptySchedule(),
      };
      teacherSchedules.push(currentTeacher);
    }

    const periodIndex = periodOrder.indexOf(periodLabel);
    if (periodIndex === -1) continue;

    dayHeaders.forEach((dayName, dayIndex) => {
      const lessonName = row[2 + dayIndex];
      if (!lessonName) return;

      const shift: Shift = periodIndex < 5 ? "morning" : "afternoon";
      const slot = shift === "morning" ? periodIndex : periodIndex - 5;
      const slotInfo = shift === "morning" ? morningSlots[slot] : afternoonSlots[slot];
      if (!slotInfo) return;

      const lesson: Lesson = {
        id: `${teacherName}-${dayName}-${periodLabel}-${slot}`,
        teacher: teacherName,
        className: lessonName,
        classGroup: findClassGroup(lessonName),
        day: dayName,
        shift,
        slot,
        periodLabel: slotInfo.label,
        time: slotInfo.time,
      };

      currentTeacher.lessons.push(lesson);
      currentTeacher.scheduleByDay[dayName][shift].push(lesson);
    });
  }

  const sortLessons = (lessons: Lesson[]) => {
    const dayOrder = days.reduce((acc, day, idx) => {
      acc[day] = idx;
      return acc;
    }, {} as Record<DayName, number>);
    const shiftOrder: Record<Shift, number> = { morning: 0, afternoon: 1 };
    lessons.sort((a, b) => {
      const dayDiff = dayOrder[a.day] - dayOrder[b.day];
      if (dayDiff !== 0) return dayDiff;
      if (shiftOrder[a.shift] !== shiftOrder[b.shift]) {
        return shiftOrder[a.shift] - shiftOrder[b.shift];
      }
      return a.slot - b.slot;
    });
  };

  teacherSchedules.forEach((teacher) => {
    sortLessons(teacher.lessons);
    days.forEach((day) => {
      teacher.scheduleByDay[day].morning.sort((a, b) => a.slot - b.slot);
      teacher.scheduleByDay[day].afternoon.sort((a, b) => a.slot - b.slot);
    });
  });

  return teacherSchedules;
};

const teacherSchedules = parseCsv(rawCsv);

const groupByDay = (lessons: Lesson[]): Record<DayName, { morning: Lesson[]; afternoon: Lesson[] }> => {
  const createEmpty = () =>
    days.reduce((acc, day) => {
      acc[day] = { morning: [], afternoon: [] };
      return acc;
    }, {} as Record<DayName, { morning: Lesson[]; afternoon: Lesson[] }>);

  const grouped = createEmpty();
  lessons.forEach((lesson) => {
    grouped[lesson.day][lesson.shift].push(lesson);
  });
  days.forEach((day) => {
    grouped[day].morning.sort((a, b) => a.slot - b.slot);
    grouped[day].afternoon.sort((a, b) => a.slot - b.slot);
  });
  return grouped;
};

const classLessonsMap = new Map<string, Lesson[]>();
teacherSchedules.forEach((teacher) => {
  teacher.lessons.forEach((lesson) => {
    const bucket = classLessonsMap.get(lesson.classGroup) ?? [];
    bucket.push(lesson);
    classLessonsMap.set(lesson.classGroup, bucket);
  });
});

const classSchedules: ClassSchedule[] = classGroups.map((groupName) => {
  const lessons = classLessonsMap.get(groupName) ?? [];
  const sortedLessons = [...lessons];
  const dayOrder: Record<DayName, number> = days.reduce((acc, day, idx) => {
    acc[day] = idx;
    return acc;
  }, {} as Record<DayName, number>);
  const shiftOrder: Record<Shift, number> = { morning: 0, afternoon: 1 };
  sortedLessons.sort((a, b) => {
    const dayDiff = dayOrder[a.day] - dayOrder[b.day];
    if (dayDiff !== 0) return dayDiff;
    if (shiftOrder[a.shift] !== shiftOrder[b.shift]) return shiftOrder[a.shift] - shiftOrder[b.shift];
    return a.slot - b.slot;
  });

  return {
    name: groupName,
    lessons: sortedLessons,
    scheduleByDay: groupByDay(sortedLessons),
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
