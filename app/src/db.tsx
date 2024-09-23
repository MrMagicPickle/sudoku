import { init } from "@instantdb/core";

export interface GameState {
  id: string;
  boardState: Record<string, number | null>;
  failCount: number;
  sudokuRoom: Room;
  isTriggerValidation: boolean;
}

export interface Room {
  id: string;
  completedPuzzle: Record<string, number>; /* 81 entries */
  hintGroups: Record<string, number[][]>;
  hintValuesPerGroup: Record<string, number>;
  initialState: Record<string, number | null>;
  isCompleted: boolean;
  sudokuGameState: GameState;
}

export const APP_ID = 'f46224b7-2490-4f0c-beed-e735f9adfe10';
export type Schema = {
  sudokuRoom: Room,
  sudokuGameState: GameState,
}

let db: any;
export default function getDb() {
  if (!db) {
    db = init<Schema>({ appId: APP_ID });
  }
  console.log(db, '<< db --?');
  return db;
}
