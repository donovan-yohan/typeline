import shortWords from "../assets/short.js";
import mediumWords from "../assets/medium.js";
import longWords from "../assets/long.js";

function getRandomWithBias(min, max, bias, influence) {
  let num = Math.random() * (max - min) + min;
  let mix = Math.random() * influence;
  return num * (1 - mix) + bias * mix;
}

export default function generateWords(
  short = true,
  medium = true,
  long = true,
  time = 60,
  length
) {
  let words = [];

  while (words.length < (time / 60) * 400) {
    let r = Math.random();

    let word;
    if (r > 0.8 && r <= 0.95 && medium) {
      word =
        mediumWords[
          Math.floor(getRandomWithBias(0, mediumWords.length - 1, 0, 1))
        ];
    } else {
      word =
        shortWords[
          Math.floor(getRandomWithBias(0, shortWords.length - 1, 0, 1))
        ];
    }
    words.push(word);
  }
  return words;
}
