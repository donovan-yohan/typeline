export const calculateRawWPM = (correct, time, timeTotal) => {
  return Math.floor(correct / 5 / ((timeTotal - time) / 60)).toLocaleString(
    "en-US",
    {
      maximumIntegerDigits: 3,
      useGrouping: false,
    }
  );
};

export const calculateTrueWPM = (
  correct,
  incorrect,
  corrected,
  time,
  timeTotal
) => {
  console.log(correct, incorrect, corrected);
  return Math.floor(
    (correct - incorrect + corrected) / 5 / ((timeTotal - time) / 60)
  ).toLocaleString("en-US", {
    maximumIntegerDigits: 3,
    useGrouping: false,
  });
};
