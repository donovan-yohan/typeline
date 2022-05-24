import { LetterType, TypelineRef, WordState, WordType } from "interfaces/typeline";
import { getWordState } from "utils/cursorUtils";

// implement textDatabase type separate from typedDatabase so typed data can be dynamically sized
export const EMPTY_LETTER_TYPE: LetterType = {
  value: "",
  received: "",
  history: []
};

export const EMPTY_WORD_TYPE: WordType = {
  value: "",
  letters: [EMPTY_LETTER_TYPE],
  state: WordState.UNVISITED,
  overflow: [] as LetterType[]
};

export enum CursorActionType {
  UPDATE = "UPDATE"
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
  isFirstChar: true
};
export function cursorReducer(state: CursorState, action: CursorSetLetterRefPayload) {
  switch (action.type) {
    case CursorActionType.UPDATE:
      return {
        letterRef: action.letterRef || state.letterRef,
        isFirstChar: action.isFirstChar
      } as CursorState;
    default:
      throw new Error(JSON.stringify(action.type));
  }
}

export enum HighlightActionType {
  UPDATE = "UPDATE"
}
export interface HighlightState {
  wordRef: TypelineRef;
  isValid: boolean;
}
export interface HighlightSetWordRefPayload extends HighlightState {
  type: HighlightActionType.UPDATE;
}
export let initialHighlightState: HighlightState = {
  wordRef: null,
  isValid: false
};
export function highlightReducer(
  state: HighlightState,
  action: HighlightSetWordRefPayload
) {
  switch (action.type) {
    case HighlightActionType.UPDATE:
      return {
        wordRef: action.wordRef || state.wordRef,
        isValid: action.isValid
      };
    default:
      throw new Error(JSON.stringify({ state, action }));
  }
}

export enum TextTypedActionType {
  UPDATE = "UPDATE",
  UPDATE_LETTER = "UPDATE_LETTER",
  INIT = "INIT",
  UPDATE_OVERFLOW = "UPDATE_OVERFLOW"
}

export interface TextTypedUpdatePayload {
  type: TextTypedActionType.UPDATE;
  targetIndex: number;
  newWordValue: WordType;
}
export interface TextTypedUpdateLetterPayload {
  type: TextTypedActionType.UPDATE_LETTER;
  targetIndex: number;
  targetLetterIndex: number;
  newLetterValue: LetterType;
}
export interface TextTypedUpdateOverflowPayload {
  type: TextTypedActionType.UPDATE_OVERFLOW;
  targetIndex: number;
  targetOverflowIndex: number;
  newOverflowValue: LetterType;
}
export interface TextTypedInitPayload {
  type: TextTypedActionType.INIT;
  textData: WordType[];
}

export type TextTypedPayload =
  | TextTypedUpdatePayload
  | TextTypedInitPayload
  | TextTypedUpdateLetterPayload
  | TextTypedUpdateOverflowPayload;

export function textTypedReducer(state: WordType[], action: TextTypedPayload) {
  switch (action.type) {
    case TextTypedActionType.UPDATE:
      return state.map((w, i) => {
        if (i == action.targetIndex) {
          return action.newWordValue;
        }
        return w;
      });
    case TextTypedActionType.UPDATE_LETTER:
      return state.map((w, i) => {
        if (i === action.targetIndex) {
          let newLetters = w.letters;

          const j = action.targetLetterIndex;
          if (j < newLetters.length) {
            newLetters[j] = action.newLetterValue;
          }
          w.letters = newLetters;
          w.state = getWordState(w);
        }
        return w;
      });
    case TextTypedActionType.UPDATE_OVERFLOW:
      return state.map((w, i) => {
        if (i === action.targetIndex) {
          let newOverflow = w.overflow;

          const j = action.targetOverflowIndex;
          if (j < newOverflow.length) {
            newOverflow[j] = action.newOverflowValue;
          } else {
            newOverflow.push(action.newOverflowValue);
          }
          w.overflow = newOverflow;
          w.state = getWordState(w);
        }
        return w;
      });
    case TextTypedActionType.INIT:
      return action.textData;
    default:
      return [EMPTY_WORD_TYPE];
  }
}
