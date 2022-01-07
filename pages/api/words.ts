import pseudorandom from "seed-random";
import shortWords from "../../assets/short.js";
import mediumWords from "../../assets/medium.js";
import longWords from "../../assets/long.js";
import getSeedAndTime, {
  CHARACTER_PLACEMENT,
  punctuationTriggers,
  PUNCTUATION_TABLE,
  symbolTriggers,
  SYMBOL_TABLE,
} from "../../utils/getSeedAndTime.js";
import { NextApiRequest, NextApiResponse } from "next";

interface seedFlags {
  hasUppercase: boolean;
  hasNumbers: boolean;
  hasPunctuation: boolean;
  hasSymbols: boolean;
  wordLengthRange: [number, number];
}

const COMMON_WORD_BIAS = 0.8;

const SHORT_WORD_MAX_LENGTH = 4;
const MEDIUM_WORD_MAX_LENGTH = 8;
const LONGEST_WORD_LENGTH = 14;

const CAPITAL_CHANCE = 0.1;
const NUMBER_CHANCE = 0.15;
const NEW_DATE_CHANCE = 0.4;
const OLD_DATE_CHANCE = 0.1;
const SYMBOL_CHANCE = 0.05;
const PUNCTUATION_CHANCE = 0.2;

const MIN_PUNCTUATION_SPACE = 7;
const MAX_PUNCTUATION_SPACE = 15;

const MAX_SYMBOL_SPACE = 15;

const MIN_WORDS = 50;

const containsUpperCase = (string: string): boolean =>
  /^\S*[A-Z]+\S*$/.test(string);
const containsNumber = (string: string): boolean =>
  /^\S*[0-9]+\S*$/.test(string);
const containsCharacter = (string: string, characters: string): boolean => {
  const regex = new RegExp(`\S*[${characters}]\S*`);
  return regex.test(string);
};
const getWordLengthRange = (string: string): [number, number] => {
  let ranges = string.split("-");
  if (ranges.length === 2) {
    let start = Math.min(
      ranges[0].length % LONGEST_WORD_LENGTH,
      ranges[1].length % LONGEST_WORD_LENGTH
    );
    let end = Math.max(
      ranges[0].length % LONGEST_WORD_LENGTH,
      ranges[1].length % LONGEST_WORD_LENGTH
    );
    return [start, end];
  }

  return [0, string.length % LONGEST_WORD_LENGTH];
};

function getRandomWithBias(
  random: () => number,
  min: number,
  max: number,
  bias: number,
  influence: number
) {
  let num = random() * (max - min) + min;
  let mix = random() * influence;
  return num * (1 - mix) + bias * mix;
}

const getRandom = (random: () => number, min: number, max: number): number => {
  return random() * (max - min) + min;
};

const generateFlags = (seed: string): seedFlags => {
  return {
    hasUppercase: containsUpperCase(seed),
    hasNumbers: containsNumber(seed),
    hasPunctuation: containsCharacter(seed, punctuationTriggers),
    hasSymbols: containsCharacter(seed, symbolTriggers),
    wordLengthRange: getWordLengthRange(seed),
  };
};

function generateDate(r: number, random: () => number) {
  if (r < NEW_DATE_CHANCE) {
    // generate date from 1600 to present
    return Math.floor(getRandom(random, 1600, new Date().getFullYear())) + "";
  } else if (r >= NEW_DATE_CHANCE && r < NEW_DATE_CHANCE + OLD_DATE_CHANCE) {
    // generate BC date
    let date = Math.floor(getRandom(random, 100, 900));
    return date + "BC";
  } else {
    // generate a placement number
    let number = Math.floor(getRandom(random, 1, 20));
    if (number === 1) {
      return "1st";
    } else if (number === 2) {
      return "2nd";
    } else if (number === 3) {
      return "3rd";
    } else {
      return number + "th";
    }
  }
}

function getRandomWord(wordList: string[], random: () => number): string {
  let index = getRandomWithBias(
    random,
    0,
    wordList.length - 0.001,
    0,
    COMMON_WORD_BIAS
  );
  return wordList[Math.floor(index)];
}

export function formatWord(
  word: string,
  symbol: string,
  placement: CHARACTER_PLACEMENT
): string {
  if (placement === CHARACTER_PLACEMENT.BEFORE) {
    return symbol + word;
  } else if (placement === CHARACTER_PLACEMENT.AFTER) {
    return word + symbol;
  } else {
    if (symbol.length == 2) {
      return symbol.charAt(0) + word + symbol.charAt(1);
    } else {
      return symbol + word + symbol;
    }
  }
}

