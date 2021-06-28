export const calculateRawWPM = (correct, startTime, endTime) => {
  console.log(correct, startTime, endTime);
  return Math.floor(correct / 5 / ((endTime - startTime) / 60)).toLocaleString(
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
  startTime,
  endTime
) => {
  return Math.floor(
    (correct - incorrect + corrected) / 5 / ((endTime - startTime) / 60)
  ).toLocaleString("en-US", {
    maximumIntegerDigits: 3,
    useGrouping: false,
  });
};
