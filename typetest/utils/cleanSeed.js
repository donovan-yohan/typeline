const MAX_TIME = 120;
const MAX_LENGTH = 100;

export default function cleanSeed(seed) {
  let info = seed.split("/");
  // check appropriate number of slashes AND first element is special char AND last element is only a number in accepted range
  if (
    info.length === 3 &&
    info[0] === "#" &&
    /^\d+$/.test(info[2]) &&
    info[2] < MAX_TIME
  ) {
    return {
      seed: info[1].replace(/[^a-zA-Z0-9~-]+/g, "").substring(0, MAX_LENGTH),
      time: parseInt(info[2]),
    };
  } else {
    return {
      seed: seed.replace(/[^a-zA-Z0-9~-]+/g, ""),
      time: 30,
    };
  }
}
