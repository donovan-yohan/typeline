import shortWords from "../assets/short.js";

function getRandomWithBias(min, max, bias, influence) {
  let num = Math.random() * (max - min) + min;
  let mix = Math.random() * influence;
  return num * (1 - mix) + bias * mix;
}

export default function generateWords(
  short = true,
  medium = false,
  long = false,
  time = 60,
  length
) {
  let words = [];

  while (words.length < (time / 60) * 130) {
    words.push(
      shortWords[Math.floor(getRandomWithBias(0, shortWords.length - 1, 0, 1))]
    );
  }
  return words;
}
