import pseudorandom from "seed-random";
import shortWords from "../../assets/short.js";
import mediumWords from "../../assets/medium.js";
import longWords from "../../assets/long.js";
import cleanSeed, {
  PUNCTUATION_TABLE,
  SYMBOL_TABLE,
} from "../../utils/cleanSeed.js";

const NUMBER_CHANCE = 0.15;
const NEW_DATE_CHANCE = 0.4;
const OLD_DATE_CHANCE = 0.1;
const SYMBOL_CHANCE = 0.05;
const PUNCTUATION_CHANCE = 0.2;

const MIN_PUNCTUATION_SPACE = 7;
const MAX_PUNCTUATION_SPACE = 15;

const MAX_SYMBOL_SPACE = 15;

const LONG_WORD_BREAKPOINT = 10;

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
  let punctuationTriggers = PUNCTUATION_TABLE.reduce((acc, p) => {
    return acc + p.char;
  }, "");

  let symbolTriggers = SYMBOL_TABLE.reduce((acc, s) => {
    return acc + s.char;
  }, "");

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

  while (words.length < (time / 60) * 400) {
    let r = random();

    let word;

    if (hasNumbers && r < NUMBER_CHANCE) {
      r = random();
      word = generateDate(r, random);
    } else if (
      hasSymbols &&
      r >= NUMBER_CHANCE &&
      r < SYMBOL_CHANCE + NUMBER_CHANCE
    ) {
      // SYMBOLS
      symbolCounter = 0;
      r = random();
      let probability = 0;
      let symbol = "&";

      SYMBOL_TABLE.some((s) => {
        probability += s.probability;
        if (r <= probability) {
          symbol = s.char;
          return true;
        }
      });

      if (symbol === "/" || symbol === "-") {
        word =
          shortWords[
            Math.floor(
              getRandomWithBias(random, 0, shortWords.length - 1, 0, 1)
            )
          ] +
          symbol +
          shortWords[
            Math.floor(
              getRandomWithBias(random, 0, shortWords.length - 1, 0, 1)
            )
          ];
      } else if (symbol === "$") {
        word = symbol + getRandom(random, 0, 100).toFixed(2);
      } else if (symbol === "%") {
        word = Math.floor(getRandom(random, 0, 100)) + symbol;
      } else if (symbol === "()") {
        word =
          "(" +
          shortWords[
            Math.floor(
              getRandomWithBias(random, 0, shortWords.length - 1, 0, 1)
            )
          ] +
          ")";
      } else {
        word = symbol;
      }
    } else {
      if (r > 0.8 && r <= 0.95) {
        word =
          mediumWords[
            Math.floor(
              getRandomWithBias(random, 0, mediumWords.length - 1, 0, 1)
            )
          ];
      } else if (hasLongWords && r > 0.95) {
        word =
          longWords[
            Math.floor(getRandomWithBias(random, 0, longWords.length - 1, 0, 1))
          ];
      } else {
        word =
          shortWords[
            Math.floor(
              getRandomWithBias(random, 0, shortWords.length - 1, 0, 1)
            )
          ];
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

          if (punctuation === '"') word = '"' + word + '"';
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
