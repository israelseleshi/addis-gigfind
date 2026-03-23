export const LOCATIONS = [
  'Bole',
  'Yeka',
  'Kirkos',
  'Addis Ketema',
  'Lideta',
  'Akaki-Kality',
  'Nifas Silk-Lafto',
  'Kolfe Keranio',
  'Gulele',
  'Semt-Legedir',
] as const;

export type Location = typeof LOCATIONS[number];

export function isValidLocation(value: string): value is Location {
  return LOCATIONS.includes(value as Location);
}
