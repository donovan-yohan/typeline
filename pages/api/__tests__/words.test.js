import { formatWord } from "../words.js"; 
import cleanSeed, {
    CHARACTER_PLACEMENT,
    punctuationTriggers,
    PUNCTUATION_TABLE,
    symbolTriggers,
    SYMBOL_TABLE,
  } from "../../../utils/cleanSeed.js";


describe("formatWord", () => {
    it('should wrap word with characters', () => {
        expect(formatWord("word", PUNCTUATION_TABLE[6].char, PUNCTUATION_TABLE[6].placement)).toBe('"word"');
      });
})