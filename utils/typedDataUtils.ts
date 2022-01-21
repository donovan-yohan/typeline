import { EMPTY_TYPED_DATA, Stats, TypedData } from "../components/reducers";

declare global {
  interface String {
    splice(start: number, deleteCount: number, add?: string): string;
  }
}

Object.defineProperty(String.prototype, "splice", {
  value: function (start: number, end: number, add = "") {
    return this.slice(0, start) + add + this.slice(end, this.length);
  },
  configurable: true,
});

// TODO: ignore these when typing to cursor
export const BACKSPACE_CHAR = "←";
export const SPACE_CHAR = "↗";
export const PREVWORD_CHAR = "↙";

const wordChangeRegex = new RegExp(`[${SPACE_CHAR}|${PREVWORD_CHAR}]`, "g");

// ondl~<l~<~<ly returns 1 should return 2
// ondl~<~<ly
export const getCorrections = (
  expected: string,
  typedFull: string,
  reference = expected
) => {
  let i = typedFull.indexOf(BACKSPACE_CHAR);
  let isBackspaceChar = true;
  let backspaces = 0;

  let corrections = 0;
  while (i > 0) {
    let backspaceIndex = i;
    // get number of consecutive backspaces
    while (isBackspaceChar) {
      for (let j = 0; j < BACKSPACE_CHAR.length; j++) {
        if (typedFull[backspaceIndex] != BACKSPACE_CHAR[j]) {
          isBackspaceChar = false;
          break;
        }
        backspaceIndex++;
      }
      if (isBackspaceChar) backspaces++;
    }

    // compare old with new and replace chars
    let originalIndex = i - backspaces;
    let replaceIndex = i + backspaces * BACKSPACE_CHAR.length;

    for (let j = 0; j < backspaces; j++) {
      // check if there was an error, that it was fixed correctly
      // OR if the backspace was for an overflow character
      if (
        (typedFull[replaceIndex + j] != typedFull[originalIndex + j] &&
          typedFull[replaceIndex + j] == expected[originalIndex + j]) ||
        originalIndex + j > reference.length - 1
      ) {
        corrections++;
        typedFull = stringReplaceAt(
          typedFull,
          originalIndex + j,
          typedFull[replaceIndex + j]
        );
      }
    }
    typedFull = spliceString(
      typedFull,
      originalIndex + backspaces,
      backspaces * 3
    );
    i = typedFull.indexOf(BACKSPACE_CHAR);
  }
  return corrections;
};

// TODO: check how much of this is still needed
export const getStats = (
  typedData: TypedData[],
  textDatabase: string[],
  index = 0
): Stats => {
  let current = typedData[index];
  let expected = textDatabase[index];
  let last: TypedData = index > 0 ? typedData[index - 1] : EMPTY_TYPED_DATA;
  let lastExpected: string = index > 0 ? textDatabase[index - 1] : "";

  let totalStats: Stats = { correct: 0, incorrect: 0, corrected: 0 };
  while (current.fullValue.length > 0) {
    totalStats = sumStats(
      totalStats,
      getWordStats(current, expected, last, lastExpected)
    );

    last = current;
    lastExpected = expected;
    current = typedData[++index];
    expected = textDatabase[index];
  }

  return totalStats;
};

