import { Level } from '../enums/level';

export interface Note {
  id?: number;
  title: string;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
  level: Level;
}
