import {
  LetterState,
  LetterType,
  WordState,
  WordType
} from "interfaces/typeline";

export function createTextDatabase(text: string[]): WordType[] {
  let textData = text.map((word) => {
    return {
      value: word,
      letters: word.split("").map((letter) => {
        return {
          value: letter,
          received: "",
          state: LetterState.UNVISITED
        } as LetterType;
      }),
      state: WordState.UNVISITED,
      overflowTotal: 0,
      overflowRemoved: 0
    } as WordType;
  });

  return textData;
}
