export const calculateRawWPM = (correct, startTime, endTime) => {
  let wpm = Math.floor(correct / 5 / ((endTime - startTime) / 60));

  // console.log(
  //   `calculateRawWPM: correct: ${correct}, startTime: ${startTime}, endTime: ${endTime}, wpm: ${wpm}`
  // );
  // deny negative wpm
  wpm > 0 ? wpm : (wpm = 0);

  return wpm.toLocaleString("en-US", {
    maximumIntegerDigits: 3,
    useGrouping: false,
  });
};

export const calculateTrueWPM = (
  correct,
  incorrect,
  corrected,
  startTime,
  endTime
) => {
  let wpm = Math.floor(
    (correct - incorrect + corrected) / 5 / ((endTime - startTime) / 60)
  );

  // console.log(
  //   `calculateTrueWPM: correct: ${correct}, incorrect: ${incorrect},  corrected: ${corrected}, startTime: ${startTime}, endTime: ${endTime}, wpm: ${wpm}`
  // );
  // deny negative wpm
  wpm > 0 ? wpm : (wpm = 0);
  return wpm.toLocaleString("en-US", {
    maximumIntegerDigits: 3,
    useGrouping: false,
  });
};
