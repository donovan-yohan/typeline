export const calculateRawWPM = (
  correct: number,
  startTime: number,
  endTime: number
) => {
  let wpm = Math.floor(correct / 5 / ((endTime - startTime) / 60));
  // console.log(
  //   `calculateRawWPM: correct: ${correct}, startTime: ${startTime}, endTime: ${endTime}, wpm: ${wpm}`
  // );

  return Math.max(0, wpm);
};

export const calculateTrueWPM = (
  correct: number,
  incorrect: number,
  corrected: number,
  startTime: number,
  endTime: number
) => {
  let wpm = Math.floor(
    (correct - incorrect + corrected) / 5 / ((endTime - startTime) / 60)
  );
  // console.log(
  //   `calculateTrueWPM: correct: ${correct}, incorrect: ${incorrect},  corrected: ${corrected}, startTime: ${startTime}, endTime: ${endTime}, wpm: ${wpm}`
  // );

  return Math.max(0, wpm);
};
