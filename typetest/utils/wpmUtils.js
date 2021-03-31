export const calculateRawWPM = (correct, time, timeTotal, isRunning) => {
  let t = isRunning ? time : timeTotal;
  if (t == 0 || correct == 0) return 0;
  return Math.floor(correct / 5 / (t / 60000)) || 0;
};

export const calculateTrueWPM = (
  correct,
  incorrect,
  corrected,
  time,
  timeTotal,
  isRunning
) => {
  let t = isRunning ? time : timeTotal;
  if (t == 0) return 0;
  return Math.floor((correct - incorrect + corrected) / 5 / (t / 60000));
};

export const calculateCPS = (correct, time, timeTotal, isRunning) => {
  let t = isRunning ? time : timeTotal;
  if (t == 0) return 0;
  return correct / (t / 1000);
};
