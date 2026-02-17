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
  "3º BM",
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
,8ª,,,7º AV - HIS,9º AV - HIS,9º AV - HIS
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
,4ª,8º BM - GEO,,,3º BM - GEO,,
,5ª,2º BM - EAM,,,,3º BM - PDV
,6ª,,,,2º A Int - SPG,8º AV - GEO
,7ª,,,,6º AV - GEO,8º AV - GEO
,8ª,,,,6º AV - GEO,6º AV - GEO
,9ª,,,,6º BV - GEO,GEO - Everton
,10ª,,,,8º AV - GEO,6º BV - GEO
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
,7ª,,,1º CI - SOC,2º A Int - SOC,1º BI उपलबistiques-">","1">