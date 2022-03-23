import {
  LetterState,
  LetterType,
  TypelineRef,
  WordState,
  WordType
} from "interfaces/typeline";
import { getWordState } from "utils/cursorUtils";

// implement textDatabase type separate from typedDatabase so typed data can be dynamically sized
export const EMPTY_LETTER_TYPE: LetterType = {
  value: "",
  received: "",
  state: LetterState.UNVISITED
};

export const EMPTY_WORD_TYPE: WordType = {
  value: "",
  letters: [EMPTY_LETTER_TYPE],
  state: WordState.UNVISITED,
  overflowTotal: 0,
  overflowRemoved: 0
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
export function cursorReducer(
  state: CursorState,
  action: CursorSetLetterRefPayload
) {
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
  INIT = "INIT"
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
export interface TextTypedInitPayload {
  type: TextTypedActionType.INIT;
  textData: WordType[];
}

export type TextTypedPayload =
  | TextTypedUpdatePayload
  | TextTypedInitPayload
  | TextTypedUpdateLetterPayload;

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
          // handle overflow add
          const j = action.targetLetterIndex;
          if (j < newLetters.length) {
            newLetters[j] = action.newLetterValue;
          } else {
            newLetters.push(action.newLetterValue);
            w.overflowTotal += 1;
          }

          // handle overflow remove
          if (newLetters[j].value === "" && newLetters[j].received === "") {
            newLetters.splice(j, 1);
            w.overflowRemoved += 1;
          }
          w.letters = newLetters;
          w.state = getWordState(w);
        }
        return w;
      });
    case TextTypedActionType.INIT:
      return action.textData;
    default:
      throw new Error(JSON.stringify({ state, action }));
  }
}
