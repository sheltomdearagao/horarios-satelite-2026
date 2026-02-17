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

const classGroups = [
  "6º AV",
  "6º BV",
  "7º AV",
  "7º BV",
  "8º AM",
  "8º AV",
  "8º BV",
  "9º AM",
  "9º AV",
  "9º BV",
  "1º AI - P",
  "1º BI",
  "1º CI",
  "2º A Int",
  "2º AM",
  "2º BM",
  "3º AM",
  "3º BM",
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

const classDefinitions: Array<{
  classGroup: string;
  teacher: string;
  schedule: Partial<Record<DayName, { morning?: string[]; afternoon?: string[] }>>;
}> = [
  {
    classGroup: "6º AV",
    teacher: "Everton",
    schedule: {
      Segunda: { afternoon: ["GEO"] },
      Terça: { afternoon: ["GEO"] },
      Quarta: { afternoon: ["GEO"] },
      Quinta: { afternoon: ["GEO"] },
      Sexta: { afternoon: ["GEO"] },
    },
  },
  {
    classGroup: "6º BV",
    teacher: "Everton",
    schedule: {
      Segunda: { afternoon: ["GEO"] },
      Terça: { afternoon: ["GEO"] },
      Quarta: { afternoon: ["GEO"] },
      Quinta: { afternoon: ["GEO"] },
      Sexta: { afternoon: ["GEO"] },
    },
  },
  {
    classGroup: "7º AV",
    teacher: "Larissa",
    schedule: {
      Segunda: { afternoon: ["SOC"] },
      Terça: { afternoon: ["HIS"] },
      Quarta: { afternoon: ["HIS"] },
      Quinta: { afternoon: ["SOC"] },
      Sexta: { afternoon: ["FIL"] },
    },
  },
  {
    classGroup: "7º BV",
    teacher: "Larissa",
    schedule: {
      Segunda: { afternoon: ["HIS"] },
      Terça: { afternoon: ["FIL"] },
      Quarta: { afternoon: ["HIS"] },
      Quinta: { afternoon: ["GEO"] },
      Sexta: { afternoon: ["SOC"] },
    },
  },
  {
    classGroup: "8º AM",
    teacher: "Sheltom",
    schedule: {
      Segunda: { morning: ["LP"] },
      Terça: { morning: ["LP"] },
      Quarta: { morning: ["LP"] },
      Quinta: { morning: ["LP"] },
      Sexta: { morning: ["LP"] },
    },
  },
  {
    classGroup: "8º AV",
    teacher: "Sheltom",
    schedule: {
      Segunda: { afternoon: ["LP"] },
      Terça: { afternoon: ["LP"] },
      Quarta: { afternoon: ["ING"] },
      Quinta: { afternoon: ["LP", "LP", "ING", "HIS", "GEO"] },
      Sexta: { afternoon: ["GEO", "GEO", "ART", "ART", "HIS"] },
    },
  },
  {
    classGroup: "8º BV",
    teacher: "Cris",
    schedule: {
      Segunda: { afternoon: ["ART"] },
      Terça: { afternoon: ["ING"] },
      Quarta: { afternoon: ["ART"] },
      Quinta: { afternoon: ["GEO"] },
      Sexta: { afternoon: ["ART"] },
    },
  },
  {
    classGroup: "9º AM",
    teacher: "Ek",
    schedule: {
      Segunda: { morning: ["HIS"] },
      Terça: { morning: ["HIS"] },
      Quarta: { morning: ["HIS"] },
      Quinta: { morning: ["MAT"] },
      Sexta: { morning: ["ING"] },
    },
  },
  {
    classGroup: "9º AV",
    teacher: "Ek",
    schedule: {
      Segunda: { afternoon: ["EF"] },
      Terça: { afternoon: ["ING"] },
      Quarta: { afternoon: ["HIS"] },
      Quinta: { afternoon: ["EF", "ING", "HIS", "LP", "LP"] },
      Sexta: { afternoon: ["HIS", "HIS", "GEO", "ING", "ART"] },
    },
  },
  {
    classGroup: "9º BV",
    teacher: "Rubi",
    schedule: {
      Segunda: { afternoon: ["ART"] },
      Terça: { afternoon: ["SOC"] },
      Quarta: { afternoon: ["HIS"] },
      Quinta: { afternoon: ["ART"] },
      Sexta: { afternoon: ["SOC"] },
    },
  },
  {
    classGroup: "1º AI - P",
    teacher: "Francisco",
    schedule: {
      Segunda: { morning: ["HIS"], afternoon: ["HBC"] },
      Terça: { morning: ["HIS"], afternoon: ["ETNO"] },
      Quarta: { morning: ["HIS"], afternoon: ["ETNO"] },
      Quinta: { morning: ["HIS"], afternoon: ["SOC"] },
      Sexta: { morning: ["HIS"], afternoon: ["SOC"] },
    },
  },
  {
    classGroup: "1º BI",
    teacher: "Valéria",
    schedule: {
      Segunda: { morning: ["BIO"], afternoon: ["FIS"] },
      Terça: { morning: ["BIO"], afternoon: ["FIS"] },
      Quarta: { morning: ["BIO"], afternoon: ["QUI"] },
      Quinta: { morning: ["BIO"], afternoon: ["QUI"] },
      Sexta: { morning: ["BIO"], afternoon: ["QUI"] },
    },
  },
  {
    classGroup: "1º CI",
    teacher: "Valéria",
    schedule: {
      Segunda: { morning: ["BIO"], afternoon: ["QUI"] },
      Terça: { morning: ["BIO"], afternoon: ["QUI"] },
      Quarta: { morning: ["BIO"], afternoon: ["FIS"] },
      Quinta: { morning: ["BIO"], afternoon: ["FIS"] },
      Sexta: { morning: ["BIO"], afternoon: ["FIL"] },
    },
  },
  {
    classGroup: "2º A Int",
    teacher: "Beta",
    schedule: {
      Segunda: { morning: ["LP"], afternoon: ["LP"] },
      Terça: { morning: ["LP"], afternoon: ["SOC"] },
      Quarta: { morning: ["LP"], afternoon: ["HIS"] },
      Quinta: { morning: ["LP"], afternoon: ["HIS"] },
      Sexta: { morning: ["LP"], afternoon: ["HIS"] },
    },
  },
  {
    classGroup: "2º AM",
    teacher: "Beta",
    schedule: {
      Segunda: { morning: ["MAT"] },
      Terça: { morning: ["MAT"] },
      Quarta: { morning: ["MAT"] },
      Quinta: { morning: ["MAT"] },
      Sexta: { morning: ["MAT"] },
    },
  },
  {
    classGroup: "2º BM",
    teacher: "Beta",
    schedule: {
      Segunda: { morning: ["MAT"] },
      Terça: { morning: ["MAT"] },
      Quarta: { morning: ["MAT"] },
      Quinta: { morning: ["MAT"] },
      Sexta: { morning: ["MAT"] },
    },
  },
  {
    classGroup: "3º AM",
    teacher: "Claudio",
    schedule: {
      Segunda: { morning: ["BIO"] },
      Terça: { morning: ["BIO"] },
      Quarta: { morning: ["PDV"] },
      Quinta: { morning: ["BIO"] },
      Sexta: { morning: ["BIO"] },
    },
  },
  {
    classGroup: "3º BM",
    teacher: "Claudio",
    schedule: {
      Segunda: { morning: ["BIO"] },
      Terça: { morning: ["BIO"] },
      Quarta: { morning: ["BIO"] },
      Quinta: { morning: ["BIO"] },
      Sexta: { morning: ["BIO"] },
    },
  },
];

const buildLesson = (params: {
  teacher: string;
  classGroup: string;
  day: DayName;
  shift: Shift;
  slot: number;
  subject: string;
}) => {
  const slotInfo = params.shift === "morning" ? morningSlots[params.slot] : afternoonSlots[params.slot];
  return {
    id: `${params.teacher}-${params.classGroup}-${params.day}-${params.shift}-${params.slot}-${params.subject}`,
    teacher: params.teacher,
    className: `${params.classGroup} - ${params.subject}`,
    classGroup: params.classGroup,
    day: params.day,
    shift: params.shift,
    slot: params.slot,
    periodLabel: slotInfo.label,
    time: slotInfo.time,
  };
};

const lessons: Lesson[] = [];

classDefinitions.forEach((def) => {
  days.forEach((day) => {
    const dayPlan = def.schedule[day];
    if (!dayPlan) {
      return;
    }

    if (dayPlan.morning) {
      dayPlan.morning.forEach((subject, index) => {
        lessons.push(
          buildLesson({
            teacher: def.teacher,
            classGroup: def.classGroup,
            day,
            shift: "morning",
            slot: Math.min(index, morningSlots.length - 1),
            subject,
          }),
        );
      });
    }

    if (dayPlan.afternoon) {
      dayPlan.afternoon.forEach((subject, index) => {
        lessons.push(
          buildLesson({
            teacher: def.teacher,
            classGroup: def.classGroup,
            day,
            shift: "afternoon",
            slot: Math.min(index, afternoonSlots.length - 1),
            subject,
          }),
        );
      });
    }
  });
});

const createEmptySchedule = (): Record<DayName, { morning: Lesson[]; afternoon: Lesson[] }> =>
  days.reduce((acc, day) => {
    acc[day] = { morning: [], afternoon: [] };
    return acc;
  }, {} as Record<DayName, { morning: Lesson[]; afternoon: Lesson[] }>);

const teacherSchedules = Array.from(
  lessons.reduce<Map<string, TeacherSchedule>>((map, lesson) => {
    const schedule = map.get(lesson.teacher);
    if (!schedule) {
      map.set(lesson.teacher, {
        name: lesson.teacher,
        lessons: [lesson],
        scheduleByDay: createEmptySchedule(),
      });
    } else {
      schedule.lessons.push(lesson);
    }
    return map;
  }, new Map()).values(),
);

teacherSchedules.forEach((teacher) => {
  teacher.lessons.forEach((lesson) => {
    teacher.scheduleByDay[lesson.day][lesson.shift].push(lesson);
  });
  days.forEach((day) => {
    teacher.scheduleByDay[day].morning.sort((a, b) => a.slot - b.slot);
    teacher.scheduleByDay[day].afternoon.sort((a, b) => a.slot - b.slot);
  });
});

const classLessonsMap = lessons.reduce((acc, lesson) => {
  const list = acc.get(lesson.classGroup) ?? [];
  list.push(lesson);
  acc.set(lesson.classGroup, list);
  return acc;
}, new Map<string, Lesson[]>());

const classSchedules: ClassSchedule[] = classGroups.map((groupName) => {
  const groupLessons = classLessonsMap.get(groupName) ?? [];
  const sortedLessons = [...groupLessons].sort((a, b) => {
    const dayDiff = days.indexOf(a.day) - days.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    if (a.shift !== b.shift) {
      return a.shift === "morning" ? -1 : 1;
    }
    return a.slot - b.slot;
  });

  const scheduleByDay = createEmptySchedule();
  sortedLessons.forEach((lesson) => {
    scheduleByDay[lesson.day][lesson.shift].push(lesson);
  });
  days.forEach((day) => {
    scheduleByDay[day].morning.sort((a, b) => a.slot - b.slot);
    scheduleByDay[day].afternoon.sort((a, b) => a.slot - b.slot);
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