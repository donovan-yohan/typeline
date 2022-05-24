import {
  BACKSPACE_CHAR,
  LetterState,
  SPACE_CHAR,
  Stat,
  TypedData,
  WordType
} from "interfaces/typeline";

export const getAllStats = (
  words: WordType[],
  totalTime: number // in ms
): Stat[] => {
  let currentTime = 0;

  // sort words into indexes based on time
  let lettersByTime = words.reduce(
    (acc, cur) => {
      cur.letters.forEach((letter) => {
        letter.history.forEach((keystroke) => {
          const timeIndex = Math.floor(keystroke.timeModified / 1000);
          if (acc[timeIndex] === undefined) acc[timeIndex] = [];
          acc[timeIndex].push(keystroke.state);
        });
      });
      return acc;
    },
    [[]] as [LetterState[]]
  );

  
};

export const getStatAtTime = (
  typedData: TypedData[],
  wordDatabase: string[],
  time: number
): Stat => {};

export const getAverageStats = (
  typedData: TypedData[],
  wordDatabase: string[],
  totalTime: number
): Stat => {};
