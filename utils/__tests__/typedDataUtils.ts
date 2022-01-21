import { TypedData } from "../../components/reducers";
import {
  BACKSPACE_CHAR,
  SPACE_CHAR,
  PREVWORD_CHAR,
  getTypedFromFull,
  getWordStats,
  findEndOfVisitIndex,
} from "../typedDataUtils";

describe("getTypedFromFull", () => {
  it("should give correct number of correct keystrokes", () => {
    expect(
      getTypedFromFull(
        `hellp${SPACE_CHAR}${BACKSPACE_CHAR}${BACKSPACE_CHAR}${BACKSPACE_CHAR}${BACKSPACE_CHAR}${BACKSPACE_CHAR}${PREVWORD_CHAR}helli${BACKSPACE_CHAR}o${SPACE_CHAR}${PREVWORD_CHAR}`
      )
    ).toBe("hello");
    expect(getTypedFromFull(`${SPACE_CHAR}${PREVWORD_CHAR}`)).toBe("");
    expect(getTypedFromFull(`hello`)).toBe("hello");
    expect(
      getTypedFromFull(
        `${PREVWORD_CHAR}${PREVWORD_CHAR}${PREVWORD_CHAR}${PREVWORD_CHAR}${PREVWORD_CHAR}${PREVWORD_CHAR}${PREVWORD_CHAR}${PREVWORD_CHAR}hello`
      )
    ).toBe("hello");
  });
});

describe("getWordStats", () => {
  it("should return stats from fulltyped version of word", () => {
    expect(
      getWordStats(
        { fullValue: `hellp${BACKSPACE_CHAR}o${SPACE_CHAR}` } as TypedData,
        "hello",
        { fullValue: "" } as TypedData,
        ""
      )
    ).toEqual({ correct: 6, incorrect: 1, corrected: 1 });

    expect(
      getWordStats(
        {
          fullValue: `hellpzc${BACKSPACE_CHAR}${BACKSPACE_CHAR}${BACKSPACE_CHAR}o${SPACE_CHAR}`,
        } as TypedData,
        "hello",
        { fullValue: "" } as TypedData,
        ""
      )
    ).toEqual({ correct: 6, incorrect: 3, corrected: 3 });

    expect(
      getWordStats(
        {
          fullValue: `hello${SPACE_CHAR}`,
        } as TypedData,
        "hello",
        { fullValue: "" } as TypedData,
        ""
      )
    ).toEqual({ correct: 6, incorrect: 0, corrected: 0 });

    expect(
      getWordStats(
        {
          fullValue: `he${BACKSPACE_CHAR}${BACKSPACE_CHAR}${PREVWORD_CHAR}`,
        } as TypedData,
        "hello",
        { fullValue: `goodby${SPACE_CHAR}` } as TypedData,
        "goodbye"
      )
    ).toEqual({ correct: 2, incorrect: 0, corrected: 1 });

    expect(
      getWordStats(
        {
          fullValue: `he${BACKSPACE_CHAR}${BACKSPACE_CHAR}${PREVWORD_CHAR}hello${SPACE_CHAR}`,
        } as TypedData,
        "hello",
        { fullValue: `goodby${SPACE_CHAR}e${SPACE_CHAR}` } as TypedData,
        "goodbye"
      )
    ).toEqual({ correct: 8, incorrect: 0, corrected: 1 });
  });
});

describe("findEndOfVisitIndex", () => {
  it("should return index of last character on a given visit to a word", () => {
    expect(findEndOfVisitIndex("", 1)).toEqual(0);

    expect(findEndOfVisitIndex(`hellop${SPACE_CHAR}`, 0)).toEqual(6);

    expect(findEndOfVisitIndex(`hellop${SPACE_CHAR}`, 1)).toEqual(7);

    expect(findEndOfVisitIndex(`hellop${SPACE_CHAR}`, 3)).toEqual(7);

    expect(
      findEndOfVisitIndex(
        `hellop${SPACE_CHAR}${BACKSPACE_CHAR}${SPACE_CHAR}`,
        0
      )
    ).toEqual(6);

    expect(
      findEndOfVisitIndex(
        `hellop${SPACE_CHAR}${BACKSPACE_CHAR}${SPACE_CHAR}`,
        1
      )
    ).toEqual(8);
  });
});
