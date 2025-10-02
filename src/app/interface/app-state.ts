import { DataState } from '../enums/data-state';

export interface AppState<T> {
  dataState: DataState;
  data?: T | null;
  error?: string | null;
}
