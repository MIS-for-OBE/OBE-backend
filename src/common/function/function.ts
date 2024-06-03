export function getEnumByKey(Enum: any, key: string): string {
  return Enum[key as keyof typeof Enum] ?? '';
}

export function getEnumByValue(Enum: any, value: string): string {
  return Object.keys(Enum)[Object.values(Enum).indexOf(value)] ?? '';
}
