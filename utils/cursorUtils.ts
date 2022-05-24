import {
  EMPTY_LETTER_TYPE,
  TextTypedActionType,
  TextTypedPayload
} from "components/reducers";

import { LetterState, LetterType, WordState, WordType } from "interfaces/typeline";

export const getLetterState = (letter: LetterType): LetterState => {
  return letter.history.length > 0
    ? letter.history[letter.history.length - 1].state
    : LetterState.UNVISITED;
};

export const isInvalidKey = (key: string) => {
  if (key.length == 1 || key == " " || key == "Backspace") return false;
  return true;
};

export const isWordCorrect = (word: WordType) => {
  return (
    word.letters.every(
      (letter: LetterType) =>
        getLetterState(letter) == LetterState.CORRECT ||
        getLetterState(letter) == LetterState.CORRECTED
    ) && word.overflow.every((letter: LetterType) => letter.received === "")
  );
};

export const isWordIncorrect = (word: WordType) => {
  return (
    word.letters.some(
      (letter: LetterType) => getLetterState(letter) == LetterState.INCORRECT
    ) || word.overflow.some((letter: LetterType) => letter.received !== "")
  );
};

export const isWordPerfect = (word: WordType) => {
  if (word.state === WordState.INCORRECT) return false;
  return (
    word.letters.every(
      (letter: LetterType) => getLetterState(letter) == LetterState.CORRECT
    ) && word.overflow.length === 0
  );
};

export const isWordBlank = (word: WordType) => {
  return word.letters.every((letter: LetterType) => letter.received == "");
};

export const updateLetterReceived = (
  wordIndex: number,
  letterIndex: number,
  textTyped: WordType[],
  received: string,
  time: number
): TextTypedPayload => {
  const word = textTyped[wordIndex];
  const isOverflow = letterIndex >= word.value.length;
  if (!isOverflow) {
    let newLetter = word.letters[letterIndex];

    const v = newLetter.value;
    const r = newLetter.received;
    const s = getLetterState(newLetter);

    if (r === "") {
      if (received === v) {
        if (s === LetterState.UNVISITED)
          newLetter.history.push({
            state: LetterState.CORRECT,
            timeModified: time
          });
        else
          newLetter.history.push({
            state: LetterState.CORRECTED,
            timeModified: time
          });
      } else {
        newLetter.history.push({
          state: LetterState.INCORRECT,
          timeModified: time
        });
      }
    } else {
      if (received === "") {
        if (s === LetterState.CORRECT) {
          newLetter.history.push({
            state: LetterState.UNVISITED,
            timeModified: time
          });
        } else {
          newLetter.history.push({
            state: LetterState.WAS_INCORRECT,
            timeModified: time
          });
        }
      }
    }
    newLetter.received = received;

    return {
      type: TextTypedActionType.UPDATE_LETTER,
      targetIndex: wordIndex,
      targetLetterIndex: letterIndex,
      newLetterValue: newLetter
    };
  } else {
    let overflowIndex = letterIndex - word.value.length;
    let newOverflow =
      overflowIndex < word.overflow.length
        ? word.overflow[overflowIndex]
        : { value: "", received: "", history: [] };

    console.log(newOverflow, overflowIndex);

    if (received === "") {
      newOverflow.history.push({
        state: LetterState.CORRECTED,
        timeModified: time
      });
    } else {
      newOverflow.history.push({
        state: LetterState.OVERFLOW,
        timeModified: time
      });
    }
    newOverflow.received = received;

    return {
      type: TextTypedActionType.UPDATE_OVERFLOW,
      targetIndex: wordIndex,
      targetOverflowIndex: overflowIndex,
      newOverflowValue: newOverflow
    };
  }
};

export const getTextTypedString = (
  letters: LetterType[],
  overflow: LetterType[]
): string => {
  return (
    letters.map((letter: LetterType) => letter.received).join("") +
    overflow.map((letter: LetterType) => letter.received).join("")
  );
};

export const getWordState = (word: WordType): WordState => {
  if (isWordIncorrect(word)) {
    return WordState.INCORRECT;
  }
  if (isWordPerfect(word)) {
    return WordState.PERFECT;
  }
  if (isWordBlank(word)) {
    return WordState.UNVISITED;
  }
  return WordState.CORRECT;
};

export const getActiveLetterIndex = (word: WordType): number => {
  const letters = word.letters;
  const overflow = word.overflow;
  if (!letters || !overflow) return 0;
  let index = letters.findIndex((letter: LetterType) => letter.received === "");
  const activeOverflow = overflow.filter((letter) => letter.received !== "").length;
  return index < 0 ? letters.length + activeOverflow : index;
};
