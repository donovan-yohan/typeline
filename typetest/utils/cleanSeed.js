export const MAX_TIME = 120;
export const MAX_LENGTH = 100;

export const PUNCTUATION_TABLE = [
  { char: ".", probability: 0.392 },
  { char: ",", probability: 0.369 },
  { char: ";", probability: 0.019 },
  { char: ":", probability: 0.02 },
  { char: "!", probability: 0.021 },
  { char: "?", probability: 0.036 },
  { char: '"', probability: 0.161 },
];

export const SYMBOL_TABLE = [
  { char: "()", probability: 0.166 },
  { char: "$", probability: 0.166 },
  { char: "%", probability: 0.166 },
  { char: "&", probability: 0.166 },
  { char: "-", proability: 0.166 },
  { char: "_", probability: 0.166 }
];

export const punctuationTriggers = PUNCTUATION_TABLE.reduce((acc, p) => {
  return acc + "\\" + p.char;
}, "");

export const symbolTriggers = SYMBOL_TABLE.reduce((acc, s) => {
  return acc + "\\" + s.char; 
}, "");

export default function cleanSeed(seed) {
  let info = seed.split("/");
  let regex = () => RegExp(`[^a-zA-Z0-9${punctuationTriggers}${symbolTriggers}]+`, 'g');
  // check appropriate number of slashes AND first element is special char AND last element is only a number in accepted range
  if (
    info.length === 3 &&
    info[0] === "#" &&
    /^\d+$/.test(info[2]) &&
    info[2] < MAX_TIME
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
