export default function createTextDatabase(text) {
  // create array of words and letters
  let textData = text.map((word) => {
    return word.split("");
    // let letters = word.split("");
    // return letters.map((l, i) => {
    //  return { value: l, flatIndex: i };
    // });
  });

  // generate flat indexes for 2D array
  // textData.reduce((a, w, i) => {
  //   return (
  //     a +
  //     w.reduce((a2, l, k) => {
  //       l.flatIndex = a + k;
  //       return a2 + 1;
  //     }, 0)
  //   );
  // }, 0);

  return textData;
}
