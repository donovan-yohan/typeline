import {
  TextTypedActionType,
  TextTypedUpdateLetterPayload
} from "components/reducers";

import {
  LetterState,
  LetterType,
  WordState,
  WordType
} from "interfaces/typeline";

export const isInvalidKey = (key: string) => {
  if (key.length == 1 || key == " " || key == "Backspace") return false;
  return true;
};

export const isWordCorrect = (word: WordType) => {
  return word.letters.every(
    (letter: LetterType) =>
      letter.state == LetterState.CORRECT ||
      letter.state == LetterState.CORRECTED
  );
};

export const isWordIncorrect = (word: WordType) => {
  return word.letters.some(
    (letter: LetterType) => letter.state == LetterState.INCORRECT
  );
};

export const isWordPerfect = (word: WordType) => {
  return word.letters.every(
    (letter: LetterType) => letter.state == LetterState.CORRECT
  );
};

export const isWordBlank = (word: WordType) => {
  return word.letters.every((letter: LetterType) => letter.received == "");
};

export const updateLetterReceived = (
  wordIndex: number,
  letterIndex: number,
  textTyped: WordType[],
  received: string
): TextTypedUpdateLetterPayload => {
  const word = textTyped[wordIndex];
  let newLetter =
    letterIndex < word.value.length
      ? { ...word.letters[letterIndex] }
      : ({
          value: "",
          received,
          state: LetterState.OVERFLOW
        } as LetterType);

  const v = newLetter.value;
  const r = newLetter.received;
  const s = newLetter.state;

  if (s != LetterState.OVERFLOW) {
    if (r === "") {
      if (received === v) {
        if (s === LetterState.UNVISITED) newLetter.state = LetterState.CORRECT;
        else newLetter.state = LetterState.CORRECTED;
      } else {
        newLetter.state = LetterState.INCORRECT;
      }
    } else {
      if (received === "") {
        if (s === LetterState.CORRECT) {
          newLetter.state = LetterState.UNVISITED;
        } else {
          newLetter.state = LetterState.WAS_INCORRECT;
        }
      }
    }
    newLetter.received = received;
  }
  return {
    type: TextTypedActionType.UPDATE_LETTER,
    targetIndex: wordIndex,
    targetLetterIndex: letterIndex,
    newLetterValue: newLetter
  };
};

export const getTextTypedString = (letters: LetterType[]): string => {
  return letters.map((letter: LetterType) => letter.received).join("");
};

export const getWordState = (word: WordType): WordState => {
  if (
    word.letters.some(
      (l) =>
        l.state === LetterState.INCORRECT || l.state === LetterState.OVERFLOW
    )
  ) {
    return WordState.INCORRECT;
  }

  if (word.letters.every((l) => l.state === LetterState.CORRECT)) {
    return WordState.PERFECT;
  }

  if (word.letters.every((l) => l.received === "")) {
    return WordState.UNVISITED;
  }

  return WordState.CORRECT;
};

export const getActiveLetterIndex = (letters: LetterType[]): number => {
  let index = letters.findIndex((letter: LetterType) => letter.received === "");
  return index < 0 ? letters.length : index;
};

export const getLastActiveLetterindex = (letters: LetterType[]): number => {
  let index =
    letters.findIndex((letter: LetterType) => letter.received === "") - 1;
  return index < 0 ? letters.length - 1 : index;
};
