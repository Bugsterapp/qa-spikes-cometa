import { describe, it, expect } from 'vitest';

export const transformData = (data: Section[]): TransformedLevel[] => {
  const levelMap = new Map<string, TransformedLevel>();

  data.forEach((section) => {
    const { level, grade } = section;
    const gradeName = `${grade} - ${level.name}`;

    if (!levelMap.has(level.id)) {
      levelMap.set(level.id, {
        ...level,
        grades: [gradeName],
      });
    } else {
      const existingLevel = levelMap.get(level.id)!;
      if (!existingLevel.grades.includes(gradeName)) {
        existingLevel.grades.push(gradeName);
      }
    }
  });

  return Array.from(levelMap.values());
};

export const sortLevels = (levels: TransformedLevel[]): TransformedLevel[] =>
  levels.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type.localeCompare(b.type);
    }
    return a.name.localeCompare(b.name);
  });
export const transformAndSortSections = (data?: Section[]): TransformedLevel[] => {
  if (!data) return [];
  const transformedLevels = transformData(data);
  const sortedLevels = sortLevels(transformedLevels);
  sortedLevels.forEach((level) => {
    level.grades = sortGrades(level.grades);
  });
  return sortedLevels;
};
export const sortGrades = (grades: string[]): string[] => grades.sort((a, b) => a.localeCompare(b));

describe('Section Data Transformation', () => {
  it('should transform data correctly', () => {
    const result = transformData(mockSections);
    expect(result).toHaveLength(4); // PRE_SCHOOL, ELEMENTARY, MIDDLE, and D.I.

    // Check if grades are concatenated correctly
    expect(result.find((level) => level.name === 'Preescolar')?.grades).toContain('Kinder 3 - Preescolar');
    expect(result.find((level) => level.name === 'Primaria')?.grades).toContain('1 - Primaria');
    expect(result.find((level) => level.name === 'Secundaria')?.grades).toContain('7 - Secundaria');
    expect(result.find((level) => level.name === 'D.I.')?.grades).toContain('PRE-KINDER - D.I.');
  });

  it('should sort grades alphabetically within each level', () => {
    const result = transformAndSortSections(mockSections);
    const primaryLevel = result.find((level) => level.name === 'Primaria');
    expect(primaryLevel?.grades).toEqual([
      '1 - Primaria',
      '2 - Primaria',
      '3 - Primaria',
      '4 - Primaria',
      '5 - Primaria',
      '6 - Primaria',
    ]);
  });

  it('should list each grade only once per level', () => {
    const result = transformAndSortSections(mockSections);
    result.forEach((level) => {
      const uniqueGrades = new Set(level.grades);
      expect(uniqueGrades.size).toBe(level.grades.length);
    });
  });

  it('should handle empty input', () => {
    const result = transformAndSortSections([]);
    expect(result).toHaveLength(0);
  });

  it('should handle undefined input', () => {
    const result = transformAndSortSections(undefined);
    expect(result).toHaveLength(0);
  });
});

