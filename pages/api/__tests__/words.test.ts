import { PUNCTUATION_TABLE } from "../../../utils/getSeedAndTime";
import { formatWord } from "../words";

describe("formatWord", () => {
  it("should wrap word with characters", () => {
    expect(
      formatWord(
        "word",
        PUNCTUATION_TABLE[6].char,
        PUNCTUATION_TABLE[6].placement
      )
    ).toBe('"word"');
  });
});
