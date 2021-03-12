export const BACKSPACE_CHAR = "~<";

export const getCorrections = (expected, typedFull) => {
  let i = typedFull.indexOf(BACKSPACE_CHAR);
  let isBackspaceChar = true;
  let backspaces = 0;
  let isValid = true;

  let corrections = 0;
  while (i > 0) {
    let backspaceIndex = i;
    // get number of consecutive backspaces
    while (isBackspaceChar) {
      for (let j = 0; j < BACKSPACE_CHAR.length; j++) {
        if (typedFull[backspaceIndex] != BACKSPACE_CHAR[j]) {
          isBackspaceChar = false;
          break;
        }
        backspaceIndex++;
      }
      if (isBackspaceChar) backspaces++;
    }

    // compare old with new and replace chars
    let originalIndex = i - backspaces;
    let replaceIndex = i + backspaces * BACKSPACE_CHAR.length;

    for (let j = 0; j < backspaces; j++) {
      if (
        typedFull[replaceIndex + j] != typedFull[originalIndex + j] &&
        typedFull[replaceIndex + j] == expected[originalIndex + j]
      ) {
        corrections++;
        typedFull = stringReplaceAt(
          typedFull,
          originalIndex + j,
          typedFull[replaceIndex + j]
        );
      }
    }
    typedFull = spliceString(
      typedFull,
      originalIndex + backspaces,
      backspaces * 3
    );
    i = typedFull.indexOf(BACKSPACE_CHAR);
  }
  return corrections;
};
const spliceString = (str, i, count, add) => {
  return str.slice(0, i) + (add || "") + str.slice(i + count);
};
const stringReplaceAt = (str, i, val = "") => {
  return str.substr(0, i) + val + str.substr(i + val.length);
};
