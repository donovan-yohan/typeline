export default function createTextDatabase(text) {
  let textData = text.map((word) => {
    return word.split("");
  });

  return textData;
}