const mockSections = [
  {
    id: 'd7d14c1f-82d2-4c8f-bf67-6510c6b083ce',
    grade: 'Kinder 3',
    group: 'B',
    level: {
      id: '42d828cd-191a-442a-82b0-57216ed81a46',
      name: 'Preescolar',
      type: 'PRE_SCHOOL',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'd357e456-5244-4e97-8d1f-ffdf0a7593dc',
    grade: '7',
    group: 'A',
    level: {
      id: 'db9f880f-b718-47ec-8dfb-48ca07e20109',
      name: 'Secundaria',
      type: 'MIDDLE',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'd65f56ea-8d4a-4a3b-8894-b4d9ddb29e05',
    grade: '1',
    group: 'C',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '81a7066d-9bb4-4880-80e6-20e9429824cb',
    grade: '3',
    group: 'C',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '5a16f7fa-a26b-4504-98a8-571123bc6874',
    grade: '4',
    group: 'A',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '0c495385-e357-4665-925e-91fdad710d42',
    grade: 'PRE-KINDER',
    group: 'B',
    level: {
      id: '8035e931-b580-43bc-a4a2-5b1a829bf2e2',
      name: 'D.I.',
      type: 'PRE_SCHOOL',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'd0bd5689-7db0-48fc-a906-fceac8d8001d',
    grade: 'Kinder 3',
    group: 'C',
    level: {
      id: '42d828cd-191a-442a-82b0-57216ed81a46',
      name: 'Preescolar',
      type: 'PRE_SCHOOL',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '21c4aae2-03d9-48e4-bd44-d80ac4061106',
    grade: '1',
    group: 'NI',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '509c99fe-f87b-41e6-aa01-e3255295a94e',
    grade: '9',
    group: 'NI',
    level: {
      id: 'db9f880f-b718-47ec-8dfb-48ca07e20109',
      name: 'Secundaria',
      type: 'MIDDLE',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'a103790b-1978-4823-9dd6-b96d81657758',
    grade: 'Kinder 3',
    group: 'NI',
    level: {
      id: '42d828cd-191a-442a-82b0-57216ed81a46',
      name: 'Preescolar',
      type: 'PRE_SCHOOL',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'cd90648c-39c2-43fb-88ae-7eb3b6c3e929',
    grade: 'Kinder 1',
    group: 'A',
    level: {
      id: '42d828cd-191a-442a-82b0-57216ed81a46',
      name: 'Preescolar',
      type: 'PRE_SCHOOL',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '6ca6393f-22ac-4607-9d5b-2a3fbbacd167',
    grade: 'Kinder 1',
    group: 'B',
    level: {
      id: '42d828cd-191a-442a-82b0-57216ed81a46',
      name: 'Preescolar',
      type: 'PRE_SCHOOL',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'd56e6bf6-5775-453c-8131-53ba31b38f5c',
    grade: '9',
    group: 'D',
    level: {
      id: 'db9f880f-b718-47ec-8dfb-48ca07e20109',
      name: 'Secundaria',
      type: 'MIDDLE',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '3e6de60a-2b51-473e-b652-605b25ba2068',
    grade: 'Kinder 3',
    group: 'A',
    level: {
      id: '42d828cd-191a-442a-82b0-57216ed81a46',
      name: 'Preescolar',
      type: 'PRE_SCHOOL',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'b03fdcef-d566-4f66-a3db-027ce4048ea1',
    grade: 'Kinder 1',
    group: 'NI',
    level: {
      id: '42d828cd-191a-442a-82b0-57216ed81a46',
      name: 'Preescolar',
      type: 'PRE_SCHOOL',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'a5449db6-7be0-49e7-b8aa-4bf534660b92',
    grade: 'PRE-KINDER',
    group: 'A',
    level: {
      id: '8035e931-b580-43bc-a4a2-5b1a829bf2e2',
      name: 'D.I.',
      type: 'PRE_SCHOOL',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '8d7f392c-51de-4124-84f5-060b55f8f19a',
    grade: '9',
    group: 'C',
    level: {
      id: 'db9f880f-b718-47ec-8dfb-48ca07e20109',
      name: 'Secundaria',
      type: 'MIDDLE',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '96109e1c-90e0-437a-9d7a-5f666dcfdf07',
    grade: 'Kinder 1',
    group: 'C',
    level: {
      id: '42d828cd-191a-442a-82b0-57216ed81a46',
      name: 'Preescolar',
      type: 'PRE_SCHOOL',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '852ad9e8-fd0b-4bfc-9393-0133898e5a96',
    grade: 'Kinder 2',
    group: 'C',
    level: {
      id: '42d828cd-191a-442a-82b0-57216ed81a46',
      name: 'Preescolar',
      type: 'PRE_SCHOOL',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '6a71051a-595e-462e-bc60-1c09e3168278',
    grade: '1',
    group: 'A',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '84a40e79-dfb4-4d46-90fc-c8b44b2268d5',
    grade: '3',
    group: 'B',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'c70d986a-2414-4c1c-9002-7d9787baa982',
    grade: '5',
    group: 'B',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '9748fcd5-e117-4a87-9877-4e2016ca5ec8',
    grade: '2',
    group: 'NI',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'e17e39aa-0e80-43d3-9287-8f5099e11c88',
    grade: '3',
    group: 'NI',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'be162bae-688b-40b8-992b-fc29b75df618',
    grade: '5',
    group: 'NI',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '55704578-22fb-4e08-8670-165fac869a86',
    grade: '8',
    group: 'NI',
    level: {
      id: 'db9f880f-b718-47ec-8dfb-48ca07e20109',
      name: 'Secundaria',
      type: 'MIDDLE',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'e9e310a9-ed94-4612-a5bc-e12ee957735a',
    grade: 'NURSERY',
    group: 'B',
    level: {
      id: '8035e931-b580-43bc-a4a2-5b1a829bf2e2',
      name: 'D.I.',
      type: 'PRE_SCHOOL',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '06ab5218-ad52-4b60-8ef1-0c0b89916232',
    grade: '8',
    group: 'C',
    level: {
      id: 'db9f880f-b718-47ec-8dfb-48ca07e20109',
      name: 'Secundaria',
      type: 'MIDDLE',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '451b05f7-fc7d-4e18-8194-e9f5cbe313b4',
    grade: '7',
    group: 'C',
    level: {
      id: 'db9f880f-b718-47ec-8dfb-48ca07e20109',
      name: 'Secundaria',
      type: 'MIDDLE',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '4cede55b-0b61-40df-8f46-6b54e42f3da0',
    grade: '2',
    group: 'A',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '1ff63f80-a488-4d1b-b9ed-969e6b23c418',
    grade: '2',
    group: 'B',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '50d146a7-4d78-479d-9a0c-10bbf892e780',
    grade: '2',
    group: 'C',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'e2f93122-5127-4f54-934f-aa6b673be260',
    grade: '4',
    group: 'B',
    level: {
      id: '42d828cd-191a-442a-82b0-57216ed81a46',
      name: 'Preescolar',
      type: 'PRE_SCHOOL',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '52dcc452-bb8a-4818-96c6-87912a52eb68',
    grade: '5',
    group: 'A',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'a3fc3c39-f5ee-417e-822d-f6c4bcd45826',
    grade: '6',
    group: 'NI',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '8a57fa65-5f81-4491-bc54-328bf78170e4',
    grade: 'NURSERY',
    group: 'A',
    level: {
      id: '8035e931-b580-43bc-a4a2-5b1a829bf2e2',
      name: 'D.I.',
      type: 'PRE_SCHOOL',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '183a8c6a-c5f5-4c37-96b2-fff446e24494',
    grade: '9',
    group: 'A',
    level: {
      id: 'db9f880f-b718-47ec-8dfb-48ca07e20109',
      name: 'Secundaria',
      type: 'MIDDLE',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '3fb40641-8677-46fb-8616-76ac10d3a5c9',
    grade: 'Kinder 2',
    group: 'A',
    level: {
      id: '42d828cd-191a-442a-82b0-57216ed81a46',
      name: 'Preescolar',
      type: 'PRE_SCHOOL',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'ba7365a7-e971-45ea-b39b-6e17517bbef6',
    grade: 'Kinder 2',
    group: 'B',
    level: {
      id: '42d828cd-191a-442a-82b0-57216ed81a46',
      name: 'Preescolar',
      type: 'PRE_SCHOOL',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'f2f6b8c0-7c30-4018-9272-98a258e614eb',
    grade: '1',
    group: 'B',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'f87730b9-88ef-4e13-8081-071bdbdfd49c',
    grade: '6',
    group: 'A',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '6c6b69dc-1c0e-4286-b609-55087bc4c983',
    grade: '2',
    group: 'D',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '7f55a24a-3b80-4202-ab9e-0ea8349cad2e',
    grade: '3',
    group: 'A',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '243605d4-e1d6-482e-9abc-68ab449d24dd',
    grade: '6',
    group: 'D',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '0451fe44-32bf-4ef1-a06a-8dab21d90707',
    grade: '4',
    group: 'B',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'f64f0da8-a763-4bb0-8a26-84d63a5ee0aa',
    grade: '7',
    group: 'NI',
    level: {
      id: 'db9f880f-b718-47ec-8dfb-48ca07e20109',
      name: 'Secundaria',
      type: 'MIDDLE',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'f78e2013-8224-4c82-9d32-ff9e8e9f9963',
    grade: '4',
    group: 'NI',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'e22784b8-428f-47dd-a579-f034e0cb9f78',
    grade: '9',
    group: 'B',
    level: {
      id: 'db9f880f-b718-47ec-8dfb-48ca07e20109',
      name: 'Secundaria',
      type: 'MIDDLE',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '126479e2-c8a0-43ea-b173-983727716f7e',
    grade: '8',
    group: 'B',
    level: {
      id: 'db9f880f-b718-47ec-8dfb-48ca07e20109',
      name: 'Secundaria',
      type: 'MIDDLE',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'd6654ab3-e9dc-4427-a59f-317f80f01da0',
    grade: '8',
    group: 'D',
    level: {
      id: 'db9f880f-b718-47ec-8dfb-48ca07e20109',
      name: 'Secundaria',
      type: 'MIDDLE',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '2e1768bf-1fbe-441d-851f-c0cba7203eb3',
    grade: '7',
    group: 'B',
    level: {
      id: 'db9f880f-b718-47ec-8dfb-48ca07e20109',
      name: 'Secundaria',
      type: 'MIDDLE',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '3a5e6780-77e9-4892-a7f6-bcbe055be227',
    grade: '6',
    group: 'B',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '87255108-b548-4172-b626-8d4196b44b46',
    grade: '6',
    group: 'C',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '6ec5b17c-47c4-4fb3-a5ee-92de1e0ff1ff',
    grade: '4',
    group: 'D',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '90ccf3f0-8268-4822-a2a1-84cfeaa365bd',
    grade: '5',
    group: 'C',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '524c1025-8be5-4e9e-ad28-883ebc0b61dc',
    grade: '6',
    group: 'K',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: 'db5f2f89-ab49-47b7-84ec-f8f573d489ad',
    grade: 'Kinder 2',
    group: 'NI',
    level: {
      id: '42d828cd-191a-442a-82b0-57216ed81a46',
      name: 'Preescolar',
      type: 'PRE_SCHOOL',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '59ef84eb-bcaa-4e01-92b6-542bdf556fba',
    grade: '8',
    group: 'A',
    level: {
      id: 'db9f880f-b718-47ec-8dfb-48ca07e20109',
      name: 'Secundaria',
      type: 'MIDDLE',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
  {
    id: '3170ebdc-4467-4ef0-a045-605409a33058',
    grade: '4',
    group: 'C',
    level: {
      id: '5983f59c-1abc-4636-95f3-57e61adf99b6',
      name: 'Primaria',
      type: 'ELEMENTARY',
      order: null,
    },
    without_group: null,
    last_section: null,
    next: null,
  },
];
