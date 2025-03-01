import { isNumeric } from 'validator';

export const sortData = (
  data: any[] | undefined,
  key: string,
  typeKey: string = 'number',
  typeSort: string = 'asc',
) => {
  const isAscending = ['asc', 'ASC'].includes(typeSort);
  data?.sort((a, b) => {
    if (key == 'sectionTopic') {
      if (a.topic !== b.topic) {
        return a.topic.localeCompare(b.topic);
      }
      return a.sectionNo - b.sectionNo;
    }
    const aValue =
      a[key] ?? (typeKey === 'number' ? 0 : typeKey === 'boolean' ? false : '');
    const bValue =
      b[key] ?? (typeKey === 'number' ? 0 : typeKey === 'boolean' ? false : '');
    if (typeKey === 'number') {
      return isAscending ? aValue - bValue : bValue - aValue;
    } else if (typeKey === 'string') {
      return isAscending
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    } else if (typeKey === 'boolean') {
      return isAscending
        ? Number(bValue) - Number(aValue)
        : Number(aValue) - Number(bValue);
    } else return 0;
  });
};

export const getEnumByKey = (Enum: any, key: string): string => {
  return Enum[key as keyof typeof Enum] ?? '';
};

export const getEnumByValue = (Enum: any, value: string): string => {
  return Object.keys(Enum)[Object.values(Enum).indexOf(value)] ?? '';
};

export const setWhereWithSearchCourse = (where: any, search: string) => {
  if (isNumeric(search)) {
    where['$or'] = [
      {
        $expr: {
          $regexMatch: {
            input: { $toString: '$courseNo' },
            regex: search,
            options: 'i',
          },
        },
      },
      { courseName: { $regex: search, $options: 'i' } },
    ];
  } else {
    where['courseName'] = { $regex: search, $options: 'i' };
  }
};