// only store typedFull and typed in the state, move stats to be computed when test finishes
export const getWordStats = (
  typedData: TypedData,
  expected: string,
  lastTypedData: TypedData,
  lastExpected: string
) => {
  // hellp<o_
  // hello
  let [correct, incorrect, corrected] = [0, 0, 0];
  let { fullValue: typedFull } = typedData;

  let expectedIndex = 0;
  let visit = 0;

  for (let i = 0; i < typedFull.length; i++) {
    const typed = getTypedFromFull(typedFull.slice(0, i + 1));
    const isCorrect =
      typed.length < expected.length
        ? typed === expected.slice(0, typed.length)
        : typed === expected;
    const isFinished = typed === expected;
    const isLastCorrect =
      getTypedFromFull(
        lastTypedData.fullValue.slice(
          0,
          findEndOfVisitIndex(lastTypedData.fullValue, visit)
        )
      ) === lastExpected;

    if (typedFull[i] === BACKSPACE_CHAR) {
      let backspaces = getConsecutiveCharacters(typedFull, i);
      for (let b = 0; b < backspaces; b++) {
        const isOverflow =
          getTypedFromFull(typedFull.slice(0, i - b)).length > expected.length;
        const wasIncorrect =
          i - b - 1 > 0 && expectedIndex - b - 1 > 0
            ? typedFull[i - b - 1] !== expected[expectedIndex - b - 1]
            : false;
        if (isOverflow || wasIncorrect) {
          corrected++;
        } else if (isCorrect && isLastCorrect) {
          incorrect++;
        }
      }
      i += backspaces - 1;
      expectedIndex -= backspaces + 1;
    } else if (typedFull[i] === SPACE_CHAR) {
      if (isFinished) correct++;
      else incorrect++;
      expectedIndex--;
      visit++;
    } else if (typedFull[i] === PREVWORD_CHAR) {
      if (isLastCorrect) incorrect++;
      else corrected++;
      expectedIndex--;
      visit++;
    } else {
      typedFull[i] === expected[expectedIndex] ? correct++ : incorrect++;
    }

    expectedIndex++;
  }

  return { correct, incorrect, corrected };
};
// word doesn't have knowledge about correctness of a backspace when changing words
// is there an algorithm to use when generating stats to compare words against each other for transition characters
// i.e. this function only generates stats for the current word itself
// another function passes over all words and accounts for transitions?
// keep track of last word with uncorrected characters and only update forwards to save processing time
// space can either be correct or incorrect
//    space is correct if getTypedFromFull(typedFull) === expected
//    space is incorrect otherwise
// backspace can be be corrected or incorrect
//    backspace is incorrect if it deletes a correct character and either: 1) no incorrect characters or 2) last word is correct
//    backspace is corrected if it deletes an incorrect character
// prevword can be corrected or incorrect
//    incorrect if getTypedFromFull(lastWord.typedFull) === lastWord.expected
//    corrected if getTypedFromFull(lastWord.typedFull) !== lastWord.expected
// function: start index takes whole array of words, activeWord
//     returns Math.max(activeWord, words.slice(0, activeWord).findLastIndex(word => getIncorrect(word) != 0))
// function: initial function called on whole array of words + start index
// start index is another function
//    function: calculate word stats (word, wordBefore)
//
// until: item.typedFull is empty

const getConsecutiveCharacters = (string: string, index: number) => {
  const char = string[index];
  let count = 1;
  for (let i = index + 1; i < string.length; i++) {
    if (string[i] === char) {
      count++;
    } else {
      break;
    }
  }
  return count;
};

export const findEndOfVisitIndex = (string: string, visit = 0): number => {
  let match;
  let visitIndexes = [];
  while ((match = wordChangeRegex.exec(string))) visitIndexes.push(match.index);
  return visitIndexes[visit] ? visitIndexes[visit] : string.length;
};

export const getTypedFromFull = (typedFull: string): string => {
  let visits = typedFull.split(wordChangeRegex);

  let typed = "";
  visits.forEach((visit) => {
    if (visit.length > 0) typed = parseBackspaces(visit, typed);
  });
  return typed;
};

const parseBackspaces = (input: string, initialState = ""): string => {
  let state = initialState + input;
  let i = state.indexOf(BACKSPACE_CHAR);
  while (i > 0) {
    let n = getConsecutiveCharacters(state, i);
    state = state.splice(i - n, i + n * 2, state.slice(i + n, i + n * 2));
    i = state.indexOf(BACKSPACE_CHAR);
  }
  return state;
};

const sumStats = (s1: Stats, s2: Stats): Stats => {
  return {
    correct: s1.correct + s2.correct,
    incorrect: s1.incorrect + s2.incorrect,
    corrected: s1.corrected + s2.corrected,
  };
};

const spliceString = (str: string, i: number, count = str.length, add = "") => {
  return str.slice(0, i) + add + str.slice(i + count);
};
const stringReplaceAt = (str: string, i: number, val = "") => {
  return str.substr(0, i) + val + str.substr(i + val.length);
};
