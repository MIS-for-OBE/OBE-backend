import { isNumeric } from 'validator';

export const sortData = (
  data: any[] | undefined,
  key: string,
  typeKey: string = 'number',
  typeSort: string = 'asc',
) => {
  data?.sort((a, b) => {
    if (typeKey === 'number') {
      if (['asc', 'ASC'].includes(typeSort)) {
        if (!a[key] && a[key] != 0) return -1;
        else if (!b[key] && b[key] != 0) return 1;
        else return a[key] - b[key];
      } else {
        if (!b[key] && b[key] != 0) return -1;
        else if (!a[key] && a[key] != 0) return 1;
        else return b[key] - a[key];
      }
    } else {
      if (['asc', 'ASC'].includes(typeSort)) {
        if (!a[key]) return -1;
        else if (!b[key]) return 1;
        else if (a[key] < b[key]) return -1;
        else return 1;
      } else {
        if (!b[key]) return -1;
        else if (!a[key]) return 1;
        else if (b[key] < a[key]) return -1;
        else return 1;
      }
    }
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
