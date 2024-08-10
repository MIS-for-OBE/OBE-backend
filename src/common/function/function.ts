import { isNumeric } from 'validator';

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
