import { LetterState, WordState, WordType } from "interfaces/typeline";
import { getWordState, isInvalidKey } from "../cursorUtils";

describe("isInvalidKeyEvent", () => {
  it("should return false when input provided is a single character", () => {
    expect(isInvalidKey("a")).toBe(false);
    expect(isInvalidKey("1")).toBe(false);
    expect(isInvalidKey("]")).toBe(false);
  });

  it("should return true when input provided is a special character or modifier", () => {
    expect(isInvalidKey("Meta")).toBe(true);
    expect(isInvalidKey("Control")).toBe(true);
    expect(isInvalidKey("Escape")).toBe(true);
  });

  it("should return false when input provided is a backspace or space", () => {
    expect(isInvalidKey("Backspace")).toBe(false);
    expect(isInvalidKey(" ")).toBe(false);
  });
});

describe("getWordState", () => {
  const mockWordPerfect: WordType = {
    value: "test",
    letters: [
      {
        value: "t",
        received: "t",
        state: LetterState.CORRECT
      },
      {
        value: "e",
        received: "e",
        state: LetterState.CORRECT
      },
      {
        value: "s",
        received: "s",
        state: LetterState.CORRECT
      },
      {
        value: "t",
        received: "t",
        state: LetterState.CORRECT
      }
    ],
    state: WordState.UNVISITED,
    overflowTotal: 0,
    overflowRemoved: 0
  };
  const mockWordCorrect: WordType = {
    value: "test",
    letters: [
      {
        value: "t",
        received: "t",
        state: LetterState.CORRECT
      },
      {
        value: "e",
        received: "e",
        state: LetterState.CORRECT
      },
      {
        value: "s",
        received: "s",
        state: LetterState.CORRECTED
      },
      {
        value: "t",
        received: "t",
        state: LetterState.CORRECT
      }
    ],
    state: WordState.UNVISITED,
    overflowTotal: 0,
    overflowRemoved: 0
  };
  const mockWordCorrectUnvisited: WordType = {
    value: "test",
    letters: [
      {
        value: "t",
        received: "t",
        state: LetterState.CORRECT
      },
      {
        value: "e",
        received: "e",
        state: LetterState.CORRECTED
      },
      {
        value: "s",
        received: "s",
        state: LetterState.CORRECT
      },
      {
        value: "t",
        received: "",
        state: LetterState.UNVISITED
      }
    ],
    state: WordState.UNVISITED,
    overflowTotal: 0,
    overflowRemoved: 0
  };
  const mockWordCorrectWasIncorrect: WordType = {
    value: "test",
    letters: [
      {
        value: "t",
        received: "t",
        state: LetterState.CORRECT
      },
      {
        value: "e",
        received: "e",
        state: LetterState.CORRECTED
      },
      {
        value: "s",
        received: "s",
        state: LetterState.CORRECT
      },
      {
        value: "t",
        received: "",
        state: LetterState.WAS_INCORRECT
      }
    ],
    state: WordState.UNVISITED,
    overflowTotal: 0,
    overflowRemoved: 0
  };
  const mockWordIncorrectUnvisited: WordType = {
    value: "test",
    letters: [
      {
        value: "t",
        received: "t",
        state: LetterState.CORRECT
      },
      {
        value: "e",
        received: "e",
        state: LetterState.INCORRECT
      },
      {
        value: "s",
        received: "s",
        state: LetterState.CORRECT
      },
      {
        value: "t",
        received: "",
        state: LetterState.UNVISITED
      }
    ],
    state: WordState.UNVISITED,
    overflowTotal: 0,
    overflowRemoved: 0
  };
  const mockWordIncorrectOverflow: WordType = {
    value: "test",
    letters: [
      {
        value: "t",
        received: "t",
        state: LetterState.CORRECT
      },
      {
        value: "e",
        received: "e",
        state: LetterState.CORRECT
      },
      {
        value: "s",
        received: "s",
        state: LetterState.CORRECT
      },
      {
        value: "t",
        received: "t",
        state: LetterState.CORRECT
      },
      {
        value: "",
        received: "t",
        state: LetterState.OVERFLOW
      }
    ],
    state: WordState.UNVISITED,
    overflowTotal: 0,
    overflowRemoved: 0
  };

  it("should return PERFECT when all letters passed are CORRECT", () => {
    expect(getWordState(mockWordPerfect)).toBe(WordState.PERFECT);
  });

  it("should return CORRECT when all letters passed are CORRECT or CORRECTED or UNVISITED or WAS_INCORRECT", () => {
    expect(getWordState(mockWordCorrect)).toBe(WordState.CORRECT);
    expect(getWordState(mockWordCorrectUnvisited)).toBe(WordState.CORRECT);
    expect(getWordState(mockWordCorrectWasIncorrect)).toBe(WordState.CORRECT);
  });

  it("should return INCORRECT when any letter passed is INCORRECT or OVERFLOW", () => {
    expect(getWordState(mockWordIncorrectUnvisited)).toBe(WordState.INCORRECT);
    expect(getWordState(mockWordIncorrectOverflow)).toBe(WordState.INCORRECT);
  });
});
