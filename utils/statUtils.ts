import { Stat, TypedData, WordType } from "interfaces/typeline";

export const getAllStats = (
  typedData: TypedData[],
  wordDatabase: string[],
  totalTime: number
): Stat[] => {
  let currentTime = 0;

  let correct = 0;
  let incorrect = 0;
  let corrected = 0;

  // how to handle letters that were corrected?
  // while (time < 1000)
  // ...
  // typedData -> textTyped -> stats
  // extract cursor functions into utils that can be called with custom reducers/state
  // takes a letter as a parameter and treats it like a key input
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