// combine n arrays with alternating values
function combineArraysAlternating<T>(arrays: T[][]): T[] {
  let combined: T[] = [];
  let length = Math.max(...arrays.map((a) => a.length));
  for (let i = 0; i < length; i++) {
    arrays.forEach((a) => {
      if (a[i]) combined.push(a[i]);
    });
  }
  return combined;
}

function filterWordBank(range: [number, number]) {
  let [min, max] = range;
  let short = shortWords;
  let med = mediumWords;
  let long = longWords;

  if (min > SHORT_WORD_MAX_LENGTH) short = [];
  else if (max < SHORT_WORD_MAX_LENGTH)
    short = short.filter((w) => w.length <= max && w.length > min);

  if (min > MEDIUM_WORD_MAX_LENGTH || max <= SHORT_WORD_MAX_LENGTH) med = [];
  else med = med.filter((w) => w.length <= max && w.length > min);

  if (max <= MEDIUM_WORD_MAX_LENGTH) long = [];
  else if (min > MEDIUM_WORD_MAX_LENGTH)
    long = long.filter((w) => w.length <= max && w.length > min);

  return combineArraysAlternating([short, med]).concat(long);
}

function generateWords(random: () => number, flags: seedFlags, time: number) {
  let {
    hasUppercase,
    hasNumbers,
    hasPunctuation,
    hasSymbols,
    wordLengthRange,
  } = flags;
  let words = [];
  let symbolCounter = 0;
  let puncCounter = 0;

  let totalWords = (time / 60) * 500;
  if (totalWords < MIN_WORDS) totalWords = MIN_WORDS;

  let wordBank = filterWordBank(wordLengthRange);

  while (words.length < totalWords) {
    let r = random();
    let word = "";

    if (hasNumbers && r < NUMBER_CHANCE) {
      r = random();
      word = generateDate(r, random);
    } else if (
      hasSymbols &&
      ((r >= NUMBER_CHANCE && r < SYMBOL_CHANCE + NUMBER_CHANCE) ||
        symbolCounter > MAX_SYMBOL_SPACE)
    ) {
      // SYMBOLS
      symbolCounter = 0;
      r = random();
      let probability = 0;
      let symbol = SYMBOL_TABLE[0];

      SYMBOL_TABLE.some((s) => {
        probability += s.probability;
        if (r <= probability) {
          symbol = s;
          return true;
        }
      });

      if (symbol.placement === CHARACTER_PLACEMENT.MIDDLE) {
        word =
          getRandomWord(wordBank, random) +
          symbol.char +
          getRandomWord(wordBank, random);
      } else if (symbol.char === "$") {
        word = formatWord(
          getRandom(random, 0, 100).toFixed(2),
          symbol.char,
          symbol.placement
        );
      } else if (symbol.char === "%") {
        word = formatWord(
          Math.floor(getRandom(random, 0, 100)).toString(),
          symbol.char,
          symbol.placement
        );
      } else if (symbol.placement === CHARACTER_PLACEMENT.WRAP) {
        word = formatWord(
          getRandomWord(wordBank, random),
          symbol.char,
          symbol.placement
        );
      } else {
        word = symbol.char;
      }
    } else {
      symbolCounter += 1;
      r = random();
      word = getRandomWord(wordBank, random);
      if (hasPunctuation && puncCounter > MIN_PUNCTUATION_SPACE) {
        r = random();
        if (puncCounter > MAX_PUNCTUATION_SPACE || r < PUNCTUATION_CHANCE) {
          puncCounter = 0;
          r = random();
          let probability = 0;
          let punctuation = PUNCTUATION_TABLE[0];

          PUNCTUATION_TABLE.some((p) => {
            probability += p.probability;
            if (r <= probability) {
              punctuation = p;
              return true;
            }
          });

          if (punctuation.placement == CHARACTER_PLACEMENT.WRAP) {
            word = formatWord(word, punctuation.char, punctuation.placement);
            console.log(word);
          } else word += punctuation.char;
        } else {
          puncCounter += 1;
        }
      } else {
        puncCounter += 1;
      }
    }

    if (!hasUppercase) word = word.toLowerCase();
    else if (random() < CAPITAL_CHANCE)
      word = word.charAt(0).toUpperCase() + word.slice(1);

    words.push(word);
  }
  return words;
}

export default (req: NextApiRequest, res: NextApiResponse) => {
  let { seed, time } = JSON.parse(req.body);
  let random = pseudorandom(getSeedAndTime(seed).seed);

  let words = generateWords(random, generateFlags(seed), time);

  res.status(200).json({ words });
};