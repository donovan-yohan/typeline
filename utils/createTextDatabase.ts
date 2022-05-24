import { LetterType, WordState, WordType } from "interfaces/typeline";

export function createTextDatabase(text: string[]): WordType[] {
  let textData = text.map((word) => {
    return {
      value: word,
      letters: word.split("").map((letter) => {
        return {
          value: letter,
          received: "",
          history: []
        } as LetterType;
      }),
      overflow: [] as LetterType[],
      state: WordState.UNVISITED
    } as WordType;
  });

  return textData;
}
