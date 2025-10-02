export enum Level {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export function getLevels(): string[] {
  return Object.values(Level);
}
