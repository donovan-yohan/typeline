import { TypelineRef } from "types";

export interface Stats {
  correct: number;
  incorrect: number;
  corrected: number;
}

export interface TypedData {
  value: string;
  fullValue: string;
  stats: Stats;
  visited: boolean;
}

export const EMPTY_TYPED_DATA: TypedData = {
  value: "",
  fullValue: "",
  stats: { correct: 0, incorrect: 0, corrected: 0 },
  visited: false,
};

export enum CursorActionType {
  UPDATE = "UPDATE",
}
export interface CursorState {
  letterRef: TypelineRef;
  isFirstChar: boolean;
}
export interface CursorSetLetterRefPayload extends CursorState {
  type: CursorActionType.UPDATE;
}
export let initialCursorState: CursorState = {
  letterRef: null,
  isFirstChar: true,
};
export function cursorReducer(
  state: CursorState,
  action: CursorSetLetterRefPayload
) {
  switch (action.type) {
    case CursorActionType.UPDATE:
      return {
        letterRef: action.letterRef || state.letterRef,
        isFirstChar: action.isFirstChar,
      };

    default:
      throw new Error(JSON.stringify(action.type));
  }
}

export enum HighlightActionType {
  UPDATE = "UPDATE",
}
export interface HighlightState {
  wordRef: TypelineRef;
}
export interface HighlightSetWordRefPayload extends HighlightState {
  type: HighlightActionType.UPDATE;
}
export let initialHighlightState: HighlightState = {
  wordRef: null,
};
export function highlightReducer(
  state: HighlightState,
  action: HighlightSetWordRefPayload
) {
  switch (action.type) {
    case HighlightActionType.UPDATE:
      return {
        wordRef: action.wordRef || state.wordRef,
      };
    default:
      throw new Error(JSON.stringify({ state, action }));
  }
}

// verify these are needed
export enum StatsActionType {
  ADD_CORRECT = "ADD_CORRECT",
  ADD_INCORRECT = "ADD_INCORRECT",
  ADD_CORRECTED = "ADD_CORRECTED",
  RESET = "RESET",
}
export interface StatsState {
  correct: number;
  incorrect: number;
  corrected: number;
}
export interface StatsAction {
  type: StatsActionType;
}
export let initialStatsState = {
  correct: 0,
  incorrect: 0,
  corrected: 0,
};
export function statsReducer(state: StatsState, action: StatsAction) {
  switch (action.type) {
    case StatsActionType.ADD_CORRECT:
      return {
        correct: state.correct + 1,
        incorrect: state.incorrect,
        corrected: state.corrected,
      };
    case StatsActionType.ADD_INCORRECT:
      return {
        correct: state.correct,
        incorrect: state.incorrect + 1,
        corrected: state.corrected,
      };
    case StatsActionType.ADD_CORRECTED:
      return {
        correct: state.correct,
        incorrect: state.incorrect,
        corrected: state.corrected + 1,
      };
    case StatsActionType.RESET:
      return {
        correct: 0,
        incorrect: 0,
        corrected: 0,
      };
    default:
      throw new Error(JSON.stringify({ state, action }));
  }
}
// --------------------------------------------------

export enum TextTypedActionType {
  UPDATE = "UPDATE",
  INIT = "INIT",
}

export interface TextTypedUpdatePayload {
  type: TextTypedActionType.UPDATE;
  targetIndex: number;
  newValue: TypedData;
}
export interface TextTypedInitPayload {
  type: TextTypedActionType.INIT;
  textData: string[][];
}

export function textTypedReducer(
  state: TypedData[],
  action: TextTypedUpdatePayload | TextTypedInitPayload
) {
  switch (action.type) {
    case TextTypedActionType.UPDATE:
      return state.map((w, i) => {
        if (i == action.targetIndex) {
          return action.newValue;
        } else {
          return w;
        }
      });
    case TextTypedActionType.INIT:
      return action.textData.map(() => {
        return EMPTY_TYPED_DATA;
      });
    default:
      throw new Error(JSON.stringify({ state, action }));
  }
}
