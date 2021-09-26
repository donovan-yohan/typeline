export const MAX_TIME = 120;
export const MAX_LENGTH = 100;

export const CHARACTER_PLACEMENT = {
  BEFORE: "BEFORE",
  AFTER: "AFTER",
  MIDDLE: "MIDDLE",
  WRAP: "WRAP",
  ALONE: "ALONE",
};

export const PUNCTUATION_TABLE = [
  { char: ".", probability: 0.392, placement: CHARACTER_PLACEMENT.AFTER },
  { char: ",", probability: 0.369, placement: CHARACTER_PLACEMENT.AFTER },
  { char: ";", probability: 0.019, placement: CHARACTER_PLACEMENT.AFTER },
  { char: ":", probability: 0.02, placement: CHARACTER_PLACEMENT.AFTER },
  { char: "!", probability: 0.021, placement: CHARACTER_PLACEMENT.AFTER },
  { char: "?", probability: 0.036, placement: CHARACTER_PLACEMENT.AFTER },
  { char: '""', probability: 0.161, placement: CHARACTER_PLACEMENT.WRAP },
];

export const SYMBOL_TABLE = [
  { char: "&", probability: 0.166, placement: CHARACTER_PLACEMENT.ALONE },
  { char: "()", probability: 0.166, placement: CHARACTER_PLACEMENT.WRAP },
  { char: "$", probability: 0.166, placement: CHARACTER_PLACEMENT.BEFORE },
  { char: "%", probability: 0.166, placement: CHARACTER_PLACEMENT.AFTER },
  { char: "-", proability: 0.166, placement: CHARACTER_PLACEMENT.MIDDLE },
  { char: "_", probability: 0.166, placement: CHARACTER_PLACEMENT.MIDDLE },
];

export const punctuationTriggers = PUNCTUATION_TABLE.reduce((acc, p) => {
  return acc + "\\" + p.char;
}, "");

export const symbolTriggers = SYMBOL_TABLE.reduce((acc, s) => {
  return acc + "\\" + s.char;
}, "");

export default function cleanSeed(seed) {
  let info = seed.split("/");
  let regex = () =>
    RegExp(`[^a-zA-Z0-9${punctuationTriggers}${symbolTriggers}]+`, "g");
  // check appropriate number of slashes AND first element is special char AND last element is only a number in accepted range
  if (
    info.length === 3 &&
    info[0] === "#" &&
    /^\d+$/.test(info[2]) &&
    info[2] < MAX_TIME &&
    info[2] > 0
  ) {
    return {
      seed: info[1].replace(regex(), "").substring(0, MAX_LENGTH),
      time: parseInt(info[2]),
    };
  } else {
    return {
      seed: seed.replace(regex(), "").substring(0, MAX_LENGTH),
      time: 30,
    };
  }
}
