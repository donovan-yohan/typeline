export type TypelineRef = React.MutableRefObject<HTMLSpanElement | null> | null;

export type LetterType = {
  value: string;
  received: string;
  state: LetterState;
};

export enum LetterState {
  UNVISITED = "UNVISITED",
  WAS_INCORRECT = "WAS_INCORRECT",
  CORRECT = "CORRECT",
  INCORRECT = "INCORRECT",
  CORRECTED = "CORRECTED",
  OVERFLOW = "OVERFLOW"
}

export type WordType = {
  value: string;
  letters: LetterType[];
  state: WordState;
  overflowTotal: number;
  overflowRemoved: number;
};

export enum WordState {
  UNVISITED = "UNVISITED",
  PERFECT = "PERFECT",
  CORRECT = "CORRECT",
  INCORRECT = "INCORRECT"
}
