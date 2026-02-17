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
  "6º AV",
  "6º BV",
  "7º AV",
  "7º BV",
  "8º AM",
  "8º AV",
  "8º BM",
  "9º AM",
  "9º AV",
  "9º BM",
  "1º AI - P",
  "1º BI",
  "1º CI",
  "2º A Int",
  "2º AM",
  "2º BM",
  "3º AM",
  "3º BM"
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

const rawCsv = `
Professor,Aula,Segunda,Terça,Quarta,Quinta,Sexta
Aldo,1ª,3º AM - CPEP,,,8º AM - CID,
,2ª,3º BM - CPEP,,,2º AM - ART,
,3ª,,,,1º AI - P - EF,
,4ª,,,,2º BM - ART,3º BM - CPEP
,5ª,8º BM - CID,,,1º AI - P - ART,3º AM - CPEP
,6ª,7º BV - PDV,8º AV - CID,,,
,7ª,6º BV - EF,6º BV - EF,,,
,8ª,7º AV - PDV,6º AV - EF,,,
,9ª,6º AV - EF,,,,
,,,,,,
Beta,2ª,,3º AM - LP,,2º A Int - LP,2º BM - LC
,3ª,,3º BM - LP,,2º A Int - LP,3º BM - LP
,4ª,,2º A Int - LP,,2º AM - LC,
,5ª,,,,3º AM - LP,2º A Int - LP
,6ª,6º AV - LP,6º AV - LP,,6º BV - LP,7º BV - LP
,7ª,,7º BV - LP,,7º BV - LP,6º BV - LP
,8ª,,6º BV - LP,,7º AV - LP,6º BV - LP
,9ª,,7º AV - LP,,7º BV - LP,6º AV - LP
,10ª,,7º AV - LP,,6º AV - LP,7º AV - LP
,,,,,,
Claudio,1ª,1º BI - ETNO,3º AM - OMONES,,,
,2ª,3º AM - MAT,1º CI - ETNO,2º A Int - ETNO,,
,3ª,1º CI - ETNO,1º BI - ETNO,1º CI - ETNO,,
,4ª,3º BM - OMONES,3º BM - MAT,3º AM - OMONES,,
,5ª,2º A Int - ETNO,3º BM - MAT,3º BM - OMONES,,
,,,,,,
Cris,1ª,1º CI - ING,,,2º BM - ING,2º A Int - ING
,2ª,8º AM - ING,,,9º BM - ING,9º AM - ING
,3ª,1º BI - ING,,,1º CI - ING,8º AM - ING
,4ª,2º AM - ING,,,1º AI - P - ING,8º BM - ING
,5ª,9º AM - ING,,,8º BM - ING,9º BM - ING
,6ª,6º BV - ING,,,7º AV - ING,1º BI - ING
,7ª,2º A Int - ING,,,9º AV - ING,7º AV - ING
,8ª,6º AV - ING,,,8º AV - ING,7º BV - ING
,9ª,7º BV - ING,,,6º AV - ING,
,10ª,8º AV - ING,,,6º BV - ING,9º AV - ING
,,,,,,
Duda,1ª,3º BM - IEPON,,9º AM - PDV,2º A Int - GEO,2º BM - GEO
,2ª,2º BM - GEO,,9º BM - PDV,1º AI - P - GEO,3º AM - IEPON
,3ª,2º AM - GEO,,2º AM - GEO,3º BM - IEPON,8º BM - PDV
,4ª,2º A Int - GEO,,1º CI - GEO,1º BI - GEO,1º AI - P - GEO
,5ª,1º CI - GEO,,3º AM - IEPON,8º AM - PDV,1º BI - GEO
,6ª,9º AV - PDV,,7º BV - GEO,,
,7ª,7º BV - GEO,,7º BV - GEO,,
,8ª,,,8º AV - PDV,,
,9ª,7º AV - GEO,,, ,
,10ª,7º AV - GEO,,7º AV - GEO,,
,,,,,,
Edneia,1ª,2º AM - MAT,,, ,
,2ª,1º CI - MAT,2º BM - MAT,2º AM - MAT,,1º AI - P - MAT
,3ª,2º BM - MAT,1º CI - MAT,2º BM - ETNO,,1º AI - P - MAT
,4ª,1º BI - MAT,2º AM - ETNO,1º BI - MAT,,
,5ª,1º BI - MAT,2º A Int - MAT,2º A Int - MAT,,
,6ª,2º A Int - MAT,1º CI - MAT,6º BV - MAT,,6º BV - MAT
,7ª,6º AV - MAT,7º AV - MAT,6º BV - MAT,,7º BV - MAT
,8ª,7º BV - MAT,7º BV - MAT,7º BV - MAT,,7º AV - MAT
,9ª,,,7º AV - MAT,,7º AV - MAT
,10ª,6º BV - MAT,6º AV - MAT,6º AV - MAT,,6º AV - MAT
,,,,,,
Ek,1ª,,,,3º AM - HIS,3º AM - HIS
,2ª,,,,3º BM - HIS,9º BM - HIS
,3ª,,,3º BM - HIS,2º AM - HBC,9º BM - HIS
,4ª,,,9º AM - HIS,9º AM - HIS,2º BM - HBC
,5ª,,,9º AM - HIS,1º CI - HIS,1º CI - HIS
,6ª,,,9º BM - HIS,1º BI - HIS,9º AV - HIS
,7ª,,,1º BI - HIS,1º AI - P - HIS,9º AV - HIS
,8ª,,,7º AV - HIS,9º AV - HIS,
,9ª,,,7º AV - HIS,7º AV - HIS,7º BV - HIS
,10ª,,,,7º BV - HIS,7º BV - HIS
,,,,,,
Eugênio,1ª,9º AM - CIE,9º BM - CIE,9º BM - CIE,,
,2ª,8º BM - CIE,9º BM - CIE,8º BM - CIE,,
,3ª,3º BM - BIO,3º AM - BIO,8º BM - CIE,,
,4ª,1º CI - BIO,9º AM - CIE,8º AM - CIE,,
,5ª,8º AM - CIE,9º AM - CIE,8º AM - CIE,,
,6ª,1º AI - P - BIO,9º AV - CIE,8º AV - CIE,,
,7ª,1º BI - BIO,1º CI - BIO,1º AI - P - BIO,,
,8ª,,1º BI - BIO,9º AV - CIE,,
,9ª,8º AV - CIE,8º AV - CIE,,,
,10ª,,9º AV - CIE,,,
,,,,,,
Everton,1ª,2º A Int - EAM,,8º BM - GEO,8º BM - GEO,8º AM - GEO
,2ª,,,,8º AM - GEO,2º AM - EAM
,3ª,8º AM - GEO,,,3º AM - PDV,3º AM - GEO
,4ª,8º BM - GEO,,,3º BM - GEO,
,5ª,2º BM - EAM,,,,3º BM - PDV
,6ª,,,,2º A Int - SPG,8º AV - GEO
,7ª,,,,6º AV - GEO,8º AV - GEO
,8ª,,,,6º AV - GEO,6º AV - GEO
,9ª,,,,6º BV - GEO,GEO - Everton
,10ª,,,,8º AV - GEO,6º BV - GEO
,4ª,,,,6º BV - GEO,
,4ª,,,,6º BV - GEO,
,,,,,,
Francisco,1ª,,,2º A Int - HIS,2º AM - HIS,8º BM - HIS
,2ª,,,1º BI - HBC,1º BI - HBC,1º CI - HBC

,3ª,,,8º AM - HIS,8º AM - HIS,2º AM - HIS
,4ª,,,2º BM - HIS,8º BM - HIS,2º A Int - HIS
,5ª,,,8º BM - HIS,2º BM - HIS,8º AM - HIS
,6ª,,,6º AV - HIS,6º AV - HIS,6º AV - HIS
,7ª,,,8º AV - HIS,6º BV - HIS,1º AI - P - HBC
,8ª,,,6º BV - HIS,1º CI - HBC,1º AI - P - HBC
,9ª,,,6º BV - HIS,,HIS - Francisco
,10ª,,,,,HIS - Francisco
,,,,,,
Larissa,1ª,,,3º BM - FIL,3º BM - SOC,2º AM - SOC

,2ª,,,9º AM - GEO,3º AM - SOC,
,3ª,,,3º AM - FIL,2º BM - SOC,9º AM - GEO
,4ª,,,9º BM - GEO,9º BM - GEO,9º BM - GEO
,5ª,,,2º AM - FIL,9º AM - GEO,2º BM - FIL
,6ª,,,2º A Int - SOC,1º AI - P - SOC,1º CI - SOC
,7ª,,,1º CI - SOC,2º A Int - SOC,1º BI - SOC
,8ª,,,1º BI - SOC,7º BV - IDC,9º AV - GEO
,9ª,,,9º AV - GEO,,
,10ª,,,9º AV - GEO,7º AV - IDC,
,,,,,,
LC,1ª,8º BM - MAT,8º AM - MAT,8º AM - MAT,,9º BM - MAT
,2ª,,9º AM - MAT,8º AM - MAT,,8º AM - MAT
,3ª,9º BM - CTET,9º AM - MAT,9º BM - MAT,,
,4ª,9º BM - MAT,8º BM - MAT,8º BM - MAT,,9º AM - MAT
,5ª,9º BM - MAT,8º BM - MAT,9º AM - CTET,,9º AM - MAT
,6ª,8º AV - MAT,,9º AV - MAT,,
,7ª,8º AV - MAT,,9º AV - MAT,,
,8ª,9º AV - CTET,,,,
,9ª,9º AV - MAT,,8º AV - MAT,,
,10ª,9º AV - MAT,,8º AV - MAT,,
,,,,,,
Marcelo,1ª,8º AM - EF,2º AM - EF,,9º BM - EF,
,2ª,9º BM - EF,8º AM - EF,,2º BM - EF,
,3ª,8º BM - EF,8º BM - EF,,9º AM - EF,
,4ª,9º AM - EF,2º BM - EF,,1º CI - EF,
,5ª,2º AM - EF,1º BI - EF,,2º A Int - EF,
,6ª,1º CI - EF,7º AV - EF,,9º AV - EF,
,7ª,9º AV - EF,2º A Int - EF,,1º BI - EF,
,8ª,8º AV - EF,7º AV - EF,,,
,9ª,,7º BV - EF,,,
,10ª,7º BV - EF,8º AV - EF,,,
,,,,,,
Naza,1ª,,2º BM - BIO,2º AM - BIO,,
,2ª,1º BI - EDM,2º A Int - BIO,1º CI - EDM,,
,3ª,1º AI - P - EDM,2º A Int - BIO,3º BM - MAES,,
,4ª,3º AM - MAES,,3º BM - MAES,,
,5ª,3º AM - MAES,2º AM - BIO,2º BM - BIO,,
,6ª,7º AV - CIE,7º BV - CIE,7º AV - CIE,,
,7ª,7º AV - CIE,6º AV - MAMB,6º AV - CIE,,
,8ª,6º BV - MAMB,,6º AV - CIE,,
,9ª,6º BV - CIE,6º BV - CIE,7º BV - CIE,,
,10ª,6º AV - CIE,6º BV - CIE,7º BV - CIE,,
,,,,,,
PROTEC,1ª,,,1º AI - P - FAC,,
,2ª,,,1º AI - P - FAC,,
,3ª,,,1º AI - P - RCSS,,
,4ª,,1º AI - P - ALP,1º AI - P - MD,,
,5ª,,1º AI - P - ALP,1º AI - P - MD,,
,6ª,,1º AI - P - RCSS,,
,7ª,,1º AI - P - SO,,
,8ª,,1º AI - P - SO,,
,,,,,,
Rosa,1ª,,2º A Int - FIL,2º BM - QUI,,1º BI - FIL
,2ª,,1º AI - P - PTS,2º BM - QUI,,2º A Int - FIL
,3ª,,2º BM - EDSC,2º A Int - EDSC,,2º AM - QUI
,4ª,,1º BI - EDSC,2º AM - EDSC,,2º AM - QUI
,5ª,,1º CI - FIL,1º BI - FIL,,1º AI - P - IC
,6ª,,,1º AI - P - FIL,,2º A Int - QUI
,7ª,,,2º A Int - QUI,,1º CI - EDSC
,8ª,,,1º CI - FIL,,
,9ª,,,6º AV - PDV,,
,10ª,,,6º BV - PDV,,
,,,,,,
Rubi,1ª,,9º AM - ART,,,9º AM - ART
,2ª,,8º BM - ART,,1º CI - ART,2º A Int - ART
,3ª,,9º BM - ART,,1º BI - ART,1º BI - ART
,4ª,,8º AM - ART,,2º A Int - ART,1º CI - ART
,5ª,,8º AM - ART,,9º BM - ART,8º BM - ART
,6ª,,6º BV - ART,,7º BV - ART,7º AV - ART
,7ª,,9º AV - ART,,7º AV - ART,6º AV - ART
,8ª,,,,6º BV - ART,8º AV - ART
,9ª,,6º AV - ART,,8º AV - ART,9º AV - ART
,10ª,,7º BV - ART,,,
,,,,,,
Sheltom,1ª,2º BM - LP,8º BM - LP,,,
,2ª,2º AM - LP,1º BI - LC,,8º BM - LP,8º BM - LP
,3ª,2º A Int - LC,8º AM - LP,,8º BM - LP,1º CI - LC
,4ª,8º AM - LP,1º CI - LC,,8º AM - LP,8º AM - LP
,5ª,,2º BM - LP,,2º AM - LP,
,6ª,,2º A Int - LC,,LP - Sheltom,
,7ª,,8º AV - LP,,LP - Sheltom,LP - Sheltom
,8ª,,8º AV - LP,9º AV - ING,ING - Cris,HIS - Francisco
,9ª,,8º AV - ING,9º AV - HIS,ING - Cris,GEO - Everton
,10ª,,8º AV - HIS,9º AV - LP,HIS - Francisco,
,,,,,,
Teresa,1ª,9º BM - LP,1º CI - LP,,9º AM - LP,
,2ª,9º AM - LP,3º BM - PIT,,9º AM - LP,
,3ª,9º AM - LP,1º AI - P - LP,,9º BM - LP,
,4ª,1º AI - P - LP,9º BM - LP,,3º AM - PIT,
,5ª,1º AI - P - LP,9º BM - LP,,1º BI - LP,
,6ª,1º BI - LP,1º BI - LP,,1º CI - LP,
,7ª,1º CI - LP,1º BI - LP,,1º CI - LP,
,8ª,,9º AV - LP,,1º AI - P - LP,
,9ª,,9º AV - LP,,9º AV - LP,
,10ª,,,,9º AV - LP,
,,,,,,
Valéria,1ª,1º AI - P - QUI,3º BM - FIS,3º AM - QUI,,3º BM - QUI
,2ª,1º AI - P - QUI,2º AM - FIS,3º AM - QUI,,3º BM - QUI
,3ª,1º CI - FIS,2º AM - FIS,1º BI - QUI,,2º BM - FIS
,4ª,2º BM - FIS,3º AM - FIS,2º A Int - FIS,,1º BI - QUI
,5ª,3º BM - FIS,3º AM - FIS,1º CI - QUI,,1º AI - P - FIS
,6ª,,,1º CI - QUI,,2º A Int - FIS
,7ª,,,1º BI - FIS,,1º CI - FIS
,8ª,,,1º AI - P - FIS,,1º BI - FIS
`;

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
