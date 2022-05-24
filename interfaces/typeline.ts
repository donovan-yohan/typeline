export type TypelineRef = React.MutableRefObject<HTMLSpanElement | null> | null;

export type LetterType = {
  value: string;
  received: string;
  history: LetterHistory[];
};

export interface LetterHistory {
  state: LetterState;
  timeModified: number;
}

export enum LetterState {
  UNVISITED = "UNVISITED", // uncounted
  WAS_INCORRECT = "WAS_INCORRECT", // incorrect
  CORRECT = "CORRECT", // correct
  INCORRECT = "INCORRECT", // incorrect
  CORRECTED = "CORRECTED", // corrected
  OVERFLOW = "OVERFLOW" // incorrect
}

export type WordType = {
  value: string;
  letters: LetterType[];
  overflow: LetterType[];
  state: WordState;
};

export enum WordState {
  UNVISITED = "UNVISITED",
  PERFECT = "PERFECT",
  CORRECT = "CORRECT",
  INCORRECT = "INCORRECT"
}

export interface Stat {
  wpm: number;
  raw: number;
  correctRawAverage: number;
  allRawAverage: number;
  correctInInterval: number;
  incorrectInInterval: number;
  correctedInInterval: number;
  time: number;
  correctToTime: number;
  incorrectToTime: number;
  correctedToTime: number;
}

export interface TypedData {
  key: string;
  delay: number;
}

export const BACKSPACE_CHAR = "⌫";
export const SPACE_CHAR = " ";
