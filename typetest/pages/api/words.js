import pseudorandom from "seed-random";
import shortWords from "../../assets/short.js";
import mediumWords from "../../assets/medium.js";
import longWords from "../../assets/long.js";
import cleanSeed, {
  CHARACTER_PLACEMENT,
  punctuationTriggers,
  PUNCTUATION_TABLE,
  symbolTriggers,
  SYMBOL_TABLE,
} from "../../utils/cleanSeed.js";

const NUMBER_CHANCE = 0.15;
const NEW_DATE_CHANCE = 0.4;
const OLD_DATE_CHANCE = 0.1;
const SYMBOL_CHANCE = 0.05;
const PUNCTUATION_CHANCE = 0.2;
const MEDIUM_WORD_CHANCE = 0.15;
const LONG_WORD_CHANCE = 0.1;

const MIN_PUNCTUATION_SPACE = 7;
const MAX_PUNCTUATION_SPACE = 15;

const MAX_SYMBOL_SPACE = 15;

const LONG_WORD_BREAKPOINT = 10;

const MIN_WORDS = 50;

const containsUpperCase = (string) => /^\S*[A-Z]+\S*$/.test(string);
const containsNumber = (string) => /^\S*[0-9]+\S*$/.test(string);
const containsCharacter = (string, character) => {
  const regex = new RegExp(`\S*[${character}]\S*`);
  return regex.test(string);
};

function getRandomWithBias(random, min, max, bias, influence) {
  let num = random() * (max - min) + min;
  let mix = random() * influence;
  return num * (1 - mix) + bias * mix;
}

function getRandom(random, min, max) {
  return random() * (max - min) + min;
}

function generateFlags(seed) {
  return [
    containsUpperCase(seed), // hasUppercase
    containsNumber(seed), // hasNumbers
    containsCharacter(seed, punctuationTriggers), // hasPunctuation
    containsCharacter(seed, symbolTriggers), // hasSymbols
    seed.length > LONG_WORD_BREAKPOINT, // hasLongWords
  ];
}

function generateDate(r, random) {
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

function getRandomWord(wordList, random) {
  return wordList[
    Math.floor(getRandomWithBias(random, 0, shortWords.length - 1, 0, 1))
  ];
}

function formatWord(word, symbol, placement) {
  if (placement === CHARACTER_PLACEMENT.BEFORE) {
    return symbol + word;
  } else if (placement === CHARACTER_PLACEMENT.AFTER) {
    return word + symbol;
  } else if (placement === CHARACTER_PLACEMENT.WRAP) {
    if (symbol.length == 2) {
      return symbol.charAt(0) + word + symbol.charAt(1);
    } else {
      warn(
        `Wrapping word, ${word}, but did not receive explicit pair of symbols. (Received: ${symbol})`
      );
      return symbol + word + symbol;
    }
  }
}

function generateWords(
  random,
  hasUppercase,
  hasNumbers,
  hasPunctuation,
  hasSymbols,
  hasLongWords,
  time
) {
  let words = [];
  let symbolCounter = 0;
  let puncCounter = 0;

  let totalWords = (time / 60) * 400;
  if (totalWords < MIN_WORDS) totalWords = MIN_WORDS;

  while (words.length < totalWords) {
    let r = random();

    let word;

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
          getRandomWord(shortWords, random) +
          symbol.char +
          getRandomWord(shortWords, random);
      } else if (symbol.char === "$") {
        word = formatWord(
          getRandom(random, 0, 100).toFixed(2),
          symbol.char,
          symbol.placement
        );
      } else if (symbol.char === "%") {
        word = formatWord(
          Math.floor(getRandom(random, 0, 100)),
          symbol.char,
          symbol.placement
        );
      } else if (symbol.placement === CHARACTER_PLACEMENT.WRAP) {
        word = formatWord(
          getRandomWord(shortWords, random),
          symbol.char,
          symbol.placement
        );
      } else {
        word = symbol.char;
      }
    } else {
      symbolCounter += 1;
      r = random();
      if (r < MEDIUM_WORD_CHANCE) {
        word = getRandomWord(mediumWords, random);
      } else if (hasLongWords && r < MEDIUM_WORD_CHANCE + LONG_WORD_CHANCE) {
        word = getRandomWord(longWords, random);
      } else {
        word = getRandomWord(shortWords, random);
      }
      if (hasPunctuation && puncCounter > MIN_PUNCTUATION_SPACE) {
        r = random();
        if (puncCounter > MAX_PUNCTUATION_SPACE || r < PUNCTUATION_CHANCE) {
          puncCounter = 0;
          r = random();
          let probability = 0;
          let punctuation = ".";

          PUNCTUATION_TABLE.some((p) => {
            probability += p.probability;
            if (r <= probability) {
              punctuation = p.char;
              return true;
            }
          });

          if (punctuation.placement === CHARACTER_PLACEMENT.WRAP)
            word = formatWord(word, punctuation);
          else word += punctuation;
        } else {
          puncCounter += 1;
        }
      } else {
        puncCounter += 1;
      }
    }

    if (!hasUppercase) word = word.toLowerCase();
    else if (random() < 0.1)
      word = word.charAt(0).toUpperCase() + word.slice(1);

    words.push(word);
  }
  return words;
}

export default (req, res) => {
  let { seed, time } = JSON.parse(req.body);
  let random = pseudorandom(cleanSeed(seed));

  let words = generateWords(random, ...generateFlags(seed), time);

  res.status(200).json({ words });
};
