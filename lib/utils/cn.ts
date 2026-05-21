type ClassDictionary = Record<string, boolean | null | undefined>;
type ClassArray = ClassValue[];
type ClassValue =
  | string
  | number
  | null
  | undefined
  | false
  | ClassDictionary
  | ClassArray;

function normalizeClass(value: ClassValue): string[] {
  if (!value) return [];

  if (typeof value === "string" || typeof value === "number") {
    return [`${value}`];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => normalizeClass(item));
  }

  return Object.entries(value)
    .filter(([, shouldInclude]) => Boolean(shouldInclude))
    .map(([key]) => key);
}

export function cn(...inputs: ClassValue[]): string {
  return inputs.flatMap((input) => normalizeClass(input)).join(" ");
}
